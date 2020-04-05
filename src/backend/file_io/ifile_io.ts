import fs from "fs";
import { URL } from "url";

interface IFileIO {
    WriteFile(path: string | number | Buffer | URL, data: any, options: fs.WriteFileOptions): Promise<void>;
    ReadFile(
        path: string | number | Buffer | URL, 
        options: { encoding?: null | undefined; flag?: string | undefined; } | null | undefined): Promise<Buffer>;
    ReadFileSync(path: string | number | Buffer | URL): string;
    ExistsSync(path: fs.PathLike): boolean;
}

export default IFileIO;