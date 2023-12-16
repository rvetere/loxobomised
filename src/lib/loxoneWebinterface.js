const puppeteer = require("puppeteer");
const { navigateToRoom } = require("./index");
require("dotenv").config();

const miniServerId = process.env.MINI_SERVER_ID;
const login = process.env.LOGIN;
const password = process.env.PASSWORD;
const apartment = process.env.APARTMENT || "05.18";
const serverUrl = `https://dns.loxonecloud.com/${miniServerId}`;

class LoxoneWebinterface {
  constructor(room, index) {
    console.log(`Creating LoxoneWebinterface instance with room "${room}"...`);
    this.room = room;
    this.initialized = false;
    this.index = index;

    // setInterval(() => {
    //   if (this.initialized) {
    //     this.page.screenshot({ path: `${room}-status.png` });
    //   }
    // }, 350);

    return this;
  }

  async init() {
    console.log("Open url: " + serverUrl);
    const browser = await puppeteer.launch({ headless: "new" });
    this.browser = browser;
    this.page = await browser.newPage();

    // mobile viewport for easy navigation
    await this.page.setViewport({ width: 500, height: 800 });

    // store in localstorage the loxone config with "ambientOnboardingShown":true
    await this.page.evaluateOnNewDocument((settingStr) => {
      localStorage.setItem("LoxSettings.json", settingStr);
    }, `{"animations":true,"darkMode":true,"tileRepresentation":true,"simpleDesign":false,"miniservers":{"${miniServerId}":{"homeScreen":{"activated":true,"widget":{"building":0,"skyline":0}},"manualFavorites":{"activated":false},"deviceFavorites":{"activated":false},"entryPointLocation":"favorites","presenceRoom":"","instructionFlags":{},"userManagement":{},"sortingDeviceFavorites":{"Mieter":{"activated":false}},"kvStore":{},"ambientOnboardingShown":true}},"instructionFlags":{},"LOCAL_STORAGE":{},"entryPoint":{"activated":true,"entryPointLocation":"favorites"},"SYNC":{"ENABLED":false},"screenSaver":{"activationTime":300,"brightness":10}}`);

    // login to loxone miniserver
    await this.page.goto(serverUrl);
    await this.page.type("input[type=text]", login);
    await this.page.type("input[type=password]", password);

    await this.page.click("button[type=submit]");
    await this.page.waitForNavigation();

    await this.page.waitForFunction(
      `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
    );

    await navigateToRoom(this.page, this.room);
    this.initialized = true;

    // random number between 0 and 30 seconds
    const randomDelay = Math.floor(Math.random() * 1000 * 30);

    this.interval = setInterval(
      this.refreshLogin.bind(this),
      1000 * 60 * 4 + randomDelay
    );
    console.log(`✅ Login successful in room "${this.room}"!`);
  }

  async refreshLogin() {
    console.log(`Refreshing login in room "${this.room}"...`);
    const timestamp = new Date().getTime();

    await this.page.goto(`https://dns.loxonecloud.com/${miniServerId}`);
    await this.page.type("input[type=text]", login);
    await this.page.type("input[type=password]", password);

    await this.page.click("button[type=submit]");
    await this.page.waitForNavigation();

    await this.page.waitForFunction(
      `document.querySelector("body").innerText.includes("WOHNUNG ${apartment}")`
    );

    await navigateToRoom(this.page, this.room);
    const timeElapsed = new Date().getTime() - timestamp;
    // log success with time elapsed in seconds
    console.log(
      `✅ Successfully refreshed login in room "${this.room}" in ${Math.floor(
        timeElapsed / 1000
      )} seconds!`
    );
  }

  getInstance() {
    return this.page;
  }

  getInitialized() {
    return this.initialized;
  }

  getRoom() {
    return this.room;
  }
}

module.exports = { LoxoneWebinterface };
