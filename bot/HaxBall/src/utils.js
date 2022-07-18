/* JavaScript utils (non-HaxBall specific) */

// Math

// Coordinate distances between two points
// Is equivalent to the vector (b.x, b.y) - (a.x, a.y)
function diff(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y
  };
}

// Euclidian distance between two points
function distance(a, b) { 
  const { x, y } = diff(a, b);
  return Math.hypot(x, y); // Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2)
}

// Manhattan distance between two points
function manhattan(a, b) {
  const { x, y } = diff(a, b);
  return Math.abs(x) + Math.abs(y);
}

// Normalize a vector to its unit vector (length 1)
// v = diff(a, b)
function normalizeVector(v) {
  const norm = Math.hypot(v.x, v.y);
  return {
    x: v.x / norm,
    y: v.y / norm
  };
}

/** Normalize x with values [minX, maxX] to [a, b] */
function normalizeDistance(x, minX, a, maxX, b) {
  return a + (((x - minX) * (b - a)) / (maxX - minX));
}

function fixNan(n, replacement = '-') {
  return isNaN(n) ? replacement : n;
}

function roundDecimals(n, decimals = 0) {
  const power10 = 10 ** decimals;
  return Math.round(n * power10) / power10;
}

function rate(calc, { scale = 100, decimals = 0, defaultValue = 0 } = {}) {
  calc = fixNan(calc, defaultValue);
  return String(roundDecimals(calc * scale, decimals)) + (scale === 100 ? '%' : '');
}

function gcd(a, b, tolerance = 1e-15) {
  // Limited precision
  return (b < tolerance) ? Math.abs(a) : gcd(b, a%b);
}

function reduceFraction(numerator, denominator, precision = 15) {
  numeratorSign = Math.sign(numerator);
  denominatorSign = Math.sign(denominator);
  numerator = Math.trunc(Math.abs(numerator));
  denominator = Math.trunc(Math.abs(denominator));
  const g = gcd(numerator, denominator || 1, 10 ** (-precision));
  return [numeratorSign * Math.round(numerator/g), (denominatorSign * Math.round(denominator/g)) || 1];
}

function toFraction(n, precision = 15) {
  if (!Number.isFinite(n)) {
    return [n, 1];
  }
  n = roundDecimals(n, precision);
  const integral = n - Math.trunc(n);
  const power10 = 10 ** (integral ? (String(integral).length - 2) : 0);
  return reduceFraction(n * power10, power10, precision);
}

class Line {

  // Line with the vector (mx, my) that passes through a center point
  // y = (my / mx) * (x - center.x) + center.y
  constructor(mx, my, center = [0, 0]) {
    this.mx = mx;
    this.my = my;
    this.centerAt(center);
  }

  // Line from the general equation: a*x + b*y + c = 0
  static fromGeneral(a, b, c) {
    // Ax + By + C = 0  =>  -By = Ax + C  =>  y = (A / -B) * x + (C / -B)
    return new Line(-b, a, [0, -c/b]);
  }

  // Line with the slope m with intercept b on the y axis (origin)
  // y = m*x + b
  static fromSlope(m, b = 0) {
    if (!Number.isFinite(m)) {
      return Line.vertical(b);
    }
    const mFraction = toFraction(m);
    return new Line(mFraction[1], mFraction[0], [0, b]);
  }

  // Vertical line
  static vertical(x) {
    return new Line(0, 1, [x, 0]);
  }

  // Horizontal line
  static horizontal(y) {
    return new Line(1, 0, [0, y]);
  }

  // (x - center.x) / mx = (y - center.y) / my
  // my*x - my*center.x = mx*y - mx*center.y
  // y*mx = my*x - my*center.x + mx*center.y
  // y = (my / mx) * x - (my / mx) * center.x + center.y
  centerAt(center = [0, 0]) {
    this.center = position(center);

    if (this.isVertical()) {
      this.b = this.center.x === 0 ? this.center.y : undefined;
    } else {
      this.b = this.center.y - this.slope() * this.center.x;
    }
  }

  slope() {
    return this.my / this.mx;
  }

  isVertical() { // x = center.x
    return this.mx === 0;
  }

  isHorizontal() { // y = center.y
    return this.my === 0;
  }

  // Perpendicular line to this line that passes through a point
  perpendicular(point = null) {
    // y = m*x + b  =>  point.y = (this.mx / -this.my) * point.x + b
    // b = point.y - (this.mx / -this.my) * point.x
    return new Line(-this.my, this.mx, point || this.center);
  }

