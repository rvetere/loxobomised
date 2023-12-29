import type { ElementHandle, Page } from "puppeteer";

export const getButtonElementByText = async (page: Page, text: string) => {
  const elements = await page.$x(`//div[@role='button']/div[contains(text(),'${text}')]`);
  if (elements.length) {
    if (elements.length <= 2) {
      return elements[0] as ElementHandle<Element>;
    }
    throw new Error(`Found more than two elements with text ${text}!`);
  }
  return null;
};
