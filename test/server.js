
var http = require('http')
  , path = require('path')
  , spawn = require('child_process').spawn

http.createServer(function(req, res){
	var dir = path.join(__dirname, req.url)
	spawn('tar', ['c', dir]).stdout.pipe(res)
}).listen(3009, function(){
  console.log('server listening on port 3009')
});
