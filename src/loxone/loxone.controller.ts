import { Request, Response } from "express";
import { JalousieCommander } from "./jalousie.commander";
import { ControllerType, PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { VentilationCommander } from "./ventilation.commander";
import { LightCommander } from "./light.commander";
import { sleep } from "src/utils/sleep";

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

  private rampUp(category: string) {
    const now = new Date();
    const time = now.getTime();
    const ellapsedMs = this.requestTstamp ? time - this.requestTstamp : 200;
    this.requestTstamp = time;

    if (ellapsedMs < 200) {
      this.requestCounter[category] = (this.requestCounter[category] || 0) + 1;
    }

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = setTimeout(this.resetRequestCounter, 1000 * 4);

    const counter = this.requestCounter[category] || 0;
    const delay = counter * (category === "shades" ? 1800 : 350);
    return {
      delay: delay,
      formattedDate: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    };
  }

  getController = (category: string, type: ControllerType = "direct") => {
    const instance = this.pool.find((p) => p.category === category && p.type === type);
    if (instance) {
      return instance;
    }

    return null;
  };

  setPool(pool: PuppeteerController[]) {
    this.pool = pool;

    const ventilationController = this.getController("Lüftung");
    const lightController = this.getController("Beleuchtung");
    const shadesController = this.getController("Beschattung");
    const ventilationControllerOverlay = this.getController("Lüftung", "overlay");
    const lightControllerOverlay = this.getController("Beleuchtung", "overlay");
    const shadesControllerOverlay = this.getController("Beschattung", "overlay");

    this.lightCommander = lightController && new LightCommander(lightController, "Beleuchtung");
    this.ventilationCommander =
      ventilationController && new VentilationCommander(ventilationController, "Lüftung");
    this.jalousieCommander =
      shadesController && new JalousieCommander(shadesController, "Beschattung");
    this.lightCommanderOverlay =
      lightControllerOverlay && new LightCommander(lightControllerOverlay, "Beleuchtung");
    this.ventilationCommanderOverlay =
      ventilationControllerOverlay &&
      new VentilationCommander(ventilationControllerOverlay, "Lüftung");
    this.jalousieCommanderOverlay =
      shadesControllerOverlay && new JalousieCommander(shadesControllerOverlay, "Beschattung");

    this.initialized = true;
    console.log("🤖 All commanders initialized");
  }

  getCommander(device: string, type: ControllerType = "direct") {
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
      return res.json({ message: "🚨 Not initialized yet!" });
    }

    const { room, device, blockIndex } = req.params;
    const commander = this.getCommander(device, device === "ventilation" ? "overlay" : "direct");
    if (commander) {
      const isOn = await commander.getState(room, blockIndex);
      return res.send(isOn ? "1" : "0");
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
      return res.json({ message: "🚨 Not initialized yet!" });
    }

    const { room, device, blockIndex, value } = req.params;

    // jalousie with blinds and on-off toggles of lights can be controlled trough directly, without opening overlays
    let type: ControllerType = "direct";
    if (device === "jalousie" && !req.query.tilt) {
      // no "?tilt=n" means it is a "markise" which can only be controlled trough overlay controls
      type = "overlay";
    } else if (device === "light" && !isNaN(parseInt(value))) {
      // if value is a number, it is a dimmer which can only be controlled trough overlay controls
      type = "overlay";
    }

    const commander = this.getCommander(device, type);
    if (commander) {
      const { formattedDate, delay } = this.rampUp(`${device}-${type}`);
      console.log(
        `🤖 [${formattedDate}] Executing command "${room}(${device}) [${blockIndex}], ${type}" with delay: ${delay}ms`
      );
      await sleep(delay);
      await commander.run(room, blockIndex, value, req.query);

      return res.json({ message: `✅ Command executed successful!` });
    }
    const message = `🚨 Commander not found for device "${device}", active pool: ${this.pool
      .map((p) => p.category)
      .join(", ")}`;
    console.error(message);
    return res.json({
      message,
    });
  };
}
