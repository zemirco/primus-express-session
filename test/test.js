
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var expressSession = require('express-session');
var Primus = require('primus');
var request = require('supertest');
var should = require('should');
var cookie = require('cookie');

var secret = 'your secret here';

// first app with cookie sessions

var app = express();
var cookies = cookieParser(secret);
app.use(cookies);
var session = cookieSession({
  keys: ['key1', 'key2']
});
app.use(session);
// set dummy session
app.use(function(req, res, next) {
  req.session.username = 'john';
  next();
});
app.get('/', function(req, res) {
  res.send(200);
});
var server = http.createServer(app);

var primus = new Primus(server, {
  transformer: 'websockets'
});

// dummy middleware to populate req.headers.cookie from query parameters
primus.before('dummy', function(req, res, next) {
  var dummySession = 'express:sess=' + req.query.session;
  var dummySig = 'express:sess.sig=' + req.query.sig;
  req.headers.cookie = dummySession + '; ' + dummySig;
  next();
});

primus.before('cookies', cookies);
primus.before('session', session);

server.listen(6000);

// a second app with memory store
var store = new expressSession.MemoryStore();

var app_2 = express();
app_2.use(cookieParser(secret));
var session_2 = expressSession({
  store: store
});
app_2.use(session_2);
// set dummy session
app_2.use(function(req, res, next) {
  req.session.username = 'jim';
  next();
});
app_2.get('/', function(req, res) {
  res.send(200);
});
var server_2 = http.createServer(app_2);
// start the websocket server
var primus_2 = new Primus(server_2, {
  transformer: 'websockets'
});

// dummy middleware to populate req.headers.cookie from query parameters
primus_2.before('dummy', function(req, res, next) {
  var dummySession = 'connect.sid=' + req.query.session;
  req.headers.cookie = dummySession;
  next();
});

primus_2.before('cookies', cookies);
primus_2.before('session', session_2);

server_2.listen(7000);

// start the tests

describe('primus-express-session', function() {

  it('should work with cookie sessions', function(done) {
    // request page to get a cookie
    request(app).get('/').end(function(err, res) {
      // get cookies from headers
      var rawSession = res.headers['set-cookie'][0];
      var sessionObj = cookie.parse(rawSession);
      var sessionStr = sessionObj['express:sess'];

      var rawSig = res.headers['set-cookie'][1];
      var sigObj = cookie.parse(rawSig);
      var sigStr = sigObj['express:sess.sig'];

      // listen on client connection
      primus.on('connection', function(spark) {
        spark.request.session.username.should.equal('john');
        done();
      });

      // simulate a client connection
      var ses = encodeURIComponent(sessionStr);
      var sig = encodeURIComponent(sigStr);
      var client = new primus.Socket('http://localhost:6000/?session=' + ses + '&sig=' + sig);
    });
  });

  it('should work with session store', function(done) {
    // request page to get a cookie
    request(app_2).get('/').end(function(err, res) {

      var rawSession = res.headers['set-cookie'][0];
      var sessionObj = cookie.parse(rawSession);
      var sessionStr = sessionObj['connect.sid'];

      // listen on client connection
      primus_2.on('connection', function(spark) {
        spark.request.session.username.should.equal('jim');
        done();
      });

      // simulate a client connection
      var ses = encodeURIComponent(sessionStr);
      var client = new primus_2.Socket('http://localhost:7000/?session=' + ses);
    });
  });

});
