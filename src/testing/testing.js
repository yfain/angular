'use strict';"use strict";
/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
var lang_1 = require('angular2/src/facade/lang');
var test_injector_1 = require('./test_injector');
var test_injector_2 = require('./test_injector');
exports.inject = test_injector_2.inject;
exports.async = test_injector_2.async;
exports.injectAsync = test_injector_2.injectAsync;
var matchers_1 = require('./matchers');
exports.expect = matchers_1.expect;
var _global = (typeof window === 'undefined' ? lang_1.global : window);
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
exports.afterEach = _global.afterEach;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
exports.describe = _global.describe;
/**
 * See {@link fdescribe}.
 */
exports.ddescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to only run
 * the test cases in this group. This is useful for debugging.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fdescribe'}
 */
exports.fdescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to exclude
 * this group of test cases from execution. This is useful for
 * debugging, or for excluding broken tests until they can be fixed.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xdescribe'}
 */
exports.xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testInjector = test_injector_1.getTestInjector();
// Reset the test providers before each test.
jsmBeforeEach(function () { testInjector.reset(); });
/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEachProviders'}
 */
function beforeEachProviders(fn) {
    jsmBeforeEach(function () {
        var providers = fn();
        if (!providers)
            return;
        try {
            testInjector.addProviders(providers);
        }
        catch (e) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}
exports.beforeEachProviders = beforeEachProviders;
function runInAsyncTestZone(fnToExecute, finishCallback, failCallback, testName) {
    if (testName === void 0) { testName = ''; }
    var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
    var testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, testName);
    var testZone = Zone.current.fork(testZoneSpec);
    return testZone.run(fnToExecute);
}
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        var testFnT_1 = testFn;
        jsmFn(name, function (done) {
            if (testFnT_1.isAsync) {
                runInAsyncTestZone(function () { return testInjector.execute(testFnT_1); }, done, done.fail, name);
            }
            else {
                testInjector.execute(testFnT_1);
                done();
            }
        }, timeOut);
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        jsmFn(name, testFn, timeOut);
    }
}
/**
 * Wrapper around Jasmine beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        var fnT_1 = fn;
        jsmBeforeEach(function (done) {
            if (fnT_1.isAsync) {
                runInAsyncTestZone(function () { return testInjector.execute(fnT_1); }, done, done.fail, 'beforeEach');
            }
            else {
                testInjector.execute(fnT_1);
                done();
            }
        });
    }
    else {
        // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
        if (fn.length === 0) {
            jsmBeforeEach(function () { fn(); });
        }
        else {
            jsmBeforeEach(function (done) { fn(done); });
        }
    }
}
exports.beforeEach = beforeEach;
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, the result of {@link async},
 * or an injected function created via {@link inject}.
 *
 * Wrapper around Jasmine it function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Jasmine xit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xit'}
 */
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
/**
 * See {@link fit}.
 */
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
/**
 * Like {@link it}, but instructs the test runner to only run this test.
 * Useful for debugging.
 *
 * Wrapper around Jasmine fit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fit'}
 */
