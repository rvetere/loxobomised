const { clickActionOfTitle, getPageInPool } = require("../../lib");

/**
 * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
 * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
 * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  const page = getPageInPool(pool, "Lüftung");
  if (!!query.withBedroom) {
    await clickActionOfTitle(
      page,
      "Zimmer 1",
      1,
      query.setBedroom || "Stufe 1"
    );
  }

  if (!!query.withLivingroom) {
    await clickActionOfTitle(
      page,
      "Wohnzimmer",
      1,
      query.setLivingroom || "Stufe 1"
    );
  }
};

module.exports = {
  run,
};
