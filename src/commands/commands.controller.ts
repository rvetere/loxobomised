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

  constructor() {
    this.pool = [];
    this.index = this.index.bind(this);
    this.execute = this.execute.bind(this);
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
    return res.json({ message: "Commands List" });
  }

  execute(req: Request, res: Response) {
    if (!this.initialized) {
      return res.json({ message: "🚨 Not initialized yet!" });
    }

    const { name } = req.params;
    if (name.includes("-")) {
      const [apartment, category] = name.split("-");
      const command = this.commands[`${apartment}-${category}`];
      command?.run(req.query).then(() => {
        res.json({ message: "✅ Executed successfully!" });
      });
      return;
    }

    return res.json({ message: 'Incorrect format, must be "111-category"' });
  }
}
