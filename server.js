var express = require('express');
var app = express();
var http = require('http').Server(app);
var cors = require('cors');
var bodyParser = require('body-parser'),
  oauthserver = require('express-oauth-server'); // Would be: 'oauth2-server',

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

var corsOptions = {
  origin: function(origin, callback){
    console.log(origin);
    var originIsWhitelisted = true;
    callback(null, originIsWhitelisted);
  },
  credentials: true
};
app.use(cors(corsOptions));
//app.use(allowCrossDomain);

app.oauth = new oauthserver({
  model: require('./auth/model'),
  allowBearerTokensInQueryString: true,
  accessTokenLifetime: 4 * 60 * 60
});

// Handle token grant requests
app.options('*', cors(corsOptions));
app.all('/oauth/token', cors(corsOptions), app.oauth.token());

app.get('/get/oauth', cors(corsOptions), function(req, res) {
  console.log(req.query.grant_type);

  unirest.post(process.env.API_ENDPOINT+'/oauth/token')
    .headers({'Content-Type': 'application/x-www-form-urlencoded'})
    .auth('client', 'secret')
    .send("grant_type="+req.query.grant_type)
    .send("username="+req.query.username)
    .send("password="+req.query.password)
    .end(function (response) {
      //console.log(response.body);
      console.log(response.body);
      res.send(response.body);
    });
});

app.get('/secret', app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token
  res.send('Secret area');
});

app.get('/public', function (req, res) {
  // Does not require an access_token

  res.send('Public area: '+process.env.API_ENDPOINT);
});

// Error handling
//app.use(app.oauth.errorHandler());

var unirest = require('unirest');

var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

http.listen(9000, process.env.IP);

