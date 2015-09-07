var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Circuit = require('circuit');

var assistant = require('./assistant/main');
var logger = require('./utils/logger');

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));

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

app.get('/test', function (req, res) {
    res.render('pages/test');
});

app.get('/test2', function (req, res) {
    res.render('pages/test2');
});

app.post('/addItem', function (req, res) {
    assistant.checkItem(req.body.item, function (err, text) {
        res.send(text);
    });
});

app.get('/newLog', function (req, res) {
    logger.log("testLog", "INFO");
    res.send('Log funzt');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});




client = new Circuit.Client({domain: 'circuitsandbox.net'});
assistant.registerEventListener(client);
client.logon('andreas-stephan@hotmail.de', 'andalos1')
        .then(function (user) {
            logger.info('Logged in as ' + user.displayName);
        }).catch(function (e) {
    logger.error('Unable to logon. ' + e);
});

global.setInterval(assistant.update, 60000);


