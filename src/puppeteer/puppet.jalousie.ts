import { ElementHandle, Page } from "puppeteer";
import { JalousieType, getJalousieTiming } from "./utils/getJalousieTiming";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { sleep } from "src/utils/sleep";
import { PuppetBase } from "./puppet.base";
import { clickElement } from "./utils/clickElement";
import { Logger } from "src/utils/logger";
import { isJalousieActive } from "src/puppeteer/utils/isJalousieActive";

interface ControlJalousieWithActionProps {
  blockIndex: number;
  actionUp?: string;
  actionDown?: string;
  callback?: (room: string, blockIndex: number) => void;
}

type JalousieTilt = 0 | 1 | 2;

export class PuppetJalousie extends PuppetBase {
  constructor(page: Page, category: string, room: string, query: Record<string, any>) {
    super(page, category, room, query);
    this.controlJalousie = this.controlJalousie.bind(this);
    this.moveJalousieToFinalPosition = this.moveJalousieToFinalPosition.bind(this);
    this.controlJalousieWithAction = this.controlJalousieWithAction.bind(this);
  }

  controlJalousie = async (
    blockIndex: number,
    {
      percentToSet,
      tilt = 0,
      jalousieType = "Window",
    }: { percentToSet: number; tilt?: JalousieTilt; jalousieType?: JalousieType },
    callback?: (room: string, blockIndex: number) => void
  ) => {
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

    if (toPositive(steps) > 0 && percentToSet === 0) {
      console.log(
        `   Control jalousie "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}% "${
          tilt === 0 ? "Closed" : tilt === 1 ? "Tilted" : "Open"
        }", no stop timer needed`
      );
      await this.clickUpDownOfBlock(props);
    } else if (toPositive(steps) > 3) {
      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getJalousieTiming(jalousieType) * 1000);
      console.log(
        `   Control jalousie "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}% "${
          tilt === 0 ? "Closed" : tilt === 1 ? "Tilted" : "Open"
        }", wait ${delay}ms to reach position`
      );

      // click action to move jalousie
      await this.clickUpDownOfBlock({
        ...props,
        delay,
        doubleClick: true,
        callback: async (afterDoubleClick, upButton, downButton, container) => {
          await sleep(400);
          if (afterDoubleClick && jalousieType !== "Markise") {
            this.moveJalousieToFinalPosition(
              blockIndex,
              tilt,
              isMovingDown,
              upButton,
              downButton,
              container
            );
          }
          callback?.(this.room, blockIndex);
        },
      });

      return delay;
    }

    callback?.(this.room, blockIndex);
    return 0;
  };

  moveJalousieToFinalPosition = async (
    blockIndex: number,
    tilt: number,
    isMovingDown: boolean,
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null,
    container: ElementHandle<Element> | null
  ) => {
    console.log(
      `   Move jalousie blinds "${this.room}:${blockIndex}" to final position "${
        tilt === 0 ? "Closed" : tilt === 1 ? "Tilted" : "Open"
      }"`
    );

    if (isMovingDown) {
      if (tilt === 0) {
        // nothing to do, the blinds are already closed
      } else if (tilt === 1) {
        await clickElement(upButton, 400, true);
      } else if (tilt === 2) {
        await clickElement(upButton, 900, true);
      }
    } else {
      if (tilt === 0) {
        await clickElement(downButton, 1200, true);
      } else if (tilt === 1) {
        await clickElement(downButton, 850, true);
      } else if (tilt === 2) {
        await clickElement(downButton, 400, true);
      }
    }
    await sleep(400);
    const isActiveNow = await isJalousieActive(container);
    if (isActiveNow) {
      console.error(`   Is still active ❌, final action did not happen, try again!`);
      await sleep(400);
      await this.moveJalousieToFinalPosition(
        blockIndex,
        tilt,
        isMovingDown,
        upButton,
        downButton,
        container
      );
    } else {
      console.error(`   Not active anymore: ✅`);
    }
  };

  controlJalousieWithAction = async (
    blockIndex: number,
    percentToSet: number,
    callback: (room: string, blockIndex: number) => void = () => {}
  ) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return 0;
    }

    const currentPercent = await getDataPercent(container, "Fully extended");
    const steps = percentToSet - currentPercent;
    const action = steps > 0 ? "Fully Out" : "Fully In";

    if (toPositive(steps) > 0 && (percentToSet === 0 || percentToSet === 100)) {
      console.log(
        `   Control markise "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, no stop timer needed`
      );
      await this.clickOverlayActionOfBlock(blockIndex, action);
    } else if (toPositive(steps) > 3) {
      await this.clickOverlayActionOfBlock(blockIndex, action);

      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getJalousieTiming("Markise") * 1000);
      console.log(
        `   Control markise "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, wait ${delay}ms to reach position`
      );

      // wait until jalousie is in position and stop it by clicking action again
      setTimeout(async () => {
        console.log(`   Stop markise at exact position "${this.room}:${blockIndex}"`);
        await this.clickOverlayActionOfBlock(blockIndex, action);
        callback(this.room, blockIndex);
      }, delay);

      return delay;
    }

    callback(this.room, blockIndex);
    return 0;
  };
}
