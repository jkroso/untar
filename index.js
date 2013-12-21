
var mkdir = require('lift-result/cps')(require('mkdirp'))
var extract = require('tar-stream/extract')
var writeFile = require('writefile/stream')
var each = require('foreach/series')
var common = require('path/common')
var fs = require('lift-result/fs')
var lift = require('lift-result')
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
		var relative = chop(file.name)
		file.name = join(dest, relative)
		return Boolean(relative)
	})
})

function getPath(entry){
	return entry.name
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
	switch (file.type) {
		case 'directory':	return mkdir(file.name)
		case 'symlink': return fs.symlink(file.linkname, file.name)
		case 'file': return writeFile(file.name, file.body)
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

function getEntries(tar){
	var result = new Result
	var files = []
	tar.pipe(extract())
		.on('entry', function(header, stream, next){
			files.push(header)
			header.body = stream
			stream._writableState.highWaterMark = Infinity
			stream._readableState.highWaterMark = Infinity
			next()
		})
		.on('error', function onError(e){
			result.error(e)
		})
		.on('finish', function(){
			result.write(files)
		})
	return result
}
