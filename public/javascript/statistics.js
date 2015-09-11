
var initialize = function (numMessagesData) {

    var pieData = [
        {
            value: 300,
            color: "#F7464A",
            highlight: "#FF5A5E",
            label: "Red"
        },
        {
            value: 50,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Green"
        },
        {
            value: 100,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "Yellow"
        },
        {
            value: 40,
            color: "#949FB1",
            highlight: "#A8B3C5",
            label: "Grey"
        },
        {
            value: 120,
            color: "#4D5360",
            highlight: "#616774",
            label: "Dark Grey"
        }
    ];


    var options = {
        legendTemplate:
                "<ul class=\"<%=name.toLowerCase()%>-legend\">" +
                "<% for (var i=0; i<segments.length; i++){%>" +
                "<li>" +
                "<span style=\"background-color:<%=segments[i].fillColor%>\">" +
                "</span>" +
                "<%if(segments[i].label){%>" +
                "<%=segments[i].label%><%}%>" +
                "</li>" +
                "<%}%>" +
                "</ul>"
    };

    var data1;
    var i = 0;
    var sum = 0;
    for (i = 0; i < numMessagesData.length; i++) {
        sum += numMessagesData[i].numMessages;
    }

    i = 0;
    var obj;
    while (i < 4 && i < numMessagesData.length) {
        obj.label = numMessagesData[i].displayName;
        obj.color = pieData[i].color;
        obj.highlight = pieData[i].highlight;
        obj.value = numMessagesData[i].numMessages;
        data1.push(obj);
        sum -= numMessagesData[i].numMessages;
        i++;
    }
    if (i === 4) {
        obj.label = "Rest";
        obj.color = pieData[4].color;
        obj.highlight = pieData[4].highlight;
        obj.value = sum;
        data1.push(obj);
    }

    console.log(JSON.stringify(data1));

    var ctx1 = document.getElementById("chart-area-1").getContext("2d");
    window.myPie = new Chart(ctx1).Pie(data1, options);


    var ctx2 = document.getElementById("chart-area-2").getContext("2d");
    window.myPie2 = new Chart(ctx2).Pie(pieData, options);

//    var legend = myPie.generateLegend();

};


$(document).ready(function () {
    var urlOptions = window.location.pathname.split('/');
    console.log("urlOptions: " + urlOptions);
    $.get("/getStats/" + urlOptions[2] + "/numMessages", function (data) {
        console.log("data: " + JSON.stringify(data));
        initialize(data);
    });
});





