
    import utils from './utils.js';

    var socket = io.connect();
    const video = document.getElementById('video');

    // Variaveis & Configs
    const roomID = utils.extractValueFromURL();
    var realRoomID = "";
    document.getElementById('setUsernameButton').addEventListener('click', function() { setUsername(); });

    // Junta-se ou Cria uma room nova caso não encontre
    const joinRoom = (roomID) => {
        alert("ola"); 
        socket.emit('createOrJoinRoom', roomID);
    };
    
    // Entrar numa Room
    function setUsername()  { let name = document.getElementById("username_input").value; if(name) {  localStorage.setItem('username', name); checkUserName(); }}
    function checkUserName()
    {
        return new Promise((resolve, reject) => {
            var storedVariable = localStorage.getItem('username');
            if (storedVariable) { 
                usernameModal.hide(); 
                utils.updateInfo(utils.getUsername(), "username"); 
                resolve(); 
                socket.emit('UserJoinedRoom', realRoomID, utils.getUsername());
            } else {  usernameModal.show(); return false; }
        });
    }

    checkUserName().then(joinRoom(roomID));

    // Entrou numa room
    socket.on('joinedRoom', (roomID) => {
        console.log(`Joined room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Room criado
    socket.on('createdRoom', (roomID) => {
        console.log(`Created new room with ID: ${roomID}`);
        realRoomID = roomID;
    });

    // Pause Video
    // ------------------------------------------------------------------
    video.addEventListener('pause', () => {
        socket.emit('pause', realRoomID, video.currentTime);
    });

    socket.on('pause', (roomID) => {  video.pause();  });
    socket.on('UserJoinedRoom', (username) => {   utils.userJoin("<b>"+username+"</b> Joined room");  });
    
    // Play Video
    // ------------------------------------------------------------------
    video.addEventListener('play', () => {
        socket.emit('play', realRoomID);
    });
        
    socket.on('play', (roomID) => { video.play(); });

    // Seek Video
    // ------------------------------------------------------------------

    let previousTime = 0;
    video.addEventListener('timeupdate', () => {
        const currentTime = video.currentTime;
        if (Math.abs(currentTime - previousTime) > 2) { 
            socket.emit('seek', realRoomID, video.currentTime);
        }
        previousTime = currentTime;
    });

    socket.on('seek', (time) => { video.currentTime = time; }); 

    // Quando um utilizador entra, atualiza o video para o tempo atual
    // ------------------------------------------------------------------

    socket.on('catchUp', (latestTime) => { video.currentTime = latestTime; } ); 
    socket.on('updateInfo', (roomID) => { 
        utils.updateInfo(roomID, "roominfo");
    }); 
