'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
var ViewContainerRef = (function () {
    function ViewContainerRef() {
    }
    Object.defineProperty(ViewContainerRef.prototype, "element", {
        /**
         * Anchor element that specifies the location of this container in the containing View.
         * <!-- TODO: rename to anchorElement -->
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    /**
     * Destroys all Views in this container.
     */
    ViewContainerRef.prototype.clear = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
        }
    };
    Object.defineProperty(ViewContainerRef.prototype, "length", {
        /**
         * Returns the number of Views currently attached to this container.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ViewContainerRef;
})();
exports.ViewContainerRef = ViewContainerRef;
var ViewContainerRef_ = (function (_super) {
    __extends(ViewContainerRef_, _super);
    function ViewContainerRef_(_element) {
        _super.call(this);
        this._element = _element;
    }
    ViewContainerRef_.prototype.get = function (index) { return this._element.nestedViews[index].ref; };
    Object.defineProperty(ViewContainerRef_.prototype, "length", {
        get: function () {
            var views = this._element.nestedViews;
            return lang_1.isPresent(views) ? views.length : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "element", {
        get: function () { return this._element.ref; },
        enumerable: true,
        configurable: true
    });
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.createEmbeddedViewInContainer(this._element.ref, index, templateRef);
    };
    ViewContainerRef_.prototype.createHostView = function (hostViewFactoryRef, index, dynamicallyCreatedProviders, projectableNodes) {
        if (index === void 0) { index = -1; }
        if (dynamicallyCreatedProviders === void 0) { dynamicallyCreatedProviders = null; }
        if (projectableNodes === void 0) { projectableNodes = null; }
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.createHostViewInContainer(this._element.ref, index, hostViewFactoryRef, dynamicallyCreatedProviders, projectableNodes);
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.insert = function (viewRef, index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.attachViewInContainer(this._element.ref, index, viewRef);
    };
    ViewContainerRef_.prototype.indexOf = function (viewRef) {
        return collection_1.ListWrapper.indexOf(this._element.nestedViews, viewRef.internalView);
    };
    // TODO(i): rename to destroy
    ViewContainerRef_.prototype.remove = function (index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length - 1;
        var vm = this._element.parentView.viewManager;
        return vm.destroyViewInContainer(this._element.ref, index);
        // view is intentionally not returned to the client.
    };
    // TODO(i): refactor insert+remove into move
    ViewContainerRef_.prototype.detach = function (index) {
        if (index === void 0) { index = -1; }
        if (index == -1)
            index = this.length - 1;
        var vm = this._element.parentView.viewManager;
        return vm.detachViewInContainer(this._element.ref, index);
    };
    return ViewContainerRef_;
})(ViewContainerRef);
exports.ViewContainerRef_ = ViewContainerRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6WyJWaWV3Q29udGFpbmVyUmVmIiwiVmlld0NvbnRhaW5lclJlZi5jb25zdHJ1Y3RvciIsIlZpZXdDb250YWluZXJSZWYuZWxlbWVudCIsIlZpZXdDb250YWluZXJSZWYuY2xlYXIiLCJWaWV3Q29udGFpbmVyUmVmLmxlbmd0aCIsIlZpZXdDb250YWluZXJSZWZfIiwiVmlld0NvbnRhaW5lclJlZl8uY29uc3RydWN0b3IiLCJWaWV3Q29udGFpbmVyUmVmXy5nZXQiLCJWaWV3Q29udGFpbmVyUmVmXy5sZW5ndGgiLCJWaWV3Q29udGFpbmVyUmVmXy5lbGVtZW50IiwiVmlld0NvbnRhaW5lclJlZl8uY3JlYXRlRW1iZWRkZWRWaWV3IiwiVmlld0NvbnRhaW5lclJlZl8uY3JlYXRlSG9zdFZpZXciLCJWaWV3Q29udGFpbmVyUmVmXy5pbnNlcnQiLCJWaWV3Q29udGFpbmVyUmVmXy5pbmRleE9mIiwiVmlld0NvbnRhaW5lclJlZl8ucmVtb3ZlIiwiVmlld0NvbnRhaW5lclJlZl8uZGV0YWNoIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzNELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdELHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBUTVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFBQUE7SUFrRkFDLENBQUNBO0lBN0VDRCxzQkFBSUEscUNBQU9BO1FBSlhBOzs7V0FHR0E7YUFDSEEsY0FBNEJFLE1BQU1BLENBQWFBLDBCQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRWpFQTs7T0FFR0E7SUFDSEEs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QUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzNEQSxvREFBb0RBO0lBQ3REQSxDQUFDQTtJQUVEVCw0Q0FBNENBO0lBQzVDQSxrQ0FBTUEsR0FBTkEsVUFBT0EsS0FBa0JBO1FBQWxCVSxxQkFBa0JBLEdBQWxCQSxTQUFpQkEsQ0FBQ0E7UUFDdkJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQ3pDQSxJQUFJQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUM5Q0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM1REEsQ0FBQ0E7SUFDSFYsd0JBQUNBO0FBQURBLENBQUNBLEFBdkRELEVBQXVDLGdCQUFnQixFQXVEdEQ7QUF2RFkseUJBQWlCLG9CQXVEN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Jlc29sdmVkUHJvdmlkZXIsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5cbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZiwgVGVtcGxhdGVSZWZffSBmcm9tICcuL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge0VtYmVkZGVkVmlld1JlZiwgSG9zdFZpZXdSZWYsIEhvc3RWaWV3RmFjdG9yeVJlZiwgSG9zdFZpZXdGYWN0b3J5UmVmXywgVmlld1JlZiwgVmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb250YWluZXIgd2hlcmUgb25lIG9yIG1vcmUgVmlld3MgY2FuIGJlIGF0dGFjaGVkLlxuICpcbiAqIFRoZSBjb250YWluZXIgY2FuIGNvbnRhaW4gdHdvIGtpbmRzIG9mIFZpZXdzLiBIb3N0IFZpZXdzLCBjcmVhdGVkIGJ5IGluc3RhbnRpYXRpbmcgYVxuICoge0BsaW5rIENvbXBvbmVudH0gdmlhIHtAbGluayAjY3JlYXRlSG9zdFZpZXd9LCBhbmQgRW1iZWRkZWQgVmlld3MsIGNyZWF0ZWQgYnkgaW5zdGFudGlhdGluZyBhblxuICoge0BsaW5rIFRlbXBsYXRlUmVmIEVtYmVkZGVkIFRlbXBsYXRlfSB2aWEge0BsaW5rICNjcmVhdGVFbWJlZGRlZFZpZXd9LlxuICpcbiAqIFRoZSBsb2NhdGlvbiBvZiB0aGUgVmlldyBDb250YWluZXIgd2l0aGluIHRoZSBjb250YWluaW5nIFZpZXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBBbmNob3JcbiAqIGBlbGVtZW50YC4gRWFjaCBWaWV3IENvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBBbmNob3IgRWxlbWVudCBhbmQgZWFjaCBBbmNob3IgRWxlbWVudCBjYW4gb25seVxuICogaGF2ZSBhIHNpbmdsZSBWaWV3IENvbnRhaW5lci5cbiAqXG4gKiBSb290IGVsZW1lbnRzIG9mIFZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGJlY29tZSBzaWJsaW5ncyBvZiB0aGUgQW5jaG9yIEVsZW1lbnQgaW5cbiAqIHRoZSBSZW5kZXJlZCBWaWV3LlxuICpcbiAqIFRvIGFjY2VzcyBhIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBFbGVtZW50LCB5b3UgY2FuIGVpdGhlciBwbGFjZSBhIHtAbGluayBEaXJlY3RpdmV9IGluamVjdGVkXG4gKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgRWxlbWVudCwgb3IgeW91IG9idGFpbiBpdCB2aWFcbiAqIHtAbGluayBBcHBWaWV3TWFuYWdlciNnZXRWaWV3Q29udGFpbmVyfS5cbiAqXG4gKiA8IS0tIFRPRE8oaSk6IHdlIGFyZSBhbHNvIGNvbnNpZGVyaW5nIEVsZW1lbnRSZWYjdmlld0NvbnRhaW5lciBhcGkgLS0+XG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3Q29udGFpbmVyUmVmIHtcbiAgLyoqXG4gICAqIEFuY2hvciBlbGVtZW50IHRoYXQgc3BlY2lmaWVzIHRoZSBsb2NhdGlvbiBvZiB0aGlzIGNvbnRhaW5lciBpbiB0aGUgY29udGFpbmluZyBWaWV3LlxuICAgKiA8IS0tIFRPRE86IHJlbmFtZSB0byBhbmNob3JFbGVtZW50IC0tPlxuICAgKi9cbiAgZ2V0IGVsZW1lbnQoKTogRWxlbWVudFJlZiB7IHJldHVybiA8RWxlbWVudFJlZj51bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIFZpZXdzIGluIHRoaXMgY29udGFpbmVyLlxuICAgKi9cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHRoaXMucmVtb3ZlKGkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgVmlld1JlZn0gZm9yIHRoZSBWaWV3IGxvY2F0ZWQgaW4gdGhpcyBjb250YWluZXIgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAgICovXG4gIGFic3RyYWN0IGdldChpbmRleDogbnVtYmVyKTogVmlld1JlZjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIFZpZXdzIGN1cnJlbnRseSBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lci5cbiAgICovXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIDxudW1iZXI+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYW4gRW1iZWRkZWQgVmlldyBiYXNlZCBvbiB0aGUge0BsaW5rIFRlbXBsYXRlUmVmIGB0ZW1wbGF0ZVJlZmB9IGFuZCBpbnNlcnRzIGl0XG4gICAqIGludG8gdGhpcyBjb250YWluZXIgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBJZiBgaW5kZXhgIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBuZXcgVmlldyB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IFZpZXcgaW4gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFZpZXdSZWZ9IGZvciB0aGUgbmV3bHkgY3JlYXRlZCBWaWV3LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlRW1iZWRkZWRWaWV3KHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZiwgaW5kZXg/OiBudW1iZXIpOiBFbWJlZGRlZFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhIHNpbmdsZSB7QGxpbmsgQ29tcG9uZW50fSBhbmQgaW5zZXJ0cyBpdHMgSG9zdCBWaWV3IGludG8gdGhpcyBjb250YWluZXIgYXQgdGhlXG4gICAqIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB1c2luZyBpdHMge0BsaW5rIFByb3RvVmlld1JlZiBgcHJvdG9WaWV3YH0gd2hpY2ggY2FuIGJlXG4gICAqIG9idGFpbmVkIHZpYSB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZUluSG9zdH0uXG4gICAqXG4gICAqIElmIGBpbmRleGAgaXMgbm90IHNwZWNpZmllZCwgdGhlIG5ldyBWaWV3IHdpbGwgYmUgaW5zZXJ0ZWQgYXMgdGhlIGxhc3QgVmlldyBpbiB0aGUgY29udGFpbmVyLlxuICAgKlxuICAgKiBZb3UgY2FuIG9wdGlvbmFsbHkgc3BlY2lmeSBgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzYCwgd2hpY2ggY29uZmlndXJlIHRoZSB7QGxpbmsgSW5qZWN0b3J9XG4gICAqIHRoYXQgd2lsbCBiZSBjcmVhdGVkIGZvciB0aGUgSG9zdCBWaWV3LlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgSG9zdFZpZXdSZWZ9IG9mIHRoZSBIb3N0IFZpZXcgY3JlYXRlZCBmb3IgdGhlIG5ld2x5IGluc3RhbnRpYXRlZCBDb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVIb3N0VmlldyhcbiAgICAgIGhvc3RWaWV3RmFjdG9yeVJlZjogSG9zdFZpZXdGYWN0b3J5UmVmLCBpbmRleD86IG51bWJlcixcbiAgICAgIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVycz86IFJlc29sdmVkUHJvdmlkZXJbXSwgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10pOiBIb3N0Vmlld1JlZjtcblxuICAvKipcbiAgICogSW5zZXJ0cyBhIFZpZXcgaWRlbnRpZmllZCBieSBhIHtAbGluayBWaWV3UmVmfSBpbnRvIHRoZSBjb250YWluZXIgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLlxuICAgKlxuICAgKiBJZiBgaW5kZXhgIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBuZXcgVmlldyB3aWxsIGJlIGluc2VydGVkIGFzIHRoZSBsYXN0IFZpZXcgaW4gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogUmV0dXJucyB0aGUgaW5zZXJ0ZWQge0BsaW5rIFZpZXdSZWZ9LlxuICAgKi9cbiAgYWJzdHJhY3QgaW5zZXJ0KHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZiwgaW5kZXg/OiBudW1iZXIpOiBFbWJlZGRlZFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBWaWV3LCBzcGVjaWZpZWQgdmlhIHtAbGluayBWaWV3UmVmfSwgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lciBvclxuICAgKiBgLTFgIGlmIHRoaXMgY29udGFpbmVyIGRvZXNuJ3QgY29udGFpbiB0aGUgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlcjtcblxuICAvKipcbiAgICogRGVzdHJveXMgYSBWaWV3IGF0dGFjaGVkIHRvIHRoaXMgY29udGFpbmVyIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC5cbiAgICpcbiAgICogSWYgYGluZGV4YCBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgbGFzdCBWaWV3IGluIHRoZSBjb250YWluZXIgd2lsbCBiZSByZW1vdmVkLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlKGluZGV4PzogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogVXNlIGFsb25nIHdpdGgge0BsaW5rICNpbnNlcnR9IHRvIG1vdmUgYSBWaWV3IHdpdGhpbiB0aGUgY3VycmVudCBjb250YWluZXIuXG4gICAqXG4gICAqIElmIHRoZSBgaW5kZXhgIHBhcmFtIGlzIG9taXR0ZWQsIHRoZSBsYXN0IHtAbGluayBWaWV3UmVmfSBpcyBkZXRhY2hlZC5cbiAgICovXG4gIGFic3RyYWN0IGRldGFjaChpbmRleD86IG51bWJlcik6IEVtYmVkZGVkVmlld1JlZjtcbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb250YWluZXJSZWZfIGV4dGVuZHMgVmlld0NvbnRhaW5lclJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnQ6IEFwcEVsZW1lbnQpIHsgc3VwZXIoKTsgfVxuXG4gIGdldChpbmRleDogbnVtYmVyKTogRW1iZWRkZWRWaWV3UmVmIHsgcmV0dXJuIHRoaXMuX2VsZW1lbnQubmVzdGVkVmlld3NbaW5kZXhdLnJlZjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fZWxlbWVudC5uZXN0ZWRWaWV3cztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZpZXdzKSA/IHZpZXdzLmxlbmd0aCA6IDA7XG4gIH1cblxuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmXyB7IHJldHVybiB0aGlzLl9lbGVtZW50LnJlZjsgfVxuXG4gIC8vIFRPRE8ocmFkbyk6IHByb2ZpbGUgYW5kIGRlY2lkZSB3aGV0aGVyIGJvdW5kcyBjaGVja3Mgc2hvdWxkIGJlIGFkZGVkXG4gIC8vIHRvIHRoZSBtZXRob2RzIGJlbG93LlxuICBjcmVhdGVFbWJlZGRlZFZpZXcodGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLCBpbmRleDogbnVtYmVyID0gLTEpOiBFbWJlZGRlZFZpZXdSZWYge1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aDtcbiAgICB2YXIgdm0gPSB0aGlzLl9lbGVtZW50LnBhcmVudFZpZXcudmlld01hbmFnZXI7XG4gICAgcmV0dXJuIHZtLmNyZWF0ZUVtYmVkZGVkVmlld0luQ29udGFpbmVyKHRoaXMuX2VsZW1lbnQucmVmLCBpbmRleCwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgY3JlYXRlSG9zdFZpZXcoXG4gICAgICBob3N0Vmlld0ZhY3RvcnlSZWY6IEhvc3RWaWV3RmFjdG9yeVJlZiwgaW5kZXg6IG51bWJlciA9IC0xLFxuICAgICAgZHluYW1pY2FsbHlDcmVhdGVkUHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10gPSBudWxsLFxuICAgICAgcHJvamVjdGFibGVOb2RlczogYW55W11bXSA9IG51bGwpOiBIb3N0Vmlld1JlZiB7XG4gICAgaWYgKGluZGV4ID09IC0xKSBpbmRleCA9IHRoaXMubGVuZ3RoO1xuICAgIHZhciB2bSA9IHRoaXMuX2VsZW1lbnQucGFyZW50Vmlldy52aWV3TWFuYWdlcjtcbiAgICByZXR1cm4gdm0uY3JlYXRlSG9zdFZpZXdJbkNvbnRhaW5lcihcbiAgICAgICAgdGhpcy5fZWxlbWVudC5yZWYsIGluZGV4LCBob3N0Vmlld0ZhY3RvcnlSZWYsIGR5bmFtaWNhbGx5Q3JlYXRlZFByb3ZpZGVycyxcbiAgICAgICAgcHJvamVjdGFibGVOb2Rlcyk7XG4gIH1cblxuICAvLyBUT0RPKGkpOiByZWZhY3RvciBpbnNlcnQrcmVtb3ZlIGludG8gbW92ZVxuICBpbnNlcnQodmlld1JlZjogVmlld1JlZiwgaW5kZXg6IG51bWJlciA9IC0xKTogRW1iZWRkZWRWaWV3UmVmIHtcbiAgICBpZiAoaW5kZXggPT0gLTEpIGluZGV4ID0gdGhpcy5sZW5ndGg7XG4gICAgdmFyIHZtID0gdGhpcy5fZWxlbWVudC5wYXJlbnRWaWV3LnZpZXdNYW5hZ2VyO1xuICAgIHJldHVybiB2bS5hdHRhY2hWaWV3SW5Db250YWluZXIodGhpcy5fZWxlbWVudC5yZWYsIGluZGV4LCB2aWV3UmVmKTtcbiAgfVxuXG4gIGluZGV4T2Yodmlld1JlZjogVmlld1JlZik6IG51bWJlciB7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmluZGV4T2YodGhpcy5fZWxlbWVudC5uZXN0ZWRWaWV3cywgKDxWaWV3UmVmXz52aWV3UmVmKS5pbnRlcm5hbFZpZXcpO1xuICB9XG5cbiAgLy8gVE9ETyhpKTogcmVuYW1lIHRvIGRlc3Ryb3lcbiAgcmVtb3ZlKGluZGV4OiBudW1iZXIgPSAtMSk6IHZvaWQge1xuICAgIGlmIChpbmRleCA9PSAtMSkgaW5kZXggPSB0aGlzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHZtID0gdGhpcy5fZWxlbWVudC5wYXJlbnRWaWV3LnZpZXdNYW5hZ2VyO1xuICAgIHJldHVybiB2bS5kZXN0cm95Vmlld0luQ29udGFpbmVyKHRoaXMuX2VsZW1lbnQucmVmLCBpbmRleCk7XG4gICAgLy8gdmlldyBpcyBpbnRlbnRpb25hbGx5IG5vdCByZXR1cm5lZCB0byB0aGUgY2xpZW50LlxuICB9XG5cbiAgLy8gVE9ETyhpKTogcmVmYWN0b3IgaW5zZXJ0K3JlbW92ZSBpbnRvIG1vdmVcbiAgZGV0YWNoKGluZGV4OiBudW1iZXIgPSAtMSk6IEVtYmVkZGVkVmlld1JlZiB7XG4gICAgaWYgKGluZGV4ID09IC0xKSBpbmRleCA9IHRoaXMubGVuZ3RoIC0gMTtcbiAgICB2YXIgdm0gPSB0aGlzLl9lbGVtZW50LnBhcmVudFZpZXcudmlld01hbmFnZXI7XG4gICAgcmV0dXJuIHZtLmRldGFjaFZpZXdJbkNvbnRhaW5lcih0aGlzLl9lbGVtZW50LnJlZiwgaW5kZXgpO1xuICB9XG59XG4iXX0=