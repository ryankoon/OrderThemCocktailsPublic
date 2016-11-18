const apiRoot = 'http://localhost:8080/api';
var currentTab = window.location.href;
var navTabs;

function init() {
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
    window.location = "/employee";
}

$(document).ready(function(){
    init();
});