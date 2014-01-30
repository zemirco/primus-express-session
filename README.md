# primus-express-session

[![Build Status](https://travis-ci.org/zeMirco/primus-express-session.png?branch=master)](https://travis-ci.org/zeMirco/primus-express-session) [![NPM version](https://badge.fury.io/js/primus-express-session.png)](http://badge.fury.io/js/primus-express-session)

[![NPM](https://nodei.co/npm/primus-express-session.png)](https://nodei.co/npm/primus-express-session/)

Share a user session between Express and Primus.

## Installation

```
npm install primus-express-session
```

```js
var expressSession = require('primus-express-session');
```

## How to use

```js
var express = require('express');
var http = require('http');
var Primus = require('primus');
var expressSession = require('primus-express-session');

var app = express();
var secret = 'your secret here';
var store = new express.session.MemoryStore();

app.use(express.cookieParser(secret));
// use a session store
app.use(express.session({
  store: store
}));
// or you can also use cookie sessions
// app.use(express.cookieSession());

// dummy session
app.use(function(req, res, next) {
  req.session.username = 'john';
  next();
});

app.use(app.router);

app.get('/', function(req, res) {
  res.send(200);
});

var server = http.createServer(app);

var primus = new Primus(server, {
  transformer: 'websockets',
  session: {
    secret: secret,
    [store: store],
    [key: key]
  }
});

primus.use('session', primusExpressSession);

// listen on incoming connection
primus.on('connection', function(spark) {
  
  // spark object now has a getSession() method
  spark.getSession(function(err, session) {    
    if (err) console.log(err);
    console.log(session.username);  // prints 'john'
  });
  
});

// start the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
```

## Configuration

```js
var primus = new Primus(server, {
  session: {
    secret: secret,
    [store: store],
    [key: key]
  }
});
```

 - `secret`: has to be the same `secret` that you use for `express.cookieParser()`
 - `store`: Optional. A session store (Memory, Redis, etc.). Leave out if you use `express.cookieSession()`
 - `key`: Optional. Cookie name, defaults to `connect.sess` or `connect.sid`

## Test

`grunt`

## License

Copyright (C) 2014 [Mirco Zeiss](mailto: mirco.zeiss@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.