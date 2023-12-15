const { clickActionOfCategory, navigateToRoom, sleep } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully In");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully In");

  // await sleep(500);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
