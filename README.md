# serr
Convert node Errors to several flavours and ready for serialization, because some error instance properties are not enumerable and cannot be magically serialized 
 * to plain javascript Objects
 * to a string
  
Furthermore, some awful libraries do not return errors. `serr` makes a best effort to serialize their no "errors" as something understandable
 
## Install
```sh
npm install --save serr
```

## Usage
```js
var serializeError = require('serr');

var error = new Error('User Not Found');
error.statusCode = 404;
var obj = serializeError(error).toObject();
// { 
//   statusCode: 404,
//   message: 'User Not Found',
//   name: 'Error',
//   constructor: 'Error',
// }
var str = serializeError(error).toString(); 
// 'Error: User Not Found'

// stack traces are expensive to calculate... Add them on demand.
// ES2015 Classes Support for easy logging your custom ones
class MyError extends Error {};
var obj = serializeError(new MyError('Failed')).toObject(true);
// { 
//   message: 'Failed',
//   name: 'Error', // <------ Warning! It's not MyError
//   constructor: 'MyError',  // <----- Constructor name
//   stack: 'Error: Failed\n    at MyError (repl:1:23)\n    at repl:1:26\n    at REPLServer.defaultEval (repl.js:248:27)\n...'
// }
```

If the error has a `cause()` method that returns another error, as defined by [verror](https://github.com/davepacheco/node-verror), [restify v2.0](https://github.com/mcavage/node-restify) or [therror v1.0](https://github.com/therror/therror), it will concatenate the the cause stacktrace to the main one and add a `causes` array.

```js

var error = new Error('User Not Found');
error.cause = () => new Error('ID not found');
var obj = serializeError(error).toObject(true);
// { 
//   message: 'User Not Found',
//   name: 'Error',
//   constructor: 'Error',
//   causes: [ { message: 'ID not found', name: 'Error', constructor: 'Error' } ]
//   stack: 'Error: User Not Found\n    at repl:1:13\n .....\nCaused by: Error: ID not found\n    at Error.error.cause (repl:1:21)\n....' 
// }
var str = serializeError(error).toString(); 
// 'Error: User Not Found: ID not found'
```

## License

Copyright 2014, 2015 [Telefonica Investigación y Desarrollo, S.A.U](http://www.tid.es)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
