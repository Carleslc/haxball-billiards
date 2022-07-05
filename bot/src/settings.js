/* Settings */

const TOKEN = ''; // https://www.haxball.com/headlesstoken

const VERSION = 'αlphα';
const PRODUCTION = false;

const DISCORD = 'discord.gg/z6pH3hEWsf';

const ROOM = "🎱  ⚪️⩴ ⚜️ Billiards Pub ⚜️ 🔴🔵 𓀙 " + DISCORD;
// ßETA: hosting + API + !stats [only players > 1 & normal/extended rules] (finished games, shots, balls scored, black balls successfully scored, precision hit & score, fouls, win rate, ELO) + !top [ELO]
// RELEASE: 1 week of server hosting without errors
// FUTURE: Discord bot (game stats)

const HOST_PLAYER = '🤵🏽‍♂️ Bart'; // Bartender
const PUBLIC_ROOM = false;
const MAX_PLAYERS = 8;
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
const BASE_KICKOFF_KICK_STRENGTH = 3; // base kick strength for kickoff

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
