import { Page } from "puppeteer";

export const getContainer = async (
  page: Page | null,
  title: string,
  blockIndex: number
) => {
  if (!page) {
    console.error("Page not found!");
    return null;
  }

  const containerXPath = `//div[contains(text(),'${title}')]/../../following-sibling::div[1]/div/div[${blockIndex}]`;
  const [container] = await page.$x(containerXPath);
  if (!container) {
    console.error("Container not found!", { containerXPath });
    await page.screenshot({ path: "error.png" });
    return null;
  }
  return container;
};
