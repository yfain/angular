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
import { Directive, Optional, Inject, Host, SkipSelf, forwardRef, Provider, Self } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { ControlContainer } from './control_container';
import { controlPath, composeValidators, composeAsyncValidators } from './shared';
import { NG_VALIDATORS, NG_ASYNC_VALIDATORS } from '../validators';
const controlGroupProvider = CONST_EXPR(new Provider(ControlContainer, { useExisting: forwardRef(() => NgControlGroup) }));
/**
 * Creates and binds a control group to a DOM element.
 *
 * This directive can only be used as a child of {@link NgForm} or {@link NgFormModel}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7EJ11uGeaggViYM6T5nq?p=preview))
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   directives: [FORM_DIRECTIVES],
 *   template: `
 *     <div>
 *       <h2>Angular2 Control &amp; ControlGroup Example</h2>
 *       <form #f="ngForm">
 *         <div ngControlGroup="name" #cg-name="form">
 *           <h3>Enter your name:</h3>
 *           <p>First: <input ngControl="first" required></p>
 *           <p>Middle: <input ngControl="middle"></p>
 *           <p>Last: <input ngControl="last" required></p>
 *         </div>
 *         <h3>Name value:</h3>
 *         <pre>{{valueOf(cgName)}}</pre>
 *         <p>Name is {{cgName?.control?.valid ? "valid" : "invalid"}}</p>
 *         <h3>What's your favorite food?</h3>
 *         <p><input ngControl="food"></p>
 *         <h3>Form value</h3>
 *         <pre>{{valueOf(f)}}</pre>
 *       </form>
 *     </div>
 *   `
 * })
 * export class App {
 *   valueOf(cg: NgControlGroup): string {
 *     if (cg.control == null) {
 *       return null;
 *     }
 *     return JSON.stringify(cg.control.value, null, 2);
 *   }
 * }
 * ```
 *
 * This example declares a control group for a user's name. The value and validation state of
 * this group can be accessed separately from the overall form.
 */
