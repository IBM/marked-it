var SWITCH_SOURCEDIR = "--sourceDir", SWITCH_DESTINATIONDIR = "--destinationDir";
var sourceDir, destinationDir;

process.argv.forEach(function(arg) {
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTINATIONDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
	}
});

if (!sourceDir || !destinationDir) {
	console.log("Usage: node markdownProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTINATIONDIR + "=<destinationDirectory>");
	process.exit();
}

var fs = require('fs');

if (!fs.existsSync(sourceDir)) {
	console.log("Source directory does not exist: " + sourceDir);
	process.exit();	
}

if (!fs.existsSync(destinationDir)) {
	console.log("Destination directory does not exist: " + destinationDir);
	process.exit();	
}

var filenames = fs.readdirSync(sourceDir);
filenames.forEach(function(current) {
	window.console.log(current);
});
