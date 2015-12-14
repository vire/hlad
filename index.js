require('babel/register');
var superagent = require('superagent');
var crawlerSource = require('./src/crawler');
var dotenv = require('dotenv').load();

const URL = process.env.API_URL;
const token = process.env.API_TOKEN;
const channelId = process.env.API_CHANEL_ID;

crawlerSource
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
        text: menu
      })
      .end((err, res) => {
        if (!err) {
          console.log('POST ok!')
        } else {
          console.error('POST failed: ', err)
        }
      });
  }, err => {
    console.log('onError', err);
  });
