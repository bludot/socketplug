# SocketPlug

The new available service offering sockets to anyone!

__What ever you do, don't look in public_html. Be warned! some ugly old code in
there that needs to be rewritten__

## History:
A branch of Moniker which got carried away to some other malformed project. Thus
SocketPlug was born. Initially the idea behind SocketPlug was to make a plugable
chat service for any client and offering the startup code. This enables devs to
plugin SocketPlug and use its events. There is no setup. You just need a api
key. But sockets can be used for so much more! Yes! they can. So now I will be
offering more than just a chat. There will be services like video conferencing,
live file editing, streaming api, etc. all under one service. The usage should
be easy like
```javascript
SocketPlug.init({
    apikey: "apikey",
    apisecret: "apisecret",
    services: ["all", "your", "services"],
    callback: callback
});
```

## Usage:
Well proper docs arent here yet but im working on making it as simple as posible

#### Web Basic usage

``` javascript
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
```
