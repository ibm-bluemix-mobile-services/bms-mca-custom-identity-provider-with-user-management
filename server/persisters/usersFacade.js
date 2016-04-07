const log4js = require('log4js');
const crypto = require('crypto');
const logger = log4js.getLogger("UserFacade");
const User = require(__base + '/server/models/UserModel');
const Q = require('q');

var ERROR = {
	REVERTING_TO_INMEMDB: "Can't read Cloudant credentials, falling back to inMemDb. In order to use Cloudant make sure that the following environment variables are set ::",
}
function UsersFacade(){

	var userPersister = null;

	function init(){
		logger.debug("init");
		const CLOUDANT_ACCOUNT = "CLOUDANT_ACCOUNT";
		const CLOUDANT_API_KEY = "CLOUDANT_API_KEY";
		const CLOUDANT_API_PASSWORD = "CLOUDANT_API_PASSWORD";
		const CLOUDANT_DB_NAME = "CLOUDANT_DB_NAME";

		var cloudantAccount = process.env[CLOUDANT_ACCOUNT];
		var cloudantApiKey = process.env[CLOUDANT_API_KEY];
		var cloudantApiPassword = process.env[CLOUDANT_API_PASSWORD];
		var cloudantDbName = process.env[CLOUDANT_DB_NAME];

		if (cloudantAccount == null || cloudantApiKey == null || cloudantApiPassword == null || cloudantDbName == null){
			logger.info(ERROR.REVERTING_TO_INMEMDB, CLOUDANT_ACCOUNT, CLOUDANT_API_KEY, CLOUDANT_API_PASSWORD, CLOUDANT_DB_NAME);
			initForInMemDb();
		} else {
			initForCloudant(cloudantAccount, cloudantApiKey, cloudantApiPassword, cloudantDbName);
		}

	}

	function initForInMemDb(){
		logger.debug("initForInMemDb");
		userPersister = require("./inMemUserPersister");
	}

	function initForCloudant(account, apiKey, apiPass, dbName){
		logger.debug("initForCloudant");
		userPersister = require("./cloudantUserPersister");
		userPersister.init(account, apiKey, apiPass, dbName).then(function(res){
			logger.info(res);
		}).catch(function(err){
			logger.error(err);
		});
	}

	function getAllUsers(req, res, next){
		logger.debug("getAllUsers");
		userPersister.getAllUsers().then(function(users){
			var response = [];
			users.forEach(function(user){
				response.push(user.toSafeJSON())
			})
			res.send(response);
		}).catch(function(error){
			res.status(500).send(error);
		});
	}

	function getUser(username){
		logger.debug("getUser");
		var deferred = Q.defer();
		
		userPersister.getUser(username).then(function(user){
			deferred.resolve(user);
		}).catch(function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	}


	function addUser(req, res, next){
		var userData = req.body;
		logger.debug("addUser", userData);

		if (!userData.username || !userData.password){
			return res.status(500).send("Missing one of mandatory properties: username, password");
		}

		userData.password = crypto.createHmac('sha256', '123456')
			.update(userData.password)
			.digest('hex');

		userPersister.addUser(userData).then(function() {
			getAllUsers(req, res, next);
		}).catch(function(error){
			res.status(500).send(error);
		})
	}

	function updateUser(req, res, next){
		var userData = req.body;
		var username = req.params.username;
		logger.debug("updateUser", userData);

		if (userData.password) {
			userData.password = crypto.createHmac('sha256', '123456')
				.update(userData.password)
				.digest('hex');
		}

		userPersister.updateUser(username, userData).then(function(){
			getAllUsers(req,res,next);
		}).catch(function(error){
			res.status(500).send(error);
		})
	}

	function deleteUser(req,res,next){
		var username = req.params.username;
		logger.debug("deleteUser ::", username);
		userPersister.deleteUser(username).then(function(){
			getAllUsers(req,res,next);
		}).catch(function(error){
			res.status(500).send(error);
		})
	}

	function updateUserLastLogin(username){
		logger.debug("updateUserLastLogin ::", username);
		userPersister.updateUserLastLogin(username, new Date());
	}

	return {
		init: init,
		getAllUsers:getAllUsers,
		getUser:getUser,
		addUser:addUser,
		updateUser:updateUser,
		deleteUser:deleteUser,
		updateUserLastLogin: updateUserLastLogin
	}
}

module.exports = new UsersFacade();
