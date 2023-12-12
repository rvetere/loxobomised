const { clickButtonByText, sleep } = require("../../lib");

const run = async (page) => {
  await openJalousieInRoom(page, "Küche");
  await openJalousieInRoom(page, "Zimmer 1");
  await openJalousieInRoom(page, "Wohnzimmer");

  await sleep(500);
  await page.screenshot({ path: "example.png" });
};

const openJalousieInRoom = async (page, room) => {
  // navigate to room
  await clickButtonByText(page, "Räume");
  await clickButtonByText(page, room);

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one room in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("WOHNUNG 05.18")'
  );

  // get all buttons of current page
  const elements = await page.$$("div[role=button]");

  // close jalousie
  await elements[31].click();

  await sleep(100);

  return elements;
};

module.exports = {
  run,
};
