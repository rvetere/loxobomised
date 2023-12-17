/* eslint-disable @typescript-eslint/no-unused-vars */
import { ElementHandle, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";

const getElement = async (
  page: Page | null,
  category: string,
  buttonGroupIndex: number,
  action: string,
) => {
  if (!page) {
    console.error("No page!");
    return {
      element: null,
      upButton: null,
      downButton: null,
    };
  }
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`,
  );
  if (!container) {
    console.error("Category not found!");
    await page.screenshot({ path: "error.png" });
    return {
      element: null,
      upButton: null,
      downButton: null,
    };
  }

  const downButtons = await container.$$(
    "path[d='M2.253 8.336a1 1 0 011.411-.083L12 15.663l8.336-7.41a1 1 0 011.328 1.494l-9 8a1 1 0 01-1.328 0l-9-8a1 1 0 01-.083-1.411z']",
  );
  const upButtons = await container.$$(
    "path[d='M11.336 6.253a1 1 0 011.328 0l9 8a1 1 0 01-1.328 1.494L12 8.337l-8.336 7.41a1 1 0 01-1.328-1.494l9-8z']",
  );
  const elements = action === "up" ? upButtons : downButtons;

  if (elements.length > 0) {
    return {
      element: elements[0],
      upButton: upButtons[0],
      downButton: downButtons[0],
    };
  }

  return {
    element: null,
    upButton: null,
    downButton: null,
  };
};

export const clickUpDownOfTitle = async (
  page: Page | null,
  category: string,
  buttonGroupIndex: number,
  action = "down", // "up", "down"
  doubleClick = false,
  delay = 200,
  callback = (
    upButton: ElementHandle<Element> | null,
    downButton: ElementHandle<Element> | null,
  ) => {
    console.log("IMPLEMENT!", { upButton, downButton });
  },
) => {
  console.log("clickUpDownOfTitle", { buttonGroupIndex, action });

  let timer = null;
  const { element } = await getElement(
    page,
    category,
    buttonGroupIndex,
    action,
  );
  if (element) {
    // click action
    element.click();
    if (doubleClick) {
      // double click action by starting a timer with a delay of at least 200ms
      timer = setTimeout(async () => {
        try {
          const {
            element: elementCb,
            upButton: upButtonCb,
            downButton: downButtonCb,
          } = await getElement(page, category, buttonGroupIndex, action);
          elementCb?.click();
          callback(upButtonCb, downButtonCb);
        } catch (e) {
          console.error(e);
        }
      }, delay);
    }

    await sleep(800);
  }

  return timer;
};
