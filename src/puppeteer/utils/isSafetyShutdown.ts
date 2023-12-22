import type { ElementHandle } from "puppeteer";

export const isSafetyShutdown = async (
  container: ElementHandle<Node> | null,
  closedText = "Closed"
) => {
  const texts = await container?.$$eval("div", (divs) => divs.map((div) => div.innerText));
  const lastOne = texts?.filter((t) => t !== "")?.pop();
  return lastOne === "Safety Shutdown";
};
