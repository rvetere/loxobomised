import { Page } from "puppeteer";
import { PuppetJalousie } from "src/puppeteer/puppet.jalousie";
import { sleep } from "src/utils/sleep";

export class JalousieCommander {
  page: Page;
  category: string;
  jobsRunning: string[] = [];

  constructor(page: Page, category: string) {
    this.page = page;
    this.category = category;
    this.isJobRunning = this.isJobRunning.bind(this);
    this.setJobRunning = this.setJobRunning.bind(this);
    this.resetJobRunning = this.resetJobRunning.bind(this);
    this.run = this.run.bind(this);
  }

  setJobRunning = (room: string, blockIndex: number) => {
    const newJobRunning = [...this.jobsRunning];
    newJobRunning.push(`${room} [${blockIndex}]`);
    this.jobsRunning = newJobRunning;
  };

  resetJobRunning = (room: string, blockIndex: number) => {
    setTimeout(() => {
      const newJobRunning = [...this.jobsRunning.filter((jr) => jr !== `${room} [${blockIndex}]`)];
      this.jobsRunning = newJobRunning;
    }, 400);
  };

  isJobRunning = (room: string, blockIndex: number) => {
    const isRunning = this.jobsRunning.includes(`${room} [${blockIndex}]`);
    if (isRunning) {
      console.log(`   🚨 Job ${room} [${blockIndex}] is running! 🚨`);
    }
    return isRunning;
  };

  /**
   * http://localhost:9001/exec/05.18/livingroom/shades/2?percent2=33&finalPosition2=2
   */
  async run(room: string, blockIndex: string, value: string, query: Record<string, any>) {
    console.log(
      `   JalousieCommander.run(${room}, ${blockIndex}, ${value}, ${JSON.stringify(query)})`
    );

    const puppet = new PuppetJalousie(this.page, this.category, room, query);
    const jalousiesToControl = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const promises = jalousiesToControl.map(
      (async (indexStr: string) => {
        const index = parseInt(indexStr, 10);
        if (!this.isJobRunning(room, index)) {
          const delay = !!query.tilt
            ? await puppet.controlJalousie(
                index,
                { percentToSet: parseInt(value, 10), tilt: query.tilt },
                this.resetJobRunning
              )
            : await puppet.controlJalousieWithAction(
                index,
                parseInt(value, 10),
                this.resetJobRunning
              );
          this.setJobRunning(room, index);
          await sleep(800);
          return delay;
        }
      }).bind(this)
    );
    await Promise.all(promises);
  }
}
