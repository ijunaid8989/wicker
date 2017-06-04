var Firebase = require("firebase");
var crypto = require("crypto");

var firebase = new Firebase("https://wicker-dc371.firebaseio.com/");

var users = firebase.child("users");

var router = require("express").Router();

function hash (password) {
  return crypto.createHash('sha512').update(password).digest('hex');
}

// make the router and add parsers
router
  .use(require('body-parser').json())
  .use(require('cookie-parser')())
  .use(require('express-session')({
    resave: false,
    saveUninitialized: true,
    secret:'asdsdhjkdshkjdshgkjdshgkjdshgkjdshgjkdshgkjdhsgjkhdsjkghdskjgs'
  }));

router.post('/api/signup', function(req, res){
  var username = req.body.username,
      password = req.body.password;

  if (!username || !password)
    return res.json({signedIn: false, message: "No username or password."});

  users.child(username).once('value', function (snapshot){
    if (snapshot.exists())
      return res.json({signedIn: false, message: "Username has already been taken."});

    var userObj = {
      username: username,
      passwordHash: hash(password)
    };

    users.child(username).set(userObj);
    req.session.user = userObj;

    res.json({
      signedIn: true,
      user: userObj
    });
  });
});

router.post('/api/signin', function(req, res){
  var username = req.body.username,
      password = req.body.password;

  if (!username || !password)
    return res.json({signedIn: false, message: "No username or password."});

  users.child(username).once('value', function (snapshot){
    if (!snapshot.exists() && snapshot.child('passwordHash').val() !== hash(password))
      return res.json({signedIn: false, message: "Wrong username or password."});

    var user = snapshot.exportVal();

    req.session.user = user;

    res.json({
      signedIn: true,
      user: user
    });
  });
});

router.post('/api/signout', function(res, req){
  delete req.session.user;
  res.json({
    signedIn: false,
    message: "You have been logged out."
  });
});


module.exports = router;