const log4js = require('log4js');
const logger = log4js.getLogger("InMemUserPersister");
const Q = require('q');
const User = require('./../models/UserModel');

const ERROR = {
	USERNAME_NOT_FOUND: "Username not found",
	USERNAME_EXIST: "Username already exists"
}

function InMemUserPersister(){
	var users = [];

	function getAllUsers(){
		return Q.resolve(users);
	}

	function getUser(username){
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (user.username === username){
				logger.debug("User found ::", username)
				return Q.resolve(user);
			}
		}
		logger.error(ERROR.USERNAME_NOT_FOUND);
		return Q.reject(ERROR.USERNAME_NOT_FOUND);
	}

	function addUser(newUserData){
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (user.username === newUserData.username){
				logger.error(ERROR.USERNAME_EXIST);
				return Q.reject(ERROR.USERNAME_EXIST);
			}
		}
		users.push(User.fromJSON(newUserData));
		logger.debug("User added ::", newUserData.username)
		return Q.resolve();
	}

	function updateUser(username, userData){
		var deferred = Q.defer();
		var newUserJson = {};
		getUser(username).then(function(dbuser){
			newUserJson = {
				username: (userData.username) ? userData.username : dbuser.username,
				password: (userData.password) ? userData.password : dbuser.password,
				attributes: (userData.attributes) ? userData.attributes : dbuser.attributes,
				isActive: (typeof(userData.isActive)!="undefined") ? userData.isActive : dbuser.isActive,
			};
			return deleteUser(username);
		}).then(function(){
			return addUser(newUserJson);
		}).then(function(){
			deferred.resolve();
		}).catch(function(err){
			logger.error(err);
			return deferred.reject(err);
		});
		return deferred.promise;

	}

	function deleteUser(username){
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (user.username === username){
				users.splice(i,1);
				logger.debug("User deleted ::", username);
				return Q.resolve();
			}
		}
		logger.error(ERROR.USERNAME_NOT_FOUND);
		return Q.reject(ERROR.USERNAME_NOT_FOUND);
	}

	return {
		getAllUsers:getAllUsers,
		getUser:getUser,
		addUser:addUser,
		updateUser:updateUser,
		deleteUser:deleteUser
	}

}
module.exports = new InMemUserPersister();
