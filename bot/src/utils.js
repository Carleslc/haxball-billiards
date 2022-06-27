/* JavaScript utils (non-HaxBall specific) */

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

function distance(a, b) {
  return Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(p) {
    return this.x === p.x && this.y === p.y;
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

class EventQueue {
  constructor() {
    this.registered = new Set();
    this.queue = [];
  }
  add(name, callback) {
    if (!this.registered.has(name) && typeof callback === 'function') {
      this.registered.add(name);
      this.queue.push({ name, callback });
      LOG.debug(name, '(DELAY)');
    } else {
      LOG.debug('Already added', name);
    }
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
    this._level = level;
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

const LOG = new Logger();
