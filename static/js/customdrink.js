
    var drinkIngredients = [];

    $(document).ready(function () {
        $('#alcmodal-close').on('click', function (e) {
            e.preventDefault();
            $('#alcModal').hide();
        });

        $('#infomodal-close').on('click', function (e) {
            e.preventDefault();
            $('#infoModal').hide();
        });

        $('.add-item').on('click', function () {
            var $parent = $(this).parent().siblings('#data'),
                name = $parent.attr('data-name'),
                type = $parent.attr('data-type'),
                price = $parent.attr('data-price');
                updateOrderHistoryDisplay({name: name, type: type, price: price});
        });

        $('#order-button').on('click', submitOrder);
    });

    updateOrderHistoryDisplay = function (drinkObj) {
        if (ingredientNotInDrink(drinkObj.name)) {
            drinkIngredients.push(drinkObj.name);
            console.log(drinkIngredients);

            $('.js-ingredients-added').append("<li class=\'list-group-item\' data-name=" + drinkObj.name +
                " data-price=" + drinkObj.price + ">" + "<div class=\'list-infobox\'><div class=\'list-type\'>" + drinkObj.type +
                "</div> <div class=\'list-name'>"+ drinkObj.name + "</div><div class=\'list-price\'>" +
                parseFloat(drinkObj.price).toFixed(2) + "</div></div><div class=\'list-buttonbox\'>" +
                "<button type='button' class='close list-remove'>&times;</button></div></li>");

            // unbind click listeners from the remove buttons, otherwise the older ones will have multiple listeners
            // bound to them.  There is probably a better way to do this.
            $('.list-remove').unbind('click');
            $('.list-remove').on('click', function () {
                var $parent = $(this).closest('.list-group-item'),
                    index = drinkIngredients.indexOf($parent.attr('data-name'));

                drinkIngredients.splice(index, 1);
                console.log(drinkIngredients);
                updateOrderPrice("-" + $parent.attr('data-price'));
                $parent.remove();
            });
            updateOrderPrice(drinkObj.price);
        } else {
            alert(drinkObj.name + " is already in your drink");
        }
    };

    updateOrderPrice = function (val) {
        var oldPrice = $('#price-counter').text(),
            newPrice = parseFloat(oldPrice) + parseFloat(val);
            $('#price-counter').text(newPrice.toFixed(2).toString());
            if (newPrice > 0 ) {
                $('.price-display').css('visibility', 'visible');
                $('#order-button').css('visibility', 'visible');
            } else {
                $('.price-display').css('visibility', 'hidden');
                $('#order-button').css('visibility', 'hidden');
            }
    };

    submitOrder = function () {
        addDrinkToLocalStorage();
        window.location.href = '/customer/';
    };

    addDrinkToLocalStorage = function () {
        var totalOrder = localStorage.getItem('order');

        if (!totalOrder) {
            totalOrder = [];
        } else {
            totalOrder = JSON.parse(totalOrder);
        }

        totalOrder.push({
                         name: $('#name-input').val(),
                         ingredients: drinkIngredients,
                         price: parseFloat($('#price-counter').text())}
        );

        localStorage.setItem('order', JSON.stringify(totalOrder));
    };

    ingredientNotInDrink = function (name) {
        return (drinkIngredients.indexOf(name) == -1)
    };


    /**
     * Display alcoholic modal
     * @param name
     */
    function showAlcModal(name) {
        $.ajax('http://localhost:8080/api/ingredients/alcoholic/' + name, {
            dataType: 'json',
            type: "GET",
            success: function (result) {
                $('#alcModal-title').html(result[0].name);
                $('#alcModal-type').html(result[0].type);
                $('#alcModal-abv').html(result[0].abv);
                $('#alcModal-description').html('"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."')
                $('#alcModal-price').html(result[0].price);
                $('#alcModal-origin').html(result[0].origin);
                $('#alcModal').show();
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        })
    }

    /**
     * Display alcoholic modal
     * @param name
     */
    function showInfoModal(name) {
        $.ajax('http://localhost:8080/api/ingredients/name/' + name, {
            dataType: 'json',
            type: "GET",
            success: function (result) {
                $('#infoModal-title').html(result[0].name);
                $('#infoModal-description').html('"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."')

                if (parseFloat(result[0].price.toFixed(2)) == 0.00) {
                    $('#infoModal-price').html("Free");
                } else {
                    $('#infoModal-price').html(parseFloat(result[0].price.toFixed(2)) );
                }
                $('#infoModal').show();
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        })
    }

    function checkIfDrinkExists (drinkIngredients) {

        var jsonPayload = JSON.stringify(drinkIngredients);

        $.ajax('http://localhost:8080/api/drinks/withallingredients', {
            contentType: 'application/json',
            data: jsonPayload,
            dataType: 'json',
            type: 'GET',
            success: function (result) {
                console.log(JSON.stringify(result));
            },
            error: function (err){
                console.log(error);
            }
        });
    };








