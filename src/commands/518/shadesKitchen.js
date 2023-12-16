const { controlJalousie, getPageInPool } = require("../../lib");

const run = async (pool, query) => {
  const page = getPageInPool(pool, "Küche");
  await controlJalousie({
    page,
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.percent || "66", 10),
    finalPosition: parseInt(query.finalPosition || "1", 10),
  });
};

module.exports = {
  run,
};
