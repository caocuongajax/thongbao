var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash-node');

var users = [];

app.get('/', function (req, res){
  res.sendfile('index.html');
});

io.on('connection', function (socket) {
  socket.on('login', function (name) {
    // if this socket is already connected,
    // send a failed login message
    if (_.findIndex(users, { socket: socket.id }) !== -1) {
      socket.emit('login_error', 'You are already connected.');
    }

    // if this name is already registered,
    // send a failed login message
    if (_.findIndex(users, { name: name }) !== -1) {
      socket.emit('login_error', 'This name already exists.');
      return; 
    }

    users.push({ 
      name: name,
      socket: socket.id
    });

    socket.emit('login_successful', _.map(users, 'name'));
    socket.broadcast.emit('online', name);

    console.log(name + ' logged in');
  });

  socket.on('sendMessage', function (name, message) {
    var currentUser = _.find(users, { socket: socket.id });
    if (!currentUser) { return; }

    var contact = _.find(users, { name: name });
    if (!contact) { return; }
    
    io.to(contact.socket)
      .emit('messageReceived', currentUser.name, message);
  });

  socket.on('disconnect', function () {
    var index = _.findIndex(users, { socket: socket.id });
    if (index !== -1) {
      socket.broadcast.emit('offline', users[index].name);
      console.log(users[index].name + ' disconnected');

      users.splice(index, 1);
    }
  });
});
var port = Number(process.env.PORT || 4000);
http.listen(port, function(){
  console.log('listening on *:4000');
});

/*var app = require('http').createServer(handler)
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
});*/
