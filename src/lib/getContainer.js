const getContainer = async (page, category, buttonGroupIndex) => {
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  return container;
};

module.exports = {
  getContainer,
};
