var users = [];
const adminURL = 'http://anton-custom-identity-provider-with-user-management.mybluemix.net/api/admin/users';

//Class for Users
function User() {
   var user = {
        attributes: {},

        // set multiple attributes
        set: function( attr_name, val ) {
          this.attributes[ attr_name ] = val;
        },

        //get a single attribute
        get: function( attr_name ) {
          return this.attributes[ attr_name ];
        },

        //get User attributes in JSON format
        toJSON: function(){
           return this.attributes;
        }
      };
  return user;
}

$( document ).ready(getUsers);

function getUsers(){
   $.ajax({
      url: adminURL,
      accepts: 'application/json',
      success: function(response) {
         console.log(response);
         for (i = 0; i < response.length; i++){
            var user = new User();
            user.set("username", response[i].username)
            user.set("isActive", response[i].isActive)
            user.set("attributes", response[i].attributes)
            user.set("lastLogin", response[i].lastLogin)
            users.push(user);
         }
      },
      error: function(xhr, status, err) {
         console.error(adminURL, status, err.toString());
      }
   }).done(function(){
      createTable();
   });
}

function postUser(user, userIndex){
   var methodType;
   var userURI = '';

   if( typeof userIndex == 'undefined'){
      methodType = "PUT"
   } else {
      methodType = "POST"
      userURI = '/'+users[userIndex].get("username");
   }

   $.ajax({
      url: adminURL + userURI,
      method: methodType,
      contentType: "application/json",
      accept: 'text/html',
      data: JSON.stringify(user.toJSON()),
      success: function (data) {
                  if(typeof userIndex == 'undefined'){
                     users.push(user);
                  }else{
                     var username = user.get("username") || users[userIndex].get("username");
                     var isActive = user.get("isActive") || users[userIndex].get("isActive");
                     var attributes = user.get("attributes") || users[userIndex].get("attributes");
                     users[userIndex].set("username", username);
                     users[userIndex].set("isActive", isActive);
                     users[userIndex].set("attributes", attributes);
                  }
      },
      error: function (xhr, status, err) {
         console.error(adminURL, status, err.toString());
      }
   }).then(function(){
      $('#myModal').modal('hide');
      destroyTable();
   }).done(function(){
      createTable();
   });
}

function deleteUser(userIndex){
   var username = users[userIndex].get("username");
   $.ajax({
      url: adminURL + '/' +username,
      method: "DELETE",
      accept: 'text/html',
      success: function(data){
         users.splice(userIndex, 1);
      },
      error: function (xhr, status, err) {
         console.error(this.props.url, status, err.toString());
      }
   }).then(function(){
      $('#myModal').modal('hide');
      destroyTable();
   }).done(function(){
      createTable();
   });
}

function createTable(){
   for (var i = 0, len = users.length; i < len; ++i) {
      var tr = $("<tr/>");
      var td1 = $("<td/>").text(users[i].get("username"));

      var checkBox = $("<input/>").attr({
                                       "onclick":"activeCheck("+i+")",
                                       "type": "checkbox",
                                       "checked":users[i].get("isActive")
                                    });
      var td2 = $("<td/>").append(checkBox);



      var td3 = $("<td/>").text(users[i].get("lastLogin"));

      var buttonEdit = $("<button/>").addClass("btn btn-info")
                                       .text("Edit User")
                                       .attr({
                                          "data-toggle": "modal",
                                          "data-target": "#myModal",
                                          "onclick": "editModal("+i+")"
                                       });
      var td4 = $("<td/>").append(buttonEdit);

      var buttonDelete = $("<button/>").addClass("btn btn-danger")
                                       .text("Delete User")
                                       .attr({
                                          "data-toggle": "modal",
                                          "data-target": "#myModal",
                                          "onclick": "deleteModal("+i+")"
                                       });
      var td5 = $("<td/>").append(buttonDelete);

      tr.append(td1, td2, td3, td4, td5);
      $(tr).prependTo('#tableBody');
   }

}

