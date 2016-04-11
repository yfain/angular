'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
/**
 * The `NgClass` directive conditionally adds and removes CSS classes on an HTML element based on
 * an expression's evaluation result.
 *
 * The result of an expression evaluation is interpreted differently depending on type of
 * the expression evaluation result:
 * - `string` - all the CSS classes listed in a string (space delimited) are added
 * - `Array` - all the CSS classes (Array elements) are added
 * - `Object` - each key corresponds to a CSS class name while values are interpreted as expressions
 * evaluating to `Boolean`. If a given expression evaluates to `true` a corresponding CSS class
 * is added - otherwise it is removed.
 *
 * While the `NgClass` directive can interpret expressions evaluating to `string`, `Array`
 * or `Object`, the `Object`-based version is the most often used and has an advantage of keeping
 * all the CSS class names in a template.
 *
 * ### Example ([live demo](http://plnkr.co/edit/a4YdtmWywhJ33uqfpPPn?p=preview)):
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgClass} from 'angular2/common';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
 *          (click)="toggle(!isOn)">
 *          Click me!
 *      </div>`,
 *   styles: [`
 *     .button {
 *       width: 120px;
 *       border: medium solid black;
 *     }
 *
 *     .active {
 *       background-color: red;
 *    }
 *
 *     .disabled {
 *       color: gray;
 *       border: medium solid gray;
 *     }
 *   `]
 *   directives: [NgClass]
 * })
 * class ToggleButton {
 *   isOn = false;
 *   isDisabled = false;
 *
 *   toggle(newState) {
 *     if (!this.isDisabled) {
 *       this.isOn = newState;
 *     }
 *   }
 * }
 * ```
 */
