/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var CRITICAL = 4;
var ERROR = 3;
var WARNING = 2;
var INFO = 1;
var DETAIL = 0;
var DEBUG = -1;

function Logger(level) {	
	this.level = level;
}

Logger.prototype = {
	critical: function(text) {
		console.log("*** CRITICAL: " + text);
	},
	error: function(text) {
		if (this.level <= ERROR) {
			console.log("*** ERROR: " + text);
		}
	},
	warning: function(text) {
		if (this.level <= WARNING) {
			console.log("*** WARNING: " + text);
		}
	},
	info: function(text) {
		if (this.level <= INFO) {
			console.log("-->" + text);
		}
	},
	detail: function(text) {
		if (this.level <= DETAIL) {
			console.log("-->" + text);
		}
	},
	debug: function(text) {
		if (this.level <= DEBUG) {
			console.log(text);
		}
	}
};

module.exports.Logger = Logger;
module.exports.ERROR = ERROR;
module.exports.WARNING = WARNING;
module.exports.INFO = INFO;
module.exports.DETAIL = DETAIL;
module.exports.DEBUG = DEBUG;
