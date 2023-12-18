import { Request, Response } from "express";
import { Apartment518Shades } from "./518/shades";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { Apartment518Ventilation } from "./518/ventilation";
import { Apartment518Light } from "./518/light";
import { Apartment518Test } from "./518/test";
import { sleep } from "src/utils/sleep";
import { getPage } from "src/utils/getPage";

export class CommandsController {
  initialized = false;
  pool: PuppeteerController[];
  commands: Record<string, any> = {};
  requestTstamp: number | undefined;
  requestCounter: Record<string, number> = {};
  resetTimer: any | null = null;

  constructor() {
    this.pool = [];

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

    return {
      delay: (this.requestCounter[category] || 0) * 1800,
      formattedDate: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    };
  }

  setPool(pool: PuppeteerController[]) {
    this.pool = pool;

    const pageVentilation = getPage(this.pool, "Lüftung");
    const pageLight = getPage(this.pool, "Beleuchtung");
    const pageShades = getPage(this.pool, "Beschattung");

    this.commands = {
      "518-test": pageVentilation && new Apartment518Test(pageVentilation),
      "518-light": pageLight && new Apartment518Light(pageLight),
      "518-ventilation":
        pageVentilation && new Apartment518Ventilation(pageVentilation),
      "518-shades": pageShades && new Apartment518Shades(pageShades),
    };
    this.initialized = true;

    console.log("🤖 Commands initialized");
  }

  index(req: Request, res: Response) {
    return res.json({ message: "🤖 Commands List" });
  }

  execute(req: Request, res: Response) {
    if (!this.initialized) {
      return res.json({ message: "🚨 Not initialized yet!" });
    }

    const { name } = req.params;
    if (name.includes("-")) {
      const [apartment, category] = name.split("-");
      const { formattedDate, delay } = this.rampUp(category);
      console.log(
        `🤖 [${formattedDate}] Executing command "${name}" with delay: ${delay}ms`
      );
      console.log(`   Query: ${JSON.stringify(req.query)}`);

      sleep(delay).then(() => {
        const command = this.commands[`${apartment}-${category}`];

        command?.run(req.query).then(() => {
          res.json({ message: `✅ Executed "${name}" successfully!` });
        });
      });

      return;
    }

    return res.json({
      message: `Incorrect format for parameter "${name}", must be "111-category"`,
    });
  }
}
