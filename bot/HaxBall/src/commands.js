/* Command Helpers */

let HELP = [];
let ADMIN_HELP = [];

function joinArgs(args) {
  return args.join(' ').trim();
}

function isForce(args, argIndex = 1) {
  return args.length > argIndex ? ['f', 'force'].includes(args[argIndex].toLowerCase()) : false;
}

function adminOnly(callback) {
  return (player, args) => adminOnlyCallback(player, args, callback);
}

function adminOnlyCallback(player, args, callback) {
  if (player.admin) {
    callback(player, args);
  } else {
    warn("š« Sorry, you do not have permissions to execute this command.", player);
  }
}

/* Chat Commands */

/* rules */

HELP.push(...[
  "š !rules ā¶ļø show the billiards rules of this room",
  "š !rules extended ā¶ļø show the extended billiards rules"
]);

function rulesHelp(ruleset, title = true) {
  let help = '';

  if (title) {
    const rulesetTitle = ruleset === DEFAULT_RULESET ? '' : ruleset + ' ';
    help = `š ${rulesetTitle}RULES š\n\n`;
  }

  help += RULESETS[ruleset].map(rule => rule.toString()).join('\n');

  return help;
}

const RULES_HELP = {};

Object.keys(RULESETS).forEach(ruleset => {
  RULES_HELP[ruleset] = rulesHelp(ruleset);
});

const NOT_IMPLEMENTED_RULES = {};

Object.keys(RULESETS).forEach(ruleset => {
  NOT_IMPLEMENTED_RULES[ruleset] = notImplementedRules(ruleset).join('\n');
});

