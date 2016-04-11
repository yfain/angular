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
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var control_container_1 = require('./control_container');
var model_1 = require('../model');
var shared_1 = require('./shared');
var validators_1 = require('../validators');
var formDirectiveProvider = lang_1.CONST_EXPR(new core_1.Provider(control_container_1.ControlContainer, { useExisting: core_1.forwardRef(function () { return NgForm; }) }));
/**
 * If `NgForm` is bound in a component, `<form>` elements in that component will be
 * upgraded to use the Angular form system.
 *
 * ### Typical Use
 *
 * Include `FORM_DIRECTIVES` in the `directives` section of a {@link View} annotation
 * to use `NgForm` and its associated controls.
 *
 * ### Structure
 *
 * An Angular form is a collection of `Control`s in some hierarchy.
 * `Control`s can be at the top level or can be organized in `ControlGroup`s
 * or `ControlArray`s. This hierarchy is reflected in the form's `value`, a
 * JSON object that mirrors the form structure.
 *
 * ### Submission
 *
 * The `ngSubmit` event signals when the user triggers a form submission.
 *
 * ### Example ([live demo](http://plnkr.co/edit/ltdgYj4P0iY64AR71EpL?p=preview))
 *
 *  ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <p>Submit the form to see the data object Angular builds</p>
 *       <h2>NgForm demo</h2>
 *       <form #f="ngForm" (ngSubmit)="onSubmit(f.value)">
 *         <h3>Control group: credentials</h3>
 *         <div ngControlGroup="credentials">
 *           <p>Login: <input type="text" ngControl="login"></p>
 *           <p>Password: <input type="password" ngControl="password"></p>
 *         </div>
 *         <h3>Control group: person</h3>
 *         <div ngControlGroup="person">
 *           <p>First name: <input type="text" ngControl="firstName"></p>
 *           <p>Last name: <input type="text" ngControl="lastName"></p>
 *         </div>
 *         <button type="submit">Submit Form</button>
 *       <p>Form data submitted:</p>
 *       </form>
 *       <pre>{{data}}</pre>
 *     </div>
 * `,
 *   directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
 * })
 * export class App {
 *   constructor() {}
 *
 *   data: string;
 *
 *   onSubmit(data) {
 *     this.data = JSON.stringify(data, null, 2);
 *   }
 * }
 *  ```
 */
