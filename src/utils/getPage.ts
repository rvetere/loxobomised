import { PuppeteerController } from "src/puppeteer/puppeteer.controller";

export const getPage = (pool: PuppeteerController[], category: string) => {
  const instance = pool.find((p) => p.category === category);
  if (instance) {
    const page = instance.getPage();
    if (page) {
      return page;
    }
  }

  return null;
};
