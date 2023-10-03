const apiKey = 'AIzaSyC1VM49p-A1zbNN6i7kLFpxEESe7XL3gUg';

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
        document.getElementById('video-title').textContent = "Own Source";
        document.getElementById('video-thumbnail').src = "../assets/mp4.png";
        
      break;
      case 'youtube':

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoID}`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const videoTitle = data.items[0].snippet.title;
          const videoThumbnailUrl = data.items[0].snippet.thumbnails.default.url;
      
          // Update the HTML elements with the video information
          document.getElementById('video-title').textContent = videoTitle;
          document.getElementById('video-thumbnail').src = videoThumbnailUrl;

          removeAllEvents(document.getElementById('previewvideo'));
          document.getElementById('previewvideo').addEventListener('click', function() { playvideo(socket, videotype, videoID, video, realRoomID); });
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
function playvideo(socket, videotype, videoID, video, realRoomID)
{

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

      socket.emit('changeSource', videotype, videoID, video, realRoomID);
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
      socket.emit('changeSource', videotype, videoID, video, realRoomID);
    break;
  }

}


// Faz o export dos modulos
export default {searchVideo, playvideo};