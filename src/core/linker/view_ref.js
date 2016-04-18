'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
var change_detector_ref_1 = require('../change_detection/change_detector_ref');
var constants_1 = require('angular2/src/core/change_detection/constants');
var ViewRef = (function (_super) {
    __extends(ViewRef, _super);
    function ViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ViewRef.prototype, "changeDetectorRef", {
        /**
         * @internal
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ViewRef.prototype, "destroyed", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return ViewRef;
}(change_detector_ref_1.ChangeDetectorRef));
exports.ViewRef = ViewRef;
/**
 * Represents a View containing a single Element that is the Host Element of a {@link Component}
 * instance.
 *
 * A Host View is created for every dynamically created Component that was compiled on its own (as
 * opposed to as a part of another Component's Template) via {@link Compiler#compileInHost} or one
 * of the higher-level APIs: {@link AppViewManager#createRootHostView},
 * {@link AppViewManager#createHostViewInContainer}, {@link ViewContainerRef#createHostView}.
 */
var HostViewRef = (function (_super) {
    __extends(HostViewRef, _super);
    function HostViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(HostViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return HostViewRef;
}(ViewRef));
exports.HostViewRef = HostViewRef;
/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="var item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link ProtoViewRef}s:
 *
 * Outer {@link ProtoViewRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor var-item [ngForOf]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link ProtoViewRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link ProtoViewRef}s.
 *
 * The outer/inner {@link ProtoViewRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
var EmbeddedViewRef = (function (_super) {
    __extends(EmbeddedViewRef, _super);
    function EmbeddedViewRef() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(EmbeddedViewRef.prototype, "rootNodes", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return EmbeddedViewRef;
}(ViewRef));
exports.EmbeddedViewRef = EmbeddedViewRef;
var ViewRef_ = (function () {
    function ViewRef_(_view) {
        this._view = _view;
        this._view = _view;
    }
    Object.defineProperty(ViewRef_.prototype, "internalView", {
        get: function () { return this._view; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "changeDetectorRef", {
        /**
         * Return `ChangeDetectorRef`
         */
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "rootNodes", {
        get: function () { return this._view.flatRootNodes; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.setLocal = function (variableName, value) { this._view.setLocal(variableName, value); };
    ViewRef_.prototype.hasLocal = function (variableName) { return this._view.hasLocal(variableName); };
    Object.defineProperty(ViewRef_.prototype, "destroyed", {
        get: function () { return this._view.destroyed; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.markForCheck = function () { this._view.markPathToRootAsCheckOnce(); };
    ViewRef_.prototype.detach = function () { this._view.cdMode = constants_1.ChangeDetectionStrategy.Detached; };
    ViewRef_.prototype.detectChanges = function () { this._view.detectChanges(false); };
    ViewRef_.prototype.checkNoChanges = function () { this._view.detectChanges(true); };
    ViewRef_.prototype.reattach = function () {
        this._view.cdMode = constants_1.ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    };
    return ViewRef_;
}());
exports.ViewRef_ = ViewRef_;
var HostViewFactoryRef = (function () {
    function HostViewFactoryRef() {
    }
    return HostViewFactoryRef;
}());
exports.HostViewFactoryRef = HostViewFactoryRef;
var HostViewFactoryRef_ = (function () {
    function HostViewFactoryRef_(_hostViewFactory) {
        this._hostViewFactory = _hostViewFactory;
    }
    Object.defineProperty(HostViewFactoryRef_.prototype, "internalHostViewFactory", {
        get: function () { return this._hostViewFactory; },
        enumerable: true,
        configurable: true
    });
    return HostViewFactoryRef_;
}());
exports.HostViewFactoryRef_ = HostViewFactoryRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVgyNmVXdEs3LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsb0NBQWdDLHlDQUF5QyxDQUFDLENBQUE7QUFFMUUsMEJBQXNDLDhDQUE4QyxDQUFDLENBQUE7QUFFckY7SUFBc0MsMkJBQWlCO0lBQXZEO1FBQXNDLDhCQUFpQjtJQU92RCxDQUFDO0lBSEMsc0JBQUksc0NBQWlCO1FBSHJCOztXQUVHO2FBQ0gsY0FBNkMsTUFBTSxDQUFvQiwwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFFekYsc0JBQUksOEJBQVM7YUFBYixjQUEyQixNQUFNLENBQVUsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDL0QsY0FBQztBQUFELENBQUMsQUFQRCxDQUFzQyx1Q0FBaUIsR0FPdEQ7QUFQcUIsZUFBTyxVQU81QixDQUFBO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSDtJQUEwQywrQkFBTztJQUFqRDtRQUEwQyw4QkFBTztJQUVqRCxDQUFDO0lBREMsc0JBQUksa0NBQVM7YUFBYixjQUF5QixNQUFNLENBQVEsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7O0lBQzNELGtCQUFDO0FBQUQsQ0FBQyxBQUZELENBQTBDLE9BQU8sR0FFaEQ7QUFGcUIsbUJBQVcsY0FFaEMsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0g7SUFBOEMsbUNBQU87SUFBckQ7UUFBOEMsOEJBQU87SUFZckQsQ0FBQztJQURDLHNCQUFJLHNDQUFTO2FBQWIsY0FBeUIsTUFBTSxDQUFRLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUMzRCxzQkFBQztBQUFELENBQUMsQUFaRCxDQUE4QyxPQUFPLEdBWXBEO0FBWnFCLHVCQUFlLGtCQVlwQyxDQUFBO0FBRUQ7SUFDRSxrQkFBb0IsS0FBbUI7UUFBbkIsVUFBSyxHQUFMLEtBQUssQ0FBYztRQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQUMsQ0FBQztJQUVoRSxzQkFBSSxrQ0FBWTthQUFoQixjQUFtQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS3ZELHNCQUFJLHVDQUFpQjtRQUhyQjs7V0FFRzthQUNILGNBQTZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUzRCxzQkFBSSwrQkFBUzthQUFiLGNBQXlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTNELDJCQUFRLEdBQVIsVUFBUyxZQUFvQixFQUFFLEtBQVUsSUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTlGLDJCQUFRLEdBQVIsVUFBUyxZQUFvQixJQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckYsc0JBQUksK0JBQVM7YUFBYixjQUEyQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUV6RCwrQkFBWSxHQUFaLGNBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEUseUJBQU0sR0FBTixjQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxtQ0FBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLGdDQUFhLEdBQWIsY0FBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELGlDQUFjLEdBQWQsY0FBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELDJCQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxtQ0FBdUIsQ0FBQyxXQUFXLENBQUM7UUFDeEQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDSCxlQUFDO0FBQUQsQ0FBQyxBQTFCRCxJQTBCQztBQTFCWSxnQkFBUSxXQTBCcEIsQ0FBQTtBQUVEO0lBQUE7SUFBMEMsQ0FBQztJQUFELHlCQUFDO0FBQUQsQ0FBQyxBQUEzQyxJQUEyQztBQUFyQiwwQkFBa0IscUJBQUcsQ0FBQTtBQUUzQztJQUNFLDZCQUFvQixnQkFBaUM7UUFBakMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtJQUFHLENBQUM7SUFFekQsc0JBQUksd0RBQXVCO2FBQTNCLGNBQWlELE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNsRiwwQkFBQztBQUFELENBQUMsQUFKRCxJQUlDO0FBSlksMkJBQW1CLHNCQUkvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7QXBwVmlldywgSG9zdFZpZXdGYWN0b3J5fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld1JlZiBleHRlbmRzIENoYW5nZURldGVjdG9yUmVmIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIDxDaGFuZ2VEZXRlY3RvclJlZj51bmltcGxlbWVudGVkKCk7IH07XG5cbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHsgcmV0dXJuIDxib29sZWFuPnVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBWaWV3IGNvbnRhaW5pbmcgYSBzaW5nbGUgRWxlbWVudCB0aGF0IGlzIHRoZSBIb3N0IEVsZW1lbnQgb2YgYSB7QGxpbmsgQ29tcG9uZW50fVxuICogaW5zdGFuY2UuXG4gKlxuICogQSBIb3N0IFZpZXcgaXMgY3JlYXRlZCBmb3IgZXZlcnkgZHluYW1pY2FsbHkgY3JlYXRlZCBDb21wb25lbnQgdGhhdCB3YXMgY29tcGlsZWQgb24gaXRzIG93biAoYXNcbiAqIG9wcG9zZWQgdG8gYXMgYSBwYXJ0IG9mIGFub3RoZXIgQ29tcG9uZW50J3MgVGVtcGxhdGUpIHZpYSB7QGxpbmsgQ29tcGlsZXIjY29tcGlsZUluSG9zdH0gb3Igb25lXG4gKiBvZiB0aGUgaGlnaGVyLWxldmVsIEFQSXM6IHtAbGluayBBcHBWaWV3TWFuYWdlciNjcmVhdGVSb290SG9zdFZpZXd9LFxuICoge0BsaW5rIEFwcFZpZXdNYW5hZ2VyI2NyZWF0ZUhvc3RWaWV3SW5Db250YWluZXJ9LCB7QGxpbmsgVmlld0NvbnRhaW5lclJlZiNjcmVhdGVIb3N0Vmlld30uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIb3N0Vmlld1JlZiBleHRlbmRzIFZpZXdSZWYge1xuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIDxhbnlbXT51bmltcGxlbWVudGVkKCk7IH07XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBbmd1bGFyIFZpZXcuXG4gKlxuICogPCEtLSBUT0RPOiBtb3ZlIHRoZSBuZXh0IHR3byBwYXJhZ3JhcGhzIHRvIHRoZSBkZXYgZ3VpZGUgLS0+XG4gKiBBIFZpZXcgaXMgYSBmdW5kYW1lbnRhbCBidWlsZGluZyBibG9jayBvZiB0aGUgYXBwbGljYXRpb24gVUkuIEl0IGlzIHRoZSBzbWFsbGVzdCBncm91cGluZyBvZlxuICogRWxlbWVudHMgd2hpY2ggYXJlIGNyZWF0ZWQgYW5kIGRlc3Ryb3llZCB0b2dldGhlci5cbiAqXG4gKiBQcm9wZXJ0aWVzIG9mIGVsZW1lbnRzIGluIGEgVmlldyBjYW4gY2hhbmdlLCBidXQgdGhlIHN0cnVjdHVyZSAobnVtYmVyIGFuZCBvcmRlcikgb2YgZWxlbWVudHMgaW5cbiAqIGEgVmlldyBjYW5ub3QuIENoYW5naW5nIHRoZSBzdHJ1Y3R1cmUgb2YgRWxlbWVudHMgY2FuIG9ubHkgYmUgZG9uZSBieSBpbnNlcnRpbmcsIG1vdmluZyBvclxuICogcmVtb3ZpbmcgbmVzdGVkIFZpZXdzIHZpYSBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfS4gRWFjaCBWaWV3IGNhbiBjb250YWluIG1hbnkgVmlldyBDb250YWluZXJzLlxuICogPCEtLSAvVE9ETyAtLT5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEdpdmVuIHRoaXMgdGVtcGxhdGUuLi5cbiAqXG4gKiBgYGBcbiAqIENvdW50OiB7e2l0ZW1zLmxlbmd0aH19XG4gKiA8dWw+XG4gKiAgIDxsaSAqbmdGb3I9XCJ2YXIgaXRlbSBvZiBpdGVtc1wiPnt7aXRlbX19PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiAuLi4gd2UgaGF2ZSB0d28ge0BsaW5rIFByb3RvVmlld1JlZn1zOlxuICpcbiAqIE91dGVyIHtAbGluayBQcm90b1ZpZXdSZWZ9OlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8dGVtcGxhdGUgbmdGb3IgdmFyLWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIj48L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIElubmVyIHtAbGluayBQcm90b1ZpZXdSZWZ9OlxuICogYGBgXG4gKiAgIDxsaT57e2l0ZW19fTwvbGk+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgaXMgYnJva2VuIGRvd24gaW50byB0d28gc2VwYXJhdGUge0BsaW5rIFByb3RvVmlld1JlZn1zLlxuICpcbiAqIFRoZSBvdXRlci9pbm5lciB7QGxpbmsgUHJvdG9WaWV3UmVmfXMgYXJlIHRoZW4gYXNzZW1ibGVkIGludG8gdmlld3MgbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDwhLS0gVmlld1JlZjogb3V0ZXItMCAtLT5cbiAqIENvdW50OiAyXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSB2aWV3LWNvbnRhaW5lci1yZWY+PC90ZW1wbGF0ZT5cbiAqICAgPCEtLSBWaWV3UmVmOiBpbm5lci0xIC0tPjxsaT5maXJzdDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMSAtLT5cbiAqICAgPCEtLSBWaWV3UmVmOiBpbm5lci0yIC0tPjxsaT5zZWNvbmQ8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTIgLS0+XG4gKiA8L3VsPlxuICogPCEtLSAvVmlld1JlZjogb3V0ZXItMCAtLT5cbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW1iZWRkZWRWaWV3UmVmIGV4dGVuZHMgVmlld1JlZiB7XG4gIC8qKlxuICAgKiBTZXRzIGB2YWx1ZWAgb2YgbG9jYWwgdmFyaWFibGUgY2FsbGVkIGB2YXJpYWJsZU5hbWVgIGluIHRoaXMgVmlldy5cbiAgICovXG4gIGFic3RyYWN0IHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZDtcblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhpcyB2aWV3IGhhcyBhIGxvY2FsIHZhcmlhYmxlIGNhbGxlZCBgdmFyaWFibGVOYW1lYC5cbiAgICovXG4gIGFic3RyYWN0IGhhc0xvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIDxhbnlbXT51bmltcGxlbWVudGVkKCk7IH07XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmXyBpbXBsZW1lbnRzIEVtYmVkZGVkVmlld1JlZiwgSG9zdFZpZXdSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBBcHBWaWV3PGFueT4pIHsgdGhpcy5fdmlldyA9IF92aWV3OyB9XG5cbiAgZ2V0IGludGVybmFsVmlldygpOiBBcHBWaWV3PGFueT4geyByZXR1cm4gdGhpcy5fdmlldzsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYENoYW5nZURldGVjdG9yUmVmYFxuICAgKi9cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHRoaXM7IH1cblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIHRoaXMuX3ZpZXcuZmxhdFJvb3ROb2RlczsgfVxuXG4gIHNldExvY2FsKHZhcmlhYmxlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMuX3ZpZXcuc2V0TG9jYWwodmFyaWFibGVOYW1lLCB2YWx1ZSk7IH1cblxuICBoYXNMb2NhbCh2YXJpYWJsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdmlldy5oYXNMb2NhbCh2YXJpYWJsZU5hbWUpOyB9XG5cbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3ZpZXcuZGVzdHJveWVkOyB9XG5cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyB0aGlzLl92aWV3Lm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTsgfVxuICBkZXRhY2goKTogdm9pZCB7IHRoaXMuX3ZpZXcuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQ7IH1cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fdmlldy5kZXRlY3RDaGFuZ2VzKGZhbHNlKTsgfVxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fdmlldy5kZXRlY3RDaGFuZ2VzKHRydWUpOyB9XG4gIHJlYXR0YWNoKCk6IHZvaWQge1xuICAgIHRoaXMuX3ZpZXcuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tBbHdheXM7XG4gICAgdGhpcy5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSG9zdFZpZXdGYWN0b3J5UmVmIHt9XG5cbmV4cG9ydCBjbGFzcyBIb3N0Vmlld0ZhY3RvcnlSZWZfIGltcGxlbWVudHMgSG9zdFZpZXdGYWN0b3J5UmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdFZpZXdGYWN0b3J5OiBIb3N0Vmlld0ZhY3RvcnkpIHt9XG5cbiAgZ2V0IGludGVybmFsSG9zdFZpZXdGYWN0b3J5KCk6IEhvc3RWaWV3RmFjdG9yeSB7IHJldHVybiB0aGlzLl9ob3N0Vmlld0ZhY3Rvcnk7IH1cbn1cbiJdfQ==