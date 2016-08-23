import { TestScheduler } from '@reactivex/rxjs/dist/cjs/testing/TestScheduler';
import * as chai from 'chai';

import { customProviders } from './providers';
import { crawler } from './crawler';
import { HTMLText, structure } from '../test/fixtures';

const expect = chai.expect;

describe('crawler', () => {
  it('should return an CrawlerRecipe', () => {
    customProviders.fetch = (URL) => {
      return new Promise((res, rej) => {
        res({
          text() {
            return HTMLText;
          }
        });
      });
    };

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
      expect(item).to.deep.equal(expected.shift());
    });

    scheduler.flush();
  });
});
