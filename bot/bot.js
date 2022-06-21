/* Settings */

const TOKEN = null;

const ROOM = "🎱  ⚪️⩴ ⚜️ Billiards Pub ⚜️ 🔴🔵 𓀙";
const MAX_PLAYERS = 8;
const HOST_PLAYER = '🤵🏽‍♂️ Bart'; // Bartender
const PUBLIC_ROOM = false;

const TURN_MAX_SECONDS = 60;
const TURN_SECONDS_WARNING = 10;
const AFK_PLAYING_SECONDS = 45;
const AFK_SECONDS_WARNING = 10;
const MAX_FULL_AFK_MINUTES = 15;
const NEW_GAME_DELAY_SECONDS = 10;

const RULES = `
  𓀙 One shot each player
  🔴🔵 Score the balls with the same color as your player
  🏵 If you score you shot again
  ⚫️ Scoring black must be the last one or you lose
  ⚪️ Scoring white is foul
  🛑 Blocking your opponent is illegal

  ❌🟰2️⃣ Fouls are 2 turns for the opponent's team (if they do not commit another foul)

  🔰 If you want to know the optional extended rules, use !rules full
`.slice(1);

const EXTENDED_RULES = `
  📜 EXTENDED RULES 📜
  🌀 Foul when you do not touch any ball of your team
  🔘❔ Foul when you touch first a ball of opponent's team
  〰️❕ Foul if you shot the ball when balls are still moving
  ⚪️➡️ After scoring the white ball you must shot to the right, from the 1/4 left part of the table (kickoff area)
  ⚫️↔️↕️ Black, the last ball, must be scored in the opposite hole of your last scored ball. You lose scoring in another hole.
  ⚫️⚪️❗️ You lose if you score both black and white balls with the same shot.
`.slice(1);

const ADMINS = [
  'vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU', // kslar
];

const WAIT_DRINK_MINUTES = 10;
const DRINK_PREPARATION_SECONDS = 3;

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

// Aliases
DRINKS['whiskey'] = DRINKS.whisky;

const DRINK_MENU = Object.keys(DRINKS).map(drink => `!${drink}`).join(' ');

/* maps.js */