export let NgControlGroup = class extends ControlContainer {
    constructor(parent, _validators, _asyncValidators) {
        super();
        this._validators = _validators;
        this._asyncValidators = _asyncValidators;
        this._parent = parent;
    }
    ngOnInit() { this.formDirective.addControlGroup(this); }
    ngOnDestroy() { this.formDirective.removeControlGroup(this); }
    /**
     * Get the {@link ControlGroup} backing this binding.
     */
    get control() { return this.formDirective.getControlGroup(this); }
    /**
     * Get the path to this control group.
     */
    get path() { return controlPath(this.name, this._parent); }
    /**
     * Get the {@link Form} to which this group belongs.
     */
    get formDirective() { return this._parent.formDirective; }
    get validator() { return composeValidators(this._validators); }
    get asyncValidator() { return composeAsyncValidators(this._asyncValidators); }
};
NgControlGroup = __decorate([
    Directive({
        selector: '[ngControlGroup]',
        providers: [controlGroupProvider],
        inputs: ['name: ngControlGroup'],
        exportAs: 'ngForm'
    }),
    __param(0, Host()),
    __param(0, SkipSelf()),
    __param(1, Optional()),
    __param(1, Self()),
    __param(1, Inject(NG_VALIDATORS)),
    __param(2, Optional()),
    __param(2, Self()),
    __param(2, Inject(NG_ASYNC_VALIDATORS)), 
    __metadata('design:paramtypes', [ControlContainer, Array, Array])
], NgControlGroup);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5uZ09uSW5pdCIsIk5nQ29udHJvbEdyb3VwLm5nT25EZXN0cm95IiwiTmdDb250cm9sR3JvdXAuY29udHJvbCIsIk5nQ29udHJvbEdyb3VwLnBhdGgiLCJOZ0NvbnRyb2xHcm91cC5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sR3JvdXAudmFsaWRhdG9yIiwiTmdDb250cm9sR3JvdXAuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQW9CLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsTUFBTSxlQUFlO09BQ2pILEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BRTVDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxVQUFVO09BR3hFLEVBQUMsYUFBYSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZTtBQUdoRSxNQUFNLG9CQUFvQixHQUN0QixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sY0FBYyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFaEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNENHO0FBQ0gsMENBTW9DLGdCQUFnQjtJQUtsREEsWUFDd0JBLE1BQXdCQSxFQUNPQSxXQUFrQkEsRUFDWkEsZ0JBQXVCQTtRQUNsRkMsT0FBT0EsQ0FBQ0E7UUFGNkNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFPQTtRQUNaQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQU9BO1FBRWxGQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREQsUUFBUUEsS0FBV0UsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFOURGLFdBQVdBLEtBQVdHLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFcEVIOztPQUVHQTtJQUNIQSxJQUFJQSxPQUFPQSxLQUFtQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEZKOztPQUVHQTtJQUNIQSxJQUFJQSxJQUFJQSxLQUFlSyxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRUw7O09BRUdBO0lBQ0hBLElBQUlBLGFBQWFBLEtBQVdNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRWhFTixJQUFJQSxTQUFTQSxLQUFrQk8sTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1RVAsSUFBSUEsY0FBY0EsS0FBdUJRLE1BQU1BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNsR1IsQ0FBQ0E7QUF6Q0Q7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsa0JBQWtCO1FBQzVCLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ2pDLE1BQU0sRUFBRSxDQUFDLHNCQUFzQixDQUFDO1FBQ2hDLFFBQVEsRUFBRSxRQUFRO0tBQ25CLENBQUM7SUFPSSxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUNuQixXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFBQyxXQUFDLElBQUksRUFBRSxDQUFBO0lBQUMsV0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQTs7bUJBMkJyRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPbkluaXQsIE9uRGVzdHJveSwgRGlyZWN0aXZlLCBPcHRpb25hbCwgSW5qZWN0LCBIb3N0LCBTa2lwU2VsZiwgZm9yd2FyZFJlZiwgUHJvdmlkZXIsIFNlbGZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NvbnRyb2xDb250YWluZXJ9IGZyb20gJy4vY29udHJvbF9jb250YWluZXInO1xuaW1wb3J0IHtjb250cm9sUGF0aCwgY29tcG9zZVZhbGlkYXRvcnMsIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnN9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7Q29udHJvbEdyb3VwfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge0Zvcm19IGZyb20gJy4vZm9ybV9pbnRlcmZhY2UnO1xuaW1wb3J0IHtOR19WQUxJREFUT1JTLCBOR19BU1lOQ19WQUxJREFUT1JTfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGNvbnRyb2xHcm91cFByb3ZpZGVyID1cbiAgICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihDb250cm9sQ29udGFpbmVyLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmdDb250cm9sR3JvdXApfSkpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGJpbmRzIGEgY29udHJvbCBncm91cCB0byBhIERPTSBlbGVtZW50LlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGNhbiBvbmx5IGJlIHVzZWQgYXMgYSBjaGlsZCBvZiB7QGxpbmsgTmdGb3JtfSBvciB7QGxpbmsgTmdGb3JtTW9kZWx9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83RUoxMXVHZWFnZ1ZpWU02VDVucT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVNdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxkaXY+XG4gKiAgICAgICA8aDI+QW5ndWxhcjIgQ29udHJvbCAmYW1wOyBDb250cm9sR3JvdXAgRXhhbXBsZTwvaDI+XG4gKiAgICAgICA8Zm9ybSAjZj1cIm5nRm9ybVwiPlxuICogICAgICAgICA8ZGl2IG5nQ29udHJvbEdyb3VwPVwibmFtZVwiICNjZy1uYW1lPVwiZm9ybVwiPlxuICogICAgICAgICAgIDxoMz5FbnRlciB5b3VyIG5hbWU6PC9oMz5cbiAqICAgICAgICAgICA8cD5GaXJzdDogPGlucHV0IG5nQ29udHJvbD1cImZpcnN0XCIgcmVxdWlyZWQ+PC9wPlxuICogICAgICAgICAgIDxwPk1pZGRsZTogPGlucHV0IG5nQ29udHJvbD1cIm1pZGRsZVwiPjwvcD5cbiAqICAgICAgICAgICA8cD5MYXN0OiA8aW5wdXQgbmdDb250cm9sPVwibGFzdFwiIHJlcXVpcmVkPjwvcD5cbiAqICAgICAgICAgPC9kaXY+XG4gKiAgICAgICAgIDxoMz5OYW1lIHZhbHVlOjwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGNnTmFtZSl9fTwvcHJlPlxuICogICAgICAgICA8cD5OYW1lIGlzIHt7Y2dOYW1lPy5jb250cm9sPy52YWxpZCA/IFwidmFsaWRcIiA6IFwiaW52YWxpZFwifX08L3A+XG4gKiAgICAgICAgIDxoMz5XaGF0J3MgeW91ciBmYXZvcml0ZSBmb29kPzwvaDM+XG4gKiAgICAgICAgIDxwPjxpbnB1dCBuZ0NvbnRyb2w9XCJmb29kXCI+PC9wPlxuICogICAgICAgICA8aDM+Rm9ybSB2YWx1ZTwvaDM+XG4gKiAgICAgICAgIDxwcmU+e3t2YWx1ZU9mKGYpfX08L3ByZT5cbiAqICAgICAgIDwvZm9ybT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICB2YWx1ZU9mKGNnOiBOZ0NvbnRyb2xHcm91cCk6IHN0cmluZyB7XG4gKiAgICAgaWYgKGNnLmNvbnRyb2wgPT0gbnVsbCkge1xuICogICAgICAgcmV0dXJuIG51bGw7XG4gKiAgICAgfVxuICogICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjZy5jb250cm9sLnZhbHVlLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBleGFtcGxlIGRlY2xhcmVzIGEgY29udHJvbCBncm91cCBmb3IgYSB1c2VyJ3MgbmFtZS4gVGhlIHZhbHVlIGFuZCB2YWxpZGF0aW9uIHN0YXRlIG9mXG4gKiB0aGlzIGdyb3VwIGNhbiBiZSBhY2Nlc3NlZCBzZXBhcmF0ZWx5IGZyb20gdGhlIG92ZXJhbGwgZm9ybS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ29udHJvbEdyb3VwXScsXG4gIHByb3ZpZGVyczogW2NvbnRyb2xHcm91cFByb3ZpZGVyXSxcbiAgaW5wdXRzOiBbJ25hbWU6IG5nQ29udHJvbEdyb3VwJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xHcm91cCBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBPbkluaXQsXG4gICAgT25EZXN0cm95IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyZW50OiBDb250cm9sQ29udGFpbmVyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgQEhvc3QoKSBAU2tpcFNlbGYoKSBwYXJlbnQ6IENvbnRyb2xDb250YWluZXIsXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczogYW55W10sXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfQVNZTkNfVkFMSURBVE9SUykgcHJpdmF0ZSBfYXN5bmNWYWxpZGF0b3JzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZS5hZGRDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5mb3JtRGlyZWN0aXZlLnJlbW92ZUNvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHtAbGluayBDb250cm9sR3JvdXB9IGJhY2tpbmcgdGhpcyBiaW5kaW5nLlxuICAgKi9cbiAgZ2V0IGNvbnRyb2woKTogQ29udHJvbEdyb3VwIHsgcmV0dXJuIHRoaXMuZm9ybURpcmVjdGl2ZS5nZXRDb250cm9sR3JvdXAodGhpcyk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXRoIHRvIHRoaXMgY29udHJvbCBncm91cC5cbiAgICovXG4gIGdldCBwYXRoKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGNvbnRyb2xQYXRoKHRoaXMubmFtZSwgdGhpcy5fcGFyZW50KTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHtAbGluayBGb3JtfSB0byB3aGljaCB0aGlzIGdyb3VwIGJlbG9uZ3MuXG4gICAqL1xuICBnZXQgZm9ybURpcmVjdGl2ZSgpOiBGb3JtIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5mb3JtRGlyZWN0aXZlOyB9XG5cbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbiB7IHJldHVybiBjb21wb3NlVmFsaWRhdG9ycyh0aGlzLl92YWxpZGF0b3JzKTsgfVxuXG4gIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZuIHsgcmV0dXJuIGNvbXBvc2VBc3luY1ZhbGlkYXRvcnModGhpcy5fYXN5bmNWYWxpZGF0b3JzKTsgfVxufVxuIl19