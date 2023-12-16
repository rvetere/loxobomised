const { controlJalousie, getPageInPool } = require("../../lib");

/**
 * ?percent=72&finalPosition=1
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  const page = getPageInPool(pool, "Küche");
  await controlJalousie({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent || "72", 10),
    finalPosition: parseInt(query.finalPosition || "1", 10),
  });
};

module.exports = {
  run,
};
