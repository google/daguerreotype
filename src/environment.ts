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

import {join} from 'node:path';
import {packageDirectory} from 'pkg-dir';
import {Configuration} from './configuration.js';
import {cosmiconfig} from 'cosmiconfig';

export const shouldUpdateSnapshots =
  process.env['UPDATE_SNAPSHOTS'] !== undefined;

export const projectRoot = (await packageDirectory()) ?? process.cwd();

const config: Configuration = await (async () => {
  const explorer = cosmiconfig('snapit');
  const result = await explorer.search();
  return result?.config ?? {};
})();

export const testDirectory = config.testDirectory ?? '';

export const snapshotDirectory = await (async () => {
  if (config && config.outputDirectory !== undefined) {
    return config.outputDirectory;
  }
  return join(projectRoot, 'snapshots');
})();
