const { clickActionOfTitle } = require("./clickActionOfTitle");
const { getContainer } = require("./getContainer");

const MarkiseTiming = 20 / 100;

const controlJalousieWithAction = async ({
  page,
  room,
  buttonGroupIndex,
  percentToSet,
  actionUp = "Fully In",
  actionDown = "Fully Out",
}) => {
  const rolloType = "Markise";
  let actualDelay = 0;
  const container = await getContainer(page, room, buttonGroupIndex);
  if (!container) {
    return { actualDelay };
  }

  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosed = texts.find((text) => text.includes("Fully extended"));

  const currentPercent = textWithPercent
    ? parseInt(
        textWithPercent.includes("(")
          ? textWithPercent.split("(")[1].split(")")[0]
          : textWithPercent.split("is ")[1].split(" ")[0],
        10
      )
    : textClosed
    ? 100
    : 0;

  const steps = percentToSet - currentPercent;
  const isMovingDown = steps > 0;
  const action = isMovingDown ? actionDown : actionUp;

  console.log("controlJalousieWithAction", {
    buttonGroupIndex,
    percentToSet,
    currentPercent,
    steps,
    rolloType,
  });
  if (toPositive(steps) > 4) {
    await clickActionOfTitle(page, room, buttonGroupIndex, action);

    // calculate exact delay to reach "percentToSet"
    const delay = Math.floor(toPositive(steps) * MarkiseTiming * 1000);

    // wait until jalousie is in position
    const randomDelay = Math.floor(Math.random() * 50);
    actualDelay = delay + randomDelay;
    setTimeout(
      stopAndMoveToFinalPosition.bind({
        page,
        room,
        buttonGroupIndex,
        action,
        actionUp,
        actionDown,
        rolloType,
        isMovingDown,
      }),
      actualDelay
    );
  }

  return actualDelay;
};

async function stopAndMoveToFinalPosition() {
  console.log(`Run stopAndMoveToFinalPosition (${this.buttonGroupIndex})`);
  await clickActionOfTitle(
    this.page,
    this.room,
    this.buttonGroupIndex,
    this.action
  );
}

function toPositive(n) {
  if (n < 0) {
    n = n * -1;
  }
  return n;
}

module.exports = {
  controlJalousieWithAction,
};
