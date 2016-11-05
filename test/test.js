var should = require("should");
var loader = require("../");

var HEADER = "/*** IMPORTS FROM imports-loader ***/\n";

describe("loader", function() {
	it("should import nested objects", function() {
		loader.call({
			query: "?abc.def.ghi=>1"
		}, "").should.be.eql(HEADER +
			"var abc = {};\n" +
			"abc.def = {};\n" +
			"abc.def.ghi = 1;\n\n\n"
		);
	});

	it("should import multiple nested objects", function() {
		loader.call({
			query: "?abc.def.ghi=>1,foo.bar.baz=>2"
		}, "").should.be.eql(HEADER +
			// First import
			"var abc = {};\n" +
			"abc.def = {};\n" +
			"abc.def.ghi = 1;\n" +
			// Second import
			"var foo = {};\n" +
			"foo.bar = {};\n" +
			"foo.bar.baz = 2;\n\n\n"
		);
	});

	it("should not redeclare window imports", function() {
		loader.call({
			query: "?window.jQuery=jquery"
		}, "").should.be.eql(HEADER +
			"window = (window || {});\n" +
			'window.jQuery = require("jquery");\n\n\n'
		);
	});

	it("should not redeclare window for muntiple imports", function() {
		loader.call({
			query: "?window.jQuery=jquery,window._=lodash"
		}, "").should.be.eql(HEADER +
			// First import
			"window = (window || {});\n" +
			'window.jQuery = require("jquery");\n' +
			// Second import
			"window = (window || {});\n" +
			'window._ = require("lodash");\n\n\n'
		);
	});
});
