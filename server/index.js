var express = require('express');
var app = express();
var fs = require("fs");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/users/:userId/messages', function (req, res) {
   fs.readFile( __dirname + "/" + "messages.json", 'utf8', function (err, data) {
       res.end( data );
   });
})

app.get('/users/:userId', function (req, res) {
   fs.readFile( __dirname + "/" + "profiles.json", 'utf8', function (err, data) {
       res.end( data );
   });
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Superstar server listening at http://%s:%s", host, port)
})
