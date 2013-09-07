
var lift = require('lift-result/cps')
var each = require('foreach/series')
var mkdir = lift(require('mkdirp'))
var common = require('path/common')
var Parser = require('tar').Parse
var write = require('writefile')
var join = require('path/join')
var Result = require('result')

/**
 * Place the contents of a tar stream into the 
 * `dest` directory
 * 
 * @param {String} dest
 * @param {Stream} pkg
 * @return {Result}
 */

module.exports = function(dest, pkg){
	return unpack(pkg).then(function(files){
		var paths = files
			.filter(function(f){ return f.type != 'Directory' })
			.map(function(f){ return f.path })

		var chop = makeChopper(common(paths))
		// compute paths and drop unnecessary dirs
		files = files.filter(function(file){
			var relative = chop(file.path)
			file.path = join(dest, relative)
			return relative
		})

		// write
		return each(files, function(file){
			if (file.type == 'Directory') return mkdir(file.path)
			return write(file.path, file.buf)
		})
	})
}

/**
 * generate a function which chops `fat` from paths
 * (String) -> (String) -> String
 */

function makeChopper(fat){
	var tail = ''
	var regex = fat.split('/').reduce(function(regex, seg){
		tail += ')?'
		return regex + '(?:\\/' + seg
	})
	regex += tail
	// make the first slash optional
	regex = regex.replace(/^\(\?:\\\//, '(?:\\/?')
	regex = new RegExp('^'+regex+'\\/?')

	return function(path){
		return path.replace(regex, '')
	}
}

/**
 * unpack the contents `pkg` into an Object
 * 
 * @param {Stream} pkg
 * @return {Result}
 */
// fuck streaming tars sucks! I'm buffering their contents 
// here because pausing one stream causes the whole
// parsing stream to pause which means I don't get any
// more entries which means the process never completes
function unpack(pkg){
	var result = new Result
	var files = []
	pkg.pipe(new Parser)
		.on('entry', function(entry){
			files.push(entry)
			var buf = []
			entry
				.on('data', function(chunk){
					buf.push(chunk)
				})
				.on('end', function(){
					entry.buf = Buffer.concat(buf)
				})
				.on('error', error)
		})
		.on('error', error)
		.on('end', function(){
			result.write(files)
		})
	function error(e){
		result.error(e)
	}
	return result
}
