/* Game Mechanics */

let OPEN; // is the pub open?
let NEXT_OPEN; // when will the pub open?
let NEXT_CLOSE; // when will the pub close?
let EXTRA_HOURS; // should the pub be closed but still cannot be closed by whatever reason?

/** @type {import("haxball-types").Player} */
let CURRENT_PLAYER; // player
let CURRENT_TEAM; // team id

let NEXT_PLAYERS; // { team: [player ids] }
let LAST_PLAYER; // last player that kicked the ball
let EXTRA_SHOTS; // extra turns remaining from a foul

let REMAINING_RED_BALLS, REMAINING_BLUE_BALLS; // track balls in the playing area
let GAME_OVER; // if the game is finished and about to stop
let CHECK_GOALS; // if goals should be checked
let WINNER_TEAM; // team who won
let BLACK_SCORED_TEAM; // if the black was scored and by which team
let KICKOFF, FIRST_KICKOFF; // kickoff turn?
let FOUL; // has been a foul this turn?

let BALLS_MOVING; // are balls currently moving?
let FIRST_BALL_TOUCHED; // which ball was first touched in this turn
const BALLS_STATIC_CALLBACK = new EventQueue(); // event called right after balls are no longer moving
const BALLS_SCORED_TURN = new Set(); // balls scored this turn

const CHANGING_TEAMS = new Set(); // player ids that are currently changing teams
const CHANGING_TEAMS_CALLBACK = new EventQueue(); // event called right after all players have changed teams

let CURRENT_MAP, NEXT_MAP; // map name
let CURRENT_MAP_OBJECT, NEXT_MAP_OBJECT; // map object (parsed json)
let BOT_MAP; // is map bot-related or external?

/** @type {import("haxball-types").Scores} */
let LAST_GAME_SCORES; // room.getScores of last game played

const MAP_VOTES = {}; // map to set of player ids
let SELECTING_MAP_TASK; // map selection task
let NEXT_GAME_TASK; // game start with delay task
let ADMIN_MAP_CHANGE; // any admin forced the selection of a map?

let TURN_TIME; // current turn player elapsed time in ticks
let TEAM_TIME_FOULS; // how many times the current team committed a foul of time exceeded in this turn before changing teams

const SPEED_INFO = new Set(); // players auth notified with the shift speed tip
const AFK_PLAYERS = {}; // afk { player.id: from command? }
const AFK_TIME = {}; // player id to afk ticks

const AUTH = {}; // player id to auth
const CONN = {}; // player id to connection
const AUTH_CACHE_TASKS = {}; // player auth to removalTask
const MAX_AUTH_CACHE_MINUTES = WAIT_DRINK_MINUTES; // remove auth entry after player leaves the room

// Ball disc indexes
let WHITE_BALL, BLACK_BALL;
let RED_BALLS, BLUE_BALLS;

// Aim
const AIM_PLAYERS = new Set(); // players with aim disc preference
let WHITE_BALL_AIM, WHITE_BALL_NO_AIM; // both versions of white balls
let AIM_OPTION; // there is an aiming disc in the current map?

// Radius
let BALL_RADIUS, PLAYER_RADIUS, AIM_DISC_RADIUS;

// Initial positions
let WHITE_BALL_SPAWN, WHITE_BALL_NO_AIM_SPAWN, BLACK_BALL_SPAWN;

let PLAYING_AREA; // { x: { min, max }, y: { min, max } }
let PLAYING_AREA_PADDING; // distance between PLAYING_AREA.y and tableWall
let TABLE_WALLS; // list of table walls

// Where to stack the scored colored balls
let STACK_COLOR_SIDE_RED;
let STACK_COLOR_SIDE_BLUE;
let STACK_SIDE_HEIGHT; // height of the scored colored balls stack

// Strength control
const STRENGTH_MULTIPLIER = {}; // { player: int [1, MAX_PLAYER_STRENGTH] }
let KICK_DISTANCE_NORMALIZE; // function to normalize a distance between [1, 10]
let MAXIMUM_DISTANCE_TO_KICK; // distance limit to kick the ball when aiming is enabled

// Host player position if moved into the game
const HOST_POSITION = {
  [TEAM.RED]: position(-455, 136),
  [TEAM.BLUE]: position(455, 136)
};

// Statistics
let SHOTS; // number of shots in the game

const STATISTICS_DEFAULTS = {
  shots: 0, // total player kicks with static balls
  misses: 0, // misses even if not foul
  fouls: 0, // total fouls of any kind
  games: 0, // total games played with shots > 0 (finished, unfinished or abandoned)
  gamesAbandoned: 0, // total games with shots > 0 where the player left the game
  gamesFinished: 0, // games finished with the black scored, either win or lose
  wins: 0, // total games in which the player team won (may be unfinished)
  winsFinished: 0, // games finished with the black scored successfully in which the player team won
  balls: 0, // successfully scored balls (team color or black if is the last one)
  whiteBalls: 0, // white balls scored
  blackBalls: 0, // games with black scored successfully by this player
  score: 0, // accumulative points derived from other statistics
  elo: 0, // competitive ELO score derived from opponents ELO and game result
  timePlayed: 0, // total seconds playing (not in spectators)
};

// Only with: SHOTS > 0 and players > 1 and enabled rules (normal or extended)
const GAME_STATISTICS_DEFAULTS = {
  ...STATISTICS_DEFAULTS,
  // Current game only
  startTime: null, // latest time when the player joined the game
  team: null, // latest team of the player
};

/* Computed Statistics
losses: games - gamesAbandoned - wins
precision (hit %): 1 - (misses / shots)
precision (scored %): balls / shots
win rate %: wins / games
win rate % (finished): winsFinished / gamesFinished
abandon rate %: gamesAbandoned / games
title: derived from ELO [Beginner, Average, Intermediate, Profficient, Professional, Master, Grand Master]
*/

/** @type {Object.<string, GAME_STATISTICS_DEFAULTS>} */
let GAME_PLAYER_STATISTICS; // player auth to statistics for the current game