function rules(player, args) {
  const argRuleset = getRuleset(args.length > 0 && args[0]);

  if (!args.length || argRuleset) {
    const ruleset = argRuleset || USING_RULESET;
  
    let helpRules = RULES_HELP[ruleset];
  
    if (ruleset !== 'DISABLE') {
      helpRules += "\n\nāš°2ļøā£ Fouls are 2 turns for the opponent's team";
      helpRules += "\nāš°1ļøā£ā Fouls are only 1 turn if at least one team has only the black ball remaining";
      helpRules += "\nāš±āļø You lose scoring the black ball and committing a foul in the same shot";
    } else {
      helpRules += "ā­ļø  Rules and automatic turns are disabled.\nš  Blocking your opponent is illegal.\nš±  Game will end when the black ball is scored.";
    }

    if (!args.length && ruleset === 'NORMAL') {
      helpRules += '\n\nš° If you want to know the optional extended rules, use !rules extended';
    }

    if (USING_RULESET !== ruleset) {
      helpRules += `\n\nCurrently playing with !rules ${USING_RULESET.toLowerCase()}`;
    }

    const notImplementedRules = NOT_IMPLEMENTED_RULES[ruleset];

    if (notImplementedRules) {
      helpRules += '\n';
    }
    
    info(helpRules, player, COLOR.YELLOW);
  
    if (notImplementedRules) {
      let notImplementedHelp = `\nAutomatic turns are disabled with this ruleset because some rules are not yet enforced by the bot:\n`;
      notImplementedHelp += NOT_IMPLEMENTED_RULES[ruleset];
      notImplementedHelp += `\n\nMake sure you follow these rules during the game.`;

      info(notImplementedHelp, player, COLOR.YELLOW);
    }
  } else {
    warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`, player);
  }
}

/* drinks */

HELP.push(`š¤µš½āāļø ${DRINK_MENU} ā¶ļø order a drink`);

const DRINKING = {}; // Players who have ordered a drink recently: auth to { icon, endTime }

function isDrinking(player) {
  return getAuth(player) in DRINKING;
}

function getDrink(player) {
  return DRINKING[getAuth(player)];
}

function clearDrinking(player) {
  delete DRINKING[getAuth(player)];
  room.setPlayerAvatar(player.id, null);
}

function restoreDrink(player) {
  if (isDrinking(player)) {
    const drink = getDrink(player);

    room.setPlayerAvatar(player.id, drink.icon);

    setTimeout(() => clearDrinking(player), drink.endTime - Date.now());
  }
}

function drinkIcon(drink, drinkMessage = null, def = 'š«') {
  if (drink in DRINKS) {
    let message = drinkMessage;

    if (!message) {
      let currentDrink = DRINKS[drink];

      if (currentDrink.length > 0) {
        message = currentDrink[0];
      }
    }

    if (message) {
      return message.substring(0, 2); // emoji is 2 chars
    }
  }
  return def;
}

function orderDrink(player, drink) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  if (isDrinking(player)) {
    chatHost("Ey! Don't drink too much too fast!", player);
    warn(`Please, wait at least ${WAIT_DRINK_MINUTES} minutes to order another drink.`, player);
  } else {
    // Get a random drink message
    let drinkMessage = choice(DRINKS[drink]);
    let icon = drinkIcon(drink, drinkMessage);
    
    // Set as drinking
    const drinkingMillis = WAIT_DRINK_MINUTES * 60 * 1000;

    DRINKING[getAuth(player)] = {
      icon,
      endTime: Date.now() + drinkingMillis,
    };

    // Drink preparation
    chatHost("Alright! Just a moment...", player);

    const host = getHostPlayer();
    setHostAvatar(host, icon, DRINK_PREPARATION_SECONDS);

    // Move host to the table
    if (host.team === TEAM.SPECTATOR) {
      setTimeout(() => {
        setPlayerTeam(host, player.team);
      }, Math.floor(DRINK_PREPARATION_SECONDS / 2) * 1000);
    } else {
      moveHostPlayer(host);
    }

    // Set drink avatar
    setTimeout(() => {
      chatHost(`!${drink} ā ${player.name} ${drinkMessage}`);
      room.setPlayerAvatar(player.id, icon);
    }, DRINK_PREPARATION_SECONDS * 1000);

    // Move host to spectator after some time
    setTimeout(() => {
      if (host.team !== TEAM.SPECTATOR) {
        setPlayerTeam(host, TEAM.SPECTATOR);
      }
    }, 2 * DRINK_PREPARATION_SECONDS * 1000);

    // Clear drinking status after some time
    setTimeout(() => clearDrinking(player), drinkingMillis);
  }
}

function menu(player) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  info(DRINK_MENU, player);
}

/* strength control */

HELP.push(`ā“ļø !1 .. !${MAX_PLAYER_STRENGTH} ā¶ļø select your kick strength level, default is !${DEFAULT_STRENGTH}. Check your current strength level with !!`);

function selectStrength(player, _, multiplier) {
  STRENGTH_MULTIPLIER[player.id] = parseInt(multiplier);

  info(`ā“ļø ${multiplier}`, player, COLOR.YELLOW);
}

function checkStrength(player) {
  info(`ā“ļø ${getPlayerStrength(player)}`, player, COLOR.YELLOW);
}

/* vote */

const AVAILABLE_MAPS = Object.keys(MAPS).map(m => m.toLowerCase()).join(', ');

HELP.push(`š !vote [${AVAILABLE_MAPS}] ā¶ļø change the current map`);

function vote(player, args) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  if (args.length > 0) {
    voteMap(player, args[0]);
  } else {
    info(`!vote [${AVAILABLE_MAPS}]`, player, COLOR.DEFAULT);
    info(`Currently playing in map ${CURRENT_MAP.toLowerCase()}`, player, COLOR.INFO, 'italic');
  }
}

function voteMap(player, map) {
  map = map.toUpperCase();

  if (map === 'BILLIARDS') {
    map = 'DEFAULT';
  }

  const mapVotes = MAP_VOTES[map];

  const currentActivePlayers = activePlayers();

  if (mapVotes) {
    if (CURRENT_MAP === map) {
      info(`Already playing in map ${map.toLowerCase()}.`, player);
    } else if (!mapVotes.has(player.id) || (currentActivePlayers.length === 1 && player.team != TEAM.SPECTATOR)) {
      Object.values(MAP_VOTES).forEach(votes => votes.delete(player.id));

      mapVotes.add(player.id);

      const activeVotes = filter(mapVotes, playerId => !isAFK(playerId)).length;
      
      info(`${player.name} has voted for ${map.toLowerCase()} map (${activeVotes} ${activeVotes !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);

      if (isMajorityVoting(activeVotes, currentActivePlayers.length)) {
        selectNextMap(map, 'majority vote');
      } else {
        info(`!vote [${AVAILABLE_MAPS}]`);
      }
    } else {
      warn(`You've already voted for the map ${map.toLowerCase()}.`, player);
    }
  } else {
    warn(`Invalid map. Available maps: ${AVAILABLE_MAPS}`, player);
  }
}

function isMajorityVoting(votes, players) {
  return votes > Math.floor(players / 2);
}

function updateMapVotes() {
  let totalVotes = 0;
  let newMajorityMap;

  const players = playingOrActivePlayers().length;

  Object.keys(MAPS).forEach(map => {
    const mapVotes = MAP_VOTES[map];

    const activeVotes = filter(mapVotes, playerId => !isAFK(playerId) && (!ADMIN_MAP_CHANGE || playerId !== ADMIN_MAP_CHANGE)).length;

    totalVotes += activeVotes;

    if (!newMajorityMap && isMajorityVoting(activeVotes, players)) {
      newMajorityMap = map;
    }
  });

  if (newMajorityMap) {
    selectNextMap(newMajorityMap, 'majority vote', false);
  } else if (!ADMIN_MAP_CHANGE && totalVotes === 0) {
    resetNextMap();
  }
}

