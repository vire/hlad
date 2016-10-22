import { fetch } from './providers';
import * as cheerio from 'cheerio';
import * as dbg from 'debug';

const debug = dbg('hlad-utils');


type FirebaseHash = {
  /*
   Hash with key as firebase node name `recipes`, and value the recipe itself
   */
  [key: string]: any;
}

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

const containsBurger = str => str.toLowerCase().indexOf('burger') !== -1;

export const lunchToString = ({recipe, lunch}: LunchRecipe): string => {
  const start = `\n*${recipe.name}*\n\n`;

  let soups;
  let main;

  if (lunch.soups) {
    soups = lunch.soups
      .filter(s => s !== '')
      .map(item => `> :stew: ${item}`)
      .reduce((p, c) => `${p}${c}\n`, '');
  }

  if (lunch.main) {
    main = lunch.main
      .filter(m => m !== '')
      .map(item => {
        const icon = (containsBurger(recipe.name) || containsBurger(item))
          ? ':hamburger:'
          : ':poultry_leg:';

        return `> ${icon} ${item}`;
      })
      .reduce((p, c) => `${p}${c}\n`, '');

  }

  debug(`soups: ${soups}`);
  debug(`main: ${main}`);

  if (soups && main) {
    return `${start}${soups}${main}\n`;
  }

  return soups || main ? `${start}${soups || main}\n` : '';
};

export const HTMLToLunch = (HTMLString, recipe): ExtractedLunch => {
  const $ = cheerio.load(HTMLString);
  const lunch = {};

  if (!recipe.structure) {
    debug('Recipe has no "structure"');
    return { lunch, recipe };
  }

  Object.keys(recipe.structure).forEach((mealType: string) => {
    lunch[mealType] = recipe.structure[mealType]
      .map(item => $(item.locator).text().trim())
      .filter(Boolean);
  });

  debug(`Extracted lunch: ${JSON.stringify(lunch)} from HTML`);
  return { lunch, recipe };
};

export const getHTMLText = (URL) => fetch(URL).then(resp => resp.text());

export const objectWithKeysToArray = (hash: FirebaseHash): Array<FirebaseRecipe | FirebaseTest> =>
  Object.keys(hash).map(firebaseKey => Object.assign({}, hash[firebaseKey], { firebaseKey }));
