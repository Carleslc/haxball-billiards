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

  if (!GAME_OVER) {
    EXTRA_SHOTS = REMAINING_RED_BALLS.length && REMAINING_BLUE_BALLS.length ? 2 : 1;

    if (nextTurn && USING_RULES.ONE_SHOT_EACH_PLAYER) {
      if (LAST_PLAYER.id === CURRENT_PLAYER.id) {
        updateCurrentPlayer({ delayMove: delay, foul: true });
      }
    }
  }

  const clearFoul = () => {
    FOUL = false;
  };

  if (delay || playersInGameLength() > 1) {
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

    if (USING_RULES.BLACK_AFTER_WHITE_LOSE && isBallMoving(BLACK_BALL)) {
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
  const delay = playersInGameLength() > 1 && isBallMoving(BLACK_BALL);

  const msg = "Scored white  ⚪️";

  if (USING_RULES.WHITE_FOUL) {
    foul(msg, true, delay);
  } else {
    info(msg);
  }

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

    const practice = playersInGameLength() === 1;

    if (USING_RULES.BLACK_LAST && !practice) {
      if (getRemainingBalls(CURRENT_TEAM).length === 0) {
        if (USING_RULES.BLACK_AFTER_WHITE_LOSE && SCORED_BALLS_TURN.has(WHITE_BALL)) {
          foul(`Scored white along with black  ${RULES.BLACK_AFTER_WHITE_LOSE.icon}`, false);
          gameOver(false);
        } else {
          info("Scored black  🎱", null, getTeamColor(CURRENT_TEAM), 'bold');
          stackColorBall(CURRENT_TEAM, BLACK_BALL);
          gameOver(true);
        }
      } else {
        foul("Scored black 🎱 before the remaining balls", false);
        gameOver(false);
      }
    } else {
      let color;

      if (practice) {
        color = CURRENT_MAP === 'PRACTICE' || !USING_RULES.BLACK_LAST || getRemainingBalls(CURRENT_TEAM).length === 0 ? COLOR.SUCCESS : COLOR.YELLOW;
      } else {
        color = getTeamColor(CURRENT_TEAM);
      }

      info("Scored black  🎱", null, color);

      if (practice && activePlayers().length === 1) {
        kickOff();
      } else {
        stackColorBall(CURRENT_TEAM, BLACK_BALL);
        gameOver(true);
      }
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

  if (newRemainingBalls) {
    LOG.debug('newRemainingBalls', newRemainingBalls);
  }

  return newRemainingBalls ? newRemainingBalls : remainingBalls;
}

function checkColorBall(team, ballIndex) {
  if (!SCORED_BALLS_TURN.has(ballIndex) && !ballInPlayingArea(ballIndex)) {
    SCORED_BALLS_TURN.add(ballIndex);

    info(`${getTeamIcon(team)} ${getTeamName(team)} scored`, null, getTeamColor(team));

    if (!FOUL && USING_RULES.EXTRA_SHOT_IF_SCORED && EXTRA_SHOTS !== 1
      && (!USING_RULES.SCORE_PLAYER_COLOR || CURRENT_TEAM === team)) {
      EXTRA_SHOTS = 1;

      if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
        onBallsStatic('scoredColorBall', scoredColorBall);
      } else {
        scoredColorBall();
      }
    }

    stackColorBall(team, ballIndex);

    return true;
  }
  return false;
}

function scoredColorBall() {
  if (!FOUL && EXTRA_SHOTS === 1 && USING_RULES.EXTRA_SHOT_IF_SCORED && CURRENT_PLAYER) {
    info(`${getTeamIcon(CURRENT_TEAM)} ${CURRENT_PLAYER.name} has another shot  🏵`);
  }
  updateCurrentPlayer({ changeTeam: FOUL, foul: FOUL });
}

function stackColorBall(team, ballIndex) {
  const STACK_COLOR_SIDE = team === TEAM.RED ? STACK_COLOR_SIDE_RED : STACK_COLOR_SIDE_BLUE;

  // Move to the stack with some gravity
  room.setDiscProperties(ballIndex, {
    invMass: 0.01,
    ygravity: 0.05, // down
    xgravity: 0.01 * (STACK_COLOR_SIDE.x < 0 ? -1 : 1), // left or right (push to the balls boundary)
    bCoeff: 0, // sticky balls
    ...STACK_COLOR_SIDE
  });

  setTimeout(() => {
    if (!ballInPlayingArea(ballIndex)) { // avoid changing properties if next game was started
      // Fix the ball in the stack to avoid movement from other balls
      room.setDiscProperties(ballIndex, {
        invMass: 0.001,
        xspeed: 0,
        yspeed: 0,
        ygravity: 0
      });
    }
  }, 5 * 1000); // 5s
}

function checkBallsMoving(checkStatic = false, beforeStaticCallback = null) {
  const wereMoving = BALLS_MOVING;

  BALLS_MOVING = (USING_RULES.ONE_SHOT_EACH_PLAYER || USING_RULES.FOUL_BALLS_MOVING)
    && (isBallMoving(WHITE_BALL) || isBallMoving(BLACK_BALL) || REMAINING_RED_BALLS.some(isBallMoving) || REMAINING_BLUE_BALLS.some(isBallMoving));

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
