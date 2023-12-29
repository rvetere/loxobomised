import type { Request, Response } from "express";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { CommandType, ControllerType, LoxoneCategoryEnum } from "src/types";
import { sleep } from "src/utils/sleep";
import { JalousieCommander } from "./jalousie.commander";
import { LightCommander } from "./light.commander";
import { VentilationCommander } from "./ventilation.commander";

export class LoxoneController {
  initialized = false;
  pool: PuppeteerController[];
  commands: Record<string, any> = {};
  requestTstamp: number | undefined;
  requestCounter: Record<string, number> = {};
  resetTimer: any | null = null;
  lightCommander: LightCommander | null;
  jalousieCommander: JalousieCommander | null;
  ventilationCommander: VentilationCommander | null;
  lightCommanderOverlay: LightCommander | null;
  ventilationCommanderOverlay: VentilationCommander | null;
  jalousieCommanderOverlay: JalousieCommander | null;

  constructor() {
    this.pool = [];
    this.lightCommander = null;
    this.jalousieCommander = null;
    this.ventilationCommander = null;
    this.lightCommanderOverlay = null;
    this.jalousieCommanderOverlay = null;
    this.ventilationCommanderOverlay = null;

    this.getCommander = this.getCommander.bind(this);
    this.setPool = this.setPool.bind(this);
    this.rampUp = this.rampUp.bind(this);
    this.resetRequestCounter = this.resetRequestCounter.bind(this);
    this.state = this.state.bind(this);
    this.execute = this.execute.bind(this);
  }

  private resetRequestCounter() {
    this.requestCounter = {};
  }

  private rampUp(device: CommandType, type: ControllerType) {
    const key = `${device}-${type}`;
    const now = new Date();
    const time = now.getTime();
    const ellapsedMs = this.requestTstamp ? time - this.requestTstamp : 200;
    this.requestTstamp = time;

    if (ellapsedMs < 200) {
      this.requestCounter[key] = (this.requestCounter[key] || 0) + 1;
    }

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = setTimeout(this.resetRequestCounter, 1000 * 4);

    const counter = this.requestCounter[key] || 0;
    const additionalDelay = device === "jalousie" && type === "overlay" ? 1800 : 700;
    const delay = counter * additionalDelay;
    return {
      delay: delay,
      formattedDate: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    };
  }

  getController = (category: LoxoneCategoryEnum, type: ControllerType = "direct") => {
    const instance = this.pool.find((p) => p.category === category && p.type === type);
    if (instance) {
      return instance;
    }

    return null;
  };

  setPool(pool: PuppeteerController[]) {
    this.pool = pool;

    const ventilationController = this.getController(LoxoneCategoryEnum.ventilation);
    const lightController = this.getController(LoxoneCategoryEnum.light);
    const shadesController = this.getController(LoxoneCategoryEnum.jalousie);
    const ventilationControllerOverlay = this.getController(
      LoxoneCategoryEnum.ventilation,
      "overlay"
    );
    const lightControllerOverlay = this.getController(LoxoneCategoryEnum.light, "overlay");
    const jalousieControllerOverlay = this.getController(LoxoneCategoryEnum.jalousie, "overlay");

    this.lightCommander =
      lightController && new LightCommander(lightController, LoxoneCategoryEnum.light);
    this.ventilationCommander =
      ventilationController &&
      new VentilationCommander(ventilationController, LoxoneCategoryEnum.ventilation);
    this.jalousieCommander =
      shadesController && new JalousieCommander(shadesController, LoxoneCategoryEnum.jalousie);
    this.lightCommanderOverlay =
      lightControllerOverlay &&
      new LightCommander(lightControllerOverlay, LoxoneCategoryEnum.light);
    this.ventilationCommanderOverlay =
      ventilationControllerOverlay &&
      new VentilationCommander(ventilationControllerOverlay, LoxoneCategoryEnum.ventilation);
    this.jalousieCommanderOverlay =
      jalousieControllerOverlay &&
      new JalousieCommander(jalousieControllerOverlay, LoxoneCategoryEnum.jalousie);

    this.initialized = true;
    console.log("🤖 All commanders initialized");
  }

  getCommander(device: CommandType, type: ControllerType = "direct") {
    switch (device) {
      case "jalousie":
        return type === "direct" ? this.jalousieCommander : this.jalousieCommanderOverlay;
      case "ventilation":
        return type === "direct" ? this.ventilationCommander : this.ventilationCommanderOverlay;
      case "light":
        return type === "direct" ? this.lightCommander : this.lightCommanderOverlay;
      default: {
        console.log(`🚨 Unknown device "${device}"`);
        return null;
      }
    }
  }

  state = async (req: Request, res: Response) => {
    if (!this.initialized) {
      return res.status(500).send("🚨 Not initialized yet!");
    }

    const { room, device, blockIndex } = req.params;
    const commander = this.getCommander(device as CommandType, "direct");
    if (commander) {
      try {
        const isOn = await commander.getState(room, blockIndex, req.query);
        return res.send(isOn ? "1" : "0");
      } catch (e: any) {
        console.error(e);
        return res.status(500).send("Server error!");
      }
    }
    const message = `🚨 Commander not found for device "${device}", active pool: ${this.pool
      .map((p) => p.category)
      .join(", ")}`;
    console.error(message);
    return res.json({
      message,
    });
  };

  execute = async (req: Request, res: Response) => {
    if (!this.initialized) {
      return res.status(500).send("🚨 Not initialized yet!");
    }

    const { room, device, blockIndex, value } = req.params;

    // jalousie with blinds and on-off toggles of lights can be controlled trough directly, without opening overlays
    let type: ControllerType = "direct";
    if (device === "jalousie" && !req.query.tilt) {
      // no "?tilt=n" means it is a "awning" which can only be controlled trough overlay controls
      type = "overlay";
    } else if (device === "light" && !isNaN(parseInt(value))) {
      // if value is a number, it is a dimmer which can only be controlled trough overlay controls
      type = "overlay";
    }

    const deviceType = device as CommandType;
    const commander = this.getCommander(deviceType, type);
    if (commander) {
      const { formattedDate, delay } = this.rampUp(deviceType, type);
      console.log(
        `🤖 [${formattedDate}] Executing command "${room}(${device}) [${blockIndex}], ${type}" with delay: ${delay}ms`
      );
      await sleep(delay);
      try {
        await commander.run(room, blockIndex, value, req.query);
      } catch (e: any) {
        console.error(e);
        return res.status(500).send("Server error!");
      }

      return res.status(200).send("OK");
    }
    const message = `🚨 Commander not found for device "${device}", active pool: ${this.pool
      .map((p) => p.category)
      .join(", ")}`;
    console.error(message);
    return res.status(500).send(message);
  };
}
