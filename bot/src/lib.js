/* HaxBall Constants */

const TEAM = {
  SPECTATOR: 0,
  RED: 1,
  BLUE: 2
};

const TICKS_PER_SECOND = 60; // onGameTick is called 60 times per second

const KICK_PADDING = 4; // minimum distance between player border and ball border to kick the ball

const NOTIFY = 2; // notification sound id

/* Chat Messages */

const COLOR = {
  WHITE: 0xffffff,
  RED: 0xe56e56,
  BLUE: 0x5689e5,
  YELLOW: 0xffffe4,
  GREEN: 0xc4ff65,
  WARNING: 0xffa135,
  ERROR: 0xa40000,
  SUCCESS: 0x75ff75,
  INFO: 0xbebebe,
  NOTIFY: 0xffefd6,
  DEFAULT: 0xffc933
};

function sendAnnouncement(msg, targetId, color, style, sound, log = LOG.debug) {
  if (typeof msg === 'string' && msg.trim().length > 0) {
    if (log) {
      log(msg);
    }
    room.sendAnnouncement(msg, targetId, color, style, sound);
  }
}

function send(msg, targetPlayer = null, color = COLOR.DEFAULT, style = 'normal', sound = 1, log = LOG.debug) {
  let targetId = null;

  if (targetPlayer !== null) {
    if (typeof targetPlayer === 'number') {
      targetId = targetPlayer;
    } else if (typeof targetPlayer === 'object') {
      targetId = targetPlayer.id;
    }
  }

  if (typeof msg === 'string') {
    sendAnnouncement(msg, targetId, color, style, sound, log);
  } else if (msg instanceof Array && msg.length > 0) {
    sendAnnouncement(msg[0], targetId, color, style, sound, log);

    for (let line of msg.slice(1)) {
      sendAnnouncement(line, targetId, color, style, 0, log);
    }
  }
}

function chatLog(msg) {
  if (ENABLE_CHAT_LOG) {
    LOG.debug(msg);
  }
}

function chat(player, msg, label = null, targetPlayer = null, color = COLOR.WHITE, sound = 1, log = chatLog) {
  if (player) {
    if (msg instanceof Array && msg.length > 0) {
      chat(player, msg[0], label, targetPlayer, color, sound, log);

      for (let line of msg.slice(1)) {
        chat(player, line, label, targetPlayer, color, 0, log);
      }
    } else {
      // name ⟨🏵 0⟩  hi  // `${player.name} ⟨${label}⟩:  ${msg}`
      // 🏵 0 ⎪ name:  hi  // `${label} ⎪ ${player.name}:  ${msg}`
      label = label ? ` ⟨${label}⟩` : ':';
      send(`${player.name}${label}  ${msg}`, targetPlayer, color, 'normal', 1, log);
    }
  }
}

function chatHost(msg, targetPlayer = null, color = COLOR.WHITE) {
  chat(getHostPlayer(), msg, null, targetPlayer, color, 1, true);
}

function notify(msg, color = COLOR.NOTIFY, style = 'bold', log = LOG.info) {
  send(msg, null, color, style, NOTIFY, log);
}

function info(msg, targetPlayer = null, color = COLOR.INFO, style = 'normal', log = LOG.debug) {
  send(msg, targetPlayer, color, style, 1, log);
}

function warn(msg, targetPlayer = null, style = 'normal', sound = 1, color = COLOR.WARNING, log = LOG.debug) {
  send(msg, targetPlayer, color, style, sound, log);
}

function error(msg, targetPlayer = null, log = LOG.debug) {
  send(msg, targetPlayer, COLOR.ERROR, 'italic', 1, log);
}

function displayHttpError(context, status, e, player = null) {
  LOG.error(context, status, e);
  
  if (player) {
    error(`${context} (${status})` + (player.admin && e ? `: ${e}` : ''), player);
  }
}

function displayError(context, e, player = null) {
  LOG.error(context, e);

  if (player) {
    error(`${context}` + (player.admin && e ? `: ${e}` : ''), player);
  }
}

function getColor(n) {
  if (n > 0) return COLOR.SUCCESS;
  else if (n < 0) return COLOR.RED;
  else return COLOR.INFO;
}

function isMention(name) {
  return name.startsWith('@');
}

/* Teams */

function getTeams(host = false) {
  const players = host ? room.getPlayerList() : getPlayers();

  const teams = {};

  for (let team of Object.values(TEAM)) {
    teams[team] = [];
  }

  for (let player of players) {
    teams[player.team].push(player);
  }

  return teams;
}

