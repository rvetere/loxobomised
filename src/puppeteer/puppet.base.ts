import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { getPlusOrMinusElement } from "./utils/getPlusOrMinusElement";
import { getUpDownElement } from "./utils/getUpDownElement";
import { navigate } from "./utils/navigate";
import { clickElement } from "./utils/clickElement";
import { getButtonElementByText } from "./utils/getButtonElementByText";
import { getButtonInElement } from "./utils/getButtonInElement";
import { Logger } from "src/utils/logger";
import { getToggleButton } from "./utils/getToggleButton";
import { isJalousieActive } from "./utils/isJalousieActive";

interface ClickUpDownOfTitleProps {
  blockIndex: number;
  device?: string;
  action?: string;
  doubleClick?: boolean;
  delay?: number;
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

  constructor(page: Page, category: string, room: string, query: Record<string, any>) {
    this.page = page;
    this.category = category;
    this.room = room;
    this.query = query;

    this.getContainer = this.getContainer.bind(this);
    this.clickOverlayActionOfBlock = this.clickOverlayActionOfBlock.bind(this);
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
      await this.page.screenshot({ path: "getContainer-error.png" });

      await navigate(this.page, this.category, "Kategorien");
      await this.page.screenshot({ path: "getContainer-restored.png" });

      const containerTurnover = await this.getContainer(blockIndex);
      return containerTurnover;
    }

    return container as ElementHandle<Element>;
  };

  clickOverlayActionOfBlock = async (blockIndex: number, action: string, doubleClick = false) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return;
    }
    const button = await getButtonInElement(container, 0);
    if (!button) {
      console.error("Button not found!");
      return;
    }

    // open overlay controls
    Logger.log(`   Click overlay of clickOverlayActionOfBlock...`);
    await clickElement(button, 500, doubleClick);

    // click action
    const actionButton = await getButtonElementByText(this.page, action);
    Logger.log(`   Click action of clickOverlayActionOfBlock...`);
    await clickElement(actionButton);

    // close overlay controls
    await this.page.keyboard.press("Escape");
    await sleep(500);
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
      const button = await getButtonInElement(container, 0);

      // open overlay controls
      Logger.log(`   Click overlay of clickOverlayPlusMinusOfBlock...`);
      await clickElement(button, 500);

      // click "plus" or "minus" button as many times possible to get it to the desired percent (each click moves it by 10%)
      for (let i = 0; i < toPositive(steps); i++) {
        const actionButton = await getPlusOrMinusElement(this.page, variant);
        Logger.log(`   Click action of clickOverlayPlusMinusOfBlock...`);
        await clickElement(actionButton, 500);
      }

      // close overlay controls
      await this.page.keyboard.press("Escape");
      await sleep(500);
    }
  };

  clickUpDownOfBlock = async ({
    blockIndex,
    device = "jalousie",
    action = "down", // "up", "down"
    doubleClick = false,
    delay = 200,
    callback = dummyCallback,
  }: ClickUpDownOfTitleProps): Promise<void> => {
    const container = await this.getContainer(blockIndex);
    const { upButton, downButton } = await getUpDownElement(container, action);
    const button = action === "up" ? upButton : downButton;

    if (button) {
      // click action
      Logger.log(`   Click action of clickUpDownOfBlock...`);
      await clickElement(button, 400);
      const isActiveNow = device === "jalousie" ? await isJalousieActive(container) : true;
      console.log(`   isActiveNow: ${isActiveNow ? "✅" : "❌"}`);

      if (doubleClick && isActiveNow) {
        // double click action by starting a timer with a delay of at least 200ms
        setTimeout(async () => {
          Logger.log(`   Click double click after timeout to stop motion...`);
          await clickElement(button);
          callback(true, upButton, downButton, container);
        }, delay);
        return;
      } else if (doubleClick && !isActiveNow) {
        console.error(`   Initial action did not happen ❌, abort doubleClick and try again!`);
        await sleep(500);
        return this.clickUpDownOfBlock({
          blockIndex,
          device,
          action,
          doubleClick,
          delay,
          callback,
        });
      }
    }
    callback(false, upButton, downButton, container);
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
