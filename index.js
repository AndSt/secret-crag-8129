var express = require('express');
var app = express();
var assistant = require('./assistant/main');


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
    assistant.test(function(err, text){
        res.send(text);
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


