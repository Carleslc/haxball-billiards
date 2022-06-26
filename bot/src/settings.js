/* Settings */

const TOKEN = ''; // https://www.haxball.com/headlesstoken

const ROOM = "🎱  ⚪️⩴ ⚜️ Billiards Pub ⚜️ 🔴🔵 𓀙 [αlpha]"; // ßETA on server
const MAX_PLAYERS = 8;
const HOST_PLAYER = '🤵🏽‍♂️ Bart'; // Bartender
const PUBLIC_ROOM = false;
const PASSWORD = null;
const GEOCODE = { code: '', lat: 40.416729, long: -3.703339 };

const SCORE_LIMIT = 8; // goals to win the game, 0 for infinite
const TIME_LIMIT = 0; // max minutes per game, 0 for infinite
const TEAMS_LOCK = true; // block players from joining teams manually?

const TEAM_LIMIT = 2; // maximum players per team in a game
const TURN_MAX_SECONDS = 60; // max seconds to kick the ball or change player turn
const TURN_SECONDS_WARNING = 10; // warning before turn is expired
const AFK_PLAYING_SECONDS = 45; // max seconds of being inactive in your turn before moving to spectators
const AFK_SECONDS_WARNING = 10; // warning before being moved to spectators due to inactivity
const MAX_FULL_AFK_MINUTES = 15; // max minutes of being inactive when the room is full
const NEW_GAME_DELAY_SECONDS = 10; // seconds to wait until next game starts when changing a map if there is people playing
const GAME_OVER_DELAY_SECONDS = 5; // seconds to wait until next game starts when the game finishes
const WAIT_GAME_START_SECONDS = 1; // seconds to wait to start a game

const MIN_SPEED_THRESHOLD = 0.02; // minimum speed to decide if a ball is still

const WAIT_DRINK_MINUTES = 10; // minimum minutes between ordering a drink
const DRINK_PREPARATION_SECONDS = 3; // seconds of drink preparation until player's avatar is set

const DEFAULT_MAP = 'DEFAULT'; // default game map from maps.js
const HOST_POSITION = [-455, -10]; // host player position if moved to the game

const ADMINS = new Set([
  'vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU', // kslar
]);

const RULES = `
  𓀙 One shot each player
  🔴🔵 Score the balls with the same color as your player
  🏵 If you score you shot again
  ⚫️ Scoring black must be the last one or you lose
  ⚪️ Scoring white is foul

  ❌🟰2️⃣ Fouls are 2 turns for the opponent's team
  ❕ Only if both teams have color balls remaining and if they do not commit another foul

  🔰 If you want to know the optional extended rules, use !rules full
`.slice(1);

const EXTENDED_RULES = `
  📜 EXTENDED RULES 📜
  🌀 Foul when you do not touch any ball of your team
  🔘❔ Foul when you touch first a ball of opponent's team or the black ball
  〰️❕ Foul if you shot the ball when balls are still moving
  ⚪️➡️ After scoring the white ball you must shot to the right, from the 1/4 left part of the table (kickoff area)
  ⚫️↔️↕️ Black, the last ball, must be scored in the opposite hole of your last scored ball. You lose scoring in another hole.
  ⚪️⚫️❗️ You lose if you score black ball right after the white ball with the same shot
  
  ✳️ To play with extended rules use !setrules disable (these rules are not yet enforced by the bot)
`.slice(1);

const TOURNAMENT_RULES = `
  📜 TOURNAMENT RULES 📜
  🌀 Foul when you do not touch any ball of your team
  🔘❔ Foul when you touch first a ball of opponent's team or the black ball
  〰️❕ Foul if you shot the ball when balls are still moving
  ⚪️⚫️❗️ You lose if you score black ball right after the white ball with the same shot

  ✳️ To play with tournament rules use !setrules tournament
`.slice(1);

const DRINKS = {
  water: ['🧊💧 There you go, a glass of fresh water.', '💧🥤 You are thirsty, I see!', '💧 Yeah, a cup of water is best for a good billiards game.'],
  juice: ['🧃 Orange juice, a bit bitter but freshly squeezed.', "🧃 Apple's juice, very refreshing.", "🧃 Peach juice, very sweet.", "🧃 This is wine must, ha! You didn't expect that, right? It's like grape juice, don't worry, no alcohol in this."],
  soda: ['🥤 Here you have a Coke.', '🥤 Sweet and refreshing!', '🥤 Clack! Sssss! Blub, glub, glub... Fssfsss'],
  coffee: ['☕️ Milk coffee.', '☕️ Just coffee. Enjoy!', '☕️ Oh, you sleepy?', '☕️ Caffeine for the best attention to your pool match!'],
  tea: ['🍵 Chai tea with milk.', '🍵 Do you like matcha?', '🍵 Green, classic tea.', '🍵 Oolong tea, have you tried?', '🍵 Rooibos, best at afternoon or night.', '🍵 Black tea, a bump of caffeine for you games!', '🍵 Red tea, less caffeine than black but still exciting!', '🍵 Kukicha, an essence of Japan.'],
  wine: ["🍷 You're of legal age, right?", "🍷 This is exquisite, you won't regret!", "🍷 Good choice, here you have.", "🍷 This is a Rioja spanish qualified designation of origin, excellent red wine."],
  beer: ["🍺 You're of legal age, right?", '🍺 One of the best beers you can try around here!', '🍺 Cold beer for you!', '🍻 Cheers!', '🍺 Fresh out from the draft!'],
  cocktail: ["🍹 You're of legal age, right?", '🍹 Mixing... Chop, chop. Fizz, ssssshh... Ready!', '🍹 Sweet and a bit of alcohol.', '🍹 One of my specialties. Take a sip!', '🍸 Margarita for you, with a slice of lime and some salt around the glass.'],
  gin: ["🍸 You're of legal age, right?", '🍸 Gin and tonic, classic and bitter.', '🍸 Gin, and a bit of lime on top.', "🍸 There you go, one of the best and flavourish gin drinks around here.", "🍸 Here you go, with some lemon.", "🍸 Yeah, that's an olive."],
  whisky: ["🥃 You're of legal age, right?", '🥃 This is the best Scotch whisky you can taste in HaxBall pubs.', "🥃 Classy beverage, good choice.", '🥃 This is an award-winning soft irish whiskey, very top.', '🥃 A whisky on the rocks for you.'],
  rum: ["🥃 You're of legal age, right?", "🥃 Here it is. The pirate's drink!", "🥃 There you go, amber rum.", "🥃 Dictador's rum from Colombia for you."],
};
const DRINKS_ALIASES = {
  whiskey: 'whisky'
};

const DRINK_MENU = Object.keys(DRINKS).map(drink => `!${drink}`).join(' ');

Object.entries(DRINKS_ALIASES).forEach(([alias, drink]) => {
  DRINKS[alias] = DRINKS[drink];
});