const MAPS = {
  DEFAULT: `{"name":"Billiards","canBeStored":false,"width":388,"height":209,"maxViewWidth":1300,"cameraWidth":470,"cameraHeight":285,"cameraFollow":"ball","spawnDistance":267,"redSpawnPoints":[[-267,-89]],"blueSpawnPoints":[[-267,89]],"kickOffReset":"partial","bg":{"width":388,"height":209,"type":"none","cornerRadius":24,"kickOffRadius":0,"color":"084e45"},"playerPhysics":{"radius":18,"bCoef":0.15,"invMass":20,"damping":0.8,"acceleration":0.1,"kickingAcceleration":0.36,"kickingDamping":0.9,"kickStrength":1250},"ballPhysics":"disc0","traits":{"whiteBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"ffffe4","cMask":["wall","ball","red","blue","c1","c2","c3"],"cGroup":["ball","c0","kick","score"]},"redBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"e56e56","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c1"]},"blueBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"5689e5","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c2"]},"blackBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"181818","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c3","score"]},"tableWall":{"bCoef":0.5,"bias":-6,"color":"163433","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallCorner":{"bCoef":0.45,"color":"163433","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallGoalInner":{"vis":false,"bCoef":-4,"bias":-5,"cMask":["wall","ball"],"cGroup":["wall"]},"tableWallGoalInnerLaunch":{"vis":false,"bCoef":4,"bias":5,"cMask":["wall","ball"],"cGroup":["wall"]},"kickoffLine":{"vis":false,"bCoef":0.1,"color":"085849","cMask":["red","blue"],"cGroup":["redKO","blueKO"]},"bgTable":{"color":"2e1418","cMask":[],"cGroup":["wall"]},"bgTableBorderIn":{"color":"2e1418","bCoef":5,"bias":40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgTableBorderOut":{"color":"2e1418","bCoef":5,"bias":-40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgHole":{"radius":20,"color":"000000","cMask":[],"cGroup":["wall"]},"bgIndicator":{"color":"b59978","cMask":[],"cGroup":["wall"]},"playerBoundary":{"vis":false,"bCoef":0.5,"cMask":["red","blue"]},"ballBoundary":{"vis":false,"bCoef":0,"cMask":["ball","c0","c1","c2","c3"]},"railSide":{"vis":false,"bCoef":10,"bias":-5,"cMask":["c0","c1","c2","c3"]},"railStopRight":{"vis":false,"bCoef":0,"bias":-40,"cMask":["ball","c0","c1","c2","c3"]},"railStopLeft":{"vis":false,"bCoef":0,"bias":40,"cMask":["ball","c0","c1","c2","c3"]},"aimDisc":{"radius":66,"invMass":65000,"pos":[-178,0],"color":"transparent","bCoef":0,"damping":0,"cMask":["red","blue"],"cGroup":["ball"]}},"planes":[{"normal":[0,-1],"dist":-275,"trait":"playerBoundary"},{"normal":[0,1],"dist":-275,"trait":"playerBoundary"},{"normal":[1,0],"dist":-465,"trait":"playerBoundary"},{"normal":[-1,0],"dist":-465,"trait":"playerBoundary"},{"normal":[0,-1],"dist":-275,"trait":"ballBoundary"},{"normal":[0,1],"dist":-275,"trait":"ballBoundary"},{"normal":[1,0],"dist":-465,"trait":"ballBoundary"},{"normal":[-1,0],"dist":-465,"trait":"ballBoundary"}],"discs":[{"pos":[-178,0],"trait":"whiteBall"},{"pos":[178,0],"trait":"redBall"},{"pos":[198,-12],"trait":"blueBall"},{"pos":[198,12],"trait":"redBall"},{"pos":[218,-24],"trait":"redBall"},{"pos":[218,0],"trait":"blackBall"},{"pos":[218,24],"trait":"blueBall"},{"pos":[238,-36],"trait":"blueBall"},{"pos":[238,-12],"trait":"redBall"},{"pos":[238,12],"trait":"blueBall"},{"pos":[238,36],"trait":"redBall"},{"pos":[258,-48],"trait":"redBall"},{"pos":[258,-24],"trait":"blueBall"},{"pos":[258,0],"trait":"blueBall"},{"pos":[258,24],"trait":"redBall"},{"pos":[258,48],"trait":"blueBall"},{"pos":[-178,0],"trait":"aimDisc"},{"pos":[-364,-189],"trait":"bgHole"},{"pos":[0,-204],"trait":"bgHole"},{"pos":[364,-189],"trait":"bgHole"},{"pos":[364,185],"trait":"bgHole"},{"pos":[0,200],"trait":"bgHole"},{"pos":[-364,185],"trait":"bgHole"}],"vertexes":[{"x":-178,"y":-179,"trait":"kickoffLine"},{"x":-178,"y":175,"trait":"kickoffLine"},{"x":-379,"y":-229,"trait":"bgTable"},{"x":379,"y":-229,"trait":"bgTable"},{"x":-385,"y":-227,"trait":"bgTable"},{"x":385,"y":-227,"trait":"bgTable"},{"x":-390,"y":-225,"trait":"bgTable"},{"x":390,"y":-225,"trait":"bgTable"},{"x":-393,"y":-223,"trait":"bgTable"},{"x":393,"y":-223,"trait":"bgTable"},{"x":-395,"y":-221,"trait":"bgTable"},{"x":395,"y":-221,"trait":"bgTable"},{"x":-397,"y":-219,"trait":"bgTable"},{"x":397,"y":-219,"trait":"bgTable"},{"x":-399,"y":-217,"trait":"bgTable"},{"x":399,"y":-217,"trait":"bgTable"},{"x":-401,"y":-215,"trait":"bgTable"},{"x":401,"y":-215,"trait":"bgTable"},{"x":-403,"y":-213,"trait":"bgTable"},{"x":403,"y":-213,"trait":"bgTable"},{"x":-403,"y":-211,"trait":"bgTable"},{"x":403,"y":-211,"trait":"bgTable"},{"x":-404,"y":-209,"trait":"bgTable"},{"x":404,"y":-209,"trait":"bgTable"},{"x":-404,"y":-207,"trait":"bgTable"},{"x":404,"y":-207,"trait":"bgTable"},{"x":-404,"y":-205,"trait":"bgTable"},{"x":404,"y":-205,"trait":"bgTable"},{"x":-405,"y":-203,"trait":"bgTable"},{"x":405,"y":-203,"trait":"bgTable"},{"x":-405,"y":-201,"trait":"bgTable"},{"x":405,"y":-201,"trait":"bgTable"},{"x":-405,"y":-199,"trait":"bgTable"},{"x":405,"y":-199,"trait":"bgTable"},{"x":-406,"y":-197,"trait":"bgTable"},{"x":406,"y":-197,"trait":"bgTable"},{"x":-406,"y":-195,"trait":"bgTable"},{"x":406,"y":-195,"trait":"bgTable"},{"x":-406,"y":-193,"trait":"bgTable"},{"x":406,"y":-193,"trait":"bgTable"},{"x":-379,"y":225,"trait":"bgTable"},{"x":379,"y":225,"trait":"bgTable"},{"x":-385,"y":223,"trait":"bgTable"},{"x":385,"y":223,"trait":"bgTable"},{"x":-390,"y":221,"trait":"bgTable"},{"x":390,"y":221,"trait":"bgTable"},{"x":-393,"y":219,"trait":"bgTable"},{"x":393,"y":219,"trait":"bgTable"},{"x":-395,"y":217,"trait":"bgTable"},{"x":395,"y":217,"trait":"bgTable"},{"x":-397,"y":215,"trait":"bgTable"},{"x":397,"y":215,"trait":"bgTable"},{"x":-399,"y":213,"trait":"bgTable"},{"x":399,"y":213,"trait":"bgTable"},{"x":-401,"y":211,"trait":"bgTable"},{"x":401,"y":211,"trait":"bgTable"},{"x":-403,"y":209,"trait":"bgTable"},{"x":403,"y":209,"trait":"bgTable"},{"x":-403,"y":207,"trait":"bgTable"},{"x":403,"y":207,"trait":"bgTable"},{"x":-404,"y":205,"trait":"bgTable"},{"x":404,"y":205,"trait":"bgTable"},{"x":-404,"y":203,"trait":"bgTable"},{"x":404,"y":203,"trait":"bgTable"},{"x":-404,"y":201,"trait":"bgTable"},{"x":404,"y":201,"trait":"bgTable"},{"x":-405,"y":199,"trait":"bgTable"},{"x":405,"y":199,"trait":"bgTable"},{"x":-405,"y":197,"trait":"bgTable"},{"x":405,"y":197,"trait":"bgTable"},{"x":-405,"y":195,"trait":"bgTable"},{"x":405,"y":195,"trait":"bgTable"},{"x":-406,"y":193,"trait":"bgTable"},{"x":406,"y":193,"trait":"bgTable"},{"x":-406,"y":191,"trait":"bgTable"},{"x":406,"y":191,"trait":"bgTable"},{"x":-406,"y":189,"trait":"bgTable"},{"x":406,"y":189,"trait":"bgTable"},{"x":-404,"y":-193,"trait":"bgTable"},{"x":-404,"y":189,"trait":"bgTable"},{"x":-402,"y":-193,"trait":"bgTable"},{"x":-402,"y":189,"trait":"bgTable"},{"x":-400,"y":-193,"trait":"bgTable"},{"x":-400,"y":189,"trait":"bgTable"},{"x":-398,"y":-193,"trait":"bgTable"},{"x":-398,"y":189,"trait":"bgTable"},{"x":-396,"y":-193,"trait":"bgTable"},{"x":-396,"y":189,"trait":"bgTable"},{"x":-394,"y":-193,"trait":"bgTable"},{"x":-394,"y":189,"trait":"bgTable"},{"x":-392,"y":-193,"trait":"bgTable"},{"x":-392,"y":189,"trait":"bgTable"},{"x":-390,"y":-193,"trait":"bgTable"},{"x":-390,"y":189,"trait":"bgTable"},{"x":-388,"y":-193,"trait":"bgTable"},{"x":-388,"y":189,"trait":"bgTable"},{"x":-386,"y":-193,"trait":"bgTable"},{"x":-386,"y":189,"trait":"bgTable"},{"x":-384,"y":-193,"trait":"bgTable"},{"x":-384,"y":189,"trait":"bgTable"},{"x":-382,"y":-193,"trait":"bgTable"},{"x":-382,"y":189,"trait":"bgTable"},{"x":-380,"y":-193,"trait":"bgTable"},{"x":-380,"y":189,"trait":"bgTable"},{"x":-379,"y":-193,"trait":"bgTable"},{"x":-379,"y":189,"trait":"bgTable"},{"x":-378,"y":-193,"trait":"bgTable"},{"x":-378,"y":189,"trait":"bgTable"},{"x":-376,"y":-193,"trait":"bgTable"},{"x":-376,"y":189,"trait":"bgTable"},{"x":-374,"y":-193,"trait":"bgTable"},{"x":-374,"y":189,"trait":"bgTable"},{"x":-372,"y":-193,"trait":"bgTable"},{"x":-372,"y":189,"trait":"bgTable"},{"x":-370,"y":-193,"trait":"bgTable"},{"x":-370,"y":189,"trait":"bgTable"},{"x":404,"y":-193,"trait":"bgTable"},{"x":404,"y":189,"trait":"bgTable"},{"x":402,"y":-193,"trait":"bgTable"},{"x":402,"y":189,"trait":"bgTable"},{"x":400,"y":-193,"trait":"bgTable"},{"x":400,"y":189,"trait":"bgTable"},{"x":398,"y":-193,"trait":"bgTable"},{"x":398,"y":189,"trait":"bgTable"},{"x":396,"y":-193,"trait":"bgTable"},{"x":396,"y":189,"trait":"bgTable"},{"x":394,"y":-193,"trait":"bgTable"},{"x":394,"y":189,"trait":"bgTable"},{"x":392,"y":-193,"trait":"bgTable"},{"x":392,"y":189,"trait":"bgTable"},{"x":390,"y":-193,"trait":"bgTable"},{"x":390,"y":189,"trait":"bgTable"},{"x":388,"y":-193,"trait":"bgTable"},{"x":388,"y":189,"trait":"bgTable"},{"x":386,"y":-193,"trait":"bgTable"},{"x":386,"y":189,"trait":"bgTable"},{"x":384,"y":-193,"trait":"bgTable"},{"x":384,"y":189,"trait":"bgTable"},{"x":382,"y":-193,"trait":"bgTable"},{"x":382,"y":189,"trait":"bgTable"},{"x":380,"y":-193,"trait":"bgTable"},{"x":380,"y":189,"trait":"bgTable"},{"x":379,"y":-193,"trait":"bgTable"},{"x":379,"y":189,"trait":"bgTable"},{"x":378,"y":-193,"trait":"bgTable"},{"x":378,"y":189,"trait":"bgTable"},{"x":376,"y":-193,"trait":"bgTable"},{"x":376,"y":189,"trait":"bgTable"},{"x":374,"y":-193,"trait":"bgTable"},{"x":374,"y":189,"trait":"bgTable"},{"x":372,"y":-193,"trait":"bgTable"},{"x":372,"y":189,"trait":"bgTable"},{"x":370,"y":-193,"trait":"bgTable"},{"x":370,"y":189,"trait":"bgTable"},{"x":-356,"y":-153,"trait":"tableWall"},{"x":-328,"y":-179,"trait":"tableWall"},{"x":-24,"y":-179,"trait":"tableWall"},{"x":24,"y":-179,"trait":"tableWall"},{"x":328,"y":-179,"trait":"tableWall"},{"x":356,"y":-153,"trait":"tableWall"},{"x":356,"y":149,"trait":"tableWall"},{"x":328,"y":175,"trait":"tableWall"},{"x":24,"y":175,"trait":"tableWall"},{"x":-24,"y":175,"trait":"tableWall"},{"x":-328,"y":175,"trait":"tableWall"},{"x":-356,"y":149,"trait":"tableWall"},{"x":-376,"y":-174,"trait":"tableWallCorner"},{"x":-346,"y":-196,"trait":"tableWallCorner"},{"x":-16,"y":-196,"trait":"tableWallCorner"},{"x":16,"y":-196,"trait":"tableWallCorner"},{"x":346,"y":-196,"trait":"tableWallCorner"},{"x":376,"y":-174,"trait":"tableWallCorner"},{"x":376,"y":170,"trait":"tableWallCorner"},{"x":346,"y":192,"trait":"tableWallCorner"},{"x":16,"y":192,"trait":"tableWallCorner"},{"x":-16,"y":192,"trait":"tableWallCorner"},{"x":-346,"y":192,"trait":"tableWallCorner"},{"x":-376,"y":170,"trait":"tableWallCorner"},{"x":-180,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-213,"trait":"bgIndicator"},{"x":-176,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-209,"trait":"bgIndicator"},{"x":-269,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-213,"trait":"bgIndicator"},{"x":-265,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-209,"trait":"bgIndicator"},{"x":-90,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-213,"trait":"bgIndicator"},{"x":-86,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-209,"trait":"bgIndicator"},{"x":180,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-213,"trait":"bgIndicator"},{"x":176,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-209,"trait":"bgIndicator"},{"x":90,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-213,"trait":"bgIndicator"},{"x":86,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-209,"trait":"bgIndicator"},{"x":269,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-213,"trait":"bgIndicator"},{"x":265,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-209,"trait":"bgIndicator"},{"x":385,"y":-2,"trait":"bgIndicator"},{"x":387,"y":0,"trait":"bgIndicator"},{"x":389,"y":-2,"trait":"bgIndicator"},{"x":387,"y":-4,"trait":"bgIndicator"},{"x":385,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-92,"trait":"bgIndicator"},{"x":389,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-88,"trait":"bgIndicator"},{"x":385,"y":86,"trait":"bgIndicator"},{"x":387,"y":88,"trait":"bgIndicator"},{"x":389,"y":86,"trait":"bgIndicator"},{"x":387,"y":84,"trait":"bgIndicator"},{"x":-180,"y":207,"trait":"bgIndicator"},{"x":-178,"y":209,"trait":"bgIndicator"},{"x":-176,"y":207,"trait":"bgIndicator"},{"x":-178,"y":205,"trait":"bgIndicator"},{"x":-269,"y":207,"trait":"bgIndicator"},{"x":-267,"y":209,"trait":"bgIndicator"},{"x":-265,"y":207,"trait":"bgIndicator"},{"x":-267,"y":205,"trait":"bgIndicator"},{"x":-90,"y":207,"trait":"bgIndicator"},{"x":-88,"y":209,"trait":"bgIndicator"},{"x":-86,"y":207,"trait":"bgIndicator"},{"x":-88,"y":205,"trait":"bgIndicator"},{"x":180,"y":207,"trait":"bgIndicator"},{"x":178,"y":209,"trait":"bgIndicator"},{"x":176,"y":207,"trait":"bgIndicator"},{"x":178,"y":205,"trait":"bgIndicator"},{"x":90,"y":207,"trait":"bgIndicator"},{"x":88,"y":209,"trait":"bgIndicator"},{"x":86,"y":207,"trait":"bgIndicator"},{"x":88,"y":205,"trait":"bgIndicator"},{"x":269,"y":207,"trait":"bgIndicator"},{"x":267,"y":209,"trait":"bgIndicator"},{"x":265,"y":207,"trait":"bgIndicator"},{"x":267,"y":205,"trait":"bgIndicator"},{"x":-385,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":0,"trait":"bgIndicator"},{"x":-389,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":-4,"trait":"bgIndicator"},{"x":-385,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-92,"trait":"bgIndicator"},{"x":-389,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-88,"trait":"bgIndicator"},{"x":-385,"y":86,"trait":"bgIndicator"},{"x":-387,"y":88,"trait":"bgIndicator"},{"x":-389,"y":86,"trait":"bgIndicator"},{"x":-387,"y":84,"trait":"bgIndicator"},{"x":465,"y":88,"trait":"railStopRight"},{"x":-465,"y":88,"trait":"railStopLeft"},{"x":-20,"y":-229,"trait":"railSide"},{"x":5,"y":-275,"trait":"railSide"}],"segments":[{"v0":0,"v1":1,"trait":"kickoffLine"},{"v0":2,"v1":3,"trait":"bgTableBorderIn"},{"v0":4,"v1":5,"trait":"bgTable"},{"v0":6,"v1":7,"trait":"bgTable"},{"v0":8,"v1":9,"trait":"bgTable"},{"v0":10,"v1":11,"trait":"bgTable"},{"v0":12,"v1":13,"trait":"bgTable"},{"v0":14,"v1":15,"trait":"bgTable"},{"v0":16,"v1":17,"trait":"bgTable"},{"v0":18,"v1":19,"trait":"bgTable"},{"v0":20,"v1":21,"trait":"bgTable"},{"v0":22,"v1":23,"trait":"bgTable"},{"v0":24,"v1":25,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":30,"v1":31,"trait":"bgTable"},{"v0":32,"v1":33,"trait":"bgTable"},{"v0":34,"v1":35,"trait":"bgTable"},{"v0":36,"v1":37,"trait":"bgTable"},{"v0":38,"v1":39,"trait":"bgTable"},{"v0":38,"v1":2,"curve":90,"trait":"bgTableBorderIn"},{"v0":39,"v1":3,"curve":-90,"trait":"bgTableBorderOut"},{"v0":40,"v1":41,"trait":"bgTableBorderOut"},{"v0":42,"v1":43,"trait":"bgTable"},{"v0":44,"v1":45,"trait":"bgTable"},{"v0":46,"v1":47,"trait":"bgTable"},{"v0":48,"v1":49,"trait":"bgTable"},{"v0":50,"v1":51,"trait":"bgTable"},{"v0":52,"v1":53,"trait":"bgTable"},{"v0":54,"v1":55,"trait":"bgTable"},{"v0":56,"v1":57,"trait":"bgTable"},{"v0":58,"v1":59,"trait":"bgTable"},{"v0":60,"v1":61,"trait":"bgTable"},{"v0":62,"v1":63,"trait":"bgTable"},{"v0":64,"v1":65,"trait":"bgTable"},{"v0":66,"v1":67,"trait":"bgTable"},{"v0":68,"v1":69,"trait":"bgTable"},{"v0":70,"v1":71,"trait":"bgTable"},{"v0":72,"v1":73,"trait":"bgTable"},{"v0":74,"v1":75,"trait":"bgTable"},{"v0":76,"v1":77,"trait":"bgTable"},{"v0":76,"v1":40,"curve":-90,"trait":"bgTableBorderOut"},{"v0":77,"v1":41,"curve":90,"trait":"bgTableBorderIn"},{"v0":38,"v1":76,"trait":"bgTableBorderOut"},{"v0":78,"v1":79,"trait":"bgTable"},{"v0":80,"v1":81,"trait":"bgTable"},{"v0":82,"v1":83,"trait":"bgTable"},{"v0":84,"v1":85,"trait":"bgTable"},{"v0":86,"v1":87,"trait":"bgTable"},{"v0":88,"v1":89,"trait":"bgTable"},{"v0":90,"v1":91,"trait":"bgTable"},{"v0":92,"v1":93,"trait":"bgTable"},{"v0":94,"v1":95,"trait":"bgTable"},{"v0":96,"v1":97,"trait":"bgTable"},{"v0":98,"v1":99,"trait":"bgTable"},{"v0":100,"v1":101,"trait":"bgTable"},{"v0":102,"v1":103,"trait":"bgTable"},{"v0":104,"v1":105,"trait":"bgTable"},{"v0":106,"v1":107,"trait":"bgTable"},{"v0":108,"v1":109,"trait":"bgTable"},{"v0":110,"v1":111,"trait":"bgTable"},{"v0":112,"v1":113,"trait":"bgTable"},{"v0":114,"v1":115,"trait":"bgTable"},{"v0":39,"v1":77,"trait":"bgTableBorderIn"},{"v0":116,"v1":117,"trait":"bgTable"},{"v0":118,"v1":119,"trait":"bgTable"},{"v0":120,"v1":121,"trait":"bgTable"},{"v0":122,"v1":123,"trait":"bgTable"},{"v0":124,"v1":125,"trait":"bgTable"},{"v0":126,"v1":127,"trait":"bgTable"},{"v0":128,"v1":129,"trait":"bgTable"},{"v0":130,"v1":131,"trait":"bgTable"},{"v0":132,"v1":133,"trait":"bgTable"},{"v0":134,"v1":135,"trait":"bgTable"},{"v0":136,"v1":137,"trait":"bgTable"},{"v0":138,"v1":139,"trait":"bgTable"},{"v0":140,"v1":141,"trait":"bgTable"},{"v0":142,"v1":143,"trait":"bgTable"},{"v0":144,"v1":145,"trait":"bgTable"},{"v0":146,"v1":147,"trait":"bgTable"},{"v0":148,"v1":149,"trait":"bgTable"},{"v0":150,"v1":151,"trait":"bgTable"},{"v0":152,"v1":153,"trait":"bgTable"},{"v0":155,"v1":156,"trait":"tableWall"},{"v0":157,"v1":158,"trait":"tableWall"},{"v0":159,"v1":160,"trait":"tableWall"},{"v0":161,"v1":162,"trait":"tableWall"},{"v0":163,"v1":164,"trait":"tableWall"},{"v0":165,"v1":154,"trait":"tableWall"},{"v0":154,"v1":166,"trait":"tableWallCorner"},{"v0":155,"v1":167,"trait":"tableWallCorner"},{"v0":156,"v1":168,"trait":"tableWallCorner"},{"v0":157,"v1":169,"trait":"tableWallCorner"},{"v0":158,"v1":170,"trait":"tableWallCorner"},{"v0":159,"v1":171,"trait":"tableWallCorner"},{"v0":160,"v1":172,"trait":"tableWallCorner"},{"v0":161,"v1":173,"trait":"tableWallCorner"},{"v0":162,"v1":174,"trait":"tableWallCorner"},{"v0":163,"v1":175,"trait":"tableWallCorner"},{"v0":164,"v1":176,"trait":"tableWallCorner"},{"v0":165,"v1":177,"trait":"tableWallCorner"},{"v0":166,"v1":167,"curve":-90,"trait":"tableWallGoalInner"},{"v0":166,"v1":167,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":168,"v1":169,"curve":-60,"trait":"tableWallGoalInner"},{"v0":168,"v1":169,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":170,"v1":171,"curve":-90,"trait":"tableWallGoalInner"},{"v0":170,"v1":171,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":172,"v1":173,"curve":-90,"trait":"tableWallGoalInner"},{"v0":172,"v1":173,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":174,"v1":175,"curve":-60,"trait":"tableWallGoalInner"},{"v0":174,"v1":175,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":176,"v1":177,"curve":-90,"trait":"tableWallGoalInner"},{"v0":176,"v1":177,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":178,"v1":179,"trait":"bgIndicator"},{"v0":179,"v1":180,"trait":"bgIndicator"},{"v0":180,"v1":181,"trait":"bgIndicator"},{"v0":181,"v1":178,"trait":"bgIndicator"},{"v0":182,"v1":183,"trait":"bgIndicator"},{"v0":183,"v1":184,"trait":"bgIndicator"},{"v0":184,"v1":185,"trait":"bgIndicator"},{"v0":185,"v1":182,"trait":"bgIndicator"},{"v0":186,"v1":187,"trait":"bgIndicator"},{"v0":187,"v1":188,"trait":"bgIndicator"},{"v0":188,"v1":189,"trait":"bgIndicator"},{"v0":189,"v1":186,"trait":"bgIndicator"},{"v0":190,"v1":191,"trait":"bgIndicator"},{"v0":191,"v1":192,"trait":"bgIndicator"},{"v0":192,"v1":193,"trait":"bgIndicator"},{"v0":193,"v1":190,"trait":"bgIndicator"},{"v0":194,"v1":195,"trait":"bgIndicator"},{"v0":195,"v1":196,"trait":"bgIndicator"},{"v0":196,"v1":197,"trait":"bgIndicator"},{"v0":197,"v1":194,"trait":"bgIndicator"},{"v0":198,"v1":199,"trait":"bgIndicator"},{"v0":199,"v1":200,"trait":"bgIndicator"},{"v0":200,"v1":201,"trait":"bgIndicator"},{"v0":201,"v1":198,"trait":"bgIndicator"},{"v0":202,"v1":203,"trait":"bgIndicator"},{"v0":203,"v1":204,"trait":"bgIndicator"},{"v0":204,"v1":205,"trait":"bgIndicator"},{"v0":205,"v1":202,"trait":"bgIndicator"},{"v0":206,"v1":207,"trait":"bgIndicator"},{"v0":207,"v1":208,"trait":"bgIndicator"},{"v0":208,"v1":209,"trait":"bgIndicator"},{"v0":209,"v1":206,"trait":"bgIndicator"},{"v0":210,"v1":211,"trait":"bgIndicator"},{"v0":211,"v1":212,"trait":"bgIndicator"},{"v0":212,"v1":213,"trait":"bgIndicator"},{"v0":213,"v1":210,"trait":"bgIndicator"},{"v0":214,"v1":215,"trait":"bgIndicator"},{"v0":215,"v1":216,"trait":"bgIndicator"},{"v0":216,"v1":217,"trait":"bgIndicator"},{"v0":217,"v1":214,"trait":"bgIndicator"},{"v0":218,"v1":219,"trait":"bgIndicator"},{"v0":219,"v1":220,"trait":"bgIndicator"},{"v0":220,"v1":221,"trait":"bgIndicator"},{"v0":221,"v1":218,"trait":"bgIndicator"},{"v0":222,"v1":223,"trait":"bgIndicator"},{"v0":223,"v1":224,"trait":"bgIndicator"},{"v0":224,"v1":225,"trait":"bgIndicator"},{"v0":225,"v1":222,"trait":"bgIndicator"},{"v0":226,"v1":227,"trait":"bgIndicator"},{"v0":227,"v1":228,"trait":"bgIndicator"},{"v0":228,"v1":229,"trait":"bgIndicator"},{"v0":229,"v1":226,"trait":"bgIndicator"},{"v0":230,"v1":231,"trait":"bgIndicator"},{"v0":231,"v1":232,"trait":"bgIndicator"},{"v0":232,"v1":233,"trait":"bgIndicator"},{"v0":233,"v1":230,"trait":"bgIndicator"},{"v0":234,"v1":235,"trait":"bgIndicator"},{"v0":235,"v1":236,"trait":"bgIndicator"},{"v0":236,"v1":237,"trait":"bgIndicator"},{"v0":237,"v1":234,"trait":"bgIndicator"},{"v0":238,"v1":239,"trait":"bgIndicator"},{"v0":239,"v1":240,"trait":"bgIndicator"},{"v0":240,"v1":241,"trait":"bgIndicator"},{"v0":241,"v1":238,"trait":"bgIndicator"},{"v0":242,"v1":243,"trait":"bgIndicator"},{"v0":243,"v1":244,"trait":"bgIndicator"},{"v0":244,"v1":245,"trait":"bgIndicator"},{"v0":245,"v1":242,"trait":"bgIndicator"},{"v0":246,"v1":247,"trait":"bgIndicator"},{"v0":247,"v1":248,"trait":"bgIndicator"},{"v0":248,"v1":249,"trait":"bgIndicator"},{"v0":249,"v1":246,"trait":"bgIndicator"},{"v0":211,"v1":250,"trait":"railStopRight"},{"v0":247,"v1":251,"trait":"railStopLeft"},{"v0":252,"v1":253,"trait":"railSide"}],"goals":[{"p0":[-385,-210],"p1":[385,-210],"team":"red"},{"p0":[385,-210],"p1":[385,210],"team":"blue"},{"p0":[385,210],"p1":[-385,210],"team":"blue"},{"p0":[-385,210],"p1":[-385,-210],"team":"red"},{"p0":[-374,-169],"p1":[-346,-193],"team":"red"},{"p0":[-16,-193],"p1":[16,-193],"team":"blue"},{"p0":[346,-193],"p1":[374,-169],"team":"red"},{"p0":[346,193],"p1":[374,169],"team":"blue"},{"p0":[-16,193],"p1":[16,193],"team":"red"},{"p0":[-346,193],"p1":[-374,169],"team":"blue"}],"joints":[{"d0":0,"d1":16,"bCoef":0,"color":"ffffe4","length":-1e-59,"strength":0.0000049}]}`,

  PRACTICE: `{"name":"Billiards Practice","canBeStored":true,"width":388,"height":209,"maxViewWidth":1300,"cameraWidth":485,"cameraHeight":285,"cameraFollow":"ball","spawnDistance":267,"redSpawnPoints":[[-267,0]],"blueSpawnPoints":[[-311,0]],"kickOffReset":"full","bg":{"width":388,"height":209,"type":"none","cornerRadius":24,"kickOffRadius":0,"color":"2a5e52"},"playerPhysics":{"radius":18,"bCoef":0.01,"invMass":2,"damping":0.8,"acceleration":0.1,"kickingAcceleration":0.36,"kickingDamping":0.9,"kickStrength":125},"ballPhysics":"disc0","traits":{"whiteBall":{"radius":11,"bCoef":0.92,"invMass":0.1,"damping":0.988,"color":"ffffe4","cMask":["wall","ball","red","blue","c1","c2","c3"],"cGroup":["ball","c0","kick","score"]},"redBall":{"radius":11,"bCoef":0.92,"invMass":0.1,"damping":0.988,"color":"e56e56","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c1"]},"blueBall":{"radius":11,"bCoef":0.92,"invMass":0.1,"damping":0.988,"color":"5689e5","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c2"]},"blackBall":{"radius":11,"bCoef":0.92,"invMass":0.1,"damping":0.988,"color":"181818","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c3","score"]},"tableWall":{"bCoef":0.5,"bias":-6,"color":"084e45","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallCorner":{"bCoef":0.45,"color":"084e45","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallGoalInner":{"vis":false,"bCoef":-4,"bias":-5,"cMask":["wall","ball"],"cGroup":["wall"]},"tableWallGoalInnerLaunch":{"vis":false,"bCoef":4,"bias":5,"cMask":["wall","ball"],"cGroup":["wall"]},"kickoffLine":{"vis":false,"bCoef":0.1,"color":"085849","cMask":["red","blue"],"cGroup":["redKO","blueKO"]},"bgTable":{"color":"3f261e","cMask":[],"cGroup":["wall"]},"bgTableBorderIn":{"color":"3f261e","bCoef":5,"bias":40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgTableBorderOut":{"color":"3f261e","bCoef":5,"bias":-40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgHole":{"radius":20,"color":"000000","cMask":[],"cGroup":["wall"]},"bgIndicator":{"color":"b59978","cMask":[],"cGroup":["wall"]},"playerBoundary":{"vis":false,"bCoef":0.5,"cMask":["red","blue"]},"ballBoundary":{"vis":false,"bCoef":0,"cMask":["ball","c0","c1","c2","c3"]},"railSide":{"vis":false,"bCoef":10,"bias":-5,"cMask":["c0","c1","c2","c3"]},"railStopRight":{"vis":false,"bCoef":0,"bias":-40,"cMask":["ball","c0","c1","c2","c3"]},"railStopLeft":{"vis":false,"bCoef":0,"bias":40,"cMask":["ball","c0","c1","c2","c3"]},"aimDisc":{"radius":66,"invMass":65000,"pos":[-178,0],"color":"transparent","bCoef":0,"damping":0,"cMask":["red","blue"],"cGroup":["ball"]}},"planes":[{"normal":[0,-1],"dist":-275,"trait":"playerBoundary"},{"normal":[0,1],"dist":-275,"trait":"playerBoundary"},{"normal":[1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[-1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[0,-1],"dist":-275,"trait":"ballBoundary"},{"normal":[0,1],"dist":-275,"trait":"ballBoundary"},{"normal":[1,0],"dist":-475,"trait":"ballBoundary"},{"normal":[-1,0],"dist":-475,"trait":"ballBoundary"}],"discs":[{"pos":[-178,0],"trait":"whiteBall"},{"pos":[218,0],"trait":"blackBall"},{"pos":[-178,0],"trait":"aimDisc"},{"pos":[-364,-189],"trait":"bgHole"},{"pos":[0,-204],"trait":"bgHole"},{"pos":[364,-189],"trait":"bgHole"},{"pos":[364,185],"trait":"bgHole"},{"pos":[0,200],"trait":"bgHole"},{"pos":[-364,185],"trait":"bgHole"}],"vertexes":[{"x":-178,"y":-179,"trait":"kickoffLine"},{"x":-178,"y":175,"trait":"kickoffLine"},{"x":-379,"y":-229,"trait":"bgTable"},{"x":379,"y":-229,"trait":"bgTable"},{"x":-385,"y":-227,"trait":"bgTable"},{"x":385,"y":-227,"trait":"bgTable"},{"x":-390,"y":-225,"trait":"bgTable"},{"x":390,"y":-225,"trait":"bgTable"},{"x":-393,"y":-223,"trait":"bgTable"},{"x":393,"y":-223,"trait":"bgTable"},{"x":-395,"y":-221,"trait":"bgTable"},{"x":395,"y":-221,"trait":"bgTable"},{"x":-397,"y":-219,"trait":"bgTable"},{"x":397,"y":-219,"trait":"bgTable"},{"x":-399,"y":-217,"trait":"bgTable"},{"x":399,"y":-217,"trait":"bgTable"},{"x":-401,"y":-215,"trait":"bgTable"},{"x":401,"y":-215,"trait":"bgTable"},{"x":-403,"y":-213,"trait":"bgTable"},{"x":403,"y":-213,"trait":"bgTable"},{"x":-403,"y":-211,"trait":"bgTable"},{"x":403,"y":-211,"trait":"bgTable"},{"x":-404,"y":-209,"trait":"bgTable"},{"x":404,"y":-209,"trait":"bgTable"},{"x":-404,"y":-207,"trait":"bgTable"},{"x":404,"y":-207,"trait":"bgTable"},{"x":-404,"y":-205,"trait":"bgTable"},{"x":404,"y":-205,"trait":"bgTable"},{"x":-405,"y":-203,"trait":"bgTable"},{"x":405,"y":-203,"trait":"bgTable"},{"x":-405,"y":-201,"trait":"bgTable"},{"x":405,"y":-201,"trait":"bgTable"},{"x":-405,"y":-199,"trait":"bgTable"},{"x":405,"y":-199,"trait":"bgTable"},{"x":-406,"y":-197,"trait":"bgTable"},{"x":406,"y":-197,"trait":"bgTable"},{"x":-406,"y":-195,"trait":"bgTable"},{"x":406,"y":-195,"trait":"bgTable"},{"x":-406,"y":-193,"trait":"bgTable"},{"x":406,"y":-193,"trait":"bgTable"},{"x":-379,"y":225,"trait":"bgTable"},{"x":379,"y":225,"trait":"bgTable"},{"x":-385,"y":223,"trait":"bgTable"},{"x":385,"y":223,"trait":"bgTable"},{"x":-390,"y":221,"trait":"bgTable"},{"x":390,"y":221,"trait":"bgTable"},{"x":-393,"y":219,"trait":"bgTable"},{"x":393,"y":219,"trait":"bgTable"},{"x":-395,"y":217,"trait":"bgTable"},{"x":395,"y":217,"trait":"bgTable"},{"x":-397,"y":215,"trait":"bgTable"},{"x":397,"y":215,"trait":"bgTable"},{"x":-399,"y":213,"trait":"bgTable"},{"x":399,"y":213,"trait":"bgTable"},{"x":-401,"y":211,"trait":"bgTable"},{"x":401,"y":211,"trait":"bgTable"},{"x":-403,"y":209,"trait":"bgTable"},{"x":403,"y":209,"trait":"bgTable"},{"x":-403,"y":207,"trait":"bgTable"},{"x":403,"y":207,"trait":"bgTable"},{"x":-404,"y":205,"trait":"bgTable"},{"x":404,"y":205,"trait":"bgTable"},{"x":-404,"y":203,"trait":"bgTable"},{"x":404,"y":203,"trait":"bgTable"},{"x":-404,"y":201,"trait":"bgTable"},{"x":404,"y":201,"trait":"bgTable"},{"x":-405,"y":199,"trait":"bgTable"},{"x":405,"y":199,"trait":"bgTable"},{"x":-405,"y":197,"trait":"bgTable"},{"x":405,"y":197,"trait":"bgTable"},{"x":-405,"y":195,"trait":"bgTable"},{"x":405,"y":195,"trait":"bgTable"},{"x":-406,"y":193,"trait":"bgTable"},{"x":406,"y":193,"trait":"bgTable"},{"x":-406,"y":191,"trait":"bgTable"},{"x":406,"y":191,"trait":"bgTable"},{"x":-406,"y":189,"trait":"bgTable"},{"x":406,"y":189,"trait":"bgTable"},{"x":-404,"y":-193,"trait":"bgTable"},{"x":-404,"y":189,"trait":"bgTable"},{"x":-402,"y":-193,"trait":"bgTable"},{"x":-402,"y":189,"trait":"bgTable"},{"x":-400,"y":-193,"trait":"bgTable"},{"x":-400,"y":189,"trait":"bgTable"},{"x":-398,"y":-193,"trait":"bgTable"},{"x":-398,"y":189,"trait":"bgTable"},{"x":-396,"y":-193,"trait":"bgTable"},{"x":-396,"y":189,"trait":"bgTable"},{"x":-394,"y":-193,"trait":"bgTable"},{"x":-394,"y":189,"trait":"bgTable"},{"x":-392,"y":-193,"trait":"bgTable"},{"x":-392,"y":189,"trait":"bgTable"},{"x":-390,"y":-193,"trait":"bgTable"},{"x":-390,"y":189,"trait":"bgTable"},{"x":-388,"y":-193,"trait":"bgTable"},{"x":-388,"y":189,"trait":"bgTable"},{"x":-386,"y":-193,"trait":"bgTable"},{"x":-386,"y":189,"trait":"bgTable"},{"x":-384,"y":-193,"trait":"bgTable"},{"x":-384,"y":189,"trait":"bgTable"},{"x":-382,"y":-193,"trait":"bgTable"},{"x":-382,"y":189,"trait":"bgTable"},{"x":-380,"y":-193,"trait":"bgTable"},{"x":-380,"y":189,"trait":"bgTable"},{"x":-379,"y":-193,"trait":"bgTable"},{"x":-379,"y":189,"trait":"bgTable"},{"x":-378,"y":-193,"trait":"bgTable"},{"x":-378,"y":189,"trait":"bgTable"},{"x":-376,"y":-193,"trait":"bgTable"},{"x":-376,"y":189,"trait":"bgTable"},{"x":-374,"y":-193,"trait":"bgTable"},{"x":-374,"y":189,"trait":"bgTable"},{"x":-372,"y":-193,"trait":"bgTable"},{"x":-372,"y":189,"trait":"bgTable"},{"x":-370,"y":-193,"trait":"bgTable"},{"x":-370,"y":189,"trait":"bgTable"},{"x":404,"y":-193,"trait":"bgTable"},{"x":404,"y":189,"trait":"bgTable"},{"x":402,"y":-193,"trait":"bgTable"},{"x":402,"y":189,"trait":"bgTable"},{"x":400,"y":-193,"trait":"bgTable"},{"x":400,"y":189,"trait":"bgTable"},{"x":398,"y":-193,"trait":"bgTable"},{"x":398,"y":189,"trait":"bgTable"},{"x":396,"y":-193,"trait":"bgTable"},{"x":396,"y":189,"trait":"bgTable"},{"x":394,"y":-193,"trait":"bgTable"},{"x":394,"y":189,"trait":"bgTable"},{"x":392,"y":-193,"trait":"bgTable"},{"x":392,"y":189,"trait":"bgTable"},{"x":390,"y":-193,"trait":"bgTable"},{"x":390,"y":189,"trait":"bgTable"},{"x":388,"y":-193,"trait":"bgTable"},{"x":388,"y":189,"trait":"bgTable"},{"x":386,"y":-193,"trait":"bgTable"},{"x":386,"y":189,"trait":"bgTable"},{"x":384,"y":-193,"trait":"bgTable"},{"x":384,"y":189,"trait":"bgTable"},{"x":382,"y":-193,"trait":"bgTable"},{"x":382,"y":189,"trait":"bgTable"},{"x":380,"y":-193,"trait":"bgTable"},{"x":380,"y":189,"trait":"bgTable"},{"x":379,"y":-193,"trait":"bgTable"},{"x":379,"y":189,"trait":"bgTable"},{"x":378,"y":-193,"trait":"bgTable"},{"x":378,"y":189,"trait":"bgTable"},{"x":376,"y":-193,"trait":"bgTable"},{"x":376,"y":189,"trait":"bgTable"},{"x":374,"y":-193,"trait":"bgTable"},{"x":374,"y":189,"trait":"bgTable"},{"x":372,"y":-193,"trait":"bgTable"},{"x":372,"y":189,"trait":"bgTable"},{"x":370,"y":-193,"trait":"bgTable"},{"x":370,"y":189,"trait":"bgTable"},{"x":-356,"y":-153,"trait":"tableWall"},{"x":-328,"y":-179,"trait":"tableWall"},{"x":-24,"y":-179,"trait":"tableWall"},{"x":24,"y":-179,"trait":"tableWall"},{"x":328,"y":-179,"trait":"tableWall"},{"x":356,"y":-153,"trait":"tableWall"},{"x":356,"y":149,"trait":"tableWall"},{"x":328,"y":175,"trait":"tableWall"},{"x":24,"y":175,"trait":"tableWall"},{"x":-24,"y":175,"trait":"tableWall"},{"x":-328,"y":175,"trait":"tableWall"},{"x":-356,"y":149,"trait":"tableWall"},{"x":-376,"y":-174,"trait":"tableWallCorner"},{"x":-346,"y":-196,"trait":"tableWallCorner"},{"x":-16,"y":-196,"trait":"tableWallCorner"},{"x":16,"y":-196,"trait":"tableWallCorner"},{"x":346,"y":-196,"trait":"tableWallCorner"},{"x":376,"y":-174,"trait":"tableWallCorner"},{"x":376,"y":170,"trait":"tableWallCorner"},{"x":346,"y":192,"trait":"tableWallCorner"},{"x":16,"y":192,"trait":"tableWallCorner"},{"x":-16,"y":192,"trait":"tableWallCorner"},{"x":-346,"y":192,"trait":"tableWallCorner"},{"x":-376,"y":170,"trait":"tableWallCorner"},{"x":-180,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-213,"trait":"bgIndicator"},{"x":-176,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-209,"trait":"bgIndicator"},{"x":-269,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-213,"trait":"bgIndicator"},{"x":-265,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-209,"trait":"bgIndicator"},{"x":-90,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-213,"trait":"bgIndicator"},{"x":-86,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-209,"trait":"bgIndicator"},{"x":180,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-213,"trait":"bgIndicator"},{"x":176,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-209,"trait":"bgIndicator"},{"x":90,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-213,"trait":"bgIndicator"},{"x":86,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-209,"trait":"bgIndicator"},{"x":269,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-213,"trait":"bgIndicator"},{"x":265,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-209,"trait":"bgIndicator"},{"x":385,"y":-2,"trait":"bgIndicator"},{"x":387,"y":0,"trait":"bgIndicator"},{"x":389,"y":-2,"trait":"bgIndicator"},{"x":387,"y":-4,"trait":"bgIndicator"},{"x":385,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-92,"trait":"bgIndicator"},{"x":389,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-88,"trait":"bgIndicator"},{"x":385,"y":86,"trait":"bgIndicator"},{"x":387,"y":88,"trait":"bgIndicator"},{"x":389,"y":86,"trait":"bgIndicator"},{"x":387,"y":84,"trait":"bgIndicator"},{"x":-180,"y":207,"trait":"bgIndicator"},{"x":-178,"y":209,"trait":"bgIndicator"},{"x":-176,"y":207,"trait":"bgIndicator"},{"x":-178,"y":205,"trait":"bgIndicator"},{"x":-269,"y":207,"trait":"bgIndicator"},{"x":-267,"y":209,"trait":"bgIndicator"},{"x":-265,"y":207,"trait":"bgIndicator"},{"x":-267,"y":205,"trait":"bgIndicator"},{"x":-90,"y":207,"trait":"bgIndicator"},{"x":-88,"y":209,"trait":"bgIndicator"},{"x":-86,"y":207,"trait":"bgIndicator"},{"x":-88,"y":205,"trait":"bgIndicator"},{"x":180,"y":207,"trait":"bgIndicator"},{"x":178,"y":209,"trait":"bgIndicator"},{"x":176,"y":207,"trait":"bgIndicator"},{"x":178,"y":205,"trait":"bgIndicator"},{"x":90,"y":207,"trait":"bgIndicator"},{"x":88,"y":209,"trait":"bgIndicator"},{"x":86,"y":207,"trait":"bgIndicator"},{"x":88,"y":205,"trait":"bgIndicator"},{"x":269,"y":207,"trait":"bgIndicator"},{"x":267,"y":209,"trait":"bgIndicator"},{"x":265,"y":207,"trait":"bgIndicator"},{"x":267,"y":205,"trait":"bgIndicator"},{"x":-385,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":0,"trait":"bgIndicator"},{"x":-389,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":-4,"trait":"bgIndicator"},{"x":-385,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-92,"trait":"bgIndicator"},{"x":-389,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-88,"trait":"bgIndicator"},{"x":-385,"y":86,"trait":"bgIndicator"},{"x":-387,"y":88,"trait":"bgIndicator"},{"x":-389,"y":86,"trait":"bgIndicator"},{"x":-387,"y":84,"trait":"bgIndicator"},{"x":475,"y":88,"trait":"railStopRight"},{"x":-475,"y":88,"trait":"railStopLeft"},{"x":-20,"y":-229,"trait":"railSide"},{"x":5,"y":-275,"trait":"railSide"}],"segments":[{"v0":0,"v1":1,"trait":"kickoffLine"},{"v0":2,"v1":3,"trait":"bgTableBorderIn"},{"v0":4,"v1":5,"trait":"bgTable"},{"v0":6,"v1":7,"trait":"bgTable"},{"v0":8,"v1":9,"trait":"bgTable"},{"v0":10,"v1":11,"trait":"bgTable"},{"v0":12,"v1":13,"trait":"bgTable"},{"v0":14,"v1":15,"trait":"bgTable"},{"v0":16,"v1":17,"trait":"bgTable"},{"v0":18,"v1":19,"trait":"bgTable"},{"v0":20,"v1":21,"trait":"bgTable"},{"v0":22,"v1":23,"trait":"bgTable"},{"v0":24,"v1":25,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":30,"v1":31,"trait":"bgTable"},{"v0":32,"v1":33,"trait":"bgTable"},{"v0":34,"v1":35,"trait":"bgTable"},{"v0":36,"v1":37,"trait":"bgTable"},{"v0":38,"v1":39,"trait":"bgTable"},{"v0":38,"v1":2,"curve":90,"trait":"bgTableBorderIn"},{"v0":39,"v1":3,"curve":-90,"trait":"bgTableBorderOut"},{"v0":40,"v1":41,"trait":"bgTableBorderOut"},{"v0":42,"v1":43,"trait":"bgTable"},{"v0":44,"v1":45,"trait":"bgTable"},{"v0":46,"v1":47,"trait":"bgTable"},{"v0":48,"v1":49,"trait":"bgTable"},{"v0":50,"v1":51,"trait":"bgTable"},{"v0":52,"v1":53,"trait":"bgTable"},{"v0":54,"v1":55,"trait":"bgTable"},{"v0":56,"v1":57,"trait":"bgTable"},{"v0":58,"v1":59,"trait":"bgTable"},{"v0":60,"v1":61,"trait":"bgTable"},{"v0":62,"v1":63,"trait":"bgTable"},{"v0":64,"v1":65,"trait":"bgTable"},{"v0":66,"v1":67,"trait":"bgTable"},{"v0":68,"v1":69,"trait":"bgTable"},{"v0":70,"v1":71,"trait":"bgTable"},{"v0":72,"v1":73,"trait":"bgTable"},{"v0":74,"v1":75,"trait":"bgTable"},{"v0":76,"v1":77,"trait":"bgTable"},{"v0":76,"v1":40,"curve":-90,"trait":"bgTableBorderOut"},{"v0":77,"v1":41,"curve":90,"trait":"bgTableBorderIn"},{"v0":38,"v1":76,"trait":"bgTableBorderOut"},{"v0":78,"v1":79,"trait":"bgTable"},{"v0":80,"v1":81,"trait":"bgTable"},{"v0":82,"v1":83,"trait":"bgTable"},{"v0":84,"v1":85,"trait":"bgTable"},{"v0":86,"v1":87,"trait":"bgTable"},{"v0":88,"v1":89,"trait":"bgTable"},{"v0":90,"v1":91,"trait":"bgTable"},{"v0":92,"v1":93,"trait":"bgTable"},{"v0":94,"v1":95,"trait":"bgTable"},{"v0":96,"v1":97,"trait":"bgTable"},{"v0":98,"v1":99,"trait":"bgTable"},{"v0":100,"v1":101,"trait":"bgTable"},{"v0":102,"v1":103,"trait":"bgTable"},{"v0":104,"v1":105,"trait":"bgTable"},{"v0":106,"v1":107,"trait":"bgTable"},{"v0":108,"v1":109,"trait":"bgTable"},{"v0":110,"v1":111,"trait":"bgTable"},{"v0":112,"v1":113,"trait":"bgTable"},{"v0":114,"v1":115,"trait":"bgTable"},{"v0":39,"v1":77,"trait":"bgTableBorderIn"},{"v0":116,"v1":117,"trait":"bgTable"},{"v0":118,"v1":119,"trait":"bgTable"},{"v0":120,"v1":121,"trait":"bgTable"},{"v0":122,"v1":123,"trait":"bgTable"},{"v0":124,"v1":125,"trait":"bgTable"},{"v0":126,"v1":127,"trait":"bgTable"},{"v0":128,"v1":129,"trait":"bgTable"},{"v0":130,"v1":131,"trait":"bgTable"},{"v0":132,"v1":133,"trait":"bgTable"},{"v0":134,"v1":135,"trait":"bgTable"},{"v0":136,"v1":137,"trait":"bgTable"},{"v0":138,"v1":139,"trait":"bgTable"},{"v0":140,"v1":141,"trait":"bgTable"},{"v0":142,"v1":143,"trait":"bgTable"},{"v0":144,"v1":145,"trait":"bgTable"},{"v0":146,"v1":147,"trait":"bgTable"},{"v0":148,"v1":149,"trait":"bgTable"},{"v0":150,"v1":151,"trait":"bgTable"},{"v0":152,"v1":153,"trait":"bgTable"},{"v0":155,"v1":156,"trait":"tableWall"},{"v0":157,"v1":158,"trait":"tableWall"},{"v0":159,"v1":160,"trait":"tableWall"},{"v0":161,"v1":162,"trait":"tableWall"},{"v0":163,"v1":164,"trait":"tableWall"},{"v0":165,"v1":154,"trait":"tableWall"},{"v0":154,"v1":166,"trait":"tableWallCorner"},{"v0":155,"v1":167,"trait":"tableWallCorner"},{"v0":156,"v1":168,"trait":"tableWallCorner"},{"v0":157,"v1":169,"trait":"tableWallCorner"},{"v0":158,"v1":170,"trait":"tableWallCorner"},{"v0":159,"v1":171,"trait":"tableWallCorner"},{"v0":160,"v1":172,"trait":"tableWallCorner"},{"v0":161,"v1":173,"trait":"tableWallCorner"},{"v0":162,"v1":174,"trait":"tableWallCorner"},{"v0":163,"v1":175,"trait":"tableWallCorner"},{"v0":164,"v1":176,"trait":"tableWallCorner"},{"v0":165,"v1":177,"trait":"tableWallCorner"},{"v0":166,"v1":167,"curve":-90,"trait":"tableWallGoalInner"},{"v0":166,"v1":167,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":168,"v1":169,"curve":-60,"trait":"tableWallGoalInner"},{"v0":168,"v1":169,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":170,"v1":171,"curve":-90,"trait":"tableWallGoalInner"},{"v0":170,"v1":171,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":172,"v1":173,"curve":-90,"trait":"tableWallGoalInner"},{"v0":172,"v1":173,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":174,"v1":175,"curve":-60,"trait":"tableWallGoalInner"},{"v0":174,"v1":175,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":176,"v1":177,"curve":-90,"trait":"tableWallGoalInner"},{"v0":176,"v1":177,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":178,"v1":179,"trait":"bgIndicator"},{"v0":179,"v1":180,"trait":"bgIndicator"},{"v0":180,"v1":181,"trait":"bgIndicator"},{"v0":181,"v1":178,"trait":"bgIndicator"},{"v0":182,"v1":183,"trait":"bgIndicator"},{"v0":183,"v1":184,"trait":"bgIndicator"},{"v0":184,"v1":185,"trait":"bgIndicator"},{"v0":185,"v1":182,"trait":"bgIndicator"},{"v0":186,"v1":187,"trait":"bgIndicator"},{"v0":187,"v1":188,"trait":"bgIndicator"},{"v0":188,"v1":189,"trait":"bgIndicator"},{"v0":189,"v1":186,"trait":"bgIndicator"},{"v0":190,"v1":191,"trait":"bgIndicator"},{"v0":191,"v1":192,"trait":"bgIndicator"},{"v0":192,"v1":193,"trait":"bgIndicator"},{"v0":193,"v1":190,"trait":"bgIndicator"},{"v0":194,"v1":195,"trait":"bgIndicator"},{"v0":195,"v1":196,"trait":"bgIndicator"},{"v0":196,"v1":197,"trait":"bgIndicator"},{"v0":197,"v1":194,"trait":"bgIndicator"},{"v0":198,"v1":199,"trait":"bgIndicator"},{"v0":199,"v1":200,"trait":"bgIndicator"},{"v0":200,"v1":201,"trait":"bgIndicator"},{"v0":201,"v1":198,"trait":"bgIndicator"},{"v0":202,"v1":203,"trait":"bgIndicator"},{"v0":203,"v1":204,"trait":"bgIndicator"},{"v0":204,"v1":205,"trait":"bgIndicator"},{"v0":205,"v1":202,"trait":"bgIndicator"},{"v0":206,"v1":207,"trait":"bgIndicator"},{"v0":207,"v1":208,"trait":"bgIndicator"},{"v0":208,"v1":209,"trait":"bgIndicator"},{"v0":209,"v1":206,"trait":"bgIndicator"},{"v0":210,"v1":211,"trait":"bgIndicator"},{"v0":211,"v1":212,"trait":"bgIndicator"},{"v0":212,"v1":213,"trait":"bgIndicator"},{"v0":213,"v1":210,"trait":"bgIndicator"},{"v0":214,"v1":215,"trait":"bgIndicator"},{"v0":215,"v1":216,"trait":"bgIndicator"},{"v0":216,"v1":217,"trait":"bgIndicator"},{"v0":217,"v1":214,"trait":"bgIndicator"},{"v0":218,"v1":219,"trait":"bgIndicator"},{"v0":219,"v1":220,"trait":"bgIndicator"},{"v0":220,"v1":221,"trait":"bgIndicator"},{"v0":221,"v1":218,"trait":"bgIndicator"},{"v0":222,"v1":223,"trait":"bgIndicator"},{"v0":223,"v1":224,"trait":"bgIndicator"},{"v0":224,"v1":225,"trait":"bgIndicator"},{"v0":225,"v1":222,"trait":"bgIndicator"},{"v0":226,"v1":227,"trait":"bgIndicator"},{"v0":227,"v1":228,"trait":"bgIndicator"},{"v0":228,"v1":229,"trait":"bgIndicator"},{"v0":229,"v1":226,"trait":"bgIndicator"},{"v0":230,"v1":231,"trait":"bgIndicator"},{"v0":231,"v1":232,"trait":"bgIndicator"},{"v0":232,"v1":233,"trait":"bgIndicator"},{"v0":233,"v1":230,"trait":"bgIndicator"},{"v0":234,"v1":235,"trait":"bgIndicator"},{"v0":235,"v1":236,"trait":"bgIndicator"},{"v0":236,"v1":237,"trait":"bgIndicator"},{"v0":237,"v1":234,"trait":"bgIndicator"},{"v0":238,"v1":239,"trait":"bgIndicator"},{"v0":239,"v1":240,"trait":"bgIndicator"},{"v0":240,"v1":241,"trait":"bgIndicator"},{"v0":241,"v1":238,"trait":"bgIndicator"},{"v0":242,"v1":243,"trait":"bgIndicator"},{"v0":243,"v1":244,"trait":"bgIndicator"},{"v0":244,"v1":245,"trait":"bgIndicator"},{"v0":245,"v1":242,"trait":"bgIndicator"},{"v0":246,"v1":247,"trait":"bgIndicator"},{"v0":247,"v1":248,"trait":"bgIndicator"},{"v0":248,"v1":249,"trait":"bgIndicator"},{"v0":249,"v1":246,"trait":"bgIndicator"},{"v0":211,"v1":250,"trait":"railStopRight"},{"v0":247,"v1":251,"trait":"railStopLeft"},{"v0":252,"v1":253,"trait":"railSide"}],"goals":[{"p0":[-385,-210],"p1":[385,-210],"team":"red"},{"p0":[385,-210],"p1":[385,210],"team":"blue"},{"p0":[385,210],"p1":[-385,210],"team":"blue"},{"p0":[-385,210],"p1":[-385,-210],"team":"red"},{"p0":[-374,-169],"p1":[-346,-193],"team":"red"},{"p0":[-16,-193],"p1":[16,-193],"team":"blue"},{"p0":[346,-193],"p1":[374,-169],"team":"red"},{"p0":[346,193],"p1":[374,169],"team":"blue"},{"p0":[-16,193],"p1":[16,193],"team":"red"},{"p0":[-346,193],"p1":[-374,169],"team":"blue"}],"joints":[{"d0":0,"d1":2,"bCoef":0,"color":"ffffe4","length":-1e-59,"strength":0.0000049}]}`,

  TOURNAMENT: `{"name":"Billiards Tournament","canBeStored":false,"width":388,"height":209,"maxViewWidth":1300,"cameraWidth":485,"cameraHeight":285,"cameraFollow":"ball","spawnDistance":267,"redSpawnPoints":[[-267,-89]],"blueSpawnPoints":[[-267,89]],"kickOffReset":"partial","bg":{"width":388,"height":209,"type":"none","cornerRadius":24,"kickOffRadius":0,"color":"066bb5"},"playerPhysics":{"radius":18,"bCoef":0.15,"invMass":20,"damping":0.8,"acceleration":0.1,"kickingAcceleration":0.36,"kickingDamping":0.9,"kickStrength":1250},"ballPhysics":"disc0","traits":{"whiteBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"ffffe4","cMask":["wall","ball","red","blue","c1","c2","c3"],"cGroup":["ball","c0","kick","score"]},"redBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"e56e56","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c1"]},"blueBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"5689e5","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c2"]},"blackBall":{"radius":11,"bCoef":0.92,"invMass":0.01,"damping":0.988,"color":"181818","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c3","score"]},"tableWall":{"bCoef":0.52,"bias":-6,"color":"145e9e","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallCorner":{"bCoef":0.45,"color":"145e9e","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallGoalInner":{"vis":false,"bCoef":-4,"bias":-5,"cMask":["wall","ball"],"cGroup":["wall"]},"tableWallGoalInnerLaunch":{"vis":false,"bCoef":4,"bias":5,"cMask":["wall","ball"],"cGroup":["wall"]},"kickoffLine":{"vis":false,"bCoef":0.1,"color":"145e9e","cMask":["red","blue"],"cGroup":["redKO","blueKO"]},"bgTable":{"color":"202831","cMask":[],"cGroup":["wall"]},"bgTableBorderIn":{"color":"202831","bCoef":5,"bias":40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgTableBorderOut":{"color":"202831","bCoef":5,"bias":-40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgHole":{"radius":20,"color":"000000","cMask":[],"cGroup":["wall"]},"bgIndicator":{"color":"fffff4","cMask":[],"cGroup":["wall"]},"playerBoundary":{"vis":false,"bCoef":0.5,"cMask":["red","blue"]},"ballBoundary":{"vis":false,"bCoef":0,"cMask":["ball","c0","c1","c2","c3"]},"railSide":{"vis":false,"bCoef":10,"bias":-5,"cMask":["c0","c1","c2","c3"]},"railStopRight":{"vis":false,"bCoef":0,"bias":-40,"cMask":["ball","c0","c1","c2","c3"]},"railStopLeft":{"vis":false,"bCoef":0,"bias":40,"cMask":["ball","c0","c1","c2","c3"]},"aimDisc":{"radius":66,"invMass":65000,"pos":[-178,0],"color":"transparent","bCoef":0,"damping":0,"cMask":["red","blue"],"cGroup":["ball"]}},"planes":[{"normal":[0,-1],"dist":-275,"trait":"playerBoundary"},{"normal":[0,1],"dist":-275,"trait":"playerBoundary"},{"normal":[1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[-1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[0,-1],"dist":-275,"trait":"ballBoundary"},{"normal":[0,1],"dist":-275,"trait":"ballBoundary"},{"normal":[1,0],"dist":-475,"trait":"ballBoundary"},{"normal":[-1,0],"dist":-475,"trait":"ballBoundary"}],"discs":[{"pos":[-178,0],"trait":"whiteBall"},{"pos":[178,0],"trait":"redBall"},{"pos":[198,-12],"trait":"blueBall"},{"pos":[198,12],"trait":"redBall"},{"pos":[218,-24],"trait":"redBall"},{"pos":[218,0],"trait":"blackBall"},{"pos":[218,24],"trait":"blueBall"},{"pos":[238,-36],"trait":"blueBall"},{"pos":[238,-12],"trait":"redBall"},{"pos":[238,12],"trait":"blueBall"},{"pos":[238,36],"trait":"redBall"},{"pos":[258,-48],"trait":"redBall"},{"pos":[258,-24],"trait":"blueBall"},{"pos":[258,0],"trait":"blueBall"},{"pos":[258,24],"trait":"redBall"},{"pos":[258,48],"trait":"blueBall"},{"pos":[-364,-189],"trait":"bgHole"},{"pos":[0,-204],"trait":"bgHole"},{"pos":[364,-189],"trait":"bgHole"},{"pos":[364,185],"trait":"bgHole"},{"pos":[0,200],"trait":"bgHole"},{"pos":[-364,185],"trait":"bgHole"}],"vertexes":[{"x":-178,"y":-179,"trait":"kickoffLine"},{"x":-178,"y":175,"trait":"kickoffLine"},{"x":-379,"y":-229,"trait":"bgTable"},{"x":379,"y":-229,"trait":"bgTable"},{"x":-385,"y":-227,"trait":"bgTable"},{"x":385,"y":-227,"trait":"bgTable"},{"x":-390,"y":-225,"trait":"bgTable"},{"x":390,"y":-225,"trait":"bgTable"},{"x":-393,"y":-223,"trait":"bgTable"},{"x":393,"y":-223,"trait":"bgTable"},{"x":-395,"y":-221,"trait":"bgTable"},{"x":395,"y":-221,"trait":"bgTable"},{"x":-397,"y":-219,"trait":"bgTable"},{"x":397,"y":-219,"trait":"bgTable"},{"x":-399,"y":-217,"trait":"bgTable"},{"x":399,"y":-217,"trait":"bgTable"},{"x":-401,"y":-215,"trait":"bgTable"},{"x":401,"y":-215,"trait":"bgTable"},{"x":-403,"y":-213,"trait":"bgTable"},{"x":403,"y":-213,"trait":"bgTable"},{"x":-403,"y":-211,"trait":"bgTable"},{"x":403,"y":-211,"trait":"bgTable"},{"x":-404,"y":-209,"trait":"bgTable"},{"x":404,"y":-209,"trait":"bgTable"},{"x":-404,"y":-207,"trait":"bgTable"},{"x":404,"y":-207,"trait":"bgTable"},{"x":-404,"y":-205,"trait":"bgTable"},{"x":404,"y":-205,"trait":"bgTable"},{"x":-405,"y":-203,"trait":"bgTable"},{"x":405,"y":-203,"trait":"bgTable"},{"x":-405,"y":-201,"trait":"bgTable"},{"x":405,"y":-201,"trait":"bgTable"},{"x":-405,"y":-199,"trait":"bgTable"},{"x":405,"y":-199,"trait":"bgTable"},{"x":-406,"y":-197,"trait":"bgTable"},{"x":406,"y":-197,"trait":"bgTable"},{"x":-406,"y":-195,"trait":"bgTable"},{"x":406,"y":-195,"trait":"bgTable"},{"x":-406,"y":-193,"trait":"bgTable"},{"x":406,"y":-193,"trait":"bgTable"},{"x":-379,"y":225,"trait":"bgTable"},{"x":379,"y":225,"trait":"bgTable"},{"x":-385,"y":223,"trait":"bgTable"},{"x":385,"y":223,"trait":"bgTable"},{"x":-390,"y":221,"trait":"bgTable"},{"x":390,"y":221,"trait":"bgTable"},{"x":-393,"y":219,"trait":"bgTable"},{"x":393,"y":219,"trait":"bgTable"},{"x":-395,"y":217,"trait":"bgTable"},{"x":395,"y":217,"trait":"bgTable"},{"x":-397,"y":215,"trait":"bgTable"},{"x":397,"y":215,"trait":"bgTable"},{"x":-399,"y":213,"trait":"bgTable"},{"x":399,"y":213,"trait":"bgTable"},{"x":-401,"y":211,"trait":"bgTable"},{"x":401,"y":211,"trait":"bgTable"},{"x":-403,"y":209,"trait":"bgTable"},{"x":403,"y":209,"trait":"bgTable"},{"x":-403,"y":207,"trait":"bgTable"},{"x":403,"y":207,"trait":"bgTable"},{"x":-404,"y":205,"trait":"bgTable"},{"x":404,"y":205,"trait":"bgTable"},{"x":-404,"y":203,"trait":"bgTable"},{"x":404,"y":203,"trait":"bgTable"},{"x":-404,"y":201,"trait":"bgTable"},{"x":404,"y":201,"trait":"bgTable"},{"x":-405,"y":199,"trait":"bgTable"},{"x":405,"y":199,"trait":"bgTable"},{"x":-405,"y":197,"trait":"bgTable"},{"x":405,"y":197,"trait":"bgTable"},{"x":-405,"y":195,"trait":"bgTable"},{"x":405,"y":195,"trait":"bgTable"},{"x":-406,"y":193,"trait":"bgTable"},{"x":406,"y":193,"trait":"bgTable"},{"x":-406,"y":191,"trait":"bgTable"},{"x":406,"y":191,"trait":"bgTable"},{"x":-406,"y":189,"trait":"bgTable"},{"x":406,"y":189,"trait":"bgTable"},{"x":-404,"y":-193,"trait":"bgTable"},{"x":-404,"y":189,"trait":"bgTable"},{"x":-402,"y":-193,"trait":"bgTable"},{"x":-402,"y":189,"trait":"bgTable"},{"x":-400,"y":-193,"trait":"bgTable"},{"x":-400,"y":189,"trait":"bgTable"},{"x":-398,"y":-193,"trait":"bgTable"},{"x":-398,"y":189,"trait":"bgTable"},{"x":-396,"y":-193,"trait":"bgTable"},{"x":-396,"y":189,"trait":"bgTable"},{"x":-394,"y":-193,"trait":"bgTable"},{"x":-394,"y":189,"trait":"bgTable"},{"x":-392,"y":-193,"trait":"bgTable"},{"x":-392,"y":189,"trait":"bgTable"},{"x":-390,"y":-193,"trait":"bgTable"},{"x":-390,"y":189,"trait":"bgTable"},{"x":-388,"y":-193,"trait":"bgTable"},{"x":-388,"y":189,"trait":"bgTable"},{"x":-386,"y":-193,"trait":"bgTable"},{"x":-386,"y":189,"trait":"bgTable"},{"x":-384,"y":-193,"trait":"bgTable"},{"x":-384,"y":189,"trait":"bgTable"},{"x":-382,"y":-193,"trait":"bgTable"},{"x":-382,"y":189,"trait":"bgTable"},{"x":-380,"y":-193,"trait":"bgTable"},{"x":-380,"y":189,"trait":"bgTable"},{"x":-379,"y":-193,"trait":"bgTable"},{"x":-379,"y":189,"trait":"bgTable"},{"x":-378,"y":-193,"trait":"bgTable"},{"x":-378,"y":189,"trait":"bgTable"},{"x":-376,"y":-193,"trait":"bgTable"},{"x":-376,"y":189,"trait":"bgTable"},{"x":-374,"y":-193,"trait":"bgTable"},{"x":-374,"y":189,"trait":"bgTable"},{"x":-372,"y":-193,"trait":"bgTable"},{"x":-372,"y":189,"trait":"bgTable"},{"x":-370,"y":-193,"trait":"bgTable"},{"x":-370,"y":189,"trait":"bgTable"},{"x":404,"y":-193,"trait":"bgTable"},{"x":404,"y":189,"trait":"bgTable"},{"x":402,"y":-193,"trait":"bgTable"},{"x":402,"y":189,"trait":"bgTable"},{"x":400,"y":-193,"trait":"bgTable"},{"x":400,"y":189,"trait":"bgTable"},{"x":398,"y":-193,"trait":"bgTable"},{"x":398,"y":189,"trait":"bgTable"},{"x":396,"y":-193,"trait":"bgTable"},{"x":396,"y":189,"trait":"bgTable"},{"x":394,"y":-193,"trait":"bgTable"},{"x":394,"y":189,"trait":"bgTable"},{"x":392,"y":-193,"trait":"bgTable"},{"x":392,"y":189,"trait":"bgTable"},{"x":390,"y":-193,"trait":"bgTable"},{"x":390,"y":189,"trait":"bgTable"},{"x":388,"y":-193,"trait":"bgTable"},{"x":388,"y":189,"trait":"bgTable"},{"x":386,"y":-193,"trait":"bgTable"},{"x":386,"y":189,"trait":"bgTable"},{"x":384,"y":-193,"trait":"bgTable"},{"x":384,"y":189,"trait":"bgTable"},{"x":382,"y":-193,"trait":"bgTable"},{"x":382,"y":189,"trait":"bgTable"},{"x":380,"y":-193,"trait":"bgTable"},{"x":380,"y":189,"trait":"bgTable"},{"x":379,"y":-193,"trait":"bgTable"},{"x":379,"y":189,"trait":"bgTable"},{"x":378,"y":-193,"trait":"bgTable"},{"x":378,"y":189,"trait":"bgTable"},{"x":376,"y":-193,"trait":"bgTable"},{"x":376,"y":189,"trait":"bgTable"},{"x":374,"y":-193,"trait":"bgTable"},{"x":374,"y":189,"trait":"bgTable"},{"x":372,"y":-193,"trait":"bgTable"},{"x":372,"y":189,"trait":"bgTable"},{"x":370,"y":-193,"trait":"bgTable"},{"x":370,"y":189,"trait":"bgTable"},{"x":-356,"y":-153,"trait":"tableWall"},{"x":-328,"y":-179,"trait":"tableWall"},{"x":-24,"y":-179,"trait":"tableWall"},{"x":24,"y":-179,"trait":"tableWall"},{"x":328,"y":-179,"trait":"tableWall"},{"x":356,"y":-153,"trait":"tableWall"},{"x":356,"y":149,"trait":"tableWall"},{"x":328,"y":175,"trait":"tableWall"},{"x":24,"y":175,"trait":"tableWall"},{"x":-24,"y":175,"trait":"tableWall"},{"x":-328,"y":175,"trait":"tableWall"},{"x":-356,"y":149,"trait":"tableWall"},{"x":-376,"y":-174,"trait":"tableWallCorner"},{"x":-346,"y":-196,"trait":"tableWallCorner"},{"x":-16,"y":-196,"trait":"tableWallCorner"},{"x":16,"y":-196,"trait":"tableWallCorner"},{"x":346,"y":-196,"trait":"tableWallCorner"},{"x":376,"y":-174,"trait":"tableWallCorner"},{"x":376,"y":170,"trait":"tableWallCorner"},{"x":346,"y":192,"trait":"tableWallCorner"},{"x":16,"y":192,"trait":"tableWallCorner"},{"x":-16,"y":192,"trait":"tableWallCorner"},{"x":-346,"y":192,"trait":"tableWallCorner"},{"x":-376,"y":170,"trait":"tableWallCorner"},{"x":-180,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-213,"trait":"bgIndicator"},{"x":-176,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-209,"trait":"bgIndicator"},{"x":-269,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-213,"trait":"bgIndicator"},{"x":-265,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-209,"trait":"bgIndicator"},{"x":-90,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-213,"trait":"bgIndicator"},{"x":-86,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-209,"trait":"bgIndicator"},{"x":180,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-213,"trait":"bgIndicator"},{"x":176,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-209,"trait":"bgIndicator"},{"x":90,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-213,"trait":"bgIndicator"},{"x":86,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-209,"trait":"bgIndicator"},{"x":269,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-213,"trait":"bgIndicator"},{"x":265,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-209,"trait":"bgIndicator"},{"x":385,"y":-2,"trait":"bgIndicator"},{"x":387,"y":0,"trait":"bgIndicator"},{"x":389,"y":-2,"trait":"bgIndicator"},{"x":387,"y":-4,"trait":"bgIndicator"},{"x":385,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-92,"trait":"bgIndicator"},{"x":389,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-88,"trait":"bgIndicator"},{"x":385,"y":86,"trait":"bgIndicator"},{"x":387,"y":88,"trait":"bgIndicator"},{"x":389,"y":86,"trait":"bgIndicator"},{"x":387,"y":84,"trait":"bgIndicator"},{"x":-180,"y":207,"trait":"bgIndicator"},{"x":-178,"y":209,"trait":"bgIndicator"},{"x":-176,"y":207,"trait":"bgIndicator"},{"x":-178,"y":205,"trait":"bgIndicator"},{"x":-269,"y":207,"trait":"bgIndicator"},{"x":-267,"y":209,"trait":"bgIndicator"},{"x":-265,"y":207,"trait":"bgIndicator"},{"x":-267,"y":205,"trait":"bgIndicator"},{"x":-90,"y":207,"trait":"bgIndicator"},{"x":-88,"y":209,"trait":"bgIndicator"},{"x":-86,"y":207,"trait":"bgIndicator"},{"x":-88,"y":205,"trait":"bgIndicator"},{"x":180,"y":207,"trait":"bgIndicator"},{"x":178,"y":209,"trait":"bgIndicator"},{"x":176,"y":207,"trait":"bgIndicator"},{"x":178,"y":205,"trait":"bgIndicator"},{"x":90,"y":207,"trait":"bgIndicator"},{"x":88,"y":209,"trait":"bgIndicator"},{"x":86,"y":207,"trait":"bgIndicator"},{"x":88,"y":205,"trait":"bgIndicator"},{"x":269,"y":207,"trait":"bgIndicator"},{"x":267,"y":209,"trait":"bgIndicator"},{"x":265,"y":207,"trait":"bgIndicator"},{"x":267,"y":205,"trait":"bgIndicator"},{"x":-385,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":0,"trait":"bgIndicator"},{"x":-389,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":-4,"trait":"bgIndicator"},{"x":-385,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-92,"trait":"bgIndicator"},{"x":-389,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-88,"trait":"bgIndicator"},{"x":-385,"y":86,"trait":"bgIndicator"},{"x":-387,"y":88,"trait":"bgIndicator"},{"x":-389,"y":86,"trait":"bgIndicator"},{"x":-387,"y":84,"trait":"bgIndicator"},{"x":475,"y":88,"trait":"railStopRight"},{"x":-475,"y":88,"trait":"railStopLeft"},{"x":-20,"y":-229,"trait":"railSide"},{"x":5,"y":-275,"trait":"railSide"}],"segments":[{"v0":0,"v1":1,"trait":"kickoffLine"},{"v0":2,"v1":3,"trait":"bgTableBorderIn"},{"v0":4,"v1":5,"trait":"bgTable"},{"v0":6,"v1":7,"trait":"bgTable"},{"v0":8,"v1":9,"trait":"bgTable"},{"v0":10,"v1":11,"trait":"bgTable"},{"v0":12,"v1":13,"trait":"bgTable"},{"v0":14,"v1":15,"trait":"bgTable"},{"v0":16,"v1":17,"trait":"bgTable"},{"v0":18,"v1":19,"trait":"bgTable"},{"v0":20,"v1":21,"trait":"bgTable"},{"v0":22,"v1":23,"trait":"bgTable"},{"v0":24,"v1":25,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":30,"v1":31,"trait":"bgTable"},{"v0":32,"v1":33,"trait":"bgTable"},{"v0":34,"v1":35,"trait":"bgTable"},{"v0":36,"v1":37,"trait":"bgTable"},{"v0":38,"v1":39,"trait":"bgTable"},{"v0":38,"v1":2,"curve":90,"trait":"bgTableBorderIn"},{"v0":39,"v1":3,"curve":-90,"trait":"bgTableBorderOut"},{"v0":40,"v1":41,"trait":"bgTableBorderOut"},{"v0":42,"v1":43,"trait":"bgTable"},{"v0":44,"v1":45,"trait":"bgTable"},{"v0":46,"v1":47,"trait":"bgTable"},{"v0":48,"v1":49,"trait":"bgTable"},{"v0":50,"v1":51,"trait":"bgTable"},{"v0":52,"v1":53,"trait":"bgTable"},{"v0":54,"v1":55,"trait":"bgTable"},{"v0":56,"v1":57,"trait":"bgTable"},{"v0":58,"v1":59,"trait":"bgTable"},{"v0":60,"v1":61,"trait":"bgTable"},{"v0":62,"v1":63,"trait":"bgTable"},{"v0":64,"v1":65,"trait":"bgTable"},{"v0":66,"v1":67,"trait":"bgTable"},{"v0":68,"v1":69,"trait":"bgTable"},{"v0":70,"v1":71,"trait":"bgTable"},{"v0":72,"v1":73,"trait":"bgTable"},{"v0":74,"v1":75,"trait":"bgTable"},{"v0":76,"v1":77,"trait":"bgTable"},{"v0":76,"v1":40,"curve":-90,"trait":"bgTableBorderOut"},{"v0":77,"v1":41,"curve":90,"trait":"bgTableBorderIn"},{"v0":38,"v1":76,"trait":"bgTableBorderOut"},{"v0":78,"v1":79,"trait":"bgTable"},{"v0":80,"v1":81,"trait":"bgTable"},{"v0":82,"v1":83,"trait":"bgTable"},{"v0":84,"v1":85,"trait":"bgTable"},{"v0":86,"v1":87,"trait":"bgTable"},{"v0":88,"v1":89,"trait":"bgTable"},{"v0":90,"v1":91,"trait":"bgTable"},{"v0":92,"v1":93,"trait":"bgTable"},{"v0":94,"v1":95,"trait":"bgTable"},{"v0":96,"v1":97,"trait":"bgTable"},{"v0":98,"v1":99,"trait":"bgTable"},{"v0":100,"v1":101,"trait":"bgTable"},{"v0":102,"v1":103,"trait":"bgTable"},{"v0":104,"v1":105,"trait":"bgTable"},{"v0":106,"v1":107,"trait":"bgTable"},{"v0":108,"v1":109,"trait":"bgTable"},{"v0":110,"v1":111,"trait":"bgTable"},{"v0":112,"v1":113,"trait":"bgTable"},{"v0":114,"v1":115,"trait":"bgTable"},{"v0":39,"v1":77,"trait":"bgTableBorderIn"},{"v0":116,"v1":117,"trait":"bgTable"},{"v0":118,"v1":119,"trait":"bgTable"},{"v0":120,"v1":121,"trait":"bgTable"},{"v0":122,"v1":123,"trait":"bgTable"},{"v0":124,"v1":125,"trait":"bgTable"},{"v0":126,"v1":127,"trait":"bgTable"},{"v0":128,"v1":129,"trait":"bgTable"},{"v0":130,"v1":131,"trait":"bgTable"},{"v0":132,"v1":133,"trait":"bgTable"},{"v0":134,"v1":135,"trait":"bgTable"},{"v0":136,"v1":137,"trait":"bgTable"},{"v0":138,"v1":139,"trait":"bgTable"},{"v0":140,"v1":141,"trait":"bgTable"},{"v0":142,"v1":143,"trait":"bgTable"},{"v0":144,"v1":145,"trait":"bgTable"},{"v0":146,"v1":147,"trait":"bgTable"},{"v0":148,"v1":149,"trait":"bgTable"},{"v0":150,"v1":151,"trait":"bgTable"},{"v0":152,"v1":153,"trait":"bgTable"},{"v0":155,"v1":156,"trait":"tableWall"},{"v0":157,"v1":158,"trait":"tableWall"},{"v0":159,"v1":160,"trait":"tableWall"},{"v0":161,"v1":162,"trait":"tableWall"},{"v0":163,"v1":164,"trait":"tableWall"},{"v0":165,"v1":154,"trait":"tableWall"},{"v0":154,"v1":166,"trait":"tableWallCorner"},{"v0":155,"v1":167,"trait":"tableWallCorner"},{"v0":156,"v1":168,"trait":"tableWallCorner"},{"v0":157,"v1":169,"trait":"tableWallCorner"},{"v0":158,"v1":170,"trait":"tableWallCorner"},{"v0":159,"v1":171,"trait":"tableWallCorner"},{"v0":160,"v1":172,"trait":"tableWallCorner"},{"v0":161,"v1":173,"trait":"tableWallCorner"},{"v0":162,"v1":174,"trait":"tableWallCorner"},{"v0":163,"v1":175,"trait":"tableWallCorner"},{"v0":164,"v1":176,"trait":"tableWallCorner"},{"v0":165,"v1":177,"trait":"tableWallCorner"},{"v0":166,"v1":167,"curve":-90,"trait":"tableWallGoalInner"},{"v0":166,"v1":167,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":168,"v1":169,"curve":-60,"trait":"tableWallGoalInner"},{"v0":168,"v1":169,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":170,"v1":171,"curve":-90,"trait":"tableWallGoalInner"},{"v0":170,"v1":171,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":172,"v1":173,"curve":-90,"trait":"tableWallGoalInner"},{"v0":172,"v1":173,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":174,"v1":175,"curve":-60,"trait":"tableWallGoalInner"},{"v0":174,"v1":175,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":176,"v1":177,"curve":-90,"trait":"tableWallGoalInner"},{"v0":176,"v1":177,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":178,"v1":179,"trait":"bgIndicator"},{"v0":179,"v1":180,"trait":"bgIndicator"},{"v0":180,"v1":181,"trait":"bgIndicator"},{"v0":181,"v1":178,"trait":"bgIndicator"},{"v0":182,"v1":183,"trait":"bgIndicator"},{"v0":183,"v1":184,"trait":"bgIndicator"},{"v0":184,"v1":185,"trait":"bgIndicator"},{"v0":185,"v1":182,"trait":"bgIndicator"},{"v0":186,"v1":187,"trait":"bgIndicator"},{"v0":187,"v1":188,"trait":"bgIndicator"},{"v0":188,"v1":189,"trait":"bgIndicator"},{"v0":189,"v1":186,"trait":"bgIndicator"},{"v0":190,"v1":191,"trait":"bgIndicator"},{"v0":191,"v1":192,"trait":"bgIndicator"},{"v0":192,"v1":193,"trait":"bgIndicator"},{"v0":193,"v1":190,"trait":"bgIndicator"},{"v0":194,"v1":195,"trait":"bgIndicator"},{"v0":195,"v1":196,"trait":"bgIndicator"},{"v0":196,"v1":197,"trait":"bgIndicator"},{"v0":197,"v1":194,"trait":"bgIndicator"},{"v0":198,"v1":199,"trait":"bgIndicator"},{"v0":199,"v1":200,"trait":"bgIndicator"},{"v0":200,"v1":201,"trait":"bgIndicator"},{"v0":201,"v1":198,"trait":"bgIndicator"},{"v0":202,"v1":203,"trait":"bgIndicator"},{"v0":203,"v1":204,"trait":"bgIndicator"},{"v0":204,"v1":205,"trait":"bgIndicator"},{"v0":205,"v1":202,"trait":"bgIndicator"},{"v0":206,"v1":207,"trait":"bgIndicator"},{"v0":207,"v1":208,"trait":"bgIndicator"},{"v0":208,"v1":209,"trait":"bgIndicator"},{"v0":209,"v1":206,"trait":"bgIndicator"},{"v0":210,"v1":211,"trait":"bgIndicator"},{"v0":211,"v1":212,"trait":"bgIndicator"},{"v0":212,"v1":213,"trait":"bgIndicator"},{"v0":213,"v1":210,"trait":"bgIndicator"},{"v0":214,"v1":215,"trait":"bgIndicator"},{"v0":215,"v1":216,"trait":"bgIndicator"},{"v0":216,"v1":217,"trait":"bgIndicator"},{"v0":217,"v1":214,"trait":"bgIndicator"},{"v0":218,"v1":219,"trait":"bgIndicator"},{"v0":219,"v1":220,"trait":"bgIndicator"},{"v0":220,"v1":221,"trait":"bgIndicator"},{"v0":221,"v1":218,"trait":"bgIndicator"},{"v0":222,"v1":223,"trait":"bgIndicator"},{"v0":223,"v1":224,"trait":"bgIndicator"},{"v0":224,"v1":225,"trait":"bgIndicator"},{"v0":225,"v1":222,"trait":"bgIndicator"},{"v0":226,"v1":227,"trait":"bgIndicator"},{"v0":227,"v1":228,"trait":"bgIndicator"},{"v0":228,"v1":229,"trait":"bgIndicator"},{"v0":229,"v1":226,"trait":"bgIndicator"},{"v0":230,"v1":231,"trait":"bgIndicator"},{"v0":231,"v1":232,"trait":"bgIndicator"},{"v0":232,"v1":233,"trait":"bgIndicator"},{"v0":233,"v1":230,"trait":"bgIndicator"},{"v0":234,"v1":235,"trait":"bgIndicator"},{"v0":235,"v1":236,"trait":"bgIndicator"},{"v0":236,"v1":237,"trait":"bgIndicator"},{"v0":237,"v1":234,"trait":"bgIndicator"},{"v0":238,"v1":239,"trait":"bgIndicator"},{"v0":239,"v1":240,"trait":"bgIndicator"},{"v0":240,"v1":241,"trait":"bgIndicator"},{"v0":241,"v1":238,"trait":"bgIndicator"},{"v0":242,"v1":243,"trait":"bgIndicator"},{"v0":243,"v1":244,"trait":"bgIndicator"},{"v0":244,"v1":245,"trait":"bgIndicator"},{"v0":245,"v1":242,"trait":"bgIndicator"},{"v0":246,"v1":247,"trait":"bgIndicator"},{"v0":247,"v1":248,"trait":"bgIndicator"},{"v0":248,"v1":249,"trait":"bgIndicator"},{"v0":249,"v1":246,"trait":"bgIndicator"},{"v0":211,"v1":250,"trait":"railStopRight"},{"v0":247,"v1":251,"trait":"railStopLeft"},{"v0":252,"v1":253,"trait":"railSide"}],"goals":[{"p0":[-385,-210],"p1":[385,-210],"team":"red"},{"p0":[385,-210],"p1":[385,210],"team":"blue"},{"p0":[385,210],"p1":[-385,210],"team":"blue"},{"p0":[-385,210],"p1":[-385,-210],"team":"red"},{"p0":[-374,-169],"p1":[-346,-193],"team":"red"},{"p0":[-16,-193],"p1":[16,-193],"team":"blue"},{"p0":[346,-193],"p1":[374,-169],"team":"red"},{"p0":[346,193],"p1":[374,169],"team":"blue"},{"p0":[-16,193],"p1":[16,193],"team":"red"},{"p0":[-346,193],"p1":[-374,169],"team":"blue"}],"joints":[]}`,

  CARAMBOLA: `{"name":"Billiards Carambola","canBeStored":false,"width":388,"height":209,"maxViewWidth":1300,"cameraWidth":485,"cameraHeight":285,"cameraFollow":"ball","spawnDistance":267,"redSpawnPoints":[[-267,-89]],"blueSpawnPoints":[[-267,89]],"kickOffReset":"partial","bg":{"width":388,"height":209,"type":"none","cornerRadius":24,"kickOffRadius":0,"color":"66202b"},"playerPhysics":{"radius":18,"bCoef":0.15,"invMass":500,"damping":0.8,"acceleration":0.1,"kickingAcceleration":0.5,"kickingDamping":0.9,"kickStrength":50},"ballPhysics":"disc0","traits":{"whiteBall":{"radius":11,"bCoef":0.92,"invMass":0.4,"damping":0.99,"color":"ffffe4","cMask":["wall","ball","red","blue","c1","c2","c3"],"cGroup":["ball","c0","kick","score"]},"redBall":{"radius":11,"bCoef":0.92,"invMass":0.4,"damping":0.99,"color":"e56e56","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c1"]},"blueBall":{"radius":11,"bCoef":0.92,"invMass":0.4,"damping":0.99,"color":"5689e5","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c2"]},"blackBall":{"radius":11,"bCoef":0.92,"invMass":0.4,"damping":0.99,"color":"181818","cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["ball","c3","score"]},"tableWall":{"bCoef":0.6,"bias":-15,"color":"50161c","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallCorner":{"bCoef":0.45,"color":"50161c","cMask":["ball","c0","c1","c2","c3"],"cGroup":["wall"]},"tableWallGoalInner":{"vis":false,"bCoef":-4,"bias":-5,"cMask":["wall","ball"],"cGroup":["wall"]},"tableWallGoalInnerLaunch":{"vis":false,"bCoef":4,"bias":5,"cMask":["wall","ball"],"cGroup":["wall"]},"kickoffLine":{"vis":false,"bCoef":0.1,"color":"701e4e","cMask":["red","blue"],"cGroup":["redKO","blueKO"]},"bgTable":{"color":"2e1418","cMask":[],"cGroup":["wall"]},"bgTableBorderIn":{"color":"2e1418","bCoef":5,"bias":40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgTableBorderOut":{"color":"2e1418","bCoef":5,"bias":-40,"cMask":["wall","ball","c0","c1","c2","c3"],"cGroup":["wall"]},"bgHole":{"radius":20,"color":"000000","cMask":[],"cGroup":["wall"]},"bgIndicator":{"color":"ffffe4","cMask":[],"cGroup":["wall"]},"playerBoundary":{"vis":false,"bCoef":0.5,"cMask":["red","blue"]},"ballBoundary":{"vis":false,"bCoef":0,"cMask":["ball","c0","c1","c2","c3"]},"railSide":{"vis":false,"bCoef":10,"bias":-5,"cMask":["c0","c1","c2","c3"]},"railStopRight":{"vis":false,"bCoef":0,"bias":-40,"cMask":["ball","c0","c1","c2","c3"]},"railStopLeft":{"vis":false,"bCoef":0,"bias":40,"cMask":["ball","c0","c1","c2","c3"]},"aimDisc":{"radius":66,"invMass":65000,"pos":[-178,0],"color":"transparent","bCoef":0,"damping":0,"cMask":["red","blue"],"cGroup":["ball"]}},"planes":[{"normal":[0,-1],"dist":-275,"trait":"playerBoundary"},{"normal":[0,1],"dist":-275,"trait":"playerBoundary"},{"normal":[1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[-1,0],"dist":-475,"trait":"playerBoundary"},{"normal":[0,-1],"dist":-275,"trait":"ballBoundary"},{"normal":[0,1],"dist":-275,"trait":"ballBoundary"},{"normal":[1,0],"dist":-475,"trait":"ballBoundary"},{"normal":[-1,0],"dist":-475,"trait":"ballBoundary"}],"discs":[{"pos":[-178,0],"trait":"whiteBall"},{"pos":[178,0],"trait":"redBall"},{"pos":[198,-12],"trait":"blueBall"},{"pos":[198,12],"trait":"redBall"},{"pos":[218,-24],"trait":"redBall"},{"pos":[218,0],"trait":"blackBall"},{"pos":[218,24],"trait":"blueBall"},{"pos":[238,-36],"trait":"blueBall"},{"pos":[238,-12],"trait":"redBall"},{"pos":[238,12],"trait":"blueBall"},{"pos":[238,36],"trait":"redBall"},{"pos":[258,-48],"trait":"redBall"},{"pos":[258,-24],"trait":"blueBall"},{"pos":[258,0],"trait":"blueBall"},{"pos":[258,24],"trait":"redBall"},{"pos":[258,48],"trait":"blueBall"},{"pos":[-364,-189],"trait":"bgHole"},{"pos":[0,-204],"trait":"bgHole"},{"pos":[364,-189],"trait":"bgHole"},{"pos":[364,185],"trait":"bgHole"},{"pos":[0,200],"trait":"bgHole"},{"pos":[-364,185],"trait":"bgHole"}],"vertexes":[{"x":-178,"y":-179,"trait":"kickoffLine"},{"x":-178,"y":175,"trait":"kickoffLine"},{"x":-379,"y":-229,"trait":"bgTable"},{"x":379,"y":-229,"trait":"bgTable"},{"x":-385,"y":-227,"trait":"bgTable"},{"x":385,"y":-227,"trait":"bgTable"},{"x":-390,"y":-225,"trait":"bgTable"},{"x":390,"y":-225,"trait":"bgTable"},{"x":-393,"y":-223,"trait":"bgTable"},{"x":393,"y":-223,"trait":"bgTable"},{"x":-395,"y":-221,"trait":"bgTable"},{"x":395,"y":-221,"trait":"bgTable"},{"x":-397,"y":-219,"trait":"bgTable"},{"x":397,"y":-219,"trait":"bgTable"},{"x":-399,"y":-217,"trait":"bgTable"},{"x":399,"y":-217,"trait":"bgTable"},{"x":-401,"y":-215,"trait":"bgTable"},{"x":401,"y":-215,"trait":"bgTable"},{"x":-403,"y":-213,"trait":"bgTable"},{"x":403,"y":-213,"trait":"bgTable"},{"x":-403,"y":-211,"trait":"bgTable"},{"x":403,"y":-211,"trait":"bgTable"},{"x":-404,"y":-209,"trait":"bgTable"},{"x":404,"y":-209,"trait":"bgTable"},{"x":-404,"y":-207,"trait":"bgTable"},{"x":404,"y":-207,"trait":"bgTable"},{"x":-404,"y":-205,"trait":"bgTable"},{"x":404,"y":-205,"trait":"bgTable"},{"x":-405,"y":-203,"trait":"bgTable"},{"x":405,"y":-203,"trait":"bgTable"},{"x":-405,"y":-201,"trait":"bgTable"},{"x":405,"y":-201,"trait":"bgTable"},{"x":-405,"y":-199,"trait":"bgTable"},{"x":405,"y":-199,"trait":"bgTable"},{"x":-406,"y":-197,"trait":"bgTable"},{"x":406,"y":-197,"trait":"bgTable"},{"x":-406,"y":-195,"trait":"bgTable"},{"x":406,"y":-195,"trait":"bgTable"},{"x":-406,"y":-193,"trait":"bgTable"},{"x":406,"y":-193,"trait":"bgTable"},{"x":-379,"y":225,"trait":"bgTable"},{"x":379,"y":225,"trait":"bgTable"},{"x":-385,"y":223,"trait":"bgTable"},{"x":385,"y":223,"trait":"bgTable"},{"x":-390,"y":221,"trait":"bgTable"},{"x":390,"y":221,"trait":"bgTable"},{"x":-393,"y":219,"trait":"bgTable"},{"x":393,"y":219,"trait":"bgTable"},{"x":-395,"y":217,"trait":"bgTable"},{"x":395,"y":217,"trait":"bgTable"},{"x":-397,"y":215,"trait":"bgTable"},{"x":397,"y":215,"trait":"bgTable"},{"x":-399,"y":213,"trait":"bgTable"},{"x":399,"y":213,"trait":"bgTable"},{"x":-401,"y":211,"trait":"bgTable"},{"x":401,"y":211,"trait":"bgTable"},{"x":-403,"y":209,"trait":"bgTable"},{"x":403,"y":209,"trait":"bgTable"},{"x":-403,"y":207,"trait":"bgTable"},{"x":403,"y":207,"trait":"bgTable"},{"x":-404,"y":205,"trait":"bgTable"},{"x":404,"y":205,"trait":"bgTable"},{"x":-404,"y":203,"trait":"bgTable"},{"x":404,"y":203,"trait":"bgTable"},{"x":-404,"y":201,"trait":"bgTable"},{"x":404,"y":201,"trait":"bgTable"},{"x":-405,"y":199,"trait":"bgTable"},{"x":405,"y":199,"trait":"bgTable"},{"x":-405,"y":197,"trait":"bgTable"},{"x":405,"y":197,"trait":"bgTable"},{"x":-405,"y":195,"trait":"bgTable"},{"x":405,"y":195,"trait":"bgTable"},{"x":-406,"y":193,"trait":"bgTable"},{"x":406,"y":193,"trait":"bgTable"},{"x":-406,"y":191,"trait":"bgTable"},{"x":406,"y":191,"trait":"bgTable"},{"x":-406,"y":189,"trait":"bgTable"},{"x":406,"y":189,"trait":"bgTable"},{"x":-404,"y":-193,"trait":"bgTable"},{"x":-404,"y":189,"trait":"bgTable"},{"x":-402,"y":-193,"trait":"bgTable"},{"x":-402,"y":189,"trait":"bgTable"},{"x":-400,"y":-193,"trait":"bgTable"},{"x":-400,"y":189,"trait":"bgTable"},{"x":-398,"y":-193,"trait":"bgTable"},{"x":-398,"y":189,"trait":"bgTable"},{"x":-396,"y":-193,"trait":"bgTable"},{"x":-396,"y":189,"trait":"bgTable"},{"x":-394,"y":-193,"trait":"bgTable"},{"x":-394,"y":189,"trait":"bgTable"},{"x":-392,"y":-193,"trait":"bgTable"},{"x":-392,"y":189,"trait":"bgTable"},{"x":-390,"y":-193,"trait":"bgTable"},{"x":-390,"y":189,"trait":"bgTable"},{"x":-388,"y":-193,"trait":"bgTable"},{"x":-388,"y":189,"trait":"bgTable"},{"x":-386,"y":-193,"trait":"bgTable"},{"x":-386,"y":189,"trait":"bgTable"},{"x":-384,"y":-193,"trait":"bgTable"},{"x":-384,"y":189,"trait":"bgTable"},{"x":-382,"y":-193,"trait":"bgTable"},{"x":-382,"y":189,"trait":"bgTable"},{"x":-380,"y":-193,"trait":"bgTable"},{"x":-380,"y":189,"trait":"bgTable"},{"x":-379,"y":-193,"trait":"bgTable"},{"x":-379,"y":189,"trait":"bgTable"},{"x":-378,"y":-193,"trait":"bgTable"},{"x":-378,"y":189,"trait":"bgTable"},{"x":-376,"y":-193,"trait":"bgTable"},{"x":-376,"y":189,"trait":"bgTable"},{"x":-374,"y":-193,"trait":"bgTable"},{"x":-374,"y":189,"trait":"bgTable"},{"x":-372,"y":-193,"trait":"bgTable"},{"x":-372,"y":189,"trait":"bgTable"},{"x":-370,"y":-193,"trait":"bgTable"},{"x":-370,"y":189,"trait":"bgTable"},{"x":404,"y":-193,"trait":"bgTable"},{"x":404,"y":189,"trait":"bgTable"},{"x":402,"y":-193,"trait":"bgTable"},{"x":402,"y":189,"trait":"bgTable"},{"x":400,"y":-193,"trait":"bgTable"},{"x":400,"y":189,"trait":"bgTable"},{"x":398,"y":-193,"trait":"bgTable"},{"x":398,"y":189,"trait":"bgTable"},{"x":396,"y":-193,"trait":"bgTable"},{"x":396,"y":189,"trait":"bgTable"},{"x":394,"y":-193,"trait":"bgTable"},{"x":394,"y":189,"trait":"bgTable"},{"x":392,"y":-193,"trait":"bgTable"},{"x":392,"y":189,"trait":"bgTable"},{"x":390,"y":-193,"trait":"bgTable"},{"x":390,"y":189,"trait":"bgTable"},{"x":388,"y":-193,"trait":"bgTable"},{"x":388,"y":189,"trait":"bgTable"},{"x":386,"y":-193,"trait":"bgTable"},{"x":386,"y":189,"trait":"bgTable"},{"x":384,"y":-193,"trait":"bgTable"},{"x":384,"y":189,"trait":"bgTable"},{"x":382,"y":-193,"trait":"bgTable"},{"x":382,"y":189,"trait":"bgTable"},{"x":380,"y":-193,"trait":"bgTable"},{"x":380,"y":189,"trait":"bgTable"},{"x":379,"y":-193,"trait":"bgTable"},{"x":379,"y":189,"trait":"bgTable"},{"x":378,"y":-193,"trait":"bgTable"},{"x":378,"y":189,"trait":"bgTable"},{"x":376,"y":-193,"trait":"bgTable"},{"x":376,"y":189,"trait":"bgTable"},{"x":374,"y":-193,"trait":"bgTable"},{"x":374,"y":189,"trait":"bgTable"},{"x":372,"y":-193,"trait":"bgTable"},{"x":372,"y":189,"trait":"bgTable"},{"x":370,"y":-193,"trait":"bgTable"},{"x":370,"y":189,"trait":"bgTable"},{"x":-356,"y":-153,"trait":"tableWall"},{"x":-328,"y":-179,"trait":"tableWall"},{"x":-24,"y":-179,"trait":"tableWall"},{"x":24,"y":-179,"trait":"tableWall"},{"x":328,"y":-179,"trait":"tableWall"},{"x":356,"y":-153,"trait":"tableWall"},{"x":356,"y":149,"trait":"tableWall"},{"x":328,"y":175,"trait":"tableWall"},{"x":24,"y":175,"trait":"tableWall"},{"x":-24,"y":175,"trait":"tableWall"},{"x":-328,"y":175,"trait":"tableWall"},{"x":-356,"y":149,"trait":"tableWall"},{"x":-376,"y":-174,"trait":"tableWallCorner"},{"x":-346,"y":-196,"trait":"tableWallCorner"},{"x":-16,"y":-196,"trait":"tableWallCorner"},{"x":16,"y":-196,"trait":"tableWallCorner"},{"x":346,"y":-196,"trait":"tableWallCorner"},{"x":376,"y":-174,"trait":"tableWallCorner"},{"x":376,"y":170,"trait":"tableWallCorner"},{"x":346,"y":192,"trait":"tableWallCorner"},{"x":16,"y":192,"trait":"tableWallCorner"},{"x":-16,"y":192,"trait":"tableWallCorner"},{"x":-346,"y":192,"trait":"tableWallCorner"},{"x":-376,"y":170,"trait":"tableWallCorner"},{"x":-180,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-213,"trait":"bgIndicator"},{"x":-176,"y":-211,"trait":"bgIndicator"},{"x":-178,"y":-209,"trait":"bgIndicator"},{"x":-269,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-213,"trait":"bgIndicator"},{"x":-265,"y":-211,"trait":"bgIndicator"},{"x":-267,"y":-209,"trait":"bgIndicator"},{"x":-90,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-213,"trait":"bgIndicator"},{"x":-86,"y":-211,"trait":"bgIndicator"},{"x":-88,"y":-209,"trait":"bgIndicator"},{"x":180,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-213,"trait":"bgIndicator"},{"x":176,"y":-211,"trait":"bgIndicator"},{"x":178,"y":-209,"trait":"bgIndicator"},{"x":90,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-213,"trait":"bgIndicator"},{"x":86,"y":-211,"trait":"bgIndicator"},{"x":88,"y":-209,"trait":"bgIndicator"},{"x":269,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-213,"trait":"bgIndicator"},{"x":265,"y":-211,"trait":"bgIndicator"},{"x":267,"y":-209,"trait":"bgIndicator"},{"x":385,"y":-2,"trait":"bgIndicator"},{"x":387,"y":0,"trait":"bgIndicator"},{"x":389,"y":-2,"trait":"bgIndicator"},{"x":387,"y":-4,"trait":"bgIndicator"},{"x":385,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-92,"trait":"bgIndicator"},{"x":389,"y":-90,"trait":"bgIndicator"},{"x":387,"y":-88,"trait":"bgIndicator"},{"x":385,"y":86,"trait":"bgIndicator"},{"x":387,"y":88,"trait":"bgIndicator"},{"x":389,"y":86,"trait":"bgIndicator"},{"x":387,"y":84,"trait":"bgIndicator"},{"x":-180,"y":207,"trait":"bgIndicator"},{"x":-178,"y":209,"trait":"bgIndicator"},{"x":-176,"y":207,"trait":"bgIndicator"},{"x":-178,"y":205,"trait":"bgIndicator"},{"x":-269,"y":207,"trait":"bgIndicator"},{"x":-267,"y":209,"trait":"bgIndicator"},{"x":-265,"y":207,"trait":"bgIndicator"},{"x":-267,"y":205,"trait":"bgIndicator"},{"x":-90,"y":207,"trait":"bgIndicator"},{"x":-88,"y":209,"trait":"bgIndicator"},{"x":-86,"y":207,"trait":"bgIndicator"},{"x":-88,"y":205,"trait":"bgIndicator"},{"x":180,"y":207,"trait":"bgIndicator"},{"x":178,"y":209,"trait":"bgIndicator"},{"x":176,"y":207,"trait":"bgIndicator"},{"x":178,"y":205,"trait":"bgIndicator"},{"x":90,"y":207,"trait":"bgIndicator"},{"x":88,"y":209,"trait":"bgIndicator"},{"x":86,"y":207,"trait":"bgIndicator"},{"x":88,"y":205,"trait":"bgIndicator"},{"x":269,"y":207,"trait":"bgIndicator"},{"x":267,"y":209,"trait":"bgIndicator"},{"x":265,"y":207,"trait":"bgIndicator"},{"x":267,"y":205,"trait":"bgIndicator"},{"x":-385,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":0,"trait":"bgIndicator"},{"x":-389,"y":-2,"trait":"bgIndicator"},{"x":-387,"y":-4,"trait":"bgIndicator"},{"x":-385,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-92,"trait":"bgIndicator"},{"x":-389,"y":-90,"trait":"bgIndicator"},{"x":-387,"y":-88,"trait":"bgIndicator"},{"x":-385,"y":86,"trait":"bgIndicator"},{"x":-387,"y":88,"trait":"bgIndicator"},{"x":-389,"y":86,"trait":"bgIndicator"},{"x":-387,"y":84,"trait":"bgIndicator"},{"x":475,"y":88,"trait":"railStopRight"},{"x":-475,"y":88,"trait":"railStopLeft"},{"x":-20,"y":-229,"trait":"railSide"},{"x":5,"y":-275,"trait":"railSide"}],"segments":[{"v0":0,"v1":1,"trait":"kickoffLine"},{"v0":2,"v1":3,"trait":"bgTableBorderIn"},{"v0":4,"v1":5,"trait":"bgTable"},{"v0":6,"v1":7,"trait":"bgTable"},{"v0":8,"v1":9,"trait":"bgTable"},{"v0":10,"v1":11,"trait":"bgTable"},{"v0":12,"v1":13,"trait":"bgTable"},{"v0":14,"v1":15,"trait":"bgTable"},{"v0":16,"v1":17,"trait":"bgTable"},{"v0":18,"v1":19,"trait":"bgTable"},{"v0":20,"v1":21,"trait":"bgTable"},{"v0":22,"v1":23,"trait":"bgTable"},{"v0":24,"v1":25,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":26,"v1":27,"trait":"bgTable"},{"v0":28,"v1":29,"trait":"bgTable"},{"v0":30,"v1":31,"trait":"bgTable"},{"v0":32,"v1":33,"trait":"bgTable"},{"v0":34,"v1":35,"trait":"bgTable"},{"v0":36,"v1":37,"trait":"bgTable"},{"v0":38,"v1":39,"trait":"bgTable"},{"v0":38,"v1":2,"curve":90,"trait":"bgTableBorderIn"},{"v0":39,"v1":3,"curve":-90,"trait":"bgTableBorderOut"},{"v0":40,"v1":41,"trait":"bgTableBorderOut"},{"v0":42,"v1":43,"trait":"bgTable"},{"v0":44,"v1":45,"trait":"bgTable"},{"v0":46,"v1":47,"trait":"bgTable"},{"v0":48,"v1":49,"trait":"bgTable"},{"v0":50,"v1":51,"trait":"bgTable"},{"v0":52,"v1":53,"trait":"bgTable"},{"v0":54,"v1":55,"trait":"bgTable"},{"v0":56,"v1":57,"trait":"bgTable"},{"v0":58,"v1":59,"trait":"bgTable"},{"v0":60,"v1":61,"trait":"bgTable"},{"v0":62,"v1":63,"trait":"bgTable"},{"v0":64,"v1":65,"trait":"bgTable"},{"v0":66,"v1":67,"trait":"bgTable"},{"v0":68,"v1":69,"trait":"bgTable"},{"v0":70,"v1":71,"trait":"bgTable"},{"v0":72,"v1":73,"trait":"bgTable"},{"v0":74,"v1":75,"trait":"bgTable"},{"v0":76,"v1":77,"trait":"bgTable"},{"v0":76,"v1":40,"curve":-90,"trait":"bgTableBorderOut"},{"v0":77,"v1":41,"curve":90,"trait":"bgTableBorderIn"},{"v0":38,"v1":76,"trait":"bgTableBorderOut"},{"v0":78,"v1":79,"trait":"bgTable"},{"v0":80,"v1":81,"trait":"bgTable"},{"v0":82,"v1":83,"trait":"bgTable"},{"v0":84,"v1":85,"trait":"bgTable"},{"v0":86,"v1":87,"trait":"bgTable"},{"v0":88,"v1":89,"trait":"bgTable"},{"v0":90,"v1":91,"trait":"bgTable"},{"v0":92,"v1":93,"trait":"bgTable"},{"v0":94,"v1":95,"trait":"bgTable"},{"v0":96,"v1":97,"trait":"bgTable"},{"v0":98,"v1":99,"trait":"bgTable"},{"v0":100,"v1":101,"trait":"bgTable"},{"v0":102,"v1":103,"trait":"bgTable"},{"v0":104,"v1":105,"trait":"bgTable"},{"v0":106,"v1":107,"trait":"bgTable"},{"v0":108,"v1":109,"trait":"bgTable"},{"v0":110,"v1":111,"trait":"bgTable"},{"v0":112,"v1":113,"trait":"bgTable"},{"v0":114,"v1":115,"trait":"bgTable"},{"v0":39,"v1":77,"trait":"bgTableBorderIn"},{"v0":116,"v1":117,"trait":"bgTable"},{"v0":118,"v1":119,"trait":"bgTable"},{"v0":120,"v1":121,"trait":"bgTable"},{"v0":122,"v1":123,"trait":"bgTable"},{"v0":124,"v1":125,"trait":"bgTable"},{"v0":126,"v1":127,"trait":"bgTable"},{"v0":128,"v1":129,"trait":"bgTable"},{"v0":130,"v1":131,"trait":"bgTable"},{"v0":132,"v1":133,"trait":"bgTable"},{"v0":134,"v1":135,"trait":"bgTable"},{"v0":136,"v1":137,"trait":"bgTable"},{"v0":138,"v1":139,"trait":"bgTable"},{"v0":140,"v1":141,"trait":"bgTable"},{"v0":142,"v1":143,"trait":"bgTable"},{"v0":144,"v1":145,"trait":"bgTable"},{"v0":146,"v1":147,"trait":"bgTable"},{"v0":148,"v1":149,"trait":"bgTable"},{"v0":150,"v1":151,"trait":"bgTable"},{"v0":152,"v1":153,"trait":"bgTable"},{"v0":155,"v1":156,"trait":"tableWall"},{"v0":157,"v1":158,"trait":"tableWall"},{"v0":159,"v1":160,"trait":"tableWall"},{"v0":161,"v1":162,"trait":"tableWall"},{"v0":163,"v1":164,"trait":"tableWall"},{"v0":165,"v1":154,"trait":"tableWall"},{"v0":154,"v1":166,"trait":"tableWallCorner"},{"v0":155,"v1":167,"trait":"tableWallCorner"},{"v0":156,"v1":168,"trait":"tableWallCorner"},{"v0":157,"v1":169,"trait":"tableWallCorner"},{"v0":158,"v1":170,"trait":"tableWallCorner"},{"v0":159,"v1":171,"trait":"tableWallCorner"},{"v0":160,"v1":172,"trait":"tableWallCorner"},{"v0":161,"v1":173,"trait":"tableWallCorner"},{"v0":162,"v1":174,"trait":"tableWallCorner"},{"v0":163,"v1":175,"trait":"tableWallCorner"},{"v0":164,"v1":176,"trait":"tableWallCorner"},{"v0":165,"v1":177,"trait":"tableWallCorner"},{"v0":166,"v1":167,"curve":-90,"trait":"tableWallGoalInner"},{"v0":166,"v1":167,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":168,"v1":169,"curve":-60,"trait":"tableWallGoalInner"},{"v0":168,"v1":169,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":170,"v1":171,"curve":-90,"trait":"tableWallGoalInner"},{"v0":170,"v1":171,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":172,"v1":173,"curve":-90,"trait":"tableWallGoalInner"},{"v0":172,"v1":173,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":174,"v1":175,"curve":-60,"trait":"tableWallGoalInner"},{"v0":174,"v1":175,"curve":60,"trait":"tableWallGoalInnerLaunch"},{"v0":176,"v1":177,"curve":-90,"trait":"tableWallGoalInner"},{"v0":176,"v1":177,"curve":30,"trait":"tableWallGoalInnerLaunch"},{"v0":178,"v1":179,"trait":"bgIndicator"},{"v0":179,"v1":180,"trait":"bgIndicator"},{"v0":180,"v1":181,"trait":"bgIndicator"},{"v0":181,"v1":178,"trait":"bgIndicator"},{"v0":182,"v1":183,"trait":"bgIndicator"},{"v0":183,"v1":184,"trait":"bgIndicator"},{"v0":184,"v1":185,"trait":"bgIndicator"},{"v0":185,"v1":182,"trait":"bgIndicator"},{"v0":186,"v1":187,"trait":"bgIndicator"},{"v0":187,"v1":188,"trait":"bgIndicator"},{"v0":188,"v1":189,"trait":"bgIndicator"},{"v0":189,"v1":186,"trait":"bgIndicator"},{"v0":190,"v1":191,"trait":"bgIndicator"},{"v0":191,"v1":192,"trait":"bgIndicator"},{"v0":192,"v1":193,"trait":"bgIndicator"},{"v0":193,"v1":190,"trait":"bgIndicator"},{"v0":194,"v1":195,"trait":"bgIndicator"},{"v0":195,"v1":196,"trait":"bgIndicator"},{"v0":196,"v1":197,"trait":"bgIndicator"},{"v0":197,"v1":194,"trait":"bgIndicator"},{"v0":198,"v1":199,"trait":"bgIndicator"},{"v0":199,"v1":200,"trait":"bgIndicator"},{"v0":200,"v1":201,"trait":"bgIndicator"},{"v0":201,"v1":198,"trait":"bgIndicator"},{"v0":202,"v1":203,"trait":"bgIndicator"},{"v0":203,"v1":204,"trait":"bgIndicator"},{"v0":204,"v1":205,"trait":"bgIndicator"},{"v0":205,"v1":202,"trait":"bgIndicator"},{"v0":206,"v1":207,"trait":"bgIndicator"},{"v0":207,"v1":208,"trait":"bgIndicator"},{"v0":208,"v1":209,"trait":"bgIndicator"},{"v0":209,"v1":206,"trait":"bgIndicator"},{"v0":210,"v1":211,"trait":"bgIndicator"},{"v0":211,"v1":212,"trait":"bgIndicator"},{"v0":212,"v1":213,"trait":"bgIndicator"},{"v0":213,"v1":210,"trait":"bgIndicator"},{"v0":214,"v1":215,"trait":"bgIndicator"},{"v0":215,"v1":216,"trait":"bgIndicator"},{"v0":216,"v1":217,"trait":"bgIndicator"},{"v0":217,"v1":214,"trait":"bgIndicator"},{"v0":218,"v1":219,"trait":"bgIndicator"},{"v0":219,"v1":220,"trait":"bgIndicator"},{"v0":220,"v1":221,"trait":"bgIndicator"},{"v0":221,"v1":218,"trait":"bgIndicator"},{"v0":222,"v1":223,"trait":"bgIndicator"},{"v0":223,"v1":224,"trait":"bgIndicator"},{"v0":224,"v1":225,"trait":"bgIndicator"},{"v0":225,"v1":222,"trait":"bgIndicator"},{"v0":226,"v1":227,"trait":"bgIndicator"},{"v0":227,"v1":228,"trait":"bgIndicator"},{"v0":228,"v1":229,"trait":"bgIndicator"},{"v0":229,"v1":226,"trait":"bgIndicator"},{"v0":230,"v1":231,"trait":"bgIndicator"},{"v0":231,"v1":232,"trait":"bgIndicator"},{"v0":232,"v1":233,"trait":"bgIndicator"},{"v0":233,"v1":230,"trait":"bgIndicator"},{"v0":234,"v1":235,"trait":"bgIndicator"},{"v0":235,"v1":236,"trait":"bgIndicator"},{"v0":236,"v1":237,"trait":"bgIndicator"},{"v0":237,"v1":234,"trait":"bgIndicator"},{"v0":238,"v1":239,"trait":"bgIndicator"},{"v0":239,"v1":240,"trait":"bgIndicator"},{"v0":240,"v1":241,"trait":"bgIndicator"},{"v0":241,"v1":238,"trait":"bgIndicator"},{"v0":242,"v1":243,"trait":"bgIndicator"},{"v0":243,"v1":244,"trait":"bgIndicator"},{"v0":244,"v1":245,"trait":"bgIndicator"},{"v0":245,"v1":242,"trait":"bgIndicator"},{"v0":246,"v1":247,"trait":"bgIndicator"},{"v0":247,"v1":248,"trait":"bgIndicator"},{"v0":248,"v1":249,"trait":"bgIndicator"},{"v0":249,"v1":246,"trait":"bgIndicator"},{"v0":211,"v1":250,"trait":"railStopRight"},{"v0":247,"v1":251,"trait":"railStopLeft"},{"v0":252,"v1":253,"trait":"railSide"}],"goals":[{"p0":[-385,-210],"p1":[385,-210],"team":"red"},{"p0":[385,-210],"p1":[385,210],"team":"blue"},{"p0":[385,210],"p1":[-385,210],"team":"blue"},{"p0":[-385,210],"p1":[-385,-210],"team":"red"},{"p0":[-374,-169],"p1":[-346,-193],"team":"red"},{"p0":[-16,-193],"p1":[16,-193],"team":"blue"},{"p0":[346,-193],"p1":[374,-169],"team":"red"},{"p0":[346,193],"p1":[374,169],"team":"blue"},{"p0":[-16,193],"p1":[16,193],"team":"red"},{"p0":[-346,193],"p1":[-374,169],"team":"blue"}],"joints":[]}`,
};

