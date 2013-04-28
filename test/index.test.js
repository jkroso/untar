
var untar = require('..')
  , read = require('fs').createReadStream
  , equals = require('fs-equals')
  , promise = require('laissez-faire')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , request = require('hyperquest')

describe('untar', function () {
	var temp = __dirname + '/temp'
	afterEach(function (done) {
		exec('rm -rf '+temp, done)
	})

	// all files within equals.tar use relative paths
	var eq_tar = __dirname+'/equals.tar'
	var eq_dir = __dirname+'/equals'
	// type.tar was downloaded from github and it uses all relative paths
	var type_tar = __dirname+'/type.tar'
	var type_dir = __dirname+'/type'

	describe('relative paths within the tar', function () {
		it('one excess segment (github format)', function (done) {
			untar(temp, read(type_tar)).then(function(){
				return equals(temp, type_dir)
			}).then(function(ok){
				if (!ok) throw new Error('not equal')
			}).node(done)
		})
		
		it('multiple excess segments', function (done) {
			untar(temp, read(eq_tar)).then(function(){
				return equals(temp, eq_dir)
			}).then(function(ok){
				if (!ok) throw new Error('not equal')
			}).node(done)
		})
	})

	describe('absolute paths within the tar', function () {
		it('should work', function (done) {
			untar(temp, spawn('tar', ['c', eq_dir]).stdout).then(function(){
				return equals(temp, eq_dir)
			}).then(function(ok){
				if (!ok) throw new Error('not equal')
			}).node(done)
		})
	})

	describe('with http response streams', function () {
		it('should work', function (done) {
			download('http://localhost:3009/equals')
				.then(function(stream){
					return untar(temp, stream)
				})
				.then(function(){
					return equals(temp, eq_dir)
				})
				.then(function(ok){
					if (!ok) throw new Error('not equal')
				}).node(done)
		})
	})
})

/**
 * Get a package in the .tar format
 * (String) -> Promise string
 */

function download(url){
	return promise(function(fulfill, reject){
		getURL(url, function(e, res){
			if (e) reject(e)
			else fulfill(res)
		})
	})
}

/**
 * send request
 * (String, (error, response) -> nil) -> nil
 */

function getURL(url, cb){
	var stream = request(url)
	stream.on('response', function response(response){
		if (response.statusCode != 200) {
			cb(new Error('status code ' + response.statusCode))
		} else {
			stream.removeListener('error', cb)
			cb(null, stream)
		}
	})
	stream.on('error', cb)
}