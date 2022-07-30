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
    if (USING_RULES.ONE_SHOT_EACH_PLAYER && playerInPlayingArea(player)) {
      movePlayerToWaitingArea(player);
    }
    return;
  }

  if (!kickBall(player)) {
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
  
  const wereMoving = BALLS_MOVING;
  
  enableGoals();
  
  if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
    if (playersInGameLength() > 1) {
      movePlayerToWaitingArea(player);
    }
    if (player.id === CURRENT_PLAYER.id) {
      if (USING_RULES.FOUL_BALLS_MOVING && wereMoving) {
        foul(`${RULES.FOUL_BALLS_MOVING.icon} Balls were still moving`, { delay: true });
      } else {
        waitKickBallCallback(onPlayerBallKickCallback);
        TURN_TIME = 0;
      }
    } else {
      foul(`${RULES.ONE_SHOT_EACH_PLAYER.icon} Wrong player turn!`, { nextTurn: false, player });
    }
  } else if (USING_RULES.FOUL_IF_MISS) {
    waitKickBallCallback(checkMissOnBallsStatic);
  }

  checkKickOff();

  updateShotStatistics(player);
}

function onPlayerBallKickCallback() {
  checkMissOnBallsStatic();
  updateCurrentPlayer({ delayMove: true });
}

function checkKickOff() {
  if (KICKOFF) {
    kickOff(false);
  }
  if (FIRST_KICKOFF) {
    waitKickBallCallback(() => {
      onBallsStatic('firstKickOff', () => {
        FIRST_KICKOFF = isMiss();
        kickOff(FIRST_KICKOFF);
      });
    });
  }
}

function isFirstKickOff() {
  return SHOTS <= 1 || FIRST_KICKOFF;
}

function waitKickBallCallback(f, delayMillis=1000) {
  // wait to ensure ball is moving
  setTimeout(f, delayMillis);
}

function updateShotStatistics(player) {
  waitKickBallCallback(() => {
    onBallsStatic('updateStats:' + player.name, () => {
      if (trackGame()) {
        const stats = getGameStatistics(player);
        
        if (stats) {
          stats.shots++;
      
          if (isMiss()) {
            stats.misses++;
          }
        }
      }
    });
  });
}

function isMiss() {
  return FIRST_BALL_TOUCHED === null || (!!USING_RULES.FOUL_IF_MISS && !isFirstKickOff() && getBallTeam(FIRST_BALL_TOUCHED) !== CURRENT_TEAM);
}

function getPlayerStrength(player) {
  return STRENGTH_MULTIPLIER[player.id] || DEFAULT_STRENGTH;
}

