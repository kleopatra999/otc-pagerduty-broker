/**
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
'use strict';

var
	nconf = require('nconf'),
	util = require('util'),
	log4js = require('log4js')
;

var logger = log4js.getLogger("otc-pagerduty-broker"),
	logBasePath = 'lib.middleware.check-otc-api-auth';

/*
 * Check the OTC API Auth - ie basic auth with id and broker secret in it
 */
module.exports = function checkOtcApiAuth(req, res, next) {
	var logPrefix = "[" + logBasePath + ".checkOtcApiAuth] ";
	// Check the Basic header of the request
	var authHeader = req.header('Authorization');
	if (authHeader) {
		// Split header and grab values from it.
		var authHeaderParts = authHeader.split(/\s+/);
		var authPrefix = String(authHeaderParts[0]).toLowerCase();
		var authValue = authHeaderParts[1];
		if (authPrefix === 'basic') {
			// Check if the id and secret are matching ours
			var id;
			var secret;
			try {
				var creds = new Buffer(authValue, 'base64').toString('ascii').split(":");
				id = creds[0];
				secret = creds[1];
			} catch (ex) {
			}
			logger.debug(logPrefix + "Basic Credentials service_id: " + id + ", expected: " + nconf.get("TIAM_CLIENT_ID"));
			if (id != nconf.get("TIAM_CLIENT_ID") || secret != nconf.get("OTC_API_BROKER_SECRET")) {
				var reason = "invalid authorization header " + authHeader;
				logger.info(logPrefix + "Returning unauthorized (401): " + reason);
				return res.status(401).json({description: reason});
			}
			return next();
		}
	}
	var reason = "invalid authorization header " + authHeader;
	logger.info(logPrefix + "Returning unauthorized (401): " + reason);
	return res.status(401).json({description: reason});
}
