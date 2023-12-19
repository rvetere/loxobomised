import { Page } from "puppeteer";
import { PuppetSimple } from "src/puppeteer/puppet.simple";

export class LightCommander {
  page: Page;
  category: string;

  constructor(page: Page, category: string) {
    this.page = page;
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
    console.log(
      `   LightCommander.run(${room}, ${blockIndex}, ${value}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.page, this.category, room, query);
    const ventsToControl = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const promises = ventsToControl.map(async (indexStr: string) => {
      const index = parseInt(indexStr, 10);
      const valuePercent = parseInt(value, 10);
      if (isNaN(valuePercent)) {
        await puppet.clickToggleOfBlock(index, value);
        return;
      }

      await puppet.clickOverlayPlusMinusOfBlock(index, valuePercent);
    });
    await Promise.all(promises);
  }
}
