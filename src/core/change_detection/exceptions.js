'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * An error thrown if application changes model breaking the top-down data flow.
 *
 * This exception is only thrown in dev mode.
 *
 * <!-- TODO: Add a link once the dev mode option is configurable -->
 *
 * ### Example
 *
 * ```typescript
 * @Component({
 *   selector: 'parent',
 *   template: `
 *     <child [prop]="parentProp"></child>
 *   `,
 *   directives: [forwardRef(() => Child)]
 * })
 * class Parent {
 *   parentProp = "init";
 * }
 *
 * @Directive({selector: 'child', inputs: ['prop']})
 * class Child {
 *   constructor(public parent: Parent) {}
 *
 *   set prop(v) {
 *     // this updates the parent property, which is disallowed during change detection
 *     // this will result in ExpressionChangedAfterItHasBeenCheckedException
 *     this.parent.parentProp = "updated";
 *   }
 * }
 * ```
 */
var ExpressionChangedAfterItHasBeenCheckedException = (function (_super) {
    __extends(ExpressionChangedAfterItHasBeenCheckedException, _super);
    function ExpressionChangedAfterItHasBeenCheckedException(exp, oldValue, currValue, context) {
        _super.call(this, ("Expression '" + exp + "' has changed after it was checked. ") +
            ("Previous value: '" + oldValue + "'. Current value: '" + currValue + "'"));
    }
    return ExpressionChangedAfterItHasBeenCheckedException;
})(exceptions_1.BaseException);
exports.ExpressionChangedAfterItHasBeenCheckedException = ExpressionChangedAfterItHasBeenCheckedException;
/**
 * Thrown when an expression evaluation raises an exception.
 *
 * This error wraps the original exception to attach additional contextual information that can
 * be useful for debugging.
 *
 * ### Example ([live demo](http://plnkr.co/edit/2Kywoz?p=preview))
 *
 * ```typescript
 * @Directive({selector: 'child', inputs: ['prop']})
 * class Child {
 *   prop;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <child [prop]="field.first"></child>
 *   `,
 *   directives: [Child]
 * })
 * class App {
 *   field = null;
 * }
 *
 * bootstrap(App);
 * ```
 *
 * You can access the original exception and stack through the `originalException` and
 * `originalStack` properties.
 */
var ChangeDetectionError = (function (_super) {
    __extends(ChangeDetectionError, _super);
    function ChangeDetectionError(exp, originalException, originalStack, context) {
        _super.call(this, originalException + " in [" + exp + "]", originalException, originalStack, context);
        this.location = exp;
    }
    return ChangeDetectionError;
})(exceptions_1.WrappedException);
exports.ChangeDetectionError = ChangeDetectionError;
/**
 * Thrown when change detector executes on dehydrated view.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 */
var DehydratedException = (function (_super) {
    __extends(DehydratedException, _super);
    function DehydratedException(details) {
        _super.call(this, "Attempt to use a dehydrated detector: " + details);
    }
    return DehydratedException;
})(exceptions_1.BaseException);
exports.DehydratedException = DehydratedException;
/**
 * Wraps an exception thrown by an event handler.
 */
var EventEvaluationError = (function (_super) {
    __extends(EventEvaluationError, _super);
    function EventEvaluationError(eventName, originalException, originalStack, context) {
        _super.call(this, "Error during evaluation of \"" + eventName + "\"", originalException, originalStack, context);
    }
    return EventEvaluationError;
})(exceptions_1.WrappedException);
exports.EventEvaluationError = EventEvaluationError;
/**
 * Error context included when an event handler throws an exception.
 */
