import { isBlank } from 'angular2/src/facade/lang';
/**
 * Describes the current state of the change detector.
 */
export var ChangeDetectorState;
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
})(ChangeDetectorState || (ChangeDetectorState = {}));
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
export var ChangeDetectionStrategy;
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
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/**
 * List of possible {@link ChangeDetectionStrategy} values.
 */
export var CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce, ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways, ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush, ChangeDetectionStrategy.Default
];
/**
 * List of possible {@link ChangeDetectorState} values.
 */
export var CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked, ChangeDetectorState.CheckedBefore, ChangeDetectorState.Errored
];
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC13M0RSbFhKaS50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JTdGF0ZSIsIkNoYW5nZURldGVjdGlvblN0cmF0ZWd5IiwiaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiXSwibWFwcGluZ3MiOiJPQUFPLEVBQStCLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtBQUU5RTs7R0FFRztBQUNILFdBQVksbUJBbUJYO0FBbkJELFdBQVksbUJBQW1CO0lBQzdCQTs7O09BR0dBO0lBQ0hBLDZFQUFZQSxDQUFBQTtJQUVaQTs7O09BR0dBO0lBQ0hBLCtFQUFhQSxDQUFBQTtJQUViQTs7OztPQUlHQTtJQUNIQSxtRUFBT0EsQ0FBQUE7QUFDVEEsQ0FBQ0EsRUFuQlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQW1COUI7QUFFRDs7O0dBR0c7QUFDSCxXQUFZLHVCQWtDWDtBQWxDRCxXQUFZLHVCQUF1QjtJQUNqQ0M7OztPQUdHQTtJQUNIQSwrRUFBU0EsQ0FBQUE7SUFFVEE7OztPQUdHQTtJQUNIQSwyRUFBT0EsQ0FBQUE7SUFFUEE7OztPQUdHQTtJQUNIQSxtRkFBV0EsQ0FBQUE7SUFFWEE7OztPQUdHQTtJQUNIQSw2RUFBUUEsQ0FBQUE7SUFFUkE7O09BRUdBO0lBQ0hBLHlFQUFNQSxDQUFBQTtJQUVOQTs7T0FFR0E7SUFDSEEsMkVBQU9BLENBQUFBO0FBQ1RBLENBQUNBLEVBbENXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUFrQ2xDO0FBRUQ7O0dBRUc7QUFDSCxXQUFXLGdDQUFnQyxHQUFHO0lBQzVDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO0lBQ2xFLHVCQUF1QixDQUFDLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxRQUFRO0lBQ3JFLHVCQUF1QixDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO0NBQ2hFLENBQUM7QUFFRjs7R0FFRztBQUNILFdBQVcsNEJBQTRCLEdBQUc7SUFDeEMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxPQUFPO0NBQ2pHLENBQUM7QUFFRixpREFBaUQsdUJBQWdEO0lBRS9GQyxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSx1QkFBdUJBLENBQUNBO1FBQ25DQSx1QkFBdUJBLEtBQUtBLHVCQUF1QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7QUFDbEVBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBub3JtYWxpemVCb29sLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yLlxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3RvclN0YXRlIHtcbiAgLyoqXG4gICAqIGBOZXZlckNoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgbm90IGJlZW4gY2hlY2tlZCB5ZXQsIGFuZFxuICAgKiBpbml0aWFsaXphdGlvbiBtZXRob2RzIHNob3VsZCBiZSBjYWxsZWQgZHVyaW5nIGRldGVjdGlvbi5cbiAgICovXG4gIE5ldmVyQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrZWRCZWZvcmVgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBhdCBsZWFzdFxuICAgKiBvbmUgZGV0ZWN0aW9uIHByZXZpb3VzbHkuXG4gICAqL1xuICBDaGVja2VkQmVmb3JlLFxuXG4gIC8qKlxuICAgKiBgRXJyb3JlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGVuY291bnRlcmVkIGFuIGVycm9yIGNoZWNraW5nIGEgYmluZGluZ1xuICAgKiBvciBjYWxsaW5nIGEgZGlyZWN0aXZlIGxpZmVjeWNsZSBtZXRob2QgYW5kIGlzIG5vdyBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuIENoYW5nZVxuICAgKiBkZXRlY3RvcnMgaW4gdGhpcyBzdGF0ZSB3aWxsIG5vIGxvbmdlciBkZXRlY3QgY2hhbmdlcy5cbiAgICovXG4gIEVycm9yZWRcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgd2l0aGluIHRoZSBjaGFuZ2UgZGV0ZWN0b3Igd2hpY2ggc3RyYXRlZ3kgd2lsbCBiZSB1c2VkIHRoZSBuZXh0IHRpbWUgY2hhbmdlXG4gKiBkZXRlY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBgQ2hlY2tlZE9uY2VgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCBiZWNvbWUgYENoZWNrZWRgLlxuICAgKi9cbiAgQ2hlY2tPbmNlLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tlZGAgbWVhbnMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIHNob3VsZCBiZSBza2lwcGVkIHVudGlsIGl0cyBtb2RlIGNoYW5nZXMgdG9cbiAgICogYENoZWNrT25jZWAuXG4gICAqL1xuICBDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBgQ2hlY2tBbHdheXNgIG1lYW5zIHRoYXQgYWZ0ZXIgY2FsbGluZyBkZXRlY3RDaGFuZ2VzIHRoZSBtb2RlIG9mIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogd2lsbCByZW1haW4gYENoZWNrQWx3YXlzYC5cbiAgICovXG4gIENoZWNrQWx3YXlzLFxuXG4gIC8qKlxuICAgKiBgRGV0YWNoZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzdWIgdHJlZSBpcyBub3QgYSBwYXJ0IG9mIHRoZSBtYWluIHRyZWUgYW5kXG4gICAqIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgRGV0YWNoZWQsXG5cbiAgLyoqXG4gICAqIGBPblB1c2hgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBzZXQgdG8gYENoZWNrT25jZWAgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIE9uUHVzaCxcblxuICAvKipcbiAgICogYERlZmF1bHRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvcidzIG1vZGUgd2lsbCBiZSBzZXQgdG8gYENoZWNrQWx3YXlzYCBkdXJpbmcgaHlkcmF0aW9uLlxuICAgKi9cbiAgRGVmYXVsdCxcbn1cblxuLyoqXG4gKiBMaXN0IG9mIHBvc3NpYmxlIHtAbGluayBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gdmFsdWVzLlxuICovXG5leHBvcnQgdmFyIENIQU5HRV9ERVRFQ1RJT05fU1RSQVRFR1lfVkFMVUVTID0gW1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2UsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG5dO1xuXG4vKipcbiAqIExpc3Qgb2YgcG9zc2libGUge0BsaW5rIENoYW5nZURldGVjdG9yU3RhdGV9IHZhbHVlcy5cbiAqL1xuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUT1JfU1RBVEVfVkFMVUVTID0gW1xuICBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZCwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlLCBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWRcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneShjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpOlxuICAgIGJvb2xlYW4ge1xuICByZXR1cm4gaXNCbGFuayhjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSkgfHxcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19