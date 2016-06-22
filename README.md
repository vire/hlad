# HLAD - agent and job executor

* Installation: `git clone <this-repository` cd to the folder and run `npm install`
* Configuration: create an `.env` file with


    ```bash
    API_URL=https://<url-to-your-slack>/api/chat.postMessage
    API_TOKEN=guid-blah-foo-bar
    API_CHANEL_ID=some-channel-id
    ```

* How it works
  First you need to have an empty firebase instance. If you don't have please register one it takes 1 minute. (TODO add links for `how to`)
  Put you private firebase ID into .env file under the key `FIREBASE_ID=<your-firebase-id>` !!!NOTICE: Do not commit .env


* Run: `npm start` this will start an agent listening on commands from firebase
  > If you wanna execute a crawl job you need to have some recipes in firebase and valid configuration for publishing them

  * to trigger an job just PUT something via REST API to your firebase to key `crawl_jobs` like

  `curl -X PUT -d '{ "execute" : true }' https://<your-firebase-id>.firebaseio.com/crawl_jobs.json`

---

### Usage with docker

  * requires .env with proper variables (endpoint, token, channelID), recipes (+ custom-extractors.js if needed)

  `docker build -t <some-container-name> .` <-- don't forget the dot!

  `docker run -it -w /src <some-container-name> npm start`
