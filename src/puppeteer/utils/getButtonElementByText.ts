import { ElementHandle, Page } from "puppeteer";

export const getButtonElementByText = async (page: Page, text: string) => {
  const elements = await page.$x(`//div[@role='button']/div[contains(text(),'${text}')]`);
  if (elements.length) {
    if (elements.length === 2) {
      const promised = elements.map(async (el) => {
        const parent = await el.$x("..");
        if (parent.length) {
          parent[0] as ElementHandle<Element>;
        }
        return null;
      });
    }
    return elements[0] as ElementHandle<Element>;
  }
  return null;
};
