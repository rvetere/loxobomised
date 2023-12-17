import { Page } from "puppeteer";
import { clickActionOfTitle } from "src/puppeteer/utils/clickActionOfTitle";

export class Apartment518Test {
  page: Page | null;

  constructor(page: Page | null) {
    this.page = page;
  }

  async run(query: Record<string, any>) {
    await clickActionOfTitle(
      this.page,
      "Küche",
      1,
      query.actionKitchen || "Switch On"
    );
  }
}
