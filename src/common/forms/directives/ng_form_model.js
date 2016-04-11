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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var control_container_1 = require('./control_container');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var formDirectiveProvider = lang_1.CONST_EXPR(new core_1.Provider(control_container_1.ControlContainer, { useExisting: core_1.forwardRef(function () { return NgFormModel; }) }));
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
var NgFormModel = (function (_super) {
    __extends(NgFormModel, _super);
    function NgFormModel(_validators, _asyncValidators) {
        _super.call(this);
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this.form = null;
        this.directives = [];
        this.ngSubmit = new async_1.EventEmitter();
    }
    NgFormModel.prototype.ngOnChanges = function (changes) {
        if (collection_1.StringMapWrapper.contains(changes, 'form')) {
            var sync = shared_1.composeValidators(this._validators);
            this.form.validator = validators_1.Validators.compose([this.form.validator, sync]);
            var async = shared_1.composeAsyncValidators(this._asyncValidators);
            this.form.asyncValidator = validators_1.Validators.composeAsync([this.form.asyncValidator, async]);
            this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this._updateDomValue();
    };
    Object.defineProperty(NgFormModel.prototype, "formDirective", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFormModel.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    NgFormModel.prototype.addControl = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControl(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
        this.directives.push(dir);
    };
    NgFormModel.prototype.getControl = function (dir) { return this.form.find(dir.path); };
    NgFormModel.prototype.removeControl = function (dir) { collection_1.ListWrapper.remove(this.directives, dir); };
    NgFormModel.prototype.addControlGroup = function (dir) {
        var ctrl = this.form.find(dir.path);
        shared_1.setUpControlGroup(ctrl, dir);
        ctrl.updateValueAndValidity({ emitEvent: false });
    };
    NgFormModel.prototype.removeControlGroup = function (dir) { };
    NgFormModel.prototype.getControlGroup = function (dir) {
        return this.form.find(dir.path);
    };
    NgFormModel.prototype.updateModel = function (dir, value) {
        var ctrl = this.form.find(dir.path);
        ctrl.updateValue(value);
    };
    NgFormModel.prototype.onSubmit = function () {
        async_1.ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    };
    /** @internal */
    NgFormModel.prototype._updateDomValue = function () {
        var _this = this;
        this.directives.forEach(function (dir) {
            var ctrl = _this.form.find(dir.path);
            dir.valueAccessor.writeValue(ctrl.value);
        });
    };
    NgFormModel = __decorate([
        core_1.Directive({
            selector: '[ngFormModel]',
            bindings: [formDirectiveProvider],
            inputs: ['form: ngFormModel'],
            host: { '(submit)': 'onSubmit()' },
            outputs: ['ngSubmit'],
            exportAs: 'ngForm'
        }),
        __param(0, core_1.Optional()),
        __param(0, core_1.Self()),
        __param(0, core_1.Inject(validators_1.NG_VALIDATORS)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Self()),
        __param(1, core_1.Inject(validators_1.NG_ASYNC_VALIDATORS)), 
        __metadata('design:paramtypes', [Array, Array])
    ], NgFormModel);
    return NgFormModel;
})(control_container_1.ControlContainer);
exports.NgFormModel = NgFormModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybV9tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtX21vZGVsLnRzIl0sIm5hbWVzIjpbIk5nRm9ybU1vZGVsIiwiTmdGb3JtTW9kZWwuY29uc3RydWN0b3IiLCJOZ0Zvcm1Nb2RlbC5uZ09uQ2hhbmdlcyIsIk5nRm9ybU1vZGVsLmZvcm1EaXJlY3RpdmUiLCJOZ0Zvcm1Nb2RlbC5jb250cm9sIiwiTmdGb3JtTW9kZWwucGF0aCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2wiLCJOZ0Zvcm1Nb2RlbC5nZXRDb250cm9sIiwiTmdGb3JtTW9kZWwucmVtb3ZlQ29udHJvbCIsIk5nRm9ybU1vZGVsLmFkZENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnJlbW92ZUNvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybU1vZGVsLnVwZGF0ZU1vZGVsIiwiTmdGb3JtTW9kZWwub25TdWJtaXQiLCJOZ0Zvcm1Nb2RlbC5fdXBkYXRlRG9tVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Usc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUscUJBQStGLGVBQWUsQ0FBQyxDQUFBO0FBRy9HLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBR3JELHVCQUF5RixVQUFVLENBQUMsQ0FBQTtBQUNwRywyQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFFN0UsSUFBTSxxQkFBcUIsR0FDdkIsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxvQ0FBZ0IsRUFBRSxFQUFDLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxXQUFX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ZUEsR0FBZkE7UUFBQWMsaUJBS0NBO1FBSkNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLEdBQUdBO1lBQ3pCQSxJQUFJQSxJQUFJQSxHQUFRQSxLQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN6Q0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBL0VIZDtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsZUFBZUE7WUFDekJBLFFBQVFBLEVBQUVBLENBQUNBLHFCQUFxQkEsQ0FBQ0E7WUFDakNBLE1BQU1BLEVBQUVBLENBQUNBLG1CQUFtQkEsQ0FBQ0E7WUFDN0JBLElBQUlBLEVBQUVBLEVBQUNBLFVBQVVBLEVBQUVBLFlBQVlBLEVBQUNBO1lBQ2hDQSxPQUFPQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUNyQkEsUUFBUUEsRUFBRUEsUUFBUUE7U0FDbkJBLENBQUNBO1FBUUlBLFdBQUNBLGVBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLGFBQU1BLENBQUNBLDBCQUFhQSxDQUFDQSxDQUFBQTtRQUMxQ0EsV0FBQ0EsZUFBUUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7UUFBQ0EsV0FBQ0EsYUFBTUEsQ0FBQ0EsZ0NBQW1CQSxDQUFDQSxDQUFBQTs7b0JBZ0VyREE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBaEZELEVBUWlDLG9DQUFnQixFQXdFaEQ7QUF4RVksbUJBQVcsY0F3RXZCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlciwgRXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7U2ltcGxlQ2hhbmdlLCBPbkNoYW5nZXMsIERpcmVjdGl2ZSwgZm9yd2FyZFJlZiwgUHJvdmlkZXIsIEluamVjdCwgT3B0aW9uYWwsIFNlbGZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge05nQ29udHJvbEdyb3VwfSBmcm9tICcuL25nX2NvbnRyb2xfZ3JvdXAnO1xuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Rm9ybX0gZnJvbSAnLi9mb3JtX2ludGVyZmFjZSc7XG5pbXBvcnQge0NvbnRyb2wsIENvbnRyb2xHcm91cH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybURpcmVjdGl2ZVByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdGb3JtTW9kZWwpfSkpO1xuXG4vKipcbiAqIEJpbmRzIGFuIGV4aXN0aW5nIGNvbnRyb2wgZ3JvdXAgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvanFyVmlydWRZOGFuSnhUTVVqVFA/cD1wcmV2aWV3KSlcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUsIHdlIGJpbmQgdGhlIGNvbnRyb2wgZ3JvdXAgdG8gdGhlIGZvcm0gZWxlbWVudCwgYW5kIHdlIGJpbmQgdGhlIGxvZ2luIGFuZFxuICogcGFzc3dvcmQgY29udHJvbHMgdG8gdGhlIGxvZ2luIGFuZCBwYXNzd29yZCBlbGVtZW50cy5cbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgyPk5nRm9ybU1vZGVsIEV4YW1wbGU8L2gyPlxuICogICAgICAgPGZvcm0gW25nRm9ybU1vZGVsXT1cImxvZ2luRm9ybVwiPlxuICogICAgICAgICA8cD5Mb2dpbjogPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmdDb250cm9sPVwibG9naW5cIj48L3A+XG4gKiAgICAgICAgIDxwPlBhc3N3b3JkOiA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmdDb250cm9sPVwicGFzc3dvcmRcIj48L3A+XG4gKiAgICAgICA8L2Zvcm0+XG4gKiAgICAgICA8cD5WYWx1ZTo8L3A+XG4gKiAgICAgICA8cHJlPnt7dmFsdWV9fTwvcHJlPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBsb2dpbkZvcm06IENvbnRyb2xHcm91cDtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubG9naW5Gb3JtID0gbmV3IENvbnRyb2xHcm91cCh7XG4gKiAgICAgICBsb2dpbjogbmV3IENvbnRyb2woXCJcIiksXG4gKiAgICAgICBwYXNzd29yZDogbmV3IENvbnRyb2woXCJcIilcbiAqICAgICB9KTtcbiAqICAgfVxuICpcbiAqICAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMubG9naW5Gb3JtLnZhbHVlLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogIGBgYFxuICpcbiAqIFdlIGNhbiBhbHNvIHVzZSBuZ01vZGVsIHRvIGJpbmQgYSBkb21haW4gbW9kZWwgdG8gdGhlIGZvcm0uXG4gKlxuICogIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICAgICBzZWxlY3RvcjogXCJsb2dpbi1jb21wXCIsXG4gKiAgICAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICAgICB0ZW1wbGF0ZTogYFxuICogICAgICAgIDxmb3JtIFtuZ0Zvcm1Nb2RlbF09J2xvZ2luRm9ybSc+XG4gKiAgICAgICAgICBMb2dpbiA8aW5wdXQgdHlwZT0ndGV4dCcgbmdDb250cm9sPSdsb2dpbicgWyhuZ01vZGVsKV09J2NyZWRlbnRpYWxzLmxvZ2luJz5cbiAqICAgICAgICAgIFBhc3N3b3JkIDxpbnB1dCB0eXBlPSdwYXNzd29yZCcgbmdDb250cm9sPSdwYXNzd29yZCdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBbKG5nTW9kZWwpXT0nY3JlZGVudGlhbHMucGFzc3dvcmQnPlxuICogICAgICAgICAgPGJ1dHRvbiAoY2xpY2spPVwib25Mb2dpbigpXCI+TG9naW48L2J1dHRvbj5cbiAqICAgICAgICA8L2Zvcm0+YFxuICogICAgICB9KVxuICogY2xhc3MgTG9naW5Db21wIHtcbiAqICBjcmVkZW50aWFsczoge2xvZ2luOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmd9O1xuICogIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgIHRoaXMubG9naW5Gb3JtID0gbmV3IENvbnRyb2xHcm91cCh7XG4gKiAgICAgIGxvZ2luOiBuZXcgQ29udHJvbChcIlwiKSxcbiAqICAgICAgcGFzc3dvcmQ6IG5ldyBDb250cm9sKFwiXCIpXG4gKiAgICB9KTtcbiAqICB9XG4gKlxuICogIG9uTG9naW4oKTogdm9pZCB7XG4gKiAgICAvLyB0aGlzLmNyZWRlbnRpYWxzLmxvZ2luID09PSAnc29tZSBsb2dpbidcbiAqICAgIC8vIHRoaXMuY3JlZGVudGlhbHMucGFzc3dvcmQgPT09ICdzb21lIHBhc3N3b3JkJ1xuICogIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nRm9ybU1vZGVsXScsXG4gIGJpbmRpbmdzOiBbZm9ybURpcmVjdGl2ZVByb3ZpZGVyXSxcbiAgaW5wdXRzOiBbJ2Zvcm06IG5nRm9ybU1vZGVsJ10sXG4gIGhvc3Q6IHsnKHN1Ym1pdCknOiAnb25TdWJtaXQoKSd9LFxuICBvdXRwdXRzOiBbJ25nU3VibWl0J10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0Zvcm1Nb2RlbCBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBGb3JtLFxuICAgIE9uQ2hhbmdlcyB7XG4gIGZvcm06IENvbnRyb2xHcm91cCA9IG51bGw7XG4gIGRpcmVjdGl2ZXM6IE5nQ29udHJvbFtdID0gW107XG4gIG5nU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHByaXZhdGUgX3ZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIHByaXZhdGUgX2FzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczoge1trZXk6IHN0cmluZ106IFNpbXBsZUNoYW5nZX0pOiB2b2lkIHtcbiAgICBpZiAoU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhjaGFuZ2VzLCAnZm9ybScpKSB7XG4gICAgICB2YXIgc3luYyA9IGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpO1xuICAgICAgdGhpcy5mb3JtLnZhbGlkYXRvciA9IFZhbGlkYXRvcnMuY29tcG9zZShbdGhpcy5mb3JtLnZhbGlkYXRvciwgc3luY10pO1xuXG4gICAgICB2YXIgYXN5bmMgPSBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX2FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICB0aGlzLmZvcm0uYXN5bmNWYWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2VBc3luYyhbdGhpcy5mb3JtLmFzeW5jVmFsaWRhdG9yLCBhc3luY10pO1xuXG4gICAgICB0aGlzLmZvcm0udXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7b25seVNlbGY6IHRydWUsIGVtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVEb21WYWx1ZSgpO1xuICB9XG5cbiAgZ2V0IGZvcm1EaXJlY3RpdmUoKTogRm9ybSB7IHJldHVybiB0aGlzOyB9XG5cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybTsgfVxuXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIFtdOyB9XG5cbiAgYWRkQ29udHJvbChkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICAgIHZhciBjdHJsOiBhbnkgPSB0aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gICAgc2V0VXBDb250cm9sKGN0cmwsIGRpcik7XG4gICAgY3RybC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goZGlyKTtcbiAgfVxuXG4gIGdldENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiBDb250cm9sIHsgcmV0dXJuIDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTsgfVxuXG4gIHJlbW92ZUNvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHsgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuZGlyZWN0aXZlcywgZGlyKTsgfVxuXG4gIGFkZENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKSB7XG4gICAgdmFyIGN0cmw6IGFueSA9IHRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBzZXRVcENvbnRyb2xHcm91cChjdHJsLCBkaXIpO1xuICAgIGN0cmwudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICB9XG5cbiAgcmVtb3ZlQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApIHt9XG5cbiAgZ2V0Q29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiBDb250cm9sR3JvdXAge1xuICAgIHJldHVybiA8Q29udHJvbEdyb3VwPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgfVxuXG4gIHVwZGF0ZU1vZGVsKGRpcjogTmdDb250cm9sLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdmFyIGN0cmzCoCA9IDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTtcbiAgICBjdHJsLnVwZGF0ZVZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIG9uU3VibWl0KCk6IGJvb2xlYW4ge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMubmdTdWJtaXQsIG51bGwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZURvbVZhbHVlKCkge1xuICAgIHRoaXMuZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgICB2YXIgY3RybDogYW55ID0gdGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgICAgZGlyLnZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZShjdHJsLnZhbHVlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19