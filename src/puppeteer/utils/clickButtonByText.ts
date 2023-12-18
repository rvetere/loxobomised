import { Page } from "puppeteer";
import { sleep } from "src/utils/sleep";

export const clickButtonByText = async (page: Page, text: string) => {
  try {
    const divsWithText = await page.$$(
      `xpath///div[contains(text(),'${text}')]`
    );
    divsWithText[0]?.click();
    await sleep(200);

    if (!divsWithText.length || !divsWithText[0]) {
      // await page.screenshot({
      //   path: `clickButtonByText-notFoundError-${text}.png`,
      // });
      console.error("clickButtonByText", `div with text ${text} not found`);
    }
  } catch (e) {
    console.error(e);
  }
};
