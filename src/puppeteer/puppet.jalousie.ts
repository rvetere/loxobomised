import { ElementHandle, Page } from "puppeteer";
import { JalousieType, getJalousieTiming } from "./utils/getJalousieTiming";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { sleep } from "src/utils/sleep";
import { clickButton } from "./utils/clickButton";
import { PuppetBase } from "./puppet.base";
import { clickElement } from "./utils/clickElement";

interface ControlJalousieProps {
  blockIndex: number;
  callback?: (room: string, blockIndex: number) => void;
}

interface ControlJalousieWithActionProps {
  blockIndex: number;
  actionUp?: string;
  actionDown?: string;
  callback?: (room: string, blockIndex: number) => void;
}

export class PuppetJalousie extends PuppetBase {
  settings: {
    [key: string]: {
      percentToSet: number;
      finalPosition?: number;
      rolloType?: JalousieType;
    };
  };

  constructor(page: Page, category: string, room: string, query: Record<string, any>) {
    super(page, category, room, query);

    this.settings = {
      ["Wohnzimmer-2"]: {
        percentToSet: parseInt(query.set2 || "66", 10),
        finalPosition: parseInt(query.tilt2 || "1", 10),
      },
      ["Wohnzimmer-3"]: {
        percentToSet: parseInt(query.set3 || "72", 10),
        finalPosition: parseInt(query.tilt3 || "1", 10),
      },
      ["Wohnzimmer-4"]: {
        percentToSet: parseInt(query.set4 || "100", 10),
        finalPosition: parseInt(query.tilt4 || "2", 10),
        rolloType: "Loggia",
      },
      ["Küche-1"]: {
        percentToSet: parseInt(query.setKitchen || "72", 10),
        finalPosition: parseInt(query.tiltKitchen || "1", 10),
      },
      ["Zimmer 1-1"]: {
        percentToSet: parseInt(query.setBedroom || "45", 10),
        finalPosition: parseInt(query.tiltBedroom || "1", 10),
      },
      ["Loggia-1"]: {
        percentToSet: parseInt(query.setLoggia1 || "50", 10),
      },
      ["Loggia-2"]: {
        percentToSet: parseInt(query.setLoggia2 || "33", 10),
      },
    };
    this.controlJalousie = this.controlJalousie.bind(this);
    this.moveJalousieToFinalPosition = this.moveJalousieToFinalPosition.bind(this);
    this.controlJalousieWithAction = this.controlJalousieWithAction.bind(this);
  }

  controlJalousie = async ({ blockIndex, callback = () => {} }: ControlJalousieProps) => {
    const settings = this.settings[`${this.room}-${blockIndex}`];
    const { percentToSet, finalPosition = 0, rolloType = "Window" } = settings;

    const container = await this.getContainer(blockIndex);
    if (!container) {
      return 0;
    }

    const currentPercent = await getDataPercent(container);
    const steps = percentToSet - currentPercent;
    const isMovingDown = steps > 0;
    const props = {
      blockIndex,
      action: isMovingDown ? "down" : "up",
    };

    console.log(
      `   Control jalousie "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, ${steps} steps`
    );

    if (toPositive(steps) > 0 && percentToSet === 0) {
      await this.clickUpDownOfBlock(props);
    } else if (toPositive(steps) > 3) {
      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getJalousieTiming(rolloType) * 1000);

      // click action to move jalousie
      await this.clickUpDownOfBlock({
        ...props,
        delay,
        doubleClick: true,
        callback: async (afterDoubleClick, upButton, downButton) => {
          await sleep(400);
          if (afterDoubleClick && rolloType !== "Markise") {
            this.moveJalousieToFinalPosition(
              blockIndex,
              finalPosition,
              isMovingDown,
              upButton,
              downButton
            );
          }
          callback(this.room, blockIndex);
        },
      });

      return delay;
    }

    callback(this.room, blockIndex);
    return 0;
  };

  moveJalousieToFinalPosition = async (
    blockIndex: number,
    finalPosition: number,
    isMovingDown: boolean,
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null
  ) => {
    console.log(
      `   Move jalousie blinds "${this.room}:${blockIndex}" to final position "${
        finalPosition === 0 ? "Closed" : finalPosition === 1 ? "Tilted" : "Open"
      }"`
    );

    console.log(`   Click jalousie to move final position...`);
    if (isMovingDown) {
      if (finalPosition === 0) {
        // nothing to do, the blinds are already closed
      } else if (finalPosition === 1) {
        await clickElement(upButton, 400, true);
      } else if (finalPosition === 2) {
        await clickElement(upButton, 900, true);
      }
    } else {
      if (finalPosition === 0) {
        await clickElement(downButton, 1200, true);
      } else if (finalPosition === 1) {
        await clickElement(downButton, 850, true);
      } else if (finalPosition === 2) {
        await clickElement(downButton, 400, true);
      }
    }
  };

  controlJalousieWithAction = async ({
    blockIndex,
    actionUp = "Fully In",
    actionDown = "Fully Out",
    callback = () => {},
  }: ControlJalousieWithActionProps) => {
    const { percentToSet } = this.settings[`${this.room}-${blockIndex}`];
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return 0;
    }

    const currentPercent = await getDataPercent(container, "Fully extended");
    const steps = percentToSet - currentPercent;
    const action = steps > 0 ? actionDown : actionUp;

    console.log(
      `   Control markise "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, ${steps} steps`
    );

    if (toPositive(steps) > 0 && (percentToSet === 0 || percentToSet === 100)) {
      await this.clickActionOfBlock(blockIndex, action);
    } else if (toPositive(steps) > 3) {
      await this.clickActionOfBlock(blockIndex, action);

      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getJalousieTiming("Markise") * 1000);

      // wait until jalousie is in position and stop it by clicking action again
      setTimeout(async () => {
        console.log(`   Stop markise at exact position "${this.room}:${blockIndex}"`);
        await this.clickActionOfBlock(blockIndex, action);
        callback(this.room, blockIndex);
      }, delay);

      return delay;
    }

    callback(this.room, blockIndex);
    return 0;
  };
}
