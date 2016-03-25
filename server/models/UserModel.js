function User(username, password, attributes, lastLogin, isActive){

	const USERNAME = "username";
	const PASSWORD = "password";
	const ATTRIBUTES = "attributes";
	const LASTLOGIN = "lastLogin";
	const ISACTIVE = "isActive";

	this[USERNAME] = username;
	this[PASSWORD] = password;
	this[ATTRIBUTES] = attributes;
	this[LASTLOGIN] = lastLogin;
	this[ISACTIVE] = isActive;

	if (typeof(this[ISACTIVE]) =="undefined")
		this[ISACTIVE] = true;

	this.toJSON = function(){
		var obj = {};
		obj[USERNAME] = this[USERNAME];
		obj[PASSWORD] = this[PASSWORD];
		obj[ATTRIBUTES] = this[ATTRIBUTES];
		obj[LASTLOGIN] = this[LASTLOGIN];
		obj[ISACTIVE] = this[ISACTIVE];
		return obj;
	}

	this.toSafeJSON = function(){
		var json = this.toJSON();
		delete json[PASSWORD];
		return json;
	}
}

User.fromJSON = function(json){

	return new User(
		json.username,
		json.password,
		json.attributes || {},
		json.lastLogin || "Not available",
		json.isActive
	);
}
module.exports = User;


