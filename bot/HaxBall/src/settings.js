/* Settings */

const VERSION = 'ΓETA';

const DISCORD = 'discord.gg/z6pH3hEWsf';

const ROOM = "π±  βͺοΈβ©΄ βοΈ Billiards Pub βοΈ π΄π΅ π      " + DISCORD;
// RELEASE: 1 week of server hosting without errors
// FUTURE: Discord bot (game stats + replays, account linking, !stats)

const HOST_ICON = 'π€΅π½ββοΈ';
const HOST_NAME = 'Bart'; // Bartender
const HOST_PLAYER = `${HOST_ICON} ${HOST_NAME}`;

const PRODUCTION = '$ENV' === 'prod'; // $ENV set with grunt task (dev / prod)

const PUBLIC_ROOM = PRODUCTION;

let PASSWORD = null;

const MAX_PLAYERS = 8;
const GEOCODE = { code: '', lat: 40.416729, lon: -3.703339 };

const SCORE_LIMIT = 8; // goals to win the game, 0 for infinite
const TIME_LIMIT = 0; // max minutes per game, 0 for infinite
const TEAMS_LOCK = true; // block players from joining teams manually?

const SCHEDULE_FROM = { hour: 16 }; // when the pub opens (UTC), null if forever
const SCHEDULE_TO = { hour: 6 }; // when the pub closes (UTC), null if never

const LOG_LEVEL_PRODUCTION = 'INFO'; // DEBUG, INFO, WARN, ERROR
const ENABLE_CHAT_LOG = !PRODUCTION; // LOG_LEVEL.DEBUG

let TEAM_LIMIT = 3; // maximum players per team in a game by default

const ADMINS = new Set([
  'vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU', // kslar
  'tDvju5PPtZgleuldQgT7tTRvZzekP14VYEWxgnEvW5Y', // rat
]);

const TURN_MAX_SECONDS = 60; // max seconds to kick the ball or change player turn
const TURN_SECONDS_WARNING = 10; // warning before turn is expired
const AFK_PLAYING_SECONDS = 45; // max seconds of being inactive in your turn before moving to spectators
const AFK_SECONDS_WARNING = 15; // warning before being moved to spectators due to inactivity
const MAX_FULL_AFK_MINUTES = 15; // max minutes of being inactive when the room is full
const NEW_GAME_DELAY_SECONDS = 10; // seconds to wait until next game starts when changing a map if there is people playing
const GAME_OVER_DELAY_SECONDS = 10; // seconds to wait until next game starts when the game finishes
const WAIT_GAME_START_SECONDS = 1.5; // seconds to wait to start a game
const SEND_RULES_HINT_AFTER_SECONDS = 2; // seconds to wait after a player joins the room to send the help/rules message

const MIN_SPEED_THRESHOLD = 0.02; // minimum speed to decide if a ball is still

const WAIT_DRINK_MINUTES = 10; // minimum minutes to wait before ordering another drink
const DRINK_PREPARATION_SECONDS = 3; // seconds of drink preparation until player's avatar is set

const BAD_WORDS_WARNINGS = 3; // kick player when warned for bad words more than this times

const DISCORD_REMINDER_INTERVAL_MINUTES = 15; // send a message with the discord link at a interval. 0 to disable

const DEFAULT_MAP = 'DEFAULT'; // default game map from maps.js
const DEFAULT_RULESET = 'NORMAL'; // default ruleset to use

const DEFAULT_STRENGTH = 5; // default strength multiplier
const MAX_PLAYER_STRENGTH = 10; // maximum available player strength
const BASE_KICK_STRENGTH = 3; // kick strength multiplier for !1 .. !KICK_STRENGTH_RANGE_1
const MAX_NEAR_SPEED = 20; // maximum total speed when a ball is close or will be hit in the border

const KICK_STRENGTH = {}; // available kick strengths

for (let i = 1; i <= MAX_PLAYER_STRENGTH; i++) {
  KICK_STRENGTH[i] = i * BASE_KICK_STRENGTH;
}

const BASE_ELO = 500; // starting value for the ELO score. Must be the same in the backend API environment variable BASE_ELO

const API_ENV = PRODUCTION ? 'live' : 'test';

const GET_PLAYER_URL = `https://api.buildable.dev/flow/v1/call/${API_ENV}/get-player-005eb6db18/`;
const UPDATE_PLAYERS_STATISTICS_URL = `https://api.buildable.dev/flow/v1/call/${API_ENV}/add-players-statistics-5315a377f8/`;

