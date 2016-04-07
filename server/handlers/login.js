module.exports = {
	post:function(req,res,next){
		const ADMIN_USERNAME = "ADMIN_USERNAME";
		const ADMIN_PASSWORD = "ADMIN_PASSWORD";

		const adminUsername = process.env[ADMIN_USERNAME];
		const adminPassword = process.env[ADMIN_PASSWORD];

		if (adminUsername == req.body.username && adminPassword == req.body.password){
			req.session.isAuthenticated = true;
			res.setHeader("Location","/console");
			res.send("OK");
		} else {
			res.status(401).send("Unauthorized");
		}
	}
}