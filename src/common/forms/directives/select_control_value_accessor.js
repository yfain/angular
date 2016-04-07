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
        value = "Object";
    return lang_1.StringWrapper.slice(id + ": " + value, 0, 50);
}
function _extractId(valueString) {
    return valueString.split(":")[0];
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
            if (this._select == null)
                return;
            this._setElementValue(value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiX2J1aWxkVmFsdWVTdHJpbmciLCJfZXh0cmFjdElkIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5jb25zdHJ1Y3RvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uQ2hhbmdlIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IucmVnaXN0ZXJPblRvdWNoZWQiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fcmVnaXN0ZXJPcHRpb24iLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fZ2V0T3B0aW9uSWQiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5fZ2V0T3B0aW9uVmFsdWUiLCJOZ1NlbGVjdE9wdGlvbiIsIk5nU2VsZWN0T3B0aW9uLmNvbnN0cnVjdG9yIiwiTmdTZWxlY3RPcHRpb24ubmdWYWx1ZSIsIk5nU2VsZWN0T3B0aW9uLnZhbHVlIiwiTmdTZWxlY3RPcHRpb24uX3NldEVsZW1lbnRWYWx1ZSIsIk5nU2VsZWN0T3B0aW9uLm5nT25EZXN0cm95Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQkFVTyxlQUFlLENBQUMsQ0FBQTtBQUN2Qix1Q0FBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRixxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLDJCQUF5QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTFELElBQU0scUJBQXFCLEdBQUcsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FDakQsMENBQWlCLEVBQUUsRUFBQyxXQUFX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QUFXQSxHQUFYQTtRQUNFSyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1lBQ3hDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM5Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUF6QkRMO1FBQUNBLFlBQUtBLENBQUNBLFNBQVNBLENBQUNBOzs7T0FDYkEsbUNBQU9BLFFBS1ZBO0lBRURBO1FBQUNBLFlBQUtBLENBQUNBLE9BQU9BLENBQUNBOzs7T0FDWEEsaUNBQUtBLFFBSVJBO0lBdEJIQTtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBQ0EsQ0FBQ0E7UUFLbEJBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBOzt1QkE4QmhDQTtJQUFEQSxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuQ0QsSUFtQ0M7QUFsQ1ksc0JBQWMsaUJBa0MxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBSZW5kZXJlcixcbiAgZm9yd2FyZFJlZixcbiAgUHJvdmlkZXIsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBIb3N0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1xuICBDT05TVF9FWFBSLFxuICBTdHJpbmdXcmFwcGVyLFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBsb29zZUlkZW50aWNhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmNvbnN0IFNFTEVDVF9WQUxVRV9BQ0NFU1NPUiA9IENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFxuICAgIE5HX1ZBTFVFX0FDQ0VTU09SLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IpLCBtdWx0aTogdHJ1ZX0pKTtcblxuZnVuY3Rpb24gX2J1aWxkVmFsdWVTdHJpbmcoaWQ6IHN0cmluZywgdmFsdWU6IGFueSk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKGlkKSkgcmV0dXJuIGAke3ZhbHVlfWA7XG4gIGlmICghaXNQcmltaXRpdmUodmFsdWUpKSB2YWx1ZSA9IFwiT2JqZWN0XCI7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnNsaWNlKGAke2lkfTogJHt2YWx1ZX1gLCAwLCA1MCk7XG59XG5cbmZ1bmN0aW9uIF9leHRyYWN0SWQodmFsdWVTdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZVN0cmluZy5zcGxpdChcIjpcIilbMF07XG59XG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIGEgc2VsZWN0IGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3NlbGVjdFtuZ0NvbnRyb2xdLHNlbGVjdFtuZ0Zvcm1Db250cm9sXSxzZWxlY3RbbmdNb2RlbF0nLFxuICBob3N0OiB7JyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLCAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ30sXG4gIHByb3ZpZGVyczogW1NFTEVDVF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIHZhbHVlOiBhbnk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29wdGlvbk1hcDogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lkQ291bnRlcjogbnVtYmVyID0gMDtcblxuICBvbkNoYW5nZSA9IChfOiBhbnkpID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHZhciB2YWx1ZVN0cmluZyA9IF9idWlsZFZhbHVlU3RyaW5nKHRoaXMuX2dldE9wdGlvbklkKHZhbHVlKSwgdmFsdWUpO1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICd2YWx1ZScsIHZhbHVlU3RyaW5nKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gKHZhbHVlU3RyaW5nOiBzdHJpbmcpID0+IHsgZm4odGhpcy5fZ2V0T3B0aW9uVmFsdWUodmFsdWVTdHJpbmcpKTsgfTtcbiAgfVxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gYW55KTogdm9pZCB7IHRoaXMub25Ub3VjaGVkID0gZm47IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWdpc3Rlck9wdGlvbigpOiBzdHJpbmcgeyByZXR1cm4gKHRoaXMuX2lkQ291bnRlcisrKS50b1N0cmluZygpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0T3B0aW9uSWQodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgZm9yIChsZXQgaWQgb2YgTWFwV3JhcHBlci5rZXlzKHRoaXMuX29wdGlvbk1hcCkpIHtcbiAgICAgIGlmIChsb29zZUlkZW50aWNhbCh0aGlzLl9vcHRpb25NYXAuZ2V0KGlkKSwgdmFsdWUpKSByZXR1cm4gaWQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0T3B0aW9uVmFsdWUodmFsdWVTdHJpbmc6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fb3B0aW9uTWFwLmdldChfZXh0cmFjdElkKHZhbHVlU3RyaW5nKSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh2YWx1ZSkgPyB2YWx1ZSA6IHZhbHVlU3RyaW5nO1xuICB9XG59XG5cbi8qKlxuICogTWFya3MgYDxvcHRpb24+YCBhcyBkeW5hbWljLCBzbyBBbmd1bGFyIGNhbiBiZSBub3RpZmllZCB3aGVuIG9wdGlvbnMgY2hhbmdlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiA8c2VsZWN0IG5nQ29udHJvbD1cImNpdHlcIj5cbiAqICAgPG9wdGlvbiAqbmdGb3I9XCIjYyBvZiBjaXRpZXNcIiBbdmFsdWVdPVwiY1wiPjwvb3B0aW9uPlxuICogPC9zZWxlY3Q+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdvcHRpb24nfSlcbmV4cG9ydCBjbGFzcyBOZ1NlbGVjdE9wdGlvbiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASG9zdCgpIHByaXZhdGUgX3NlbGVjdDogU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlbGVjdCkpIHRoaXMuaWQgPSB0aGlzLl9zZWxlY3QuX3JlZ2lzdGVyT3B0aW9uKCk7XG4gIH1cblxuICBASW5wdXQoJ25nVmFsdWUnKVxuICBzZXQgbmdWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdCA9PSBudWxsKSByZXR1cm47XG4gICAgdGhpcy5fc2VsZWN0Ll9vcHRpb25NYXAuc2V0KHRoaXMuaWQsIHZhbHVlKTtcbiAgICB0aGlzLl9zZXRFbGVtZW50VmFsdWUoX2J1aWxkVmFsdWVTdHJpbmcodGhpcy5pZCwgdmFsdWUpKTtcbiAgICB0aGlzLl9zZWxlY3Qud3JpdGVWYWx1ZSh0aGlzLl9zZWxlY3QudmFsdWUpO1xuICB9XG5cbiAgQElucHV0KCd2YWx1ZScpXG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuX3NlbGVjdCA9PSBudWxsKSByZXR1cm47XG4gICAgdGhpcy5fc2V0RWxlbWVudFZhbHVlKHZhbHVlKTtcbiAgICB0aGlzLl9zZWxlY3Qud3JpdGVWYWx1ZSh0aGlzLl9zZWxlY3QudmFsdWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0RWxlbWVudFZhbHVlKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LCAndmFsdWUnLCB2YWx1ZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3NlbGVjdCkpIHtcbiAgICAgIHRoaXMuX3NlbGVjdC5fb3B0aW9uTWFwLmRlbGV0ZSh0aGlzLmlkKTtcbiAgICAgIHRoaXMuX3NlbGVjdC53cml0ZVZhbHVlKHRoaXMuX3NlbGVjdC52YWx1ZSk7XG4gICAgfVxuICB9XG59XG4iXX0=