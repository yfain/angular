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
        return this._resolver().then((instruction) => {
            this.child = isPresent(instruction) ? instruction.child : null;
            return this.component = isPresent(instruction) ? instruction.component : null;
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
    constructor(urlPath, urlParams, data, componentType, terminal, specificity, params = null, routeName) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.routeName = routeName;
        this.reuse = false;
        this.routeData = isPresent(data) ? data : BLANK_ROUTE_DATA;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiRGVmYXVsdEluc3RydWN0aW9uLl90b0xpbmtVcmwiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24iLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24udXJsUGF0aCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJVbnJlc29sdmVkSW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24iLCJSZWRpcmVjdEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3RJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkNvbXBvbmVudEluc3RydWN0aW9uIiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJPQUFPLEVBQWtCLGdCQUFnQixFQUFjLE1BQU0sZ0NBQWdDO09BQ3RGLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQVEsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ3RGLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO0FBR3hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUNFQSxZQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELEdBQUdBLENBQUNBLEtBQWFBLElBQVlFLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakdGLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NHO0FBQ0g7SUFDRUcsWUFBbUJBLElBQUlBLEdBQXlCQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUEzQ0MsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBdUNBO0lBQUdBLENBQUNBO0lBRWxFRCxHQUFHQSxDQUFD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Z0JBLENBQUNBO0lBQzdEQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIG5vcm1hbGl6ZUJsYW5rLCBUeXBlLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cblxuLyoqXG4gKiBgUm91dGVQYXJhbXNgIGlzIGFuIGltbXV0YWJsZSBtYXAgb2YgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHJvdXRlXG4gKiBiYXNlZCBvbiB0aGUgdXJsIG1hdGNoZXIgYW5kIG9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIHRoYXQgcm91dGUuXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlUGFyYW1zYCBpbnRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIGNvbXBvbmVudCB0byB1c2UgaXQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWcsIFJvdXRlUGFyYW1zfSBmcm9tXG4gKiAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAge3BhdGg6ICcvdXNlci86aWQnLCBjb21wb25lbnQ6IFVzZXJDbXAsIG5hbWU6ICdVc2VyQ21wJ30sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHt9XG4gKlxuICogQENvbXBvbmVudCh7IHRlbXBsYXRlOiAndXNlcjoge3tpZH19JyB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIGlkOiBzdHJpbmc7XG4gKiAgIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHtcbiAqICAgICB0aGlzLmlkID0gcGFyYW1zLmdldCgnaWQnKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZVBhcmFtcyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7fVxuXG4gIGdldChwYXJhbTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIG5vcm1hbGl6ZUJsYW5rKFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMucGFyYW1zLCBwYXJhbSkpOyB9XG59XG5cbi8qKlxuICogYFJvdXRlRGF0YWAgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBhZGRpdGlvbmFsIGRhdGEgeW91IGNhbiBjb25maWd1cmUgaW4geW91ciB7QGxpbmsgUm91dGV9LlxuICpcbiAqIFlvdSBjYW4gaW5qZWN0IGBSb3V0ZURhdGFgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZywgUm91dGVEYXRhfSBmcm9tXG4gKiAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAge3BhdGg6ICcvdXNlci86aWQnLCBjb21wb25lbnQ6IFVzZXJDbXAsIG5hbWU6ICdVc2VyQ21wJywgZGF0YToge2lzQWRtaW46IHRydWV9fSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgLi4uLFxuICogICB0ZW1wbGF0ZTogJ3VzZXI6IHt7aXNBZG1pbn19J1xuICogfSlcbiAqIGNsYXNzIFVzZXJDbXAge1xuICogICBzdHJpbmc6IGlzQWRtaW47XG4gKiAgIGNvbnN0cnVjdG9yKGRhdGE6IFJvdXRlRGF0YSkge1xuICogICAgIHRoaXMuaXNBZG1pbiA9IGRhdGEuZ2V0KCdpc0FkbWluJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBST1VURVJfUFJPVklERVJTKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUm91dGVEYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gQ09OU1RfRVhQUih7fSkpIHt9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogYW55IHsgcmV0dXJuIG5vcm1hbGl6ZUJsYW5rKFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMuZGF0YSwga2V5KSk7IH1cbn1cblxuZXhwb3J0IHZhciBCTEFOS19ST1VURV9EQVRBID0gbmV3IFJvdXRlRGF0YSgpO1xuXG4vKipcbiAqIGBJbnN0cnVjdGlvbmAgaXMgYSB0cmVlIG9mIHtAbGluayBDb21wb25lbnRJbnN0cnVjdGlvbn1zIHdpdGggYWxsIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWRcbiAqIHRvIHRyYW5zaXRpb24gZWFjaCBjb21wb25lbnQgaW4gdGhlIGFwcCB0byBhIGdpdmVuIHJvdXRlLCBpbmNsdWRpbmcgYWxsIGF1eGlsaWFyeSByb3V0ZXMuXG4gKlxuICogYEluc3RydWN0aW9uYHMgY2FuIGJlIGNyZWF0ZWQgdXNpbmcge0BsaW5rIFJvdXRlciNnZW5lcmF0ZX0sIGFuZCBjYW4gYmUgdXNlZCB0b1xuICogcGVyZm9ybSByb3V0ZSBjaGFuZ2VzIHdpdGgge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb259LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICBjb25zdHJ1Y3Rvcihyb3V0ZXI6IFJvdXRlcikge1xuICogICAgIHZhciBpbnN0cnVjdGlvbiA9IHJvdXRlci5nZW5lcmF0ZShbJy9NeVJvdXRlJ10pO1xuICogICAgIHJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHVibGljIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgIHB1YmxpYyBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSkge31cblxuICBnZXQgdXJsUGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IHRoaXMuY29tcG9uZW50LnVybFBhdGggOiAnJzsgfVxuXG4gIGdldCB1cmxQYXJhbXMoKTogc3RyaW5nW10geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSA/IHRoaXMuY29tcG9uZW50LnVybFBhcmFtcyA6IFtdOyB9XG5cbiAgZ2V0IHNwZWNpZmljaXR5KCk6IHN0cmluZyB7XG4gICAgdmFyIHRvdGFsID0gJyc7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuY29tcG9uZW50LnNwZWNpZmljaXR5O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY2hpbGQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNoaWxkLnNwZWNpZmljaXR5O1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG4gIH1cblxuICBhYnN0cmFjdCByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+O1xuXG4gIC8qKlxuICAgKiBjb252ZXJ0cyB0aGUgaW5zdHJ1Y3Rpb24gaW50byBhIFVSTCBzdHJpbmdcbiAgICovXG4gIHRvUm9vdFVybCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy50b1VybFBhdGgoKSArIHRoaXMudG9VcmxRdWVyeSgpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9Ob25Sb290VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpICtcbiAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTm9uUm9vdFVybCgpIDogJycpO1xuICB9XG5cbiAgdG9VcmxRdWVyeSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy51cmxQYXJhbXMubGVuZ3RoID4gMCA/ICgnPycgKyB0aGlzLnVybFBhcmFtcy5qb2luKCcmJykpIDogJyc7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBpbnN0cnVjdGlvbiB0aGF0IHNoYXJlcyB0aGUgc3RhdGUgb2YgdGhlIGV4aXN0aW5nIGluc3RydWN0aW9uLCBidXQgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2hpbGQge0BsaW5rIEluc3RydWN0aW9ufSByZXBsYWNpbmcgdGhlIGV4aXN0aW5nIGNoaWxkLlxuICAgKi9cbiAgcmVwbGFjZUNoaWxkKGNoaWxkOiBJbnN0cnVjdGlvbik6IEluc3RydWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24odGhpcy5jb21wb25lbnQsIGNoaWxkLCB0aGlzLmF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgZmluYWwgVVJMIGZvciB0aGUgaW5zdHJ1Y3Rpb24gaXMgYGBcbiAgICovXG4gIHRvVXJsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlBdXgoKSArXG4gICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8vIGRlZmF1bHQgaW5zdHJ1Y3Rpb25zIG92ZXJyaWRlIHRoZXNlXG4gIHRvTGlua1VybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlBdXgoKSArXG4gICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b0xpbmtVcmwoKSA6ICcnKSArIHRoaXMudG9VcmxRdWVyeSgpO1xuICB9XG5cbiAgLy8gdGhpcyBpcyB0aGUgbm9uLXJvb3QgdmVyc2lvbiAoY2FsbGVkIHJlY3Vyc2l2ZWx5KVxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCkgK1xuICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKTogc3RyaW5nIHtcbiAgICB2YXIgcHJpbWFyeSA9IHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKTtcbiAgICBpZiAocHJpbWFyeS5sZW5ndGggPiAwKSB7XG4gICAgICBwcmltYXJ5ID0gJy8nICsgcHJpbWFyeTtcbiAgICB9XG4gICAgcmV0dXJuIHByaW1hcnk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlNYXRyaXhQYXJhbXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXJhbXMubGVuZ3RoID4gMCA/ICgnOycgKyB0aGlzLnVybFBhcmFtcy5qb2luKCc7JykpIDogJyc7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlNYXRyaXhQYXJhbXMoKSArIHRoaXMuX3N0cmluZ2lmeUF1eCgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5QXV4KCk6IHN0cmluZyB7XG4gICAgdmFyIHJvdXRlcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLmF1eEluc3RydWN0aW9uLCAoYXV4SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfOiBzdHJpbmcpID0+IHtcbiAgICAgIHJvdXRlcy5wdXNoKGF1eEluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCkpO1xuICAgIH0pO1xuICAgIGlmIChyb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuICcoJyArIHJvdXRlcy5qb2luKCcvLycpICsgJyknO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuXG4vKipcbiAqIGEgcmVzb2x2ZWQgaW5zdHJ1Y3Rpb24gaGFzIGFuIG91dGxldCBpbnN0cnVjdGlvbiBmb3IgaXRzZWxmLCBidXQgbWF5YmUgbm90IGZvci4uLlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogSW5zdHJ1Y3Rpb24sXG4gICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSkge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHJlc29sdmVkIGRlZmF1bHQgcm91dGVcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRJbnN0cnVjdGlvbiBleHRlbmRzIFJlc29sdmVkSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogRGVmYXVsdEluc3RydWN0aW9uKSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwge30pO1xuICB9XG5cbiAgdG9MaW5rVXJsKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbn1cblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb21wb25lbnQgdGhhdCBtYXkgbmVlZCB0byBkbyBzb21lIHJlZGlyZWN0aW9uIG9yIGxhenkgbG9hZGluZyBhdCBhIGxhdGVyIHRpbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcmVzb2x2ZXI6ICgpID0+IFByb21pc2U8SW5zdHJ1Y3Rpb24+LCBwcml2YXRlIF91cmxQYXRoOiBzdHJpbmcgPSAnJyxcbiAgICAgIHByaXZhdGUgX3VybFBhcmFtczogc3RyaW5nW10gPSBDT05TVF9FWFBSKFtdKSkge1xuICAgIHN1cGVyKG51bGwsIG51bGwsIHt9KTtcbiAgfVxuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXRoO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXJsUGF0aDtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXM7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdXJsUGFyYW1zKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVyKCkudGhlbigoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLmNoaWxkID0gaXNQcmVzZW50KGluc3RydWN0aW9uKSA/IGluc3RydWN0aW9uLmNoaWxkIDogbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudCA9IGlzUHJlc2VudChpbnN0cnVjdGlvbikgPyBpbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsO1xuICAgIH0pO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogSW5zdHJ1Y3Rpb24sXG4gICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSwgcHJpdmF0ZSBfc3BlY2lmaWNpdHk6IHN0cmluZykge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3BlY2lmaWNpdHk7IH1cbn1cblxuXG4vKipcbiAqIEEgYENvbXBvbmVudEluc3RydWN0aW9uYCByZXByZXNlbnRzIHRoZSByb3V0ZSBzdGF0ZSBmb3IgYSBzaW5nbGUgY29tcG9uZW50LlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbnNgIGlzIGEgcHVibGljIEFQSS4gSW5zdGFuY2VzIG9mIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgYXJlIHBhc3NlZFxuICogdG8gcm91dGUgbGlmZWN5Y2xlIGhvb2tzLCBsaWtlIHtAbGluayBDYW5BY3RpdmF0ZX0uXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uYHMgYXJlIFtoYXNoIGNvbnNlZF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFzaF9jb25zaW5nKS4gWW91IHNob3VsZFxuICogbmV2ZXIgY29uc3RydWN0IG9uZSB5b3Vyc2VsZiB3aXRoIFwibmV3LlwiIEluc3RlYWQsIHJlbHkgb24ge0BsaW5rIFJvdXRlci9Sb3V0ZVJlY29nbml6ZXJ9IHRvXG4gKiBjb25zdHJ1Y3QgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogWW91IHNob3VsZCBub3QgbW9kaWZ5IHRoaXMgb2JqZWN0LiBJdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyByb3V0ZURhdGE6IFJvdXRlRGF0YTtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyB1cmxQYXRoOiBzdHJpbmcsIHB1YmxpYyB1cmxQYXJhbXM6IHN0cmluZ1tdLCBkYXRhOiBSb3V0ZURhdGEsIHB1YmxpYyBjb21wb25lbnRUeXBlLFxuICAgICAgcHVibGljIHRlcm1pbmFsOiBib29sZWFuLCBwdWJsaWMgc3BlY2lmaWNpdHk6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0gbnVsbCwgcHVibGljIHJvdXRlTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yb3V0ZURhdGEgPSBpc1ByZXNlbnQoZGF0YSkgPyBkYXRhIDogQkxBTktfUk9VVEVfREFUQTtcbiAgfVxufVxuIl19