const { clickButtonByText, sleep } = require("../../lib");

const run = async (page) => {
  await clickButtonByText(page, "Kategorien");
  await clickButtonByText(page, "Beschattung");

  // get all buttons of current page
  const elements = await page.$$("div[role=button]");

  // close all rollos
  await elements[45].click(); // Küche
  await elements[76].click(); // Zimmer 1

  await elements[56].click(); // Wohnzimmer ALLE
  await sleep(50);
  // open lodgia rollo again
  await elements[67].click(); // Wohnzimmer Lodgia "2"

  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
