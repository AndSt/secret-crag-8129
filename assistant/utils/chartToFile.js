var config = require('./../config.json');

var logger = require(config.loggerPath);


var Canvas = require('canvas');
var canvas = new Canvas(800, 800);
var ctx = canvas.getContext('2d');
var Chart = require('nchart');

var fs = require('fs');


/**
 * renderAndSavePicture() renders a pie chart to path.
 * 
 * @param {type} data       json array of objects
 * @param {type} prop       the property of the objects, for which the chart will be generated
 * @param {type} path       the path/name to save the picture
 * @returns {Promise}       returns the path or error message
 */
var renderAndSavePicture = function (data, prop, path) {
    logger.debug("chartToFile.renderAndSavePicture");

    //default color data
    var pieData = [
        {
            color: "#FAA43A"
        },
        {
            color: "#5DA5DA"
        },
        {
            color: "#DECF3F"
        },
        {
            color: "#B276B2"
        },
        {
            color: "#60BD68"
        }
    ];

    var options = {
        scaleShowValues: true,
        scaleFontSize: 24,
        scaleShowLabels: true,
        scaleFontColor: "#666",
        showTooltips: true
    };

    return new Promise(function (resolve, reject) {
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
        logger.debug("hier");
        logger.debug("charData: " + JSON.stringify(chartData));

        sum = chartData.reduce(function (val, seg) {
            return val + seg.value;
        }, 0);

        new Chart(ctx).Pie(chartData, options);

        ctx.fillStyle = "white";
        ctx.fillRect(430, 20, 350, 30 * (chartData.length + 1) + 30);

        ctx.strokeStyle = "black";
        ctx.strokeRect(430, 20, 350, 45);
        ctx.strokeRect(430, 65, 350, 30 * chartData.length + 15);

        ctx.font = '30px Impact';
        ctx.fillStyle = 'black';
        ctx.fillText("Number of messages", 450, 50);
        ctx.font = '20px Impact';
        for (var i = 0; i < chartData.length; i++) {
            ctx.fillStyle = chartData[i].color;
            ctx.fillText(chartData[i].label + ": " + 
                    Math.round(chartData[i].value * 100 / sum) + "%(" +
                    chartData[i].value + ")",
                    450, 95 + i * 30);
        }

        canvas.toBuffer(function (err, buf) {
            if (err) {
                reject(err);
            }
            fs.writeFile(path, buf, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(path);
                }
            });
        });
    });
};


module.exports = {
    renderAndSavePicture: renderAndSavePicture
};