import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";

export class BaseCommander {
  controller: PuppeteerController;
  category: string;

  constructor(controller: PuppeteerController, category: string) {
    this.controller = controller;
    this.category = category;
    this.getState = this.getState.bind(this);
  }

  async getState(room: string, blockIndex: string) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    const puppet = new PuppetSimple(this.controller, page, this.category, room, {});
    const index = parseInt(blockIndex, 10);
    if (this.category === "Lüftung") {
      const state = await puppet.getVentStateOfBlock(index);
      return state;
    }

    const state = await puppet.getStateOfBlock(index);
    return state;
  }
}
