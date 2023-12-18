import { ElementHandle } from "puppeteer";
import { sleep } from "src/utils/sleep";

export const clickElement = async (
  element: ElementHandle<Element> | null,
  delay = 250,
  doubleClick = false,
  clickOnParent = false
) => {
  if (element) {
    try {
      if (clickOnParent) {
        const parent = await element.$x("..");
        if (parent.length) {
          const parentElement = parent[0] as ElementHandle<Element>;
          parentElement?.click();
          await sleep(delay);
        }
      } else {
        element.click();
        await sleep(delay);
      }

      if (doubleClick) {
        element.click();
        await sleep(delay);
      }
    } catch (e) {
      // @ts-expect-error
      let catchCounter = global.catchCounter || 0;
      catchCounter++;
      // @ts-expect-error
      global.catchCounter = catchCounter;
      console.error(`🚨 Exception in "clickElement"! (${catchCounter})`);
      console.error(e);
    }
  }
};