function getOppositeTeam(team) {
  return team === TEAM.RED ? TEAM.BLUE : TEAM.RED;
}

function getTeamIcon(team) {
  switch (team) {
    case TEAM.RED:
      return '🔴';
    case TEAM.BLUE:
      return '🔵';
    default:
      return '👁';
  }
}

function getTeamColor(team) {
  switch (team) {
    case TEAM.RED:
      return COLOR.RED;
    case TEAM.BLUE:
      return COLOR.BLUE;
    default:
      return COLOR.YELLOW;
  }
}

function getTeamName(team) {
  return Object.keys(TEAM).find(t => team === TEAM[t]) || '?';
}

function setPlayerTeam(player, team) {
  if (player.team !== team) {
    LOG.debug('setPlayerTeam', player.name, player.team, '->', team);
    CHANGING_TEAMS.add(player.id);
    room.setPlayerTeam(player.id, team);
    player.team = team;
  }
}

function movePlayerToSpectator(player) {
  setPlayerTeam(player, TEAM.SPECTATOR);
}

/* Host */

function isHostPlayer(player) {
  return typeof player === 'object' && player.id === 0 && player.name === HOST_PLAYER;
}

function getHostPlayer() {
  return room.getPlayerList().find(isHostPlayer);
}

function setHostRandomAvatar(choices = ['⚜️', '෴', '🎩', '🤹🏻‍♂️', '🎱']) {
  const host = getHostPlayer();
    
  if (host) {
    let avatar = choice(choices);
    room.setPlayerAvatar(host.id, avatar);
  }
}

function setHostAvatar(host, icon, seconds = undefined) {
  if (host) {
    room.setPlayerAvatar(host.id, icon);

    if (seconds) {
      setTimeout(setHostRandomAvatar, seconds * 1000 );
    }
  }
}

/* Players */

function getPlayers() {
  return room.getPlayerList().filter(player => !isHostPlayer(player));
}

function playersInGameLength() {
  return N_PLAYERS - TEAMS[TEAM.SPECTATOR].length;
}

function playersInGame() {
  // Is not updated instantly, to check the length after changing teams use playersInGameLength
  return getPlayers().filter(player => player.team !== TEAM.SPECTATOR);
}

function getSpectators() {
  return getPlayers().filter(player => player.team === TEAM.SPECTATOR);
}

function activePlayers() {
  return getPlayers().filter(player => !isAFK(player));
}

function playingOrActivePlayers() {
  return PLAYING ? playersInGame() : activePlayers();
}

function playersOutOfTurn() {
  const currentPlayerId = CURRENT_PLAYER ? CURRENT_PLAYER.id : null;

  return getPlayers().filter(player => player.team !== TEAM.SPECTATOR && player.id !== currentPlayerId);
}

function getPlayerId(player) {
  return typeof player === 'object' ? player.id : player;
}

/* Balls */

function getBall(ballIndex) {
  return room.getDiscProperties(ballIndex);
}

function getWhiteBall() {
  return room.getDiscProperties(WHITE_BALL);
}

function getBalls(ballIndexes) {
  return ballIndexes.map(getBall);
}

function isBallMoving(ballIndex, threshold = MIN_SPEED_THRESHOLD) {
  const ball = getBall(ballIndex);
  return (Math.abs(ball.xspeed) > threshold || Math.abs(ball.yspeed) > threshold) && inPlayingArea(ball);
}

function moveBall(ballIndex, pos) {
  const props = {
    xspeed: 0,
    yspeed: 0,
    ...pos,
  };
  room.setDiscProperties(ballIndex, props);
  LOG.debug('moveBall', ballIndex, props);
}

/* Collision Flags (bitwise) */

function hasFlag(flags, flag) {
  return (flags & flag) !== 0;
}

function addFlag(flags, flag) {
  return flags | flag;
}

function removeFlag(flags, flag) {
  return flags & ~flag;
}

function updatePlayerFlags(field, player, updatedFlags) {
  if (player) {
    const playerDisc = room.getPlayerDiscProperties(player.id);

    if (playerDisc) {
      const playerDiscFlags = playerDisc[field];
    
      room.setPlayerDiscProperties(player.id, {
        [field]: updatedFlags(playerDiscFlags)
      });
    }
  }
}

/* Validations */

function checkInt(label, n, player, min, max) {
  if (typeof n === 'string') {
    n = parseInt(n);
  }
  if (typeof n !== 'number' || isNaN(n) || n < min || n > max) {
    warn(`${label} must be an integer between ${min} and ${max}.`, player);
    return false;
  }
  return n;
}
