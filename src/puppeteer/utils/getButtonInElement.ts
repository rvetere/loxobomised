import type { ElementHandle } from "puppeteer";

export const getButtonInElement = async (container: ElementHandle<Node>, index = 0) => {
  const elements = await container.$$("div[role=button]");
  if (elements.length) {
    return elements[index];
  }
  return null;
};
