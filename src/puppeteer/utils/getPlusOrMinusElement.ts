import { Page } from "puppeteer";

type PlurOrMinus = "plus" | "minus";

export const getPlusOrMinusElement = async (page: Page, variant: PlurOrMinus) => {
  const elements =
    variant === "plus"
      ? await page.$$(
          "path[d='M13 21a1 1 0 11-2 0v-8H3a1 1 0 110-2h8V3a1 1 0 112 0v8h8a1 1 0 110 2h-8v8z']"
        )
      : await page.$$("path[d='M2 12a1 1 0 011-1h18a1 1 0 110 2H3a1 1 0 01-1-1z']");

  if (elements.length) {
    return elements[0];
  }
  return null;
};
