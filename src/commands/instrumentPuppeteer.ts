import { PuppeteerController } from "src/puppeteer/puppeteer.controller";

const categoriesRaw =
  process.env.CATEGORIES || "Beleuchtung,Beschattung,Lüftung";

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

  let i = 0;
  for (let c of categories) {
    let instance = new PuppeteerController(c, i);
    await instance.init();
    instances.push(instance);
    i = i + 1;
  }

  return instances;
}
