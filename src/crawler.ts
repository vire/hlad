import { Observable } from '@reactivex/rxjs';
import { getHTMLText, HTMLToLunch, objectWithKeysToArray } from './utils';
import * as debug from 'debug';
const dbg = debug('hlad-crawler');

export type crawler = (recipeHash: any, requestDelay: number) => Observable<CrawledRecipe>;

export const crawler: crawler = (recipesHash, requestDelay) => {

  return Observable.from(objectWithKeysToArray(recipesHash))
    .flatMap((recipe: FirebaseRecipe, idx) => {
      dbg('recipe in crawler', JSON.stringify(recipe));

      const reqSource$ = Observable.fromPromise(getHTMLText(recipe.URL))

      if (requestDelay) {
        return reqSource$
          .delay((idx + 1) * requestDelay)
          .map((HTMLString) => HTMLToLunch(HTMLString, recipe))
      }

      return reqSource$.map(str => HTMLToLunch(str, recipe));
    })
};
