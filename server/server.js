global.__base = __dirname + './..';

const cfenv = require('cfenv');
const log4js = require('log4js');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerize = require("swaggerize-express");
const session = require('express-session');

const usersFacade = require(__base + '/server/persisters/usersFacade');
const authFilter = require(__base + '/server/security/authFilter');

const logger = log4js.getLogger("Server");
logger.info("Starting...");

const app = express();
app.use(session({
	secret: "12345",
	resave: false,
	saveUninitialized: true
}));

app.use(bodyParser.json());

app.use("/*", function(req,res,next){
	logger.debug("["+req.session.id+"] Incoming", req.method, "request to", req.originalUrl);
	next();
});

app.use(swaggerize({
	api: require('./../apispec/apispec.json'),
	docspath: '/api-docs',
	handlers: './handlers'
}));

app.use("/swagger-ui", express.static('swagger-ui'));
app.use("/api/admin/*", authFilter);
app.use("/users.html", authFilter);
app.use("/", express.static('webapp'));

usersFacade.init();

app.use(function(req, res){
	res.status(404).send("This is not the URL you're looking for");
});

const server = app.listen(cfenv.getAppEnv().port, function (){
	logger.info("Listening on", server.address().port);
});

