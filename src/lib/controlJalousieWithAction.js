const { clickActionOfCategory } = require("./clickActionOfCategory");

const MarkiseTiming = 20 / 100;

const controlJalousieWithAction = async ({
  page,
  buttonGroupIndex,
  percentToSet,
  actionUp = "Fully In",
  actionDown = "Fully Out",
}) => {
  const rolloType = "Markise";
  let actualDelay = 0;
  const [container] = await page.$x(
    `//div[contains(text(),'Beschattung')]/../../following-sibling::div[1]/div/div[${buttonGroupIndex}]`
  );
  const texts = await container.$$eval("div", (divs) =>
    divs.map((div) => div.innerText)
  );
  const textWithPercent = texts.find((text) => text.includes("%"));
  const textClosed = texts.find((text) => text.includes("Closed"));

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

  if (toPositive(steps) > 4) {
    await clickActionOfCategory(page, "Beschattung", buttonGroupIndex, action);

    // calculate exact delay to reach "percentToSet"
    const delay = Math.floor(toPositive(steps) * MarkiseTiming * 1000);
    // console.log({
    //   percentToSet,
    //   currentPercent,
    //   steps,
    //   action,
    //   delay,
    //   rolloType,
    // });

    // wait until jalousie is in position
    const randomDelay = Math.floor(Math.random() * 50);
    actualDelay = delay + randomDelay;
    setTimeout(
      stopAndMoveToFinalPosition.bind({
        page,
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
  //   console.log(
  //     `Run stopAndMoveToFinalPosition for buttonGroupIndex ${this.buttonGroupIndex}`
  //   );
  await clickActionOfCategory(
    this.page,
    "Beschattung",
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
