import { fetch } from './providers';
import * as cheerio from 'cheerio';
import * as debug from 'debug';

const dbg = debug('hlad-utils');

const containsBurger = str => str.toLowerCase().indexOf('burger') !== -1;

type Lunch = {
  main?: string[];
  soups?: string[];
}

type LunchRecipe = {
  recipe: {
    name: string;
    selectors: Lunch
  };
  lunch: Lunch;
}

export const lunchToString = ({recipe, lunch}: LunchRecipe):string => {
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

  dbg(`soups: ${soups}`);
  dbg(`main: ${main}`);

  if (soups && main) {
    return `${start}${soups}${main}\n`;
  }

  return soups || main ? `${start}${soups || main}\n` : '';
};

export const HTMLToLunch = (HTMLString, recipe): CrawledRecipe => {
  const $ = cheerio.load(HTMLString);
  const lunch = {};

  if (!recipe.structure) {
    debug('Recipe has no "structure"');
    return { lunch, recipe }
  }

  Object.keys(recipe.structure).forEach(type => {
    lunch[type] = recipe.structure[type]
      .map(item => $(item.locator).text().trim())
      .filter(t => t !== '');
  });

  dbg('Got lunch', JSON.stringify(lunch));
  return { lunch, recipe };
};

export const getHTMLText = (URL) => fetch(URL).then(resp => resp.text());

interface FirebaseHash {
  [key:string]: any; // Hash with key as firebase node name `recipes`, and value the recipe itself
}


export interface FirebaseTest {
  firebaseKey: string;
}

export const objectWithKeysToArray = (hash: FirebaseHash): Array<FirebaseRecipe | FirebaseTest> =>
  Object.keys(hash).map(firebaseKey => Object.assign({}, hash[firebaseKey], { firebaseKey }));
