const clickButtonByText = async (page, text) => {
  try {
    const [element] = await page.$x(`//div[contains(text(),'${text}')]`);

    if (element) {
      await element.click();
    } else {
      console.error("Element not found");
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  clickButtonByText,
};
