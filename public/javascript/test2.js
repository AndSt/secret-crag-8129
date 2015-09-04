
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
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\">" +
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
window.onload = function () {
    var ctx = document.getElementById("chart-area").getContext("2d");
    window.myPie = new Chart(ctx).Pie(pieData);
};