function removeMapVotes(player) {
  Object.keys(MAPS).forEach(map => {
    MAP_VOTES[map].delete(player.id);
  });
  updateMapVotes();
}

function resetMapVoting() {
  Object.keys(MAPS).forEach(map => {
    if (map in MAP_VOTES) {
      MAP_VOTES[map].clear();
    } else {
      MAP_VOTES[map] = new Set();
    }
  });
  resetNextMap();
}

/* map */

ADMIN_HELP.push(`āļø !map [${AVAILABLE_MAPS}] [f, force]? ā¶ļø change the current map`);

function map(player, args) {
  if (!player.admin) {
    vote(player, args);
  } else if (args.length > 0) {
    const mapName = args[0].toUpperCase();
    const players = playersInGameLength();

    if (CURRENT_MAP === mapName) {
      info(`Already playing in map ${mapName.toLowerCase()}.`, player);
    } else if (!PLAYING || !players || isForce(args) || (players === 1 && player.team !== TEAM.SPECTATOR)) {
      if (mapName in MAPS) {
        ADMIN_MAP_CHANGE = player.id;
        selectNextMap(mapName, player.name);
      } else {
        warn(`Invalid map. Available maps: ${AVAILABLE_MAPS}`, player);
      }
    } else {
      warn("There is currently a game being played, please stop it first or run this command again with force.", player);
    }
  } else {
    info(`!map [${AVAILABLE_MAPS}] [f, force]?`, player, COLOR.DEFAULT);
    info(`Currently playing in map ${CURRENT_MAP.toLowerCase()}`, player, COLOR.INFO, 'italic');
  }
}

/* setrules */

HELP.push(`š¤ !setrules [${AVAILABLE_RULESETS}] ā¶ļø vote the rules to apply`);
ADMIN_HELP.push(`š¤ !setrules [${AVAILABLE_RULESETS}] [f, force]? ā¶ļø vote or set the rules to apply`);

