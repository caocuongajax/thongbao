var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var connectionsArray = [];
var port = Number(process.env.PORT || 4000);

app.listen(port);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  connectionsArray.push(socket);
  socket.volatile.emit('info', socket.id);
  socket.on('disconnect', function () {
    var socketIndex = connectionsArray.indexOf(socket);
    if (socketIndex >= 0) {
      connectionsArray.splice(socketIndex, 1);
    }
  });
  //socket.emit('news', { hello: 'world' });
  socket.on('notification', function (data) {
    connectionsArray.forEach(function(tmpSocket){
      tmpSocket.volatile.emit('message', data);
    });
  });
});
