# imports loader for webpack

This is the fork of original https://github.com/webpack/imports-loader repository. The only difference is that it fixes https://github.com/webpack/imports-loader/issues/5 issue.

## Installation

```
npm install @malykhinvi/imports-loader
```

## Usage

Given you have this file `example.js`

```javascript
$("img").doSomeAwesomeJqueryPluginStuff();
```

then you can inject the `$` variable into the module by configuring the imports-loader like this:

``` javascript
require("@malykhinvi/imports-loader?$=jquery!./example.js");
```

This simply prepends `var $ = require("jquery");` to `example.js`.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
