/* Game Mechanics */

/** @type {import("haxball-types").Player} */
let CURRENT_PLAYER; // player
let CURRENT_TEAM; // team id

let NEXT_PLAYERS; // team player indexes
let LAST_PLAYER; // last player that kicked the ball
let EXTRA_SHOTS; // extra turns remaining from a foul

let SHOTS; // number of shots in the game
let REMAINING_RED_BALLS, REMAINING_BLUE_BALLS; // track balls in the playing area
let GAME_OVER; // if the game is finished and about to stop
let CHECK_GOALS; // if goals should be checked
let WINNER_TEAM; // team who won
let BLACK_SCORED_TEAM; // if the black was scored and by which team
let KICKOFF; // kickoff turn?
let FOUL; // has been a foul this turn?

let BALLS_MOVING; // are balls currently moving?
const BALLS_STATIC_CALLBACK = new EventQueue(); // event called right after balls are no longer moving
const SCORED_BALLS_TURN = new Set(); // balls scored this turn

const CHANGING_TEAMS = new Set(); // player ids that are currently changing teams
const CHANGING_TEAMS_CALLBACK = new EventQueue(); // event called right after all players have changed teams

let CURRENT_MAP, NEXT_MAP; // map name
let CURRENT_MAP_OBJECT, NEXT_MAP_OBJECT; // map object (parsed json)

let SELECTING_MAP_TASK; // map selection task
const VOTES = {}; // map to set of player ids

let TURN_TIME; // current turn player elapsed time in ticks

const SPEED_INFO = new Set(); // players auth notified with the shift speed tip
const AFK_PLAYERS = new Set(); // players id afk
const AFK_TIME = {}; // player id to afk ticks

const AUTH = {}; // player id to auth
const AUTH_CACHE_TASKS = {}; // player auth to { id, removalTask }
const MAX_AUTH_CACHE_MINUTES = WAIT_DRINK_MINUTES; // remove auth entry after player leaves the room

// Ball disc indexes
let WHITE_BALL, BLACK_BALL;
let BLUE_BALLS, RED_BALLS;

// Other map properties
let BALL_RADIUS, PLAYER_RADIUS;
let WHITE_BALL_SPAWN, BLACK_BALL_SPAWN; // initial positions

let PLAYING_AREA; // { x: { min, max }, y: { min, max } }

// Rules settings
const SET_RULES = { // rules to set of player ids
  DISABLE: new Set(),
  NORMAL: new Set(),
  // EXTENDED: new Set(),
  // TOURNAMENT: new Set()
};
let RULES_ENABLED = true; // enforce rules?
let USE_EXTENDED_RULES = false; // playing with extended rules?

const AVAILABLE_RULES = Object.keys(SET_RULES).map(m => m.toLowerCase()).join(', ');

function loadMapProperties() {
  if (CURRENT_MAP_OBJECT) {
    const discs = CURRENT_MAP_OBJECT.discs;

    WHITE_BALL = discs.findIndex(disc => disc.trait === 'whiteBall');
    BLACK_BALL = discs.findIndex(disc => disc.trait === 'blackBall');

    RED_BALLS = findAllIndexes(discs, disc => disc.trait === 'redBall');
    BLUE_BALLS = findAllIndexes(discs, disc => disc.trait === 'blueBall');

    REMAINING_RED_BALLS = RED_BALLS.slice();
    REMAINING_BLUE_BALLS = BLUE_BALLS.slice();

    BALL_RADIUS = CURRENT_MAP_OBJECT.traits.whiteBall.radius;
    PLAYER_RADIUS = CURRENT_MAP_OBJECT.playerPhysics.radius;

    WHITE_BALL_SPAWN = position(discs[WHITE_BALL].pos);
    BLACK_BALL_SPAWN = position(discs[BLACK_BALL].pos);

    const holes = discs.filter(disc => disc.trait === 'bgHole');
    const holesX = holes.map(hole => hole.pos[0]);
    const holesY = holes.map(hole => hole.pos[1]);

    PLAYING_AREA = {
      x: {
        min: Math.min(...holesX),
        max: Math.max(...holesX)
      },
      y: {
        min: Math.min(...holesY),
        max: Math.max(...holesY)
      }
    };
  }
}

