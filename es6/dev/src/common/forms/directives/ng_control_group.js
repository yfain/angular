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
 * })
 * @View({
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
 *   `,
 *   directives: [FORM_DIRECTIVES]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9ncm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvZGlyZWN0aXZlcy9uZ19jb250cm9sX2dyb3VwLnRzIl0sIm5hbWVzIjpbIk5nQ29udHJvbEdyb3VwIiwiTmdDb250cm9sR3JvdXAuY29uc3RydWN0b3IiLCJOZ0NvbnRyb2xHcm91cC5uZ09uSW5pdCIsIk5nQ29udHJvbEdyb3VwLm5nT25EZXN0cm95IiwiTmdDb250cm9sR3JvdXAuY29udHJvbCIsIk5nQ29udHJvbEdyb3VwLnBhdGgiLCJOZ0NvbnRyb2xHcm91cC5mb3JtRGlyZWN0aXZlIiwiTmdDb250cm9sR3JvdXAudmFsaWRhdG9yIiwiTmdDb250cm9sR3JvdXAuYXN5bmNWYWxpZGF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBR0wsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sSUFBSSxFQUNKLFFBQVEsRUFDUixVQUFVLEVBQ1YsUUFBUSxFQUNSLElBQUksRUFDTCxNQUFNLGVBQWU7T0FDZixFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUU1QyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BQzdDLEVBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sVUFBVTtPQUd4RSxFQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGVBQWU7QUFHaEUsTUFBTSxvQkFBb0IsR0FDdEIsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWhHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStDRztBQUNILDBDQU1vQyxnQkFBZ0I7SUFLbERBLFlBQWdDQSxNQUF3QkEsRUFDT0EsV0FBa0JBLEVBQ1pBLGdCQUF1QkE7UUFDMUZDLE9BQU9BLENBQUNBO1FBRnFEQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBT0E7UUFDWkEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFPQTtRQUUxRkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsTUFBTUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRURELFFBQVFBLEtBQVdFLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTlERixXQUFXQSxLQUFXRyxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXBFSDs7T0FFR0E7SUFDSEEsSUFBSUEsT0FBT0EsS0FBbUJJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRWhGSjs7T0FFR0E7SUFDSEEsSUFBSUEsSUFBSUEsS0FBZUssTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckVMOztPQUVHQTtJQUNIQSxJQUFJQSxhQUFhQSxLQUFXTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRU4sSUFBSUEsU0FBU0EsS0FBa0JPLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFNUVQLElBQUlBLGNBQWNBLEtBQXVCUSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbEdSLENBQUNBO0FBeENEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGtCQUFrQjtRQUM1QixTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNqQyxNQUFNLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztRQUNoQyxRQUFRLEVBQUUsUUFBUTtLQUNuQixDQUFDO0lBTVksV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsUUFBUSxFQUFFLENBQUE7SUFDbkIsV0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUFDLFdBQUMsSUFBSSxFQUFFLENBQUE7SUFBQyxXQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMxQyxXQUFDLFFBQVEsRUFBRSxDQUFBO0lBQUMsV0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUFDLFdBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUE7O21CQTJCN0Q7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE9uSW5pdCxcbiAgT25EZXN0cm95LFxuICBEaXJlY3RpdmUsXG4gIE9wdGlvbmFsLFxuICBJbmplY3QsXG4gIEhvc3QsXG4gIFNraXBTZWxmLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgU2VsZlxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtDb250cm9sQ29udGFpbmVyfSBmcm9tICcuL2NvbnRyb2xfY29udGFpbmVyJztcbmltcG9ydCB7Y29udHJvbFBhdGgsIGNvbXBvc2VWYWxpZGF0b3JzLCBjb21wb3NlQXN5bmNWYWxpZGF0b3JzfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge0NvbnRyb2xHcm91cH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtGb3JtfSBmcm9tICcuL2Zvcm1faW50ZXJmYWNlJztcbmltcG9ydCB7TkdfVkFMSURBVE9SUywgTkdfQVNZTkNfVkFMSURBVE9SU30gZnJvbSAnLi4vdmFsaWRhdG9ycyc7XG5pbXBvcnQge0FzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvckZufSBmcm9tICcuL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBjb250cm9sR3JvdXBQcm92aWRlciA9XG4gICAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoQ29udHJvbENvbnRhaW5lciwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5nQ29udHJvbEdyb3VwKX0pKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuZCBiaW5kcyBhIGNvbnRyb2wgZ3JvdXAgdG8gYSBET00gZWxlbWVudC5cbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSBjYW4gb25seSBiZSB1c2VkIGFzIGEgY2hpbGQgb2Yge0BsaW5rIE5nRm9ybX0gb3Ige0BsaW5rIE5nRm9ybU1vZGVsfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN0VKMTF1R2VhZ2dWaVlNNlQ1bnE/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXSxcbiAqIH0pXG4gKiBAVmlldyh7XG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMj5Bbmd1bGFyMiBDb250cm9sICZhbXA7IENvbnRyb2xHcm91cCBFeGFtcGxlPC9oMj5cbiAqICAgICAgIDxmb3JtICNmPVwibmdGb3JtXCI+XG4gKiAgICAgICAgIDxkaXYgbmdDb250cm9sR3JvdXA9XCJuYW1lXCIgI2NnLW5hbWU9XCJmb3JtXCI+XG4gKiAgICAgICAgICAgPGgzPkVudGVyIHlvdXIgbmFtZTo8L2gzPlxuICogICAgICAgICAgIDxwPkZpcnN0OiA8aW5wdXQgbmdDb250cm9sPVwiZmlyc3RcIiByZXF1aXJlZD48L3A+XG4gKiAgICAgICAgICAgPHA+TWlkZGxlOiA8aW5wdXQgbmdDb250cm9sPVwibWlkZGxlXCI+PC9wPlxuICogICAgICAgICAgIDxwPkxhc3Q6IDxpbnB1dCBuZ0NvbnRyb2w9XCJsYXN0XCIgcmVxdWlyZWQ+PC9wPlxuICogICAgICAgICA8L2Rpdj5cbiAqICAgICAgICAgPGgzPk5hbWUgdmFsdWU6PC9oMz5cbiAqICAgICAgICAgPHByZT57e3ZhbHVlT2YoY2dOYW1lKX19PC9wcmU+XG4gKiAgICAgICAgIDxwPk5hbWUgaXMge3tjZ05hbWU/LmNvbnRyb2w/LnZhbGlkID8gXCJ2YWxpZFwiIDogXCJpbnZhbGlkXCJ9fTwvcD5cbiAqICAgICAgICAgPGgzPldoYXQncyB5b3VyIGZhdm9yaXRlIGZvb2Q/PC9oMz5cbiAqICAgICAgICAgPHA+PGlucHV0IG5nQ29udHJvbD1cImZvb2RcIj48L3A+XG4gKiAgICAgICAgIDxoMz5Gb3JtIHZhbHVlPC9oMz5cbiAqICAgICAgICAgPHByZT57e3ZhbHVlT2YoZil9fTwvcHJlPlxuICogICAgICAgPC9mb3JtPlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICB2YWx1ZU9mKGNnOiBOZ0NvbnRyb2xHcm91cCk6IHN0cmluZyB7XG4gKiAgICAgaWYgKGNnLmNvbnRyb2wgPT0gbnVsbCkge1xuICogICAgICAgcmV0dXJuIG51bGw7XG4gKiAgICAgfVxuICogICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjZy5jb250cm9sLnZhbHVlLCBudWxsLCAyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBleGFtcGxlIGRlY2xhcmVzIGEgY29udHJvbCBncm91cCBmb3IgYSB1c2VyJ3MgbmFtZS4gVGhlIHZhbHVlIGFuZCB2YWxpZGF0aW9uIHN0YXRlIG9mXG4gKiB0aGlzIGdyb3VwIGNhbiBiZSBhY2Nlc3NlZCBzZXBhcmF0ZWx5IGZyb20gdGhlIG92ZXJhbGwgZm9ybS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ29udHJvbEdyb3VwXScsXG4gIHByb3ZpZGVyczogW2NvbnRyb2xHcm91cFByb3ZpZGVyXSxcbiAgaW5wdXRzOiBbJ25hbWU6IG5nQ29udHJvbEdyb3VwJ10sXG4gIGV4cG9ydEFzOiAnbmdGb3JtJ1xufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xHcm91cCBleHRlbmRzIENvbnRyb2xDb250YWluZXIgaW1wbGVtZW50cyBPbkluaXQsXG4gICAgT25EZXN0cm95IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyZW50OiBDb250cm9sQ29udGFpbmVyO1xuXG4gIGNvbnN0cnVjdG9yKEBIb3N0KCkgQFNraXBTZWxmKCkgcGFyZW50OiBDb250cm9sQ29udGFpbmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgcHJpdmF0ZSBfdmFsaWRhdG9yczogYW55W10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19BU1lOQ19WQUxJREFUT1JTKSBwcml2YXRlIF9hc3luY1ZhbGlkYXRvcnM6IGFueVtdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHsgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLmZvcm1EaXJlY3RpdmUucmVtb3ZlQ29udHJvbEdyb3VwKHRoaXMpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIENvbnRyb2xHcm91cH0gYmFja2luZyB0aGlzIGJpbmRpbmcuXG4gICAqL1xuICBnZXQgY29udHJvbCgpOiBDb250cm9sR3JvdXAgeyByZXR1cm4gdGhpcy5mb3JtRGlyZWN0aXZlLmdldENvbnRyb2xHcm91cCh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggdG8gdGhpcyBjb250cm9sIGdyb3VwLlxuICAgKi9cbiAgZ2V0IHBhdGgoKTogc3RyaW5nW10geyByZXR1cm4gY29udHJvbFBhdGgodGhpcy5uYW1lLCB0aGlzLl9wYXJlbnQpOyB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUge0BsaW5rIEZvcm19IHRvIHdoaWNoIHRoaXMgZ3JvdXAgYmVsb25ncy5cbiAgICovXG4gIGdldCBmb3JtRGlyZWN0aXZlKCk6IEZvcm0geyByZXR1cm4gdGhpcy5fcGFyZW50LmZvcm1EaXJlY3RpdmU7IH1cblxuICBnZXQgdmFsaWRhdG9yKCk6IFZhbGlkYXRvckZuIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpOyB9XG5cbiAgZ2V0IGFzeW5jVmFsaWRhdG9yKCk6IEFzeW5jVmFsaWRhdG9yRm4geyByZXR1cm4gY29tcG9zZUFzeW5jVmFsaWRhdG9ycyh0aGlzLl9hc3luY1ZhbGlkYXRvcnMpOyB9XG59XG4iXX0=