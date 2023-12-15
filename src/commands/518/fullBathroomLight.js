const {
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  navigateToRoom,
  sleep,
} = require("../../lib");

const run = async (page, query) => {
  const percentStr = query.percent || "100";
  const percent = parseInt(percentStr, 10);

  await navigateToRoom(page, "WC-Dusche");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch On");
  await clickPlusMinusOfCategory(page, "Beleuchtung", 1, percent);
};

module.exports = {
  run,
};
