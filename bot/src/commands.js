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
  return function(player, args) {
    adminOnlyCallback(player, args, () => callback(player, args));
  };
}

function adminOnlyCallback(player, args, callback) {
  if (player.admin) {
    callback();
  } else if (callback.name === 'map') {
    vote(player, args);
  } else {
    warn("🚫 Sorry, you do not have permissions to execute this command.", player);
  }
}

/* Chat Commands */

/* rules */

HELP.push(...[
  "📋 !rules ▶️ show the billiards rules of this room",
  "📖 !rules full ▶️ show the extended billiards rules"
]);

function rulesHelp(ruleset, title = true) {
  let help = '';

  if (title) {
    const rulesetTitle = ruleset === DEFAULT_RULESET ? '' : ruleset + ' ';
    help = `📜 ${rulesetTitle}RULES 📜\n\n`;
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
      helpRules += "\n\n❌🟰2️⃣ Fouls are 2 turns for the opponent's team";
      helpRules += "\n❕ Only if both teams have color balls remaining and if they do not commit another foul";
    } else {
      helpRules += "⭕️ Common rules are disabled.\n🎱 Game will end when the black ball is scored.";
    }

    if (!args.length && ruleset === 'NORMAL') {
      helpRules += '\n\n🔰 If you want to know the optional extended rules, use !rules full'
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
    warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`);
  }
}

/* drinks */

HELP.push(`🤵🏽‍♂️ ${DRINK_MENU} ▶️ order a drink to the bartender`);

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

function drinkIcon(drink, drinkMessage = null, def = '🫗') {
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
  if (isDrinking(player)) {
    message("Ey! Don't drink too much too fast!", player);
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
    message("Alright! Just a moment...", player);

    const host = getHostPlayer();
    setHostAvatar(host, icon, DRINK_PREPARATION_SECONDS);

    // Move host to the table if player is playing
    if (host.team === TEAM.SPECTATOR && player.team !== TEAM.SPECTATOR) {
      setTimeout(() => {
        setPlayerTeam(host, player.team);
      }, Math.floor(DRINK_PREPARATION_SECONDS / 2) * 1000);
    }

    // Set drink avatar
    setTimeout(() => {
      message(drinkMessage, player);
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

/* vote */

const AVAILABLE_MAPS = Object.keys(MAPS).map(m => m.toLowerCase()).join(', ');

HELP.push(`🔄 !vote [${AVAILABLE_MAPS}] ▶️ vote to change the current map`);

function vote(player, args) {
  if (args.length > 0) {
    voteMap(player, args[0]);
  } else {
    info(`!vote [${AVAILABLE_MAPS}]`, player, COLOR.DEFAULT);
  }
}

function voteMap(player, map) {
  map = map.toUpperCase();

  const mapVotes = MAP_VOTES[map];

  if (mapVotes) {
    if (CURRENT_MAP === map) {
      info(`Already playing in map ${map.toLowerCase()}.`, player);
    } else if (!mapVotes.has(player.id)) {
      mapVotes.add(player.id);

      const activeVotes = filter(mapVotes, p => !isAFK(p)).length;
      
      info(`${player.name} has voted for ${map.toLowerCase()} map (${activeVotes} ${activeVotes !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);

      if (isMajorityVoting(activeVotes, activePlayers().length)) {
        selectNextMap(map, 'majority vote');
      } else {
        info(`!vote [${AVAILABLE_MAPS}]`);
      }
    } else {
      warn(`You've already voted for the map ${map.toLowerCase()}.`, player);
    }
  } else {
    warn(`Invalid map. Available maps: ${AVAILABLE_MAPS}`);
  }
}

function isMajorityVoting(votes, players) {
  return votes > Math.floor(players / 2);
}

