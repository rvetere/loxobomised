import { Page } from "puppeteer";

export class Apartment518Test {
  page: Page;
  category: string;

  constructor(page: Page, category: string) {
    this.page = page;
    this.category = category;
  }

  async run(query: Record<string, any>) {}
}
