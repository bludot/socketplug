(function() {
    window.socketplug = function(access_token) {
    console.log("loading socketplug");
    var socketplug = {};
    socketplug.config = {
        rooms: true
    }

    socketplug.action = {
      event: null
    };
    var access_token = access_token;
    // Add the socket script
    var socketjs = document.createElement('script');
    //socketjs.src = "http://socketplug.floretos.com:8080/socket.io/socket.io.js";
    
    socketjs.src = "http://socketplug.floretos.com/socket.io/socket.io.js";
    socketjs.onload = function() {
        var markdownparser = document.createElement('script');
        markdownparser.src = "http://socketplug.floretos.com/js/markdown.min.js";
        markdownparser.onload = function() {
            console.log('loaded script');
            //var socket = io.connect('http://socketplug.floretos.com:8080');
            //var socket = io.connect('http://socketplug.floretos.com');
            var socket;
                socket = io.connect('http://socketplug.floretos.com', {query:"access_token="+access_token});
            socket.on('connection', function(data) {
                console.log(data);
                socket.emit('connect', {
                    msg: 'data'
                });
            });

            socket.on("join", function(data) {
                console.log("Joined?");
                socketplug.action.event("join", data);
            });

            socket.on("user_join", function(data) {
                socketplug.action.event("user_join", data);
            });

            socket.on("user_leave", function(data) {
                socketplug.action.event("user_leave", data);
            });
            
            socket.on("sys_msg", function(data) {
                socketplug.action.event("sys_msg", data);
            });

            socket.on('connected', function(data) {
                console.log(data);
            });
            socket.on('msg', function(data) {
                socketplug.action.event("msg", data)
            });
            socketplug.socket = socket;
            /*******************************************
             *
             * Script for inputs
             *
             ********************************************/
            /*init_data.msginput.addEventListener('keyup', function(e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    var msg = this.value;
                    socket.emit('msg', {
                        msg: msg
                    });
                    this.value = '';
                }
            });
            init_data.login_submit.addEventListener('click', function() {
                var msg = init_data.login_input.value;
                    socket.emit('login', {
                        username: msg,
                        config: config
                    });
                    init_data.login_input.value = '';
            }, false);
            init_data.login_input.addEventListener('keyup', function(e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    var msg = this.value;
                    socket.emit('login', {
                        username: msg,
                        config: config
                    });
                    this.value = '';
                }
            });*/
        }
        document.body.insertBefore(markdownparser, document.body.children[0]);
    }
    document.body.insertBefore(socketjs, document.body.children[0]);
    return socketplug;
};

})();

    /*
    var socket = io.connect('http://socketplug.floretos.com:8080');
      socket.on('connection', function (data) {
        console.log(data);
        socket.emit('connect', { msg: 'data' });
      });
      socket.on('connected', function (data) {
        console.log(data);
      });
      socket.on('msg', function (data) {
        console.log(data.msg);
      });
      */
    /*
    var socket = io.connect('http://socketplug.floretos.com:8080');
      socket.on('connection', function (data) {
        console.log(data);
        socket.emit('connect', { msg: 'data' });
      });
      socket.on('connected', function (data) {
        console.log(data);
      });
      socket.on('msg', function (data) {
        console.log(data.msg);
      });
      */