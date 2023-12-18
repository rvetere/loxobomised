import { ElementHandle } from "puppeteer";

export const getToggleButton = async (container: ElementHandle<Node> | null) => {
  if (!container) {
    return {
      button: null,
      isActive: false,
    };
  }

  const blackButtons = await container.$x(
    "//div[contains(@style,'background-color: rgb(32, 32, 32);')]"
  );
  const greenButtons = await container.$x(
    "//div[contains(@style,'background-color: rgb(105, 195, 80);')]"
  );

  const isActive = greenButtons.length > 0;
  const button = isActive ? greenButtons[0] : blackButtons.length ? blackButtons[0] : null;
  return {
    button,
    isActive,
  };
};
