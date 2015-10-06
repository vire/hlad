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

    loadRecipes(publicAPI._recipeFolder, publicAPI._recipeFile)
      .then(recipes => {
        console.log('recipes', recipes);
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
                      publicAPI.log('error', error);
                    });
                }, (idx + 1) * publicAPI._reqTimeout);
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
        const soups = recipe.structure.soups
          .map(soup => {
            return res.window.$(soup.locator).text().trim();
          })
          .filter(item => item !== '');

        const dishes = recipe.structure.main
          .map(mainDish => {
            return res.window.$(mainDish.locator).text().trim();
          })
          .filter(item => item !== '');

        return {
          name: recipe.name,
          soups,
          dishes,
        };
      });

      publicAPI.log('Crawl Result: ', prettyPrint(_tmp));
      resolve(_tmp);
    });
  });
};

const publish = ({token, channelID, URL}) => {

  if(!token || !channelID) {
    throw new Error('You must pass token and channelID');
  }

  return _extract()
    .then(extractResult => {
      publicAPI.log('POST URL: ', URL);
      return new Promise((resolve) => {
        request
          .post(URL)
          .query({
            token: token,
            channel: channelID,
            as_user: false,
            text: prettyPrint(extractResult),
          })
          .end((err, res) => {
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

const log = (...messages) => {
  if(publicAPI._loggingEnabled) {
    console.log.apply(console, messages);
  }
};

const publicAPI = {
  _recipeFolder: null,
  log,
  crawl,
  publish,
};

export default ({recipeFolder, recipeFile, loggingEnabled, reqTimeout = 1000}) => {
  publicAPI._recipeFile = recipeFile;
  publicAPI._recipeFolder = recipeFolder;
  publicAPI._loggingEnabled = loggingEnabled;
  publicAPI._reqTimeout = reqTimeout;
  return publicAPI;
};
