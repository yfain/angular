'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
var RouteParams = (function () {
    function RouteParams(params) {
        this.params = params;
    }
    RouteParams.prototype.get = function (param) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param)); };
    return RouteParams;
})();
exports.RouteParams = RouteParams;
/**
 * `RouteData` is an immutable map of additional data you can configure in your {@link Route}.
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteData} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({
 *   ...,
 *   template: 'user: {{isAdmin}}'
 * })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
var RouteData = (function () {
    function RouteData(data) {
        if (data === void 0) { data = lang_1.CONST_EXPR({}); }
        this.data = data;
    }
    RouteData.prototype.get = function (key) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key)); };
    return RouteData;
})();
exports.RouteData = RouteData;
exports.BLANK_ROUTE_DATA = new RouteData();
/**
 * `Instruction` is a tree of {@link ComponentInstruction}s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using {@link Router#generate}, and can be used to
 * perform route changes with {@link Router#navigateByInstruction}.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
var Instruction = (function () {
    function Instruction(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    Object.defineProperty(Instruction.prototype, "urlPath", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlPath : ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "urlParams", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlParams : []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "specificity", {
        get: function () {
            var total = '';
            if (lang_1.isPresent(this.component)) {
                total += this.component.specificity;
            }
            if (lang_1.isPresent(this.child)) {
                total += this.child.specificity;
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * converts the instruction into a URL string
     */
    Instruction.prototype.toRootUrl = function () { return this.toUrlPath() + this.toUrlQuery(); };
    /** @internal */
    Instruction.prototype._toNonRootUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    Instruction.prototype.toUrlQuery = function () { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; };
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    Instruction.prototype.replaceChild = function (child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    };
    /**
     * If the final URL for the instruction is ``
     */
    Instruction.prototype.toUrlPath = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    // default instructions override these
    Instruction.prototype.toLinkUrl = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '') + this.toUrlQuery();
    };
    // this is the non-root version (called recursively)
    /** @internal */
    Instruction.prototype._toLinkUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAuxPrefixed = function () {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    };
    /** @internal */
    Instruction.prototype._stringifyMatrixParams = function () {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAux = function () {
        if (lang_1.isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    };
    /** @internal */
    Instruction.prototype._stringifyAux = function () {
        var routes = [];
        collection_1.StringMapWrapper.forEach(this.auxInstruction, function (auxInstruction, _) {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    };
    return Instruction;
})();
exports.Instruction = Instruction;
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
var ResolvedInstruction = (function (_super) {
    __extends(ResolvedInstruction, _super);
    function ResolvedInstruction(component, child, auxInstruction) {
        _super.call(this, component, child, auxInstruction);
    }
    ResolvedInstruction.prototype.resolveComponent = function () {
        return async_1.PromiseWrapper.resolve(this.component);
    };
    return ResolvedInstruction;
})(Instruction);
exports.ResolvedInstruction = ResolvedInstruction;
/**
 * Represents a resolved default route
 */
var DefaultInstruction = (function (_super) {
    __extends(DefaultInstruction, _super);
    function DefaultInstruction(component, child) {
        _super.call(this, component, child, {});
    }
    DefaultInstruction.prototype.toLinkUrl = function () { return ''; };
    /** @internal */
    DefaultInstruction.prototype._toLinkUrl = function () { return ''; };
    return DefaultInstruction;
})(ResolvedInstruction);
exports.DefaultInstruction = DefaultInstruction;
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
var UnresolvedInstruction = (function (_super) {
    __extends(UnresolvedInstruction, _super);
    function UnresolvedInstruction(_resolver, _urlPath, _urlParams) {
        if (_urlPath === void 0) { _urlPath = ''; }
        if (_urlParams === void 0) { _urlParams = lang_1.CONST_EXPR([]); }
        _super.call(this, null, null, {});
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    Object.defineProperty(UnresolvedInstruction.prototype, "urlPath", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlPath;
            }
            if (lang_1.isPresent(this._urlPath)) {
                return this._urlPath;
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UnresolvedInstruction.prototype, "urlParams", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlParams;
            }
            if (lang_1.isPresent(this._urlParams)) {
                return this._urlParams;
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    UnresolvedInstruction.prototype.resolveComponent = function () {
        var _this = this;
        if (lang_1.isPresent(this.component)) {
            return async_1.PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then(function (instruction) {
            _this.child = lang_1.isPresent(instruction) ? instruction.child : null;
            return _this.component = lang_1.isPresent(instruction) ? instruction.component : null;
        });
    };
    return UnresolvedInstruction;
})(Instruction);
exports.UnresolvedInstruction = UnresolvedInstruction;
var RedirectInstruction = (function (_super) {
    __extends(RedirectInstruction, _super);
    function RedirectInstruction(component, child, auxInstruction, _specificity) {
        _super.call(this, component, child, auxInstruction);
        this._specificity = _specificity;
    }
    Object.defineProperty(RedirectInstruction.prototype, "specificity", {
        get: function () { return this._specificity; },
        enumerable: true,
        configurable: true
    });
    return RedirectInstruction;
})(ResolvedInstruction);
exports.RedirectInstruction = RedirectInstruction;
/**
 * A `ComponentInstruction` represents the route state for a single component.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [hash consed](https://en.wikipedia.org/wiki/Hash_consing). You should
 * never construct one yourself with "new." Instead, rely on {@link Router/RouteRecognizer} to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
var ComponentInstruction = (function () {
    /**
     * @internal
     */
    function ComponentInstruction(urlPath, urlParams, data, componentType, terminal, specificity, params, routeName) {
        if (params === void 0) { params = null; }
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.routeName = routeName;
        this.reuse = false;
        this.routeData = lang_1.isPresent(data) ? data : exports.BLANK_ROUTE_DATA;
    }
    return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiRGVmYXVsdEluc3RydWN0aW9uLl90b0xpbmtVcmwiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24iLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24udXJsUGF0aCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24iLCJSZWRpcmVjdEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3RJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkNvbXBvbmVudEluc3RydWN0aW9uIiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYscUJBQW1FLDBCQUEwQixDQUFDLENBQUE7QUFDOUYsc0JBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFHekQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBQ0VBLHFCQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELHlCQUFHQSxHQUFIQSxVQUFJQSxLQUFhQSxJQUFZRSxNQUFNQSxDQUFDQSxxQkFBY0EsQ0FBQ0EsNkJBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0Ysa0JBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUpZLG1CQUFXLGNBSXZCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0c7QUFDSDtJQUNFRyxtQkFBbUJBLElBQTJDQTtRQUFsREMsb0JBQWtEQSxHQUFsREEsT0FBb0NBLGlCQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUEzQ0EsU0FBSUEsR0FBSkEs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QVlBLEdBQVpBLFlBQVlBLENBQVFBO0lBRTlFQSxDQUFDQTtJQUVERCxzQkFBSUEsNENBQVdBO2FBQWZBLGNBQTRCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBQ3pEQSwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUF5QyxtQkFBbUIsRUFRM0Q7QUFSWSwyQkFBbUIsc0JBUS9CLENBQUE7QUFHRDs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBSUVHOztPQUVHQTtJQUNIQSw4QkFDV0EsT0FBZUEsRUFBU0EsU0FBbUJBLEVBQUVBLElBQWVBLEVBQVNBLGFBQWFBLEVBQ2xGQSxRQUFpQkEsRUFBU0EsV0FBbUJBLEVBQzdDQSxNQUFzQ0EsRUFBU0EsU0FBaUJBO1FBQXZFQyxzQkFBNkNBLEdBQTdDQSxhQUE2Q0E7UUFGdENBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVNBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQTBCQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBQUE7UUFDbEZBLGFBQVFBLEdBQVJBLFFBQVFBLENBQVNBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFRQTtRQUM3Q0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBZ0NBO1FBQVNBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVFBO1FBVDNFQSxVQUFLQSxHQUFZQSxLQUFLQSxDQUFDQTtRQVVyQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLHdCQUFnQkEsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBQ0hELDJCQUFDQTtBQUFEQSxDQUFDQSxBQWJELElBYUM7QUFiWSw0QkFBb0IsdUJBYWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIFR5cGUsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIGBSb3V0ZVBhcmFtc2AgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBwYXJhbWV0ZXJzIGZvciB0aGUgZ2l2ZW4gcm91dGVcbiAqIGJhc2VkIG9uIHRoZSB1cmwgbWF0Y2hlciBhbmQgb3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhhdCByb3V0ZS5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCBgUm91dGVQYXJhbXNgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZywgUm91dGVQYXJhbXN9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnLCBSb3V0ZURhdGF9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnLCBkYXRhOiB7aXNBZG1pbjogdHJ1ZX19LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7fVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICAuLi4sXG4gKiAgIHRlbXBsYXRlOiAndXNlcjoge3tpc0FkbWlufX0nXG4gKiB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIHN0cmluZzogaXNBZG1pbjtcbiAqICAgY29uc3RydWN0b3IoZGF0YTogUm91dGVEYXRhKSB7XG4gKiAgICAgdGhpcy5pc0FkbWluID0gZGF0YS5nZXQoJ2lzQWRtaW4nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZURhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBDT05TVF9FWFBSKHt9KSkge31cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5kYXRhLCBrZXkpKTsgfVxufVxuXG5leHBvcnQgdmFyIEJMQU5LX1JPVVRFX0RBVEEgPSBuZXcgUm91dGVEYXRhKCk7XG5cbi8qKlxuICogYEluc3RydWN0aW9uYCBpcyBhIHRyZWUgb2Yge0BsaW5rIENvbXBvbmVudEluc3RydWN0aW9ufXMgd2l0aCBhbGwgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuICogdG8gdHJhbnNpdGlvbiBlYWNoIGNvbXBvbmVudCBpbiB0aGUgYXBwIHRvIGEgZ2l2ZW4gcm91dGUsIGluY2x1ZGluZyBhbGwgYXV4aWxpYXJ5IHJvdXRlcy5cbiAqXG4gKiBgSW5zdHJ1Y3Rpb25gcyBjYW4gYmUgY3JlYXRlZCB1c2luZyB7QGxpbmsgUm91dGVyI2dlbmVyYXRlfSwgYW5kIGNhbiBiZSB1c2VkIHRvXG4gKiBwZXJmb3JtIHJvdXRlIGNoYW5nZXMgd2l0aCB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlJbnN0cnVjdGlvbn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgdmFyIGluc3RydWN0aW9uID0gcm91dGVyLmdlbmVyYXRlKFsnL015Um91dGUnXSk7XG4gKiAgICAgcm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbik7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBST1VURVJfUFJPVklERVJTKTtcbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgcHVibGljIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7fVxuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGF0aCA6ICcnOyB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zIDogW107IH1cblxuICBnZXQgc3BlY2lmaWNpdHkoKTogc3RyaW5nIHtcbiAgICB2YXIgdG90YWwgPSAnJztcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jb21wb25lbnQuc3BlY2lmaWNpdHk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jaGlsZCkpIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuY2hpbGQuc3BlY2lmaWNpdHk7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbDtcbiAgfVxuXG4gIGFic3RyYWN0IHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj47XG5cbiAgLyoqXG4gICAqIGNvbnZlcnRzIHRoZSBpbnN0cnVjdGlvbiBpbnRvIGEgVVJMIHN0cmluZ1xuICAgKi9cbiAgdG9Sb290VXJsKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnRvVXJsUGF0aCgpICsgdGhpcy50b1VybFF1ZXJ5KCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b05vblJvb3RVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCkgK1xuICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICB0b1VybFF1ZXJ5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnVybFBhcmFtcy5sZW5ndGggPiAwID8gKCc/JyArIHRoaXMudXJsUGFyYW1zLmpvaW4oJyYnKSkgOiAnJzsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IGluc3RydWN0aW9uIHRoYXQgc2hhcmVzIHRoZSBzdGF0ZSBvZiB0aGUgZXhpc3RpbmcgaW5zdHJ1Y3Rpb24sIGJ1dCB3aXRoXG4gICAqIHRoZSBnaXZlbiBjaGlsZCB7QGxpbmsgSW5zdHJ1Y3Rpb259IHJlcGxhY2luZyB0aGUgZXhpc3RpbmcgY2hpbGQuXG4gICAqL1xuICByZXBsYWNlQ2hpbGQoY2hpbGQ6IEluc3RydWN0aW9uKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbih0aGlzLmNvbXBvbmVudCwgY2hpbGQsIHRoaXMuYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBmaW5hbCBVUkwgZm9yIHRoZSBpbnN0cnVjdGlvbiBpcyBgYFxuICAgKi9cbiAgdG9VcmxQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeUF1eCgpICtcbiAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTm9uUm9vdFVybCgpIDogJycpO1xuICB9XG5cbiAgLy8gZGVmYXVsdCBpbnN0cnVjdGlvbnMgb3ZlcnJpZGUgdGhlc2VcbiAgdG9MaW5rVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeUF1eCgpICtcbiAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTGlua1VybCgpIDogJycpICsgdGhpcy50b1VybFF1ZXJ5KCk7XG4gIH1cblxuICAvLyB0aGlzIGlzIHRoZSBub24tcm9vdCB2ZXJzaW9uIChjYWxsZWQgcmVjdXJzaXZlbHkpXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTGlua1VybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b0xpbmtVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpOiBzdHJpbmcge1xuICAgIHZhciBwcmltYXJ5ID0gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpO1xuICAgIGlmIChwcmltYXJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHByaW1hcnkgPSAnLycgKyBwcmltYXJ5O1xuICAgIH1cbiAgICByZXR1cm4gcHJpbWFyeTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhcmFtcy5sZW5ndGggPiAwID8gKCc7JyArIHRoaXMudXJsUGFyYW1zLmpvaW4oJzsnKSkgOiAnJztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpICsgdGhpcy5fc3RyaW5naWZ5QXV4KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlBdXgoKTogc3RyaW5nIHtcbiAgICB2YXIgcm91dGVzID0gW107XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuYXV4SW5zdHJ1Y3Rpb24sIChhdXhJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF86IHN0cmluZykgPT4ge1xuICAgICAgcm91dGVzLnB1c2goYXV4SW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKSk7XG4gICAgfSk7XG4gICAgaWYgKHJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gJygnICsgcm91dGVzLmpvaW4oJy8vJykgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5cbi8qKlxuICogYSByZXNvbHZlZCBpbnN0cnVjdGlvbiBoYXMgYW4gb3V0bGV0IGluc3RydWN0aW9uIGZvciBpdHNlbGYsIGJ1dCBtYXliZSBub3QgZm9yLi4uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwgYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVzb2x2ZWQgZGVmYXVsdCByb3V0ZVxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEluc3RydWN0aW9uIGV4dGVuZHMgUmVzb2x2ZWRJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBEZWZhdWx0SW5zdHJ1Y3Rpb24pIHtcbiAgICBzdXBlcihjb21wb25lbnQsIGNoaWxkLCB7fSk7XG4gIH1cblxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9MaW5rVXJsKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbXBvbmVudCB0aGF0IG1heSBuZWVkIHRvIGRvIHNvbWUgcmVkaXJlY3Rpb24gb3IgbGF6eSBsb2FkaW5nIGF0IGEgbGF0ZXIgdGltZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFVucmVzb2x2ZWRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9yZXNvbHZlcjogKCkgPT4gUHJvbWlzZTxJbnN0cnVjdGlvbj4sIHByaXZhdGUgX3VybFBhdGg6IHN0cmluZyA9ICcnLFxuICAgICAgcHJpdmF0ZSBfdXJsUGFyYW1zOiBzdHJpbmdbXSA9IENPTlNUX0VYUFIoW10pKSB7XG4gICAgc3VwZXIobnVsbCwgbnVsbCwge30pO1xuICB9XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnVybFBhdGg7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdXJsUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmxQYXRoO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnVybFBhcmFtcztcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl91cmxQYXJhbXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXJsUGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZXIoKS50aGVuKChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgIHRoaXMuY2hpbGQgPSBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pID8gaW5zdHJ1Y3Rpb24uY2hpbGQgOiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50ID0gaXNQcmVzZW50KGluc3RydWN0aW9uKSA/IGluc3RydWN0aW9uLmNvbXBvbmVudCA6IG51bGw7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVkaXJlY3RJbnN0cnVjdGlvbiBleHRlbmRzIFJlc29sdmVkSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259LCBwcml2YXRlIF9zcGVjaWZpY2l0eTogc3RyaW5nKSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwgYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgZ2V0IHNwZWNpZmljaXR5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9zcGVjaWZpY2l0eTsgfVxufVxuXG5cbi8qKlxuICogQSBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gIHJlcHJlc2VudHMgdGhlIHJvdXRlIHN0YXRlIGZvciBhIHNpbmdsZSBjb21wb25lbnQuXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uc2AgaXMgYSBwdWJsaWMgQVBJLiBJbnN0YW5jZXMgb2YgYENvbXBvbmVudEluc3RydWN0aW9uYCBhcmUgcGFzc2VkXG4gKiB0byByb3V0ZSBsaWZlY3ljbGUgaG9va3MsIGxpa2Uge0BsaW5rIENhbkFjdGl2YXRlfS5cbiAqXG4gKiBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcyBhcmUgW2hhc2ggY29uc2VkXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXNoX2NvbnNpbmcpLiBZb3Ugc2hvdWxkXG4gKiBuZXZlciBjb25zdHJ1Y3Qgb25lIHlvdXJzZWxmIHdpdGggXCJuZXcuXCIgSW5zdGVhZCwgcmVseSBvbiB7QGxpbmsgUm91dGVyL1JvdXRlUmVjb2duaXplcn0gdG9cbiAqIGNvbnN0cnVjdCBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcy5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCBtb2RpZnkgdGhpcyBvYmplY3QuIEl0IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgcmV1c2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIHJvdXRlRGF0YTogUm91dGVEYXRhO1xuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHVybFBhdGg6IHN0cmluZywgcHVibGljIHVybFBhcmFtczogc3RyaW5nW10sIGRhdGE6IFJvdXRlRGF0YSwgcHVibGljIGNvbXBvbmVudFR5cGUsXG4gICAgICBwdWJsaWMgdGVybWluYWw6IGJvb2xlYW4sIHB1YmxpYyBzcGVjaWZpY2l0eTogc3RyaW5nLFxuICAgICAgcHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSBudWxsLCBwdWJsaWMgcm91dGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnJvdXRlRGF0YSA9IGlzUHJlc2VudChkYXRhKSA/IGRhdGEgOiBCTEFOS19ST1VURV9EQVRBO1xuICB9XG59XG4iXX0=