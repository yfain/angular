'use strict';var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
/**
 * Predicates for use with {@link DebugElement}'s query functions.
 */
var By = (function () {
    function By() {
    }
    /**
     * Match all elements.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_all'}
     */
    By.all = function () { return function (debugElement) { return true; }; };
    /**
     * Match elements by the given CSS selector.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_css'}
     */
    By.css = function (selector) {
        return function (debugElement) {
            return lang_1.isPresent(debugElement.nativeElement) ?
                dom_adapter_1.DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    };
    /**
     * Match elements that have the given directive present.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_directive'}
     */
    By.directive = function (type) {
        return function (debugElement) { return debugElement.providerTokens.indexOf(type) !== -1; };
    };
    return By;
})();
exports.By = By;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RlYnVnL2J5LnRzIl0sIm5hbWVzIjpbIkJ5IiwiQnkuY29uc3RydWN0b3IiLCJCeS5hbGwiLCJCeS5jc3MiLCJCeS5kaXJlY3RpdmUiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUF1QywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxFLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBRzFEOztHQUVHO0FBQ0g7SUFBQUE7SUFtQ0FDLENBQUNBO0lBbENDRDs7Ozs7O09BTUdBO0lBQ0lBLE1BQUdBLEdBQVZBLGNBQXdDRSxNQUFNQSxDQUFDQSxVQUFDQSxZQUFZQSxJQUFLQSxPQUFBQSxJQUFJQSxFQUFKQSxDQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV4RUY7Ozs7OztPQU1HQTtJQUNJQSxNQUFHQSxHQUFWQSxVQUFXQSxRQUFnQkE7UUFDekJHLE1BQU1BLENBQUNBLFVBQUNBLFlBQVlBO1lBQ2xCQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7Z0JBQ3hDQSxpQkFBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsQ0FBQ0E7Z0JBQ3hEQSxLQUFLQSxDQUFDQTtRQUNaQSxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUVESDs7Ozs7O09BTUdBO0lBQ0lBLFlBQVNBLEdBQWhCQSxVQUFpQkEsSUFBVUE7UUFDekJJLE1BQU1BLENBQUNBLFVBQUNBLFlBQVlBLElBQU9BLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3hGQSxDQUFDQTtJQUNISixTQUFDQTtBQUFEQSxDQUFDQSxBQW5DRCxJQW1DQztBQW5DWSxVQUFFLEtBbUNkLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJlZGljYXRlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtEZWJ1Z0VsZW1lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIFByZWRpY2F0ZXMgZm9yIHVzZSB3aXRoIHtAbGluayBEZWJ1Z0VsZW1lbnR9J3MgcXVlcnkgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQnkge1xuICAvKipcbiAgICogTWF0Y2ggYWxsIGVsZW1lbnRzLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBwbGF0Zm9ybS9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9hbGwnfVxuICAgKi9cbiAgc3RhdGljIGFsbCgpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7IHJldHVybiAoZGVidWdFbGVtZW50KSA9PiB0cnVlOyB9XG5cbiAgLyoqXG4gICAqIE1hdGNoIGVsZW1lbnRzIGJ5IHRoZSBnaXZlbiBDU1Mgc2VsZWN0b3IuXG4gICAqXG4gICAqICMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2Nzcyd9XG4gICAqL1xuICBzdGF0aWMgY3NzKHNlbGVjdG9yOiBzdHJpbmcpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7XG4gICAgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IHtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQoZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQpID9cbiAgICAgICAgICBET00uZWxlbWVudE1hdGNoZXMoZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIHNlbGVjdG9yKSA6XG4gICAgICAgICAgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXRjaCBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIGdpdmVuIGRpcmVjdGl2ZSBwcmVzZW50LlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBwbGF0Zm9ybS9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9kaXJlY3RpdmUnfVxuICAgKi9cbiAgc3RhdGljIGRpcmVjdGl2ZSh0eXBlOiBUeXBlKTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4ge1xuICAgIHJldHVybiAoZGVidWdFbGVtZW50KSA9PiB7IHJldHVybiBkZWJ1Z0VsZW1lbnQucHJvdmlkZXJUb2tlbnMuaW5kZXhPZih0eXBlKSAhPT0gLTE7IH07XG4gIH1cbn1cbiJdfQ==