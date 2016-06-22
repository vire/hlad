import * as originalFetch from 'isomorphic-fetch';

export const customProviders: any = {
  fetch(URL) { /* to be overridden in test */ },
};

export const fetch = (URL) => {
  if (process.env.NODE_ENV === 'test') {
    return customProviders.fetch(URL);

  }
  return originalFetch(URL);
};
