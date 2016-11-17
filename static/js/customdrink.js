
    function showInfoModal(name, e) {
        var endpoint = 'http://localhost:8080/api/ingredients/name/' + name;

        $.ajax(endpoint, {
            dataType: 'json',
            success: function (result) {
                alert("success:" + result);
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        });

    };

