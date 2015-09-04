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
        client.addTextItem('0a19d4c4-9819-40c0-a299-ee3ce8ccb8b5', item2)
                .then(function (i) {
                    console.log(i);
                });
    }).catch(function (err) {
        console.log('Unable to logon. ' + err);
    });

    var item2 = {
        contentType: "RICH",
        content: "jo"
    };


    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        if (item.type === "TEXT") {
            console.log("In der Conversation " + item.convId +
                    " wurde gesagt: " + item.text.content);
        }


    });

}