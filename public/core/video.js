

/* 
    Reset video and url preview
    ####################################################################
*/
function resetPreview(){

  document.getElementById('video-title').textContent = "";
  document.getElementById('video-thumbnail').src = "";
  document.getElementById('previewvideo').style.display = "none";
  document.getElementById("video_url").value = "";

}

/* 
    Get Unique ID from Video
    ####################################################################
*/
function removeAllEvents(element) {
  const clonedElement = element.cloneNode(true);
  element.parentNode.replaceChild(clonedElement, element);
}

/* 
    Get Unique ID from Video
    ####################################################################
*/
function getVideoID(url) {
  
  let videoID = "";
  const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=))([^&\n?#]+)/;
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const dailymotionRegex = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;

  if (youtubeRegex.test(url)) {
    videoID = url.match(youtubeRegex)[1];
  } else if (vimeoRegex.test(url)) {
    videoID = url.match(vimeoRegex)[1];
  } else if (dailymotionRegex.test(url)) {
    videoID = url.match(dailymotionRegex)[1];
  }

  return videoID;
}

/* 
    Search Video
    ####################################################################
*/
function searchVideo(socket, realRoomID, video)
{
    // Obter variaveis
    const videotype = document.getElementById("videotype").value;
    const urlvideo = document.getElementById("video_url").value;
    const videoID = getVideoID(urlvideo);


    switch (videotype) {
      case 'mp4':

        removeAllEvents(document.getElementById('previewvideo'));
        document.getElementById('previewvideo').addEventListener('click', function() { playvideo(socket, videotype, urlvideo, video, realRoomID); });

        // Update the HTML elements with the video information
        document.getElementById('video-title').textContent = urlvideo;
        document.getElementById('video-thumbnail').src = "../assets/mp4.png";
        document.getElementById('previewvideo').style.display = "block";
        
        removeAllEvents(document.getElementById('previewvideo'));
        document.getElementById('previewvideo').addEventListener('click', function() { playvideo(socket, videotype, urlvideo, video, realRoomID, urlvideo, "../assets/mp4.png"); });
    
      break;
      case 'youtube':

      const apiKey = 'AIzaSyC1VM49p-A1zbNN6i7kLFpxEESe7XL3gUg';
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoID}`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const videoTitle = data.items[0].snippet.title;
          const videoThumbnailUrl = data.items[0].snippet.thumbnails.default.url;
      
          // Update the HTML elements with the video information
          document.getElementById('video-title').textContent = videoTitle;
          document.getElementById('video-thumbnail').src = videoThumbnailUrl;
          document.getElementById('previewvideo').style.display = "block";

          removeAllEvents(document.getElementById('previewvideo'));
          document.getElementById('previewvideo').addEventListener('click', function() { playvideo(socket, videotype, urlvideo, video, realRoomID, videoTitle, videoThumbnailUrl); });
      
        })
        .catch((error) => {
          console.error('Error fetching video data:', error);
        });
      break;
    }
}

/* 
    Search Video
    ####################################################################
*/
function playvideo(socket, videotype, urlvideo, video, realRoomID, title, thumbnail)
{
  switch (videotype) {
    case 'mp4':
      video.source = {
        type: 'video',
        title: 'Example title',
        sources: [
          {
            src: urlvideo,
            type: 'video/mp4',
            size: 720,
          }
        ],
      };
      socket.emit('changeSource', urlvideo, realRoomID, videotype);
      socket.emit('sendPlayingNowMessage', realRoomID, urlvideo, title, thumbnail);
      socket.emit('setVideoHistory', realRoomID, urlvideo, title, thumbnail);
      resetPreview();
    break;
    case 'youtube':

      video.source = {
        type: 'video',
        sources: [
          {
            src: urlvideo,
            provider: 'youtube',
          },
        ],
      };
      socket.emit('changeSource', urlvideo, realRoomID, videotype);
      socket.emit('sendPlayingNowMessage', realRoomID, urlvideo, title, thumbnail);
      socket.emit('setVideoHistory', realRoomID, urlvideo, title, thumbnail);
      resetPreview();
    break;
  }
}


// Faz o export dos modulos
export default {searchVideo, playvideo};