const express = require('express');
const app = express();
const port = 6000;
const cors = require('cors');

app.use(express.static(__dirname + '/public'));
app.use(cors());
app.options('*', cors());

app.listen(process.env.PORT  || port);
console.log('started at port: ' + port);

module.exports = app;
