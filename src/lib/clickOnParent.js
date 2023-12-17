const clickOnParent = async (page, text) => {
  const [element] = await page.$x(`//div[text()='${text}']`);

  if (element) {
    const parentElement = await element.$x("..");

    if (parentElement && parentElement[0]) {
      await element.click();
    }
    return element;
  }
  // const timeStamp = new Date().getTime();
  // await page.screenshot({ path: `element-not-found-${timeStamp}.png` });
  // console.error("Element not found");

  return null;
};

module.exports = {
  clickOnParent,
};
