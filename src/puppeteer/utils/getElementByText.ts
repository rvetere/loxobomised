import { Page } from "puppeteer";

export const getElementByText = async (page: Page, text: string) => {
  const elements = await page.$$(`xpath///div[contains(text(),'${text}')]`);
  if (elements.length) {
    return elements[0];
  }
  return null;
};
