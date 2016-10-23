jest.mock('isomorphic-fetch');
import { getHTMLText, HTMLToLunch, objectWithKeysToArray, lunchToString } from '../utils';
import { HTMLText } from './fixtures';

describe('Utils', () => {
  it('`objectWithKeysToArray` should return array of objects', () => {
    expect(objectWithKeysToArray({})).toEqual([]);
    expect(objectWithKeysToArray({
      a: 1
    })).toEqual([{firebaseKey: 'a'}]);
    expect(objectWithKeysToArray({
      a: {
        b: 2
      }
    })).toEqual([{firebaseKey: 'a', b: 2}]);
  });

  it('`getHTMLText` should return HTMLText', () => {
    require('isomorphic-fetch').returnText = 'mocked-text'; // instrument the mock

    return getHTMLText('http://foo.bar')
      .then(result => expect(result).toEqual('mocked-text'));
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

      expect(result).toEqual({
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

      expect(result).toEqual({
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

      expect(result).toEqual({
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

      expect(result).toEqual({
        lunch: {
          main: [],
        },
        recipe,
      });
    });
  });

  describe('lunchToString', () => {
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
      expect(lunchToString(recipeWithLunch)).toEqual(str);
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
      expect(lunchToString(recipeWithLunch)).toEqual(str);
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
      expect(lunchToString(recipeWithLunch)).toEqual(str);
    });
  });
});
