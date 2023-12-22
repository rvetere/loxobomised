import type { ElementHandle, Page } from "puppeteer";
import { getJalousieTiming } from "./utils/getJalousieTiming";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { sleep } from "src/utils/sleep";
import { PuppetBase } from "./puppet.base";
import { clickElement } from "./utils/clickElement";
import { isJalousieActive } from "src/puppeteer/utils/isJalousieActive";
import { PuppeteerController } from "./puppeteer.controller";
import { getBlindTiltPosition } from "./utils/getBlindTiltPosition";
import { getUpDownElement } from "./utils/getUpDownElement";
import type { JalousieTilt, JalousieTimingVariant, JalousieType } from "src/types";
import { Logger } from "src/utils/logger";
import { clickButtonByText } from "./utils/clickButtonByText";
import { getButtonElementByText } from "./utils/getButtonElementByText";

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
    this.clickOverlayActionOfBlock = this.clickOverlayActionOfBlock.bind(this);
    this.controlAwningWithOverlayAction = this.controlAwningWithOverlayAction.bind(this);
    this.stopIfStillMoving = this.stopIfStillMoving.bind(this);
    this.moveJalousieToFinalPosition = this.moveJalousieToFinalPosition.bind(this);
    this.checkBlindsPosition = this.checkBlindsPosition.bind(this);
  }

  clickOverlayActionOfBlock = async (blockIndex: number, action: string, doubleClick = false) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return;
    }
    await clickButtonByText(this.page, `Markise ${blockIndex}`);

    // click action
    const actionButton = await getButtonElementByText(this.page, action);
    Logger.log(`   Click action of clickOverlayActionOfBlock...`);
    await clickElement(actionButton, 500, doubleClick);

    await this.closeOverlay();
    const isActiveNow = await isJalousieActive(container);
    return isActiveNow;
  };

  controlJalousie = async (
    blockIndex: number,
    {
      percentToSet,
      tilt = "closed",
      jalousieType = "window",
    }: { percentToSet: number; tilt?: JalousieTilt; jalousieType?: JalousieTimingVariant },
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
    const targetIsFullyDown = percentToSet === 0 || (percentToSet === 100 && tilt === "closed");
    if (stepsToTarget > 0 && targetIsFullyDown) {
      console.log(
        `🕹️ Move jalousie "${this.room}:${blockIndex}" fully up/down from ${currentPercent}% -> ${percentToSet}% (${tilt}), no stop timer needed`
      );
      await this.clickUpDownOfBlock(props);
    } else if (stepsToTarget > 3) {
      // calculate exact delay to reach "percentToSet"
      const delay = Math.floor(stepsToTarget * getJalousieTiming(jalousieType) * 1000);
      console.log(
        `🕹️ Control jalousie "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}% "${tilt}", wait ${delay}ms to reach position`
      );

      // click action to move jalousie
      timer = await this.clickUpDownOfBlock({
        ...props,
        delay,
        doubleClick: true,
        callback: async (afterDoubleClick, upButton, downButton, container) => {
          await sleep(400);
          if (afterDoubleClick && jalousieType !== "awning") {
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
    type: JalousieType = "jalousie"
  ) => {
    const container = await this.getContainer(blockIndex);
    const isActiveNow = await isJalousieActive(container);
    if (isActiveNow) {
      console.log(
        `🚨 ${type === "jalousie" ? "Jalousie" : "Awning"} still moving, stop first "${
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

  controlAwningWithOverlayAction = async (
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
    await this.stopIfStillMoving(blockIndex, activeTimer, "awning");

    const currentPercent = await getDataPercent(container, "Fully extended");
    const steps = percentToSet - currentPercent;
    const action = steps > 0 ? "Fully Out" : "Fully In";

    if (toPositive(steps) > 0 && (percentToSet === 0 || percentToSet === 100)) {
      console.log(
        `🕹️ Control awning "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, no stop timer needed`
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
      const delay = Math.floor(toPositive(steps) * getJalousieTiming("awning") * 1000);
      console.log(
        `🕹️ Control awning "${this.room}:${blockIndex}" ${currentPercent}% -> ${percentToSet}%, wait ${delay}ms to reach position`
      );

      // wait until jalousie is in position and stop it by clicking action again
      timer = setTimeout(async () => {
        console.log(`🕹️ Stop awning at exact position "${this.room}:${blockIndex}"`);
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
    tilt: JalousieTilt,
    isMovingDown: boolean,
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null,
    container: ElementHandle<Element> | null,
    reTryCounter = 0
  ) => {
    console.log(`🕹️ Move jalousie blinds "${this.room}:${blockIndex}" to final position "${tilt}"`);

    const isActiveNow_ = await isJalousieActive(container);

    if (isMovingDown) {
      if (isActiveNow_) {
        await clickElement(downButton);
      }
      if (tilt === "closed") {
        console.log(`👍 Nothing to do, the blinds are already closed`);
        return;
      } else if (tilt === "tilted") {
        console.log(`🕹️ Double click "up" button with delay of 400ms (tilt=${tilt})})`);
        await clickElement(upButton, 300, true);
      } else if (tilt === "open") {
        console.log(`🕹️ Double click "up" button with delay of 900ms (tilt=${tilt})})`);
        await clickElement(upButton, 900, true);
      }
    } else {
      if (isActiveNow_) {
        await clickElement(upButton);
      }
      if (tilt === "closed") {
        console.log(`🕹️ Double click "down" button with delay of 1200ms (tilt=${tilt})})`);
        await clickElement(downButton, 1000, true);
      } else if (tilt === "tilted") {
        console.log(`🕹️ Double click "down" button with delay of 850ms (tilt=${tilt})})`);
        await clickElement(downButton, 500, true);
      } else if (tilt === "open") {
        console.log(`🕹️ Double click "down" button with delay of 400ms (tilt=${tilt})})`);
        await clickElement(downButton, 280, true);
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

  checkBlindsPosition = async (container: ElementHandle<Node>, tilt: JalousieTilt) => {
    const currentTilt = await getBlindTiltPosition(container);

    if (currentTilt !== tilt) {
      console.log(`🕹️ Set blinds tilt position (tilt=${tilt})})`);
      const { upButton, downButton } = await getUpDownElement(container);

      switch (currentTilt) {
        case "closed":
          {
            if (tilt === "tilted") {
              await clickElement(upButton, 280, true);
            } else if (tilt === "open") {
              await clickElement(upButton, 900, true);
            }
          }
          break;
        case "tilted":
          {
            if (tilt === "closed") {
              await clickElement(downButton, 700, true);
            } else if (tilt === "open") {
              await clickElement(upButton, 500, true);
            }
          }
          break;
        case "open":
          {
            if (tilt === "closed") {
              await clickElement(downButton, 1000, true);
            } else if (tilt === "tilted") {
              await clickElement(downButton, 500, true);
            }
          }
          break;
      }
    }
  };
}
