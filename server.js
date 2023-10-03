// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

// Create a data structure to track existing rooms
const rooms = new Map();
var latestTime = 0;
var roomID = ""

app.use(express.static(__dirname + '/public')); 

// Redirect / to our index.html file
app.get('/', (req, res) => { res.sendFile(__dirname + '/public/index.html'); });
app.get('/room=:roomID', (req, res) => {const roomID = req.params.roomID; res.sendFile(__dirname + '/public/room.html'); });
app.get('/room', (req, res) => { res.sendFile(__dirname + '/public/room.html'); });

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 

const generateRoomID = () => {
  // Generate a random alphanumeric room ID (you can use a more robust method)
  return Math.random().toString(36).substring(2, 20);
};

io.on('connection', (socket) => {

  socket.on('createOrJoinRoom', (roomID) => {
    if (rooms.has(roomID)) {

      // Existe uma room, junta-se
      socket.join(roomID);
      rooms.get(roomID).push(socket.id);
      // Emite mensagem de entrada
      socket.emit('joinedRoom', roomID);

    } else { // Caso não exista

      roomID = generateRoomID(); 
      // Criar room nova
      rooms.set(roomID, [socket.id]);
      // Entrar
      socket.join(roomID);
      // Emite mensagem de entrada
      socket.emit('createdRoom', roomID);
    }

    io.to(roomID).emit('catchUp', latestTime);
    io.to(roomID).emit('updateInfo', roomID);

  });

  // Send Message
  socket.on('changeSource', (videotype, videoID, video, roomID) => {
    console.log(videotype);
    console.log(videoID);
    console.log(video);
    console.log(roomID);
    console.log("server ola");
    io.to(roomID).emit('changeSource', videotype, videoID, video);
  });

    // Send Message
  socket.on('sendMessage', (roomID, sender, message) => {
    io.to(roomID).emit('receiveMessage', sender, message);
  });

  // Play video
  socket.on('play', (roomID) => {
    io.to(roomID).emit('play');
  });

  // Pause Video
  socket.on('pause', (roomID, currentTime) => {
    io.to(roomID).emit('pause', currentTime);
  });

  // Seek Video
  socket.on('seek', (roomID, currentTime) => {
    io.to(roomID).emit('seek', currentTime);
    latestTime = currentTime;
  });

  // User Joined Room
  socket.on('UserJoinedRoom', (roomID, username) => {
    io.to(roomID).emit('UserJoinedRoom', username);
  });

  // Remove the user from all rooms when they disconnect
  socket.on('disconnect', () => {
    io.to(roomID).emit('UserDisconnected');
  });
});

