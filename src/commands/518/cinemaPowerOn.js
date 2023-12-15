const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool) => {
  let page = await getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");
  await clickActionOfCategory(page, "Beleuchtung", 2, "Switch Off");

  page = await getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Lüftung", 1, "Stufe 1");

  page = await getPageInPool(pool, "Entrée");
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");

  // await sleep(500);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
