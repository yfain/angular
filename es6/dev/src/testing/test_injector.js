import { Injector, PLATFORM_INITIALIZER } from 'angular2/core';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { FunctionWrapper, isPresent } from 'angular2/src/facade/lang';
export class TestInjector {
    constructor() {
        this._instantiated = false;
        this._injector = null;
        this._providers = [];
        this.platformProviders = [];
        this.applicationProviders = [];
    }
    reset() {
        this._injector = null;
        this._providers = [];
        this._instantiated = false;
    }
    addProviders(providers) {
        if (this._instantiated) {
            throw new BaseException('Cannot add providers after test injector is instantiated');
        }
        this._providers = ListWrapper.concat(this._providers, providers);
    }
    createInjector() {
        var rootInjector = Injector.resolveAndCreate(this.platformProviders);
        this._injector = rootInjector.resolveAndCreateChild(ListWrapper.concat(this.applicationProviders, this._providers));
        this._instantiated = true;
        return this._injector;
    }
    execute(fn) {
        var additionalProviders = fn.additionalProviders();
        if (additionalProviders.length > 0) {
            this.addProviders(additionalProviders);
        }
        if (!this._instantiated) {
            this.createInjector();
        }
        return fn.execute(this._injector);
    }
}
var _testInjector = null;
export function getTestInjector() {
    if (_testInjector == null) {
        _testInjector = new TestInjector();
    }
    return _testInjector;
}
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
export function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
        throw new BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    let inits = injector.getOptional(PLATFORM_INITIALIZER);
    if (isPresent(inits)) {
        inits.forEach(init => init());
    }
    testInjector.reset();
}
/**
 * Reset the providers for the test injector.
 */
