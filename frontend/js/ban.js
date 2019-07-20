document.addEventListener("DOMContentLoaded", myLoad);
function myLoad() {
    $.ajax({
        type: "GET",
        contentType: 'application/JSON',
        url: 'http://127.0.0.1:8087/users',
        dataType: 'json',
        headers: {
            "Authorization": "bearer " + window.localStorage.getItem("access"),
        },
        success: function (data, textstatus, error) {
            var users = data;
            console.log(users);
            document.getElementById("users").innerText="";
            for(var i = 0; i< users.length; i++){
                var user = users[i];
                var li_tag = document.createElement("li");
                li_tag.innerText = user.login;
                var input_tag = document.createElement("input");

                var att = document.createAttribute("name");
                att.value = user.login;
                input_tag.setAttribute(att);

                att = document.createAttribute("type");
                att.value = "button";
                input_tag.setAttribute(att);

                att = document.createAttribute("value");

                if(user.isBanned){
                    att.value = "unban";
                } else {
                    att.value = "ban";
                }
                input_tag.setAttribute(att);

                input_tag.addEventListener("click", changeStatus);

                li_tag.appendChild(input_tag);
                document.getElementById("users").appendChild(li_tag); 
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            switch (xhr.status) {
                case 0:
                    refreshAccessToken();
                    myLoad();
                    break;
                default: {
                    var errorJson = xhr.status;
                    var message = errorJson.message;
                    document.getElementById("error").value = message;
                }
            }
        }
    });


};
function changeStatus(obj) {
    var button = obj.currentTarget;
    var user = button.name;
    var ban = button.value;
    if(ban == "ban"){
        banUser(user);
    } else {
        unbanUser(user);
    }
};

function banUser(user){
    $.ajax({
        type: "PATCH",
        contentType: 'application/JSON',
        url: 'http://127.0.0.1:8087/ban'+'/'+login,
        headers: {
            "Authorization": "bearer " + window.localStorage.getItem("access"),
        },
        success: function (data, textstatus, error) {
            myLoad();
        },
        error:function(xhs, textStatus, errorThrown){
            if(xhs.status == 0) {
                refreshAccessToken();
                myLoad();
            }else{
                var message = xhs.status;
                document.getElementById("error").innerText = message;

            }
        }
    });
};

function unbanUser(user) {
    $.ajax({
        type: "DELETE",
        contentType: 'application/JSON',
        url: 'http://127.0.0.1:8087/ban'+'/'+login,
        headers: {
            "Authorization": "bearer " + window.localStorage.getItem("access"),
        },

        success: function (data, textstatus, error) {
            myLoad();
        },

        error:function(xhs, textStatus, errorThrown){
            if(xhs.status == 0) {
                refreshAccessToken();
                myLoad();
            }else{
                var message = xhs.status;
                document.getElementById("error").innerText = message;

            }
        }
    });
};

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
}



