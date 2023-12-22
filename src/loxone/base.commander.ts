import { PuppetSimple } from "src/puppeteer/puppet.simple";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { LoxoneCategoryEnum } from "src/types";

export class BaseCommander {
  controller: PuppeteerController;
  category: LoxoneCategoryEnum;

  constructor(controller: PuppeteerController, category: LoxoneCategoryEnum) {
    this.controller = controller;
    this.category = category;
    this.getState = this.getState.bind(this);
  }

  async getState(room: string, blockIndex: string) {
    const page = this.controller.getPage();
    if (!page) {
      throw new Error(`🚨 Puppeteer page not available! 🚨`);
    }

    const puppet = new PuppetSimple(this.controller, page, this.category, room, {});
    const index = parseInt(blockIndex, 10);
    switch (this.category) {
      case LoxoneCategoryEnum.light: {
        const state = await puppet.getLightStateOfBlock(index);
        return state;
      }
      case LoxoneCategoryEnum.ventilation: {
        const state = await puppet.getVentilationStateOfBlock(index);
        return state;
      }
      case LoxoneCategoryEnum.jalousie: {
        const state = await puppet.getJalousieStateOfBlock(index);
        return state;
      }
      default:
        return false;
    }
  }
}
