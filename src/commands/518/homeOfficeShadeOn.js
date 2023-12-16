const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool) => {
  const page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  await sleep(22000);
  await clickActionOfCategory(page, "Beschattung", 2, "Up");

  // await sleep(200);
  // await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
