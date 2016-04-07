const cfenv = require('cfenv');
const Cloudant = require('cloudant');
const log4js = require('log4js');
const logger = log4js.getLogger("CloudantUserPersister");
const Q = require('q');
const User = require('./../models/UserModel');

const ERROR = {
	USERNAME_NOT_FOUND: "Username not found",
	USERNAME_EXIST: "Username already exists",
	FAILED_CONNECTING: "There was a database connectivity error. Please retry again later."
}

function CloudantUserPersister(){

	var usersdb;

	function init(account, apiKey, apiPass, dbName){
		logger.info("Initializing");
		var deferred = Q.defer();

		logger.info("Attempting to connect to Cloudant account ::", account);

		Cloudant({
			account:account,
			key: apiKey,
			password: apiPass
		}, function(err, cloudant){
			if (err != null){
				logger.fatal(ERROR.FAILED_CONNECTING, err);
				return Q.reject(ERROR.FAILED_CONNECTING);
			}
			logger.info("Cloudant connection successfully established");
			usersdb = cloudant.db.use(dbName);
		});

		return deferred.promise;
	}

	function getAllUsers(){
		var deferred = Q.defer();
		usersdb.list({include_docs:true}, function(err, resp){
			if (err != null){
				logger.error(ERROR.FAILED_CONNECTING, err);
				return deferred.reject(ERROR.FAILED_CONNECTING);
			}
			var users = [];
			resp.rows.forEach(function(row){
				users.push(User.fromJSON(row.doc));
			});

			return deferred.resolve(users);

		});

		return deferred.promise;
	}

	function addUser(userData){
		var deferred = Q.defer();
		getLatestDocRevision(userData.username).then(function(rev){
			if (rev == null){
				delete userData.lastLogin;
				var user = User.fromJSON(userData);
				usersdb.insert(user.toJSON(), userData.username, function(err, resp){
					if (err != null){
						logger.error(ERROR.FAILED_CONNECTING, err);
						return deferred.reject(ERROR.FAILED_CONNECTING);
					}

					return deferred.resolve();
				});
			} else {
				logger.error(ERROR.USERNAME_EXIST);
				return deferred.reject(ERROR.USERNAME_EXIST);
			}

		}).catch(function(err){
			logger.error(err);
			deferred.reject(err)
		});

		return deferred.promise;
	}


	function getUser(username){
		var deferred = Q.defer();
		usersdb.get(username, function(err, resp){
			if (err != null){
				if (err.statusCode == 404) {
					logger.error(ERROR.USERNAME_NOT_FOUND, username);
					return deferred.reject(ERROR.USERNAME_NOT_FOUND);
				} else {
					logger.error(ERROR.FAILED_CONNECTING, err);
					return deferred.reject(ERROR.FAILED_CONNECTING);
				}
			}

			return deferred.resolve(User.fromJSON(resp));
		});

		return deferred.promise;
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

	function updateUserLastLogin(username, lastLogin){
		usersdb.get(username, function(err, resp){
			if (err) return;
			var user = User.fromJSON(resp);
			var payload = user.toJSON();
			payload.lastLogin = lastLogin;
			payload["_id"] = username;
			payload["_rev"] = resp["_rev"];
			usersdb.insert(payload);
		});
	}

	function deleteUser(username){
		var deferred = Q.defer();

		getLatestDocRevision(username).then(function(rev){
			if (rev == null){
				return deferred.reject(ERROR.USERNAME_NOT_FOUND);
			}

			usersdb.destroy(username, rev, function(err, resp){
				if (err != null){
					logger.error(ERROR.FAILED_CONNECTING, err);
					return deferred.reject(ERROR.FAILED_CONNECTING);
				}
				return deferred.resolve();
			});
		}).catch(function(err){
			logger.error(err);
			return deferred.reject(err);
		});

		return deferred.promise;
	}

	function getLatestDocRevision(docId){
		var deferred = Q.defer();
		usersdb.get(docId, function(err, resp){
			if (err != null){
				if (err.statusCode == 404) {
					return deferred.resolve(null);
				} else {
					logger.error(ERROR.FAILED_CONNECTING, err);
					return deferred.reject(ERROR.FAILED_CONNECTING);
				}
			}

			return deferred.resolve(resp["_rev"]);
		});



		return deferred.promise;
	}

	return {
		init:init,
		getAllUsers:getAllUsers,
		getUser:getUser,
		addUser:addUser,
		updateUser:updateUser,
		deleteUser:deleteUser,
		updateUserLastLogin:updateUserLastLogin
	}

}
module.exports = new CloudantUserPersister();
