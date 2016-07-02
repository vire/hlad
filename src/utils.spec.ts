import * as chai from 'chai';
import { customProviders } from './providers';
import { getHTMLText, HTMLToLunch, objectWithKeysToArray, lunchToString } from './utils';
const expect = chai.expect;

import { HTMLText } from '../test/fixtures';

describe('Utils', () => {
  it('`objectWithKeysToArray` should return array of objects', () => {
    expect(objectWithKeysToArray({})).to.deep.equal([]);
    expect(objectWithKeysToArray({
      a: 1
    })).to.deep.equal([{firebaseKey: 'a'}]);
    expect(objectWithKeysToArray({
      a: {
        b: 2
      }
    })).to.deep.equal([{firebaseKey: 'a', b: 2}]);
  });

  it('`getHTMLText` should return HTMLText', (done) => {

    const text = 'sample text should be HTML';
    customProviders.fetch = (URL) => {
      return new Promise((res, rej) => {
        res({
          text() {
            return text
          }
        })
      });
    };

    getHTMLText('http://haahha')
      .then(result => {
        expect(result).to.equal(text);
        done();
      });
  });

  describe('`HTMLToLunch`', () => {
    it('should return results for input structure', () => {

      const recipe = {
        structure: {
          main: [{ locator: '.main-lunch1' }],
          soups: [{ locator: '.soup1' }],
        }
      };
      const result = HTMLToLunch(HTMLText, recipe);

      expect(result).to.deep.equal({
        lunch: {
          main: ['Very tasty main dish'],
          soups: ['Some good creamy soup'],
        },
        recipe,
      });
    });

    it('should add only matched selectors to result', () => {
      const HTMLText = `<div><div class="main-lunch1">Lorem Ipsum</div></div>`;
      const recipe = {
        structure: {
          main: [{ locator: '.main-lunch1' }],
          soups: [{ locator: '.soup1' }]
        }
      };

      const result = HTMLToLunch(HTMLText, recipe);

      expect(result).to.deep.equal({
        lunch: {
          main: ['Lorem Ipsum'],
          soups: [],
        },
        recipe,
      });
    });

    it('should trim whitespace', () => {
      const HTMLText = `<div><div class="main-lunch1">   Lorem Ipsum   </div></div>`;
      const recipe = {
        structure: {
          main: [{ locator: '.main-lunch1' }]
        }
      };

      const result = HTMLToLunch(HTMLText, recipe);

      expect(result).to.deep.equal({
        lunch: {
          main: ['Lorem Ipsum'],
        },
        recipe,
      });
    });

    it('should ignore empty strings', () => {
      const HTMLText = `<div><div class="main-lunch1">  </div></div>`;
      const recipe = {
        structure: {
          main: [{ locator: '.main-lunch1' }]
        }
      };

      const result = HTMLToLunch(HTMLText, recipe);

      expect(result).to.deep.equal({
        lunch: {
          main: [],
        },
        recipe,
      });
    });
  });

  describe.only('lunchToString', () => {
    it('main + soup', () => {
      const recipeWithLunch = {
        recipe: {
          name: 'MyTest',
          selectors: {}
        },
        lunch: {
          main: [
            'Spaghetti bolognese',
            'big kahuna burger'
          ],
          soups: [
            'Gazpacho'
          ],
        }
      };
      const str = '\n*MyTest*\n\n> :stew: Gazpacho' +
        '\n> :poultry_leg: Spaghetti bolognese' +
        '\n> :hamburger: big kahuna burger\n\n';
      expect(lunchToString(recipeWithLunch)).to.equal(str)
    });

    it('soup only', () => {
      const recipeWithLunch = {
        recipe: {
          name: 'MyTest',
          selectors: {}
        },
        lunch: {
          soups: [
            'Gazpacho'
          ],
        }
      };
      const str = '\n*MyTest*\n\n> :stew: Gazpacho\n\n';
      expect(lunchToString(recipeWithLunch)).to.equal(str)
    });

    it('main only', () => {
      const recipeWithLunch = {
        recipe: {
          name: 'MyTest',
          selectors: {}
        },
        lunch: {
          main: [
            'Spaghetti bolognese',
            'big kahuna burger'
          ],
        }
      };
      const str = '\n*MyTest*\n\n> :poultry_leg: Spaghetti bolognese' +
        '\n> :hamburger: big kahuna burger\n\n';
      expect(lunchToString(recipeWithLunch)).to.equal(str)
    });
  });
});