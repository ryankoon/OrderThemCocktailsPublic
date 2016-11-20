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

    if (isValidInputValue()) {
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
                        setAlert("alert-success", "Success!");
                        window.location = "/bartender/" + eid;
                    } else {
                        setAlert("alert-danger", "Username/ID not found!");
                        enableLogin();
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    enableLogin();
                });
        };
    } else {
        console.log("Invalid login values.");
        enableLogin();
    }
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

function isValidInputValue(){
    if (!username || username.length === 0){
        setAlert("alert-warning", "Please enter your username.");
        return false;
    } else if (!password || password.length === 0) {
        setAlert("alert-warning", "Please enter your password.");
        return false;
    } else {
        return true;
    }
}

function enableLogin() {
    $('#employeeloginbutton').removeClass("disabled");
    $('#employeeloginbutton').text("Login");
}

function disableLogin() {
    console.log("disabling login");
    $('#employeeloginbutton').addClass("disabled");
    $('#employeeloginbutton').text("Logging in...");
}

function setAlert(alertClass, text) {
    $('div.alert').first().addClass("collapse");
    $('div.alert').first().removeClass("alert-success");
    $('div.alert').first().removeClass("alert-info");
    $('div.alert').first().removeClass("alert-warning");
    $('div.alert').first().removeClass("alert-danger");

    $('div.alert').first().text(text);
    $('div.alert').first().addClass(alertClass);
    $('div.alert').first().removeClass("collapse");
}

$(document).ready(function(){
    init();
});