var EventEvaluationErrorContext = (function () {
    function EventEvaluationErrorContext(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
    return EventEvaluationErrorContext;
})();
exports.EventEvaluationErrorContext = EventEvaluationErrorContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbiIsIkV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uRXJyb3IiLCJDaGFuZ2VEZXRlY3Rpb25FcnJvci5jb25zdHJ1Y3RvciIsIkRlaHlkcmF0ZWRFeGNlcHRpb24iLCJEZWh5ZHJhdGVkRXhjZXB0aW9uLmNvbnN0cnVjdG9yIiwiRXZlbnRFdmFsdWF0aW9uRXJyb3IiLCJFdmVudEV2YWx1YXRpb25FcnJvci5jb25zdHJ1Y3RvciIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dCIsIkV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSDtJQUFxRUEsbUVBQWFBO0lBQ2hGQSx5REFBWUEsR0FBV0EsRUFBRUEsUUFBYUEsRUFBRUEsU0FBY0EsRUFBRUEsT0FBWUE7UUFDbEVDLGtCQUNJQSxrQkFBZUEsR0FBR0EsMENBQXNDQTtZQUN4REEsdUJBQW9CQSxRQUFRQSwyQkFBc0JBLFNBQVNBLE9BQUdBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUNIRCxzREFBQ0E7QUFBREEsQ0FBQ0EsQUFORCxFQUFxRSwwQkFBYSxFQU1qRjtBQU5ZLHVEQUErQyxrREFNM0QsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUEwQ0Usd0NBQWdCQTtJQU14REEsOEJBQVlBLEdBQVdBLEVBQUVBLGlCQUFzQkEsRUFBRUEsYUFBa0JBLEVBQUVBLE9BQVlBO1FBQy9FQyxrQkFBU0EsaUJBQWlCQSxhQUFRQSxHQUFHQSxNQUFHQSxFQUFFQSxpQkFBaUJBLEVBQUVBLGFBQWFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3JGQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFDSEQsMkJBQUNBO0FBQURBLENBQUNBLEFBVkQsRUFBMEMsNkJBQWdCLEVBVXpEO0FBVlksNEJBQW9CLHVCQVVoQyxDQUFBO0FBRUQ7Ozs7OztHQU1HO0FBQ0g7SUFBeUNFLHVDQUFhQTtJQUNwREEsNkJBQVlBLE9BQWVBO1FBQUlDLGtCQUFNQSwyQ0FBeUNBLE9BQVNBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBQzdGRCwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxFQUF5QywwQkFBYSxFQUVyRDtBQUZZLDJCQUFtQixzQkFFL0IsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFBMENFLHdDQUFnQkE7SUFDeERBLDhCQUFZQSxTQUFpQkEsRUFBRUEsaUJBQXNCQSxFQUFFQSxhQUFrQkEsRUFBRUEsT0FBWUE7UUFDckZDLGtCQUFNQSxrQ0FBK0JBLFNBQVNBLE9BQUdBLEVBQUVBLGlCQUFpQkEsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaEdBLENBQUNBO0lBQ0hELDJCQUFDQTtBQUFEQSxDQUFDQSxBQUpELEVBQTBDLDZCQUFnQixFQUl6RDtBQUpZLDRCQUFvQix1QkFJaEMsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUUscUNBQ1dBLE9BQVlBLEVBQVNBLGdCQUFxQkEsRUFBU0EsT0FBWUEsRUFBU0EsTUFBV0EsRUFDbkZBLFFBQWFBO1FBRGJDLFlBQU9BLEdBQVBBLE9BQU9BLENBQUtBO1FBQVNBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBS0E7UUFBU0EsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBS0E7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBS0E7UUFDbkZBLGFBQVFBLEdBQVJBLFFBQVFBLENBQUtBO0lBQUdBLENBQUNBO0lBQzlCRCxrQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSlksbUNBQTJCLDhCQUl2QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG4vKipcbiAqIEFuIGVycm9yIHRocm93biBpZiBhcHBsaWNhdGlvbiBjaGFuZ2VzIG1vZGVsIGJyZWFraW5nIHRoZSB0b3AtZG93biBkYXRhIGZsb3cuXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgb25seSB0aHJvd24gaW4gZGV2IG1vZGUuXG4gKlxuICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIG9uY2UgdGhlIGRldiBtb2RlIG9wdGlvbiBpcyBjb25maWd1cmFibGUgLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYXJlbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZCBbcHJvcF09XCJwYXJlbnRQcm9wXCI+PC9jaGlsZD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW2ZvcndhcmRSZWYoKCkgPT4gQ2hpbGQpXVxuICogfSlcbiAqIGNsYXNzIFBhcmVudCB7XG4gKiAgIHBhcmVudFByb3AgPSBcImluaXRcIjtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2NoaWxkJywgaW5wdXRzOiBbJ3Byb3AnXX0pXG4gKiBjbGFzcyBDaGlsZCB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IFBhcmVudCkge31cbiAqXG4gKiAgIHNldCBwcm9wKHYpIHtcbiAqICAgICAvLyB0aGlzIHVwZGF0ZXMgdGhlIHBhcmVudCBwcm9wZXJ0eSwgd2hpY2ggaXMgZGlzYWxsb3dlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvblxuICogICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb25cbiAqICAgICB0aGlzLnBhcmVudC5wYXJlbnRQcm9wID0gXCJ1cGRhdGVkXCI7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXhwOiBzdHJpbmcsIG9sZFZhbHVlOiBhbnksIGN1cnJWYWx1ZTogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBzdXBlcihcbiAgICAgICAgYEV4cHJlc3Npb24gJyR7ZXhwfScgaGFzIGNoYW5nZWQgYWZ0ZXIgaXQgd2FzIGNoZWNrZWQuIGAgK1xuICAgICAgICBgUHJldmlvdXMgdmFsdWU6ICcke29sZFZhbHVlfScuIEN1cnJlbnQgdmFsdWU6ICcke2N1cnJWYWx1ZX0nYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhbiBleHByZXNzaW9uIGV2YWx1YXRpb24gcmFpc2VzIGFuIGV4Y2VwdGlvbi5cbiAqXG4gKiBUaGlzIGVycm9yIHdyYXBzIHRoZSBvcmlnaW5hbCBleGNlcHRpb24gdG8gYXR0YWNoIGFkZGl0aW9uYWwgY29udGV4dHVhbCBpbmZvcm1hdGlvbiB0aGF0IGNhblxuICogYmUgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzJLeXdvej9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnY2hpbGQnLCBpbnB1dHM6IFsncHJvcCddfSlcbiAqIGNsYXNzIENoaWxkIHtcbiAqICAgcHJvcDtcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxjaGlsZCBbcHJvcF09XCJmaWVsZC5maXJzdFwiPjwvY2hpbGQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBmaWVsZCA9IG51bGw7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqXG4gKiBZb3UgY2FuIGFjY2VzcyB0aGUgb3JpZ2luYWwgZXhjZXB0aW9uIGFuZCBzdGFjayB0aHJvdWdoIHRoZSBgb3JpZ2luYWxFeGNlcHRpb25gIGFuZFxuICogYG9yaWdpbmFsU3RhY2tgIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFuZ2VEZXRlY3Rpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICAvKipcbiAgICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGV4cHJlc3Npb24gdGhhdCB0cmlnZ2VyZWQgdGhlIGV4Y2VwdGlvbi5cbiAgICovXG4gIGxvY2F0aW9uOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZXhwOiBzdHJpbmcsIG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYCR7b3JpZ2luYWxFeGNlcHRpb259IGluIFske2V4cH1dYCwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGNvbnRleHQpO1xuICAgIHRoaXMubG9jYXRpb24gPSBleHA7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBjaGFuZ2UgZGV0ZWN0b3IgZXhlY3V0ZXMgb24gZGVoeWRyYXRlZCB2aWV3LlxuICpcbiAqIFRoaXMgZXJyb3IgaW5kaWNhdGVzIGEgYnVnIGluIHRoZSBmcmFtZXdvcmsuXG4gKlxuICogVGhpcyBpcyBhbiBpbnRlcm5hbCBBbmd1bGFyIGVycm9yLlxuICovXG5leHBvcnQgY2xhc3MgRGVoeWRyYXRlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihkZXRhaWxzOiBzdHJpbmcpIHsgc3VwZXIoYEF0dGVtcHQgdG8gdXNlIGEgZGVoeWRyYXRlZCBkZXRlY3RvcjogJHtkZXRhaWxzfWApOyB9XG59XG5cbi8qKlxuICogV3JhcHMgYW4gZXhjZXB0aW9uIHRocm93biBieSBhbiBldmVudCBoYW5kbGVyLlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRFdmFsdWF0aW9uRXJyb3IgZXh0ZW5kcyBXcmFwcGVkRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoZXZlbnROYW1lOiBzdHJpbmcsIG9yaWdpbmFsRXhjZXB0aW9uOiBhbnksIG9yaWdpbmFsU3RhY2s6IGFueSwgY29udGV4dDogYW55KSB7XG4gICAgc3VwZXIoYEVycm9yIGR1cmluZyBldmFsdWF0aW9uIG9mIFwiJHtldmVudE5hbWV9XCJgLCBvcmlnaW5hbEV4Y2VwdGlvbiwgb3JpZ2luYWxTdGFjaywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBFcnJvciBjb250ZXh0IGluY2x1ZGVkIHdoZW4gYW4gZXZlbnQgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRFdmFsdWF0aW9uRXJyb3JDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgY29udGV4dDogYW55LCBwdWJsaWMgbG9jYWxzOiBhbnksXG4gICAgICBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cbiJdfQ==