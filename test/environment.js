var sinon = require ('sinon'),
    chai = require ('chai'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

global.expect = chai.expect;

beforeEach(function(){
  global.sandbox = sinon.sandbox.create();
  global.sandbox.useFakeTimers();
});

afterEach(function(){
  global.sandbox.restore();
});
