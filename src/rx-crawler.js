var Rx = require('rx');
var fs = require('fs');
var Promise = require('bluebird');
var superagent = require('superagent');
var cheerio = require('cheerio');

var source = Rx.Observable.fromNodeCallback(fs.readdir)('./recipes')
  .flatMap(fileNames => Rx.Observable.fromArray(fileNames))
  .flatMap(fileName => Rx.Observable.fromNodeCallback(fs.readFile)(`./recipes/${fileName}`, 'utf-8'))
  .flatMap(val => {
    return new Promise((resolve, reject) => {
      var recipe = JSON.parse(val);
      superagent
        .get(recipe.url)
        .end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              recipe: recipe,
              response: res
            });
          }
        });
    });
  })
  .map(payload => {
    const $ = cheerio.load(payload.response.text);
    const lunch = {};
    Object.keys(payload.recipe.structure).forEach(type => {
      lunch[type] = payload.recipe.structure[type].map(item => $(item.locator).text().trim());
    }); // ['soups', 'main']

    return Object.assign(payload, {
      lunch
    });
  })
  .subscribe(next => {
    console.log('next', next.lunch);
  }, err => {
    console.log('onError', err);
  });

