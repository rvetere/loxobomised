import { ElementHandle } from "puppeteer";

const percentToInt = (percent: string) =>
  parseInt(
    percent.includes("(")
      ? percent.split("(")[1].split(")")[0]
      : percent.split("is ")[1].split(" ")[0],
    10
  );

export const getDataPercent = async (
  container: ElementHandle<Node>,
  closedText = "Closed"
) => {
  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosed = texts.find((text) => text.includes(closedText));

  return textWithPercent ? percentToInt(textWithPercent) : textClosed ? 100 : 0;
};
