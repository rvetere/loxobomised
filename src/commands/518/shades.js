const { controlJalousie, getPageInPool, sleep } = require("../../lib");

/**
 * http://localhost:9001/exec/518/shades
 * http://localhost:9001/exec/518/shades?lg=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  console.log(`🚀 Run shades command at ${new Date().toLocaleString("de-DE")}`);
  const page = getPageInPool(pool, "Beschattung");

  if (query.room === "Livingroom") {
    await livingroom(page, query);
  }
  if (query.room === "Kitchen") {
    await kitchen(page, query);
  }
  if (query.room === "Loggia") {
    await loggia(page, query);
  }
  if (query.room === "Bedroom") {
    await bedroom(page, query);
  }

  console.log(
    `🚀 Finished shades command at ${new Date().toLocaleString("de-DE")}`
  );
};

const bedroom = async (page, query) => {
  if (global.bedroomTimers && global.bedroomTimers.length) {
    global.bedroomTimers.forEach((timer) => timer && clearTimeout(timer));
    global.bedroomTimers = [];
  }

  const { actualDelay, timer } = await controlJalousie({
    page,
    room: "Zimmer 1",
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.brPercent || "45", 10),
    finalPosition: parseInt(query.brFinalPosition || "1", 10),
  });

  global.bedroomTimers = [...(global.bedroomTimers || []), timer];
  await sleep(actualDelay);
};

const kitchen = async (page, query) => {
  if (global.kitchenTimers && global.kitchenTimers.length) {
    global.kitchenTimers.forEach((timer) => timer && clearTimeout(timer));
    global.kitchenTimers = [];
  }

  const { actualDelay, timer } = await controlJalousie({
    page,
    room: "Küche",
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.kcPercent || "72", 10),
    finalPosition: parseInt(query.kcFinalPosition || "1", 10),
  });

  global.kitchenTimers = [...(global.kitchenTimers || []), timer];
  await sleep(actualDelay);
};

const loggia = async (page, query) => {
  const delay1 = await controlJalousieWithAction({
    page,
    room: "Loggia",
    buttonGroupIndex: 1,
    percentToSet: parseInt(query.lgPercent1 || "50", 10),
  });

  const delay2 = await controlJalousieWithAction({
    page,
    room: "Loggia",
    buttonGroupIndex: 2,
    percentToSet: parseInt(query.lgPercent2 || "33", 10),
  });

  await sleep(Math.max(delay1, delay2));
};

const livingroom = async (page, query) => {
  if (global.livingroomTimers && global.livingroomTimers.length) {
    global.livingroomTimers.forEach((timer) => timer && clearTimeout(timer));
    global.livingroomTimers = [];
  }

  const withLoggia = !!query.lg;

  let delay4 = 0;
  let timer4 = null;
  if (withLoggia) {
    const { actualDelay, timer } = await controlJalousie({
      page,
      room: "Wohnzimmer",
      buttonGroupIndex: 4,
      percentToSet: parseInt(query.percent4 || "100", 10),
      finalPosition: parseInt(query.finalPosition4 || "2", 10),
      rolloType: "Loggia",
    });
    delay4 = actualDelay;
    timer4 = timer;
  }

  const { actualDelay: delay2, timer: timer2 } = await controlJalousie({
    page,
    room: "Wohnzimmer",
    buttonGroupIndex: 2,
    percentToSet: parseInt(query.percent2 || "66", 10),
    finalPosition: parseInt(query.finalPosition2 || "1", 10),
  });
  const { actualDelay: delay3, timer: timer3 } = await controlJalousie({
    page,
    room: "Wohnzimmer",
    buttonGroupIndex: 3,
    percentToSet: parseInt(query.percent3 || "72", 10),
    finalPosition: parseInt(query.finalPosition3 || "1", 10),
  });

  global.livingroomTimers = [
    ...(global.livingroomTimers || []),
    timer2,
    timer3,
    timer4,
  ];
  await sleep(Math.max(delay2, delay3, delay4));
};

module.exports = {
  run,
};
