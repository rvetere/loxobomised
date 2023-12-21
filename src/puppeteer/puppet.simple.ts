import { Page } from "puppeteer";
import { PuppetBase } from "./puppet.base";
import { PuppeteerController } from "./puppeteer.controller";

export class PuppetSimple extends PuppetBase {
  constructor(
    controller: PuppeteerController,
    page: Page,
    category: string,
    room: string,
    query: Record<string, any>
  ) {
    super(controller, page, category, room, query);
    this.getStateOfBlock = this.getStateOfBlock.bind(this);
  }

  getStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const greenButtons = await container?.$x(
      "//div[contains(@style,'background-color: rgb(105, 195, 80);')]"
    );
    return Boolean(greenButtons?.length);
  };
}
