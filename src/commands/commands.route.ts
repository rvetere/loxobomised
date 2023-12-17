import { Router } from "express";
import { CommandsController } from "./commands.controller";
import { initPool } from "./instrumentPuppeteer";

const router = Router();

const commandsController = new CommandsController();
initPool().then((pool) => {
  commandsController.setPool(pool);
});

router
  .get("/", commandsController.index)
  .get("/:name", commandsController.execute);

export default router;
