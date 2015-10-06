require('babel/register');

var argv = require('yargs').argv;
var crawler = require('./src/crawler');
var folder = __dirname + '/recipes';

if(!argv.recipe) {
  throw new Error('Missing recipe name, you must call debug "--recipe {recipeName}.json"');
} else {
  crawler({
    recipeFile: folder + '/' + argv.recipe,
    loggingEnabled: true,
  })
    .crawl()
    .publish({
      URL: '',
      token: '1234567890',
      channelID: 'some-nonexisting-channel',
    });

}
