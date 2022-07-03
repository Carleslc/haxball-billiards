/* Game Handlers */

const CHECK_GOALS_EVERY_TICKS = Math.floor(TICKS_PER_SECOND / 3); // check goals every ticks

function onPlayerBallKick(player) {
  if (!BOT_MAP) {
    return;
  }

  if (!CURRENT_PLAYER || !USING_RULES.ONE_SHOT_EACH_PLAYER) {
    CURRENT_PLAYER = player;
    CURRENT_TEAM = player.team;
  }

  if (player.id !== CURRENT_PLAYER.id || hasOutOfTurnCollisions(player)) {
    // FIXME increment tableWallPlayers margin
    return;
  }
  
  LOG.debug('onPlayerBallKick', player.name);
  
  SHOTS++;
  
  LAST_PLAYER = player;

  FOUL = false;
  FIRST_BALL_TOUCHED = null;
  BALLS_SCORED_TURN.clear();
  
  if (EXTRA_SHOTS) {
    EXTRA_SHOTS--;
  }
  
  kickBall(player);
  
  if (KICKOFF) {
    kickOff(false);
  }
  
  const wereMoving = BALLS_MOVING;
  
  enableGoals();
  
  if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
    if (player.id === CURRENT_PLAYER.id) {
      if (USING_RULES.FOUL_BALLS_MOVING && wereMoving) {
        foul(`${RULES.FOUL_BALLS_MOVING.icon} Balls were still moving`, { delay: true });
      } else {
        if (!EXTRA_SHOTS && playersInGameLength() > 1) {
          movePlayerToWaitingArea(CURRENT_PLAYER);
        }
        waitKickBallCallback(() => {
          checkMissOnBallsStatic();
          updateCurrentPlayer({ delayMove: true });
        });
        TURN_TIME = 0;
      }
    } else {
      foul(`${RULES.ONE_SHOT_EACH_PLAYER.icon} Wrong player turn!`, { nextTurn: false });
    }
  } else if (USING_RULES.FOUL_IF_MISS) {
    waitKickBallCallback(checkMissOnBallsStatic);
  }
}

function waitKickBallCallback(f, delayMillis=1000) {
  // wait to ensure ball is moving
  setTimeout(f, delayMillis);
}

function getPlayerStrength(player) {
  return STRENGTH_MULTIPLIER[player.id] || DEFAULT_STRENGTH;
}

function kickBall(player) {
  const playerPosition = player.position;
  const whiteBallPosition = getWhiteBall();

  const euclidianDistance = distance(playerPosition, whiteBallPosition);
  
  const euclidianDistanceNormalized = KICK_DISTANCE_NORMALIZE(euclidianDistance);
  
  // LOG.debug('euclidianDistance', euclidianDistance, 'normalized', euclidianDistanceNormalized);
  
  const manhattanDistanceX = whiteBallPosition.x - playerPosition.x;
  const manhattanDistanceY = whiteBallPosition.y - playerPosition.y;
  const maxDistanceCoords = Math.max(Math.abs(manhattanDistanceX), Math.abs(manhattanDistanceY));
  
  // LOG.debug('manhattanDistance', Math.abs(manhattanDistanceX) + Math.abs(manhattanDistanceY), 'X', manhattanDistanceX, 'Y', manhattanDistanceY);

  let strengthMultiplier = getPlayerStrength(player);
  
  if (strengthMultiplier > 8 && euclidianDistanceNormalized < 2 && closeToTableBorder(whiteBallPosition, 2*BALL_RADIUS)) {
    strengthMultiplier = 8; // avoid wall trespassing (excessive bias)
  }

  const kickStrength = BASE_KICK_STRENGTH * strengthMultiplier;

  const speed = (1 / euclidianDistanceNormalized) * kickStrength;
  const speedX = speed * (manhattanDistanceX / maxDistanceCoords);
  const speedY = speed * (manhattanDistanceY / maxDistanceCoords);

  // LOG.debug('speed', speed, 'X', speedX, 'Y', speedY);

  room.setDiscProperties(WHITE_BALL, {
    xspeed: speedX,
    yspeed: speedY,
  });
}

