/**
 * Copyright 2023 Google LLC. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert, {deepStrictEqual} from 'node:assert';
import {existsSync} from 'node:fs';
import {rm, writeFile} from 'node:fs/promises';
import {shouldUpdateSnapshots} from './environment.js';
import {
  ensureSnapshotDirectoryExists,
  getSnapshotFilepath,
  getSnapshotNewFilepath,
  stringifySnapshots,
} from './utilities.js';
import {findSourceMap} from 'node:module';

// eslint-disable-next-line node/no-unpublished-import
import type * as Mocha from 'mocha';

class Camera {
  static #test?: {
    title: string;
    index: number;
  };
  static #sourceFile?: string;
  static #testFile?: string;
  static #snapshots?: Record<string, unknown>;
  static #error = false;

  static beforeEachHook() {
    return async function (this: Mocha.Context) {
      if (!this.currentTest) {
        return;
      }
      const currentTestTitle = this.currentTest.fullTitle();
      if (currentTestTitle !== Camera.#test?.title) {
        Camera.#test = {title: currentTestTitle, index: 0};
      }

      if (
        !this.currentTest.file ||
        this.currentTest.file === Camera.#testFile
      ) {
        return;
      }
      Camera.#testFile = this.currentTest.file;
      Camera.#sourceFile =
        findSourceMap(Camera.#testFile)?.payload.file ?? Camera.#testFile;

      if (shouldUpdateSnapshots) {
        await Camera.writeSnapshotsToFile();
        Camera.#snapshots = {};
      } else {
        Camera.#snapshots = (
          await import(getSnapshotFilepath(Camera.#sourceFile)).catch(() => {
            return {default: {}};
          })
        ).default;
      }
    };
  }
  static afterHook() {
    return () => this.writeSnapshotsToFile();
  }
  static {
    globalThis.beforeEach(Camera.beforeEachHook());
    globalThis.after(Camera.afterHook());
  }

  static async writeSnapshotsToFile() {
    if (!this.#snapshots || !this.#sourceFile) {
      return;
    }
    if (Object.entries(this.#snapshots).length === 0) {
      return;
    }
    const newFilename = getSnapshotNewFilepath(this.#sourceFile);
    if (shouldUpdateSnapshots) {
      const filename = getSnapshotFilepath(this.#sourceFile);
      if (existsSync(newFilename)) {
        await rm(newFilename);
      }
      await ensureSnapshotDirectoryExists(filename);
      await writeFile(filename, stringifySnapshots(this.#snapshots));
    } else {
      if (!this.#error) {
        return;
      }
      this.#error = false;

      await ensureSnapshotDirectoryExists(newFilename);
      await writeFile(newFilename, stringifySnapshots(this.#snapshots));
    }
  }

  static getSnapshotName(id?: string): string {
    assert(Camera.#test);
    let name = Camera.#test.title;
    if (id) {
      name = `${name} - ${id}`;
    } else {
      if (Camera.#test.index > 0) {
        name = `${name} - ${Camera.#test.index}`;
      }
      ++Camera.#test.index;
    }
    return name;
  }

  static snap: (id: string | undefined, value: unknown) => void;
  static {
    if (shouldUpdateSnapshots) {
      this.snap = (id, value) => {
        assert(Camera.#snapshots);
        const snapshotName = Camera.getSnapshotName(id);
        Camera.#snapshots[snapshotName] = value;
      };
    } else {
      this.snap = (id, value) => {
        assert(Camera.#snapshots);
        const snapshotName = Camera.getSnapshotName(id);
        try {
          deepStrictEqual(value, Camera.#snapshots[snapshotName]);
        } catch (error) {
          Camera.#snapshots[snapshotName] = value;
          this.#error = true;
          throw error;
        }
      };
    }
  }
}

export {Camera};
