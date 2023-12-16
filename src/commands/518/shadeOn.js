const { clickActionOfCategory, getPageInPool } = require("../../lib");

const run = async (pool) => {
  await shadeOnLivingRoom(pool);
  await shadeOnKitchen(pool);
  await shadeOnBedroom(pool);
  await shadeOnLoggia(pool);
};

const shadeOnLivingRoom = async (pool) => {
  const page = getPageInPool(pool, "Wohnzimmer");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 3, "Fully Down");
  await clickActionOfCategory(page, "Beschattung", 4, "Fully Down");
};

const shadeOnKitchen = async (pool) => {
  const page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
};

const shadeOnBedroom = async (pool) => {
  const page = getPageInPool(pool, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
};

const shadeOnLoggia = async (pool) => {
  const page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Out");
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Out");
};

module.exports = {
  run,
};
