import { ElementHandle } from "puppeteer";
import { sleep } from "src/utils/sleep";

export const clickElement = async (
  element: ElementHandle<Element> | null,
  delay = 250,
  doubleClick = false
) => {
  if (element) {
    element.click();
    await sleep(delay);

    if (doubleClick) {
      element.click();
      await sleep(delay);
    }
  }
};
