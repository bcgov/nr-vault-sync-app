const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  fs.lstat(filePath, (err, stats) => {
    if (err) {
      return console.error(`Error getting stats of the file: ${err.message}`);
    }

    if (stats.isSymbolicLink()) {
      // If the file is a symbolic link, resolve the actual path
      fs.readlink(filePath, (err, realPath) => {
        if (err) {
          return console.error(
            `Error reading the symbolic link: ${err.message}`,
          );
        }

        readActualFile(realPath);
      });
    } else {
      // If it's not a symbolic link, read the file directly
      readActualFile(filePath);
    }
  });
}

function readActualFile(filePath) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return console.error(`Error reading the file: ${err.message}`);
    }

    console.log(`File content:\n${data}`);
  });
}

// Example usage
const filePath = 'path/to/your/file/or/symlink.txt';
readFile(filePath);
