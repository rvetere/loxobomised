import { PuppetJalousie } from "src/puppeteer/puppet.jalousie";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { sleep } from "src/utils/sleep";

export class JalousieCommander {
  controller: PuppeteerController;
  category: string;
  jobsRunning: string[] = [];

  constructor(controller: PuppeteerController, category: string) {
    this.controller = controller;
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
  async run(room: string, blockIndex: string, givenValue: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    console.log(
      `   JalousieCommander.run(${room}, ${blockIndex}, ${givenValue}, ${JSON.stringify(query)})`
    );

    const puppet = new PuppetJalousie(this.controller, page, this.category, room, query);
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const values = givenValue.includes(",") ? givenValue.split(",") : [givenValue];
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const value = values[index] ? values[index] : values[0];
      if (!this.isJobRunning(room, index)) {
        const _delay = !!query.tilt
          ? await puppet.controlJalousie(
              index,
              { percentToSet: parseInt(value, 10), tilt: query.tilt, jalousieType: query.type },
              this.resetJobRunning
            )
          : await puppet.controlJalousieWithAction(
              index,
              parseInt(value, 10),
              this.resetJobRunning
            );
        this.setJobRunning(room, index);

        await sleep(2000);
      }
    }
  }
}
