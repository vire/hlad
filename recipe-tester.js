import dotEnv from 'dotenv';
import Firebase from 'firebase';
import Rx from 'rx';
import debug from 'debug';
import { getHTMLText, HTMLToLunch } from './src/utils';

dotEnv.load();

const dbg = debug('recipe-tester');
const TESTS_KEY = 'tests';
const TEST_RESULTS_KEY = 'test_results';
const TESTER_KEY = 'recipe_tester';
const testsSource = new Rx.Subject();
const firebaseRef = new Firebase(`https://${process.env.FIREBASE_ID}.firebaseio.com`);

const objectWithKeysToArray = hash => {
  const _tmp = [];
  Object.keys(hash).forEach(firebaseKey => _tmp.push(
    Object.assign({}, hash[firebaseKey], { firebaseKey })
  ));
  return _tmp;
};

testsSource
  .flatMap(tests => Rx.Observable.fromArray(objectWithKeysToArray(tests)))
  .flatMap(recipe => Rx.Observable.fromPromise(getHTMLText(recipe.URL)).map(str => HTMLToLunch(str, recipe)))
  .subscribe(result => {
    firebaseRef
      .child(`${TEST_RESULTS_KEY}`)
      .push()
      .set({
        pendingTestID: result.recipe.pendingTestID,
        result: result.lunch,
      }, (resultsErr) => {
        if (resultsErr) {
          dbg(`${TEST_RESULTS_KEY} error: ${resultsErr}`);
        } else {
          dbg(`Removing test ${result.recipe.firebaseKey}`);
          firebaseRef
            .child(`${TESTS_KEY}/${result.recipe.firebaseKey}`)
            .remove();
        }
      });
  });

firebaseRef
  .child(TESTER_KEY)
  .set({
    active: true,
  });

firebaseRef
  .child(`${TESTS_KEY}`)
  .on('value', snapshot => {
    const tests = snapshot.val();
    if (tests) {
      testsSource.onNext(tests);
    }
  });

process.stdin.resume();

process.on('exit', function () {
  dbg('Marking recipe-tester as inactive');
  firebaseRef
    .child(TESTER_KEY)
    .set({
      active: false,
    });
});

process.on('SIGINT', () => {
  dbg('Got SIGINT.  Press Control-D to exit.');
  process.exit(2);
});

process.on('uncaughtException', (uErr) => {
  dbg('Uncaught Exception...');
  dbg(uErr.stack);
  process.exit(99);
});
