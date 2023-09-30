// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

// Create a data structure to track existing rooms
const rooms = new Map();

app.use(express.static(__dirname + '/public')); 
//redirect / to our index.html file
app.get('/room=:roomID', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Adjust the path to your HTML file as needed
});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 

const generateRoomID = () => {
  // Generate a random alphanumeric room ID (you can use a more robust method)
  return Math.random().toString(36).substring(2, 8);
};

io.on('connection', (socket) => {
  socket.on('createOrJoinRoom', (roomID) => {

    if (rooms.has(roomID)) {

      // Room already exists; join the existing room
      socket.join(roomID);
      rooms.get(roomID).push(socket.id);

      // Emit a message or event to indicate joining
      socket.emit('joinedRoom', roomID);

    } else {

      const roomID = generateRoomID(); // Generate a room ID

      // Room does not exist; create a new room
      rooms.set(roomID, [socket.id]);

      // Join the room
      socket.join(roomID);

      // Emit a message or event to indicate creation
      socket.emit('createdRoom', roomID);
    }
  });
  socket.on('disconnect', () => {
    // Remove the user from all rooms when they disconnect
    const socketRooms = io.sockets.adapter.rooms;
    for (const roomID of Object.keys(socketRooms)) {
      if (rooms.has(roomID)) {
        rooms.get(roomID).splice(rooms.get(roomID).indexOf(socket.id), 1);
        if (rooms.get(roomID).length === 0) {
          rooms.delete(roomID); // Remove the room if it's empty
        }
      }
    }
  });
});




/*
// IO Connection
io.on('connection', function(client) {  

  console.log('A user connected');
  client.broadcast.emit('catchUp', latestTime);
  // Utilizador Entrou
  client.broadcast.emit('newUser', "NomeUtilizador");

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

*/