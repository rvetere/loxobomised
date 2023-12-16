const { controlJalousie, getPageInPool, sleep } = require("../../lib");

/**
 * ?lg=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  const withLoggia = !!query.lg;

  const page = getPageInPool(pool, "Wohnzimmer");
  let delay4 = 0;
  if (withLoggia) {
    delay4 = await controlJalousie({
      page,
      buttonGroupIndex: 4,
      percentToSet: parseInt(query.percent4 || "100", 10),
      finalPosition: parseInt(query.finalPosition4 || "2", 10),
      rolloType: "Loggia",
    });
  }

  const delay2 = await controlJalousie({
    page,
    buttonGroupIndex: 2,
    percentToSet: parseInt(query.percent2 || "66", 10),
    finalPosition: parseInt(query.finalPosition2 || "1", 10),
  });
  const delay3 = await controlJalousie({
    page,
    buttonGroupIndex: 3,
    percentToSet: parseInt(query.percent3 || "72", 10),
    finalPosition: parseInt(query.finalPosition3 || "1", 10),
  });

  await sleep(Math.max(delay2, delay3, delay4));
};

module.exports = {
  run,
};
