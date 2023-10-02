/* 
    Search Video
    ####################################################################
*/
function searchVideo(socket, realRoomID, video)
{
    const urlvideo = document.getElementById("video_url").value;
    video.source = {
        type: 'video',
        sources: [
          {
            src: urlvideo,
            provider: 'youtube',
          },
        ],
    };
    socket.emit('changeSource', realRoomID, urlvideo);
}


// Faz o export dos modulos
export default {searchVideo};