# loxobomised

A super stupid puppeteer remote control for Loxone smart home systems

## How to use

Add a `.env` file in project root with the following structure:

```
MINI_SERVER_ID=<id-of-your-server-grabbed-from-webinterface>
LOGIN=Mieter
PASSWORD=
```

The project will start an express server and a singleton puppeteer instance logged-in to the loxone web interface.

You can simply add "commands" in the folder `./src/commands` and execute them with the route `http://localhost:3000/exec/name-of-your-command`.

Check out the two example commands to get an idea how it works!
