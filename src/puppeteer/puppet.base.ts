import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { getPlusOrMinusElement } from "./utils/getPlusOrMinusElement";
import { getUpDownElement } from "./utils/getUpDownElement";
import { navigate } from "./utils/navigate";
import { clickElement } from "./utils/clickElement";
import { getElementByText } from "./utils/getElementByText";
import { getButtonInElement } from "./utils/getButtonInElement";
import { Logger } from "src/utils/logger";
import { getToggleButton } from "./utils/getToggleButton";

interface ClickUpDownOfTitleProps {
  blockIndex: number;
  action?: string;
  doubleClick?: boolean;
  delay?: number;
  callback?: (
    afterDoubleClick: boolean,
    upButton: ElementHandle | null,
    downButton: ElementHandle | null
  ) => void;
}

const dummyCallback = (
  _afterDoubleClick: boolean,
  _upButton: ElementHandle<Element> | null,
  _downButton: ElementHandle<Element> | null
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
    this.clickActionOfBlock = this.clickActionOfBlock.bind(this);
    this.clickPlusMinusOfBlock = this.clickPlusMinusOfBlock.bind(this);
    this.clickUpDownOfBlock = this.clickUpDownOfBlock.bind(this);
  }

  getContainer = async (blockIndex: number): Promise<ElementHandle<Node> | null> => {
    const containerXPath = `//div[contains(text(),'${this.room}')]/../../following-sibling::div[1]/div/div[${blockIndex}]`;
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
    return container;
  };

  /**
   *
   * @deprecated DO NOT USE THIS METHOD ANYMORE!
   */
  clickActionOfBlock = async (blockIndex: number, action: string, doubleClick = false) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return;
    }
    const buttons = await container.$$("div[role=button]");
    const button = buttons.length ? buttons[0] : null;
    if (!button) {
      console.error("Button not found!");
      return;
    }

    // open overlay controls
    Logger.log(`   Click overlay of clickActionOfBlock...`);
    await clickElement(button);

    // click action
    const actionButton = await getElementByText(this.page, action);
    Logger.log(`   Click action of clickActionOfBlock...`);
    await clickElement(actionButton);

    // close overlay controls
    await this.page.keyboard.press("Escape");
    await sleep(200);
  };

  clickPlusMinusOfBlock = async (blockIndex: number, percentToSet: number) => {
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
      Logger.log(`   Click overlay of clickPlusMinusOfBlock...`);
      await clickElement(button);

      // click "plus" or "minus" button as many times possible to get it to the desired percent (each click moves it by 10%)
      for (let i = 0; i < toPositive(steps); i++) {
        const actionButton = await getPlusOrMinusElement(this.page, variant);
        Logger.log(`   Click action of clickPlusMinusOfBlock...`);
        await clickElement(actionButton, 500);
      }

      // close overlay controls
      await this.page.keyboard.press("Escape");
      await sleep(200);
    }
  };

  clickUpDownOfBlock = async ({
    blockIndex,
    action = "down", // "up", "down"
    doubleClick = false,
    delay = 200,
    callback = dummyCallback,
  }: ClickUpDownOfTitleProps) => {
    const container = await this.getContainer(blockIndex);
    const { upButton, downButton } = await getUpDownElement(container, action);
    const button = action === "up" ? upButton : downButton;

    if (button) {
      // click action
      Logger.log(`   Click action of clickUpDownOfBlock...`);
      await clickElement(button, 400);

      if (doubleClick) {
        // double click action by starting a timer with a delay of at least 200ms
        setTimeout(() => {
          Logger.log(`   Click markise to stop at final position...`);
          clickElement(button);
          callback(true, upButton, downButton);
        }, delay);
        return;
      }
    }
    callback(false, upButton, downButton);
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
    }
  };
}
