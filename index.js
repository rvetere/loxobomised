const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://dns.loxonecloud.com/");
  await page.type("input[type=text]", "");

  await page.type("input[type=password]", "");

  await page.click("button[type=submit]");
  await page.waitForNavigation();

  //   await page.waitForSelector("#myId");
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("WOHNUNG 05.18")'
  );
  await page.screenshot({ path: "example.png" });

  await browser.close();
})();
