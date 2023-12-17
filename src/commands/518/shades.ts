import { Page } from "puppeteer";
import { controlJalousie } from "src/puppeteer/utils/controlJalousie";
import { controlJalousieWithAction } from "src/puppeteer/utils/controlJalousieWithAction";
import { sleep } from "src/utils/sleep";

export class FiveEightTheenShades {
  page: Page | null;
  query: Record<string, any>;

  constructor(page: Page | null, query: Record<string, any>) {
    this.page = page;
    this.query = query;
  }

  /**
   * http://localhost:9001/exec/518/shades
   * http://localhost:9001/exec/518/shades?lg=1&percent2=66&finalPosition2=1&percent3=72&finalPosition3=1&percent4=100&finalPosition4=2
   */
  async run() {
    if (this.query.room === "Livingroom") {
      await this.livingroom();
    }
    if (this.query.room === "Kitchen") {
      await this.kitchen();
    }
    if (this.query.room === "Loggia") {
      await this.loggia();
    }
    if (this.query.room === "Bedroom") {
      await this.bedroom();
    }
  }

  bedroom = async () => {
    if ((global as any).bedroomTimers && (global as any).bedroomTimers.length) {
      (global as any).bedroomTimers.forEach(
        (timer: any) => timer && clearTimeout(timer),
      );
      (global as any).bedroomTimers = [];
    }

    const { actualDelay, timer } = await controlJalousie({
      page: this.page,
      room: "Zimmer 1",
      buttonGroupIndex: 1,
      percentToSet: parseInt(this.query.brPercent || "45", 10),
      finalPosition: parseInt(this.query.brFinalPosition || "1", 10),
    });

    (global as any).bedroomTimers = [
      ...((global as any).bedroomTimers || []),
      timer,
    ];
    await sleep(actualDelay);
  };

  kitchen = async () => {
    const globalObject: { [key: string]: any } = global;

    if (globalObject.kitchenTimers && globalObject.kitchenTimers.length) {
      globalObject.kitchenTimers.forEach(
        (timer: any) => timer && clearTimeout(timer),
      );
      globalObject.kitchenTimers = [];
    }

    const { actualDelay, timer } = await controlJalousie({
      page: this.page,
      room: "Küche",
      buttonGroupIndex: 1,
      percentToSet: parseInt(this.query.kcPercent || "72", 10),
      finalPosition: parseInt(this.query.kcFinalPosition || "1", 10),
    });

    globalObject.kitchenTimers = [...(globalObject.kitchenTimers || []), timer];
    await sleep(actualDelay);
  };

  loggia = async () => {
    const delay1 = await controlJalousieWithAction({
      page: this.page,
      room: "Loggia",
      buttonGroupIndex: 1,
      percentToSet: parseInt(this.query.lgPercent1 || "50", 10),
    });

    const delay2 = await controlJalousieWithAction({
      page: this.page,
      room: "Loggia",
      buttonGroupIndex: 2,
      percentToSet: parseInt(this.query.lgPercent2 || "33", 10),
    });

    await sleep(Math.max(delay1, delay2));
  };

  livingroom = async () => {
    const globalObject: { [key: string]: any } = global;

    if (globalObject.livingroomTimers && globalObject.livingroomTimers.length) {
      globalObject.livingroomTimers.forEach(
        (timer: any) => timer && clearTimeout(timer),
      );
      globalObject.livingroomTimers = [];
    }

    const withLoggia = !!this.query.lg;

    let delay4 = 0;
    let timer4 = null;
    if (withLoggia) {
      const { actualDelay, timer } = await controlJalousie({
        page: this.page,
        room: "Wohnzimmer",
        buttonGroupIndex: 4,
        percentToSet: parseInt(this.query.percent4 || "100", 10),
        finalPosition: parseInt(this.query.finalPosition4 || "2", 10),
        rolloType: "Loggia",
      });
      delay4 = actualDelay;
      timer4 = timer;
    }

    const { actualDelay: delay2, timer: timer2 } = await controlJalousie({
      page: this.page,
      room: "Wohnzimmer",
      buttonGroupIndex: 2,
      percentToSet: parseInt(this.query.percent2 || "66", 10),
      finalPosition: parseInt(this.query.finalPosition2 || "1", 10),
    });
    const { actualDelay: delay3, timer: timer3 } = await controlJalousie({
      page: this.page,
      room: "Wohnzimmer",
      buttonGroupIndex: 3,
      percentToSet: parseInt(this.query.percent3 || "72", 10),
      finalPosition: parseInt(this.query.finalPosition3 || "1", 10),
    });

    (global as any).livingroomTimers = [
      ...((global as any).livingroomTimers || []),
      timer2,
      timer3,
      timer4,
    ];
    await sleep(Math.max(delay2, delay3, delay4));
  };
}
