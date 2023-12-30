import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import type { LoxoneCategoryEnum } from "src/types";
import { sleep } from "src/utils/sleep";
import { BaseCommander } from "./base.commander";

export class LightCommander extends BaseCommander {
  constructor(controller: PuppeteerController, category: LoxoneCategoryEnum) {
    super(controller, category);
  }

  async run(room: string, blockIndex: string, givenValue: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      throw new Error(`🚨 Puppeteer page not available! 🚨`);
    }

    console.log(
      `🤖 LightCommander.run(${room}, ${blockIndex}, ${givenValue}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.controller, page, this.category, room, query);
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const values = givenValue.includes(",") ? givenValue.split(",") : [givenValue];
    let i = 0;
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const value = values[index] ? values[index] : values[0];
      const valuePercent = parseInt(value, 10);
      if (isNaN(valuePercent)) {
        await puppet.clickToggleOfBlock(index, value);
        return;
      }

      await puppet.clickOverlayPlusMinusOfBlock(index, valuePercent);
      // are there more blocks to control?
      if (i < blockIndexes.length - 1) {
        // then wait 2 seconds before controlling the next one
        await sleep(2000);
      }
      i++;
    }
  }
}
