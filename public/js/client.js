var socket = io();
socket.on('message', function(message) {
    alert('The server has a message for you: ' + message);
})