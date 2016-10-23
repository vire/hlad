const http: any = jest.genMockFromModule('http');

let mockServer = {
  listen(port) { /* noop */ },
  // .on get executed synchronously
  on(eventType, cb) {
    const req = {
      url: '/crawlJob?hladToken=test-token'
    };
    const res = {
      status: undefined,
      end(str) { /* noop */}
    };

    cb(req, res);
  },
};

http.createServer = function() {
  return mockServer;
};

module.exports = http;
