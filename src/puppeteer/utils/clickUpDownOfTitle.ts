/* eslint-disable @typescript-eslint/no-unused-vars */
import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { getUpDownElement } from "./getUpDownElement";

interface ClickUpDownOfTitleProps {
  page: Page | null;
  title: string;
  buttonGroupIndex: number;
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

export const clickUpDownOfTitle = async ({
  page,
  title,
  buttonGroupIndex,
  action = "down", // "up", "down"
  doubleClick = false,
  delay = 200,
  callback = dummyCallback,
}: ClickUpDownOfTitleProps) => {
  const { element, upButton, downButton } = await getUpDownElement(
    page,
    title,
    buttonGroupIndex,
    action
  );

  if (element) {
    // click action
    element.click();
    await sleep(400);

    if (doubleClick) {
      // double click action by starting a timer with a delay of at least 200ms
      setTimeout(async () => {
        const {
          element: elementCb,
          upButton: upButtonCb,
          downButton: downButtonCb,
        } = await getUpDownElement(page, title, buttonGroupIndex, action);

        elementCb?.click();
        await sleep(400);

        callback(true, upButtonCb, downButtonCb);
      }, delay);
      return;
    }
  }
  callback(false, upButton, downButton);
};
