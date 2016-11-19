
    var drinkIngredients = [];

    $(document).ready(function () {
        $('#modal-close').on('click', function (e) {
            e.preventDefault();
            $('#infoModal').hide();
        });

        $('.add-item').on('click', function () {
            var $parent = $(this).parent().siblings('#data'),
                name = $parent.attr('data-name'),
                type = $parent.attr('data-type');

            $.ajax('http://localhost:8080/api/ingredients/name/' + name, {
                dataType: 'json',
                type: "GET",
                success: function (result) {
                    var drinkObj = {
                        name: name,
                        price: result[0].price,
                        type: type
                    };
                    updateOrderHistoryDisplay(drinkObj);
                },
                error: function (err) {
                    alert("ERROR! : " + err)
                }
            });
        })
    });


    updateOrderHistoryDisplay = function (drinkObj) {
        $('.js-ingredients-added').append("<li class=\'list-group-item\'>" + drinkObj.name + "</li>");
    };

    updateOrderPrice = function (val) {
        var price = $('.js-total-price').text();
        newPrice = parseInt(price) + parseInt(val);
        $('.js-total-price').text(newPrice.toString());
    };



    function showInfoModal(name) {
        $.ajax('http://localhost:8080/api/ingredients/name/' + name, {
            dataType: 'json',
            type: "GET",
            success: function (result) {
                alert(JSON.stringify(result[0]));
                $('#infoModal-title').html(result[0].name);
                $('#infoModal-type').html(result[0].type);
                $('#infoModal-abv').html(result[0].abv);
                $('#infoModal-description').html('"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."')
                //$('#infoModal-description').html(result[0].description + "description goes here");

                $('#infoModal-origin').html(result[0].origin);
                $('#infoModal').show();
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        })
    }



    function updateIngOrderedDisplay() {

    }







