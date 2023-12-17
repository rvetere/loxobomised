import { Page } from "puppeteer";

export const clickButtonByText = async (page: Page, text: string) => {
  try {
    const [element] = await page.$x(`//div[contains(text(),'${text}')]`);
    if (element) {
      (element as unknown as HTMLElement).click();
    } else {
      await page.screenshot({ path: `clickButtonByText-${text}.png` });
      console.error("Element not found");
    }
  } catch (e) {
    console.error(e);
  }
};