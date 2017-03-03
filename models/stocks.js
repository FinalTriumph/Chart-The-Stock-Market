"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Stock = new Schema({
    stock: {
        name: String,
        descr: String
    }
});

module.exports = mongoose.model("Stock", Stock);