  // Calculate the intersection point between this line and another line
  intersect(line) {
    // y = m*x + b,  y = m'*x + b'  =>  m*x + b = m'*x + b'  =>  x*(m - m') = b' - b
    // x = (b' - b) / (m - m')  =>  x = (b' - b) / ((my / mx) - (my' / mx'))
    // x = (line.b - this.b) / (this.slope() - line.slope())
    if (line instanceof Line) {
      let x, y;
      if (this.equals(line)) {
        x = this.center.x;
        y = this.center.y;
      } else if (this.isVertical()) {
        ({ x, y } = this.__intersectVertical(line));
      } else if (line.isVertical()) {
        ({ x, y } = line.__intersectVertical(this));
      } else {
        // y = m*x + b,  y = m'*x + b'  =>  m*x + b = m'*x + b'  =>  x*(m - m') = b' - b
        // x = (b' - b) / (m - m')  =>  x = (b' - b) / ((my / mx) - (my' / mx'))
        // x = (line.b - this.b) / (this.slope() - line.slope())
        const m = this.slope();
        const lm = line.slope();
        const mDiff = m - lm;
        if (mDiff === 0) {
          return null; // no intersection
        }
        x = (line.b - this.b) / mDiff;
        // y = (my / mx) * x + b
        y = m * x + this.b;
      }
      return position(x, y);
    }
    return undefined;
  }

  __intersectVertical(line) {
    // x = center.x,  y = m'*x + b'
    let x, y;

    x = this.center.x;
        
    if (line.isVertical()) {
      if (line.center.x === x) {
        y = line.center.y;
      } else {
        return null; // no intersection
      }
    } else {
      // y = (line.my / line.mx)*(this.center.x) + line.b
      y = line.slope() * x + line.b;
    }

    return { x, y };
  }

  // Euclidian distance between a point and this line
  distanceToPoint(point) {
    if (this.isVertical()) {
      return Math.abs(this.center.x - point.x);
    }
    const m = this.slope();
    return Math.abs(m * point.x - point.y + this.b) / Math.sqrt(m*m + 1);
  }

  mirrorCoordinates(mirrorX, mirrorY) {
    let mx = mirrorX ? -this.mx : this.mx;
    let my = mirrorY ? -this.my : this.my;
    let centerX = mirrorX ? -this.center.x : this.center.x;
    let centerY = mirrorY ? -this.center.y : this.center.y;
    return new Line(mx, my, [centerX, centerY]);
  }

  copy() {
    return this.mirrorCoordinates(false, false);
  }

  equals(line) {
    return this.mx === line.mx && this.my === line.my && this.center.equals(line.center);
  }

  // Input for https://www.wolframalpha.com/
  toString(range = [[-400, 400], [-300, 300]]) {
    let line;
    if (this.isHorizontal()) {
      // line (horizontal): y = center.y
      line = `y = ${this.center.y}`;
    } else if (this.isVertical()) {
      // line (vertical): x = center.x
      line = `x = ${this.center.x}`;
    } else {
      // line: y = m * x + b
      line = 'y = ';
      const m = this.slope();
      if (m) {
        line += `${m} * x`;
      }
      if (this.b) {
        line += ` ${this.b > 0 ? '+' : '-'} ${Math.abs(this.b)}`;
      }
    }
    if (range) {
      line += `, x from ${range[0][0]} to ${range[0][1]}, y from ${range[1][0]} to ${range[1][1]}`;
    }
    return line;
  }
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(p) {
    return this.x === p.x && this.y === p.y;
  }
  closeTo(p, threshold = 5) {
    return p && distance(this, p) <= threshold;
  }
  toString() {
    return `{${this.x}, ${this.y}}`;
  }
  static compareX(p1, p2) {
    return p1.x - p2.x;
  }
  static compareY(p1, p2) {
    return p1.y - p2.y;
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

function medianPosition(positions) {
  const sortedX = [];
  const sortedY = [];
  
  positions.forEach((pos) => {
    insertSorted(sortedX, pos.x);
    insertSorted(sortedY, pos.y);
  });

  return position(median(sortedX), median(sortedY));
}

// Collections

function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function median(sorted) {
  if (sorted.length === 0) {
    return null;
  }
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function insertSorted(array, x, compare = (p1, p2) => (p1 - p2), from = 0, to = undefined) {
  from = Math.max(0, from);
  to = to !== undefined ? Math.min(to, array.length) : array.length;

  if (from >= to) {
    array.splice(to, 0, x);
    return array;
  }

  const mid = Math.floor((to + from) / 2);

  const comp = compare(array[mid], x);

  if (comp > 0) {
    return insertSorted(array, x, compare, from, mid);
  } else if (comp < 0) {
    return insertSorted(array, x, compare, mid + 1, to);
  }

  // comp === 0
  let i = mid + 1;
  while (i < to && compare(array[i], x) === 0) {
    i++;
  }
  return insertSorted(array, x, compare, i, i);
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

function addDays(date, days) {
  return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
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

const FETCH = BUILD === 'node' ? require('node-fetch') : window.fetch;

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

  return FETCH(url, params)
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
  canLog(level) {
    return (level || this.level) <= this.level;
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
    console.warn('⚠️', ...msg);
  }
  error(...msg) {
    console.error('❌', ...msg);
  }
}

const LOG = new Logger(PRODUCTION ? LOG_LEVEL[LOG_LEVEL_PRODUCTION] : LOG_LEVEL.DEBUG);
