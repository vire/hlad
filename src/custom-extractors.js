export default {
  amboseli: {
    extract($) {
      var menuArray = $('#page-menu-food').text().split('\n');
      return {
        soups: [2, 3].map(idx => menuArray[idx]),
        main: [4, 5, 6, 7].map(idx => menuArray[idx].substr(3)),
      };
    },
  },
  presto: {
    extract($) {
      const texts = $('.tweet_list')
        .children('p')
        .children('span')
        .filter((idx, elem) => 0 === $(elem).text().indexOf('-'))
        .map((idx, elem) => $(elem).text().substr(2))
        .toArray();

      return {
        soups: [texts.shift()],
        main: texts,
      };
    },
  },
};
