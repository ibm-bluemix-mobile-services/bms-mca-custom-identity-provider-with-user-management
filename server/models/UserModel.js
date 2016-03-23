function User(username, passwordHash, attributes, lastLogin, isActive, rev){

	const USERNAME = "username";
	const PWHASH = "passwordHash";
	const ATTRIBUTES = "attributes";
	const LASTLOGIN = "lastLogin";
	const ISACTIVE = "isActive";

	this[USERNAME] = username;
	this[PWHASH] = passwordHash;
	this[ATTRIBUTES] = attributes;
	this[LASTLOGIN] = lastLogin;
	this[ISACTIVE] = isActive;

	this.toJSON = function(){
		var obj = {};
		obj[USERNAME] = this[USERNAME];
		obj[PWHASH] = this[PWHASH];
		obj[ATTRIBUTES] = this[ATTRIBUTES];
		obj[LASTLOGIN] = this[LASTLOGIN];
		obj[ISACTIVE] = this[ISACTIVE];
		return obj;
	}

	this.toSafeJSON = function(){
		var json = this.toJSON();
		json[PWHASH] = "******";
		return json;
	}
}

User.fromJSON = function(json){
	return new User(
		json.username,
		json.passwordHash,
		json.attributes,
		json.lastLogin,
		json.isActive
	);
}
module.exports = User;


