import request from 'superagent';
import Promise from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

const expect = chai.expect;
chai.use(chaiAsPromised);

const asyncFnThree = () => {
  return Promise.resolve(1)
    .then(res => res + 1)
    .then((res) => {
      return request
        .post('http://localhost:3000/agent-test')
        .then((postRes) => {
          return res + postRes;
        });
    });
};

describe('Superagent', () => {
  xit('should return proper promise', (done) => {
    asyncFnThree()
      .then(res => {
        expect(res).to.deep.equal(42);
        done();
      });
  });
});
