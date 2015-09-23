import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import request from 'superagent';
import jsdom from 'jsdom';
import { prettyPrint } from './utils';
import loadRecipes from './recipe-loader';
var superagentConfig = require('./superagent-config');

//Before tests
require('superagent-mock')(request, superagentConfig);
const jQuery = fs.readFileSync(path.resolve(__dirname + './../node_modules/jquery/dist/jquery.js'), 'utf-8');

const _getDOM = (response, jQuery) => {
  return new Promise((resolve, reject) => {
    jsdom.env({
      html: response.text,
      src: jQuery,
      done(err, window) {
        if(err) {
          reject(err);
        } else {
          resolve({
            response: response,
            window,
          });
        }
      },
    });
  });
};

const crawl = () => {
  publicAPI.log('I am crawling');

  publicAPI._crawlPromise = new Promise((resolve) => {
    loadRecipes(publicAPI._recipeFolder)
      .then(recipes => {
        const requests = recipes
          .map((r, idx) => {
            return (function() {
              return new Promise((innerResolve) => {
                // to not overhaul the target server
                setTimeout(() => {
                  publicAPI.log('Executing API call!', new Date().toISOString());
                  publicAPI.log('Calling URL: ', JSON.parse(r).url);
                  request.get(JSON.parse(r).url)
                    .then(result => innerResolve({
                      recipe: r,
                      text: result.text,
                    }), (error) => {
                      console.log('error', error);
                    });
                }, (idx + 1) * 1000);
              });
            } ());
          });

        Promise.all(requests)
          .then(responses => {
            const _tmp = responses.map(response => {
              return _getDOM(response, jQuery);
            });
            resolve(Promise.all(_tmp));
          });
      });
  });

  return publicAPI;
};

const _extract = () => {
  return new Promise((resolve) => {
    publicAPI._crawlPromise.then((results) => {
      const _tmp = results.map((res) => {
        const recipe = JSON.parse(res.response.recipe);

        return {
          name: recipe.name,
          soups: recipe.structure.soups.map(soup => {
            return res.window.$(soup.locator).text().trim();
          }),
          dishes: recipe.structure.main.map(mainDish => {
            return res.window.$(mainDish.locator).text().trim();
          }),
        };
      });

      if (publicAPI._logToConsole) {
        console.log('Crawl Result: ', prettyPrint(_tmp));
      }

      resolve(_tmp);
    });
  });
};

const publish = ({token, channelID, URL}) => {

  if(!token || !channelID) {
    throw new Error('You must pass token and channelID');
  }

  return new Promise((resolve, reject) => {
    _extract()
      .then(extractResult => {
        publicAPI.log('POST URL: ', URL);
        request
          .post(URL)
          .query({
            token: token,
            channel: channelID,
            as_user: false,
            text: prettyPrint(extractResult),
          })
          .then((res) => {
            publicAPI.log('JOB DONE!');
            resolve({
              res,
              extractResult,
            });
          }, (err) => {
            console.error('An error occured during posting:', err);
          });
      });
  });
};

const publicAPI = {
  _recipeFolder: null,
  log(message) {
    if(this._logToConsole) {
      console.log(message);
    }
  },
  crawl,
  publish,
};

export default ({recipeFolder, log}) => {
  publicAPI._recipeFolder = recipeFolder;
  publicAPI._logToConsole = log;
  return publicAPI;
};
