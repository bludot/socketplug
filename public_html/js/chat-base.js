(function(io, socketplug) {

    console.log("its going");

    var socket_events = {
        "chat": {
            events: {
                'join': function(data) {
                    console.log("logged in!");
                    var node = document.querySelector('#loginbox');
                    node.parentNode.removeChild(node);
                },
                'msg': function(data) {
                    var msg_ = document.createElement('div');
                    msg_.className = "msg-box";
                    msg_.user = document.createElement('div');
                    msg_.user.className = "msg-title";
                    msg_.msg = document.createElement('div');
                    msg_.msg.className = "msg-content";
                    msg_.user.appendChild(document.createTextNode(data.username));
                    msg_.msg.appendChild(document.createTextNode(data.message));
                    msg_.appendChild(msg_.user);
                    msg_.appendChild(msg_.msg);
                    document.querySelector('#room-' + data.room).querySelector('.msg').appendChild(msg_);
                }
            }
        }
    }

    var socket = socketplug({
        apikey: "username",
        apisecret: "password",
        socket_events: socket_events,
        services: ["chat"]
    });
    document.querySelector("#username").addEventListener('keypress', function(e) {

        var e = e || window.event;
        if (e.which == 13) {
            console.log("test");
            socket.services.chat.socket.emit('login', {
                username: this.value
            })
            document.querySelector('main').querySelector('input').addEventListener('keypress', function(e) {
                var e = e || window.event;
                if (e.which == 13) {
                    socket.services.chat.socket.emit('msg', {
                        msg: this.value
                    });
                    this.value = "";
                }
            });

        }
    });
})(io, socketplug)