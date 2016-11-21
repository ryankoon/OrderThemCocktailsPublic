const apiRoot = 'http://localhost:8080/api';
var currentTab = window.location.href;
var navTabs;
var ingredientAttr;
var ingredientCond;

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

    $('#attrAvailable').click(function () {
        $("#attrdropdownMenu").text("Availabile");
        $("#ingredientCondText").text("=");
        ingredientAttr = "available";

    });

    $('#attrPrice').click(function () {
        $("#attrdropdownMenu").text("Price");
        $("#ingredientCondText").text(">=");
        ingredientAttr = "price";
    });

    $('#agg-max').click(function () {
        sendNestedAggregateQuery('max');
    });

    $('#agg-min').click(function () {
        sendNestedAggregateQuery('min');
    });

    $('#agg-avg').click(function () {
        sendNestedAggregateQuery('avg');
    });

    $('#agg-count').click(function () {
        sendNestedAggregateQuery('count');
    });

    setIngredientHeaders();
    enableRestockButton();
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

function sendNestedAggregateQuery(type) {
    var returnStatement,
        jsonPayload = $.param({type: type});

    switch (type) {
        case "max":
            returnStatement = "The most number of drinks in a customer's purchase history is ";
            break;
        case "min":
            returnStatement = "The fewest number of drinks in a customer's purchase history is ";
            break;
        case "avg":
            returnStatement = "The average number of drinks in a customer's purchase history is";
            break;
        case "count":
            returnStatement = "The number of distinct customers who have ordered is ";
    }

    $.ajax(apiRoot + '/aggregatedrinkstats', {
        contentType: 'application/json',
        data: jsonPayload,
        dataType: 'json',
        type: 'GET',
        async: false,
        success: function (result) {
            updateAggResponse(result, returnStatement);
        },
        error: function (err){
            alert("There was a problem retrieving your data");
            console.log("Error getting aggregate stats: " + err);
        }
    });

    function updateAggResponse(result, returnStatement) {
        var number = result[0].answer;

        // hold it to one decimal place if not an integer
        if (number % 1 !== 0) {
            number = number.toFixed(1);
        }

        $('#agg-response').html(returnStatement + "<br><h3>" + number + "</h3>");

    }
}

function setIngredientHeaders() {
    ingredientAttr = localStorage.getItem("ingredientAttr");
    ingredientCond = localStorage.getItem("ingredientCond");
    ingredientCond = parseInt(ingredientCond);

    $("#ingredientCondition").val(ingredientCond);

    if (ingredientAttr === "available") {
        $("#attrdropdownMenu").text("Available");
        $("#ingredientCondText").text("=");
    } else if (ingredientAttr === "price") {
        $("#attrdropdownMenu").text("Price");
        $("#ingredientCondText").text(">=");
    } else {
        $("#ingredientCondText").text("");
    }
}

function enableRestockButton() {
    if (ingredientAttr === "available" && ingredientCond === 0) {
        console.log("disabled false");
        $('#restockIngredientsBtn').prop("disabled", false);
    } else {
        console.log("disabled true");
        $('#restockIngredientsBtn').prop("disabled", true);
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
        setAlert("alert-success", "Successfully restocked ingredients. Reloading page...");
        window.location.reload();
    });
}

function changeIngredientsView(){
    var conditionVal = $('#ingredientCondition').val();
    conditionVal = parseInt(conditionVal);

    console.log("changeingredientsview", ingredientAttr, conditionVal, conditionVal.length)
    if (ingredientAttr === "available" && conditionVal !== 0 && conditionVal !== 1){
        setAlert("alert-warning", "Invalid availability value. 0 = unavailable 1 = available", "#ingredientsViewAlert");
    } else if (ingredientAttr && !isNaN(conditionVal)) {
        localStorage.setItem("ingredientAttr", ingredientAttr);
        localStorage.setItem("ingredientCond", conditionVal);
        location.search = "?attr=" + ingredientAttr + "&condition=" + conditionVal;
    } else if (!ingredientAttr) {
        setAlert("alert-warning", "Ingredient attribute not selected. Choose to display availability or price.",
            "#ingredientsViewAlert");
    } else if (isNaN(conditionVal)) {
        setAlert("alert-warning", "Ingredient condition value is is empty or not a number. Please input a number.",
            "#ingredientsViewAlert");
    } else {
        setAlert("alert-danger", "Invalid ingredient attribute or condition values.", "#ingredientsViewAlert");
    }
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

function setAlert(alertClass, text, selector) {
    var selectorVal = 'div.alert';
    if (selector) {
        selectorVal = selector;
    }
    console.log("selector", selector);

    resetAlert();
    $(selectorVal).first().text(text);
    $(selectorVal).first().addClass(alertClass);
    $(selectorVal).first().removeClass("collapse");
}

$(document).ready(function(){
    init();
});