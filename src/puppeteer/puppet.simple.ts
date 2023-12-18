import { Page } from "puppeteer";
import { PuppetBase } from "./puppet.base";

export class PuppetSimple extends PuppetBase {
  constructor(page: Page, room: string, query: Record<string, any>) {
    super(page, room, query);
  }
}
