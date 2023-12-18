import { Page } from "puppeteer";
import { PuppetSimple } from "src/puppeteer/puppet.simple";

export class Apartment518Ventilation {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus
   * http://localhost:9002/exec/518/ventilation?withLivingroom=1&setLivingroom=Aus
   * http://localhost:9002/exec/518/ventilation?withBedroom=1&setBedroom=Aus&withLivingroom=1&setLivingroom=Aus
   */
  async run(query: Record<string, any>) {
    const puppetLivingroom = new PuppetSimple(this.page, "Wohnzimmer", query);
    const puppetBedroom = new PuppetSimple(this.page, "Zimmer 1", query);

    if (!!query.withBedroom) {
      await puppetBedroom.clickActionOfBlock(1, query.setBedroom || "Stufe 1");
    }

    if (!!query.withLivingroom) {
      await puppetLivingroom.clickActionOfBlock(
        1,
        query.setLivingroom || "Stufe 1"
      );
    }
  }
}
