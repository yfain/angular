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
            return _this._routerCanDeactivate(instruction)
                .then(function (result) {
                if (result) {
                    return _this.commit(instruction, _skipLocationChange)
                        .then(function (_) {
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
        return this._outlet.routerCanReuse(instruction.component)
            .then(function (result) {
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
            _this.recognize(change['url'])
                .then(function (instruction) {
                if (lang_1.isPresent(instruction)) {
                    _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop']))
                        .then(function (_) {
                        // this is a popstate event; no need to change the URL
                        if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                            return;
                        }
                        var emitPath = instruction.toUrlPath();
                        var emitQuery = instruction.toUrlQuery();
                        if (emitPath.length > 0 && emitPath[0] != '/') {
                            emitPath = '/' + emitPath;
                        }
                        // Because we've opted to use All hashchange events occur outside Angular.
                        // However, apps that are migrating might have hash links that operate outside
                        // angular to which routing must respond.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC01WFpPbDN4My50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIudW5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX3NldHRsZUluc3RydWN0aW9uIiwiUm91dGVyLl9uYXZpZ2F0ZSIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2VtaXROYXZpZ2F0aW9uRmFpbCIsIlJvdXRlci5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5fcm91dGVyQ2FuUmV1c2UiLCJSb3V0ZXIuX2NhbkFjdGl2YXRlIiwiUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyLmNvbW1pdCIsIlJvdXRlci5fc3RhcnROYXZpZ2F0aW5nIiwiUm91dGVyLl9maW5pc2hOYXZpZ2F0aW5nIiwiUm91dGVyLnN1YnNjcmliZSIsIlJvdXRlci5kZWFjdGl2YXRlIiwiUm91dGVyLnJlY29nbml6ZSIsIlJvdXRlci5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMiLCJSb3V0ZXIucmVuYXZpZ2F0ZSIsIlJvdXRlci5nZW5lcmF0ZSIsIlJvb3RSb3V0ZXIiLCJSb290Um91dGVyLmNvbnN0cnVjdG9yIiwiUm9vdFJvdXRlci5jb21taXQiLCJSb290Um91dGVyLmRpc3Bvc2UiLCJDaGlsZFJvdXRlciIsIkNoaWxkUm91dGVyLmNvbnN0cnVjdG9yIiwiQ2hpbGRSb3V0ZXIubmF2aWdhdGVCeVVybCIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbiIsImNhbkFjdGl2YXRlT25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNCQUE4RCwyQkFBMkIsQ0FBQyxDQUFBO0FBQzFGLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHFCQUEwRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3JGLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHFCQUFpQyxlQUFlLENBQUMsQ0FBQTtBQUVqRCwrQkFBc0Qsa0JBQWtCLENBQUMsQ0FBQTtBQU16RSx5QkFBdUIscUJBQXFCLENBQUMsQ0FBQTtBQUM3QywwQ0FBaUMsdUNBQXVDLENBQUMsQ0FBQTtBQUd6RSxJQUFJLGNBQWMsR0FBRyxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLGVBQWUsR0FBRyxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUVwRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNIO0lBa0JFQSxnQkFBbUJBLFFBQXVCQSxFQUFTQSxNQUFjQSxFQUFTQSxhQUFrQkEsRUFDekVBLElBQWFBO1FBRGJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWVBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFLQTtRQUN6RUEsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBU0E7UUFqQmhDQSxlQUFVQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUU1QkE7O1dBRUdBO1FBQ0lBLHVCQUFrQkEsR0FBZ0JBLElBQUlBLENBQUNBO1FBRXRDQSx1QkFBa0JBLEdBQWlCQSxjQUFjQSxDQUFDQTtRQUNsREEsWUFBT0EsR0FBaUJBLElBQUlBLENBQUNBO1FBRTdCQSxnQkFBV0EsR0FB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QSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLDhDQUFrQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsRUFDekJBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxlQUFlQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3RUEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2VXcmFwcGVyLCBFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TWFwLCBTdHJpbmdNYXBXcmFwcGVyLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNTdHJpbmcsIGlzUHJlc2VudCwgVHlwZSwgaXNBcnJheX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5LCBST1VURVJfUFJJTUFSWV9DT01QT05FTlR9IGZyb20gJy4vcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIEluc3RydWN0aW9uLFxufSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uL2xvY2F0aW9uJztcbmltcG9ydCB7Z2V0Q2FuQWN0aXZhdGVIb29rfSBmcm9tICcuL2xpZmVjeWNsZS9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfaW1wbCc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5sZXQgX3Jlc29sdmVUb0ZhbHNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG5cbi8qKlxuICogVGhlIGBSb3V0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIFVSTHMgdG8gY29tcG9uZW50cy5cbiAqXG4gKiBZb3UgY2FuIHNlZSB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlciBieSBpbnNwZWN0aW5nIHRoZSByZWFkLW9ubHkgZmllbGQgYHJvdXRlci5uYXZpZ2F0aW5nYC5cbiAqIFRoaXMgbWF5IGJlIHVzZWZ1bCBmb3Igc2hvd2luZyBhIHNwaW5uZXIsIGZvciBpbnN0YW5jZS5cbiAqXG4gKiAjIyBDb25jZXB0c1xuICpcbiAqIFJvdXRlcnMgYW5kIGNvbXBvbmVudCBpbnN0YW5jZXMgaGF2ZSBhIDE6MSBjb3JyZXNwb25kZW5jZS5cbiAqXG4gKiBUaGUgcm91dGVyIGhvbGRzIHJlZmVyZW5jZSB0byBhIG51bWJlciBvZiB7QGxpbmsgUm91dGVyT3V0bGV0fS5cbiAqIEFuIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgdGhlIHJvdXRlciBkeW5hbWljYWxseSBmaWxscyBpbiBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgVVJMLlxuICpcbiAqIFdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMgZnJvbSBhIFVSTCwgaXQgbXVzdCBmaXJzdCByZWNvZ25pemUgaXQgYW5kIHNlcmlhbGl6ZSBpdCBpbnRvIGFuXG4gKiBgSW5zdHJ1Y3Rpb25gLlxuICogVGhlIHJvdXRlciB1c2VzIHRoZSBgUm91dGVSZWdpc3RyeWAgdG8gZ2V0IGFuIGBJbnN0cnVjdGlvbmAuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBuYXZpZ2F0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxhc3ROYXZpZ2F0aW9uQXR0ZW1wdDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYEluc3RydWN0aW9uYCBmb3IgdGhlIHJvdXRlclxuICAgKi9cbiAgcHVibGljIGN1cnJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIHByaXZhdGUgX2N1cnJlbnROYXZpZ2F0aW9uOiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgcHJpdmF0ZSBfb3V0bGV0OiBSb3V0ZXJPdXRsZXQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2F1eFJvdXRlcnMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyPigpO1xuICBwcml2YXRlIF9jaGlsZFJvdXRlcjogUm91dGVyO1xuXG4gIHByaXZhdGUgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBwdWJsaWMgcGFyZW50OiBSb3V0ZXIsIHB1YmxpYyBob3N0Q29tcG9uZW50OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByb290PzogUm91dGVyKSB7fVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBjaGlsZFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlciA9IG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGF1eFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIgeyByZXR1cm4gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBiZSBub3RpZmllZCBvZiBwcmltYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzUHJlc2VudChvdXRsZXQubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlclByaW1hcnlPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiB1bm5hbWVkIG91dGxldC5gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBQcmltYXJ5IG91dGxldCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3V0bGV0ID0gb3V0bGV0O1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21taXQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgYW4gb3V0bGV0IChiZWNhdXNlIGl0IHdhcyBkZXN0cm95ZWQsIGV0YykuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIGN1c3RvbSBvdXRsZXQgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICB1bnJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuICAgIHRoaXMuX291dGxldCA9IG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gbm90aWZpZWQgb2YgYXV4aWxpYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyQXV4T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgb3V0bGV0TmFtZSA9IG91dGxldC5uYW1lO1xuICAgIGlmIChpc0JsYW5rKG91dGxldE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJBdXhPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiBvdXRsZXQgd2l0aCBhIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMuYXV4Um91dGVyKHRoaXMuaG9zdENvbXBvbmVudCk7XG5cbiAgICB0aGlzLl9hdXhSb3V0ZXJzLnNldChvdXRsZXROYW1lLCByb3V0ZXIpO1xuICAgIHJvdXRlci5fb3V0bGV0ID0gb3V0bGV0O1xuXG4gICAgdmFyIGF1eEluc3RydWN0aW9uO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgIGlzUHJlc2VudChhdXhJbnN0cnVjdGlvbiA9IHRoaXMuY3VycmVudEluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW291dGxldE5hbWVdKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5jb21taXQoYXV4SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBpbnN0cnVjdGlvbiwgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGluc3RydWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUsXG4gICAqIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgaXNSb3V0ZUFjdGl2ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBib29sZWFuIHtcbiAgICB2YXIgcm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gYGluc3RydWN0aW9uYCBjb3JyZXNwb25kcyB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICB3aGlsZSAoaXNQcmVzZW50KHJvdXRlci5wYXJlbnQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgIHJvdXRlciA9IHJvdXRlci5wYXJlbnQ7XG4gICAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkgfHwgaXNCbGFuayh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8XG4gICAgICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5yb3V0ZU5hbWUgIT0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJvdXRlTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBwYXJhbUVxdWFscyA9IHRydWU7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXMpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnBhcmFtcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXNba2V5XSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBwYXJhbUVxdWFscyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1FcXVhbHM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEeW5hbWljYWxseSB1cGRhdGUgdGhlIHJvdXRpbmcgY29uZmlndXJhdGlvbiBhbmQgdHJpZ2dlciBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYGBcbiAgICogcm91dGVyLmNvbmZpZyhbXG4gICAqICAgeyAncGF0aCc6ICcvJywgJ2NvbXBvbmVudCc6IEluZGV4Q29tcCB9LFxuICAgKiAgIHsgJ3BhdGgnOiAnL3VzZXIvOmlkJywgJ2NvbXBvbmVudCc6IFVzZXJDb21wIH0sXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbmZpZyhkZWZpbml0aW9uczogUm91dGVEZWZpbml0aW9uW10pOiBQcm9taXNlPGFueT4ge1xuICAgIGRlZmluaXRpb25zLmZvckVhY2goXG4gICAgICAgIChyb3V0ZURlZmluaXRpb24pID0+IHsgdGhpcy5yZWdpc3RyeS5jb25maWcodGhpcy5ob3N0Q29tcG9uZW50LCByb3V0ZURlZmluaXRpb24pOyB9KTtcbiAgICByZXR1cm4gdGhpcy5yZW5hdmlnYXRlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggdGhpcyBtZXRob2RcbiAgICogb3ZlciBgbmF2aWdhdGVCeVVybGAuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB0YWtlcyBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIFJvdXRlIExpbmsgRFNMOlxuICAgKiBgYGBcbiAgICogWycuL015Q21wJywge3BhcmFtOiAzfV1cbiAgICogYGBgXG4gICAqIFNlZSB0aGUge0BsaW5rIFJvdXRlckxpbmt9IGRpcmVjdGl2ZSBmb3IgbW9yZS5cbiAgICovXG4gIG5hdmlnYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlKGxpbmtQYXJhbXMpO1xuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgZmFsc2UpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdG8gYSBVUkwuIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLlxuICAgKiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIGBuYXZpZ2F0ZWAgaW5zdGVhZCBvZiB0aGlzIG1ldGhvZCwgc2luY2UgVVJMcyBhcmUgbW9yZSBicml0dGxlLlxuICAgKlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGJlZ2lucyB3aXRoIGEgYC9gLCByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSBhYnNvbHV0ZWx5LlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXMgbm90IGJlZ2luIHdpdGggYC9gLCB0aGUgcm91dGVyIHdpbGwgbmF2aWdhdGUgcmVsYXRpdmUgdG8gdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0ID0gdXJsO1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLnJlY29nbml6ZSh1cmwpLnRoZW4oKGluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdmlhIHRoZSBwcm92aWRlZCBpbnN0cnVjdGlvbi4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXNcbiAgICogY29tcGxldGUuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQoKS50aGVuKChfKSA9PiB7XG4gICAgICB2YXIgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zOiBBcnJheTxQcm9taXNlPGFueT4+ID0gW107XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY2hpbGQpKTtcbiAgICAgIH1cblxuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCAoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfKSA9PiB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwodW5zZXR0bGVkSW5zdHJ1Y3Rpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25hdmlnYXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fY2FuQWN0aXZhdGUoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pXG4gICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb21taXQoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmluaXNoKGluc3RydWN0aW9uLnRvUm9vdFVybCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdE5hdmlnYXRpb25GaW5pc2godXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHVybCk7IH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1pdE5hdmlnYXRpb25GYWlsKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IodGhpcy5fc3ViamVjdCwgdXJsKTsgfVxuXG4gIHByaXZhdGUgX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihwcm9taXNlLnRoZW4oKF8pID0+IHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKSksIChlcnIpID0+IHtcbiAgICAgIHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IHNldCByZXVzZSBmbGFnc1xuICAgKi9cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdXRsZXQucm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gcmVzdWx0O1xuICAgICAgICAgIGlmIChyZXN1bHQgJiYgaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuQWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZTtcbiAgICB9XG4gICAgaWYgKHJldXNlKSB7XG4gICAgICBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucm91dGVyQ2FuRGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIC8vIFRPRE86IGF1eCByb3V0ZSBsaWZlY3ljbGUgaG9va3NcbiAgICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgIC8vIFRPRE86IGlkZWFsbHksIHRoaXMgY2xvc3VyZSB3b3VsZCBtYXAgdG8gYXN5bmMtYXdhaXQgaW4gRGFydC5cbiAgICAgICAgLy8gRm9yIG5vdywgY2FzdGluZyB0byBhbnkgdG8gc3VwcHJlc3MgYW4gZXJyb3IuXG4gICAgICAgIHJldHVybiA8YW55PnRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG5cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCBvbkVycm9yPzogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvbkVycm9yKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgcm91dGVyJ3Mgb3V0bGV0IGFuZCBhbGwgZGVzY2VuZGFudCBvdXRsZXRzXG4gICAqL1xuICBkZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX2NoaWxkUm91dGVyLmRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgIHZhciBhbmNlc3RvclJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50KSkge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMudW5zaGlmdChhbmNlc3RvclJvdXRlci5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICAgICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKVxuICAgICAgICAgIC50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pICYmIGNoYW5nZVsndHlwZSddICE9ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2UndmUgb3B0ZWQgdG8gdXNlIEFsbCBoYXNoY2hhbmdlIGV2ZW50cyBvY2N1ciBvdXRzaWRlIEFuZ3VsYXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGFwcHMgdGhhdCBhcmUgbWlncmF0aW5nIG1pZ2h0IGhhdmUgaGFzaCBsaW5rcyB0aGF0IG9wZXJhdGUgb3V0c2lkZVxuICAgICAgICAgICAgICAgICAgICAvLyBhbmd1bGFyIHRvIHdoaWNoIHJvdXRpbmcgbXVzdCByZXNwb25kLlxuICAgICAgICAgICAgICAgICAgICAvLyBUbyBzdXBwb3J0IHRoZXNlIGNhc2VzIHdoZXJlIHdlIHJlc3BvbmQgdG8gaGFzaGNoYW5nZXMgYW5kIHJlZGlyZWN0IGFzIGFcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzdWx0LCB3ZSBuZWVkIHRvIHJlcGxhY2UgdGhlIHRvcCBpdGVtIG9uIHRoZSBzdGFjay5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZVsndHlwZSddID09ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSAhPSB0aGlzLl9sb2NhdGlvbi5wYXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLnJlcGxhY2VTdGF0ZShlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fZW1pdE5hdmlnYXRpb25GYWlsKGNoYW5nZVsndXJsJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RyeS5jb25maWdGcm9tQ29tcG9uZW50KHByaW1hcnlDb21wb25lbnQpO1xuICAgIHRoaXMubmF2aWdhdGVCeVVybChsb2NhdGlvbi5wYXRoKCkpO1xuICB9XG5cbiAgY29tbWl0KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICB2YXIgZW1pdFF1ZXJ5ID0gaW5zdHJ1Y3Rpb24udG9VcmxRdWVyeSgpO1xuICAgIGlmIChlbWl0UGF0aC5sZW5ndGggPiAwICYmIGVtaXRQYXRoWzBdICE9ICcvJykge1xuICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICB9XG4gICAgdmFyIHByb21pc2UgPSBzdXBlci5jb21taXQoaW5zdHJ1Y3Rpb24pO1xuICAgIGlmICghX3NraXBMb2NhdGlvbkNoYW5nZSkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbigoXykgPT4geyB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2xvY2F0aW9uU3ViKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9sb2NhdGlvblN1Yik7XG4gICAgICB0aGlzLl9sb2NhdGlvblN1YiA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENoaWxkUm91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50OiBSb3V0ZXIsIGhvc3RDb21wb25lbnQpIHtcbiAgICBzdXBlcihwYXJlbnQucmVnaXN0cnksIHBhcmVudCwgaG9zdENvbXBvbmVudCwgcGFyZW50LnJvb3QpO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB9XG5cblxuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlVcmwodXJsLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxuXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICBpZiAoaXNCbGFuayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgIHJldHVybiBuZXh0O1xuICB9XG4gIGlmIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgIG5leHQgPSBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNoaWxkIDogbnVsbCk7XG4gIH1cbiAgcmV0dXJuIG5leHQudGhlbjxib29sZWFuPigocmVzdWx0OiBib29sZWFuKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBob29rID0gZ2V0Q2FuQWN0aXZhdGVIb29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudChob29rKSkge1xuICAgICAgcmV0dXJuIGhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudCA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG4iXX0=