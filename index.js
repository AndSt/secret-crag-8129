var express = require('express');
var app = express();
var assistant = require('./assistant/main');

var mysql = require('mysql');


var connection = mysql.createConnection({
    host: 'sql2.freemysqlhosting.net',
    user: 'sql288857',
    password: 'vB6*pR5!',
    port: '3306',
    database: 'sql288857'
});


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/add', function (req, res) {
    res.render('pages/add');
});

app.get('/check', function (req, res) {
    assistant.test(connection, function(err, text){
        if(err) {
            res.send("Error");
        }
        else {
            res.send(text);
        }
    });
});

app.post('/addItem', function (req, res) {
    checkItem(req.body.item, function (err, text) {
        if (err) {
            res.send(text);
        }
        else {
            res.json(text);
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


