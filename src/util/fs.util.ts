import * as fs from 'fs';
import { injectable } from 'inversify';

@injectable()
/**
 * Utility class for HCL
 */
export default class FsUtil {
  public readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): void {
    fs.lstat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
      if (err) {
        return console.error(`Error getting stats of the file: ${err.message}`);
      }

      if (stats.isSymbolicLink()) {
        // If the file is a symbolic link, resolve the actual path
        fs.readlink(
          filePath,
          (err: NodeJS.ErrnoException | null, realPath: string) => {
            if (err) {
              return console.error(
                `Error reading the symbolic link: ${err.message}`,
              );
            }

            this.readActualFile(realPath, encoding);
          },
        );
      } else {
        // If it's not a symbolic link, read the file directly
        this.readActualFile(filePath, encoding);
      }
    });
  }

  private readActualFile(filePath: string, encoding: BufferEncoding): void {
    fs.readFile(
      filePath,
      encoding,
      (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          return console.error(`Error reading the file: ${err.message}`);
        }

        console.log(`File content:\n${data}`);
      },
    );
  }
}
