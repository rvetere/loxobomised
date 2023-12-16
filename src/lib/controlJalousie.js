const { clickUpDownOfCategory } = require("./clickUpDownOfCategory");
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
  let actualDelay = 0;
  let container = await getContainer(page, buttonGroupIndex);
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
  let timer = null;

  if (toPositive(steps) > 4) {
    // calculate exact delay to reach "percentToSet"
    const timing =
      rolloType === "Loggia"
        ? LoggiaRolloTiming
        : rolloType === "Window"
        ? WindowRolloTiming
        : MarkiseTiming;
    const delay = Math.floor(toPositive(steps) * timing * 1000);

    // console.log({
    //   buttonGroupIndex,
    //   percentToSet,
    //   currentPercent,
    //   steps,
    //   rolloType,
    //   delay,
    // });

    // click action to move jalousie
    timer = await clickUpDownOfCategory(
      page,
      "Beschattung",
      buttonGroupIndex,
      isMovingDown ? "down" : "up",
      true,
      delay,
      async () => {
        // console.log({
        //   buttonGroupIndex,
        //   isMovingDown,
        //   rolloType,
        //   finalPosition,
        // });

        if (rolloType !== "Markise") {
          // const subActionDown = actionDown.split(" ")[1];
          // const subActionUp = actionUp.split(" ")[1];
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

const getContainer = async (page, buttonGroupIndex) => {
  const category = "Beschattung";
  const [container] = await page.$x(
    `//div[contains(text(),'${category}')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  return container;
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
