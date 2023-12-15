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

### Discovered pitfalls

The Loxone web interface is a react.js app with all pros and cons. Biggest challenge with such apps is to select the correct elements with puppeteer - we don't have any css-class nor element-id to make a clue where we are and what we see. Another problem is the typical single-page-app behavior: When we navigate trough the app, views that are not active anymore are just visually hidden (by CSS), but still present in the DOM! If you are not careful, you start to select buttons of inactive views!

#### Use mobile view only!

By setting the viewport to 500px width, we force the web interface into mobile view. This makes it MUCH easier to select the correct elements! Otherwise you would have to mess around with "flex wrap"

#### Only select elements by text!

It's really no good idea to "get all buttons of a page and click a certain index". Because of the SPA behavior, the list of buttons we find is about to change after any navigation - the index we want to select is then not correct anymore and we start clicking random actions!

#### Use the overlay of each actor to get clear commands!

There are a view UI elements in the web interface where it is very hard to interact with (with puppeteer). But in Loxone, you can open any actor itself - opening an overlay with a list of clear commands. So instead of just clicking the "decrease" button 4 times to get the ventilation down, we open the overlay of the ventilation and we have a button for every state we can set it!
