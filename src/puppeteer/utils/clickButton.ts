import { ElementHandle } from "puppeteer";
import { sleep } from "src/utils/sleep";

export async function clickButton(
  button: ElementHandle<Element> | null,
  delay = 250
) {
  console.log("clickButton", button);
  button?.click();
  await sleep(delay);

  console.log("clickButton", "again");
  button?.click();
}
