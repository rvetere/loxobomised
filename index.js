const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://dns.loxonecloud.com/504F94A1634D");
  await page.type("input[type=text]", "Mieter");

  await page.type("input[type=password]", "2XYFxiKqn0");

  await page.click("button[type=submit]");
  await page.waitForNavigation();

  //   await page.waitForSelector("#myId");
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("WOHNUNG 05.18")'
  );
  await page.screenshot({ path: "example.png" });

  await browser.close();
})();
