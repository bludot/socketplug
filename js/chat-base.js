window.onload = function() {
        init({
            login_window: document.querySelector('#login').parentNode.parentNode,
            login_input: document.querySelector('#login'),
            msginput: document.querySelector('#msgbox'),
            chat_view: document.querySelector('main'),
            rooms: false,
            generate_msg: function(data) {
                generate_time = function(user) {
            var date = new Date();
                var time = date.getHours() + ':' + date.getMinutes();
                var add = document.createElement('p');
                add.time = document.createElement('time');
                add.user = document.createElement('mark');
                add.user.className = "username";
                add.time.appendChild(document.createTextNode(time));
                add.user.appendChild(document.createTextNode(user));
                add.appendChild(add.time);
                add.appendChild(add.user);
                return add;
          };
          var msg = generate_time(data.username);
                message = markdown.renderJsonML(markdown.toHTMLTree(data.message));
                msg.innerHTML += message;
                return msg;
      }
        });
document.querySelector('#login').parentNode.parentNode.style.cssText = "position: fixed; z-index: 1; top: 0; bottom: 0; background: rgb(247, 247, 247); left: 0; right: 0;";
    }