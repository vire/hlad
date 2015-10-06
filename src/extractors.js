export const customExtractor = (res) => {
  const recipe = JSON.parse(res.response.recipe);
  const soups = recipe.structure.soups
    .map(soup => {
      return res.window.$(soup.locator).text().trim().split(soup.delimiter)[soup.position];
    })
    .filter(item => item !== '');

  const dishes = recipe.structure.main
    .map(mainDish => {
      return res.window.$(mainDish.locator).text().trim().split(mainDish.delimiter)[mainDish.position];
    })
    .filter(item => item !== '');

  return {
    name: recipe.name,
    soups,
    dishes,
  };
};

export const standardExtractor = (res) => {
  const recipe = JSON.parse(res.response.recipe);
  const soups = recipe.structure.soups
    .map(soup => {
      return res.window.$(soup.locator).text().trim();
    })
    .filter(item => item !== '');

  const dishes = recipe.structure.main
    .map(mainDish => {
      return res.window.$(mainDish.locator).text().trim();
    })
    .filter(item => item !== '');

  return {
    name: recipe.name,
    soups,
    dishes,
  };
};
