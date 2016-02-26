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

var isFunction = require('lodash.isfunction'),
    isObject = require('lodash.isobject'),
    util = require('util');

module.exports = function serializeErr(err) {
  return {
    toObject: toObject.bind(null, err),
    toString: toString.bind(null, err)
  };
};

/**
 * Serializes an error as a literal object
 *
 * @param {Error|*} error The error to serialize
 * @param {Boolean} withStack Add the stack trace
 * @returns {Object} The literal object ready to be serialized
 */
function toObject(error, withStack) {
  var ret = formatObject(error);

  var causes = getCauses(error).map(formatObject);
  if (causes.length) {
    ret.causes = causes;
  }

  if (withStack && error instanceof Error) {
    ret.stack = getFullErrorStack(error);
  }

  return ret;
}

/**
 * Serializes an error as a String
 *
 * @param {Error|*} error The error to serialize
 * @param {Boolean} withStack Add the stack trace
 * @returns {Object} The string representation
 */
function toString(error, withStack) {
  if (withStack && error instanceof Error) {
    return getFullErrorStack(error);
  } else {
    return [formatError(error)]
        .concat(getCauses(error).map(formatMessage))
        .join(': ');
  }
}

/*
 * This function gets error causes returned by error.cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror)
 * [restify v2.0](https://github.com/mcavage/node-restify)
 * [therror v1.0](https://github.com/therror/therror)
 * have them
 *
 * Inspired by `getFullErrorStack` from
 * https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js
 */
function getCauses(error, acc) {
  acc = acc || [];
  error = error || {};

  var cause = isFunction(error.cause) && error.cause();
  if (cause) {
    acc.push(cause);
    return getCauses(cause, acc);
  }
  return acc;
}

function getFullErrorStack(error) {
  return [formatStack(error)]
      .concat(getCauses(error).map(formatStack))
      .join('\nCaused by: ');
}

function formatObject(error) {
  if (!isObject(error)) {
    var ret = {
      message: formatError(error)
    };

    if (error && error.constructor) {
      ret.constructor = error.constructor.name || error.constructor.prototype.name;
    }

    return ret;
  }
  // add the enumerable error properties to the serialized err
  var ret = Object.keys(error).reduce(function(memo, key) {
    if (!isFunction(error[key])) {
      // Dont want functions in the resulting object, like magic ones as toJSON
      // that can cause a this module to not work
      memo[key] = error[key];
    }
    return memo;
  }, {});

  ret.message = formatMessage(error);

  if (error.name) {
    ret.name = error.name;
  }

  if (error.constructor) {
    ret.constructor = error.constructor.name || error.constructor.prototype.name;
  }

  return ret;
}

function formatStack(error) {
  return '' + (error instanceof Error ?
      error.stack || util.format(error) :
      util.format(error));
}

function formatError(error) {
  return '' + (error instanceof Error ?
      error :
      util.format(error));
}

function formatMessage(error) {
  return '' + (error instanceof Error ?
      error.message :
      util.format(error));
}
