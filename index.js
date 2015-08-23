/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
var fs = require("fs");
var loaderUtils = require("loader-utils");
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var HEADER = "/*** IMPORTS FROM imports-loader ***/\n";
module.exports = function(content, sourceMap) {
	if(this.cacheable) this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	var imports = [];
	var postfixes = [];
	var parsedResourcePath = path.parse(this.resourcePath);
	Object.keys(query).forEach(function(name) {
		var value;
		if(typeof query[name] == "string" && query[name].substr(0, 1) == ">") {
			value = query[name].substr(1);
		} else {
			var mod = name;
			if(typeof query[name] === "string") {
				mod = query[name]
					.replace("{name}", parsedResourcePath.name)
					.replace("{ext}", parsedResourcePath.ext);
			}
			var optionalMod = /^\[(.*)]$/.exec(mod);
			if(optionalMod){
				mod = optionalMod[1];
				var moduleAbsolutePath = path.resolve(parsedResourcePath.dir, mod);
				if(!fs.existsSync(moduleAbsolutePath)){
					return;
				}
			}
			value = "require(" + JSON.stringify(mod) + ")";
		}
		if(name === "this") {
			imports.push("(function() {");
			postfixes.unshift("}.call(" + value + "));");
		} else if(name === "null") {
			imports.push(value + ";");
		} else {
			imports.push("var " + name + " = " + value + ";");
		}
	});
	var prefix = HEADER + imports.join("\n") + "\n\n";
	var postfix = postfixes.join("\n");
	if(sourceMap) {
		var currentRequest = loaderUtils.getCurrentRequest(this);
		var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
		node.prepend(prefix);
		node.add(postfix);
		var result = node.toStringWithSourceMap({
			file: currentRequest
		});
		this.callback(null, result.code, result.map.toJSON());
		return;
	}
	return prefix + content + postfix;
}