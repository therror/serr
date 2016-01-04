'use strict';

var serializeError = require('../lib/index');

describe('toString', function() {
  it('should serialize error', function() {
    var err = new Error('foo');
    var obj = serializeError(err).toString();

    expect(obj).to.be.eql('Error: foo');
  });

  it('should serialize Strings as errors', function() {
    var err = 'foo';
    var obj = serializeError(err).toString();

    expect(obj).to.be.eql('foo');
  });

  it('should serialize Objects as errors', function() {
    var err = {foo: 'bar'};
    var obj = serializeError(err).toString();

    expect(obj).to.be.eql("{ foo: 'bar' }");
  });

  describe('with cause', function() {
    it('should serialize errors', function() {
      var err = new Error('foo'), err1 = new Error('bar'), err2 = new Error('baz');
      err1.cause = sandbox.stub().returns(err2);
      err.cause = sandbox.stub().returns(err1);
      var obj = serializeError(err).toString();

      expect(obj).to.be.eql('Error: foo: bar: baz');
    });

    it('should serialize nested strings', function() {
      var err = new Error('foo');
      err.cause = sandbox.stub().returns('bar');
      var obj = serializeError(err).toString();

      expect(obj).to.be.eql('Error: foo: bar');
    });

    it('should serialize nested Objects', function() {
      var err = new Error('foo');
      err.cause = sandbox.stub().returns({foo: 'bar'});
      var obj = serializeError(err).toString();

      expect(obj).to.be.eql("Error: foo: { foo: 'bar' }");
    });
  });
});
