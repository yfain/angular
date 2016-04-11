import { isPresent } from 'angular2/src/facade/lang';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
/**
 * Predicates for use with {@link DebugElement}'s query functions.
 */
export class By {
    /**
     * Match all elements.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_all'}
     */
    static all() { return (debugElement) => true; }
    /**
     * Match elements by the given CSS selector.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_css'}
     */
    static css(selector) {
        return (debugElement) => {
            return isPresent(debugElement.nativeElement) ?
                DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    }
    /**
     * Match elements that have the given directive present.
     *
     * ## Example
     *
     * {@example platform/dom/debug/ts/by/by.ts region='by_directive'}
     */
    static directive(type) {
        return (debugElement) => { return debugElement.providerTokens.indexOf(type) !== -1; };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RlYnVnL2J5LnRzIl0sIm5hbWVzIjpbIkJ5IiwiQnkuYWxsIiwiQnkuY3NzIiwiQnkuZGlyZWN0aXZlIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFPLFNBQVMsRUFBVSxNQUFNLDBCQUEwQjtPQUUxRCxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztBQUd6RDs7R0FFRztBQUNIO0lBQ0VBOzs7Ozs7T0FNR0E7SUFDSEEsT0FBT0EsR0FBR0EsS0FBOEJDLE1BQU1BLENBQUNBLENBQUNBLFlBQVlBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRXhFRDs7Ozs7O09BTUdBO0lBQ0hBLE9BQU9BLEdBQUdBLENBQUNBLFFBQWdCQTtRQUN6QkUsTUFBTUEsQ0FBQ0EsQ0FBQ0EsWUFBWUE7WUFDbEJBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLFlBQVlBLENBQUNBLGFBQWFBLENBQUNBO2dCQUN4Q0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsQ0FBQ0E7Z0JBQ3hEQSxLQUFLQSxDQUFDQTtRQUNaQSxDQUFDQSxDQUFDQTtJQUNKQSxDQUFDQTtJQUVERjs7Ozs7O09BTUdBO0lBQ0hBLE9BQU9BLFNBQVNBLENBQUNBLElBQVVBO1FBQ3pCRyxNQUFNQSxDQUFDQSxDQUFDQSxZQUFZQSxPQUFPQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4RkEsQ0FBQ0E7QUFDSEgsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcmVkaWNhdGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0RlYnVnRWxlbWVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbi8qKlxuICogUHJlZGljYXRlcyBmb3IgdXNlIHdpdGgge0BsaW5rIERlYnVnRWxlbWVudH0ncyBxdWVyeSBmdW5jdGlvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCeSB7XG4gIC8qKlxuICAgKiBNYXRjaCBhbGwgZWxlbWVudHMuXG4gICAqXG4gICAqICMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2FsbCd9XG4gICAqL1xuICBzdGF0aWMgYWxsKCk6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+IHsgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IHRydWU7IH1cblxuICAvKipcbiAgICogTWF0Y2ggZWxlbWVudHMgYnkgdGhlIGdpdmVuIENTUyBzZWxlY3Rvci5cbiAgICpcbiAgICogIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgcGxhdGZvcm0vZG9tL2RlYnVnL3RzL2J5L2J5LnRzIHJlZ2lvbj0nYnlfY3NzJ31cbiAgICovXG4gIHN0YXRpYyBjc3Moc2VsZWN0b3I6IHN0cmluZyk6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+IHtcbiAgICByZXR1cm4gKGRlYnVnRWxlbWVudCkgPT4ge1xuICAgICAgcmV0dXJuIGlzUHJlc2VudChkZWJ1Z0VsZW1lbnQubmF0aXZlRWxlbWVudCkgP1xuICAgICAgICAgIERPTS5lbGVtZW50TWF0Y2hlcyhkZWJ1Z0VsZW1lbnQubmF0aXZlRWxlbWVudCwgc2VsZWN0b3IpIDpcbiAgICAgICAgICBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgZ2l2ZW4gZGlyZWN0aXZlIHByZXNlbnQuXG4gICAqXG4gICAqICMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtL2RvbS9kZWJ1Zy90cy9ieS9ieS50cyByZWdpb249J2J5X2RpcmVjdGl2ZSd9XG4gICAqL1xuICBzdGF0aWMgZGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7XG4gICAgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IHsgcmV0dXJuIGRlYnVnRWxlbWVudC5wcm92aWRlclRva2Vucy5pbmRleE9mKHR5cGUpICE9PSAtMTsgfTtcbiAgfVxufVxuIl19