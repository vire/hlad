# Welcome to HLAD - the ultimate lunch "crawl & publish" tool.

* Install: `npm install`
* Use: put json descriptors into /recipes

  ```javscript
  {
    "url": "https://host/path/to/menu/page",
    "name": "A Cozy restaurant",
    "type": "standard",
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

* Configuration: create an `.env` file with
    ```bash
  API_URL=https://<url-to-your-slack>/api/chat.postMessage
  API_TOKEN=guid-blah-foo-bar
  API_CHANEL_ID=some-channel-id
    ```
* Run: `npm run crawl`
* Customer extractors: If you need a custom extractor, you need to create a recipe of `type: "custom"` and with an `id: "customRecipeABC"`, then add to the
    `src/custom-extractors` an extract function under the same *ID* key like following:

```javascript
customRecipeABC: {
  extract($) {
    const elements = $('.css_class_selector').children('p');
    return {
      soups: [4, 5]
        .map(idx => elements.eq(idx).text().substr(2).trim())
        .filter(t => t !== ''),
      main: [7, 8, 9]
        .map(idx => elements.eq(idx).text().substr(2).trim())
        .filter(t => t !== '')
    }
  }
}

```

  * The extract function must return an object with exact two properties:

```javascript
return {
  soups: [],
  main: [],
}
```

---

### Usage with docker

  * requires .env with proper variables (endpoint, token, channelID), recipes (+ custom-extractors.js if needed)

  `docker build -t <some-container-name> .` <-- don't forget the dot!

  `docker run -it -w /src <some-container-name> npm run crawl`
