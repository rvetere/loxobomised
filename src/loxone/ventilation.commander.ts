import { PuppetVentilation } from "src/puppeteer/puppet.ventilation";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import type { LoxoneCategoryEnum } from "src/types";
import { sleep } from "src/utils/sleep";
import { BaseCommander } from "./base.commander";

export class VentilationCommander extends BaseCommander {
  constructor(controller: PuppeteerController, category: LoxoneCategoryEnum) {
    super(controller, category);
  }

  async run(room: string, blockIndex: string, givenValue: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      throw new Error(`🚨 Puppeteer page not available! 🚨`);
    }

    console.log(
      `🤖 VentilationCommander.run(${room}, ${blockIndex}, ${givenValue}, ${JSON.stringify(query)})`
    );

    const puppet = new PuppetVentilation(this.controller, page, this.category, room, query);
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const values = givenValue.includes(",") ? givenValue.split(",") : [givenValue];
    let i = 0;
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const value = values[index] ? values[index] : values[0];
      await puppet.controlVentilation(index, parseInt(value, 10));
      // are there more blocks to control?
      if (i < blockIndexes.length - 1) {
        // then wait 2 seconds before controlling the next one
        await sleep(2000);
      }
      i++;
    }
  }
}
