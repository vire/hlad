/* global process */
import dotEnv from 'dotenv';
import Firebase from 'firebase';
import Rx from 'rx';
import debug from 'debug';
import { getHTMLText, HTMLToLunch, lunchToString, objectToArray } from './src/utils';

dotEnv.load();
const dbg = debug('crawler');
const RECIPES_KEY = 'recipes';
const firebaseRef = new Firebase(`https://${process.env.FIREBASE_ID}.firebaseio.com`);

const recipeSource$ = Rx.Observable.create(observer => {
  firebaseRef
    .child(RECIPES_KEY)
    .once('value', snapshot => {
      observer.onNext(snapshot.val());
      observer.onCompleted();
    }, err => {
      observer.onError(err);
    });
});

recipeSource$
  .flatMap(recipesHash => Rx.Observable.fromArray(objectToArray(recipesHash)))
  .flatMap((recipe, idx) => {
    return Rx.Observable.fromPromise(getHTMLText(recipe.URL))
      .delay((idx + 1) * 200) // no not overhaul server
      .map(str => HTMLToLunch(str, recipe));
  })
  .map(lunch => lunchToString(lunch))
  .reduce((acc, val) => `${acc}${val}`, '')
  .subscribe(
    menu => dbg('\nMENU: ',JSON.stringify(menu)),
    streamError => dbg(streamError),
    () => dbg('completed!')
  );
