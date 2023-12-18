import { ElementHandle } from "puppeteer";
import { sleep } from "src/utils/sleep";

export async function clickButton(
  button: ElementHandle<Element> | null,
  delay = 250
) {
  button?.click();
  await sleep(delay);

  button?.click();
}
