import { Page } from "puppeteer";
import { Logger } from "src/utils/logger";
import { sleep } from "src/utils/sleep";
import { PuppetBase } from "./puppet.base";
import { PuppeteerController } from "./puppeteer.controller";
import { clickElement } from "./utils/clickElement";
import { getPlusOrMinusElement } from "./utils/getPlusOrMinusElement";
import { getVentilationLevel } from "./utils/getVentilationLevel";

export class PuppetVentilation extends PuppetBase {
  constructor(
    controller: PuppeteerController,
    page: Page,
    category: string,
    room: string,
    query: Record<string, any>
  ) {
    super(controller, page, category, room, query);
    this.controlVentilation = this.controlVentilation.bind(this);
  }

  controlVentilation = async (blockIndex: number, newLevel: number) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return;
    }

    const currentLevel = await getVentilationLevel(container);
    if (currentLevel === newLevel) {
      console.log(`👍 Ventilation already at ${newLevel}!`);
      return;
    }

    let targetReached = false;
    const actionButton = await getPlusOrMinusElement(
      container,
      currentLevel < newLevel ? "plus" : "minus"
    );

    while (!targetReached) {
      Logger.log(`   Click action of clickOverlayPlusMinusOfBlock...`);
      await clickElement(actionButton, 500);
      await sleep(500);
      const currentLevel = await getVentilationLevel(container);
      targetReached = currentLevel === newLevel;
    }
  };
}