var rooms = {
  lobby: {
    users: []
  }
};
var users = {};
var ids = {};
io.origins('*:*');
var services = {};
services.chat = io
  .of('/chat')
  .on('connection', function(socket) {
    // For use to get ip
    console.log("a connection has been established!");
    socket.address = socket.request.connection._peername;
    //console.log(socket.handshake.query);

    socket.emit('connected', {
      will: 'be received by everyone'
    });
    socket.on('login', function(data) {
      if (!users[data.username]) {

	var room;
	if (!data.room) {
	  socket.join('lobby');
	  room = 'lobby';
	}
	else {
	  socket.join(data.room)
	  room = data.room;
	}
	if (!rooms[room]) {
	  rooms[room] = {
	    users: [
	      data.username
	    ]
	  }
	}
	else {
	  rooms[room].users.push(data.username);
	}
	console.log("user " + data.username + " has joined the chat service!");
	//add user to socket
	socket.username = data.username;

	//add user to users
	users[data.username];
	users[data.username] = {};
	users[data.username].username = data.username;
	users[data.username].id = socket.id;
	users[data.username].croom = room;
	users[data.username].config = data.config;
	users[data.username].socket = socket;

	//map username info to id
	ids[socket.id] = {};
	ids[socket.id].username = users[data.username];
	// Let everyone know a user joined
	services.chat.to(users[data.username].id).emit("join", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  users: Object.getOwnPropertyNames(users)
	});
	services.chat.to(users[data.username].id).emit("sys_msg", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.chat.to(room).emit("sys_msg", {
	  message: data.username + " joined the chat",
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.chat.to(room).emit("user_join", {
	  username: data.username,
	  room: room
	});
	console.log(Object.getOwnPropertyNames(users));
      }
      else {
	services.chat.to(socket.id).emit("login_error", {
	  message: "I'm sorry, the username '" + data.username + "' is already taken"
	});
      }
    });
    socket.on('msg', function(data) {
      console.log(data);
      if(!ids[socket.id]) {
	return false;
      }
      data.room = users[ids[socket.id].username.username].croom;
      data.username = ids[socket.id].username.username;

      services.chat.to(data.room).emit('msg', {
	message: data.msg,
	username: data.username,
	room: data.room
      });

    });

    socket.on('pmsg', function(data) {
      console.log("PRIVMSG");
      console.log("data");
      console.log(users);
      data.room = users[ids[socket.id].username.username].croom;
      data.username = ids[socket.id].username.username;

      var user = data.msg.to;
      var msg = data.msg.msg;
      users[user].socket.emit("msg", {
	message: msg,
	username: data.username,
	room:data.room
      });
    });

    socket.on('disconnect', function() {
      if (socket.id && ids[socket.id]) {
	for (var i in rooms) {
	  if (rooms[i].users.indexOf(ids[socket.id].username.username) != -1) {
	    services.chat.to(i).emit("sys_msg", {
	      message: ids[socket.id].username.username + " left the chat",
	      joiner: ids[socket.id].username.username
	    });
	    services.chat.to(i).emit("user_leave", {
	      username: ids[socket.id].username.username
	    });
	    delete rooms[i].users[ids[socket.id].username.username];
	  }
	}
	console.log(ids[socket.id].username.username + " has left the chat service!");

	delete users[ids[socket.id].username.username];
      }
    });
    /*******************************************
     *
     * Commands
     *
     ********************************************/

    var cmd = {
      "/pm": function(data) {
	var user = data.msg.split(" ")[1];
	var msg = data.msg.substr(data.msg.split(" ")[0].length+data.msg.split(" ")[1]+1);
	users[data.username].socket.emit("msg", {
	  msg: msg,
	  username: data.username,
	  room:data.room
	});
      },
      "/join": function(data) {
	var room = data.msg.split('/join ')[1];
	socket.join(room);
	if (!rooms[room]) {
	  rooms[room] = {
	    users: [
	      data.username
	    ]
	  }
	}
	else {
	  if (rooms[room].users.indexOf(data.username) == -1) {
	    rooms[room].users.push(data.username);
	  }
	}
	users[ids[socket.id].username.username].croom = room;
	services.chat.to(users[data.username].id).emit("join", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  users: Object.getOwnPropertyNames(users)
	});
	services.chat.to(users[data.username].id).emit("sys_msg", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.chat.to(room).emit("sys_msg", {
	  message: data.username + " joined the chat",
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.chat.to(room).emit("user_join", {
	  username: data.username,
	  room: room
	});
      }
    }
  });
services.RTData = io
  .of('/RTData')
  .on('connection', function(socket) {
    // For use to get ip
    console.log("a connection has been established!");
    socket.address = socket.request.connection._peername;
    //console.log(socket.handshake.query);

    socket.emit('connected', {
      will: 'be received by everyone'
    });
    socket.on('login', function(data) {
      if (!users[data.username]) {

	var room;
	if (!data.room) {
	  socket.join('lobby');
	  room = 'lobby';
	}
	else {
	  socket.join(data.room)
	  room = data.room;
	}
	if (!rooms[room]) {
	  rooms[room] = {
	    users: [
	      data.username
	    ]
	  }
	}
	else {
	  rooms[room].users.push(data.username);
	}
	console.log("user " + data.username + " has joined the chat service!");
	//add user to socket
	socket.username = data.username;

	//add user to users
	users[data.username];
	users[data.username] = {};
	users[data.username].username = data.username;
	users[data.username].id = socket.id;
	users[data.username].croom = room;
	users[data.username].config = data.config;
	users[data.username].socket = socket;
	//map username info to id
	ids[socket.id] = {};
	ids[socket.id].username = users[data.username];
	// Let everyone know a user joined
	services.RTData.to(users[data.username].id).emit("join", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  users: Object.getOwnPropertyNames(users)
	});
	services.RTData.to(users[data.username].id).emit("sys_msg", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.RTData.to(room).emit("sys_msg", {
	  message: data.username + " joined the chat",
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.RTData.to(room).emit("user_join", {
	  username: data.username,
	  room: room
	});
	console.log(Object.getOwnPropertyNames(users));
      }
      else {
	services.RTData.to(socket.id).emit("login_error", {
	  message: "I'm sorry, the username '" + data.username + "' is already taken"
	});
      }
    });
    socket.on('msg', function(data) {
      console.log(data);

      data.room = users[ids[socket.id].username.username].croom;
      data.username = ids[socket.id].username.username;

      if (cmd[data.msg.split(' ')[0]]) {
	if((!users[data.username].config.rooms && data.msg.split(' ')[0] != "/join") || (users[data.username].config.rooms)) {
	  cmd[data.msg.split(' ')[0]](data);
	}
      }
      else {
	services.RTData.to(data.room).emit('msg', {
	  message: data.msg,
	  username: data.username,
	  room: data.room
	});
      }
    });

    socket.on('pm', function(data) {
      console.log(data);

      data.room = users[ids[socket.id].username.username].croom;
      data.username = ids[socket.id].username.username;


      users[data.user].socket.emit('msg', {
	message: data.msg,
	username: data.username,
	room: data.room
      });

    });

    socket.on('disconnect', function() {
      if (socket.id && ids[socket.id]) {
	for (var i in rooms) {
	  if (rooms[i].users.indexOf(ids[socket.id].username.username) != -1) {
	    services.RTData.to(i).emit("sys_msg", {
	      message: ids[socket.id].username.username + " left the chat",
	      joiner: ids[socket.id].username.username
	    });
	    services.RTData.to(i).emit("user_leave", {
	      username: ids[socket.id].username.username
	    });
	    delete rooms[i].users[ids[socket.id].username.username];
	  }
	}
	console.log(ids[socket.id].username.username + " has left the chat service!");

	delete users[ids[socket.id].username.username];
      }
    });
    /*******************************************
     *
     * Commands
     *
     ********************************************/

    var cmd = {
      /*"/pm": function(data) {
	var user = data.msg.split(" ")[1];
	var msg = data.msg.substr(data.msg.split(" ")[0].length+data.msg.split(" ")[1]+1);
	services.RTData.to(users[data.username].id).emit("msg", {
	msg: msg,
	username: data.username,
	room:data.room
	});
	},*/
      "/join": function(data) {
	var room = data.msg.split('/join ')[1];
	socket.join(room);
	if (!rooms[room]) {
	  rooms[room] = {
	    users: [
	      data.username
	    ]
	  }
	}
	else {
	  if (rooms[room].users.indexOf(data.username) == -1) {
	    rooms[room].users.push(data.username);
	  }
	}
	users[ids[socket.id].username.username].croom = room;
	services.RTData.to(users[data.username].id).emit("join", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  users: Object.getOwnPropertyNames(users)
	});
	services.RTData.to(users[data.username].id).emit("sys_msg", {
	  message: "Welcome " + data.username,
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.RTData.to(room).emit("sys_msg", {
	  message: data.username + " joined the chat",
	  username: data.username,
	  room: room,
	  joiner: data.username
	});
	services.RTData.to(room).emit("user_join", {
	  username: data.username,
	  room: room
	});
      }
    }
  });
