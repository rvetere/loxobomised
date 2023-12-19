import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { sleep } from "src/utils/sleep";

export class LightCommander {
  controller: PuppeteerController;
  category: string;

  constructor(controller: PuppeteerController, category: string) {
    this.controller = controller;
    this.category = category;
  }

  /**
   * http://localhost:9000/exec/518/light?withKitchen=1&percentKitchen=40
   * http://localhost:9000/exec/518/light?withKitchenHeadlights=1&actionKitchen=Switch Off
   * http://localhost:9000/exec/518/light?withEntrance=1&actionEntrance=Switch Off
   * http://localhost:9000/exec/518/light?withLoggia=1&actionLoggia=Switch Off
   * http://localhost:9000/exec/518/light?withBathroom=1&percentBathroom=100
   * http://localhost:9000/exec/518/light?withBathroomHeadlights=1&actionBathroom=Switch Off
   *
   */
  async run(room: string, blockIndex: string, value: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    console.log(
      `   LightCommander.run(${room}, ${blockIndex}, ${value}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.controller, page, this.category, room, query);
    const ventsToControl = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    for (const indexStr of ventsToControl) {
      const index = parseInt(indexStr, 10);
      const valuePercent = parseInt(value, 10);
      if (isNaN(valuePercent)) {
        await puppet.clickToggleOfBlock(index, value);
        return;
      }

      await puppet.clickOverlayPlusMinusOfBlock(index, valuePercent);
      await sleep(2000);
    }
  }
}
