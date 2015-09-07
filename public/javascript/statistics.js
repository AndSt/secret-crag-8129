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



angular.module('statistics', []);

angular.module('statistics')
        .controller('dataController', [$scope, $http, function ($scope, $http) {
                $http.get('/getStats/0a19d4c4-9819-40c0-a299-ee3ce8ccb8b5')
                        .then(function (data) {
                            var pieData = data;
                            var ctx = document.getElementById("chart-area").getContext("2d");
                            window.myPie = new Chart(ctx).Pie(pieData, options);
                            var legend = myPie.generateLegend();
                            $scope.legend = legend;
                        }, function(err){
                            console.log("Verbindung hat nicht funtioniert");
                        });
            }]);


