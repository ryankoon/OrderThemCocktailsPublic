$(document).ready(function () {
    $(".click-create-account").on('click', function (e) {
        e.preventDefault();
        $('.create-account').show();
    });
    $('.login-form #buttonToSubmit').on('submit', function (e, data) {
        e.preventDefault();
        var url = 'http://localhost:8080/api/checkPermissions';
        var formData = $('.login-form').serialize();
        $.ajax({
            url : url,
            contentType: 'application/json',
            data: formData,
            dataType: 'json',
            type: 'POST',
            success: function () {
                console.log('Silently succeeded to add');
                window.location.href = "/home";
            },
            error: function (err){
                console.log('Error with inserting because: ' + err);
            }
        });
    });
}