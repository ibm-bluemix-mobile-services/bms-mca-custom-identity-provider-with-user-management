const usersFacade = require(__base + '/server/persisters/usersFacade');

module.exports = {
	delete: usersFacade.deleteUser
}