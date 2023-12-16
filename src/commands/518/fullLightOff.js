const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool) => {
  let page = getPageInPool(pool, "Entrée");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");

  page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
};

module.exports = {
  run,
};
