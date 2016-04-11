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
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { Directive, forwardRef, Provider, Inject, Optional, Self } from 'angular2/core';
import { ControlContainer } from './control_container';
import { setUpControl, setUpControlGroup, composeValidators, composeAsyncValidators } from './shared';
import { Validators, NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const formDirectiveProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgFormModel) }));
/**
 * Binds an existing control group to a DOM element.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jqrVirudY8anJxTMUjTP?p=preview))
 *
 * In this example, we bind the control group to the form element, and we bind the login and
 * password controls to the login and password elements.
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>NgFormModel Example</h2>
 *       <form [ngFormModel]="loginForm">
 *         <p>Login: <input type="text" ngControl="login"></p>
 *         <p>Password: <input type="password" ngControl="password"></p>
 *       </form>
 *       <p>Value:</p>
 *       <pre>{{value}}</pre>
 *     </div>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor() {
 *     this.loginForm = new ControlGroup({
 *       login: new Control(""),
 *       password: new Control("")
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 *  ```
 *
 * We can also use ngModel to bind a domain model to the form.
 *
 *  ```typescript
 * @Component({
 *      selector: "login-comp",
 *      directives: [FORM_DIRECTIVES],
 *      template: `
 *        <form [ngFormModel]='loginForm'>
 *          Login <input type='text' ngControl='login' [(ngModel)]='credentials.login'>
 *          Password <input type='password' ngControl='password'
 *                          [(ngModel)]='credentials.password'>
 *          <button (click)="onLogin()">Login</button>
 *        </form>`
 *      })
 * class LoginComp {
 *  credentials: {login: string, password: string};
 *  loginForm: ControlGroup;
 *
 *  constructor() {
 *    this.loginForm = new ControlGroup({
 *      login: new Control(""),
 *      password: new Control("")
 *    });
 *  }
 *
 *  onLogin(): void {
 *    // this.credentials.login === 'some login'
 *    // this.credentials.password === 'some password'
 *  }
 * }
 *  ```
 */
