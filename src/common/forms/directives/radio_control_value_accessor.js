'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var control_value_accessor_1 = require('angular2/src/common/forms/directives/control_value_accessor');
var ng_control_1 = require('angular2/src/common/forms/directives/ng_control');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var RADIO_VALUE_ACCESSOR = lang_1.CONST_EXPR(new core_1.Provider(control_value_accessor_1.NG_VALUE_ACCESSOR, { useExisting: core_1.forwardRef(function () { return RadioControlValueAccessor; }), multi: true }));
/**
 * Internal class used by Angular to uncheck radio buttons with the matching name.
 */
var RadioControlRegistry = (function () {
    function RadioControlRegistry() {
        this._accessors = [];
    }
    RadioControlRegistry.prototype.add = function (control, accessor) {
        this._accessors.push([control, accessor]);
    };
    RadioControlRegistry.prototype.remove = function (accessor) {
        var indexToRemove = -1;
        for (var i = 0; i < this._accessors.length; ++i) {
            if (this._accessors[i][1] === accessor) {
                indexToRemove = i;
            }
        }
        collection_1.ListWrapper.removeAt(this._accessors, indexToRemove);
    };
    RadioControlRegistry.prototype.select = function (accessor) {
        this._accessors.forEach(function (c) {
            if (c[0].control.root === accessor._control.control.root && c[1] !== accessor) {
                c[1].fireUncheck();
            }
        });
    };
    RadioControlRegistry = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], RadioControlRegistry);
    return RadioControlRegistry;
})();
exports.RadioControlRegistry = RadioControlRegistry;
/**
 * The value provided by the forms API for radio buttons.
 */
var RadioButtonState = (function () {
    function RadioButtonState(checked, value) {
        this.checked = checked;
        this.value = value;
    }
    return RadioButtonState;
})();
exports.RadioButtonState = RadioButtonState;
/**
 * The accessor for writing a radio control value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  ### Example
 *  ```
 *  @Component({
 *    template: `
 *      <input type="radio" name="food" [(ngModel)]="foodChicken">
 *      <input type="radio" name="food" [(ngModel)]="foodFish">
 *    `
 *  })
 *  class FoodCmp {
 *    foodChicken = new RadioButtonState(true, "chicken");
 *    foodFish = new RadioButtonState(false, "fish");
 *  }
 *  ```
 */
