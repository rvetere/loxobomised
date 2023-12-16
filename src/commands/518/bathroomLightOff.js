const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool) => {
  const page = getPageInPool(pool, "WC-Dusche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");
};

module.exports = {
  run,
};
