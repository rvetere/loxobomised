const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool, query) => {
  const percentStr = query.percent || "40";
  const percent = parseInt(percentStr, 10);

  const page = await getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, percent);
};

module.exports = {
  run,
};
