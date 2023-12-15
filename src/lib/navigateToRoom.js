const { clickButtonByText } = require("./clickButtonByText");
const { sleep } = require("./sleep");

const apartment = process.env.APARTMENT || "05.18";

const navigateToRoom = async (page, room) => {
  console.log(`Navigating to room ${room}`);

  const texts = await page.$$eval("body", (bodies) =>
    bodies.map((body) => body.innerText)
  );
  const bodyText = texts.join("\n");
  if (bodyText.includes("Loading information for the App")) {
    await sleep(1000);
  }
  if (
    bodyText.includes(`WOHNUNG ${apartment}`) &&
    bodyText.includes(room.toUpperCase())
  ) {
    console.log("Already in room");
    return;
  }

  // navigate to room
  await clickButtonByText(page, "Räume");
  await sleep(100);
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("RÄUME")`
  );

  await clickButtonByText(page, room);
  await sleep(100);
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("${room.toUpperCase()}")`
  );

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one room in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
  );
  await sleep(200);
  await page.screenshot({ path: "room-navigation.png" });
  console.log("👍 Navigated to room");
};

module.exports = {
  navigateToRoom,
};
