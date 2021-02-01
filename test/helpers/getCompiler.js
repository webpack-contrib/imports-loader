import path from 'path';

import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

export default (
  fixture,
  loaderOptions = {},
  config = {},
  disableLoader = false
) => {
  const loaders = [];

  if (!disableLoader) {
    loaders.push({
      test: path.resolve(__dirname, '../fixtures', fixture),
      use: [
        {
          loader: path.resolve(__dirname, '../../src'),
          options: loaderOptions || {},
        },
      ],
    });
  }

  const fullConfig = {
    mode: 'development',
    devtool: config.devtool || false,
    context: path.resolve(__dirname, '../fixtures'),
    entry: path.resolve(__dirname, '../fixtures', fixture),
    output: {
      path: path.resolve(__dirname, '../outputs'),
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      library: 'ImportsLoader',
      // libraryTarget: 'var',
    },
    module: {
      rules: loaders,
    },
    plugins: [],
    resolve: {
      alias: {
        lib_1: path.resolve(__dirname, '../', 'fixtures', 'lib_1'),
        lib_2: path.resolve(__dirname, '../', 'fixtures', 'lib_2'),
        lib_3: path.resolve(__dirname, '../', 'fixtures', 'lib_3'),
        lib_4: path.resolve(__dirname, '../', 'fixtures', 'lib_4'),
      },
    },
    ...config,
  };

  const compiler = webpack(fullConfig);

  if (!config.outputFileSystem) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
  }

  return compiler;
};
