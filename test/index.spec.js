/*eslint-env node, mocha */

import crawler from '../src/crawler';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import path from 'path';
import fs from 'fs';

const expect = chai.expect;
const testPath = path.resolve(__dirname + '/test-recipes');
chai.use(chaiAsPromised);

import loadRecipes from '../src/recipe-loader';

describe('RecipeLoader', () => {
  it('.loadRecipes returns the expected recipe files', (done) => {
    const testRecipe = fs.readFileSync(`${testPath}/test-recipe-01.json`, 'utf-8');
    const expectedResult = [testRecipe];

    expect(loadRecipes(testPath))
      .eventually
      .deep.equal(expectedResult)
      .notify(done);
  });
});

describe('Crawler', () => {
  it('should exist', () => {
    expect(crawler).to.not.be.null;
  });
  it('should add crawling response to `results` array', (done) => {
    const expectedResult = [{
      name: 'Test restaurant',
      soups: ['Some soup1', 'Some soup2'],
      dishes: ['Menu 1', 'Menu 2', 'Menu 3'],
    }];

    crawler({
      recipeFolder: testPath,
      log: false,
    })
      .crawl()
      .publish({
        URL: 'http://post.endpoint',
        token: 'SOME_SECRET_TOKEN',
        channelID: 'SOME_CHANNEL_ID',
      })
      .then((result) => {
        expect(result.res.code).to.equal(201);
        expect(result.extractResult).to.deep.equal(expectedResult);
        done();
      });
  });
  xit('should not add empty responses to `resutls` JSON');
});

describe('Utils', () => {
  xit('`prettyPrint should format an array of JSONs into a String`');
});
