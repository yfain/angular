'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * Describes the current state of the change detector.
 */
(function (ChangeDetectorState) {
    /**
     * `NeverChecked` means that the change detector has not been checked yet, and
     * initialization methods should be called during detection.
     */
    ChangeDetectorState[ChangeDetectorState["NeverChecked"] = 0] = "NeverChecked";
    /**
     * `CheckedBefore` means that the change detector has successfully completed at least
     * one detection previously.
     */
    ChangeDetectorState[ChangeDetectorState["CheckedBefore"] = 1] = "CheckedBefore";
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    ChangeDetectorState[ChangeDetectorState["Errored"] = 2] = "Errored";
})(exports.ChangeDetectorState || (exports.ChangeDetectorState = {}));
var ChangeDetectorState = exports.ChangeDetectorState;
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
(function (ChangeDetectionStrategy) {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckOnce"] = 0] = "CheckOnce";
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Checked"] = 1] = "Checked";
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckAlways"] = 2] = "CheckAlways";
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Detached"] = 3] = "Detached";
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 4] = "OnPush";
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 5] = "Default";
})(exports.ChangeDetectionStrategy || (exports.ChangeDetectionStrategy = {}));
var ChangeDetectionStrategy = exports.ChangeDetectionStrategy;
/**
 * List of possible {@link ChangeDetectionStrategy} values.
 */
exports.CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce, ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways, ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush, ChangeDetectionStrategy.Default
];
/**
 * List of possible {@link ChangeDetectorState} values.
 */
