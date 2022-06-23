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
    adminOnlyCallback(player, () => callback(player, args));
  };
}

function adminOnlyCallback(player, callback) {
  if (player.admin) {
    callback();
  } else {
    warn("Sorry, you do not have permissions to execute this command.", player);
  }
}

/* Chat Commands */

/* rules */

HELP.push(...[
  "📋 !rules ▶️ show the billiards rules",
  "📖 !rules full ▶️ show the extended billiards rules"
]);

function rules(player, args) {
  let arg = args.length > 0 && args[0].toLowerCase();
  let extended = arg === 'full' || arg === 'extended';
  
  info(extended ? EXTENDED_RULES : RULES, player, COLOR.YELLOW);
}

/* drinks */

HELP.push(`🤵🏽‍♂️ ${DRINK_MENU} ▶️ order a drink to the bartender`);

let DRINKING = {}; // Players who have ordered a drink recently: auth to { icon, endTime }

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

  const mapVotes = VOTES[map];

  if (mapVotes) {
    if (!mapVotes.has(player.id)) {
      mapVotes.add(player.id);
      
      info(`${player.name} has voted for ${map.toLowerCase()} map (${mapVotes.size} ${mapVotes.size !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);
    
      const majority = mapVotes.size > Math.floor(activePlayers().length / 2);

      if (majority) {
        startNextMap(map, 'majority vote');
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

function removeMapVotes(player) {
  Object.keys(MAPS).forEach(map => {
    VOTES[map].delete(player);
  });
}

function resetMapVoting() {
  Object.keys(MAPS).forEach(map => {
    if (map in VOTES) {
      VOTES[map].clear();
    } else {
      VOTES[map] = new Set();
    }
  });
}

/* map */

ADMIN_HELP.push(`⚙️ !map [${AVAILABLE_MAPS}] [f, force]? ▶️ change the current map`);

function map(player, args) {
  if (args.length > 0) {
    if (!PLAYING || isForce(args)) {
      startNextMap(args[0], player.name);
    } else {
      warn("There is currently a game being played, please stop it first or run this command again with force.", player);
    }
  } else {
    warn(`!map [${AVAILABLE_MAPS}]`, player);
  }
}

/* setrules */

HELP.push(`🤖 !setrules [${AVAILABLE_RULES}] ▶️ set the rules to apply`);

function setVoteRules(player, args) {
  if (args.length > 0) {
    const rules = args[0];

    console.log('rules', rules);

    if (player.admin && isForce(args)) {
      const set = setRules(rules, player.name);

      if (!set) {
        warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULES}`);
      }
    } else {
      voteRules(player, rules);
    }
  } else {
    const help = `!setrules [${AVAILABLE_RULES}]` + (player.admin ? ' [f, force]?' : '');
    info(help, player, COLOR.DEFAULT);
  }
}

function voteRules(player, rules) {
  rules = rules.toUpperCase();

  if (rules === 'FULL') {
    rules = 'EXTENDED';
  } else if (rules === 'AUTO') {
    rules = 'NORMAL';
  }

  const rulesVotes = SET_RULES[rules];

  if (rulesVotes) {
    if (!rulesVotes.has(player.id)) {
      rulesVotes.add(player.id);

      info(`${player.name} has voted to use ${rules.toLowerCase()} rules (${rulesVotes.size} ${rulesVotes.size !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);
    
      const majority = rulesVotes.size > Math.floor(playingOrActivePlayers().length / 2);

      if (majority) {
        setRules(rules, 'majority vote');
      } else {
        info(`!setrules [${AVAILABLE_RULES}]`);
      }
    } else {
      warn(`You've already voted to use ${rules.toLowerCase()} rules.`, player);
    }
  } else {
    warn(`Invalid rules. Available rulesets: ${AVAILABLE_RULES}`);
  }
}

function setRules(rules, by) {
  rules = rules.toUpperCase();

  if (rules in SET_RULES) {
    console.log('setRules', rules, by);

    RULES_ENABLED = rules !== 'DISABLE';
    USE_EXTENDED_RULES = rules === 'EXTENDED';

    if (RULES_ENABLED) {
      updateCurrentPlayer();
    } else {
      resetCollisions();
    }

    info(`Now using ${rules.toLowerCase()} rules, set by ${by}.`, null, COLOR.NOTIFY, 'bold');

    SET_RULES[rules].clear();

    return true;
  }
  return false;
}

function removeRulesVotes(player) {
  Object.values(SET_RULES).forEach(rules => {
    rules.delete(player);
  });
}

function resetRulesVoting() {
  Object.values(SET_RULES).forEach(rules => {
    rules.clear();
  });
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
      console.log(`${player.name} -> !${command} ${args.join(' ')}`);

      COMMAND_HANDLERS[command](player, args);
    } else {
      info('Invalid command. Use !help for more information', player, COLOR.ERROR);
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
  }
}
