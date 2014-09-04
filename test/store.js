var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');
var Store = require('../lib/store');

function noop() {}

describe('Store', function () {
  var name = 'test';
  var value = { foo: 'bar' };
  var store;

  beforeEach(function () {
    store = new Store();
  });

  describe('define', function () {
    it('should create a new property on the Store', function () {
      expect(name in store).to.equal(false);
      store.define(name);
      expect(name in store).to.equal(true);
    });

    it('should accept an initial value', function () {
      expect(store[name]).to.equal(undefined);
      store.define(name, value);
      expect(store[name]).to.deep.equal(value);
    });

    it('should not fire a change event', function (done) {
      store.on('change', function () {
        throw new Error('Unexpected change');
      });

      store.define(name, value);
      setImmediate(done);
    });
  });

  describe('field', function () {
    it('should fire a change event when set', function (done) {
      store.define(name);

      store.on('change', function (arg) {
        expect(store[name]).to.deep.equal(value);
        expect(arg).to.equal(store);
        done();
      });

      store[name] = value;
    });

    it('should fire a change:name event when set', function (done) {
      store.define(name);

      store.on('change:' + name, function (arg) {
        expect(store[name]).to.deep.equal(value);
        expect(arg).to.deep.equal(value);
        done();
      });

      store[name] = value;
    });
  });

  describe('constructor/factory', function () {
    it('should return a Store', function () {
      expect(Store.createStore()).to.be.an.instanceof(Store);
    });

    it('should accept key:value properties', function () {
      var props = {};

      props[name] = value;

      var store = new Store(props);

      expect(name in store).to.equal(true);
    });
  });

  describe('handle', function () {
    var eventName = 'event:test';
    var dispatcher = new Dispatcher();

    it('should fail if no dispatcher is attached', function () {
      expect(function () {
        store.handle(eventName, noop);
      }).to.throw(ReferenceError);
    });

    it('should fail if no name is provided', function () {
      store.dispatcher = dispatcher;

      expect(function () {
        store.handle(null, noop);
      }).to.throw();
    });

    it('should fail if no function is provided', function () {
      store.dispatcher = dispatcher;

      expect(function () {
        store.handle(eventName, null);
      }).to.throw();

      expect(function () {
        store.handle(eventName, 42);
      }).to.throw();
    });
  });
});
