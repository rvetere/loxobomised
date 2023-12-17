const { clickUpDownOfTitle } = require("./clickUpDownOfTitle");
const { getContainer } = require("./getContainer");
const { sleep } = require("./sleep");

const LoggiaRolloTiming = 59 / 100;
const WindowRolloTiming = 40 / 100;
const MarkiseTiming = 20 / 100;

const controlJalousie = async (props) => {
  const {
    rolloType = "Window", // Window, Loggia, Markise
    finalPosition = 0, // 0=Closed, 1=Slightly, 2=Double
  } = props;

  let timer = null;
  let actualDelay = 0;
  const container = await getContainer(
    props.page,
    props.room,
    props.buttonGroupIndex,
    "controlJalousie"
  );
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

  const steps = props.percentToSet - currentPercent;
  const isMovingDown = steps > 0;

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

    console.log("controlJalousie", {
      room: `${props.room} [${props.buttonGroupIndex}]}`,
      steps,
    });

    // click action to move jalousie
    const callback = async (upButton, downButton) => {
      if (rolloType !== "Markise") {
        console.log(
          `Move jalousie (${room}) [${buttonGroupIndex}] to final position (tilted=${finalPosition};isMovingDown=${isMovingDown}))`
        );
        if (isMovingDown) {
          if (finalPosition === 0) {
            // nothing to do, the blinds are already closed
          } else if (finalPosition === 1) {
            await clickButton(upButton, 400);
          } else if (finalPosition === 2) {
            await clickButton(upButton, 900);
          }
        } else {
          if (finalPosition === 0) {
            await clickButton(downButton, 1200);
          } else if (finalPosition === 1) {
            await clickButton(downButton, 850);
          } else if (finalPosition === 2) {
            await clickButton(downButton, 400);
          }
        }
      }
    };

    timer = await clickUpDownOfTitle({
      page: props.page,
      room: props.room,
      buttonGroupIndex: props.buttonGroupIndex,
      isMovingDown: isMovingDown ? "down" : "up",
      doubleClick: true,
      delay,
      callback,
      rolloType,
    });
  }

  return { actualDelay, timer };
};

async function clickButton(button, delay = 250) {
  button.click();
  await sleep(delay);
  button.click();
}

function toPositive(n) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

module.exports = {
  controlJalousie,
};
