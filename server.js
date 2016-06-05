var express = require('express');
var app = express();
var port = 6000;

app.use(express.static(__dirname + '/public'));

app.listen(5001);
console.log('started at port: ' + port);

module.exports = app;
