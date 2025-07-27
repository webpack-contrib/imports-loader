<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![tests][tests]][tests-url]
[![cover][cover]][cover-url]
[![discussion][discussion]][discussion-url]
[![size][size]][size-url]

# imports-loader

The imports loader allows you to use modules that depend on specific global variables.

This is especially useful for third-party modules that rely on global variables like `$` or where `this` is expected to be the `window` object. The imports loader can add the necessary `require('whatever')` calls, so those modules work with webpack.

For further hints on compatibility issues, see the official webpack documentation on [Shimming](https://webpack.js.org/guides/shimming/).

> [!WARNING]
>
> By default, this loader generates ES module named syntax.

> [!WARNING]
>
> Be careful, existing imports (`import`/`require`) in the original code and importing new values can cause failure.

## Getting Started

To begin, you'll need to install `imports-loader`:

```console
npm install imports-loader --save-dev
```

or

```console
yarn add -D imports-loader
```

or

```console
pnpm add -D imports-loader
```

Given you have this file:

**example.js**

```js
$("img").doSomeAwesomeJqueryPluginStuff();
```

Then you can inject the `jquery` value into the module by configuring the `imports-loader` using two approaches.

### Inline

The `|` or `%20` (space) allow to separate the `syntax`, `moduleName`, `name` and `alias` of import.
The documentation and syntax examples can be read [here](#syntax).

> [!WARNING]
>
> `%20` represents a `space` in a query string, because you can't use spaces in URLs

```js
// Alternative syntax:
//
// import myLib from 'imports-loader?imports=default%20jquery%20$!./example.js';
//
// `%20` is space in a query string, equivalently `default jquery $`
import myLib from "imports-loader?imports=default|jquery|$!./example.js";
// Adds the following code to the beginning of example.js:
//
// import $ from "jquery";
//
// ...
// Code
// ...
```

```js
import myLib from "imports-loader?imports=default|jquery|$,angular!./example.js";
// `|` is separator in a query string, equivalently `default|jquery|$` and `angular`
// Adds the following code to the beginning of example.js:
//
// import $ from "jquery";
// import angular from "angular";
//
// ...
// Code
// ...
```

```js
import myLib from "imports-loader?imports=named|library|myMethod,angular!./example.js";
// `|` is separator in a query string, equivalently `named|library|myMethod` and `angular`
// Adds the following code to the beginning of example.js:
//
// import { myMethod } from "library";
// import angular from "angular";
//
// ...
// Code
// ...
```

```js
const myLib = require("imports-loader?type=commonjs&imports=single|jquery|$,angular!./example.js");
// `|` is separator in a query string, equivalently `single|jquery|$` and `angular`
// Adds the following code to the beginning of example.js:
//
// var $ = require("jquery");
// var angular = require("angular");
//
// ...
// Code
// ...
```

```js
const myLib = require("imports-loader?type=commonjs&imports=single|myLib|myMethod&wrapper=window&!./example.js");
// `|` is separator in a query string, equivalently `single|myLib|myMethod` and `angular`
// Adds the following code to the example.js:
//
// const myMethod = require('myLib');
//
// (function () {
// ...
// Code
// ...
// }.call(window));
```

```js
import myLib from "imports-loader?additionalCode=var%20myVariable%20=%20false;!./example.js";
// Adds the following code to the beginning of example.js:
//
// var myVariable = false;
//
// ...
// Code
// ...
```

### Using Configuration

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        // You can use `regexp`
        // test: /example\.js$/
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: [
                "default jquery $",
                "default lib_2 lib_2_default",
                "named lib_3 lib2_method_1",
                "named lib_3 lib2_method_2 lib_2_method_2_short",
                "namespace lib_4 my_namespace",
                "side-effects lib_5",
                {
                  syntax: "default",
                  moduleName: "angular",
                  name: "angular",
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

Generate output:

<!-- eslint-skip -->

```js
import angular from "angular";
import $ from "jquery";
import lib_2_default from "lib_2";
import { lib2_method_1, lib2_method_2 as lib_2_method_2_short } from "lib_3";
import * as my_namespace from "lib_4";
import "lib_5";
```

Finally, run `webpack` using the method you normally use (e.g., via CLI or an npm script).

## Options

- **[`type`](#type)**
- **[`imports`](#imports)**
- **[`wrapper`](#wrapper)**
- **[`additionalCode`](#additionalcode)**

### `type`

Type:

```ts
type type = string;
```

Default: `module`

Defines the format of generated exports.

Possible values:

- `commonjs` (CommonJS module syntax)
- `module` (ES module syntax).

#### `commonjs`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        loader: "imports-loader",
        options: {
          syntax: "default",
          type: "commonjs",
          imports: "Foo",
        },
      },
    ],
  },
};
```

Generate output:

```js
const Foo = require("Foo");

// ...
// Code
// ...
```

#### `module`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        loader: "imports-loader",
        options: {
          type: "module",
          imports: "Foo",
        },
      },
    ],
  },
};
```

Generate output:

```js
import Foo from "Foo";

// ...
// Code
// ...
```

### `imports`

Type:

```ts
type imports =
  | string
  | {
      syntax:
        | "default"
        | "named"
        | "namespace"
        | "side-effects"
        | "single"
        | "multiple"
        | "pure";
      moduleName: string;
      name: string;
      alias: string;
    }
  | (
      | string
      | {
          syntax:
            | "default"
            | "named"
            | "namespace"
            | "side-effects"
            | "single"
            | "multiple"
            | "pure";
          moduleName: string;
          name: string;
          alias: string;
        }
    )[];
```

Default: `undefined`

List of imports.

#### `string`

Allows to use a string to describe an export.

##### `Syntax`

The `|` or `%20` (space) allow to separate the `syntax`, `moduleName`, `name` and `alias` of import.

String syntax - `[[syntax] [moduleName] [name] [alias]]` or `[[syntax]|[moduleName]|[name]|[alias]]`, where:

- `[syntax]` (**may be omitted**):

  - if `type` is `module`- can be `default`, `named`, `namespace` or `side-effects`, the default value is `default`.
  - if `type` is `commonjs`- can be `single`, `multiple` or `pure`, the default value is `single`.

- `[moduleName]` - name of an imported module (**required**)
- `[name]` - name of an imported value (**required**)
- `[alias]` - alias of an imported value (**may be omitted**)

Examples:

If type `module`:

- `[Foo]` - generates `import Foo from "Foo";`.
- `[default Foo]` - generates `import Foo from "Foo";`.
- `[default ./my-lib Foo]` - generates `import Foo from "./my-lib";`.
- `[named Foo FooA]` - generates `import { FooA } from "Foo";`.
- `[named Foo FooA Bar]` - generates `import { FooA as Bar } from "Foo";`.
- `[namespace Foo FooA]` - generates `import * as FooA from "Foo";`.
- `[side-effects Foo]` - generates `import "Foo";`.

If type `commonjs`:

- `[Foo]` - generates `const Foo = require("Foo");`.
- `[single Foo]` - generates `const Foo = require("Foo");`.
- `[single ./my-lib Foo]` - generates `const Foo = require("./my-lib");`.
- `[multiple Foo FooA Bar]` - generates `const { FooA: Bar } = require("Foo");`.
- `[pure Foo]` - generates `require("Foo");`.

> [!WARNING]
>
> You need to set `type: "commonjs"` to use `single`, `multiple` and `pure` syntaxes.

> [!WARNING]
>
> Aliases can't be used together with `default`, `namespace`, `side-effects`, `single` and `pure` syntaxes.

###### Examples

###### ES Module Default Import

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("./path/to/example.js"),
        loader: "imports-loader",
        options: {
          imports: "default lib myName",
        },
      },
    ],
  },
};
```

Generate output:

```js
import myName from "lib";

