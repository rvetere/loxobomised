const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool, query) => {
  const percentStr = query.percent || "100";
  const percent = parseInt(percentStr, 10);

  const page = getPageInPool(pool, "WC-Dusche");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch On");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 1, percent);
};

module.exports = {
  run,
};
