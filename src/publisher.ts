import { Observable } from '@reactivex/rxjs';
import * as fetch from 'isomorphic-fetch';
import { stringify } from 'qs';
import * as dbg from 'debug';

const debug = dbg('hlad-publisher');

type settings = {
  URL: string,
  token?: string,
  channel?: string,
}

export type publish = (settings: settings, lunchString: string) => Observable<any>

export const publish = ({URL, token, channel}, lunchString) => {
  // slack specific
  const queryParams = stringify({
    username: 'HLAD-BOT', // TODO can be configurable
    icon_emoji: ':hamburger:',
    token: token,
    channel: channel,
    as_user: false,
    text: lunchString,
  });

  debug(`Publishing lunchString ${JSON.stringify(lunchString)} to endpoint: ${URL}`);

  return Observable.fromPromise(
    fetch(`${URL}?${queryParams}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lunchString)
    })
  );
};
