import fs from "fs";
import { URL } from "url";
import IFileIO from "./ifile_io";

class FileIO implements IFileIO {
    public WriteFile(path: string | number | Buffer | URL, data: any, options: fs.WriteFileOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, options, (err: NodeJS.ErrnoException | null) => {
                if (err !== null) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public ReadFile(
        path: string | number | Buffer | URL,
        options: { encoding?: null | undefined; flag?: string | undefined; } | null | undefined): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, options, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    public ReadFileSync(path: string | number | Buffer | URL): string {
        return fs.readFileSync(path, {
            encoding: "utf8"
        });
    }

    public ExistsSync(path: fs.PathLike): boolean {
        return fs.existsSync(path);
    }
}

export default FileIO;