const DRINKS = {
  water: ["π§π§ There you go, a glass of fresh water.", "π§π₯€ You are thirsty, I see!", "π§ Yeah, a cup of water is the best for a good billiards game.", "π§ Yes! You have to be hydrated for a billiards match."],
  juice: ["π§ Orange juice, a bit bitter but freshly squeezed.", "π§ Apple's juice, very refreshing.", "π§ Peach juice, very sweet.", "π§ This is wine must, ha! You didn't expect that, right? It's like grape juice, don't worry, no alcohol in this."],
  soda: ["π₯€ Here you have a Coke.", "π₯€ Sweet and refreshing!", "π₯€ Clack! Sssss! Blub, glub, glub... Fssfsss"],
  coffee: ["βοΈ Milk coffee.", "βοΈ Just coffee. Enjoy!", "βοΈ Oh, you sleepy?", "βοΈ Caffeine for the best attention to your pool match!"],
  tea: ["π΅ Chai tea with milk.", "π΅ Do you like matcha?", "π΅ Green, classic tea.", "π΅ Oolong tea, have you tried?", "π΅ Rooibos, best at afternoon or night.", "π΅ Black tea, a bump of caffeine for you games!", "π΅ Red tea, less caffeine than black but still exciting!", "π΅ Kukicha, an essence of Japan."],
  wine: ["π· You're of legal age, right?", "π· This is exquisite, you won't regret!", "π· Good choice, here you have.", "π· This is a Rioja spanish qualified designation of origin, excellent red wine."],
  beer: ["πΊ You're of legal age, right?", "πΊ One of the best beers you can taste around here!", "πΊ Cold beer for you!", "π» Cheers!", "πΊ Fresh out from the draft!"],
  cocktail: ["πΉ You're of legal age, right?", "πΉ Mixing... Chop, chop. Fizz, ssssshh... Ready!", "πΉ Sweet and a bit of alcohol.", "πΉ One of my specialties. Take a sip!", "πΈ Margarita for you, with a slice of lime and some salt around the glass."],
  gin: ["πΈ You're of legal age, right?", "πΈ Gin and tonic, classic and bitter.", "πΈ Gin, and a bit of lime on top.", "πΈ There you go, one of the best and flavourish gin drinks around here.", "πΈ Here you go, gin with some lemon.", "πΈ Martini you said?", "πΈ Dry Martini for you. Yeah, that's an olive."],
  rum: ["π₯ You're of legal age, right?", "π₯ Here it is. The pirate's drink!", "π₯ There you go, amber rum.", "π₯ Dictador's rum from Colombia for you."],
  sake: ["πΆ You're of legal age, right?", "πΆ A bit hot, but sweet and exquisite.", "πΆ One of the best japanese sakes for you.", "πΆ This time a cold sake, quite refreshing.", "πΆ From the rice plantations to your palate."],
  vodka: ["πΈ You're of legal age, right?", "πΈ This is good for a cold, I think...", "πΈ You like strong drinks?", "πΈ Π²ΠΎΠ΄ΠΊΠ°, the russians favourite."],
  whisky: ["π₯ You're of legal age, right?", "π₯ This is the best Scotch whisky you can taste in HaxBall pubs.", "π₯ Classy beverage, good choice.", "π₯ This is an award-winning soft irish whiskey, very top.", "π₯ A whisky on the rocks for you."],
  champagne: ["π₯ Chin-Chin!", "πΎ Are ya winning?", "πΎ Time to celebrate!", "π₯ Sweet and Ssssparkling!", "πΎ Beware the heads! BUM!"],
};
const DRINKS_ALIASES = {
  whiskey: 'whisky',
  jb: 'whisky',
  redlabel: 'whisky',
  bluelabel: 'whisky',
  johnniewalker: 'whisky',
  jackdaniels: 'whisky',
  jackdaniel: 'whisky',
  passport: 'whisky',
  ballantines: 'whisky',
  margarita: 'cocktail',
  martini: 'gin',
  martin: 'gin',
  larios: 'gin',
  nordes: 'gin',
  tanqueray: 'gin',
  beefeater: 'gin',
  bombay: 'gin',
  martinmiller: 'gin',
  puertodeindias: 'gin',
  absolut: 'vodka',
  eristoff: 'vodka',
  dictador: 'rum',
  brugal: 'rum',
  cava: 'champagne',
  coke: 'soda',
  cola: 'soda',
  cocacola: 'soda',
  fanta: 'soda',
  nestea: 'soda',
  cha: 'tea',
  ocha: 'tea',
};

const DRINK_MENU = Object.keys(DRINKS).map(drink => `!${drink}`).join(' ');

Object.entries(DRINKS_ALIASES).forEach(([alias, drink]) => {
  DRINKS[alias] = DRINKS[drink];
});

