var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Renderer, forwardRef, Provider, Input, Injector, Injectable } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from 'angular2/src/common/forms/directives/control_value_accessor';
import { NgControl } from 'angular2/src/common/forms/directives/ng_control';
import { CONST_EXPR, isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
const RADIO_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => RadioControlValueAccessor), multi: true }));
/**
 * Internal class used by Angular to uncheck radio buttons with the matching name.
 */
export let RadioControlRegistry = class {
    constructor() {
        this._accessors = [];
    }
    add(control, accessor) {
        this._accessors.push([control, accessor]);
    }
    remove(accessor) {
        var indexToRemove = -1;
        for (var i = 0; i < this._accessors.length; ++i) {
            if (this._accessors[i][1] === accessor) {
                indexToRemove = i;
            }
        }
        ListWrapper.removeAt(this._accessors, indexToRemove);
    }
    select(accessor) {
        this._accessors.forEach((c) => {
            if (c[0].control.root === accessor._control.control.root && c[1] !== accessor) {
                c[1].fireUncheck();
            }
        });
    }
};
RadioControlRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], RadioControlRegistry);
/**
 * The value provided by the forms API for radio buttons.
 */
export class RadioButtonState {
    constructor(checked, value) {
        this.checked = checked;
        this.value = value;
    }
}
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
export let RadioControlValueAccessor = class {
    constructor(_renderer, _elementRef, _registry, _injector) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this._registry = _registry;
        this._injector = _injector;
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    ngOnInit() {
        this._control = this._injector.get(NgControl);
        this._registry.add(this._control, this);
    }
    ngOnDestroy() { this._registry.remove(this); }
    writeValue(value) {
        this._state = value;
        if (isPresent(value) && value.checked) {
            this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', true);
        }
    }
    registerOnChange(fn) {
        this._fn = fn;
        this.onChange = () => {
            fn(new RadioButtonState(true, this._state.value));
            this._registry.select(this);
        };
    }
    fireUncheck() { this._fn(new RadioButtonState(false, this._state.value)); }
    registerOnTouched(fn) { this.onTouched = fn; }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], RadioControlValueAccessor.prototype, "name", void 0);