var NgForm = (function (_super) {
    __extends(NgForm, _super);
    function NgForm(validators, asyncValidators) {
        _super.call(this);
        this.ngSubmit = new async_1.EventEmitter();
        this.form = new model_1.ControlGroup({}, null, shared_1.composeValidators(validators), shared_1.composeAsyncValidators(asyncValidators));
    }
    Object.defineProperty(NgForm.prototype, "formDirective", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "control", {
        get: function () { return this.form; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgForm.prototype, "controls", {
        get: function () { return this.form.controls; },
        enumerable: true,
        configurable: true
    });
    NgForm.prototype.addControl = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            var ctrl = new model_1.Control();
            shared_1.setUpControl(ctrl, dir);
            container.addControl(dir.name, ctrl);
            ctrl.updateValueAndValidity({ emitEvent: false });
        });
    };
    NgForm.prototype.getControl = function (dir) { return this.form.find(dir.path); };
    NgForm.prototype.removeControl = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            if (lang_1.isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    };
    NgForm.prototype.addControlGroup = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            var group = new model_1.ControlGroup({});
            shared_1.setUpControlGroup(group, dir);
            container.addControl(dir.name, group);
            group.updateValueAndValidity({ emitEvent: false });
        });
    };
    NgForm.prototype.removeControlGroup = function (dir) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var container = _this._findContainer(dir.path);
            if (lang_1.isPresent(container)) {
                container.removeControl(dir.name);
                container.updateValueAndValidity({ emitEvent: false });
            }
        });
    };
    NgForm.prototype.getControlGroup = function (dir) {
        return this.form.find(dir.path);
    };
    NgForm.prototype.updateModel = function (dir, value) {
        var _this = this;
        async_1.PromiseWrapper.scheduleMicrotask(function () {
            var ctrl = _this.form.find(dir.path);
            ctrl.updateValue(value);
        });
    };
    NgForm.prototype.onSubmit = function () {
        async_1.ObservableWrapper.callEmit(this.ngSubmit, null);
        return false;
    };
    /** @internal */
    NgForm.prototype._findContainer = function (path) {
        path.pop();
        return collection_1.ListWrapper.isEmpty(path) ? this.form : this.form.find(path);
    };
    NgForm = __decorate([
        core_1.Directive({
            selector: 'form:not([ngNoForm]):not([ngFormModel]),ngForm,[ngForm]',
            bindings: [formDirectiveProvider],
            host: {
                '(submit)': 'onSubmit()',
            },
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
    ], NgForm);
    return NgForm;
})(control_container_1.ControlContainer);
exports.NgForm = NgForm;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19mb3JtLnRzIl0sIm5hbWVzIjpbIk5nRm9ybSIsIk5nRm9ybS5jb25zdHJ1Y3RvciIsIk5nRm9ybS5mb3JtRGlyZWN0aXZlIiwiTmdGb3JtLmNvbnRyb2wiLCJOZ0Zvcm0ucGF0aCIsIk5nRm9ybS5jb250cm9scyIsIk5nRm9ybS5hZGRDb250cm9sIiwiTmdGb3JtLmdldENvbnRyb2wiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbCIsIk5nRm9ybS5hZGRDb250cm9sR3JvdXAiLCJOZ0Zvcm0ucmVtb3ZlQ29udHJvbEdyb3VwIiwiTmdGb3JtLmdldENvbnRyb2xHcm91cCIsIk5nRm9ybS51cGRhdGVNb2RlbCIsIk5nRm9ybS5vblN1Ym1pdCIsIk5nRm9ybS5fZmluZENvbnRhaW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBZ0YsMkJBQTJCLENBQUMsQ0FBQTtBQUM1RywyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFBNkMsMEJBQTBCLENBQUMsQ0FBQTtBQUN4RSxxQkFBc0UsZUFBZSxDQUFDLENBQUE7QUFJdEYsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFDckQsc0JBQXFELFVBQVUsQ0FBQyxDQUFBO0FBQ2hFLHVCQUF5RixVQUFVLENBQUMsQ0FBQTtBQUNwRywyQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFFN0UsSUFBTSxxQkFBcUIsR0FDdkIsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxvQ0FBZ0IsRUFBRSxFQUFDLFdBQVcsRUFBRSxpQkFBVSxDQUFDLGNBQU0sT0FBQSxNQUFNLEVBQU4sQ0FBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUNBLENBQUFBO1FBQzFDQSxXQUFDQSxlQUFRQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTtRQUFDQSxXQUFDQSxhQUFNQSxDQUFDQSxnQ0FBbUJBLENBQUNBLENBQUFBOztlQTZFckRBO0lBQURBLGFBQUNBO0FBQURBLENBQUNBLEFBNUZELEVBUzRCLG9DQUFnQixFQW1GM0M7QUFuRlksY0FBTSxTQW1GbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyLCBFdmVudEVtaXR0ZXIsIFByb21pc2VDb21wbGV0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIFByb3ZpZGVyLCBPcHRpb25hbCwgSW5qZWN0LCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7TmdDb250cm9sR3JvdXB9IGZyb20gJy4vbmdfY29udHJvbF9ncm91cCc7XG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtBYnN0cmFjdENvbnRyb2wsIENvbnRyb2xHcm91cCwgQ29udHJvbH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtzZXRVcENvbnRyb2wsIHNldFVwQ29udHJvbEdyb3VwLCBjb21wb3NlVmFsaWRhdG9ycywgY29tcG9zZUFzeW5jVmFsaWRhdG9yc30gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcblxuY29uc3QgZm9ybURpcmVjdGl2ZVByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdGb3JtKX0pKTtcblxuLyoqXG4gKiBJZiBgTmdGb3JtYCBpcyBib3VuZCBpbiBhIGNvbXBvbmVudCwgYDxmb3JtPmAgZWxlbWVudHMgaW4gdGhhdCBjb21wb25lbnQgd2lsbCBiZVxuICogdXBncmFkZWQgdG8gdXNlIHRoZSBBbmd1bGFyIGZvcm0gc3lzdGVtLlxuICpcbiAqICMjIyBUeXBpY2FsIFVzZVxuICpcbiAqIEluY2x1ZGUgYEZPUk1fRElSRUNUSVZFU2AgaW4gdGhlIGBkaXJlY3RpdmVzYCBzZWN0aW9uIG9mIGEge0BsaW5rIFZpZXd9IGFubm90YXRpb25cbiAqIHRvIHVzZSBgTmdGb3JtYCBhbmQgaXRzIGFzc29jaWF0ZWQgY29udHJvbHMuXG4gKlxuICogIyMjIFN0cnVjdHVyZVxuICpcbiAqIEFuIEFuZ3VsYXIgZm9ybSBpcyBhIGNvbGxlY3Rpb24gb2YgYENvbnRyb2xgcyBpbiBzb21lIGhpZXJhcmNoeS5cbiAqIGBDb250cm9sYHMgY2FuIGJlIGF0IHRoZSB0b3AgbGV2ZWwgb3IgY2FuIGJlIG9yZ2FuaXplZCBpbiBgQ29udHJvbEdyb3VwYHNcbiAqIG9yIGBDb250cm9sQXJyYXlgcy4gVGhpcyBoaWVyYXJjaHkgaXMgcmVmbGVjdGVkIGluIHRoZSBmb3JtJ3MgYHZhbHVlYCwgYVxuICogSlNPTiBvYmplY3QgdGhhdCBtaXJyb3JzIHRoZSBmb3JtIHN0cnVjdHVyZS5cbiAqXG4gKiAjIyMgU3VibWlzc2lvblxuICpcbiAqIFRoZSBgbmdTdWJtaXRgIGV2ZW50IHNpZ25hbHMgd2hlbiB0aGUgdXNlciB0cmlnZ2VycyBhIGZvcm0gc3VibWlzc2lvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbHRkZ1lqNFAwaVk2NEFSNzFFcEw/cD1wcmV2aWV3KSlcbiAqXG4gKiAgYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPHA+U3VibWl0IHRoZSBmb3JtIHRvIHNlZSB0aGUgZGF0YSBvYmplY3QgQW5ndWxhciBidWlsZHM8L3A+XG4gKiAgICAgICA8aDI+TmdGb3JtIGRlbW88L2gyPlxuICogICAgICAgPGZvcm0gI2Y9XCJuZ0Zvcm1cIiAobmdTdWJtaXQpPVwib25TdWJtaXQoZi52YWx1ZSlcIj5cbiAqICAgICAgICAgPGgzPkNvbnRyb2wgZ3JvdXA6IGNyZWRlbnRpYWxzPC9oMz5cbiAqICAgICAgICAgPGRpdiBuZ0NvbnRyb2xHcm91cD1cImNyZWRlbnRpYWxzXCI+XG4gKiAgICAgICAgICAgPHA+TG9naW46IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nQ29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgICAgIDxwPlBhc3N3b3JkOiA8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgbmdDb250cm9sPVwicGFzc3dvcmRcIj48L3A+XG4gKiAgICAgICAgIDwvZGl2PlxuICogICAgICAgICA8aDM+Q29udHJvbCBncm91cDogcGVyc29uPC9oMz5cbiAqICAgICAgICAgPGRpdiBuZ0NvbnRyb2xHcm91cD1cInBlcnNvblwiPlxuICogICAgICAgICAgIDxwPkZpcnN0IG5hbWU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nQ29udHJvbD1cImZpcnN0TmFtZVwiPjwvcD5cbiAqICAgICAgICAgICA8cD5MYXN0IG5hbWU6IDxpbnB1dCB0eXBlPVwidGV4dFwiIG5nQ29udHJvbD1cImxhc3ROYW1lXCI+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCI+U3VibWl0IEZvcm08L2J1dHRvbj5cbiAqICAgICAgIDxwPkZvcm0gZGF0YSBzdWJtaXR0ZWQ6PC9wPlxuICogICAgICAgPC9mb3JtPlxuICogICAgICAgPHByZT57e2RhdGF9fTwvcHJlPlxuICogICAgIDwvZGl2PlxuICogYCxcbiAqICAgZGlyZWN0aXZlczogW0NPUkVfRElSRUNUSVZFUywgRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBjb25zdHJ1Y3RvcigpIHt9XG4gKlxuICogICBkYXRhOiBzdHJpbmc7XG4gKlxuICogICBvblN1Ym1pdChkYXRhKSB7XG4gKiAgICAgdGhpcy5kYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG4gKiAgIH1cbiAqIH1cbiAqICBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnZm9ybTpub3QoW25nTm9Gb3JtXSk6bm90KFtuZ0Zvcm1Nb2RlbF0pLG5nRm9ybSxbbmdGb3JtXScsXG4gIGJpbmRpbmdzOiBbZm9ybURpcmVjdGl2ZVByb3ZpZGVyXSxcbiAgaG9zdDoge1xuICAgICcoc3VibWl0KSc6ICdvblN1Ym1pdCgpJyxcbiAgfSxcbiAgb3V0cHV0czogWyduZ1N1Ym1pdCddLFxuICBleHBvcnRBczogJ25nRm9ybSdcbn0pXG5leHBvcnQgY2xhc3MgTmdGb3JtIGV4dGVuZHMgQ29udHJvbENvbnRhaW5lciBpbXBsZW1lbnRzIEZvcm0ge1xuICBmb3JtOiBDb250cm9sR3JvdXA7XG4gIG5nU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX1ZBTElEQVRPUlMpIHZhbGlkYXRvcnM6IGFueVtdLFxuICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIGFzeW5jVmFsaWRhdG9yczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZm9ybSA9IG5ldyBDb250cm9sR3JvdXAoXG4gICAgICAgIHt9LCBudWxsLCBjb21wb3NlVmFsaWRhdG9ycyh2YWxpZGF0b3JzKSwgY29tcG9zZUFzeW5jVmFsaWRhdG9ycyhhc3luY1ZhbGlkYXRvcnMpKTtcbiAgfVxuXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpczsgfVxuXG4gIGdldCBjb250cm9sKCk6IENvbnRyb2xHcm91cCB7IHJldHVybiB0aGlzLmZvcm07IH1cblxuICBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7IHJldHVybiBbXTsgfVxuXG4gIGdldCBjb250cm9scygpOiB7W2tleTogc3RyaW5nXTogQWJzdHJhY3RDb250cm9sfSB7IHJldHVybiB0aGlzLmZvcm0uY29udHJvbHM7IH1cblxuICBhZGRDb250cm9sKGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgdmFyIGN0cmwgPSBuZXcgQ29udHJvbCgpO1xuICAgICAgc2V0VXBDb250cm9sKGN0cmwsIGRpcik7XG4gICAgICBjb250YWluZXIuYWRkQ29udHJvbChkaXIubmFtZSwgY3RybCk7XG4gICAgICBjdHJsLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiBDb250cm9sIHsgcmV0dXJuIDxDb250cm9sPnRoaXMuZm9ybS5maW5kKGRpci5wYXRoKTsgfVxuXG4gIHJlbW92ZUNvbnRyb2woZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNvbnRhaW5lcikpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNvbnRyb2woZGlyLm5hbWUpO1xuICAgICAgICBjb250YWluZXIudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSh7ZW1pdEV2ZW50OiBmYWxzZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWRkQ29udHJvbEdyb3VwKGRpcjogTmdDb250cm9sR3JvdXApOiB2b2lkIHtcbiAgICBQcm9taXNlV3JhcHBlci5zY2hlZHVsZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5fZmluZENvbnRhaW5lcihkaXIucGF0aCk7XG4gICAgICB2YXIgZ3JvdXAgPSBuZXcgQ29udHJvbEdyb3VwKHt9KTtcbiAgICAgIHNldFVwQ29udHJvbEdyb3VwKGdyb3VwLCBkaXIpO1xuICAgICAgY29udGFpbmVyLmFkZENvbnRyb2woZGlyLm5hbWUsIGdyb3VwKTtcbiAgICAgIGdyb3VwLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogdm9pZCB7XG4gICAgUHJvbWlzZVdyYXBwZXIuc2NoZWR1bGVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2ZpbmRDb250YWluZXIoZGlyLnBhdGgpO1xuICAgICAgaWYgKGlzUHJlc2VudChjb250YWluZXIpKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDb250cm9sKGRpci5uYW1lKTtcbiAgICAgICAgY29udGFpbmVyLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoe2VtaXRFdmVudDogZmFsc2V9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbnRyb2xHcm91cChkaXI6IE5nQ29udHJvbEdyb3VwKTogQ29udHJvbEdyb3VwIHtcbiAgICByZXR1cm4gPENvbnRyb2xHcm91cD50aGlzLmZvcm0uZmluZChkaXIucGF0aCk7XG4gIH1cblxuICB1cGRhdGVNb2RlbChkaXI6IE5nQ29udHJvbCwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIFByb21pc2VXcmFwcGVyLnNjaGVkdWxlTWljcm90YXNrKCgpID0+IHtcbiAgICAgIHZhciBjdHJsID0gPENvbnRyb2w+dGhpcy5mb3JtLmZpbmQoZGlyLnBhdGgpO1xuICAgICAgY3RybC51cGRhdGVWYWx1ZSh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBvblN1Ym1pdCgpOiBib29sZWFuIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLm5nU3VibWl0LCBudWxsKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5kQ29udGFpbmVyKHBhdGg6IHN0cmluZ1tdKTogQ29udHJvbEdyb3VwIHtcbiAgICBwYXRoLnBvcCgpO1xuICAgIHJldHVybiBMaXN0V3JhcHBlci5pc0VtcHR5KHBhdGgpID8gdGhpcy5mb3JtIDogPENvbnRyb2xHcm91cD50aGlzLmZvcm0uZmluZChwYXRoKTtcbiAgfVxufVxuIl19