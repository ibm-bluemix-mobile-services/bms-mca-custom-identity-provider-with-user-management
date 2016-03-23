const log4js = require('log4js');
const logger = log4js.getLogger("CustomIdentityProvider");

const challengeJson = {
	status: "challenge",
	challenge: {
		text: "Enter username and password"
	}
};

module.exports = {
	post:function(req,res,next){
		var tenantId = req.params.tenantId;
		var realmName = req.params.realmName;
		var headers = req.body.headers;

		logger.debug("startAuthorization", tenantId, realmName);

		res.status(200).json(challengeJson);
	}
}