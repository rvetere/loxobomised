import { Page } from "puppeteer";

export const clickOnParent = async (page: Page, text: string) => {
  try {
    const [element] = await page.$x(`//div[text()='${text}']`);
    if (element) {
      const parentElement = await element.$x("..");
      if (parentElement && parentElement[0]) {
        (element as unknown as HTMLElement).click();
      }
      return element;
    }
  } catch (e) {
    console.error("clickOnParent", e);
  }

  return null;
};
