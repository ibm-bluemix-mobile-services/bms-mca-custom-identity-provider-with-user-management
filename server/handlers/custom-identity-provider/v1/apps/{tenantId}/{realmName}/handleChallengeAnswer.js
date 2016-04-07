const log4js = require('log4js');
const crypto = require('crypto');
const usersFacade = require(__base + "/server/persisters/usersFacade");
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
		var challengeAnswer = req.body.challengeAnswer;

		logger.debug("handleChallengeAnswer", tenantId, realmName);

		var username = challengeAnswer["username"];
		var passwordHash = crypto.createHmac('sha256', '123456')
			.update(challengeAnswer["password"])
			.digest('hex');

		usersFacade.getUser(username).then(function(user){
			if (user.password == passwordHash && user.isActive == true){
				var response = {
					status: "success",
					userIdentity: {
						userName: user.username,
						displayName: user.username,
						attributes: user.attributes
					}
				};
				usersFacade.updateUserLastLogin(user.username);
				res.status(200).send(response);
			} else {
				res.status(200).json(challengeJson);
			}

		}).catch(function(error){
			logger.error(error);
			res.status(200).json(challengeJson);
		});
	}
}

