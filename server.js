// server.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
const util = require('util');

// Create a data structure to track existing rooms
const rooms = new Map();
var roomdata = {};
var syncdata = {};
let isRunning = 0;

function getIDRoom(socketid)
{
  let foundKey = null;
  for (const [key, sockets] of rooms) {
    if (sockets.includes(socketid)) {
      foundKey = key;
      break; // Stop searching once the key is found
    }
  }
  return foundKey;
}
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

  console.log('A user connected with socket ID:', socket.id);

  socket.on('createOrJoinRoom', (roomID) => {
    if (rooms.has(roomID)) {

      // Existe uma room, junta-se
      socket.join(roomID);
      rooms.get(roomID).push(socket.id);
      // Emite mensagem de entrada
      socket.emit('joinedRoom', roomID);

    } else { // Caso não exista

      const roomID = generateRoomID(); 
      // Criar room nova
      rooms.set(roomID, [socket.id]);
      // Entrar
      socket.join(roomID);
      // Emite mensagem de entrada
      socket.emit('createdRoom', roomID);
    }

    // SetTimeOut arbitrário | Corrigir depois.
    setTimeout(() => {
      io.to(getIDRoom(socket.id)).emit('catchUp', roomdata[getIDRoom(socket.id)].latestTime, roomdata[getIDRoom(socket.id)].latestSource);
    }, "5000");
    
    io.to(getIDRoom(socket.id)).emit('updateInfo', getIDRoom(socket.id));

    if (!roomdata[getIDRoom(socket.id)]) {
      roomdata[getIDRoom(socket.id)] = {
        latestTime: 0,
        latestSource: "youtube",
        socketIdToUsername: {}
      };
    }

    if (!syncdata[getIDRoom(socket.id)]) {
      syncdata[getIDRoom(socket.id)] = {
        clients: {}
      };
    }

    if(isRunning == 0) {
      isRunning = 1;
      setInterval(() => {
        io.to(getIDRoom(socket.id)).emit('updateLogTime', syncdata);
        // console.log(util.inspect(syncdata, {showHidden: false, depth: null, colors: true}))
      }, "1000");
    }
    
  });

  // Change Source
  socket.on('changeSource', ( videoID, roomID, videotype) => {
    io.to(roomID).emit('changeSource',  videoID, videotype);
    roomdata[getIDRoom(socket.id)].latestSource = {videourl:videoID, videotype:videotype};
    roomdata[getIDRoom(socket.id)].latestTime = 0;
  });

  // User Is Typing
  socket.on('isTyping', (roomID, sender) => {
    io.to(roomID).emit('isTyping', sender);
  });

  // Send Message
  socket.on('sendMessage', (roomID, sender, message) => {
    io.to(roomID).emit('receiveMessage', sender, message);
  });

  // Log Time
  socket.on('logCurrentTime', (roomID, currentTime, username, socketid) => {
    
    const roomId = getIDRoom(socket.id);
    const syncdataRoom = syncdata[roomId];
    
    if (syncdataRoom) {
      if (!syncdataRoom.clients) {
        syncdataRoom.clients = {};
      }
  
      syncdataRoom.clients[socket.id] = {
        socket: socket.id,
        username: username,
        currentTime: currentTime,
      };
    }
  });

  // Send Playing Message
  socket.on('sendPlayingNowMessage', (roomID, sender, title, thumbnail) => {
    io.to(roomID).emit('sendPlayingNowMessage', sender, title, thumbnail);
  });

  // Set History
  socket.on('setVideoHistory', (roomID, urlvideo, title, thumbnail) => {
    io.to(roomID).emit('setVideoHistory', urlvideo, title, thumbnail);
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
    roomdata[getIDRoom(socket.id)].latestTime = currentTime;
  });

  // User Joined Room
  socket.on('UserJoinedRoom', (roomID, username) => {
    io.to(roomID).emit('UserJoinedRoom', username);
    roomdata[roomID].socketIdToUsername[socket.id] = username;
    io.to(roomID).emit('updateUsersList', roomdata[roomID].socketIdToUsername);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {

    const roomId_ex = getIDRoom(socket.id);
    const room_ex = roomdata[roomId_ex];

    if (room_ex && room_ex.socketIdToUsername && room_ex.socketIdToUsername[socket.id]) {
      const username = roomdata[getIDRoom(socket.id)].socketIdToUsername[socket.id];
      if (username) {
        console.log(`${username} disconnected.`);
        delete roomdata[getIDRoom(socket.id)].socketIdToUsername[socket.id];
        delete syncdata[getIDRoom(socket.id)].clients[socket.id];
        io.to(getIDRoom(socket.id)).emit('UserDisconnected', username);
        io.to(getIDRoom(socket.id)).emit('updateUsersList', roomdata[getIDRoom(socket.id)].socketIdToUsername);
      }
    } 



      

  });

});