let GAME_PLAYER_STATISTICS_UPDATED; // if statistics were updated for the current game

/** @type {Object.<string, PLAYER_DATA_TYPE>} */
let GAME_PLAYER_FIELDS; // player auth to player fields to set

// Player data schema (just for type hint purposes)
const PLAYER_DATA_TYPE = {
  ...STATISTICS_DEFAULTS,
  name: null,
  updatedAt: null,
  createdAt: null,
};

/** @type {Object.<string, PLAYER_DATA_TYPE>} */
let PLAYERS_DATA = {}; // player auth to player data cache

let TOP_PLAYERS = {}; // stat field to [{ player stats }]

// Rules settings

class Rule {
  constructor(id, icon, description, implemented = true) {
    this.id = id;
    this.icon = icon;
    this.description = description;
    this.implemented = implemented;
  }
  toString() {
    return `${this.icon}  ${this.description}`;
  }
}

const RULES = rulesMapping([
  new Rule('ONE_SHOT_EACH_PLAYER', '𓀙', 'One shot each player'),
  new Rule('SCORE_PLAYER_COLOR', '🔴🔵', 'Score the balls with the same color as your player'),
  new Rule('EXTRA_SHOT_IF_SCORED', '🏵', 'If you score you shot again'),
  new Rule('BLACK_LAST', '🎱', 'Scoring black must be the last one or you lose'),
  new Rule('WHITE_FOUL', '⚪️', 'Scoring white is foul'),
  new Rule('FOUL_IF_MISS', '🌀', 'Foul when you do not touch any ball of your team'),
  new Rule('FOUL_WRONG_FIRST_BALL', '🔘❔', "Foul when you touch first a ball of opponent's team or the black ball when you shouldn't"),
  new Rule('FOUL_BALLS_MOVING', '〰️❕', 'Foul if you shot the ball when balls are still moving'),
  new Rule('KICKOFF_RIGHT', '⚪️➡️', 'After scoring the white ball you must shot to the right, from the 1/4 left part of the table (kickoff / kitchen area)'),
  new Rule('BLACK_WHITE_LOSE', '⚪️⚫️❗️', 'You lose if you score both black and white balls in the same shot'),
  new Rule('BLACK_COLOR_LOSE', '🔴🔵⚫️❗️', 'You lose if you score your last color ball along with the black ball in the same shot'),
  new Rule('BLACK_OPPOSITE_HOLE', '⚫️↔️↕️', 'Black, the last ball, must be scored in the opposite hole of your last scored ball. You lose scoring in another hole.', false),
]);

const RULESETS = { // ruleset name to set of rules
  NORMAL: [
    RULES.ONE_SHOT_EACH_PLAYER,
    RULES.SCORE_PLAYER_COLOR,
    RULES.EXTRA_SHOT_IF_SCORED,
    RULES.BLACK_LAST,
    RULES.WHITE_FOUL,
  ],
};
RULESETS.EXTENDED = [
  ...RULESETS.NORMAL,
  RULES.FOUL_IF_MISS,
  RULES.FOUL_WRONG_FIRST_BALL,
  RULES.FOUL_BALLS_MOVING,
  RULES.KICKOFF_RIGHT,
  RULES.BLACK_WHITE_LOSE,
  RULES.BLACK_COLOR_LOSE
];
RULESETS.OPPOSITE = [
  ...RULESETS.EXTENDED,
  RULES.BLACK_OPPOSITE_HOLE,
];
RULESETS.DISABLE = [];

let USING_RULES; // active rules { rule.id: rule }
let USING_RULESET; // active ruleset

const RULESET_VOTES = {}; // ruleset to set of player ids

Object.keys(RULESETS).forEach(ruleset => {
  RULESET_VOTES[ruleset] = new Set();
});

const AVAILABLE_RULESETS = Object.keys(RULESETS).filter(r => {
  return r !== 'OPPOSITE'; // hidden (not fully implemented)
}).map(r => r.toLowerCase()).join(', ');

function notImplementedRules(ruleset) {
  return RULESETS[ruleset].filter(rule => !rule.implemented);
}

function rulesMapping(listOfRules) {
  const rules = {};

  listOfRules.forEach(rule => {
    rules[rule.id] = rule;
  });

  return rules;
}

function getRuleset(ruleset) {
  if (!ruleset) {
    return null;
  }
  
  ruleset = ruleset.toUpperCase();

  if (ruleset === 'FULL') {
    ruleset = 'EXTENDED';
  } else if (ruleset === 'DEFAULT' || ruleset === 'AUTO' || ruleset === 'BASIC') {
    ruleset = 'NORMAL';
  } else if (ruleset === 'DISABLED') {
    ruleset = 'DISABLE';
  }

  return ruleset in RULESETS ? ruleset : null;
}

