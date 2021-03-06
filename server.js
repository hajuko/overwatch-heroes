const express = require('express');
const app = express();
const port = 6000;
const cors = require('cors');

app.disable('x-powered-by');
app.use(cors());
app.options('*', cors());

app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT  || port);
console.log('started at port: ' + port);

module.exports = app;
