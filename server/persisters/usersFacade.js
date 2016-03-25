const log4js = require('log4js');
const crypto = require('crypto');
const logger = log4js.getLogger("UserFacade");
const User = require(__base + '/server/models/UserModel');
const Q = require('q');

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

	return {
		initForInMemDb: initForInMemDb,
		initForCloudant: initForCloudant,
		getAllUsers:getAllUsers,
		addUser:addUser,
		updateUser:updateUser,
		deleteUser:deleteUser
	}
}

module.exports = new UsersFacade();
