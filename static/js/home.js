$(document).ready(function () {
	localStorage.removeItem('order');
    $('.user-info-form').on('submit', function (e) {
	e.preventDefault();
	var name, phone_no;
	name = $('#name-input').val();
    phone_no = $('#phone-number').val();
	localStorage.setItem('usersName',name);
	localStorage.setItem('phoneNumber', phone_no);
	localStorage.setItem('order', []);
	var payload = {
		name : name,
		phone : phone_no
	}
	var jsonPayLoad = JSON.stringify(payload);

    $.ajax('http://localhost:8080/api/insertCustomer', {
        contentType: 'application/json',
        data: jsonPayLoad,
        dataType: 'json',
        type: 'POST',
        success: function () {
            console.log('Silently succeeded to add');
        },
        error: function (err){
          	console.log('Error with inserting because: ' + err);
        }
    });
	window.location.href = "http://localhost:8080/customer"
	});
});
