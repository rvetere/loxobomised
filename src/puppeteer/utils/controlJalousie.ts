import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { clickUpDownOfTitle } from "./clickUpDownOfTitle";
import { getContainer } from "./getContainer";
import { getDataPercent } from "./getDataPercent";
import {
  LoggiaRolloTiming,
  MarkiseTiming,
  RolloType,
  WindowRolloTiming,
  getTiming,
} from "./jalousieTiming";

async function clickButton(button: ElementHandle<Element> | null, delay = 250) {
  button?.click();
  await sleep(delay);
  button?.click();
}

function toPositive(n: number) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

interface ControlJalousieProps {
  page: Page | null;
  room: string;
  buttonGroupIndex: number;
  percentToSet: number;
  finalPosition: number;
  rolloType?: RolloType;
  callback?: (room: string, buttonGroupIndex: number) => void;
}

export const controlJalousie = async ({
  page,
  room,
  buttonGroupIndex,
  percentToSet,
  rolloType = "Window", // Window, Loggia, Markise
  finalPosition = 0, // 0=Closed, 1=Slightly, 2=Double
  callback = () => {},
}: ControlJalousieProps) => {
  let actualDelay = 0;
  const container = await getContainer(page, room, buttonGroupIndex);
  if (!container) {
    return actualDelay;
  }

  const currentPercent = await getDataPercent(container);
  const steps = percentToSet - currentPercent;
  const isMovingDown = steps > 0;

  console.log("   Run controlJalousie", {
    room: `${room} [${buttonGroupIndex}]`,
    steps,
  });

  if (toPositive(steps) > 3) {
    // calculate exact delay to reach "percentToSet"
    const delay = Math.floor(toPositive(steps) * getTiming(rolloType) * 1000);
    actualDelay = delay;

    // click action to move jalousie
    await clickUpDownOfTitle({
      page: page,
      category: room,
      buttonGroupIndex: buttonGroupIndex,
      action: isMovingDown ? "down" : "up",
      doubleClick: true,
      delay,
      callback: async (afterDoubleClick, upButton, downButton) => {
        if (afterDoubleClick && rolloType !== "Markise") {
          console.log(
            `   Move jalousie (${room}) [${buttonGroupIndex}] to final position (tilted=${finalPosition};isMovingDown=${isMovingDown}))`
          );
          if (isMovingDown) {
            if (finalPosition === 0) {
              // nothing to do, the blinds are already closed
            } else if (finalPosition === 1) {
              await clickButton(upButton, 400);
            } else if (finalPosition === 2) {
              await clickButton(upButton, 900);
            }
          } else {
            if (finalPosition === 0) {
              await clickButton(downButton, 1200);
            } else if (finalPosition === 1) {
              await clickButton(downButton, 850);
            } else if (finalPosition === 2) {
              await clickButton(downButton, 400);
            }
          }
        }
        callback(room, buttonGroupIndex);
      },
    });
  } else {
    callback(room, buttonGroupIndex);
  }

  return actualDelay;
};
