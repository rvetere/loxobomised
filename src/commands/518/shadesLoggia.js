const {
  controlJalousieWithAction,
  getPageInPool,
  sleep,
} = require("../../lib");

/**
 * ?percent1=50&percent2=33
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  const page = getPageInPool(pool, "Loggia");
  const delay1 = await controlJalousieWithAction({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent1 || "50", 10),
  });

  const delay2 = await controlJalousieWithAction({
    page,
    buttonGroupIndex: 2,
    percentToSet: parseInt(query.percent2 || "33", 10),
  });

  await sleep(Math.max(delay1, delay2));
};

module.exports = {
  run,
};
