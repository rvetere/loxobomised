import type { Page } from "puppeteer";

type PlurOrMinus = "plus" | "minus";

const svgPath =
  "path[d='M16.28162,15l4.02167-4.02167a.90624.90624,0,1,0-1.28162-1.28162L15,13.71838,10.97833,9.69672a.90624.90624,0,1,0-1.28162,1.28162L13.71838,15,9.69672,19.02167a.90624.90624,0,1,0,1.28162,1.28162L15,16.28162l4.02167,4.02167a.90624.90624,0,1,0,1.28162-1.28162Z']";

export const getCloseElement = async (page: Page) => {
  const elements = await page.$$(svgPath);

  if (elements.length) {
    return elements[0];
  }
  return null;
};
