const { clickOnParent } = require("./clickOnParent");
const { getContainer } = require("./getContainer");
const { sleep } = require("./sleep");

const clickPlusMinusOfCategory = async (
  page,
  category,
  buttonGroupIndex,
  percentToSet
) => {
  const container = await getContainer(page, category, buttonGroupIndex);
  if (!container) {
    return { actualDelay, timer };
  }

  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.endsWith("%"));
  const currentPercent = parseInt(
    textWithPercent.replace("%", "").split("\n")[1]
  );
  const steps = (percentToSet - currentPercent) / 10;
  const kind = steps > 0 ? "plus" : "minus";

  console.log("clickPlusMinusOfCategory", {
    buttonGroupIndex,
    percentToSet,
    currentPercent,
    steps,
    kind,
  });

  if (toPositive(steps) > 0) {
    const elements = await container.$$("div[role=button]");

    // open overlay controls
    elements[0].click();
    await sleep(200);

    for (let i = 0; i < toPositive(steps); i++) {
      await clickPlusMinus(page, kind);
    }

    // close overlay controls
    await page.keyboard.press("Escape");
    await sleep(200);
  }
};

const clickPlusMinus = async (page, kind) => {
  const buttons =
    kind === "plus"
      ? await page.$$(
          "path[d='M13 21a1 1 0 11-2 0v-8H3a1 1 0 110-2h8V3a1 1 0 112 0v8h8a1 1 0 110 2h-8v8z']"
        )
      : await page.$$(
          "path[d='M2 12a1 1 0 011-1h18a1 1 0 110 2H3a1 1 0 01-1-1z']"
        );

  // click plus/minus
  buttons[0].click();
  await sleep(200);
};

function toPositive(n) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

module.exports = {
  clickPlusMinusOfCategory,
};
