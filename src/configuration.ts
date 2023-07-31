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

export interface Configuration {
  /**
   * Determines where all snapshots will be placed.
   *
   * This is always relative to the package root (or current working directory
   * if the package root cannot be found).
   *
   * @defaultValue `snapshots`
   */
  outputDirectory?: string;

  /**
   * Determines the directory all tests will belong in.
   *
   * Used to strip test file names for snapshot file names.
   *
   * If this is relative, this is relative to the nearest package root (or
   * current working directory).
   */
  testDirectory?: string;
}
