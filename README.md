# loxobomised

A super stupid puppeteer remote control for Loxone smart home systems

## How to use

Add a `.env` file in project root with the following structure:

```javascript
MINI_SERVER_ID=<id-of-your-server-grabbed-from-webinterface>
LOGIN=Mieter
PASSWORD=Password
APARTMENT=05.18
PORT=3000
```

The project will start an express server and a singleton puppeteer instance logged-in to the loxone web interface.

You can simply add "commands" in the folder `./src/commands` and execute them with the route `http://localhost:3000/exec/path-of-your-command`.

Start by adding a folder for your appartment in `./src/commands` and then just add javascript files in there with the following structure:

```javascript
const run = async (page) => {
  await page.screenshot({ path: "example.png" });
};

module.exports = {
  run,
};
```

So after adding a file "./src/commands/518/example.js" i can call it with `http://localhost:3000/exec/518/example`

Check out the two example commands to get an idea how it works!