function getRemainingBalls(team) {
  switch (team) {
    case TEAM.RED:
      return REMAINING_RED_BALLS;
    case TEAM.BLUE:
      return REMAINING_BLUE_BALLS;
    default:
      return [];
  }
}

function ballInPlayingArea(ballIndex) {
  const ball = getBall(ballIndex);
  return inPlayingArea(ball);
}

function playerInPlayingArea(player) {
  player = player ? room.getPlayer(player.id) : null;
  return player ? inPlayingArea(player.position) : false;
}

function inPlayingArea(pos) {
  return pos && pos.x > PLAYING_AREA.x.min && pos.x < PLAYING_AREA.x.max && pos.y > PLAYING_AREA.y.min && pos.y < PLAYING_AREA.y.max;
}

function selectMap(name) {
  if (CURRENT_MAP !== name) {
    LOG.info(`Select ${name}`);
    
    const stadium = MAPS[name];
    
    room.setCustomStadium(stadium);
  
    CURRENT_MAP = name;
    CURRENT_MAP_OBJECT = undefined;

    if (CURRENT_MAP === NEXT_MAP) {
      CURRENT_MAP_OBJECT = NEXT_MAP_OBJECT;
    }
    if (CURRENT_MAP_OBJECT === undefined) {
      CURRENT_MAP_OBJECT = JSON.parse(stadium);
    }
    loadMapProperties();
  }
  return CURRENT_MAP_OBJECT;
}

function nextMap(name) {
  if (NEXT_MAP !== name) {
    LOG.info(`Next ${name}`);

    NEXT_MAP = name;
    NEXT_MAP_OBJECT = undefined;
  
    if (name !== undefined) {
      NEXT_MAP_OBJECT = JSON.parse(MAPS[NEXT_MAP]);
    }
  }
  return NEXT_MAP_OBJECT;
}

function startNextMap(name, by) {
  name = name.toUpperCase();

  let mapObject = nextMap(name);

  let message = `Next map is ${mapObject.name}, set by ${by}.`;

  const delaySeconds = PLAYING && playersInGameLength() > 1 ? NEW_GAME_DELAY_SECONDS : 0;

  if (delaySeconds > 0) {
    message += ` Current game will be stopped in ${delaySeconds} seconds...`;
  }
  
  notify(message);
  
  if (PLAYING) {
    SELECTING_MAP_TASK = setTimeout(() => {
      stopGame();
      SELECTING_MAP_TASK = undefined;
    }, delaySeconds * 1000);
  } else {
    chooseMap();
  }
}

function isPractice() {
  return CURRENT_MAP === 'PRACTICE';
}

function chooseMap() {
  let previousPlayers = N_PLAYERS;

  updatePlayersLength();

  if (N_PLAYERS != previousPlayers) {
    LOG.debug(`${previousPlayers} -> ${N_PLAYERS} players in the room (Playing: ${PLAYING})`);
  }

  const noAfk = activePlayers().length;

  if (PLAYING) {
    if (NEXT_MAP !== CURRENT_MAP && noAfk >= 2 && isPractice()) {
      stopGame();
      return true;
    }
  } else if (SELECTING_MAP_TASK === undefined) {
    if (NEXT_MAP) {
      selectMap(NEXT_MAP);

      if (NEXT_MAP === DEFAULT_MAP) {
        NEXT_MAP = undefined;
        NEXT_MAP_OBJECT = undefined;
      }
    } else if (N_PLAYERS === 1 || noAfk === 1) {
      selectMap('PRACTICE');
    } else if (noAfk > 0) {
      selectMap(DEFAULT_MAP);
    }
  
    if (noAfk > 0) {
      if (GAME_OVER && noAfk > 1) {
        info(`Next game will start in ${GAME_OVER_DELAY_SECONDS} seconds`);
        setTimeout(startGame, GAME_OVER_DELAY_SECONDS * 1000);
      } else {
        LOG.debug('Start game, noAfk', activePlayers());
        startGame(true);
      }
    }
    return true;
  }
  return false;
}

