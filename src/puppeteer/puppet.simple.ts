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
    this.getVentStateOfBlock = this.getVentStateOfBlock.bind(this);
  }

  getStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const greenButtons = await container?.$x(
      "//div[contains(@style,'background-color: rgb(105, 195, 80);')]"
    );
    return Boolean(greenButtons?.length);
  };

  getVentStateOfBlock = async (blockIndex: number) => {
    const container = await this.getContainer(blockIndex);
    const texts = await container?.$$eval("div", (divs) => divs.map((div) => div.innerText));
    const lastOne = texts?.filter((t) => t !== "")?.pop();
    return lastOne === "Aus" ? false : true;
  };
}
