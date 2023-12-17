import { Page } from "puppeteer";

export const clickOnParent = async (page: Page, text: string) => {
  try {
    const [element] = await page.$x(`//div[text()='${text}']`);

    if (element) {
      const parentElement = await element.$x("..");

      if (parentElement && parentElement[0]) {
        await (element as unknown as HTMLElement).click();
      }
      return element;
    }
    // const timeStamp = new Date().getTime();
    // await page.screenshot({ path: `element-not-found-${timeStamp}.png` });
    // console.error("Element not found");

    return null;
  } catch (e) {
    console.error("clickOnParent", e);
    return null;
  }
};
