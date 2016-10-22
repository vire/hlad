import { TestScheduler } from '@reactivex/rxjs/dist/cjs/testing/TestScheduler';
import * as Rx from '@reactivex/rxjs';
import * as sinon from 'sinon';

import { createAgent, RECEIVED_CRAWL_JOBS, RECEIVED_TEST_JOBS, FirebaseEvent} from '../agent';
const valueStub = sinon.stub();

valueStub
  .onCall(0).returns('hash of crawl jobs')
  .onCall(1).returns('hash of test jobs');

const firebaseMock: FirebaseMock = {
  child(keyName) {
    return this;
  },
  set(val, cb) {
    cb(undefined);
  },
  on(type, dataCb, errCb) {
    dataCb({
      val: valueStub
    });
  }
};


let setSpy;

describe('createAgent', () => {

  beforeEach(() => {
    setSpy = sinon.spy(firebaseMock, 'set');
  });

  it('pushes values to `crawlJob` and `testJobs`', () => {
    const expected: FirebaseEvent[] = [
      {
        type: 'RECEIVED_CRAWL_JOBS',
        payload: 'hash of crawl jobs'
      },
      {
        type: 'RECEIVED_TEST_JOBS',
        payload: 'hash of test jobs'
      },
    ];
    const scheduler = new TestScheduler(null);
    const source = scheduler.createHotObservable('--a--|');

    createAgent(firebaseMock);
    expect(source).toBeInstanceOf(Rx.Subject);

    const subscription = source.switchMap((x) => createAgent(firebaseMock)).subscribe((item) => {
      expect(item).toEqual(expected.shift());
    });

    scheduler.flush();
    subscription.unsubscribe(); // triggers 2nd set
    expect(expected.length).toEqual(0);
  });
});
