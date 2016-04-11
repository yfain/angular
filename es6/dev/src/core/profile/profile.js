import * as impl from './wtf_impl';
// Change exports to const once https://github.com/angular/ts2dart/issues/150
/**
 * True if WTF is enabled.
 */
export var wtfEnabled = impl.detectWTF();
function noopScope(arg0, arg1) {
    return null;
}
/**
 * Create trace scope.
 *
 * Scopes must be strictly nested and are analogous to stack frames, but
 * do not have to follow the stack frames. Instead it is recommended that they follow logical
 * nesting. You may want to use
 * [Event
 * Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
 * as they are defined in WTF.
 *
 * Used to mark scope entry. The return value is used to leave the scope.
 *
 *     var myScope = wtfCreateScope('MyClass#myMethod(ascii someVal)');
 *
 *     someMethod() {
 *        var s = myScope('Foo'); // 'Foo' gets stored in tracing UI
 *        // DO SOME WORK HERE
 *        return wtfLeave(s, 123); // Return value 123
 *     }
 *
 * Note, adding try-finally block around the work to ensure that `wtfLeave` gets called can
 * negatively impact the performance of your application. For this reason we recommend that
 * you don't add them to ensure that `wtfLeave` gets called. In production `wtfLeave` is a noop and
 * so try-finally block has no value. When debugging perf issues, skipping `wtfLeave`, do to
 * exception, will produce incorrect trace, but presence of exception signifies logic error which
 * needs to be fixed before the app should be profiled. Add try-finally only when you expect that
 * an exception is expected during normal execution while profiling.
 *
 */
export var wtfCreateScope = wtfEnabled ? impl.createScope : (signature, flags) => noopScope;
/**
 * Used to mark end of Scope.
 *
 * - `scope` to end.
 * - `returnValue` (optional) to be passed to the WTF.
 *
 * Returns the `returnValue for easy chaining.
 */
export var wtfLeave = wtfEnabled ? impl.leave : (s, r) => r;
/**
 * Used to mark Async start. Async are similar to scope but they don't have to be strictly nested.
 * The return value is used in the call to [endAsync]. Async ranges only work if WTF has been
 * enabled.
 *
 *     someMethod() {
 *        var s = wtfStartTimeRange('HTTP:GET', 'some.url');
 *        var future = new Future.delay(5).then((_) {
 *          wtfEndTimeRange(s);
 *        });
 *     }
 */
export var wtfStartTimeRange = wtfEnabled ? impl.startTimeRange : (rangeType, action) => null;
/**
 * Ends a async time range operation.
 * [range] is the return value from [wtfStartTimeRange] Async ranges only work if WTF has been
 * enabled.
 */
