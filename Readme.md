
# untar

  A simple tar file unpacker. tar files are a bit of a box of chocolates in that you never know what the top level directory within them is going to be called or how many excess directories there might be. This module takes care of that problem by chopping off all unnecessary path segments as it writes files to your destination directory.

## Getting Started

_With npm_  

	$ npm install untar --save

then in your app:

```js
var untar = require('untar')
```

## API

- [untar()](#untar)

### untar(path:String, tarfile:Stream)

The untar function takes a path to a target directory and a stream for a tar file. It returns a [Result](//github.com/jkroso/result).

## Running the tests

```bash
$ npm install
$ node test/server & make test
```

## todo

add a separate function for handling buffered tars