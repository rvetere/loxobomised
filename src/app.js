const fs = require("fs");
const path = require("path");
const express = require("express");
const { LoxoneWebinterface, sleep } = require("./lib");
require("dotenv").config();

let pool = [];

const categoriesRaw =
  process.env.CATEGORIES || "Wohnzimmer,Küche,Entrée,WC-Dusche,Loggia";

function initApp(category) {
  const port = process.env.PORT || 3000;
  const app = express();

  app.get("/exec/*", async (req, res) => {
    const tstamp = new Date().getTime();
    global.requestDelayCounter = 0;
    global.lastRequestTstamp = tstamp;
    const delaySinceLastRequest = global.lastResponseTstamp
      ? tstamp - global.lastResponseTstamp
      : 1000 * 60 * 60 * 24;
    if (delaySinceLastRequest < 800) {
      clearTimeout(global.resetDelayCounter);
      global.resetDelayCounter = setTimeout(() => {
        global.requestDelayCounter = 0;
      }, 1000 * 6);
      global.requestDelayCounter = global.requestDelayCounter + 1;
      console.log(
        `- 🚨🚨 Too many requests. Last request was ${delaySinceLastRequest}ms ago. Delaycounter: ${global.requestDelayCounter}`
      );
    }
    const randomDelay = getRandomDelay(global.lastRandomDelay);
    console.log(
      `- 🚀 Random delay to sleep before command run: ${randomDelay}ms`
    );
    await sleep(randomDelay);
    global.lastRandomDelay = randomDelay;

    const command = req.params[0];
    const commandPath = path.join(__dirname, "commands", `${command}.js`);

    fs.access(commandPath, fs.constants.F_OK, async (err) => {
      if (err) {
        console.error(`Command ${command} does not exist.`);
        res.status(404).send(`Command ${command} does not exist.`);
      } else {
        const commandModule = require(commandPath);
        if (typeof commandModule.run === "function") {
          await commandModule.run(pool, req.query);
          res.send(`Command ${command} executed successfully.`);
        } else {
          console.error(`Command ${command} does not have a run function.`);
          res
            .status(500)
            .send(`Command ${command} does not have a run function.`);
        }
      }
    });
  });

  initPool(category).then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server ready and listening on port ${port}`);
    });
  });
}

// Generate a random delay between 0 and 2000 miliseconds
// -> the new value must differ by at least 400 miliseconds from the last value
function getRandomDelay(lastRandomDelay) {
  const randomDelay = Math.floor(Math.random() * 2000);
  if (lastRandomDelay) {
    const diff = Math.abs(randomDelay - lastRandomDelay);
    if (diff < 400) {
      return getRandomDelay(lastRandomDelay);
    }
  }
  return randomDelay;
}

async function initPool(category) {
  const categorys = category ? [category] : categoriesRaw.split(",");
  console.log(`🤖 Initializing pool with categorys ${categorys}`);
  const instances = [];

  let i = 0;
  for (let _category of categorys) {
    let instance = new LoxoneWebinterface(_category, i);
    await instance.init();
    instances.push(instance);
    i = i + 1;
  }

  pool = instances;
}

const args = process.argv;
let category = args[args.length - 1];
if (category && category.startsWith("--category=")) {
  category = category.replace("--category=", "").replace("_", " ");
} else {
  category = null;
}
initApp(category);
