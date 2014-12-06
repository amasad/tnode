
/**
 * This cli.js test file tests the `tnode` wrapper executable via
 * `child_process.spawn()`. Generator syntax is *NOT* enabled for these
 * test cases.
 */

var path = require('path');
var assert = require('assert');
var semver = require('semver');
var spawn = require('child_process').spawn;

// node executable
var node = process.execPath || process.argv[0];
var tnode = path.resolve(__dirname, '..', 'bin', 'tnode');

// chdir() to the "test" dir, so that relative test filenames work as expected
process.chdir(path.resolve(__dirname, 'cli'));

describe('command line interface', function () {

  this.slow(1000);
  this.timeout(2000);

  cli([ '-v' ], 'should output the version number', function (child, done) {
    buffer(child.stdout, function (err, data) {
      assert(semver.valid(data.trim()));
      done();
    });
  });

  cli([ '--help' ], 'should output the "help" display', function (child, done) {
    buffer(child.stdout, function (err, data) {
      assert(/^Usage\: node/.test(data));
      done();
    });
  });

  cli([ 'check.js' ], 'should quit with a SUCCESS exit code', function (child, done) {
    child.on('exit', function (code) {
      assert(code == 0, 'tnode quit with exit code: ' + code);
      done();
    });
  });

  cli([ 'nonexistant.js' ], 'should quit with a FAILURE exit code', function (child, done) {
    child.on('exit', function (code) {
      assert(code != 0, 'tnode quit with exit code: ' + code);
      done();
    });
  });

  cli([ 'argv.js', '1', 'foo' ], 'should have a matching `process.argv`', function (child, done) {
    buffer(child.stdout, function (err, data) {
      if (err) return done(err);
      data = JSON.parse(data);
      assert('argv.js' == path.basename(data[1]));
      assert('1' == data[2]);
      assert('foo' == data[3]);
      done();
    });
  });

  cli([], 'should work properly over stdin', function (child, done) {
    child.stdin.end(
      'var assert = require("assert");' +
      'function test (a: number) { return a};' +
      'var t = test(a);' +
      'assert(1 == a);'
    );
    child.on('exit', function (code) {
      assert(code == 0, 'tnode quit with exit code: ' + code);
      done();
    });
  });

  if (!/^v0.8/.test(process.version)) cli(['-p', 'function test (a: number) {return a}; test(3)'], 'should print result with -p', function (child, done) {
    var async = 2
    buffer(child.stdout, function (err, data) {
      if (err) return done(err);
      assert('3' == data.trim(), 'tnode printed ' + data);
      --async || done();
    });
    child.on('exit', function (code) {
      assert(code == 0, 'tnode quit with exit code: ' + code);
      --async || done();
    });
  });

  cli(['-e', 'function test (a: number) {return a}; console.log(test(3));'], 'should print result with -p', function (child, done) {
    var async = 2
    buffer(child.stdout, function (err, data) {
      if (err) return done(err);
      assert('3' == data.trim(), 'expected 3, got: ' + data);
      --async || done();
    });

    child.on('exit', function (code) {
      assert(code == 0, 'tnode quit with exit code: ' + code);
      --async || done();
    });
  });


  cli(['-e', 'console.log(JSON.stringify(process.argv))', 'a', 'b', 'c'], 'should pass additional arguments after -e', function (child, done) {
    var async = 2
    buffer(child.stdout, function (err, data) {
      if (err) return done(err);
      data = JSON.parse(data)
      assert.deepEqual(['a', 'b', 'c'], data.slice(2))
      --async || done();
    });
    child.on('exit', function (code) {
      assert(code == 0, 'tnode quit with exit code: ' + code);
      --async || done();
    });
  });
});


function cli (argv, name, fn) {
  describe('tnode ' + argv.join(' '), function () {
    it(name, function (done) {
      var child = spawn(node, [ tnode ].concat(argv));
      fn(child, done);
    });
  });
}

function buffer (stream, fn) {
  var buffers = '';
  stream.setEncoding('utf8');
  stream.on('data', ondata);
  stream.on('end', onend);
  stream.on('error', onerror);

  function ondata (b) {
    buffers += b;
  }
  function onend () {
    stream.removeListener('error', onerror);
    fn(null, buffers);
  }
  function onerror (err) {
    fn(err);
  }
}