function updateCurrentPlayer({ changeTeam = true, delayMove = false, foul = false } = {}) {
  if (N_PLAYERS === 0) {
    resetCurrentPlayer();
  } else if (delayMove) {
    onBallsStatic(`${getCaller(updateCurrentPlayer)} -> updateCurrentPlayer`, () => {
      updateCurrentPlayer({ changeTeam, delayMove: false, foul });
    });
  } else if (foul || (!FOUL && (!EXTRA_SHOTS || !CURRENT_PLAYER))) {
    if (RULES_ENABLED) {
      const previousTurnPlayer = CURRENT_PLAYER;

      if (changeTeam) {
        CURRENT_TEAM = getOppositeTeam(CURRENT_TEAM);
      } else if (!CURRENT_TEAM) {
        CURRENT_TEAM = TEAM.RED;
      }

      if (checkPlayersRemaining()) {
        let currentIndex = NEXT_PLAYERS[CURRENT_TEAM];
        let currentTeamPlayers = TEAMS[CURRENT_TEAM];
      
        CURRENT_PLAYER = currentTeamPlayers[currentIndex];
        NEXT_PLAYERS[CURRENT_TEAM] = (currentIndex + 1) % currentTeamPlayers.length;
    
        if (CURRENT_PLAYER) {
          CURRENT_PLAYER = room.getPlayer(CURRENT_PLAYER.id);

          movePlayersOutOfTurn();

          if (!previousTurnPlayer || CURRENT_PLAYER.id !== previousTurnPlayer.id) {
            LOG.debug('CURRENT_PLAYER', CURRENT_PLAYER, 'EXTRA_SHOTS', EXTRA_SHOTS);
        
            if (playersInGameLength() > 1) {
              info(`Turn ${getTeamIcon(CURRENT_TEAM)} ${CURRENT_PLAYER.name}`);
              
              if (foul) {
                extraShotsInfo();
              }
            }
          }
          
          moveCurrentPlayer(!isPractice());
          
          onBallsStatic('nextTurnWaitForShot', () => enableGoals(false));
        }
      }
    } else {
      checkPlayersRemaining();
    }
  } else if (!changeTeam) {
    moveCurrentPlayer(false);
  }
  TURN_TIME = 0;
}

function extraShotsInfo() {
  if (EXTRA_SHOTS) {
    info(`${CURRENT_PLAYER.name} has ${EXTRA_SHOTS} shots now`);
  }
}

function speedInfo(player) {
  const auth = getAuth(player);

  if (!SPEED_INFO.has(auth)) {
    info("Press any kick key to move faster (space, shift, x, ctrl)", player, COLOR.GREEN);

    SPEED_INFO.add(auth);
  }
}

function updateNextPlayers() {
  Object.entries(NEXT_PLAYERS).forEach(([team, nextIndex]) => {
    const teamPlayers = TEAMS[team];
    NEXT_PLAYERS[team] = teamPlayers.length > 0 ? (nextIndex % teamPlayers.length) : 0;
  });
}

function resetCurrentPlayer() {
  NEXT_PLAYERS = {
    [TEAM.RED]: 0,
    [TEAM.BLUE]: 0,
  };
  FOUL = false;
  EXTRA_SHOTS = 0;
  CURRENT_TEAM = undefined;
  CURRENT_PLAYER = undefined;
  BLACK_SCORED_TEAM = undefined;
  SCORED_BALLS_TURN.clear();
  enableGoals(false);
}

function updatePlayerCollisions(player) {
  // Add kickOff flag to cGroup only for extended rules or first shot (kickOffLine barrier)
  const updateKickOffFlag = (KICKOFF && RULES_ENABLED && (USE_EXTENDED_RULES || !SHOTS)) ? addFlag : removeFlag;

  updatePlayerFlags('cGroup', player, (cGroup) => {
    cGroup = removeFlag(cGroup, room.CollisionFlags.c1); // Remove c1 cGroup (other player)
    cGroup = addFlag(cGroup, room.CollisionFlags.c0); // Add c0 cGroup (current player)
    cGroup = updateKickOffFlag(cGroup, room.CollisionFlags.c2); // c2 cGroup (kickOff)
    return cGroup;
  });
}

