import { Router } from "express";
import { CommandsController } from "./commands.controller";
import { initPool } from "./initPool";

const router = Router();

const commandsController = new CommandsController();
initPool().then((pool) => {
  commandsController.setPool(pool);
});

router
  .get("/", commandsController.index)
  .get("/:device/:room/:blockIndex/:value", commandsController.execute);

export default router;
