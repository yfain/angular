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
var core_1 = require('angular2/core');
var control_value_accessor_1 = require('./control_value_accessor');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var SELECT_VALUE_ACCESSOR = lang_1.CONST_EXPR(new core_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: core_1.forwardRef(function () { return SelectControlValueAccessor; }), multi: true }));
function _buildValueString(id, value) {
    if (lang_1.isBlank(id))
        return "" + value;
    if (!lang_1.isPrimitive(value))
        value = 'Object';
    return lang_1.StringWrapper.slice(id + ": " + value, 0, 50);
}
function _extractId(valueString) {
    return valueString.split(':')[0];
}
/**
 * The accessor for writing a value and listening to changes on a select element.
 */
var SelectControlValueAccessor = (function () {
    function SelectControlValueAccessor(_renderer, _elementRef) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        /** @internal */
        this._optionMap = new Map();
        /** @internal */
        this._idCounter = 0;
        this.onChange = function (_) { };
        this.onTouched = function () { };
    }
    SelectControlValueAccessor.prototype.writeValue = function (value) {
        this.value = value;
        var valueString = _buildValueString(this._getOptionId(value), value);
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', valueString);
    };
    SelectControlValueAccessor.prototype.registerOnChange = function (fn) {
        var _this = this;
        this.onChange = function (valueString) { fn(_this._getOptionValue(valueString)); };
    };
    SelectControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    /** @internal */
    SelectControlValueAccessor.prototype._registerOption = function () { return (this._idCounter++).toString(); };
    /** @internal */
    SelectControlValueAccessor.prototype._getOptionId = function (value) {
        for (var _i = 0, _a = collection_1.MapWrapper.keys(this._optionMap); _i < _a.length; _i++) {
            var id = _a[_i];
            if (lang_1.looseIdentical(this._optionMap.get(id), value))
                return id;
        }
        return null;
    };
    /** @internal */
    SelectControlValueAccessor.prototype._getOptionValue = function (valueString) {
        var value = this._optionMap.get(_extractId(valueString));
        return lang_1.isPresent(value) ? value : valueString;
    };
    SelectControlValueAccessor = __decorate([
        core_1.Directive({
            selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
            host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
            providers: [SELECT_VALUE_ACCESSOR]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], SelectControlValueAccessor);
    return SelectControlValueAccessor;
})();
exports.SelectControlValueAccessor = SelectControlValueAccessor;
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ngControl="city">
 *   <option *ngFor="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
var NgSelectOption = (function () {
    function NgSelectOption(_element, _renderer, _select) {
        this._element = _element;
        this._renderer = _renderer;
        this._select = _select;
        if (lang_1.isPresent(this._select))
            this.id = this._select._registerOption();
    }
    Object.defineProperty(NgSelectOption.prototype, "ngValue", {
        set: function (value) {
            if (this._select == null)
                return;
            this._select._optionMap.set(this.id, value);
            this._setElementValue(_buildValueString(this.id, value));
            this._select.writeValue(this._select.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgSelectOption.prototype, "value", {
        set: function (value) {
            this._setElementValue(value);
            if (lang_1.isPresent(this._select))
                this._select.writeValue(this._select.value);
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSelectOption.prototype._setElementValue = function (value) {
        this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
    };
    NgSelectOption.prototype.ngOnDestroy = function () {
        if (lang_1.isPresent(this._select)) {
            this._select._optionMap.delete(this.id);
            this._select.writeValue(this._select.value);
        }
    };
    __decorate([
        core_1.Input('ngValue'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], NgSelectOption.prototype, "ngValue", null);
    __decorate([
        core_1.Input('value'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], NgSelectOption.prototype, "value", null);
    NgSelectOption = __decorate([
        core_1.Directive({ selector: 'option' }),
        __param(2, core_1.Optional()),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer, SelectControlValueAccessor])
    ], NgSelectOption);
    return NgSelectOption;
})();
exports.NgSelectOption = NgSelectOption;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVB2T3VSanZ4LnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiX2J1aWxkVmFsdWVTdHJpbmciLCJfZXh0cmFjdElkIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5jb25zdHJ1Y3RvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uQ2hhbmdlIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPblRvdWNoZWQiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fcmVnaXN0ZXJPcHRpb24iLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fZ2V0T3B0aW9uSWQiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fZ2V0T3B0aW9uVmFsdWUiLCJOZ1NlbGVjdE9wdGlvbiIsIk5nU2VsZWN0T3B0aW9uLmNvbnN0cnVjdG9yIiwiTmdTZWxlY3RPcHRpb24ubmdWYWx1ZSIsIk5nU2VsZWN0T3B0aW9uLnZhbHVlIiwiTmdTZWxlY3RPcHRpb24uX3NldEVsZW1lbnRWYWx1ZSIsIk5nU2VsZWN0T3B0aW9uLm5nT25EZXN0cm95Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQkFBc0csZUFBZSxDQUFDLENBQUE7QUFDdEgsdUNBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYscUJBQXlGLDBCQUEwQixDQUFDLENBQUE7QUFFcEgsMkJBQXlCLGdDQUFnQyxDQUFDLENBQUE7QUFFMUQsSUFBTSxxQkFBcUIsR0FB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QUtBLENBQUNBLENBQUNBO0lBQ2pGQSxDQUFDQTtJQUVESixvQ0FBV0EsR0FBWEE7UUFDRUssRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN4Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLENBQUNBO0lBQ0hBLENBQUNBO0lBeEJETDtRQUFDQSxZQUFLQSxDQUFDQSxTQUFTQSxDQUFDQTs7O09BQ2JBLG1DQUFPQSxRQUtWQTtJQUVEQTtRQUFDQSxZQUFLQSxDQUFDQSxPQUFPQSxDQUFDQTs7O09BQ1hBLGlDQUFLQSxRQUdSQTtJQXRCSEE7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLEVBQUNBLENBQUNBO1FBTTFCQSxXQUFDQSxlQUFRQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTs7dUJBNkJ4QkE7SUFBREEscUJBQUNBO0FBQURBLENBQUNBLEFBbkNELElBbUNDO0FBbENZLHNCQUFjLGlCQWtDMUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBSZW5kZXJlciwgZm9yd2FyZFJlZiwgUHJvdmlkZXIsIEVsZW1lbnRSZWYsIElucHV0LCBIb3N0LCBPbkRlc3Ryb3ksIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtDT05TVF9FWFBSLCBTdHJpbmdXcmFwcGVyLCBpc1ByaW1pdGl2ZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBsb29zZUlkZW50aWNhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5jb25zdCBTRUxFQ1RfVkFMVUVfQUNDRVNTT1IgPSBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICBOR19WQUxVRV9BQ0NFU1NPUiwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbmZ1bmN0aW9uIF9idWlsZFZhbHVlU3RyaW5nKGlkOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICBpZiAoaXNCbGFuayhpZCkpIHJldHVybiBgJHt2YWx1ZX1gO1xuICBpZiAoIWlzUHJpbWl0aXZlKHZhbHVlKSkgdmFsdWUgPSAnT2JqZWN0JztcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuc2xpY2UoYCR7aWR9OiAke3ZhbHVlfWAsIDAsIDUwKTtcbn1cblxuZnVuY3Rpb24gX2V4dHJhY3RJZCh2YWx1ZVN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlU3RyaW5nLnNwbGl0KCc6JylbMF07XG59XG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIGEgc2VsZWN0IGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3NlbGVjdFtuZ0NvbnRyb2xdLHNlbGVjdFtuZ0Zvcm1Db250cm9sXSxzZWxlY3RbbmdNb2RlbF0nLFxuICBob3N0OiB7JyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLCAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ30sXG4gIHByb3ZpZGVyczogW1NFTEVDVF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIHZhbHVlOiBhbnk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29wdGlvbk1hcDogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lkQ291bnRlcjogbnVtYmVyID0gMDtcblxuICBvbkNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHZhciB2YWx1ZVN0cmluZyA9IF9idWlsZFZhbHVlU3RyaW5nKHRoaXMuX2dldE9wdGlvbklkKHZhbHVlKSwgdmFsdWUpO1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICd2YWx1ZScsIHZhbHVlU3RyaW5nKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gKHZhbHVlU3RyaW5nOiBzdHJpbmcpID0+IHsgZm4odGhpcy5fZ2V0T3B0aW9uVmFsdWUodmFsdWVTdHJpbmcpKTsgfTtcbiAgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gYW55KTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWdpc3Rlck9wdGlvbigpOiBzdHJpbmcgeyByZXR1cm4gKHRoaXMuX2lkQ291bnRlcisrKS50b1N0cmluZygpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0T3B0aW9uSWQodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgZm9yIChsZXQgaWQgb2YgTWFwV3JhcHBlci5rZXlzKHRoaXMuX29wdGlvbk1hcCkpIHtcbiAgICAgIGlmIChsb29zZUlkZW50aWNhbCh0aGlzLl9vcHRpb25NYXAuZ2V0KGlkKSwgdmFsdWUpKSByZXR1cm4gaWQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0T3B0aW9uVmFsdWUodmFsdWVTdHJpbmc6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fb3B0aW9uTWFwLmdldChfZXh0cmFjdElkKHZhbHVlU3RyaW5nKSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh2YWx1ZSkgPyB2YWx1ZSA6IHZhbHVlU3RyaW5nO1xuICB9XG59XG5cbi8qKlxuICogTWFya3MgYDxvcHRpb24+YCBhcyBkeW5hbWljLCBzbyBBbmd1bGFyIGNhbiBiZSBub3RpZmllZCB3aGVuIG9wdGlvbnMgY2hhbmdlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiA8c2VsZWN0IG5nQ29udHJvbD1cImNpdHlcIj5cbiAqICAgPG9wdGlvbiAqbmdGb3I9XCIjYyBvZiBjaXRpZXNcIiBbdmFsdWVdPVwiY1wiPjwvb3B0aW9uPlxuICogPC9zZWxlY3Q+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdvcHRpb24nfSlcbmV4cG9ydCBjbGFzcyBOZ1NlbGVjdE9wdGlvbiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsXG4gICAgICBAT3B0aW9uYWwoKSBASG9zdCgpIHByaXZhdGUgX3NlbGVjdDogU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlbGVjdCkpIHRoaXMuaWQgPSB0aGlzLl9zZWxlY3QuX3JlZ2lzdGVyT3B0aW9uKCk7XG4gIH1cblxuICBASW5wdXQoJ25nVmFsdWUnKVxuICBzZXQgbmdWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdCA9PSBudWxsKSByZXR1cm47XG4gICAgdGhpcy5fc2VsZWN0Ll9vcHRpb25NYXAuc2V0KHRoaXMuaWQsIHZhbHVlKTtcbiAgICB0aGlzLl9zZXRFbGVtZW50VmFsdWUoX2J1aWxkVmFsdWVTdHJpbmcodGhpcy5pZCwgdmFsdWUpKTtcbiAgICB0aGlzLl9zZWxlY3Qud3JpdGVWYWx1ZSh0aGlzLl9zZWxlY3QudmFsdWUpO1xuICB9XG5cbiAgQElucHV0KCd2YWx1ZScpXG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fc2V0RWxlbWVudFZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlbGVjdCkpIHRoaXMuX3NlbGVjdC53cml0ZVZhbHVlKHRoaXMuX3NlbGVjdC52YWx1ZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXRFbGVtZW50VmFsdWUodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsICd2YWx1ZScsIHZhbHVlKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fc2VsZWN0KSkge1xuICAgICAgdGhpcy5fc2VsZWN0Ll9vcHRpb25NYXAuZGVsZXRlKHRoaXMuaWQpO1xuICAgICAgdGhpcy5fc2VsZWN0LndyaXRlVmFsdWUodGhpcy5fc2VsZWN0LnZhbHVlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==