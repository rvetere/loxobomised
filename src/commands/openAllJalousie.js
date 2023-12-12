const { clickButtonByText } = require("../lib");

const run = async (page) => {
  await clickButtonByText(page, "Kategorien");
  await clickButtonByText(page, "Beschattung");

  // get all buttons of current page
  const elements = await page.$$("div[role=button]");

  // close all rollos
  await elements[44].click(); // Küche
  await elements[75].click(); // Zimmer 1

  await elements[55].click(); // Wohnzimmer ALLE

  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
