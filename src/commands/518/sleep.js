const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool) => {
  let page = await getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  page = await getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 2");

  page = await getPageInPool(pool, "Zimmer 1");
  await clickActionOfCategory(page, "Lüftung", 1, "Aus");

  // await sleep(200);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
