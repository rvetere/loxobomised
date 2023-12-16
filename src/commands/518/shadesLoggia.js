const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool, query) => {
  const windowDelay1 = parseInt(query.delay1 || "10", 10);
  const windowDelay2 = parseInt(query.delay2 || "8", 10);
  const direction = query.direction || "Out";

  const page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, `Fully ${direction}`);
  setTimeout(async () => {
    await clickActionOfCategory(page, "Beschattung", 1, direction);
  }, 1000 * windowDelay1);

  await clickActionOfCategory(page, "Beschattung", 2, `Fully ${direction}`);
  setTimeout(async () => {
    await clickActionOfCategory(page, "Beschattung", 2, direction);
  }, 1000 * windowDelay2);
};

module.exports = {
  run,
};
