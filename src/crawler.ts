import { Observable } from '@reactivex/rxjs';
import * as dbg from 'debug';

import { getHTMLText, HTMLToLunch, objectWithKeysToArray, lunchToString } from './utils';

const debug = dbg('hlad-crawler');

export type crawler = (recipeHash: any, requestDelay: number) =>
  Observable<{lunchString: string, recipe: any}>;

export const crawler: crawler = (recipesHash, requestDelay) => {
  debug(`Recipes for crawl: ${JSON.stringify(recipesHash, null, 2)}`);

  return Observable.from(objectWithKeysToArray(recipesHash))
    .flatMap((recipe: FirebaseRecipe, idx) => {
      const reqSource$ = Observable.fromPromise(getHTMLText(recipe.URL));

      if (requestDelay) {
        return reqSource$
          .delay((idx + 1) * requestDelay)
          .map((HTMLString) => HTMLToLunch(HTMLString, recipe));
      }

      return reqSource$.map(str => HTMLToLunch(str, recipe));
    })
    .map(lunch => lunchToString(lunch))
    .reduce((acc, val) => `${acc}${val}`, '')
    .map(completeString => ({
      lunchString: completeString,
      recipe: recipesHash
    }));
};
