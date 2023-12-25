import type { ElementHandle } from "puppeteer";

const percentToInt = (percent: string) =>
  parseInt(
    percent.includes("(")
      ? percent.split("(")[1].split(")")[0]
      : percent.endsWith(" %")
        ? percent.split("\n")[1]
        : percent.split("is ")[1].split(" ")[0],
    10
  );

export const getDataPercent = async (container: ElementHandle<Node>) => {
  const texts = await container.$$eval("div", (divs) => divs.map((div) => div.innerText));

  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosedJalousie = texts.find((text) => text.includes("Closed"));
  const textClosedAwning = texts.find((text) => text.includes("Fully extended"));
  const textClosed = textClosedJalousie || textClosedAwning;

  return textWithPercent ? percentToInt(textWithPercent) : textClosed ? 100 : 0;
};
