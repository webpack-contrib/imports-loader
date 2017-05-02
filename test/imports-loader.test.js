/* eslint-disable no-eval */
import ImportsLoader from '../src';

const run = function run(query) {
  const context = {
    query: `?${query}`,
  };
  const result = ImportsLoader.call(context);
  return result;
};

describe('imports-loader', () => {
  test('sets a header so the developer can see where imports-loader is being applied', () => {
    const generatedCode = ImportsLoader.call({ query: '?someVariable=>1' });
    expect(generatedCode.indexOf('/*** IMPORTS FROM imports-loader ***/\n')).toBe(0);
  });

  test('properly sets a variable', () => {
    expect(run('someVariable=>1')).toEqual('/*** IMPORTS FROM imports-loader ***/\nvar someVariable = 1;\n\n\n');
  });

  test('properly sets multiple variables', () => {
    expect(run('someVariable=>1,anotherVariable=>2')).toEqual('/*** IMPORTS FROM imports-loader ***/\nvar someVariable = 1;\nvar anotherVariable = 2;\n\n\n');
  });

  // test('properly sets a nested variable', () => {
  //   const generatedCode = run('someVariable.someProperty.someSubProperty=>1');
  //   const someVariable = { };
  //   eval(generatedCode);

  //   expect(someVariable.someProperty.someSubProperty).toEqual(1);
  // });

  describe('loading properties onto an existing variable', () => {
    test('preserves the other original properties', () => {
      const generatedCode = run('someVariable.someProperty=>1');
      const someVariable = { existingProperty: 123 };

      eval(generatedCode);

      expect(someVariable.existingProperty).toEqual(123);
    });

    // test('properly sets new properties', () => {
    //   const generatedCode = run('someVariable.someProperty=>1');
    //   const someVariable = { existingProperty: 123 };

    //   eval(generatedCode);

    //   expect(someVariable.someProperty).toEqual(1);
    // });
  });

  describe('loading sub-properties onto an existing property', () => {
    test('preserves the other original properties', () => {
      const generatedCode = run('someVariable.existingProperty.someSubProperty=>1');
      const someVariable = { existingProperty: { existingSubProperty: 123 } };

      eval(generatedCode);

      expect(someVariable.existingProperty.existingSubProperty).toEqual(123);
    });

    // test('properly sets the new sub-properties', () => {
    //   const generatedCode = run('someVariable.existingProperty.someSubProperty=>1');
    //   const someVariable = { existingProperty: { existingSubProperty: 123 } };

    //   eval(generatedCode);

    //   expect(someVariable.existingProperty.someSubProperty).toEqual(1);
    // });
  });
});
