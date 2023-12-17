const getContainer = async (page, title, buttonGroupIndex) => {
  const containerXPath = `//div[contains(text(),'${title}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`;
  const [container] = await page.$x(containerXPath);
  // console.log({ containerXPath });
  if (!container) {
    console.error("Container not found!", { containerXPath });
    await page.screenshot({ path: "error.png" });
    return null;
  }
  return container;
};

module.exports = {
  getContainer,
};