// ...
// Code
// ...
```

###### CommonJS Single Import

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("./path/to/example.js"),
        loader: "imports-loader",
        options: {
          type: "commonjs",
          imports: "single lib myName",
        },
      },
    ],
  },
};
```

Generate output:

```js
const myName = require("lib");

// ...
// Code
// ...
```

#### `object`

Allows to use an object to describe an import.

Properties:

- `syntax`:

  - if `type` is `module`- can be `default`, `named`, `namespace` or `side-effects`
  - if `type` is `commonjs`- can be `single`, `multiple` or `pure`

- `moduleName` - name of an imported module (**required**)
- `name` - name of an imported value (**required**)
- `alias` - alias of an imported value (**may be omitted**)

> [!WARNING]
>
> Alias can't be used together with `default`, `namespace`, `side-effects`, `single` and `pure` syntaxes.

##### Examples

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                syntax: "named",
                moduleName: "lib_2",
                name: "lib2_method_2",
                alias: "lib_2_method_2_alias",
              },
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

```js
import { lib2_method_2 as lib_2_method_2_alias } from "lib_2";

// ...
// Code
// ...
```

#### `array`

Allow to specify multiple imports.
Each item can be either a [`string`](https://github.com/webpack-contrib/imports-loader#string) or an [`object`](https://github.com/webpack-contrib/imports-loader#object).

##### Examples

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: [
                {
                  moduleName: "angular",
                },
                {
                  syntax: "default",
                  moduleName: "jquery",
                  name: "$",
                },
                "default lib_2 lib_2_default",
                "named lib_2 lib2_method_1",
                "named lib_2 lib2_method_2 lib_2_method_2_alias",
                "namespace lib_3 lib_3_all",
                "side-effects lib_4",
              ],
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

<!-- eslint-skip -->

```js
import angular from "angular";
import $ from "jquery";
import lib_2_default from "lib_2";
import { lib2_method_1, lib2_method_2 as lib_2_method_2_alias } from "lib_2";
import * as lib_3_all from "lib_3";
import "lib_4";

// ...
// Code
// ...
```

### `wrapper`

Type:

```ts
type wrapper =
  | boolean
  | string
  | {
      thisArg: string;
      args: Record<string, string> | string[];
    };
```

Default: `undefined`

Closes the module code in a function with a given `thisArg` and `args` (`(function () { ... }).call();`).

> [!WARNING]
>
> Do not use this option if source code contains ES module import(s). It is intended for legacy or non-ESM compatible code.

#### `boolean`

Wraps the code in an IIFE (Immediately Invoked Function Expression) with default context.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              wrapper: true,
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

<!-- eslint-skip -->

```js
import $ from "jquery";

(function () {
  // ...
  // Code
  // ...
}).call();
```

#### `string`

Passes a custom thisArg to the .call() context.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              wrapper: "window",
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

<!-- eslint-skip -->

```js
import $ from "jquery";

(function () {
  // ...
  // Code
  // ...
}).call(globalThis);
```

#### `object`

Allows advanced control: specify the this context and custom arguments passed into the IIFE

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              wrapper: {
                thisArg: "window",
                args: ["myVariable", "myOtherVariable"],
              },
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

<!-- eslint-skip -->

```js
import $ from "jquery";

(function (myVariable, myOtherVariable) {
  // ...
  // Code
  // ...
}).call(globalThis, myVariable, myOtherVariable);
```

#### `object` with different parameter names

Allows remapping argument names in the function signature using a key-value object.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              wrapper: {
                thisArg: "window",
                args: {
                  myVariable: "var1",
                  myOtherVariable: "var2",
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

Generate output:

<!-- eslint-skip -->

```js
import $ from "jquery";

(function (var1, var2) {
  // ...
  // Code
  // ...
}).call(globalThis, myVariable, myOtherVariable);
```

### `additionalCode`

Type:

```ts
type additionalCode = string;
```

Default: `undefined`

Adds custom code as a preamble before the module's code.

##### Examples

###### Define custom variable

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              additionalCode: "var myVariable = false;",
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

```js
import $ from "jquery";

const myVariable = false;

// ...
// Code
// ...
```

###### Disable AMD Import Syntax

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: require.resolve("example.js"),
        use: [
          {
            loader: "imports-loader",
            options: {
              imports: {
                moduleName: "jquery",
                name: "$",
              },
              additionalCode:
                "var define = false; /* Disable AMD for misbehaving libraries */",
            },
          },
        ],
      },
    ],
  },
};
```

Generate output:

```js
import $ from "jquery";

const define = false; /* Disable AMD for misbehaving libraries */

// ...
// Code
// ...
```

## Contributing

We welcome contributions!
If you’re interested in helping improve this loader, please take a moment to read our contributing guidelines.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/imports-loader.svg
[npm-url]: https://www.npmjs.com/package/imports-loader
[node]: https://img.shields.io/node/v/imports-loader.svg
[node-url]: https://nodejs.org
[tests]: https://github.com/webpack-contrib/imports-loader/workflows/imports-loader/badge.svg
[tests-url]: https://github.com/webpack-contrib/imports-loader/actions
[cover]: https://codecov.io/gh/webpack-contrib/imports-loader/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/imports-loader
[discussion]: https://img.shields.io/github/discussions/webpack/webpack
[discussion-url]: https://github.com/webpack/webpack/discussions
[size]: https://packagephobia.now.sh/badge?p=imports-loader
[size-url]: https://packagephobia.now.sh/result?p=imports-loader
