var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { NgControl } from './ng_control';
import { Control } from '../model';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
import { setUpControl, isPropertyUpdated, selectValueAccessor, composeValidators, composeAsyncValidators } from './shared';
const formControlBinding = CONST_EXPR(new Provider(NgControl, { useExisting: forwardRef(() => NgModel) }));
/**
 * Binds a domain model to a form control.
 *
 * ### Usage
 *
 * `ngModel` binds an existing domain model to a form control. For a
 * two-way binding, use `[(ngModel)]` to ensure the model updates in
 * both directions.
 *
 * ### Example ([live demo](http://plnkr.co/edit/R3UX5qDaUqFO2VYR0UzH?p=preview))
 *  ```typescript
 * @Component({
 *      selector: "search-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `<input type='text' [(ngModel)]="searchQuery">`
 *      })
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 */
export let NgModel = class extends NgControl {
    constructor(_validators, _asyncValidators, valueAccessors) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        /** @internal */
        this._control = new Control();
        /** @internal */
        this._added = false;
        this.update = new EventEmitter();
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    ngOnChanges(changes) {
        if (!this._added) {
            setUpControl(this._control, this);
            this._control.updateValueAndValidity({ emitEvent: false });
            this._added = true;
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this._control.updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    get control() { return this._control; }
    get path() { return []; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() {
        return composeAsyncValidators(this._asyncValidators);
    }
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        ObservableWrapper.callEmit(this.update, newValue);
    }
};
NgModel = __decorate([
    Directive({
        selector: '[ngModel]:not([ngControl]):not([ngFormControl])',
        bindings: [formControlBinding],
        inputs: ['model: ngModel'],
        outputs: ['update: ngModelChange'],
        exportAs: 'ngForm'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_VALUE_ACCESSOR)), 
    __metadata('design:paramtypes', [Array, Array, Array])
], NgModel);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczRFJsWEppLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfbW9kZWwudHMiXSwibmFtZXMiOlsiTmdNb2RlbCIsIk5nTW9kZWwuY29uc3RydWN0b3IiLCJOZ01vZGVsLm5nT25DaGFuZ2VzIiwiTmdNb2RlbC5jb250cm9sIiwiTmdNb2RlbC5wYXRoIiwiTmdNb2RlbC52YWxpZGF0b3IiLCJOZ01vZGVsLmFzeW5jVmFsaWRhdG9yIiwiTmdNb2RlbC52aWV3VG9Nb2RlbFVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEUsRUFBMEIsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsTUFBTSxlQUFlO09BQ3ZHLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCO09BQ3pFLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYztPQUMvQixFQUFDLE9BQU8sRUFBQyxNQUFNLFVBQVU7T0FDekIsRUFBQyxhQUFhLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxlQUFlO09BQ3pELEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVTtBQUd4SCxNQUFNLGtCQUFrQixHQUNwQixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWxGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNILG1DQU82QixTQUFT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O0lBQUMsV0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7WUFpQzNEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgRGlyZWN0aXZlLCBmb3J3YXJkUmVmLCBQcm92aWRlciwgSW5qZWN0LCBPcHRpb25hbCwgU2VsZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge05HX1ZBTElEQVRPUlMsIE5HX0FTWU5DX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIGlzUHJvcGVydHlVcGRhdGVkLCBzZWxlY3RWYWx1ZUFjY2Vzc29yLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JGbiwgQXN5bmNWYWxpZGF0b3JGbn0gZnJvbSAnLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybUNvbnRyb2xCaW5kaW5nID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOZ0NvbnRyb2wsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhIGRvbWFpbiBtb2RlbCB0byBhIGZvcm0gY29udHJvbC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgbmdNb2RlbGAgYmluZHMgYW4gZXhpc3RpbmcgZG9tYWluIG1vZGVsIHRvIGEgZm9ybSBjb250cm9sLiBGb3IgYVxuICogdHdvLXdheSBiaW5kaW5nLCB1c2UgYFsobmdNb2RlbCldYCB0byBlbnN1cmUgdGhlIG1vZGVsIHVwZGF0ZXMgaW5cbiAqIGJvdGggZGlyZWN0aW9ucy5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUjNVWDVxRGFVcUZPMlZZUjBVekg/cD1wcmV2aWV3KSlcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgICAgc2VsZWN0b3I6IFwic2VhcmNoLWNvbXBcIixcbiAqICAgICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU10sXG4gKiAgICAgIHRlbXBsYXRlOiBgPGlucHV0IHR5cGU9J3RleHQnIFsobmdNb2RlbCldPVwic2VhcmNoUXVlcnlcIj5gXG4gKiAgICAgIH0pXG4gKiBjbGFzcyBTZWFyY2hDb21wIHtcbiAqICBzZWFyY2hRdWVyeTogc3RyaW5nO1xuICogfVxuICogIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdNb2RlbF06bm90KFtuZ0NvbnRyb2xdKTpub3QoW25nRm9ybUNvbnRyb2xdKScsXG4gIGJpbmRpbmdzOiBbZm9ybUNvbnRyb2xCaW5kaW5nXSxcbiAgaW5wdXRzOiBbJ21vZGVsOiBuZ01vZGVsJ10sXG4gIG91dHB1dHM6IFsndXBkYXRlOiBuZ01vZGVsQ2hhbmdlJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ01vZGVsIGV4dGVuZHMgTmdDb250cm9sIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29udHJvbCA9IG5ldyBDb250cm9sKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZGVkID0gZmFsc2U7XG4gIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgbW9kZWw6IGFueTtcbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTFVFX0FDQ0VTU09SKVxuICAgICAgICAgICAgICB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiB7W2tleTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgIHNldFVwQ29udHJvbCh0aGlzLl9jb250cm9sLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRyb2wudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc1Byb3BlcnR5VXBkYXRlZChjaGFuZ2VzLCB0aGlzLnZpZXdNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRyb2wudXBkYXRlVmFsdWUodGhpcy5tb2RlbCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZ2V0IGNvbnRyb2woKTogQ29udHJvbCB7IHJldHVybiB0aGlzLl9jb250cm9sOyB9XG5cbiAgICAgICAgICAgICAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gW107IH1cblxuICAgICAgICAgICAgICBnZXQgdmFsaWRhdG9yKCk6IFZhbGlkYXRvckZuIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgICAgICAgICAgICAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEFzeW5jVmFsaWRhdG9yRm4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLnVwZGF0ZSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG59XG4iXX0=