RadioControlValueAccessor = __decorate([
    Directive({
        selector: 'input[type=radio][ngControl],input[type=radio][ngFormControl],input[type=radio][ngModel]',
        host: { '(change)': 'onChange()', '(blur)': 'onTouched()' },
        providers: [RADIO_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [Renderer, ElementRef, RadioControlRegistry, Injector])
], RadioControlValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9fY29udHJvbF92YWx1ZV9hY2Nlc3Nvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9yYWRpb19jb250cm9sX3ZhbHVlX2FjY2Vzc29yLnRzIl0sIm5hbWVzIjpbIlJhZGlvQ29udHJvbFJlZ2lzdHJ5IiwiUmFkaW9Db250cm9sUmVnaXN0cnkuY29uc3RydWN0b3IiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5hZGQiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5yZW1vdmUiLCJSYWRpb0NvbnRyb2xSZWdpc3RyeS5zZWxlY3QiLCJSYWRpb0J1dHRvblN0YXRlIiwiUmFkaW9CdXR0b25TdGF0ZS5jb25zdHJ1Y3RvciIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5uZ09uSW5pdCIsIlJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IubmdPbkRlc3Ryb3kiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yLmZpcmVVbmNoZWNrIiwiUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uVG91Y2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBUSxVQUFVLEVBQUUsUUFBUSxFQUFhLEtBQUssRUFBcUIsUUFBUSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDN0ksRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSw2REFBNkQ7T0FDNUcsRUFBQyxTQUFTLEVBQUMs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Q0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakZOLGlCQUFpQkEsQ0FBQ0EsRUFBWUEsSUFBVU8sSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDaEVQLENBQUNBO0FBbkNDO0lBQUMsS0FBSyxFQUFFOztHQUFDLDJDQUFJLFVBQVM7QUFaeEI7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQ0osMEZBQTBGO1FBQzlGLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBQztRQUN6RCxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztLQUNsQyxDQUFDOzs4QkEwQ0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBSZW5kZXJlciwgU2VsZiwgZm9yd2FyZFJlZiwgUHJvdmlkZXIsIEF0dHJpYnV0ZSwgSW5wdXQsIE9uSW5pdCwgT25EZXN0cm95LCBJbmplY3RvciwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9kaXJlY3RpdmVzL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sJztcbmltcG9ydCB7Q09OU1RfRVhQUiwgbG9vc2VJZGVudGljYWwsIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmNvbnN0IFJBRElPX1ZBTFVFX0FDQ0VTU09SID0gQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgTkdfVkFMVUVfQUNDRVNTT1IsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cblxuLyoqXG4gKiBJbnRlcm5hbCBjbGFzcyB1c2VkIGJ5IEFuZ3VsYXIgdG8gdW5jaGVjayByYWRpbyBidXR0b25zIHdpdGggdGhlIG1hdGNoaW5nIG5hbWUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSYWRpb0NvbnRyb2xSZWdpc3RyeSB7XG4gIHByaXZhdGUgX2FjY2Vzc29yczogYW55W10gPSBbXTtcblxuICBhZGQoY29udHJvbDogTmdDb250cm9sLCBhY2Nlc3NvcjogUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvcikge1xuICAgIHRoaXMuX2FjY2Vzc29ycy5wdXNoKFtjb250cm9sLCBhY2Nlc3Nvcl0pO1xuICB9XG5cbiAgcmVtb3ZlKGFjY2Vzc29yOiBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSB7XG4gICAgdmFyIGluZGV4VG9SZW1vdmUgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FjY2Vzc29ycy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKHRoaXMuX2FjY2Vzc29yc1tpXVsxXSA9PT0gYWNjZXNzb3IpIHtcbiAgICAgICAgaW5kZXhUb1JlbW92ZSA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIExpc3RXcmFwcGVyLnJlbW92ZUF0KHRoaXMuX2FjY2Vzc29ycywgaW5kZXhUb1JlbW92ZSk7XG4gIH1cblxuICBzZWxlY3QoYWNjZXNzb3I6IFJhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3IpIHtcbiAgICB0aGlzLl9hY2Nlc3NvcnMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgaWYgKGNbMF0uY29udHJvbC5yb290ID09PSBhY2Nlc3Nvci5fY29udHJvbC5jb250cm9sLnJvb3QgJiYgY1sxXSAhPT0gYWNjZXNzb3IpIHtcbiAgICAgICAgY1sxXS5maXJlVW5jaGVjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVGhlIHZhbHVlIHByb3ZpZGVkIGJ5IHRoZSBmb3JtcyBBUEkgZm9yIHJhZGlvIGJ1dHRvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBSYWRpb0J1dHRvblN0YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNoZWNrZWQ6IGJvb2xlYW4sIHB1YmxpYyB2YWx1ZTogc3RyaW5nKSB7fVxufVxuXG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgcmFkaW8gY29udHJvbCB2YWx1ZSBhbmQgbGlzdGVuaW5nIHRvIGNoYW5nZXMgdGhhdCBpcyB1c2VkIGJ5IHRoZVxuICoge0BsaW5rIE5nTW9kZWx9LCB7QGxpbmsgTmdGb3JtQ29udHJvbH0sIGFuZCB7QGxpbmsgTmdDb250cm9sTmFtZX0gZGlyZWN0aXZlcy5cbiAqXG4gKiAgIyMjIEV4YW1wbGVcbiAqICBgYGBcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgIHRlbXBsYXRlOiBgXG4gKiAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwiZm9vZFwiIFsobmdNb2RlbCldPVwiZm9vZENoaWNrZW5cIj5cbiAqICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJmb29kXCIgWyhuZ01vZGVsKV09XCJmb29kRmlzaFwiPlxuICogICAgYFxuICogIH0pXG4gKiAgY2xhc3MgRm9vZENtcCB7XG4gKiAgICBmb29kQ2hpY2tlbiA9IG5ldyBSYWRpb0J1dHRvblN0YXRlKHRydWUsIFwiY2hpY2tlblwiKTtcbiAqICAgIGZvb2RGaXNoID0gbmV3IFJhZGlvQnV0dG9uU3RhdGUoZmFsc2UsIFwiZmlzaFwiKTtcbiAqICB9XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjpcbiAgICAgICdpbnB1dFt0eXBlPXJhZGlvXVtuZ0NvbnRyb2xdLGlucHV0W3R5cGU9cmFkaW9dW25nRm9ybUNvbnRyb2xdLGlucHV0W3R5cGU9cmFkaW9dW25nTW9kZWxdJyxcbiAgaG9zdDogeycoY2hhbmdlKSc6ICdvbkNoYW5nZSgpJywgJyhibHVyKSc6ICdvblRvdWNoZWQoKSd9LFxuICBwcm92aWRlcnM6IFtSQURJT19WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgUmFkaW9Db250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLFxuICAgIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RhdGU6IFJhZGlvQnV0dG9uU3RhdGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnRyb2w6IE5nQ29udHJvbDtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9mbjogRnVuY3Rpb247XG4gIG9uQ2hhbmdlID0gKCkgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyLCBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgcHJpdmF0ZSBfcmVnaXN0cnk6IFJhZGlvQ29udHJvbFJlZ2lzdHJ5LCBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5fY29udHJvbCA9IHRoaXMuX2luamVjdG9yLmdldChOZ0NvbnRyb2wpO1xuICAgIHRoaXMuX3JlZ2lzdHJ5LmFkZCh0aGlzLl9jb250cm9sLCB0aGlzKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9yZWdpc3RyeS5yZW1vdmUodGhpcyk7IH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZSA9IHZhbHVlO1xuICAgIGlmIChpc1ByZXNlbnQodmFsdWUpICYmIHZhbHVlLmNoZWNrZWQpIHtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRQcm9wZXJ0eSh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdjaGVja2VkJywgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKF86IGFueSkgPT4ge30pOiB2b2lkIHtcbiAgICB0aGlzLl9mbiA9IGZuO1xuICAgIHRoaXMub25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICBmbihuZXcgUmFkaW9CdXR0b25TdGF0ZSh0cnVlLCB0aGlzLl9zdGF0ZS52YWx1ZSkpO1xuICAgICAgdGhpcy5fcmVnaXN0cnkuc2VsZWN0KHRoaXMpO1xuICAgIH07XG4gIH1cblxuICBmaXJlVW5jaGVjaygpOiB2b2lkIHsgdGhpcy5fZm4obmV3IFJhZGlvQnV0dG9uU3RhdGUoZmFsc2UsIHRoaXMuX3N0YXRlLnZhbHVlKSk7IH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHsgdGhpcy5vblRvdWNoZWQgPSBmbjsgfVxufVxuIl19