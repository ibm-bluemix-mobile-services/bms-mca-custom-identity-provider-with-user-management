const usersFacade = require(__base + '/server/persisters/usersFacade');

module.exports = {
	get: usersFacade.getAllUsers,
	put: usersFacade.addUser
}