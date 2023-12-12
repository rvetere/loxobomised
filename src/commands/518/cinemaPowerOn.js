const { clickButtonByText, sleep } = require("../../lib");

const run = async (page) => {
  await turnOffLightsInRoom(page, "Küche");
  await turnOffLightsInRoom(page, "Entrée");
  await turnDownVentilationInRoom(page, "Wohnzimmer");

  //   await sleep(500);
  //   await page.screenshot({ path: "example.png" });
};

const turnDownVentilationInRoom = async (page, room) => {
  // navigate to room
  await clickButtonByText(page, "Räume");
  await clickButtonByText(page, room);

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one room in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("WOHNUNG 05.18")'
  );

  await clickButtonByText(page, "Lüfter");
  await clickButtonByText(page, "Stufe 1");
};

const turnOffLightsInRoom = async (page, room) => {
  // navigate to room
  await clickButtonByText(page, "Räume");
  await clickButtonByText(page, room);

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one room in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("WOHNUNG 05.18")'
  );

  // get all buttons of current page
  const elements = await page.$$("div[tabindex='0']>div");

  // turn off lights
  if (room === "Küche") {
    await elements[32].click();
    await elements[34].click();
  } else {
    await elements[31].click();
  }

  await sleep(100);

  return elements;
};

module.exports = {
  run,
};