function destroyTable(){
   var addButton = $( "#tableBody tr" ).slice(-1).remove();
   $( "#tableBody" ).empty();
   $( "#tableBody" ).append(addButton);
}

function deleteModal(index){
   cancelButton();
   $("#deleteUserHeader").prop("style", "display: inline");
   $("#deleteUser").prop("style", "display: inline")
                     .text("Are you sure you want to delete "+users[index].get("username") +"?");

   $("#deleteUserButton").prop("style", "display: inline")
                           .attr("onclick", "deleteButton("+index+")");
}

function editModal(index){
   //Make sure our Modal is cleared before we construct it
   cancelButton();
   $("#editUserHeader").prop("style", "display: inline")

   //Creating our attributes object to put into our textarea
   var attributes = JSON.stringify(users[index].get("attributes")) || ""
   attributes = attributes.replaceAll("\\", "");
   attributes = attributes.slice(2, -2);

   //Show our Edit User form in our Modal
   $('#addEditUserForm').prop("style", "display: inline");
   $('#usernameInput').prop("value", users[index].get("username"));
   $('#attributesInputBox').prop("value", attributes)
   $('#addEditSaveButton').attr("onclick", "editButton("+index+")")
                            .prop("style", "display: inline");
}

function addModal(){
   cancelButton();
   $("#addUserHeader").prop("style", "display: inline-block")

   //User Handlebars.js to create template
   $('#addEditUserForm').prop("style", "display: inline");
   $('#addEditSaveButton').attr("onclick", "addButton()")
                            .prop("style", "display: inline");
}

function activeCheck(index){
   users[index].set("isActive", !users[index].get("isActive"));
   postUser(users[index], index)
   console.log(users[index].get("isActive"))
}

function deleteButton(index){
   deleteUser(index);
   $('#myModal').modal('hide');
   destroyTable();
   createTable();
}

function editButton(index){
   var user = new User();

   user.set("username", users[index].get("username"))
   if($("#usernameInput").val() !== undefined &&
         users[index].get("username") !== $("#usernameInput").val()){
      user.set("username", $("#usernameInput").val())
   }

   if($("#passwordInputBox").val() !== undefined){
      users[index].set("username", $("#passwordInputBox").val())
   }

   var attributes = JSON.stringify(users[index].get("attributes")) || ""
   attributes = attributes.replaceAll("\\", "");
   attributes = attributes.slice(2, -2);

   user.set("attributes", users[index].get("attributes"))
   if($("#attributesInputBox").val() !== undefined
      && $("#attributesInputBox").val() !== attributes){
         attributes = '{' + $('#attributesInputBox').val() + '}';
         if(testJSON(attributes)){
            user.set("attributes", attributes)
         }
   }

   postUser(user, index);
}

function addButton(){
   var user = new User();

   var username = $("#usernameInput").val();
   var password = $("#passwordInput").val();
   var attributes = '{' + $('#attributesInputBox').val() + '}';

   //Check to see if username and password exist. If not put a warning on the input box

   user.set("attribues", null);
   if(testJSON(attributes)){
      user.set("attributes", attributes);
   }

   user.set("username", username);
   user.set("password", password);
   user.set("isActive", true);

   postUser(user)
}

function cancelButton(){
   $("#deleteUserHeader").prop("style", "display: none")
   $("#editUserHeader").prop("style", "display: none")
   $("#addUserHeader").prop("style", "display: none")
   $("#addEditUserForm").prop("style", "display: none")
   $('#addEditSaveButton').prop("style", "display: none");
   $("#deleteUserButton").prop("style", "display: none");
   $("#deleteUser").prop("style", "display: none")

   $('#usernameInput').prop("value", null);
   $("#passwordInput").prop("value", null);
   $("#attributesInputBox").prop("value", null);
}

function testJSON(text){
    try{
        JSON.parse(text);
        return true;
    }
    catch (error){
        return false;
    }
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
