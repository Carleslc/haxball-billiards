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
    this.queue = [];
  }
  add(event) {
    if (typeof event === 'function') {
      this.queue.push(event);
    }
  }
  call() {
    this.queue.forEach(event => event());
  }
  consume() {
    while (this.queue.length > 0) {
      this.queue.shift()();
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
