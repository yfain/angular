'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var routerMod = require('../router');
var instruction_1 = require('../instruction');
var hookMod = require('../lifecycle/lifecycle_annotations');
var route_lifecycle_reflector_1 = require('../lifecycle/route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
var RouterOutlet = (function () {
    function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
        this._elementRef = _elementRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        if (lang_1.isPresent(nameAttr)) {
            this.name = nameAttr;
            this._parentRouter.registerAuxOutlet(this);
        }
        else {
            this._parentRouter.registerPrimaryOutlet(this);
        }
    }
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    RouterOutlet.prototype.activate = function (nextInstruction) {
        var _this = this;
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        var componentType = nextInstruction.componentType;
        var childRouter = this._parentRouter.childRouter(componentType);
        var providers = core_1.Injector.resolve([
            core_1.provide(instruction_1.RouteData, { useValue: nextInstruction.routeData }),
            core_1.provide(instruction_1.RouteParams, { useValue: new instruction_1.RouteParams(nextInstruction.params) }),
            core_1.provide(routerMod.Router, { useValue: childRouter })
        ]);
        this._componentRef =
            this._loader.loadNextToLocation(componentType, this._elementRef, providers);
        return this._componentRef.then(function (componentRef) {
            if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return _this._componentRef.then(function (ref) {
                    return ref.instance.routerOnActivate(nextInstruction, previousInstruction);
                });
            }
            else {
                return componentRef;
            }
        });
    };
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    RouterOutlet.prototype.reuse = function (nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        // it's possible the component is removed before it can be reactivated (if nested withing
        // another dynamically loaded component, for instance). In that case, we simply activate
        // a new one.
        if (lang_1.isBlank(this._componentRef)) {
            return this.activate(nextInstruction);
        }
        else {
            return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
                this._componentRef.then(function (ref) {
                    return ref.instance.routerOnReuse(nextInstruction, previousInstruction);
                }) :
                true);
        }
    };
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    RouterOutlet.prototype.deactivate = function (nextInstruction) {
        var _this = this;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) &&
            route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
            next = this._componentRef.then(function (ref) {
                return ref.instance
                    .routerOnDeactivate(nextInstruction, _this._currentInstruction);
            });
        }
        return next.then(function (_) {
            if (lang_1.isPresent(_this._componentRef)) {
                var onDispose = _this._componentRef.then(function (ref) { return ref.dispose(); });
                _this._componentRef = null;
                return onDispose;
            }
        });
    };
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    RouterOutlet.prototype.routerCanDeactivate = function (nextInstruction) {
        var _this = this;
        if (lang_1.isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
            return this._componentRef.then(function (ref) {
                return ref.instance
                    .routerCanDeactivate(nextInstruction, _this._currentInstruction);
            });
        }
        else {
            return _resolveToTrue;
        }
    };
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If the new child component has a different Type than the existing child component,
     * this will resolve to `false`. You can't reuse an old component when the new component
     * is of a different Type.
     *
     * Otherwise, this method delegates to the child component's `routerCanReuse` hook if it exists,
     * or resolves to true if the hook is not present.
     */
    RouterOutlet.prototype.routerCanReuse = function (nextInstruction) {
        var _this = this;
        var result;
        if (lang_1.isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.then(function (ref) {
                return ref.instance.routerCanReuse(nextInstruction, _this._currentInstruction);
            });
        }
        else {
            result = nextInstruction == this._currentInstruction ||
                (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) &&
                    collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
        }
        return async_1.PromiseWrapper.resolve(result);
    };
    RouterOutlet.prototype.ngOnDestroy = function () { this._parentRouter.unregisterPrimaryOutlet(this); };
    RouterOutlet = __decorate([
        core_1.Directive({ selector: 'router-outlet' }),
        __param(3, core_1.Attribute('name')), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.DynamicComponentLoader, routerMod.Router, String])
    ], RouterOutlet);
    return RouterOutlet;
})();
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0LnRzIl0sIm5hbWVzIjpbIlJvdXRlck91dGxldCIsIlJvdXRlck91dGxldC5jb25zdHJ1Y3RvciIsIlJvdXRlck91dGxldC5hY3RpdmF0ZSIsIlJvdXRlck91dGxldC5yZXVzZSIsIlJvdXRlck91dGxldC5kZWFjdGl2YXRlIiwiUm91dGVyT3V0bGV0LnJvdXRlckNhbkRlYWN0aXZhdGUiLCJSb3V0ZXJPdXRsZXQucm91dGVyQ2FuUmV1c2UiLCJSb3V0ZXJPdXRsZXQubmdPbkRlc3Ryb3kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHNCQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBRTVELHFCQUErSCxlQUFlLENBQUMsQ0FBQTtBQUUvSSxJQUFZLFNBQVMsV0FBTSxXQUFXLENBQUMsQ0FBQTtBQUN2Qyw0QkFBMkQsZ0JBQWdCLENBQUMsQ0FBQTtBQUM1RSxJQUFZLE9BQU8sV0FBTSxvQ0FBb0MsQ0FBQyxDQUFBO0FBQzlELDBDQUErQix3Q0FBd0MsQ0FBQyxDQUFBO0FBR3hFLElBQUksY0FBYyxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBQ0g7SUFNRUEsc0JBQ1lBLFdBQXVCQSxFQUFVQSxPQUErQkEsRUFDaEVBLGFBQStCQSxFQUFxQkEsUUFBZ0JBO1FBRHBFQyxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7UUFBVUEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBd0JBO1FBQ2hFQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBa0JBO1FBTjNDQSxT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QSxNQUFNQSxDQUFDQTtvQkFDL0VBLDZCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBbUJBLHNCQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUMxREEsQ0FBQ0E7SUFFRE4sa0NBQVdBLEdBQVhBLGNBQXNCTyxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSx1QkFBdUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBN0kzRVA7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLGVBQWVBLEVBQUNBLENBQUNBO1FBUVFBLFdBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFBQTs7cUJBc0loRUE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBOUlELElBOElDO0FBN0lZLG9CQUFZLGVBNkl4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtEaXJlY3RpdmUsIEF0dHJpYnV0ZSwgRHluYW1pY0NvbXBvbmVudExvYWRlciwgQ29tcG9uZW50UmVmLCBFbGVtZW50UmVmLCBJbmplY3RvciwgcHJvdmlkZSwgRGVwZW5kZW5jeSwgT25EZXN0cm95fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0ICogYXMgcm91dGVyTW9kIGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZVBhcmFtcywgUm91dGVEYXRhfSBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgKiBhcyBob29rTW9kIGZyb20gJy4uL2xpZmVjeWNsZS9saWZlY3ljbGVfYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuLi9saWZlY3ljbGUvcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge09uQWN0aXZhdGUsIENhblJldXNlLCBPblJldXNlLCBPbkRlYWN0aXZhdGUsIENhbkRlYWN0aXZhdGV9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xuXG4vKipcbiAqIEEgcm91dGVyIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgQW5ndWxhciBkeW5hbWljYWxseSBmaWxscyBiYXNlZCBvbiB0aGUgYXBwbGljYXRpb24ncyByb3V0ZS5cbiAqXG4gKiAjIyBVc2VcbiAqXG4gKiBgYGBcbiAqIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBuYW1lOiBzdHJpbmcgPSBudWxsO1xuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IFByb21pc2U8Q29tcG9uZW50UmVmPiA9IG51bGw7XG4gIHByaXZhdGUgX2N1cnJlbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBfbG9hZGVyOiBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICAgICAgcHJpdmF0ZSBfcGFyZW50Um91dGVyOiByb3V0ZXJNb2QuUm91dGVyLCBAQXR0cmlidXRlKCduYW1lJykgbmFtZUF0dHI6IHN0cmluZykge1xuICAgIGlmIChpc1ByZXNlbnQobmFtZUF0dHIpKSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lQXR0cjtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlckF1eE91dGxldCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyZW50Um91dGVyLnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBSb3V0ZXIgdG8gaW5zdGFudGlhdGUgYSBuZXcgY29tcG9uZW50IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbi5cbiAgICogVGhpcyBtZXRob2QgaW4gdHVybiBpcyByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB0aGUgYHJvdXRlck9uQWN0aXZhdGVgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIHByZXZpb3VzSW5zdHJ1Y3Rpb24gPSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb247XG4gICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuICAgIHZhciBjb21wb25lbnRUeXBlID0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGU7XG4gICAgdmFyIGNoaWxkUm91dGVyID0gdGhpcy5fcGFyZW50Um91dGVyLmNoaWxkUm91dGVyKGNvbXBvbmVudFR5cGUpO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW1xuICAgICAgcHJvdmlkZShSb3V0ZURhdGEsIHt1c2VWYWx1ZTogbmV4dEluc3RydWN0aW9uLnJvdXRlRGF0YX0pLFxuICAgICAgcHJvdmlkZShSb3V0ZVBhcmFtcywge3VzZVZhbHVlOiBuZXcgUm91dGVQYXJhbXMobmV4dEluc3RydWN0aW9uLnBhcmFtcyl9KSxcbiAgICAgIHByb3ZpZGUocm91dGVyTW9kLlJvdXRlciwge3VzZVZhbHVlOiBjaGlsZFJvdXRlcn0pXG4gICAgXSk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5fbG9hZGVyLmxvYWROZXh0VG9Mb2NhdGlvbihjb21wb25lbnRUeXBlLCB0aGlzLl9lbGVtZW50UmVmLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWYudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uQWN0aXZhdGUsIGNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWYudGhlbihcbiAgICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgICAoPE9uQWN0aXZhdGU+cmVmLmluc3RhbmNlKS5yb3V0ZXJPbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgcHJldmlvdXNJbnN0cnVjdGlvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbiB3aGVuIGFuIG91dGxldFxuICAgKiByZXVzZXMgYSBjb21wb25lbnQgYmV0d2VlbiBkaWZmZXJlbnQgcm91dGVzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICByZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG5cbiAgICAvLyBpdCdzIHBvc3NpYmxlIHRoZSBjb21wb25lbnQgaXMgcmVtb3ZlZCBiZWZvcmUgaXQgY2FuIGJlIHJlYWN0aXZhdGVkIChpZiBuZXN0ZWQgd2l0aGluZ1xuICAgIC8vIGFub3RoZXIgZHluYW1pY2FsbHkgbG9hZGVkIGNvbXBvbmVudCwgZm9yIGluc3RhbmNlKS4gSW4gdGhhdCBjYXNlLCB3ZSBzaW1wbHkgYWN0aXZhdGVcbiAgICAvLyBhIG5ldyBvbmUuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGUobmV4dEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSA/XG4gICAgICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICg8T25SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlck9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSkgOlxuICAgICAgICAgICAgICB0cnVlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSB3aGVuIGFuIG91dGxldCBkaXNwb3NlcyBvZiBhIGNvbXBvbmVudCdzIGNvbnRlbnRzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25EZWFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oXG4gICAgICAgICAgKHJlZjogQ29tcG9uZW50UmVmKSA9PlxuICAgICAgICAgICAgICAoPE9uRGVhY3RpdmF0ZT5yZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgICAucm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgICB2YXIgb25EaXNwb3NlID0gdGhpcy5fY29tcG9uZW50UmVmLnRoZW4oKHJlZjogQ29tcG9uZW50UmVmKSA9PiByZWYuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIG9uRGlzcG9zZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoaXMgcmVzb2x2ZXMgdG8gYGZhbHNlYCwgdGhlIGdpdmVuIG5hdmlnYXRpb24gaXMgY2FuY2VsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogYW5kIG90aGVyd2lzZSByZXNvbHZlcyB0byB0cnVlLlxuICAgKi9cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5EZWFjdGl2YXRlPnJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAgIC5yb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgbmV3IGNoaWxkIGNvbXBvbmVudCBoYXMgYSBkaWZmZXJlbnQgVHlwZSB0aGFuIHRoZSBleGlzdGluZyBjaGlsZCBjb21wb25lbnQsXG4gICAqIHRoaXMgd2lsbCByZXNvbHZlIHRvIGBmYWxzZWAuIFlvdSBjYW4ndCByZXVzZSBhbiBvbGQgY29tcG9uZW50IHdoZW4gdGhlIG5ldyBjb21wb25lbnRcbiAgICogaXMgb2YgYSBkaWZmZXJlbnQgVHlwZS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIG9yIHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhvb2sgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICByb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgfHxcbiAgICAgICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUgIT0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlZi50aGVuKFxuICAgICAgICAgIChyZWY6IENvbXBvbmVudFJlZikgPT5cbiAgICAgICAgICAgICAgKDxDYW5SZXVzZT5yZWYuaW5zdGFuY2UpLnJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5leHRJbnN0cnVjdGlvbiA9PSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gfHxcbiAgICAgICAgICAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5wYXJhbXMpICYmIGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24ucGFyYW1zKSAmJlxuICAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmVxdWFscyhuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24ucGFyYW1zKSk7XG4gICAgfVxuICAgIHJldHVybiA8UHJvbWlzZTxib29sZWFuPj5Qcm9taXNlV3JhcHBlci5yZXNvbHZlKHJlc3VsdCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fcGFyZW50Um91dGVyLnVucmVnaXN0ZXJQcmltYXJ5T3V0bGV0KHRoaXMpOyB9XG59XG4iXX0=