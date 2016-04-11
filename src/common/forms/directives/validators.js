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
var lang_1 = require('angular2/src/facade/lang');
var validators_1 = require('../validators');
var lang_2 = require('angular2/src/facade/lang');
var REQUIRED = validators_1.Validators.required;
var REQUIRED_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useValue: REQUIRED, multi: true }));
/**
 * A Directive that adds the `required` validator to any controls marked with the
 * `required` attribute, via the {@link NG_VALIDATORS} binding.
 *
 * ### Example
 *
 * ```
 * <input ngControl="fullName" required>
 * ```
 */
var RequiredValidator = (function () {
    function RequiredValidator() {
    }
    RequiredValidator = __decorate([
        core_1.Directive({
            selector: '[required][ngControl],[required][ngFormControl],[required][ngModel]',
            providers: [REQUIRED_VALIDATOR]
        }), 
        __metadata('design:paramtypes', [])
    ], RequiredValidator);
    return RequiredValidator;
})();
exports.RequiredValidator = RequiredValidator;
/**
 * Provivder which adds {@link MinLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='min'}
 */
var MIN_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useExisting: core_1.forwardRef(function () { return MinLengthValidator; }), multi: true }));
/**
 * A directive which installs the {@link MinLengthValidator} for any `ngControl`,
 * `ngFormControl`, or control with `ngModel` that also has a `minlength` attribute.
 */
var MinLengthValidator = (function () {
    function MinLengthValidator(minLength) {
        this._validator = validators_1.Validators.minLength(lang_2.NumberWrapper.parseInt(minLength, 10));
    }
    MinLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MinLengthValidator = __decorate([
        core_1.Directive({
            selector: '[minlength][ngControl],[minlength][ngFormControl],[minlength][ngModel]',
            providers: [MIN_LENGTH_VALIDATOR]
        }),
        __param(0, core_1.Attribute('minlength')), 
        __metadata('design:paramtypes', [String])
    ], MinLengthValidator);
    return MinLengthValidator;
})();
exports.MinLengthValidator = MinLengthValidator;
/**
 * Provider which adds {@link MaxLengthValidator} to {@link NG_VALIDATORS}.
 *
 * ## Example:
 *
 * {@example common/forms/ts/validators/validators.ts region='max'}
 */
var MAX_LENGTH_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useExisting: core_1.forwardRef(function () { return MaxLengthValidator; }), multi: true }));
/**
 * A directive which installs the {@link MaxLengthValidator} for any `ngControl, `ngFormControl`,
 * or control with `ngModel` that also has a `maxlength` attribute.
 */
var MaxLengthValidator = (function () {
    function MaxLengthValidator(maxLength) {
        this._validator = validators_1.Validators.maxLength(lang_2.NumberWrapper.parseInt(maxLength, 10));
    }
    MaxLengthValidator.prototype.validate = function (c) { return this._validator(c); };
    MaxLengthValidator = __decorate([
        core_1.Directive({
            selector: '[maxlength][ngControl],[maxlength][ngFormControl],[maxlength][ngModel]',
            providers: [MAX_LENGTH_VALIDATOR]
        }),
        __param(0, core_1.Attribute('maxlength')), 
        __metadata('design:paramtypes', [String])
    ], MaxLengthValidator);
    return MaxLengthValidator;
})();
exports.MaxLengthValidator = MaxLengthValidator;
/**
 * A Directive that adds the `pattern` validator to any controls marked with the
 * `pattern` attribute, via the {@link NG_VALIDATORS} binding. Uses attribute value
 * as the regex to validate Control value against.  Follows pattern attribute
 * semantics; i.e. regex must match entire Control value.
 *
 * ### Example
 *
 * ```
 * <input [ngControl]="fullName" pattern="[a-zA-Z ]*">
 * ```
 */
