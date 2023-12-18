import puppeteer, { Browser, Page } from "puppeteer";
import { sleep } from "src/utils/sleep";
import { navigate } from "./utils/navigate";
import "dotenv/config";

const miniServerId = process.env.MINI_SERVER_ID;
const login = process.env.LOGIN;
const password = process.env.PASSWORD;
const apartment = process.env.APARTMENT || "05.18";
const serverUrl = `https://dns.loxonecloud.com/${miniServerId}`;
const loginDelay = parseInt(process.env.LOGIN_DELAY_SECONDS || "0", 10);

export class PuppeteerController {
  initialized: boolean;
  index: number;
  category: string;
  page: Page | null | undefined;
  browser: Browser | null | undefined;
  interval: NodeJS.Timeout | undefined;
  preventStandbyInterval: NodeJS.Timeout | undefined;

  constructor(category: string, index: number) {
    this.category = category;
    this.initialized = false;
    this.index = index;

    // make the instance "visible" by grabing a screenshot all 350ms
    setInterval(() => {
      if (this.initialized) {
        this.page?.screenshot({ path: `${category}-status.png` });
      }
    }, 350);

    return this;
  }

  async init() {
    if (!login || !password || !miniServerId) {
      process.exit(1);
    }

    await sleep(loginDelay * 1000);
    console.log(`🔗 Open URL "${serverUrl}"`);
    const browser = await puppeteer.launch({ headless: "new" });
    this.browser = browser;
    this.page = await browser.newPage();

    // mobile viewport for easy navigation
    await this.page.setViewport({ width: 500, height: 800 });

    // store in localstorage the loxone config with "ambientOnboardingShown":true
    await this.page.evaluateOnNewDocument((settingStr) => {
      localStorage.setItem("LoxSettings.json", settingStr);
    }, `{"animations":true,"darkMode":true,"tileRepresentation":true,"simpleDesign":false,"miniservers":{"${miniServerId}":{"homeScreen":{"activated":true,"widget":{"building":0,"skyline":0}},"manualFavorites":{"activated":false},"deviceFavorites":{"activated":false},"entryPointLocation":"favorites","presenceRoom":"","instructionFlags":{},"userManagement":{},"sortingDeviceFavorites":{"Mieter":{"activated":false}},"kvStore":{},"ambientOnboardingShown":true}},"instructionFlags":{},"LOCAL_STORAGE":{},"entryPoint":{"activated":true,"entryPointLocation":"favorites"},"SYNC":{"ENABLED":false},"screenSaver":{"activationTime":300,"brightness":10}}`);

    try {
      // login to loxone miniserver
      await this.page.goto(serverUrl);
      await this.page.type("input[type=text]", login);
      await this.page.type("input[type=password]", password);

      await this.page.click("button[type=submit]");
      // this.page.screenshot({ path: `${this.category}-status.png` });
      await this.page.waitForNavigation();

      await this.page.waitForFunction(
        `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
      );
      await sleep(1000 * 2);

      // this.page.screenshot({ path: `${this.category}-status.png` });
      await navigate(this.page, this.category, "Kategorien");
      this.initialized = true;

      // random number between 0 and 60 seconds
      const randomDelay = Math.floor(Math.random() * 1000 * 60);

      this.interval = setInterval(
        this.refreshLogin.bind(this),
        1000 * 60 * 60 + randomDelay
      );

      this.preventStandbyInterval = setInterval(async () => {
        if (this.page) {
          console.log("preventStandby", "move mouse");
          await this.page.mouse.move(0, 0);
        }
      }, 1000 * 30);

      console.log(
        `✅ Login successful to Loxone in category "${this.category}"!`
      );
    } catch (e) {
      console.error("Error during login! We probably hit the rate limit..");
      process.exit(1);
    }
  }

  async refreshLogin() {
    if (!login || !password || !miniServerId) {
      process.exit(1);
    }

    console.log(`🤖 Refreshing login in category "${this.category}"...`);
    const timestamp = new Date().getTime();

    try {
      // login to loxone miniserver
      await this.page?.goto(`https://dns.loxonecloud.com/${miniServerId}`);
      await this.page?.type("input[type=text]", login);
      await this.page?.type("input[type=password]", password);

      await this.page?.click("button[type=submit]");
      await this.page?.waitForNavigation();

      await this.page?.waitForFunction(
        `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
      );

      if (this.page) {
        await navigate(this.page, this.category, "Kategorien");
      }
      const timeElapsed = new Date().getTime() - timestamp;
      // log success with time elapsed in seconds
      console.log(
        `✅ Successfully refreshed login in category "${
          this.category
        }" in ${Math.floor(timeElapsed / 1000)} seconds!`
      );
    } catch (e) {
      console.error("Error during login: ", e);
      await this.page?.screenshot({ path: "error-refresh.png" });
      await sleep(1000 * 5);
      await this.init();
    }
  }

  getPage() {
    return this.page;
  }

  getInitialized() {
    return this.initialized;
  }

  getCategory() {
    return this.category;
  }
}
