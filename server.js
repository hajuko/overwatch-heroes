var express = require('express');
var app = express();
var port = 8080;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('test');
});

app.listen(port);
console.log('started at port: ' + port);

module.exports = app;
