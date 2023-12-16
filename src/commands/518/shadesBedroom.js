const { controlJalousie, getPageInPool } = require("../../lib");

const run = async (pool, query) => {
  const page = getPageInPool(pool, "Zimmer 1");
  await controlJalousie({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent || "45", 10),
    finalPosition: parseInt(query.finalPosition || "1", 10),
  });
};

module.exports = {
  run,
};
