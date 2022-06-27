# Bot

## Development

### Install

#### **[`node`](https://nodejs.org/es/download/) & [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**

#### **[`grunt`](https://gruntjs.com/)**

```
npm install -g grunt-cli
npm install
```

### Build

`grunt` or `grunt prod`

Build src files concatenated and minified:

**output/haxball-billiards.min.js**

`grunt dev`

Build src files concatenated but not minified for debugging purposes:

**output/haxball-billiards.dev.js**

`grunt dev-maps`

Same as `grunt dev`, but first builds the maps.

Use this if you have modified the stadiums with the `../maps/Billiards Template.hbst` file.

`grunt prod-maps`

Same as `grunt prod`, but first builds the maps.

`grunt clear`

Delete `output` folder.

### Deploy

#### Headless Host

1. Open the [Headless Host](https://html5.haxball.com/headless).
2. Cmd+Options+J (Open DevTools Console)
3. Copy & Paste `output/haxball-billiards.dev.js` or `output/haxball-billiards.min.js`
4. Solve reCaptcha
5. Join the room with the link provided
6. Your room will be open as long as you have the Headless Host tab opened

## Resources

### [Headless Host](https://html5.haxball.com/headless)

It doesn't draw or play any sounds which makes it a lot more lightweight. It is only controllable through a javascript API.

### [Headless Host Wiki](https://github.com/haxball/haxball-issues/wiki/Headless-Host)

Learn about the Headless Host API.

### [Headless Host Token](https://www.haxball.com/headlesstoken)

Get a headless token to use with the bot solving a captcha. It expires after some time.

### [Player Public ID](https://www.haxball.com/playerauth)

`player.auth`
