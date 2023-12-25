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
    this.getStateOfBlock = this.getStateOfBlock.bind(this);
  }

  async getState(room: string, blockIndex: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      throw new Error(`🚨 Puppeteer page not available! 🚨`);
    }

    const puppet = new PuppetSimple(this.controller, page, this.category, room, {});
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const allStates: boolean[] = [];
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const state = await this.getStateOfBlock(puppet, index);
      allStates.push(state);
    }
    if (allStates.length === 1) {
      return allStates[0];
    }

    if (!!query.mode && query.mode === "or") {
      return allStates.some((state) => state);
    }

    return allStates.every((state) => state);
  }

  async getStateOfBlock(puppet: PuppetSimple, index: number) {
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
