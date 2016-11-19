var username, password, bartenders;
const apiRoot = 'http://localhost:8080/api';
function init() {
    $("input").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            onLogin();
        }
    });
}

function onLogin() {
    disableLogin();
    username = $("#employeeloginuser").val();
    password = $("#employeeloginpass").val();

    if (isValidUserPass()) {
        if (isAdmin(password)) {
            window.location = "/admin";
        } else {
            getEmployeeIds()
                .then(function (data) {
                    bartenders = data;
                    var accessGranted = false;
                    var eid;
                    var ename;
                    for (var i = 0; i < bartenders.length; i++) {
                        if (bartenders[i].id.toString() === username) {
                            accessGranted = true;
                            eid = bartenders[i].id;
                            ename = bartenders[i].name;
                            break;
                        }
                    }
                    if (accessGranted && eid != 'undefined') {
                        localStorage.setItem("sessionEID", eid);
                        localStorage.setItem("sessionName", ename);
                        window.location = "/bartender";
                    } else {
                        alert("Username/ID not found!");
                    }
                })
                .catch(function (err) {
                    alert(err);
                });
        };
    } else {
        console.log("Invalid employee credentials.");
    }
    enableLogin();
};

function isAdmin(pass) {
    return (pass === "admin");
}

function getEmployeeIds() {
    return new Promise(function (resolve, reject) {
        $.get(apiRoot + "/employee/admin/staff")
            .then(function(data) {
                resolve(data)
            })
            .fail(function (err) {
                reject("Error getting employee ids: " + JSON.stringify(err));
            });
    });
}

function isValidUserPass(){
    if (!username || username.length === 0){
        alert("Please enter your username.");
        return false;
    } else if (!password || password.length === 0) {
        alert("Please enter your password.");
        return false;
    } else {
        return true;
    }
}

function enableLogin() {
    $('#employeeloginbutton').removeAttr("disabled");
}

function disableLogin() {
    $('#employeeloginbutton').attr("disabled", true);
}

$(document).ready(function(){
    init();
});
