Welcome to HLAD the ultime lunch crawl & publish service.

* Install: `npm install`
* Use: put json descriptors into /recipes

  ```javscript
  {
    "url": "https://host/path/to/menu/page",
    "name": "A Cozy restaurant",
    "structure": {
      "soups": [{
        "locator": "#soups > div:nth-child(1)"
      }, {
        "locator": "#soups > div:nth-child(2)"
      }],
      "main": [{
        "locator": "#menus > div:nth-child(1)"
      }, {
        "locator": "#menus > div:nth-child(2)"
      }, {
        "locator": "#menus > div:nth-child(3)"
      }, {
        "locator": "#menus > div:nth-child(4)"
      }]
    }
  }
  ```
* Run: `npm run crawl -- --URL={slackURL} --token={authToken} --channel={channelID}`
* Debug: `npm run debug -- --recipe {recipeName}.json` Logs result to console to see if selectors work. *recipeName expects to be located in ./recipes folder*
