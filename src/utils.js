const formatMsg = (obj) => {
  const start = `\n-------\n${obj.name}\n-------\n`;

  const soups = obj.soups.reduce((p, c) => {
    return `${p}Soup: ${c}\n`;
  }, '');
  const main = obj.dishes.reduce((p, c) => {
    return `${p}Main: ${c}\n`;
  }, '');

  return `${start}${soups}${main}`;
};

export const prettyPrint = (arrayOfLunches) => {
  return arrayOfLunches.reduce((p, c) => {
    return p + formatMsg(c);
  }, '');
};