exports.CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked, ChangeDetectorState.CheckedBefore, ChangeDetectorState.Errored
];
function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return lang_1.isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
exports.isDefaultChangeDetectionStrategy = isDefaultChangeDetectionStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JTdGF0ZSIsIkNoYW5nZURldGVjdGlvblN0cmF0ZWd5IiwiaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFvRCwwQkFBMEIsQ0FBQyxDQUFBO0FBRS9FOztHQUVHO0FBQ0gsV0FBWSxtQkFBbUI7SUFDN0JBOzs7T0FHR0E7SUFDSEEsNkVBQVlBLENBQUFBO0lBRVpBOzs7T0FHR0E7SUFDSEEsK0VBQWFBLENBQUFBO0lBRWJBOzs7O09BSUdBO0lBQ0hBLG1FQUFPQSxDQUFBQTtBQUNUQSxDQUFDQSxFQW5CVywyQkFBbUIsS0FBbkIsMkJBQW1CLFFBbUI5QjtBQW5CRCxJQUFZLG1CQUFtQixHQUFuQiwyQkFtQlgsQ0FBQTtBQUVEOzs7R0FHRztBQUNILFdBQVksdUJBQXVCO0lBQ2pDQzs7O09BR0dBO0lBQ0hBLCtFQUFTQSxDQUFBQTtJQUVUQTs7O09BR0dBO0lBQ0hBLDJFQUFPQSxDQUFBQTtJQUVQQTs7O09BR0dBO0lBQ0hBLG1GQUFXQSxDQUFBQTtJQUVYQTs7O09BR0dBO0lBQ0hBLDZFQUFRQSxDQUFBQTtJQUVSQTs7T0FFR0E7SUFDSEEseUVBQU1BLENBQUFBO0lBRU5BOztPQUVHQTtJQUNIQSwyRUFBT0EsQ0FBQUE7QUFDVEEsQ0FBQ0EsRUFsQ1csK0JBQXVCLEtBQXZCLCtCQUF1QixRQWtDbEM7QUFsQ0QsSUFBWSx1QkFBdUIsR0FBdkIsK0JBa0NYLENBQUE7QUFFRDs7R0FFRztBQUNRLHdDQUFnQyxHQUFHO0lBQzVDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO0lBQ2xFLHVCQUF1QixDQUFDLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxRQUFRO0lBQ3JFLHVCQUF1QixDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO0NBQ2hFLENBQUM7QUFFRjs7R0FFRztBQUNRLG9DQUE0QixHQUFHO0lBQ3hDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsT0FBTztDQUNqRyxDQUFDO0FBRUYsMENBQWlELHVCQUFnRDtJQUUvRkMsTUFBTUEsQ0FBQ0EsY0FBT0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTtRQUNuQ0EsdUJBQXVCQSxLQUFLQSx1QkFBdUJBLENBQUNBLE9BQU9BLENBQUNBO0FBQ2xFQSxDQUFDQTtBQUplLHdDQUFnQyxtQ0FJL0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U3RyaW5nV3JhcHBlciwgbm9ybWFsaXplQm9vbCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNoYW5nZSBkZXRlY3Rvci5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZSB7XG4gIC8qKlxuICAgKiBgTmV2ZXJDaGVja2VkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIG5vdCBiZWVuIGNoZWNrZWQgeWV0LCBhbmRcbiAgICogaW5pdGlhbGl6YXRpb24gbWV0aG9kcyBzaG91bGQgYmUgY2FsbGVkIGR1cmluZyBkZXRlY3Rpb24uXG4gICAqL1xuICBOZXZlckNoZWNrZWQsXG5cbiAgLyoqXG4gICAqIGBDaGVja2VkQmVmb3JlYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIHN1Y2Nlc3NmdWxseSBjb21wbGV0ZWQgYXQgbGVhc3RcbiAgICogb25lIGRldGVjdGlvbiBwcmV2aW91c2x5LlxuICAgKi9cbiAgQ2hlY2tlZEJlZm9yZSxcblxuICAvKipcbiAgICogYEVycm9yZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBlbmNvdW50ZXJlZCBhbiBlcnJvciBjaGVja2luZyBhIGJpbmRpbmdcbiAgICogb3IgY2FsbGluZyBhIGRpcmVjdGl2ZSBsaWZlY3ljbGUgbWV0aG9kIGFuZCBpcyBub3cgaW4gYW4gaW5jb25zaXN0ZW50IHN0YXRlLiBDaGFuZ2VcbiAgICogZGV0ZWN0b3JzIGluIHRoaXMgc3RhdGUgd2lsbCBubyBsb25nZXIgZGV0ZWN0IGNoYW5nZXMuXG4gICAqL1xuICBFcnJvcmVkXG59XG5cbi8qKlxuICogRGVzY3JpYmVzIHdpdGhpbiB0aGUgY2hhbmdlIGRldGVjdG9yIHdoaWNoIHN0cmF0ZWd5IHdpbGwgYmUgdXNlZCB0aGUgbmV4dCB0aW1lIGNoYW5nZVxuICogZGV0ZWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogYENoZWNrZWRPbmNlYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgYmVjb21lIGBDaGVja2VkYC5cbiAgICovXG4gIENoZWNrT25jZSxcblxuICAvKipcbiAgICogYENoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzaG91bGQgYmUgc2tpcHBlZCB1bnRpbCBpdHMgbW9kZSBjaGFuZ2VzIHRvXG4gICAqIGBDaGVja09uY2VgLlxuICAgKi9cbiAgQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrQWx3YXlzYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgcmVtYWluIGBDaGVja0Fsd2F5c2AuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogYERldGFjaGVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc3ViIHRyZWUgaXMgbm90IGEgcGFydCBvZiB0aGUgbWFpbiB0cmVlIGFuZFxuICAgKiBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICovXG4gIERldGFjaGVkLFxuXG4gIC8qKlxuICAgKiBgT25QdXNoYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja09uY2VgIGR1cmluZyBoeWRyYXRpb24uXG4gICAqL1xuICBPblB1c2gsXG5cbiAgLyoqXG4gICAqIGBEZWZhdWx0YCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja0Fsd2F5c2AgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIERlZmF1bHQsXG59XG5cbi8qKlxuICogTGlzdCBvZiBwb3NzaWJsZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IHZhbHVlcy5cbiAqL1xuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cywgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdFxuXTtcblxuLyoqXG4gKiBMaXN0IG9mIHBvc3NpYmxlIHtAbGluayBDaGFuZ2VEZXRlY3RvclN0YXRlfSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCB2YXIgQ0hBTkdFX0RFVEVDVE9SX1NUQVRFX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQsIENoYW5nZURldGVjdG9yU3RhdGUuQ2hlY2tlZEJlZm9yZSwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTpcbiAgICBib29sZWFuIHtcbiAgcmV0dXJuIGlzQmxhbmsoY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpIHx8XG4gICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdDtcbn1cbiJdfQ==