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
  xit('should load recipe from `/recipes` folder');
  xit('should add crawling response to `results` JSON');
  xit('should not add empty responses to `resutls` JSON');
});

describe('Utils', () => {
  xit('`prettyPrint should format an array of JSONs into a String`');
});