const DEFAULT_MAP = 'DEFAULT';

const AVAILABLE_MAPS = Object.keys(MAPS).map(m => m.toLowerCase()).join(', ');

/* lib.js */

const COLOR = {
  WHITE: 0xffffff,
  RED: 0xe56e56,
  BLUE: 0x5689e5,
  YELLOW: 0xffffe4,
  GREEN: 0xc4ff65,
  WARNING: 0xffa135,
  ERROR: 0xa40000,
  SUCCESS: 0x75ff75,
  INFO: 0xbebebe,
  NOTIFY: 0xffefd6,
  DEFAULT: 0xffc933
};

const TEAM = {
  SPECTATOR: 0,
  RED: 1,
  BLUE: 2
};

let room;

function init() {
  if (room === undefined) {
    room = HBInit({
      roomName: ROOM,
      maxPlayers: MAX_PLAYERS,
      noPlayer: !HOST_PLAYER,
      playerName: HOST_PLAYER,
      public: PUBLIC_ROOM,
      password: null,
      token: TOKEN,
      geo: { code: '', lat: 40.416729, long: -3.703339 }
    });
    
    selectMap(DEFAULT_MAP);
    
    room.setScoreLimit(0);
    room.setTimeLimit(0);
    room.setTeamsLock(true);
    
    // room.setRequireRecaptcha(true);
  
    setHostRandomAvatar();
  }
  return room;
}

