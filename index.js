
var cookie = require('cookie');
var connect = require('connect');
var Session = connect.session.Session;
var utils = connect.utils;

// export only server method
module.exports = function(req, res, next) {

  // var store = options.session.store;
  // var key = options.session.key;
  // var secret = options.session.secret;

  // var cookieSession = !store;

  // if (!secret) throw new Error('`secret` option required for sessions');

  // var Spark = primus.Spark;

  // get express session from spark object
  function sess(req, res, next) {

    console.log(this);

    // check headers and query string for cookie
    var rawCookie = this.headers.cookie || this.query.cookie;

    // do nothing when there aren't any cookies
    if (!rawCookie) return cb(new Error('no cookie found'));

    var signedCookies = cookie.parse(rawCookie);
    var unsignedCookie = utils.parseSignedCookies(signedCookies, secret);

    // we have cookie sessions if we don't have a store
    if (cookieSession) {
      // use options or default key
      key = key || 'connect.sess';
      var jsonCookie = unsignedCookie[key];
      var session = utils.parseJSONCookie(jsonCookie);
      return cb(null, session);
    }

    // we have a proper session store
    key = key || 'connect.sid';

    req.pause();

    // build fake request object
    // var request = {};
    // req.cookie = unsignedCookie;
    // req.sessionID = req.cookie[key];
    // req.sessionStore = store;

    // get session from store by passing id
    store.get(req.sessionID, function(err, sess) {
      if (err) return cb(err);

      req.resume();

      // create real session object with all available methods,
      // i.e. destroy, regenerate, etc.
      // var session = new Session(req, sess);
      if (session) req.session = session;
      // cb(null, session);
      next();

    });

  }

  return sess;

};