function fit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.fit = fit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtV1F1VUlRekUudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRztBQUNILHFCQUFxQiwwQkFBMEIsQ0FBQyxDQUFBO0FBSWhELDhCQU9PLGlCQUFpQixDQUFDLENBQUE7QUFFekIsOEJBQXlDLGlCQUFpQixDQUFDO0FBQW5ELHdDQUFNO0FBQUUsc0NBQUs7QUFBRSxrREFBb0M7QUFFM0QseUJBQWlDLFlBQVksQ0FBQztBQUF0QyxtQ0FBc0M7QUFFOUMsSUFBSSxPQUFPLEdBQVEsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsYUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRXJFOzs7Ozs7OztHQVFHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7OztHQVFHO0FBQ1EsZ0JBQVEsR0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBRWpEOztHQUVHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7R0FTRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7OztHQVVHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBa0JuRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN6QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBRXpCLElBQUksWUFBWSxHQUFpQiwrQkFBZSxFQUFFLENBQUM7QUFFbkQsNkNBQTZDO0FBQzdDLGFB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QUFzQjtJQUN4QyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFIZSxXQUFHLE1BR2xCLENBQUE7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEIsdUJBQXNCLEdBQXRCLGNBQXNCO0lBQ3hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUhlLFdBQUcsTUFHbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHVibGljIFRlc3QgTGlicmFyeSBmb3IgdW5pdCB0ZXN0aW5nIEFuZ3VsYXIyIEFwcGxpY2F0aW9ucy4gVXNlcyB0aGVcbiAqIEphc21pbmUgZnJhbWV3b3JrLlxuICovXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2JpbmR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBGdW5jdGlvbldpdGhQYXJhbVRva2VucyxcbiAgaW5qZWN0LFxuICBhc3luYyxcbiAgaW5qZWN0QXN5bmMsXG4gIFRlc3RJbmplY3RvcixcbiAgZ2V0VGVzdEluamVjdG9yXG59IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7aW5qZWN0LCBhc3luYywgaW5qZWN0QXN5bmN9IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7ZXhwZWN0LCBOZ01hdGNoZXJzfSBmcm9tICcuL21hdGNoZXJzJztcblxudmFyIF9nbG9iYWwgPSA8YW55Pih0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cbi8qKlxuICogUnVuIGEgZnVuY3Rpb24gKHdpdGggYW4gb3B0aW9uYWwgYXN5bmNocm9ub3VzIGNhbGxiYWNrKSBhZnRlciBlYWNoIHRlc3QgY2FzZS5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2FmdGVyRWFjaCd9XG4gKi9cbmV4cG9ydCB2YXIgYWZ0ZXJFYWNoOiBGdW5jdGlvbiA9IF9nbG9iYWwuYWZ0ZXJFYWNoO1xuXG4vKipcbiAqIEdyb3VwIHRlc3QgY2FzZXMgdG9nZXRoZXIgdW5kZXIgYSBjb21tb24gZGVzY3JpcHRpb24gcHJlZml4LlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZGVzY3JpYmVJdCd9XG4gKi9cbmV4cG9ydCB2YXIgZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5kZXNjcmliZTtcblxuLyoqXG4gKiBTZWUge0BsaW5rIGZkZXNjcmliZX0uXG4gKi9cbmV4cG9ydCB2YXIgZGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW5cbiAqIHRoZSB0ZXN0IGNhc2VzIGluIHRoaXMgZ3JvdXAuIFRoaXMgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIGZkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmZkZXNjcmliZTtcblxuLyoqXG4gKiBMaWtlIHtAbGluayBkZXNjcmliZX0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIGV4Y2x1ZGVcbiAqIHRoaXMgZ3JvdXAgb2YgdGVzdCBjYXNlcyBmcm9tIGV4ZWN1dGlvbi4gVGhpcyBpcyB1c2VmdWwgZm9yXG4gKiBkZWJ1Z2dpbmcsIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsIHRoZXkgY2FuIGJlIGZpeGVkLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGRlc2NyaWJlJ31cbiAqL1xuZXhwb3J0IHZhciB4ZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC54ZGVzY3JpYmU7XG5cbi8qKlxuICogU2lnbmF0dXJlIGZvciBhIHN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gKG5vIGFyZ3VtZW50cykuXG4gKi9cbmV4cG9ydCB0eXBlIFN5bmNUZXN0Rm4gPSAoKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW4gYXN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gd2hpY2ggdGFrZXMgYVxuICogYGRvbmVgIGNhbGxiYWNrLlxuICovXG5leHBvcnQgdHlwZSBBc3luY1Rlc3RGbiA9IChkb25lOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW55IHNpbXBsZSB0ZXN0aW5nIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBBbnlUZXN0Rm4gPSBTeW5jVGVzdEZuIHwgQXN5bmNUZXN0Rm47XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbUl0ID0gX2dsb2JhbC5pdDtcbnZhciBqc21JSXQgPSBfZ2xvYmFsLmZpdDtcbnZhciBqc21YSXQgPSBfZ2xvYmFsLnhpdDtcblxudmFyIHRlc3RJbmplY3RvcjogVGVzdEluamVjdG9yID0gZ2V0VGVzdEluamVjdG9yKCk7XG5cbi8vIFJlc2V0IHRoZSB0ZXN0IHByb3ZpZGVycyBiZWZvcmUgZWFjaCB0ZXN0LlxuanNtQmVmb3JlRWFjaCgoKSA9PiB7IHRlc3RJbmplY3Rvci5yZXNldCgpOyB9KTtcblxuLyoqXG4gKiBBbGxvd3Mgb3ZlcnJpZGluZyBkZWZhdWx0IHByb3ZpZGVycyBvZiB0aGUgdGVzdCBpbmplY3RvcixcbiAqIHdoaWNoIGFyZSBkZWZpbmVkIGluIHRlc3RfaW5qZWN0b3IuanMuXG4gKlxuICogVGhlIGdpdmVuIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgbGlzdCBvZiBESSBwcm92aWRlcnMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYmVmb3JlRWFjaFByb3ZpZGVycyd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoUHJvdmlkZXJzKGZuKTogdm9pZCB7XG4gIGpzbUJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHZhciBwcm92aWRlcnMgPSBmbigpO1xuICAgIGlmICghcHJvdmlkZXJzKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIHRlc3RJbmplY3Rvci5hZGRQcm92aWRlcnMocHJvdmlkZXJzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlZm9yZUVhY2hQcm92aWRlcnMgd2FzIGNhbGxlZCBhZnRlciB0aGUgaW5qZWN0b3IgaGFkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdiZWVuIHVzZWQgaW4gYSBiZWZvcmVFYWNoIG9yIGl0IGJsb2NrLiBUaGlzIGludmFsaWRhdGVzIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAndGVzdCBpbmplY3RvcicpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkluQXN5bmNUZXN0Wm9uZShmblRvRXhlY3V0ZSwgZmluaXNoQ2FsbGJhY2s6IEZ1bmN0aW9uLCBmYWlsQ2FsbGJhY2s6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3ROYW1lID0gJycpOiBhbnkge1xuICB2YXIgQXN5bmNUZXN0Wm9uZVNwZWMgPSBab25lWydBc3luY1Rlc3Rab25lU3BlYyddO1xuICB2YXIgdGVzdFpvbmVTcGVjID0gbmV3IEFzeW5jVGVzdFpvbmVTcGVjKGZpbmlzaENhbGxiYWNrLCBmYWlsQ2FsbGJhY2ssIHRlc3ROYW1lKTtcbiAgdmFyIHRlc3Rab25lID0gWm9uZS5jdXJyZW50LmZvcmsodGVzdFpvbmVTcGVjKTtcbiAgcmV0dXJuIHRlc3Rab25lLnJ1bihmblRvRXhlY3V0ZSk7XG59XG5cbmZ1bmN0aW9uIF9pc1Byb21pc2VMaWtlKGlucHV0KTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnB1dCAmJiAhIShpbnB1dC50aGVuKTtcbn1cblxuZnVuY3Rpb24gX2l0KGpzbUZuOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nLCB0ZXN0Rm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAgdmFyIHRpbWVPdXQgPSB0ZXN0VGltZU91dDtcbiAgaWYgKHRlc3RGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgbGV0IHRlc3RGblQgPSB0ZXN0Rm47XG4gICAganNtRm4obmFtZSwgKGRvbmUpID0+IHtcbiAgICAgIGlmICh0ZXN0Rm5ULmlzQXN5bmMpIHtcbiAgICAgICAgcnVuSW5Bc3luY1Rlc3Rab25lKCgpID0+IHRlc3RJbmplY3Rvci5leGVjdXRlKHRlc3RGblQpLCBkb25lLCBkb25lLmZhaWwsIG5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGVzdEluamVjdG9yLmV4ZWN1dGUodGVzdEZuVCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lT3V0KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBqc21GbihuYW1lLCB0ZXN0Rm4sIHRpbWVPdXQpO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBiZWZvcmVFYWNoIGZ1bmN0aW9uLlxuICpcbiAqIGJlZm9yZUVhY2ggbWF5IGJlIHVzZWQgd2l0aCB0aGUgYGluamVjdGAgZnVuY3Rpb24gdG8gZmV0Y2ggZGVwZW5kZW5jaWVzLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYmVmb3JlRWFjaCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbik6IHZvaWQge1xuICBpZiAoZm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgdXNlcyBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goaW5qZWN0KFtDbGFzc0FdLCAoYSkgPT4geyAuLi5cbiAgICAvLyB9KSk7YFxuICAgIGxldCBmblQgPSBmbjtcbiAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7XG4gICAgICBpZiAoZm5ULmlzQXN5bmMpIHtcbiAgICAgICAgcnVuSW5Bc3luY1Rlc3Rab25lKCgpID0+IHRlc3RJbmplY3Rvci5leGVjdXRlKGZuVCksIGRvbmUsIGRvbmUuZmFpbCwgJ2JlZm9yZUVhY2gnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRlc3RJbmplY3Rvci5leGVjdXRlKGZuVCk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgYmVmb3JlRWFjaCgoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBpZiAoKDxhbnk+Zm4pLmxlbmd0aCA9PT0gMCkge1xuICAgICAganNtQmVmb3JlRWFjaCgoKSA9PiB7ICg8U3luY1Rlc3RGbj5mbikoKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGpzbUJlZm9yZUVhY2goKGRvbmUpID0+IHsgKDxBc3luY1Rlc3RGbj5mbikoZG9uZSk7IH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERlZmluZSBhIHNpbmdsZSB0ZXN0IGNhc2Ugd2l0aCB0aGUgZ2l2ZW4gdGVzdCBuYW1lIGFuZCBleGVjdXRpb24gZnVuY3Rpb24uXG4gKlxuICogVGhlIHRlc3QgZnVuY3Rpb24gY2FuIGJlIGVpdGhlciBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uLCB0aGUgcmVzdWx0IG9mIHtAbGluayBhc3luY30sXG4gKiBvciBhbiBpbmplY3RlZCBmdW5jdGlvbiBjcmVhdGVkIHZpYSB7QGxpbmsgaW5qZWN0fS5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGl0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2Rlc2NyaWJlSXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBleGNsdWRlIHRoaXMgdGVzdFxuICogZW50aXJlbHkuIFVzZWZ1bCBmb3IgZGVidWdnaW5nIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsXG4gKiB0aGV5IGNhbiBiZSBmaXhlZC5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIHhpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4aXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24geGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBmaXR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1biB0aGlzIHRlc3QuXG4gKiBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGZpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmaXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG4iXX0=