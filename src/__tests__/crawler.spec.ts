jest.mock('isomorphic-fetch');
import { TestScheduler } from '@reactivex/rxjs/dist/cjs/testing/TestScheduler';

import { crawler } from '../crawler';
import { HTMLText, structure } from './fixtures';

describe('crawler', () => {
  it('should return an CrawlerRecipe', () => {
    require('isomorphic-fetch').returnText = HTMLText; // instrument the mock

    const scheduler = new TestScheduler(null);
    const source = scheduler.createHotObservable('--a-----|', { a: {
      someID1: {
        name: 'Joes Pub',
        URL: 'http://localhost:8999',
        structure
      },
      someID2: {
        name: 'El Ninos',
        URL: 'http://localhost:8999',
        structure
      }
    }});
    const expected: Array<any> = [
      {
        'lunch': {
          'main': ['Very tasty main dish'],
          'soups': ['Some good creamy soup']
        },
        'recipe': {
          'name': 'Joes Pub',
          'URL': 'http://localhost:8999',
          structure,
          'firebaseKey': 'someID1'
        }
      }, {
        'lunch': {
          'main': ['Very tasty main dish'],
          'soups': ['Some good creamy soup']
        },
        'recipe': {
          'name': 'El Ninos',
          'URL': 'http://localhost:8999',
          structure,
          'firebaseKey': 'someID2'
        }
      }
    ];

    source.switchMap(crawler).subscribe((item) => {
      expect(item).toEqual(expected.shift());
    });

    scheduler.flush();
  });
});
