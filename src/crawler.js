import Rx from 'rx';
import Promise from 'bluebird';

export function createCrawlSource(dependencies) {
  const { delayTimer, request, ch, fs, extractors} = dependencies;

  return Rx.Observable.fromNodeCallback(fs.readdir)('./recipes')
    .flatMap(fileNames => Rx.Observable.fromArray(fileNames))
    .flatMap(fileName => Rx.Observable.fromNodeCallback(fs.readFile)(`./recipes/${fileName}`, 'utf-8'))
    .flatMap((val, idx) => {
      return Rx.Observable.fromPromise(
        new Promise((resolve, reject) => {
          const recipe = JSON.parse(val);

          request
            .get(recipe.url)
            .end((err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  recipe: recipe,
                  response: res,
                });
              }
            });
        })
      ).delay((idx + 1) * delayTimer);
    })
    .map(payload => {
      const $ = ch.load(payload.response.text);
      const lunch = {};

      if (payload.recipe.type === 'custom' && extractors[payload.recipe.id]) {
        return {
          lunch: extractors[payload.recipe.id].extract($),
          recipe: payload.recipe,
        };
      }

      // ['soups', 'main']
      Object.keys(payload.recipe.structure).forEach(type => {
        lunch[type] = payload.recipe.structure[type]
          .map(item => $(item.locator).text().trim())
          .filter(t => t !== '');
      });

      return {
        lunch,
        recipe: payload.recipe,
      };
    })
    .map(input => {
      const containsBurger = str => str.toLowerCase().indexOf('burger') !== -1;

      const obj = input.lunch;

      const start = `\n*${input.recipe.name}*\n\n`;

      const soups = obj.soups
        .filter(s => s !== '')
        .map(item => {
          return `> :stew: ${item}`;
        })
        .reduce((p, c) => {
          return `${p}${c}\n`;
        }, '');

      const main = obj.main
        .filter(m => m !== '')
        .map(item => {
          const icon = (containsBurger(input.recipe.name) || containsBurger(item)) ? ':hamburger:' : ':poultry_leg:';

          return `> ${icon} ${item}`;
        })
        .reduce((p, c) => {
          return `${p}${c}\n`;
        }, '');

      if (soups && main) {
        return `${start}${soups}${main}\n`;
      }

      return soups || main ? `${start}${soups || main}\n` : '';
    });
}
