import fetch from 'node-fetch';
import cheerio from 'cheerio';

const containsBurger = str => str.toLowerCase().indexOf('burger') !== -1;

export const lunchToString = ({recipe, lunch}) => {
  const start = `\n*${recipe.name}*\n\n`;

  const soups = lunch.soups
    .filter(s => s !== '')
    .map(item => `> :stew: ${item}`)
    .reduce((p, c) => `${p}${c}\n`, '');

  const main = lunch.main
    .filter(m => m !== '')
    .map(item => {
      const icon = (containsBurger(recipe.name) || containsBurger(item)) ? ':hamburger:' : ':poultry_leg:';

      return `> ${icon} ${item}`;
    })
    .reduce((p, c) => `${p}${c}\n`, '');

  if (soups && main) {
    return `${start}${soups}${main}\n`;
  }

  return soups || main ? `${start}${soups || main}\n` : '';
};

export const HTMLToLunch = (HTMLString, recipe) => {
  const $ = cheerio.load(HTMLString);
  const lunch = {};

  Object.keys(recipe.structure).forEach(type => {
    lunch[type] = recipe.structure[type]
      .map(item => $(item.locator).text().trim())
      .filter(t => t !== '');
  });

  return {
    lunch,
    recipe,
  };
};

export const getHTMLText = URL => fetch(URL).then(resp => resp.text());

export const objectToArray = hash => {
  const _tmp = [];
  Object.keys(hash).forEach(key => _tmp.push(hash[key]));
  return _tmp;
};
