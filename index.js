require('babel/register');

var argv = require('yargs').argv;
var crawler = require('./src/crawler');
var folder = __dirname + '/recipes';

crawler({
  recipeFolder: folder,
  log: true,
})
  .crawl()
  .publish({
    URL: argv.URL,
    token: argv.token,
    channelID: argv.channel,
  });