function loadMapProperties() {
  if (CURRENT_MAP_OBJECT) {
    const discs = CURRENT_MAP_OBJECT.discs;
    
    WHITE_BALL_AIM = discs.findIndex(disc => disc.trait === 'whiteBall');
    WHITE_BALL_NO_AIM = discs.findIndex(disc => disc.trait === 'whiteBallNoAim');

    if (WHITE_BALL_NO_AIM < 0) {
      WHITE_BALL_NO_AIM = WHITE_BALL_AIM;
    }

    WHITE_BALL = WHITE_BALL_AIM;

    BLACK_BALL = discs.findIndex(disc => disc.trait === 'blackBall');

    RED_BALLS = Object.freeze(new Set(findAllIndexes(discs, disc => disc.trait === 'redBall')));
    BLUE_BALLS = Object.freeze(new Set(findAllIndexes(discs, disc => disc.trait === 'blueBall')));

    REMAINING_RED_BALLS = [...RED_BALLS];
    REMAINING_BLUE_BALLS = [...BLUE_BALLS];

    BALL_RADIUS = CURRENT_MAP_OBJECT.traits.whiteBall.radius;
    PLAYER_RADIUS = CURRENT_MAP_OBJECT.playerPhysics.radius;
    AIM_DISC_RADIUS = CURRENT_MAP_OBJECT.traits.aimDisc.radius;

    WHITE_BALL_SPAWN = position(discs[WHITE_BALL_AIM].pos);
    BLACK_BALL_SPAWN = position(discs[BLACK_BALL].pos);

    WHITE_BALL_NO_AIM_SPAWN = WHITE_BALL_NO_AIM !== WHITE_BALL_AIM ? position(discs[WHITE_BALL_NO_AIM].pos) : null;

    AIM_OPTION = CURRENT_MAP_OBJECT.joints.find(joint => joint.d0 === WHITE_BALL_AIM) !== undefined;

    const stackSideCenterX = 45;
    const railStopLeft = CURRENT_MAP_OBJECT.vertexes.find(vertex => vertex.trait === 'railStopLeft');
    const railStopRight = CURRENT_MAP_OBJECT.vertexes.find(vertex => vertex.trait === 'railStopRight');
    
    STACK_SIDE_HEIGHT = (2 * BALL_RADIUS) * 10;
    STACK_COLOR_SIDE_RED = position(railStopLeft.x + stackSideCenterX, railStopLeft.y - STACK_SIDE_HEIGHT);
    STACK_COLOR_SIDE_BLUE = position(railStopRight.x - stackSideCenterX, railStopRight.y - STACK_SIDE_HEIGHT);

    const holes = discs.filter(disc => disc.trait === 'bgHole');
    const holesX = holes.map(hole => hole.pos[0]);
    const holesY = holes.map(hole => hole.pos[1]);

    PLAYING_AREA = Object.freeze({
      x: {
        min: Math.min(...holesX),
        max: Math.max(...holesX)
      },
      y: {
        min: Math.min(...holesY),
        max: Math.max(...holesY)
      }
    });

    PLAYING_AREA_PADDING = PLAYING_AREA.y.max - Math.max(...CURRENT_MAP_OBJECT.vertexes.filter(vertex => vertex.trait === 'tableWall').map(vertex => vertex.y));

    TABLE_WALLS = Object.freeze([
      Line.horizontal(PLAYING_AREA.y.min + PLAYING_AREA_PADDING), // up
      Line.horizontal(PLAYING_AREA.y.max - PLAYING_AREA_PADDING), // down
      Line.vertical(PLAYING_AREA.x.min + PLAYING_AREA_PADDING), // left
      Line.vertical(PLAYING_AREA.x.max - PLAYING_AREA_PADDING), // right
    ]);

    const minDistance = BALL_RADIUS + PLAYER_RADIUS;
    const maxDistance = AIM_DISC_RADIUS + PLAYER_RADIUS + KICK_PADDING;

    const NORMALIZE_MIN = 1;
    const NORMALIZE_MAX = 10;

    const normalizationValue = (NORMALIZE_MAX - NORMALIZE_MIN) / (maxDistance - minDistance);

    KICK_DISTANCE_NORMALIZE = (d) => NORMALIZE_MIN + ((d - minDistance) * normalizationValue); // normalize(d, minDistance, 1, maxDistance, 10)

    MAXIMUM_DISTANCE_TO_KICK = PLAYER_RADIUS + AIM_DISC_RADIUS/2 + BALL_RADIUS*2 - 1;
  }
}

function whiteBall(player = null) {
  return (WHITE_BALL_NO_AIM === null || isAim(player)) ? WHITE_BALL_AIM : WHITE_BALL_NO_AIM;
}

function getWhiteBallPosition() {
  let whiteBallPosition = getWhiteBall();

  if (WHITE_BALL_NO_AIM_SPAWN && WHITE_BALL_NO_AIM_SPAWN.closeTo(whiteBallPosition)) { // not yet updated
    whiteBallPosition = getBall(whiteBall(CURRENT_PLAYER) === WHITE_BALL_AIM ? WHITE_BALL_NO_AIM : WHITE_BALL_AIM);
  }

  return whiteBallPosition;
}

function setWhiteBall(player) {
  const playerWhiteBall = whiteBall(player);

  if (playerWhiteBall !== WHITE_BALL && BOT_MAP) {
    // move to playing area
    room.setDiscProperties(playerWhiteBall, room.getDiscProperties(WHITE_BALL));
    
    const otherWhiteBall = WHITE_BALL;
    
    // hide from playing area
    moveBall(otherWhiteBall, {
      ...WHITE_BALL_NO_AIM_SPAWN,
      cGroup: 0,
      cMask: 0,
    });

    WHITE_BALL = playerWhiteBall;

    LOG.debug('setWhiteBall', WHITE_BALL);
  }
}

