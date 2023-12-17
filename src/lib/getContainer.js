const getContainer = async (page, category, buttonGroupIndex) => {
  const containerXPath = `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`;
  // console.log("getContainer", { containerXPath });
  const [container] = await page.$x(containerXPath);
  return container;
};

module.exports = {
  getContainer,
};
