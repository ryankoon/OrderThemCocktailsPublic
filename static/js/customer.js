/*
Handles ordering multiple drinks for a customer on the customers page.
*/

$(document).ready(function (){
	var orderHistory = [];
	var newPrice;

	var updateOrderHistoryDisplay = function (val) {
		$('.js-drinks-added').append('<li>' + val + '</li>');
	}

	var updateOrderPrice = function (val) {
		var price = $('.js-total-price').text();
		newPrice = parseInt(price) + parseInt(val);
		$('.js-total-price').text(newPrice.toString());
	};

	/*
	Event bindings.
	*/
	$('.order-information').on('submit', function (e) {
		e.preventDefault();
		var tableValue = $('#table-input').val();
		var note = $('#order-notes').val();
		var phone = localStorage.getItem("phoneNumber");
		var name = localStorage.getItem("usersName");
		var cardNumber = $('#credit-card').val();

		var payload = {
			notes : note,
			phone: phone,
			table : tableValue,
			cust_name: name,
			drinks: orderHistory,
			amount: newPrice,
			card_no: cardNumber

		};
		var jsonPayload = JSON.stringify(payload);

		$('.submit-drink-order').attr('disabled', true);
		$.ajax('http://localhost:8080/customer/drinks/order', {
			contentType: 'application/json',
			data: jsonPayload,
			crossDomain : true,
			dataType: 'json',
			type: 'POST',
			success: function () {
				alert('Order successfully sent. Please have a seat at your table.');
			},
			error: function (err){
				$('.submit-drink-order').attr('disabled', false);
				alert('Error contacting the API: ' + err);
			}
		});
	});
	$('.increment-drink').on('click', function (e) {
		e.preventDefault();
		var drinkIdOrdered = $('.drink-selector-dropdown option:selected').val();
		var drinkOrderName = $('.drink-selector-dropdown option:selected').attr('name-attr');
		var drinkPrice = $('.drink-selector-dropdown option:selected').attr('price-attr');
		orderHistory.push(drinkIdOrdered);
		updateOrderHistoryDisplay(drinkOrderName);
		updateOrderPrice(drinkPrice);
	});
});
