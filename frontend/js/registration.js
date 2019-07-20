document.addEventListener("DOMContentLoaded", myLoad);
function myLoad() {
    document.getElementById("submit").addEventListener("click", sendLogin);
}

function sendLogin() {
    $.ajax({
        type: "POST",
        contentType: "application/JSON",
        url: "http://127.0.0.1:8087/registration",
        data: JSON.stringify({
            "name": document.getElementById("name").value,
            "login": document.getElementById("login").value,
            "password": document.getElementById("password").value
        }),

        success: function (xhr, ajaxOptions, thrownError) {
            window.location.href = 'http://127.0.0.1/index.html';
            console.log("success");
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            var errorJson = JSON.parse(xhr.responseText);
            var message = errorJson.message;
            document.getElementById("error").innerText = message;
        }

    });
}
