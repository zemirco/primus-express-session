
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Primus = require('primus');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var primusExpressSession = require('../index.js');

var app = express();
var secret = 'your secret here';
var store = new expressSession.MemoryStore();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var cookies = cookieParser(secret);
app.use(cookies);
var session = expressSession({
  store: store
});
// app.use(session);
// var session = cookieSession({
//   keys: ['key1', 'key2']
// });
app.use(session);

// dummy session
app.use(function(req, res, next) {
  req.session.username = 'john';
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

/**
 * start Primus
 */

var server = http.createServer(app);

// init primus
var primus = new Primus(server, {
  transformer: 'websockets'
});

// use cookie and cookie-session middleware
primus.before('cookies', cookies);
primus.before('session', session);

// generate client library
//primus.save(__dirname +'/public/javascripts/primus.js', function save(err) {
//  if (err) console.log(err);
//  console.log('client library generated')
//});

// listen on incoming connection
primus.on('connection', function(spark) {
  console.log('on::connection');
  var req = spark.request;
  console.log(req.session.username);
});

// start the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
