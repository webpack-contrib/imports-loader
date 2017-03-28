var should = require("should");
var loader = require("../");

var HEADER = "/*** IMPORTS FROM imports-loader ***/\n";

describe("loader", function() {
	it("should import nested objects", function() {
		loader.call({
			query: "?abc.def.ghi=>1"
		}, "").should.be.eql(HEADER +
			"var abc = (abc || {});\n" +
			"abc.def = abc.def || {};\n" +
			"abc.def.ghi = 1;\n\n\n"
		);
	});

	it("should import multiple nested objects", function() {
		loader.call({
			query: "?abc.def.ghi=>1,foo.bar.baz=>2"
		}, "").should.be.eql(HEADER +
			// First import
			"var abc = (abc || {});\n" +
			"abc.def = abc.def || {};\n" +
			"abc.def.ghi = 1;\n" +
			// Second import
			"var foo = (foo || {});\n" +
			"foo.bar = foo.bar || {};\n" +
			"foo.bar.baz = 2;\n\n\n"
		);
	});
});
