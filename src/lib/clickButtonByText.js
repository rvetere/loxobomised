const clickButtonByText = async (page, text) => {
  const [element] = await page.$x(`//div[contains(text(),'${text}')]`);

  if (element) {
    await element.click();
  } else {
    console.error("Element not found");
  }
};

module.exports = {
  clickButtonByText,
};
