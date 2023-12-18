import { Page } from "puppeteer";
import { PuppetSimple } from "src/puppeteer/puppet.simple";

export class Apartment518Light {
  page: Page;
  category: string;

  constructor(page: Page, category: string) {
    this.page = page;
    this.category = category;
  }

  /**
   * http://localhost:9000/exec/518/light?withKitchen=1&percentKitchen=40
   * http://localhost:9000/exec/518/light?withKitchenHeadlights=1&actionKitchen=Switch Off
   * http://localhost:9000/exec/518/light?withEntrance=1&actionEntrance=Switch Off
   * http://localhost:9000/exec/518/light?withLoggia=1&actionLoggia=Switch Off
   * http://localhost:9000/exec/518/light?withBathroom=1&percentBathroom=100
   * http://localhost:9000/exec/518/light?withBathroomHeadlights=1&actionBathroom=Switch Off
   *
   */
  async run(query: Record<string, any>) {
    const puppetKitchen = new PuppetSimple(this.page, this.category, "Küche", query);
    const puppetEntrance = new PuppetSimple(this.page, this.category, "Entrée", query);
    const puppetLoggia = new PuppetSimple(this.page, this.category, "Loggia", query);
    const puppetBathroom = new PuppetSimple(this.page, this.category, "WC-Dusche", query);

    // 1. Kitchen Headlights
    if (!!query.withKitchenHeadlights) {
      // Turn off head lights
      await puppetKitchen.clickActionOfBlock(1, query.actionKitchen || "Switch On");
    }

    // 2. Kitchen
    if (!!query.withKitchen) {
      // Set spots to a dimmed level
      let percentStr = query.percentKitchen || "40";
      let percent = parseInt(percentStr, 10);
      if (!isNaN(percent)) {
        await puppetKitchen.clickPlusMinusOfBlock(2, percent);
      } else {
        await puppetKitchen.clickActionOfBlock(2, percentStr);
      }
    }

    // 3. Entrance
    if (!!query.withEntrance) {
      await puppetEntrance.clickActionOfBlock(1, query.actionEntrance || "Switch On");
    }

    // 4. Loggia
    if (!!query.withLoggia) {
      await puppetLoggia.clickActionOfBlock(1, query.actionLoggia || "Switch On");
    }

    // 5. Bathroom
    if (!!query.withBathroom) {
      const percentStr = query.percentBathroom || "100";
      const percent = parseInt(percentStr, 10);
      if (!isNaN(percent)) {
        await puppetBathroom.clickPlusMinusOfBlock(1, percent);
      } else {
        await puppetBathroom.clickActionOfBlock(1, percentStr);
      }
    }

    // 6. Bathroom Headlights
    if (!!query.withBathroomHeadlights) {
      await puppetBathroom.clickActionOfBlock(2, query.actionBathroom || "Switch On");
    }
  }
}
