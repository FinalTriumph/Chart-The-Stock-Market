var express = require("express");
var app = express();
var mongourl = process.env.MONGOLAB_URI || "mongodb://localhost:27017/data";
var mongoose = require("mongoose");
var routes = require("./routes/index.js");
var path = process.cwd();

//////////Code from "http://codular.com/node-web-sockets"
var http = require("http");
var server = http.createServer(app);
var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({
    httpServer: server
});

var count = 0;
var clients = {};
wsServer.on("request", function(r){
    var connection = r.accept('echo-protocol', r.origin);
    
    // Specific id for this client & increment count
    var id = count++;
    
    // Store the connection method so we can loop through & contact all clients
    clients[id] = connection;
    console.log('Connection accepted [' + id + ']');
    
    // Create event listener
    connection.on('message', function(message) {
        
        // The string message that was sent to us
        var msgString = message.utf8Data;

        // Loop through all clients
        for(var i in clients){
            // Send a message to the client with the message
            clients[i].sendUTF(msgString);
        }

    });
    
    connection.on('close', function(reasonCode, description) {
        delete clients[id];
        console.log('Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
/////////////////////////////

mongoose.connect(mongourl);
mongoose.Promise = global.Promise;

app.use("/public", express.static(path + "/public"));
app.use("/controllers", express.static(path + "/controllers"));

routes(app);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    console.log("Server connected");
})