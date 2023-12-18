import { Page } from "puppeteer";

/**
 * //div[contains(@style,'background-color: rgb(32, 32, 32);')]
 * //div[contains(@style,'background-color: rgb(105, 195, 80);')]
 *
 */
export class LightCommander {
  page: Page;
  category: string;

  constructor(page: Page, category: string) {
    this.page = page;
    this.category = category;
  }
}
