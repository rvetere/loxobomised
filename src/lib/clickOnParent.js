const clickOnParent = async (page, text) => {
  const [element] = await page.$x(`//div[contains(text(),'${text}')]`);

  if (element) {
    const parentElement = await element.$x("..");

    if (parentElement && parentElement[0]) {
      await element.click();
    }
    return;
  }
  console.error("Element not found");
};

module.exports = {
  clickOnParent,
};
