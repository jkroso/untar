
var symlink = require('lift-result/fs').symlink
var liftCPS = require('lift-result/cps')
var lift = require('lift-result')
var each = require('foreach/series')
var writeFile = require('writefile')
var mkdir = liftCPS(require('mkdirp'))
var common = require('path/common')
var Parser = require('tar').Parse
var join = require('path/join')
var Result = require('result')

/**
 * Place the contents of the `tar` stream into the
 * `dest` directory
 *
 * @param {String} dest
 * @param {Stream} pkg
 * @return {Result}
 */

module.exports = lift(function(dest, tar){
	var entries = mutatePaths(getEntries(tar), dest)
	return each(entries, write)
})

/**
 * map old paths to their news ones within `dest`
 * it will also filter out any top level
 * directories with no files in them
 *
 * @param {Array} files
 * @param {String} dest
 * @return {Array}
 */

var mutatePaths = lift(function(files, dest){
	var fat = common(files
		.filter(notDirectory)
		.map(getPath))
	var chop = makeChopper(fat)
	return files.filter(function(file){
		var relative = chop(file.path)
		file.path = join(dest, relative)
		return Boolean(relative)
	})
})

function getPath(entry){
	return entry.path
}

function notDirectory(entry){
	return entry.type != 'Directory'
}

/**
 * write entry to disk
 *
 * @param {Entry} file
 * @return {Result}
 * @api private
 */

function write(file){
	var meta = file.props
	switch (file.type) {
		case 'Directory': return mkdir(file.path)
		case 'SymbolicLink': return symlink(meta.linkpath, file.path)
		default: return writeFile(file.path, file.buf)
	}
}

/**
 * make a function which will chop `fat` from paths
 * its given
 *
 *   chopper('/a')('/a/b') // => 'b'
 *
 * @param {String} fat
 * @return {Function}
 * @api private
 * TODO: simplify
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
 * pull an array of entries out of the `tar` stream
 *
 * @param {Stream} pkg
 * @return {Result}
 * @api private
 */

// fuck streaming tars sucks! I'm buffering their contents
// here because pausing one stream causes the whole
// parsing stream to pause which means I don't get any
// more entries which means the process never completes

function getEntries(tar){
	var result = new Result
	var files = []
	tar.pipe(new Parser)
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
			.on('error', onError)
	})
	.on('error', onError)
	.on('end', function(){
		result.write(files)
	})

	function onError(e){
		result.error(e)
	}

	return result
}