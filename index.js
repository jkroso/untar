
var common = require('path/common')
  , join = require('path/join')
  , Promise = require('laissez-faire/full')
  , parse = require('tar-parse')
  , each = require('foreach/async-promised')
  , write = require('writefile/stream')

/**
 * Place the contents of a tar stream into the 
 * `dest` directory
 * (String dir, Stream tar) -> Promise nil
 */

module.exports = function(dest, pkg){
	return unpack(pkg).then(function(files){
		var base = common(Object.keys(files))
			.replace(/^\//, '')
			.replace('/', '\\/')
		var regx = new RegExp('^\\/?'+base+'\\/?')
		return each(files, function(stream, path){
			path = join(dest, path.replace(regx, ''))
			var promise = write(path, stream)
			stream.resume()
			return promise
		})
	})
}

/**
 * unpack the contents `pkg` into an Object
 * (Stream) -> Promise object
 */

function unpack(pkg){
	var p = new Promise
	var files = {}
	pkg.pipe(parse())
		.on('data', function(entry){
			if (entry.type != 'File') return
			files[entry.path] = entry
			entry.pause()
		})
		.on('error', function(e){ p.reject(e) })
		.on('end', function(){ p.fulfill(files) })
	return p
}
