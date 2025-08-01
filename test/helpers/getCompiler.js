import path from "node:path";

import { Volume, createFsFromVolume } from "memfs";
import webpack from "webpack";

export default (
  fixture,
  loaderOptions = {},
  config = {},
  disableLoader = false,
) => {
  const loaders = [];

  if (!disableLoader) {
    loaders.push({
      test: path.resolve(__dirname, "../fixtures", fixture),
      use: [
        {
          loader: path.resolve(__dirname, "../../src"),
          options: loaderOptions || {},
        },
      ],
    });
  }

  const fullConfig = {
    mode: "development",
    devtool: config.devtool || false,
    context: path.resolve(__dirname, "../fixtures"),
    entry: path.resolve(__dirname, "../fixtures", fixture),
    output: {
      path: path.resolve(__dirname, "../outputs"),
      filename: "[name].bundle.js",
      chunkFilename: "[name].chunk.js",
      library: "ImportsLoader",
      // libraryTarget: 'var',
    },
    module: {
      rules: loaders,
    },
    plugins: [],
    resolve: {
      alias: {
        // eslint-disable-next-line camelcase
        lib_1: path.resolve(__dirname, "../", "fixtures", "lib_1"),
        // eslint-disable-next-line camelcase
        lib_2: path.resolve(__dirname, "../", "fixtures", "lib_2"),
        // eslint-disable-next-line camelcase
        lib_3: path.resolve(__dirname, "../", "fixtures", "lib_3"),
        // eslint-disable-next-line camelcase
        lib_4: path.resolve(__dirname, "../", "fixtures", "lib_4"),
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
