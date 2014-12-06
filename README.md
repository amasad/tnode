tnode
=====
### Run Flow type annotated code in node

`tnode` is a very light wrapper around your `node` executable that strips [Flow type annotation syntax](http://flowtype.org/docs/type-annotations.html#_) from your code before
calling into node.

You use it exactly like the regular `node` executable.


How does this magic work?
-------------------------

`tnode` invokes a node instance with a patched `require.extensions['.js']`
function, which strips type annotations from your code.

Under the hood, this command:

``` bash
$ tnode foo.js all the args
```

Turns into something like this:

``` bash
$ TNODE_ENTRY_POINT=foo.js node fallback.js all the args
```

Installation
------------

Install the `tnode` executable via npm:

``` bash
$ npm install -g tnode
```

Programmatic API
----------------

You can also just `require('tnode')` in a script _without any annotations, and
then `require()` any other .js file that has annotations after that.

``` js
require('tnode');
var wow = require('./someTypedCode');
// etc…
```

Thanks to gnode!
----------------

This is a fork of [`gnode`](https://github.com/TooTallNate/gnode) that is
modified to work with Flow type syntax.
