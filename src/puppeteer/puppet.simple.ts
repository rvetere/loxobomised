import { Page } from "puppeteer";
import { PuppetBase } from "./puppet.base";

export class PuppetSimple extends PuppetBase {
  constructor(page: Page, category: string, room: string, query: Record<string, any>) {
    super(page, category, room, query);
  }
}
