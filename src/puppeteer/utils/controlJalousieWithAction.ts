/* eslint-disable @typescript-eslint/indent */
import { Page } from "puppeteer";
import { getContainer } from "./getContainer";
import { clickActionOfTitle } from "./clickActionOfTitle";

const MarkiseTiming = 20 / 100;

function toPositive(n: number) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

export const controlJalousieWithAction = async ({
  page,
  room,
  buttonGroupIndex,
  percentToSet,
  actionUp = "Fully In",
  actionDown = "Fully Out",
}: {
  page: Page | null;
  room: string;
  buttonGroupIndex: number;
  percentToSet: number;
  actionUp?: string;
  actionDown?: string;
}) => {
  let actualDelay = 0;
  const container = await getContainer(page, room, buttonGroupIndex);
  if (!container) {
    return actualDelay;
  }

  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText),
  );
  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosed = texts.find((text) => text.includes("Fully extended"));

  const currentPercent = textWithPercent
    ? parseInt(
        textWithPercent.includes("(")
          ? textWithPercent.split("(")[1].split(")")[0]
          : textWithPercent.split("is ")[1].split(" ")[0],
        10,
      )
    : textClosed
      ? 100
      : 0;

  const steps = percentToSet - currentPercent;
  const isMovingDown = steps > 0;
  const action = isMovingDown ? actionDown : actionUp;

  if (toPositive(steps) > 4) {
    await clickActionOfTitle(page, room, buttonGroupIndex, action);

    // calculate exact delay to reach "percentToSet"
    const delay = Math.floor(toPositive(steps) * MarkiseTiming * 1000);
    console.log("controlJalousieWithAction", {
      room: `${room} [${buttonGroupIndex}]}`,
      steps,
    });

    // wait until jalousie is in position
    const randomDelay = Math.floor(Math.random() * 50);
    actualDelay = delay + randomDelay;
    setTimeout(async () => {
      console.log(`Run stopAndMoveToFinalPosition (${buttonGroupIndex})`);
      await clickActionOfTitle(page, room, buttonGroupIndex, action);
    }, actualDelay);
  }

  return actualDelay;
};
