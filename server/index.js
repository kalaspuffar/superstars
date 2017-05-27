var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var admin = require("firebase-admin");
var serviceAccount = require("c:/tmp/superstars.json");

const secret = 'abcdefg';
var profiles = {};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://superstars-8b9f2.firebaseio.com"
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cookieParser());

app.use(function (req, res, next) {
  loginCookie = req.cookies.loginCookie;
  next();
});

function login(res, hash, name) {
  fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
    var jsonData = JSON.parse(data);
    var authorized = false;
    for(var i in jsonData) {
      if(name != undefined && jsonData[i].username == name && jsonData[i].password == hash) {
        authorized = true;
      } else if(name == undefined && jsonData[i].uid && jsonData[i].uid == hash) {
        authorized = true;
      }

      if(authorized) {
        if (loginCookie === undefined) {
          loginCookie = crypto.createHmac('sha256', secret)
                             .update(hash)
                             .update(Math.random().toString())
                             .digest('hex');

          profiles[loginCookie] = jsonData[i];
        }
        res.end( '{"status": "logged in", "loginCookie": "' + loginCookie + '"}' );
        return;
      }
    }
    res.end( '{"status": "Wrong credentials"}' );
  });
}

app.post('/login', function (req, res) {
  if(req.body.loginFirebaseToken) {
    admin.auth().verifyIdToken(req.body.loginFirebaseToken)
      .then(function(decodedToken) {
        login(res, decodedToken.uid);
      }).catch(function(error) {
        console.log(error);
      });
  } else {
    const hash = crypto.createHmac('sha256', secret)
                       .update(req.body.pass)
                       .digest('hex');
    login(res, hash, req.body.name);
  }
})

app.get('/logout', function (req, res) {
  if(loginCookie !== undefined && profiles[loginCookie]) {
    delete profiles[loginCookie];
    return res.end( '{"status": "ok"}' );
  }
  return res.end( '{"status": "Not found"}' );
})

function addTokenToProfile(res, profile, uid) {
  fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
    var jsonData = JSON.parse(data);
    for(var i in jsonData) {
      if(jsonData[i].username == profile.username && jsonData[i].password == profile.password) {
        jsonData[i].uid = uid;
      }
    }
    fs.writeFile( __dirname + "/" + "profiles.json", JSON.stringify(jsonData), function (err) {
      if (err) return console.log(err);
      console.log('Saved uid to profile information.');
    });
    res.end( '{"status": "ok"}' );
  });
}

app.post('/signup', function (req, res) {
  if(loginCookie !== undefined && profiles[loginCookie]) {
    admin.auth().verifyIdToken(req.body.signupToken)
      .then(function(decodedToken) {
        addTokenToProfile(res, profiles[loginCookie], decodedToken.uid)
      }).catch(function(error) {
        console.log(error);
      });
  }
})

app.get('/messages', function (req, res) {
  fs.readFile( __dirname + "/" + "messages.json", 'utf8', function (err, data) {
   res.end( data );
  });
})

app.get('/profile', function (req, res) {
  if(loginCookie !== undefined && profiles[loginCookie]) {
    return res.end( JSON.stringify(profiles[loginCookie]) );
  }
  return res.end( "{}" );
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Superstar server listening at http://%s:%s", host, port)
})
