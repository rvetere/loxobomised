import { Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { clickOnParent } from "./clickOnParent";
import { getContainer } from "./getContainer";

export const clickActionOfTitle = async (
  page: Page | null,
  title: string,
  buttonGroupIndex: number,
  action: string,
  doubleClick = false
) => {
  if (!page) {
    console.error("Page not found!");
    return;
  }

  const container = await getContainer(page, title, buttonGroupIndex);
  if (!container) {
    return;
  }
  const elements = await container.$$("div[role=button]");
  const element = elements.length ? elements[0] : null;
  if (!element) {
    console.error("Element not found!");
    return;
  }

  // open overlay controls
  element.click();
  await sleep(200);

  if (doubleClick) {
    element.click();
    await sleep(200);
  }

  // click action
  await clickOnParent(page, action);

  // close overlay controls
  await page.keyboard.press("Escape");
  await sleep(200);
};
