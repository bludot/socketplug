
var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create an instance of node-http-proxy
//
var proxy = new httpProxy({
  target: {
    host: 'localhost',
    port: 3005
  }
});

var server = http.createServer(function (req, res) {
  //
  // Proxy normal HTTP requests
  //
  proxy.proxyRequest(req, res);
});


server.on('upgrade', function (req, socket, head) {
  //
  // Proxy websocket requests too
  //

console.log(proxy);
proxy.proxyWebsocketRequest(req, socket, head, {
    host: 'localhost',
    port: 3005
  });
});

server.listen(8000);

