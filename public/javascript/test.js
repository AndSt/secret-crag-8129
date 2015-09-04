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
        client.addEventListener('itemAdded', function (event) {
            var item = event.item;
            if (item.type === "TEXT") {
                console.log("In der Conversation " + item.convId +
                        " wurde gesagt: " + item.text.content);
            }
            client.addTextItem(item.convId, item.text);
            console.log("Oder auch nicht");
//            client.getConversationById(item.convId, function (conv) {
//                console.log("Versuch ein Item hinzuzufügen für " + conv.concId);
//
////                client.addItem(item.convId, "was geht", function(err){
////                    console.log("kein plan");
////                });
//            });
        });
    }).catch(function (err) {
        console.log('Unable to logon. ' + err);
    });


}