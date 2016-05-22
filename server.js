var express = require('express');
var app = express();
var port = 5000;

app.use(express.static(__dirname + '/public'));

app.get('/data', function(req, res) {

});

app.listen(process.env.PORT  || port);
console.log('started at port: ' + port);

module.exports = app;
