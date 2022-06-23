/* Game Handlers */

const CHECK_EVERY_TICKS = TICKS_PER_SECOND / 2; // check goals every ticks

const PROCESSING = new Set(); // game mechanics being processed

let SECOND_TICKS = 0; // ticks elapsed of the current second

function onGameTick() {
  if (++SECOND_TICKS === TICKS_PER_SECOND) {
    // Every second
    SECOND_TICKS = 0;

    TEAMS[TEAM.RED].forEach(incrementAFK);
    TEAMS[TEAM.BLUE].forEach(incrementAFK);
    TEAMS[TEAM.SPECTATOR].forEach(incrementAFK);

    incrementTurnTime();
  }
  if (SECOND_TICKS === CHECK_EVERY_TICKS) {
    checkGoals();
  }
};

function checkGoals() {
  if (!GAME_OVER) {
    checkWhiteBall();
    checkBlackBall();
    checkColorBalls();
  }
}

function foul(message, nextTurn = true) {
  warn(`❌  FOUL  |  ${message}`);

  if (RULES_ENABLED) {
    EXTRA_SHOTS = 2;

    if (nextTurn) {
      if (LAST_PLAYER.id === CURRENT_PLAYER.id) {
        updateCurrentPlayer({ delayMove: true, foul: true });
      } else {
        extraShotsInfo();
      }
    }
  }
}

function gameOver(success = false) {
  GAME_OVER = true;

  movePlayerToWaitingArea(CURRENT_PLAYER);

  WINNER_TEAM = success ? CURRENT_TEAM : getOppositeTeam(CURRENT_TEAM);
  
  notify(`${getTeamIcon(WINNER_TEAM)} ${getTeamName(WINNER_TEAM)} wins`, getTeamColor(WINNER_TEAM), 'bold');

  setTimeout(stopGame, GAME_OVER_DELAY_SECONDS * 1000);
}

function checkBall(ballIndex, callback) {
  if (!PROCESSING.has(ballIndex) && !ballInPlayingArea(ballIndex)) {
    PROCESSING.add(ballIndex);
    callback();
    PROCESSING.delete(ballIndex);
  }
}

function checkWhiteBall() {
  checkBall(WHITE_BALL, () => {
    foul("Scored white ⚪️");
    kickOff(true);
  });
}

function checkBlackBall() {
  checkBall(BLACK_BALL, () => {
    if (CURRENT_MAP !== 'PRACTICE') {
      if (getRemainingBalls(CURRENT_TEAM).size === 0) {
        info("Scored black 🎱", null, getTeamColor(CURRENT_TEAM));
        BLACK_SCORED = true;
        gameOver(true);
      } else {
        foul("Scored black 🎱 before the remaining balls", false);
        gameOver(false);
      }
    } else {
      info("Scored black 🎱", null, COLOR.SUCCESS);
      moveBall(BLACK_BALL, BLACK_BALL_SPAWN);
      kickOff(true);
    }
  });
}

function checkColorBalls() {
  REMAINING_RED_BALLS.forEach(ballIndex => checkColorBall(TEAM.RED, ballIndex));
  REMAINING_BLUE_BALLS.forEach(ballIndex => checkColorBall(TEAM.BLUE, ballIndex));
}

function checkColorBall(team, ballIndex) {
  checkBall(ballIndex, () => {
    info(`${getTeamIcon(team)} ${getTeamName(team)} scored`, null, getTeamColor(team));

    const remainingSet = team === TEAM.RED ? REMAINING_RED_BALLS : REMAINING_BLUE_BALLS;
    remainingSet.delete(ballIndex);
  });
}
