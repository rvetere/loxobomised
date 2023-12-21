import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { sleep } from "src/utils/sleep";
import { BaseCommander } from "./base.commander";

export class VentilationCommander extends BaseCommander {
  constructor(controller: PuppeteerController, category: string) {
    super(controller, category);
  }

  async run(room: string, blockIndex: string, givenValue: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    console.log(
      `🤖 VentilationCommander.run(${room}, ${blockIndex}, ${givenValue}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.controller, page, this.category, room, query);
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const values = givenValue.includes(",") ? givenValue.split(",") : [givenValue];
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const value = values[index] ? values[index] : values[0];
      await puppet.clickOverlayActionOfBlock(index, value, false, "Lüfter");
      await sleep(2000);
    }
  }
}
