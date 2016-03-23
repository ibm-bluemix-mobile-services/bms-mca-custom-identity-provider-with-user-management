const log4js = require('log4js');
const logger = log4js.getLogger("InMemUserPersister");
const Q = require('q');

const ERROR = {
	USERNAME_NOT_FOUND: "Username not found"
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

	function postUser(newUser){
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (user.username === newUser.username){
				users.splice(i,1);
				break;
			}
		}
		users.push(newUser);
		logger.debug("User added ::", newUser.username)
		return Q.resolve(newUser);
	}

	function deleteUser(username){
		for (var i=0; i<users.length; i++){
			var user = users[i];
			if (user.username === username){
				users.splice(i,1);
				logger.debug("User deleted ::", username);
				return Q.resolve(user);
			}
		}
		logger.error(ERROR.USERNAME_NOT_FOUND);
		return Q.reject(ERROR.USERNAME_NOT_FOUND);
	}

	return {
		getAllUsers:getAllUsers,
		getUser:getUser,
		postUser:postUser,
		deleteUser:deleteUser
	}

}
module.exports = new InMemUserPersister();
