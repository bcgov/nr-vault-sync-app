import * as fs from 'fs';
import * as path from 'path';
import { injectable } from 'inversify';

@injectable()
/**
 * Utility class for reading files
 */
export default class FsUtil {
  public readFileSync(
    filePath: string,
    encoding?:
      | {
          encoding: BufferEncoding;
          flag?: string | undefined;
        }
      | BufferEncoding,
  ): string {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      // If the file is a symbolic link, resolve the actual path
      const realPath = path.join(
        path.dirname(filePath),
        fs.readlinkSync(filePath),
      );
      return this.readActualFileSync(realPath, encoding);
    } else {
      // If it's not a symbolic link, read the file directly
      return this.readActualFileSync(filePath, encoding);
    }
  }

  private readActualFileSync(
    filePath: string,
    encoding?:
      | {
          encoding: BufferEncoding;
          flag?: string | undefined;
        }
      | BufferEncoding,
  ): string {
    return fs.readFileSync(filePath, encoding) as string;
  }
}
