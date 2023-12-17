import { Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { clickOnParent } from "./clickOnParent";

export const clickActionOfTitle = async (
  page: Page | null,
  text: string,
  buttonGroupIndex: number,
  action: string,
  doubleClick = false,
) => {
  if (!page) {
    console.error("Page not found!");
    return;
  }

  const containerXPath = `//div[contains(text(),'${text}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`;
  const [container] = await page.$x(containerXPath);
  if (!container) {
    return;
  }
  const elements = await container.$$("div[role=button]");

  // open overlay controls
  elements[0].click();
  await sleep(200);
  if (doubleClick) {
    elements[0].click();
    await sleep(200);
  }

  // click action
  await clickOnParent(page, action);
  // close overlay controls
  await page.keyboard.press("Escape");
  await sleep(200);
};