export let NgFormModel = class extends ControlContainer {
    constructor(_validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new EventEmitter();
    }
    ngOnChanges(changes) {
        if (StringMapWrapper.contains(changes, 'form')) {
            var sync = composeValidators(this._validators);
            this.form.validator = Validators.compose([this.form.validator, sync]);
            var async = composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    }
    get formDirective() { return this; }
    get control() { return this.form; }
    get path() { return []; }
    addControl(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    }
    getControl(dir) { return this.form.find(dir.path); }
    removeControl(dir) { ListWrapper.remove(this.directives, dir); }
    addControlGroup(dir) {
        var ctrl = this.form.find(dir.path);
        setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    }
    removeControlGroup(dir) { }
    getControlGroup(dir) {
        return this.form.find(dir.path);
    }
    updateModel(dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    }
    onSubmit() {
        ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    }
    /** @internal */
    _updateDomValue() {
        this.directives.forEach(dir => {
            var ctrl = this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    }
};
NgFormModel = __decorate([
    Directive({
        selector: '[ngFormModel]',
        bindings: [formDirectiveProvider],
        inputs: ['form: ngFormModel'],
        host: { '(submit)': 'onSubmit()' },
        outputs: ['ngSubmit'],
        exportAs: 'ngForm'
    }),
    __param(0, Optional()),
    __param(0, Self()),
    __param(0, Inject(NG_VALIDATORS)),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [Array, Array])
], NgFormModel);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsLnRzIl0sIm5hbWVzIjpbIk5nRm9ybU1vZGVsIiwiTmdGb3JtTW9kZWwuY29uc3RydWN0b3IiLCJOZ0Zvcm1Nb2RlbC5uZ09uQ2hhbmdlcyIsIk5nRm9ybU1vZGVsLmZvcm1EaXJlY3RpdmUiLCJOZ0Zvcm1Nb2RlbC5jb250cm9sIiwiTmdGb3JtTW9kZWwucGF0aCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2wiLCJOZ0Zvcm1Nb2RlbC5nZXRDb250cm9sIiwiTmdGb3JtTW9kZWwucmVtb3ZlQ29udHJvbCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnJlbW92ZUNvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnVwZGF0ZU1vZGVsIiwiTmdGb3JtTW9kZWwub25TdWJtaXQiLCJOZ0Zvcm1Nb2RlbC5fdXBkYXRlRG9tVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQzVDLEVBQUMsV0FBVyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3JFLEVBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQTBCLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUd2RyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BRzdDLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVTtPQUM1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Q2hCQSxlQUFlQTtRQUNiYyxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQTtZQUN6QkEsSUFBSUEsSUFBSUEsR0FBUUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDekNBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQzNDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNIZCxDQUFDQTtBQWhGRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1FBQ2pDLE1BQU0sRUFBRSxDQUFDLG1CQUFtQixDQUFDO1FBQzdCLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUM7UUFDaEMsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQ3JCLFFBQVEsRUFBRSxRQUFRO0tBQ25CLENBQUM7SUFRSSxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTs7Z0JBZ0VyRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1NpbXBsZUNoYW5nZSwgT25DaGFuZ2VzLCBEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyLCBJbmplY3QsIE9wdGlvbmFsLCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtOZ0NvbnRyb2xHcm91cH0gZnJvbSAnLi9uZ19jb250cm9sX2dyb3VwJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtDb250cm9sLCBDb250cm9sR3JvdXB9IGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7c2V0VXBDb250cm9sLCBzZXRVcENvbnRyb2xHcm91cCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VmFsaWRhdG9ycywgTkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGZvcm1EaXJlY3RpdmVQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nRm9ybU1vZGVsKX0pKTtcblxuLyoqXG4gKiBCaW5kcyBhbiBleGlzdGluZyBjb250cm9sIGdyb3VwIHRvIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2pxclZpcnVkWThhbkp4VE1ValRQP3A9cHJldmlldykpXG4gKlxuICogSW4gdGhpcyBleGFtcGxlLCB3ZSBiaW5kIHRoZSBjb250cm9sIGdyb3VwIHRvIHRoZSBmb3JtIGVsZW1lbnQsIGFuZCB3ZSBiaW5kIHRoZSBsb2dpbiBhbmRcbiAqIHBhc3N3b3JkIGNvbnRyb2xzIHRvIHRoZSBsb2dpbiBhbmQgcGFzc3dvcmQgZWxlbWVudHMuXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5OZ0Zvcm1Nb2RlbCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtIFtuZ0Zvcm1Nb2RlbF09XCJsb2dpbkZvcm1cIj5cbiAqICAgICAgICAgPHA+TG9naW46IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nQ29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgICA8cD5QYXNzd29yZDogPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nQ29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgPC9mb3JtPlxuICogICAgICAgPHA+VmFsdWU6PC9wPlxuICogICAgICAgPHByZT57e3ZhbHVlfX08L3ByZT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFU11cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgbG9naW5Gb3JtOiBDb250cm9sR3JvdXA7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLmxvZ2luRm9ybSA9IG5ldyBDb250cm9sR3JvdXAoe1xuICogICAgICAgbG9naW46IG5ldyBDb250cm9sKFwiXCIpLFxuICogICAgICAgcGFzc3dvcmQ6IG5ldyBDb250cm9sKFwiXCIpXG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqXG4gKiAgIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xuICogICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmxvZ2luRm9ybS52YWx1ZSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqICBgYGBcbiAqXG4gKiBXZSBjYW4gYWxzbyB1c2UgbmdNb2RlbCB0byBiaW5kIGEgZG9tYWluIG1vZGVsIHRvIHRoZSBmb3JtLlxuICpcbiAqICBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgICAgc2VsZWN0b3I6IFwibG9naW4tY29tcFwiLFxuICogICAgICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqICAgICAgdGVtcGxhdGU6IGBcbiAqICAgICAgICA8Zm9ybSBbbmdGb3JtTW9kZWxdPSdsb2dpbkZvcm0nPlxuICogICAgICAgICAgTG9naW4gPGlucHV0IHR5cGU9J3RleHQnIG5nQ29udHJvbD0nbG9naW4nIFsobmdNb2RlbCldPSdjcmVkZW50aWFscy5sb2dpbic+XG4gKiAgICAgICAgICBQYXNzd29yZCA8aW5wdXQgdHlwZT0ncGFzc3dvcmQnIG5nQ29udHJvbD0ncGFzc3dvcmQnXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgWyhuZ01vZGVsKV09J2NyZWRlbnRpYWxzLnBhc3N3b3JkJz5cbiAqICAgICAgICAgIDxidXR0b24gKGNsaWNrKT1cIm9uTG9naW4oKVwiPkxvZ2luPC9idXR0b24+XG4gKiAgICAgICAgPC9mb3JtPmBcbiAqICAgICAgfSlcbiAqIGNsYXNzIExvZ2luQ29tcCB7XG4gKiAgY3JlZGVudGlhbHM6IHtsb2dpbjogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nfTtcbiAqICBsb2dpbkZvcm06IENvbnRyb2xHcm91cDtcbiAqXG4gKiAgY29uc3RydWN0b3IoKSB7XG4gKiAgICB0aGlzLmxvZ2luRm9ybSA9IG5ldyBDb250cm9sR3JvdXAoe1xuICogICAgICBsb2dpbjogbmV3IENvbnRyb2woXCJcIiksXG4gKiAgICAgIHBhc3N3b3JkOiBuZXcgQ29udHJvbChcIlwiKVxuICogICAgfSk7XG4gKiAgfVxuICpcbiAqICBvbkxvZ2luKCk6IHZvaWQge1xuICogICAgLy8gdGhpcy5jcmVkZW50aWFscy5sb2dpbiA9PT0gJ3NvbWUgbG9naW4nXG4gKiAgICAvLyB0aGlzLmNyZWRlbnRpYWxzLnBhc3N3b3JkID09PSAnc29tZSBwYXNzd29yZCdcbiAqICB9XG4gKiB9XG4gKiAgYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0Zvcm1Nb2RlbF0nLFxuICBiaW5kaW5nczogW2Zvcm1EaXJlY3RpdmVQcm92aWRlcl0sXG4gIGlucHV0czogWydmb3JtOiBuZ0Zvcm1Nb2RlbCddLFxuICBob3N0OiB7JyhzdWJtaXQpJzogJ29uU3VibWl0KCknfSxcbiAgb3V0cHV0czogWyduZ1N1Ym1pdCddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGb3JtTW9kZWwgZXh0ZW5kcyBDb250cm9sQ29udGFpbmVyIGltcGxlbWVudHMgRm9ybSxcbiAgICBPbkNoYW5nZXMge1xuICBmb3JtOiBDb250cm9sR3JvdXAgPSBudWxsO1xuICBkaXJlY3RpdmVzOiBOZ0NvbnRyb2xbXSA9IFtdO1xuICBuZ1N1Ym1pdCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxJREFUT1JTKSBwcml2YXRlIF92YWxpZGF0b3JzOiBhbnlbXSxcbiAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtba2V5OiBzdHJpbmddOiBTaW1wbGVDaGFuZ2V9KTogdm9pZCB7XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoY2hhbmdlcywgJ2Zvcm0nKSkge1xuICAgICAgdmFyIHN5bmMgPSBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTtcbiAgICAgIHRoaXMuZm9ybS52YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2UoW3RoaXMuZm9ybS52YWxpZGF0b3IsIHN5bmNdKTtcblxuICAgICAgdmFyIGFzeW5jID0gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpO1xuICAgICAgdGhpcy5mb3JtLmFzeW5jVmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlQXN5bmMoW3RoaXMuZm9ybS5hc3luY1ZhbGlkYXRvciwgYXN5bmNdKTtcblxuICAgICAgdGhpcy5mb3JtLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe29ubHlTZWxmOiB0cnVlLCBlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRG9tVmFsdWUoKTtcbiAgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpczsgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2xHcm91cCB7IHJldHVybiB0aGlzLmZvcm07IH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGFkZENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgICB2YXIgY3RybDogYW55ID0gdGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgIHNldFVwQ29udHJvbChjdHJsLCBkaXIpO1xuICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgIHRoaXMuZGlyZWN0aXZlcy5wdXNoKGRpcik7XG4gIH1cblxuICBnZXRDb250cm9sKGRpcjogTmdDb250cm9sKTogQ29udHJvbCB7IHJldHVybiA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7IH1cblxuICByZW1vdmVDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7IExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLmRpcmVjdGl2ZXMsIGRpcik7IH1cblxuICBhZGRDb250cm9sR3JvdXAoZGlyOiBOZ0NvbnRyb2xHcm91cCkge1xuICAgIHZhciBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgc2V0VXBDb250cm9sR3JvdXAoY3RybCwgZGlyKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKSB7fVxuXG4gIGdldENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogQ29udHJvbEdyb3VwIHtcbiAgICByZXR1cm4gPENvbnRyb2xHcm91cD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gIH1cblxuICB1cGRhdGVNb2RlbChkaXI6IE5nQ29udHJvbCwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHZhciBjdHJswqAgPSA8Q29udHJvbD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgY3RybC51cGRhdGVWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBvblN1Ym1pdCgpOiBib29sZWFuIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLm5nU3VibWl0LCBudWxsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVEb21WYWx1ZSgpIHtcbiAgICB0aGlzLmRpcmVjdGl2ZXMuZm9yRWFjaChkaXIgPT4ge1xuICAgICAgdmFyIGN0cmw6IGFueSA9IHRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICAgIGRpci52YWx1ZUFjY2Vzc29yLndyaXRlVmFsdWUoY3RybC52YWx1ZSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==