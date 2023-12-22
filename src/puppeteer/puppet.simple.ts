import type { Page } from "puppeteer";
import type { LoxoneCategoryEnum } from "src/types";
import { PuppetBase } from "./puppet.base";
import { PuppeteerController } from "./puppeteer.controller";
import { getDataPercent } from "./utils/getDataPercent";

export class PuppetSimple extends PuppetBase {
  constructor(
    controller: PuppeteerController,
    page: Page,
    category: LoxoneCategoryEnum,
    room: string,
    query: Record<string, any>
  ) {
    super(controller, page, category, room, query);
    this.getLightStateOfBlock = this.getLightStateOfBlock.bind(this);
    this.getVentilationStateOfBlock = this.getVentilationStateOfBlock.bind(this);
  }

  getLightStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const greenButtons = await container?.$x(
      "//div[contains(@style,'background-color: rgb(105, 195, 80);')]"
    );
    return Boolean(greenButtons?.length);
  };

  getVentilationStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const texts = await container?.$$eval("div", (divs) => divs.map((div) => div.innerText));
    const lastOne = texts?.filter((t) => t !== "")?.pop();
    return lastOne === "Aus" ? false : true;
  };

  getJalousieStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const currentPercent = container ? await getDataPercent(container) : 0;
    return currentPercent > 0;
  };
}
