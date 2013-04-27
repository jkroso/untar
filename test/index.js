
var untar = require('..')
  , all = require('when-all/naked')
  , read = require('fs').createReadStream
  , equals = require('fs-equals')
  , exec = require('child_process').exec

var a = __dirname+'/equals.tar'
var ac = __dirname+'/compare-equals'
var b = __dirname+'/type.tar'
var bc = __dirname+'/compare-type'

all(
	untar(ac, read(a)).then(function(){
		return equals(ac, __dirname+'/equals/master')
	}),
	untar(bc, read(b)).then(function(){
		return equals(bc, __dirname+'/type')
	})
).read(function(res){
	if (!res[0]) throw new Error(ac+' failed')
	if (!res[1]) throw new Error(bc+' failed')

	exec('rm -r '+ac, function(e){
		if (e) throw e
		exec('rm -r '+bc, function(e){
			if (e) throw e
			console.log('done!')
		})
	})
})