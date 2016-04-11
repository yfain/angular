var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DirectiveResolver, DynamicComponentLoader, Injector, Injectable, ViewResolver } from 'angular2/core';
import { isPresent } from 'angular2/src/facade/lang';
import { MapWrapper } from 'angular2/src/facade/collection';
import { el } from './utils';
import { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { getDebugNode } from 'angular2/src/core/debug/debug_node';
/**
 * Fixture for debugging and testing a component.
 */
export class ComponentFixture {
}
export class ComponentFixture_ extends ComponentFixture {
    constructor(componentRef) {
        super();
        this._componentParentView = componentRef.hostView.internalView;
        this.elementRef = this._componentParentView.appElements[0].ref;
        this.debugElement = getDebugNode(this._componentParentView.rootNodesOrAppElements[0].nativeElement);
        this.componentInstance = this.debugElement.componentInstance;
        this.nativeElement = this.debugElement.nativeElement;
        this._componentRef = componentRef;
    }
    detectChanges() {
        this._componentParentView.changeDetector.detectChanges();
        this._componentParentView.changeDetector.checkNoChanges();
    }
    destroy() { this._componentRef.dispose(); }
}
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
export let TestComponentBuilder = class {
    constructor(_injector) {
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
    _clone() {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
        return clone;
    }
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    overrideTemplate(componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    }
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    overrideView(componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    }
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    overrideDirective(componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    }
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
    overrideProviders(type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideBindings(type, providers) {
        return this.overrideProviders(type, providers);
    }
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
    overrideViewProviders(type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideViewBindings(type, providers) {
        return this.overrideViewProviders(type, providers);
    }
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    createAsync(rootComponentType) {
        var mockDirectiveResolver = this._injector.get(DirectiveResolver);
        var mockViewResolver = this._injector.get(ViewResolver);
        this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
        this._templateOverrides.forEach((template, type) => mockViewResolver.setInlineTemplate(type, template));
        this._directiveOverrides.forEach((overrides, component) => {
            overrides.forEach((to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
        });
        this._bindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setBindingsOverride(type, bindings));
        this._viewBindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setViewBindingsOverride(type, bindings));
        var rootElId = `root${_nextRootElementId++}`;
        var rootEl = el(`<div id="${rootElId}"></div>`);
        var doc = this._injector.get(DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            DOM.remove(oldRoots[i]);
        }
        DOM.appendChild(doc.body, rootEl);
        var promise = this._injector.get(DynamicComponentLoader)
            .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector);
        return promise.then((componentRef) => { return new ComponentFixture_(componentRef); });
    }
};
TestComponentBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Injector])
], TestComponentBuilder);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmVfIiwiQ29tcG9uZW50Rml4dHVyZV8uY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXy5kZXRlY3RDaGFuZ2VzIiwiQ29tcG9uZW50Rml4dHVyZV8uZGVzdHJveSIsIlRlc3RDb21wb25lbnRCdWlsZGVyIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuY29uc3RydWN0b3IiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5fY2xvbmUiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVRlbXBsYXRlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3IiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVEaXJlY3RpdmUiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVByb3ZpZGVycyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlQmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVZpZXdQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVZpZXdCaW5kaW5ncyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLmNyZWF0ZUFzeW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFlLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQTZDLFlBQVksRUFBVSxNQUFNLGVBQWU7T0FFdEssRUFBTyxTQUFTLEVBQVUsTUFBTSwwQkFBMEI7T0FDMUQsRUFBYyxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FLL0QsRUFBQyxF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O0lBQ3pGQSxDQUFDQTtBQUNIVixDQUFDQTtBQXhLRDtJQUFDLFVBQVUsRUFBRTs7eUJBd0taO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudFJlZiwgRGlyZWN0aXZlUmVzb2x2ZXIsIER5bmFtaWNDb21wb25lbnRMb2FkZXIsIEluamVjdG9yLCBJbmplY3RhYmxlLCBWaWV3TWV0YWRhdGEsIEVsZW1lbnRSZWYsIEVtYmVkZGVkVmlld1JlZiwgVmlld1Jlc29sdmVyLCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1ZpZXdSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5cbmltcG9ydCB7ZWx9IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge0RlYnVnTm9kZSwgRGVidWdFbGVtZW50LCBnZXREZWJ1Z05vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX25vZGUnO1xuXG5cbi8qKlxuICogRml4dHVyZSBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdGl2ZUVsZW1lbnQ6IGFueTtcblxuICAvKipcbiAgICogVGhlIEVsZW1lbnRSZWYgZm9yIHRoZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBlbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IGRldGVjdENoYW5nZXMoKTogdm9pZDtcblxuICAvKipcbiAgICogVHJpZ2dlciBjb21wb25lbnQgZGVzdHJ1Y3Rpb24uXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZpeHR1cmVfIGV4dGVuZHMgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmO1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRQYXJlbnRWaWV3OiBBcHBWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3ID0gKDxWaWV3UmVmXz5jb21wb25lbnRSZWYuaG9zdFZpZXcpLmludGVybmFsVmlldztcbiAgICB0aGlzLmVsZW1lbnRSZWYgPSB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmFwcEVsZW1lbnRzWzBdLnJlZjtcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IDxEZWJ1Z0VsZW1lbnQ+Z2V0RGVidWdOb2RlKFxuICAgICAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbMF0ubmF0aXZlRWxlbWVudCk7XG4gICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZSA9IHRoaXMuZGVidWdFbGVtZW50LmNvbXBvbmVudEluc3RhbmNlO1xuICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IHRoaXMuZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jb21wb25lbnRSZWYuZGlzcG9zZSgpOyB9XG59XG5cbnZhciBfbmV4dFJvb3RFbGVtZW50SWQgPSAwO1xuXG4vKipcbiAqIEJ1aWxkcyBhIENvbXBvbmVudEZpeHR1cmUgZm9yIHVzZSBpbiBjb21wb25lbnQgbGV2ZWwgdGVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlyZWN0aXZlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBNYXA8VHlwZSwgVHlwZT4+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RlbXBsYXRlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbG9uZSgpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gbmV3IFRlc3RDb21wb25lbnRCdWlsZGVyKHRoaXMuX2luamVjdG9yKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdmlld092ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9ubHkgdGhlIGh0bWwgb2YgYSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICAgKiBBbGwgdGhlIG90aGVyIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9IGFyZSBwcmVzZXJ2ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVUZW1wbGF0ZShjb21wb25lbnRUeXBlOiBUeXBlLCB0ZW1wbGF0ZTogc3RyaW5nKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBhIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3ZpZXd9IFZpZXdcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXcoY29tcG9uZW50VHlwZTogVHlwZSwgdmlldzogVmlld01ldGFkYXRhKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHZpZXcpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgY29tcG9uZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IGZyb21cbiAgICogQHBhcmFtIHtUeXBlfSB0b1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlRGlyZWN0aXZlKGNvbXBvbmVudFR5cGU6IFR5cGUsIGZyb206IFR5cGUsIHRvOiBUeXBlKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgdmFyIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KG92ZXJyaWRlc0ZvckNvbXBvbmVudCkpIHtcbiAgICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIG5ldyBNYXA8VHlwZSwgVHlwZT4oKSk7XG4gICAgICBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICB9XG4gICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50LnNldChmcm9tLCB0byk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVByb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX2JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlUHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlVmlld0JpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCByZXR1cm5zIGEgQ29tcG9uZW50Rml4dHVyZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPn1cbiAgICovXG4gIGNyZWF0ZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPiB7XG4gICAgdmFyIG1vY2tEaXJlY3RpdmVSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChEaXJlY3RpdmVSZXNvbHZlcik7XG4gICAgdmFyIG1vY2tWaWV3UmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoVmlld1Jlc29sdmVyKTtcbiAgICB0aGlzLl92aWV3T3ZlcnJpZGVzLmZvckVhY2goKHZpZXcsIHR5cGUpID0+IG1vY2tWaWV3UmVzb2x2ZXIuc2V0Vmlldyh0eXBlLCB2aWV3KSk7XG4gICAgdGhpcy5fdGVtcGxhdGVPdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgKHRlbXBsYXRlLCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldElubGluZVRlbXBsYXRlKHR5cGUsIHRlbXBsYXRlKSk7XG4gICAgdGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzLmZvckVhY2goKG92ZXJyaWRlcywgY29tcG9uZW50KSA9PiB7XG4gICAgICBvdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgICAodG8sIGZyb20pID0+IHsgbW9ja1ZpZXdSZXNvbHZlci5vdmVycmlkZVZpZXdEaXJlY3RpdmUoY29tcG9uZW50LCBmcm9tLCB0byk7IH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fYmluZGluZ3NPdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgKGJpbmRpbmdzLCB0eXBlKSA9PiBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAoYmluZGluZ3MsIHR5cGUpID0+IG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRWaWV3QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuXG4gICAgdmFyIHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgdmFyIHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICB2YXIgZG9jID0gdGhpcy5faW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcblxuICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICB2YXIgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRSb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgfVxuICAgIERPTS5hcHBlbmRDaGlsZChkb2MuYm9keSwgcm9vdEVsKTtcblxuXG4gICAgdmFyIHByb21pc2U6IFByb21pc2U8Q29tcG9uZW50UmVmPiA9XG4gICAgICAgIHRoaXMuX2luamVjdG9yLmdldChEeW5hbWljQ29tcG9uZW50TG9hZGVyKVxuICAgICAgICAgICAgLmxvYWRBc1Jvb3Qocm9vdENvbXBvbmVudFR5cGUsIGAjJHtyb290RWxJZH1gLCB0aGlzLl9pbmplY3Rvcik7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoY29tcG9uZW50UmVmKSA9PiB7IHJldHVybiBuZXcgQ29tcG9uZW50Rml4dHVyZV8oY29tcG9uZW50UmVmKTsgfSk7XG4gIH1cbn1cbiJdfQ==