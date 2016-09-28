import { Observable } from '@reactivex/rxjs';
import * as Firebase from 'firebase';
import { config } from 'dotenv';
import * as debug from 'debug';

import { createAgent, FirebaseEvent } from './src/agent';
import { crawler } from './src/crawler';
import { publish } from './src/publisher';

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

// don't log tokens and channels
dbg(`Publish endpoint: ${JSON.stringify(process.env.API_UR)}`);

const agentSource$ = createAgent(firebaseRef).share();

// pick recipe from firebase for further processing in `crawlJobsSource$`
const recipeSource$ = Observable.create(observer => {
  firebaseRef
    .child(RECIPES)
    .on('value', recipesSnapshot => {
      const payload = recipesSnapshot.val();
      observer.next(payload);
    }, recipesError => observer.error(recipesError));
});

// call URL from recipe, and parse HTMLText response with recipe definition and remove crawlJob
// publish to endpoint based on `ENDPOINT_SETTINGS`
const crawlJobsSource$ = agentSource$
  .filter(val => val.payload && val.type === FirebaseEvent.RECEIVED_CRAWL_JOBS)
  .do(val => dbg(`crawlJobsSource$ value: ${JSON.stringify(val)}`))
  .switchMap(
    crawlJob => recipeSource$.flatMap(recipesHash => crawler(recipesHash, 200)) // once new job arrives
  )
  .do((payload: any) => {
    publish(ENDPOINT_SETTINGS, payload.lunchString);
    dbg(`Removing finished crawlJ ${CRAWL_JOBS}`);
    firebaseRef
      .child(CRAWL_JOBS)
      .remove();
  });


// call URL from recipe, parse response, post results to TEST_RESULTS
const testJobsSource$ = agentSource$
  .filter(val => val.payload && val.type === FirebaseEvent.RECEIVED_TEST_JOBS)
  .flatMap(({ payload }) => crawler(payload, 0))
  .do((result: any) => {
    const firebaseKey = Object.keys(result.recipe)[0];

    if (!firebaseKey) {
      console.error('Missing or Invalid firebase key!');
      return;
    }

    dbg(`firebaseKey ${firebaseKey}`);
    firebaseRef
      .child(`${TEST_RESULTS}`)
      .push()
      .set({
        pendingTestResultKey: firebaseKey,
        result: result.lunchString,
      }, (resultsErr) => {
        if (resultsErr) {
          dbg(`${TEST_RESULTS} error: ${resultsErr}`);
        } else {
          dbg(`Removing test ${firebaseKey}`);
          firebaseRef
            .child(`${TEST_JOBS}/${firebaseKey}`)
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
