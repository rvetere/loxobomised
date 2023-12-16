const { clickActionOfCategory, getPageInPool } = require("../../lib");

const run = async (pool) => {
  await shadeOffLivingRoom(pool);
  await shadeOffKitchen(pool);
  await shadeOffBedroom(pool);
  await shadeOffLoggia(pool);
};

const shadeOffLivingRoom = async (pool) => {
  const page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Up");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Up");
};

const shadeOffKitchen = async (pool) => {
  const page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Up");
};

const shadeOffBedroom = async (pool) => {
  const page = getPageInPool(pool, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Up");
};

const shadeOffLoggia = async (pool) => {
  const page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully In");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully In");
};

module.exports = {
  run,
};
