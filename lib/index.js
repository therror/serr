/**
 * @license
 * Copyright 2014,2015 Telefónica I+D
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var isFunction = require('lodash.isfunction');

module.exports = serializeErr;

/**
 * Serializes an error as a literal object
 *
 * @param {Error} err The error to serialize
 * @param {Boolean} skipStack Dont add the stack trace
 * @returns {*}
 */
function serializeErr(err, skipStack) {
  if (!(err instanceof Error)) {
    return err;
  }

  // add the enumerable error properties to the serialized err
  var ret = Object.keys(err).reduce(function(memo, key) {
    if (!isFunction(err[key])) {
      // Dont want functions in the resulting object, like magic ones as toJSON
      // that can cause a this module to not work
      memo[key] = err[key];
    }
    return memo;
  }, {});

  // and add common ones
  ret.message = err.message;
  ret.name = err.name;
  ret.constructor = err.constructor.name;
  if (!skipStack) {
    ret.stack = getFullErrorStack(err);
  }

  return ret;
}

/*
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror)
 * [restify v2.0](https://github.com/mcavage/node-restify)
 * [therror v1.0](https://github.com/therror/therror)
 *
 * Based on `getFullErrorStack` from
 * https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js
 */
function getFullErrorStack(err) {
  var ret = err.stack || err.toString();

  if (isFunction(err.cause)) {
    var cex = err.cause();
    if (cex) {
      ret += '\nCaused by: ' + getFullErrorStack(cex);
    }
  }
  return ret;
}
