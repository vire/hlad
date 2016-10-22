import * as dbg from 'debug';
import { config } from 'dotenv';
import * as Firebase from 'firebase';
import { Observable } from '@reactivex/rxjs';

import { createAgent, RECEIVED_CRAWL_JOBS, RECEIVED_TEST_JOBS } from './src/agent';
import { crawler } from './src/crawler';
import { publish } from './src/publisher';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const debug = dbg('hlad-main');
const firebaseRef = new Firebase(`https://${process.env.FIREBASE_ID}.firebaseio.com`);
const CRAWL_JOBS_KEY = 'crawl_jobs';
const TEST_JOBS_KEY = 'test_jobs';
const TEST_RESULTS_KEY = 'test_results';
const RECIPES_KEY = 'recipes';
const ENDPOINT_SETTINGS = {
  URL: process.env.API_URL,
  token: process.env.API_TOKEN,
  channel: process.env.API_CHANEL_ID,
};

// don't log tokens and channels
debug(`Publish endpoint: ${JSON.stringify(process.env.API_UR)}`);

const agent$ = createAgent(firebaseRef).share();

// pick recipe from firebase for further processing in `crawlJobsSource$`
const recipes$ = Observable.create(observer => {
  firebaseRef
    .child(RECIPES_KEY)
    .on('value', recipesSnapshot => {
      const recipes = recipesSnapshot.val();
      debug(`Received recipes: ${recipes}`);
      observer.next(recipes);
    }, recipesError => {
      debug(`Error when fetching recipes: ${recipesError}`);
      observer.error({ type: 'RECIPES_FETCH_ERROR', error: recipesError})
    });
});

// call URL from recipe, and parse HTMLText response with recipe definition and remove crawlJob
// publish to endpoint based on `ENDPOINT_SETTINGS`
const crawlJobsSource$ = agent$
  .filter(({ payload, type }) => payload && type === RECEIVED_CRAWL_JOBS)
  .do(val => debug(`crawlJobsSource$ value: ${JSON.stringify(val)}`))
  .switchMap(
    // fire on crawlJob
    crawlJob => recipes$.flatMap(recipesHash => crawler(recipesHash, 200))
  )
  .do((payload: any) => {
    publish(ENDPOINT_SETTINGS, payload.lunchString);
    debug(`Removing finished crawlJob ${CRAWL_JOBS_KEY}`);
    firebaseRef
      .child(CRAWL_JOBS_KEY)
      .remove();
  });


// Logic for testing recipes

// call URL from recipe, parse response, post results to TEST_RESULTS_KEY
const testJobsSource$ = agent$
  .filter(({ payload, type }) => payload && type === RECEIVED_TEST_JOBS)
  .flatMap(({ payload }) => crawler(payload, 0))
  .do((result: any) => {
    const [ firebaseKey ] = Object.keys(result.recipe);

    if (!firebaseKey) {
      debug('Missing testJob firebaseKey!');
      return;
    }

    debug(`Processing testJob: ${firebaseKey}`);
    firebaseRef
      .child(`${TEST_RESULTS_KEY}`)
      .push()
      .set({
        pendingTestResultKey: firebaseKey, // pendingTestResultKey is used by hlad-ui for paring requests
        result: result.lunchString,
      }, (resultsErr) => {
        if (resultsErr) {
          debug(`${TEST_RESULTS_KEY} error: ${resultsErr}`);
        } else {
          debug(`Removing testJob: ${firebaseKey}`);
          firebaseRef
            .child(`${TEST_JOBS_KEY}/${firebaseKey}`)
            .remove();
        }
      });
  });

Observable.merge(crawlJobsSource$, testJobsSource$)
  .filter((val: any) => val.payload)
  .do(val => debug(`Value after processing: ${JSON.stringify(val)}`))
  .subscribe();
