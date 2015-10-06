module.exports = [
  {
    pattern: 'http://post.endpoint',
    fixtures: function() {
    },
    post: function () {
      return {
        code: 201,
      };
    },
  },
  {
    /**
     * regular expression of URL
     */
    pattern: 'http://localhost:3000/(\\w+-\\w+)',

    /**
     * returns the data
     *
     * @param match array Result of the resolution of the regular expression
     * @param params object sent by 'send' function
     * @param headers object set by 'set' function
     */
    fixtures: function (match) {
      if (match[1] === 'my-restaurant') {
        return `
          <html>
            <body>
              <div id="soups">
                <div>Some soup1</div>
                <div>Some soup2</div>
                <div></div>
              </div>
              <div id="menus">
                <div>Menu 1</div>
                <div></div>
                <div>Menu 3</div>
              </div>
            </body>
          </html>
        `;
      }

      if (match[1] === 'agent-test') {
        return 42;
      }
    },

    /**
     * returns the result of the GET request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    get: function (match, data) {
      return {
        text: data,
      };
    },

    post: function () {
      return 42;
    },
  },
];
