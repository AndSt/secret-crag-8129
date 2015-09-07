var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Circuit = require('circuit');

var assistant = require('./assistant/main');
var logger = require('./utils/logger');
var client = require('./utils/client').getClient();

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

app.get('/test2', function (req, res) {
    res.render('pages/test2');
});

app.get('/newLog', function (req, res) {
    logger.log("testLog", "INFO");
    res.send('Log funzt');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});



assistant.registerEventListener(client);

global.setInterval(assistant.update, 60000);


