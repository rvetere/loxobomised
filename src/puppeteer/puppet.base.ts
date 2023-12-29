import type { ElementHandle, Page } from "puppeteer";
import { Logger } from "src/utils/logger";
import { sleep } from "src/utils/sleep";
import { toPositive } from "src/utils/toPositive";
import { PuppeteerController } from "./puppeteer.controller";
import { clickElement } from "./utils/clickElement";
import { getButtonInElement } from "./utils/getButtonInElement";
import { getDataPercent } from "./utils/getDataPercent";
import { getPlusOrMinusElementInPage } from "./utils/getPlusOrMinusElement";
import { getToggleButton } from "./utils/getToggleButton";
import { navigate } from "./utils/navigate";
import type { LoxoneCategoryEnum } from "src/types";

export class PuppetBase {
  page: Page;
  room: string;
  query: Record<string, any>;
  category: LoxoneCategoryEnum;
  controller: PuppeteerController;

  constructor(
    controller: PuppeteerController,
    page: Page,
    category: LoxoneCategoryEnum,
    room: string,
    query: Record<string, any>
  ) {
    this.controller = controller;
    this.page = page;
    this.category = category;
    this.room = room;
    this.query = query;

    this.getContainer = this.getContainer.bind(this);
    this.clickOverlayPlusMinusOfBlock = this.clickOverlayPlusMinusOfBlock.bind(this);
  }

  getContainer = async (blockIndex: number): Promise<ElementHandle<Element> | null> => {
    const containerXPath = `//div[contains(text(),'${decodeURIComponent(
      this.room
    )}')]/../../following-sibling::div[1]/div/div[${blockIndex}]`;
    const [container] = await this.page.$x(containerXPath);
    if (!container) {
      // this happens when we somehow landed on the wrong page (probably by pressing one time "Escape" too much)")
      console.error("Container not found!", { containerXPath });
      await navigate(this.page, this.category.toString(), "Kategorien");
      let containerTurnover = await this.getContainer(blockIndex);
      if (!containerTurnover) {
        // refresh page and login again
        await this.controller.refreshLogin();
        containerTurnover = await this.getContainer(blockIndex);
        return containerTurnover;
      }

      return containerTurnover;
    }

    return container as ElementHandle<Element>;
  };

  closeOverlay = async () => {
    // close overlay controls
    await this.page.keyboard.press("Escape");
    await sleep(800);

    // check if we still can find the "category-room" combo on the page
    const containerXPath = `//div[contains(text(),'${decodeURIComponent(this.room)}')]`;
    const [container] = await this.page.$x(containerXPath);
    if (!container) {
      // if not found, we navigated back to the overview page and need to move back to the category!
      console.error(`🚨 Landed on wrong page after closing overlay!`);
      await navigate(this.page, this.category.toString(), "Kategorien");
      const [containerTurnover] = await this.page.$x(containerXPath);
      if (!containerTurnover) {
        // refresh page and login again
        await this.controller.refreshLogin();
        const [containerTurnover2] = await this.page.$x(containerXPath);
        return containerTurnover2;
      }

      return containerTurnover;
    }
  };

  clickOverlayPlusMinusOfBlock = async (blockIndex: number, percentToSet: number) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return null;
    }

    const currentPercent = await getDataPercent(container);
    const steps = (percentToSet - currentPercent) / 10;
    const variant = steps > 0 ? "plus" : "minus";

    if (toPositive(steps) > 0) {
      // just click on the first button found in the container, this will open the overlay controls
      const button = await getButtonInElement(container, 0);
      Logger.log(`   Click button to open overlay...`);
      await clickElement(button, 500);

      // click "plus" or "minus" button as many times possible to get it to the desired percent (each click moves it by 10%)
      for (let i = 0; i < toPositive(steps); i++) {
        const actionButton = await getPlusOrMinusElementInPage(this.page, variant);
        Logger.log(`   Click action of clickOverlayPlusMinusOfBlock...`);
        await clickElement(actionButton, 500);
      }

      await this.closeOverlay();
    }
  };

  clickToggleOfBlock = async (
    blockIndex: number,
    action = "Switch On" // "Switch On", "Switch Off"
  ) => {
    const container = await this.getContainer(blockIndex);
    const { button, isActive } = await getToggleButton(container);

    if (button) {
      if ((isActive && action === "Switch Off") || (!isActive && action === "Switch On")) {
        Logger.log(`   Click action of clickToggleOfBlock...`);
        await clickElement(button as ElementHandle<Element>, 400);
      }
    } else {
      console.error("Button not found!");
    }
  };
}