var NgClass = (function () {
    function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    Object.defineProperty(NgClass.prototype, "initialClasses", {
        set: function (v) {
            this._applyInitialClasses(true);
            this._initialClasses = lang_1.isPresent(v) && lang_1.isString(v) ? v.split(' ') : [];
            this._applyInitialClasses(false);
            this._applyClasses(this._rawClass, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "rawClass", {
        set: function (v) {
            this._cleanupClasses(this._rawClass);
            if (lang_1.isString(v)) {
                v = v.split(' ');
            }
            this._rawClass = v;
            this._iterableDiffer = null;
            this._keyValueDiffer = null;
            if (lang_1.isPresent(v)) {
                if (collection_1.isListLikeIterable(v)) {
                    this._iterableDiffer = this._iterableDiffers.find(v).create(null);
                }
                else {
                    this._keyValueDiffer = this._keyValueDiffers.find(v).create(null);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () {
        if (lang_1.isPresent(this._iterableDiffer)) {
            var changes = this._iterableDiffer.diff(this._rawClass);
            if (lang_1.isPresent(changes)) {
                this._applyIterableChanges(changes);
            }
        }
        if (lang_1.isPresent(this._keyValueDiffer)) {
            var changes = this._keyValueDiffer.diff(this._rawClass);
            if (lang_1.isPresent(changes)) {
                this._applyKeyValueChanges(changes);
            }
        }
    };
    NgClass.prototype.ngOnDestroy = function () { this._cleanupClasses(this._rawClass); };
    NgClass.prototype._cleanupClasses = function (rawClassVal) {
        this._applyClasses(rawClassVal, true);
        this._applyInitialClasses(false);
    };
    NgClass.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClass.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.item, true); });
        changes.forEachRemovedItem(function (record) { _this._toggleClass(record.item, false); });
    };
    NgClass.prototype._applyInitialClasses = function (isCleanup) {
        var _this = this;
        this._initialClasses.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
    };
    NgClass.prototype._applyClasses = function (rawClassVal, isCleanup) {
        var _this = this;
        if (lang_1.isPresent(rawClassVal)) {
            if (lang_1.isArray(rawClassVal)) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else if (rawClassVal instanceof Set) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else {
                collection_1.StringMapWrapper.forEach(rawClassVal, function (expVal, className) {
                    if (lang_1.isPresent(expVal))
                        _this._toggleClass(className, !isCleanup);
                });
            }
        }
    };
    NgClass.prototype._toggleClass = function (className, enabled) {
        className = className.trim();
        if (className.length > 0) {
            if (className.indexOf(' ') > -1) {
                var classes = className.split(/\s+/g);
                for (var i = 0, len = classes.length; i < len; i++) {
                    this._renderer.setElementClass(this._ngEl.nativeElement, classes[i], enabled);
                }
            }
            else {
                this._renderer.setElementClass(this._ngEl.nativeElement, className, enabled);
            }
        }
    };
    NgClass = __decorate([
        core_1.Directive({ selector: '[ngClass]', inputs: ['rawClass: ngClass', 'initialClasses: class'] }), 
        __metadata('design:paramtypes', [core_1.IterableDiffers, core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgClass);
    return NgClass;
})();
exports.NgClass = NgClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQTJDLDBCQUEwQixDQUFDLENBQUE7QUFDdEUscUJBQWtMLGVBQWUsQ0FBQyxDQUFBO0FBQ2xNLDJCQUFtRCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXBGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMERHO0FBQ0g7SUFPRUEsaUJBQ1lBLGdCQUFpQ0EsRUFBVUEsZ0JBQWlDQSxFQUM1RUEsS0FBaUJBLEVBQVVBLFNBQW1CQTtRQUQ5Q0MscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFBVUEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFDNUVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBTGxEQSxvQkFBZUEsR0FBYUEsRUFBRUEsQ0FBQ0E7SUFLc0JBLENBQUNBO0lBRTlERCxzQkFBSUEsbUNBQWNBO2FBQWxCQSxVQUFtQkEsQ0FBU0E7WUFDMUJFLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxlQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUN2RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLENBQUNBOzs7T0FBQUY7SUFFREEsc0JBQUlBLDZCQUFRQTthQUFaQSxVQUFhQSxDQUFtREE7WUFDOURHLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBRXJDQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaEJBLENBQUNBLEdBQVlBLENBQUVBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzdCQSxDQUFDQTtZQUVEQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUF5QkEsQ0FBQ0EsQ0FBQ0E7WUFDekNBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsK0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDMUJBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BFQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTs7O09BQUFIO0lBRURBLDJCQUFTQSxHQUFUQTtRQUNFSSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3RDQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLE9BQU9BLENB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Q0EsTUFBTUEsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7b0JBQ25EQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDaEZBLENBQUNBO1lBQ0hBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUMvRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUE5R0hYO1FBQUNBLGdCQUFTQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxDQUFDQSxtQkFBbUJBLEVBQUVBLHVCQUF1QkEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2dCQStHMUZBO0lBQURBLGNBQUNBO0FBQURBLENBQUNBLEFBL0dELElBK0dDO0FBOUdZLGVBQU8sVUE4R25CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNTdHJpbmcsIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0RvQ2hlY2ssIE9uRGVzdHJveSwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJdGVyYWJsZURpZmZlcnMsIEtleVZhbHVlRGlmZmVycywgUmVuZGVyZXIsIEl0ZXJhYmxlRGlmZmVyLCBLZXlWYWx1ZURpZmZlciwgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgS2V5VmFsdWVDaGFuZ2VSZWNvcmR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBpc0xpc3RMaWtlSXRlcmFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogVGhlIGBOZ0NsYXNzYCBkaXJlY3RpdmUgY29uZGl0aW9uYWxseSBhZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudCBiYXNlZCBvblxuICogYW4gZXhwcmVzc2lvbidzIGV2YWx1YXRpb24gcmVzdWx0LlxuICpcbiAqIFRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbiBldmFsdWF0aW9uIGlzIGludGVycHJldGVkIGRpZmZlcmVudGx5IGRlcGVuZGluZyBvbiB0eXBlIG9mXG4gKiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uIHJlc3VsdDpcbiAqIC0gYHN0cmluZ2AgLSBhbGwgdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiBhIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWRcbiAqIC0gYEFycmF5YCAtIGFsbCB0aGUgQ1NTIGNsYXNzZXMgKEFycmF5IGVsZW1lbnRzKSBhcmUgYWRkZWRcbiAqIC0gYE9iamVjdGAgLSBlYWNoIGtleSBjb3JyZXNwb25kcyB0byBhIENTUyBjbGFzcyBuYW1lIHdoaWxlIHZhbHVlcyBhcmUgaW50ZXJwcmV0ZWQgYXMgZXhwcmVzc2lvbnNcbiAqIGV2YWx1YXRpbmcgdG8gYEJvb2xlYW5gLiBJZiBhIGdpdmVuIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIGB0cnVlYCBhIGNvcnJlc3BvbmRpbmcgQ1NTIGNsYXNzXG4gKiBpcyBhZGRlZCAtIG90aGVyd2lzZSBpdCBpcyByZW1vdmVkLlxuICpcbiAqIFdoaWxlIHRoZSBgTmdDbGFzc2AgZGlyZWN0aXZlIGNhbiBpbnRlcnByZXQgZXhwcmVzc2lvbnMgZXZhbHVhdGluZyB0byBgc3RyaW5nYCwgYEFycmF5YFxuICogb3IgYE9iamVjdGAsIHRoZSBgT2JqZWN0YC1iYXNlZCB2ZXJzaW9uIGlzIHRoZSBtb3N0IG9mdGVuIHVzZWQgYW5kIGhhcyBhbiBhZHZhbnRhZ2Ugb2Yga2VlcGluZ1xuICogYWxsIHRoZSBDU1MgY2xhc3MgbmFtZXMgaW4gYSB0ZW1wbGF0ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYTRZZHRtV3l3aEozM3VxZnBQUG4/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge05nQ2xhc3N9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAndG9nZ2xlLWJ1dHRvbicsXG4gKiAgIGlucHV0czogWydpc0Rpc2FibGVkJ10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25cIiBbbmdDbGFzc109XCJ7YWN0aXZlOiBpc09uLCBkaXNhYmxlZDogaXNEaXNhYmxlZH1cIlxuICogICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZSghaXNPbilcIj5cbiAqICAgICAgICAgIENsaWNrIG1lIVxuICogICAgICA8L2Rpdj5gLFxuICogICBzdHlsZXM6IFtgXG4gKiAgICAgLmJ1dHRvbiB7XG4gKiAgICAgICB3aWR0aDogMTIwcHg7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBibGFjaztcbiAqICAgICB9XG4gKlxuICogICAgIC5hY3RpdmUge1xuICogICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xuICogICAgfVxuICpcbiAqICAgICAuZGlzYWJsZWQge1xuICogICAgICAgY29sb3I6IGdyYXk7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBncmF5O1xuICogICAgIH1cbiAqICAgYF1cbiAqICAgZGlyZWN0aXZlczogW05nQ2xhc3NdXG4gKiB9KVxuICogY2xhc3MgVG9nZ2xlQnV0dG9uIHtcbiAqICAgaXNPbiA9IGZhbHNlO1xuICogICBpc0Rpc2FibGVkID0gZmFsc2U7XG4gKlxuICogICB0b2dnbGUobmV3U3RhdGUpIHtcbiAqICAgICBpZiAoIXRoaXMuaXNEaXNhYmxlZCkge1xuICogICAgICAgdGhpcy5pc09uID0gbmV3U3RhdGU7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBpbnB1dHM6IFsncmF3Q2xhc3M6IG5nQ2xhc3MnLCAnaW5pdGlhbENsYXNzZXM6IGNsYXNzJ119KVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3MgaW1wbGVtZW50cyBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcjogSXRlcmFibGVEaWZmZXI7XG4gIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyOiBLZXlWYWx1ZURpZmZlcjtcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzZXM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgX3Jhd0NsYXNzOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge31cblxuICBzZXQgaW5pdGlhbENsYXNzZXModjogc3RyaW5nKSB7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3Nlcyh0cnVlKTtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NlcyA9IGlzUHJlc2VudCh2KSAmJiBpc1N0cmluZyh2KSA/IHYuc3BsaXQoJyAnKSA6IFtdO1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXMoZmFsc2UpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcywgZmFsc2UpO1xuICB9XG5cbiAgc2V0IHJhd0NsYXNzKHY6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX2NsZWFudXBDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcblxuICAgIGlmIChpc1N0cmluZyh2KSkge1xuICAgICAgdiA9ICg8c3RyaW5nPnYpLnNwbGl0KCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSA8c3RyaW5nW118U2V0PHN0cmluZz4+djtcbiAgICB0aGlzLl9pdGVyYWJsZURpZmZlciA9IG51bGw7XG4gICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQodikpIHtcbiAgICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodikpIHtcbiAgICAgICAgdGhpcy5faXRlcmFibGVEaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh2KS5jcmVhdGUobnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IHRoaXMuX2tleVZhbHVlRGlmZmVycy5maW5kKHYpLmNyZWF0ZShudWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9pdGVyYWJsZURpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5faXRlcmFibGVEaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2tleVZhbHVlRGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9rZXlWYWx1ZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlcykpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2NsZWFudXBDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTsgfVxuXG4gIHByaXZhdGUgX2NsZWFudXBDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tleTogc3RyaW5nXTogYW55fSk6IHZvaWQge1xuICAgIHRoaXMuX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbCwgdHJ1ZSk7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3NlcyhmYWxzZSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oXG4gICAgICAgIChyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbShcbiAgICAgICAgKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSA9PiB7XG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKFxuICAgICAgICAocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCB0cnVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oXG4gICAgICAgIChyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIGZhbHNlKTsgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUluaXRpYWxDbGFzc2VzKGlzQ2xlYW51cDogYm9vbGVhbikge1xuICAgIHRoaXMuX2luaXRpYWxDbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDbGFzc2VzKFxuICAgICAgcmF3Q2xhc3NWYWw6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9LCBpc0NsZWFudXA6IGJvb2xlYW4pIHtcbiAgICBpZiAoaXNQcmVzZW50KHJhd0NsYXNzVmFsKSkge1xuICAgICAgaWYgKGlzQXJyYXkocmF3Q2xhc3NWYWwpKSB7XG4gICAgICAgICg8c3RyaW5nW10+cmF3Q2xhc3NWYWwpLmZvckVhY2goY2xhc3NOYW1lID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCkpO1xuICAgICAgfSBlbHNlIGlmIChyYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPFNldDxzdHJpbmc+PnJhd0NsYXNzVmFsKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChcbiAgICAgICAgICAgIDx7W2s6IHN0cmluZ106IGFueX0+cmF3Q2xhc3NWYWwsIChleHBWYWw6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChleHBWYWwpKSB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUudHJpbSgpO1xuICAgIGlmIChjbGFzc05hbWUubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBjbGFzc2VzW2ldLCBlbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgY2xhc3NOYW1lLCBlbmFibGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==