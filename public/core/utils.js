/* 
    set time out para quando o utilizador está a escrever
    ####################################################################
*/
let timeoutId;
function isTyping(sender) {
    if(sender != getUsername())
    {
        clearTimeout(timeoutId);
        document.getElementById("istyping").style.display = "block";
        timeoutId = setTimeout(function() {
            document.getElementById("istyping").style.display = "none";
        }, 1000);
    }
  }

/* 
    Obter hora local
    ####################################################################
*/
function getCurrentHourInTimeZone(timeZone) {
    const currentTime = new Date().toLocaleString('en-US', { timeZone });
    const [_, hour, minute] = currentTime.match(/(\d+):(\d+)/);
    return `${hour}:${minute}`;
  }

/* 
    Envia mensagem
    ####################################################################
*/
function sendMessage(socket, realRoomID)
{
    const chat_input = document.getElementById("chat_input");
    const chatMessage = chat_input.value;
    if(chatMessage)
    {
        writeMessageMine(chatMessage);
        chat_input.value = "";
        scrollChatBottom();
        chat_input.focus();
        socket.emit('sendMessage', realRoomID, getUsername(), chatMessage);
    }
}

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

            // Obter o dominio
            const currentDomain = window.location.hostname;

            document.getElementById("inviteRoom").value = currentDomain+":3000/room="+roomID+"";
            document.getElementById("textToCopy").value = currentDomain+":3000/room="+roomID+"";
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
    Get Username
    ####################################################################
*/
function getUsername()
{
  return localStorage.getItem('username');
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
            <p class="small smllhours me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">`+getCurrentHourInTimeZone("Europe/London")+`</p>
        </div>
    </div>`;
    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Atualiza a lista de utilizadores
    ####################################################################
*/
function updateUsersList(users, owner)
{
    // Limpa os users todos.
    document.getElementById("online_users").innerHTML = "";

    // Contar o numero de utilizadores
    const count = Object.keys(users).length;
    document.getElementById("usercount_2").innerHTML = count;
    document.getElementById("usercount_1").innerHTML = count;

    for (const key in users) {
    if (users.hasOwnProperty(key)) {

        const value = users[key];

        console.log(key);
        console.log(owner);

        let ownerVariable = "";
        if(key === owner){ ownerVariable = "isowner"; } else { ownerVariable = "";}

        // Template
        const template = `
        <div class="row col-sm-3 user_unic">
        <div class="username_online `+ownerVariable+`">`+value+`</div>
        </div>`;

        document.getElementById("online_users").insertAdjacentHTML('beforeend', template);
    }
    }
}

/* 
    Atualiza a lista de tempos
    ####################################################################
*/
function timeLog(syncdata, owner)
{
    document.getElementById("timelog").innerHTML = "";
    let currentTimeArray = [];

    for (const key1 in syncdata) {
      if (syncdata.hasOwnProperty(key1)) {
        const innerObject = syncdata[key1];
        for (const key2 in innerObject.clients) {
          if (innerObject.clients.hasOwnProperty(key2)) {

            const client = innerObject.clients[key2];
            currentTimeArray.push(client.currentTime);
            
            let ownerVariableSync = "";
            if(client.socket === owner){ ownerVariableSync = "sync_owner"; } else { ownerVariableSync = "";}
  
            let template = `
            <div class="card" style="margin-bottom:5px;">
              <div class="card-body">
                <h5 class="card-title `+ownerVariableSync+`" style="color: #0d6efd; font-size: 12pt; margin-bottom: 0px;">`+client.username+`</h5>
                <p class="card-text" style="font-size: 8pt;">currentTime: `+client.currentTime+`</p>
              </div>
            </div>`;
            document.getElementById("timelog").insertAdjacentHTML('beforeend', template);
  
          }
        }
      }
    }

    // Check for at least 5 seconds difference
    if (currentTimeArray.length >= 2) {

        const minTime = Math.min(...currentTimeArray);
        const maxTime = Math.max(...currentTimeArray);
        const timeDifference = maxTime - minTime;
        
        if (timeDifference >= 5) {

            document.getElementById("notsync").style.display = "block";
        } else {
            document.getElementById("notsync").style.display = "none";
        }

    } else { }
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
        <p class="small smllhours me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">`+getCurrentHourInTimeZone("Europe/London")+`</p>
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
        <p class="small smllhours me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">`+getCurrentHourInTimeZone("Europe/London")+`</p>
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
        <p class="small smllhours ms-3 mb-3 rounded-3 text-muted">`+getCurrentHourInTimeZone("Europe/London")+`</p>
        </div>
    </div>`;

    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Escreve os users
    ####################################################################
*/
function writeReceivedSystemMessage(sender, title, thumbnail)
{
    let template = `
    <div class="d-flex flex-row justify-content-start mb-4">
        <div>
        <div class="small p-2 ms-3 mb-1 rounded-3" style="width: 100%; padding: 0px !important;">
        <p style="margin-bottom: 3px;"><b>Now Playing:</b></p>
        <div class="row" style="width: 100%;">
                <div class="col-2">
                <img src="`+thumbnail+`" class="img-fluid rounded-start" id="video-thumbnail" style="/*! max-width: 86px; */ width: 100%;"> 
                </div>
                <div class="col-10">
                <div class="card-body" style="">
                    <h3 id="video-title" class="card-title" style="font-size: 11pt;position: relative; bottom: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 257px;">`+title+`</h3>
                </div>
                </div>
            </div>
        </div>
        <p class="small smllhours ms-3 mb-3 rounded-3 text-muted" style="position:relative; bottom:15px;">`+getCurrentHourInTimeZone("Europe/London")+`</p>
        </div>
    </div>`;

    document.getElementById("chatbody").insertAdjacentHTML('beforeend', template);
}

/* 
    Adiciona o video ao histórico
    ####################################################################
*/
function setVideoHistory(urlvideo, title, thumbnail)
{
    let template = `                                  
    <div class="container historyline">
        <div class="row" style="width: 100%;">
        <div class="col-2">
            <img src="`+thumbnail+`" class="img-fluid rounded-start" id="video-thumbnail" style="/*! max-width: 86px; */ width: 100%;"> 
        </div>
        <div class="col-10">
            <div class="card-body" style="padding: 9px 11px;">
            <h5 class="card-title cardmobile" style="top: 6px; font-size: 14px;" id="video-title" style="">`+title+`</h5>
        </div>
        </div>
        </div>
    </div>`;

    document.getElementById("history_tab").insertAdjacentHTML('beforeend', template);
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

/* 
    Set Username
    ####################################################################
*/
function setUsername(socket, realRoomID)  { 
    let name = document.getElementById("username_input").value;
    if(name) {  
        localStorage.setItem('username', name); checkUserName(socket, realRoomID);
    }
}

/* 
    Check Username
    ####################################################################
*/
function checkUserName(socket, realRoomID)
{
    return new Promise((resolve, reject) => {
        var storedVariable = localStorage.getItem('username');
        if (storedVariable) { 
            usernameModal.hide(); 
            updateInfo(getUsername(), "username"); 
            resolve(); 
            socket.emit('UserJoinedRoom', realRoomID, getUsername());
        } else {  usernameModal.show(); return false; }
    });
}

// Faz o export dos modulos
export default {timeLog, updateUsersList, isTyping, setVideoHistory, writeReceivedSystemMessage, setUsername, checkUserName, sendMessage, scrollChatBottom, userJoin, userQuit, extractValueFromURL, updateInfo, getUsername, writeMessageMine, writeReceivedMessage};