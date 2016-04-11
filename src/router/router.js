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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var route_registry_1 = require('./route_registry');
var location_1 = require('./location/location');
var route_lifecycle_reflector_1 = require('./lifecycle/route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
var Router = (function () {
    function Router(registry, parent, hostComponent, root) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.root = root;
        this.navigating = false;
        /**
         * The current `Instruction` for the router
         */
        this.currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new collection_1.Map();
        this._subject = new async_1.EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.childRouter = function (hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    };
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.auxRouter = function (hostComponent) { return new ChildRouter(this, hostComponent); };
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        if (lang_1.isPresent(this._outlet)) {
            throw new exceptions_1.BaseException("Primary outlet is already registered.");
        }
        this._outlet = outlet;
        if (lang_1.isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    };
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    Router.prototype.unregisterPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        this._outlet = null;
    };
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerAuxOutlet = function (outlet) {
        var outletName = outlet.name;
        if (lang_1.isBlank(outletName)) {
            throw new exceptions_1.BaseException("registerAuxOutlet expects to be called with an outlet with a name.");
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (lang_1.isPresent(this.currentInstruction) &&
            lang_1.isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    };
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    Router.prototype.isRouteActive = function (instruction) {
        var _this = this;
        var router = this;
        if (lang_1.isBlank(this.currentInstruction)) {
            return false;
        }
        // `instruction` corresponds to the root router
        while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        if (lang_1.isBlank(instruction.component) || lang_1.isBlank(this.currentInstruction.component) ||
            this.currentInstruction.component.routeName != instruction.component.routeName) {
            return false;
        }
        var paramEquals = true;
        if (lang_1.isPresent(this.currentInstruction.component.params)) {
            collection_1.StringMapWrapper.forEach(instruction.component.params, function (value, key) {
                if (_this.currentInstruction.component.params[key] !== value) {
                    paramEquals = false;
                }
            });
        }
        return paramEquals;
    };
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    Router.prototype.config = function (definitions) {
        var _this = this;
        definitions.forEach(function (routeDefinition) { _this.registry.config(_this.hostComponent, routeDefinition); });
        return this.renavigate();
    };
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    Router.prototype.navigate = function (linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    };
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    Router.prototype.navigateByUrl = function (url, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this.lastNavigationAttempt = url;
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this.recognize(url).then(function (instruction) {
                if (lang_1.isBlank(instruction)) {
                    return false;
                }
                return _this._navigate(instruction, _skipLocationChange);
            }));
        });
    };
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    Router.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        if (lang_1.isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this._navigate(instruction, _skipLocationChange));
        });
    };
    /** @internal */
    Router.prototype._settleInstruction = function (instruction) {
        var _this = this;
        return instruction.resolveComponent().then(function (_) {
            var unsettledInstructions = [];
            if (lang_1.isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (lang_1.isPresent(instruction.child)) {
                unsettledInstructions.push(_this._settleInstruction(instruction.child));
            }
            collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function (instruction, _) {
                unsettledInstructions.push(_this._settleInstruction(instruction));
            });
            return async_1.PromiseWrapper.all(unsettledInstructions);
        });
    };
    /** @internal */
    Router.prototype._navigate = function (instruction, _skipLocationChange) {
        var _this = this;
        return this._settleInstruction(instruction)
            .then(function (_) { return _this._routerCanReuse(instruction); })
            .then(function (_) { return _this._canActivate(instruction); })
            .then(function (result) {
            if (!result) {
                return false;
            }
            return _this._routerCanDeactivate(instruction).then(function (result) {
                if (result) {
                    return _this.commit(instruction, _skipLocationChange).then(function (_) {
                        _this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    };
    Router.prototype._emitNavigationFinish = function (url) { async_1.ObservableWrapper.callEmit(this._subject, url); };
    /** @internal */
    Router.prototype._emitNavigationFail = function (url) { async_1.ObservableWrapper.callError(this._subject, url); };
    Router.prototype._afterPromiseFinishNavigating = function (promise) {
        var _this = this;
        return async_1.PromiseWrapper.catchError(promise.then(function (_) { return _this._finishNavigating(); }), function (err) {
            _this._finishNavigating();
            throw err;
        });
    };
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    Router.prototype._routerCanReuse = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (lang_1.isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component).then(function (result) {
            instruction.component.reuse = result;
            if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
                return _this._childRouter._routerCanReuse(instruction.child);
            }
        });
    };
    Router.prototype._canActivate = function (nextInstruction) {
        return canActivateOne(nextInstruction, this.currentInstruction);
    };
    Router.prototype._routerCanDeactivate = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = lang_1.isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then(function (result) {
            if (result == false) {
                return false;
            }
            if (lang_1.isPresent(_this._childRouter)) {
                // TODO: ideally, this closure would map to async-await in Dart.
                // For now, casting to any to suppress an error.
                return _this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    };
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    Router.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        this.currentInstruction = instruction;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._outlet) && lang_1.isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                next =
                    this.deactivate(instruction).then(function (_) { return _this._outlet.activate(componentInstruction); });
            }
            if (lang_1.isPresent(instruction.child)) {
                next = next.then(function (_) {
                    if (lang_1.isPresent(_this._childRouter)) {
                        return _this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach(function (router, name) {
            if (lang_1.isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then(function (_) { return async_1.PromiseWrapper.all(promises); });
    };
    /** @internal */
    Router.prototype._startNavigating = function () { this.navigating = true; };
    /** @internal */
    Router.prototype._finishNavigating = function () { this.navigating = false; };
    /**
     * Subscribe to URL updates from the router
     */
    Router.prototype.subscribe = function (onNext, onError) {
        return async_1.ObservableWrapper.subscribe(this._subject, onNext, onError);
    };
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    Router.prototype.deactivate = function (instruction) {
        var _this = this;
        var childInstruction = null;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (lang_1.isPresent(this._outlet)) {
            next = next.then(function (_) { return _this._outlet.deactivate(componentInstruction); });
        }
        // TODO: handle aux routes
        return next;
    };
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    Router.prototype.recognize = function (url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    };
    Router.prototype._getAncestorInstructions = function () {
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (lang_1.isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
        }
        return ancestorInstructions;
    };
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    Router.prototype.renavigate = function () {
        if (lang_1.isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    };
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    Router.prototype.generate = function (linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    };
    Router = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, Router, Object, Router])
    ], Router);
    return Router;
})();
exports.Router = Router;
var RootRouter = (function (_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
        var _this = this;
        _super.call(this, registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe(function (change) {
            // we call recognize ourselves
            _this.recognize(change['url']).then(function (instruction) {
                if (lang_1.isPresent(instruction)) {
                    _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop'])).then(function (_) {
                        // this is a popstate event; no need to change the URL
                        if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                            return;
                        }
                        var emitPath = instruction.toUrlPath();
                        var emitQuery = instruction.toUrlQuery();
                        if (emitPath.length > 0 && emitPath[0] != '/') {
                            emitPath = '/' + emitPath;
                        }
                        // We've opted to use pushstate and popState APIs regardless of whether you
                        // an app uses HashLocationStrategy or PathLocationStrategy.
                        // However, apps that are migrating might have hash links that operate outside
                        // angular to which routing must respond.
                        // Therefore we know that all hashchange events occur outside Angular.
                        // To support these cases where we respond to hashchanges and redirect as a
                        // result, we need to replace the top item on the stack.
                        if (change['type'] == 'hashchange') {
                            if (instruction.toRootUrl() != _this._location.path()) {
                                _this._location.replaceState(emitPath, emitQuery);
                            }
                        }
                        else {
                            _this._location.go(emitPath, emitQuery);
                        }
                    });
                }
                else {
                    _this._emitNavigationFail(change['url']);
                }
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    RootRouter.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
            emitPath = '/' + emitPath;
        }
        var promise = _super.prototype.commit.call(this, instruction);
        if (!_skipLocationChange) {
            promise = promise.then(function (_) { _this._location.go(emitPath, emitQuery); });
        }
        return promise;
    };
    RootRouter.prototype.dispose = function () {
        if (lang_1.isPresent(this._locationSub)) {
            async_1.ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    };
    RootRouter = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Inject(route_registry_1.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, location_1.Location, lang_1.Type])
    ], RootRouter);
    return RootRouter;
})(Router);
exports.RootRouter = RootRouter;
var ChildRouter = (function (_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
        _super.call(this, parent.registry, parent, hostComponent, parent.root);
        this.parent = parent;
    }
    ChildRouter.prototype.navigateByUrl = function (url, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    };
    ChildRouter.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    };
    return ChildRouter;
})(Router);
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (lang_1.isBlank(nextInstruction.component)) {
        return next;
    }
    if (lang_1.isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, lang_1.isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then(function (result) {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = route_lifecycle_reflector_1.getCanActivateHook(nextInstruction.component.componentType);
        if (lang_1.isPresent(hook)) {
            return hook(nextInstruction.component, lang_1.isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIudW5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX3NldHRsZUluc3RydWN0aW9uIiwiUm91dGVyLl9uYXZpZ2F0ZSIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2VtaXROYXZpZ2F0aW9uRmFpbCIsIlJvdXRlci5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5fcm91dGVyQ2FuUmV1c2UiLCJSb3V0ZXIuX2NhbkFjdGl2YXRlIiwiUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyLmNvbW1pdCIsIlJvdXRlci5fc3RhcnROYXZpZ2F0aW5nIiwiUm91dGVyLl9maW5pc2hOYXZpZ2F0aW5nIiwiUm91dGVyLnN1YnNjcmliZSIsIlJvdXRlci5kZWFjdGl2YXRlIiwiUm91dGVyLnJlY29nbml6ZSIsIlJvdXRlci5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMiLCJSb3V0ZXIucmVuYXZpZ2F0ZSIsIlJvdXRlci5nZW5lcmF0ZSIsIlJvb3RSb3V0ZXIiLCJSb290Um91dGVyLmNvbnN0cnVjdG9yIiwiUm9vdFJvdXRlci5jb21taXQiLCJSb290Um91dGVyLmRpc3Bvc2UiLCJDaGlsZFJvdXRlciIsIkNoaWxkUm91dGVyLmNvbnN0cnVjdG9yIiwiQ2hpbGRSb3V0ZXIubmF2aWdhdGVCeVVybCIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbiIsImNhbkFjdGl2YXRlT25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQUE4RCwyQkFBMkIsQ0FBQyxDQUFBO0FBQzFGLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHFCQUEwRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3JGLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHFCQUFpQyxlQUFlLENBQUMsQ0FBQTtBQUVqRCwrQkFBc0Qsa0JBQWtCLENBQUMsQ0FBQTtBQUd6RSx5QkFBdUIscUJBQXFCLENBQUMsQ0FBQTtBQUM3QywwQ0FBaUMsdUNBQXVDLENBQUMsQ0FBQTtBQUd6RSxJQUFJLGNBQWMsR0FBRyxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLGVBQWUsR0FBRyxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUVwRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNIO0lBa0JFQSxnQkFDV0EsUUFBdUJBLEVBQVNBLE1BQWNBLEVBQVNBLGFBQWtCQSxFQUN6RUEsSUFBYUE7UUFEYkMsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBZUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBU0Esa0JBQWFBLEdBQWJBLGFBQWFBLENBQUtBO1FBQ3pFQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFTQTtRQWxCeEJBLGVBQVVBLEdBQVlBLEtBQUtBLENBQUNBO1FBRTVCQTs7V0FFR0E7UUFDSUEsdUJBQWtCQSxHQUFnQkEsSUFBSUEsQ0FBQ0E7UUFFdENBLHVCQUFrQkEsR0FBaUJBLGNBQWNBLENBQUNBO1FBQ2xEQSxZQUFPQSxHQUFpQkEsSUFBSUEsQ0FBQ0E7UUFFN0JBLGdCQUFXQSxHQUFH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V0FBV0EsRUFBRUEsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBO3dCQUN2RUEsc0RBQXNEQTt3QkFDdERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDL0RBLE1BQU1BLENBQUNBO3dCQUNUQSxDQUFDQTt3QkFDREEsSUFBSUEsUUFBUUEsR0FBR0EsV0FBV0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7d0JBQ3ZDQSxJQUFJQSxTQUFTQSxHQUFHQSxXQUFXQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTt3QkFDekNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBOzRCQUM5Q0EsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0E7d0JBQzVCQSxDQUFDQTt3QkFFREEsMkVBQTJFQTt3QkFDM0VBLDREQUE0REE7d0JBQzVEQSw4RUFBOEVBO3dCQUM5RUEseUNBQXlDQTt3QkFDekNBLHNFQUFzRUE7d0JBQ3RFQSwyRUFBMkVBO3dCQUMzRUEsd0RBQXdEQTt3QkFDeERBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNuQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ3JEQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxR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QUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLDhDQUFrQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FDUEEsZUFBZUEsQ0FBQ0EsU0FBU0EsRUFBRUEsZ0JBQVNBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLGVBQWVBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hHQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIEV2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtNYXAsIFN0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1N0cmluZywgaXNQcmVzZW50LCBUeXBlLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9yb3V0ZV9yZWdpc3RyeSc7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9uLCBJbnN0cnVjdGlvbix9IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJy4vbG9jYXRpb24vbG9jYXRpb24nO1xuaW1wb3J0IHtnZXRDYW5BY3RpdmF0ZUhvb2t9IGZyb20gJy4vbGlmZWN5Y2xlL3JvdXRlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnL3JvdXRlX2NvbmZpZ19pbXBsJztcblxubGV0IF9yZXNvbHZlVG9UcnVlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcbmxldCBfcmVzb2x2ZVRvRmFsc2UgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKGZhbHNlKTtcblxuLyoqXG4gKiBUaGUgYFJvdXRlcmAgaXMgcmVzcG9uc2libGUgZm9yIG1hcHBpbmcgVVJMcyB0byBjb21wb25lbnRzLlxuICpcbiAqIFlvdSBjYW4gc2VlIHRoZSBzdGF0ZSBvZiB0aGUgcm91dGVyIGJ5IGluc3BlY3RpbmcgdGhlIHJlYWQtb25seSBmaWVsZCBgcm91dGVyLm5hdmlnYXRpbmdgLlxuICogVGhpcyBtYXkgYmUgdXNlZnVsIGZvciBzaG93aW5nIGEgc3Bpbm5lciwgZm9yIGluc3RhbmNlLlxuICpcbiAqICMjIENvbmNlcHRzXG4gKlxuICogUm91dGVycyBhbmQgY29tcG9uZW50IGluc3RhbmNlcyBoYXZlIGEgMToxIGNvcnJlc3BvbmRlbmNlLlxuICpcbiAqIFRoZSByb3V0ZXIgaG9sZHMgcmVmZXJlbmNlIHRvIGEgbnVtYmVyIG9mIHtAbGluayBSb3V0ZXJPdXRsZXR9LlxuICogQW4gb3V0bGV0IGlzIGEgcGxhY2Vob2xkZXIgdGhhdCB0aGUgcm91dGVyIGR5bmFtaWNhbGx5IGZpbGxzIGluIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCBVUkwuXG4gKlxuICogV2hlbiB0aGUgcm91dGVyIG5hdmlnYXRlcyBmcm9tIGEgVVJMLCBpdCBtdXN0IGZpcnN0IHJlY29nbml6ZSBpdCBhbmQgc2VyaWFsaXplIGl0IGludG8gYW5cbiAqIGBJbnN0cnVjdGlvbmAuXG4gKiBUaGUgcm91dGVyIHVzZXMgdGhlIGBSb3V0ZVJlZ2lzdHJ5YCB0byBnZXQgYW4gYEluc3RydWN0aW9uYC5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlciB7XG4gIG5hdmlnYXRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbGFzdE5hdmlnYXRpb25BdHRlbXB0OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBgSW5zdHJ1Y3Rpb25gIGZvciB0aGUgcm91dGVyXG4gICAqL1xuICBwdWJsaWMgY3VycmVudEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfY3VycmVudE5hdmlnYXRpb246IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICBwcml2YXRlIF9vdXRsZXQ6IFJvdXRlck91dGxldCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfYXV4Um91dGVycyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZXI+KCk7XG4gIHByaXZhdGUgX2NoaWxkUm91dGVyOiBSb3V0ZXI7XG5cbiAgcHJpdmF0ZSBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgcHVibGljIHBhcmVudDogUm91dGVyLCBwdWJsaWMgaG9zdENvbXBvbmVudDogYW55LFxuICAgICAgcHVibGljIHJvb3Q/OiBSb3V0ZXIpIHt9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGNoaWxkUm91dGVyKGhvc3RDb21wb25lbnQ6IGFueSk6IFJvdXRlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyID0gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNoaWxkIHJvdXRlci4gWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGVcbiAgICogY29tcG9uZW50LlxuICAgKi9cbiAgYXV4Um91dGVyKGhvc3RDb21wb25lbnQ6IGFueSk6IFJvdXRlciB7IHJldHVybiBuZXcgQ2hpbGRSb3V0ZXIodGhpcywgaG9zdENvbXBvbmVudCk7IH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIGJlIG5vdGlmaWVkIG9mIHByaW1hcnkgcm91dGUgY2hhbmdlcy5cbiAgICpcbiAgICogWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGUgY29tcG9uZW50LlxuICAgKi9cbiAgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNQcmVzZW50KG91dGxldC5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyUHJpbWFyeU91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIHVubmFtZWQgb3V0bGV0LmApO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFByaW1hcnkgb3V0bGV0IGlzIGFscmVhZHkgcmVnaXN0ZXJlZC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vdXRsZXQgPSBvdXRsZXQ7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbW1pdCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbiwgZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlciBhbiBvdXRsZXQgKGJlY2F1c2UgaXQgd2FzIGRlc3Ryb3llZCwgZXRjKS5cbiAgICpcbiAgICogWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgY3VzdG9tIG91dGxldCBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIHVucmVnaXN0ZXJQcmltYXJ5T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudChvdXRsZXQubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlclByaW1hcnlPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiB1bm5hbWVkIG91dGxldC5gKTtcbiAgICB9XG4gICAgdGhpcy5fb3V0bGV0ID0gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBub3RpZmllZCBvZiBhdXhpbGlhcnkgcm91dGUgY2hhbmdlcy5cbiAgICpcbiAgICogWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGUgY29tcG9uZW50LlxuICAgKi9cbiAgcmVnaXN0ZXJBdXhPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBvdXRsZXROYW1lID0gb3V0bGV0Lm5hbWU7XG4gICAgaWYgKGlzQmxhbmsob3V0bGV0TmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlckF1eE91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIG91dGxldCB3aXRoIGEgbmFtZS5gKTtcbiAgICB9XG5cbiAgICB2YXIgcm91dGVyID0gdGhpcy5hdXhSb3V0ZXIodGhpcy5ob3N0Q29tcG9uZW50KTtcblxuICAgIHRoaXMuX2F1eFJvdXRlcnMuc2V0KG91dGxldE5hbWUsIHJvdXRlcik7XG4gICAgcm91dGVyLl9vdXRsZXQgPSBvdXRsZXQ7XG5cbiAgICB2YXIgYXV4SW5zdHJ1Y3Rpb247XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaXNQcmVzZW50KGF1eEluc3RydWN0aW9uID0gdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bb3V0bGV0TmFtZV0pKSB7XG4gICAgICByZXR1cm4gcm91dGVyLmNvbW1pdChhdXhJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGluc3RydWN0aW9uLCByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaW5zdHJ1Y3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZSxcbiAgICogb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAqL1xuICBpc1JvdXRlQWN0aXZlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHZhciByb3V0ZXI6IFJvdXRlciA9IHRoaXM7XG5cbiAgICBpZiAoaXNCbGFuayh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBgaW5zdHJ1Y3Rpb25gIGNvcnJlc3BvbmRzIHRvIHRoZSByb290IHJvdXRlclxuICAgIHdoaWxlIChpc1ByZXNlbnQocm91dGVyLnBhcmVudCkgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgcm91dGVyID0gcm91dGVyLnBhcmVudDtcbiAgICAgIGluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgfVxuXG4gICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSB8fCBpc0JsYW5rKHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudCkgfHxcbiAgICAgICAgdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJvdXRlTmFtZSAhPSBpbnN0cnVjdGlvbi5jb21wb25lbnQucm91dGVOYW1lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHBhcmFtRXF1YWxzID0gdHJ1ZTtcblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnBhcmFtcykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChpbnN0cnVjdGlvbi5jb21wb25lbnQucGFyYW1zLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnBhcmFtc1trZXldICE9PSB2YWx1ZSkge1xuICAgICAgICAgIHBhcmFtRXF1YWxzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJhbUVxdWFscztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIER5bmFtaWNhbGx5IHVwZGF0ZSB0aGUgcm91dGluZyBjb25maWd1cmF0aW9uIGFuZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIuY29uZmlnKFtcbiAgICogICB7ICdwYXRoJzogJy8nLCAnY29tcG9uZW50JzogSW5kZXhDb21wIH0sXG4gICAqICAgeyAncGF0aCc6ICcvdXNlci86aWQnLCAnY29tcG9uZW50JzogVXNlckNvbXAgfSxcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uZmlnKGRlZmluaXRpb25zOiBSb3V0ZURlZmluaXRpb25bXSk6IFByb21pc2U8YW55PiB7XG4gICAgZGVmaW5pdGlvbnMuZm9yRWFjaChcbiAgICAgICAgKHJvdXRlRGVmaW5pdGlvbikgPT4geyB0aGlzLnJlZ2lzdHJ5LmNvbmZpZyh0aGlzLmhvc3RDb21wb25lbnQsIHJvdXRlRGVmaW5pdGlvbik7IH0pO1xuICAgIHJldHVybiB0aGlzLnJlbmF2aWdhdGUoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC4gSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCB0aGlzIG1ldGhvZFxuICAgKiBvdmVyIGBuYXZpZ2F0ZUJ5VXJsYC5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgUm91dGUgTGluayBEU0w6XG4gICAqIGBgYFxuICAgKiBbJy4vTXlDbXAnLCB7cGFyYW06IDN9XVxuICAgKiBgYGBcbiAgICogU2VlIHRoZSB7QGxpbmsgUm91dGVyTGlua30gZGlyZWN0aXZlIGZvciBtb3JlLlxuICAgKi9cbiAgbmF2aWdhdGUobGlua1BhcmFtczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBpbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGUobGlua1BhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBmYWxzZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIFVSTC4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXMgY29tcGxldGUuXG4gICAqIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggYG5hdmlnYXRlYCBpbnN0ZWFkIG9mIHRoaXMgbWV0aG9kLCBzaW5jZSBVUkxzIGFyZSBtb3JlIGJyaXR0bGUuXG4gICAqXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgYmVnaW5zIHdpdGggYSBgL2AsIHJvdXRlciB3aWxsIG5hdmlnYXRlIGFic29sdXRlbHkuXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lcyBub3QgYmVnaW4gd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSByZWxhdGl2ZSB0byB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQgPSB1cmw7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMucmVjb2duaXplKHVybCkudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB2aWEgdGhlIHByb3ZpZGVkIGluc3RydWN0aW9uLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpc1xuICAgKiBjb21wbGV0ZS5cbiAgICovXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6XG4gICAgICBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCgpLnRoZW4oKF8pID0+IHtcbiAgICAgIHZhciB1bnNldHRsZWRJbnN0cnVjdGlvbnM6IEFycmF5PFByb21pc2U8YW55Pj4gPSBbXTtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5jaGlsZCkpO1xuICAgICAgfVxuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF8pID0+IHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbCh1bnNldHRsZWRJbnN0cnVjdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmF2aWdhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9jYW5BY3RpdmF0ZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fcm91dGVyQ2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbW1pdChpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSkudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmluaXNoKGluc3RydWN0aW9uLnRvUm9vdFVybCgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdE5hdmlnYXRpb25GaW5pc2godXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHVybCk7IH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1pdE5hdmlnYXRpb25GYWlsKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IodGhpcy5fc3ViamVjdCwgdXJsKTsgfVxuXG4gIHByaXZhdGUgX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihwcm9taXNlLnRoZW4oKF8pID0+IHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKSksIChlcnIpID0+IHtcbiAgICAgIHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IHNldCByZXVzZSBmbGFnc1xuICAgKi9cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdXRsZXQucm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSA9IHJlc3VsdDtcbiAgICAgIGlmIChyZXN1bHQgJiYgaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuQWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZTtcbiAgICB9XG4gICAgaWYgKHJldXNlKSB7XG4gICAgICBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucm91dGVyQ2FuRGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIC8vIFRPRE86IGF1eCByb3V0ZSBsaWZlY3ljbGUgaG9va3NcbiAgICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgIC8vIFRPRE86IGlkZWFsbHksIHRoaXMgY2xvc3VyZSB3b3VsZCBtYXAgdG8gYXN5bmMtYXdhaXQgaW4gRGFydC5cbiAgICAgICAgLy8gRm9yIG5vdywgY2FzdGluZyB0byBhbnkgdG8gc3VwcHJlc3MgYW4gZXJyb3IuXG4gICAgICAgIHJldHVybiA8YW55PnRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG5cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCBvbkVycm9yPzogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvbkVycm9yKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgcm91dGVyJ3Mgb3V0bGV0IGFuZCBhbGwgZGVzY2VuZGFudCBvdXRsZXRzXG4gICAqL1xuICBkZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX2NoaWxkUm91dGVyLmRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgIHZhciBhbmNlc3RvclJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50KSkge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMudW5zaGlmdChhbmNlc3RvclJvdXRlci5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKS50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgICAgIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBpc1ByZXNlbnQoY2hhbmdlWydwb3AnXSkpLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSAmJiBjaGFuZ2VbJ3R5cGUnXSAhPSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgICAgICAgICB2YXIgZW1pdFF1ZXJ5ID0gaW5zdHJ1Y3Rpb24udG9VcmxRdWVyeSgpO1xuICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICAgICAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlJ3ZlIG9wdGVkIHRvIHVzZSBwdXNoc3RhdGUgYW5kIHBvcFN0YXRlIEFQSXMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHlvdVxuICAgICAgICAgICAgLy8gYW4gYXBwIHVzZXMgSGFzaExvY2F0aW9uU3RyYXRlZ3kgb3IgUGF0aExvY2F0aW9uU3RyYXRlZ3kuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBhcHBzIHRoYXQgYXJlIG1pZ3JhdGluZyBtaWdodCBoYXZlIGhhc2ggbGlua3MgdGhhdCBvcGVyYXRlIG91dHNpZGVcbiAgICAgICAgICAgIC8vIGFuZ3VsYXIgdG8gd2hpY2ggcm91dGluZyBtdXN0IHJlc3BvbmQuXG4gICAgICAgICAgICAvLyBUaGVyZWZvcmUgd2Uga25vdyB0aGF0IGFsbCBoYXNoY2hhbmdlIGV2ZW50cyBvY2N1ciBvdXRzaWRlIEFuZ3VsYXIuXG4gICAgICAgICAgICAvLyBUbyBzdXBwb3J0IHRoZXNlIGNhc2VzIHdoZXJlIHdlIHJlc3BvbmQgdG8gaGFzaGNoYW5nZXMgYW5kIHJlZGlyZWN0IGFzIGFcbiAgICAgICAgICAgIC8vIHJlc3VsdCwgd2UgbmVlZCB0byByZXBsYWNlIHRoZSB0b3AgaXRlbSBvbiB0aGUgc3RhY2suXG4gICAgICAgICAgICBpZiAoY2hhbmdlWyd0eXBlJ10gPT0gJ2hhc2hjaGFuZ2UnKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSAhPSB0aGlzLl9sb2NhdGlvbi5wYXRoKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5yZXBsYWNlU3RhdGUoZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLmdvKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmFpbChjaGFuZ2VbJ3VybCddKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQocHJpbWFyeUNvbXBvbmVudCk7XG4gICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKGxvY2F0aW9uLnBhdGgoKSk7XG4gIH1cblxuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBlbWl0UGF0aCA9IGluc3RydWN0aW9uLnRvVXJsUGF0aCgpO1xuICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICBlbWl0UGF0aCA9ICcvJyArIGVtaXRQYXRoO1xuICAgIH1cbiAgICB2YXIgcHJvbWlzZSA9IHN1cGVyLmNvbW1pdChpbnN0cnVjdGlvbik7XG4gICAgaWYgKCFfc2tpcExvY2F0aW9uQ2hhbmdlKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKChfKSA9PiB7IHRoaXMuX2xvY2F0aW9uLmdvKGVtaXRQYXRoLCBlbWl0UXVlcnkpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fbG9jYXRpb25TdWIpKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX2xvY2F0aW9uU3ViKTtcbiAgICAgIHRoaXMuX2xvY2F0aW9uU3ViID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2hpbGRSb3V0ZXIgZXh0ZW5kcyBSb3V0ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IFJvdXRlciwgaG9zdENvbXBvbmVudCkge1xuICAgIHN1cGVyKHBhcmVudC5yZWdpc3RyeSwgcGFyZW50LCBob3N0Q29tcG9uZW50LCBwYXJlbnQucm9vdCk7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeVVybCh1cmwsIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG5cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTpcbiAgICAgIFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGNhbkFjdGl2YXRlT25lKFxuICAgIG5leHRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIHByZXZJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgaWYgKGlzQmxhbmsobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuICBpZiAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICBuZXh0ID0gY2FuQWN0aXZhdGVPbmUoXG4gICAgICAgIG5leHRJbnN0cnVjdGlvbi5jaGlsZCwgaXNQcmVzZW50KHByZXZJbnN0cnVjdGlvbikgPyBwcmV2SW5zdHJ1Y3Rpb24uY2hpbGQgOiBudWxsKTtcbiAgfVxuICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQ6IGJvb2xlYW4pOiBib29sZWFuID0+IHtcbiAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGhvb2sgPSBnZXRDYW5BY3RpdmF0ZUhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlKTtcbiAgICBpZiAoaXNQcmVzZW50KGhvb2spKSB7XG4gICAgICByZXR1cm4gaG9vayhcbiAgICAgICAgICBuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LCBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIl19