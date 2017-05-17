var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')

var profiles = {};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.post('/login', function (req, res) {
  const crypto = require('crypto');
  const secret = 'abcdefg';
  const hash = crypto.createHmac('sha256', secret)
                     .update(req.body.pass)
                     .digest('hex');
  fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
    var jsonData = JSON.parse(data);
    for(var i in jsonData) {
      if(jsonData[i].username == req.body.name && jsonData[i].password == hash) {
        res.end( '{"status": "logged in"}' );
      }
    }
    res.end( '{"status": "Wrong credentials"}' );
  });
})

app.get('/messages', function (req, res) {
  fs.readFile( __dirname + "/" + "messages.json", 'utf8', function (err, data) {
   res.end( data );
  });
})

app.get('/profile', function (req, res) {
  fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
    res.end( data );
  });
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Superstar server listening at http://%s:%s", host, port)
})
