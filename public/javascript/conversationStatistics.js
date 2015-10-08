
var pieData = [
    {
        value: 300,
        color: "#FAA43A",
        highlight: "#FAA43A",
        label: "Red"
    },
    {
        value: 50,
        color: "#5DA5DA",
        highlight: "#5DA5DA",
        label: "Green"
    },
    {
        value: 100,
        color: "#DECF3F",
        highlight: "#DECF3F",
        label: "Yellow"
    },
    {
        value: 40,
        color: "#B276B2",
        highlight: "#B276B2",
        label: "Grey"
    },
    {
        value: 120,
        color: "#60BD68",
        highlight: "#60BD68",
        label: "Dark Grey"
    }
];


var options = {
    animationSteps : 40,
    legendTemplate: '<div class="panel panel-default"> <div class="panel-body">' +
            '<% for (var i=0; i<datasets.length; i++){%>' +
            '<div style="background-color:<%=datasets[i].color%>"' +
            '<%=datasets[i].label%>' +
            '</div>' +
            '<%}%>' +
            '</div></div>'
};
var legendTemplate = '<div class="panel panel-default"> <div class="panel-body">' +
        '<% for (var i=0; i<datasets.length; i++){%>' +
        '<div style="background-color:<%=datasets[i].color%>"' +
        '<%=datasets[i].label%>' +
        '</div>' +
        '<%}%>' +
        '</div></div>';

var initializeChart = function (data, elementId, prop) {


    var chartData = [];
    var i = 0;
    var sum = 0;
    for (i = 0; i < data.length; i++) {
        sum += data[i][prop];
    }

    i = 0;
    while (i <= 4 && i < data.length) {
        chartData[i] = {};
        chartData[i].label = data[i].displayName;
        chartData[i].color = pieData[i].color;
        chartData[i].highlight = pieData[i].highlight;
        chartData[i].value = data[i][prop];
        sum -= data[i][prop];
        i++;
    }
    if (i === 5) {
        chartData[i] = {};
        chartData[i].label = "Rest";
        chartData[i].color = pieData[4].color;
        chartData[i].highlight = pieData[4].highlight;
        chartData[i].value = sum;

    }

    console.log(chartData);

    var ctx = document.getElementById(elementId).getContext("2d");
    window[prop + "Chart"] = new Chart(ctx).Pie(chartData, options);

    var legend = '<h4><div class="panel panel-default">' +
            '<div class="panel-body"  style="display: inline-block;">' +
            '<u>Legend</u> <br>';
    for (var i = 0; i < chartData.length; i++) {
        legend += '<div class="label label-default" style="background-color:' + chartData[i].color + '; display: inline-block;">' +
                chartData[i].label + " " +
                '</div>';

    }
    legend += '</div></div></h4>';

    var legendHolder = document.createElement('div');
    legendHolder.innerHTML = legend;
    window[prop + "Chart"].chart.canvas.parentNode.appendChild(legendHolder.firstChild);
};

$(document).ready(function () {
    var urlOptions = window.location.pathname.split('/');
    console.log("urlOptions: " + urlOptions);
    $.get("/getStats/conversation/conversationPerUser/" 
            + urlOptions[2] + "/7", function (data) {
        console.log("returned: " + data);
        initializeChart(data.user, "numItemsChartW", "numItems");
        initializeChart(data.user, "numLettersChartW", "letterCount");
        initializeChart(data.user, "numWordsChartW", "wordCount");
    });
    $.get("/getStats/conversation/conversationPerUser/" 
            + urlOptions[2] + "/31", function (data) {

        initializeChart(data.user, "numItemsChartM", "numItems");
        initializeChart(data.user, "numLettersChartM", "letterCount");
        initializeChart(data.user, "numWordsChartM", "wordCount");
    });
    $.get("/getStats/conversation/conversationPerUser/" 
            + urlOptions[2], function (data) {

        initializeChart(data.user, "numItemsChartO", "numItems");
        initializeChart(data.user, "numLettersChartO", "letterCount");
        initializeChart(data.user, "numWordsChartO", "wordCount");
    });
});