function setVoteRules(player, args) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  if (args.length > 0) {
    const ruleset = args[0];

    if (player.admin && isForce(args)) {
      const set = setRuleset(ruleset, player.name);

      if (!set) {
        warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`, player);
      }
    } else {
      voteRules(player, ruleset);
    }
  } else {
    const help = `!setrules [${AVAILABLE_RULESETS}]` + (player.admin ? ' [f, force]?' : '');
    info(help, player, COLOR.DEFAULT);
    info(`Currently playing with !rules ${USING_RULESET.toLowerCase()}`, player, COLOR.INFO, 'italic');
  }
}

function voteRules(player, ruleset) {
  ruleset = getRuleset(ruleset);

  if (ruleset) {
    const rulesVotes = RULESET_VOTES[ruleset];

    const currentActivePlayers = playingOrActivePlayers();

    if (USING_RULESET === ruleset) {
      info(`Already playing with ${ruleset.toLowerCase()} rules.`, player);
    } else if (!rulesVotes.has(player.id) || (currentActivePlayers.length === 1 && player.team != TEAM.SPECTATOR)) {
      Object.values(RULESET_VOTES).forEach(votes => votes.delete(player.id));

      rulesVotes.add(player.id);

      const activeVotes = filter(rulesVotes, playerId => !isAFK(playerId)).length;

      info(`${player.name} has voted to use ${ruleset.toLowerCase()} rules (${activeVotes} ${activeVotes !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);

      if (isMajorityVoting(activeVotes, currentActivePlayers.length)) {
        setRuleset(ruleset, 'majority vote');
      } else {
        info(`!setrules [${AVAILABLE_RULESETS}]`);
      }
    } else {
      warn(`You've already voted to use ${ruleset.toLowerCase()} rules.`, player);
    }
  } else {
    warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`, player);
  }
}

function setRuleset(ruleset, by) {
  ruleset = getRuleset(ruleset);

  if (ruleset) {
    if (USING_RULESET !== ruleset) {
      LOG.info('setRules', ruleset, by);

      const lastRulesetUsingTurns = USING_RULES && USING_RULES.ONE_SHOT_EACH_PLAYER;

      USING_RULESET = ruleset;
      USING_RULES = rulesMapping(RULESETS[USING_RULESET]);

      if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
        if (!CURRENT_PLAYER || !lastRulesetUsingTurns) {
          updateCurrentPlayer();

          if (!SHOTS) {
            FIRST_KICKOFF = true;
            kickOff(FIRST_KICKOFF);
          }
        } else {
          movePlayersOutOfTurn();
          setWhiteBall(CURRENT_PLAYER);
          moveCurrentPlayer(false);
        }
      } else {
        resetCollisions();
        kickOff(false);
        FIRST_KICKOFF = false;
      }
      
      const missingRules = notImplementedRules(ruleset);
      
      if (missingRules.length > 0) {
        // Cannot determine if some rules are satisfied
        delete USING_RULES.ONE_SHOT_EACH_PLAYER; // may not give the 2 turns of a foul
        delete USING_RULES.EXTRA_SHOT_IF_SCORED; // may keep turn when is a foul
      }
      
      if (N_PLAYERS) {
        const msg = `Now using !rules ${ruleset.toLowerCase()}`;
        info(by ? `${msg}, set by ${by}.` : msg, null, COLOR.NOTIFY, 'bold');
      }
    }
    return true;
  }
  return false;
}

function updateRulesVotes() {
  let totalVotes = 0;
  let newMajorityRules;

  const players = playingOrActivePlayers().length;

  Object.entries(RULESET_VOTES).forEach(([ruleset, votes]) => {
    const activeVotes = filter(votes, player => !isAFK(player)).length;

    totalVotes += activeVotes;

    if (!newMajorityRules && isMajorityVoting(activeVotes, players)) {
      newMajorityRules = ruleset;
    }
  });

  if (newMajorityRules) {
    setRuleset(newMajorityRules, 'majority vote');
  } else if (totalVotes === 0) {
    resetRules();
  }
}

function removeRulesVotes(player) {
  Object.values(RULESET_VOTES).forEach((votes) => {
    votes.delete(player.id);
  });
  updateRulesVotes();
}

function resetRulesVoting() {
  Object.values(RULESET_VOTES).forEach(rules => {
    rules.clear();
  });
  resetRules();
}

function resetRules() {
  setRuleset(DEFAULT_RULESET, '');
}

/* aim */

HELP.push("š§­ !aim ā¶ļø toggle the aiming disc");

function aim(player) {
  const aimEnabled = toggleAim(player);

  const setNow = (CURRENT_PLAYER && player.id === CURRENT_PLAYER.id) || !USING_RULES.ONE_SHOT_EACH_PLAYER;

  if (setNow) {
    setWhiteBall(CURRENT_PLAYER);
  }

  const justYou = setNow ? '' : ' (just for you)';
  const target = USING_RULES.ONE_SHOT_EACH_PLAYER ? player : null;

  if (aimEnabled) {
    if (WHITE_BALL_AIM === WHITE_BALL_NO_AIM && !AIM_OPTION) {
      warn("š§­āāļø You can not enable aiming in this map.", player);
    } else {
      info(`š§­ā Aiming is now enabled${justYou}.`, target, COLOR.SUCCESS);
    }
  } else {
    if (WHITE_BALL_AIM === WHITE_BALL_NO_AIM && AIM_OPTION) {
      warn("š§­āāļø You can not disable aiming in this map.", player);
    } else {
      info(`š§­ā Aiming is now disabled${justYou}.`, target);
    }
  }
}

function toggleAim(player) {
  return player ? enableAim(player, !isAim(player)) : null;
}

function enableAim(player, enable = true) {
  if (player) {
    if (enable) {
      AIM_PLAYERS.add(player.id);
    } else {
      AIM_PLAYERS.delete(player.id);
    }
  }
  return enable;
}

function isAim(player) {
  return !player || AIM_PLAYERS.has(player.id);
}

/* afk */

HELP.push("š“ !afk ā¶ļø switch between afk / online");

function afk(player) {
  if (isAFK(player)) {
    resetAFK(player, isOpen(), true);
  } else {
    info(`š“ ${player.name} is AFK`, null, COLOR.INFO, 'bold');
    setAFK(player, true);
    infoInactive(player);
  }
}

/* stats */

HELP.push("š !stats {PLAYER}? ā¶ļø see your statistics or the statistics of other player in the pub");

async function stats(player, args) {
  const { target, targetPlayer } = getTarget(player, args);

  if (targetPlayer) {
    try {
      const { data } = await getPlayerStats(targetPlayer);
      showStatistics(player, targetPlayer, data, PLAYERS_DATA[getAuth(targetPlayer)] === null);
    } catch (e) {
      if (e.status) {
        displayHttpError(`Cannot get ${targetPlayer.name} statistics`, e.status, e.error, player);
      } else {
        displayError(`Cannot show ${targetPlayer.name} statistics`, e, player);
      }
    }
  } else {
    warn(`Player ${target} not found in the room.`, player);
  }
}

function me(player, args) {
  if (!args.length || args[0] === player.name) {
    stats(player, args);
  } else {
    warn("Use !me without player name to know your statistics or use !stats {PLAYER} to see statistics of others", player);
  }
}

function cachePlayerData(auth, data) {
  PLAYERS_DATA[auth] = data || null;
}

async function getPlayerStats(player) {
  const auth = getAuth(player);
  const playerCache = PLAYERS_DATA[auth];

  if (playerCache) {
    return { data: playerCache };
  }
  if (playerCache === null) { // cached 404
    return { data: getGameStatistics(player) };
  }
  
  try {
    const { data } = await GET(GET_PLAYER_URL + auth);
    if (!playerCache) {
      cachePlayerData(auth, data);
    }
    return { data };
  } catch ({ status, error }) {
    if (status === 404) {
      cachePlayerData(auth, null);
      LOG.debug(player.name, 'is a new player (404)');
      return { data: getGameStatistics(player) };
    }
    throw { status, error };
  }
}

HELP.push("š !game {PLAYER}? ā¶ļø see statistics for the current game only");

function gameStats(player, args) {
  const { target, targetPlayer } = getTarget(player, args);

  if (targetPlayer) {
    showStatistics(player, targetPlayer, getGameStatistics(targetPlayer), true, false);
  } else {
    warn(`Player ${target} not found in the room.`, player);
  }
}

function getTarget(player, args) {
  let target;
  let targetPlayer;

  if (args.length > 0) {
    args = joinArgs(args);
    const mention = isMention(args);
    target = mention ? args.substring(1) : args;
    target = target.toLowerCase();
    targetPlayer = getPlayers().find(p => getTargetName(p, mention).toLowerCase().includes(target));
  } else {
    target = player.name;
    targetPlayer = player;
  }

  return { target, targetPlayer };
}

function getTargetName(player, mention = false) {
  return (mention && player.name) ? player.name.replace(' ', '_') : player.name;
}

function showStatistics(player, targetPlayer, stats, gameStats = false, displayTotal = true) {
  const samePlayer = targetPlayer.id === player.id;
  let you = samePlayer ? 'You' : targetPlayer.name;

  if (stats) {
    let show = true;
    let specialCondition;

    if (CURRENT_MAP === 'PRACTICE' || playersInGameLength() === 1) {
      if (PLAYING && targetPlayer.team !== TEAM.SPECTATOR) {
        specialCondition = "Practice games are not tracked, so no statistics will change in the current game.";
      } else if (!PLAYING && !displayTotal) {
        specialCondition = "There is no active game to track statistics yet.";
        show = false;
      }
    } else if (USING_RULESET === 'DISABLE' && PLAYING && targetPlayer.team !== TEAM.SPECTATOR) {
      specialCondition = "Games with disabled rules do not change statistics.";
    }

    if (show) {
      if (gameStats || displayTotal) {
        updatePlayerTimePlayed(getAuth(targetPlayer));
      }

      if (!gameStats && displayTotal) {
        stats = joinStats(stats, getGameStatistics(targetPlayer));
      }

      const color = gameStats ? COLOR.YELLOW : COLOR.GREEN;

      info(targetPlayer.name, player, color, 'bold');

      const losses = stats.games - stats.gamesAbandoned - stats.wins;
      const precisionHit = rate(1 - (stats.misses / stats.shots));
      const precisionScore = rate(stats.balls / stats.shots);
      const winRate = rate(stats.wins / stats.games);
      const winRateFinished = rate(stats.winsFinished / stats.gamesFinished);
      const abandonRate = rate(stats.gamesAbandoned / stats.games);
      const averageScore = rate(stats.score / stats.games, { scale: 1, decimals: 1 });

      const statsMessage = [];

      let game = room.getScores();

      if (displayTotal) {
        if (!gameStats && stats.createdAt) {
          statsMessage.push(`š First game played on ${getDateString(stats.createdAt)}`);
        }
      } else if (gameStats) {
        if (!game && LAST_GAME_SCORES) {
          game = LAST_GAME_SCORES;
          specialCondition = "These are statistics of the last game played.";
        }

        if (game) {
          statsMessage.push(`ā± ${getDuration(game.time, true)} game duration`);
        }
      }

      const timePlayed = (gameStats && game && stats.timePlayed > game.time) ? game.time : stats.timePlayed;

      statsMessage.push(`ā³ ${getDuration(timePlayed, timePlayed < 3600)} time played`); // 3600s = 1h

      statsMessage.push(...[
        `š„ ${stats.shots} shots`,
        `š ${stats.misses} misses`,
        `ā³ļø ${stats.balls} balls`,
        `šŖ ${precisionHit} hit precision`,
        `āļø ${precisionScore} score precision`,
        `ā ${stats.fouls} fouls`,
        `āŖļø ${stats.whiteBalls} white fouls`,
      ]);

      if (displayTotal) {
        statsMessage.push(...[
          `š ${stats.games} games`,
          `š ${winRate} win rate`,
          `š” ${stats.wins} wins`,
          `š ${losses} losses`,
          `šØ ${stats.gamesAbandoned} games abandoned`,
          `š¶āš«ļø ${abandonRate} surrender rate`,
          `ā ${stats.gamesFinished} games finished`,
          `š ${stats.winsFinished} wins finished`,
          `š± ${winRateFinished} win rate finished`,
          `š± ${stats.blackBalls} black balls successfully scored`,
          `šµ ${stats.score} score`,
          `ć½ļø ${averageScore} average score`,
        ]);
      }

      const team = samePlayer ? player.team : stats.team;

      if (gameStats && team && CURRENT_MAP !== 'PRACTICE') {
        statsMessage.push(`š ${you} score ${getTeamIcon(team)} ${getTeamName(team).toLowerCase()} balls in this game.`);
      }

      info(statsMessage.join('\n'), player, color);

      info("Details of every stat available at " + DISCORD_STATS, player);
    }
    
    if (specialCondition) {
      warn('ā ļø ' + specialCondition, player, false, 'bold');
    }
  } else if (displayTotal) {
    let message = `${you} do not have game statistics yet.`;

    if (targetPlayer.name === player.name) {
      message += " Play a game to see your statistics.";
    }

    info(message, player, COLOR.DEFAULT);
  } else if (PLAYING) {
    you = targetPlayer.name === player.name ? 'You are' : (targetPlayer.name + ' is');
    info(`${you} not playing in the current game.`, player, COLOR.DEFAULT);
  } else {
    info("There is no active game to track statistics yet.", player, COLOR.DEFAULT);
  }
}

function joinStats(totalStats, gameStats) {
  if (!gameStats) {
    return totalStats;
  }

  const stats = { ...totalStats };

  Object.keys(STATISTICS_DEFAULTS).forEach((key) => {
    if (stats.hasOwnProperty(key)) {
      stats[key] += gameStats[key];
    }
  });

  return stats;
}

/* top */

// HELP.push("š !top {STAT}? ā¶ļø see the top players of this pub");

function topStats(player, args) {
  if (player.admin) {
    const stat = args.length > 0 ? args[0].toLowerCase() : 'score'; // ELO,score

    // TODO map stat names to stat field name, check if is valid and GET top (+ cache, invalidate on gameOver)
  }
  comingSoon(player);
}

/* spin */

function spin() {
  info("Maybe in the future! Join the !discord for updates.", player);
}

/* avatar */

HELP.push("š¤ !avatar {AVATAR} ā¶ļø override your avatar only for this session. 8 = š±");

function avatar(player, args) {
  let selected = joinArgs(args);

  room.setPlayerAvatar(player.id, selected === '8' ? 'š±' : (selected || null));
}

/* players */

HELP.push("šµļø !players ā¶ļø list players in the room");

function listPlayers(player) {
  const players = getPlayers();

  let playersList = `šµļø Players ${players.length} / ${MAX_PLAYERS}\n\n`;

  playersList += players.map(p => p.name + (isAFK(p) ? ' š“ (AFK)' : '')).join('\n');

  const sharedConnections = {};

  players.forEach((roomPlayer) => {
    const conn = getConnection(roomPlayer);
    const sameConnection = getPlayersByConnection(conn);

    if (sameConnection.length > 1) {
      sharedConnections[conn] = sameConnection.map(p => p.name).join(', ');
      LOG.debug(`Connection ${conn} is shared among ${sameConnection.length} players: ${sharedConnections[conn]}`);
    }
  });

  const sharedConnectionPlayers = Object.values(sharedConnections);

  if (sharedConnectionPlayers.length > 0) {
    playersList += '\n';

    sharedConnectionPlayers.forEach((sharedConnectionGroup) => {
      playersList += "\nš These players are sharing the same connection:\n";
      playersList += 'š„ ' + sharedConnectionGroup;
    });
  }

  info(playersList, player, COLOR.YELLOW);
}

/* joke */

let JOKE_COOLDOWN = false;

function joke(player) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  if (!JOKE_COOLDOWN) {
    JOKE_COOLDOWN = true;

    chatHost(choice(JOKES).split('\n').map(line => line.trim()));

    setTimeout(() => {
      JOKE_COOLDOWN = false;
    }, JOKE_COOLDOWN_SECONDS * 1000);
  } else {
    chatHost(choice(JOKE_COOLDOWN_MESSAGE), player);
  }
}

/* teams */

ADMIN_HELP.push("š„ !teams [1-4]? ā¶ļø select how many players can be in each team at most");

function teams(player, args) {
  if (args.length > 0) {
    const newTeamLimit = checkInt('Team limit', args[0], player, 1, 4);

    if (typeof newTeamLimit === 'number') {
      TEAM_LIMIT = newTeamLimit;
      notify(`Team limit set to ${TEAM_LIMIT} vs ${TEAM_LIMIT} by ${player.name}`);
      setTeams();
    }
  } else {
    info(`Current team limit is ${TEAM_LIMIT} vs ${TEAM_LIMIT}`, player);
  }
}

/* bart */

ADMIN_HELP.push(`š¬ !bart {MESSAGE} ā¶ļø Talk as ${HOST_PLAYER} (Please, remember he is elegant and very respectful)`);

function bart(player, args) {
  if (!isOpen()) {
    pubIsClosed(player);
    return;
  }
  if (player.admin) {
    if (args.length > 0) {
      chatHost(joinArgs(args));
    } else {
      info("Example: !bart Hello to everyone, I hope you're having a good night at the pub.", player);
    }
  } else {
    const hello = [`Hello, ${player.name} š`];

    const drinking = isDrinking(player);

    if (!drinking) {
      hello.push("Do you want a drink?");
    }

    chatHost(hello, player);

    if (!drinking) {
      menu(player);
    }
  }
}

/* bb */

function bb(player) {
  kickPlayer(player, 'š ' + choice(["See you soon!", "Hope you enjoyed!", "Goodbye!"]));
}

/* kick & ban */

function kickban(command, player, args) {
  if (args.length > 0) {
    const { target, targetPlayer } = getTarget(player, args);

    if (targetPlayer) {
      const ban = command === 'ban';

      if (ban && targetPlayer.admin) {
        warn('Admin players cannot be banned.', player);
      } else {
        const reason = joinArgs(args.slice(1));
        room.kickPlayer(targetPlayer.id, reason, ban);
      }
    } else {
      warn(`Player ${target} not found in the room.`, player);
    }
  } else {
    warn(`!${command} {PLAYER} {REASON}?`, player);
  }
}

function kickPlayer(target, reason) {
  if (!isHostPlayer(target)) {
    room.kickPlayer(target.id, reason, false);
  }
}

ADMIN_HELP.push("š®š½āāļø !kick {PLAYER} {REASON}? ā¶ļø kick a player out of the room");

function kick(player, args) {
  kickban('kick', player, args);
}

ADMIN_HELP.push("āļø !ban {PLAYER} {REASON}? ā¶ļø ban a player from joining the room");

function ban(player, args) {
  kickban('ban', player, args);
}

/* clearbans */

ADMIN_HELP.push("š§¹ !clearbans ā¶ļø clear the list of banned players");

function clearbans(player) {
  room.clearBans();
  info('š§¹ Floosh! Ban list has been cleared.', player, COLOR.SUCCESS);
}

/* password */

ADMIN_HELP.push("š !password ā¶ļø See or change the room password. Use !password open to clear the password.");

function password(player, args) {
  const newPassword = args.length > 0 && args[0] && args[0] !== PASSWORD;

  if (newPassword) {
    if (player.admin) {
      PASSWORD = newPassword === 'open' ? null : newPassword;
      room.setPassword(PASSWORD);
    } else {
      adminOnlyCallback(player);
    }
  }

  if (!newPassword || player.admin) {
    info(passwordInfo(), player, COLOR.SUCCESS, 'normal', newPassword ? LOG.info : LOG.debug);
  }
}

function passwordInfo() {
  return PASSWORD ? `š ${PASSWORD}` : 'š';
}

/* discord */

function discord(player) {
  const discordMessage = "š¬š± Join to our server: " + HTTPS_DISCORD;

  const sendMethod = isOpen() ? chatHost : info;

  sendMethod(discordMessage, !player || player.admin ? null : player, COLOR.YELLOW);
}

function scheduleDiscordReminder() {
  if (DISCORD_REMINDER_INTERVAL_MINUTES > 0) {
    setInterval(() => {
      if (activePlayers().length > 0) {
        discord();
      }
    }, DISCORD_REMINDER_INTERVAL_MINUTES * 60 * 1000);
  }
}

/* help */

// HELP.push("ā !help ā¶ļø display this message");

HELP = HELP.join('\n');
ADMIN_HELP = ADMIN_HELP.join('\n');

function help(player) {
  info(HELP, player, COLOR.DEFAULT);

  if (player.admin) {
    info('āļø ADMIN āļø\n' + ADMIN_HELP, player, COLOR.DEFAULT);
  }

  info('š¬ Join our Discord: ' + HTTPS_DISCORD, player, COLOR.DEFAULT);
}

function comingSoon(player) {
  info('š Coming soon!', player);
}

/* Command Handlers */

const COMMAND_HANDLERS = {
  'help': help,
  'rules': rules,
  '!': checkStrength,
  'setrules': setVoteRules,
  'vote': vote,
  'afk': afk,
  'avatar': avatar,
  'aim': aim,
  'spin': spin,
  'me': me,
  'stats': stats,
  'game': gameStats,
  'top': topStats,
  'rank': topStats,
  'joke': joke,
  'bb': bb,
  'map': map,
  'drink': menu,
  'menu': menu,
  'players': listPlayers,
  'afks': listPlayers,
  'teams': adminOnly(teams),
  'kick': adminOnly(kick),
  'ban': adminOnly(ban),
  'clearbans': adminOnly(clearbans),
  'password': password,
  'discord': discord,
  'bart': bart,
};

const DEBUG_LOG_COMMAND_HANDLERS = new Set(['!']); // By default commands are logged as INFO, but these commands will log as DEBUG

Object.keys(DRINKS).forEach(drink => {
  COMMAND_HANDLERS[drink] = (player, _) => orderDrink(player, drink);
});

for (let kickStrength = 1; kickStrength <= MAX_PLAYER_STRENGTH; kickStrength++) {
  const command = String(kickStrength);
  DEBUG_LOG_COMMAND_HANDLERS.add(command);
  COMMAND_HANDLERS[command] = selectStrength;
}

async function processCommand(player, msg) {
  msg = msg.slice(1); // trim !
  let args = msg.split(WORD_SPLIT_REGEX).filter(arg => arg.length > 0); // split & trim spaces

  let valid = false;

  if (args.length > 0) {
    const command = args[0].toLowerCase();
    args.splice(0, 1); // remove command from args

    const log = DEBUG_LOG_COMMAND_HANDLERS.has(command) ? LOG.debug : LOG.info;
    
    log(`${player.name} -> !${command} ${args.join(' ')}`);

    if (command in COMMAND_HANDLERS) {
      try {
        await COMMAND_HANDLERS[command](player, args, command);
      } catch (error) {
        displayError("Cannot process command", error, player);
      }
      valid = true;
    }
  }

  if (!valid) {
    info("Invalid command. Use !help for more information", player, COLOR.ERROR);
  }
}

const BAD_WORDS_PLAYERS = {}; // players warned by bad words { auth: times }

function warnBadWords(player) {
  const auth = getAuth(player);

  if (!(auth in BAD_WORDS_PLAYERS)) {
    BAD_WORDS_PLAYERS[auth] = 0;
  }

  BAD_WORDS_PLAYERS[auth]++;

  if (BAD_WORDS_PLAYERS[auth] > BAD_WORDS_WARNINGS) {
    kickPlayer(player, "Respect on the room, please.");
  } else {
    warn(HOST_ICON + " Please, treat everyone with respect. Harassment, sexism, racism, or hate speech will not be tolerated in this pub.", player, NOTIFY);

    if (BAD_WORDS_PLAYERS[auth] === BAD_WORDS_WARNINGS) {
      warn(HOST_ICON + " Be careful with your words, next time you will be kicked.", player);
    }
  }
}

async function sendChat(player, msg) {
  let label;

  try {
    const { data } = await getPlayerStats(player);
    label = `šµ ${(data && data.score) || 0}`;
  } catch (e) {
    if (e.status) {
      displayHttpError(`Cannot get ${player.name} statistics`, e.status, e.error, player);
    } else {
      displayError(`Cannot show ${player.name} statistics`, e);
    }
  }

  chat(player, msg, label);
  checkHostReply(player, msg);
}

function checkHostReply(player, msg) {
  if (!isHostPlayer(player)) {
    if (N_PLAYERS === 1) {
      setTimeout(() => {
        if (isOpen()) {
          chatHost([
            `Hello, ${player.name}. I'm the bartender bot of this billiards pub.`,
            `Invite your friends with this link: ${URL}`,
            `Meanwhile, you can practice your shots on this map or choose another with !vote`,
            'And you can also order me a drink, see !help for more information'
          ], player);
        } else {
          pubIsClosed(player);
        }
      }, 1000);
    } else if (msg === 'help') {
      info("To know the available commands use !help", player);
    }
  }
}

