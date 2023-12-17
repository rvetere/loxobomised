import { Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { clickButtonByText } from "./clickButtonByText";

const apartment = process.env.APARTMENT || "🤡";

export const navigate = async (
  page: Page,
  target: string,
  mainNav = "Räume",
) => {
  // navigate to mainNav
  try {
    await clickButtonByText(page, mainNav);
    await sleep(500);
  } catch (_e) {
    await clickButtonByText(page, mainNav);
    await sleep(500);
  }

  // navigate to target
  try {
    await clickButtonByText(page, target);
    await sleep(500);
  } catch (_e) {
    await clickButtonByText(page, target);
    await sleep(500);
  }

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one target in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`,
  );
  await sleep(500);
};
