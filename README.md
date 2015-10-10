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

#### For Ionic Framework:

Some funky stuff right now so ill just post my working example which is not the
pretiest right now:
```javascript
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ChatApp', ['ionic'])
    .factory('_socketplug', ['$window', '$q', '$http', function($window, $q, $http) {
        return {
            // Initialize the socketplug API with callback to do another function
            // when done
            init: function(scope, callback) {
                // we need scope to do our functions inside of the
                // ChatController scope
                var scope = scope;

                // Standard url. Will change later when adding security as to
                // who has access to use the chat like this (this requires
                // socketplug backend programming)
                var asyncUrl = "http://socketplug.floretos.com/js/client/ionic/bare/init.js";

                // Function to load the script
                var asyncLoad = function(asyncUrl) {
                    var script = document.createElement('script');
                    script.src = asyncUrl;
                    document.body.appendChild(script);
                };

                // Lets load it!
                asyncLoad(asyncUrl);

                // Set _socketplug to what is returned so that we can add our functions to it
                var _socketplug = this;
                // Don't think this is needed anymore
                _socketplug.not_loaded = true;

                // Is it loaded? What about now? Now?
                var interval = setInterval(function() {
                    // Its loaded!
                    if ($window.socketplug) {
                        //$http.defaults.headers.get["Content-Type"] = "application/x-www-form-urlencoded";
                        var req = {
                            method: 'GET',
                            url: 'http://socketplug.floretos.com/get/oauth/?grant_type=password&username=username&password=password',
                            transformRequest: function(obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                        };
                        $http(req).then(function(response) {
                            // Lets copy everything from the loaded socketplug to the
                            // previous "this" but that doesnt really work so add
                            // another property to "_socketplug"
                            console.log(response);
                            _socketplug.socketplug = $window.socketplug(response.data.access_token);

                            // Just some checks ignore these
                            console.log("log init");
                            console.log(this.init);

                            // Don't think these are needed anymore
                            _socketplug.not_loaded = false;
                            _socketplug.loaded = true;

                            /**
                             * So now socketplug is loaded and we have access to its
                             * goodies. Lets make our own functions to handle the
                             * socket.
                             */

                            _socketplug.socketplug.login = function(username) {
                                console.log("logging in");
                                _socketplug.socketplug.socket.emit("login", {
                                    username: username,
                                    config: {
                                        rooms: true
                                    }
                                });
                            };
                            _socketplug.socketplug.action = {};
                            _socketplug.socketplug.action.events = {
                                join: function(data) {
                                    console.log("joined");
                                    scope.loginModal.hide();
                                    console.log(data);
                                    scope.data = data;
                                },
                                msg: function(data) {
                                    scope.newMsg(data);
                                }
                            }
                            _socketplug.socketplug.sendMsg = function(msg) {
                                _socketplug.socketplug.socket.emit('msg', {
                                    msg: msg
                                });
                            };
                            _socketplug.socketplug.action.event = function(_event, data) {
                                if (_socketplug.socketplug.action.events[_event]) {
                                    _socketplug.socketplug.action.events[_event](data);
                                }
                            };


                            // Ok we got everything set up. Run that function we
                            // wanted to from the start to let the app know we have
                            // socketplug setup
                            callback();
                            // We dont need to check for socketplug so stop
                            clearInterval(interval);
                        });
                    }
                }, 1000);
            }
        };
    }])
    .run(['$ionicPlatform', '$timeout', '_socketplug', function($ionicPlatform, $timeout, _socketplug) {
        $ionicPlatform.ready(function() {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    }]).controller('ChatController', ['$scope', '_socketplug', '$window', '$ionicModal', '$ionicLoading', '$ionicScrollDelegate', function($scope, _socketplug, $window, $ionicModal, $ionicLoading, $ionicScrollDelegate) {
        var self = this;
        $scope.messages = [];

        // Loading functions
        $scope.showLoading = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hideLoading = function() {
            $ionicLoading.hide();
        };

        // We gotta show loading while we load socketplug
        $scope.showLoading();

        // Setup the modal for initial login
        $ionicModal.fromTemplateUrl('login.html', function(modal) {
            $scope.loginModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        // The login function to show the login modal
        // happens when socketplug is loaded
        $scope.login = function() {
            $scope.hideLoading();
            $scope.loginModal.show();
        }

        // We have to process the login when user gives username
        $scope.processLogin = function() {
            console.log("got the tap");
            _socketplug.socketplug.login(self.username);
        }

        // We are finally ready to start the app. Fetch socketplug and move on
        // from there
        _socketplug.init($scope, $scope.login);

        // function to join the chat. Not sure if this is used
        $scope.join = function() {
            _socketplug.socketplug.login();
        };

        // When we send a message we call on socketplug
        self.sendMsg = function() {
            console.log(self.msg);
            _socketplug.socketplug.sendMsg(self.msg);
            self.msg = "";
            $ionicScrollDelegate.scrollBottom();
        };

        // Theres a new message. lets add it to the messages array and to the
        // view. Might make this different as it will become a huge array soon.
        // SQLite?
        $scope.newMsg = function(data) {
            console.log(data);
            $scope.messages.push(data);
            $scope.$apply();
            console.log(self.messages);
            $ionicScrollDelegate.scrollBottom();
        };


        // Directive. Handles the ng-enter of buttons. This lets use hit enter
        // on the keyboard
    }]).directive('ngEnter', function() {
        return function(scope, element, attrs) {
            return element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    })

                    event.preventDefault();
                }
            });
        };
    });

```
