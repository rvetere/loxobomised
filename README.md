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
ROOMS=Wohnzimmer,Küche,Entrée,WC-Dusche,Loggia
```

### Where to find the mini server ID?

| This is only valid for tenants living at "Jägerstrasse 59" in Winterthur.

Check your mails, you certainly received emails from "Living Services" portal - just search for one of those mails and open the "Living Services" App in a browser on your desktop computer. In there, you have this "Loxone" link, open that and login with the credentials you received by Wincasa (if not, ask them!).

After you logged in succesful into the loxone web interface, you can simply check your URL - all digits after the last `/` are representing your mini server ID.

## How it works

The project will start an express server and a pool of singleton puppeteer instances logged-in to the loxone web interface.
The pool will hold one puppeteer `page` instance per room you define in the `.env` file.

You can simply add "commands" in the folder `./src/commands/<my-apartment-nr>` and execute them with the route `http://localhost:3000/exec/path-of-your-command`.

Start by adding a folder for your appartment in `./src/commands` and then just add javascript files in there with the following structure:

```javascript
const { clickActionOfCategory, getPageInPool } = require("../../lib");

// Set smooth kitchen light
const run = async (page, query) => {
  const page = await getPageInPool(pool, "Küche");

  // Turn off head lights
  await clickActionOfCategory(page, "Beleuchtung", 1, "Switch Off");

  // Set spots to a dimmed level
  // -> you can call this command with params too! http://localhost:3000/exec/518/example?percent=60
  const percentStr = query.percent || "40";
  const percent = parseInt(percentStr, 10);
  await clickPlusMinusOfCategory(page, "Beleuchtung", 2, percent);
};

module.exports = {
  run,
};
```

So after adding a file for the apartment "518" (`./src/commands/518/example.js`) i can call it with the following GET `http://localhost:3000/exec/518/example`

Check out the two example commands to get an idea how it works!

### Discovered pitfalls

The Loxone web interface is a react.js app with all pros and cons. Biggest challenge with such apps is to select the correct elements with puppeteer - we don't have any css-class nor element-id to make a clue where we are and what we see. Another problem is the typical single-page-app behavior: When we navigate trough the app, views that are not active anymore are just visually hidden (by CSS), but still present in the DOM! If you are not careful, you start to select buttons of inactive views!

#### Use mobile view only!

By setting the viewport to 500px width, we force the web interface into mobile view. This makes it MUCH easier to select the correct elements! Otherwise you would have to mess around with "flex wrap"

#### Only select elements by text!

It's really no good idea to "get all buttons of a page and click a certain index". Because of the SPA behavior, the list of buttons we find is about to change after any navigation - the index we want to select is then not correct anymore and we start clicking random actions!

#### Use the overlay of each actor to get clear commands!

There are a view UI elements in the web interface where it is very hard to interact with (with puppeteer). But in Loxone, you can open any actor itself - opening an overlay with a list of clear commands. So instead of just clicking the "decrease" button 4 times to get the ventilation down, we open the overlay of the ventilation and we have a button for every state we can set it!

#### Room navigation is hard!

Working with just one instance logged in to the webinterface and navigating trough many different rooms in one command run turns out to be very unstable. At some point, the UI starts to load again the scripts and it is totally unclear when and why. In the end, creating a pool of puppeteer instances for each room, removing the necessity to navigate trough rooms in one page solved the issue. It is also improving performance a lot - this way, we can easily call several different actions in different rooms with almost no wait time in between.
