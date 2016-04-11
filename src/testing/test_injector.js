'use strict';var core_1 = require('angular2/core');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var TestInjector = (function () {
    function TestInjector() {
        this._instantiated = false;
        this._injector = null;
        this._providers = [];
        this.platformProviders = [];
        this.applicationProviders = [];
    }
    TestInjector.prototype.reset = function () {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    };
    TestInjector.prototype.addProviders = function (providers) {
        if (this._instantiated) {
            throw new exceptions_1.BaseException('Cannot add providers after test injector is instantiated');
        }
        this._providers = collection_1.ListWrapper.concat(this._providers, providers);
    };
    TestInjector.prototype.createInjector = function () {
        var rootInjector = core_1.Injector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(this.applicationProviders, this._providers));
        this._instantiated = true;
        return this._injector;
    };
    TestInjector.prototype.execute = function (fn) {
        var additionalProviders = fn.additionalProviders();
        if (additionalProviders.length > 0) {
            this.addProviders(additionalProviders);
        }
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    };
    return TestInjector;
})();
exports.TestInjector = TestInjector;
var _testInjector = null;
function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}
exports.getTestInjector = getTestInjector;
/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on teh current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test Providers for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 */
function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw new exceptions_1.BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    var inits = injector.getOptional(core_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits)) {
        inits.forEach(function (init) { return init(); });
    }
    testInjector.reset();
}
exports.setBaseTestProviders = setBaseTestProviders;
/**
 * Reset the providers for the test injector.
 */
function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}
exports.resetBaseTestProviders = resetBaseTestProviders;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should
 * eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
