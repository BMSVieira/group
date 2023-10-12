
    import utils from './utils.js';
    import player from './video.js';

    localStorage.removeItem('username');
    var socket = "";
    const socketOptions = {
      pingInterval: 30000, // Set your desired ping interval in milliseconds (e.g., 30 seconds)
      pingTimeout: 60000,  // Set your desired ping timeout in milliseconds (e.g., 60 seconds)
    };
    const startConnection = () => { socket = io.connect(socketOptions);  };
    var video = new Plyr('#player', {autoplay: false,muted: true});

    // Variaveis & Configss
    const roomID = utils.extractValueFromURL();
    var realRoomID = "";

    // Event Listeners
    document.getElementById('button_url_video').addEventListener('click', function() { player.searchVideo(socket, realRoomID, video); });
    document.getElementById('setUsernameButton').addEventListener('click', function() { utils.setUsername(socket, realRoomID); });
    document.getElementById('sendMessage').addEventListener('click', function() { utils.sendMessage(socket, realRoomID); });
    document.getElementById("chat_input").addEventListener('keydown', (event) => { if (event.key === 'Enter') { utils.sendMessage(socket, realRoomID);}});
    document.getElementById('chat_input').addEventListener('keydown', function() { socket.emit('isTyping', realRoomID, utils.getUsername()); });

    // Junta-se ou Cria uma room nova caso não encontre
    const joinRoom = (roomID) => {
        socket.emit('createOrJoinRoom', roomID);
    };

    // Check Username, conecta-se e depois junta-se ao quarto.
    utils.checkUserName().then(startConnection()).then(joinRoom(roomID));

    // Entrou numa room
    socket.on('joinedRoom', (roomID) => {
        console.log(`Joined room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Change source
    socket.on('changeSource', (urlvideo, videotype) => {  
       player.changeSource(video, urlvideo, videotype);
    });

    // Room criado
    // ------------------------------------------------------------------
    socket.on('createdRoom', (roomID) => {
        console.log(`Created new room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Utilizador juntou-se a sala
    // ------------------------------------------------------------------
    socket.on('UserJoinedRoom', (username) => { utils.userJoin("<b>"+username+"</b> Joined room"); utils.scrollChatBottom(); });

    // Atualizar lista de utilizadores na sala
    // ------------------------------------------------------------------
    socket.on('updateUsersList', (users, owner) => { 
      utils.updateUsersList(users, owner);});

    // Utilizador desconectou-se
    // ------------------------------------------------------------------
    socket.on('UserDisconnected', (username) => { utils.userQuit("<b>"+username+"</b> Left room"); utils.scrollChatBottom(); });

    // Recebeu uma nova mensagem de um utilizador
    // ------------------------------------------------------------------
    socket.on('receiveMessage', (sender, message) => {  
        if(sender != utils.getUsername()){ utils.writeReceivedMessage(sender, message); utils.scrollChatBottom();}
    });

    // Receber uma nova mensagem de video a tocar
    // ------------------------------------------------------------------
    socket.on('sendPlayingNowMessage', (sender, title, thumbnail) => {  
       utils.writeReceivedSystemMessage(sender, title, thumbnail); 
       utils.scrollChatBottom();
    });

    // Colocar o histórico
    // ------------------------------------------------------------------
    socket.on('setVideoHistory', (urlvideo, title, thumbnail) => {  
      utils.setVideoHistory(urlvideo, title, thumbnail); 
    });

    // User is Typing
    // ------------------------------------------------------------------
    socket.on('isTyping', (sender) => {  
        utils.isTyping(sender);
    });

    // Update time log
    // ------------------------------------------------------------------
    socket.on('updateLogTime', (syncdata, owner) => {  
      utils.timeLog(syncdata, owner);
    });

    // Quando um utilizador entra, atualiza o video para o tempo atual
    // ------------------------------------------------------------------
    socket.on('updateInfo', (roomID) => { 
        utils.updateInfo(roomID, "roominfo");
        history.pushState(null, null, '/room='+roomID);
    }); 

    // #################################################################  
        // VIDEO CONTROLS 
    // #################################################################

    // Pause Video
    // ------------------------------------------------------------------
    let isPlaying = false;
    let playPauseTimeoutId;
    
    // Pause Video
    video.on('pause', () => {
      clearTimeout(playPauseTimeoutId); // Clear any previous timeout
      playPauseTimeoutId = setTimeout(() => {
        socket.emit('pause', realRoomID);
      }, 500); // Adjust the debounce time as needed
    });
    
    socket.on('pause', () => {
      video.pause();
    });
    
    // Play Video
    video.on('play', () => {
      clearTimeout(playPauseTimeoutId); // Clear any previous timeout
      playPauseTimeoutId = setTimeout(() => {
        socket.emit('play', realRoomID);
      }, 500); // Adjust the debounce time as needed
    });

    socket.on('play', (roomID) => { video.play(); });
    
    // Control buffering
    // ------------------------------------------------------------------
    let slowInternetTimeout = null;
    let threshold = 500; //ms after which user perceives buffering
    
    video.on('waiting', () => {
        slowInternetTimeout = setTimeout(() => {
            //show buffering
            console.log("buffering");
            socket.emit('pause', realRoomID);
        }, threshold);
    });
    video.on('playing', () => {
        if(slowInternetTimeout != null){
            clearTimeout(slowInternetTimeout);
            slowInternetTimeout = null;
            console.log("not buffering anymore");
            socket.emit('play', realRoomID);
        }
    });

    // Seek Video
    // ------------------------------------------------------------------
    let previousTime = 0;
    let timeoutId;
    
    video.on('timeupdate', () => {
      const currentTime = video.currentTime;

      // log current time
      socket.emit('logCurrentTime', realRoomID, currentTime, utils.getUsername(), socket.id);

      if (Math.abs(currentTime - previousTime) > 2) {
        clearTimeout(timeoutId); // Clear any previous timeout
        timeoutId = setTimeout(() => {
          socket.emit('seek', realRoomID, video.currentTime);
        }, 2000); // Adjust the debounce time as needed
      }

      previousTime = currentTime;
    });
    
    socket.on('seek', (time) => {
      video.currentTime = time;
    });

    // Quando um utilizador entra, atualiza o video para o tempo atual
    // ------------------------------------------------------------------
    socket.on('catchUp', (latestTime, latestSource) => { 
      switch (latestSource.videotype) {
        case 'mp4':
          if(String(video.source) != String(latestSource.videourl)) {
            player.changeSource(video, latestSource.videourl, latestSource.videotype);
          }
          video.currentTime = latestTime; 
          video.play();
        break;
        case 'youtube':
          if(String(player.getVideoID(video.source)) != String(latestSource.videourl)) {
            player.changeSource(video, latestSource.videourl, latestSource.videotype);
          }
          video.on('ready', (event) => {
            video.currentTime = latestTime; 
            video.play();
          });
        break;
      }
    }); 
    // #################################################################

