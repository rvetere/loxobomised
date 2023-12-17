import { Request, Response } from "express";
import { FiveEightTheenShades } from "./518/shades";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { FiveEightTheenVentilation } from "./518/ventilation";
import { FiveEightTheenLight } from "./518/light";
import { FiveEightTheenTest } from "./518/test";

const getPage = (pool: PuppeteerController[], category: string) => {
  const instance = pool.find((p) => p.category === category);
  if (instance) {
    const page = instance.getPage();
    if (page) {
      return page;
    }
    return null;
  }
  console.error(`No instance found for category ${category}`);

  return null;
};

export class CommandsController {
  pool: PuppeteerController[];

  constructor() {
    this.pool = [];
    this.index = this.index.bind(this);
    this.execute = this.execute.bind(this);
  }

  index(req: Request, res: Response) {
    return res.json({ message: "Commands List" });
  }

  execute(req: Request, res: Response) {
    const { name } = req.params;
    if (name.includes("-")) {
      const [apartment, category] = name.split("-");
      switch (apartment) {
        case "518":
          switch (category) {
            case "test":
              {
                const command = new FiveEightTheenTest(
                  getPage(this.pool, "Lüftung"),
                  req.query,
                );
                command.run();
              }
              break;
            case "light":
              {
                const command = new FiveEightTheenLight(
                  getPage(this.pool, "Beleuchtung"),
                  req.query,
                );
                command.run();
              }
              break;
            case "ventilation":
              {
                const command = new FiveEightTheenVentilation(
                  getPage(this.pool, "Lüftung"),
                  req.query,
                );
                command.run();
              }
              break;
            case "shades":
              {
                const command = new FiveEightTheenShades(
                  getPage(this.pool, "Beschattung"),
                  req.query,
                );
                command.run();
              }
              break;
            default:
              console.error(`Category ${category} not found!`);
              break;
          }
          break;
        default:
          console.error(`Apartment ${apartment} not found!`);
          break;
      }
    }

    return res.json({
      message: `Executing command ${name} - ${JSON.stringify(req.query)}`,
    });
  }
}
