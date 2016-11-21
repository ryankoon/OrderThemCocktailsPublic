
    var drinkIngredients = [],
        _id = 0;

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
        if (drinkIngredients.length != 0) {
            addDrinkOrGetIfExists();
            addDrinkToLocalStorage(_id);
            //window.location.href = '/customer/';
        } else {
            alert("Please add ingredients to your drink");
        }
    };

    addDrinkToLocalStorage = function (id) {
        if (id) {
            var totalOrder = localStorage.getItem('order');

            if (!totalOrder) {
                totalOrder = [];
            } else {
                totalOrder = JSON.parse(totalOrder);
            }

            totalOrder.push({
                    name: $('#name-input').val(),
                    id: id,
                    price: parseFloat($('#price-counter').text())}
            );
            localStorage.setItem('order', JSON.stringify(totalOrder));
        }
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
                $('#alcModal-abv').html(result[0].abv + "% ABV");
                $('#alcModal-description').html(result[0].description);
                $('#alcModal-price').html("$" + parseFloat(result[0].price).toFixed(2));
                $('#alcModal-origin').html(result[0].origin);
                $('#alcModal').show();
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        })
    }

    /**
     * Display non-alcoholic modal
     * @param name
     */
    function showInfoModal(name) {
        $.ajax('http://localhost:8080/api/ingredients/name/' + name, {
            dataType: 'json',
            type: "GET",
            success: function (result) {
                $('#infoModal-title').html(result[0].name);
                $('#infoModal-description').html(result[0].description);

                if (parseFloat(result[0].price.toFixed(2)) == 0.00) {
                    $('#infoModal-price').html("Free");
                } else {
                    $('#infoModal-price').html("$" + parseFloat(result[0].price).toFixed(2));
                }
                $('#infoModal').show();
            },
            error: function (err) {
                alert("ERROR! : " + err)
            }
        })
    }

    function addDrinkOrGetIfExists () {

        var jsonPayload = $.param({ingredient: drinkIngredients});

        $.ajax('http://localhost:8080/api/drinks/withallingredients', {
            contentType: 'application/json',
            data: jsonPayload,
            dataType: 'json',
            type: 'GET',
            async: false,
            success: function (result) {
                processDrinkSearchResult(result);
            },
            error: function (err){
                console.log(error);
            }
        });
    };

    function processDrinkSearchResult (result) {
        // If the result is length zero, then the drink doesn't exist.  We can add it to the drinks table and fetch
        // id.  Other the drink already exists, then the result will be the id.
        if (result.length !== 0) {
            _id = result[0].d_id;
            window.location.href = "/customer";
        } else {
            addDrinkToDB();
        }
    };

    function addDrinkToDB () {
        var jsonPayload = JSON.stringify({name: $('#name-input').val(),
                           ingredient: drinkIngredients});

        console.log(jsonPayload);

        $.ajax('http://localhost:8080/api/drinks/new', {
            contentType: 'application/json',
            data: jsonPayload,
            dataType: 'json',
            type: 'POST',
            async: false,
            success: function (result) {
                setId(result);
            },
            error: function (err) {
                alert('Error contacting the API: ' + err);
            }
        });
    }

    function setId(result) {
        _id = result;
        window.location.href = "/customer";
    }










