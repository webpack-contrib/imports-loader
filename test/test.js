var should = require("should");
var loader = require("../");

describe("loader", function() {
	it("sets a header so the developer can see where imports-loader is being applied", function(){
		var generatedCode = loader.call({ query: "?someVariable=>1" });
		generatedCode.indexOf("/*** IMPORTS FROM imports-loader ***/\n").should.be.eql(0);
	});

	it("can set a variable", function(){
		var generatedCode = loader.call({ query: "?someVariable=>1" });
		eval(generatedCode);;

		someVariable.should.be.eql(1);
	});

	it("can set multiple values", function(){
		var generatedCode = loader.call({ query: "?someVariable=>1,anotherVariable=>2" });
		eval(generatedCode);;

		someVariable.should.be.eql(1);
		anotherVariable.should.be.eql(2);
	});

	it("can set a nested variable", function(){
		var generatedCode = loader.call({ query: "?someVariable.someProperty.someSubProperty=>1" });
		eval(generatedCode);;

		someVariable.someProperty.someSubProperty.should.be.eql(1);
	});

	describe("loading properties onto an existing variable", function(){
		it("preserves the other original properties", function(){
			var generatedCode = loader.call({ query: "?someVariable.someProperty=>1" });
			var someVariable = { existingProperty: 123 }

			eval(generatedCode);;

			someVariable.existingProperty.should.be.eql(123);
		});

		it("sets the new properties", function(){
			var generatedCode = loader.call({ query: "?someVariable.someProperty=>1" });
			var someVariable = { existingProperty: 123 }

			eval(generatedCode);;

			someVariable.someProperty.should.be.eql(1);
		});
	});

	describe("loading sub-properties onto an existing property", function(){
		it("preserves the other original properties", function(){
			var generatedCode = loader.call({ query: "?someVariable.existingProperty.someSubProperty=>1" });
			var someVariable = { existingProperty: { existingSubProperty: 123 } }

			eval(generatedCode);;

			someVariable.existingProperty.existingSubProperty.should.be.eql(123);
		});

		it("sets the new sub-properties", function(){
			var generatedCode = loader.call({ query: "?someVariable.existingProperty.someSubProperty=>1" });
			var someVariable = { existingProperty: { existingSubProperty: 123 } }

			eval(generatedCode);;

			someVariable.existingProperty.someSubProperty.should.be.eql(1);
		});
	});
});
