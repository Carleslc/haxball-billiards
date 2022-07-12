/* JavaScript utils (non-HaxBall specific) */

// Strings

const WORD_SPLIT_REGEX = /\s+/;
const DIGITS_REGEX = /[0-9]/g;
const SPECIAL_CHARS_REGEX = /[^A-Za-z0-9]/gu;
const SPECIAL_CHARS_REGEX_NO_DIGITS = /[^A-Za-z]/gu;

const DIGIT_CHAR_MAPPING = {
  '0': 'o',
  '1': 'i',
  '2': 's',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'o',
  '9': 'u',
};

function normalizeCharacters(s, digitsToChar = false) {
  s = s.normalize('NFKD').replace(digitsToChar ? SPECIAL_CHARS_REGEX : SPECIAL_CHARS_REGEX_NO_DIGITS, '');

  if (digitsToChar) {
    s = s.replace(DIGITS_REGEX, (digit) => DIGIT_CHAR_MAPPING[digit]);
  }

  return s;
}

// Math

function fixNan(n, replacement = '-') {
  return isNaN(n) ? replacement : n;
}

function rate(calc, { scale = 100, decimals = 0, defaultValue = 0 } = {}) {
  calc = fixNan(calc, defaultValue);
  const power10 = +('1'.padEnd(decimals + 1, '0'));
  return String(Math.round(calc * scale * power10) / power10) + (scale === 100 ? '%' : '');
}

// Collections

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function findAllIndexes(array, condition) {
  const indexes = [];

  array.forEach((e, i) => {
    if (condition(e)) {
      indexes.push(i);
    }
  });

  return indexes;
}

function filter(set, condition) {
  const items = [];
  
  set.forEach((e) => {
    if (condition(e)) {
      items.push(e);
    }
  });

  return items;
}

// Date & Time

function getDateString(ms, locale = 'en-US', options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) {
  return new Date(ms).toLocaleDateString(locale, options);
}

function getDuration(seconds, includeSeconds = false) {
  let durationString = '';

  const hours = Math.trunc(seconds / 3600);

  if (hours > 0) {
    durationString += hours + 'h ';
    seconds -= hours * 3600;
  }

  const minutes = Math.trunc(seconds / 60);

  if (minutes > 0 || (!includeSeconds && !durationString.length)) {
    durationString += minutes + 'm ';
    seconds -= minutes * 60;
  }

  seconds = Math.floor(seconds);

  if (includeSeconds && (seconds > 0 || !durationString.length)) {
    durationString += seconds + 's';
  }

  return durationString.trim();
}

// Distance

function distance(a, b) {
  return Math.hypot((b.x - a.x), (b.y - a.y)); // Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2)
}

/** Normalize x with values [minX, maxX] to [a, b] */
function normalizeDistance(x, minX, a, maxX, b) {
  return a + (((x - minX) * (b - a)) / (maxX - minX));
}

// Position

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(p) {
    return this.x === p.x && this.y === p.y;
  }
  closeTo(p, threshold = 5) {
    return p && Math.abs(this.x - p.x) <= threshold && Math.abs(this.y - p.y) <= threshold;
  }
}

function position(x, y) {
  if (typeof x === 'object') {
    if (x instanceof Array) {
      return new Position(x[0], x[1]);
    }
    return new Position(x.x, x.y);
  }
  if (typeof x === 'number' && typeof y === 'number') {
    return new Position(x, y);
  }
  return new Position(0, 0);
}

// Events

class EventQueue {
  constructor() {
    this.registered = new Set();
    this.queue = [];
  }
  add(name, callback, multiple = false, priority = false) {
    if (multiple || !this.has(name)) {
      this.registered.add(name);

      const subscription = { name, callback };

      if (priority) {
        this.queue.unshift(subscription);
      } else {
        this.queue.push(subscription);
      }
      LOG.debug(name, '(DELAY)');
    } else if (USING_RULES.ONE_SHOT_EACH_PLAYER) { // Avoid spamming multiple ball kicks
      LOG.debug('Already added', name);
    }
  }
  has(name) {
    return this.registered.has(name);
  }
  call() {
    this.queue.forEach(({ callback }) => callback());
  }
  consume() {
    while (this.queue.length > 0) {
      const { name, callback } = this.queue.shift();
      LOG.debug(`${name} (CALLBACK)`);
      callback();
      this.registered.delete(name);
    }
  }
  size() {
    return this.queue.length;
  }
}

function getCaller(f) {
  return (f.caller && f.caller.name) || '';
}

function isDeclared(variable) {
  if (typeof variable === 'function') {
    // () => variable;
    try {
      variable();
      return true;
    } catch(e) {
      if (e.name === 'ReferenceError') {
        return false;
      } else {
        throw e;
      }
    }
  }
  return this.hasOwnProperty(variable);
}

// HTTP

function fetchWrap(method, url, body = undefined, auth = undefined) {
  const params = {
    method,
    headers: {}
  };

  if (body) {
    params.body = JSON.stringify(body);
    params.headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    params.headers['Authorization'] = `Bearer ${auth}`;
  }

  return fetch(url, params)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.json();
    }).catch((e) => {
      if (typeof e.json === 'function') { // rejected response
        try {
          return e.json()
            .then(({ error }) => Promise.reject(error)) // API error
            .catch((error) => Promise.reject({ status: e.status, error }));
        } catch (jsonError) {
          return Promise.reject({ status: e.status, error: jsonError });
        }
      }
      return Promise.reject({ status: e.status, error: e });
    });
}

function GET(url, auth = API_SECRET) {
  return fetchWrap('GET', url, null, auth);
}

function POST(url, body, auth = API_SECRET) {
  return fetchWrap('POST', url, body, auth);
}

// Logging

const LOG_LEVEL = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4
};

const CONSOLE_LOG = {
  DEBUG: console.debug,
  INFO: console.info,
  DIR: console.dir,
  LOG: console.log,
  WARN: console.warn,
  ERROR: console.error
};

const NO_LOG = (_) => {};

class Logger {
  constructor(level = LOG_LEVEL.INFO) {
    this.level = level;
  }
  get level() {
    return this._level;
  }
  set level(value) {
    console.error = value > LOG_LEVEL.ERROR ? NO_LOG : CONSOLE_LOG.ERROR;
    console.warn = value > LOG_LEVEL.WARNING ? NO_LOG : CONSOLE_LOG.WARNING;

    if (value > LOG_LEVEL.INFO) {
      console.info = NO_LOG;
      console.log = NO_LOG;
      console.dir = NO_LOG;
    } else {
      console.info = CONSOLE_LOG.INFO;
      console.log = CONSOLE_LOG.LOG;
      console.dir = CONSOLE_LOG.DIR;
    }
    
    console.debug = value > LOG_LEVEL.DEBUG ? NO_LOG : CONSOLE_LOG.DEBUG;
  }
  info(...msg) {
    console.info(...msg);
  }
  log(...msg) {
    console.log(...msg);
  }
  debug(...msg) {
    console.debug(...msg);
  }
  warn(...msg) {
    console.warn(...msg);
  }
  error(...msg) {
    console.error(...msg);
  }
}

const LOG = new Logger(PRODUCTION ? LOG_LEVEL[LOG_LEVEL_PRODUCTION] : LOG_LEVEL.DEBUG);
