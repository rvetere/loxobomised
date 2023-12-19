import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";

export class VentilationCommander {
  controller: PuppeteerController;
  category: string;

  constructor(controller: PuppeteerController, category: string) {
    this.controller = controller;
    this.category = category;
  }

  /**
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
   * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
   */
  async run(room: string, blockIndex: string, value: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    console.log(
      `   VentilationCommander.run(${room}, ${blockIndex}, ${value}, ${JSON.stringify(query)})`
    );
    const puppet = new PuppetSimple(this.controller, page, this.category, room, query);
    const ventsToControl = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const promises = ventsToControl.map(async (indexStr: string) => {
      const index = parseInt(indexStr, 10);
      await puppet.clickOverlayActionOfBlock(index, value);
    });
    await Promise.all(promises);
  }
}
