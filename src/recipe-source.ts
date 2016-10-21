import { readdir, readFile } from 'fs';
import { Observable } from '@reactivex/rxjs';

export const recipes$ = Observable.create(observer => {
  const pathToRecipes = './test-recipes';
  readdir(pathToRecipes, (err, dirList) => {
    dirList.forEach(file => readFile(`${pathToRecipes}/${file}`, 'utf8', (err, fileContent) => {
      if (err) {
        observer.error(`Failed to load recipe ${file}`);
      } else {
        observer.next(fileContent);
      }
    }))
  });
});
