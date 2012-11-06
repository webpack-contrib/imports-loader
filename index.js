/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils");
module.exports = function(content) {
	if(this.cacheable) this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	var imports = [];
	Object.keys(query).forEach(function(name) {
		if(typeof query[name] == "string" && query[name].substr(0, 1) == ">") {
			return imports.push("var " + name + " = " + query[name].substr(1) + ";");
		}
		var mod = name;
		if(typeof query[name] == "string") {
			mod = query[name];
		}
		imports.push("var " + name + " = require(" + JSON.stringify(mod) + ");");
	});
	return "/*** IMPORTS FROM imports-loader ***/\n" + imports.join("\n") + "\n\n" + content;
}