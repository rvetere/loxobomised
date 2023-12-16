const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool) => {
  let page = getPageInPool(pool, "Entrée");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch On");

  page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch On");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, 100);

  page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch On");
};

module.exports = {
  run,
};
