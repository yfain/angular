'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var utils_1 = require('./utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var debug_node_1 = require('angular2/src/core/debug/debug_node');
/**
 * Fixture for debugging and testing a component.
 */
var ComponentFixture = (function () {
    function ComponentFixture() {
    }
    return ComponentFixture;
})();
exports.ComponentFixture = ComponentFixture;
var ComponentFixture_ = (function (_super) {
    __extends(ComponentFixture_, _super);
    function ComponentFixture_(componentRef) {
        _super.call(this);
        this._componentParentView = componentRef.hostView.internalView;
        this.elementRef = this._componentParentView.appElements[0].ref;
        this.debugElement = debug_node_1.getDebugNode(this._componentParentView.rootNodesOrAppElements[0].nativeElement);
        this.componentInstance = this.debugElement.componentInstance;
        this.nativeElement = this.debugElement.nativeElement;
        this._componentRef = componentRef;
    }
    ComponentFixture_.prototype.detectChanges = function () {
        this._componentParentView.changeDetector.detectChanges();
        this._componentParentView.changeDetector.checkNoChanges();
    };
    ComponentFixture_.prototype.destroy = function () { this._componentRef.dispose(); };
    return ComponentFixture_;
})(ComponentFixture);
exports.ComponentFixture_ = ComponentFixture_;
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
var TestComponentBuilder = (function () {
    function TestComponentBuilder(_injector) {
        this._injector = _injector;
        /** @internal */
        this._bindingsOverrides = new Map();
        /** @internal */
        this._directiveOverrides = new Map();
        /** @internal */
        this._templateOverrides = new Map();
        /** @internal */
        this._viewBindingsOverrides = new Map();
        /** @internal */
        this._viewOverrides = new Map();
    }
    /** @internal */
    TestComponentBuilder.prototype._clone = function () {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
        return clone;
    };
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideTemplate = function (componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    };
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideView = function (componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    };
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideDirective = function (componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!lang_1.isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideProviders = function (type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideBindings = function (type, providers) {
        return this.overrideProviders(type, providers);
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideViewProviders = function (type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideViewBindings = function (type, providers) {
        return this.overrideViewProviders(type, providers);
    };
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    TestComponentBuilder.prototype.createAsync = function (rootComponentType) {
        var mockDirectiveResolver = this._injector.get(core_1.DirectiveResolver);
        var mockViewResolver = this._injector.get(core_1.ViewResolver);
        this._viewOverrides.forEach(function (view, type) { return mockViewResolver.setView(type, view); });
        this._templateOverrides.forEach(function (template, type) { return mockViewResolver.setInlineTemplate(type, template); });
        this._directiveOverrides.forEach(function (overrides, component) {
            overrides.forEach(function (to, from) { mockViewResolver.overrideViewDirective(component, from, to); });
        });
        this._bindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setBindingsOverride(type, bindings); });
        this._viewBindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setViewBindingsOverride(type, bindings); });
        var rootElId = "root" + _nextRootElementId++;
        var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
        var doc = this._injector.get(dom_tokens_1.DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            dom_adapter_1.DOM.remove(oldRoots[i]);
        }
        dom_adapter_1.DOM.appendChild(doc.body, rootEl);
        var promise = this._injector.get(core_1.DynamicComponentLoader)
            .loadAsRoot(rootComponentType, "#" + rootElId, this._injector);
        return promise.then(function (componentRef) { return new ComponentFixture_(componentRef); });
    };
    TestComponentBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
})();
exports.TestComponentBuilder = TestComponentBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtMTRmNnBsTngudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmUuY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXyIsIkNvbXBvbmVudEZpeHR1cmVfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50Rml4dHVyZV8uZGV0ZWN0Q2hhbmdlcyIsIkNvbXBvbmVudEZpeHR1cmVfLmRlc3Ryb3kiLCJUZXN0Q29tcG9uZW50QnVpbGRlciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuX2Nsb25lIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVUZW1wbGF0ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlldyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlRGlyZWN0aXZlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUJpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3UHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3QmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jcmVhdGVBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBOEosZUFBZSxDQUFDLENBQUE7QUFFOUsscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsMkJBQXNDLGdDQUFnQyxDQUFDLENBQUE7QUFLdkUsc0JBQWlCLFNBQVMsQ0FBQyxDQUFBO0FB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QUNQQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSw2QkFBc0JBLENBQUNBO2FBQ3JDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLEVBQUVBLE1BQUlBLFFBQVVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3ZFQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxZQUFZQSxJQUFPQSxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3pGQSxDQUFDQTtJQXZLSFY7UUFBQ0EsaUJBQVVBLEVBQUVBOzs2QkF3S1pBO0lBQURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQXhLRCxJQXdLQztBQXZLWSw0QkFBb0IsdUJBdUtoQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnRSZWYsIERpcmVjdGl2ZVJlc29sdmVyLCBEeW5hbWljQ29tcG9uZW50TG9hZGVyLCBJbmplY3RvciwgSW5qZWN0YWJsZSwgVmlld01ldGFkYXRhLCBFbGVtZW50UmVmLCBFbWJlZGRlZFZpZXdSZWYsIFZpZXdSZXNvbHZlciwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtWaWV3UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuXG5pbXBvcnQge2VsfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtEZWJ1Z05vZGUsIERlYnVnRWxlbWVudCwgZ2V0RGVidWdOb2RlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kZWJ1Zy9kZWJ1Z19ub2RlJztcblxuXG4vKipcbiAqIEZpeHR1cmUgZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZyBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudEZpeHR1cmUge1xuICAvKipcbiAgICogVGhlIERlYnVnRWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIHJvb3QgY29tcG9uZW50IGNsYXNzLlxuICAgKi9cbiAgY29tcG9uZW50SW5zdGFuY2U6IGFueTtcblxuICAvKipcbiAgICogVGhlIG5hdGl2ZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYXRpdmVFbGVtZW50OiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBFbGVtZW50UmVmIGZvciB0aGUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogVHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgY29tcG9uZW50IGRlc3RydWN0aW9uLlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGaXh0dXJlXyBleHRlbmRzIENvbXBvbmVudEZpeHR1cmUge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50UGFyZW50VmlldzogQXBwVmlldztcblxuICBjb25zdHJ1Y3Rvcihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50VmlldyA9ICg8Vmlld1JlZl8+Y29tcG9uZW50UmVmLmhvc3RWaWV3KS5pbnRlcm5hbFZpZXc7XG4gICAgdGhpcy5lbGVtZW50UmVmID0gdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5hcHBFbGVtZW50c1swXS5yZWY7XG4gICAgdGhpcy5kZWJ1Z0VsZW1lbnQgPSA8RGVidWdFbGVtZW50PmdldERlYnVnTm9kZShcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzWzBdLm5hdGl2ZUVsZW1lbnQpO1xuICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLmRlYnVnRWxlbWVudC5jb21wb25lbnRJbnN0YW5jZTtcbiAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSB0aGlzLmRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcygpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY29tcG9uZW50UmVmLmRpc3Bvc2UoKTsgfVxufVxuXG52YXIgX25leHRSb290RWxlbWVudElkID0gMDtcblxuLyoqXG4gKiBCdWlsZHMgYSBDb21wb25lbnRGaXh0dXJlIGZvciB1c2UgaW4gY29tcG9uZW50IGxldmVsIHRlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9iaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuICAvKiogQGludGVybmFsICovXG4gIF90ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3T3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xvbmUoKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IG5ldyBUZXN0Q29tcG9uZW50QnVpbGRlcih0aGlzLl9pbmplY3Rvcik7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdPdmVycmlkZXMpO1xuICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmx5IHRoZSBodG1sIG9mIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAgICogQWxsIHRoZSBvdGhlciBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfSBhcmUgcHJlc2VydmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVGVtcGxhdGUoY29tcG9uZW50VHlwZTogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdGVtcGxhdGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHt2aWV3fSBWaWV3XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3KGNvbXBvbmVudFR5cGU6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB2aWV3KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkaXJlY3RpdmVzIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZURpcmVjdGl2ZShjb21wb25lbnRUeXBlOiBUeXBlLCBmcm9tOiBUeXBlLCB0bzogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIHZhciBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChvdmVycmlkZXNGb3JDb21wb25lbnQpKSB7XG4gICAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBuZXcgTWFwPFR5cGUsIFR5cGU+KCkpO1xuICAgICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgfVxuICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudC5zZXQoZnJvbSwgdG8pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlQmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVByb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXdQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZVZpZXdCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcmV0dXJucyBhIENvbXBvbmVudEZpeHR1cmUuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q29tcG9uZW50Rml4dHVyZT59XG4gICAqL1xuICBjcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50Rml4dHVyZT4ge1xuICAgIHZhciBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRGlyZWN0aXZlUmVzb2x2ZXIpO1xuICAgIHZhciBtb2NrVmlld1Jlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KFZpZXdSZXNvbHZlcik7XG4gICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgIHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICh0ZW1wbGF0ZSwgdHlwZSkgPT4gbW9ja1ZpZXdSZXNvbHZlci5zZXRJbmxpbmVUZW1wbGF0ZSh0eXBlLCB0ZW1wbGF0ZSkpO1xuICAgIHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5mb3JFYWNoKChvdmVycmlkZXMsIGNvbXBvbmVudCkgPT4ge1xuICAgICAgb3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgKHRvLCBmcm9tKSA9PiB7IG1vY2tWaWV3UmVzb2x2ZXIub3ZlcnJpZGVWaWV3RGlyZWN0aXZlKGNvbXBvbmVudCwgZnJvbSwgdG8pOyB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldEJpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcbiAgICB0aGlzLl92aWV3QmluZGluZ3NPdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgKGJpbmRpbmdzLCB0eXBlKSA9PiBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0Vmlld0JpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcblxuICAgIHZhciByb290RWxJZCA9IGByb290JHtfbmV4dFJvb3RFbGVtZW50SWQrK31gO1xuICAgIHZhciByb290RWwgPSBlbChgPGRpdiBpZD1cIiR7cm9vdEVsSWR9XCI+PC9kaXY+YCk7XG4gICAgdmFyIGRvYyA9IHRoaXMuX2luamVjdG9yLmdldChET0NVTUVOVCk7XG5cbiAgICAvLyBUT0RPKGp1bGllbXIpOiBjYW4vc2hvdWxkIHRoaXMgYmUgb3B0aW9uYWw/XG4gICAgdmFyIG9sZFJvb3RzID0gRE9NLnF1ZXJ5U2VsZWN0b3JBbGwoZG9jLCAnW2lkXj1yb290XScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkUm9vdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIERPTS5yZW1vdmUob2xkUm9vdHNbaV0pO1xuICAgIH1cbiAgICBET00uYXBwZW5kQ2hpbGQoZG9jLmJvZHksIHJvb3RFbCk7XG5cblxuICAgIHZhciBwcm9taXNlOiBQcm9taXNlPENvbXBvbmVudFJlZj4gPVxuICAgICAgICB0aGlzLl9pbmplY3Rvci5nZXQoRHluYW1pY0NvbXBvbmVudExvYWRlcilcbiAgICAgICAgICAgIC5sb2FkQXNSb290KHJvb3RDb21wb25lbnRUeXBlLCBgIyR7cm9vdEVsSWR9YCwgdGhpcy5faW5qZWN0b3IpO1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4oKGNvbXBvbmVudFJlZikgPT4geyByZXR1cm4gbmV3IENvbXBvbmVudEZpeHR1cmVfKGNvbXBvbmVudFJlZik7IH0pO1xuICB9XG59XG4iXX0=