function getTeamBalls(team) {
  switch (team) {
    case TEAM.RED:
      return RED_BALLS;
    case TEAM.BLUE:
      return BLUE_BALLS;
    default:
      return new Set();
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

function getBallTeam(ballIndex) {
  if (ballIndex === WHITE_BALL_AIM || ballIndex === WHITE_BALL_NO_AIM) {
    return null;
  }
  if (ballIndex === BLACK_BALL) {
    return getRemainingBalls(CURRENT_TEAM).length > 0 ? null : CURRENT_TEAM;
  }
  if (RED_BALLS.has(ballIndex)) {
    return TEAM.RED;
  }
  if (BLUE_BALLS.has(ballIndex)) {
    return TEAM.BLUE;
  }
  return undefined;
}

function getBallIcon(ballIndex) {
  if (ballIndex === WHITE_BALL_AIM || ballIndex === WHITE_BALL_NO_AIM) {
    return '⚪️';
  }
  if (ballIndex === BLACK_BALL) {
    return '🎱';
  }
  if (RED_BALLS.has(ballIndex)) {
    return '🔴';
  }
  if (BLUE_BALLS.has(ballIndex)) {
    return '🔵';
  }
  return '🔘';
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

function closeToTableBorder(pos, threshold = 22) { // 2*BALL_RADIUS
  threshold = PLAYING_AREA_PADDING + threshold;

  return pos && pos.x <= (PLAYING_AREA.x.min + threshold) || pos.x >= (PLAYING_AREA.x.max - threshold)
    || pos.y <= (PLAYING_AREA.y.min + threshold) || pos.y >= (PLAYING_AREA.y.max - threshold);
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
  }
  return CURRENT_MAP_OBJECT;
}

function nextMap(name) {
  if (NEXT_MAP !== name && name in MAPS) {
    LOG.info(`Next ${name}`);

    NEXT_MAP = name;
    NEXT_MAP_OBJECT = undefined;
  
    if (name !== undefined) {
      NEXT_MAP_OBJECT = JSON.parse(MAPS[NEXT_MAP]);
    }
  }
  return NEXT_MAP_OBJECT;
}

function selectNextMap(name, by, restart = true) {
  name = name.toUpperCase();

  const mapObject = nextMap(name);
  
  if (CURRENT_MAP !== name && !SELECTING_MAP_TASK) {
    notify(`Next map is ${mapObject.name}, set by ${by}.`);
  
    const delaySeconds = PLAYING && restart && playersInGameLength() > 1 ? NEW_GAME_DELAY_SECONDS : 0;
  
    if (delaySeconds > 0) {
      notify(`Current game will be stopped in ${delaySeconds} seconds...`, COLOR.NOTIFY, 'bold', 1);
    }
    
    if (PLAYING && restart) {
      SELECTING_MAP_TASK = setTimeout(function selectNextMapTask() {
        stopGame();
        SELECTING_MAP_TASK = undefined;
      }, delaySeconds * 1000);
    } else {
      chooseMap(restart);
    }
  }
}

function resetNextMap() {
  if (!ADMIN_MAP_CHANGE || !getPlayers().find(player => player.admin && player.id === ADMIN_MAP_CHANGE)) {
    NEXT_MAP = undefined;
    NEXT_MAP_OBJECT = undefined;
    ADMIN_MAP_CHANGE = undefined;
  }
}

function chooseMap(restart = false) {
  if (!N_PLAYERS) {
    resetMapVoting();
    resetRulesVoting();
  }

  if (!isOpen()) {
    return false;
  }

  const noAfk = activePlayers().length;

  if (PLAYING) {
    if (noAfk >= 2 && ((NEXT_MAP !== CURRENT_MAP && restart) || playersInGameLength() === 1)) {
      stopGame();
      return true;
    }
  } else if (SELECTING_MAP_TASK === undefined && NEXT_GAME_TASK === undefined) {
    if (NEXT_MAP) {
      selectMap(NEXT_MAP);
    } else if (noAfk > 0) {
      selectMap(DEFAULT_MAP);
    }
  
    if (noAfk > 0) {
      if (GAME_OVER && noAfk > 1) {
        const delaySeconds = Math.floor(GAME_OVER_DELAY_SECONDS / 2);
        startGame(delaySeconds);
      } else {
        startGame();
      }
    }
    return true;
  } else if (NEXT_GAME_TASK && !isOpen()) {
    clearTimeout(NEXT_GAME_TASK);
    NEXT_GAME_TASK = undefined;
  } else {
    LOG.debug('Already starting a game');
  }
  return false;
}

function updateCurrentPlayer({ changeTeam = true, delayMove = false, fromFoul = false, allowPractice = true } = {}) {
  if (!N_PLAYERS) {
    resetCurrentPlayer();
  } else if (GAME_OVER || BLACK_SCORED_TEAM) {
    return; // avoid changing the winner player
  } else if (delayMove) {
    onBallsStatic(`${getCaller(updateCurrentPlayer)} -> updateCurrentPlayer`, () => {
      updateCurrentPlayer({ changeTeam, delayMove: false, fromFoul });
    });
  } else {
    if (!CURRENT_PLAYER || fromFoul || (!FOUL && !EXTRA_SHOTS)) {
      if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
        const previousTurnPlayer = CURRENT_PLAYER;        

        if (changeTeam) {
          CURRENT_TEAM = getOppositeTeam(CURRENT_TEAM);
        } else if (!CURRENT_TEAM) {
          CURRENT_TEAM = TEAM.RED;
        }

        if (checkPlayersRemaining(allowPractice)) {
          const currentId = NEXT_PLAYERS[CURRENT_TEAM].shift();
          const currentTeamPlayers = TEAMS[CURRENT_TEAM];
        
          CURRENT_PLAYER = currentTeamPlayers.find(p => p.id === currentId);
      
          if (CURRENT_PLAYER) {
            CURRENT_PLAYER = room.getPlayer(CURRENT_PLAYER.id);

            NEXT_PLAYERS[CURRENT_TEAM].push(currentId);

            movePlayersOutOfTurn();

            if (!previousTurnPlayer || CURRENT_PLAYER.id !== previousTurnPlayer.id) {
              TEAM_TIME_FOULS = 0;

              setWhiteBall(CURRENT_PLAYER);
              
              turnInfoCurrentPlayer();
            }
            
            const practice = playersInGameLength() === 1;
            
            if (!practice || hasOutOfTurnCollisions(CURRENT_PLAYER)) {
              moveCurrentPlayer(!practice, KICKOFF);
            }
          }
        }
      } else {
        checkPlayersRemaining();
      }
    } else if (!FOUL && playersInGameLength() > 1 && (!changeTeam || KICKOFF || EXTRA_SHOTS || hasOutOfTurnCollisions(CURRENT_PLAYER))) {
      moveCurrentPlayer(false, KICKOFF);
    }
  }
  TURN_TIME = 0;
}

function turnInfoCurrentPlayer() {
  LOG.debug('CURRENT_PLAYER', CURRENT_PLAYER, 'EXTRA_SHOTS', EXTRA_SHOTS);

  if (playersInGameLength() > 1) {
    let turnInfo = `Turn ${getTeamIcon(CURRENT_TEAM)} ${CURRENT_PLAYER.name}`;

    if (EXTRA_SHOTS) {
      turnInfo += `  (${EXTRA_SHOTS} ${EXTRA_SHOTS !== 1 ? 'shots' : 'shot'})`;
    }

    info(turnInfo);
  }
}

function speedInfo(player) {
  const auth = getAuth(player);

  if (!SPEED_INFO.has(auth)) {
    info("Press any kick key to move faster (space, shift, x, ctrl)", player, COLOR.GREEN);

    SPEED_INFO.add(auth);
  }
}

function updateNextPlayers(player, add = false) {
  Object.keys(NEXT_PLAYERS).forEach((team) => {
    NEXT_PLAYERS[team] = NEXT_PLAYERS[team].filter(id => id !== player.id);
  });
  if (add) {
    const insertAt = CURRENT_PLAYER && CURRENT_PLAYER.team === player.team ? -1 : NEXT_PLAYERS[player.team].length;
    NEXT_PLAYERS[player.team].splice(insertAt, 0, player.id); // insert before the current player next turn
  }
}

function resetCurrentPlayer() {
  FOUL = false;
  KICKOFF = false;
  EXTRA_SHOTS = 0;
  TEAM_TIME_FOULS = 0;
  CURRENT_TEAM = undefined;
  CURRENT_PLAYER = undefined;
  BLACK_SCORED_TEAM = undefined;
  BALLS_SCORED_TURN.clear();
  enableGoals(false);
  updateTeams();
  NEXT_PLAYERS = {
    [TEAM.RED]: TEAMS[TEAM.RED].map(player => player.id),
    [TEAM.BLUE]: TEAMS[TEAM.BLUE].map(player => player.id),
  };
}

function updatePlayerCollisions(player) {
  // Add kickOff flag to cGroup only for extended rules or first shot (kickOffLine barrier)
  const updateKickOffFlag = (KICKOFF && (USING_RULES.KICKOFF_RIGHT || FIRST_KICKOFF)) ? addFlag : removeFlag;

  updatePlayerFlags('cGroup', player, (cGroup) => {
    cGroup = removeFlag(cGroup, room.CollisionFlags.c1); // Remove c1 cGroup (other player)
    cGroup = addFlag(cGroup, room.CollisionFlags.c0); // Add c0 cGroup (current player)
    cGroup = updateKickOffFlag(cGroup, room.CollisionFlags.c2); // c2 cGroup (kickOff)
    return cGroup;
  });
}

function updateOutOfTurnCollisions(player = undefined) {
  if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
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

function hasOutOfTurnCollisions(player) {
  return !hasFlag(room.getPlayerDiscProperties(player.id).cGroup, room.CollisionFlags.c0);
}

function resetCollisions() {
  playersInGame().forEach(updatePlayerCollisions);
}

function kickOff(enable = true) {
  KICKOFF = enable;

  LOG.debug('KICKOFF', KICKOFF);
  
  if (KICKOFF) {
    moveBall(WHITE_BALL, WHITE_BALL_SPAWN);

    if (playersInGameLength() === 1 && (CURRENT_MAP === 'PRACTICE' || !ballInPlayingArea(BLACK_BALL))) {
      moveBall(BLACK_BALL, BLACK_BALL_SPAWN);
      BLACK_SCORED_TEAM = undefined;
    }

    if (CURRENT_MAP === 'PRACTICE') {
      FIRST_KICKOFF = true;
    }

    moveCurrentPlayer(true, true);
  } else {
    updatePlayerCollisions(CURRENT_PLAYER);
  }
}

function moveHostPlayer(host) {
  if (PLAYING && host && host.team !== TEAM.SPECTATOR) {
    // Move host out of the table
    room.setPlayerDiscProperties(host.id, HOST_POSITION[host.team]);
  }
}

const INDICATOR_REFERENCE = position(178, 235); // 178, 207
const INDICATOR_SPAN = 356 / 4;

const WAITING_AREA = { // positions where the players will wait for its turn
  [TEAM.RED]: [
    position(-INDICATOR_REFERENCE.x - INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // red 1
    position(-INDICATOR_REFERENCE.x + INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // red 2
    position(-INDICATOR_REFERENCE.x + INDICATOR_SPAN*1.5, INDICATOR_REFERENCE.y), // red 3
    position(-INDICATOR_REFERENCE.x - INDICATOR_SPAN*1.5, INDICATOR_REFERENCE.y), // red 4
  ],
  [TEAM.BLUE]: [
    position(INDICATOR_REFERENCE.x - INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // blue 1
    position(INDICATOR_REFERENCE.x + INDICATOR_SPAN/2, INDICATOR_REFERENCE.y), // blue 2
    position(INDICATOR_REFERENCE.x - INDICATOR_SPAN*1.5, INDICATOR_REFERENCE.y), // blue 3
    position(INDICATOR_REFERENCE.x + INDICATOR_SPAN*1.5, INDICATOR_REFERENCE.y), // blue 4
  ]
};

function movePlayerToWaitingArea(player) {
  if (USING_RULES.ONE_SHOT_EACH_PLAYER && player && player.team !== TEAM.SPECTATOR) {
    if (playerInPlayingArea(player)) {
      const waitingArea = WAITING_AREA[player.team];

      let i = TEAMS[player.team].findIndex(p => p.id === player.id) % waitingArea.length;
    
      if (i < 0) {
        i = 0;
      }
  
      const waitingAreaPosition = waitingArea[i];

      room.setPlayerDiscProperties(player.id, waitingAreaPosition);

      LOG.debug('movePlayerToWaitingArea', player.id, player.name, waitingAreaPosition);
    }
    updateOutOfTurnCollisions(player);
  }
}

function movePlayersOutOfTurn() {
  if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
    playersOutOfTurn().forEach(movePlayerToWaitingArea);
  }
}

function moveCurrentPlayer(always = true, kickoff = false) {
  if (!GAME_OVER && CURRENT_PLAYER) {
    const player = room.getPlayer(CURRENT_PLAYER.id);

    if (player) {
      if (USING_RULES.ONE_SHOT_EACH_PLAYER && (always || kickoff || KICKOFF || !playerInPlayingArea(player))) {
        let pos;
        let posDistanceToWhite;
  
        const whiteBallPosition = getWhiteBallPosition();
  
        if (kickoff || (KICKOFF && WHITE_BALL_SPAWN.closeTo(whiteBallPosition))) { // kickoff is a hint, because when KICKOFF white ball position may not be yet updated
          const teamSpawnPoints = CURRENT_TEAM === TEAM.RED ? CURRENT_MAP_OBJECT.redSpawnPoints : CURRENT_MAP_OBJECT.blueSpawnPoints;
          pos = position(teamSpawnPoints[0]);
          posDistanceToWhite = distance(pos, whiteBallPosition);
        } else {
          const remainingBalls = getRemainingBalls(CURRENT_TEAM || player.team);
          const targetBalls = remainingBalls.length > 0 ? remainingBalls : [BLACK_BALL];
          const midPosition = medianPosition(targetBalls.map(getBall));
  
          posDistanceToWhite = BALL_RADIUS + PLAYER_RADIUS + (isAim(player) ? AIM_DISC_RADIUS : BALL_RADIUS);

          // LOG.debug('whiteBallPosition', whiteBallPosition, 'midPosition', midPosition, 'posDistanceToWhite', posDistanceToWhite);

          const whiteMidVector = diff(whiteBallPosition, midPosition);
          const whiteMidUnitVector = normalizeVector(whiteMidVector);

          const offsetX = posDistanceToWhite * whiteMidUnitVector.x;
          const offsetY = posDistanceToWhite * whiteMidUnitVector.y;
          
          pos = position(whiteBallPosition.x - offsetX, whiteBallPosition.y - offsetY);
          
          // LOG.debug('diff', whiteMidVector, 'u', whiteMidUnitVector, 'offsetX', offsetX, 'offsetY', offsetY, 'pos', pos);
        }

        if (always || KICKOFF || !player.position || posDistanceToWhite < distance(player.position, whiteBallPosition)) {
          room.setPlayerDiscProperties(player.id, pos);
          LOG.debug('moveCurrentPlayer', pos);
        }
        speedInfo(player);
      }
      
      updatePlayerCollisions(player);
    }
  }
}

function resetGameStatistics() {
  SHOTS = 0;

  GAME_OVER = false;
  WINNER_TEAM = undefined;
  BALLS_MOVING = false;
  FIRST_BALL_TOUCHED = null;

  REMAINING_RED_BALLS = [...RED_BALLS];
  REMAINING_BLUE_BALLS = [...BLUE_BALLS];

  GAME_PLAYER_FIELDS = {};
  GAME_PLAYER_STATISTICS = {};
  GAME_PLAYER_STATISTICS_UPDATED = false;
  playersInGame().forEach(resetPlayerStatistics);
}

function resetPlayerStatistics(player) {
  const auth = getAuth(player);

  if (!GAME_OVER) {
    if (auth in GAME_PLAYER_STATISTICS) {
      updatePlayerTimePlayed(auth);
    } else {
      GAME_PLAYER_FIELDS[auth] = { name: player.name };
      GAME_PLAYER_STATISTICS[auth] = { ...GAME_STATISTICS_DEFAULTS };
      GAME_PLAYER_STATISTICS[auth].startTime = Date.now();
    }
    GAME_PLAYER_STATISTICS[auth].team = player.team;
  }
}

function updatePlayerTimePlayed(auth, stop = false) {
  const stats = GAME_PLAYER_STATISTICS[auth];

  if (stats) {
    const now = Date.now();

    if (stats.startTime !== undefined) {
      stats.timePlayed += Math.trunc((now - stats.startTime) / 1000);
    }

    if (stop) {
      delete stats.startTime;
    } else {
      stats.startTime = now;
    }
  }

  return stats;
}

function onGameStart(byPlayer) {
  LOG.info('onGameStart');

  PLAYING = true;

  if (!playersInGameLength()) {
    setTeams();
  }

  resetPlayingAFK();

  const lastWinnerTeam = WINNER_TEAM;
  
  resetGameStatistics();
  resetCurrentPlayer();

  if (BOT_MAP) {
    moveHostPlayer(getHostPlayer());
  
    CURRENT_TEAM = lastWinnerTeam;
  
    LOG.debug('onGameStart CURRENT_TEAM', CURRENT_TEAM);
  
    if (!byPlayer || playersInGameLength() || isHostPlayer(byPlayer)) {
      updateCurrentPlayer({ changeTeam: !CURRENT_TEAM });
    }
  
    FIRST_KICKOFF = true;
    kickOff();
  }
}

function onGameStop(byPlayer) {
  LOG.info('onGameStop');

  PLAYING = false;

  if (!GAME_OVER) {
    shotsInfo();
    updateGameOverPlayersStatistics();
  }
  
  if (BOT_MAP) {
    movePlayersToSpectators();
  
    if (!byPlayer || isHostPlayer(byPlayer)) {
      if (CHANGING_TEAMS.size > 0) {
        CHANGING_TEAMS_CALLBACK.add('movePlayersToSpectators -> chooseMap', chooseMap);
      } else {
        chooseMap();
      }
    }
  }

  if (EXTRA_HOURS && !activePlayers().length) {
    EXTRA_HOURS = false;
    pubIsClosed(null);
  }
}

let MOVE_ORDER = 0;

function movePlayersToSpectators() {
  const redTeam = TEAMS[TEAM.RED].slice();
  const blueTeam = TEAMS[TEAM.BLUE].slice();

  if (MOVE_ORDER === 0 || activePlayers().length === 3) {
    // A vs B -> AB -> A vs B
    // AB vs CD -> ABCD -> AC vs BD
    // ABC vs DEF -> ABCDEF -> ACE vs BDF
    // ABCD vs EFGH -> ABCDEFGH -> ACEG vs BDFH
    redTeam.forEach(movePlayerToSpectator);
    blueTeam.forEach(movePlayerToSpectator);
  } else {
    // A vs B -> AB -> A vs B
    // AC vs BD -> ABDC -> AD vs BC
    // ACE vs BDF -> ABDCFE -> ADF vs BCE
    // ACEG vs BDFH -> ABDCFHEG -> ADFE -> BCHG
    while (redTeam.length > 0 || blueTeam.length > 0) {
      if (redTeam.length > 0) {
        movePlayerToSpectator(redTeam.shift());
      }
      if (blueTeam.length > 0) {
        movePlayerToSpectator(blueTeam.shift());
        if (blueTeam.length > 0) {
          movePlayerToSpectator(blueTeam.shift());
        }
      }
    }
  }

  MOVE_ORDER = (MOVE_ORDER + 1) % 2;
}

let UPDATING_TEAMS = false;

function setTeams(notifyFull = false) {
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
    } else if (notifyFull) {
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
    chatHost(gameFull, player);
    info(DRINK_MENU, player);
  } else {
    chatHost(gameFull, player);
  }
}

/* Authentication */

function getAuth(player) {
  return AUTH[player.id];
}

function getConnection(player) {
  return CONN[player.id];
}

function setAuth(player) {
  const auth = player.auth;

  if (auth in AUTH_CACHE_TASKS) {
    // Is a recent returning player
    clearTimeout(AUTH_CACHE_TASKS[auth]);
    delete AUTH_CACHE_TASKS[auth];
  } else if (Object.values(AUTH).includes(auth) && (PRODUCTION || !isAdmin(auth))) {
    // Is multi-account (already playing with other player), skip for admins (testing)
    return false;
  }

  AUTH[player.id] = auth;
  CONN[player.id] = player.conn;

  checkAdmin(player);

  return true;
}

function scheduleAuthRemoval(player) {
  const auth = getAuth(player);

  AUTH_CACHE_TASKS[auth] = setTimeout(() => {
    delete PLAYERS_DATA[auth];
    delete BAD_WORDS_PLAYERS[auth];
    delete AUTH_CACHE_TASKS[auth];
    
    SPEED_INFO.delete(auth);
  }, MAX_AUTH_CACHE_MINUTES * 60 * 1000);

  delete AUTH[player.id];
  delete CONN[player.id];
}

function getPlayerByAuth(auth) {
  const playerId = Object.keys(AUTH).find(playerId => AUTH[playerId] === auth);
  return getPlayers().find(player => player.id == playerId); // == as player.id is integer like 1 and playerId is string like '1'
}

function getPlayersByConnection(conn) {
  return getPlayers().filter(player => conn === getConnection(player));
}

function mapAuthToPlayers() {
  const players = {};

  for (const player of getPlayers()) {
    players[getAuth(player)] = player;
  }

  return players;
}

function checkAdmin(player) {
  if (isAdmin(player)) {
    room.setPlayerAdmin(player.id, true);
  }
}

function isAdmin(player) {
  const auth = typeof player === 'object' ? getAuth(player) : player;
  return ADMINS.has(auth);
}

/* AFK */

function isAFK(player) {
  return getPlayerId(player) in AFK_PLAYERS;
}

function setAFK(player, fromCommand = false) {
  AFK_PLAYERS[player.id] = fromCommand;
  setPlayerTeam(player, TEAM.SPECTATOR);
}

function resetAFK(player, updateMap = true, fromCommand = false) {
  AFK_TIME[player.id] = 0;

  if (isAFK(player) && (fromCommand || AFK_PLAYERS[player.id] === fromCommand)) {
    delete AFK_PLAYERS[player.id];

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
  const fromCommand = AFK_PLAYERS[player.id];
  const condition = fromCommand ? 'again' : 'or press space';
  info(`You're now inactive, use !afk ${condition} to join the game`, player, COLOR.DEFAULT);
}

function incrementAFK(player) {
  if (PLAYING && !GAME_OVER && player.team !== TEAM.SPECTATOR && (N_PLAYERS > 1 || EXTRA_HOURS)) {
    if (CURRENT_PLAYER && player.id === CURRENT_PLAYER.id) {
      const afkSeconds = ++AFK_TIME[player.id];
      if (afkSeconds === AFK_PLAYING_SECONDS - AFK_SECONDS_WARNING) {
        warn(`${player.name}, if you don't move in the next ${AFK_SECONDS_WARNING} seconds, you will be moved to spectators.`, player, NOTIFY);
      } else if (afkSeconds >= AFK_PLAYING_SECONDS) {
        setAFK(player);
        infoInactive(player);
      }
    }
  } else if (N_PLAYERS >= MAX_PLAYERS && Math.floor(++AFK_TIME[player.id] / 60) >= MAX_FULL_AFK_MINUTES && !isAdmin(player)) {
    kickPlayer(player, `AFK > ${MAX_FULL_AFK_MINUTES} min`);
  }
}

function incrementTurnTime() {
  if (PLAYING && !GAME_OVER && USING_RULES.ONE_SHOT_EACH_PLAYER && playersInGameLength() > 1) {
    if (CURRENT_PLAYER) {
      if (++TURN_TIME === TURN_MAX_SECONDS - TURN_SECONDS_WARNING) {
        warn(`${CURRENT_PLAYER.name}, if you don't shoot in the next ${TURN_SECONDS_WARNING} seconds, you will lose your turn.`, CURRENT_PLAYER, NOTIFY);
      } else if (TURN_TIME >= TURN_MAX_SECONDS) {
        TEAM_TIME_FOULS++;
        const teamPlayers = TEAMS[CURRENT_PLAYER.team].length;
        const changeTeam = teamPlayers <= 1 || TEAM_TIME_FOULS >= teamPlayers;
        foul(`⌛️ ${CURRENT_PLAYER.name} spent too much time to shoot`, { changeTeam, extraShots: changeTeam });
      }
    } else {
      updateCurrentPlayer({ changeTeam: false });
    }
  }
}

/* Room Handlers */

function onPlayerJoin(player) {
  LOG.info(`onPlayerJoin: ${player.name} (${player.auth})`);

  if (!setAuth(player)) {
    kickPlayer(player, "⛔️ Already playing!");
    return;
  }
  
  updatePlayersLength();

  warn(`The bot of this room is in ${VERSION} version, please be patient if something breaks or does not work as expected.`, player);

  const open = isOpen();
  
  if (open) {
    chatHost(`Welcome ${player.name} to the HaxBilliards Pub 🎱`);
  } else {
    pubIsClosed(player);
  }

  restoreDrink(player);
  
  enableAim(player);

  if (open && BOT_MAP && !chooseMap()) {
    setTeams(true);
  }

  resetAFK(player);

  if (open) {
    // Send rules after some seconds so the player notices the message
    setTimeout(() => {
      info("Send !help for commands or !rules to know how to play", player, COLOR.DEFAULT, 'italic');
    }, SEND_RULES_HINT_AFTER_SECONDS * 1000);
  }
}

function onPlayerLeave(player) {
  LOG.info(`onPlayerLeave: ${player.name}`);

  updatePlayersLength();
  
  removeMapVotes(player);
  removeRulesVotes(player);

  checkChangingTeamsCallback(player);

  if ((BOT_MAP || player.admin) && !chooseMap()) {
    updateOnTeamMove(player, false, true);
  }
  
  if (!PLAYING && N_PLAYERS > 0 && player.admin) {
    startGame();
  } else if (!playersInGameLength()) {
    stopGame();
  }

  clearAFK(player);

  enableAim(player, false);

  scheduleAuthRemoval(player);

  delete STRENGTH_MULTIPLIER[player.id];
}

function onPlayerActivity(player) {
  resetAFK(player);
}

function onPlayerTeamChange(player, byPlayer) {
  if (!BOT_MAP) {
    return;
  }

  LOG.debug('onPlayerTeamChange', player.name, player.team);

  updateTeams();

  if (byPlayer && player.id === byPlayer.id && player.team === TEAM.SPECTATOR && !isHostPlayer(byPlayer)) {
    setAFK(player);
    infoInactive(player);
  }

  updateRulesVotes();
  updateMapVotes();

  checkChangingTeamsCallback(player);

  if (isHostPlayer(player)) {
    moveHostPlayer(player);
  } else if (player.team === TEAM.SPECTATOR) {
    updateOnTeamMove(player, false);
  } else if (PLAYING) {
    resetAFK(player);
    updateOnTeamMove(player);
    resetPlayerStatistics(player);
  }
}

function updateOnTeamMove(player, ingame = true, left = false) {
  if (PLAYING) {
    setTeams();
    updateNextPlayers(player, ingame);

    LOG.debug('updateOnTeamMove', 'N_PLAYERS', N_PLAYERS, 'TEAM.SPECTATOR', TEAMS[TEAM.SPECTATOR].length);

    if (!ingame) {
      if (!left && isHostPlayer(player)) {
        room.reorderPlayers([player.id], true); // move host to top
      }

      if (!GAME_OVER) {
        updatePlayerTimePlayed(getAuth(player), true);
      }
    }

    // Do not restart the game if only one person is remaining playing when the moved player wasn't playing (if it was on spectators)
    const allowPractice = (!left && ingame) || (left && player.team === TEAM.SPECTATOR);

    if (!CURRENT_PLAYER || CURRENT_PLAYER.id === player.id) {
      CURRENT_PLAYER = null;
      updateCurrentPlayer({ changeTeam: false, allowPractice });
    } else if (checkPlayersRemaining(allowPractice)) {
      movePlayerToWaitingArea(player);
    }
  }
}

function checkChangingTeamsCallback(player) {
  if (CHANGING_TEAMS.size) {
    if (CHANGING_TEAMS.delete(player.id) && !CHANGING_TEAMS.size) {
      CHANGING_TEAMS_CALLBACK.consume();
    } else {
      // Fallback to force the game to start if it remains stopped
      setTimeout(() => {
        if (!PLAYING && CHANGING_TEAMS.size && CHANGING_TEAMS_CALLBACK.size()) {
          updateTeams();
          if (!playersInGameLength()) {
            CHANGING_TEAMS.clear();
            CHANGING_TEAMS_CALLBACK.consume();
          }
        }
      }, 2000);
    }
  }
}

function checkPlayersRemainingTeam(team, allowPractice = true) {
  if (!playersInGameLength() && activePlayers().filter(player => player.team === TEAM.SPECTATOR).length) {
    setTeams();
  }
  
  const teamPlayers = TEAMS[team];

  if (teamPlayers === undefined) {
    LOG.debug('teamPlayers', teamPlayers, TEAMS, team);
    return false;
  }

  const teamRemainingPlayers = teamPlayers.length;

  if (!teamRemainingPlayers) {
    const oppositeTeam = getOppositeTeam(team);

    if (team === CURRENT_TEAM) {
      CURRENT_TEAM = oppositeTeam;
    }

    const oppositeTeamRemainingPlayers = TEAMS[oppositeTeam].length;

    if (!oppositeTeamRemainingPlayers) {
      stopGame();
      return false;
    } else {
      const activePlayersRemaining = activePlayers().length;

      if ((NEXT_MAP && CURRENT_MAP !== NEXT_MAP) || activePlayersRemaining > 1 || (!allowPractice && activePlayersRemaining === 1)) {
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
  }
  return true;
}

function checkPlayersRemaining(allowPractice = true) {
  return checkPlayersRemainingTeam(CURRENT_TEAM, allowPractice) && checkPlayersRemainingTeam(getOppositeTeam(CURRENT_TEAM), allowPractice);
}

function onStadiumChange(map) {
  BOT_MAP = MAP_NAMES.includes(map);

  if (BOT_MAP) {
    loadMapProperties();
  } else {
    CURRENT_MAP = undefined;
    CURRENT_MAP_OBJECT = undefined;
    resetCurrentPlayer();
  }
  resetGameStatistics();
}
