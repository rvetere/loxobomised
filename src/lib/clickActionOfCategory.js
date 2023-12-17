const { clickOnParent } = require("./clickOnParent");
const { sleep } = require("./sleep");

const clickActionOfCategory = async (
  page,
  category,
  buttonGroupIndex,
  action,
  doubleClick = false
) => {
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  if (!container) {
    console.error("Category not found!");
    await page.screenshot({ path: "error.png" });
    return;
  }
  const elements = await container.$$("div[role=button]");

  // open overlay controls
  elements[0].click();
  await sleep(200);
  if (doubleClick) {
    elements[0].click();
    await sleep(200);
  }

  // click action
  const elementFound = await clickOnParent(page, action);
  if (!!elementFound) {
    // close overlay controls
    await page.keyboard.press("Escape");
    await sleep(200);
  }
};

module.exports = {
  clickActionOfCategory,
};
