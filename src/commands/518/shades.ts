import { Page } from "puppeteer";
import { PuppetJalousie } from "src/puppeteer/puppet.jalousie";
import { sleep } from "src/utils/sleep";

export class Apartment518Shades {
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
   * http://localhost:9001/exec/518-shades?room=All&blockIndex=2,3,4
   * http://localhost:9001/exec/518-shades?room=Livingroom&blockIndex=2&percent2=33&finalPosition2=2
   * http://localhost:9001/exec/518-shades?room=All&blockIndex=
   * http://localhost:9001/exec/518-shades?room=All&with2=1&with3=1&with4=1
   * http://localhost:9001/exec/518-shades?room=All&with4=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
   */
  async run(query: Record<string, any>) {
    const { room } = query;
    if (room === "Livingroom" || room === "All") {
      console.log("🌥️ Livingroom Shades...");
      await this.livingroom(query);
      await sleep(800);
    }
    if (room === "Kitchen" || room === "All") {
      console.log("🌥️ Kitchen Shades...");
      await this.kitchen(query);
      await sleep(800);
    }
    if (room === "Loggia" || room === "All") {
      console.log("🌥️ Loggia Shades...");
      await this.loggia(query);
      await sleep(800);
    }
    if (room === "Bedroom" || room === "All") {
      console.log("🌥️ Bedroom Shades...");
      await this.bedroom(query);
    }
  }

  livingroom = async (query: Record<string, any>) => {
    let delay2 = 0;
    let delay3 = 0;
    let delay4 = 0;

    const room = "Wohnzimmer";
    const puppet = new PuppetJalousie(this.page, this.category, room, query);
    if ((query.blockIndex || "").includes("4") && !this.isJobRunning(room, 4)) {
      delay4 = await puppet.controlJalousie({
        blockIndex: 4,
        callback: this.resetJobRunning,
      });
      this.setJobRunning(room, 4);
      await sleep(800);
    }

    if ((query.blockIndex || "").includes("3") && !this.isJobRunning(room, 3)) {
      delay3 = await puppet.controlJalousie({
        blockIndex: 3,
        callback: this.resetJobRunning,
      });
      this.setJobRunning(room, 3);
    }

    if ((query.blockIndex || "").includes("2") && !this.isJobRunning(room, 2)) {
      delay2 = await puppet.controlJalousie({
        blockIndex: 2,
        callback: this.resetJobRunning,
      });
      this.setJobRunning(room, 2);
      await sleep(800);
    }

    await sleep(Math.max(delay2, delay3, delay4));
  };

  bedroom = async (query: Record<string, any>) => {
    const room = "Zimmer 1";
    if (this.isJobRunning(room, 1)) {
      return;
    }

    const puppet = new PuppetJalousie(this.page, this.category, room, query);
    const delay = await puppet.controlJalousie({
      blockIndex: 1,
      callback: this.resetJobRunning,
    });
    this.setJobRunning(room, 1);

    await sleep(delay);
  };

  kitchen = async (query: Record<string, any>) => {
    const room = "Küche";
    if (this.isJobRunning("Küche", 1)) {
      return;
    }

    const puppet = new PuppetJalousie(this.page, this.category, room, query);
    const delay = await puppet.controlJalousie({
      blockIndex: 1,
      callback: this.resetJobRunning,
    });
    this.setJobRunning(room, 1);

    await sleep(delay);
  };

  loggia = async (query: Record<string, any>) => {
    const room = "Loggia";
    let delay1 = 0;
    let delay2 = 0;

    const puppet = new PuppetJalousie(this.page, this.category, room, query);
    if ((query.lgBlockIndex || "").includes("1") && !this.isJobRunning(room, 1)) {
      delay1 = await puppet.controlJalousieWithAction({
        blockIndex: 1,
        callback: this.resetJobRunning,
      });
      this.setJobRunning(room, 1);
      await sleep(800);
    }

    if ((query.lgBlockIndex || "").includes("2") && !this.isJobRunning(room, 2)) {
      delay2 = await puppet.controlJalousieWithAction({
        blockIndex: 2,
        callback: this.resetJobRunning,
      });
      this.setJobRunning(room, 2);
    }

    await sleep(Math.max(delay1, delay2));
  };
}
