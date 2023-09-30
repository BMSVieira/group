
import utils from './utils.js';

var socket = io.connect();
const video = document.getElementById('video');


// Event listeners
    // Catchup Video
    socket.on('syncVideo', (currentTime) => {
    video.currentTime = currentTime;
    });

    // Play Video
    video.addEventListener('play', () => {
    socket.emit('play', video.currentTime);
    });

    // Pause Video
    video.addEventListener('pause', () => {
    socket.emit('pause', video.currentTime);
    });

    // Sync Video
    let previousTime = 0;
    video.addEventListener('timeupdate', () => {
    const currentTime = video.currentTime;
    if (Math.abs(currentTime - previousTime) > 2) { socket.emit('seek', video.currentTime);}
            previousTime = currentTime;
    });

// Receber comandos
    // Play video
    socket.on('play', () => {
    video.play();
    });

    // Pause Video
    socket.on('pause', () => {
    video.pause();
    });

    // Seek Video
    socket.on('seek', (time) => {
    video.currentTime = time;
    }); 

    // Quando um utilizador entra, faz sync com o currentTime
    socket.on('catchUp', (time) => {
        socket.emit('seek', video.currentTime);
    }); 

    // Quando entra um user
    socket.on('newUser', (time) => {

        socket.emit('seek', video.currentTime);
        utils.userJoin("nick", "Utilizador Entrou");
    }); 