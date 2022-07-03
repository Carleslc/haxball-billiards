/* Settings */

const TOKEN = ''; // https://www.haxball.com/headlesstoken

const PRODUCTION = false;

const ROOM = "🎱  ⚪️⩴ ⚜️ Billiards Pub ⚜️ 🔴🔵 𓀙 [αlphα]";
// ßETA: hosting + API + !stats [only players > 1 & normal/extended rules] (finished games, shots, balls scored, black balls successfully scored, precision hit & score, fouls, win rate, ELO) + !top [ELO]
// RELEASE: 1 week of server hosting without errors
// FUTURE: Discord

const MAX_PLAYERS = 8;
const HOST_PLAYER = '🤵🏽‍♂️ Bart'; // Bartender
const PUBLIC_ROOM = false;
const PASSWORD = null;
const GEOCODE = { code: '', lat: 40.416729, lon: -3.703339 };

const SCORE_LIMIT = 8; // goals to win the game, 0 for infinite
const TIME_LIMIT = 0; // max minutes per game, 0 for infinite
const TEAMS_LOCK = true; // block players from joining teams manually?

let TEAM_LIMIT = 3; // maximum players per team in a game by default

const TURN_MAX_SECONDS = 60; // max seconds to kick the ball or change player turn
const TURN_SECONDS_WARNING = 10; // warning before turn is expired
const AFK_PLAYING_SECONDS = 45; // max seconds of being inactive in your turn before moving to spectators
const AFK_SECONDS_WARNING = 10; // warning before being moved to spectators due to inactivity
const MAX_FULL_AFK_MINUTES = 15; // max minutes of being inactive when the room is full
const NEW_GAME_DELAY_SECONDS = 10; // seconds to wait until next game starts when changing a map if there is people playing
const GAME_OVER_DELAY_SECONDS = 5; // seconds to wait until next game starts when the game finishes
const WAIT_GAME_START_SECONDS = 1; // seconds to wait to start a game

const MIN_SPEED_THRESHOLD = 0.02; // minimum speed to decide if a ball is still

const WAIT_DRINK_MINUTES = 10; // minimum minutes to wait before ordering another drink
const DRINK_PREPARATION_SECONDS = 3; // seconds of drink preparation until player's avatar is set

const DEFAULT_MAP = 'DEFAULT'; // default game map from maps.js
const DEFAULT_RULESET = 'NORMAL'; // default ruleset to use

const DEFAULT_STRENGTH = 5; // default strength multiplier
const BASE_KICK_STRENGTH = 2.5; // kick strength will be BASE_KICK_STRENGTH * strength multiplier

const HOST_POSITION = [-455, 136]; // host player position if moved to the game

const ADMINS = new Set([
  'vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU', // kslar
  'v4wxGGx5RduMWegXjl8LUZVyI8I9flQHkzBr-iMDNEg', // rat
]);

const DRINKS = {
  water: ["🧊💧 There you go, a glass of fresh water.", "💧🥤 You are thirsty, I see!", "💧 Yeah, a cup of water is best for a good billiards game."],
  juice: ["🧃 Orange juice, a bit bitter but freshly squeezed.", "🧃 Apple's juice, very refreshing.", "🧃 Peach juice, very sweet.", "🧃 This is wine must, ha! You didn't expect that, right? It's like grape juice, don't worry, no alcohol in this."],
  soda: ["🥤 Here you have a Coke.", "🥤 Sweet and refreshing!", "🥤 Clack! Sssss! Blub, glub, glub... Fssfsss"],
  coffee: ["☕️ Milk coffee.", "☕️ Just coffee. Enjoy!", "☕️ Oh, you sleepy?", "☕️ Caffeine for the best attention to your pool match!"],
  tea: ["🍵 Chai tea with milk.", "🍵 Do you like matcha?", "🍵 Green, classic tea.", "🍵 Oolong tea, have you tried?", "🍵 Rooibos, best at afternoon or night.", "🍵 Black tea, a bump of caffeine for you games!", "🍵 Red tea, less caffeine than black but still exciting!", "🍵 Kukicha, an essence of Japan."],
  wine: ["🍷 You're of legal age, right?", "🍷 This is exquisite, you won't regret!", "🍷 Good choice, here you have.", "🍷 This is a Rioja spanish qualified designation of origin, excellent red wine."],
  beer: ["🍺 You're of legal age, right?", "🍺 One of the best beers you can taste around here!", "🍺 Cold beer for you!", "🍻 Cheers!", "🍺 Fresh out from the draft!"],
  cocktail: ["🍹 You're of legal age, right?", "🍹 Mixing... Chop, chop. Fizz, ssssshh... Ready!", "🍹 Sweet and a bit of alcohol.", "🍹 One of my specialties. Take a sip!", "🍸 Margarita for you, with a slice of lime and some salt around the glass."],
  gin: ["🍸 You're of legal age, right?", "🍸 Gin and tonic, classic and bitter.", "🍸 Gin, and a bit of lime on top.", "🍸 There you go, one of the best and flavourish gin drinks around here.", "🍸 Here you go, with some lemon.", "🍸 Yeah, that's an olive."],
  rum: ["🥃 You're of legal age, right?", "🥃 Here it is. The pirate's drink!", "🥃 There you go, amber rum.", "🥃 Dictador's rum from Colombia for you."],
  sake: ["🍶 You're of legal age, right?", "🍶 A bit hot, but sweet and exquisite.", "🍶 One of the best japanese sakes for you.", "🍶 This time a cold sake, quite refreshing.", "🍶 From the rice plantations to your palate."],
  vodka: ["🍸 You're of legal age, right?", "🍸 This is good for a cold, I think...", "🍸 You like strong drinks?", "🍸 водка, the russians favourite."],
  whisky: ["🥃 You're of legal age, right?", "🥃 This is the best Scotch whisky you can taste in HaxBall pubs.", "🥃 Classy beverage, good choice.", "🥃 This is an award-winning soft irish whiskey, very top.", "🥃 A whisky on the rocks for you."],
  champagne: ["🥂 Chin-Chin!", "🍾 Are ya winning?", "🍾 Time to celebrate!", "🥂 Sweet and Ssssparkling!", "🍾 Beware the heads! BUM!"],
};
const DRINKS_ALIASES = {
  whiskey: 'whisky'
};

const DRINK_MENU = Object.keys(DRINKS).map(drink => `!${drink}`).join(' ');

Object.entries(DRINKS_ALIASES).forEach(([alias, drink]) => {
  DRINKS[alias] = DRINKS[drink];
});
