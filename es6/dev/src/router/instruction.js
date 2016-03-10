import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';
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
export class RouteParams {
    constructor(params) {
        this.params = params;
    }
    get(param) { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}
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
export class RouteData {
    constructor(data = CONST_EXPR({})) {
        this.data = data;
    }
    get(key) { return normalizeBlank(StringMapWrapper.get(this.data, key)); }
}
export var BLANK_ROUTE_DATA = new RouteData();
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
export class Instruction {
    constructor(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    get urlPath() { return isPresent(this.component) ? this.component.urlPath : ''; }
    get urlParams() { return isPresent(this.component) ? this.component.urlParams : []; }
    get specificity() {
        var total = '';
        if (isPresent(this.component)) {
            total += this.component.specificity;
        }
        if (isPresent(this.child)) {
            total += this.child.specificity;
        }
        return total;
    }
    /**
     * converts the instruction into a URL string
     */
    toRootUrl() { return this.toUrlPath() + this.toUrlQuery(); }
    /** @internal */
    _toNonRootUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    toUrlQuery() { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; }
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    }
    /**
     * If the final URL for the instruction is ``
     */
    toUrlPath() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    // default instructions override these
    toLinkUrl() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '') + this.toUrlQuery();
    }
    // this is the non-root version (called recursively)
    /** @internal */
    _toLinkUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '');
    }
    /** @internal */
    _stringifyPathMatrixAuxPrefixed() {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    }
    /** @internal */
    _stringifyMatrixParams() {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    }
    /** @internal */
    _stringifyPathMatrixAux() {
        if (isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    }
    /** @internal */
    _stringifyAux() {
        var routes = [];
        StringMapWrapper.forEach(this.auxInstruction, (auxInstruction, _) => {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    }
}
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
export class ResolvedInstruction extends Instruction {
    constructor(component, child, auxInstruction) {
        super(component, child, auxInstruction);
    }
    resolveComponent() {
        return PromiseWrapper.resolve(this.component);
    }
}
/**
 * Represents a resolved default route
 */
export class DefaultInstruction extends ResolvedInstruction {
    constructor(component, child) {
        super(component, child, {});
    }
    toLinkUrl() { return ''; }
    /** @internal */
    _toLinkUrl() { return ''; }
}
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
export class UnresolvedInstruction extends Instruction {
    constructor(_resolver, _urlPath = '', _urlParams = CONST_EXPR([])) {
        super(null, null, {});
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    get urlPath() {
        if (isPresent(this.component)) {
            return this.component.urlPath;
        }
        if (isPresent(this._urlPath)) {
            return this._urlPath;
        }
        return '';
    }
    get urlParams() {
        if (isPresent(this.component)) {
            return this.component.urlParams;
        }
        if (isPresent(this._urlParams)) {
            return this._urlParams;
        }
        return [];
    }
    resolveComponent() {
        if (isPresent(this.component)) {
            return PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then((resolution) => {
            this.child = resolution.child;
            return this.component = resolution.component;
        });
    }
}
export class RedirectInstruction extends ResolvedInstruction {
    constructor(component, child, auxInstruction, _specificity) {
        super(component, child, auxInstruction);
        this._specificity = _specificity;
    }
    get specificity() { return this._specificity; }
}
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
export class ComponentInstruction {
    /**
     * @internal
     */
    constructor(urlPath, urlParams, data, componentType, terminal, specificity, params = null) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = isPresent(data) ? data : BLANK_ROUTE_DATA;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiRGVmYXVsdEluc3RydWN0aW9uLl90b0xpbmtVcmwiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24iLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24udXJsUGF0aCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24iLCJSZWRpcmVjdEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3RJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkNvbXBvbmVudEluc3RydWN0aW9uIiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJPQUFPLEVBQWtCLGdCQUFnQixFQUFjLE1BQU0sZ0NBQWdDO09BQ3RGLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQVEsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ3RGLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO0FBR3hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUNFQSxZQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELEdBQUdBLENBQUNBLEtBQWFBLElBQVlFLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakdGLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBQ0VHLFlBQW1CQSxJQUFJQSxHQUF5QkEsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBM0NDLFNBQUlBLEdBQUpBLElBQUlBLENBQXVDQTtJQUFHQSxDQUFDQTtJQUVsRUQsR0FBR0EsQ0FBQ0EsR0FBV0EsSUFBU0UsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFD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Q0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtJQUNaQSxDQUFDQTtJQUVERixJQUFJQSxTQUFTQTtRQUNYRyxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDbENBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFFREgsZ0JBQWdCQTtRQUNkSSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDaERBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFVBQXVCQTtZQUNuREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFVBQVVBLENBQUNBLFNBQVNBLENBQUNBO1FBQy9DQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNISixDQUFDQTtBQUdELHlDQUF5QyxtQkFBbUI7SUFDMURLLFlBQVlBLFNBQStCQSxFQUFFQSxLQUFrQkEsRUFDbkRBLGNBQTRDQSxFQUFVQSxZQUFvQkE7UUFDcEZDLE1BQU1BLFNBQVNBLEVBQUVBLEtBQUtBLEVBQUVBLGNBQWNBLENBQUNBLENBQUNBO1FBRHdCQSxpQkFBWUEsR0FBWkEsWUFBWUEsQ0FBUUE7SUFFdEZBLENBQUNBO0lBRURELElBQUlBLFdBQVdBLEtBQWFFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO0FBQ3pERixDQUFDQTtBQUdEOzs7Ozs7Ozs7OztHQVdHO0FBQ0g7SUFJRUc7O09BRUdBO0lBQ0hBLFlBQW1CQSxPQUFlQSxFQUFTQSxTQUFtQkEsRUFBRUEsSUFBZUEsRUFDNURBLGFBQWFBLEVBQVNBLFFBQWlCQSxFQUFTQSxXQUFtQkEsRUFDbkVBLE1BQU1BLEdBQTRCQSxJQUFJQTtRQUZ0Q0MsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBUUE7UUFBU0EsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFDM0NBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFBQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFTQTtRQUFTQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBUUE7UUFDbkVBLFdBQU1BLEdBQU5BLE1BQU1BLENBQWdDQTtRQVJ6REEsVUFBS0EsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFTckJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLGdCQUFnQkEsQ0FBQ0E7SUFDN0RBLENBQUNBO0FBQ0hELENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIFR5cGUsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIGBSb3V0ZVBhcmFtc2AgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBwYXJhbWV0ZXJzIGZvciB0aGUgZ2l2ZW4gcm91dGVcbiAqIGJhc2VkIG9uIHRoZSB1cmwgbWF0Y2hlciBhbmQgb3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhhdCByb3V0ZS5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCBgUm91dGVQYXJhbXNgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZywgUm91dGVQYXJhbXN9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnLCBSb3V0ZURhdGF9IGZyb21cbiAqICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgbmFtZTogJ1VzZXJDbXAnLCBkYXRhOiB7aXNBZG1pbjogdHJ1ZX19LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7fVxuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBAVmlldyh7IHRlbXBsYXRlOiAndXNlcjoge3tpc0FkbWlufX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgc3RyaW5nOiBpc0FkbWluO1xuICogICBjb25zdHJ1Y3RvcihkYXRhOiBSb3V0ZURhdGEpIHtcbiAqICAgICB0aGlzLmlzQWRtaW4gPSBkYXRhLmdldCgnaXNBZG1pbicpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlRGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IENPTlNUX0VYUFIoe30pKSB7fVxuXG4gIGdldChrZXk6IHN0cmluZyk6IGFueSB7IHJldHVybiBub3JtYWxpemVCbGFuayhTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLmRhdGEsIGtleSkpOyB9XG59XG5cbmV4cG9ydCB2YXIgQkxBTktfUk9VVEVfREFUQSA9IG5ldyBSb3V0ZURhdGEoKTtcblxuLyoqXG4gKiBgSW5zdHJ1Y3Rpb25gIGlzIGEgdHJlZSBvZiB7QGxpbmsgQ29tcG9uZW50SW5zdHJ1Y3Rpb259cyB3aXRoIGFsbCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkXG4gKiB0byB0cmFuc2l0aW9uIGVhY2ggY29tcG9uZW50IGluIHRoZSBhcHAgdG8gYSBnaXZlbiByb3V0ZSwgaW5jbHVkaW5nIGFsbCBhdXhpbGlhcnkgcm91dGVzLlxuICpcbiAqIGBJbnN0cnVjdGlvbmBzIGNhbiBiZSBjcmVhdGVkIHVzaW5nIHtAbGluayBSb3V0ZXIjZ2VuZXJhdGV9LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAqIHBlcmZvcm0gcm91dGUgY2hhbmdlcyB3aXRoIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeUluc3RydWN0aW9ufS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSByb3V0ZXIuZ2VuZXJhdGUoWycvTXlSb3V0ZSddKTtcbiAqICAgICByb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHt9XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXRoIDogJyc7IH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXMgOiBbXTsgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcge1xuICAgIHZhciB0b3RhbCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNvbXBvbmVudC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jaGlsZC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPjtcblxuICAvKipcbiAgICogY29udmVydHMgdGhlIGluc3RydWN0aW9uIGludG8gYSBVUkwgc3RyaW5nXG4gICAqL1xuICB0b1Jvb3RVcmwoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudG9VcmxQYXRoKCkgKyB0aGlzLnRvVXJsUXVlcnkoKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTm9uUm9vdFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIHRvVXJsUXVlcnkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJz8nICsgdGhpcy51cmxQYXJhbXMuam9pbignJicpKSA6ICcnOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgaW5zdHJ1Y3Rpb24gdGhhdCBzaGFyZXMgdGhlIHN0YXRlIG9mIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiwgYnV0IHdpdGhcbiAgICogdGhlIGdpdmVuIGNoaWxkIHtAbGluayBJbnN0cnVjdGlvbn0gcmVwbGFjaW5nIHRoZSBleGlzdGluZyBjaGlsZC5cbiAgICovXG4gIHJlcGxhY2VDaGlsZChjaGlsZDogSW5zdHJ1Y3Rpb24pOiBJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKHRoaXMuY29tcG9uZW50LCBjaGlsZCwgdGhpcy5hdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGZpbmFsIFVSTCBmb3IgdGhlIGluc3RydWN0aW9uIGlzIGBgXG4gICAqL1xuICB0b1VybFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyBkZWZhdWx0IGluc3RydWN0aW9ucyBvdmVycmlkZSB0aGVzZVxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJykgKyB0aGlzLnRvVXJsUXVlcnkoKTtcbiAgfVxuXG4gIC8vIHRoaXMgaXMgdGhlIG5vbi1yb290IHZlcnNpb24gKGNhbGxlZCByZWN1cnNpdmVseSlcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9MaW5rVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTGlua1VybCgpIDogJycpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCk6IHN0cmluZyB7XG4gICAgdmFyIHByaW1hcnkgPSB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCk7XG4gICAgaWYgKHByaW1hcnkubGVuZ3RoID4gMCkge1xuICAgICAgcHJpbWFyeSA9ICcvJyArIHByaW1hcnk7XG4gICAgfVxuICAgIHJldHVybiBwcmltYXJ5O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5TWF0cml4UGFyYW1zKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJzsnICsgdGhpcy51cmxQYXJhbXMuam9pbignOycpKSA6ICcnO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5TWF0cml4UGFyYW1zKCkgKyB0aGlzLl9zdHJpbmdpZnlBdXgoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeUF1eCgpOiBzdHJpbmcge1xuICAgIHZhciByb3V0ZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5hdXhJbnN0cnVjdGlvbiwgKGF1eEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgXzogc3RyaW5nKSA9PiB7XG4gICAgICByb3V0ZXMucHVzaChhdXhJbnN0cnVjdGlvbi5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpKTtcbiAgICB9KTtcbiAgICBpZiAocm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiAnKCcgKyByb3V0ZXMuam9pbignLy8nKSArICcpJztcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cblxuLyoqXG4gKiBhIHJlc29sdmVkIGluc3RydWN0aW9uIGhhcyBhbiBvdXRsZXQgaW5zdHJ1Y3Rpb24gZm9yIGl0c2VsZiwgYnV0IG1heWJlIG5vdCBmb3IuLi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHtcbiAgICBzdXBlcihjb21wb25lbnQsIGNoaWxkLCBhdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSByZXNvbHZlZCBkZWZhdWx0IHJvdXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IERlZmF1bHRJbnN0cnVjdGlvbikge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIHt9KTtcbiAgfVxuXG4gIHRvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tcG9uZW50IHRoYXQgbWF5IG5lZWQgdG8gZG8gc29tZSByZWRpcmVjdGlvbiBvciBsYXp5IGxvYWRpbmcgYXQgYSBsYXRlciB0aW1lLlxuICovXG5leHBvcnQgY2xhc3MgVW5yZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZXNvbHZlcjogKCkgPT4gUHJvbWlzZTxJbnN0cnVjdGlvbj4sIHByaXZhdGUgX3VybFBhdGg6IHN0cmluZyA9ICcnLFxuICAgICAgICAgICAgICBwcml2YXRlIF91cmxQYXJhbXM6IHN0cmluZ1tdID0gQ09OU1RfRVhQUihbXSkpIHtcbiAgICBzdXBlcihudWxsLCBudWxsLCB7fSk7XG4gIH1cblxuICBnZXQgdXJsUGF0aCgpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGF0aDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl91cmxQYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhdGg7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldCB1cmxQYXJhbXMoKTogc3RyaW5nW10ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhcmFtcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmxQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlcigpLnRoZW4oKHJlc29sdXRpb246IEluc3RydWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLmNoaWxkID0gcmVzb2x1dGlvbi5jaGlsZDtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudCA9IHJlc29sdXRpb24uY29tcG9uZW50O1xuICAgIH0pO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSwgcHJpdmF0ZSBfc3BlY2lmaWNpdHk6IHN0cmluZykge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3BlY2lmaWNpdHk7IH1cbn1cblxuXG4vKipcbiAqIEEgYENvbXBvbmVudEluc3RydWN0aW9uYCByZXByZXNlbnRzIHRoZSByb3V0ZSBzdGF0ZSBmb3IgYSBzaW5nbGUgY29tcG9uZW50LlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbnNgIGlzIGEgcHVibGljIEFQSS4gSW5zdGFuY2VzIG9mIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgYXJlIHBhc3NlZFxuICogdG8gcm91dGUgbGlmZWN5Y2xlIGhvb2tzLCBsaWtlIHtAbGluayBDYW5BY3RpdmF0ZX0uXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uYHMgYXJlIFtoYXNoIGNvbnNlZF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFzaF9jb25zaW5nKS4gWW91IHNob3VsZFxuICogbmV2ZXIgY29uc3RydWN0IG9uZSB5b3Vyc2VsZiB3aXRoIFwibmV3LlwiIEluc3RlYWQsIHJlbHkgb24ge0BsaW5rIFJvdXRlci9Sb3V0ZVJlY29nbml6ZXJ9IHRvXG4gKiBjb25zdHJ1Y3QgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogWW91IHNob3VsZCBub3QgbW9kaWZ5IHRoaXMgb2JqZWN0LiBJdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyByb3V0ZURhdGE6IFJvdXRlRGF0YTtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdXJsUGF0aDogc3RyaW5nLCBwdWJsaWMgdXJsUGFyYW1zOiBzdHJpbmdbXSwgZGF0YTogUm91dGVEYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgY29tcG9uZW50VHlwZSwgcHVibGljIHRlcm1pbmFsOiBib29sZWFuLCBwdWJsaWMgc3BlY2lmaWNpdHk6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSBudWxsKSB7XG4gICAgdGhpcy5yb3V0ZURhdGEgPSBpc1ByZXNlbnQoZGF0YSkgPyBkYXRhIDogQkxBTktfUk9VVEVfREFUQTtcbiAgfVxufVxuIl19