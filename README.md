# imports loader for webpack

Can be used to inject variables into the scope of a module. This is especially useful if third-party modules are relying on global variables like `$` or `this` being the `window` object.

## Installation

```
npm install imports-loader
```

## Usage

Given you have this file `example.js`

```javascript
$("img").doSomeAwesomeJqueryPluginStuff();
```

then you can inject the `$` variable into the module by configuring the imports-loader like this:

``` javascript
require("imports?$=jquery!./example.js");
```

This simply prepends `var $ = require("jquery");` to `example.js`.

### Syntax

Query value | Equals
------------|-------
`angular` | `var angular = require("angular");`
`$=jquery` | `var $ = require("jquery");`
`define=>false` | `var define = false;`
`config=>{size:50}` | `var config = {size:50};`
`this=>window` | `(function () { ... }).call(window);`
`null=./index.css` | `require("./index.css");`
`null=[./index.css]` | `require("./index.css");`<br>(only added if `index.css` exists in processed file's directory)
`css=./{name}{ext}.css` | `var css = require("./filename.jsx.css");`
`css=[./{name}{ext}.css]` | `var css = require("./filename.jsx.css");`<br>(only added if `filename.jsx.css` exists in processed file's directory)

### Multiple values

Multiple values are separated by comma `,`:

```javascript
require("imports?$=jquery,null=[./index.css],angular,config=>{size:50}!./file.js");
```

### Optional modules

Module is considered optional if it is surrounded by square brackets `[ ]`:

```javascript
require("imports?null=[./index.css]!./file.js");
```

The loader checks if the processed file's dir path and the future imported module name are resolved to an existing file.

If they are, the require is added (without the square brackets), otherwise it isn't.

### webpack.config.js

As always, you should rather configure this in your `webpack.config.js`:

```javascript
// ./webpack.config.js

module.exports = {
    ...
    module: {
        loaders: [
            {
                test: require.resolve("some-module")
                loader: "imports?this=>window"
            }
        ]
};
```

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

## Typical use-cases

### jQuery plugins

`imports?$=jquery`

### Custom Angular modules

`imports?angular`

### Disable AMD

There are many modules that check for a `define` function before using CommonJS. Since webpack is capable of both, they default to AMD in this case, which can be a problem if the implementation is quirky.

Then you can easily disable the AMD path by writing

```javascript
imports?define=>false
```

For further hints on compatibility issues, check out [Shimming Modules](http://webpack.github.io/docs/shimming-modules.html) of the official docs.

### Add optional stylesheets for every module

Instead of writing `require('modulename.less')` at the top of every file, simply add a `jsx` loader like this:

```javascript
loaders: [
  {test: /\.jsx?$/, loaders: ['imports?null=[./{name}.less]', 'react-hot', 'babel'], exclude: /node_modules/},
  {test: /\.less$/, loader: 'style!css!less'}
]
```

And every `less` file that has the same filename as of a `jsx` file would be loaded as well.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
