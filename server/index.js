var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

var profiles = {};

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

app.post('/login', function (req, res) {
  const secret = 'abcdefg';
  const hash = crypto.createHmac('sha256', secret)
                     .update(req.body.pass)
                     .digest('hex');
  fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
    var jsonData = JSON.parse(data);
    for(var i in jsonData) {
      if(jsonData[i].username == req.body.name && jsonData[i].password == hash) {
        if (loginCookie === undefined) {
          loginCookie = crypto.createHmac('sha256', secret)
                             .update(req.body.pass)
                             .update(Math.random().toString())
                             .digest('hex');

          profiles[loginCookie] = jsonData[i];
        }
        res.end( '{"status": "logged in", "loginCookie": "' + loginCookie + '"}' );
      }
    }
    res.end( '{"status": "Wrong credentials"}' );
  });
})

app.get('/logout', function (req, res) {
  if(loginCookie !== undefined && profiles[loginCookie]) {
    delete profiles[loginCookie];
    return res.end( '{"status": "ok"}' );
  }
  return res.end( '{"status": "Not found"}' );
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
