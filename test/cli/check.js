var assert = require('assert');

function x(a: string, b: number): number {
  return b;
}

assert.equal(x('a', 1), 1);
