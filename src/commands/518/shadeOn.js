const { clickActionOfCategory, navigateToRoom, sleep } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");

  await navigateToRoom(page, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");

  await navigateToRoom(page, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Down");

  await sleep(200);
  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
