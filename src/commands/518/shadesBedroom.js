const { controlJalousie, getPageInPool, sleep } = require("../../lib");

/**
 * ?percent=45&finalPosition=1
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  if (global.bedroomTimers && global.bedroomTimers.length) {
    global.bedroomTimers.forEach((timer) => timer && clearTimeout(timer));
    global.bedroomTimers = [];
  }

  const page = getPageInPool(pool, "Zimmer 1");
  const { actualDelay, timer } = await controlJalousie({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent || "45", 10),
    finalPosition: parseInt(query.finalPosition || "1", 10),
  });

  global.bedroomTimers = [...(global.bedroomTimers || []), timer];
  await sleep(actualDelay);
};

module.exports = {
  run,
};
