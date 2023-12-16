const { sleep } = require("./sleep");

const clickUpDownOfCategory = async (
  page,
  category,
  buttonGroupIndex,
  action = "down", // "up", "down"
  doubleClick = false,
  delay = 200,
  callback = () => {}
) => {
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  if (!container) {
    console.error("Category not found!");
    await page.screenshot({ path: "error.png" });
    return;
  }
  const downButtons = await container.$$(
    "path[d='M2.253 8.336a1 1 0 011.411-.083L12 15.663l8.336-7.41a1 1 0 011.328 1.494l-9 8a1 1 0 01-1.328 0l-9-8a1 1 0 01-.083-1.411z']"
  );
  const upButtons = await container.$$(
    "path[d='M11.336 6.253a1 1 0 011.328 0l9 8a1 1 0 01-1.328 1.494L12 8.337l-8.336 7.41a1 1 0 01-1.328-1.494l9-8z']"
  );
  const elements = action === "up" ? upButtons : downButtons;

  // click action
  elements[0].click();
  if (doubleClick) {
    setTimeout(() => {
      elements[0].click();
      callback();
    }, delay);
  }
  await sleep(800);
};

module.exports = {
  clickUpDownOfCategory,
};
