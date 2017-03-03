var loc = window.location, readyurl;
if (loc.protocol === "https:") {
    readyurl = "wss:";
} else {
    readyurl = "ws:";
}
readyurl += "//" + loc.host;
readyurl += loc.pathname;

var ws = new WebSocket(readyurl, "echo-protocol");


var nowDate = new Date;
var readyDate = nowDate.getFullYear() + "-" + (nowDate.getMonth()+1) + "-" + nowDate.getDate();


var seriesOptions = [],
    seriesCounter = 0,
    names =[];
    
var chart;

function createChart() {
    
    chart = Highcharts.stockChart('container', {
            rangeSelector: {
            selected: 4
        },
        chart: {
            margin: [40, 15, 0, 15],
        },
        
        
        title: {
            text: 'STOCKS',
            marginTop: 30,
            style: {
                fontFamily: "Nunito",
                fontSize: 18
            }
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

$.getJSON(window.location.origin + "/getstocknames", function(data){
    data.forEach(function(doc) {
        names.push(doc.stock.name);
        $('<div id='+ doc.stock.name +' class="stockdiv"><p3>'+ doc.stock.name +'</p3><button value=' + doc.stock.name + ' class="removebtn" onclick="remove(this)">x</button><br><p1>'+ doc.stock.descr +'</p1></div>')
        .insertBefore($("#adddiv"));
    });

    if (names.length) {
        $.each(names, function (i, name) {

            $.getJSON("https://www.quandl.com/api/v3/datasets/WIKI/" + name + ".json?column_index=4&order=asc&collapse=daily&start_date=2015-01-01&end_date=" + readyDate + "&api_key=seUGHG5K3G6Xh-eaAvMM",    function (data) {
    
                var readyData = [];
                data.dataset.data.forEach(function(doc) {
                    var date = new Date(doc[0]);
                    var unix = Number(date);
                    var temp = [unix, doc[1]];
                    readyData.push(temp);
                });
        
                seriesOptions[i] = {
                    name: name.toUpperCase(),
                    data: readyData
                };
                
                seriesCounter += 1;

                if (seriesCounter === names.length) {
                    $("#loader").css("display", "none");
                    $("#loader-text").css("display", "none");
                    $("#container, #stocklist").css("display", "block");
                    
                    
                    $("#outsidebox").css("background-color", "#fff");
                    $("#outsidebox").css("box-shadow", "0px 4px 9px -4px rgba(0, 0, 0, 0.70)");
                    createChart();
                }
            });
        });
    } else {
        seriesOptions[0] = {
                name: null,
                data: null
            };
            
        $("#loader").css("display", "none");
        $("#loader-text").css("display", "none");
        $("#container, #stocklist").css("display", "block");
        
        $("#outsidebox").css("background-color", "#fff");
        $("#outsidebox").css("box-shadow", "0px 4px 9px -4px rgba(0, 0, 0, 0.70)");
        createChart();
    }
});

function add(){
    $("#addbutton").prop("disabled", true);
    var inputStockCode = $("#stockcode").val().toUpperCase();
    var exist = false;
    
    for (var i = 0; i < names.length; i++) {
        if (names[i] === inputStockCode) {
            exist = true;
        }
    }
    
    if (exist === false) {
        $.ajax({
            type: "GET",
            url: "https://www.quandl.com/api/v3/datasets/WIKI/" + inputStockCode + ".json?column_index=4&order=asc&collapse=daily&start_date=2015-01-01&end_date=" + readyDate + "&api_key=seUGHG5K3G6Xh-eaAvMM",
            success: function(){
                ws.send(JSON.stringify({"add": inputStockCode}));      
            },
            error: function(){
                alert("Incorrect or not existing stock code");
                $("#addbutton").prop("disabled", false);
            }
        });
    } else {
        $("#addbutton").prop("disabled", false);
        $("#stockcode").val("");
    }
}

function remove(objButton) {
    var removeStockCode = objButton.value;
    
    ws.send(JSON.stringify({"remove": removeStockCode}));
    
}

ws.addEventListener("message", function(e) {
    var msg = JSON.parse(e.data);
    
    if (msg.add) {
        var inputStockCode = msg.add;
        var exist = false;
    
        for (var i = 0; i < names.length; i++) {
            if (names[i] === inputStockCode) {
                exist = true;
            }
        }
    
        if (exist === false) {
            $.ajax({
                type: "GET",
                url: "https://www.quandl.com/api/v3/datasets/WIKI/" + inputStockCode + ".json?column_index=4&order=asc&collapse=daily&start_date=2015-01-01&end_date=" + readyDate + "&api_key=seUGHG5K3G6Xh-eaAvMM",
                success: function(data){
                    var description = data.dataset.name;
                    var readyData = [];
                    data.dataset.data.forEach(function(doc) {
                        var date = new Date(doc[0]);
                        var unix = Number(date);
                        var temp = [unix, doc[1]];
                        readyData.push(temp);
                    });
            
                    chart.addSeries({
                        name: inputStockCode,
                        data: readyData
                    });
            
                    $('<div id='+ inputStockCode +' class="stockdiv"><p3>'+ inputStockCode +'</p3><button value=' + inputStockCode + ' class="removebtn" onclick="remove(this)">x</button><br><p1>'+ description +'</p1></div>')
                    .insertBefore($("#adddiv"));
                    $("#addbutton").prop("disabled", false);
                    $("#stockcode").val("");
            
                    $.get(window.location.origin + "/addstock/" + inputStockCode + "/" + description);
                
                    names.push(inputStockCode);
                }
            });
        } else {
        alert ("Stock Code Already Exist");
        }
    }
    
    if (msg.remove) {
        var removeStockCode = msg.remove;
        
        $.get(window.location.origin + "/removestock/" + removeStockCode);
    
        $("#" + removeStockCode).remove();
    
        for (var i = 0; i < names.length; i++) {
            if (names[i] === removeStockCode) {
                names.splice(i, 1);
                break;
            }
        }
        
        for (var s = 0; s < chart.series.length; s++) {
            if (chart.series[s].name === removeStockCode) {
                chart.series[s].remove();
                break;
            }
        }
    }
})

$("#stockcode").keypress(function(e) {
    if(e.which==13) {
      $("#addbutton").click();
    }
  });