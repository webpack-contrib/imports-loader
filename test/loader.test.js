import {
  compile,
  getCompiler,
  getErrors,
  getModuleSource,
  getWarnings,
} from './helpers';

describe('loader', () => {
  it.only('should set a variable', async () => {
    const compiler = getCompiler('some-library.js', {
      someVariable: '>1',
      anotherVariable: '>2',
      'someVariable.someProperty.someSubProperty': '>1',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
