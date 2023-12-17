const { clickOnParent } = require("./clickOnParent");
const { sleep } = require("./sleep");

const clickActionOfTitle = async (
  page,
  title,
  buttonGroupIndex,
  action,
  doubleClick = false
) => {
  const [container] = await page.$x(
    `//div[contains(text(),'${title}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
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
  await clickOnParent(page, action);
  // close overlay controls
  await page.keyboard.press("Escape");
  await sleep(200);
};

module.exports = {
  clickActionOfTitle,
};
