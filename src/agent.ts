import { Observable } from '@reactivex/rxjs';
import * as debug from 'debug';

export enum FirebaseEvent {
  RECEIVED_CRAWL_JOBS,
  RECEIVED_TEST_JOBS
}

const AGENT_KEY = 'agent';
const dbg = debug(`hlad-${AGENT_KEY}`);
const CRAWL_JOBS = 'crawl_jobs';
const TEST_JOBS = 'test_jobs';

export function createAgent(firebaseRef: Firebase | FirebaseMock): Observable<any> {
  return Observable.create(observer => {
    dbg('starting agent');

    firebaseRef
      .child(AGENT_KEY)
      .set({ active: true }, updateError => {
        if (!updateError) {
          firebaseRef
            .child(CRAWL_JOBS)
            .on('value', crawJobsSnapshot => {
              const payload = crawJobsSnapshot.val();
              observer.next({
                type: FirebaseEvent.RECEIVED_CRAWL_JOBS,
                payload,
              });
            }, crawlJobsErr => observer.error(crawlJobsErr));

          firebaseRef
            .child(TEST_JOBS)
            .on('value', testJobsSnapshot => {
              const payload = testJobsSnapshot.val();
              dbg(`Firebase - test_job ${JSON.stringify(payload)}`);
              observer.next({
                type: FirebaseEvent.RECEIVED_TEST_JOBS,
                payload
              });
            }, testJobsErr => observer.error(testJobsErr));
        } else {
          dbg('could not start agent: ', updateError);
        }
      });

    return () => {
      dbg('stopping agent');
      firebaseRef
        .child(AGENT_KEY)
        .set({ active: false }, () => {});
    };
  });
}
