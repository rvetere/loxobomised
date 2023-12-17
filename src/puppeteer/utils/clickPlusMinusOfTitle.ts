/* eslint-disable @typescript-eslint/indent */
import { ElementHandle, Page } from "puppeteer";
import { getContainer } from "./getContainer";
import { sleep } from "src/utils/sleep";

function toPositive(n: number) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

const clickParent = async (element: ElementHandle<Element>) => {
  if (element) {
    const parentElement = await element.$x("../..");

    if (parentElement && parentElement[0]) {
      await element.click();
    }
    return element;
  }
};

const clickPlusMinus = async (page: Page, kind: string) => {
  const buttons =
    kind === "plus"
      ? await page.$$(
          "path[d='M13 21a1 1 0 11-2 0v-8H3a1 1 0 110-2h8V3a1 1 0 112 0v8h8a1 1 0 110 2h-8v8z']"
        )
      : await page.$$(
          "path[d='M2 12a1 1 0 011-1h18a1 1 0 110 2H3a1 1 0 01-1-1z']"
        );

  // click plus/minus
  if (buttons.length) {
    await clickParent(buttons[0]);
    await sleep(200);
  } else {
    console.error("clickPlusMinus", "no button found");
    await page.screenshot({ path: "clickPlusMinus-error.png" });
  }
};

export const clickPlusMinusOfTitle = async (
  page: Page | null,
  title: string,
  buttonGroupIndex: number,
  percentToSet: number
) => {
  if (!page) {
    console.error("Page not found!");
    return;
  }
  const container = await getContainer(page, title, buttonGroupIndex);
  if (!container) {
    return null;
  }

  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.endsWith("%"));
  const currentPercent = textWithPercent
    ? parseInt(textWithPercent.replace("%", "").split("\n")[1])
    : 0;
  const steps = (percentToSet - currentPercent) / 10;
  const kind = steps > 0 ? "plus" : "minus";

  if (toPositive(steps) > 0) {
    const elements = await container.$$("div[role=button]");

    // open overlay controls
    elements[0].click();
    await sleep(200);

    for (let i = 0; i < toPositive(steps); i++) {
      await clickPlusMinus(page, kind);
    }

    // close overlay controls
    await page.keyboard.press("Escape");
    await sleep(200);
  }
};
