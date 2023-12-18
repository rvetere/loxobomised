import { ElementHandle, Page } from "puppeteer";
import { RolloType, getTiming } from "./utils/jalousieTiming";
import { getContainer } from "./utils/getContainer";
import { getDataPercent } from "./utils/getDataPercent";
import { clickUpDownOfTitle } from "./utils/clickUpDownOfTitle";
import { toPositive } from "src/utils/toPositive";
import { sleep } from "src/utils/sleep";
import { clickButton } from "./utils/clickButton";
import { clickActionOfTitle } from "./utils/clickActionOfTitle";

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

export class PuppetJalousie {
  page: Page | null;
  room: string;
  query: Record<string, any>;
  settings: {
    [key: string]: {
      percentToSet: number;
      finalPosition?: number;
      rolloType?: RolloType;
    };
  };

  constructor(page: Page | null, room: string, query: Record<string, any>) {
    this.page = page;
    this.room = room;
    this.query = query;
    this.settings = {
      ["Wohnzimmer-2"]: {
        percentToSet: parseInt(query.percent2 || "66", 10),
        finalPosition: parseInt(query.finalPosition2 || "1", 10),
      },
      ["Wohnzimmer-3"]: {
        percentToSet: parseInt(query.percent3 || "72", 10),
        finalPosition: parseInt(query.finalPosition3 || "1", 10),
      },
      ["Wohnzimmer-4"]: {
        percentToSet: parseInt(query.percent4 || "100", 10),
        finalPosition: parseInt(query.finalPosition4 || "2", 10),
        rolloType: "Loggia",
      },
      ["Küche-1"]: {
        percentToSet: parseInt(query.kcPercent || "72", 10),
        finalPosition: parseInt(query.kcFinalPosition || "1", 10),
      },
      ["Zimmer 1-1"]: {
        percentToSet: parseInt(query.brPercent || "45", 10),
        finalPosition: parseInt(query.brFinalPosition || "1", 10),
      },
      ["Loggia-1"]: {
        percentToSet: parseInt(query.lgPercent1 || "50", 10),
      },
      ["Loggia-2"]: {
        percentToSet: parseInt(query.lgPercent2 || "33", 10),
      },
    };
    this.controlJalousie = this.controlJalousie.bind(this);
    this.moveJalousieToFinalPosition =
      this.moveJalousieToFinalPosition.bind(this);
  }

  controlJalousie = async ({
    blockIndex,
    callback = () => {},
  }: ControlJalousieProps) => {
    const {
      percentToSet,
      finalPosition = 0,
      rolloType = "Window",
    } = this.settings[`${this.room}-${blockIndex}`];

    const container = await getContainer(this.page, this.room, blockIndex);
    if (!container) {
      return 0;
    }

    const currentPercent = await getDataPercent(container);
    const steps = percentToSet - currentPercent;
    const isMovingDown = steps > 0;
    const props = {
      page: this.page,
      title: this.room,
      blockIndex,
      action: isMovingDown ? "down" : "up",
    };

    console.log("   Run controlJalousie", {
      room: `${this.room} [${blockIndex}]`,
      steps,
    });

    if (percentToSet === 0) {
      await clickUpDownOfTitle(props);
    } else if (toPositive(steps) > 3) {
      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getTiming(rolloType) * 1000);

      // click action to move jalousie
      await clickUpDownOfTitle({
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
      `   Move jalousie (${this.room}) [${blockIndex}] to final position (tilted=${finalPosition};isMovingDown=${isMovingDown}))`
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
  };

  controlJalousieWithAction = async ({
    blockIndex,
    actionUp = "Fully In",
    actionDown = "Fully Out",
    callback = () => {},
  }: ControlJalousieWithActionProps) => {
    const { percentToSet } = this.settings[`${this.room}-${blockIndex}`];
    const container = await getContainer(this.page, this.room, blockIndex);
    if (!container) {
      return 0;
    }

    const currentPercent = await getDataPercent(container, "Fully extended");
    const steps = percentToSet - currentPercent;
    const action = steps > 0 ? actionDown : actionUp;

    console.log("   Run controlJalousieWithAction", {
      room: `${this.room} [${blockIndex}]`,
      steps,
    });

    if (percentToSet === 0) {
      await clickActionOfTitle(this.page, this.room, blockIndex, action);
    } else if (toPositive(steps) > 3) {
      await clickActionOfTitle(this.page, this.room, blockIndex, action);

      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getTiming("Markise") * 1000);

      // wait until jalousie is in position
      setTimeout(async () => {
        console.log(`   Run stopAndMoveToFinalPosition (${blockIndex})`);
        await clickActionOfTitle(this.page, this.room, blockIndex, action);
        callback(this.room, blockIndex);
      }, delay);

      return delay;
    }

    callback(this.room, blockIndex);
    return 0;
  };
}