function kickBall(player) {
  const playerPosition = player.position;
  const whiteBall = getWhiteBall();

  const euclidianDistance = distance(playerPosition, whiteBall);

  if (euclidianDistance > MAXIMUM_DISTANCE_TO_KICK) {
    return false; // avoid misskicks
  }
  
  const euclidianDistanceNormalized = KICK_DISTANCE_NORMALIZE(euclidianDistance);
  
  // LOG.debug('euclidianDistance', euclidianDistance, 'normalized', euclidianDistanceNormalized);
  
  const kickDirectionVector = diff(playerPosition, whiteBall);

  const { x: manhattanDistanceX, y: manhattanDistanceY } = kickDirectionVector;
  
  // LOG.debug('manhattanDistance', manhattan(playerPosition, whiteBall), 'X', manhattanDistanceX, 'Y', manhattanDistanceY);

  const playerStrength = getPlayerStrength(player);
  const kickStrength = KICK_STRENGTH[playerStrength];

  // LOG.debug('playerStrength', playerStrength, 'kickStrength', kickStrength);

  let speed = kickStrength / euclidianDistanceNormalized;

  // Limit speed if objects are very close (wall or other balls) so the ball do not trespass / overstep (not enough bias to block that much speed)
  if (speed > MAX_NEAR_SPEED) {
    // LOG.debug('playerStrength', playerStrength, 'speed (before limit)', speed, 'whiteBall', whiteBall.x, whiteBall.y);
    
    // Direction line centered at the whiteBall position (px, py) = (whiteBall.x, whiteBall.y) with the kick direction vector (mx, my) = (manhattanDistanceX, manhattanDistanceY)
    const directionLine = new Line(manhattanDistanceX, manhattanDistanceY, whiteBall);

    // mirrored coordinates on y axis (haxball -y is cartesian y)
    // LOG.debug('direction line:', directionLine.mirrorCoordinates(false, true).toString());

    const tableNearThreshold = 356; // ball distance to the table wall must be below this threshold

    // close to any wall ?
    const nearWall = TABLE_WALLS.find(tableWall => isTableWallCloseInRange(whiteBall, tableWall, tableNearThreshold, directionLine));

    if (nearWall) {
      speed = MAX_NEAR_SPEED;
      LOG.debug(`Limited speed (${speed}), close to table border`, nearWall.mirrorCoordinates(false, true).toString());
    } else {
      const nearThreshold = 2*AIM_DISC_RADIUS; // ball distance must be below this threshold // minimum distance between two balls is 2*BALL_RADIUS
      const borderThreshold = BALL_RADIUS; // if the ball is hit beyond this value it is considered a border collision 
      const directionMargin = 2*BALL_RADIUS; // width of the direction line (channel of two parallel lines of white ball movement after kick), 2*BALL_RADIUS on both sides of the line
      const targetBalls = [...REMAINING_RED_BALLS, ...REMAINING_BLUE_BALLS, BLACK_BALL];

      // close to any ball ?
      const nearBall = targetBalls.find(ballIndex => isBallCloseInRange(whiteBall, ballIndex, nearThreshold, borderThreshold, directionMargin, directionLine));

      if (nearBall !== undefined) {
        let limitReason;
        
        const distanceWhiteToTarget = distance(whiteBall, getBall(nearBall));

        speed = MAX_NEAR_SPEED;

        if (distanceWhiteToTarget <= nearThreshold) {
          limitReason = 'near';
        } else {
          limitReason = 'potential border collision';
        }

        LOG.debug(`Limited speed (${speed}),`, limitReason, getBallIcon(nearBall), `(${nearBall})`);
      }
    }
  }

  const kickDirectionUnitVector = normalizeVector(kickDirectionVector);

  const speedX = speed * kickDirectionUnitVector.x;
  const speedY = speed * kickDirectionUnitVector.y;

  // LOG.debug('speed', speed, 'speedX', speedX, 'speedY', speedY);

  room.setDiscProperties(WHITE_BALL, {
    xspeed: speedX,
    yspeed: speedY,
  });

  return true;
}

// Check if the table wall is close and in range to the white ball direction line
function isTableWallCloseInRange(whiteBall, tableWall, tableNearThreshold, directionLine) {
  // 1. Calculate the intersection point between the direction line and the table wall
  const intersection = tableWall.intersect(directionLine);

  if (!intersection) {
    return false; // no intersection
  }

  // 2. Check if the distance between the white ball and the intersection point is less than tableNearThreshold
  const distanceWhiteToIntersection = distance(whiteBall, intersection);

  // LOG.debug('wall intersection', intersection, 'distanceWhiteToIntersection', distanceWhiteToIntersection);

  if (distanceWhiteToIntersection <= tableNearThreshold) {
    // 3. Check if the white ball goes towards this wall
    
    // LOG.debug('player -> white ball', directionLine.mx, directionLine.my);

    // To be in range, the player must be pointing to this wall
    if (tableWall.isVertical()) {
      return Math.sign(tableWall.center.x) === Math.sign(directionLine.mx);
    } else if (tableWall.isHorizontal()) {
      return Math.sign(tableWall.center.y) === Math.sign(directionLine.my);
    } else {
      const { x, y } = diff(whiteBall, intersection);
      return Math.sign(x) === Math.sign(directionLine.mx) && Math.sign(y) === Math.sign(directionLine.my);
    }
  }

  return false; // wall is far away or not in the range of the kick direction
}

