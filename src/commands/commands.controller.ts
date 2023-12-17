import { Request, Response } from "express";
import { Apartment518Shades } from "./518/shades";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { Apartment518Ventilation } from "./518/ventilation";
import { Apartment518Light } from "./518/light";
import { Apartment518Test } from "./518/test";

const getPage = (pool: PuppeteerController[], category: string) => {
  const instance = pool.find((p) => p.category === category);
  if (instance) {
    const page = instance.getPage();
    if (page) {
      return page;
    }
    return null;
  }

  return null;
};

export class CommandsController {
  initialized = false;
  pool: PuppeteerController[];
  commands: Record<string, any> = {};
  lastRequestTstamp: number | undefined;
  requestCounter = 0;
  resetTimer: any | null = null;

  constructor() {
    this.pool = [];
    this.index = this.index.bind(this);
    this.execute = this.execute.bind(this);
    this.resetRequestCounter = this.resetRequestCounter.bind(this);
    this.setPool = this.setPool.bind(this);
  }

  resetRequestCounter() {
    this.requestCounter = 0;
  }

  setPool(pool: PuppeteerController[]) {
    this.pool = pool;
    this.commands = {
      "518-test": new Apartment518Test(getPage(this.pool, "Lüftung")),
      "518-light": new Apartment518Light(getPage(this.pool, "Beleuchtung")),
      "518-ventilation": new Apartment518Ventilation(
        getPage(this.pool, "Lüftung")
      ),
      "518-shades": new Apartment518Shades(getPage(this.pool, "Beschattung")),
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
      // log formatted date with miliseconds
      const now = new Date();
      const formattedDate = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;

      const timeEllapsedMs = this.lastRequestTstamp
        ? now.getTime() - this.lastRequestTstamp
        : -1;
      this.lastRequestTstamp = now.getTime();
      if (timeEllapsedMs < 200) {
        this.requestCounter = this.requestCounter + 1;
      }
      if (this.resetTimer) {
        clearTimeout(this.resetTimer);
      }
      this.resetTimer = setTimeout(this.resetRequestCounter, 1000 * 3);

      console.log(
        `🤖 [${formattedDate}] Executing command "${name}", time ellapsed: ${timeEllapsedMs} (${this.requestCounter})`
      );

      const [apartment, category] = name.split("-");
      const command = this.commands[`${apartment}-${category}`];

      command?.run(req.query).then(() => {
        const message = `✅ Executed "${name}" successfully!`;
        console.log(message);
        res.json({ message });
      });

      return;
    }

    return res.json({
      message: `Incorrect format for parameter "${name}", must be "111-category"`,
    });
  }
}
