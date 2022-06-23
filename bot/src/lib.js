/* HaxBall Constants */

const TEAM = {
  SPECTATOR: 0,
  RED: 1,
  BLUE: 2
};

const TICKS_PER_SECOND = 60;

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

function send(msg, targetId, color, style, sound, announcement) {
  if (typeof msg === 'string' && msg.trim().length > 0) {
    if (targetId === null) {
      console.log(msg);
    }
    if (announcement || !HOST_PLAYER) {
      room.sendAnnouncement(msg, targetId, color, style, sound);
    } else {
      room.sendChat(msg, targetId);
    }
  }
}

function message(msg, player = null, color = COLOR.DEFAULT, style = 'normal', sound = 1, announcement = false) {
  let targetId = null;

  if (player !== null) {
    if (typeof player === 'number') {
      targetId = player;
    } else if (typeof player === 'object') {
      targetId = player.id;
    }
  }

  if (typeof msg === 'string') {
    send(msg, targetId, color, style, sound, announcement);
  } else if (msg instanceof Array) {
    send(msg[0], targetId, color, style, sound, announcement);

    for (let line of msg.slice(1)) {
      send(line, targetId, color, style, 0, announcement);
    }
  }
}

function info(msg, player = null, color = COLOR.INFO, style = 'normal') {
  message(msg, player, color, style, 1, true);
}

function warn(msg, player = null, color = COLOR.WARNING, style = 'normal') {
  info(msg, player, color, style);
}

function notify(msg, color = COLOR.NOTIFY, style = 'bold') {
  message(msg, null, color, style, 2, true);
}

/* Teams */

function getTeams(host = false) {
  let players = host ? room.getPlayerList() : getPlayers();

  let teams = {};

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
    room.setPlayerTeam(player.id, team);
    player.team = team;
  }
}

function movePlayerToSpectator(player) {
  setPlayerTeam(player, TEAM.SPECTATOR);
}

function movePlayersToSpectators() {
  if (TEAMS[TEAM.SPECTATOR].length > 0) {
    TEAMS[TEAM.RED].forEach(movePlayerToSpectator);
    TEAMS[TEAM.BLUE].forEach(movePlayerToSpectator);
  }
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

/* Balls */

function getBall(ballIndex) {
  return typeof ballIndex === 'number' ? room.getDiscProperties(ballIndex) : undefined;
}

function getBalls(ballIndexes) {
  return ballIndexes.map(getBall);
}

function isBallMoving(ballIndex) {
  const ball = getBall(ballIndex);
  return ball ? (ball.xspeed > 0 || ball.yspeed > 0) : false;
}

function moveBall(ballIndex, pos) {
  room.setDiscProperties(ballIndex, {
    xpeed: 0,
    yspeed: 0,
    ...pos,
  });
}

/* Collision Flags (bitwise) */

function hasFlag(flags, flag) {
  return (flags & flag) != 0;
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
