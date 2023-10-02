
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
function userQuit(message)
{

    let template = `
    <div class="d-flex flex-row justify-content-end">
        <div>
        <p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary" style="background-color:#6c1717;">`+message+`</p>
        <p class="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">00:15</p>
        </div>
    </div>`;
    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Escreve os users
    ####################################################################
*/
function writeMessageMine(message)
{

    let template = `
    <div class="d-flex flex-row justify-content-end">
        <div>
        <p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">`+message+`</p>
        <p class="small smllhours me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">00:15</p>
        </div>
    </div>`;

    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Escreve os users
    ####################################################################
*/
function writeReceivedMessage(sender, message)
{
    let template = `
    <div class="d-flex flex-row justify-content-start mb-4">
        <div>
        <p class="small p-2 ms-3 mb-1 rounded-3" style="background-color: #05131e;"><b>`+sender+`:</b><br>`+message+`</p>
        <p class="small smllhours ms-3 mb-3 rounded-3 text-muted">00:13</p>
        </div>
    </div>`;

    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Scroll chat to bottom
    ####################################################################
*/
function scrollChatBottom()
{
    const chatbox = document.getElementById("chatbody");
    chatbox.scrollTop = chatbox.scrollHeight;
}


// Faz o export dos modulos
export default {scrollChatBottom, userJoin, userQuit, extractValueFromURL, updateInfo, getUsername, writeMessageMine, writeReceivedMessage};