# primus-express-session

[![Build Status](https://travis-ci.org/zemirco/primus-express-session.svg?branch=express_4.x)](https://travis-ci.org/zemirco/primus-express-session) [![NPM version](https://badge.fury.io/js/primus-express-session.svg)](http://badge.fury.io/js/primus-express-session)

Share a user session between Express and Primus.

## Important

This is the branch for Express 4.x and Primus 2.2.x.

You don't need this plugin with newer versions of Express and Primus. Simply use
[middleware](https://github.com/primus/primus#middleware).

```js
// .. express middleware
var cookies = cookieParser(secret);
app.use(cookies);
var session = cookieSession({keys: ['key1', 'key2']});
app.use(session);

// use the same middleware for primus
primus.before('cookies', cookies);
primus.before('session', session);

// access session similar to express requests
primus.on('connection', function(spark) {
  console.log('on::connection');
  var req = spark.request;
  console.log(req.session.username);
});
```

For more information take a look at the
[example](https://github.com/zemirco/primus-express-session/blob/express_4.x/example/app.js)
or the
[tests](https://github.com/zemirco/primus-express-session/blob/express_4.x/test/test.js).

## Test

`grunt`

## License

MIT
