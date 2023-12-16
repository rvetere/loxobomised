const { controlJalousie, getPageInPool } = require("../../lib");

/**
 * ?percent=72&finalPosition=1
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  if (global.kitchenTimers && global.kitchenTimers.length) {
    global.kitchenTimers.forEach((timer) => timer && clearTimeout(timer));
    global.kitchenTimers = [];
  }

  const page = getPageInPool(pool, "Küche");
  const { actualDelay, timer } = await controlJalousie({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent || "72", 10),
    finalPosition: parseInt(query.finalPosition || "1", 10),
  });

  global.kitchenTimers = [...(global.kitchenTimers || []), timer];
  await sleep(actualDelay);
};

module.exports = {
  run,
};
