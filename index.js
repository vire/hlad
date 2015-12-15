require('babel/register');
require('dotenv').load();
var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');
var crawlerExports = require('./src/crawler');
var customExtractors = require('./src/custom-extractors');

const URL = process.env.API_URL;
const token = process.env.API_TOKEN;
const channelId = process.env.API_CHANEL_ID;
console.log('crawlerExports', crawlerExports)
crawlerExports
  .createCrawlSource({
    delayTimer: 500,
    ch: cheerio,
    fs: fs,
    request: superagent,
    extractors: customExtractors,
  })
  .reduce((acc, val) => `${acc}${val}`, '')
  .subscribe(menu => {
    superagent
      .post(URL)
      .query({
        username: 'HLAD-BOT',
        icon_emoji: ':hamburger:',
        token: token,
        channel: channelId,
        as_user: false,
        text: menu,
      })
      .end((err) => {
        if (!err) {
          console.log('POST ok!');
        } else {
          console.error('POST failed: ', err);
        }
      });
  }, err => {
    console.log('onError', err);
  });
