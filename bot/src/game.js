/* Game Handlers */

const CHECK_EVERY_TICKS = Math.floor(TICKS_PER_SECOND / 3); // check goals every ticks

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
  if (CHECK_GOALS && (SECOND_TICKS % CHECK_EVERY_TICKS) === 0) {
    checkBallsMoving(true, checkGoals);
  }
}

function enableGoals(enable = true) {
  CHECK_GOALS = enable;
}

function checkGoals() {
  checkColorBalls();
  checkBlackBall();
  checkWhiteBall();
}

function foul(message, nextTurn = true, delay = false) {
  FOUL = true;

  warn(`❌  FOUL  |  ${message}`);

  if (RULES_ENABLED && !GAME_OVER) {
    EXTRA_SHOTS = REMAINING_RED_BALLS.length && REMAINING_BLUE_BALLS.length ? 2 : 1;

    if (nextTurn) {
      if (LAST_PLAYER.id === CURRENT_PLAYER.id) {
        updateCurrentPlayer({ delayMove: delay, foul: true });
      } else {
        extraShotsInfo();
      }
    }
  }

  const clearFoul = () => {
    FOUL = false;
  };

  if (delay || !isPractice()) {
    onBallsStatic('clearFoul', clearFoul);
  } else {
    clearFoul();
  }
}

function gameOver(success) {
  GAME_OVER = true;
  
  WINNER_TEAM = success ? CURRENT_TEAM : getOppositeTeam(CURRENT_TEAM);

  gameScores();

  const delay = SHOTS > 0 && playersInGameLength();

  if (delay) {
    movePlayerToWaitingArea(CURRENT_PLAYER);
    setTimeout(stopGame, GAME_OVER_DELAY_SECONDS * 1000);
  } else {
    stopGame();
  }
}

function gameScores() {
  let winnerPlayers = TEAMS[WINNER_TEAM];

  if (winnerPlayers && winnerPlayers.length > 0) {
    winnerPlayers = winnerPlayers.map(player => player.name).join(', ');
  
    notify(`${getTeamIcon(WINNER_TEAM)} ${getTeamName(WINNER_TEAM)} wins: ${winnerPlayers}`, getTeamColor(WINNER_TEAM), 'bold');
  
    if (SHOTS > 0) {
      const blackScoredWinner = BLACK_SCORED_TEAM === WINNER_TEAM;
      const nRed = blackScoredWinner && WINNER_TEAM === TEAM.RED ? RED_BALLS.length + 1 : RED_BALLS.length;
      const nBlue = blackScoredWinner && WINNER_TEAM === TEAM.BLUE ? BLUE_BALLS.length + 1 : BLUE_BALLS.length;
      info(`${getTeamIcon(TEAM.RED)} ${nRed - REMAINING_RED_BALLS.length} - ${nBlue - REMAINING_BLUE_BALLS.length} ${getTeamIcon(TEAM.BLUE)}`, null,
        WINNER_TEAM ? getTeamColor(WINNER_TEAM) : COLOR.INFO, 'bold');
    }
  }
}

function checkWhiteBall() {
  if (!GAME_OVER && !SCORED_BALLS_TURN.has(WHITE_BALL) && !ballInPlayingArea(WHITE_BALL)) {
    SCORED_BALLS_TURN.add(WHITE_BALL);

    if (USE_EXTENDED_RULES && isBallMoving(BLACK_BALL)) {
      onBallsStatic('checkWhiteBall', () => {
        if (!GAME_OVER) {
          scoredWhite();
        }
      });
    } else {
      scoredWhite();
    }
  }
}

function scoredWhite() {
  const delay = isBallMoving(BLACK_BALL);

  foul("Scored white ⚪️", true, delay);

  if (delay) {
    onBallsStatic('scoredWhiteKickOff', kickOff);
  } else {
    kickOff();
  }
}

function checkBlackBall() {
  if (!GAME_OVER && !SCORED_BALLS_TURN.has(BLACK_BALL) && !ballInPlayingArea(BLACK_BALL)) {
    SCORED_BALLS_TURN.add(BLACK_BALL);
    BLACK_SCORED_TEAM = CURRENT_TEAM;

    if (!isPractice()) {
      if (getRemainingBalls(CURRENT_TEAM).length === 0) {
        if (USE_EXTENDED_RULES && SCORED_BALLS_TURN.has(WHITE_BALL)) { // TODO: refactor USE_EXTENDED_RULES to USE_RULES.FOUL_WHITE_BLACK
          foul("Scored white along with black ⚪️⚫️❗️", false);
          gameOver(false);
        } else {
          info("Scored black 🎱", null, getTeamColor(CURRENT_TEAM), 'bold');
          gameOver(true);
        }
      } else {
        foul("Scored black 🎱 before the remaining balls", false);
        gameOver(false);
      }
    } else {
      info("Scored black 🎱", null, COLOR.SUCCESS);
      kickOff();
    }
  }
}

function checkColorBalls() {
  if (!GAME_OVER) {
    REMAINING_RED_BALLS = checkColorBallsTeam(TEAM.RED, REMAINING_RED_BALLS);
    REMAINING_BLUE_BALLS = checkColorBallsTeam(TEAM.BLUE, REMAINING_BLUE_BALLS);
  }
}

function checkColorBallsTeam(team, remainingBalls) {
  let newRemainingBalls; // only defined if some ball is scored (better memory performance in comparison to filter as most of the time the array will not change)

  for (let i = 0; i < remainingBalls.length; i++) {
    const remainingBall = remainingBalls[i];

    if (checkColorBall(team, remainingBall)) {
      if (!newRemainingBalls) {
        newRemainingBalls = remainingBalls.slice(0, i);
      }
    } else if (newRemainingBalls) {
      newRemainingBalls.push(remainingBall);
    }
  }

  return newRemainingBalls ? newRemainingBalls : remainingBalls;
}

function checkColorBall(team, ballIndex) {
  if (!SCORED_BALLS_TURN.has(ballIndex) && !ballInPlayingArea(ballIndex)) {
    SCORED_BALLS_TURN.add(ballIndex);

    info(`${getTeamIcon(team)} ${getTeamName(team)} scored`, null, getTeamColor(team));

    if (CURRENT_TEAM === team && !FOUL && EXTRA_SHOTS !== 1) {
      EXTRA_SHOTS = 1;

      if (RULES_ENABLED) {
        onBallsStatic('scoredColorBall', scoredColorBall);
      } else {
        scoredColorBall();
      }
    }

    return true;
  }
  return false;
}

function scoredColorBall() {
  if (RULES_ENABLED && !FOUL) {
    info(`${getTeamIcon(CURRENT_TEAM)} ${CURRENT_PLAYER.name} have another shot 🏵`);
  }
  updateCurrentPlayer({ changeTeam: FOUL, foul: FOUL });
}

function checkBallsMoving(checkStatic = false, beforeStaticCallback = null) {
  const wereMoving = BALLS_MOVING;

  BALLS_MOVING = RULES_ENABLED && (isBallMoving(WHITE_BALL) || isBallMoving(BLACK_BALL) || REMAINING_RED_BALLS.some(isBallMoving) || REMAINING_BLUE_BALLS.some(isBallMoving));

  if (typeof beforeStaticCallback === 'function') {
    beforeStaticCallback();
  }

  if (checkStatic && wereMoving && !BALLS_MOVING) {
    BALLS_STATIC_CALLBACK.consume();
  }
}

function onBallsStatic(name, callback) {
  if (BALLS_MOVING) {
    BALLS_STATIC_CALLBACK.add(name, callback);
  } else {
    LOG.debug(name);
    callback();
  }
}
