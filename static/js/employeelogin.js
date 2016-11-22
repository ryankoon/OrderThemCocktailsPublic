var username, password, bartenders, _role;
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
        var role = $('#role-select').val(),
            params;

        if (role === "Manager") {
            role = "admin";
        } else {
            role = "emp";
        }

        params = $.param({username: username, pw: password, role: role});

        $.ajax('http://localhost:8080/api/login/employee', {
            contentType: 'application/json',
            data: params,
            dataType: 'json',
            type: 'GET',
            async: false,
            success: function (result) {
                checkIfLoginSuccessful(result, role, username, password);
            },
            error: function (err) {
                console.log(error);
            }
        });
    } else {
        console.log("Invalid login values.");
        enableLogin();
    }
}

    function checkIfLoginSuccessful(result, role, username, password) {
        if (result[0].response !== 0) {
            // found a match in the db
            if (role === "admin") {
                // its a manager
                localStorage.setItem("sessionEID", 0);
                localStorage.setItem("sessionName", "Admin");
                setAlert("alert-success", "Success!");
                window.location = "/admin";
            } else {
                localStorage.setItem("sessionEID", password);
                localStorage.setItem("sessionName", username);
                setAlert("alert-success", "Success!");
                window.location = "/bartender/" + password;
            }
        } else {
            // no matches in the db
            setAlert("alert-danger", "Invalid username or password!");
            enableLogin();
        }
    }


/*
        // something about setting session eid and name...
        // then redirect

        if (isAdmin(username, password)) {
            localStorage.setItem("sessionEID", 0);
            localStorage.setItem("sessionName", "Admin");
            setAlert("alert-success", "Success!");
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
                        setAlert("alert-danger", "Invalid username or password!");
                        enableLogin();
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    enableLogin();
                });
        };

};
*/

//function isAdmin(user, pass) {
//    return (user === "admin" && pass === "admin");
//}

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
    $('#employeeloginbutton').prop("disabled", false);
    $('#employeeloginbutton').text("Login");
}

function disableLogin() {
    console.log("disabling login");
    $('#employeeloginbutton').prop("disabled", true);
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
