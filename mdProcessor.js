var fs = require('fs');
var path = require('path');
var marked = require('marked');

var EXTENSION_HTML = ".html";
var EXTENSION_MARKDOWN_REGEX = /\.md$/g;
var OPTIONS_MARKED = {sanitize: true, tables: true};
var SWITCH_SOURCEDIR = "--sourceDir";
var SWITCH_DESTDIR = "--destDir";
var SWITCH_BASEURL = "--baseURL";
var SWITCH_OVERWRITE = "-overwrite";
var SWITCH_HEADERFILE = "--headerFile";
var SWITCH_FOOTERFILE = "--footerFile";

var sourceDir, destinationDir, baseURL, overwrite, headerFile, footerFile, headerText, footerText;

process.argv.forEach(function(arg) {
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
//	} else if (arg.indexOf(SWITCH_BASEURL) === 0 && arg.indexOf("=") !== -1) {
//		baseURL = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_OVERWRITE) === 0) {
		overwrite = true;
	} else if (arg.indexOf(SWITCH_HEADERFILE) === 0 && arg.indexOf("=") !== -1) {
		headerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_FOOTERFILE) === 0 && arg.indexOf("=") !== -1) {
		footerFile = arg.substring(arg.indexOf("=") + 1);
	}
});

if (!sourceDir || !destinationDir) {
	console.log("Usage: node mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [" /* + SWITCH_BASEURL + "=<baseURL>]["*/ + SWITCH_OVERWRITE + " " + SWITCH_HEADERFILE + "=<headerSourceFile> " + SWITCH_FOOTERFILE + "=<footerSourceFile>]");
	process.exit();
}

if (!fs.existsSync(sourceDir)) {
	console.log("Source directory does not exist: " + sourceDir);
	process.exit();	
}

if (!fs.existsSync(destinationDir)) {
	var result = fs.mkdirSync(destinationDir);
	if (result) {
		console.log("Failed to create destination directory: " + destinationDir);
		console.log(result.toString());
		process.exit();	
	}
}

if (headerFile) {
	var fd = fs.openSync(headerFile, "r");
	headerText = readFile(fd);
	fs.close(fd);
}

if (footerFile) {
	fd = fs.openSync(footerFile, "r");
	footerText = readFile(fd);
	fs.close(fd);
}

var writeStat = fs.statSync(destinationDir);
var writeBlockSize = writeStat.blksize || 4096;

if (baseURL) {
	marked.InlineLexer.prototype.outputLink = baseURL;
}

var lexer = new marked.Lexer(OPTIONS_MARKED);
var parser = new marked.Parser(OPTIONS_MARKED);
marked.Parser.prototype.tok = replacementTok.bind(parser);

addMarkedAttributesSupport(lexer);

function traverse_tree(source, destination) {
	var filenames = fs.readdirSync(source);
	filenames.forEach(function(current) {
		var sourcePath = path.join(source, current);
		fs.stat(sourcePath, function(err, stat) {
			if (stat && stat.isDirectory()) {
				var destPath = path.join(destination, current);
				fs.stat(destPath, function (err, stat) {
					if (!stat) {
						fs.mkdir(destPath, function (err) {});
					}
				});
				traverse_tree(sourcePath, destPath);
			} else {
				if (path.extname(current) === ".md") {
					fs.open(sourcePath, "r", null, function(readErr, readFd) {
						if (readErr) {
							console.log("Failed to open file to read: " + sourcePath + "\n" + readErr.toString());
						} else {
							var fileText = readFile(readFd);
							if (!fileText) {
								console.log("Failed to read " + sourcePath);
							} else {
								var tokens = lexer.lex(fileText, OPTIONS_MARKED);
								var markdownText = parser.parse(tokens);
								if (!markdownText) {
									console.log("Failed during conversion of markdown to HTML file " + sourcePath);
								} else {
									var outBuffer = new Buffer(markdownText);
									var outputFilename = current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML);
									var destinationPath = path.join(destination, outputFilename);
									fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
										if (writeErr) {
											console.log("Failed to open file to write: " + sourcePath + "\n" + writeErr.toString());
										} else {
											var success = true;
											if (headerText) {
												success = writeFile(writeFd, new Buffer(headerText));
											}
											if (success) {
												success = writeFile(writeFd, outBuffer);
											}
											if (success && footerText) {
												success = writeFile(writeFd, new Buffer(footerText));
											}
											if (success) {
												console.log("-->Wrote " + destinationPath);
											} else {
												console.log("Failed to write " + destinationPath);
											}
											fs.close(writeFd);
										}
									});
								}
							}
							fs.close(readFd);
						}
					});
				} else {
					console.log("file " + sourcePath + " is not a markdown");
				}
			}
		});
	});
}

