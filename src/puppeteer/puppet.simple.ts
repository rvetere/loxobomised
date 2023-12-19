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
  }
}
