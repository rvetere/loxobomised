const getContainer = async (page, title, buttonGroupIndex) => {
  const containerXPath = `//div[contains(text(),'${title}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`;
  // console.log("getContainer", { containerXPath });
  const [container] = await page.$x(containerXPath);
  return container;
};

module.exports = {
  getContainer,
};