let SECOND_TICKS = 0; // ticks elapsed in the current second

function onGameTick() {
  if (++SECOND_TICKS === TICKS_PER_SECOND) {
    // Every second
    SECOND_TICKS = 0;

    TEAMS[TEAM.RED].forEach(incrementAFK);
    TEAMS[TEAM.BLUE].forEach(incrementAFK);
    TEAMS[TEAM.SPECTATOR].forEach(incrementAFK);

    if (BOT_MAP) {
      incrementTurnTime();
    }
  }

  if (BOT_MAP) {
    const tickGoals = (SECOND_TICKS % CHECK_GOALS_EVERY_TICKS) === 0;
    
    if (CHECK_GOALS && (tickGoals || ((USING_RULES.FOUL_IF_MISS || USING_RULES.FOUL_WRONG_FIRST_BALL) && FIRST_BALL_TOUCHED === null))) {
      checkBallsMoving(true, checkGoals);
    } else if (tickGoals) {
      checkWhiteBall(); // check for manually pushing (without kicking) the ball out of the playing area
    }
  }
}

function enableGoals(enable = true) {
  CHECK_GOALS = enable;
  LOG.debug('enableGoals', enable);
}

function checkGoals() {
  checkColorBalls();
  checkBlackBall();
  checkWhiteBall();
}

