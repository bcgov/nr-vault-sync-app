import * as fs from 'fs';

function readFile(filePath: string): void {
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

          readActualFile(realPath);
        },
      );
    } else {
      // If it's not a symbolic link, read the file directly
      readActualFile(filePath);
    }
  });
}

function readActualFile(filePath: string): void {
  fs.readFile(
    filePath,
    'utf-8',
    (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        return console.error(`Error reading the file: ${err.message}`);
      }

      console.log(`File content:\n${data}`);
    },
  );
}
