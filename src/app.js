const fs = require("fs");
const path = require("path");
const express = require("express");
const { LoxoneWebinterface } = require("./lib/loxoneWebinterface");
require("dotenv").config();

let pool = [];

const categoriesRaw =
  process.env.CATEGORIES || "Wohnzimmer,Küche,Entrée,WC-Dusche,Loggia";

function initApp(category) {
  const port = process.env.PORT || 3000;
  const app = express();

  app.get("/exec/*", async (req, res) => {
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
