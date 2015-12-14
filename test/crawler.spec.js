var Rx = require('rx');
import chai from 'chai';
import cheerio from 'cheerio';

import { createCrawlSource } from '../src/crawler';
const expect = chai.expect;


const firstFakePayload = `
<html>
  <body>
    <div class="lunch-container">
      <div class="soups">
        <div>Soup1</div>
        <div>Soup2</div>
        <div>Soup3</div>
      </div>
      <div class="main">
        <div>Main1</div>
        <div>Main2</div>
        <div>Main3</div>
      </div>
    </div>
  </body>
</html>
`

const contentOfFileA = {
  name: 'Restaurant A',
  structure: {
    soups: [
      {locator: '.soups div:nth-child(1)'},
      {locator: '.soups div:nth-child(2)'},
      {locator: '.soups div:nth-child(3)'}
    ],
    main: [
      {locator: '.main div:nth-child(1)'},
      {locator: '.main div:nth-child(2)'},
      {locator: '.main div:nth-child(3)'}
    ]
  },
  url: 'http://localhost:3000/a'
};

const contentOfFileB = {
  name: 'Restaurant B',
  structure: {
    soups: [
      {locator: '.soups div:nth-child(1)'},
      {locator: '.soups div:nth-child(2)'},
      {locator: '.soups div:nth-child(3)'}
    ],
    main: [
      {locator: '.main div:nth-child(1)'},
      {locator: '.main div:nth-child(2)'},
      {locator: '.main div:nth-child(3)'}
    ]
  },
  url: 'http://localhost:3000/b'
};

const contentOfFileC = {
  name: 'Restaurant C',
  type: 'custom',
  id: 'customRestaurantC',
  structure: {
    soups: [
      {locator: '.soups div:nth-child(1)'},
      {locator: '.soups div:nth-child(2)'},
      {locator: '.soups div:nth-child(3)'}
    ],
    main: [
      {locator: '.main div:nth-child(1)'},
      {locator: '.main div:nth-child(2)'},
      {locator: '.main div:nth-child(3)'}
    ]
  },
  url: 'http://localhost:3000/c'
};


describe('Crawler', () => {
  const deps = {
    delayTimer: 200,
    extractors: {
      customRestaurantC: {
        extract($) {
          return {
            main: [0, 1, 2]
              .map(idx => $('.main').children('div').eq(idx).text().trim()),
            soups: [0, 1, 2]
              .map(idx => $('.soups').children('div').eq(idx).text().trim())
          }
        }
      }
    },
    request: {
      get(url) {
        let result;

        result = {
          text: firstFakePayload
        };

        return {
          end(fn) {
            fn(null, result);
          }
        }
      }
    },
    ch: cheerio,
    fs: {
      readdir(name, cb) {
        cb(null, ['a.js', 'b.js', 'c.js']);
      },
      readFile(name, encoding, cb) {
        if (name === './recipes/a.js') {
          cb(null, JSON.stringify(contentOfFileA));
        }
        if (name === './recipes/b.js') {
          cb(null, JSON.stringify(contentOfFileB));
        }
        if (name === './recipes/c.js') {
          cb(null, JSON.stringify(contentOfFileC));
        }
      }
    }
  };

  it('should return Rx.Observable source', () => {
    const source = createCrawlSource(deps);
    expect(typeof source.subscribe).to.equal('function')
  });

  it('should return expected value', done => {
    const source = createCrawlSource(deps);
    const expectedFirst = '\n*Restaurant A*\n\n```' +
      'Soup: Soup1\nSoup: Soup2\nSoup: Soup3\n' +
      'Main: Main1\nMain: Main2\nMain: Main3\n```\n';

    const expectedSecond = '\n*Restaurant B*\n\n```' +
      'Soup: Soup1\nSoup: Soup2\nSoup: Soup3\n' +
      'Main: Main1\nMain: Main2\nMain: Main3\n```\n';

    const expectedThird = '\n*Restaurant C*\n\n```' +
      'Soup: Soup1\nSoup: Soup2\nSoup: Soup3\n' +
      'Main: Main1\nMain: Main2\nMain: Main3\n```\n';


    source.toArray()
      .subscribe(val => {
        expect(val).to.deep.equal([
          expectedFirst,
          expectedSecond,
          expectedThird
        ]);
        done();
      });
  })
});
