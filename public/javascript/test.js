// Load circuit sdk and when loaded run the example
var script = document.createElement('script');
script.onload = function () {
    run();
};
script.src = 'https://circuitsandbox.net/circuit.js';
document.getElementsByTagName('head')[0].appendChild(script);

function run() {
    // Helper function to create a blob from a base64 string

    console.log("hier");
    // Create Circuit client instance
    var client = new Circuit.Client({domain: 'circuitsandbox.net'});
    console.log("hier2");
    // Authenticate with Basic Auth
    client.authenticate({email: 'andreas-stephan@hotmail.de',
        password: 'andalos1'}).then(function () {
            console.log("geschafft");
        }, function (err) {
            console.log("verdammt");
            console.error(err);
        });
}