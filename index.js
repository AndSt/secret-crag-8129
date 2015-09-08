var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Circuit = require('circuit');
var assistant = require('./assistant/main');
var logger = require('./utils/logger');
var client = require('./utils/client').getClient();

var textAnalyzer = require('./assistant/textAnalyzer');



app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');




app.get('/', function (request, response) {
    response.render('pages/index');
});

app.get('/commandGeneratior', function (req, res) {
    res.render('pages/commandGenerator');
});

app.get('/test', function (req, res) {
    textAnalyzer.getNumMessagesForChart('0a19d4c4-9819-40c0-a299-ee3ce8ccb8b5')
            .then(function (data) {
                res.send(data.toString());
            })
            .catch(function (err) {
                res.send("hat leider nicht funktioniert");
            });
});

app.get('/test2', function (req, res) {
    res.render('pages/test2');
});

app.get('/statistics', function (req, res) {
    res.render('pages/statistics',
            {title: "Testtitel"}
    );
});

app.get('/getStats/:convId', function (req, res) {

});

app.get('/getStats/:convId/user', function (req, res) {

});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

assistant.registerEventListener(client);
global.setInterval(assistant.update, 60000);


