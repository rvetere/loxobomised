const { getContainer } = require("./getContainer");
const { sleep } = require("./sleep");

const clickUpDownOfTitle = async (props) => {
  const {
    action = "down", // "up", "down"
    doubleClick = false,
    delay = 200,
    callback = () => {},
  } = props;

  let timer = null;

  const { upButton, downButton } = await getElement(
    props.page,
    props.title,
    props.buttonGroupIndex
  );
  const element = action === "up" ? upButton : downButton;
  if (element) {
    // click action
    element.click();

    // check if action happened
    hasActionHappened(props.page, props.title, props.buttonGroupIndex).then(
      (itWorked) => {
        if (!itWorked && (props.retry || 0) < 3) {
          // try again
          console.log(`🚨 Action was not executed, RETRY! 🚨`);
          return clickUpDownOfTitle({
            ...props,
            retry: (props.retry || 0) + 1,
          });
        }
      }
    );

    if (doubleClick) {
      // double click action by starting a timer with a delay of at least 200ms
      timer = setTimeout(executeCallback.bind(props), delay);
    }

    await sleep(800);
  }

  return timer;
};

const executeCallback = async () => {
  try {
    const { upButton, downButton } = await getElement(
      this.page,
      this.title,
      this.buttonGroupIndex,
      this.action
    );
    const element = action === "up" ? upButton : downButton;
    element.click();
    await sleep(400);
    this.callback(upButton, downButton);
  } catch (e) {
    console.error(e);
  }
};

const hasActionHappened = async (page, title, buttonGroupIndex) => {
  let itWorked = false;
  let lastPercent = -1;
  console.log("getContainer - hasActionHappened");
  const container = await getContainer(page, title, buttonGroupIndex);
  if (!container) {
    return itWorked;
  }
  await sleep(1200);
  for (let i = 0; i < 5; i++) {
    const texts = await container.$$eval("div", (divs) =>
      divs.map((div) => div.innerText)
    );
    const textWithPercent = texts.find((text) => text.includes("%"));
    const currentPercent = textWithPercent
      ? parseInt(textWithPercent.split("(")[1].split(")")[0].replace("%", ""))
      : -1;
    console.log("--> ", { textWithPercent, currentPercent });
    if (lastPercent !== currentPercent) {
      itWorked = true;
      break;
    }
    lastPercent = currentPercent;
    await sleep(400 * i);
  }

  return itWorked;
};

const getElement = async (page, title, buttonGroupIndex) => {
  console.log("getContainer - getElement");
  const container = await getContainer(page, title, buttonGroupIndex);
  if (!container) {
    return { upButton: null, downButton: null };
  }
  const downButtons = await container.$$(
    "path[d='M2.253 8.336a1 1 0 011.411-.083L12 15.663l8.336-7.41a1 1 0 011.328 1.494l-9 8a1 1 0 01-1.328 0l-9-8a1 1 0 01-.083-1.411z']"
  );
  const upButtons = await container.$$(
    "path[d='M11.336 6.253a1 1 0 011.328 0l9 8a1 1 0 01-1.328 1.494L12 8.337l-8.336 7.41a1 1 0 01-1.328-1.494l9-8z']"
  );

  if (upButtons.length > 0 && downButtons.length > 0) {
    return { upButton: upButtons[0], downButton: downButtons[0] };
  }

  return { upButton: null, downButton: null };
};

const findParentButton = async (element) => {
  const parentElement = await element.$x("..");
  const parentRole =
    parentElement && parentElement.length
      ? await element.$eval(parentElement[0], (el) => el.getAttribute("role"))
      : null;
  if (
    parentElement &&
    parentElement[0] &&
    (!parentRole || parentRole !== "button")
  ) {
    return findParentButton(parentElement[0]);
  } else if (
    parentElement &&
    parentElement[0] &&
    !!parentRole &&
    parentRole === "button"
  ) {
    1;
    return parentElement[0];
  }
  return null;
};

module.exports = {
  clickUpDownOfTitle,
};
