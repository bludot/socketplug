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


```javascript
SocketPlug.init({
    apikey: "apikey",                           // key

    apisecret: "apisecret",                     // secret

    services: ["all", "your", "services"],      // Services you will be utilizing
                                                // (usually just one

    callback: callback                          // Callback would be the function
                                                // to enable the input fields and
                                                // such that need socketplug to be
                                                // initialized
});
```
