/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils");
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var HEADER = "/*** IMPORTS FROM imports-loader ***/\n";
module.exports = function(content, sourceMap) {
	if(this.cacheable) this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	var imports = [];
	var postfixes = [];
	Object.keys(query).forEach(function(name) {
		var value;
		var values = [];
		if(typeof query[name] == "string" && query[name].substr(0, 1) == ">") {
			value = query[name].substr(1);
		} else {
			var mod = name;
			if(typeof query[name] === "string") {
				mod = query[name];
			} else if (Array.isArray(query[name])) {
				query[name].forEach(function(el) {
					values.push("require(" + JSON.stringify(el) + ")");
				})
			}
			value = "require(" + JSON.stringify(mod) + ")";
		}
		if(name === "this") {
			imports.push("(function() {");
			postfixes.unshift("}.call(" + value + "));");
		} else if (values.length) {
			imports.push("var " + name + " = [];")
			values.forEach(function(val) {
				imports.push(name + ".push(" + val + ");");
			})
		} else {
			imports.push("var " + name + " = " + value + ";");
		}
	});
	var prefix = HEADER + imports.join("\n") + "\n\n";
	var postfix = "\n" + postfixes.join("\n");
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
