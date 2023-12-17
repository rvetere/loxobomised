import { Page } from "puppeteer";
import { clickActionOfTitle } from "src/puppeteer/utils/clickActionOfTitle";

export class FiveEightTheenTest {
  page: Page | null;
  query: Record<string, any>;

  constructor(page: Page | null, query: Record<string, any>) {
    this.page = page;
    this.query = query;
  }

  async run() {
    await clickActionOfTitle(
      this.page,
      "Küche",
      1,
      this.query.actionKitchen || "Switch On",
    );
  }
}
