const usersFacade = require(__base + '/server/persisters/usersFacade');

module.exports = {
	post: usersFacade.updateUser,
	delete: usersFacade.deleteUser
}