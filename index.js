
var common = require('path/common')
  , resultify = require('resultify')
  , mkdir = resultify(require('mkdirp'))
  , each = require('foreach/series')
  , Parser = require('tar').Parse
  , write = require('writefile')
  , join = require('path/join')
  , Result = require('result')
  , all = require('when-all')

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
			return write(file.path, file.text)
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
			var file = new Result
			files.push(file)
			var buf = ''
			entry.on('data', function(data){
					buf += data
				})
				.on('end', function(){ 
					entry.text = buf
					file.write(entry)
				})
				.on('error', function(e){ file.error(e) })
		})
		.on('error', function(e){ result.error(e) })
		.on('end', function(){
			all(files).then(
				function(v){ result.write(v) },
				function(e){ result.error(e) })
		})
	return result
}