// Check if the target ball is close and in range to the white ball direction line
function isBallCloseInRange(whiteBall, targetBallIndex, nearThreshold, borderThreshold, directionMargin, directionLine) {
  const targetBall = getBall(targetBallIndex);

  // 1. Calculate the perpendicular line to the direction line that passes through the target ball
  // Perpendicular to the direction line, centered at the target ball position (px, py) = (targetBall.x, targetBall.y) with the direction vector (-my, mx)
  const perpendicular = directionLine.perpendicular(targetBall);

  // LOG.debug(getBallIcon(targetBallIndex), `(${targetBallIndex})`, targetBall.x, targetBall.y);
  // LOG.debug('perpendicular line:', perpendicular.mirrorCoordinates(false, true).toString());

  // 2. Calculate the intersection point between both lines
  const intersection = directionLine.intersect(perpendicular);

  if (!intersection) {
    return false; // no intersection
  }

  // 3. Check if the distance between the target ball and the intersection point is less than directionMargin (target ball is in the range of the direction line)
  const distanceTargetToIntersection = distance(targetBall, intersection);

  // LOG.debug('intersection', intersection, 'distanceTargetToIntersection', distanceTargetToIntersection);

  if (distanceTargetToIntersection <= directionMargin) {
    // 4. Check if the white ball is going to hit the target ball diagonally in the border (borderThreshold), only if is not a kickoff shot
    let distanceWhiteToIntersection;
    
    if (!KICKOFF && distanceTargetToIntersection > borderThreshold) {
      nearThreshold = null; // ignore near check
      // LOG.debug('potential border collision');
    } else {
      // 4.2. Otherwise, check if the distance between the white ball and the intersection point is less than nearThreshold (white ball is close to the target ball)
      distanceWhiteToIntersection = distance(whiteBall, intersection);
      // LOG.debug('distanceWhiteToIntersection', distanceWhiteToIntersection);
    }

    if (!nearThreshold || distanceWhiteToIntersection <= nearThreshold) {
      // 5. Check if the vector between the white ball and the intersection point have the same sense than the vector of the direction line (target ball is in front of the white ball)
      const { x, y } = diff(whiteBall, intersection);

      // LOG.debug('player -> white ball', directionLine.mx, directionLine.my);
      // LOG.debug('white ball -> target ball intersection', x, y);
  
      // To be in range, it must have the same sense than the direction vector, so [player -> white ball] must have the same sense than [white ball -> target ball intersection]
      return Math.sign(x) === Math.sign(directionLine.mx) && Math.sign(y) === Math.sign(directionLine.my);
    }
  }

  return false; // ball is far away or not in the range of the kick direction
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
    
    if (CHECK_GOALS && (tickGoals || FIRST_BALL_TOUCHED === null)) {
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
  checkWhiteBall();
  checkBlackBall();
}

function foul(message, { nextTurn = true, changeTeam = true, delay = false, override = false, extraShots = true, lose = false, player = null } = {}) {
  const multipleFoul = FOUL;

  if (!player) {
    player = CURRENT_PLAYER; // who committed this foul
  }

  if (!multipleFoul || override || lose) {
    FOUL = true;
    
    warn(`❌  FOUL ${message}`, null, lose ? NOTIFY : 1, lose ? 'bold' : 'normal', COLOR.WARNING, lose ? LOG.info : LOG.debug);

    if (!multipleFoul) {
      incrementStatistics(player, 'fouls');
    }

    if (lose) {
      gameOver(false);
    }
  }

  if (!multipleFoul && !lose) {
    if (!delay && USING_RULES.FOUL_BALLS_MOVING) {
      delay = true;
    }

    if (!GAME_OVER) {
      movePlayerToWaitingArea(player); 
      
      if (extraShots) {
        EXTRA_SHOTS = REMAINING_RED_BALLS.length && REMAINING_BLUE_BALLS.length ? 2 : 1;
      }
  
      if (nextTurn && USING_RULES.ONE_SHOT_EACH_PLAYER) {
        updateCurrentPlayer({ changeTeam, delayMove: delay, fromFoul: true });
      }
    }
  }
}

function gameOver(success) {
  if (!GAME_OVER) {
    GAME_OVER = true;
    
    WINNER_TEAM = success ? CURRENT_TEAM : getOppositeTeam(CURRENT_TEAM);
  
    gameScores();
  
    const delay = SHOTS > 0 && playersInGameLength() > 0;
  
    if (delay) {
      movePlayerToWaitingArea(CURRENT_PLAYER);

      const delaySeconds = Math.ceil(GAME_OVER_DELAY_SECONDS / 2);
      setTimeout(stopGame, delaySeconds * 1000);
    } else {
      stopGame();
    }
  }
}

function gameScores() {
  let winnerPlayers = TEAMS[WINNER_TEAM];

  if (winnerPlayers && winnerPlayers.length > 0) {
    winnerPlayers = winnerPlayers.map(player => player.name).join(', ');

    notify(`${getTeamIcon(WINNER_TEAM)} ${getTeamName(WINNER_TEAM)} wins: ${winnerPlayers}`, getTeamColor(WINNER_TEAM), 'bold');
  
    if (SHOTS > 0) {
      const blackScoredWinner = BLACK_SCORED_TEAM === WINNER_TEAM;
      const nRed = blackScoredWinner && WINNER_TEAM === TEAM.RED ? RED_BALLS.size + 1 : RED_BALLS.size;
      const nBlue = blackScoredWinner && WINNER_TEAM === TEAM.BLUE ? BLUE_BALLS.size + 1 : BLUE_BALLS.size;
      info(`${getTeamIcon(TEAM.RED)} ${nRed - REMAINING_RED_BALLS.length} - ${nBlue - REMAINING_BLUE_BALLS.length} ${getTeamIcon(TEAM.BLUE)}`, null,
        WINNER_TEAM ? getTeamColor(WINNER_TEAM) : COLOR.INFO, 'bold', LOG.info);
    }
    
    shotsInfo();

    updateGameOverPlayersStatistics();
  }
}

function shotsInfo() {
  if (SHOTS > 0) {
    info(`Total Shots: ${SHOTS}`, null, COLOR.INFO, 'normal', LOG.info);
  }
}

async function updateGameOverPlayersStatistics() {
  if (GAME_PLAYER_STATISTICS_UPDATED) {
    return;
  }
  GAME_PLAYER_STATISTICS_UPDATED = true; // avoid duplicated updates

  const game = room.getScores();

  Object.keys(GAME_PLAYER_STATISTICS).forEach((auth) => {
    // Stop counting time played
    const stats = updatePlayerTimePlayed(auth, true);

    // Substract paused time
    if (game && stats.timePlayed > game.time) {
      stats.timePlayed = Math.trunc(game.time);
    }
  });

  if ((!BLACK_SCORED_TEAM || !game || game.time >= 60) && USING_RULESET !== 'DISABLE') {
    // Delete players that have not been involved in this game (no fouls and < 1 minute or no shots)
    Object.entries(GAME_PLAYER_STATISTICS)
      .filter(([_, stats]) => {
        return !stats.fouls && (stats.timePlayed < 60 || !stats.shots);
      })
      .forEach(([auth, stats]) => {
        delete GAME_PLAYER_FIELDS[auth];
        delete GAME_PLAYER_STATISTICS[auth];
  
        LOG.debug("Low game activity", auth, getPlayerByAuth(auth), stats);
      });
  }

  const playersStats = Object.keys(GAME_PLAYER_STATISTICS);

  let uniquePlayersPlayed = playersStats.length;

  if (!PRODUCTION && playersInGameLength() > playersStats.length) {
    uniquePlayersPlayed = playersInGameLength(); // allow admin multi-accounts (testing)
  }

  if (trackGame(uniquePlayersPlayed)) {
    const gameFinished = !!BLACK_SCORED_TEAM;
    const gameFinishedBlackWinner = gameFinished && BLACK_SCORED_TEAM === WINNER_TEAM;

    // Add wins to all players of the winning team
    if (WINNER_TEAM) {
      TEAMS[WINNER_TEAM].forEach((winner) => {
        const winnerPlayerStats = getGameStatistics(winner);
  
        if (winnerPlayerStats) {
          winnerPlayerStats.wins++;
    
          if (gameFinished) {
            winnerPlayerStats.winsFinished++;
          }
        }
      });
    }

    // Add a black ball scored to the last player if it was successfully scored
    if (gameFinishedBlackWinner && LAST_PLAYER && WINNER_TEAM === LAST_PLAYER.team) {
      const winnerPlayerStats = getGameStatistics(LAST_PLAYER);

      if (winnerPlayerStats) {
        winnerPlayerStats.balls++;
        winnerPlayerStats.blackBalls++;
      }
    }

    const playing = playersInGame().map(getAuth);

    // Add a game played to all players that played in this game
    for (let auth of playersStats) {
      const stats = GAME_PLAYER_STATISTICS[auth];

      if (stats) {
        stats.games++;
  
        if (playing.includes(auth)) {
          if (gameFinished) {
            stats.gamesFinished++;
          }
        } else {
          stats.gamesAbandoned++;
        }

        // Calculate the score increment for this player
        stats.score = getScore(stats);

        // Calculate the derived statistics
        await setComputedStatistics(auth, stats);
      }
    }

    // Calculate the ELO increment for all players that played in this game
    incrementELO(playing);

    // Remove fields that we don't want in the DB
    Object.values(GAME_PLAYER_STATISTICS).forEach(stats => {
      delete stats.team;
    });

    // Update statistics for all players that played in this game
    postUpdatePlayerStatistics(notifyUpdateGameStatistics);
  } else if (USING_RULESET === 'DISABLE' && (SHOTS > 0 && CURRENT_MAP !== 'PRACTICE' && uniquePlayersPlayed > 1)) {
    postUpdatePlayerStatistics(); // update timePlayed
  }
}

function postUpdatePlayerStatistics(callback) {
  return POST(UPDATE_PLAYERS_STATISTICS_URL, {
    set: GAME_PLAYER_FIELDS,
    inc: GAME_PLAYER_STATISTICS,
  })
  .then(({ data }) => {
    Object.entries(data).forEach(([auth, { player }]) => {
      cachePlayerData(auth, player);
    });
    if (typeof callback === 'function') {
      callback(data);
    }
  })
  .catch((e) => {
    LOG.error('Cannot update players statistics', e);
  })
  .finally(invalidateTopPlayersCache);
}

function trackGame(players) {
  return BOT_MAP && SHOTS > 0 && CURRENT_MAP !== 'PRACTICE' && USING_RULESET !== 'DISABLE' && (players || playersInGameLength()) > 1;
}

function getGameStatistics(player) {
  return getGameStatisticsByAuth(getAuth(player));
}

function getGameStatisticsByAuth(auth) {
  return GAME_PLAYER_STATISTICS[auth];
}

function getScore(stats) {
  const {
    games,
    gamesAbandoned,
    gamesFinished,
    wins,
    winsFinished,
    blackBalls,
    balls,
    fouls,
  } = stats;
  return games*2 + gamesFinished*3 - gamesAbandoned*3 + wins*2 + winsFinished*3 + blackBalls*2 + balls - fouls;
}

function getComputedStatistics(stats) {
  return {
    losses: stats.games - stats.gamesAbandoned - stats.wins,
    precisionHit: 1 - (stats.misses / stats.shots),
    precisionScore: stats.balls / stats.shots,
    winRate: stats.wins / stats.games,
    winRateFinished: stats.winsFinished / stats.gamesFinished,
    abandonRate: stats.gamesAbandoned / stats.games,
    averageScore: stats.score / stats.games,
  };
}

async function setComputedStatistics(auth, gameStats) {
  const gamePlayerFields = GAME_PLAYER_FIELDS[auth];

  const { data } = await getPlayerStatsByAuth(auth);
  
  const isNewPlayer = !PLAYERS_DATA[auth];
  const afterStats = { ...data };
  
  if (!isNewPlayer) {
    for (let stat of Object.keys(gameStats)) {
      afterStats[stat] += gameStats[stat];
    }
  }

  const computedStats = getComputedStatistics(afterStats);

  for (let stat of Object.keys(computedStats)) {
    gamePlayerFields[stat] = computedStats[stat];
  }
}

// [Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
// [Fargo Ratings - a look under the hood](https://www.facebook.com/notes/349271919741780/)
// Initial ELO guess: BASE_ELO + (0.5*(BASE_ELO/10) * winsFinished) - (0.5*(BASE_ELO/10) * (gamesFinished - winsFinished))
// This ELO system is similar to chess FIDE, with same K coefficients, but with BASE_ELO of 500 instead of FIDE 400
function incrementELO(playing) {
  if (WINNER_TEAM) {
    // Sum ELO of all players for every team weighted by their played time, then
    // calculate ELO differences with the result of WINNER_TEAM
    let redELO = 0;
    let blueELO = 0;
    let redPlayers = 0;
    let bluePlayers = 0;
    let redTimePlayed = 0;
    let blueTimePlayed = 0;

    const playersStats = {}; // { elo, gamesFinished, ... }
    const playersGameStats = Object.keys(GAME_PLAYER_STATISTICS);

    for (let auth of playersGameStats) {
      const gameStats = GAME_PLAYER_STATISTICS[auth];
      playersStats[auth] = PLAYERS_DATA[auth] || {};

      const weightedELO = (playersStats[auth].elo || BASE_ELO) * gameStats.timePlayed;

      if (gameStats.team === TEAM.RED) {
        redELO += weightedELO;
        redTimePlayed += gameStats.timePlayed;
        redPlayers++;
      } else if (gameStats.team === TEAM.BLUE) {
        blueELO += weightedELO;
        blueTimePlayed += gameStats.timePlayed;
        bluePlayers++;
      }
    }

    // weighted sum
    redELO /= redTimePlayed || 1;
    blueELO /= blueTimePlayed || 1;

    // average ELO
    redELO /= redPlayers || 1;
    blueELO /= bluePlayers || 1;

    LOG.debug('ELO:', 'RED', redELO, 'BLUE', blueELO);

    for (let auth of playersGameStats) {
      const gameStats = GAME_PLAYER_STATISTICS[auth];
      const playerStats = playersStats[auth];

      let teamELO; // average player's team ELO
      let opponentELO; // average opponent's team ELO

      if (gameStats.team === TEAM.RED) {
        teamELO = redELO;
        opponentELO = blueELO;
      } else if (gameStats.team === TEAM.BLUE) {
        teamELO = blueELO;
        opponentELO = redELO;
      }

      let winnerStats, loserStats;

      if (playing.includes(auth)) {
        if (gameStats.team === WINNER_TEAM) {
          winnerStats = { elo: teamELO, gamesFinished: playerStats.gamesFinished };
          loserStats = { elo: opponentELO };
        } else {
          winnerStats = { elo: opponentELO };
          loserStats = { elo: teamELO, gamesFinished: playerStats.gamesFinished };
        }

        const [eloChangeWinner, eloChangeLoser] = eloRatingChange(winnerStats, loserStats);

        if (gameStats.team === WINNER_TEAM) {
          gameStats.elo = eloChangeWinner;
        } else {
          gameStats.elo = eloChangeLoser;
        }
      } else {
        // Abandoned games count as losses for ELO
        winnerStats = { elo: opponentELO };
        loserStats = playerStats;

        const [_, eloChangeLoser] = eloRatingChange(winnerStats, loserStats);

        gameStats.elo = eloChangeLoser;
      }
    }
  }
}

function eloRatio(elo, power = 10) {
  return power ** (elo / BASE_ELO);
}

// Probability of winning a match between two players
function eloExpectedWinRatio(eloA, eloB, power = 10) {
  const ratioA = eloRatio(eloA, power);
  const ratioB = eloRatio(eloB, power);
  const expectedA = ratioA / (ratioA + ratioB);
  const expectedB = ratioB / (ratioA + ratioB);
  return [expectedA, expectedB];
}

// Similar to FIDE K factor, but different BASE_ELO (500 vs FIDE 400)
function eloK(stats) {
  if ((stats.gamesFinished || 0) < 30) {
    return BASE_ELO / 10;
  }
  if ((stats.elo || BASE_ELO) < 6 * BASE_ELO) {
    return BASE_ELO / 20;
  }
  return BASE_ELO / 40;
}

/** A is winner (+), B is loser (-) */
function eloRatingChange(statsA, statsB, power = 10) {
  const eloA = statsA.elo || BASE_ELO;
  const eloB = statsB.elo || BASE_ELO;
  const kA = eloK(statsA);
  const kB = eloK(statsB);
  const [expectedA, expectedB] = eloExpectedWinRatio(eloA, eloB, power);
  const changeA = Math.round(kA * (1 - expectedA));
  const changeB = Math.round(-kB * expectedB);
  return [changeA, changeB];
}

function notifyUpdateGameStatistics(data) {
  const updated = Object.entries(data);

  const firstGamePlayers = updated.filter(([_, { inserted: firstGame }]) => firstGame);

  if (firstGamePlayers.length > 0) {
    const authPlayers = mapAuthToPlayers();

    firstGamePlayers
      .map(([auth, _]) => authPlayers[auth])
      .forEach((player) => {
        if (player) {
          // must be in the room, if player left then it's undefined
          info(`🎉 It's your first game, ${player.name}!`, null, COLOR.SUCCESS);
          info("See your statistics with !stats", player, COLOR.NOTIFY, "bold");
        }
      });
  }

  updated
    .map(([auth, { player }]) => [player, GAME_PLAYER_STATISTICS[auth]])
    .filter(([_player, gameStats]) => !!gameStats)
    .sort(([_p1, stats1], [_p2, stats2]) => -(stats1.score - stats2.score)) // descending
    .forEach(([player, gameStats]) => {
      info(`${player.name} ${plusStatString(STATS.score.icon, gameStats.score)} ${plusStatString(STATS.elo.icon, gameStats.elo)}`, null, getColor(gameStats.elo || gameStats.score));
    });
}

function plusStatString(icon, stat) {
  return `${stat >= 0 ? '+' : ''}${stat} ${icon}`;
}

function incrementStatistics(player, ...statistics) {
  if (player && trackGame()) {
    const stats = getGameStatistics(player);
    
    for (let statistic of statistics) {
      stats[statistic]++;
    }
  }
}

function incrementStatisticsPlayers(players, ...statistics) {
  if (players) {
    players.forEach((player) => incrementStatistics(player, ...statistics));
  }
}

function checkWhiteBall() {
  if (!GAME_OVER && !BALLS_SCORED_TURN.has(WHITE_BALL) && !ballInPlayingArea(WHITE_BALL) && (!WHITE_BALL_NO_AIM_SPAWN || !WHITE_BALL_NO_AIM_SPAWN.closeTo(getWhiteBall()))) {
    BALLS_SCORED_TURN.add(WHITE_BALL);

    if (USING_RULES.BLACK_WHITE_LOSE && playersInGameLength() > 1 && isBallMoving(BLACK_BALL)) {
      onBallsStatic('checkWhiteBall', () => {
        if (!GAME_OVER) {
          scoredWhite();
        }
      });
    } else {
      scoredWhite();
    }

    if (USING_RULES.WHITE_FOUL) {
      incrementStatistics(CURRENT_PLAYER, 'whiteBalls');
    }
  }
}

function scoredWhite() {
  const delay = playersInGameLength() > 1;

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
  if (!GAME_OVER && !BLACK_SCORED_TEAM && !BALLS_SCORED_TURN.has(BLACK_BALL) && !ballInPlayingArea(BLACK_BALL)) {
    BALLS_SCORED_TURN.add(BLACK_BALL);
    BLACK_SCORED_TEAM = CURRENT_TEAM;

    const practice = playersInGameLength() === 1;

    if (USING_RULES.BLACK_LAST && !practice) {
      const scoredPlayer = LAST_PLAYER;
      const currentTeam = CURRENT_TEAM;
      const teamBalls = getTeamBalls(currentTeam);
      const remainingBalls = getRemainingBalls(currentTeam).length;
      const firstKickOff = isFirstKickOff();
      
      if (!remainingBalls) {
        const scoredBlackBall = () => {
          if (USING_RULES.BLACK_WHITE_LOSE && BALLS_SCORED_TURN.has(WHITE_BALL)) {
            foul(`${RULES.BLACK_WHITE_LOSE.icon} Scored white along with black`, { lose: true });
          } else if (FOUL) {
            foul("❌🎱❗️ Scored black with a foul", { lose: true });
          } else if (firstKickOff) {
            // WEPF and WPA rules say that ball is repositioned, but well we leave this as an easter egg, you must be lucky enough, it's fair
            // Also is an official rule in UPA rules
            info("🎱 Scored black on the first shot! 🍀", null, COLOR.SUCCESS, 'bold');
            stackColorBall(currentTeam, BLACK_BALL);
            gameOver(true);
          } else if (USING_RULES.BLACK_COLOR_LOSE && Array.from(BALLS_SCORED_TURN).some(scoredBall => teamBalls.has(scoredBall))) {
            foul(`${getTeamIcon(currentTeam)}🎱❗️ Scored black along with the last ball`, { lose: true });
          } else {
            let scoredMessage = '🎱';
            if (TEAMS[BLACK_SCORED_TEAM].length > 2) {
              scoredMessage += ' ' + scoredPlayer.name;
            }
            scoredMessage += " Scored black successfully";
            info(scoredMessage, null, getTeamColor(currentTeam), 'bold');
            stackColorBall(currentTeam, BLACK_BALL);
            gameOver(true);
          }
        };
        if (USING_RULES.BLACK_WHITE_LOSE) {
          GAME_OVER = true; // avoid game mechanics during the waiting
          onBallsStatic('scoredBlackBall', () => {
            GAME_OVER = false; // re-enable so scoredBlackBall can set the game over
            scoredBlackBall();
          }, false, true);
        } else {
          scoredBlackBall();
        }
      } else {
        foul("🎱❓ Scored black before the remaining balls", { lose: true });
      }
    } else {
      const remainingBalls = getRemainingBalls(CURRENT_TEAM).length;

      let color;

      if (practice) {
        color = (CURRENT_MAP === 'PRACTICE' || !USING_RULES.BLACK_LAST || !remainingBalls) ? COLOR.SUCCESS : COLOR.WARNING;
      } else {
        color = getTeamColor(CURRENT_TEAM);
      }

      info("🎱  Scored black", null, color);

      if ((practice && CURRENT_MAP === 'PRACTICE') || (remainingBalls && playersInGameLength() === 1)) {
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

    const ownTeam = CURRENT_TEAM === team;

    if (ownTeam) {
      incrementStatistics(CURRENT_PLAYER, 'balls');
    }

    if (!FOUL) {
      if (USING_RULES.EXTRA_SHOT_IF_SCORED && EXTRA_SHOTS !== 1
        && (!USING_RULES.SCORE_PLAYER_COLOR || ownTeam)) {
        EXTRA_SHOTS = 1;
  
        if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
          onBallsStatic('scoredColorBall', scoredColorBall);
        } else {
          scoredColorBall();
        }
      }
    }

    stackColorBall(team, ballIndex);

    return true;
  }
  return false;
}

function scoredColorBall() {
  if (!FOUL && USING_RULES.EXTRA_SHOT_IF_SCORED && CURRENT_PLAYER) {
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

  if (FIRST_BALL_TOUCHED === null) {
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
    LOG.debug('First ball touched', getBallIcon(FIRST_BALL_TOUCHED), `(${FIRST_BALL_TOUCHED})`);

    if (USING_RULES.FOUL_WRONG_FIRST_BALL && !isFirstKickOff()) {
      if (getBallTeam(FIRST_BALL_TOUCHED) !== CURRENT_TEAM) {
        foul(`${getBallIcon(FIRST_BALL_TOUCHED)}❔ Wrong first touched ball`, { delay: true });
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
    if (USING_RULES.FOUL_IF_MISS && isMiss()) {
      foul(`${RULES.FOUL_IF_MISS.icon} Miss`);
    }
  });
}

function onBallsStatic(name, callback, multiple = false, priority = false) {
  if (BALLS_MOVING) {
    BALLS_STATIC_CALLBACK.add(name, callback, multiple, priority);
    return false;
  }
  LOG.debug(name);
  callback();
  return true;
}
