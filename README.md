# HLAD

an application for managing & executing crawl jobs and piping results to Slack channels.

[![Build Status](https://travis-ci.org/vire/hlad.svg?branch=master)](https://travis-ci.org/vire/hlad) [![codecov](https://codecov.io/gh/vire/hlad/branch/master/graph/badge.svg)](https://codecov.io/gh/vire/hlad)

This repo is proposed to be cloned/forked & modified to fit your needs
* [PREREQUISITES]
  - Slack account (you'll need a [token](https://api.slack.com/docs/oauth-test-tokens) + [channelId](https://api.slack.com/methods/channels.list)),
  - Firebase account (you need it for the `FIREBASE_ID=<your-firebase-id>`)
* Get the code `git clone github.com/vire/hlad`
* **Install** dependencies `npm install`
* **Configure** by creating `.env` file in project root and ensure it's in `.gitignore`

  ```
  API_URL=https://<url-to-your-slack>/api/chat.postMessage
  API_TOKEN=guid-blah-foo-bar
  API_CHANEL_ID=some-channel-id
  ```
* **Run** `npm start` this will start the agent listening for changes of data in Firebase. Optionally you can use `DEBUG=hlad-*` to have console output for debugging.
  > To be able to execute a `CRAWL_JOB` you need to have at least one recipe in firebase + valid config for publishing the result to an endpoint.

* **Backup** your existing recipes `curl -X GET -o ./tmp/$(date +%s).json https://<your-firebase-id>.firebaseio.com/recipes.json`

## Architecture

**Recipe**: is the minimal abstraction & data-structure required to define a remote resource (HTML page containing lunch menu) that can be crawled, transformed and published
  * There are **2 ways** how to define recipes
    * hlad-ui webapp (with editor + live test/debugger)
    * define by hand and POST REST API to firebase
  * YAML example of recipe `structure` defined via hlad-ui webapp (without name and URL props)
    * 2 root sections: `main` and `soups`
    * each can have 0-n `locator` properties containing an [CSS selector string](http://stackoverflow.com/a/22323597/527958)
    * **[NOTICE]** locators must use quotes in YAML

  ```YAML
    main:
      - locator: '#lunch1 > div:nth-child(3)'
      - locator: '#lunch1 > div:nth-child(4)'
      - locator: '#lunch1 > div:nth-child(5)'
    soup:
      - locator: '#lunch1 > div:nth-child(1)'
      - locator: '#lunch1 > div:nth-child(2)'
  ```

  * JSON example of a complete recipe
  ```JSON
  {
    "URL": "http://example.com",
    "name": "Foo Bar",
    "structure": {
        "main": [
          {
            "locator": "#lunch1 > div:nth-child(3)"
          },
          {
            "locator": "#lunch1 > div:nth-child(4)"
          },
          {
            "locator": "#lunch1 > div:nth-child(5)"
          }
        ],
        "soup": [
          {
            "locator": "#lunch1 > div:nth-child(1)"
          },
          {
            "locator": "#lunch1 > div:nth-child(2)"
          }
        ]
    },
  }
  ```

  * could POST the above example to Firebase like
  `curl -X POST -d @example-recipe.json  https://<your-firebase-id>.firebaseio.com/recipes.json`

**Firebase**: remote data-store which stores `recipes`, `jobs` in queues, `results`

> Tried to use a most simple and lightweight solution for storing data. Firebase handles such use-case very good + offers real-time out-of-the-box.

**Agent**: run locally, observes firebase for changes, reacts to such changes.

**Executors**: stream pipelines, that handle e2e when event arrives, execute pre-defined steps, publish result to desired endpoint (firebase, slack). 2 basic types of executors:
  - `TEST_JOB` real-time test for newly created `recipes`
  - `CRAWL_JOB` crawls all recipes in configuration (defined in firebase) and tries to publish result to slack.

**Triggers**: events that trigger jobs
  - planned/automated triggers like [cron](https://en.wikipedia.org/wiki/Cron), [heroku scheduler](https://elements.heroku.com/addons/scheduler)
  - manual via [hlad-ui webapp](https://github.com/vire/hlad-ui) or by calling direct [firebase REST API](https://www.firebase.com/docs/rest/api/)

    ```
    curl -X PUT -d '{ "execute" : true }' \
    https://<your-firebase-id>.firebaseio.com/crawl_jobs.json
    ```

---

### Deploy with Heroku

* TODO

### Deploy to your server using Docker


  * [REQUIREMENTS] `docker` (tested v1.12), `.env` file containing proper variables (endpoint, token, channelID)

1. build the image `docker build -t hlad .` <-- don't forget the dot!

2. run a container from image `docker run --rm -it --env DEBUG="hlad-*" --env-file ./.env hlad npm start`
