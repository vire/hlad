/*eslint-env node, mocha */
import crawler from '../src/crawler';
import chai from 'chai';
const expect = chai.expect;

describe('test', function () {
  it('should work', function () {
    expect(1).to.equal(1);
  });
});

describe('Crawler', () => {
  it('should exist', () => {
    console.log('Crawler', crawler);
    // expect(crawler).to.not.be.null;
  });
  xit('should load recipe from `/recipes` folder');
  xit('should add crawling response to `results` JSON');
  xit('should not add empty responses to `resutls` JSON');
});

describe('Utils', () => {
  xit('`prettyPrint should format an array of JSONs into a String`');
});
