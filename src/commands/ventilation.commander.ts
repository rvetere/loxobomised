import { Page } from "puppeteer";
import { PuppetSimple } from "src/puppeteer/puppet.simple";

export class VentilationCommander {
  page: Page;
  category: string;

  constructor(page: Page, category: string) {
    this.page = page;
    this.category = category;
  }

  /**
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
   * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
   */
  async run(room: string, blockIndex: string, value: string, query: Record<string, any>) {
    console.log(
      `   VentilationCommander.run(${room}, ${blockIndex}, ${value}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.page, this.category, room, query);
    const ventsToControl = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const promises = ventsToControl.map(async (indexStr: string) => {
      const index = parseInt(indexStr, 10);
      await puppet.clickOverlayActionOfBlock(index, value);
    });
    await Promise.all(promises);
  }
}
