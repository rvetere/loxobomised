const { clickActionOfCategory, getPageInPool, sleep } = require("../../lib");

const run = async (pool, query) => {
  const withMarkise = !!query.mk;
  const withBedroom = !!query.br;

  await shadeOnLivingRoom(pool, query);
  await shadeOnKitchen(pool, query);

  if (withBedroom) {
    await shadeOnBedroom(pool, query);
  }

  if (withMarkise) {
    await shadeOnLoggia(pool, query);
  }
};

const shadeOnLivingRoom = async (pool, query) => {
  const withLoggia = !!query.lg;
  const windowDelay2 = parseInt(query.lrDelay2 || "30", 10);
  const windowDelay3 = parseInt(query.lrDelay3 || "33", 10);

  const page = getPageInPool(pool, "Wohnzimmer");
  if (withLoggia) {
    await clickActionOfCategory(page, "Beschattung", 4, "Fully Down");
  }
  await clickActionOfCategory(page, "Beschattung", 2, "Fully Down");
  setTimeout(async () => {
    await openBlindsSlightly(page, 2, windowDelay2 >= 40, !!query.lrDoubleUp2);
  }, 1000 * windowDelay2);

  await clickActionOfCategory(page, "Beschattung", 3, "Fully Down");
  setTimeout(async () => {
    await openBlindsSlightly(page, 3, windowDelay3 >= 40, !!query.lrDoubleUp3);
  }, 1000 * windowDelay3);

  if (withLoggia) {
    setTimeout(async () => {
      await openBlindsSlightly(page, 4, true, !!query.lrDoubleUp4);
    }, 1000 * 55);
  }
};

const shadeOnKitchen = async (pool, query) => {
  const windowDelay1 = parseInt(query.kDelay1 || "33", 10);

  const page = getPageInPool(pool, "Küche");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
  setTimeout(async () => {
    await openBlindsSlightly(page, 1, windowDelay1 >= 40, !!query.kDoubleUp1);
  }, 1000 * windowDelay1);
};

const shadeOnBedroom = async (pool, query) => {
  const windowDelay1 = parseInt(query.brDelay1 || "25", 10);

  const page = getPageInPool(pool, "Zimmer 1");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Down");
  setTimeout(async () => {
    await openBlindsSlightly(page, 1, windowDelay1 >= 40, !!query.brDoubleUp1);
  }, 1000 * windowDelay1);
};

const shadeOnLoggia = async (pool, query) => {
  const windowDelay1 = parseInt(query.lgDelay1 || "10", 10);
  const windowDelay2 = parseInt(query.lgDelay2 || "8", 10);

  const page = getPageInPool(pool, "Loggia");
  await clickActionOfCategory(page, "Beschattung", 1, "Fully Out");
  setTimeout(async () => {
    await clickActionOfCategory(page, "Beschattung", 1, "Out");
  }, 1000 * windowDelay1);

  await clickActionOfCategory(page, "Beschattung", 2, "Fully Out");
  setTimeout(async () => {
    await clickActionOfCategory(page, "Beschattung", 2, "Out");
  }, 1000 * windowDelay2);
};

const openBlindsSlightly = async (
  page,
  buttonGroupIndex,
  fullyOpen,
  doubleUp = false
) => {
  console.log({ buttonGroupIndex, fullyOpen, doubleUp });

  if (!fullyOpen) {
    await clickActionOfCategory(page, "Beschattung", buttonGroupIndex, "Up");
    await sleep(500);
  }

  await clickActionOfCategory(page, "Beschattung", buttonGroupIndex, "Up");

  if (doubleUp) {
    await sleep(1000);
    await clickActionOfCategory(page, "Beschattung", buttonGroupIndex, "Up");
    await sleep(1000);
    await clickActionOfCategory(page, "Beschattung", buttonGroupIndex, "Up");
  }
};

module.exports = {
  run,
};
