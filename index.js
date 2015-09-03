var express = require('express');
var app = express();

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

app.get('/check', function (req, res) {
    connection.connect(function (err) {
        if (!err) {
            res.send("Database is connected ... \n\n");
        } else {
            res.send("Error connecting database ... \n\n");
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


