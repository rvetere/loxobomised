import { ElementHandle } from "puppeteer";

export const getVentilationLevelOfString = (text: string) => {
  switch (text) {
    case "Aus":
      return 0;
    case "Stufe 1":
      return 1;
    case "Stufe 2":
      return 2;
    case "Stufe 3":
      return 3;
    case "Stufe 4":
      return 4;
    case "Hyper Speed":
      return 5;
    case "Nacht":
      return 6;
    case "Freecooling":
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
