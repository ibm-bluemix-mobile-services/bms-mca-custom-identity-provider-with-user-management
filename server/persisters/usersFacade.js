const log4js = require('log4js');
const crypto = require('crypto');
const logger = log4js.getLogger("UserFacade");
const User = require(__base + '/server/models/UserModel');
const Q = require('Q');

function UsersFacade(){

	var userPersister = null;

	function initForInMemDb(){
		logger.debug("initForInMemDb");
		userPersister = require("./inMemUserPersister");
	}

	function initForCloudant(){
		logger.debug("initForCloudant");
		userPersister = require("./cloudantUserPersister");
		userPersister.init().then(function(res){
			logger.info(res);
		}).catch(function(err){
			logger.err(err);
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
	
	function postUser(req, res, next){
		var userData = req.body;

		if (userData.passwordHash != "******"){
			userData.passwordHash = crypto.createHmac('sha256', '123456')
				.update(userData.passwordHash)
				.digest('hex');;
		}

		var user = User.fromJSON(userData)
		logger.debug("postUser", user.toJSON());

		userPersister.postUser(user).then(function(){
			res.send("OK");
		}).catch(function(error){
			res.status(500).send(error);
		})
	}

	function getUser(username){
		var deferred = Q.defer();

		logger.debug("getUser ::", username);
		userPersister.getUser(username).then(function(user){
			deferred.resolve(user);
		}).catch(function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	}

	function deleteUser(req,res,next){
		var username = req.params.username;
		logger.debug("deleteUser ::", username);
		userPersister.deleteUser(username).then(function(){
			res.send("OK");
		}).catch(function(error){
			res.status(500).send(error);
		})
	}   

	return {
		initForInMemDb: initForInMemDb,
		initForCloudant: initForCloudant,
		getAllUsers:getAllUsers,
		postUser:postUser,
		getUser:getUser,
		deleteUser:deleteUser
	}
}

module.exports = new UsersFacade();
