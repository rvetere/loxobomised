const { clickButtonByText } = require("./clickButtonByText");
const { sleep } = require("./sleep");

const apartment = process.env.APARTMENT || "05.18";

const navigate = async (page, target, mainNav = "Räume") => {
  console.log(`Navigating to "${mainNav} - ${target}"`);

  // navigate to mainNav
  try {
    await goTo(page, mainNav);
  } catch (_e) {
    await clickButtonByText(page, mainNav);
    await sleep(500);
  }

  // navigate to target
  try {
    await goTo(page, target);
  } catch (_e) {
    await clickButtonByText(page, target);
    await sleep(500);
  }

  // it can happen that the app starts "loading scripts" again if you navigate trough more than one target in one command run
  // -> so we wait until the name of our apartment is visible again in the UI, this tells us the scripts are loaded
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
  );
  await sleep(500);
};

const goTo = async (page, text) => {
  let foundInTime = false;
  let counter = 0;

  while (counter < 5 && !foundInTime) {
    await clickButtonByText(page, text);

    page
      .waitForFunction(
        `document.querySelector("body").innerText.includes("${text.toUpperCase()}")`
      )
      .then(() => {
        foundInTime = true;
      });

    const poller = setInterval(async () => {
      if (foundInTime) {
        clearInterval(poller);
        return;
      } else {
        console.log("not found yet");
        counter++;
      }

      if (counter >= 5) {
        console.log("not found, maximum attempts reached!");
        clearInterval(poller);
      }
    }, 250);

    if (!foundInTime) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  return new Promise((resolve, reject) => {
    if (foundInTime) {
      resolve();
    } else {
      reject("timeout in finding nav result!");
    }
  });
};

module.exports = {
  navigate,
};
