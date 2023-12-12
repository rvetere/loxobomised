const { clickOnParent } = require("./clickOnParent");
const { sleep } = require("./sleep");

const clickActionOfCategory = async (
  page,
  category,
  buttonGroupIndex,
  action
) => {
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  const elements = await container.$$("div[role=button]");

  // open overlay controls
  elements[0].click();
  await sleep(200);

  // click action
  await clickOnParent(page, action);

  // close overlay controls
  await page.keyboard.press("Escape");
  await sleep(200);
};

module.exports = {
  clickActionOfCategory,
};
