require('babel/register');

var crawlerSource = require('./src/rx-crawler');

crawlerSource
  .subscribe(next => {
    console.log('received: ', Date.now());
    // pretty print and post to endpoint
    console.log('next', next);
  }, err => {
    console.log('onError', err);
  });
