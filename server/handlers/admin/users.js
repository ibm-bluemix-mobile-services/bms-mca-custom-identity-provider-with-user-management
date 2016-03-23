const usersFacade = require(__base + '/server/persisters/usersFacade');

module.exports = {
	get: usersFacade.getAllUsers,
	post: usersFacade.postUser
}