function send(msg, targetId, color, style, sound, announcement) {
  if (typeof msg === 'string' && msg.trim().length > 0) {
    if (announcement || !HOST_PLAYER) {
      room.sendAnnouncement(msg, targetId, color, style, sound);
    } else {
      room.sendChat(msg, targetId);
    }
  }
}

function message(msg, player = null, color = COLOR.DEFAULT, style = 'normal', sound = 1, announcement = false) {
  let targetId = null;

  if (player !== null) {
    if (typeof player === 'number') {
      targetId = player;
    } else if (typeof player === 'object') {
      targetId = player.id;
    }
  }

  if (typeof msg === 'string') {
    send(msg, targetId, color, style, sound, announcement);
  } else if (msg instanceof Array) {
    send(msg[0], targetId, color, style, sound, announcement);

    for (let line of msg.slice(1)) {
      send(line, targetId, color, style, 0, announcement);
    }
  }
}

function info(msg, player = null, color = COLOR.INFO, style = 'normal') {
  message(msg, player, color, style, 1, true);
}

function warn(msg, player = null, color = COLOR.WARNING, style = 'normal') {
  info(msg, player, color, style);
}

function notify(msg, color = COLOR.NOTIFY, style = 'bold') {
  message(msg, null, color, style, 2, true);
}

