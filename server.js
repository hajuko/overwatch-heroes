var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/data', function(req, res) {

});

app.listen(process.env.PORT  || 5000);
console.log('started at port: ' + port);

module.exports = app;
