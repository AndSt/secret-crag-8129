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


var pieData = data;
var ctx = document.getElementById("chart-area").getContext("2d");
window.myPie = new Chart(ctx).Pie(pieData, options);
var legend = myPie.generateLegend();

