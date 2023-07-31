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

import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  join,
  normalize,
  relative,
  isAbsolute,
} from 'node:path';

import {projectRoot, snapshotDirectory, testDirectory} from './environment.js';

export function stringifySnapshots(snapshots: Record<string, unknown>): string {
  return `export default ${JSON.stringify(snapshots, null, 2)}`;
}

function getSnapshotFilepathWithExtension(filename: string, extension: string) {
  const ext = extname(filename);
  const base = basename(filename, ext);
  const directory = (() => {
    let testRootDirectory = testDirectory;
    if (!isAbsolute(testRootDirectory)) {
      testRootDirectory = join(projectRoot, testRootDirectory);
    }
    return relative(testRootDirectory, dirname(filename));
  })();
  return normalize(
    join(snapshotDirectory, directory, `${base}${extension}${ext}`)
  );
}

export function getSnapshotFilepath(filename: string) {
  return getSnapshotFilepathWithExtension(filename, '.snap');
}

export function getSnapshotNewFilepath(filename: string) {
  return getSnapshotFilepathWithExtension(filename, '.new.snap');
}

export async function ensureSnapshotDirectoryExists(path: string) {
  const directory = dirname(path);
  if (!existsSync(directory)) {
    await mkdir(directory, {recursive: true});
  }
}
