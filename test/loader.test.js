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
        name: '$',
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
          syntax: 'default',
          moduleName: './lib_2.js',
          name: 'lib_2',
        },
        {
          syntax: 'default',
          moduleName: './lib_3.js',
          name: 'defaultExport',
        },
        {
          syntax: 'named',
          moduleName: './lib_3.js',
          name: 'lib_3_method',
          alias: 'method',
        },
        {
          syntax: 'default',
          moduleName: './lib_4',
          name: 'lib_4',
        },
        {
          syntax: 'namespace',
          moduleName: './lib_4',
          name: 'lib_4_all',
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
          name: 'lib_1_all',
          syntax: 'namespace',
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
          syntax: 'named',
          moduleName: './lib_1',
          name: 'lib1_method',
        },
        {
          moduleName: './lib_2',
          name: 'lib2_default',
        },
        {
          syntax: 'named',
          moduleName: './lib_2',
          name: 'lib2_method_1',
        },
        {
          syntax: 'named',
          moduleName: './lib_2',
          name: 'lib2_method_2',
          alias: 'lib_2_method_2_short',
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
        syntax: 'side-effect',
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
        syntax: 'side-effect',
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
      type: 'commonjs',
      imports: {
        moduleName: './lib_1',
        name: '$',
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
      type: 'commonjs',
      imports: {
        moduleName: './lib_1',
        name: '$',
        syntax: 'single',
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
      type: 'commonjs',
      imports: [
        {
          syntax: 'multiple',
          moduleName: './lib_2',
          name: 'lib2_method_1',
        },
        {
          syntax: 'multiple',
          moduleName: './lib_2',
          name: 'lib2_method_2',
          alias: 'lib_2_method_2_short',
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
      type: 'commonjs',
      imports: [
        {
          moduleName: './lib_1',
          name: '$',
        },
        {
          moduleName: './lib_2',
          name: 'lib_2_all',
        },
        {
          syntax: 'multiple',
          moduleName: './lib_2',
          name: 'lib2_method_1',
        },
        {
          syntax: 'multiple',
          moduleName: './lib_2',
          name: 'lib2_method_2',
          alias: 'lib_2_method_2_short',
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
      type: 'commonjs',
      imports: {
        syntax: 'pure',
        moduleName: './lib_1',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work string syntax when commonjs type', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'single ./lib_1 $',
        'single ./lib_2 lib_2_all',
        'multiple ./lib_2 lib2_method_1',
        'multiple ./lib_2 lib2_method_2 lib_2_method_2_short',
        'pure ./lib_3',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work string syntax when module type', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'default ./lib_1 $',
        'default ./lib_2 lib_2_all',
        'named ./lib_2 lib2_method_1',
        'named ./lib_2 lib2_method_2 lib_2_method_2_short',
        'default ./lib_3 lib_3_defaul',
        'namespace ./lib_3 lib_3_all',
        'side-effect ./lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when alias don`t need', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effect',
        alias: 'some_alias',
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when alias don`t need', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effect',
        name: 'some_name',
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when skipped name to import-named', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_2.js',
        syntax: 'named',
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when try namespace import to commonjs', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        {
          moduleName: './lib_4',
          name: 'lib_4_all',
          syntax: 'namespace',
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
          alias: 'lib_2_method_2_short',
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when multiple default import', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['default ./lib_2 lib_2', 'default ./lib_2 lib_3'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when multiple namespace import', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['namespace ./lib_2 lib_2', 'namespace ./lib_2 lib_3'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error when multiple side-effect import', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['side-effect ./lib_2', 'side-effect ./lib_2'],
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

  it('should work inline 1', async () => {
    const compiler = getCompiler('inline.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work inline 2', async () => {
    const compiler = getCompiler('inline2.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work inline 3', async () => {
    const compiler = getCompiler('inline3.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'result'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should emit error inline', async () => {
    const compiler = getCompiler('inline-broken.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
