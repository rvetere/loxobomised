const { clickActionOfCategory, navigateToRoom, sleep } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Up");

  await navigateToRoom(page, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Up");

  await navigateToRoom(page, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Up");

  await sleep(500);
  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