var RadioControlValueAccessor = (function () {
    function RadioControlValueAccessor(_renderer, _elementRef, _registry, _injector) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this._registry = _registry;
        this._injector = _injector;
        this.onChange = function () { };
        this.onTouched = function () { };
    }
    RadioControlValueAccessor.prototype.ngOnInit = function () {
        this._control = this._injector.get(ng_control_1.NgControl);
        this._registry.add(this._control, this);
    };
    RadioControlValueAccessor.prototype.ngOnDestroy = function () { this._registry.remove(this); };
    RadioControlValueAccessor.prototype.writeValue = function (value) {
        this._state = value;
        if (lang_1.isPresent(value) && value.checked) {
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', true);
        }
    };
    RadioControlValueAccessor.prototype.registerOnChange = function (fn) {
        var _this = this;
        this._fn = fn;
        this.onChange = function () {
            fn(new RadioButtonState(true, _this._state.value));
            _this._registry.select(_this);
        };
    };
    RadioControlValueAccessor.prototype.fireUncheck = function () { this._fn(new RadioButtonState(false, this._state.value)); };
    RadioControlValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], RadioControlValueAccessor.prototype, "name", void 0);
    RadioControlValueAccessor = __decorate([
        core_1.Directive({
            selector: 'input[type=radio][ngControl],input[type=radio][ngFormControl],input[type=radio][ngModel]',
            host: { '(change)': 'onChange()', '(blur)': 'onTouched()' },
            providers: [RADIO_VALUE_ACCESSOR]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef, RadioControlRegistry, core_1.Injector])
    ], RadioControlValueAccessor);
    return RadioControlValueAccessor;
})();
exports.RadioControlValueAccessor = RadioControlValueAccessor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9fY29udHJvbF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9yYWRpb19jb250cm9sX3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIlJhZGlvQ29udHJvbFJlZ2lzdHJ5IiwiUmFkaW9Db250cm9sUmVnaXN0cnkuY29uc3RydWN0b3IiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5hZGQiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5yZW1vdmUiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5zZWxlY3QiLCJSYWRpb0J1dHRvblN0YXRlIiwiUmFkaW9CdXR0b25TdGF0ZS5jb25zdHJ1Y3RvciIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5uZ09uSW5pdCIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IubmdPbkRlc3Ryb3kiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmZpcmVVbmNoZWNrIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uVG91Y2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQXFJLGVBQWUsQ0FBQyxDQUFBO0FBQ3JKLHVDQUFzRCw2REFBNkQsQ0FBQyxDQUFBO0FBQ3BILDJCQUF3QixpREFBaUQsQ0FBQyxDQUFBO0FBQzFFLHFCQUFvRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQy9FLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTNELElBQU0s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LEdBQVhBLGNBQXNCTSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxnQkFBZ0JBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRWpGTixxREFBaUJBLEdBQWpCQSxVQUFrQkEsRUFBWUEsSUFBVU8sSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFsQzlEUDtRQUFDQSxZQUFLQSxFQUFFQTs7T0FBQ0EsMkNBQUlBLFVBQVNBO0lBWnhCQTtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFDSkEsMEZBQTBGQTtZQUM5RkEsSUFBSUEsRUFBRUEsRUFBQ0EsVUFBVUEsRUFBRUEsWUFBWUEsRUFBRUEsUUFBUUEsRUFBRUEsYUFBYUEsRUFBQ0E7WUFDekRBLFNBQVNBLEVBQUVBLENBQUNBLG9CQUFvQkEsQ0FBQ0E7U0FDbENBLENBQUNBOztrQ0EwQ0RBO0lBQURBLGdDQUFDQTtBQUFEQSxDQUFDQSxBQS9DRCxJQStDQztBQXpDWSxpQ0FBeUIsNEJBeUNyQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFJlbmRlcmVyLCBTZWxmLCBmb3J3YXJkUmVmLCBQcm92aWRlciwgQXR0cmlidXRlLCBJbnB1dCwgT25Jbml0LCBPbkRlc3Ryb3ksIEluamVjdG9yLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtDT05TVF9FWFBSLCBsb29zZUlkZW50aWNhbCwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuY29uc3QgUkFESU9fVkFMVUVfQUNDRVNTT1IgPSBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICBOR19WQUxVRV9BQ0NFU1NPUiwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IpLCBtdWx0aTogdHJ1ZX0pKTtcblxuXG4vKipcbiAqIEludGVybmFsIGNsYXNzIHVzZWQgYnkgQW5ndWxhciB0byB1bmNoZWNrIHJhZGlvIGJ1dHRvbnMgd2l0aCB0aGUgbWF0Y2hpbmcgbmFtZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJhZGlvQ29udHJvbFJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfYWNjZXNzb3JzOiBhbnlbXSA9IFtdO1xuXG4gIGFkZChjb250cm9sOiBOZ0NvbnRyb2wsIGFjY2Vzc29yOiBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSB7XG4gICAgdGhpcy5fYWNjZXNzb3JzLnB1c2goW2NvbnRyb2wsIGFjY2Vzc29yXSk7XG4gIH1cblxuICByZW1vdmUoYWNjZXNzb3I6IFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IpIHtcbiAgICB2YXIgaW5kZXhUb1JlbW92ZSA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYWNjZXNzb3JzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodGhpcy5fYWNjZXNzb3JzW2ldWzFdID09PSBhY2Nlc3Nvcikge1xuICAgICAgICBpbmRleFRvUmVtb3ZlID0gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlQXQodGhpcy5fYWNjZXNzb3JzLCBpbmRleFRvUmVtb3ZlKTtcbiAgfVxuXG4gIHNlbGVjdChhY2Nlc3NvcjogUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvcikge1xuICAgIHRoaXMuX2FjY2Vzc29ycy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBpZiAoY1swXS5jb250cm9sLnJvb3QgPT09IGFjY2Vzc29yLl9jb250cm9sLmNvbnRyb2wucm9vdCAmJiBjWzFdICE9PSBhY2Nlc3Nvcikge1xuICAgICAgICBjWzFdLmZpcmVVbmNoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgdmFsdWUgcHJvdmlkZWQgYnkgdGhlIGZvcm1zIEFQSSBmb3IgcmFkaW8gYnV0dG9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJhZGlvQnV0dG9uU3RhdGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2hlY2tlZDogYm9vbGVhbiwgcHVibGljIHZhbHVlOiBzdHJpbmcpIHt9XG59XG5cblxuLyoqXG4gKiBUaGUgYWNjZXNzb3IgZm9yIHdyaXRpbmcgYSByYWRpbyBjb250cm9sIHZhbHVlIGFuZCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyB0aGF0IGlzIHVzZWQgYnkgdGhlXG4gKiB7QGxpbmsgTmdNb2RlbH0sIHtAbGluayBOZ0Zvcm1Db250cm9sfSwgYW5kIHtAbGluayBOZ0NvbnRyb2xOYW1lfSBkaXJlY3RpdmVzLlxuICpcbiAqICAjIyMgRXhhbXBsZVxuICogIGBgYFxuICogIEBDb21wb25lbnQoe1xuICogICAgdGVtcGxhdGU6IGBcbiAqICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJmb29kXCIgWyhuZ01vZGVsKV09XCJmb29kQ2hpY2tlblwiPlxuICogICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cImZvb2RcIiBbKG5nTW9kZWwpXT1cImZvb2RGaXNoXCI+XG4gKiAgICBgXG4gKiAgfSlcbiAqICBjbGFzcyBGb29kQ21wIHtcbiAqICAgIGZvb2RDaGlja2VuID0gbmV3IFJhZGlvQnV0dG9uU3RhdGUodHJ1ZSwgXCJjaGlja2VuXCIpO1xuICogICAgZm9vZEZpc2ggPSBuZXcgUmFkaW9CdXR0b25TdGF0ZShmYWxzZSwgXCJmaXNoXCIpO1xuICogIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOlxuICAgICAgJ2lucHV0W3R5cGU9cmFkaW9dW25nQ29udHJvbF0saW5wdXRbdHlwZT1yYWRpb11bbmdGb3JtQ29udHJvbF0saW5wdXRbdHlwZT1yYWRpb11bbmdNb2RlbF0nLFxuICBob3N0OiB7JyhjaGFuZ2UpJzogJ29uQ2hhbmdlKCknLCAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ30sXG4gIHByb3ZpZGVyczogW1JBRElPX1ZBTFVFX0FDQ0VTU09SXVxufSlcbmV4cG9ydCBjbGFzcyBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gICAgT25EZXN0cm95LCBPbkluaXQge1xuICAvKiogQGludGVybmFsICovXG4gIF9zdGF0ZTogUmFkaW9CdXR0b25TdGF0ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29udHJvbDogTmdDb250cm9sO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZuOiBGdW5jdGlvbjtcbiAgb25DaGFuZ2UgPSAoKSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBwcml2YXRlIF9yZWdpc3RyeTogUmFkaW9Db250cm9sUmVnaXN0cnksIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb250cm9sID0gdGhpcy5faW5qZWN0b3IuZ2V0KE5nQ29udHJvbCk7XG4gICAgdGhpcy5fcmVnaXN0cnkuYWRkKHRoaXMuX2NvbnRyb2wsIHRoaXMpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX3JlZ2lzdHJ5LnJlbW92ZSh0aGlzKTsgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXRlID0gdmFsdWU7XG4gICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkgJiYgdmFsdWUuY2hlY2tlZCkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFByb3BlcnR5KHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoXzogYW55KSA9PiB7fSk6IHZvaWQge1xuICAgIHRoaXMuX2ZuID0gZm47XG4gICAgdGhpcy5vbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgIGZuKG5ldyBSYWRpb0J1dHRvblN0YXRlKHRydWUsIHRoaXMuX3N0YXRlLnZhbHVlKSk7XG4gICAgICB0aGlzLl9yZWdpc3RyeS5zZWxlY3QodGhpcyk7XG4gICAgfTtcbiAgfVxuXG4gIGZpcmVVbmNoZWNrKCk6IHZvaWQgeyB0aGlzLl9mbihuZXcgUmFkaW9CdXR0b25TdGF0ZShmYWxzZSwgdGhpcy5fc3RhdGUudmFsdWUpKTsgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQgeyB0aGlzLm9uVG91Y2hlZCA9IGZuOyB9XG59XG4iXX0=