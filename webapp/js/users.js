var users = [];
var adminURL = '/api/admin/users';
var tableRowTemplate;
$(document).ready(function() {
    getUsers();
    $('#usernameInput').on('input', validateInput);
    $('#passwordInput').on('input', validateInput);
    $('#attributesInputBox').on('input', validateInput);
	var templateSource = $("#tableRowTemplate").html();
	tableRowTemplate = Handlebars.compile(templateSource);
	Handlebars.registerHelper('isCheckedHelper', function(isActive){
		if (isActive){
			return new Handlebars.SafeString('checked="checked"');
		} else {
			return "";
		}

	});
});

function getUsers() {
    $.ajax({
        url: adminURL,
        accepts: 'application/json',
    }).done(function(response) {
        users = response || [];
        createTable();
    }).fail(function(xhr, status, err) {
        console.error(adminURL, status, err.toString());
    });
}

function createTable() {
	$(".userRow").remove();
    $.each(users, function(index, user) {
        user.index = index;
	    $(tableRowTemplate(user)).insertBefore("#addUserButtonRow");
    });
}

// ----------------- Add new user ----------------
function onAddUserButtonClicked() {
    resetModalUi();
	$("#modalUiHeader").text("Add user");
    $('#userDetailsForm').show();
    $('#saveUserButton').attr("onclick", "onModalAddUserButtonClicked()").show();
}

function onModalAddUserButtonClicked() {
	$("#errorMessage").hide();
	var user = {
		username: $("#usernameInput").val(),
		password: $("#passwordInput").val(),
		attributes: JSON.parse($('#attributesInputBox').val() || "{}")
	}
	$.ajax({
		url: adminURL,
		method: "PUT",
		contentType: "application/json",
		data: JSON.stringify(user)
	}).success(function(response, status, xhr){
		console.log("success")
		users = response;
		$('#myModal').modal('hide');
		createTable();
	}).fail(function(xhr, status, err){
		console.error(xhr.responseText);
		$("#errorMessage").text(xhr.responseText).show();
	})
}

// ----------------- Delete user ----------------
function onDeleteUserButtonClicked(index) {
	resetModalUi();
	$("#modalUiHeader").text("Delete user");
	$("#deleteUserConfirmation").text("Are you sure you want to delete " + users[index].username + " ?").show();
	$("#deleteUserButton").attr("onclick", "onModalDeleteUserButtonClicked(" + index + ")").show();;
}

function onModalDeleteUserButtonClicked(userIndex) {
	var username = users[userIndex].username;
	$.ajax({
		url: adminURL + '/' + username,
		method: "DELETE"
	}).success(function (response, status, xhr) {
		console.log("success")
		users = response;
		$('#myModal').modal('hide');
		createTable();
	}).fail(function (xhr, status, err) {
		console.error(xhr.responseText);
	});
}

// ----------------- Edit user ----------------
function onEditUserButtonClicked(index) {
    //Make sure our Modal is cleared before we construct it
	resetModalUi();
	$("#modalUiHeader").text("Edit user");

	$('#userDetailsForm').show();
	$('#saveUserButton').attr("onclick", "onModalAddUserButtonClicked()").show().attr("disabled",false);
	$('#usernameInput').val(users[index].username);
    $('#attributesInputBox').val(JSON.stringify(users[index].attributes, null, 4));
    $('#saveUserButton').attr("onclick", "onModalEditUserButtonClicked(" + index + ")").show();
}


function onModalEditUserButtonClicked(index) {
	$("#errorMessage").hide();
	var user = {
		attributes: JSON.parse($('#attributesInputBox').val() || "{}")
	};
	var username = $("#usernameInput").val();
	var password = $("#passwordInput").val();

	if (username !== users[index].username){
		user.username = username;
	}

	if (password !== ""){
		user.password = password;
	}

	$.ajax({
		url: adminURL + "/" + users[index].username,
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(user)
	}).success(function(response, status, xhr){
		console.log("success")
		users = response;
		$('#myModal').modal('hide');
		createTable();
	}).fail(function(xhr, status, err){
		console.error(xhr.responseText);
		$("#errorMessage").text(xhr.responseText).show();
	})

}

function onUserActiveToggleClicked(index) {
	var user = {
		isActive: !users[index].isActive
	};
	$.ajax({
		url: adminURL + "/" + users[index].username,
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(user)
	}).success(function(response, status, xhr){
		console.log("success")
		users = response;
		$('#myModal').modal('hide');
		createTable();
	}).fail(function(xhr, status, err){
		console.error(xhr.responseText);
	})
}

function resetModalUi() {
    var $modal = $("#myModal");
	$modal.find("#modalBody").children().hide();
    $modal.find(".dynamicButton").hide();
	$modal.find(".help-block").hide();
    $('#usernameInput').val("");
    $("#passwordInput").val("");
    $("#attributesInputBox").val("");
	$("#saveUserButton").prop("disabled", true);
}

function validateInput() {
	var isEditMode = $("#modalUiHeader").text() === "Edit user";
    var username = $("#usernameInput").val();
	var password = $("#passwordInput").val();
    var attributes = $('#attributesInputBox').val();

	var $modal = $("#myModal");
	$modal.find(".help-block").hide();

    $("#usernameForm").removeClass("has-warning");
    if (username === "" || !RegExp(/^[a-zA-Z0-9]+$/).test(username))
    {
        $("#usernameHelp").show();
        $("#usernameForm").addClass("has-warning");
    }

    $("#passwordForm").removeClass("has-warning");
    if (password === "" && !isEditMode) {
        $("#passwordHelp").show();
        $("#passwordForm").addClass("has-warning");
    }

    $("#attributesForm").removeClass("has-warning");
    if (!isValidJsonOrEmpty(attributes)) {
        $("#attributesHelp").show();
        $("#attributesForm").addClass("has-warning");
    }

    var isInputValid = (isValidJsonOrEmpty(attributes) && (username && (password || isEditMode)));
	$("#saveUserButton").prop("disabled", !isInputValid);
}

function isValidJsonOrEmpty(text) {
    if (text.length == 0){
        return true;
    }
    try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}
