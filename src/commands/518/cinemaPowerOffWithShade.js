const { clickActionOfCategory, getPageInPool } = require("../../lib");

const run = async (pool) => {
  let page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Up");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, 20);

  page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Up");

  page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully In");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully In");
};

module.exports = {
  run,
};