function updateMapVotes() {
  let totalVotes = 0;
  let newMajorityMap;

  const players = activePlayers().length;

  Object.keys(MAPS).forEach(map => {
    const mapVotes = MAP_VOTES[map];

    const activeVotes = filter(mapVotes, player => !isAFK(player)).length;

    totalVotes += activeVotes;

    if (!newMajorityMap && isMajorityVoting(activeVotes, players)) {
      newMajorityMap = map;
    }
  });

  if (newMajorityMap) {
    selectNextMap(newMajorityMap, 'majority vote', false);
  } else if (totalVotes === 0) {
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

ADMIN_HELP.push(`⚙️ !map [${AVAILABLE_MAPS}] [f, force]? ▶️ change the current map`);

function map(player, args) {
  if (args.length > 0) {
    if (!PLAYING || isForce(args)) {
      selectNextMap(args[0], player.name);
    } else {
      warn("There is currently a game being played, please stop it first or run this command again with force.", player);
    }
  } else {
    warn(`!map [${AVAILABLE_MAPS}]`, player);
  }
}

/* setrules */

HELP.push(`🤖 !setrules [${AVAILABLE_RULESETS}] ▶️ set the rules to apply`);

function setVoteRules(player, args) {
  if (args.length > 0) {
    const ruleset = args[0];

    if (player.admin && isForce(args)) {
      const set = setRuleset(ruleset, player.name);

      if (!set) {
        warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`);
      }
    } else {
      voteRules(player, ruleset);
    }
  } else {
    const help = `!setrules [${AVAILABLE_RULESETS}]` + (player.admin ? ' [f, force]?' : '');
    info(help, player, COLOR.DEFAULT);
  }
}

function voteRules(player, ruleset) {
  ruleset = getRuleset(ruleset);

  if (ruleset) {
    const rulesVotes = RULESET_VOTES[ruleset];

    if (USING_RULESET === ruleset) {
      info(`Already playing with ${ruleset.toLowerCase()} rules.`, player);
    } else if (!rulesVotes.has(player.id)) {
      rulesVotes.add(player.id);

      const activeVotes = filter(rulesVotes, p => !isAFK(p)).length;

      info(`${player.name} has voted to use ${ruleset.toLowerCase()} rules (${activeVotes} ${activeVotes !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);

      if (isMajorityVoting(activeVotes, playingOrActivePlayers().length)) {
        setRuleset(ruleset, 'majority vote');
      } else {
        info(`!setrules [${AVAILABLE_RULESETS}]`);
      }
    } else {
      warn(`You've already voted to use ${ruleset.toLowerCase()} rules.`, player);
    }
  } else {
    warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULESETS}`);
  }
}

function setRuleset(ruleset, by) {
  ruleset = getRuleset(ruleset);

  if (ruleset) {
    if (USING_RULESET !== ruleset) {
      LOG.info('setRules', ruleset, by);
      
      USING_RULESET = ruleset;
      USING_RULES = rulesMapping(RULESETS[USING_RULESET]);
  
      const missingRules = notImplementedRules(USING_RULESET);
  
      if (missingRules.length > 0) {
        // Cannot determine if some rules are satisfied
        delete USING_RULES.ONE_SHOT_EACH_PLAYER; // may not give the 2 turns of a foul
        delete USING_RULES.EXTRA_SHOT_IF_SCORED; // may keep turn when is a foul
      }
  
      if (USING_RULES.ONE_SHOT_EACH_PLAYER) {
        updateCurrentPlayer();
      } else {
        resetCollisions();
      }
  
      if (N_PLAYERS) {
        let msg = `Now using !rules ${ruleset.toLowerCase()}`;
        info(by ? `${msg}, set by ${by}.` : `${msg}.`, null, COLOR.NOTIFY, 'bold');
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

/* afk */

HELP.push("😴 !afk ▶️ switch between afk / online");

function afk(player, _) {
  if (isAFK(player)) {
    resetAFK(player);
  } else {
    setAFK(player);
    info(`😴 ${player.name} is AFK`, null, COLOR.INFO, 'bold');
    infoInactive(player);
  }
}

/* avatar */

HELP.push("👤 !avatar {AVATAR} ▶️ override your avatar only for this session. 8 = 🎱");

function avatar(player, args) {
  let selected = joinArgs(args);
  room.setPlayerAvatar(player.id, selected === '8' ? '🎱' : selected);
}

/* kick & ban */

function kickban(command, player, args) {
  if (args.length > 0) {
    const targetName = joinArgs(args);
    const target = getPlayers().find(p => p.name === targetName);

    if (target) {
      const ban = command === 'ban';

      if (ban && target.admin) {
        warn('Admin players cannot be banned.', player);
      } else {
        const reason = joinArgs(args.slice(1));
        room.kickPlayer(target.id, reason, ban);
      }
    } else {
      warn(`Player ${targetName} not found in the room.`, player);
    }
  } else {
    warn(`!${command} {PLAYER} {REASON}?`, player);
  }
}

ADMIN_HELP.push(`👮🏽‍♂️ !kick {PLAYER} {REASON}? ▶️ kick a player out of the room`);

function kick(player, args) {
  kickban('kick', player, args);
}

ADMIN_HELP.push(`⛔️ !ban {PLAYER} {REASON}? ▶️ ban a player from joining the room`);

function ban(player, args) {
  kickban('ban', player, args);
}

/* clearbans */

ADMIN_HELP.push(`🧹 !clearbans ▶️ clear the list of banned players`);

function clearbans(player, _) {
  room.clearBans();
  info('🧹 Floosh! Ban list has been cleared.', player, COLOR.SUCCESS);
}

/* help */

HELP.push("❔ !help ▶️ display this message");

function help(player) {
  let help = HELP;

  if (player.admin) {
    help += '\n\n⚜️ ADMIN ⚜️\n' + ADMIN_HELP;
  }
  
  info(help, player, COLOR.DEFAULT);
}

HELP = HELP.join('\n');
ADMIN_HELP = ADMIN_HELP.join('\n');

/* Command Handlers */

const COMMAND_HANDLERS = {
  'help': help,
  'rules': rules,
  'setrules': setVoteRules,
  'vote': vote,
  'afk': afk,
  'avatar': avatar,
  'map': adminOnly(map),
  'kick': adminOnly(kick),
  'ban': adminOnly(ban),
  'clearbans': adminOnly(clearbans),
};

Object.keys(DRINKS).forEach(drink => {
  COMMAND_HANDLERS[drink] = (player, _) => orderDrink(player, drink);
});

function onPlayerChat(player, msg) {
  if (msg.startsWith('!')) {
    // Command
    msg = msg.slice(1); // trim !
    let args = msg.split(/\s+/); // split spaces

    let command = args[0].toLowerCase();
    args.splice(0, 1); // remove command from args

    if (command in COMMAND_HANDLERS) {
      LOG.debug(`${player.name} -> !${command} ${args.join(' ')}`);

      COMMAND_HANDLERS[command](player, args);
    } else {
      info("Invalid command. Use !help for more information", player, COLOR.ERROR);
    }

    return false;
  } else if (N_PLAYERS === 1 && !isHostPlayer(player)) {
    setTimeout(() => {
      message([
        `Hello, ${player.name}. I'm the bartender bot of this billiards pub.`,
        `To play a pool game you need at least another person. Invite your friends with this link: ${URL}`,
        `Meanwhile, you can practice your shots on this map or choose another with !vote`,
        'And you can also order me a drink, see !help for more information'
      ], player);
    }, 1000);
  } else if (msg === 'help') {
    info("To know the available commands use !help", player);
  }
}
