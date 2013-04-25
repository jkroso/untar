
var untar = require('..')
  , all = require('when-all')
  , read = require('fs').createReadStream

all([
	untar(__dirname+'/compare-equals', read(__dirname+'/equals.tar')),
	untar(__dirname+'/compare-type', read(__dirname+'/type.tar'))
]).read(function(){
	console.log('done!')
})