function isHostPlayer(player) {
  return typeof player === 'object' && player.id === 0 && player.name === HOST_PLAYER;
}

function getHostPlayer() {
  return room.getPlayerList().find(isHostPlayer);
}

function getPlayers() {
  return room.getPlayerList().filter(player => !isHostPlayer(player));
}

function setPlayerTeam(player, team) {
  if (player.team !== team) {
    room.setPlayerTeam(player.id, team);
    player.team = team;
  }
}

function getTeams(host = false) {
  let players = host ? room.getPlayerList() : getPlayers();

  let teams = {};

  for (let team of Object.values(TEAM)) {
    teams[team] = [];
  }

  for (let player of players) {
    teams[player.team].push(player);
  }

  return teams;
}

function getOppositeTeam(team) {
  return team === TEAM.RED ? TEAM.BLUE : TEAM.RED;
}

function setHostRandomAvatar(choices = ['⚜️', '෴', '🎩', '🤹🏻‍♂️', '🎱']) {
  const host = getHostPlayer();
    
  if (host) {
    let avatar = choice(choices);
    room.setPlayerAvatar(host.id, avatar);
  }
}

function setHostAvatar(host, icon, seconds = undefined) {
  if (host) {
    room.setPlayerAvatar(host.id, icon);

    if (seconds) {
      setTimeout(setHostRandomAvatar, seconds * 1000 );
    }
  }
}

