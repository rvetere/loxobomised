const { controlJalousie, getPageInPool, sleep } = require("../../lib");

/**
 * ?lg=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
 *
 * @param {*} pool
 * @param {*} query
 */
const run = async (pool, query) => {
  console.log(
    `🏎️ Run shadesLivingroom command at ${new Date().toLocaleString("de-DE")}`
  );
  if (global.livingroomTimers && global.livingroomTimers.length) {
    global.livingroomTimers.forEach((timer) => timer && clearTimeout(timer));
    global.livingroomTimers = [];
  }

  const withLoggia = !!query.lg;

  const page = getPageInPool(pool, "Wohnzimmer");
  let delay4 = 0;
  let timer4 = null;
  if (withLoggia) {
    const { actualDelay, timer } = await controlJalousie({
      page,
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
    buttonGroupIndex: 2,
    percentToSet: parseInt(query.percent2 || "66", 10),
    finalPosition: parseInt(query.finalPosition2 || "1", 10),
  });
  const { actualDelay: delay3, timer: timer3 } = await controlJalousie({
    page,
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
  console.log(
    `Finished shadesLivingroom at ${new Date().toLocaleString("de-DE")}`
  );
};

module.exports = {
  run,
};
