var init = (function(init_data) {
    var init_data = init_data;

    var config = {
        rooms: init_data.rooms
    }
    console.log("we started init!");


    // Add the socket script
    var socketjs = document.createElement('script');
    //socketjs.src = "http://moniker.floretos.com:8080/socket.io/socket.io.js";
    if(location.hash == "#hook-moniker" || (location.href !== "https://moniker-bludot.c9.io/" && location.href !== "http://moniker-bludot.c9.io/")) {
        socketjs.src = "http://moniker.floretos.com:3000/socket.io/socket.io.js";
    } else {
        socketjs.src = "/socket.io/socket.io.js";
    }
    socketjs.onload = function() {
        var markdownparser = document.createElement('script');
        markdownparser.src = "//moniker.floretos.com/js/markdown.min.js";
        markdownparser.onload = function() {
            console.log('loaded script');
            //var socket = io.connect('http://moniker.floretos.com:8080');
            //var socket = io.connect('http://moniker.floretos.com');
            var socket;
            if(location.hash == "#hook-moniker" || (location.href !== "https://moniker-bludot.c9.io/" && location.href !== "http://moniker-bludot.c9.io/")) {
                socket = io.connect('http://moniker.floretos.com:3000', {query:"access_token="+init_data.access_token});
            } else {    
                socket = io.connect('/', {query:"access_token=test"});
            }
            socket.on('connection', function(data) {
                console.log(data);
                socket.emit('connect', {
                    msg: 'data'
                });
            });

            socket.on("join", function(data) {
                console.log("Joined?");
                init_data.login_window.style.zIndex = 0;
                init_data.login_window.style.opacity = 0;
                init_data.login_window.style.display = 'none';
                if(init_data.join_action) {
                    init_data.join_action(data);
                }
            });

            socket.on("user_join", function(data) {
                if(init_data.user_join_action) {
                    init_data.user_join_action(data);
                }
            });

            socket.on("user_leave", function(data) {
                if(init_data.user_leave_action) {
                    init_data.user_leave_action(data);
                }
            });
            
            socket.on("sys_msg", function(data) {
                console.log("data: " + data);
                var message = data['message'];
                // Setup the time the message was received
                data.username = 'sys';
               var msg = init_data.generate_msg(data);
               var regexp = new RegExp(data.joiner, "gi");
               //console.log(msg.innerHTML.toString());
               var tmptagname = msg.tagName;
               console.log(tmptagname);
               console.log(msg.className);
               var tmpclassName = msg.className || "";
               console.log(tmpclassName);
               msg = msg.innerHTML.toString().replace(regexp, "<mark>"+data.joiner+"</mark>");
               console.log(msg);
               var tmsg = document.createElement(tmptagname.toString().toLowerCase());
               if(tmpclassName.length > 0) {
                   tmsg.className = tmpclassName.toString();
               }
               console.log(tmsg);
               tmsg.innerHTML = msg;
               msg = tmsg;
                // Scroll to newest message
                if(init_data.rooms) {
                    init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').appendChild(msg);
                    init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').scrollTop = init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').scrollHeight;
                } else {
                    init_data.chat_view.appendChild(msg);
                    init_data.chat_view.scrollTop = init_data.chat_view.scrollHeight;
                }
            });

            socket.on('connected', function(data) {
                console.log(data);
            });
            socket.on('msg', function(data) {
                var message = data['message'];
                console.log(message);
                var user = data.username;
                var msg = init_data.generate_msg(data);
                if(init_data.rooms) {
                    init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').appendChild(msg);
                    init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').scrollTop = init_data.chat_view.querySelector('#room-'+data.room.toString()).querySelector('.msg').scrollHeight;
                } else {
                    init_data.chat_view.appendChild(msg);
                    init_data.chat_view.scrollTop = init_data.chat_view.scrollHeight;
                }
                console.log(data.msg);
            });


            /*******************************************
             *
             * Script for inputs
             *
             ********************************************/
            init_data.msginput.addEventListener('keyup', function(e) {
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
            });
        }
        document.body.insertBefore(markdownparser, document.body.children[0]);
    }
    document.body.insertBefore(socketjs, document.body.children[0]);

});

    /*
    var socket = io.connect('http://moniker.floretos.com:8080');
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
    var socket = io.connect('http://moniker.floretos.com:8080');
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