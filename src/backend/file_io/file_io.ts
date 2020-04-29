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
import IFileIO from "./ifile_io";

/**
 * FileIO provides a wrapper around node fs for promise based IO operations. 
 */
class FileIO implements IFileIO {

    /**
     * WriteFile asynchronously writes to a file using node fs.
     * Returns a promise for results/error handling.
     * @param path The filepath of the file to write to
     * @param data The data to write
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public WriteFile(path: string | number | Buffer | URL, data: any): Promise<void> {
        // Any allowed here as can write any arbitrary object
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, (err: NodeJS.ErrnoException | null) => {
                if (err !== null) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * ReadFile asynchronously reads a file using node fs.
     * Returns a promise for results/error handling.
     * @param path The filepath of the file to read
     */
    public ReadFile(path: string | number | Buffer | URL): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * ReadFileSync synchronously reads a file using node fs.
     * Returns the string of the file's contents.
     * @param path The filepath of the file to read
     */
    public ReadFileSync(path: string | number | Buffer | URL): string {
        return fs.readFileSync(path, {
            encoding: "utf8"
        });
    }

    /**
     * ExistsSync synchronously checks if a file exists using node fs.
     * Returns a boolean for the file existing, true = exists, false = doesn't exist.
     * @param path  The filepath of the file to check if it exists
     */
    public ExistsSync(path: fs.PathLike): boolean {
        return fs.existsSync(path);
    }
}

export default FileIO;