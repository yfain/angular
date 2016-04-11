import { global } from 'angular2/src/facade/lang';
import { FunctionWithParamTokens, getTestInjector } from './test_injector';
export { inject, injectAsync } from './test_injector';
export { expect } from './matchers';
var _global = (typeof window === 'undefined' ? global : window);
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
export var afterEach = _global.afterEach;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export var describe = _global.describe;
/**
 * See {@link fdescribe}.
 */
export var ddescribe = _global.fdescribe;
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
export var fdescribe = _global.fdescribe;
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
export var xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testInjector = getTestInjector();
// Reset the test providers before each test.
jsmBeforeEach(() => { testInjector.reset(); });
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
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
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
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof FunctionWithParamTokens) {
        let testFnT = testFn;
        jsmFn(name, (done) => {
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(testFnT);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (testFnT.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(() => { done(); }, (err) => { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
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
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
export function beforeEach(fn) {
    if (fn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        let fnT = fn;
        jsmBeforeEach((done) => {
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(fnT);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (fnT.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(() => { done(); }, (err) => { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
                done();
            }
        });
    }
    else {
        // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
        if (fn.length === 0) {
            jsmBeforeEach(() => { fn(); });
        }
        else {
            jsmBeforeEach((done) => { fn(done); });
        }
    }
}
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, an asynchronous function
 * that takes a completion callback, or an injected function created via {@link inject}
 * or {@link injectAsync}. The test will automatically wait for any asynchronous calls
 * inside the injected test function to complete.
 *
 * Wrapper around Jasmine it function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export function it(name, fn, timeOut = null) {
    return _it(jsmIt, name, fn, timeOut);
}
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
export function xit(name, fn, timeOut = null) {
    return _it(jsmXIt, name, fn, timeOut);
}
/**
 * See {@link fit}.
 */
export function iit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
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
export function fit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSmcwY1hWQmYudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwiX2l0IiwiYmVmb3JlRWFjaCIsIml0IiwieGl0IiwiaWl0IiwiZml0Il0sIm1hcHBpbmdzIjoiT0FJTyxFQUFDLE1BQU0sRUFBQyxNQUFNLDBCQUEwQjtPQUl4QyxFQUNMLHVCQUF1QixFQUl2QixlQUFlLEVBQ2hCLE1BQU0saUJBQWlCO0FBRXhCLFNBQVEsTUFBTSxFQUFFLFdBQVcsUUFBTyxpQkFBaUIsQ0FBQztBQUVwRCxTQUFRLE1BQU0sUUFBbUIsWUFBWSxDQUFDO0FBRTlDLElBQUksT0FBTyxHQUFRLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUVyRTs7Ozs7Ozs7R0FRRztBQUNILFdBQVcsU0FBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7O0dBUUc7QUFDSCxXQUFXLFFBQVEsR0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBRWpEOztHQUVHO0FBQ0gsV0FBVyxTQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7O0dBU0c7QUFDSCxXQUFXLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7O0dBVUc7QUFDSCxXQUFXLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBa0JuRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN6QixJQUFJLE1B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LElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3ZDQSxDQUFDQTtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxvQkFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQU8sR0FBVyxJQUFJO0lBQ3hDQyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILG9CQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBTyxHQUFXLElBQUk7SUFDeENDLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3hDQSxDQUFDQTtBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILG9CQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBTyxHQUFXLElBQUk7SUFDeENDLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3hDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHVibGljIFRlc3QgTGlicmFyeSBmb3IgdW5pdCB0ZXN0aW5nIEFuZ3VsYXIyIEFwcGxpY2F0aW9ucy4gVXNlcyB0aGVcbiAqIEphc21pbmUgZnJhbWV3b3JrLlxuICovXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2JpbmR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBGdW5jdGlvbldpdGhQYXJhbVRva2VucyxcbiAgaW5qZWN0LFxuICBpbmplY3RBc3luYyxcbiAgVGVzdEluamVjdG9yLFxuICBnZXRUZXN0SW5qZWN0b3Jcbn0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtpbmplY3QsIGluamVjdEFzeW5jfSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2V4cGVjdCwgTmdNYXRjaGVyc30gZnJvbSAnLi9tYXRjaGVycyc7XG5cbnZhciBfZ2xvYmFsID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG4vKipcbiAqIFJ1biBhIGZ1bmN0aW9uICh3aXRoIGFuIG9wdGlvbmFsIGFzeW5jaHJvbm91cyBjYWxsYmFjaykgYWZ0ZXIgZWFjaCB0ZXN0IGNhc2UuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdhZnRlckVhY2gnfVxuICovXG5leHBvcnQgdmFyIGFmdGVyRWFjaDogRnVuY3Rpb24gPSBfZ2xvYmFsLmFmdGVyRWFjaDtcblxuLyoqXG4gKiBHcm91cCB0ZXN0IGNhc2VzIHRvZ2V0aGVyIHVuZGVyIGEgY29tbW9uIGRlc2NyaXB0aW9uIHByZWZpeC5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2Rlc2NyaWJlSXQnfVxuICovXG5leHBvcnQgdmFyIGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZGVzY3JpYmU7XG5cbi8qKlxuICogU2VlIHtAbGluayBmZGVzY3JpYmV9LlxuICovXG5leHBvcnQgdmFyIGRkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmZkZXNjcmliZTtcblxuLyoqXG4gKiBMaWtlIHtAbGluayBkZXNjcmliZX0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIG9ubHkgcnVuXG4gKiB0aGUgdGVzdCBjYXNlcyBpbiB0aGlzIGdyb3VwLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZmRlc2NyaWJlJ31cbiAqL1xuZXhwb3J0IHZhciBmZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgZGVzY3JpYmV9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBleGNsdWRlXG4gKiB0aGlzIGdyb3VwIG9mIHRlc3QgY2FzZXMgZnJvbSBleGVjdXRpb24uIFRoaXMgaXMgdXNlZnVsIGZvclxuICogZGVidWdnaW5nLCBvciBmb3IgZXhjbHVkaW5nIGJyb2tlbiB0ZXN0cyB1bnRpbCB0aGV5IGNhbiBiZSBmaXhlZC5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J3hkZXNjcmliZSd9XG4gKi9cbmV4cG9ydCB2YXIgeGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwueGRlc2NyaWJlO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYSBzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIChubyBhcmd1bWVudHMpLlxuICovXG5leHBvcnQgdHlwZSBTeW5jVGVzdEZuID0gKCkgPT4gdm9pZDtcblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGFuIGFzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIHdoaWNoIHRha2VzIGFcbiAqIGBkb25lYCBjYWxsYmFjay5cbiAqL1xuZXhwb3J0IHR5cGUgQXN5bmNUZXN0Rm4gPSAoZG9uZTogKCkgPT4gdm9pZCkgPT4gdm9pZDtcblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGFueSBzaW1wbGUgdGVzdGluZyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgQW55VGVzdEZuID0gU3luY1Rlc3RGbiB8IEFzeW5jVGVzdEZuO1xuXG52YXIganNtQmVmb3JlRWFjaCA9IF9nbG9iYWwuYmVmb3JlRWFjaDtcbnZhciBqc21JdCA9IF9nbG9iYWwuaXQ7XG52YXIganNtSUl0ID0gX2dsb2JhbC5maXQ7XG52YXIganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbnZhciB0ZXN0SW5qZWN0b3I6IFRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdC5cbmpzbUJlZm9yZUVhY2goKCkgPT4geyB0ZXN0SW5qZWN0b3IucmVzZXQoKTsgfSk7XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgb2YgdGhlIHRlc3QgaW5qZWN0b3IsXG4gKiB3aGljaCBhcmUgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2hQcm92aWRlcnMnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaFByb3ZpZGVycyhmbik6IHZvaWQge1xuICBqc21CZWZvcmVFYWNoKCgpID0+IHtcbiAgICB2YXIgcHJvdmlkZXJzID0gZm4oKTtcbiAgICBpZiAoIXByb3ZpZGVycykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB0ZXN0SW5qZWN0b3IuYWRkUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdiZWZvcmVFYWNoUHJvdmlkZXJzIHdhcyBjYWxsZWQgYWZ0ZXIgdGhlIGluamVjdG9yIGhhZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnYmVlbiB1c2VkIGluIGEgYmVmb3JlRWFjaCBvciBpdCBibG9jay4gVGhpcyBpbnZhbGlkYXRlcyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ3Rlc3QgaW5qZWN0b3InKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfaXNQcm9taXNlTGlrZShpbnB1dCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5wdXQgJiYgISEoaW5wdXQudGhlbik7XG59XG5cbmZ1bmN0aW9uIF9pdChqc21GbjogRnVuY3Rpb24sIG5hbWU6IHN0cmluZywgdGVzdEZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICB0ZXN0VGltZU91dDogbnVtYmVyKTogdm9pZCB7XG4gIHZhciB0aW1lT3V0ID0gdGVzdFRpbWVPdXQ7XG5cbiAgaWYgKHRlc3RGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgbGV0IHRlc3RGblQgPSB0ZXN0Rm47XG4gICAganNtRm4obmFtZSwgKGRvbmUpID0+IHtcbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybmVkVGVzdFZhbHVlID0gdGVzdEluamVjdG9yLmV4ZWN1dGUodGVzdEZuVCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgZG9uZS5mYWlsKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRlc3RGblQuaXNBc3luYykge1xuICAgICAgICBpZiAoX2lzUHJvbWlzZUxpa2UocmV0dXJuZWRUZXN0VmFsdWUpKSB7XG4gICAgICAgICAgKDxQcm9taXNlPGFueT4+cmV0dXJuZWRUZXN0VmFsdWUpLnRoZW4oKCkgPT4geyBkb25lKCk7IH0sIChlcnIpID0+IHsgZG9uZS5mYWlsKGVycik7IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdEFzeW5jIHdhcyBleHBlY3RlZCB0byByZXR1cm4gYSBwcm9taXNlLCBidXQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAnIHJldHVybmVkIHZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEocmV0dXJuZWRUZXN0VmFsdWUgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3QgcmV0dXJuZWQgYSB2YWx1ZS4gRGlkIHlvdSBtZWFuIHRvIHVzZSBpbmplY3RBc3luYz8gUmV0dXJuZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIHRpbWVPdXQpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBpdCgndGVzdCcsIChkb25lKSA9PiB7IC4uLiB9KSk7YFxuICAgIGpzbUZuKG5hbWUsIHRlc3RGbiwgdGltZU91dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGJlZm9yZUVhY2ggZnVuY3Rpb24uXG4gKlxuICogYmVmb3JlRWFjaCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYmVmb3JlRWFjaCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbik6IHZvaWQge1xuICBpZiAoZm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgdXNlcyBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goaW5qZWN0KFtDbGFzc0FdLCAoYSkgPT4geyAuLi5cbiAgICAvLyB9KSk7YFxuICAgIGxldCBmblQgPSBmbjtcbiAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7XG5cbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybmVkVGVzdFZhbHVlID0gdGVzdEluamVjdG9yLmV4ZWN1dGUoZm5UKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBkb25lLmZhaWwoZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGZuVC5pc0FzeW5jKSB7XG4gICAgICAgIGlmIChfaXNQcm9taXNlTGlrZShyZXR1cm5lZFRlc3RWYWx1ZSkpIHtcbiAgICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbigoKSA9PiB7IGRvbmUoKTsgfSwgKGVycikgPT4geyBkb25lLmZhaWwoZXJyKTsgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0QXN5bmMgd2FzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2UsIGJ1dCB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICcgcmV0dXJuZWQgdmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIShyZXR1cm5lZFRlc3RWYWx1ZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdCByZXR1cm5lZCBhIHZhbHVlLiBEaWQgeW91IG1lYW4gdG8gdXNlIGluamVjdEFzeW5jPyBSZXR1cm5lZCAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBkb25lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSBkb2Vzbid0IHVzZSBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goKGRvbmUpID0+IHsgLi4uIH0pKTtgXG4gICAgaWYgKCg8YW55PmZuKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGpzbUJlZm9yZUVhY2goKCkgPT4geyAoPFN5bmNUZXN0Rm4+Zm4pKCk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7ICg8QXN5bmNUZXN0Rm4+Zm4pKGRvbmUpOyB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaW5nbGUgdGVzdCBjYXNlIHdpdGggdGhlIGdpdmVuIHRlc3QgbmFtZSBhbmQgZXhlY3V0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIFRoZSB0ZXN0IGZ1bmN0aW9uIGNhbiBiZSBlaXRoZXIgYSBzeW5jaHJvbm91cyBmdW5jdGlvbiwgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uXG4gKiB0aGF0IHRha2VzIGEgY29tcGxldGlvbiBjYWxsYmFjaywgb3IgYW4gaW5qZWN0ZWQgZnVuY3Rpb24gY3JlYXRlZCB2aWEge0BsaW5rIGluamVjdH1cbiAqIG9yIHtAbGluayBpbmplY3RBc3luY30uIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseSB3YWl0IGZvciBhbnkgYXN5bmNocm9ub3VzIGNhbGxzXG4gKiBpbnNpZGUgdGhlIGluamVjdGVkIHRlc3QgZnVuY3Rpb24gdG8gY29tcGxldGUuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdkZXNjcmliZUl0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZSB0aGlzIHRlc3RcbiAqIGVudGlyZWx5LiBVc2VmdWwgZm9yIGRlYnVnZ2luZyBvciBmb3IgZXhjbHVkaW5nIGJyb2tlbiB0ZXN0cyB1bnRpbFxuICogdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSB4aXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGl0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHhpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbVhJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgZml0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW4gdGhpcyB0ZXN0LlxuICogVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBmaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZml0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuIl19