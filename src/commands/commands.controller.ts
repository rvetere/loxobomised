import { Request, Response } from "express";
import { JalousieCommander } from "./jalousie.commander";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { VentilationCommander } from "./ventilation.commander";
import { LightCommander } from "./light.commander";
import { sleep } from "src/utils/sleep";
import { getPage } from "src/utils/getPage";

export class CommandsController {
  initialized = false;
  pool: PuppeteerController[];
  commands: Record<string, any> = {};
  requestTstamp: number | undefined;
  requestCounter: Record<string, number> = {};
  resetTimer: any | null = null;
  lightCommander: LightCommander | null;
  jalousieCommander: JalousieCommander | null;
  ventilationCommander: VentilationCommander | null;

  constructor() {
    this.pool = [];
    this.lightCommander = null;
    this.jalousieCommander = null;
    this.ventilationCommander = null;

    this.index = this.index.bind(this);
    this.execute = this.execute.bind(this);
    this.setPool = this.setPool.bind(this);
    this.rampUp = this.rampUp.bind(this);
    this.resetRequestCounter = this.resetRequestCounter.bind(this);
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

    // @ts-expect-error
    const lastRandomDelay = global.lastRandomDelay || 0;
    const randomDelay = this.getRandomDelay(lastRandomDelay);
    const counter = this.requestCounter[category] || 0;
    const delay = counter * (category === "shades" ? 1800 : 350);
    return {
      delay: delay > 5000 ? delay - randomDelay : delay + randomDelay,
      formattedDate: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    };
  }

  /**
   * Get a random value between 0 and 1500, but at least 500 and with a difference of at least 500 to the last value
   */
  getRandomDelay(lastDelay: number): number {
    const randomDelay = Math.floor(Math.random() * 1500);
    if (randomDelay < 500) {
      return this.getRandomDelay(lastDelay);
    }
    if (Math.abs(randomDelay - lastDelay) < 500) {
      return this.getRandomDelay(lastDelay);
    }
    return randomDelay;
  }

  setPool(pool: PuppeteerController[]) {
    this.pool = pool;

    const pageVentilation = getPage(this.pool, "Lüftung");
    const pageLight = getPage(this.pool, "Beleuchtung");
    const pageShades = getPage(this.pool, "Beschattung");

    this.lightCommander = pageLight && new LightCommander(pageLight, "Beleuchtung");
    this.ventilationCommander =
      pageVentilation && new VentilationCommander(pageVentilation, "Lüftung");
    this.jalousieCommander = pageShades && new JalousieCommander(pageShades, "Beschattung");

    this.initialized = true;
    console.log("🤖 All commanders initialized");
  }

  index(req: Request, res: Response) {
    return res.json({ message: "🤖 Commands List" });
  }

  execute(req: Request, res: Response) {
    if (!this.initialized) {
      return res.json({ message: "🚨 Not initialized yet!" });
    }

    const { room, device, blockIndex, value } = req.params;
    const { formattedDate, delay } = this.rampUp(device);
    console.log(
      `🤖 [${formattedDate}] Executing command "${room}(${device}) [${blockIndex}]" with delay: ${delay}ms`
    );

    sleep(delay).then(
      (() => {
        switch (device) {
          case "jalousie":
            this.jalousieCommander?.run(room, blockIndex, value, req.query);
            res.json({ message: `✅ Executed successful!` });
            break;
          case "ventilation":
            this.ventilationCommander?.run(room, blockIndex, value, req.query);
            res.json({ message: `✅ Executed successful!` });
            break;
          case "light":
            this.lightCommander?.run(room, blockIndex, value, req.query);
            res.json({ message: `✅ Executed successful!` });
            break;
          default:
            res.json({ message: `🚨 Unknown device! ${device}` });
            break;
        }
      }).bind(this)
    );

    return;
  }
}
