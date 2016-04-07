const log4js = require('log4js');

module.exports = function(req, res, next){
	const logger = log4js.getLogger("authFilter");
	if (req.session.isAuthenticated){
		logger.debug("["+req.session.id+"] Access granted for ::", req.originalUrl);
		next();
	} else {
		logger.debug("["+req.session.id+"] Access denied for ::", req.originalUrl);
		if (req.originalUrl.indexOf("users.html") > 0){
			res.redirect("/");
		} else {
			res.status(401).send("Unauthorized");
		}
	}
}