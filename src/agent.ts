import { Observable } from '@reactivex/rxjs';
import * as dbg from 'debug';

const debug = dbg('hlad-agent');
const CRAWL_JOBS_KEY = 'crawl_jobs';
const TEST_JOBS_KEY = 'test_jobs';

// actions
export const RECEIVED_CRAWL_JOBS = 'RECEIVED_CRAWL_JOBS';
export const RECEIVED_TEST_JOBS = 'RECEIVED_TEST_JOBS';
export const CRAWL_JOBS_FETCH_ERROR = 'CRAWL_JOBS_FETCH_ERROR';
export const TEST_JOBS_FETCH_ERROR = 'TEST_JOBS_FETCH_ERROR';

export type FirebaseEvent = {
  type: 'RECEIVED_CRAWL_JOBS' | 'RECEIVED_TEST_JOBS' | 'CRAWL_JOBS_FETCH_ERROR' | 'TEST_JOBS_FETCH_ERROR';
  payload: any;
}

export function createAgent(firebaseRef: Firebase | FirebaseMock): Observable<FirebaseEvent> {
  return Observable.create(observer => {
    debug('Creating Agent observable');

    // notify observer when a CRAWL_JOB event arrives to Firebase
    firebaseRef
      .child(CRAWL_JOBS_KEY)
      .on('value', crawJobsSnapshot => {
          const payload = crawJobsSnapshot.val();
          debug(`Endpoint ${CRAWL_JOBS_KEY} emitted value: ${JSON.stringify(payload)}`);
          observer.next({
            type: RECEIVED_CRAWL_JOBS,
            payload,
          });
        },
        crawlJobsErr => observer.error({type: CRAWL_JOBS_FETCH_ERROR, error: crawlJobsErr}));

    // notify observer when a TEST_JOB event occurs
    firebaseRef
      .child(TEST_JOBS_KEY)
      .on('value',
        testJobsSnapshot => {
          const payload = testJobsSnapshot.val();
          debug(`Endpoint ${TEST_JOBS_KEY} emitted value: ${JSON.stringify(payload)}`);
          observer.next({
            type: RECEIVED_TEST_JOBS,
            payload
          });
        },
        testJobsErr => observer.error({type: TEST_JOBS_FETCH_ERROR, error: testJobsErr}));
  });
}
