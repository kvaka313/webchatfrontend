document.addEventListener("DOMContentLoaded", myLoad);
var ws =
    new SockJS("http://127.0.0.1:8087/socket?Authorization=" + window.localStorage.getItem("access"));

function myLoad() {
    document.getElementById("send").addEventListener("click", send);
    document.getElementById("broadcast").addEventListener("click", broadcast);
    document.getElementById("logout").addEventListener("click", logout);

    ws.onopen = function(){
        console.log("connection establish");
    }

    ws.onclose = function(event) {
        if (event.wasClean) {
            console.log("disconnected");
        } else {
            switch (event.status) {
                case '401': {
                    refreshAccessToken();
                    ws = new SockJS("http://127.0.0.1:8087/socket?Authorization=" + window.localStorage.getItem("access"));
                    break;
                }
                default: {
                    document.getElementById("error").value = event.status;
                }
            }
        }
    }

    ws.onerror = function(event){
        switch(event.status){
            case '401': {
                refreshAccessToken();
                ws = new SockJS("http://127.0.0.1:8087/socket?Authorization=" + window.localStorage.getItem("access"));
                break;
            }
            default:{
                document.getElementById("error").value = event.status;
            }
        }
    };

    ws.onmessage = function(event){
        var receiveJson = JSON.parse(event.data);
        switch(receiveJson.type){
            case "LIST":{
               var users = receiveJson.logins;
               document.getElementById("active-users").innerText="";
               for(var i = 0; i < users.length; i++){
                   var user = users[i];

                   var li_tag = document.createElement("li");
                   li_tag.innerText = user;

                   var att = document.createAttribute("id");
                   att.value = user;

                   li_tag.setAttribute(att);
                   li_tag.addEventListener("click", onCLickUser);
                   document.getElementById("active-users").appendChild(li_tag);
               }
               break;
            }

            case "PRIVATE":{
               var mess = receiveJson.sender+":"+receiveJson.message;
               document.getElementById("income-messages").innerText+=mess;
               var br_tag = document.createElement("br");
               document.createElement("income-messages").appendChild(br_tag);
               break;
            }

            case "BROADCAST":{
               var mess = "<B>"+receiveJson.sender+":"+receiveJson.message+"</B>";
               document.getElementById("income-messages").innerText+=mess;
               var br_tag = document.createElement("br");
               document.createElement("income-messages").appendChild(br_tag);
               break;
            }
        }
    }
};

function send(){
   var mess = document.getElementById("outcome-messages").value;
   var array_mess= mess.split(":");
   var user = array_mess[0];
   var message = array_mess[1];
   var jsonSend = {};
   jsonSend["type"]="PRIVATE";
   jsonSend["receiver"]=user;
   jsonSend["message"]=message;
   ws.send(JSON.stringify(jsonSend));
}

function broadcast() {
    var mess = document.getElementById("outcome-messages").value;
    var jsonSend = {};
    jsonSend["type"]="BROADCAST";
    jsonSend["message"]=mess;
    ws.send(JSON.stringify(jsonSend));
}

function logout() {
    var jsonSend = {};
    jsonSend["type"]="LOGOUT";
    ws.send(JSON.stringify(jsonSend));
    window.location.href = "http://127.0.0.1/index.html";
}

function refreshAccessToken(){
    $.ajax({
        type:"POST",
        contentType: 'application/x-www-form-urlencoded',
        url: 'http://127.0.0.1:8080/auth/realms/chat/protocol/openid-connect/token',
        dataType: 'json',
        data: jQuery.param({
            grant_type: "refresh_token",
            client_id: "ADMIN-UI",
            refresh_token: window.localStorage.getItem("refresh")
        }),
        success:function(data, textstatus, error){
            var tokens = data;
            var accessToken = tokens.access_token;
            var refreshToken = tokens.refresh_token;
            window.localStorage.setItem("access",accessToken);
            window.localStorage.setItem("refresh", refreshToken);
        },

        error:function(xhr, ajaxOptions, thrownError){
            window.location.href = "http://127.0.0.1/login.html"

        }

    });
};

function onCLickUser(obj) {
    var li_tag = obj.currentTarget;
    var user = li_tag.id;
    document.getElementById("outcome-messages").value=user+":";
}



