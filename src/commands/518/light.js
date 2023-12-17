const {
  clickActionOfTitle,
  clickPlusMinusOfTitle,
  getPageInPool,
} = require("../../lib");

/**
 * http://localhost:9000/exec/518/light?withKitchen=1&percentKitchen=40
 * http://localhost:9000/exec/518/light?withKitchenHeadlights=1&actionKitchen=Switch Off
 * http://localhost:9000/exec/518/light?withEntrance=1&actionEntrance=Switch Off
 * http://localhost:9000/exec/518/light?withLoggia=1&actionLoggia=Switch Off
 * http://localhost:9000/exec/518/light?withBathroom=1&percentBathroom=100
 * http://localhost:9000/exec/518/light?withBathroomHeadlights=1&actionBathroom=Switch Off
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  const page = getPageInPool(pool, "Beleuchtung");

  // 1. Kitchen Headlights
  if (!!query.withKitchenHeadlights) {
    // Turn off head lights
    await clickActionOfTitle(
      page,
      "Küche",
      1,
      query.actionKitchen || "Switch On"
    );
  }

  // 2. Kitchen
  if (!!query.withKitchen) {
    // Set spots to a dimmed level
    let percentStr = query.percentKitchen || "40";
    let percent = parseInt(percentStr, 10);
    if (!isNaN(percent)) {
      await clickPlusMinusOfTitle(page, "Küche", 2, percent);
    } else {
      await clickActionOfTitle(page, "Küche", 2, percentStr);
    }
  }

  // 3. Entrance
  if (!!query.withEntrance) {
    await clickActionOfTitle(
      page,
      "Entrée",
      1,
      query.actionEntrance || "Switch On"
    );
  }

  // 4. Loggia
  if (!!query.withLoggia) {
    await clickActionOfTitle(
      page,
      "Loggia",
      1,
      query.actionLoggia || "Switch On"
    );
  }

  // 5. Bathroom
  if (!!query.withBathroom) {
    percentStr = query.percentBathroom || "100";
    percent = parseInt(percentStr, 10);
    if (!isNaN(percent)) {
      await clickPlusMinusOfTitle(page, "WC-Dusche", 1, percent);
    } else {
      await clickActionOfTitle(page, "WC-Dusche", 1, percentStr);
    }
  }

  // 6. Bathroom Headlights
  if (!!query.withBathroomHeadlights) {
    await clickActionOfTitle(
      page,
      "WC-Dusche",
      2,
      query.actionBathroom || "Switch On"
    );
  }
};

module.exports = {
  run,
};