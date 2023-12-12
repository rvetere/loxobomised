const { clickButtonByText } = require("./clickButtonByText");

const apartment = process.env.APARTMENT || "05.18";

const navigateToRoom = async (page, room) => {
  // navigate to room
  await clickButtonByText(page, "Räume");
  await clickButtonByText(page, room);

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one room in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
  );
};

module.exports = {
  navigateToRoom,
};
