
var http = require('http');
var express = require('express');
var Primus = require('primus');
var request = require('supertest');
var should = require('should');
var cookie = require('cookie');
var primusExpressSession = require('../');

var secret = 'your secret here';

// first app with cookie sessions

var app = express();
app.use(express.cookieParser(secret));
app.use(express.cookieSession());
// set dummy session
app.use(function(req, res, next) {
  req.session.username = 'john';
  next();
});
app.use(app.router);
app.get('/', function(req, res) {
  res.send(200);
});
var server = http.createServer(app);
// start the websocket server
var primus = new Primus(server, {
  transformer: 'websockets',
  session: {
    secret: secret
  }
});
primus.use('sessions', primusExpressSession);
server.listen(6000);

// a second app with memory store
var store = new express.session.MemoryStore();

var app_2 = express();
app_2.use(express.cookieParser(secret));
app_2.use(express.session({
  store: store
}));
// set dummy session
app_2.use(function(req, res, next) {
  req.session.username = 'jim';
  next();
});
app_2.use(app_2.router);
app_2.get('/', function(req, res) {
  res.send(200);
});
var server_2 = http.createServer(app_2);
// start the websocket server
var primus_2 = new Primus(server_2, {
  transformer: 'websockets',
  session: {
    secret: secret,
    store: store
  }
});
primus_2.use('sessions', primusExpressSession);
server_2.listen(7000);

// start the tests

describe('primus-express-session', function() {
  
  it('should work with cookie sessions', function(done) {
    // request page to get a cookie
    request(app).get('/').end(function(err, res) {
      // get cookie from headers
      var rawCookie = res.headers['set-cookie'][0];
      var cookieObj = cookie.parse(rawCookie);
      var cookieStr = cookieObj['connect.sess'];
      // listen on client connection
      primus.on('connection', function(spark) {
        spark.getSession(function(err, session) {
          session.username.should.equal('john');
          done();
        });
      });
      // simulate a client connection
      var client = new primus.Socket('http://localhost:6000/?cookie=connect.sess=' + encodeURIComponent(cookieStr));
    });
  });

  it('should work with a session store and return proper session', function(done) {
    // request page to get a cookie
    request(app_2).get('/').end(function(err, res) {
      // get cookie from headers
      var rawCookie = res.headers['set-cookie'][0];
      var cookieObj = cookie.parse(rawCookie);
      // important! different key
      var cookieStr = cookieObj['connect.sid'];
      // listen on client connection
      primus_2.on('connection', function(spark) {
        spark.getSession(function(err, session) {
          // test session
          session.username.should.equal('jim');
          // test session methods
          session.destroy(function(err) {
            should.not.exist(err);
            done();
          });
        });
      });
      // simulate a client connection - important! different key
      var client = new primus.Socket('http://localhost:7000/?cookie=connect.sid=' + encodeURIComponent(cookieStr));
    });
  });
  
});