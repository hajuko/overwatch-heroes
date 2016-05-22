var express = require('express');
var app = express();
var port = 8080;

app.get('/', function(req, res) {
    res.sendfile('test.html');
});

app.listen(port);
console.log('started at port: ' + port);

module.exports = app;
