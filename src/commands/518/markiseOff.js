const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool) => {
  const page = await getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully In");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully In");

  await sleep(500);
  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
