import { Page } from "puppeteer";
import { clickActionOfTitle } from "src/puppeteer/utils/clickActionOfTitle";

export class Apartment518Ventilation {
  page: Page | null;

  constructor(page: Page | null) {
    this.page = page;
  }

  /**
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
   * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
   */
  async run(query: Record<string, any>) {
    if (!!query.withBedroom) {
      await clickActionOfTitle(
        this.page,
        "Zimmer 1",
        1,
        query.setBedroom || "Stufe 1"
      );
    }

    if (!!query.withLivingroom) {
      await clickActionOfTitle(
        this.page,
        "Wohnzimmer",
        1,
        query.setLivingroom || "Stufe 1"
      );
    }
  }
}
