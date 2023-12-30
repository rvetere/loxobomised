import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { LoxoneCategoryEnum } from "src/types";

const categoriesRaw = process.env.CATEGORIES || "Beleuchtung,Beschattung,Lüftung";

const getCategoryFromArgs = () => {
  const args = process.argv;
  let category = args[args.length - 1];
  if (category && category.startsWith("--category=")) {
    category = category.replace("--category=", "").replace("_", " ");
  } else {
    category = "";
  }
  return category;
};

export async function initPool() {
  const category = getCategoryFromArgs();
  const categories = category ? [category] : categoriesRaw.split(",");
  console.log(`🤖 Initializing pool with categories "${categories}"`);
  const instances = [];

  for (let category of categories) {
    let instanceForDirectControls = new PuppeteerController(category as LoxoneCategoryEnum);
    let instanceForOverlayControls = null;

    if (category !== LoxoneCategoryEnum.ventilation && category !== LoxoneCategoryEnum.jalousie) {
      instanceForOverlayControls = new PuppeteerController(
        category as LoxoneCategoryEnum,
        "overlay"
      );
      await instanceForOverlayControls.init();
      instances.push(instanceForOverlayControls);
    }

    await instanceForDirectControls.init();
    instances.push(instanceForDirectControls);
  }

  return instances;
}
