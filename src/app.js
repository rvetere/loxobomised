const fs = require("fs");
const path = require("path");
const express = require("express");
const { LoxoneWebinterface } = require("./lib/loxoneWebinterface");

let pool = [];
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

initPool().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server ready and listening on port ${port}`);
  });
});

async function initPool() {
  const rooms = [
    "Wohnzimmer",
    "Küche",
    "Entrée",
    "WC-Dusche",
    "Zimmer 1",
    "Loggia",
  ];
  const instances = [];

  for (let room of rooms) {
    let instance = new LoxoneWebinterface(room);
    await instance.init();
    instances.push(instance);
  }

  pool = instances;
}