export var wtfEndTimeRange = wtfEnabled ? impl.endTimeRange : (r) => null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL3Byb2ZpbGUvcHJvZmlsZS50cyJdLCJuYW1lcyI6WyJub29wU2NvcGUiXSwibWFwcGluZ3MiOiJBQUFzQyxPQUUvQixLQUFLLElBQUksTUFBTSxZQUFZO0FBRWxDLDZFQUE2RTtBQUU3RTs7R0FFRztBQUNILFdBQVcsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUV6QyxtQkFBbUIsSUFBVSxFQUFFLElBQVU7SUFDdkNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0FBQ2RBLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxXQUFXLGNBQWMsR0FDckIsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEtBQVcsS0FBSyxTQUFTLENBQUM7QUFFbEY7Ozs7Ozs7R0FPRztBQUNILFdBQVcsUUFBUSxHQUNmLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBTSxFQUFFLENBQU8sS0FBSyxDQUFDLENBQUM7QUFFckQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxXQUFXLGlCQUFpQixHQUN4QixVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLFNBQWlCLEVBQUUsTUFBYyxLQUFLLElBQUksQ0FBQztBQUVuRjs7OztHQUlHO0FBQ0gsV0FBVyxlQUFlLEdBQ3RCLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBTSxLQUFLLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7V3RmU2NvcGVGbn0gZnJvbSAnLi93dGZfaW1wbCc7XG5cbmltcG9ydCAqIGFzIGltcGwgZnJvbSAnLi93dGZfaW1wbCc7XG5cbi8vIENoYW5nZSBleHBvcnRzIHRvIGNvbnN0IG9uY2UgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvdHMyZGFydC9pc3N1ZXMvMTUwXG5cbi8qKlxuICogVHJ1ZSBpZiBXVEYgaXMgZW5hYmxlZC5cbiAqL1xuZXhwb3J0IHZhciB3dGZFbmFibGVkID0gaW1wbC5kZXRlY3RXVEYoKTtcblxuZnVuY3Rpb24gbm9vcFNjb3BlKGFyZzA/OiBhbnksIGFyZzE/OiBhbnkpOiBhbnkge1xuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdHJhY2Ugc2NvcGUuXG4gKlxuICogU2NvcGVzIG11c3QgYmUgc3RyaWN0bHkgbmVzdGVkIGFuZCBhcmUgYW5hbG9nb3VzIHRvIHN0YWNrIGZyYW1lcywgYnV0XG4gKiBkbyBub3QgaGF2ZSB0byBmb2xsb3cgdGhlIHN0YWNrIGZyYW1lcy4gSW5zdGVhZCBpdCBpcyByZWNvbW1lbmRlZCB0aGF0IHRoZXkgZm9sbG93IGxvZ2ljYWxcbiAqIG5lc3RpbmcuIFlvdSBtYXkgd2FudCB0byB1c2VcbiAqIFtFdmVudFxuICogU2lnbmF0dXJlc10oaHR0cDovL2dvb2dsZS5naXRodWIuaW8vdHJhY2luZy1mcmFtZXdvcmsvaW5zdHJ1bWVudGluZy1jb2RlLmh0bWwjY3VzdG9tLWV2ZW50cylcbiAqIGFzIHRoZXkgYXJlIGRlZmluZWQgaW4gV1RGLlxuICpcbiAqIFVzZWQgdG8gbWFyayBzY29wZSBlbnRyeS4gVGhlIHJldHVybiB2YWx1ZSBpcyB1c2VkIHRvIGxlYXZlIHRoZSBzY29wZS5cbiAqXG4gKiAgICAgdmFyIG15U2NvcGUgPSB3dGZDcmVhdGVTY29wZSgnTXlDbGFzcyNteU1ldGhvZChhc2NpaSBzb21lVmFsKScpO1xuICpcbiAqICAgICBzb21lTWV0aG9kKCkge1xuICogICAgICAgIHZhciBzID0gbXlTY29wZSgnRm9vJyk7IC8vICdGb28nIGdldHMgc3RvcmVkIGluIHRyYWNpbmcgVUlcbiAqICAgICAgICAvLyBETyBTT01FIFdPUksgSEVSRVxuICogICAgICAgIHJldHVybiB3dGZMZWF2ZShzLCAxMjMpOyAvLyBSZXR1cm4gdmFsdWUgMTIzXG4gKiAgICAgfVxuICpcbiAqIE5vdGUsIGFkZGluZyB0cnktZmluYWxseSBibG9jayBhcm91bmQgdGhlIHdvcmsgdG8gZW5zdXJlIHRoYXQgYHd0ZkxlYXZlYCBnZXRzIGNhbGxlZCBjYW5cbiAqIG5lZ2F0aXZlbHkgaW1wYWN0IHRoZSBwZXJmb3JtYW5jZSBvZiB5b3VyIGFwcGxpY2F0aW9uLiBGb3IgdGhpcyByZWFzb24gd2UgcmVjb21tZW5kIHRoYXRcbiAqIHlvdSBkb24ndCBhZGQgdGhlbSB0byBlbnN1cmUgdGhhdCBgd3RmTGVhdmVgIGdldHMgY2FsbGVkLiBJbiBwcm9kdWN0aW9uIGB3dGZMZWF2ZWAgaXMgYSBub29wIGFuZFxuICogc28gdHJ5LWZpbmFsbHkgYmxvY2sgaGFzIG5vIHZhbHVlLiBXaGVuIGRlYnVnZ2luZyBwZXJmIGlzc3Vlcywgc2tpcHBpbmcgYHd0ZkxlYXZlYCwgZG8gdG9cbiAqIGV4Y2VwdGlvbiwgd2lsbCBwcm9kdWNlIGluY29ycmVjdCB0cmFjZSwgYnV0IHByZXNlbmNlIG9mIGV4Y2VwdGlvbiBzaWduaWZpZXMgbG9naWMgZXJyb3Igd2hpY2hcbiAqIG5lZWRzIHRvIGJlIGZpeGVkIGJlZm9yZSB0aGUgYXBwIHNob3VsZCBiZSBwcm9maWxlZC4gQWRkIHRyeS1maW5hbGx5IG9ubHkgd2hlbiB5b3UgZXhwZWN0IHRoYXRcbiAqIGFuIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCBkdXJpbmcgbm9ybWFsIGV4ZWN1dGlvbiB3aGlsZSBwcm9maWxpbmcuXG4gKlxuICovXG5leHBvcnQgdmFyIHd0ZkNyZWF0ZVNjb3BlOiAoc2lnbmF0dXJlOiBzdHJpbmcsIGZsYWdzPzogYW55KSA9PiBpbXBsLld0ZlNjb3BlRm4gPVxuICAgIHd0ZkVuYWJsZWQgPyBpbXBsLmNyZWF0ZVNjb3BlIDogKHNpZ25hdHVyZTogc3RyaW5nLCBmbGFncz86IGFueSkgPT4gbm9vcFNjb3BlO1xuXG4vKipcbiAqIFVzZWQgdG8gbWFyayBlbmQgb2YgU2NvcGUuXG4gKlxuICogLSBgc2NvcGVgIHRvIGVuZC5cbiAqIC0gYHJldHVyblZhbHVlYCAob3B0aW9uYWwpIHRvIGJlIHBhc3NlZCB0byB0aGUgV1RGLlxuICpcbiAqIFJldHVybnMgdGhlIGByZXR1cm5WYWx1ZSBmb3IgZWFzeSBjaGFpbmluZy5cbiAqL1xuZXhwb3J0IHZhciB3dGZMZWF2ZTogPFQ+KHNjb3BlOiBhbnksIHJldHVyblZhbHVlPzogVCkgPT4gVCA9XG4gICAgd3RmRW5hYmxlZCA/IGltcGwubGVhdmUgOiAoczogYW55LCByPzogYW55KSA9PiByO1xuXG4vKipcbiAqIFVzZWQgdG8gbWFyayBBc3luYyBzdGFydC4gQXN5bmMgYXJlIHNpbWlsYXIgdG8gc2NvcGUgYnV0IHRoZXkgZG9uJ3QgaGF2ZSB0byBiZSBzdHJpY3RseSBuZXN0ZWQuXG4gKiBUaGUgcmV0dXJuIHZhbHVlIGlzIHVzZWQgaW4gdGhlIGNhbGwgdG8gW2VuZEFzeW5jXS4gQXN5bmMgcmFuZ2VzIG9ubHkgd29yayBpZiBXVEYgaGFzIGJlZW5cbiAqIGVuYWJsZWQuXG4gKlxuICogICAgIHNvbWVNZXRob2QoKSB7XG4gKiAgICAgICAgdmFyIHMgPSB3dGZTdGFydFRpbWVSYW5nZSgnSFRUUDpHRVQnLCAnc29tZS51cmwnKTtcbiAqICAgICAgICB2YXIgZnV0dXJlID0gbmV3IEZ1dHVyZS5kZWxheSg1KS50aGVuKChfKSB7XG4gKiAgICAgICAgICB3dGZFbmRUaW1lUmFuZ2Uocyk7XG4gKiAgICAgICAgfSk7XG4gKiAgICAgfVxuICovXG5leHBvcnQgdmFyIHd0ZlN0YXJ0VGltZVJhbmdlOiAocmFuZ2VUeXBlOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSA9PiBhbnkgPVxuICAgIHd0ZkVuYWJsZWQgPyBpbXBsLnN0YXJ0VGltZVJhbmdlIDogKHJhbmdlVHlwZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykgPT4gbnVsbDtcblxuLyoqXG4gKiBFbmRzIGEgYXN5bmMgdGltZSByYW5nZSBvcGVyYXRpb24uXG4gKiBbcmFuZ2VdIGlzIHRoZSByZXR1cm4gdmFsdWUgZnJvbSBbd3RmU3RhcnRUaW1lUmFuZ2VdIEFzeW5jIHJhbmdlcyBvbmx5IHdvcmsgaWYgV1RGIGhhcyBiZWVuXG4gKiBlbmFibGVkLlxuICovXG5leHBvcnQgdmFyIHd0ZkVuZFRpbWVSYW5nZTogKHJhbmdlOiBhbnkpID0+IHZvaWQgPVxuICAgIHd0ZkVuYWJsZWQgPyBpbXBsLmVuZFRpbWVSYW5nZSA6IChyOiBhbnkpID0+IG51bGw7XG4iXX0=