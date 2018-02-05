var socketplug = function(data) {
	console.log("loading socketplug");
	var socketplug = {};
	socketplug.config = {
		rooms: true
	};

	socketplug.action = {
		event: null
	};

	//var access_token = access_token;
	var _data = data;
	var data = "grant_type=password&username=" + _data.apikey + "&password=" + _data.apisecret;

	var xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function() {
		if (this.readyState === this.DONE) {
			console.log(this.responseText);
			var data = JSON.parse(this.responseText);
			console.log(_data);
			init(data, _data);
		}
	});

	if(_data.getOAuth) {
		console.log("using get");
		xhr.open("GET", _data.endpoint+"/get/oauth/?"+data);
		xhr.send();
	} else {
		console.log("using POST");
		xhr.open("POST", _data.endpoint+"/oauth/token");
		xhr.setRequestHeader("authorization", "Basic Y2xpZW50OnNlY3JldA==");
		xhr.setRequestHeader("cache-control", "no-cache");
		xhr.setRequestHeader("postman-token", "a1fcb21e-e974-38d8-bd0a-05ef1ab4b2fa");
		xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
		xhr.send(data);
	}



	var init = function(data, _data) {
		var data = data;
		console.log(data);


		console.log('loaded script');
		//var socket = io.connect('http://socketplug.floretos.com:8080');
		//var socket = io.connect('http://socketplug.floretos.com');
		socketplug.data = data;
		socketplug.services = {};
		data.services = _data.services;
		for (var i in data.services) {
			var service = data.services[i];
			socketplug.services[service] = {};
			socketplug.services[service].socket = io.connect(_data.endpoint + '/' + service, {
			});
			/*socketplug.services[service].socket = io.connect('https://staging.ci.xertigo.com/' + service, {
				path:'/socket.io',
				port:3005
				});*/
			socketplug.services[service].socket.service = service;
			socketplug.services[service].socket.on('connection', function(data) {
				console.log(data);
				console.log("this");
				console.log(this);
				this.emit('connect', {
					msg: 'data'
				});
			});

			socketplug.services[service].socket.on("join", function(data) {
				console.log("Joined?");
				console.log(this);
				socketplug.action.event(this.service, "join", data, this);
			});

			socketplug.services[service].socket.on("user_join", function(data) {
				socketplug.action.event(this.service, "user_join", data, this);
			});

			socketplug.services[service].socket.on("user_leave", function(data) {
				socketplug.action.event(this.service, "user_leave", data, this);
			});

			socketplug.services[service].socket.on("sys_msg", function(data) {
				socketplug.action.event(this.service, "sys_msg", data, this);
			});

			socketplug.services[service].socket.on('connected', function(data) {
				console.log(data);
				console.log("connected");
				socketplug.action.event(this.service, "connected", data, this);
			});
			socketplug.services[service].socket.on('msg', function(data) {
				socketplug.action.event(this.service, "msg", data, this)
			});
		}

		for (var i in _data.socket_events) {
			socketplug.services[i].socket.events = _data.socket_events[i].events;
		}
		socketplug.action.event = function(service, msg, data) {
			if (socketplug.services[service].socket.events[msg]) {
				socketplug.services[service].socket.events[msg](data);
			}
		};


	};
	//init({}, data);
	return socketplug;
};
