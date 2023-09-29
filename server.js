// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

//keep track of how times clients have clicked the button
var latestTime = 0;

app.use(express.static(__dirname + '/public')); 
//redirect / to our index.html file
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(client) {  

      console.log('A user connected');
      client.broadcast.emit('catchUp', latestTime);

      // Handle play event
      client.on('play', (currentTime) => {
        // Broadcast the play event and current time to all connected clients
        client.broadcast.emit('play', latestTime);
      });

      // Handle pause event
      client.on('pause', (currentTime) => {
        // Broadcast the pause event and current time to all connected clients
        client.broadcast.emit('pause', currentTime);
      });

      // Handle seek event
      client.on('seek', (currentTime) => {
        // Broadcast the seek event and current time to all connected clients
        client.broadcast.emit('seek', currentTime);
        latestTime = currentTime;
      });

      client.on('disconnect', () => {
        console.log('A user disconnected');
      });

});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 