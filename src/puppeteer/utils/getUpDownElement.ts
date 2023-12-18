import { Page } from "puppeteer";
import { getContainer } from "./getContainer";

export const getUpDownElement = async (
  page: Page | null,
  title: string,
  blockIndex: number,
  action: string
) => {
  if (!page) {
    console.error("No page!");
    return {
      element: null,
      upButton: null,
      downButton: null,
    };
  }
  const container = await getContainer(page, title, blockIndex);
  if (!container) {
    return {
      element: null,
      upButton: null,
      downButton: null,
    };
  }

  const downButtons = await container.$$(
    "path[d='M2.253 8.336a1 1 0 011.411-.083L12 15.663l8.336-7.41a1 1 0 011.328 1.494l-9 8a1 1 0 01-1.328 0l-9-8a1 1 0 01-.083-1.411z']"
  );
  const upButtons = await container.$$(
    "path[d='M11.336 6.253a1 1 0 011.328 0l9 8a1 1 0 01-1.328 1.494L12 8.337l-8.336 7.41a1 1 0 01-1.328-1.494l9-8z']"
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
