var loginURL = 'http://anton-custom-identity-provider-with-user-management.mybluemix.net/api/login'

$( document ).ready(function() {
   $("#singinButton").click(siginButton);
});


function siginButton(e){
   e.preventDefault();
   var username = $("#inputUsername").val();
   var password = $("#inputPassword").val();

   $.ajax({
      url: loginURL,
      method: "POST",
      contentType: 'application/json',
      data:JSON.stringify({"username":username, "password":password}),
      success: function(data) {
         window.location = '/users.html'
      },
      error: function(xhr, status, err) {
        console.error(loginURL, status, err.toString());
      }
   })
}


$("#singinForm").submit(function(e){
   e.preventDefault();
   var username = $("#inputUsername").val();
   var password = $("#inputPassword").val();

   $.ajax({
      url: loginURL,
      method: "POST",
      contentType: 'application/json',
      data:JSON.stringify({"username":username, "password":password}),
      success: function(data) {
         window.location = '/users.html'
      },
      error: function(xhr, status, err) {
        console.error(loginURL, status, err.toString());
      }
   })
})
