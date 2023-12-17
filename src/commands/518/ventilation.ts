import { Page } from "puppeteer";
import { clickActionOfTitle } from "src/puppeteer/utils/clickActionOfTitle";

export class FiveEightTheenVentilation {
  page: Page | null;
  query: Record<string, any>;

  constructor(page: Page | null, query: Record<string, any>) {
    this.page = page;
    this.query = query;
  }

  /**
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
   * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
   */
  async run() {
    if (!!this.query.withBedroom) {
      await clickActionOfTitle(
        this.page,
        "Zimmer 1",
        1,
        this.query.setBedroom || "Stufe 1",
      );
    }

    if (!!this.query.withLivingroom) {
      await clickActionOfTitle(
        this.page,
        "Wohnzimmer",
        1,
        this.query.setLivingroom || "Stufe 1",
      );
    }
  }
}
