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
        console.log(client.loggedOnUser);
    }).catch(function (err) {
        console.log('Unable to logon. ' + err);
    });


    client.addEventListener('itemAdded', function (event) {
        var item = event.item;
        if (item.type === "TEXT"
                && item.creatorId !== client.loggedOnUser.userId)
        {
            
            client.getUserById(item.creatorId, function(user){
                console.log(user);
            });
            
//            client.addTextItem('0a19d4c4-9819-40c0-a299-ee3ce8ccb8b5',
//                    {
//                        contentType: "RICH",
//                        content: "jo"
//                    })
//                    .then(function (i) {
//                        console.log(i);
//                    }).catch(function (err) {
//                console.log('Unable to logon. ' + err);
//            });
        }
    });
}


