
    var drinkIngredients = [];

    $(document).ready(function () {
        $('#alcmodal-close').on('click', function (e) {
            e.preventDefault();
            $('#alcModal').hide();
        });

        $('.add-item-alcoholic').on('click', function () {
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
            $('.js-ingredients-added').append("<li class=\'list-group-item\'>" + drinkObj.type + drinkObj.name + drinkObj.price + "</li>");
            updateOrderPrice(drinkObj.price);
        } else {
            alert(drinkObj.name + " is already in your drink");
        }
    };

    updateOrderPrice = function (val) {
        var price = $('#price-counter').text(),
            newPrice = parseFloat(price) + parseFloat(val);

            $('#price-counter').text(newPrice.toFixed(2).toString());

            if (newPrice > 0) {
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
    }

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
     * Display the info modal object
     * @param name
     */
    function showAlcModal(name) {
        $.ajax('http://localhost:8080/api/ingredients/alcoholic/' + name, {
            dataType: 'json',
            type: "GET",
            success: function (result) {
                alert(JSON.stringify(result[0]));
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








