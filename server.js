var express = require('express');
var app = express();
var port = 8080;

app.use(express.static(__dirname + '/public'));

app.get('/data', function(req, res) {

});

app.listen(port);
console.log('started at port: ' + port);

module.exports = app;