exports.inject = inject;
var InjectSetupWrapper = (function () {
    function InjectSetupWrapper(_providers) {
        this._providers = _providers;
    }
    InjectSetupWrapper.prototype.inject = function (tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, false, this._providers);
    };
    InjectSetupWrapper.prototype.injectAsync = function (tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, true, this._providers);
    };
    return InjectSetupWrapper;
})();
exports.InjectSetupWrapper = InjectSetupWrapper;
function withProviders(providers) {
    return new InjectSetupWrapper(providers);
}
exports.withProviders = withProviders;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
exports.injectAsync = injectAsync;
function emptyArray() {
    return [];
}
var FunctionWithParamTokens = (function () {
    function FunctionWithParamTokens(_tokens, _fn, isAsync, additionalProviders) {
        if (additionalProviders === void 0) { additionalProviders = emptyArray; }
        this._tokens = _tokens;
        this._fn = _fn;
        this.isAsync = isAsync;
        this.additionalProviders = additionalProviders;
    }
    /**
     * Returns the value of the executed function.
     */
    FunctionWithParamTokens.prototype.execute = function (injector) {
        var params = this._tokens.map(function (t) { return injector.get(t); });
        return lang_1.FunctionWrapper.apply(this._fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function (token) { return this._tokens.indexOf(token) > -1; };
    return FunctionWithParamTokens;
})();
exports.FunctionWithParamTokens = FunctionWithParamTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtMTRmNnBsTngudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOlsiVGVzdEluamVjdG9yIiwiVGVzdEluamVjdG9yLmNvbnN0cnVjdG9yIiwiVGVzdEluamVjdG9yLnJlc2V0IiwiVGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyIsIlRlc3RJbmplY3Rvci5jcmVhdGVJbmplY3RvciIsIlRlc3RJbmplY3Rvci5leGVjdXRlIiwiZ2V0VGVzdEluamVjdG9yIiwic2V0QmFzZVRlc3RQcm92aWRlcnMiLCJyZXNldEJhc2VUZXN0UHJvdmlkZXJzIiwiaW5qZWN0IiwiSW5qZWN0U2V0dXBXcmFwcGVyIiwiSW5qZWN0U2V0dXBXcmFwcGVyLmNvbnN0cnVjdG9yIiwiSW5qZWN0U2V0dXBXcmFwcGVyLmluamVjdCIsIkluamVjdFNldHVwV3JhcHBlci5pbmplY3RBc3luYyIsIndpdGhQcm92aWRlcnMiLCJpbmplY3RBc3luYyIsImVtcHR5QXJyYXkiLCJGdW5jdGlvbldpdGhQYXJhbVRva2VucyIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMuZXhlY3V0ZSIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmhhc1Rva2VuIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFBdUQsZUFBZSxDQUFDLENBQUE7QUFDdkUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QscUJBQStDLDBCQUEwQixDQUFDLENBQUE7QUFFMUU7SUFBQUE7UUFDVUMsa0JBQWFBLEdBQVlBLEtBQUtBLENBQUNBO1FBRS9CQSxjQUFTQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUUzQkEsZUFBVUEsR0FBK0JBLEVB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QUFrREE7UUFEMUNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQU9BO1FBQVVBLFFBQUdBLEdBQUhBLEdBQUdBLENBQVVBO1FBQVNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVNBO1FBQy9EQSx3QkFBbUJBLEdBQW5CQSxtQkFBbUJBLENBQXdCQTtJQUFHQSxDQUFDQTtJQUUxREQ7O09BRUdBO0lBQ0hBLHlDQUFPQSxHQUFQQSxVQUFRQSxRQUFrQkE7UUFDeEJFLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEVBQWZBLENBQWVBLENBQUNBLENBQUNBO1FBQ3BEQSxNQUFNQSxDQUFDQSxzQkFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDakRBLENBQUNBO0lBRURGLDBDQUFRQSxHQUFSQSxVQUFTQSxLQUFVQSxJQUFhRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM1RUgsOEJBQUNBO0FBQURBLENBQUNBLEFBZEQsSUFjQztBQWRZLCtCQUF1QiwwQkFjbkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0b3IsIFByb3ZpZGVyLCBQTEFURk9STV9JTklUSUFMSVpFUn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIEV4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtGdW5jdGlvbldyYXBwZXIsIGlzUHJlc2VudCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IGNsYXNzIFRlc3RJbmplY3RvciB7XG4gIHByaXZhdGUgX2luc3RhbnRpYXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvciA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcHJvdmlkZXJzOiBBcnJheTxUeXBlfFByb3ZpZGVyfGFueVtdPiA9IFtdO1xuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2luamVjdG9yID0gbnVsbDtcbiAgICB0aGlzLl9wcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9pbnN0YW50aWF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHBsYXRmb3JtUHJvdmlkZXJzOiBBcnJheTxUeXBlfFByb3ZpZGVyfGFueVtdPiA9IFtdO1xuXG4gIGFwcGxpY2F0aW9uUHJvdmlkZXJzOiBBcnJheTxUeXBlfFByb3ZpZGVyfGFueVtdPiA9IFtdO1xuXG4gIGFkZFByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+KSB7XG4gICAgaWYgKHRoaXMuX2luc3RhbnRpYXRlZCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBhZGQgcHJvdmlkZXJzIGFmdGVyIHRlc3QgaW5qZWN0b3IgaXMgaW5zdGFudGlhdGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdCh0aGlzLl9wcm92aWRlcnMsIHByb3ZpZGVycyk7XG4gIH1cblxuICBjcmVhdGVJbmplY3RvcigpIHtcbiAgICB2YXIgcm9vdEluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZSh0aGlzLnBsYXRmb3JtUHJvdmlkZXJzKTtcbiAgICB0aGlzLl9pbmplY3RvciA9IHJvb3RJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoXG4gICAgICAgIExpc3RXcmFwcGVyLmNvbmNhdCh0aGlzLmFwcGxpY2F0aW9uUHJvdmlkZXJzLCB0aGlzLl9wcm92aWRlcnMpKTtcbiAgICB0aGlzLl9pbnN0YW50aWF0ZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9pbmplY3RvcjtcbiAgfVxuXG4gIGV4ZWN1dGUoZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKTogYW55IHtcbiAgICB2YXIgYWRkaXRpb25hbFByb3ZpZGVycyA9IGZuLmFkZGl0aW9uYWxQcm92aWRlcnMoKTtcbiAgICBpZiAoYWRkaXRpb25hbFByb3ZpZGVycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmFkZFByb3ZpZGVycyhhZGRpdGlvbmFsUHJvdmlkZXJzKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9pbnN0YW50aWF0ZWQpIHtcbiAgICAgIHRoaXMuY3JlYXRlSW5qZWN0b3IoKTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmV4ZWN1dGUodGhpcy5faW5qZWN0b3IpO1xuICB9XG59XG5cbnZhciBfdGVzdEluamVjdG9yOiBUZXN0SW5qZWN0b3IgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVzdEluamVjdG9yKCkge1xuICBpZiAoX3Rlc3RJbmplY3RvciA9PSBudWxsKSB7XG4gICAgX3Rlc3RJbmplY3RvciA9IG5ldyBUZXN0SW5qZWN0b3IoKTtcbiAgfVxuICByZXR1cm4gX3Rlc3RJbmplY3Rvcjtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHByb3ZpZGVycyB0aGF0IHRoZSB0ZXN0IGluamVjdG9yIHNob3VsZCB1c2UuIFRoZXNlIHNob3VsZCBiZSBwcm92aWRlcnNcbiAqIGNvbW1vbiB0byBldmVyeSB0ZXN0IGluIHRoZSBzdWl0ZS5cbiAqXG4gKiBUaGlzIG1heSBvbmx5IGJlIGNhbGxlZCBvbmNlLCB0byBzZXQgdXAgdGhlIGNvbW1vbiBwcm92aWRlcnMgZm9yIHRoZSBjdXJyZW50IHRlc3RcbiAqIHN1aXRlIG9uIHRlaCBjdXJyZW50IHBsYXRmb3JtLiBJZiB5b3UgYWJzb2x1dGVseSBuZWVkIHRvIGNoYW5nZSB0aGUgcHJvdmlkZXJzLFxuICogZmlyc3QgdXNlIGByZXNldEJhc2VUZXN0UHJvdmlkZXJzYC5cbiAqXG4gKiBUZXN0IFByb3ZpZGVycyBmb3IgaW5kaXZpZHVhbCBwbGF0Zm9ybXMgYXJlIGF2YWlsYWJsZSBmcm9tXG4gKiAnYW5ndWxhcjIvcGxhdGZvcm0vdGVzdGluZy88cGxhdGZvcm1fbmFtZT4nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QmFzZVRlc3RQcm92aWRlcnMoXG4gICAgcGxhdGZvcm1Qcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+LFxuICAgIGFwcGxpY2F0aW9uUHJvdmlkZXJzOiBBcnJheTxUeXBlfFByb3ZpZGVyfGFueVtdPikge1xuICB2YXIgdGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG4gIGlmICh0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMubGVuZ3RoID4gMCB8fCB0ZXN0SW5qZWN0b3IuYXBwbGljYXRpb25Qcm92aWRlcnMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3Qgc2V0IGJhc2UgcHJvdmlkZXJzIGJlY2F1c2UgaXQgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQnKTtcbiAgfVxuICB0ZXN0SW5qZWN0b3IucGxhdGZvcm1Qcm92aWRlcnMgPSBwbGF0Zm9ybVByb3ZpZGVycztcbiAgdGVzdEluamVjdG9yLmFwcGxpY2F0aW9uUHJvdmlkZXJzID0gYXBwbGljYXRpb25Qcm92aWRlcnM7XG4gIHZhciBpbmplY3RvciA9IHRlc3RJbmplY3Rvci5jcmVhdGVJbmplY3RvcigpO1xuICBsZXQgaW5pdHM6IEZ1bmN0aW9uW10gPSBpbmplY3Rvci5nZXRPcHRpb25hbChQTEFURk9STV9JTklUSUFMSVpFUik7XG4gIGlmIChpc1ByZXNlbnQoaW5pdHMpKSB7XG4gICAgaW5pdHMuZm9yRWFjaChpbml0ID0+IGluaXQoKSk7XG4gIH1cbiAgdGVzdEluamVjdG9yLnJlc2V0KCk7XG59XG5cbi8qKlxuICogUmVzZXQgdGhlIHByb3ZpZGVycyBmb3IgdGhlIHRlc3QgaW5qZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEJhc2VUZXN0UHJvdmlkZXJzKCkge1xuICB2YXIgdGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG4gIHRlc3RJbmplY3Rvci5wbGF0Zm9ybVByb3ZpZGVycyA9IFtdO1xuICB0ZXN0SW5qZWN0b3IuYXBwbGljYXRpb25Qcm92aWRlcnMgPSBbXTtcbiAgdGVzdEluamVjdG9yLnJlc2V0KCk7XG59XG5cbi8qKlxuICogQWxsb3dzIGluamVjdGluZyBkZXBlbmRlbmNpZXMgaW4gYGJlZm9yZUVhY2goKWAgYW5kIGBpdCgpYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogYmVmb3JlRWFjaChpbmplY3QoW0RlcGVuZGVuY3ksIEFDbGFzc10sIChkZXAsIG9iamVjdCkgPT4ge1xuICogICAvLyBzb21lIGNvZGUgdGhhdCB1c2VzIGBkZXBgIGFuZCBgb2JqZWN0YFxuICogICAvLyAuLi5cbiAqIH0pKTtcbiAqXG4gKiBpdCgnLi4uJywgaW5qZWN0KFtBQ2xhc3NdLCAob2JqZWN0KSA9PiB7XG4gKiAgIG9iamVjdC5kb1NvbWV0aGluZygpO1xuICogICBleHBlY3QoLi4uKTtcbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBOb3RlczpcbiAqIC0gaW5qZWN0IGlzIGN1cnJlbnRseSBhIGZ1bmN0aW9uIGJlY2F1c2Ugb2Ygc29tZSBUcmFjZXVyIGxpbWl0YXRpb24gdGhlIHN5bnRheCBzaG91bGRcbiAqIGV2ZW50dWFsbHlcbiAqICAgYmVjb21lcyBgaXQoJy4uLicsIEBJbmplY3QgKG9iamVjdDogQUNsYXNzLCBhc3luYzogQXN5bmNUZXN0Q29tcGxldGVyKSA9PiB7IC4uLiB9KTtgXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3QodG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIGZhbHNlKTtcbn1cblxuZXhwb3J0IGNsYXNzIEluamVjdFNldHVwV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Byb3ZpZGVyczogKCkgPT4gYW55KSB7fVxuXG4gIGluamVjdCh0b2tlbnM6IGFueVtdLCBmbjogRnVuY3Rpb24pOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCBmYWxzZSwgdGhpcy5fcHJvdmlkZXJzKTtcbiAgfVxuXG4gIGluamVjdEFzeW5jKHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIHRydWUsIHRoaXMuX3Byb3ZpZGVycyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQcm92aWRlcnMocHJvdmlkZXJzOiAoKSA9PiBhbnkpIHtcbiAgcmV0dXJuIG5ldyBJbmplY3RTZXR1cFdyYXBwZXIocHJvdmlkZXJzKTtcbn1cblxuLyoqXG4gKiBBbGxvd3MgaW5qZWN0aW5nIGRlcGVuZGVuY2llcyBpbiBgYmVmb3JlRWFjaCgpYCBhbmQgYGl0KClgLiBUaGUgdGVzdCBtdXN0IHJldHVyblxuICogYSBwcm9taXNlIHdoaWNoIHdpbGwgcmVzb2x2ZSB3aGVuIGFsbCBhc3luY2hyb25vdXMgYWN0aXZpdHkgaXMgY29tcGxldGUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGl0KCcuLi4nLCBpbmplY3RBc3luYyhbQUNsYXNzXSwgKG9iamVjdCkgPT4ge1xuICogICByZXR1cm4gb2JqZWN0LmRvU29tZXRoaW5nKCkudGhlbigoKSA9PiB7XG4gKiAgICAgZXhwZWN0KC4uLik7XG4gKiAgIH0pO1xuICogfSlcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9uV2l0aFBhcmFtVG9rZW5zfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0QXN5bmModG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIHRydWUpO1xufVxuXG5mdW5jdGlvbiBlbXB0eUFycmF5KCk6IEFycmF5PGFueT4ge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfdG9rZW5zOiBhbnlbXSwgcHJpdmF0ZSBfZm46IEZ1bmN0aW9uLCBwdWJsaWMgaXNBc3luYzogYm9vbGVhbixcbiAgICAgIHB1YmxpYyBhZGRpdGlvbmFsUHJvdmlkZXJzOiAoKSA9PiBhbnkgPSBlbXB0eUFycmF5KSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZXhlY3V0ZWQgZnVuY3Rpb24uXG4gICAqL1xuICBleGVjdXRlKGluamVjdG9yOiBJbmplY3Rvcik6IGFueSB7XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuX3Rva2Vucy5tYXAodCA9PiBpbmplY3Rvci5nZXQodCkpO1xuICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkodGhpcy5fZm4sIHBhcmFtcyk7XG4gIH1cblxuICBoYXNUb2tlbih0b2tlbjogYW55KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90b2tlbnMuaW5kZXhPZih0b2tlbikgPiAtMTsgfVxufVxuIl19