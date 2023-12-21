import { PuppetJalousie } from "src/puppeteer/puppet.jalousie";
import { PuppeteerController } from "src/puppeteer/puppeteer.controller";
import { sleep } from "src/utils/sleep";
import { BaseCommander } from "./base.commander";

type ActiveTimer = {
  timer: NodeJS.Timeout;
  room: string;
  blockIndex: number;
};

export class JalousieCommander extends BaseCommander {
  jobsRunning: string[] = [];
  activeTimers: ActiveTimer[] = [];

  constructor(controller: PuppeteerController, category: string) {
    super(controller, category);
    this.removeActiveTimer = this.removeActiveTimer.bind(this);
    this.run = this.run.bind(this);
  }

  removeActiveTimer = (room: string, blockIndex: number) => {
    const newActiveTimers = [
      ...this.activeTimers.filter((at) => at.room !== room && at.blockIndex !== blockIndex),
    ];
    this.activeTimers = newActiveTimers;
  };

  async run(room: string, blockIndex: string, givenValue: string, query: Record<string, any>) {
    const page = this.controller.getPage();
    if (!page) {
      console.log(`   🚨 Puppeteer page not available! 🚨`);
      return;
    }

    console.log(
      `🤖 JalousieCommander.run(${room}, ${blockIndex}, ${givenValue}, ${JSON.stringify(query)})`
    );

    const puppet = new PuppetJalousie(this.controller, page, this.category, room, query);
    const blockIndexes = blockIndex.includes(",") ? blockIndex.split(",") : [blockIndex];
    const values = givenValue.includes(",") ? givenValue.split(",") : [givenValue];
    for (const indexStr of blockIndexes) {
      const index = parseInt(indexStr, 10);
      const value = values[index] ? values[index] : values[0];

      const activeTimer = this.activeTimers.find(
        (at) => at.room === room && at.blockIndex === index
      )?.timer;
      const { timer } = !!query.tilt
        ? await puppet.controlJalousie(
            index,
            { percentToSet: parseInt(value, 10), tilt: query.tilt, jalousieType: query.type },
            activeTimer,
            this.removeActiveTimer
          )
        : await puppet.controlJalousieWithAction(
            index,
            parseInt(value, 10),
            activeTimer,
            this.removeActiveTimer
          );

      if (timer) {
        this.activeTimers.push({
          timer,
          room,
          blockIndex: index,
        });
      }

      await sleep(2000);
    }
  }
}
