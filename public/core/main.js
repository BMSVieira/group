
    import utils from './utils.js';
    import player from './video.js';

    localStorage.removeItem('username');
    var socket = io.connect();
    var video = new Plyr('#player');

    // Variaveis & Configss
    const roomID = utils.extractValueFromURL();
    var realRoomID = "";
    document.getElementById('button_url_video').addEventListener('click', function() { player.searchVideo(socket, realRoomID, video); });
    document.getElementById('setUsernameButton').addEventListener('click', function() { utils.setUsername(socket, realRoomID); });
    document.getElementById('sendMessage').addEventListener('click', function() { utils.sendMessage(socket, realRoomID); });

    // Junta-se ou Cria uma room nova caso não encontre
    const joinRoom = (roomID) => {
        socket.emit('createOrJoinRoom', roomID);
    };
    utils.checkUserName().then(joinRoom(roomID));

    // Entrou numa room
    socket.on('joinedRoom', (roomID) => {
        console.log(`Joined room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Change source
    socket.on('changeSource', (videotype, videoID, video) => {  
      console.log("olaaa");
      console.log(videotype);
      console.log(videoID);
      console.log(video);

      switch (videotype) {
        case 'mp4':
          video.source = {
            type: 'video',
            title: 'Example title',
            sources: [
              {
                src: videoID,
                type: 'video/mp4',
                size: 720,
              }
            ],
          };
    
        break;
        case 'youtube':
    
          video.source = {
            type: 'video',
            sources: [
              {
                src: videoID,
                provider: 'youtube',
              },
            ],
          };
        break;
      }
    });

    // Room criado
    // ------------------------------------------------------------------
    socket.on('createdRoom', (roomID) => {
        console.log(`Created new room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Utilizador juntou-se a sala
    // ------------------------------------------------------------------
    socket.on('UserJoinedRoom', (username) => {   utils.userJoin("<b>"+username+"</b> Joined room"); utils.scrollChatBottom(); });

    // Utilizador desconectou-se
    // ------------------------------------------------------------------
    socket.on('UserDisconnected', () => {  utils.userQuit("Left room"); utils.scrollChatBottom(); });

    // Recebeu uma nova mensagem de um utilizador
    // ------------------------------------------------------------------
    socket.on('receiveMessage', (sender, message) => {  
        if(sender != utils.getUsername()){ utils.writeReceivedMessage(sender, message); utils.scrollChatBottom();}
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
    
    // Seek Video
    // ------------------------------------------------------------------
    let previousTime = 0;
    let timeoutId;
    
    video.on('timeupdate', () => {
      const currentTime = video.currentTime;
      if (Math.abs(currentTime - previousTime) > 2) {
        clearTimeout(timeoutId); // Clear any previous timeout
        timeoutId = setTimeout(() => {
          socket.emit('seek', realRoomID, video.currentTime);
          console.log("detected");
        }, 2000); // Adjust the debounce time as needed
      }
      previousTime = currentTime;
    });
    
    socket.on('seek', (time) => {
      video.currentTime = time;
    });

    // Quando um utilizador entra, atualiza o video para o tempo atual
    // ------------------------------------------------------------------
    socket.on('catchUp', (latestTime) => { video.currentTime = latestTime; } ); 

    // #################################################################

