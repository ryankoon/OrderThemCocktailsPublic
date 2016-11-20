$(document).ready(function () {
$('.user-info-form').on('submit', function (e) {
	e.preventDefault();
	localStorage.setItem('usersName', $('#name-input').val());
	localStorage.setItem('phoneNumber', $('#phone-number').val());
	localStorage.setItem('order', []);
	window.location.href = "http://localhost:8080/customer"
	});
});
