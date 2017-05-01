import loader from '../src';

// TODO: @d3viant0ne - Kill eval() with fire and deal with the rest of the tests

// const run = function run(query) {
//   const context = {
//     query: `?${query}`,
//   };
//   const result = loader.call(context);
//   return result;
// };

describe('loader', () => {
  test('sets a header so the developer can see where imports-loader is being applied', () => {
    const generatedCode = loader.call({ query: '?someVariable=>1' });
    expect(generatedCode.indexOf('/*** IMPORTS FROM imports-loader ***/\n')).toBe(0);
  });

  // it("can set a variable", () => {
  //   expect(run('someVariable=>1')).toEqual('/*** IMPORTS FROM imports-loader ***/ var someVariable = 1;');  //.toBe(1);
  //   console.log(run('someVariable=>1'));
  //   const generatedCode = loader.call({ query: '?someVariable=>1' });
  //   eval(generatedCode);
  //   let result = generatedCode.someVariable;
  //   console.log(generatedCode);
  //   expect(generatedCode.indexOf('someVariable')).toBe(0);
  //   expect(result).toBe(1);
  //   someVariable.should.be.eql(1);
  // });

  // it("can set multiple values", () => {
  //   const generatedCode = loader.call({ query: "?someVariable=>1,anotherVariable=>2" });
  //   eval(generatedCode);

  //   someVariable.should.be.eql(1);
  //   anotherVariable.should.be.eql(2);
  // });

  // it("can set a nested variable", () => {
  //   const generatedCode = loader.call({ query: "?someVariable.someProperty.someSubProperty=>1" });
  //   eval(generatedCode);

  //   someVariable.someProperty.someSubProperty.should.be.eql(1);
  // });

  // describe("loading properties onto an existing variable", () => {
  //   it("preserves the other original properties", () => {
  //     const generatedCode = loader.call({ query: "?someVariable.someProperty=>1" });
  //     const someVariable = { existingProperty: 123 };

  //     eval(generatedCode);

  //     someVariable.existingProperty.should.be.eql(123);
  //   });

  //   it("sets the new properties", () => {
  //     const generatedCode = loader.call({ query: "?someVariable.someProperty=>1" });
  //     const someVariable = { existingProperty: 123 };

  //     eval(generatedCode);

  //     someVariable.someProperty.should.be.eql(1);
  //   });
  // });

  // describe("loading sub-properties onto an existing property", () => {
  //   it("preserves the other original properties", () => {
  //     const generatedCode = loader.call({ query: "?someVariable.existingProperty.someSubProperty=>1" });
  //     const someVariable = { existingProperty: { existingSubProperty: 123 } };

  //     eval(generatedCode);

  //     someVariable.existingProperty.existingSubProperty.should.be.eql(123);
  //   });

  //   it("sets the new sub-properties", () => {
  //     const generatedCode = loader.call({ query: "?someVariable.existingProperty.someSubProperty=>1" });
  //     const someVariable = { existingProperty: { existingSubProperty: 123 } };

  //     eval(generatedCode);

  //     someVariable.existingProperty.someSubProperty.should.be.eql(1);
  //   });
  // });
});
