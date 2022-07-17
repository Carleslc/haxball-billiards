# HaxBall Headless Bot

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/carleslc)

## Development

### Install

#### **[`node`](https://nodejs.org/es/download/) & [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**

#### **[`grunt`](https://gruntjs.com/)**

```sh
# Install dependencies
npm install -g grunt-cli
npm install

# Set executable permissions to the start script
# This is for node only, if you will use headless host this is not needed
chmod +x start.sh
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

Use this if you have modified the stadiums with the `../../maps/Billiards Template.hbst` file.

`grunt prod-maps`

Same as `grunt prod`, but first builds the maps.

`grunt clear`

Delete `output` folder.

### Deploy

#### Headless Host

If you have a [`TOKEN`](https://www.haxball.com/headlesstoken) copy the file `.env.template` and rename it to `.env` then set your `TOKEN` there.

1. Build with `grunt dev`
2. Open the [Headless Host](https://html5.haxball.com/headless)
3. Cmd+Option+J (Open DevTools Console)
4. Copy & Paste `output/haxball-billiards.dev.js`
5. Solve reCaptcha if needed
6. Join the room with the link provided

Your room will be open as long as you have the Headless Host tab opened.

#### Node

1. Get your token at https://www.haxball.com/headlesstoken
2. Run `./start.sh prod TOKEN` replacing `TOKEN` with your token
   - Alternative (bash): `. .env && ./start.sh` if you have your `TOKEN` in the `.env` file
   - Alternative (fish): [`envsource`](https://gist.github.com/nikoheikkila/dd4357a178c8679411566ba2ca280fcc)` .env && ./start.sh`
3. Join the room with the link provided

The room will be open as long as you have the node process running.
You can stop it with _Ctrl^C_.

You can run it in detach mode with `./start.sh prod TOKEN &` or `. .env && ./start.sh &`.
You can stop it looking for the `PID` of the `node ./src/room.js` process using `ps` and then using `kill PID`.

#### Docker

Optionally, you can run this room as a [Docker](https://www.docker.com/) image.

##### **Build image**

This is needed only the first time or to update the source files if they change.

```sh
# Create the Docker image
# --build-arg binds the Dockerfile args (use TASK=dev for a testing environment)
# -t is the image name
# last parameter is the location of the Dockerfile (.)
docker build --build-arg ROOM=haxball-billiards --build-arg TASK=prod -t haxball-billiards .
```

##### **Run the container**

This will create and start the container, opening the room.

Replace `$TOKEN` with your HaxBall token from https://www.haxball.com/headlesstoken

```sh
# Run a docker container with the generated image
# -d is detached (parallel process)
# --name is the container name
# --env-file reads the .env file and passes the TOKEN as an environment variable
# last parameter is the image name
docker run -d --name haxball-billiards --env-file .env haxball-billiards
```

_You get an error like `docker: Error response from daemon: Conflict. The container name "/haxball-billiards" is already in use by container`_ ?

Remove the container first and try again:

```sh
docker rm haxball-billiards
```

##### **Get the room link**

You can see the container logs with:

```sh
# -f means persistent (wait for new logs until you press Ctrl^C)
# --tail 1000 to show only the latest 1000 lines
docker logs -f haxball-billiards --tail 1000
```

##### **Stop the container**

This will close the room and stop the container.

```sh
docker stop haxball-billiards
```

##### **Restart the container**

Open the room again after the container was stopped.

```sh
docker start haxball-billiards
```

If you get an `Error: Invalid Token Provided!` you need to remove the container and recreate it with a new token.

##### **Remove the container**

Clean the container. You can recreate it with the run command.

```sh
docker rm haxball-billiards

# If the room is open you can close it, stop and remove the container
docker rm haxball-billiards --force
```

#### Backend API

This bot uses a backend API to get and store statistics (commands `!stats`, `!me` & `!game`).

An `API_SECRET` is required to authenticate the client.

If you have an `API_SECRET` copy the file `.env.template` and rename it to `.env` then set your `API_SECRET` there.

The `grunt` tasks will replace accordingly the `$API_SECRET` variable in the `src/settings.js` file.

If you have your own host you will need to host the backend on your own to get it working.

More information in `backend` folder.

## Resources

### [Headless Host](https://html5.haxball.com/headless)

It doesn't draw or play any sounds which makes it a lot more lightweight. It is only controllable through a javascript API.

### [Headless Host Wiki](https://github.com/haxball/haxball-issues/wiki/Headless-Host)

Learn about the Headless Host API.

### [Headless Host Token](https://www.haxball.com/headlesstoken)

Get a headless token to use with the bot solving a captcha. It expires after some time.

### [Player Public ID](https://www.haxball.com/playerauth)

`player.auth`
