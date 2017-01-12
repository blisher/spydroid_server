var ws = require("nodejs-websocket")

var server = ws.createServer(function (conn) {
    conn.on("text", function (str) {
      conn.sendText(str.toUpperCase()+"!!!")
    })
    conn.on("close", function (code, reason) {
      console.log("Connection closed")
    })
}).listen(8001)
