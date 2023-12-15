const { clickActionOfCategory, navigateToRoom, sleep } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  await navigateToRoom(page, "Wohnzimmer");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 2");

  await navigateToRoom(page, "Zimmer 1");
  await sleep(200);
  await page.screenshot({ path: "example.png" });
  await clickActionOfCategory(page, "Lüftung", 1, "Aus");

  // await sleep(200);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
