const { clickUpDownOfCategory } = require("./clickUpDownOfCategory");
const { getContainer } = require("./getContainer");
const { sleep } = require("./sleep");

const LoggiaRolloTiming = 59 / 100;
const WindowRolloTiming = 40 / 100;
const MarkiseTiming = 20 / 100;

const controlJalousie = async ({
  page,
  buttonGroupIndex,
  percentToSet,
  rolloType = "Window", // Window, Loggia, Markise
  finalPosition = 0, // 0=Closed, 1=Slightly, 2=Double
}) => {
  let timer = null;
  let actualDelay = 0;
  const container = await getContainer(page, "Beschattung", buttonGroupIndex);
  if (!container) {
    return { actualDelay, timer };
  }
  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosed = texts.find((text) => text.includes("Closed"));

  const currentPercent = textWithPercent
    ? parseInt(textWithPercent.split("(")[1].split(")")[0].replace("%", ""))
    : textClosed
    ? 100
    : 0;

  const steps = percentToSet - currentPercent;
  const isMovingDown = steps > 0;

  console.log("controlJalousie", {
    buttonGroupIndex,
    percentToSet,
    currentPercent,
    steps,
    rolloType,
  });
  if (toPositive(steps) > 4) {
    // calculate exact delay to reach "percentToSet"
    const timing =
      rolloType === "Loggia"
        ? LoggiaRolloTiming
        : rolloType === "Window"
        ? WindowRolloTiming
        : MarkiseTiming;
    const delay = Math.floor(toPositive(steps) * timing * 1000);
    actualDelay = delay;

    // click action to move jalousie
    timer = await clickUpDownOfCategory(
      page,
      "Beschattung",
      buttonGroupIndex,
      isMovingDown ? "down" : "up",
      true,
      delay,
      async () => {
        if (rolloType !== "Markise") {
          console.log(
            `Move jalousie (${buttonGroupIndex}) into final position - ${finalPosition}`
          );
          if (isMovingDown) {
            if (finalPosition === 0) {
              // nothing to do, the blinds are already closed
            } else if (finalPosition === 1) {
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
            } else if (finalPosition === 2) {
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
              await sleep(450);
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
            }
          } else {
            if (finalPosition === 0) {
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "down"
              );
              await sleep(600);
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
            } else if (finalPosition === 1) {
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "down"
              );
              await sleep(400);
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
            } else if (finalPosition === 2) {
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "down"
              );
              await sleep(150);
              await clickUpDownOfCategory(
                page,
                "Beschattung",
                buttonGroupIndex,
                "up"
              );
            }
          }
        }
      },
      rolloType
    );
  }

  return { actualDelay, timer };
};

function toPositive(n) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

module.exports = {
  controlJalousie,
};