function foul(message, { nextTurn = true, delay = false, override = false } = {}) {
  const multipleFoul = FOUL;

  if (!multipleFoul || override) {
    FOUL = true;
    
    warn(`❌  FOUL ${message}`);
  }

  if (!multipleFoul) {
    if (!delay && USING_RULES.FOUL_BALLS_MOVING) {
      delay = true;
    }

    if (!GAME_OVER) {
      EXTRA_SHOTS = REMAINING_RED_BALLS.length && REMAINING_BLUE_BALLS.length ? 2 : 1;
  
      if (nextTurn && USING_RULES.ONE_SHOT_EACH_PLAYER && (!SHOTS || LAST_PLAYER.id === CURRENT_PLAYER.id || TURN_TIME >= TURN_MAX_SECONDS)) {
        updateCurrentPlayer({ delayMove: delay, fromFoul: true });
      }
    }
    
    if (delay || playersInGame > 1) {
      onBallsStatic('clearFoul', () => {
        FOUL = false;
      });
    }
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
  if (!GAME_OVER && !BALLS_SCORED_TURN.has(WHITE_BALL) && !ballInPlayingArea(WHITE_BALL) && (!WHITE_BALL_NO_AIM_SPAWN || !WHITE_BALL_NO_AIM_SPAWN.closeTo(getWhiteBall()))) {
    BALLS_SCORED_TURN.add(WHITE_BALL);

    if (USING_RULES.BLACK_AFTER_WHITE_LOSE && playersInGameLength() > 1 && isBallMoving(BLACK_BALL)) {
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

  const msg = "⚪️ Scored white";

  if (USING_RULES.WHITE_FOUL) {
    foul(msg, { delay, override: true });
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
  if (!GAME_OVER && !BALLS_SCORED_TURN.has(BLACK_BALL) && !ballInPlayingArea(BLACK_BALL)) {
    BALLS_SCORED_TURN.add(BLACK_BALL);
    BLACK_SCORED_TEAM = CURRENT_TEAM;

    const practice = playersInGameLength() === 1;

    if (USING_RULES.BLACK_LAST && !practice) {
      if (getRemainingBalls(CURRENT_TEAM).length === 0) {
        if (USING_RULES.BLACK_AFTER_WHITE_LOSE && BALLS_SCORED_TURN.has(WHITE_BALL)) {
          foul(`${RULES.BLACK_AFTER_WHITE_LOSE.icon} Scored white along with black`, { nextTurn: false, override: true });
          gameOver(false);
        } else {
          info("🎱  Scored black", null, getTeamColor(CURRENT_TEAM), 'bold');
          stackColorBall(CURRENT_TEAM, BLACK_BALL);
          gameOver(true);
        }
      } else if (SHOTS === 1) {
        info("🎱  Scored black on the first shot! 🍀", null, COLOR.SUCCESS, 'bold');
        stackColorBall(CURRENT_TEAM, BLACK_BALL);
        gameOver(true);
      } else {
        foul("🎱❓  Scored black before the remaining balls", { nextTurn: false, override: true });
        gameOver(false);
      }
    } else {
      let color;

      if (practice) {
        color = CURRENT_MAP === 'PRACTICE' || !USING_RULES.BLACK_LAST || getRemainingBalls(CURRENT_TEAM).length === 0 ? COLOR.SUCCESS : COLOR.YELLOW;
      } else {
        color = getTeamColor(CURRENT_TEAM);
      }

      info("🎱  Scored black", null, color);

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
  if (!BALLS_SCORED_TURN.has(ballIndex) && !ballInPlayingArea(ballIndex)) {
    BALLS_SCORED_TURN.add(ballIndex);

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
  updateCurrentPlayer({ changeTeam: FOUL });
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

  if (((USING_RULES.FOUL_IF_MISS || USING_RULES.FOUL_WRONG_FIRST_BALL) && FIRST_BALL_TOUCHED === null)) {
    checkFirstBallTouched();

    BALLS_MOVING = FIRST_BALL_TOUCHED !== null || isBallMoving(WHITE_BALL);
  } else {
    BALLS_MOVING = ballsMoving();
  }

  if (typeof beforeStaticCallback === 'function') {
    beforeStaticCallback();
  }

  if (!BALLS_MOVING && checkStatic && wereMoving) {
    BALLS_STATIC_CALLBACK.consume();

    enableGoals(false); // wait for next turn
  }
}

function ballsMoving(threshold = MIN_SPEED_THRESHOLD) {
  return isBallMoving(WHITE_BALL, threshold) || isBallMoving(BLACK_BALL, threshold) || someBallMoving(REMAINING_RED_BALLS, threshold) || someBallMoving(REMAINING_BLUE_BALLS, threshold);
}

function checkFirstBallTouched() {
  let teamBallMoving = someBallMoving(getRemainingBalls(CURRENT_TEAM)); // check current team balls first to set as valid if different team balls are touched at the same time

  if (teamBallMoving === false) { // could be index 0, so avoid using !teamBallMoving
    teamBallMoving = (isBallMoving(BLACK_BALL) && BLACK_BALL) || someBallMoving(getRemainingBalls(getOppositeTeam(CURRENT_TEAM)));
  }

  // Not moving if false. Moving if index is set. Could be index 0 (falsy), so avoid checking for truthy value.
  FIRST_BALL_TOUCHED = typeof teamBallMoving === 'number' ? teamBallMoving : null;

  if (FIRST_BALL_TOUCHED !== null) {
    LOG.debug('First ball touched', FIRST_BALL_TOUCHED);

    if (USING_RULES.FOUL_WRONG_FIRST_BALL) {
      const firstBallTouchedTeam = getBallTeam(FIRST_BALL_TOUCHED);

      if (firstBallTouchedTeam !== CURRENT_TEAM) {
        movePlayerToWaitingArea(CURRENT_PLAYER);
        
        foul(`${(FIRST_BALL_TOUCHED === BLACK_BALL ? '⚫️' : getTeamIcon(firstBallTouchedTeam)) + '❔'} Wrong first touched ball`, { delay: true });
      }
    }
  }
}

function someBallMoving(balls, threshold) {
  for (let ballIndex of balls) {
    if (isBallMoving(ballIndex, threshold)) {
      return ballIndex;
    }
  }
  return false;
}

function checkMissOnBallsStatic() {
  onBallsStatic('checkMiss', () => {
    if (USING_RULES.FOUL_IF_MISS && FIRST_BALL_TOUCHED === null) {
      foul(`${RULES.FOUL_IF_MISS.icon} Miss`);
    }
  });
}

function onBallsStatic(name, callback, override = false) {
  if (BALLS_MOVING) {
    BALLS_STATIC_CALLBACK.add(name, callback, override);
    return false;
  }
  LOG.debug(name);
  callback();
  return true;
}
