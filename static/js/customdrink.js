$(document).ready(function() {

});


function showInfoModal(name, e) {
    //e.preventDefault();
    var string = 'http://localhost:8080/api/ingredients/name/' + name;
    $.ajax(string, {
            dataType: 'jsonp',
            crossDomain: true
        })
        .done(function(status) {
            alert( "success" );
        })
        .fail(function(a, error) {
            alert( "error "  + error + JSON.stringify(a));
        })
        .always(function() {
            alert( "complete" );
        });
};
