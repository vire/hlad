import dotEnv from 'dotenv';
import Firebase from 'firebase';
import Rx from 'rx';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import debug from 'debug';

const dbg = debug('recipe-tester');

dotEnv.load();
const TESTS_KEY = 'tests';
const TEST_RESULTS_KEY = 'test_results';
const testsSource = new Rx.Subject();
const firebaseRef = new Firebase(`https://${process.env.FIREBASE_ID}.firebaseio.com`);

const getString = (recipe) => {
  dbg('making request', recipe.URL);
  return Rx.Observable.fromPromise(
    fetch(recipe.URL)
      .then(res => res.text())
      .then(text => ({
        recipe: recipe,
        response: text,
      }), err => {
        dbg('An error during HTTP fetch', err);
      })
  );
};

const executeTest = recipe => {
  dbg(`executing test: ${recipe.firebaseKey}`);
  return getString(recipe)
    .map(rr => {
      const $ = cheerio.load(rr.response);
      const lunch = {};
      Object.keys(recipe.structure).forEach(type => {
        lunch[type] = recipe.structure[type]
          .map(item => $(item.locator).text().trim())
          .filter(t => t !== '');
      });

      return {
        lunch,
        recipe,
      };
    });
};

testsSource
  .flatMap(tests => Rx.Observable.fromArray(tests))
  .flatMap(testRecipe => executeTest(testRecipe))
  .subscribe(result => {
    firebaseRef
      .child(`${TEST_RESULTS_KEY}`)
      .push()
      .set({
        pendingTestID: result.recipe.pendingTestID,
        result: result.lunch,
      }, (err) => {
        if (err) {
          dbg('Firebase error: ', err);
        } else {
          // remove the current test
          dbg(`Removing the test ${result.recipe.firebaseKey}`);
          firebaseRef
            .child(`${TESTS_KEY}/${result.recipe.firebaseKey}`)
            .set(null, (removeTestError) => {
              dbg(`removeTestError: ${removeTestError}`);
            });
        }
      });
  });

firebaseRef
  .child('recipe_tester')
  .set({
    active: true,
  });

firebaseRef
  .child(`${TESTS_KEY}`)
  .on('value', snapshot => {
    const tests = snapshot.val();
    if (tests) {
      dbg(`received tests ${Object.keys(tests)}`);

      const testForExecution = [];
      Object.keys(tests).forEach(firebaseKey => testForExecution.push(
        Object.assign({}, tests[firebaseKey], { firebaseKey })
      ));

      testsSource.onNext(testForExecution);
    }
  });


process.stdin.resume();

process.on('exit', function () {
  dbg('Marking recipe-tester as inactive');
  firebaseRef
    .child('recipe_tester')
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
