
import utils from './utils.js';

var socket = io.connect();
const video = document.getElementById('video');

// Function to extract the number from the URL
function extractValueFromURL() {

    const pathname = window.location.pathname;
    const parts = pathname.split('=');

    if (parts.length === 2 && parts[1].trim() !== '') {
        const extractedValue = parts[1];
        const numericValue = Number(extractedValue);
        if (!isNaN(numericValue)) {
            return numericValue;
        } else {
            return extractedValue;
        }
    } else {
        return null;
    }
}

    // Call the function to extract the room ID
    const roomID = extractValueFromURL();

    // Function to handle joining a room based on an invitation ID
    const joinRoom = (roomID) => {
        socket.emit('createOrJoinRoom', roomID);
    };
  
  // Example: Join a specific room by providing an invitation ID
  const invitationID = 'your_invitation_id_here';
  joinRoom(roomID);
  
  // Listen for the server's response
  socket.on('joinedRoom', (roomID) => {
    console.log(`Joined room with ID: ${roomID}`);
    // You can perform actions related to joining the room here
  });
  
  socket.on('createdRoom', (roomID) => {
    console.log(`Created new room with ID: ${roomID}`);
    // You can perform actions related to creating the room here
  });
  
  socket.on('roomNotFound', (roomID) => {
    console.log(`Room with ID ${roomID} not found.`);
    // You can handle the case where the room does not exist here
  });




























    // Play video
    socket.on('play', (roomID) => {
    video.play();
    });

    // Pause Video
    socket.on('pause', (roomID) => {
    video.pause();
    });

    // Seek Video
    socket.on('seek', (time) => {
    video.currentTime = time;
    }); 

    // Quando um utilizador entra, faz sync com o currentTime
    socket.on('catchUp', (roomID) => {
        socket.emit('seek', video.currentTime);
    }); 

// #############################################################################################################
// Event Listeners
// #############################################################################################################

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