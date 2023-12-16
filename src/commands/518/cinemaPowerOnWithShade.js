const { clickActionOfCategory, getPageInPool } = require("../../lib");

const run = async (pool) => {
  let page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Down");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 1");

  page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Out");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Out");

  page = getPageInPool(pool, "Entrée");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
};

module.exports = {
  run,
};
