import { Observable } from '@reactivex/rxjs';
import * as Firebase from 'firebase';
import { config } from 'dotenv';
import * as debug from 'debug';

import { createAgent, FirebaseEvent } from './src/agent';
import { crawler } from './src/crawler';
import { publish } from './src/publisher';
import { lunchToString } from './src/utils';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const dbg = debug(`hlad-main`);
const firebaseRef = new Firebase(`https://${process.env.FIREBASE_ID}.firebaseio.com`);
const RECEIVED_CRAWL_JOBS = 'RECEIVED_CRAWL_JOBS';
const RECEIVED_TEST_JOBS = 'RECEIVED_TEST_JOBS';
const CRAWL_JOBS = 'crawl_jobs';
const TEST_JOBS = 'test_jobs';
const TEST_RESULTS = 'test_results';
const RECIPES = 'recipes';
const ENDPOINT_SETTINGS = {
  URL: process.env.API_URL,
  token: process.env.API_TOKEN,
  channel: process.env.API_CHANEL_ID,
};

dbg(`Publish settings: ${JSON.stringify(ENDPOINT_SETTINGS)}`);

const agentSource$ = createAgent(firebaseRef).share();

// pick recipe from firebase for further processing in `crawlJobsSource$`
const recipeSource$ = Observable.create(observer => {
  firebaseRef
    .child(RECIPES)
    .on('value', recipesSnapshot => {
      const payload = recipesSnapshot.val();
      observer.next(payload)
    }, recipesError => observer.error(recipesError));
});

// call URL from recipe, and parse HTMLText response with recipe definition and remove crawlJob
// publish to endpoint based on `ENDPOINT_SETTINGS`
const crawlJobsSource$ = agentSource$
  .filter(val => val.payload && val.type === FirebaseEvent.RECEIVED_CRAWL_JOBS)
  .do(val => dbg(`crawlJobsSource$ value: ${JSON.stringify(val)}`))
  .switchMap(crawlJob => {
    return recipeSource$
      .flatMap(recipesHash => crawler(recipesHash, 200)) // once new job arrives
      .map(lunch => lunchToString(lunch))
      .scan((acc, val) => `${acc}${val}`, '')
      .do(lunchString => {
        dbg(`lunchString: ${lunchString}`);
        return publish(ENDPOINT_SETTINGS, lunchString)
      })
  })
  .do(() => {
    dbg(`Removing finished crawlJ ${CRAWL_JOBS}`);
    firebaseRef
      .child(CRAWL_JOBS)
      .remove();
  });


// call URL from recipe, parse response, post results to TEST_RESULTS
const testJobsSource$ = agentSource$
  .filter(val => val.payload && val.type === FirebaseEvent.RECEIVED_TEST_JOBS)
  .flatMap(({ payload }) => crawler(payload, 0))
  .do(result => {
    dbg(`Test result: ${JSON.stringify(result)}`);
    firebaseRef
      .child(`${TEST_RESULTS}`)
      .push()
      .set({
        pendingTestID: result.recipe.pendingTestID,
        result: result.lunch,
      }, (resultsErr) => {
        if (resultsErr) {
          dbg(`${TEST_RESULTS} error: ${resultsErr}`);
        } else {
          dbg(`Removing test ${result.recipe.firebaseKey}`);
          firebaseRef
            .child(`${TEST_JOBS}/${result.recipe.firebaseKey}`)
            .remove();
        }
      });
  });

const subscription = Observable.merge(
  crawlJobsSource$,
  testJobsSource$
).filter((val: any) => val.payload).subscribe(
  val => console.log(`received val: ${JSON.stringify(val)}`)
);

// teardown logic
process.stdin.resume();

process.on('exit', function () {
  dbg('Unsubscribe agent from firebase');
  subscription.unsubscribe();
});

process.on('SIGINT', () => {
  dbg('Got SIGINT.  Press Control-D to exit.');
  process.exit(2);
});

process.on('SIGTERM', () => {
  dbg('Got SIGTERM');
  process.exit(2);
});

process.on('uncaughtException', (uErr) => {
  dbg('Uncaught Exception...');
  dbg(uErr.stack);
  process.exit(99);
});
