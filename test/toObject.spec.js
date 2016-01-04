'use strict';

var serializeError = require('../lib/index');

describe('toObject', function() {
  it('should serialize error', function() {
    var err = new Error('foo');
    var obj = serializeError(err).toObject();

    expect(obj).to.be.eql({
      constructor: 'Error',
      message: 'foo',
      name: 'Error'
    })
  });

  it('should serialize enumerable properties', function() {
    var err = new Error('foo');
    err.statusCode = 404;
    Object.defineProperty(err, 'hidden', {
      enumerable: false,
      value: 'nope'
    });
    var obj = serializeError(err).toObject();

    expect(obj).to.be.eql({
      statusCode: 404,
      constructor: 'Error',
      message: 'foo',
      name: 'Error'
    })
  });

  it('should serialize Strings as errors', function() {
    var err = 'foo';
    var obj = serializeError(err).toObject();

    expect(obj).to.be.eql({
      constructor: 'String',
      message: 'foo'
    })
  });

  it('should serialize Objects as errors', function() {
    var err = {foo: 'bar'};
    var obj = serializeError(err).toObject();

    expect(obj).to.be.eql({
      constructor: 'Object',
      foo: 'bar',
      message: "{ foo: 'bar' }"
    });
  });

  it('should serialize undefined', function() {
    var obj = serializeError().toObject();
    expect(obj).to.be.eql({
      message: 'undefined'
    });
  });

  it('should serialize null', function() {
    var obj = serializeError(null).toObject();
    expect(obj).to.be.eql({
      message: 'null'
    });
  });

  it('should add stack traces', function() {
    var err = new Error('foo');
    var obj = serializeError(err).toObject(true);

    expect(obj).to.be.eql({
      constructor: 'Error',
      message: 'foo',
      name: 'Error',
      stack: err.stack
    });
  });

  it('should remove functions on errors stack traces', function() {
    var err = new Error('foo');
    err.toJSON = function() {};
    var obj = serializeError(err).toObject(true);

    expect(obj.toJSON).to.not.exist;
  });

  describe('with cause', function() {
    it('should serialize errors', function() {
      var err = new Error('foo'), err1 = new Error('bar'), err2 = new Error('baz');
      err1.cause = sandbox.stub().returns(err2);
      err.cause = sandbox.stub().returns(err1);
      var obj = serializeError(err).toObject();

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            constructor: 'Error',
            message: 'bar',
            name: 'Error'
          },
          {
            constructor: 'Error',
            message: 'baz',
            name: 'Error'
          }
        ]
      });
    });

    it('should serialize enumerable properties', function() {
      var err = new Error('foo'), err1 = new Error('bar'), err2 = new Error('baz');
      err1.statusCode = 404;
      err1.cause = sandbox.stub().returns(err2);
      err.cause = sandbox.stub().returns(err1);
      var obj = serializeError(err).toObject();

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            statusCode: 404,
            constructor: 'Error',
            message: 'bar',
            name: 'Error'
          },
          {
            constructor: 'Error',
            message: 'baz',
            name: 'Error'
          }
        ]
      });
    });

    it('should serialize nested strings', function() {
      var err = new Error('foo');
      err.cause = sandbox.stub().returns('bar');
      var obj = serializeError(err).toObject();

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            constructor: 'String',
            message: 'bar'
          }
        ]
      });
    });

    it('should serialize nested Objects', function() {
      var err = new Error('foo');
      err.cause = sandbox.stub().returns({foo: 'bar'});
      var obj = serializeError(err).toObject();

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            constructor: 'Object',
            foo: 'bar',
            message: "{ foo: 'bar' }"
          }
        ]
      });
    });

    it('should serialize nested undefined', function() {
      var err = new Error('foo');
      err.cause = sandbox.stub().returns(undefined);
      var obj = serializeError(err).toObject();

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            message: "undefined"
          }
        ]
      });
    });

    it('should add stack traces', function() {
      var err = new Error('foo'), err1 = new Error('bar'), err2 = 'baz';
      err1.cause = sandbox.stub().returns(err2);
      err.cause = sandbox.stub().returns(err1);
      var obj = serializeError(err).toObject(true);

      expect(obj).to.be.eql({
        constructor: 'Error',
        message: 'foo',
        name: 'Error',
        causes: [
          {
            constructor: 'Error',
            message: 'bar',
            name: 'Error'
          },
          {
            constructor: 'String',
            message: 'baz'
          }
        ],
        stack: err.stack +
        '\nCaused by: ' + err1.stack +
        '\nCaused by: ' + err2
      });
    });

    it('should add stack traces including undefined', function() {
        var err = new Error('foo'), err1 = new Error('bar'), err2 = undefined;
        err1.cause = sandbox.stub().returns(err2);
        err.cause = sandbox.stub().returns(err1);
        var obj = serializeError(err).toObject(true);

        expect(obj).to.be.eql({
          constructor: 'Error',
          message: 'foo',
          name: 'Error',
          causes: [
            {
              constructor: 'Error',
              message: 'bar',
              name: 'Error'
            },
            {
              message: 'undefined'
            }
          ],
          stack: err.stack +
          '\nCaused by: ' + err1.stack +
          '\nCaused by: undefined'
        });
      });

    it('should not add stack traces for non errors', function() {
      var err = 'foo';
      var obj = serializeError(err).toObject(true);

      expect(obj).to.be.eql({
        constructor: 'String',
        message: 'foo'
      });
    });
  });
});
