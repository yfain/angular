var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isArray } from 'angular2/src/facade/lang';
import * as modelModule from './model';
/**
 * Creates a form object from a user-specified configuration.
 *
 * ### Example ([live demo](http://plnkr.co/edit/ENgZo8EuIECZNensZCVr?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   viewBindings: [FORM_BINDINGS]
 *   template: `
 *     <form [ngFormModel]="loginForm">
 *       <p>Login <input ngControl="login"></p>
 *       <div ngControlGroup="passwordRetry">
 *         <p>Password <input type="password" ngControl="password"></p>
 *         <p>Confirm password <input type="password" ngControl="passwordConfirmation"></p>
 *       </div>
 *     </form>
 *     <h3>Form value:</h3>
 *     <pre>{{value}}</pre>
 *   `,
 *   directives: [FORM_DIRECTIVES]
 * })
 * export class App {
 *   loginForm: ControlGroup;
 *
 *   constructor(builder: FormBuilder) {
 *     this.loginForm = builder.group({
 *       login: ["", Validators.required],
 *       passwordRetry: builder.group({
 *         password: ["", Validators.required],
 *         passwordConfirmation: ["", Validators.required, asyncValidator]
 *       })
 *     });
 *   }
 *
 *   get value(): string {
 *     return JSON.stringify(this.loginForm.value, null, 2);
 *   }
 * }
 * ```
 */
