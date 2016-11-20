const apiRoot = 'http://localhost:8080/api';
var currentTab = window.location.href;
var navTabs;

function init() {
    validateSession();
    navTabs = $('.nav-tabs a');
    for (var i = 0; i < navTabs.length; i++) {
        if (navTabs[i].href === currentTab) {
            $(navTabs[i]).tab('show');
            break;
        };
    };
    
    $('.nav-tabs a').click(function () {
        $(this).tab('show');
        window.location = this.href;
    });

    $('.dropdown-menu li').click(function () {
        $(this)[0].classList.remove("active");
        //e.stopPropagation();
    });
}

function validateSession() {
    sessionid = localStorage.getItem("sessionEID");
    sessionid = parseInt(sessionid);

    if (sessionid !== 0) {
        setAlert("alert-info", "Your session has expired. Redirecting to login page...");
        setTimeout(function() {
            logout();
        }, 3000);

    } else {
        $("#admin-content").removeClass("collapse");
    }
}

function addEmployee() {
    var enameinput = $('#employeename');
    var ename = enameinput.val();
    enameinput.val('');

    $.get(apiRoot + "/employee/admin/addstaff/" + ename, function(data) {
        //TODO: handle any errors
        //TODO: display notification
        window.location.reload();
    });
}

function removeEmployee() {
    var eidinput = $('#eid');
    var eid = eidinput.val();
    eidinput.val('');

    $.ajax({
        url: apiRoot + "/employee/admin/removestaff/" + eid,
        type: 'DELETE',
        success: function(result) {
            window.location.reload();
        }
    });
}

function restockAll() {
    $.get(apiRoot + "/employee/admin/setAllIngredientsAvailable", function(data) {
        //TODO: handle any errors
        //TODO: display notification
        window.location.reload();
    });
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