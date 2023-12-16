const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool) => {
  let page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 1");

  page = getPageInPool(pool, "Zimmer 1");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 1");
};

module.exports = {
  run,
};
