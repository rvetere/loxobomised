const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  navigateToRoom,
  sleep,
} = require("../../lib");

const run = async (page, query) => {
  const percentStr = query.percent || "40";
  const percent = parseInt(percentStr, 10);

  await navigateToRoom(page, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, percent);
};

module.exports = {
  run,
};
