const { clickActionOfCategory, navigateToRoom, sleep } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Out");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Out");

  // await sleep(200);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
