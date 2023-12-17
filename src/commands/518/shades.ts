import { Page } from "puppeteer";
import { controlJalousie } from "src/puppeteer/utils/controlJalousie";
import { controlJalousieWithAction } from "src/puppeteer/utils/controlJalousieWithAction";
import { sleep } from "src/utils/sleep";

export class Apartment518Shades {
  page: Page | null;
  jobsRunning: string[] = [];

  constructor(page: Page | null) {
    this.page = page;
    this.resetJobRunning = this.resetJobRunning.bind(this);
  }

  setJobRunning = (room: string, buttonGroupIndex: number) => {
    const newJobRunning = [...this.jobsRunning];
    newJobRunning.push(`${room} [${buttonGroupIndex}]`);
    this.jobsRunning = newJobRunning;
    // console.log("   > Jobs running:", this.jobsRunning);
  };

  resetJobRunning = (room: string, buttonGroupIndex: number) => {
    setTimeout(() => {
      const newJobRunning = [
        ...this.jobsRunning.filter(
          (jr) => jr !== `${room} [${buttonGroupIndex}]`
        ),
      ];
      this.jobsRunning = newJobRunning;
      // console.log(
      //   `   🔥 Reset ${room} [${buttonGroupIndex}], jobs running:`,
      //   this.jobsRunning
      // );
    }, 400);
  };

  isJobRunning = (room: string, buttonGroupIndex: number) => {
    const isRunning = this.jobsRunning.includes(
      `${room} [${buttonGroupIndex}]`
    );
    if (isRunning) {
      console.log(`   🚨 Job ${room} [${buttonGroupIndex}] is running! 🚨`);
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

    if (!!query.lg && !this.isJobRunning("Wohnzimmer", 4)) {
      delay4 = await controlJalousie({
        page: this.page,
        room: "Wohnzimmer",
        buttonGroupIndex: 4,
        percentToSet: parseInt(query.percent4 || "100", 10),
        finalPosition: parseInt(query.finalPosition4 || "2", 10),
        rolloType: "Loggia",
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Wohnzimmer", 4);
    }

    if (!this.isJobRunning("Wohnzimmer", 2)) {
      delay2 = await controlJalousie({
        page: this.page,
        room: "Wohnzimmer",
        buttonGroupIndex: 2,
        percentToSet: parseInt(query.percent2 || "66", 10),
        finalPosition: parseInt(query.finalPosition2 || "1", 10),
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Wohnzimmer", 2);
    }

    if (!this.isJobRunning("Wohnzimmer", 3)) {
      delay3 = await controlJalousie({
        page: this.page,
        room: "Wohnzimmer",
        buttonGroupIndex: 3,
        percentToSet: parseInt(query.percent3 || "72", 10),
        finalPosition: parseInt(query.finalPosition3 || "1", 10),
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

    const delay = await controlJalousie({
      page: this.page,
      room: "Zimmer 1",
      buttonGroupIndex: 1,
      percentToSet: parseInt(query.brPercent || "45", 10),
      finalPosition: parseInt(query.brFinalPosition || "1", 10),
      callback: this.resetJobRunning,
    });
    this.setJobRunning("Zimmer 1", 1);
    await sleep(delay);
  };

  kitchen = async (query: Record<string, any>) => {
    if (this.isJobRunning("Küche", 1)) {
      return;
    }

    const delay = await controlJalousie({
      page: this.page,
      room: "Küche",
      buttonGroupIndex: 1,
      percentToSet: parseInt(query.kcPercent || "72", 10),
      finalPosition: parseInt(query.kcFinalPosition || "1", 10),
      callback: this.resetJobRunning,
    });
    this.setJobRunning("Küche", 1);
    await sleep(delay);
  };

  loggia = async (query: Record<string, any>) => {
    let delay1 = 0;
    let delay2 = 0;

    if (!this.isJobRunning("Loggia", 1)) {
      delay1 = await controlJalousieWithAction({
        page: this.page,
        room: "Loggia",
        buttonGroupIndex: 1,
        percentToSet: parseInt(query.lgPercent1 || "50", 10),
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Loggia", 1);
    }

    if (!this.isJobRunning("Loggia", 2)) {
      delay2 = await controlJalousieWithAction({
        page: this.page,
        room: "Loggia",
        buttonGroupIndex: 2,
        percentToSet: parseInt(query.lgPercent2 || "33", 10),
        callback: this.resetJobRunning,
      });
      this.setJobRunning("Loggia", 2);
    }

    await sleep(Math.max(delay1, delay2));
  };
}
