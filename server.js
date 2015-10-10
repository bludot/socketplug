var express = require('express');
var app = express();
var http = require('http').Server(app);
var cors = require('cors');

var bodyParser = require('body-parser'),
  oauthserver = require('oauth2-server'); // Would be: 'oauth2-server'

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

app.oauth = oauthserver({
  model: require('./auth/model'),
  grants: ['password', 'refresh_token'],
  debug: true
});

// Handle token grant requests
app.options('*', cors(corsOptions));
app.all('/oauth/token', cors(corsOptions), app.oauth.grant());

app.get('/get/oauth', cors(corsOptions), function(req, res) {
console.log(req.query.grant_type);

	unirest.post('http://socketplug.floretos.com/oauth/token')
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

app.get('/secret', app.oauth.authorise(), function (req, res) {
  // Will require a valid access_token
  res.send('Secret area');
});

app.get('/public', function (req, res) {
  // Does not require an access_token
  res.send('Public area');
});

// Error handling
app.use(app.oauth.errorHandler());

var unirest = require('unirest');

var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public_html'));

http.listen(3005, process.env.IP);

var rooms = {
	lobby: {
		users: []
	}
};
var users = {};
var ids = {};

io.set('authorization', function (handshakeData, accept) {

  /*if (handshakeData.headers.cookie) {

    handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

    handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');

    if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
      //return accept('Cookie is invalid.', false);
    }

  } else {
    //return accept('No cookie transmitted.', false);
  }*/
  console.log(handshakeData._query.access_token);


unirest.get('http://socketplug.floretos.com/secret/?access_token='+handshakeData._query.access_token)
.header('Accept', 'application/x-www-form-urlencoded')
.send()
.end(function (response) {
  //console.log(response.body);
  console.log(response.body);
  if(response.body == "Secret area") {
  	console.log("we are in!");
  } else {
  	return accept("Wrong access_token", false);
  }
  accept(null, true);
});
  //app.oauth.authorise();

  
});

io.on('connection', function(socket) {
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

			//map username info to id
			ids[socket.id] = {};
			ids[socket.id].username = users[data.username];
			// Let everyone know a user joined
			io.to(users[data.username].id).emit("join", {
				message: "Welcome " + data.username,
				username: data.username,
				room: room,
				users: Object.getOwnPropertyNames(users)
			});
			io.to(users[data.username].id).emit("sys_msg", {
				message: "Welcome " + data.username,
				username: data.username,
				room: room,
				joiner: data.username
			});
			io.to(room).emit("sys_msg", {
				message: data.username + " joined the chat",
				username: data.username,
				room: room,
				joiner: data.username
			});
			io.to(room).emit("user_join", {
				username: data.username,
				room: room
			});
			console.log(Object.getOwnPropertyNames(users));
		}
		else {
			io.to(socket.id).emit("login_error", {
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
			io.to(data.room).emit('msg', {
				message: data.msg,
				username: data.username,
				room: data.room
			});
		}
	});

	socket.on('disconnect', function() {
		if (socket.id && ids[socket.id]) {
			for (var i in rooms) {
				if (rooms[i].users.indexOf(ids[socket.id].username.username) != -1) {
					io.to(i).emit("sys_msg", {
						message: ids[socket.id].username.username + " left the chat",
						joiner: ids[socket.id].username.username
					});
					io.to(i).emit("user_leave", {
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
			io.to(users[data.username].id).emit("join", {
				message: "Welcome " + data.username,
				username: data.username,
				room: room,
				users: Object.getOwnPropertyNames(users)
			});
			io.to(users[data.username].id).emit("sys_msg", {
				message: "Welcome " + data.username,
				username: data.username,
				room: room,
				joiner: data.username
			});
			io.to(room).emit("sys_msg", {
				message: data.username + " joined the chat",
				username: data.username,
				room: room,
				joiner: data.username
			});
			io.to(room).emit("user_join", {
				username: data.username,
				room: room
			});
		}
	}
});
