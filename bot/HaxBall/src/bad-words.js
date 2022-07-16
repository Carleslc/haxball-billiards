// prevent these words to be sent to the chat
const BAD_WORDS = (() => {
  const badWords = [
    // Modified from https://github.com/web-mech/badwords/blob/master/lib/lang.json
    "ano",
    "ahole",
    "anus",
    "ash0le",
    "ash0les",
    "asholes",
    "ass",
    "monkey",
    "assface",
    "assh0le",
    "assh0lez",
    "ashol",
    "ashole",
    "asshol",
    "asshole",
    "assholes",
    "assholz",
    "asswipe",
    "azzhole",
    "bassterds",
    "bastard",
    "bastards",
    "bastardz",
    "basterds",
    "basterdz",
    "biatch",
    "bitches",
    "blowjob",
    "boffing",
    "butthole",
    "buttwipe",
    "c0ck",
    "c0cks",
    "c0k",
    "cawk",
    "cawks",
    "clit",
    "clitoris",
    "cnts",
    "cntz",
    "cock",
    "cockhead",
    "cockhead",
    "cocks",
    "cocksucker",
    "cocksucker",
    "crap",
    "cum",
    "cunt",
    "cunts",
    "cuntz",
    "dild0",
    "dild0s",
    "dildo",
    "dildos",
    "dilld0",
    "dilld0s",
    "dominatricks",
    "dominatrics",
    "dominatrix",
    "dyke",
    "enema",
    "fag",
    "fag1t",
    "faget",
    "fagg1t",
    "faggit",
    "faggot",
    "fagg0t",
    "fagit",
    "fags",
    "fagz",
    "faig",
    "faigs",
    "fart",
    "fuck",
    "fuuck",
    "fuuuck",
    "fucker",
    "fuckin",
    "fucking",
    "fackin",
    "facking",
    "fack",
    "fak",
    "fucks",
    "fuqked",
    "fuqed",
    "fuk",
    "fck",
    "fckk",
    "fwck",
    "fukah",
    "fuken",
    "fuked",
    "fuker",
    "fukin",
    "fukk",
    "fukkah",
    "fukken",
    "fukker",
    "fukkin",
    "stfu",
    "g00k",
    "goddamned",
    "h00r",
    "h0ar",
    "h0re",
    "hoar",
    "hoor",
    "hoore",
    "jackoff",
    "jap",
    "japs",
    "jerk",
    "jerkoff",
    "jisim",
    "jiss",
    "jizm",
    "jizz",
    "knob",
    "knobs",
    "knobz",
    "kunt",
    "kunts",
    "kuntz",
    "lezzian",
    "lipshits",
    "lipshitz",
    "masochist",
    "masokist",
    "massterbait",
    "masstrbait",
    "masstrbate",
    "masterbaiter",
    "masterbate",
    "masterbates",
    "mothafucker",
    "mothafuker",
    "mothafukkah",
    "mothafukker",
    "motherfucker",
    "motherfuckers",
    "motherfukah",
    "motherfuker",
    "motherfukkah",
    "motherfukker",
    "muthafucker",
    "muthafukah",
    "muthafuker",
    "muthafukkah",
    "muthafukker",
    "madafaka",
    "madafakas",
    "n1gr",
    "nastt",
    "nigger",
    "nigur",
    "niiger",
    "niigr",
    "nigga",
    "niga",
    "orafis",
    "orgasim",
    "orgasm",
    "orgasum",
    "oriface",
    "orifice",
    "orifiss",
    "packi",
    "packie",
    "packy",
    "paki",
    "pakie",
    "paky",
    "pecker",
    "peeenus",
    "peeenusss",
    "peenus",
    "peinus",
    "pen1s",
    "penas",
    "penis",
    "penisbreath",
    "penus",
    "penuus",
    "phuc",
    "phuck",
    "phuk",
    "phuker",
    "phukker",
    "polac",
    "polack",
    "polak",
    "poonani",
    "pr1c",
    "pr1ck",
    "pr1k",
    "pusse",
    "pussee",
    "pussy",
    "puuke",
    "puuker",
    "qweir",
    "recktum",
    "rectum",
    "retard",
    "sadist",
    "scank",
    "schlong",
    "screwing",
    "semen",
    "sex",
    "sexo",
    "sh1t",
    "sh1ter",
    "sh1ts",
    "sh1tter",
    "sh1tz",
    // "shit",
    "shits",
    "shitter",
    "shitty",
    "shity",
    "shitz",
    "shyt",
    "shyte",
    "shytty",
    "shyty",
    "skanck",
    "skank",
    "skankee",
    "skankey",
    "skanks",
    "Skanky",
    "slag",
    "slut",
    "sluts",
    "Slutty",
    "slutz",
    "sonofabitch",
    "tit",
    "turd",
    "va1jina",
    "vag1na",
    "vagna",
    "vagiina",
    "vagina",
    "vaj1na",
    "vajina",
    "vullva",
    "vulva",
    "w0p",
    "wh00r",
    "wh0re",
    "whore",
    "whre",
    "xrated",
    "xxx",
    "bch",
    "bitch",
    "blowjob",
    "clit",
    "arschloch",
    "ass",
    "btch",
    "b17ch",
    "b1tch",
    "bastard",
    "bich",
    "boiolas",
    "buceta",
    "bullshit",
    "c0ck",
    "cawk",
    "chink",
    "cipa",
    "clits",
    "cum",
    "dildo",
    "dirsa",
    "ejakulate",
    "fatass",
    "fcuk",
    "fuk",
    "fux0r",
    "hoer",
    "hore",
    "jism",
    "kawk",
    "l3itch",
    "l3ich",
    "masturba",
    "masturbar",
    "masturbacion",
    "masturbate",
    "masturbando",
    "masturbandome",
    "masterbat",
    "masterbat3",
    "sob",
    "mofo",
    "nazi",
    "nutsack",
    "phuck",
    "pimpis",
    "pusse",
    "pussy",
    "scrotum",
    "shemale",
    "slut",
    "smut",
    "teets",
    "tits",
    "boobs",
    "b00bs",
    "teez",
    "testical",
    "testicle",
    "titt",
    "w00se",
    "jackoff",
    "wank",
    "whoar",
    "whore",
    "dyke",
    "@$$",
    "amcik",
    "andskota",
    "arse",
    "assrammer",
    "ayir",
    "bi7ch",
    "bitch",
    "bitchs",
    "bollock",
    "breasts",
    "buttpirate",
    "cabron",
    "cazzo",
    "chraa",
    "chuj",
    "cock",
    "d4mn",
    "daygo",
    "dego",
    "dick",
    "dck",
    "dike",
    "dupa",
    "dziwka",
    "ejackulate",
    "ekrem",
    "ekto",
    "enculer",
    "faen",
    "fag",
    "fanculo",
    "fanny",
    "feces",
    "feg",
    "Felcher",
    "ficken",
    "fitt",
    "flikker",
    "foreskin",
    "fotze",
    "fuk",
    "futkretzn",
    "gook",
    "guiena",
    "h0r",
    "h4x0r",
    "helvete",
    "hoer",
    "honkey",
    "huevon",
    "hui",
    "injun",
    "jizz",
    "kanker",
    "kike",
    "klootzak",
    "kraut",
    "knulle",
    "kuk",
    "kuksuger",
    "Kurac",
    "kurwa",
    "kusi",
    "kyrpa",
    "lesbo",
    "mamhoon",
    "masturbat",
    "merd",
    "mibun",
    "monkleigh",
    "mouliewop",
    "muie",
    "mulkku",
    "muschi",
    "nazis",
    "nepesaurio",
    "nigger",
    "orospu",
    "paska",
    "perse",
    "picka",
    "pierdol",
    "pillu",
    "pimmel",
    "piss",
    "pizda",
    "poontsee",
    "poop",
    "porn",
    "p0rn",
    "pr0n",
    "preteen",
    "pula",
    "pule",
    "puta",
    "putas",
    "puto",
    "putoo",
    "putooo",
    "putos",
    "puton",
    "qahbeh",
    "queef",
    "rautenberg",
    "schaffer",
    "scheiss",
    "schlampe",
    "schmuck",
    "screw",
    "sharmuta",
    "sharmute",
    "shipal",
    "shiz",
    "skribz",
    "skurwysyn",
    "sphencter",
    "spic",
    "spierdalaj",
    "splooge",
    "suka",
    "b00b",
    "testicles",
    "titt",
    "twat",
    "trash",
    "vittu",
    "wank",
    "wetback",
    "wichser",
    "wop",
    "yed",
    "zabourah",
  ];

  // Custom bad words

  const CUSTOM_BAD_WORDS = [
    'subnormal', 'subnormales', 'idiota', 'idiot', 'gilipollas', 'gilipolla', 'jodete', 'jodan', 'jodanse', 'polla', 'pene', 'coño',
    'culo', 'butt', 'imbecil', 'imbeciles', 'retrasado', 'feo', 'culiao', 'weon', 'weones', 'gili', 'asqueroso', /* 'merda', 'mierda', */
    'retraso', 'aborto', 'feto', 'mom', 'mama', 'ugly', 'picha', 'prostituta', 'prostituto', 'prostibulo', 'concha', 'gallito',
    'plla', 'comeme', 'comedme', 'pta', 'puttana', 'putana', 'cagna', 'bastard', 'bastardo', 'perra', 'callate', 'cadela', 'hece',
    'paja', 'pito', 'chupa', 'chupad', 'chupar', 'chupadme', 'chuparme', 'maricon', 'maricone', 'marica', 'marico', 'orto',
    'pelotudo', 'pelotuda', 'verga', 'phuto', 'phuta', 'askeroso', 'ajqueroso', 'askerosa', 'poya', 'cochambroso', 'cochambrosa',
    'mongol', 'mongolo', 'mongola', 'gordo', 'gorda', 'follen', 'follar',
  ];

  CUSTOM_BAD_WORDS.push(...CUSTOM_BAD_WORDS.map((badWord) => badWord + 's'));

  Array.prototype.push.apply(badWords, CUSTOM_BAD_WORDS);

  return new Set(badWords);
})();

function containsBadWords(msg) {
  const words = msg.split(WORD_SPLIT_REGEX).map((word) => normalizeCharacters(word, true).toLowerCase());
  return words.some(word => BAD_WORDS.has(word));
}
