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
	if(sourceMap) {
		var currentRequest = loaderUtils.getCurrentRequest(this);
		var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
		node.prepend(HEADER + imports.join("\n") + "\n\n");
		var result = node.toStringWithSourceMap({
			file: currentRequest
		});
		this.callback(null, result.code, result.map.toJSON());
		return;
	}
	return HEADER + imports.join("\n") + "\n\n" + content;
}