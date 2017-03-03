"use strict";

var path = process.cwd();
var Stock = require("../models/stocks");

module.exports = function(app) {
    
    app.get("/", function(req, res) {
        res.sendFile(path + "/public/home.html");
    });

    app.get("/getstocknames", function(req, res){
        Stock.find({}, function (err, data) {
            if (err) console.log(err);
            res.json(data);
        });
    });
    
    app.get("/addstock/:stockCode/:description", function(req, res){
        var stockCode = req.params.stockCode.toUpperCase();
        var stockDescription = req.params.description;
        Stock.findOne({ "stock.name": stockCode }, function (err, stock) {
            if(err) console.log(err);
            if (!stock) {
                var newStock = new Stock();
                
                newStock.stock.name = stockCode;
                newStock.stock.descr = stockDescription;
                
                newStock.save(function (err) {
                    if (err) console.log(err);
                });
            }
        });
    });
    
    app.get("/removestock/:stockCode", function(req, res) {
        var stockCode = req.params.stockCode;
        Stock.findOneAndRemove({ "stock.name": stockCode }, function(err, offer) {
            if(err) throw err;
        });
    });
};
