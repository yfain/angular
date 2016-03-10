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
 * @Component({...})
 * @View({ template: 'user: {{isAdmin}}' })
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
        return this._resolver().then(function (resolution) {
            _this.child = resolution.child;
            return _this.component = resolution.component;
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
    function ComponentInstruction(urlPath, urlParams, data, componentType, terminal, specificity, params) {
        if (params === void 0) { params = null; }
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = lang_1.isPresent(data) ? data : exports.BLANK_ROUTE_DATA;
    }
    return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiRGVmYXVsdEluc3RydWN0aW9uLl90b0xpbmtVcmwiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24iLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24udXJsUGF0aCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24iLCJSZWRpcmVjdEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3RJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkNvbXBvbmVudEluc3RydWN0aW9uIiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYscUJBQW1FLDBCQUEwQixDQUFDLENBQUE7QUFDOUYsc0JBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFHekQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBQ0VBLHFCQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELHlCQUFHQSxHQUFIQSxVQUFJQSxLQUFhQSxJQUFZRSxNQUFNQSxDQUFDQSxxQkFBY0EsQ0FBQ0EsNkJBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0Ysa0JBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUpZLG1CQUFXLGNBSXZCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0g7SUFDRUcsbUJBQW1CQSxJQUEyQ0E7UUFBbERDLG9CQUFrREEsR0FBbERBLE9BQW9DQSxpQkFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBM0NBLFNBQUlBLEdBQUpBLElBQUlBLENBQXVDQTtJQUFHQSxDQUFDQTtJQUVsRUQsdUJBQUdBLEdBQUhBLFVBQUlB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QUNBO0FBQURBLENBQUNBLEFBUEQsRUFBeUMsbUJBQW1CLEVBTzNEO0FBUFksMkJBQW1CLHNCQU8vQixDQUFBO0FBR0Q7Ozs7Ozs7Ozs7O0dBV0c7QUFDSDtJQUlFRzs7T0FFR0E7SUFDSEEsOEJBQW1CQSxPQUFlQSxFQUFTQSxTQUFtQkEsRUFBRUEsSUFBZUEsRUFDNURBLGFBQWFBLEVBQVNBLFFBQWlCQSxFQUFTQSxXQUFtQkEsRUFDbkVBLE1BQXNDQTtRQUE3Q0Msc0JBQTZDQSxHQUE3Q0EsYUFBNkNBO1FBRnRDQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFRQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUMzQ0Esa0JBQWFBLEdBQWJBLGFBQWFBLENBQUFBO1FBQVNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQVNBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFRQTtRQUNuRUEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBZ0NBO1FBUnpEQSxVQUFLQSxHQUFZQSxLQUFLQSxDQUFDQTtRQVNyQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLHdCQUFnQkEsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBQ0hELDJCQUFDQTtBQUFEQSxDQUFDQSxBQVpELElBWUM7QUFaWSw0QkFBb0IsdUJBWWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIFR5cGUsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIGBSb3V0ZVBhcmFtc2AgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBwYXJhbWV0ZXJzIGZvciB0aGUgZ2l2ZW4gcm91dGVcbiAqIGJhc2VkIG9uIHRoZSB1cmwgbWF0Y2hlciBhbmQgb3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhhdCByb3V0ZS5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCBgUm91dGVQYXJhbXNgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZywgUm91dGVQYXJhbXN9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnLCBSb3V0ZURhdGF9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnLCBkYXRhOiB7aXNBZG1pbjogdHJ1ZX19LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7fVxuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBAVmlldyh7IHRlbXBsYXRlOiAndXNlcjoge3tpc0FkbWlufX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgc3RyaW5nOiBpc0FkbWluO1xuICogICBjb25zdHJ1Y3RvcihkYXRhOiBSb3V0ZURhdGEpIHtcbiAqICAgICB0aGlzLmlzQWRtaW4gPSBkYXRhLmdldCgnaXNBZG1pbicpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlRGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IENPTlNUX0VYUFIoe30pKSB7fVxuXG4gIGdldChrZXk6IHN0cmluZyk6IGFueSB7IHJldHVybiBub3JtYWxpemVCbGFuayhTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLmRhdGEsIGtleSkpOyB9XG59XG5cbmV4cG9ydCB2YXIgQkxBTktfUk9VVEVfREFUQSA9IG5ldyBSb3V0ZURhdGEoKTtcblxuLyoqXG4gKiBgSW5zdHJ1Y3Rpb25gIGlzIGEgdHJlZSBvZiB7QGxpbmsgQ29tcG9uZW50SW5zdHJ1Y3Rpb259cyB3aXRoIGFsbCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkXG4gKiB0byB0cmFuc2l0aW9uIGVhY2ggY29tcG9uZW50IGluIHRoZSBhcHAgdG8gYSBnaXZlbiByb3V0ZSwgaW5jbHVkaW5nIGFsbCBhdXhpbGlhcnkgcm91dGVzLlxuICpcbiAqIGBJbnN0cnVjdGlvbmBzIGNhbiBiZSBjcmVhdGVkIHVzaW5nIHtAbGluayBSb3V0ZXIjZ2VuZXJhdGV9LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAqIHBlcmZvcm0gcm91dGUgY2hhbmdlcyB3aXRoIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeUluc3RydWN0aW9ufS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSByb3V0ZXIuZ2VuZXJhdGUoWycvTXlSb3V0ZSddKTtcbiAqICAgICByb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHt9XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXRoIDogJyc7IH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXMgOiBbXTsgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcge1xuICAgIHZhciB0b3RhbCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNvbXBvbmVudC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jaGlsZC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPjtcblxuICAvKipcbiAgICogY29udmVydHMgdGhlIGluc3RydWN0aW9uIGludG8gYSBVUkwgc3RyaW5nXG4gICAqL1xuICB0b1Jvb3RVcmwoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudG9VcmxQYXRoKCkgKyB0aGlzLnRvVXJsUXVlcnkoKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTm9uUm9vdFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIHRvVXJsUXVlcnkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJz8nICsgdGhpcy51cmxQYXJhbXMuam9pbignJicpKSA6ICcnOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgaW5zdHJ1Y3Rpb24gdGhhdCBzaGFyZXMgdGhlIHN0YXRlIG9mIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiwgYnV0IHdpdGhcbiAgICogdGhlIGdpdmVuIGNoaWxkIHtAbGluayBJbnN0cnVjdGlvbn0gcmVwbGFjaW5nIHRoZSBleGlzdGluZyBjaGlsZC5cbiAgICovXG4gIHJlcGxhY2VDaGlsZChjaGlsZDogSW5zdHJ1Y3Rpb24pOiBJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKHRoaXMuY29tcG9uZW50LCBjaGlsZCwgdGhpcy5hdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGZpbmFsIFVSTCBmb3IgdGhlIGluc3RydWN0aW9uIGlzIGBgXG4gICAqL1xuICB0b1VybFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyBkZWZhdWx0IGluc3RydWN0aW9ucyBvdmVycmlkZSB0aGVzZVxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJykgKyB0aGlzLnRvVXJsUXVlcnkoKTtcbiAgfVxuXG4gIC8vIHRoaXMgaXMgdGhlIG5vbi1yb290IHZlcnNpb24gKGNhbGxlZCByZWN1cnNpdmVseSlcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9MaW5rVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTGlua1VybCgpIDogJycpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCk6IHN0cmluZyB7XG4gICAgdmFyIHByaW1hcnkgPSB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCk7XG4gICAgaWYgKHByaW1hcnkubGVuZ3RoID4gMCkge1xuICAgICAgcHJpbWFyeSA9ICcvJyArIHByaW1hcnk7XG4gICAgfVxuICAgIHJldHVybiBwcmltYXJ5O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5TWF0cml4UGFyYW1zKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJzsnICsgdGhpcy51cmxQYXJhbXMuam9pbignOycpKSA6ICcnO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5TWF0cml4UGFyYW1zKCkgKyB0aGlzLl9zdHJpbmdpZnlBdXgoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeUF1eCgpOiBzdHJpbmcge1xuICAgIHZhciByb3V0ZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5hdXhJbnN0cnVjdGlvbiwgKGF1eEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgXzogc3RyaW5nKSA9PiB7XG4gICAgICByb3V0ZXMucHVzaChhdXhJbnN0cnVjdGlvbi5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpKTtcbiAgICB9KTtcbiAgICBpZiAocm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiAnKCcgKyByb3V0ZXMuam9pbignLy8nKSArICcpJztcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cblxuLyoqXG4gKiBhIHJlc29sdmVkIGluc3RydWN0aW9uIGhhcyBhbiBvdXRsZXQgaW5zdHJ1Y3Rpb24gZm9yIGl0c2VsZiwgYnV0IG1heWJlIG5vdCBmb3IuLi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHtcbiAgICBzdXBlcihjb21wb25lbnQsIGNoaWxkLCBhdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSByZXNvbHZlZCBkZWZhdWx0IHJvdXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IERlZmF1bHRJbnN0cnVjdGlvbikge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIHt9KTtcbiAgfVxuXG4gIHRvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tcG9uZW50IHRoYXQgbWF5IG5lZWQgdG8gZG8gc29tZSByZWRpcmVjdGlvbiBvciBsYXp5IGxvYWRpbmcgYXQgYSBsYXRlciB0aW1lLlxuICovXG5leHBvcnQgY2xhc3MgVW5yZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZXNvbHZlcjogKCkgPT4gUHJvbWlzZTxJbnN0cnVjdGlvbj4sIHByaXZhdGUgX3VybFBhdGg6IHN0cmluZyA9ICcnLFxuICAgICAgICAgICAgICBwcml2YXRlIF91cmxQYXJhbXM6IHN0cmluZ1tdID0gQ09OU1RfRVhQUihbXSkpIHtcbiAgICBzdXBlcihudWxsLCBudWxsLCB7fSk7XG4gIH1cblxuICBnZXQgdXJsUGF0aCgpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGF0aDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl91cmxQYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhdGg7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldCB1cmxQYXJhbXMoKTogc3RyaW5nW10ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhcmFtcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmxQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlcigpLnRoZW4oKHJlc29sdXRpb246IEluc3RydWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLmNoaWxkID0gcmVzb2x1dGlvbi5jaGlsZDtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudCA9IHJlc29sdXRpb24uY29tcG9uZW50O1xuICAgIH0pO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSwgcHJpdmF0ZSBfc3BlY2lmaWNpdHk6IHN0cmluZykge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3BlY2lmaWNpdHk7IH1cbn1cblxuXG4vKipcbiAqIEEgYENvbXBvbmVudEluc3RydWN0aW9uYCByZXByZXNlbnRzIHRoZSByb3V0ZSBzdGF0ZSBmb3IgYSBzaW5nbGUgY29tcG9uZW50LlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbnNgIGlzIGEgcHVibGljIEFQSS4gSW5zdGFuY2VzIG9mIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgYXJlIHBhc3NlZFxuICogdG8gcm91dGUgbGlmZWN5Y2xlIGhvb2tzLCBsaWtlIHtAbGluayBDYW5BY3RpdmF0ZX0uXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uYHMgYXJlIFtoYXNoIGNvbnNlZF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFzaF9jb25zaW5nKS4gWW91IHNob3VsZFxuICogbmV2ZXIgY29uc3RydWN0IG9uZSB5b3Vyc2VsZiB3aXRoIFwibmV3LlwiIEluc3RlYWQsIHJlbHkgb24ge0BsaW5rIFJvdXRlci9Sb3V0ZVJlY29nbml6ZXJ9IHRvXG4gKiBjb25zdHJ1Y3QgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogWW91IHNob3VsZCBub3QgbW9kaWZ5IHRoaXMgb2JqZWN0LiBJdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyByb3V0ZURhdGE6IFJvdXRlRGF0YTtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdXJsUGF0aDogc3RyaW5nLCBwdWJsaWMgdXJsUGFyYW1zOiBzdHJpbmdbXSwgZGF0YTogUm91dGVEYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgY29tcG9uZW50VHlwZSwgcHVibGljIHRlcm1pbmFsOiBib29sZWFuLCBwdWJsaWMgc3BlY2lmaWNpdHk6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSBudWxsKSB7XG4gICAgdGhpcy5yb3V0ZURhdGEgPSBpc1ByZXNlbnQoZGF0YSkgPyBkYXRhIDogQkxBTktfUk9VVEVfREFUQTtcbiAgfVxufVxuIl19