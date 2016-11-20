/**
 * Created by Ryan on 11/13/2016.
 */
const apiRoot = 'http://localhost:8080/api';
var sessionid,
    sessionname,
    routeid;
var selectedOrderCheckboxes = [];

function init() {
    validateSession();
    setWelcomeText();
    $('.complete-order-checkbox').click(function () {
        getSelectedOrders();
    });
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

function getSelectedOrders() {
    selectedOrderCheckboxes = $('.complete-order-checkbox:checked');
    console.log(selectedOrderCheckboxes);
}

function updateOpenOrders() {
    var selectedOrders = [];
    var updatePromise;
    var updatePromises = [];
    for(var i = 0; i < selectedOrderCheckboxes.length; i++) {
        if (selectedOrderCheckboxes[i].value) {
            var intValue = parseInt(selectedOrderCheckboxes[i].value);
            if (intValue) {
                selectedOrders.push(intValue);
                updatePromise = new Promise(function (resolve, reject) {
                    callApiToUpdateOrder(intValue)
                        .then(function (result) {
                           resolve();
                        })
                        .catch(function (err) {
                            reject("Error updating orders: " + err);
                        });
                });
                updatePromises.push(updatePromise);
            }
        }
    }

    Promise.all(updatePromises)
        .then(function (result){
            return getSelectedOrdersInfo(selectedOrders);
        })
        .then(function (selectedOrdersInfo){
            return updateOpenOrdersTable(selectedOrdersInfo);
        })
        .catch(function (err){
            console.log(err);
        })
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

function getSelectedOrdersInfo(orders) {
    var getorderPromise;
    var getorderPromises = [];

    if (orders) {
        for(var i = 0; i < orders.length; i++) {
            getorderPromise = new Promise(function (resolve, reject) {
                getOrderInfo(orders[i])
                    .then(function(result) {
                        resolve(result);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            });
            getorderPromises.push(getorderPromise);
        }
    }

    return Promise.all(getorderPromises);
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

function updateOpenOrdersTable(ordersInfo) {
    console.log(ordersInfo);
}

function logout() {
    window.location = "/employee";
}

$(document).ready(function(){
    init();
});