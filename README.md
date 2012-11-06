# imports loader for webpack

## Usage

``` javascript
require("imports?page=../pages/mypage,jQuery,config=>{size:50}!./file.js");
// adds below code the the file's source:
//  var page = require("../pages/mypage");
//  var jQuery = require("jQuery");
//  var config = {size:50};
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)