var PATTERN_VALIDATOR = lang_1.CONST_EXPR(new core_1.Provider(validators_1.NG_VALIDATORS, { useExisting: core_1.forwardRef(function () { return PatternValidator; }), multi: true }));
var PatternValidator = (function () {
    function PatternValidator(pattern) {
        this._validator = validators_1.Validators.pattern(pattern);
    }
    PatternValidator.prototype.validate = function (c) { return this._validator(c); };
    PatternValidator = __decorate([
        core_1.Directive({
            selector: '[pattern][ngControl],[pattern][ngFormControl],[pattern][ngModel]',
            providers: [PATTERN_VALIDATOR]
        }),
        __param(0, core_1.Attribute('pattern')), 
        __metadata('design:paramtypes', [String])
    ], PatternValidator);
    return PatternValidator;
})();
exports.PatternValidator = PatternValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbIlJlcXVpcmVkVmFsaWRhdG9yIiwiUmVxdWlyZWRWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNaW5MZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiLCJNYXhMZW5ndGhWYWxpZGF0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IuY29uc3RydWN0b3IiLCJNYXhMZW5ndGhWYWxpZGF0b3IudmFsaWRhdGUiLCJQYXR0ZXJuVmFsaWRhdG9yIiwiUGF0dGVyblZhbGlkYXRvci5jb25zdHJ1Y3RvciIsIlBhdHRlcm5WYWxpZGF0b3IudmFsaWRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFCQUF5RCxlQUFlLENBQUMsQ0FBQTtBQUN6RSxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCwyQkFBd0MsZUFBZSxDQUFDLENBQUE7QUFHeEQscUJBQTRCLDBCQUEwQixDQUFDLENBQUE7QUF1QnZELElBQU0sUUFBUSxHQUFHLHVCQUFVLENBQUMsUUFBUSxDQUFDO0FBRXJDLElBQU0sa0JBQWtCLEdBQ3BCLGlCQUFVLENBQUMsSUFBSSxlQUFRLENBQUMsMEJBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUUvRTs7Ozs7Ozs7O0dBU0c7QUFDSDtJQUFBQTtJQUtBQyxDQUFDQTtJQUxERDtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEscUVBQXFFQTtZQUMvRUEsU0FBU0EsRUFBRUEsQ0FBQ0Esa0JBQWtC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QSxDQUFDQSxDQUFDQTtJQVhuRkY7UUFBQ0EsZ0JBQVNBLENBQUNBO1lBQ1RBLFFBQVFBLEVBQUVBLGtFQUFrRUE7WUFDNUVBLFNBQVNBLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7U0FDL0JBLENBQUNBO1FBSVlBLFdBQUNBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFBQTs7eUJBS2xDQTtJQUFEQSx1QkFBQ0E7QUFBREEsQ0FBQ0EsQUFaRCxJQVlDO0FBUlksd0JBQWdCLG1CQVE1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtmb3J3YXJkUmVmLCBQcm92aWRlciwgQXR0cmlidXRlLCBEaXJlY3RpdmV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtWYWxpZGF0b3JzLCBOR19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgKiBhcyBtb2RlbE1vZHVsZSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge051bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cblxuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGNhbiBiZSBpbXBsZW1lbnRlZCBieSBjbGFzc2VzIHRoYXQgY2FuIGFjdCBhcyB2YWxpZGF0b3JzLlxuICpcbiAqICMjIFVzYWdlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2N1c3RvbS12YWxpZGF0b3JdJyxcbiAqICAgcHJvdmlkZXJzOiBbcHJvdmlkZShOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IEN1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZSwgbXVsdGk6IHRydWV9KV1cbiAqIH0pXG4gKiBjbGFzcyBDdXN0b21WYWxpZGF0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICogICB2YWxpZGF0ZShjOiBDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICogICAgIHJldHVybiB7XCJjdXN0b21cIjogdHJ1ZX07XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRvciB7IHZhbGlkYXRlKGM6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9OyB9XG5cbmNvbnN0IFJFUVVJUkVEID0gVmFsaWRhdG9ycy5yZXF1aXJlZDtcblxuY29uc3QgUkVRVUlSRURfVkFMSURBVE9SID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlVmFsdWU6IFJFUVVJUkVELCBtdWx0aTogdHJ1ZX0pKTtcblxuLyoqXG4gKiBBIERpcmVjdGl2ZSB0aGF0IGFkZHMgdGhlIGByZXF1aXJlZGAgdmFsaWRhdG9yIHRvIGFueSBjb250cm9scyBtYXJrZWQgd2l0aCB0aGVcbiAqIGByZXF1aXJlZGAgYXR0cmlidXRlLCB2aWEgdGhlIHtAbGluayBOR19WQUxJREFUT1JTfSBiaW5kaW5nLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiA8aW5wdXQgbmdDb250cm9sPVwiZnVsbE5hbWVcIiByZXF1aXJlZD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcmVxdWlyZWRdW25nQ29udHJvbF0sW3JlcXVpcmVkXVtuZ0Zvcm1Db250cm9sXSxbcmVxdWlyZWRdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUkVRVUlSRURfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBSZXF1aXJlZFZhbGlkYXRvciB7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdG9yRm4geyAoYzogQWJzdHJhY3RDb250cm9sKToge1trZXk6IHN0cmluZ106IGFueX07IH1cbmV4cG9ydCBpbnRlcmZhY2UgQXN5bmNWYWxpZGF0b3JGbiB7XG4gIChjOiBBYnN0cmFjdENvbnRyb2wpOiBhbnkgLypQcm9taXNlPHtba2V5OiBzdHJpbmddOiBhbnl9PnxPYnNlcnZhYmxlPHtba2V5OiBzdHJpbmddOiBhbnl9PiovO1xufVxuXG4vKipcbiAqIFByb3ZpdmRlciB3aGljaCBhZGRzIHtAbGluayBNaW5MZW5ndGhWYWxpZGF0b3J9IHRvIHtAbGluayBOR19WQUxJREFUT1JTfS5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vZm9ybXMvdHMvdmFsaWRhdG9ycy92YWxpZGF0b3JzLnRzIHJlZ2lvbj0nbWluJ31cbiAqL1xuY29uc3QgTUlOX0xFTkdUSF9WQUxJREFUT1IgPSBDT05TVF9FWFBSKFxuICAgIG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWluTGVuZ3RoVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggaW5zdGFsbHMgdGhlIHtAbGluayBNaW5MZW5ndGhWYWxpZGF0b3J9IGZvciBhbnkgYG5nQ29udHJvbGAsXG4gKiBgbmdGb3JtQ29udHJvbGAsIG9yIGNvbnRyb2wgd2l0aCBgbmdNb2RlbGAgdGhhdCBhbHNvIGhhcyBhIGBtaW5sZW5ndGhgIGF0dHJpYnV0ZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21pbmxlbmd0aF1bbmdDb250cm9sXSxbbWlubGVuZ3RoXVtuZ0Zvcm1Db250cm9sXSxbbWlubGVuZ3RoXVtuZ01vZGVsXScsXG4gIHByb3ZpZGVyczogW01JTl9MRU5HVEhfVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBNaW5MZW5ndGhWYWxpZGF0b3IgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICBwcml2YXRlIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ21pbmxlbmd0aCcpIG1pbkxlbmd0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fdmFsaWRhdG9yID0gVmFsaWRhdG9ycy5taW5MZW5ndGgoTnVtYmVyV3JhcHBlci5wYXJzZUludChtaW5MZW5ndGgsIDEwKSk7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLl92YWxpZGF0b3IoYyk7IH1cbn1cblxuLyoqXG4gKiBQcm92aWRlciB3aGljaCBhZGRzIHtAbGluayBNYXhMZW5ndGhWYWxpZGF0b3J9IHRvIHtAbGluayBOR19WQUxJREFUT1JTfS5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vZm9ybXMvdHMvdmFsaWRhdG9ycy92YWxpZGF0b3JzLnRzIHJlZ2lvbj0nbWF4J31cbiAqL1xuY29uc3QgTUFYX0xFTkdUSF9WQUxJREFUT1IgPSBDT05TVF9FWFBSKFxuICAgIG5ldyBQcm92aWRlcihOR19WQUxJREFUT1JTLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF4TGVuZ3RoVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hpY2ggaW5zdGFsbHMgdGhlIHtAbGluayBNYXhMZW5ndGhWYWxpZGF0b3J9IGZvciBhbnkgYG5nQ29udHJvbCwgYG5nRm9ybUNvbnRyb2xgLFxuICogb3IgY29udHJvbCB3aXRoIGBuZ01vZGVsYCB0aGF0IGFsc28gaGFzIGEgYG1heGxlbmd0aGAgYXR0cmlidXRlLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbWF4bGVuZ3RoXVtuZ0NvbnRyb2xdLFttYXhsZW5ndGhdW25nRm9ybUNvbnRyb2xdLFttYXhsZW5ndGhdW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbTUFYX0xFTkdUSF9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIE1heExlbmd0aFZhbGlkYXRvciBpbXBsZW1lbnRzIFZhbGlkYXRvciB7XG4gIHByaXZhdGUgX3ZhbGlkYXRvcjogVmFsaWRhdG9yRm47XG5cbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgnbWF4bGVuZ3RoJykgbWF4TGVuZ3RoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLm1heExlbmd0aChOdW1iZXJXcmFwcGVyLnBhcnNlSW50KG1heExlbmd0aCwgMTApKTtcbiAgfVxuXG4gIHZhbGlkYXRlKGM6IEFic3RyYWN0Q29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHsgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvcihjKTsgfVxufVxuXG5cbi8qKlxuICogQSBEaXJlY3RpdmUgdGhhdCBhZGRzIHRoZSBgcGF0dGVybmAgdmFsaWRhdG9yIHRvIGFueSBjb250cm9scyBtYXJrZWQgd2l0aCB0aGVcbiAqIGBwYXR0ZXJuYCBhdHRyaWJ1dGUsIHZpYSB0aGUge0BsaW5rIE5HX1ZBTElEQVRPUlN9IGJpbmRpbmcuIFVzZXMgYXR0cmlidXRlIHZhbHVlXG4gKiBhcyB0aGUgcmVnZXggdG8gdmFsaWRhdGUgQ29udHJvbCB2YWx1ZSBhZ2FpbnN0LiAgRm9sbG93cyBwYXR0ZXJuIGF0dHJpYnV0ZVxuICogc2VtYW50aWNzOyBpLmUuIHJlZ2V4IG11c3QgbWF0Y2ggZW50aXJlIENvbnRyb2wgdmFsdWUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIDxpbnB1dCBbbmdDb250cm9sXT1cImZ1bGxOYW1lXCIgcGF0dGVybj1cIlthLXpBLVogXSpcIj5cbiAqIGBgYFxuICovXG5jb25zdCBQQVRURVJOX1ZBTElEQVRPUiA9IENPTlNUX0VYUFIoXG4gICAgbmV3IFByb3ZpZGVyKE5HX1ZBTElEQVRPUlMsIHt1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBQYXR0ZXJuVmFsaWRhdG9yKSwgbXVsdGk6IHRydWV9KSk7XG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcGF0dGVybl1bbmdDb250cm9sXSxbcGF0dGVybl1bbmdGb3JtQ29udHJvbF0sW3BhdHRlcm5dW25nTW9kZWxdJyxcbiAgcHJvdmlkZXJzOiBbUEFUVEVSTl9WQUxJREFUT1JdXG59KVxuZXhwb3J0IGNsYXNzIFBhdHRlcm5WYWxpZGF0b3IgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xuICBwcml2YXRlIF92YWxpZGF0b3I6IFZhbGlkYXRvckZuO1xuXG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ3BhdHRlcm4nKSBwYXR0ZXJuOiBzdHJpbmcpIHtcbiAgICB0aGlzLl92YWxpZGF0b3IgPSBWYWxpZGF0b3JzLnBhdHRlcm4ocGF0dGVybik7XG4gIH1cblxuICB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiB0aGlzLl92YWxpZGF0b3IoYyk7IH1cbn1cbiJdfQ==