export let FormBuilder = class {
    /**
     * Construct a new {@link ControlGroup} with the given map of configuration.
     * Valid keys for the `extra` parameter map are `optionals` and `validator`.
     *
     * See the {@link ControlGroup} constructor for more details.
     */
    group(controlsConfig, extra = null) {
        var controls = this._reduceControls(controlsConfig);
        var optionals = (isPresent(extra) ? StringMapWrapper.get(extra, 'optionals') : null);
        var validator = isPresent(extra) ? StringMapWrapper.get(extra, 'validator') : null;
        var asyncValidator = isPresent(extra) ? StringMapWrapper.get(extra, 'asyncValidator') : null;
        return new modelModule.ControlGroup(controls, optionals, validator, asyncValidator);
    }
    /**
     * Construct a new {@link Control} with the given `value`,`validator`, and `asyncValidator`.
     */
    control(value, validator = null, asyncValidator = null) {
        return new modelModule.Control(value, validator, asyncValidator);
    }
    /**
     * Construct an array of {@link Control}s from the given `controlsConfig` array of
     * configuration, with the given optional `validator` and `asyncValidator`.
     */
    array(controlsConfig, validator = null, asyncValidator = null) {
        var controls = controlsConfig.map(c => this._createControl(c));
        return new modelModule.ControlArray(controls, validator, asyncValidator);
    }
    /** @internal */
    _reduceControls(controlsConfig) {
        var controls = {};
        StringMapWrapper.forEach(controlsConfig, (controlConfig, controlName) => {
            controls[controlName] = this._createControl(controlConfig);
        });
        return controls;
    }
    /** @internal */
    _createControl(controlConfig) {
        if (controlConfig instanceof modelModule.Control ||
            controlConfig instanceof modelModule.ControlGroup ||
            controlConfig instanceof modelModule.ControlArray) {
            return controlConfig;
        }
        else if (isArray(controlConfig)) {
            var value = controlConfig[0];
            var validator = controlConfig.length > 1 ? controlConfig[1] : null;
            var asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
            return this.control(value, validator, asyncValidator);
        }
        else {
            return this.control(controlConfig);
        }
    }
};
FormBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], FormBuilder);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WdmlwQ0JVUC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9mb3Jtcy9mb3JtX2J1aWxkZXIudHMiXSwibmFtZXMiOlsiRm9ybUJ1aWxkZXIiLCJGb3JtQnVpbGRlci5ncm91cCIsIkZvcm1CdWlsZGVyLmNvbnRyb2wiLCJGb3JtQnVpbGRlci5hcnJheSIsIkZvcm1CdWlsZGVyLl9yZWR1Y2VDb250cm9scyIsIkZvcm1CdWlsZGVyLl9jcmVhdGVDb250cm9sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQW1CLE1BQU0sMEJBQTBCO09BQ3RFLEtBQUssV0FBVyxNQUFNLFNBQVM7QUFJdEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Q0c7QUFDSDtJQUVFQTs7Ozs7T0FLR0E7SUFDSEEsS0FBS0EsQ0FBQ0EsY0FBb0NBLEVBQUVBLEtBQUtBLEdBQXlCQSxJQUFJQTtRQUU1RUMsSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQUlBLFNBQVNBLEdBQTZCQSxDQUN0Q0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN4RUEsSUFBSUEsU0FBU0EsR0FBZ0JBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsV0FBV0EsQ0FBQ0EsR0FBR0EsSUFB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LENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hMLENBQUNBO0FBaEVEO0lBQUMsVUFBVSxFQUFFOztnQkFnRVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNBcnJheSwgQ09OU1RfRVhQUiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCAqIGFzIG1vZGVsTW9kdWxlIGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JGbiwgQXN5bmNWYWxpZGF0b3JGbn0gZnJvbSAnLi9kaXJlY3RpdmVzL3ZhbGlkYXRvcnMnO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIGZvcm0gb2JqZWN0IGZyb20gYSB1c2VyLXNwZWNpZmllZCBjb25maWd1cmF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9FTmdabzhFdUlFQ1pOZW5zWkNWcj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIHZpZXdCaW5kaW5nczogW0ZPUk1fQklORElOR1NdXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGZvcm0gW25nRm9ybU1vZGVsXT1cImxvZ2luRm9ybVwiPlxuICogICAgICAgPHA+TG9naW4gPGlucHV0IG5nQ29udHJvbD1cImxvZ2luXCI+PC9wPlxuICogICAgICAgPGRpdiBuZ0NvbnRyb2xHcm91cD1cInBhc3N3b3JkUmV0cnlcIj5cbiAqICAgICAgICAgPHA+UGFzc3dvcmQgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5nQ29udHJvbD1cInBhc3N3b3JkXCI+PC9wPlxuICogICAgICAgICA8cD5Db25maXJtIHBhc3N3b3JkIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuZ0NvbnRyb2w9XCJwYXNzd29yZENvbmZpcm1hdGlvblwiPjwvcD5cbiAqICAgICAgIDwvZGl2PlxuICogICAgIDwvZm9ybT5cbiAqICAgICA8aDM+Rm9ybSB2YWx1ZTo8L2gzPlxuICogICAgIDxwcmU+e3t2YWx1ZX19PC9wcmU+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIGxvZ2luRm9ybTogQ29udHJvbEdyb3VwO1xuICpcbiAqICAgY29uc3RydWN0b3IoYnVpbGRlcjogRm9ybUJ1aWxkZXIpIHtcbiAqICAgICB0aGlzLmxvZ2luRm9ybSA9IGJ1aWxkZXIuZ3JvdXAoe1xuICogICAgICAgbG9naW46IFtcIlwiLCBWYWxpZGF0b3JzLnJlcXVpcmVkXSxcbiAqICAgICAgIHBhc3N3b3JkUmV0cnk6IGJ1aWxkZXIuZ3JvdXAoe1xuICogICAgICAgICBwYXNzd29yZDogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICogICAgICAgICBwYXNzd29yZENvbmZpcm1hdGlvbjogW1wiXCIsIFZhbGlkYXRvcnMucmVxdWlyZWQsIGFzeW5jVmFsaWRhdG9yXVxuICogICAgICAgfSlcbiAqICAgICB9KTtcbiAqICAgfVxuICpcbiAqICAgZ2V0IHZhbHVlKCk6IHN0cmluZyB7XG4gKiAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMubG9naW5Gb3JtLnZhbHVlLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGb3JtQnVpbGRlciB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcge0BsaW5rIENvbnRyb2xHcm91cH0gd2l0aCB0aGUgZ2l2ZW4gbWFwIG9mIGNvbmZpZ3VyYXRpb24uXG4gICAqIFZhbGlkIGtleXMgZm9yIHRoZSBgZXh0cmFgIHBhcmFtZXRlciBtYXAgYXJlIGBvcHRpb25hbHNgIGFuZCBgdmFsaWRhdG9yYC5cbiAgICpcbiAgICogU2VlIHRoZSB7QGxpbmsgQ29udHJvbEdyb3VwfSBjb25zdHJ1Y3RvciBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgZ3JvdXAoY29udHJvbHNDb25maWc6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBleHRyYToge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsKTpcbiAgICAgIG1vZGVsTW9kdWxlLkNvbnRyb2xHcm91cCB7XG4gICAgdmFyIGNvbnRyb2xzID0gdGhpcy5fcmVkdWNlQ29udHJvbHMoY29udHJvbHNDb25maWcpO1xuICAgIHZhciBvcHRpb25hbHMgPSA8e1trZXk6IHN0cmluZ106IGJvb2xlYW59PihcbiAgICAgICAgaXNQcmVzZW50KGV4dHJhKSA/IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGV4dHJhLCAnb3B0aW9uYWxzJykgOiBudWxsKTtcbiAgICB2YXIgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IGlzUHJlc2VudChleHRyYSkgPyBTdHJpbmdNYXBXcmFwcGVyLmdldChleHRyYSwgJ3ZhbGlkYXRvcicpIDogbnVsbDtcbiAgICB2YXIgYXN5bmNWYWxpZGF0b3I6IEFzeW5jVmFsaWRhdG9yRm4gPVxuICAgICAgICBpc1ByZXNlbnQoZXh0cmEpID8gU3RyaW5nTWFwV3JhcHBlci5nZXQoZXh0cmEsICdhc3luY1ZhbGlkYXRvcicpIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IG1vZGVsTW9kdWxlLkNvbnRyb2xHcm91cChjb250cm9scywgb3B0aW9uYWxzLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgfVxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHtAbGluayBDb250cm9sfSB3aXRoIHRoZSBnaXZlbiBgdmFsdWVgLGB2YWxpZGF0b3JgLCBhbmQgYGFzeW5jVmFsaWRhdG9yYC5cbiAgICovXG4gIGNvbnRyb2wodmFsdWU6IE9iamVjdCwgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGwsIGFzeW5jVmFsaWRhdG9yOiBBc3luY1ZhbGlkYXRvckZuID0gbnVsbCk6XG4gICAgICBtb2RlbE1vZHVsZS5Db250cm9sIHtcbiAgICByZXR1cm4gbmV3IG1vZGVsTW9kdWxlLkNvbnRyb2wodmFsdWUsIHZhbGlkYXRvciwgYXN5bmNWYWxpZGF0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhbiBhcnJheSBvZiB7QGxpbmsgQ29udHJvbH1zIGZyb20gdGhlIGdpdmVuIGBjb250cm9sc0NvbmZpZ2AgYXJyYXkgb2ZcbiAgICogY29uZmlndXJhdGlvbiwgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9uYWwgYHZhbGlkYXRvcmAgYW5kIGBhc3luY1ZhbGlkYXRvcmAuXG4gICAqL1xuICBhcnJheShcbiAgICAgIGNvbnRyb2xzQ29uZmlnOiBhbnlbXSwgdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IG51bGwsXG4gICAgICBhc3luY1ZhbGlkYXRvcjogQXN5bmNWYWxpZGF0b3JGbiA9IG51bGwpOiBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkge1xuICAgIHZhciBjb250cm9scyA9IGNvbnRyb2xzQ29uZmlnLm1hcChjID0+IHRoaXMuX2NyZWF0ZUNvbnRyb2woYykpO1xuICAgIHJldHVybiBuZXcgbW9kZWxNb2R1bGUuQ29udHJvbEFycmF5KGNvbnRyb2xzLCB2YWxpZGF0b3IsIGFzeW5jVmFsaWRhdG9yKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZHVjZUNvbnRyb2xzKGNvbnRyb2xzQ29uZmlnOiB7W2s6IHN0cmluZ106IGFueX0pOlxuICAgICAge1trZXk6IHN0cmluZ106IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbH0ge1xuICAgIHZhciBjb250cm9sczoge1trZXk6IHN0cmluZ106IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbH0gPSB7fTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goY29udHJvbHNDb25maWcsIChjb250cm9sQ29uZmlnOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnRyb2xzW2NvbnRyb2xOYW1lXSA9IHRoaXMuX2NyZWF0ZUNvbnRyb2woY29udHJvbENvbmZpZyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbnRyb2xzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlQ29udHJvbChjb250cm9sQ29uZmlnOiBhbnkpOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChjb250cm9sQ29uZmlnIGluc3RhbmNlb2YgbW9kZWxNb2R1bGUuQ29udHJvbCB8fFxuICAgICAgICBjb250cm9sQ29uZmlnIGluc3RhbmNlb2YgbW9kZWxNb2R1bGUuQ29udHJvbEdyb3VwIHx8XG4gICAgICAgIGNvbnRyb2xDb25maWcgaW5zdGFuY2VvZiBtb2RlbE1vZHVsZS5Db250cm9sQXJyYXkpIHtcbiAgICAgIHJldHVybiBjb250cm9sQ29uZmlnO1xuXG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRyb2xDb25maWcpKSB7XG4gICAgICB2YXIgdmFsdWUgPSBjb250cm9sQ29uZmlnWzBdO1xuICAgICAgdmFyIHZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSBjb250cm9sQ29uZmlnLmxlbmd0aCA+IDEgPyBjb250cm9sQ29uZmlnWzFdIDogbnVsbDtcbiAgICAgIHZhciBhc3luY1ZhbGlkYXRvcjogQXN5bmNWYWxpZGF0b3JGbiA9IGNvbnRyb2xDb25maWcubGVuZ3RoID4gMiA/IGNvbnRyb2xDb25maWdbMl0gOiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuY29udHJvbCh2YWx1ZSwgdmFsaWRhdG9yLCBhc3luY1ZhbGlkYXRvcik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29udHJvbChjb250cm9sQ29uZmlnKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==