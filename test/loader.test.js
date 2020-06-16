import path from 'path';

import {
  compile,
  getCompiler,
  getErrors,
  getModuleSource,
  getWarnings,
} from './helpers';

describe('loader', () => {
  it('should work with a string value', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'lib_1',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with an object value', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: 'lib_1',
        name: '$',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with array of strings', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['lib_1', 'lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with array of objects and strings', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'lib_1',
        {
          syntax: 'named',
          moduleName: 'lib_2',
          name: 'lib_2_name',
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with source maps when the "devtool" option is enabled', async () => {
    const compiler = getCompiler(
      'some-library.js',
      {},
      {
        devtool: 'source-map',
        module: {
          rules: [
            {
              test: /\.js$/i,
              rules: [
                {
                  loader: path.resolve(__dirname, '../src'),
                  options: { imports: 'lib_1' },
                },
                {
                  loader: 'babel-loader',
                },
              ],
            },
          ],
        },
      }
    );
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should not work with source maps when the "devtool" options are disabled', async () => {
    const compiler = getCompiler(
      'some-library.js',
      {},
      {
        devtool: false,
        module: {
          rules: [
            {
              test: /\.js$/i,
              rules: [
                {
                  loader: path.resolve(__dirname, '../src'),
                  options: { imports: 'lib_1' },
                },
                {
                  loader: 'babel-loader',
                },
              ],
            },
          ],
        },
      }
    );
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "default" imports without syntax', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'lib_1',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "default" imports with syntax', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'default lib_1',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "namespace" imports', async () => {
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "default" and "named" imports"', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          moduleName: './lib_2',
          name: 'lib2_default',
        },
        {
          syntax: 'named',
          moduleName: './lib_1',
          name: 'lib1_method',
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "default" and "namespace" imports"', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        {
          moduleName: './lib_2',
          name: 'lib2_default',
        },
        {
          syntax: 'namespace',
          moduleName: './lib_1',
          name: 'lib1_method',
        },
        {
          syntax: 'namespace',
          moduleName: './lib_2',
          name: 'lib2_method_1',
        },
        {
          syntax: 'namespace',
          moduleName: './lib_2',
          name: 'lib2_method_2',
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "side-effects" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effects',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "side-effects" and "default" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['side-effects lib_1', 'default lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "side-effects" and "named" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['side-effects lib_1', 'named lib_2 lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "side-effects" and "namespace" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['side-effects lib_1', 'namespace lib_2 lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with the "wrapper" option', async () => {
    const compiler = getCompiler('some-library.js', {
      wrapper: 'window',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with the "wrapper" options and arguments', async () => {
    const compiler = getCompiler('some-library.js', {
      wrapper: ['window', 'document'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with the "additionalCode" option', async () => {
    const compiler = getCompiler('some-library.js', {
      additionalCode: 'var someVariable = 1;',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "imports", "wrapper" and "additionalCode" options', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effects',
      },
      wrapper: 'window',
      additionalCode: 'var someVariable = 1;',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "multiple" CommonJS imports', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: {
        moduleName: './lib_1',
        name: '$',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with "single" CommonJS imports', async () => {
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple CommonJS imports', async () => {
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple CommonJS imports and union same', async () => {
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work "pure" CommonJS imports', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: {
        syntax: 'pure',
        moduleName: './lib_1',
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work "pure" and "single" CommonJS imports', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['pure lib_1', 'single lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work "pure" and "multiple" CommonJS imports', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['pure lib_1', 'multiple lib_2 lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with a string syntax using CommonJS', async () => {
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
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with a string syntax using ES modules', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'module',
      imports: [
        'default ./lib_1 $',
        'default ./lib_2 lib_2_all',
        'named ./lib_2 lib2_method_1',
        'named ./lib_2 lib2_method_2 lib_2_method_2_short',
        'default ./lib_3 lib_3_default',
        'namespace ./lib_3 lib_3_all',
        'side-effects ./lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with a string syntax using CommonJS modules', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'single ./lib_1 $',
        'single ./lib_2 lib_2_all',
        'multiple ./lib_2 lib2_method_1',
        'multiple ./lib_2 lib2_method_2 lib_2_method_2_short',
        'pure ./lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "default" imports and different names', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['default ./lib_2 lib_2', 'default ./lib_2 lib_3'],
    });

    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "named" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'named ./lib_2 lib_2',
        'named ./lib_2 lib_3 alias',
        'named ./lib_3 lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "named" imports from the one lib', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'named ./lib_2 lib_2',
        'named ./lib_2 lib_3 alias',
        'named ./lib_2 lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "namespace" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['namespace ./lib_2 lib_2', 'namespace ./lib_2 lib_3'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "side-effects" import', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['side-effects ./lib_2', 'side-effects ./lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "single" imports and different names', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['single ./lib_2 lib_2', 'single ./lib_2 lib_3'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "multiple" imports', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'multiple ./lib_2 lib_2',
        'multiple ./lib_2 lib_3 alias',
        'multiple ./lib_3 lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "multiple" imports from the one lib', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'multiple ./lib_2 lib_2',
        'multiple ./lib_2 lib_3 alias',
        'multiple ./lib_2 lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with multiple "pure" import', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['pure ./lib_2', 'pure ./lib_2'],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with all ES format syntaxes', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'default lib_1',
        'named lib_1 foo',
        'named lib_1 bar baz',
        'namespace lib_3 my_namespace',
        'side-effects lib_4',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with all CommonJS format syntaxes', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'single lib_1',
        'multiple lib_1 foo',
        'multiple lib_1 bar baz',
        'pure lib_3',
      ],
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "alias" can not be set using an object notation', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effects',
        alias: 'some_alias',
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "alias" can not be set using a string notation', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'side-effects ./lib_1 name some_alias',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "name" can not be used for an object notation', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: {
        moduleName: './lib_1',
        syntax: 'side-effects',
        name: 'some_name',
      },
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "name" can not be used for a string notation', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'side-effects ./lib_1 some_alias',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "name" do not exist using an object notation', async () => {
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

  it('should throw an error when "name" do not exist using a string notation', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: 'named ./lib_2.js',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "namespace" ca not be used in CommonJS using an object notation', async () => {
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

  it('should throw an error when "namespace" ca not be used in CommonJS using a string notation', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: 'namespace ./lib_4 namespace',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "single" ca not be used in ES module using an object notation', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'module',
      imports: [
        {
          moduleName: './lib_4',
          name: 'lib_4_all',
          syntax: 'single',
        },
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when "single" ca not be used in ES module using a string notation', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'module',
      imports: 'single ./lib_4 lib_4_all',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when invalid arguments for imports', async () => {
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

  it('should work with inline syntax', async () => {
    const compiler = getCompiler('inline.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with inline syntax #1', async () => {
    const compiler = getCompiler('inline2.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with inline syntax #2', async () => {
    const compiler = getCompiler('inline3.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw error on invalid inline syntax', async () => {
    const compiler = getCompiler('inline-broken.js', {}, {}, true);
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should work with a string value with spaces', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: '   lib_1   ',
    });
    const stats = await compile(compiler);

    expect(getModuleSource('./some-library.js', stats)).toMatchSnapshot(
      'module'
    );
    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error on the empty string', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: '      ',
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when no arguments for imports', async () => {
    const compiler = getCompiler('some-library.js', {});
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "default" format', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['default lib_1', 'default lib_1'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "named" format', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['named lib_1 foo', 'named lib_1 foo'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "namespace" format', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['namespace lib_1 foo', 'namespace lib_1 foo'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "single" format', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['single lib_1', 'single lib_1'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when multiple duplicate of names found in "multiple" format', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'multiple lib_1 lib1',
        'multiple lib_1 lib1',
        'multiple lib_1 lib2',
        'multiple lib_1 lib2',
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "named" format with other syntaxes', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'named lib_1 lib1',
        'named lib_1 lib1',
        'named lib_1 lib2',
        'named lib_1 lib2',
        'side-effects lib_2',
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of names found in "multiple" format with other syntaxes', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'multiple lib_1 lib1',
        'multiple lib_1 lib1',
        'multiple lib_1 lib2',
        'multiple lib_1 lib2',
        'pure lib_2',
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of aliases found in "named"', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: ['named lib_1 lib1 alias1', 'named lib_1 lib2 alias1'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of aliases found in "multiple"', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: ['multiple lib_1 lib1 alias1', 'multiple lib_1 lib2 alias1'],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of alias and name found in "named"', async () => {
    const compiler = getCompiler('some-library.js', {
      imports: [
        'named lib_1 lib1',
        'named lib_1 lib2 lib1',
        'named lib_1 lib3',
        'named lib_1 lib3 foo',
        'named lib_2 lib1',
        'named lib_3 toString',
        'named lib_3 toString',
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });

  it('should throw an error when duplicate of alias and name found in "multiple"', async () => {
    const compiler = getCompiler('some-library.js', {
      type: 'commonjs',
      imports: [
        'multiple lib_1 lib1',
        'multiple lib_1 lib2 lib1',
        'multiple lib_1 lib3',
        'multiple lib_1 lib3 foo',
        'multiple lib_2 lib1',
        'multiple lib_3 toString',
        'multiple lib_3 toString',
      ],
    });
    const stats = await compile(compiler);

    expect(getErrors(stats)).toMatchSnapshot('errors');
    expect(getWarnings(stats)).toMatchSnapshot('warnings');
  });
});