console.log("");
traverse_tree(sourceDir, destinationDir);

function addMarkedAttributesSupport(lexer) {
	var markedLexerTokenFn = marked.Lexer.prototype.token.bind(lexer);
	marked.Lexer.prototype.token = function(src, top) {
		var tokens = markedLexerTokenFn(src, top);
		tokens.forEach(function(token) {
			var text = token.text;
			if (text) {
				var attributeStartIndex = text.lastIndexOf("{:");
				if (attributeStartIndex !== -1) {
					var equalsIndex = text.indexOf("=", attributeStartIndex);
					if (equalsIndex !== -1) {
						var endIndex = text.lastIndexOf("}");
						if (endIndex === text.length - 1) {
							token.attributeKey = text.substring(attributeStartIndex + 2, equalsIndex);
							token.attributeValue = text.substring(equalsIndex + 1, text.length - 1);
							token.text = text.substring(0, attributeStartIndex);
						}
					}
				}
			}
		});
		return tokens;
	};
}

function readFile(fd) {
	var readStat = fs.fstatSync(fd);
	var readBlockSize = readStat.blksize || 4096;
	var fileSize = readStat.size;
	var inBuffer = new Buffer(fileSize);
	var totalReadCount = 0;
	do {
		var length = Math.min(readBlockSize, fileSize - totalReadCount);
		var readCount = fs.readSync(fd, inBuffer, totalReadCount, length, null);
		if (!readCount) {
			break;
		}
		totalReadCount += readCount;
	} while (totalReadCount < fileSize);
	if (totalReadCount !== fileSize) {
		return null;
	}
	return inBuffer.toString("utf8", 0, inBuffer.length);
}

function writeFile(fd, buffer) {
	var totalWriteCount = 0;
	do {
		var length = Math.min(writeBlockSize, buffer.length - totalWriteCount);
		var writeCount = fs.writeSync(fd, buffer, totalWriteCount, length, null);
		if (!writeCount) {
			return false;
		}
		totalWriteCount += writeCount;
	} while (totalWriteCount < buffer.length);
	return true;
}

function replacementTok() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + this.token.depth
        + '>'
        + this.inline.output(this.token.text)
        + '</h'
        + this.token.depth
        + '>\n';
    }
    case 'code': {
      if (this.options.highlight) {
        var code = this.options.highlight(this.token.text, this.token.lang);
        if (code != null && code !== this.token.text) {
          this.token.escaped = true;
          this.token.text = code;
        }
      }

      if (!this.token.escaped) {
        this.token.text = escape(this.token.text, true);
      }

      return '<pre><code'
        + (this.token.lang
        ? ' class="'
        + this.options.langPrefix
        + this.token.lang
        + '"'
        : '')
        + '>'
        + this.token.text
        + '</code></pre>\n';
    }
    case 'table': {
      var body = ''
        , heading
        , i
        , row
        , cell
        , j;

      // header
      body += '<thead>\n<tr>\n';
      for (i = 0; i < this.token.header.length; i++) {
        heading = this.inline.output(this.token.header[i]);
        body += this.token.align[i]
          ? '<th align="' + this.token.align[i] + '">' + heading + '</th>\n'
          : '<th>' + heading + '</th>\n';
      }
      body += '</tr>\n</thead>\n';

      // body
      body += '<tbody>\n'
      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];
        body += '<tr>\n';
        for (j = 0; j < row.length; j++) {
          cell = this.inline.output(row[j]);
          body += this.token.align[j]
            ? '<td align="' + this.token.align[j] + '">' + cell + '</td>\n'
            : '<td>' + cell + '</td>\n';
        }
        body += '</tr>\n';
      }
      body += '</tbody>\n';

      return '<table>\n'
        + body
        + '</table>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = this.token.ordered ? 'ol' : 'ul'
        , body = '';

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
    }
    case 'paragraph': {
      return '<p>'
        + this.inline.output(this.token.text)
        + '</p>\n';
    }
    case 'text': {
      return '<p>'
        + this.parseText()
        + '</p>\n';
    }
  }
};
