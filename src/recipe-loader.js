import fs from 'fs';
import Promise from 'bluebird';
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

export default function(pathToFolder, pathToFile) {
  return new Promise(resolve => {
    if (pathToFolder) {
      readdir(pathToFolder)
        .then((fileNames) => {
          const _tmp = fileNames.map(fileName => {
            return readFile(`${pathToFolder}/${fileName}`, 'utf-8');
          });
          resolve(Promise.all(_tmp));
        });
    } else if (pathToFile) {
      readFile(`${pathToFile}`, 'utf-8')
        .then(result => {
          resolve([result]);
        });
    }
  });
}
