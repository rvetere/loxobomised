import type { ElementHandle } from "puppeteer";

export const getVentilationLevelOfString = (text: string) => {
  switch (text) {
    case "aus":
      return 0;
    case "stufe 1":
      return 1;
    case "stufe 2":
      return 2;
    case "stufe 3":
      return 3;
    case "stufe 4":
      return 4;
    case "hyper speed":
      return 5;
    case "nacht":
      return 6;
    case "freecooling":
      return 7;
    default:
      return -1;
  }
};

export const getVentilationLevel = async (container: ElementHandle<Node>) => {
  const texts = await container.$$eval("div", (divs) => divs.map((div) => div.innerText));
  const lastOne = texts?.filter((t) => t !== "")?.pop();
  return lastOne ? getVentilationLevelOfString(lastOne) : -1;
};
