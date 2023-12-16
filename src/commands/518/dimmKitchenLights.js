const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  getPageInPool,
  sleep,
} = require("../../lib");

const run = async (pool, query) => {
  const page = getPageInPool(pool, "Küche");

  // Turn off head lights
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");

  // Set spots to a dimmed level
  const percentStr = query.percent || "40";
  const percent = parseInt(percentStr, 10);
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, percent);
};

module.exports = {
  run,
};
