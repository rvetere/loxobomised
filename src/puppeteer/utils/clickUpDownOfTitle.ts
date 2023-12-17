/* eslint-disable @typescript-eslint/no-unused-vars */
import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { getUpDownElement } from "./getUpDownElement";

interface ClickUpDownOfTitleProps {
  page: Page | null;
  category: string;
  buttonGroupIndex: number;
  action: string;
  doubleClick: boolean;
  delay: number;
  callback: (
    afterDoubleClick: boolean,
    upButton: ElementHandle | null,
    downButton: ElementHandle | null
  ) => void;
}

const dummyCallback = (
  afterDoubleClick: boolean,
  upButton: ElementHandle<Element> | null,
  downButton: ElementHandle<Element> | null
) => {
  console.log("IMPLEMENT!", { upButton, downButton });
};

export const clickUpDownOfTitle = async ({
  page,
  category,
  buttonGroupIndex,
  action = "down", // "up", "down"
  doubleClick = false,
  delay = 200,
  callback = dummyCallback,
}: ClickUpDownOfTitleProps) => {
  const { element, upButton, downButton } = await getUpDownElement(
    page,
    category,
    buttonGroupIndex,
    action
  );

  if (element) {
    // click action
    element.click();
    await sleep(400);

    if (doubleClick) {
      // double click action by starting a timer with a delay of at least 200ms
      setTimeout(() => {
        element.click();
        sleep(400).then(() => {
          callback(true, upButton, downButton);
        });
      }, delay);
      return;
    }
  }
  callback(false, upButton, downButton);
};
