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
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var metadata_1 = require('angular2/src/core/di/metadata');
/**
 * Specifies that a constant attribute value should be injected.
 *
 * The directive can inject constant string literals of host element attributes.
 *
 * ### Example
 *
 * Suppose we have an `<input>` element and want to know its `type`.
 *
 * ```html
 * <input type="text">
 * ```
 *
 * A decorator can inject string literal `text` like so:
 *
 * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
 */
var AttributeMetadata = (function (_super) {
    __extends(AttributeMetadata, _super);
    function AttributeMetadata(attributeName) {
        _super.call(this);
        this.attributeName = attributeName;
    }
    Object.defineProperty(AttributeMetadata.prototype, "token", {
        get: function () {
            // Normally one would default a token to a type of an injected value but here
            // the type of a variable is "string" and we can't use primitive type as a return value
            // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
            // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
            // account.
            return this;
        },
        enumerable: true,
        configurable: true
    });
    AttributeMetadata.prototype.toString = function () { return "@Attribute(" + lang_1.stringify(this.attributeName) + ")"; };
    AttributeMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], AttributeMetadata);
    return AttributeMetadata;
})(metadata_1.DependencyMetadata);
exports.AttributeMetadata = AttributeMetadata;
/**
 * Declares an injectable parameter to be a live list of directives or variable
 * bindings from the content children of a directive.
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 *
 * Assume that `<tabs>` component would like to get a list its children `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ngFor="#o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * The preferred solution is to query for `Pane` directives using this decorator.
 *
 * ```javascript
 * @Component({
 *   selector: 'pane',
 *   inputs: ['title']
 * })
 * class Pane {
 *   title:string;
 * }
 *
 * @Component({
 *  selector: 'tabs',
 *  template: `
 *    <ul>
 *      <li *ngFor="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <ng-content></ng-content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>;
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
  *    this.panes = panes;
  *  }
 * }
 * ```
 *
 * A query can look for variable bindings by passing in a string with desired binding symbol.
 *
 * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
 * ```html
 * <seeker>
 *   <div #findme>...</div>
 * </seeker>
 *
 * @Component({ selector: 'seeker' })
 * class Seeker {
 *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * In this case the object that is injected depend on the type of the variable
 * binding. It can be an ElementRef, a directive or a component.
 *
 * Passing in a comma separated list of variable bindings will query for all of them.
 *
 * ```html
 * <seeker>
 *   <div #find-me>...</div>
 *   <div #find-me-too>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'seeker'
 * })
 * class Seeker {
 *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * Configure whether query looks for direct children or all descendants
 * of the querying element, by using the `descendants` parameter.
 * It is set to `false` by default.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
 * ```html
 * <container #first>
 *   <item>a</item>
 *   <item>b</item>
 *   <container #second>
 *     <item>c</item>
 *   </container>
 * </container>
 * ```
 *
 * When querying for items, the first container will see only `a` and `b` by default,
 * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
 *
 * The queried directives are kept in a depth-first pre-order with respect to their
 * positions in the DOM.
 *
 * Query does not look deep into any subcomponent views.
 *
 * Query is updated as part of the change-detection cycle. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 * The injected object is an unmodifiable live list.
 * See {@link QueryList} for more details.
 */