/* utils.js */

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/* Game Mechanics */

let TEAMS; // team id to team player list

let CURRENT_TEAM; // team id
let CURRENT_PLAYER; // player
let NEXT_PLAYERS; // team player indexes
let FOUL; // extra turns remaining

let CURRENT_MAP, NEXT_MAP; // map name
let CURRENT_MAP_OBJECT, NEXT_MAP_OBJECT; // map object (parsed json)
let SELECTING_MAP_TASK; // map selection task
let VOTES; // map to set of players id

let TURN_TIME; // current turn player elapsed time in ticks

const AFK_PLAYERS = new Set(); // players id afk
const AFK_TIME = {}; // player id to afk ticks

const AUTH = {}; // player id to auth
const AUTH_CACHE_TASKS = {}; // player auth to { id, removalTask }
const MAX_AUTH_CACHE_MINUTES = WAIT_DRINK_MINUTES; // remove auth entry after player leaves the room

room = init();

let N_PLAYERS = getPlayers().length;

let PLAYING = !!room.getScores();

function nextMap(name) {
  if (NEXT_MAP !== name) {
    console.log(`Next ${name}`);

    NEXT_MAP = name;
    NEXT_MAP_OBJECT = undefined;
  
    if (name !== undefined) {
      NEXT_MAP_OBJECT = JSON.parse(MAPS[NEXT_MAP]);
    }
  }
  return NEXT_MAP_OBJECT;
}