function updateOutOfTurnCollisions(player = undefined) {
  if (RULES_ENABLED) {
    if (player) {
      updateOutOfTurnCollisionsPlayerFlags(player);
    } else {
      playersOutOfTurn().forEach(updateOutOfTurnCollisionsPlayerFlags);
    }
  }
}

function updateOutOfTurnCollisionsPlayerFlags(outOfTurnPlayer) {
  updatePlayerFlags('cGroup', outOfTurnPlayer, (cGroup) => {
    cGroup = addFlag(cGroup, room.CollisionFlags.c1); // Add c1 cGroup (other player)
    cGroup = removeFlag(cGroup, room.CollisionFlags.c0); // Remove c0 cGroup (current player)
    return cGroup;
  });
}

function resetCollisions() {
  playersInGame().forEach(updatePlayerCollisions);
}

function kickOff(enable = true) {
  KICKOFF = enable;

  LOG.debug('KICKOFF', KICKOFF);
  
  if (KICKOFF) {
    moveBall(WHITE_BALL, WHITE_BALL_SPAWN);

    if (isPractice()) {
      moveBall(BLACK_BALL, BLACK_BALL_SPAWN);
    }

    moveCurrentPlayer();
  } else {
    updatePlayerCollisions(CURRENT_PLAYER);
  }
}

function moveHostPlayer(host) {
  if (host && host.team !== TEAM.SPECTATOR) {
    // Move host out of the table
    room.setPlayerDiscProperties(host.id, position(HOST_POSITION));
  }
}

const INDICATOR_REFERENCE = position(-178, 207);
const INDICATOR_SPAN = 356 / 4;

