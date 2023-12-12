const { clickActionOfCategory, navigateToRoom } = require("../../lib");

const run = async (page) => {
  await navigateToRoom(page, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  await navigateToRoom(page, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");

  await navigateToRoom(page, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Down");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 1");

  await navigateToRoom(page, "Entrée");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
};

module.exports = {
  run,
};