var QueryMetadata = (function (_super) {
    __extends(QueryMetadata, _super);
    function QueryMetadata(_selector, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.first, first = _d === void 0 ? false : _d;
        _super.call(this);
        this._selector = _selector;
        this.descendants = descendants;
        this.first = first;
    }
    Object.defineProperty(QueryMetadata.prototype, "isViewQuery", {
        /**
         * always `false` to differentiate it with {@link ViewQueryMetadata}.
         */
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "selector", {
        /**
         * what this is querying for.
         */
        get: function () { return di_1.resolveForwardRef(this._selector); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "isVarBindingQuery", {
        /**
         * whether this is querying for a variable binding or a directive.
         */
        get: function () { return lang_1.isString(this.selector); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "varBindings", {
        /**
         * returns a list of variable bindings this is querying for.
         * Only applicable if this is a variable bindings query.
         */
        get: function () { return this.selector.split(','); },
        enumerable: true,
        configurable: true
    });
    QueryMetadata.prototype.toString = function () { return "@Query(" + lang_1.stringify(this.selector) + ")"; };
    QueryMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], QueryMetadata);
    return QueryMetadata;
})(metadata_1.DependencyMetadata);
exports.QueryMetadata = QueryMetadata;
// TODO: add an example after ContentChildren and ViewChildren are in master
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
var ContentChildrenMetadata = (function (_super) {
    __extends(ContentChildrenMetadata, _super);
    function ContentChildrenMetadata(_selector, _a) {
        var _b = (_a === void 0 ? {} : _a).descendants, descendants = _b === void 0 ? false : _b;
        _super.call(this, _selector, { descendants: descendants });
    }
    ContentChildrenMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], ContentChildrenMetadata);
    return ContentChildrenMetadata;
})(QueryMetadata);
exports.ContentChildrenMetadata = ContentChildrenMetadata;
// TODO: add an example after ContentChild and ViewChild are in master
/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChild(ChildDirective) contentChild;
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
var ContentChildMetadata = (function (_super) {
    __extends(ContentChildMetadata, _super);
    function ContentChildMetadata(_selector) {
        _super.call(this, _selector, { descendants: true, first: true });
    }
    ContentChildMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ContentChildMetadata);
    return ContentChildMetadata;
})(QueryMetadata);
exports.ContentChildMetadata = ContentChildMetadata;
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({
 *   ...,
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @ViewQuery(Item) items:QueryList<Item>) {
 *     items.changes.subscribe(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
var ViewQueryMetadata = (function (_super) {
    __extends(ViewQueryMetadata, _super);
    function ViewQueryMetadata(_selector, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.first, first = _d === void 0 ? false : _d;
        _super.call(this, _selector, { descendants: descendants, first: first });
    }
    Object.defineProperty(ViewQueryMetadata.prototype, "isViewQuery", {
        /**
         * always `true` to differentiate it with {@link QueryMetadata}.
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    ViewQueryMetadata.prototype.toString = function () { return "@ViewQuery(" + lang_1.stringify(this.selector) + ")"; };
    ViewQueryMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], ViewQueryMetadata);
    return ViewQueryMetadata;
})(QueryMetadata);
exports.ViewQueryMetadata = ViewQueryMetadata;
/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChildren(ItemDirective) viewChildren: QueryList<ItemDirective>;
 *
 *   ngAfterViewInit() {
 *     // viewChildren is set
 *   }
 * }
 * ```
 */
var ViewChildrenMetadata = (function (_super) {
    __extends(ViewChildrenMetadata, _super);
    function ViewChildrenMetadata(_selector) {
        _super.call(this, _selector, { descendants: true });
    }
    ViewChildrenMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ViewChildrenMetadata);
    return ViewChildrenMetadata;
})(ViewQueryMetadata);
exports.ViewChildrenMetadata = ViewChildrenMetadata;
/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChild(ItemDirective) viewChild:ItemDirective;
 *
 *   ngAfterViewInit() {
 *     // viewChild is set
 *   }
 * }
 * ```
 */
var ViewChildMetadata = (function (_super) {
    __extends(ViewChildMetadata, _super);
    function ViewChildMetadata(_selector) {
        _super.call(this, _selector, { descendants: true, first: true });
    }
    ViewChildMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ViewChildMetadata);
    return ViewChildMetadata;
})(ViewQueryMetadata);
exports.ViewChildMetadata = ViewChildMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVB2T3VSanZ4LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6WyJBdHRyaWJ1dGVNZXRhZGF0YSIsIkF0dHJpYnV0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQXR0cmlidXRlTWV0YWRhdGEudG9rZW4iLCJBdHRyaWJ1dGVNZXRhZGF0YS50b1N0cmluZyIsIlF1ZXJ5TWV0YWRhdGEiLCJRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiUXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlF1ZXJ5TWV0YWRhdGEuc2VsZWN0b3IiLCJRdWVyeU1ldGFkYXRhLmlzVmFyQmluZGluZ1F1ZXJ5IiwiUXVlcnlNZXRhZGF0YS52YXJCaW5kaW5ncyIsIlF1ZXJ5TWV0YWRhdGEudG9TdHJpbmciLCJDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSIsIkNvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29udGVudENoaWxkTWV0YWRhdGEiLCJDb250ZW50Q2hpbGRNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdRdWVyeU1ldGFkYXRhIiwiVmlld1F1ZXJ5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJWaWV3UXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlZpZXdRdWVyeU1ldGFkYXRhLnRvU3RyaW5nIiwiVmlld0NoaWxkcmVuTWV0YWRhdGEiLCJWaWV3Q2hpbGRyZW5NZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdDaGlsZE1ldGFkYXRhIiwiVmlld0NoaWxkTWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTBELDBCQUEwQixDQUFDLENBQUE7QUFDckYsbUJBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFDdkQseUJBQWlDLCtCQUErQixDQUFDLENBQUE7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YkQsRUFDdUMsYUFBYSxFQVluRDtBQVpZLHlCQUFpQixvQkFZN0IsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSDtJQUMwQ0ksd0NBQWlCQTtJQUN6REEsOEJBQVlBLFNBQXNCQTtRQUFJQyxrQkFBTUEsU0FBU0EsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFGaEZEO1FBQUNBLFlBQUtBLEVBQUVBOzs2QkFHUEE7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBSEQsRUFDMEMsaUJBQWlCLEVBRTFEO0FBRlksNEJBQW9CLHVCQUVoQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBQ3VDRSxxQ0FBaUJBO0lBQ3REQSwyQkFBWUEsU0FBc0JBO1FBQUlDLGtCQUFNQSxTQUFTQSxFQUFFQSxFQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUY3RkQ7UUFBQ0EsWUFBS0EsRUFBRUE7OzBCQUdQQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxFQUN1QyxpQkFBaUIsRUFFdkQ7QUFGWSx5QkFBaUIsb0JBRTdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBUeXBlLCBzdHJpbmdpZnksIGlzUHJlc2VudCwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0RlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGEgY29uc3RhbnQgYXR0cmlidXRlIHZhbHVlIHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIGNhbiBpbmplY3QgY29uc3RhbnQgc3RyaW5nIGxpdGVyYWxzIG9mIGhvc3QgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogU3VwcG9zZSB3ZSBoYXZlIGFuIGA8aW5wdXQ+YCBlbGVtZW50IGFuZCB3YW50IHRvIGtub3cgaXRzIGB0eXBlYC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAqIGBgYFxuICpcbiAqIEEgZGVjb3JhdG9yIGNhbiBpbmplY3Qgc3RyaW5nIGxpdGVyYWwgYHRleHRgIGxpa2Ugc286XG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdhdHRyaWJ1dGVNZXRhZGF0YSd9XG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlTWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7IHN1cGVyKCk7IH1cblxuICBnZXQgdG9rZW4oKTogQXR0cmlidXRlTWV0YWRhdGEge1xuICAgIC8vIE5vcm1hbGx5IG9uZSB3b3VsZCBkZWZhdWx0IGEgdG9rZW4gdG8gYSB0eXBlIG9mIGFuIGluamVjdGVkIHZhbHVlIGJ1dCBoZXJlXG4gICAgLy8gdGhlIHR5cGUgb2YgYSB2YXJpYWJsZSBpcyBcInN0cmluZ1wiIGFuZCB3ZSBjYW4ndCB1c2UgcHJpbWl0aXZlIHR5cGUgYXMgYSByZXR1cm4gdmFsdWVcbiAgICAvLyBzbyB3ZSB1c2UgaW5zdGFuY2Ugb2YgQXR0cmlidXRlIGluc3RlYWQuIFRoaXMgZG9lc24ndCBtYXR0ZXIgbXVjaCBpbiBwcmFjdGljZSBhcyBhcmd1bWVudHNcbiAgICAvLyB3aXRoIEBBdHRyaWJ1dGUgYW5ub3RhdGlvbiBhcmUgaW5qZWN0ZWQgYnkgRWxlbWVudEluamVjdG9yIHRoYXQgZG9lc24ndCB0YWtlIHRva2VucyBpbnRvXG4gICAgLy8gYWNjb3VudC5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBBdHRyaWJ1dGUoJHtzdHJpbmdpZnkodGhpcy5hdHRyaWJ1dGVOYW1lKX0pYDsgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gICogICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICAqICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZC1tZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZC1tZS10b28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAvKipcbiAgICogd2hldGhlciB3ZSB3YW50IHRvIHF1ZXJ5IG9ubHkgZGlyZWN0IGNoaWxkcmVuIChmYWxzZSkgb3IgYWxsXG4gICAqIGNoaWxkcmVuICh0cnVlKS5cbiAgICovXG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3NlbGVjdG9yOiBUeXBlfHN0cmluZyxcbiAgICAgIHtkZXNjZW5kYW50cyA9IGZhbHNlLCBmaXJzdCA9IGZhbHNlfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgZmlyc3Q/OiBib29sZWFufSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHM7XG4gICAgdGhpcy5maXJzdCA9IGZpcnN0O1xuICB9XG5cbiAgLyoqXG4gICAqIGFsd2F5cyBgZmFsc2VgIHRvIGRpZmZlcmVudGlhdGUgaXQgd2l0aCB7QGxpbmsgVmlld1F1ZXJ5TWV0YWRhdGF9LlxuICAgKi9cbiAgZ2V0IGlzVmlld1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICAvKipcbiAgICogd2hhdCB0aGlzIGlzIHF1ZXJ5aW5nIGZvci5cbiAgICovXG4gIGdldCBzZWxlY3RvcigpIHsgcmV0dXJuIHJlc29sdmVGb3J3YXJkUmVmKHRoaXMuX3NlbGVjdG9yKTsgfVxuXG4gIC8qKlxuICAgKiB3aGV0aGVyIHRoaXMgaXMgcXVlcnlpbmcgZm9yIGEgdmFyaWFibGUgYmluZGluZyBvciBhIGRpcmVjdGl2ZS5cbiAgICovXG4gIGdldCBpc1ZhckJpbmRpbmdRdWVyeSgpOiBib29sZWFuIHsgcmV0dXJuIGlzU3RyaW5nKHRoaXMuc2VsZWN0b3IpOyB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSBsaXN0IG9mIHZhcmlhYmxlIGJpbmRpbmdzIHRoaXMgaXMgcXVlcnlpbmcgZm9yLlxuICAgKiBPbmx5IGFwcGxpY2FibGUgaWYgdGhpcyBpcyBhIHZhcmlhYmxlIGJpbmRpbmdzIHF1ZXJ5LlxuICAgKi9cbiAgZ2V0IHZhckJpbmRpbmdzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMuc2VsZWN0b3Iuc3BsaXQoJywnKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFF1ZXJ5KCR7c3RyaW5naWZ5KHRoaXMuc2VsZWN0b3IpfSlgOyB9XG59XG5cbi8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZHJlbiBhbmQgVmlld0NoaWxkcmVuIGFyZSBpbiBtYXN0ZXJcbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGRyZW4oQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZHJlbjogUXVlcnlMaXN0PENoaWxkRGlyZWN0aXZlPjtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGRyZW4gaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZXxzdHJpbmcsIHtkZXNjZW5kYW50cyA9IGZhbHNlfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50c30pO1xuICB9XG59XG5cbi8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZCBhbmQgVmlld0NoaWxkIGFyZSBpbiBtYXN0ZXJcbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbnRlbnRDaGlsZE1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZXxzdHJpbmcpIHsgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IHRydWUsIGZpcnN0OiB0cnVlfSk7IH1cbn1cblxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIC4uLixcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBWaWV3UXVlcnkoSXRlbSkgaXRlbXM6UXVlcnlMaXN0PEl0ZW0+KSB7XG4gKiAgICAgaXRlbXMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFN1cHBvcnRzIHRoZSBzYW1lIHF1ZXJ5aW5nIHBhcmFtZXRlcnMgYXMge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBleGNlcHRcbiAqIGBkZXNjZW5kYW50c2AuIFRoaXMgYWx3YXlzIHF1ZXJpZXMgdGhlIHdob2xlIHZpZXcuXG4gKlxuICogQXMgYHNob3duYCBpcyBmbGlwcGVkIGJldHdlZW4gdHJ1ZSBhbmQgZmFsc2UsIGl0ZW1zIHdpbGwgY29udGFpbiB6ZXJvIG9mIG9uZVxuICogaXRlbXMuXG4gKlxuICogU3BlY2lmaWVzIHRoYXQgYSB7QGxpbmsgUXVlcnlMaXN0fSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiBpdGVyYWJsZSBhbmQgb2JzZXJ2YWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3UXVlcnlNZXRhZGF0YSBleHRlbmRzIFF1ZXJ5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIF9zZWxlY3RvcjogVHlwZXxzdHJpbmcsXG4gICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIGZpcnN0PzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50cywgZmlyc3Q6IGZpcnN0fSk7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGB0cnVlYCB0byBkaWZmZXJlbnRpYXRlIGl0IHdpdGgge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LlxuICAgKi9cbiAgZ2V0IGlzVmlld1F1ZXJ5KCkgeyByZXR1cm4gdHJ1ZTsgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBWaWV3UXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8SXRlbURpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gdmlld0NoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlfHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZX0pOyB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZDpJdGVtRGlyZWN0aXZlO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld0NoaWxkTWV0YWRhdGEgZXh0ZW5kcyBWaWV3UXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZXxzdHJpbmcpIHsgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IHRydWUsIGZpcnN0OiB0cnVlfSk7IH1cbn1cbiJdfQ==