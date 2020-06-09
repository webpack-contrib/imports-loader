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
      imports: 'lib_1',
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
      imports: {
        moduleName: './lib_1',
        list: '$',
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
      imports: {
        moduleName: './lib_1',
        list: '$',
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
      imports: ['lib_1', 'lib_2'],
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
      imports: [
        'lib_1',
        {
          moduleName: './lib_2.js',
          list: {
            name: 'lib_2',
            type: 'default',
          },
        },
        {
          moduleName: './lib_3.js',
          list: [
            {
              name: 'defaultExport',
              type: 'default',
            },
            {
              name: 'lib_3_method',
              alias: 'method',
            },
          ],
        },
        {
          moduleName: './lib_4',
          list: [
            {
              name: 'lib_4',
              type: 'default',
            },
            {
              name: 'lib_4_all',
              type: 'namespace',
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
      imports: [
        {
          moduleName: './lib_1',
          list: [
            {
              name: 'lib_1_all',
              type: 'namespace',
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
      imports: [
        {
          moduleName: './lib_1',
          list: [
            {
              name: 'lib1_method',
            },
          ],
        },
        {
          moduleName: './lib_2',
          list: [
            'lib2_default',
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
      imports: {
        moduleName: './lib_1',
        list: false,
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work wrapper', async () => {
    const compiler = getCompiler('some-library.js', {
      wrapper: 'window',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work wrapper array', async () => {
    const compiler = getCompiler('some-library.js', {
      wrapper: ['window', 'document'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work additionalCode option', async () => {
    const compiler = getCompiler('some-library.js', {
      additionalCode: 'var someVariable = 1;',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work import, wrapper and additionalCode option', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        list: false,
      },
      wrapper: 'window',
      additionalCode: 'var someVariable = 1;',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work require', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        type: 'commonjs',
        moduleName: './lib_1',
        list: '$',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work require default', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        type: 'commonjs',
        moduleName: './lib_1',
        list: {
          name: '$',
          type: 'default',
        },
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work destructuring require', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          type: 'commonjs',
          moduleName: './lib_2',
          list: [
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

  it('should work few require', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          type: 'commonjs',
          moduleName: './lib_1',
          list: '$',
        },
        {
          type: 'commonjs',
          moduleName: './lib_2',
          list: [
            'lib_2_all',
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

  it('should work pure require', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        type: 'commonjs',
        moduleName: './lib_1',
        list: false,
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when skipped name to import-default', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_2.js',
        list: {
          type: 'default',
        },
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when try namespace import to commonjs', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          type: 'commonjs',
          moduleName: './lib_4',
          list: [
            {
              name: 'lib_4_all',
              type: 'namespace',
            },
          ],
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when invalid arguments for import', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          moduleName: './lib_2',
          list: [
            {
              alias: 'lib_2_method_2_short',
            },
          ],
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when not arguments for import', async () => {
    const compiler = getCompiler('some-library.js', {});
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
