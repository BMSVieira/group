
/* 
    Retirar valor do URL
    ####################################################################
*/
function updateInfo(roomID, type) {

    switch (type) {
        case 'username':
            document.getElementById("usernameRoom").value = getUsername();
          break;
        case 'roominfo':
            document.getElementById("inviteRoom").value = "localhost:3000/room="+roomID+"";
            document.getElementById("idRoom").value = ""+roomID+"";
          break;
        default:
      }
      
}

/* 
    Retirar valor do URL
    ####################################################################
*/
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

/* 
    Set Username
    ####################################################################
*/
function setUsername()
{
  let name = document.getElementById("username_input").value;
  if(name) {  localStorage.setItem('username', name); checkUserName(); }
}

/* 
    Get Username
    ####################################################################
*/
function getUsername()
{
  return localStorage.getItem('username');
}

/* 
    Nova mensagem
    ####################################################################
*/
function newMessage(from, to, message)
{

    let template = `
    <div class="tyn-reply-item incoming">
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-text user_chat_name"> `+from+` </div>
    </div>
    <div class="tyn-reply-group">
      <div class="tyn-reply-bubble">
         <div class="tyn-reply-text"> `+message+` </div>
      </div>
    </div>
    </div>`;

    document.getElementById("canal_gay").insertAdjacentHTML("beforeend", template);
}

/* 
    User juntou-se
    ####################################################################
*/
function userJoin(message)
{

    let template = `
    <div class="d-flex flex-row justify-content-end">
        <div>
            <p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary" style="background-color:green;">`+message+`</p>
            <p class="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">00:15</p>
        </div>
    </div>`;
    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    User juntou-se
    ####################################################################
*/
function userQuit(channel, nick, reason, message)
{

    let template = `                                    
    <div class="tyn-reply-item incoming">
    <div class="tyn-reply-bubble">
       <div class="tyn-reply-text user_chat_name"> </div>
    </div>
    <div class="tyn-reply-group">
       <div class="tyn-reply-bubble">
          <div class="tyn-reply-text user_saiu"> `+nick+` saiu. </div>
       </div>
    </div>
 </div>`;

    document.getElementById("canal_gay").insertAdjacentHTML("beforeend", template);
}

/* 
    Escreve os users
    ####################################################################
*/
function writeUser(channel, nick)
{

    let template = `                                    
     <li class="tyn-aside-item js-toggle-main">
      <div class="tyn-media-group">
         <div class="tyn-media tyn-size-sm">
            <img src="https://digimedia.web.ua.pt/wp-content/uploads/2017/05/default-user-image.png" alt="">
         </div>
         <div class="tyn-media-col">
            <div class="tyn-media-row">
            <h6 class="name">`+nick+`</h6>
            </div>
         </div>
      </div>
      </li>`;

    document.getElementById("lista_nicks_"+channel).insertAdjacentHTML("beforeend", template);
}

// Faz o export dos modulos
export default { userJoin, userQuit, extractValueFromURL, updateInfo, getUsername};