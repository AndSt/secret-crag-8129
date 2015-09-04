// Load circuit sdk and when loaded run the example
var script = document.createElement('script');
script.onload = function () {
    run();
};
script.src = 'https://circuitsandbox.net/circuit.js';
document.getElementsByTagName('head')[0].appendChild(script);

function run() {
    
    var client = new Circuit.Client({domain: 'circuitsandbox.net'});

    client.logon('andreas-stephan@hotmail.de', 'andalos1').then(function (user) {
        console.log('Logged in as ' + user.displayName);
    }).catch(function (e) {
        console.log('Unable to logon. ' + e);
    });
}