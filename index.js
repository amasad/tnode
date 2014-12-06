var transform = require('jstransform').transform;
var typesSyntax = require('jstransform/visitors/type-syntax');
var fs = require('fs');

// Only apply the global .js require() hook if the require.extensions['.js']
// hook is not already patched by tnode.
if (!isPatchedByTnode()) {
  /**
   * This file replaces the default `.js` require.extensions implementation with
   * one that first compiles the JavaScript code via "jstransform".
   *
   * Once that is in place then it loads the original entry point .js file.
   */

  require.extensions['.js'] = tnodeJsExtensionCompiler;
}

/**
 * Type syntax enabled `require.extensions['.js']` hook.
 *
 * @api public
 */

function tnodeJsExtensionCompiler (module, filename) {
  var content = fs.readFileSync(filename, 'utf8');

  // remove the Byte Order Marker if present
  content = stripBOM(content);

  // strip away the shebang if present
  content = stripShebang(content);

  if (!isValid(content)) {
    content = compile(content);
  }

  module._compile(content, filename);
}

/**
 * Strips type syntax
 *
 * @api public
 */

function compile(code) {
  return transform(typesSyntax.visitorList, code).code;
}

exports.compile = compile;

function isValid(content) {
  try {
    Function('', content);
    return true;
  } catch (ex) {
    return false;
  }
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 *
 * Copied directly from joyent/node's lib/module.js
 *
 * @api private
 */

function stripBOM (content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Strips away the "shebang" from the source file if present.
 *
 * Copied directly from joyent/node's lib/module.js
 *
 * @api private
 */

function stripShebang (content) {
  return content.replace(/^\#\!.*/, '');
}

/**
 * Check if require.extensions['.js'] is already patched by gnode
 *
 * @api private
 */

function isPatchedByTnode () {
  return 'gnodeJsExtensionCompiler' == require.extensions['.js'].name;
}
