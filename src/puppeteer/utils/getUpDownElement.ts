import type { ElementHandle } from "puppeteer";

export const getUpDownElement = async (container: ElementHandle<Node> | null) => {
  if (!container) {
    return {
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
  return {
    upButton: upButtons.length ? upButtons[0] : null,
    downButton: downButtons.length ? downButtons[0] : null,
  };
};
