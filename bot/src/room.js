/* Room Configuration */

/** @type {import("haxball-types").Room} */
let room; // RoomConfigObject https://github.com/haxball/haxball-issues/wiki/Headless-Host#roomconfigobject

let URL;

let PLAYING; // if a game is started
let N_PLAYERS; // number of players in the room

let TEAMS; // team id to team player list

function init() {
  const loaded = typeof HBInit !== 'undefined';

  if (loaded) {
    if (room === undefined) {
      room = HBInit({
        roomName: ROOM,
        maxPlayers: MAX_PLAYERS,
        noPlayer: !HOST_PLAYER,
        playerName: HOST_PLAYER,
        public: PUBLIC_ROOM,
        password: PASSWORD,
        token: TOKEN,
        geo: GEOCODE
      });
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
  
    LOG.info('✅ Room loaded');
  } else {
    window.onHBLoaded = init;
  }

  return room;
}

function onRoomLink(url) {
  URL = url;
  LOG.info(URL);
}

function isPlaying() {
  return !!room.getScores();
}

function updateIsPlaying() {
  PLAYING = isPlaying();
}

function updatePlayersLength() {
  N_PLAYERS = getPlayers().length;
}

function updateTeams(teams) {
  if (!teams) {
    teams = getTeams();
  }
  TEAMS = teams;
  LOG.debug('TEAMS updated', getCaller(updateTeams));
}

function startGame(delay = false) {
  if (!PLAYING) {
    setTeams();

    const caller = getCaller(startGame);
    const players = activePlayers().length;
    const delaySeconds = delay && players > 1 ? WAIT_GAME_START_SECONDS : 0;

    setTimeout(() => {
      if (playersInGameLength()) {
        LOG.debug(caller, "-> startGame");
        room.startGame();
      }
    }, delaySeconds * 1000);
  }
}

function stopGame() {
  if (PLAYING) {
    LOG.debug(getCaller(stopGame), "-> stopGame");
    room.stopGame();
  }
}

function setRoomHandlers() {
  const handlers = [
    'onPlayerJoin',
    'onPlayerLeave',
    'onTeamVictory',
    'onPlayerChat',
    'onPlayerBallKick',
    'onTeamGoal',
    'onGameStart',
    'onGameStop',
    'onPlayerAdminChange',
    'onPlayerTeamChange',
    'onPlayerKicked',
    'onGameTick',
    'onGamePause',
    'onPositionReset',
    'onPositionReset',
    'onPlayerActivity',
    'onStadiumChange',
    'onRoomLink',
    'onKickRateLimitSet',
  ];

  for (const handler of handlers) {
    if (typeof this[handler] === 'function') {
      room[handler] = (...args) => {
        try {
          return this[handler](...args);
        } catch (e) {
          LOG.error(e);
        }
      };
    }
  }
}

// Start room
try {
  init();
} catch (e) {
  LOG.error(e);
}
