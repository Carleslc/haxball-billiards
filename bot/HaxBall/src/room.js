/* Room Configuration */

/** @type {import("haxball-types").Room} */
let room; // RoomConfigObject https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomconfigobject

let URL;

let PLAYING; // if a game is started
let N_PLAYERS, N_PLAYERS_BEFORE; // number of players in the room

let TEAMS; // team id to team player list

async function init() {
  const loaded = BUILD === 'node' || typeof HBInit !== 'undefined';

  if (loaded) {
    if (room === undefined) {
      const TOKEN = checkToken();

      const HBInit = await getHBInit();

      room = await HBInit({
        token: TOKEN,
        roomName: ROOM,
        maxPlayers: MAX_PLAYERS,
        noPlayer: !HOST_PLAYER,
        playerName: HOST_PLAYER,
        public: PUBLIC_ROOM,
        password: PASSWORD,
        geo: GEOCODE,
      });

      LOG.info('🧩', BUILD, '$ENV');

      LOG.info(PUBLIC_ROOM ? '👁  Visible' : '🚪 Hidden');

      scheduleDiscordReminder();
    }

    setRoomHandlers();
  
    room.setScoreLimit(SCORE_LIMIT);
    room.setTimeLimit(TIME_LIMIT);
    room.setTeamsLock(TEAMS_LOCK);
  
    // room.setRequireRecaptcha(true);
  
    selectMap(DEFAULT_MAP);

    resetMapVoting();
    resetRulesVoting();
  
    updateIsPlaying();
    updatePlayersLength();
  
    setHostRandomAvatar();
  
    updateTeams();
  } else {
    window.onHBLoaded = init;
  }

  return room;
}

async function getHBInit() {
  return new Promise((resolve, reject) => {
    if (BUILD === 'node') {
      const HaxballJS = require('haxball.js');
      HaxballJS.then(HBInit => resolve(HBInit)).catch(reject);
    } else {
      resolve(HBInit);
    }
  });
}

function checkToken() {
  const token = getToken();

  if (!token) {
    throw new Error("Missing TOKEN environment variable\nhttps://www.haxball.com/headlesstoken");
  }

  return token;
}

function onRoomLink(url) {
  if (url.endsWith(WITH_PASSWORD)) {
    url = url.substring(0, url.length - WITH_PASSWORD.length);
  }

  URL = url;

  LOG.info('👉', URL, passwordInfo());
}

function isPlaying() {
  return !!room.getScores();
}

function updateIsPlaying() {
  PLAYING = isPlaying();
}

function updatePlayersLength() {
  N_PLAYERS_BEFORE = N_PLAYERS;
  N_PLAYERS = getPlayers().length;
  logPlayers();
  updateTeams();
}

function logPlayers() {
  if (N_PLAYERS !== N_PLAYERS_BEFORE) {
    LOG.debug(`${N_PLAYERS_BEFORE} -> ${N_PLAYERS} players in the room (Playing: ${PLAYING})`);
  }
}

function updateTeams(teams) {
  if (!teams) {
    teams = getTeams();
  }
  TEAMS = teams;
  LOG.debug('TEAMS updated', getCaller(updateTeams));
}

function startGame(delaySeconds = WAIT_GAME_START_SECONDS) {
  if (!PLAYING) {
    setTeams(true);
    
    if (activePlayers().length < 2) {
      delaySeconds = 0;
    }

    if (delaySeconds > WAIT_GAME_START_SECONDS) {
      info(`Next game will start in ${delaySeconds} seconds`);
    }

    NEXT_GAME_TASK = setTimeout(() => {
      if (playersInGameLength()) {
        LOG.debug(getCaller(startGame), "-> startGame");
        room.startGame();
      }
      NEXT_GAME_TASK = undefined;
    }, delaySeconds * 1000);
  }
}

function stopGame() {
  if (PLAYING) {
    LOG.debug(getCaller(stopGame), "-> stopGame");

    LAST_GAME_SCORES = room.getScores();

    room.stopGame();
  }
}

/* Room Handlers */

const ROOM_HANDLERS = {
  onRoomLink,
  onGameStart,
  onGameStop,
  onPlayerActivity,
  onPlayerJoin,
  onPlayerLeave,
  onPlayerTeamChange,
  onStadiumChange,
  onGameTick,
  onPlayerBallKick,
  onPlayerChat,
};

function setRoomHandlers() {
  for (const handler of Object.keys(ROOM_HANDLERS)) {
    room[handler] = (...args) => {
      try {
        return ROOM_HANDLERS[handler](...args);
      } catch (e) {
        LOG.error(e);
      }
    };
  }
}

// Start room
init().then((_) => LOG.info('✅ Room loaded')).catch(LOG.error);
