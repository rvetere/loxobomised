import { ElementHandle, Page } from "puppeteer";
import { JalousieType, getJalousieTiming } from "./utils/getJalousieTiming";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { sleep } from "src/utils/sleep";
import { PuppetBase } from "./puppet.base";
import { clickElement } from "./utils/clickElement";
import { isJalousieActive } from "src/puppeteer/utils/isJalousieActive";
import { PuppeteerController } from "./puppeteer.controller";
import { getBlindTiltPosition } from "./utils/getBlindTiltPosition";
import { getUpDownElement } from "./utils/getUpDownElement";

interface ControlJalousieWithActionProps {
  blockIndex: number;
  actionUp?: string;
  actionDown?: string;
  callback?: (room: string, blockIndex: number) => void;
}

type JalousieTilt = 0 | 1 | 2;

export class PuppetJalousie extends PuppetBase {
  constructor(
    controller: PuppeteerController,
    page: Page,
    category: string,
    room: string,
    query: Record<string, any>
  ) {
    super(controller, page, category, room, query);
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
    activeTimer: NodeJS.Timeout | undefined,
    callback?: (room: string, blockIndex: number) => void
  ) => {
    let timer: NodeJS.Timeout | null = null;
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return { delay: 0, timer };
    }
    await this.stopIfStillMoving(blockIndex, activeTimer);

    const currentPercent = await getDataPercent(container);

    const steps = percentToSet - currentPercent;
    const isMovingDown = steps > 0;
    const props = {
      blockIndex,
      action: isMovingDown ? "down" : "up",
    };

    const stepsToTarget = toPositive(steps);

