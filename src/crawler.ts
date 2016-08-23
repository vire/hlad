import { Observable } from '@reactivex/rxjs';

import { getHTMLText, HTMLToLunch, objectWithKeysToArray, lunchToString } from './utils';
import * as debug from 'debug';
const dbg = debug('hlad-crawler');

export type crawler = (recipeHash: any, requestDelay: number) => Observable<string>;

export const crawler: crawler = (recipesHash, requestDelay) => {
  dbg(`got recipeHash ${JSON.stringify(recipesHash)}`);

  return Observable.from(objectWithKeysToArray(recipesHash))
    .flatMap((recipe: FirebaseRecipe, idx) => {
      dbg('recipe in crawler', JSON.stringify(recipe));
      const reqSource$ = Observable.fromPromise(getHTMLText(recipe.URL));

      if (requestDelay) {
        return reqSource$
          .delay((idx + 1) * requestDelay)
          .map((HTMLString) => HTMLToLunch(HTMLString, recipe));
      }

      return reqSource$.map(str => HTMLToLunch(str, recipe));
    })
    .map(lunch => lunchToString(lunch))
    .reduce((acc, val) => `${acc}${val}`, '');
};
