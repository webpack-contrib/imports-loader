import {
  compile,
  getCompiler,
  getErrors,
  getModuleSource,
  getWarnings,
} from './helpers';

describe('loader', () => {
  it('should require when import option is string', async () => {
    const compiler = getCompiler('some-library.js', {
      import: 'lib_1',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when import option is object', async () => {
    const compiler = getCompiler('some-library.js', {
      import: {
        moduleName: './lib_1',
        names: '$',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when import option is filePath', async () => {
    const compiler = getCompiler('some-library.js', {
      import: {
        moduleName: './lib_1',
        names: '$',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when import option is array', async () => {
    const compiler = getCompiler('some-library.js', {
      import: ['lib_1', 'lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when import-default', async () => {
    const compiler = getCompiler('some-library.js', {
      import: [
        'lib_1',
        {
          moduleName: './lib_2.js',
          names: {
            name: 'lib_2',
            default: true,
          },
        },
        {
          moduleName: './lib_3.js',
          names: [
            {
              name: 'defaultExport',
              default: true,
            },
            {
              name: 'lib_3_method',
              alias: 'method',
            },
          ],
        },
        {
          moduleName: './lib_4',
          names: [
            {
              name: 'lib_4',
              default: true,
            },
            {
              alias: 'lib_4_all',
              nameSpace: true,
            },
          ],
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when name-space-import', async () => {
    const compiler = getCompiler('some-library.js', {
      import: [
        {
          moduleName: './lib_1',
          names: [
            {
              alias: 'lib_1_all',
              nameSpace: true,
            },
          ],
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when named-imports', async () => {
    const compiler = getCompiler('some-library.js', {
      import: [
        {
          moduleName: './lib_1',
          names: [
            {
              name: 'lib1_method',
            },
          ],
        },
        {
          moduleName: './lib_2',
          names: [
            {
              name: 'lib2_method_1',
            },
            {
              name: 'lib2_method_2',
              alias: 'lib_2_method_2_short',
            },
          ],
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should require when import-side-effect', async () => {
    const compiler = getCompiler('some-library.js', {
      import: {
        moduleName: './lib_1',
        names: false,
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work wrapper and additionalCode option', async () => {
    const compiler = getCompiler('some-library.js', {
      wrapper: 'windows',
      additionalCode: 'var someVariable = 1;',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(stats.compilation.errors).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