function onPlayerChat(player, msg) {
  if (msg.startsWith('!')) {
    processCommand(player, msg);
  } else if (containsBadWords(msg)) {
    LOG.info(`Denied (${player.name}):`, msg);
    warnBadWords(player);
  } else {
    sendChat(player, msg);
  }
  return false;
}

function pubIsClosed(player) {
  if (!isOpen()) {
    let remainingSeconds = Math.ceil((NEXT_OPEN.getTime() - Date.now()) / 1000);

    if (remainingSeconds < 60) {
      remainingSeconds = 60; // Avoid "See you in 0m" message
    }

    const timeRemaining = getDuration(remainingSeconds);

    const openAt = `${SCHEDULE_FROM.hour || 0}:${String(SCHEDULE_FROM.minute || 0).padEnd(2, 0)} UTC`;
    const closeAt = `${SCHEDULE_TO.hour || 0}:${String(SCHEDULE_TO.minute || 0).padEnd(2, 0)} UTC`;
  
    info([
      `šŖ The Pub is currently closed. It will open again at ${openAt}.`,
      `š ${HOST_NAME} the bartender is resting.`,
      `š The Pub hours are everyday from ${openAt} to ${closeAt}.`,
      `š¬ Meanwhile, you can get in touch with other players on the discord: ${HTTPS_DISCORD}`,
      `š See you in ${timeRemaining}.`
    ], player, COLOR.DEFAULT, 'bold');
  }
}
