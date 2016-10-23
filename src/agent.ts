import { Observable } from '@reactivex/rxjs';
import * as dbg from 'debug';
import { createServer } from 'http';
import * as url from 'url';
import * as qs from 'qs';

const debug = dbg('hlad-agent');
const CRAWL_JOBS_KEY = 'crawl_jobs';
const TEST_JOBS_KEY = 'test_jobs';
const serverPort = process.env.PORT || 3000;

// actions
export const RECEIVED_CRAWL_JOBS = 'RECEIVED_CRAWL_JOBS';
export const RECEIVED_TEST_JOBS = 'RECEIVED_TEST_JOBS';
export const CRAWL_JOBS_FETCH_ERROR = 'CRAWL_JOBS_FETCH_ERROR';
export const TEST_JOBS_FETCH_ERROR = 'TEST_JOBS_FETCH_ERROR';
export const CRAWL_JOBS_REQUEST = 'CRAWL_JOBS_REQUEST';

export type FirebaseEvent = {
  eventType: 'RECEIVED_CRAWL_JOBS'
    | 'RECEIVED_TEST_JOBS'
    | 'CRAWL_JOBS_FETCH_ERROR'
    | 'TEST_JOBS_FETCH_ERROR'
    | 'CRAWL_JOBS_REQUEST';
  payload?: any;
}

export function createAgent(firebaseRef: Firebase | FirebaseMock): Observable<FirebaseEvent> {
  return Observable.create(observer => {
    debug('Creating Agent observable');

    const server = createServer();

    server.on('request', (req, res) => {
      const reqUrl = url.parse(req.url);
      if (reqUrl.pathname === '/crawlJob' && qs.parse(reqUrl.query).hladToken === process.env.HLAD_TOKEN) {
        observer.next({
          eventType: CRAWL_JOBS_REQUEST,
        });

        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'ok'}));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ status: 'error'}));
      }
    });
    server.listen(serverPort, () => debug(`listening on server port: ${serverPort}`));

    // notify observer when a CRAWL_JOB event arrives to Firebase
    firebaseRef
      .child(CRAWL_JOBS_KEY)
      .on('value', crawJobsSnapshot => {
          const payload = crawJobsSnapshot.val();
          debug(`Endpoint ${CRAWL_JOBS_KEY} emitted value: ${JSON.stringify(payload)}`);
          observer.next({
            eventType: RECEIVED_CRAWL_JOBS,
            payload,
          });
        },
        crawlJobsErr => observer.error({eventType: CRAWL_JOBS_FETCH_ERROR, error: crawlJobsErr}));

    // notify observer when a TEST_JOB event occurs
    firebaseRef
      .child(TEST_JOBS_KEY)
      .on('value',
        testJobsSnapshot => {
          const payload = testJobsSnapshot.val();
          debug(`Endpoint ${TEST_JOBS_KEY} emitted value: ${JSON.stringify(payload)}`);
          observer.next({
            eventType: RECEIVED_TEST_JOBS,
            payload
          });
        },
        testJobsErr => observer.error({eventType: TEST_JOBS_FETCH_ERROR, error: testJobsErr}));
  });
}
