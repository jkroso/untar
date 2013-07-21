
var connect = require('../');

var app = connect()
  .use(connect.timeout(300))
  .use(function(req, res){
    res.end('Hello');
  });

describe('connect.timeout()', function(){
  describe('when below the timeout', function(){
    it('should do nothing', function(done){
      app.request()
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when above the timeout', function(){
    describe('with no response made', function(){
      it('should respond with 408 Request timeout', function(done){
        var app = connect()
          .use(connect.timeout(300))
          .use(function(req, res){
            setTimeout(function(){
              res.end('Hello');
            }, 400);
          });

        app.request()
        .get('/')
        .expect(503, done);
      })

      it('should pass the error to next()', function(done){
        var app = connect()
          .use(connect.timeout(300))
          .use(function(req, res){
            setTimeout(function(){
              res.end('Hello');
            }, 400);
          })
          .use(function(err, req, res, next){
            res.statusCode = err.status;
            res.end('timeout of ' + err.timeout + 'ms exceeded');
          });

        app.request()
        .get('/')
        .expect('timeout of 300ms exceeded', done);
      })
    })

    describe('with a partial response', function(){
      it('should do nothing', function(done){
        var app = connect()
          .use(connect.timeout(300))
          .use(function(req, res){
            res.write('Hello');
            setTimeout(function(){
              res.end(' World');
            }, 400);
          });

        app.request()
        .get('/')
        .expect('Hello World', done);
      })
    })
  })

  describe('req.clearTimeout()', function(){
    it('should revert this behavior', function(done){
      var app = connect()
        .use(connect.timeout(300))
        .use(function(req, res){
          req.clearTimeout();
          setTimeout(function(){
            res.end('Hello');
          }, 400);
        });

      app.request()
      .get('/')
      .expect('Hello', done);
    })
  })
})
