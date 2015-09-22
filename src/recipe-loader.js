import fs from 'fs';
import Promise from 'bluebird';
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

export default function(pathToFolder) {
  console.log('pathToFolder',pathToFolder);
  return new Promise(resolve => {
    readdir(pathToFolder)
      .then((fileNames) => {
        const _tmp = fileNames.map(fileName => {
          return readFile(`${pathToFolder}/${fileName}`, 'utf-8');
        });
        resolve(Promise.all(_tmp));
      });
  });
}
