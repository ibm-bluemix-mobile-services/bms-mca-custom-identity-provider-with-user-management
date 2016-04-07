var loginURL = '/api/login'

$(document).ready(function () {
	$("#loginButton").click(loginButtonClicked);
});

function loginButtonClicked(e) {
	e.preventDefault();
	var username = $("#inputUsername").val();
	var password = $("#inputPassword").val();

	$.ajax({
		url: loginURL,
		method: "POST",
		contentType: 'application/json',
		data: JSON.stringify({
			"username": username,
			"password": password
		}),
		success: function () {
			window.location = '/users.html'
		},
		error: function (xhr, status, err) {
			alert(err.toString())
		}
	})
}







