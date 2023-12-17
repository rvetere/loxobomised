# loxobomised

A super stupid puppeteer remote control for Loxone smart home systems

## Prerequisites:

- [node.js](https://nodejs.org)
- [yarn](https://yarnpkg.com) (optional)

## Get started

1. Add a `.env` file in project root with the following structure:

```javascript
MINI_SERVER_ID=<id-of-your-server-grabbed-from-webinterface>
LOGIN=Mieter
PASSWORD=Password
APARTMENT=05.18
PORT=3000
```

2. Install all dependencies by running `npm install` (or just `yarn`)
3. Start it with `npm start` (or `yarn start`)

#### Where to find the mini server ID?

> This is only valid for tenants living at "Jägerstrasse 59" in Winterthur.

Check your mails, you certainly received emails from "Living Services" portal - just search for one of those mails and open the "Living Services" App in a browser on your desktop computer. In there, you have this "Loxone" link, open that and login with the credentials you received by Wincasa (if you don't know the credentials, ask Wincasa in a Support Ticket).

After you logged in succesful into the loxone web interface, you can simply check your URL - all digits after the last `/` are representing your mini server ID.

## How to use

The project will start an express server and a pool of singleton puppeteer instances logged-in to the loxone web interface.
The pool will hold one puppeteer `page` instance per room you define in the `.env` file.

You can simply add "commands" in the folder `./src/commands/<my-apartment-nr>` and execute them with the route `http://localhost:3000/exec/path-of-your-command`.

Start by adding a folder for your appartment in `./src/commands` and then just add javascript files in there with the following structure:

```javascript
const { clickActionOfTitle, getPageInPool } = require("../../lib");

// Set smooth kitchen light
const run = async (page, query) => {
  const page = getPageInPool(pool, "Küche");

  // Turn off head lights
  await clickActionOfTitle(page, "Beleuchtung", 1, "Switch Off");

  // Set spots to a dimmed level
  // -> you can call this command with params too! http://localhost:3000/exec/518/example?percent=60
  const percentStr = query.percent || "40";
  const percent = parseInt(percentStr, 10);
  await clickPlusMinusOfTitle(page, "Beleuchtung", 2, percent);
};

module.exports = {
  run,
};
```

So after adding a file for the apartment "518" (`./src/commands/518/example.js`) i can call it with the following GET `http://localhost:3000/exec/518/example`

Check out the two example commands to get an idea how it works!

## Integration with Home Assistant

You can easily integrate these GET requests with the built in shell feature. You just extend your `configuration.yaml` like:

```bash
shell_command:
  full_bathroom_light: 'curl -X GET "http://localhost:3000/exec/518/fullBathroomLight"'
  dimm_kitchen_10: 'curl -X GET "http://localhost:3000/exec/518/dimmKitchenLights?percent=10"'
```

Afterwards you can just add scripts and in there add actions of "call a service" - just look for "shell my-command" and you can easily execute them.

> Pro tip: use the developer tools of HA to "call a service" with the shell command and see what the exact response is. Great for debugging ;-)
