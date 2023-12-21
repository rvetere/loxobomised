import { Router } from "express";
import { LoxoneController } from "./loxone.controller";
import { initPool } from "./initPool";

const router = Router();

const loxoneController = new LoxoneController();
initPool().then((pool) => {
  loxoneController.setPool(pool);
});

router
  .get("/state/:device/:room/:blockIndex", loxoneController.state)
  .get("/execute/:device/:room/:blockIndex/:value", loxoneController.execute);

export default router;
