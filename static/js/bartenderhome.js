/**
 * Created by Ryan on 11/13/2016.
 */
const apiRoot = 'http://localhost:8080/api';
var sessionid,
    sessionname,
    routeid;

function init() {
    validateSession();
    setWelcomeText();
}

function validateSession() {
    sessionid = localStorage.getItem("sessionEID");
    sessionid = parseInt(sessionid);
    sessionname = localStorage.getItem("sessionName");
    routeid = location.pathname.split("/").pop();
    routeid = parseInt(routeid);
    console.log("routeid", routeid);
    console.log(sessionid, sessionname);

    if (sessionid === 'undefined' || sessionid === null || sessionid.length === 0
        || routeid !== sessionid){
        setAlert("alert-info", "Your session has expired. Redirecting to login page...");
        setTimeout(function() {
            logout();
        }, 3000);

    } else {
        $("#bartender-content").removeClass("collapse");
    }
}

function setWelcomeText() {
    $("#employeeWelcomeText").text(sessionname);
}

function updateOpenOrder(orderno) {
    callApiToUpdateOrder(orderno)
        .then(function() {
           return getOrderInfo(orderno);
        })
        .then(function(orderInfo) {
            updateBartenderPage(orderInfo);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function callApiToUpdateOrder(orderNo) {
    return new Promise(function(resolve, reject) {
        $.get(apiRoot + "/employee/bartender/selectOrder/"+ sessionid + "/" + orderNo)
            .then(function(result) {
                resolve(result);
            })
            .catch(function(err) {
                reject("Error updating order: " + err);
            })
    })
}

function getOrderInfo(orderNo) {
    return new Promise(function (resolve,reject) {
        $.get(apiRoot + "/employee/order/" + orderNo)
            .then(function (result) {
               resolve(result);
            })
            .catch(function (err){
                reject("Error getting info for order #: " + orderNo + "Error: " + err);
            });
    });
}

function updateBartenderPage(orderInfo) {
    if (orderInfo && orderInfo[0]) {
        var orderObj = orderInfo[0];
        var eid = orderObj.bartender;
        if (eid === sessionid && orderObj.is_open === 0) {
            successfulOrderAssignment(orderObj);
        } else if (eid !== sessionid) {
            warningOrderAssignment(orderObj.order_no);
        } else {
            errorOrderAssignment(orderObj.order_no)
        }
    }
}

function successfulOrderAssignment(order) {
    var buttonId = "#" + order.order_no + "_btn";
    $(buttonId).toggleClass('btn-primary btn-success');
    $(buttonId).text("Success");
}

function warningOrderAssignment(orderNo) {
    var buttonId = "#" + orderNo + "_btn";
    $(buttonId).toggleClass('btn-primary btn-warning');
    $(buttonId).text("Closed");
}

function errorOrderAssignment(orderNo) {
    var buttonId = "#" + orderNo + "_btn";
    $(buttonId).toggleClass('btn-primary btn-danger');
    $(buttonId).text("Error");
}

function logout() {
    localStorage.removeItem("sessionEID");
    localStorage.removeItem("sessionName");
    window.location = "/employee";
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