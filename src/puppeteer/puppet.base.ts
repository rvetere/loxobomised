import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { clickButtonByText } from "./utils/clickButtonByText";
import { getDataPercent } from "./utils/getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { getPlusOrMinusButtons } from "./utils/getPlusOrMinusButtons";
import { getUpDownElement } from "./utils/getUpDownElement";
import { navigate } from "./utils/navigate";

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

  clickActionOfBlock = async (blockIndex: number, action: string, doubleClick = false) => {
    const container = await this.getContainer(blockIndex);
    if (!container) {
      return;
    }
    const elements = await container.$$("div[role=button]");
    const element = elements.length ? elements[0] : null;
    if (!element) {
      console.error("Element not found!");
      return;
    }

    // open overlay controls
    element.click();
    await sleep(200);

    if (doubleClick) {
      element.click();
      await sleep(200);
    }

    // click action
    await clickButtonByText(this.page, action);

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

    console.log({ steps, variant });

    if (toPositive(steps) > 0) {
      const elements = await container.$$("div[role=button]");

      // open overlay controls
      elements[0].click();
      await sleep(200);

      // click "plus" or "minus" button as many times possible to get it to the desired percent (each click moves it by 10%)
      for (let i = 0; i < toPositive(steps); i++) {
        const actionButtons = await getPlusOrMinusButtons(this.page, variant);
        console.log("   Click", variant, "button", i + 1, "times");
        actionButtons[0]?.click();
        await sleep(500);
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
    const { element, upButton, downButton } = await getUpDownElement(container, action);

    if (element) {
      // click action
      element.click();
      await sleep(400);

      if (doubleClick) {
        // double click action by starting a timer with a delay of at least 200ms
        setTimeout(() => {
          element.click();
          callback(true, upButton, downButton);
        }, delay);
        return;
      }
    }
    callback(false, upButton, downButton);
  };
}
