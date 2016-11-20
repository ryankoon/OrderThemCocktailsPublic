/**
 * Created by Ryan on 11/13/2016.
 */
var sessionid,
    sessionname,
    routeid;

function init() {
    validateSession();
    setWelcomeText();
}

function validateSession() {
    sessionid = localStorage.getItem("sessionEID");
    sessionname = localStorage.getItem("sessionName");
    routeid = location.pathname.split("/").pop();
    console.log("routeid", routeid);
    console.log(sessionid, sessionname);

    if (sessionid === 'undefined' || sessionid === null || sessionid.length === 0
        || routeid !== sessionid){
        logout();
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