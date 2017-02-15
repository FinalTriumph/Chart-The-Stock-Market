var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/public/home.html");
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on port " + port);
})