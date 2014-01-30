
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Primus = require('primus');
var primusExpressSession = require('../index.js');

var app = express();
var secret = 'your secret here';
var store = new express.session.MemoryStore();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(secret));
app.use(express.session({
  store: store
}));
//app.use(express.cookieSession());

// dummy session
app.use(function(req, res, next) {
  req.session.username = 'john';
  next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  })
});

/**
 * start Primus 
 */
    
var server = http.createServer(app);

// init primus
var primus = new Primus(server, {
  transformer: 'websockets',
  session: {
    store: store,
    secret: secret
  }
});

// use primus-express-session plugin
primus.use('session', primusExpressSession);

// generate client library
//primus.save(__dirname +'/public/javascripts/primus.js', function save(err) {
//  if (err) console.log(err);
//  console.log('client library generated')
//});

// listen on incoming connection
primus.on('connection', function(spark) {
  
  spark.getSession(function(err, session) {    
    if (err) console.log(err);
    console.log(session.username);
  });
  
});

// start the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
