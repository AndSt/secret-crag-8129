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
    }).catch(function (err) {
        console.log('Unable to logon. ' + err);
    });


    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        if (item.type === "TEXT"
                && item.creatorId !== client.loggedOnUser.userId)
        {
//            var lol = item.text.split(':');
//            if (lol[0] === 'assistant') {
//                var object = JSON.parse(lol[1]);
//                console.log(object);
//                callback(false, object);
//            }

//            client.getUserById(item.creatorId, function (user) {
//                var timeOffset = user.userPresenceState.timeZoneOffset;
//            });

            client.addTextItem(item.convId,
                    {
                        contentType: "RICH",
                        content: item.text
                    })
                    .then(function (i) {
                        console.log(i);
                    }).catch(function (err) {
                console.log('Unable to logon. ' + err);
            });
        }
    });
}


