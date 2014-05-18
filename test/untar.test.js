
var equals = require('fs-equals/assert')
var assert = require('better-assert')
var result = require('result/defer')
var child = require('child_process')
var request = require('solicit')
var http = require('http')
var path = require('path')
var untar = require('..')
var fs = require('fs')

var read = fs.createReadStream
var spawn = child.spawn
var exec = child.exec

http.createServer(function(req, res){
  var dir = path.join(__dirname, req.url)
  spawn('tar', ['c', dir]).stdout.pipe(res)
}).listen(3009)

var temp = __dirname + '/temp'
beforeEach(function(done){
  exec('rm -rf '+temp, done)
})

// all files within equals.tar use relative paths
var eq_tar = __dirname+'/equals.tar'
var eq_dir = __dirname+'/equals'
// type.tar was downloaded from github and it uses all relative paths
var type_tar = __dirname+'/type.tar'
var type_dir = __dirname+'/type'

describe('relative paths within the tar', function(){
  it('one excess segment (github format)', function(done){
    untar(temp, read(type_tar)).then(function(){
      return equals(temp, type_dir)
    }).node(done)
  })

  it('multiple excess segments', function(done){
    untar(temp, read(eq_tar)).then(function(){
      return equals(temp, eq_dir)
    }).node(done)
  })
})

describe('absolute paths within the tar', function(){
  it('should work', function(done){
    untar(temp, spawn('tar', ['c', eq_dir]).stdout).then(function(){
      return equals(temp, eq_dir)
    }).node(done)
  })
})

describe('with http response streams', function(){
  it('should work', function(done){
    return untar(temp, get('http://localhost:3009/equals'))
      .then(function(){
        return equals(temp, eq_dir)
      }).node(done)
  })
})

describe('with assorted file encodings', function(){
  it('should handle image files', function(done){
    untar(temp, read(__dirname + '/connect.tar')).then(function(){
      return equals(temp, __dirname + '/connect')
    }).node(done)
  })
})

describe('with symlinks', function(){
  it('should still be symlinks', function(done){
    // sym.tar contains a symlinked index.js -> light.js
    untar(temp, read(__dirname + '/syms.tar')).then(function(){
      var stat= fs.lstatSync(temp + '/index.js')
      if (!stat.isSymbolicLink()) {
        throw new Error('failed to handle symlink')
      }
    }).node(done)
  })
})

after(function(done){
  exec('rm -rf '+temp, done)
})

function get(url){
  return request.get(url).response
}
