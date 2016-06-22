import { Observable } from '@reactivex/rxjs';
import * as fetch from 'isomorphic-fetch';
import * as querystring from 'querystring';
import * as debug from 'debug';
const dbg = debug('hlad-publisher');

type settings = {
  URL: string,
  token?: string,
  channel?: string,
}

export type publish = (settings: settings, lunchString: string) => Observable<any>

export const publish = ({URL, token, channel}, lunchString) => {
  const queryParams = querystring.stringify({
    username: 'HLAD-BOT',
    icon_emoji: ':hamburger:',
    token: token,
    channel: channel,
    as_user: false,
    text: lunchString,
  });
  dbg('posting lunch to endpoint');

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