export function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
}
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
export function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
export class InjectSetupWrapper {
    constructor(_providers) {
        this._providers = _providers;
    }
    inject(tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, false, this._providers);
    }
    injectAsync(tokens, fn) {
        return new FunctionWithParamTokens(tokens, fn, true, this._providers);
    }
}
export function withProviders(providers) {
    return new InjectSetupWrapper(providers);
}
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
export function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
function emptyArray() {
    return [];
}
export class FunctionWithParamTokens {
    constructor(_tokens, _fn, isAsync, additionalProviders = emptyArray) {
        this._tokens = _tokens;
        this._fn = _fn;
        this.isAsync = isAsync;
        this.additionalProviders = additionalProviders;
    }
    /**
     * Returns the value of the executed function.
     */
    execute(injector) {
        var params = this._tokens.map(t => injector.get(t));
        return FunctionWrapper.apply(this._fn, params);
    }
    hasToken(token) { return this._tokens.indexOf(token) > -1; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOlsiVGVzdEluamVjdG9yIiwiVGVzdEluamVjdG9yLmNvbnN0cnVjdG9yIiwiVGVzdEluamVjdG9yLnJlc2V0IiwiVGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyIsIlRlc3RJbmplY3Rvci5jcmVhdGVJbmplY3RvciIsIlRlc3RJbmplY3Rvci5leGVjdXRlIiwiZ2V0VGVzdEluamVjdG9yIiwic2V0QmFzZVRlc3RQcm92aWRlcnMiLCJyZXNldEJhc2VUZXN0UHJvdmlkZXJzIiwiaW5qZWN0IiwiSW5qZWN0U2V0dXBXcmFwcGVyIiwiSW5qZWN0U2V0dXBXcmFwcGVyLmNvbnN0cnVjdG9yIiwiSW5qZWN0U2V0dXBXcmFwcGVyLmluamVjdCIsIkluamVjdFNldHVwV3JhcHBlci5pbmplY3RBc3luYyIsIndpdGhQcm92aWRlcnMiLCJpbmplY3RBc3luYyIsImVtcHR5QXJyYXkiLCJGdW5jdGlvbldpdGhQYXJhbVRva2VucyIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMuZXhlY3V0ZSIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmhhc1Rva2VuIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFFBQVEsRUFBWSxvQkFBb0IsRUFBQyxNQUFNLGVBQWU7T0FDL0QsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ25ELEVBQUMsZUFBZSxFQUFFLFNBQVMsRUFBTyxNQUFNLDBCQUEwQjtBQUV6RTtJQUFBQTtRQUNVQyxrQkFBYUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFL0JBLGNBQVNBLEdBQWFB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QUFDQSxDQUFDQSxDQUFDQTtRQUNwREEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDakRBLENBQUNBO0lBRURGLFFBQVFBLENBQUNBLEtBQVVBLElBQWFHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzVFSCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgUHJvdmlkZXIsIFBMQVRGT1JNX0lOSVRJQUxJWkVSfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgRXhjZXB0aW9uSGFuZGxlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0Z1bmN0aW9uV3JhcHBlciwgaXNQcmVzZW50LCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5leHBvcnQgY2xhc3MgVGVzdEluamVjdG9yIHtcbiAgcHJpdmF0ZSBfaW5zdGFudGlhdGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yID0gbnVsbDtcblxuICBwcml2YXRlIF9wcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+ID0gW107XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5faW5qZWN0b3IgPSBudWxsO1xuICAgIHRoaXMuX3Byb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX2luc3RhbnRpYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgcGxhdGZvcm1Qcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+ID0gW107XG5cbiAgYXBwbGljYXRpb25Qcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+ID0gW107XG5cbiAgYWRkUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZXxQcm92aWRlcnxhbnlbXT4pIHtcbiAgICBpZiAodGhpcy5faW5zdGFudGlhdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGFkZCBwcm92aWRlcnMgYWZ0ZXIgdGVzdCBpbmplY3RvciBpcyBpbnN0YW50aWF0ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY29uY2F0KHRoaXMuX3Byb3ZpZGVycywgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yKCkge1xuICAgIHZhciByb290SW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKHRoaXMucGxhdGZvcm1Qcm92aWRlcnMpO1xuICAgIHRoaXMuX2luamVjdG9yID0gcm9vdEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGVDaGlsZChcbiAgICAgICAgTGlzdFdyYXBwZXIuY29uY2F0KHRoaXMuYXBwbGljYXRpb25Qcm92aWRlcnMsIHRoaXMuX3Byb3ZpZGVycykpO1xuICAgIHRoaXMuX2luc3RhbnRpYXRlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX2luamVjdG9yO1xuICB9XG5cbiAgZXhlY3V0ZShmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpOiBhbnkge1xuICAgIHZhciBhZGRpdGlvbmFsUHJvdmlkZXJzID0gZm4uYWRkaXRpb25hbFByb3ZpZGVycygpO1xuICAgIGlmIChhZGRpdGlvbmFsUHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYWRkUHJvdmlkZXJzKGFkZGl0aW9uYWxQcm92aWRlcnMpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2luc3RhbnRpYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGVJbmplY3RvcigpO1xuICAgIH1cbiAgICByZXR1cm4gZm4uZXhlY3V0ZSh0aGlzLl9pbmplY3Rvcik7XG4gIH1cbn1cblxudmFyIF90ZXN0SW5qZWN0b3I6IFRlc3RJbmplY3RvciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXN0SW5qZWN0b3IoKSB7XG4gIGlmIChfdGVzdEluamVjdG9yID09IG51bGwpIHtcbiAgICBfdGVzdEluamVjdG9yID0gbmV3IFRlc3RJbmplY3RvcigpO1xuICB9XG4gIHJldHVybiBfdGVzdEluamVjdG9yO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcHJvdmlkZXJzIHRoYXQgdGhlIHRlc3QgaW5qZWN0b3Igc2hvdWxkIHVzZS4gVGhlc2Ugc2hvdWxkIGJlIHByb3ZpZGVyc1xuICogY29tbW9uIHRvIGV2ZXJ5IHRlc3QgaW4gdGhlIHN1aXRlLlxuICpcbiAqIFRoaXMgbWF5IG9ubHkgYmUgY2FsbGVkIG9uY2UsIHRvIHNldCB1cCB0aGUgY29tbW9uIHByb3ZpZGVycyBmb3IgdGhlIGN1cnJlbnQgdGVzdFxuICogc3VpdGUgb24gdGVoIGN1cnJlbnQgcGxhdGZvcm0uIElmIHlvdSBhYnNvbHV0ZWx5IG5lZWQgdG8gY2hhbmdlIHRoZSBwcm92aWRlcnMsXG4gKiBmaXJzdCB1c2UgYHJlc2V0QmFzZVRlc3RQcm92aWRlcnNgLlxuICpcbiAqIFRlc3QgUHJvdmlkZXJzIGZvciBpbmRpdmlkdWFsIHBsYXRmb3JtcyBhcmUgYXZhaWxhYmxlIGZyb21cbiAqICdhbmd1bGFyMi9wbGF0Zm9ybS90ZXN0aW5nLzxwbGF0Zm9ybV9uYW1lPicuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRCYXNlVGVzdFByb3ZpZGVycyhcbiAgICBwbGF0Zm9ybVByb3ZpZGVyczogQXJyYXk8VHlwZXxQcm92aWRlcnxhbnlbXT4sXG4gICAgYXBwbGljYXRpb25Qcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+KSB7XG4gIHZhciB0ZXN0SW5qZWN0b3IgPSBnZXRUZXN0SW5qZWN0b3IoKTtcbiAgaWYgKHRlc3RJbmplY3Rvci5wbGF0Zm9ybVByb3ZpZGVycy5sZW5ndGggPiAwIHx8IHRlc3RJbmplY3Rvci5hcHBsaWNhdGlvblByb3ZpZGVycy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBzZXQgYmFzZSBwcm92aWRlcnMgYmVjYXVzZSBpdCBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCcpO1xuICB9XG4gIHRlc3RJbmplY3Rvci5wbGF0Zm9ybVByb3ZpZGVycyA9IHBsYXRmb3JtUHJvdmlkZXJzO1xuICB0ZXN0SW5qZWN0b3IuYXBwbGljYXRpb25Qcm92aWRlcnMgPSBhcHBsaWNhdGlvblByb3ZpZGVycztcbiAgdmFyIGluamVjdG9yID0gdGVzdEluamVjdG9yLmNyZWF0ZUluamVjdG9yKCk7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IGluamVjdG9yLmdldE9wdGlvbmFsKFBMQVRGT1JNX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIHtcbiAgICBpbml0cy5mb3JFYWNoKGluaXQgPT4gaW5pdCgpKTtcbiAgfVxuICB0ZXN0SW5qZWN0b3IucmVzZXQoKTtcbn1cblxuLyoqXG4gKiBSZXNldCB0aGUgcHJvdmlkZXJzIGZvciB0aGUgdGVzdCBpbmplY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0QmFzZVRlc3RQcm92aWRlcnMoKSB7XG4gIHZhciB0ZXN0SW5qZWN0b3IgPSBnZXRUZXN0SW5qZWN0b3IoKTtcbiAgdGVzdEluamVjdG9yLnBsYXRmb3JtUHJvdmlkZXJzID0gW107XG4gIHRlc3RJbmplY3Rvci5hcHBsaWNhdGlvblByb3ZpZGVycyA9IFtdO1xuICB0ZXN0SW5qZWN0b3IucmVzZXQoKTtcbn1cblxuLyoqXG4gKiBBbGxvd3MgaW5qZWN0aW5nIGRlcGVuZGVuY2llcyBpbiBgYmVmb3JlRWFjaCgpYCBhbmQgYGl0KClgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBiZWZvcmVFYWNoKGluamVjdChbRGVwZW5kZW5jeSwgQUNsYXNzXSwgKGRlcCwgb2JqZWN0KSA9PiB7XG4gKiAgIC8vIHNvbWUgY29kZSB0aGF0IHVzZXMgYGRlcGAgYW5kIGBvYmplY3RgXG4gKiAgIC8vIC4uLlxuICogfSkpO1xuICpcbiAqIGl0KCcuLi4nLCBpbmplY3QoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgb2JqZWN0LmRvU29tZXRoaW5nKCk7XG4gKiAgIGV4cGVjdCguLi4pO1xuICogfSlcbiAqIGBgYFxuICpcbiAqIE5vdGVzOlxuICogLSBpbmplY3QgaXMgY3VycmVudGx5IGEgZnVuY3Rpb24gYmVjYXVzZSBvZiBzb21lIFRyYWNldXIgbGltaXRhdGlvbiB0aGUgc3ludGF4IHNob3VsZFxuICogZXZlbnR1YWxseVxuICogICBiZWNvbWVzIGBpdCgnLi4uJywgQEluamVjdCAob2JqZWN0OiBBQ2xhc3MsIGFzeW5jOiBBc3luY1Rlc3RDb21wbGV0ZXIpID0+IHsgLi4uIH0pO2BcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB0b2tlbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbldpdGhQYXJhbVRva2Vuc31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdCh0b2tlbnM6IGFueVtdLCBmbjogRnVuY3Rpb24pOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnModG9rZW5zLCBmbiwgZmFsc2UpO1xufVxuXG5leHBvcnQgY2xhc3MgSW5qZWN0U2V0dXBXcmFwcGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcHJvdmlkZXJzOiAoKSA9PiBhbnkpIHt9XG5cbiAgaW5qZWN0KHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKHRva2VucywgZm4sIGZhbHNlLCB0aGlzLl9wcm92aWRlcnMpO1xuICB9XG5cbiAgaW5qZWN0QXN5bmModG9rZW5zOiBhbnlbXSwgZm46IEZ1bmN0aW9uKTogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnModG9rZW5zLCBmbiwgdHJ1ZSwgdGhpcy5fcHJvdmlkZXJzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByb3ZpZGVycyhwcm92aWRlcnM6ICgpID0+IGFueSkge1xuICByZXR1cm4gbmV3IEluamVjdFNldHVwV3JhcHBlcihwcm92aWRlcnMpO1xufVxuXG4vKipcbiAqIEFsbG93cyBpbmplY3RpbmcgZGVwZW5kZW5jaWVzIGluIGBiZWZvcmVFYWNoKClgIGFuZCBgaXQoKWAuIFRoZSB0ZXN0IG11c3QgcmV0dXJuXG4gKiBhIHByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIHdoZW4gYWxsIGFzeW5jaHJvbm91cyBhY3Rpdml0eSBpcyBjb21wbGV0ZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogaXQoJy4uLicsIGluamVjdEFzeW5jKFtBQ2xhc3NdLCAob2JqZWN0KSA9PiB7XG4gKiAgIHJldHVybiBvYmplY3QuZG9Tb21ldGhpbmcoKS50aGVuKCgpID0+IHtcbiAqICAgICBleHBlY3QoLi4uKTtcbiAqICAgfSk7XG4gKiB9KVxuICogYGBgXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RBc3luYyh0b2tlbnM6IGFueVtdLCBmbjogRnVuY3Rpb24pOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnModG9rZW5zLCBmbiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGVtcHR5QXJyYXkoKTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF90b2tlbnM6IGFueVtdLCBwcml2YXRlIF9mbjogRnVuY3Rpb24sIHB1YmxpYyBpc0FzeW5jOiBib29sZWFuLFxuICAgICAgcHVibGljIGFkZGl0aW9uYWxQcm92aWRlcnM6ICgpID0+IGFueSA9IGVtcHR5QXJyYXkpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBleGVjdXRlZCBmdW5jdGlvbi5cbiAgICovXG4gIGV4ZWN1dGUoaW5qZWN0b3I6IEluamVjdG9yKTogYW55IHtcbiAgICB2YXIgcGFyYW1zID0gdGhpcy5fdG9rZW5zLm1hcCh0ID0+IGluamVjdG9yLmdldCh0KSk7XG4gICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseSh0aGlzLl9mbiwgcGFyYW1zKTtcbiAgfVxuXG4gIGhhc1Rva2VuKHRva2VuOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3Rva2Vucy5pbmRleE9mKHRva2VuKSA+IC0xOyB9XG59XG4iXX0=