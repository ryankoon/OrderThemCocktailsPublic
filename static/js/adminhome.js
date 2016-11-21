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
    $('#addEmplBtn').prop("disabled", true);

    $.get(apiRoot + "/employee/admin/addstaff/" + ename, function(data) {
        setAlert("alert-success", "Added new employee: " + ename + ". Reload the page to see the updated list.");
        $('#addEmplBtn').removeClass("btn-primary");
        $('#addEmplBtn').addClass("btn-success");
        $('#addEmplBtn').text("Success");
        setTimeout(function() {
            $('#addEmplBtn').prop("disabled", false);
            $('#addEmplBtn').removeClass("btn-success");
            $('#addEmplBtn').addClass("btn-primary");
            $('#addEmplBtn').text("Add");
        }, 1000);
    });
}

function removeEmployee() {
    var eidinput = $('#eid');
    var eid = eidinput.val();
    eidinput.val('');

    if (eid) {
        $('#removeEmplBtn').prop("disabled", true);
        $.ajax({
            url: apiRoot + "/employee/admin/removestaff/" + eid,
            type: 'DELETE',
            success: function (result) {
                if (result) {
                    var tableChanged = result.affectedRows;
                    if (tableChanged) {
                        setAlert("alert-success", "Removed employee #" + eid + ". Reloading page...");
                        window.location.reload();
                    } else {
                        $('#removeEmplBtn').prop("disabled", false);
                        setAlert("alert-danger", "The employee ID does not exist.");
                        setTimeout(function() {
                            resetAlert();
                        }, 3000);
                    }
                }
            },
            error: function () {
                $('#removeEmplBtn').prop("disabled", false);
                console.log("ajax DELETE error!")
            }
        });
    }
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

function resetAlert() {
    $('div.alert').first().addClass("collapse");
    $('div.alert').first().removeClass("alert-success");
    $('div.alert').first().removeClass("alert-info");
    $('div.alert').first().removeClass("alert-warning");
    $('div.alert').first().removeClass("alert-danger");
}

function setAlert(alertClass, text) {
    resetAlert();
    $('div.alert').first().text(text);
    $('div.alert').first().addClass(alertClass);
    $('div.alert').first().removeClass("collapse");
}

$(document).ready(function(){
    init();
});