const JOKE_COOLDOWN_SECONDS = 60; // minimum seconds between jokes

const JOKE_COOLDOWN_MESSAGE = [
  "Mmmm... Wait a minute or so, I'm thinking of another joke.",
  "I can not think of anything, ask me again in a while.",
  "I'm glad you like my jokes, but wait a bit for another one."
];

const JOKES = [
  `A teacher asks the kids at class:
  "I want you to name things that have hair on it"
  "A cat!", the first kid says.
  "That's correct", teacher replies. "A cat has hair on it. Can anyone tell something else that has hair?"
  "An owl!", says another kid.
  The teacher said: "Sorry, an owl has feathers, not hair! Anyone else?"
  Other kid says: "Billiard balls!"
  Teacher: "No, no, no! Billiard balls surely don't have any hair"
  The kid says: "I am sure they have", and turns to the boy sitting behind him:
  "C'mon, Billiard, show your balls to the teacher!"`,

  `Sex is like playing billiards.
  You have a cue, you have balls, you have a hole
  and the important rule is that the white one must not go in.`,

  `I cleaned the billiard table with too much water.
  Now it is a swimming pool.`,

  `I hinted to my friend that if he wanted to improve his billiards game
  he should get better equipment. Sadly... he took my cue.`,

  `A man walks from the billiard table to the bartender in a pub.
  He says to the bartender with confidence:
  "I'd like to make a bet, that I can piss in a glass 5 meters across the room without spilling one drop!".
  The bartender laughs out loud and asks jokily:
  "Well how much will the bet be?" "500 euros", he shows the bartender the money and the bartender says "Deal!".
  The man unzips his pants and starts pissing, he pisses on the bar, on the chairs,
  on the ground and even on the bartender, everywhere except in the glass 5 meters across.
  The bartender and the man both laughing their asses off.
  Then the bartender asks the man: "Why are you laughing, you're 500 euro's poorer!"
  "Well, I just made a bet with that man at the billiard table,
  that I will piss on everything here and that you will just laugh about it for 750 euros!"`,

  `Why can't an autistic kid play billiards?
  He can't pick up cues.`,

  `How many pool players does it take to change a lightbulb?
  Five. One to change the bulb and four to stand around going "pffft, I can do that".`,

  `What does a medium pizza and a pro pool player have in common?
  Neither one can feed a family of 4.`,

  `"My stomach has been bothering me, Doctor" complained the patient.
  "What have you been eating?" asked the doctor.
  "That's easy. I only eat pool balls."
  "Pool balls?!" said the astonished doctor. "Maybe that's the trouble. What kind do you eat?"
  "All kinds," replied the man, "red ones for breakfast, yellow and orange ones for lunch,
  blue ones for afternoon snacks, and purple and black for dinner."
  "I see the problem," said the doctor. "You haven't been getting any greens...!"`,

  `Mick's wife was furiously humping away with her husbands best mate Peter, when suddenly the phone rang.
  She hopped out of bed and returned to the sweaty sheet after a brief conversation.
  "Who was it?" The back stabbing buddy asked.
  "Oh, that was Mick." She replied calmly.
  "Oh shit, I'd better be going then!" he said. "Did Mick say where he was?"
  "Relax - he's down at the pub, playing a few games of pool."`,

  `Why are police officers bad at billiards?
  They hit eight ball first because it is black.`,

  `"Dad, when I grow up, I want to be a pool player."
  "Son, you can't have it both."`,

  `Two guys are playing pool, when they notice a funeral procession passing by on the street in front of the pool hall.
  One of the players stops shooting, goes to the front window, takes off his hat,
  and stands respectfully silent until the procession is finished passing.
  The other player says, "well, that was nice of you to show your respect."
  His friend responds, "it was the least I could do, we were married for 30 years."`,

  `No es lo mismo una bola negra que una negra en bolas.`,

  `Where does a pool table keep its money?
  In its pockets.`,

  `Why are pool tables green?
  You'd be green too if you had your balls shot around like that...`,

  `What's green, fuzzy, and if it fell out of a tree it would kill you?
  A pool table.`,
];

const HTTPS_DISCORD = 'https://' + DISCORD;

const DISCORD_STATS = 'https://discord.gg/TGkmuwtYve';

const API_SECRET = '$API_SECRET'; // $API_SECRET set in .env, do not modify this constant

const BUILD = '$BUILD'; // $BUILD set with grunt task (node / headless), do not modify this constant

function getToken() {
  return BUILD === 'node' ? process.env.TOKEN : '$TOKEN'; // $TOKEN set in .env for headless build
}
