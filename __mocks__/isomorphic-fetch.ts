jest.genMockFromModule('isomorphic-fetch');

const mockedFetch: any = (URL) => {
  return new Promise((res, rej) => {
    res({
      text() {
        return mockedFetch.returnText;
      }
    });
  });
};

mockedFetch.returnText = 'To be overridden in test';

module.exports = mockedFetch;
