import type { ElementHandle, Page } from "puppeteer";
import { Logger } from "src/utils/logger";
import { sleep } from "src/utils/sleep";
import { toPositive } from "src/utils/toPositive";
import { PuppeteerController } from "./puppeteer.controller";
import { clickButtonByText } from "./utils/clickButtonByText";
import { clickElement } from "./utils/clickElement";
import { getButtonElementByText } from "./utils/getButtonElementByText";
import { getButtonInElement } from "./utils/getButtonInElement";
import { getDataPercent } from "./utils/getDataPercent";
import { getPlusOrMinusElementInPage } from "./utils/getPlusOrMinusElement";
import { getToggleButton } from "./utils/getToggleButton";
import { getUpDownElement } from "./utils/getUpDownElement";
import { isJalousieActive } from "./utils/isJalousieActive";
import { navigate } from "./utils/navigate";
import type { JalousieType } from "src/types";

interface ClickUpDownOfTitleProps {
  blockIndex: number;
  device?: string;
  action?: string;
  doubleClick?: boolean;
  delay?: number;
  reTryCounter?: number;
  callback?: (
    afterDoubleClick: boolean,
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null,
    container: ElementHandle<Element> | null
  ) => void;
}

const dummyCallback = (
  _afterDoubleClick: boolean,
  _upButton: ElementHandle<Element> | null,
  _downButton: ElementHandle<Element> | null,
  _container: ElementHandle<Element> | null
) => {};

export class PuppetBase {
  page: Page;
  room: string;
  query: Record<string, any>;
  category: string;
  controller: PuppeteerController;

  constructor(
    controller: PuppeteerController,
    page: Page,
    category: string,
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
    this.clickUpDownOfBlock = this.clickUpDownOfBlock.bind(this);
  }

  getContainer = async (blockIndex: number): Promise<ElementHandle<Element> | null> => {
    const containerXPath = `//div[contains(text(),'${decodeURIComponent(
      this.room
    )}')]/../../following-sibling::div[1]/div/div[${blockIndex}]`;
    const [container] = await this.page.$x(containerXPath);
    if (!container) {
      // this happens when we somehow landed on the wrong page (probably by pressing one time "Escape" too much)")
      console.error("Container not found!", { containerXPath });
      await navigate(this.page, this.category, "Kategorien");
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
    await sleep(500);

    // check if we still can find the "category-room" combo on the page
    const containerXPath = `//div[contains(text(),'${decodeURIComponent(this.room)}')]`;
    const [container] = await this.page.$x(containerXPath);
    if (!container) {
      // if not found, we navigated back to the overview page and need to move back to the category!
      console.error(`🚨 Landed on wrong page after closing overlay!`);
      await navigate(this.page, this.category, "Kategorien");
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

  clickUpDownOfBlock = async ({
    blockIndex,
    action = "down", // "up", "down"
    doubleClick = false,
    delay = 200,
    reTryCounter = 0,
    callback = dummyCallback,
  }: ClickUpDownOfTitleProps): Promise<NodeJS.Timeout | null> => {
    let timer: NodeJS.Timeout | null = null;
    const container = await this.getContainer(blockIndex);
    const { upButton, downButton } = await getUpDownElement(container);
    const button = action === "up" ? upButton : downButton;

    if (button) {
      // click action
      Logger.log(`   Click action of clickUpDownOfBlock...`);
      await clickElement(button, 400);
      const isActiveNow = await isJalousieActive(container);
      console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);

      if (doubleClick && isActiveNow) {
        // double click action by starting a timer with a delay of at least 200ms
        timer = setTimeout(async () => {
          Logger.log(`   Click double click after timeout to stop motion...`);
          await clickElement(button);
          callback(true, upButton, downButton, container);
        }, delay);
        return timer;
      } else if (doubleClick && !isActiveNow) {
        if (reTryCounter < 2) {
          console.error(
            `   Initial action did not happen ❌, abort doubleClick and try again! - retry counter is ${reTryCounter}`
          );
          const randomDelay = Math.floor(Math.random() * 5000) + 800;
          await sleep(randomDelay);
          return this.clickUpDownOfBlock({
            blockIndex,
            action,
            doubleClick,
            delay,
            reTryCounter: reTryCounter + 1,
            callback,
          });
        }
      }
    }
    callback(false, upButton, downButton, container);
    return timer;
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
