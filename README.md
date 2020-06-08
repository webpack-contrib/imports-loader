<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# Imports Loader

The imports loader allows you to use modules that depend on specific global variables.

This is useful for third-party modules that rely on global variables like `$` or `this` being the `window` object. The imports loader can add the necessary `require('whatever')` calls, so those modules work with webpack.

## Getting Started

To begin, you'll need to install `copy-webpack-plugin`:

```console
$ npm install imports-loader
```

Given you have this file `example.js`

```javascript
$('img').doSomeAwesomeJqueryPluginStuff();
```

then you can inject the `jquery` variable into the module by configuring the imports-loader like this:

**index.js**

```js
require('imports-loader?$=jquery!./example.js');
```

This simply prepends `import jquery from "jquery";` to `example.js`.

**index.js**

```js
require(`imports-loader?imports[]=jquery&imports[]=angular!./example.js`);
```

Result:

```js
import jquery from 'jquery';
import angular from 'angular';
// code form example.js
```

**index.js**

```js
require(`imports-loader?wrapper[]=window&wrapper[]=document!./example.js`);
```

Result:

```js
(function () {
  // code from example.js
}.call(window, document));
```

To configure imports, use `webpack.config.js`:

## Options

The loader's signature:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                type: 'commonjs',
                moduleName: 'jquery',
                list: '$',
              },
              wrapper: {
                call: 'window',
              },
              additionalCode: 'var someVariable = 1;',
            },
          },
        ],
      },
    ],
  },
};
```

### Imports

Type: `String|Object|Array`
Default: `undefined`

- `String`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: 'jquery',
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import jquery from "jquery";`.

- `Array`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: [
                'angular',
                {
                  moduleName: 'jquery',
                  list: { name: '$', type: 'default' },
                },
              ],
            },
          },
        ],
      },
    ],
  },
};
```

Result:

```js
import angular from 'angular';
import $ from 'jquery';
```

- `Object`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'jquery',
                list: { name: '$', type: 'default' },
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import $ from "jquery";`.

##### Type

Type: `String`
Default: `module`

The type of the module to import (`import` or `require`).

Possible values:

- `module`,
- `commonjs`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                type: 'commonjs',
                moduleName: 'jquery',
                list: '$',
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `var $ = require("jquery");`

##### ModuleName

Type: `String`
Default: `undefined`

The name of the module to import (`jquery`, `lodash`, `./example-file.js`).

##### List

Type: `String|Boolean|Object|Array`
Default: `undefined`

Сonfigures import string.

- `Boolean`

Lets you make a namespace import or pure require

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'some-module',
                list: false,
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import "some-module";`

- `String`

Reduced to the object `{name: passedValue, type: 'default'}`

- `Array`

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'some-module',
                list: [
                  'nameDefaultImport',
                  {
                    name: 'method_1',
                  },
                  {
                    name: 'method_2',
                    alias: 'method_2_alias',
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import nameDefaultImport, { method_1, method_2 as method_2_alias } from "some-module"`.

- `Object`

###### name

Type: `String`
Default: `undefined`

Export name.

`import { name as alias } from "some-module"`.
`import { name } from "some-module"`.

###### alias

Type: `String`
Default: `undefined`

Alias for export name.

`import { name as alias } from "some-module"`.

###### type

Type: `String`
Default: `undefined`

Type export name

Possible values:

- `default`,
- `namespace`

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'some-module',
                list: {
                  name: 'all',
                  type: 'default',
                },
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import all from "some-module"`.

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'some-module',
                list: {
                  name: 'all',
                  type: 'namespace',
                },
              },
            },
          },
        ],
      },
    ],
  },
};
```

Result: `import * as all from "some-module"`.

### wrapper

Type: `String|Array`
Default: `undefined`

Closes the module code in a function with a given `this` (`(function () { ... }).call(window);`).

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'jquery',
                list: '$',
              },
              wrapper: ['window', 'document'],
            },
          },
        ],
      },
    ],
  },
};
```

Result:

```js
import $ from 'jquery';

(function () {
  // code from example.js
}.call(window, document));
```

### additionalCode

Type: `String`
Default: `undefined`

Adds custom code.

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve('example.js'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: {
                moduleName: 'jquery',
                list: '$',
              },
              additionalCode: 'var someVariable = 1;',
            },
          },
        ],
      },
    ],
  },
};
```

Result:

```js
import $ from 'jquery';
var someVariable = 1;

// code from example.js
```

For further hints on compatibility issues, check out [Shimming Modules](https://webpack.js.org/guides/shimming/) of the official docs.

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/166921?v=3&s=150">
        </br>
        <a href="https://github.com/bebraw">Juho Vepsäläinen</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars2.githubusercontent.com/u/8420490?v=3&s=150">
        </br>
        <a href="https://github.com/d3viant0ne">Joshua Wiens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/533616?v=3&s=150">
        </br>
        <a href="https://github.com/SpaceK33z">Kees Kluskens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/3408176?v=3&s=150">
        </br>
        <a href="https://github.com/TheLarkInn">Sean Larkin</a>
      </td>
    </tr>
  <tbody>
</table>

[npm]: https://img.shields.io/npm/v/imports-loader.svg
[npm-url]: https://www.npmjs.com/package/imports-loader
[node]: https://img.shields.io/node/v/imports-loader.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/webpack-contrib/imports-loader.svg
[deps-url]: https://david-dm.org/webpack-contrib/imports-loader
[tests]: https://github.com/webpack-contrib/imports-loader/workflows/imports-loader/badge.svg
[tests-url]: https://github.com/webpack-contrib/imports-loader/actions
[cover]: https://codecov.io/gh/webpack-contrib/imports-loader/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/imports-loader
[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack
[size]: https://packagephobia.now.sh/badge?p=imports-loader
[size-url]: https://packagephobia.now.sh/result?p=imports-loader
