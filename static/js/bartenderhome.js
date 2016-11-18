/**
 * Created by Ryan on 11/13/2016.
 */
var sessionid,
    sessionname;

function init() {
    validateSession();
    setWelcomeText();
}

function validateSession() {
    sessionid = localStorage.getItem("sessionEID");
    sessionname = localStorage.getItem("sessionName");
    console.log(sessionid, sessionname);

    if (sessionid === 'undefined' || sessionid === null || sessionid.length === 0){
        window.location = "/employee";
        alert("Your session has expired. Please login again.");
    }
}

function setWelcomeText() {
    $("#employeeWelcomeText").text(sessionname);
}

function logout() {
    window.location = "/employee";
}

$(document).ready(function(){
    init();
});