const WAITING_AREA = [ // positions where the players will wait for its turn
  position(INDICATOR_REFERENCE.x - INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // red 1
  position(INDICATOR_REFERENCE.x + INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // red 2
  position(-INDICATOR_REFERENCE.x - INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // blue 1
  position(-INDICATOR_REFERENCE.x + INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // blue 2
];

function movePlayerToWaitingArea(player) {
  if (RULES_ENABLED && player) {
    if (playerInPlayingArea(player)) {
      let i = TEAMS[player.team].findIndex(p => p.id === player.id) % 2;
    
      if (i < 0) {
        i = 0;
      }
      if (player.team === TEAM.BLUE) {
        i += 2;
      }
  
      room.setPlayerDiscProperties(player.id, WAITING_AREA[i]);

      LOG.debug('movePlayerToWaitingArea', player);
    }
    updateOutOfTurnCollisions(player);
  }
}

function movePlayersOutOfTurn() {
  if (RULES_ENABLED) {
    playersOutOfTurn().forEach(movePlayerToWaitingArea);
  }
}

const PLAYER_SPAWN_POSITIONS = [ // positions where the player can spawn for its turn
  position(0, 0), // center
  position(-267, -89), // top left
  position(-267, 89), // top right
  position(267, -89), // bottom left
  position(267, 89) // bottom right
];

function moveCurrentPlayer(always = true) {
  if (RULES_ENABLED && CURRENT_PLAYER) {
    const whiteBallPosition = room.getBallPosition();

    const isSpawn = WHITE_BALL_SPAWN.equals(whiteBallPosition);

    if (always || KICKOFF || !playerInPlayingArea(CURRENT_PLAYER)) {
      let pos;
      let posDistanceToWhite;

      if (KICKOFF || isSpawn) {
        const teamSpawnPoints = CURRENT_TEAM === TEAM.RED ? CURRENT_MAP_OBJECT.redSpawnPoints : CURRENT_MAP_OBJECT.blueSpawnPoints;
        pos = position(teamSpawnPoints[0]);
        posDistanceToWhite = distance(pos, whiteBallPosition);
      } else {
        const distances = PLAYER_SPAWN_POSITIONS.map(spawn => distance(spawn, whiteBallPosition));
        posDistanceToWhite = Math.min(...distances);
        const minimumDistanceIndex = distances.indexOf(posDistanceToWhite);

        pos = PLAYER_SPAWN_POSITIONS[minimumDistanceIndex];

        const minimumDistance = 2*(BALL_RADIUS + PLAYER_RADIUS);
  
        if (posDistanceToWhite < minimumDistance) {
          const direction = pos.x <= whiteBallPosition.x ? -1 : 1;
          pos.x += minimumDistance * direction;
        }
      }

      if (always || KICKOFF || posDistanceToWhite < distance(room.getPlayer(CURRENT_PLAYER.id).position, whiteBallPosition)) {
        room.setPlayerDiscProperties(CURRENT_PLAYER.id, pos);
      }

      speedInfo(CURRENT_PLAYER);

      LOG.debug('moveCurrrentPlayer', pos);
    }
  }
  updatePlayerCollisions(CURRENT_PLAYER);
}

function resetGameStatistics() {
  SHOTS = 0;

  GAME_OVER = false;
  WINNER_TEAM = undefined;
  BALLS_MOVING = false;

  REMAINING_RED_BALLS = RED_BALLS.slice();
  REMAINING_BLUE_BALLS = BLUE_BALLS.slice();
}

function gameStatistics() {
  if (SHOTS > 0) {
    info(`Total Shots: ${SHOTS}`);
  }
}

function onGameStart() {
  LOG.info('onGameStart');

  PLAYING = true;

  resetPlayingAFK();

  const lastWinnerTeam = WINNER_TEAM;
  
  resetGameStatistics();
  
  moveHostPlayer(getHostPlayer());

  updateTeams();
  
  resetCurrentPlayer();

  CURRENT_TEAM = lastWinnerTeam;

  LOG.debug('onGameStart CURRENT_TEAM', CURRENT_TEAM);

  updateCurrentPlayer();

  kickOff();

  resetMapVoting();
  resetRulesVoting();
}

function onGameStop(byPlayer) {
  LOG.info('onGameStop');

  PLAYING = false;

  gameStatistics();
  
  movePlayersToSpectators();

  if (!byPlayer || isHostPlayer(byPlayer)) {
    if (CHANGING_TEAMS.size > 0) {
      CHANGING_TEAMS_CALLBACK.add('movePlayersToSpectators -> chooseMap', chooseMap);
    } else {
      chooseMap();
    }
  }
}

// TODO: kick strength control (check if isBallMoving(WHITE_BALL), otherwise modify WHITE_BALL xspeed / yspeed based on distance between player and ball)
function onPlayerBallKick(player) {
  LOG.debug('onPlayerBallKick', player.name);

  SHOTS++;
  
  LAST_PLAYER = player;

  SCORED_BALLS_TURN.clear();
  enableGoals();

  if (KICKOFF) {
    kickOff(false);
  }

  if (EXTRA_SHOTS) {
    EXTRA_SHOTS--;
  }

  if (RULES_ENABLED) {
    if (player.id === CURRENT_PLAYER.id) {
      if (USE_EXTENDED_RULES && BALLS_MOVING) {
        foul("〰️❕ Balls were still moving");
      } else {
        checkBallsMoving();
  
        if (!EXTRA_SHOTS && playersInGameLength() > 1) {
          movePlayerToWaitingArea(CURRENT_PLAYER);
        }
  
        updateCurrentPlayer({ delayMove: true });
      }
    } else {
      foul("𓀙 Wrong player turn!", false);
    }
  } else {
    CURRENT_PLAYER = player;
    CURRENT_TEAM = player.team;
  }
}

let UPDATING_TEAMS = false;

function setTeams() {
  if (UPDATING_TEAMS) {
    return false;
  }
  UPDATING_TEAMS = true;

  const teams = getTeams();

  let nextTeam = teams[TEAM.RED].length > teams[TEAM.BLUE].length ? TEAM.BLUE : TEAM.RED;
  let otherTeam = getOppositeTeam(nextTeam);

  const newPlayers = new Set();

  function addPlayer(spectator, team) {
    setPlayerTeam(spectator, team);
    teams[team].push(spectator);
    newPlayers.add(spectator.id);
  }

  function fill(spectator) {
    if (teams[nextTeam].length < TEAM_LIMIT) {
      addPlayer(spectator, nextTeam);
      return true;
    } else if (teams[otherTeam].length < TEAM_LIMIT) {
      addPlayer(spectator, otherTeam);
      return true;
    }
    return false;
  }

  teams[TEAM.SPECTATOR].filter(p => !isAFK(p)).forEach(spectator => {
    if (fill(spectator)) {
      const nextTeamAux = nextTeam;
      nextTeam = otherTeam;
      otherTeam = nextTeamAux;
    } else {
      gameFull(spectator);
    }
  });

  if (newPlayers.size > 0) {
    teams[TEAM.SPECTATOR] = teams[TEAM.SPECTATOR].filter(spectator => !newPlayers.has(spectator.id));
  }

  updateTeams(teams);

  UPDATING_TEAMS = false;

  return newPlayers.size > 0;
}

function gameFull(player) {
  const gameFull = [`Current game is full, but don't worry, you'll join in the next one, ${player.name}.`];
  
  if (!isDrinking(player)) {
    gameFull.push("Meanwhile, I can serve you a drink if you want.");
    message(gameFull, player);
    info(DRINK_MENU, player);
  } else {
    message(gameFull, player);
  }
}

/* Authentication */

function getAuth(player) {
  return AUTH[player.id];
}

function setAuth(player) {
  const auth = player.auth;

  AUTH[player.id] = auth;

  // Check if is a recent returning player
  if (auth in AUTH_CACHE_TASKS) {
    const oldAuth = AUTH_CACHE_TASKS[auth];
    clearTimeout(oldAuth.removalTask);
    delete AUTH[oldAuth.id];
    delete AUTH_CACHE_TASKS[auth];
  }

  checkAdmin(player);
}

function scheduleAuthRemoval(player) {
  const auth = AUTH[player.id];

  AUTH_CACHE_TASKS[auth] = {
    id: player.id,
    task: setTimeout(() => {
      delete AUTH[player.id];
      delete AUTH_CACHE_TASKS[auth];
      
      SPEED_INFO.delete(auth);
    }, MAX_AUTH_CACHE_MINUTES * 60 * 1000)
  };
}

function checkAdmin(player) {
  if (ADMINS.has(AUTH[player.id])) {
    room.setPlayerAdmin(player.id, true);
  }
}

/* AFK */

function isAFK(player) {
  return AFK_PLAYERS.has(player.id);
}

function setAFK(player) {
  AFK_PLAYERS.add(player.id);
  setPlayerTeam(player, TEAM.SPECTATOR);
}

function resetAFK(player, updateMap = true) {
  AFK_TIME[player.id] = 0;

  if (isAFK(player)) {
    AFK_PLAYERS.delete(player.id);

    if (updateMap) {
      if (!chooseMap()) {
        setTeams();
      }
    }
  }
}

function resetPlayingAFK() {
  playersInGame().forEach(player => resetAFK(player, false));
}

function clearAFK(player) {
  delete AFK_TIME[player.id];
}

function infoInactive(player) {
  info("You're now inactive, use !afk or press space to join the game", player, COLOR.DEFAULT);
}

function incrementAFK(player) {
  if (PLAYING && !GAME_OVER && player.team !== TEAM.SPECTATOR && N_PLAYERS > 1) {
    if (CURRENT_PLAYER && player.id === CURRENT_PLAYER.id) {
      const afkSeconds = ++AFK_TIME[player.id];
      if (afkSeconds === AFK_PLAYING_SECONDS - AFK_SECONDS_WARNING) {
        warn(`${player.name}, if you don't move in the next ${AFK_SECONDS_WARNING} seconds, you will be moved to spectators.`, player);
      } else if (afkSeconds >= AFK_PLAYING_SECONDS) {
        setAFK(player);
        infoInactive(player);
      }
    }
  } else if (N_PLAYERS >= MAX_PLAYERS && Math.floor(++AFK_TIME[player.id] / 60) >= MAX_FULL_AFK_MINUTES) {
    room.kickPlayer(player.id, `AFK > ${MAX_FULL_AFK_MINUTES} min`, false);
  }
}

function incrementTurnTime() {
  if (RULES_ENABLED && PLAYING && !GAME_OVER && playersInGameLength() > 1) {
    if (++TURN_TIME === TURN_MAX_SECONDS - TURN_SECONDS_WARNING) {
      warn(`${CURRENT_PLAYER.name}, if you don't shoot in the next ${TURN_SECONDS_WARNING} seconds, you will lose your turn.`, CURRENT_PLAYER);
    } else if (TURN_TIME >= TURN_MAX_SECONDS) {
      info(`${CURRENT_PLAYER.name} spent too much time to shoot.`);
      updateCurrentPlayer();
    }
  }
}

/* Room Handlers */

function onPlayerJoin(player) {
  LOG.info(`onPlayerJoin: ${player.name} (${player.auth})`);

  warn("The bot of this room is in alpha version, please be patient if something breaks or does not work as expected.", player);

  message(`Welcome ${player.name} to the HaxBilliards Pub 🎱`);

  setAuth(player);

  restoreDrink(player);

  if (!chooseMap()) {
    setTeams();
  }

  info("If you don't know how to play send !rules", player, COLOR.DEFAULT, 'italic');

  resetAFK(player);
}

function onPlayerLeave(player) {
  LOG.info(`onPlayerLeave: ${player.name}`);

  CHANGING_TEAMS.delete(player.id);

  if (!chooseMap()) {
    updateOnTeamMove(player);
  }
  
  if (!PLAYING && N_PLAYERS > 0 && player.admin) {
    startGame(true);
  } else if (!playersInGameLength()) {
    stopGame();
  }

  removeMapVotes(player);
  removeRulesVotes(player);

  clearAFK(player);

  scheduleAuthRemoval(player);
}

function onPlayerActivity(player) {
  resetAFK(player);
}

function onPlayerTeamChange(player) {
  LOG.debug('onPlayerTeamChange', player.name, player.team);

  if (CHANGING_TEAMS.delete(player.id) && !CHANGING_TEAMS.size) {
    CHANGING_TEAMS_CALLBACK.consume();
  }

  if (player.team === TEAM.SPECTATOR) {
    updateOnTeamMove(player);
  } else if (isHostPlayer(player)) {
    moveHostPlayer(player);
  } else if (PLAYING) {
    resetAFK(player);
    updateOnTeamMove(player);
  }
}

function updateOnTeamMove(player) {
  if (PLAYING) {
    setTeams();
    updateNextPlayers();

    LOG.debug('updateOnTeamMove', 'N_PLAYERS', N_PLAYERS, 'TEAM.SPECTATOR', TEAMS[TEAM.SPECTATOR].length);

    if (CURRENT_PLAYER && CURRENT_PLAYER.id === player.id) {
      CURRENT_PLAYER = null;
      updateCurrentPlayer({ changeTeam: false });
    } else if (checkPlayersRemaining()) {
      movePlayerToWaitingArea(player);
    }
  }
}

function checkPlayersRemainingTeam(team) {
  if (!playersInGameLength() && activePlayers().length > 0) {
    setTeams();
  }
  
  const teamPlayers = TEAMS[team];

  if (teamPlayers === undefined) {
    LOG.debug('teamPlayers', teamPlayers, TEAMS, team);
    return false;
  }

  let teamRemainingPlayers = teamPlayers.length;

  if (!teamRemainingPlayers) {
    const oppositeTeam = getOppositeTeam(team);

    if (team === CURRENT_TEAM) {
      CURRENT_TEAM = oppositeTeam;
    }

    teamRemainingPlayers = TEAMS[oppositeTeam].length;

    if (!teamRemainingPlayers) {
      stopGame();
      return false;
    } else if (!isPractice()) {
      if (!GAME_OVER) {
        info(`${getTeamName(team)} team has no active players remaining`, null, COLOR.INFO, 'bold');

        if (SHOTS > 0) {
          gameOver(true);
        } else {
          stopGame();
        }
      }
      return false;
    }
  }
  return true;
}

function checkPlayersRemaining() {
  return checkPlayersRemainingTeam(CURRENT_TEAM) && checkPlayersRemainingTeam(getOppositeTeam(CURRENT_TEAM));
}
