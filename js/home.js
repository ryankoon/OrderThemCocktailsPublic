$(document).ready(function () {
$('.user-info-form').on('submit', function (e) {
	e.preventDefault();
	localStorage.setItem('usersName', $('#name-input').val());
	localStorage.setItem('phoneNumber', $('#phone-number').val());
	window.location.href = "http://localhost:8081/customer"
	});
});
