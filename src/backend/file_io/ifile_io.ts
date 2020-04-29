/*
Copyright 2020 JamJar Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import fs from "fs";
import { URL } from "url";

/**
 * IFileIO represents a promise based IO wrapper.
 */
interface IFileIO {

    /**
     * WriteFile asynchronously writes to a file.
     * Returns a promise for results/error handling.
     * @param path The filepath of the file to write to
     * @param data The data to write
     */
    // Any allowed here as can write any arbitrary object
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    WriteFile(path: string | number | Buffer | URL, data: any): Promise<void>;

    /**
     * ReadFile asynchronously reads a file.
     * Returns a promise for results/error handling.
     * @param path The filepath of the file to read
     */
    ReadFile(path: string | number | Buffer | URL): Promise<Buffer>;

    /**
     * ReadFileSync synchronously reads a file.
     * Returns the string of the file's contents.
     * @param path The filepath of the file to read
     */
    ReadFileSync(path: string | number | Buffer | URL): string;

    /**
     * ExistsSync synchronously checks if a file exists.
     * Returns a boolean for the file existing, true = exists, false = doesn't exist.
     * @param path  The filepath of the file to check if it exists
     */
    ExistsSync(path: fs.PathLike): boolean;
}

export default IFileIO;