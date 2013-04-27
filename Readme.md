
# untar

  A simple tar file unpacker. tar files are a bit of a box of chocolates in that you never know what the top level directory within them is going to be called or how many excess directories there might be. This function takes care of that problem by chopping off all unnecessary path segments.

## Getting Started

_With npm_  

	$ npm install untar --save

then in your app:

```js
var untar = require('untar')
```

## API

- [untar()](#untar)

### untar(String, Stream)

The untar function takes a path to a target directory and a stream for a tar file. It returns a promise which will resolve on completion. 

## Running the tests

```bash
$ npm install
$ node test
```
## todo

add a separate function for handling buffered tars

## License 

[MIT](License)