function selectMap(name) {
  if (CURRENT_MAP !== name) {
    console.log(`Select ${name}`);
    
    const stadium = MAPS[name];
    
    room.setCustomStadium(stadium);
  
    CURRENT_MAP = name;
    CURRENT_MAP_OBJECT = undefined;

    if (CURRENT_MAP === NEXT_MAP) {
      CURRENT_MAP_OBJECT = NEXT_MAP_OBJECT;
    }
    if (CURRENT_MAP_OBJECT === undefined) {
      CURRENT_MAP_OBJECT = JSON.parse(stadium);
    }
  }
  return CURRENT_MAP_OBJECT;
}

function startNextMap(name, by) {
  name = name.toUpperCase();

  let mapObject = nextMap(name);

  let message = `Next map is ${mapObject.name}, set by ${by}.`;

  if (PLAYING) {
    message += ` Current game will be stopped in ${NEW_GAME_DELAY_SECONDS} seconds...`;
  }

  notify(message);

  if (PLAYING) {
    SELECTING_MAP_TASK = setTimeout(() => {
      stopGame();
      SELECTING_MAP_TASK = undefined;
    }, NEW_GAME_DELAY_SECONDS * 1000);
  } else {
    chooseMap();
  }
}

function voteMap(player, map) {
  map = map.toUpperCase();

  const mapVotes = VOTES[map];

  if (mapVotes) {
    if (!mapVotes.has(player.id)) {
      mapVotes.add(player.id);
      
      info(`${player.name} has voted for ${map.toLowerCase()} map (${mapVotes.size} ${mapVotes.size !== 1 ? 'votes' : 'vote'})`, null, COLOR.SUCCESS);
    
      const majority = mapVotes.size > Math.floor(N_PLAYERS / 2);

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

function removeVotes(player) {
  Object.keys(MAPS).forEach(map => {
    VOTES[map].delete(player);
  });
}

function resetVoting() {
  VOTES = {};

  Object.keys(MAPS).forEach(map => {
    VOTES[map] = new Set();
  });
}

function updatePlayersLength() {
  N_PLAYERS = getPlayers().length;
}

function playersInGame() {
  return N_PLAYERS - TEAMS[TEAM.SPECTATOR].length;
}

function updateCurrentPlayer(changeTeam = true) {
  console.log('CURRENT_PLAYER', CURRENT_PLAYER, FOUL); // FIXME infinite loop

  const previousTurnPlayer = CURRENT_PLAYER;

  if (N_PLAYERS === 0) {
    resetCurrentPlayer();
  } else if (!FOUL || !CURRENT_PLAYER) {
    if (changeTeam) {
      CURRENT_TEAM = getOppositeTeam(CURRENT_TEAM);
    } else if (!CURRENT_TEAM) {
      CURRENT_TEAM = TEAM.RED;
    }
    if (TEAMS[CURRENT_TEAM].length === 0) {
      CURRENT_TEAM = getOppositeTeam(CURRENT_TEAM);
    }

    let currentIndex = NEXT_PLAYERS[CURRENT_TEAM];
    let currentTeam = TEAMS[CURRENT_TEAM];
  
    CURRENT_PLAYER = currentTeam[currentIndex];
    NEXT_PLAYERS[CURRENT_TEAM] = (currentIndex + 1) % currentTeam.length;
  }

  TURN_TIME = 0;

  if (N_PLAYERS > 1 && CURRENT_PLAYER && (!previousTurnPlayer || CURRENT_PLAYER.id !== previousTurnPlayer.id)) {
    const teamColor = CURRENT_TEAM === TEAM.BLUE ? '🔵' : '🔴';
    const turn = `Turn ${teamColor} ${CURRENT_PLAYER.name}`;
    
    info(turn);
  }
}

function updateTeams() {
  TEAMS = getTeams();
}

function updateNextPlayers() {
  Object.entries(NEXT_PLAYERS).forEach(([team, nextIndex]) => {
    const teamPlayers = TEAMS[team];
    NEXT_PLAYERS[team] = teamPlayers.length > 0 ? (nextIndex % teamPlayers.length) : 0;
  });
}

function resetCurrentPlayer() {
  NEXT_PLAYERS = {
    [TEAM.RED]: 0,
    [TEAM.BLUE]: 0,
  };
  FOUL = 0;
  CURRENT_TEAM = null;
  CURRENT_PLAYER = null;
}

function foul(message) {
  FOUL = 2;
  warn(`❌ FOUL | ${message}\n${CURRENT_PLAYER.name} have ${FOUL} shots now`);
}

function moveHostPlayer(host) {
  if (host) {
    // Move host out of the table
    room.setPlayerDiscProperties(host.id, {
      x: -455,
      y: -10,
    });
  }
}

function startGame() {
  if (!PLAYING) {
    setTeams();
    room.startGame();
  }
}

function stopGame() {
  room.stopGame();
}

room.onGameStart = function() {
  PLAYING = true;

  resetPlayingAFK();

  const host = getHostPlayer();

  if (host && host.team !== TEAM.SPECTATOR) {
    moveHostPlayer(host);
  }

  resetCurrentPlayer();
  updateCurrentPlayer();

  resetVoting();
};

room.onGameStop = function(byPlayer) {
  PLAYING = false;

  if (!byPlayer || isHostPlayer(byPlayer)) {
    chooseMap();
  }

  if (TEAMS[TEAM.SPECTATOR].length > 0) {
    const moveToSpectator = (player) => {
      setPlayerTeam(player, TEAM.SPECTATOR);
    };
  
    TEAMS[TEAM.RED].forEach(moveToSpectator);
    TEAMS[TEAM.BLUE].forEach(moveToSpectator);
  }
};

room.onPlayerBallKick = function(player) {
  if (player.id === CURRENT_PLAYER.id) {
    if (FOUL) {
      FOUL--;
    }
    updateCurrentPlayer();
  } else {
    foul("Wrong player turn!");
  }
}

function chooseMap() {
  let previousPlayers = N_PLAYERS;

  updatePlayersLength();

  setTeams();

  if (N_PLAYERS != previousPlayers) {
    console.log(`${previousPlayers} -> ${N_PLAYERS} players in the room (Playing: ${PLAYING})`);
  }

  if (PLAYING) {
    if ((previousPlayers < 2 && N_PLAYERS >= 2) || (previousPlayers >= 2 && N_PLAYERS < 2)) {
      stopGame();
      return true;
    }
  } else if (SELECTING_MAP_TASK === undefined) {
    if (NEXT_MAP) {
      selectMap(NEXT_MAP);

      if (NEXT_MAP === DEFAULT_MAP) {
        NEXT_MAP = undefined;
        NEXT_MAP_OBJECT = undefined;
      }
    } else if (N_PLAYERS === 1) {
      selectMap('PRACTICE');
    } else {
      selectMap(DEFAULT_MAP);
    }
  
    if (playersInGame() > 0) {
      startGame();
    } else {
      stopGame();
    }
    return true;
  }
  return false;
}

function setTeams() {
  let teams = getTeams();

  const limit = 2;

  function fill(from, to) {
    if (teams[from].length > 0 && teams[to].length < limit) {
      const player = teams[from].shift();

      if (!isAFK(player)) {
        setPlayerTeam(player, to);
        teams[to].push(player);
      } else {
        teams[from].push(player);
      }
    }
  }

  const nextTeam = teams[TEAM.RED].length > teams[TEAM.BLUE].length ? TEAM.BLUE : TEAM.RED;
  const otherTeam = getOppositeTeam(nextTeam);

  fill(TEAM.SPECTATOR, nextTeam);
  fill(TEAM.SPECTATOR, otherTeam);
  fill(TEAM.SPECTATOR, nextTeam);
  fill(TEAM.SPECTATOR, otherTeam);

  TEAMS = teams;

  TEAMS[TEAM.SPECTATOR].filter(p => !isAFK(p)).forEach(spectator => {
    const gameFull = [`Current game is full, but don't worry, you'll join in the next one, ${spectator.name}.`];
    
    if (!isDrinking(player)) {
      gameFull.push("Meanwhile, I can serve you a drink if you want.");
      message(gameFull, spectator);
      info(DRINK_MENU, spectator);
    } else {
      message(gameFull, spectator);
    }
  });

  return teams;
}

function getAuth(player) {
  return AUTH[player.id];
}

function setAuth(player) {
  const auth = player.auth;

  AUTH[player.id] = auth;

  // Check if is a recent returning player
  if (auth in AUTH_CACHE_TASKS) {
    const oldAuth = AUTH_CACHE_TASKS[auth];
    clearTimeout(oldAuth.removalTask);
    delete AUTH[oldAuth.id];
    delete AUTH_CACHE_TASKS[auth];
    console.log('Clear', oldAuth);
  }

  checkAdmin(player);
}

function scheduleAuthRemoval(player) {
  const auth = AUTH[player.id];

  AUTH_CACHE_TASKS[auth] = {
    id: player.id,
    task: setTimeout(() => {
      delete AUTH[player.id];
      delete AUTH_CACHE_TASKS[auth];
    }, MAX_AUTH_CACHE_MINUTES * 60 * 1000)
  };
}

function checkAdmin(player) {
  if (ADMINS.includes(AUTH[player.id])) {
    room.setPlayerAdmin(player.id, true);
  }
}

function isAFK(player) {
  return AFK_PLAYERS.has(player.id);
}

function setAFK(player) {
  AFK_PLAYERS.add(player.id);
  setPlayerTeam(player, TEAM.SPECTATOR);
}

function resetAFK(player) {
  AFK_TIME[player.id] = 0;

  if (isAFK(player)) {
    AFK_PLAYERS.delete(player.id);

    chooseMap();
  }
}

function resetPlayingAFK() {
  getPlayers().filter(p => p.team !== TEAM.SPECTATOR).forEach(resetAFK);
}

function clearAFK(player) {
  delete AFK_TIME[player.id];
}

function incrementAFK(player) {
  const afkSeconds = ++AFK_TIME[player.id];

  if (PLAYING && player.team !== TEAM.SPECTATOR && playersInGame() > 1) {
    if (CURRENT_PLAYER && player.id === CURRENT_PLAYER.id) {
      if (afkSeconds === AFK_PLAYING_SECONDS - AFK_SECONDS_WARNING) {
        warn(`${player.name}, if you don't move in the next ${AFK_SECONDS_WARNING} seconds, you will be moved to spectators.`, player);
      } else if (afkSeconds >= AFK_PLAYING_SECONDS) {
        setAFK(player);
      }
    }
  } else if (N_PLAYERS >= MAX_PLAYERS && Math.floor(afkSeconds / 60) >= MAX_FULL_AFK_MINUTES) {
    room.kickPlayer(player.id, `AFK > ${MAX_FULL_AFK_MINUTES} min`, false);
  }
}

function incrementTurnTime() {
  TURN_TIME++;

  if (PLAYING && playersInGame() > 1) {
    if (TURN_TIME === TURN_MAX_SECONDS - TURN_SECONDS_WARNING) {
      warn(`${CURRENT_PLAYER.name}, if you don't shoot in the next ${TURN_SECONDS_WARNING} seconds, you will lose your turn.`, CURRENT_PLAYER);
    } else if (TURN_TIME >= TURN_MAX_SECONDS) {
      info(`${CURRENT_PLAYER.name} spent too much time to shoot.`);
      updateCurrentPlayer();
    }
  }
}

let URL;

room.onRoomLink = function(url) {
  URL = url;
  console.log(URL);
};

room.onPlayerJoin = function(player) {
  console.log(`onPlayerJoin: ${player.name} (${player.auth})`);

  warn("The bot of this room is in alpha version, please be patient if something breaks or does not work as expected.", player);

  message(`Welcome ${player.name} to the HaxBilliards Pub 🎱`, player);

  setAuth(player);

  chooseMap();

  info("If you don't know how to play send !rules", player, COLOR.DEFAULT, 'italic');

  resetAFK(player);
};

function updateOnTeamMove(player) {
  if (PLAYING) {
    updateNextPlayers();
  
    if (CURRENT_PLAYER && CURRENT_PLAYER.id === player.id) {
      CURRENT_PLAYER = null;
      updateCurrentPlayer(false);
    }

    if (!playersInGame()) {
      stopGame();
    }
  }
}

room.onPlayerLeave = function(player) {
  console.log(`onPlayerLeave: ${player.name}`);

  if (!chooseMap()) {
    updateOnTeamMove(player);
  }
  
  if (!PLAYING && N_PLAYERS > 0 && player.admin) {
    setTeams();
    startGame();
  } else if (!playersInGame()) {
    stopGame();
  }

  removeVotes(player);

  clearAFK(player);

  scheduleAuthRemoval(player);
};

room.onPlayerTeamChange = function(player) {
  updateTeams();

  if (player.team === TEAM.SPECTATOR) {
    updateOnTeamMove(player);
  } else if (isHostPlayer(player)) {
    moveHostPlayer(player);
  } else if (PLAYING) {
    resetAFK(player);
    updateOnTeamMove(player);
  }
};

const TICKS_PER_SECOND = 60;

let SECOND_TICKS = 0;

room.onGameTick = function() {
  if (++SECOND_TICKS === TICKS_PER_SECOND) {
    // Every second
    TEAMS[TEAM.RED].forEach(incrementAFK);
    TEAMS[TEAM.BLUE].forEach(incrementAFK);
    TEAMS[TEAM.SPECTATOR].forEach(incrementAFK);

    if (PLAYING && N_PLAYERS > 1) {
      incrementTurnTime();
    }
    
    SECOND_TICKS = 0;
  }
};

room.onPlayerActivity = resetAFK;

room.onPlayerKicked = function(player, reason, ban, byPlayer) {
  let message = `${player.name} has been ${ban ? 'banned' : 'kicked'}`;

  if (byPlayer) {
    message += ` by ${byPlayer.name}`;
  }

  if (reason) {
    message += `: ${reason}`;
  }

  console.log(message);
  warn(message);
};

/* Chat Commands */

let HELP = [];
let ADMIN_HELP = [];

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

function joinArgs(args) {
  return args.join(' ').trim();
}

HELP.push(...[
  "📋 !rules ▶️ show the billiards rules",
  "📖 !rules full ▶️ show the extended billiards rules"
]);

function rules(player, args) {
  let arg = args.length > 0 && args[0].toLowerCase();
  let extended = arg === 'full' || arg === 'extended';
  
  info(extended ? EXTENDED_RULES : RULES, player, COLOR.YELLOW);
}

HELP.push(`🤵🏽‍♂️ ${DRINK_MENU} ▶️ order a drink to the bartender`);

let DRINKING = {}; // Players who have ordered a drink recently: auth to avatar

function isDrinking(player) {
  return getAuth(player) in DRINKING;
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
    const auth = getAuth(player);

    DRINKING[auth] = icon;

    // Drink preparation
    message("Alright! Just a moment...", player);

    const host = getHostPlayer();
    setHostAvatar(host, icon, DRINK_PREPARATION_SECONDS);

    // Move host to the table if player is playing
    if (host.team === TEAM.SPECTATOR && player.team !== TEAM.SPECTATOR) {
      setTimeout(() => {
        setPlayerTeam(host, player.team);
        message(drinkMessage, player);
      }, Math.floor(DRINK_PREPARATION_SECONDS / 2) * 1000);
    }

    // Set drink avatar
    setTimeout(() => {
      room.setPlayerAvatar(player.id, icon);
    }, DRINK_PREPARATION_SECONDS * 1000);

    // Move host to spectator after some time
    setTimeout(() => {
      if (host.team !== TEAM.SPECTATOR) {
        setPlayerTeam(host, TEAM.SPECTATOR);
      }
    }, 3 * DRINK_PREPARATION_SECONDS * 1000);

    // Clear drinking status after some time
    setTimeout(() => {
      delete DRINKING[auth];
      room.setPlayerAvatar(player.id, null);
    }, WAIT_DRINK_MINUTES * 60 * 1000);
  }
}

HELP.push(`🔄 !vote [${AVAILABLE_MAPS}] ▶️ vote to change the current map`);

function vote(player, args) {
  if (args.length > 0) {
    voteMap(player, args[0]);
  } else {
    info(`!vote [${AVAILABLE_MAPS}]`, player, COLOR.DEFAULT);
  }
}

HELP.push("😴 !afk ▶️ switch between afk / online");

function afk(player, _) {
  if (isAFK(player)) {
    resetAFK(player);
  } else {
    setAFK(player);
    info(`😴 ${player.name} is AFK`, null, COLOR.INFO, 'bold');
  }
}

HELP.push("👤 !avatar {AVATAR} ▶️ override your avatar only for this session. 8 = 🎱");

function avatar(player, args) {
  let selected = joinArgs(args);
  room.setPlayerAvatar(player.id, selected === '8' ? '🎱' : selected);
}

ADMIN_HELP.push(`⚙️ !map [${AVAILABLE_MAPS}] [f, force]? ▶️ change the current map`);

function map(player, args) {
  if (args.length > 0) {
    let force = args.length > 1 ? ['f', 'force'].includes(args[1].toLowerCase()) : false;

    if (!PLAYING || force) {
      startNextMap(args[0], player.name);
    } else {
      warn("There is currently a game being played, please stop it first or run this command again with force.", player);
    }
  } else {
    warn(`!map [${AVAILABLE_MAPS}]`, player);
  }
}

ADMIN_HELP.push(`👮🏽‍♂️ !kick {PLAYER} {REASON}? ▶️ kick a player out of the room`);

function kickban(command, player, args) {
  if (args.length > 0) {
    const target = getPlayers().find(p => p.name === args[0]);

    if (target) {
      const ban = command === 'ban';

      if (ban && target.admin) {
        warn('Admin players cannot be banned.', player);
      } else {
        const reason = joinArgs(args.slice(1));
        room.kickPlayer(target.id, reason, ban);
      }
    } else {
      warn(`Player ${args[0]} not found in the room.`, player);
    }
  } else {
    warn(`!${command} {PLAYER} {REASON}?`, player);
  }
}

function kick(player, args) {
  kickban('kick', player, args);
}

ADMIN_HELP.push(`⛔️ !ban {PLAYER} {REASON}? ▶️ ban a player from joining the room`);

function ban(player, args) {
  kickban('ban', player, args);
}

ADMIN_HELP.push(`🧹 !clearbans ▶️ clear the list of banned players`);

function clearbans(player, _) {
  room.clearBans();
  info('🧹 Floosh! Ban list has been cleared.', player, COLOR.SUCCESS);
}

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

const COMMAND_HANDLERS = {
  'help': help,
  'rules': rules,
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

room.onPlayerChat = function(player, msg) {
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
};