    if (stepsToTarget > 0 && percentToSet === 0) {
      console.log(
        `🕹️ Move jalousie "${this.room}:${blockIndex}" fully up from ${currentPercent}% -> ${percentToSet}%, no stop timer needed`
      );
      await this.clickUpDownOfBlock(props);
    } else if (stepsToTarget > 3) {
      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(stepsToTarget * getJalousieTiming(jalousieType) * 1000);
      console.log(
        `🕹️ Control jalousie "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}% "${
          tilt === 0 ? "Closed" : tilt === 1 ? "Tilted" : "Open"
        }", wait ${delay}ms to reach position`
      );

      // click action to move jalousie
      timer = await this.clickUpDownOfBlock({
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
      return { delay, timer };
    } else {
      console.log(
        `👍 Control jalousie "${this.room}:${blockIndex}" nothing to do, we are already at the target position`
      );
      this.checkBlindsPosition(container, tilt);
    }

    callback?.(this.room, blockIndex);
    return { delay: 0, timer };
  };

  stopIfStillMoving = async (
    blockIndex: number,
    activeTimer: NodeJS.Timeout | undefined,
    type: "jalousie" | "markise" = "jalousie"
  ) => {
    const container = await this.getContainer(blockIndex);
    const isActiveNow = await isJalousieActive(container);
    if (isActiveNow) {
      console.log(
        `🚨 ${type === "jalousie" ? "Jalousie" : "Markise"} still moving, stop first "${
          this.room
        }:${blockIndex}"`
      );
      if (activeTimer) {
        console.log(`   Clear active timer of last job`);
        clearTimeout(activeTimer);
      }
      if (type === "jalousie") {
        await this.clickUpDownOfBlock({
          blockIndex,
          action: "up",
          delay: 800,
        });
      } else {
        await this.clickOverlayActionOfBlock(blockIndex, "In");
      }
    }
  };

  controlJalousieWithAction = async (
    blockIndex: number,
    percentToSet: number,
    activeTimer: NodeJS.Timeout | undefined,
    callback: (room: string, blockIndex: number) => void = () => {}
  ) => {
    let timer: NodeJS.Timeout | null = null;
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return { delay: 0 };
    }
    await this.stopIfStillMoving(blockIndex, activeTimer);

    const currentPercent = await getDataPercent(container, "Fully extended");
    const steps = percentToSet - currentPercent;
    const action = steps > 0 ? "Fully Out" : "Fully In";

    if (toPositive(steps) > 0 && (percentToSet === 0 || percentToSet === 100)) {
      console.log(
        `🕹️ Control markise "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, no stop timer needed`
      );
      let isActiveNow = await this.clickOverlayActionOfBlock(blockIndex, action);
      console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);
      if (!isActiveNow) {
        await sleep(1500);
        isActiveNow = await this.clickOverlayActionOfBlock(blockIndex, action);
        console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);
      }
    } else if (toPositive(steps) > 3) {
      let isActiveNow = await this.clickOverlayActionOfBlock(blockIndex, action);
      console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);
      if (!isActiveNow) {
        await sleep(1500);
        isActiveNow = await this.clickOverlayActionOfBlock(blockIndex, action);
        console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);
      }

      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(toPositive(steps) * getJalousieTiming("Markise") * 1000);
      console.log(
        `🕹️ Control markise "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, wait ${delay}ms to reach position`
      );

      // wait until jalousie is in position and stop it by clicking action again
      timer = setTimeout(async () => {
        console.log(`🕹️ Stop markise at exact position "${this.room}:${blockIndex}"`);
        const isActiveNow = await this.clickOverlayActionOfBlock(blockIndex, action);
        console.log(`   hasStopped: ${!isActiveNow ? "✅" : "❌"}`);
        callback(this.room, blockIndex);
      }, delay);

      return { delay, timer };
    }

    callback(this.room, blockIndex);
    return { delay: 0, timer };
  };

  moveJalousieToFinalPosition = async (
    blockIndex: number,
    givenTilt: number | string,
    isMovingDown: boolean,
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null,
    container: ElementHandle<Element> | null,
    reTryCounter = 0
  ) => {
    const tilt = typeof givenTilt === "string" ? parseInt(givenTilt, 10) : givenTilt;
    console.log(`🕹️ Move jalousie blinds "${this.room}:${blockIndex}" to final position "${tilt}"`);

    const isActiveNow_ = await isJalousieActive(container);

    if (isMovingDown) {
      if (isActiveNow_) {
        await clickElement(downButton);
      }
      if (tilt === 0) {
        console.log(`👍 Nothing to do, the blinds are already closed`);
        return;
      } else if (tilt === 1) {
        console.log(`🕹️ Double click "up" button with delay of 400ms (tilt=${tilt})})`);
        await clickElement(upButton, 280, true);
      } else if (tilt === 2) {
        console.log(`🕹️ Double click "up" button with delay of 900ms (tilt=${tilt})})`);
        await clickElement(upButton, 900, true);
      }
    } else {
      if (isActiveNow_) {
        await clickElement(upButton);
      }
      if (tilt === 0) {
        console.log(`🕹️ Double click "down" button with delay of 1200ms (tilt=${tilt})})`);
        await clickElement(downButton, 1200, true);
      } else if (tilt === 1) {
        console.log(`🕹️ Double click "down" button with delay of 850ms (tilt=${tilt})})`);
        await clickElement(downButton, 850, true);
      } else if (tilt === 2) {
        console.log(`🕹️ Double click "down" button with delay of 400ms (tilt=${tilt})})`);
        await clickElement(downButton, 400, true);
      }
    }
    await sleep(1500);
    const isActiveNow = await isJalousieActive(container);
    if (isActiveNow) {
      if (reTryCounter === 0) {
        console.error(`❌ Jalousie is still active - try again!`);
        await sleep(400);
        await this.moveJalousieToFinalPosition(
          blockIndex,
          tilt,
          isMovingDown,
          upButton,
          downButton,
          container,
          1
        );
      }
    } else {
      console.log(`✅ Job finished successfully, jalousie not moving anymore`);
    }
  };

  checkBlindsPosition = async (container: ElementHandle<Node>, givenTilt: number) => {
    const currentPosition = await getBlindTiltPosition(container);
    let tilt = givenTilt;
    if (typeof givenTilt === "string") {
      tilt = parseInt(givenTilt, 10);
    }

    if (currentPosition !== tilt) {
      console.log(`🕹️ Set blinds tilt position (tilt=${tilt})})`);
      const { upButton, downButton } = await getUpDownElement(container);

      switch (currentPosition) {
        case 0:
          {
            if (tilt === 1) {
              await clickElement(upButton, 280, true);
            } else if (tilt === 2) {
              await clickElement(upButton, 900, true);
            }
          }
          break;
        case 1:
          {
            if (tilt === 0) {
              await clickElement(downButton, 700, true);
            } else if (tilt === 2) {
              await clickElement(upButton, 500, true);
            }
          }
          break;
        case 2:
          {
            if (tilt === 0) {
              await clickElement(downButton, 1000, true);
            } else if (tilt === 1) {
              await clickElement(downButton, 500, true);
            }
          }
          break;
      }
    }
  };
}
