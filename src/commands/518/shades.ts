import { Page } from "puppeteer";
import { PuppetJalousie } from "src/puppeteer/puppet.jalousie";
import { sleep } from "src/utils/sleep";

export class Apartment518Shades {
  page: Page | null;
  jobsRunning: string[] = [];

  constructor(page: Page | null) {
    this.page = page;
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
      const newJobRunning = [
        ...this.jobsRunning.filter((jr) => jr !== `${room} [${blockIndex}]`),
      ];
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
   * http://localhost:9001/exec/518/shades
   * http://localhost:9001/exec/518/shades?lg=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
   */
  async run(query: Record<string, any>) {
    const { room } = query;
    if (room === "Livingroom" || room === "All") {
      await this.livingroom(query);
    }
    if (room === "Kitchen" || room === "All") {
      await this.kitchen(query);
    }
    if (room === "Loggia" || room === "All") {
      await this.loggia(query);
    }
    if (room === "Bedroom" || room === "All") {
      await this.bedroom(query);
    }
  }

  livingroom = async (query: Record<string, any>) => {
    let delay2 = 0;
    let delay3 = 0;
    let delay4 = 0;

    const puppet = new PuppetJalousie(this.page, "Wohnzimmer", query);

    if (!!query.lg && !this.isJobRunning("Wohnzimmer", 4)) {
      delay4 = await puppet.controlJalousie({
        blockIndex: 4,
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Wohnzimmer", 4);
    }

    if (!this.isJobRunning("Wohnzimmer", 2)) {
      delay2 = await puppet.controlJalousie({
        blockIndex: 2,
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Wohnzimmer", 2);
    }

    if (!this.isJobRunning("Wohnzimmer", 3)) {
      delay3 = await puppet.controlJalousie({
        blockIndex: 3,
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Wohnzimmer", 3);
    }

    await sleep(Math.max(delay2, delay3, delay4));
  };

  bedroom = async (query: Record<string, any>) => {
    if (this.isJobRunning("Zimmer 1", 1)) {
      return;
    }

    const puppet = new PuppetJalousie(this.page, "Zimmer 1", query);

    const delay = await puppet.controlJalousie({
      blockIndex: 1,
      callback: this.resetJobRunning,
    });
    this.setJobRunning("Zimmer 1", 1);
    await sleep(delay);
  };

  kitchen = async (query: Record<string, any>) => {
    if (this.isJobRunning("Küche", 1)) {
      return;
    }

    const puppet = new PuppetJalousie(this.page, "Küche", query);

    const delay = await puppet.controlJalousie({
      blockIndex: 1,
      callback: this.resetJobRunning,
    });
    this.setJobRunning("Küche", 1);
    await sleep(delay);
  };

  loggia = async (query: Record<string, any>) => {
    let delay1 = 0;
    let delay2 = 0;

    const puppet = new PuppetJalousie(this.page, "Loggia", query);

    if (!this.isJobRunning("Loggia", 1)) {
      delay1 = await puppet.controlJalousieWithAction({
        blockIndex: 1,
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Loggia", 1);
    }

    if (!this.isJobRunning("Loggia", 2)) {
      delay2 = await puppet.controlJalousieWithAction({
        blockIndex: 2,
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Loggia", 2);
    }

    await sleep(Math.max(delay1, delay2));
  };
}
