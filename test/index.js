
var untar = require('..')
  , all = require('when-all/naked')
  , read = require('fs').createReadStream
  , equals = require('fs-equals')

var a = __dirname+'/equals.tar'
var ac = __dirname+'/compare-equals'
var b = __dirname+'/type.tar'
var bc = __dirname+'/compare-type'

all(
	untar(ac, read(a))
		.then(function(){
			return equals(ac, a)
		}),
	untar(bc, read(b))
		.then(function(){
			return equals(bc, b)
		})
).read(function(res){
	if (!res[0]) throw new Error(ac+' failed')
	if (!res[1]) throw new Error(bc+' failed')
	console.log('done!')
})