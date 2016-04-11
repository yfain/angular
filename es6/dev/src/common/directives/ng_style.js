var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { KeyValueDiffers, ElementRef, Directive, Renderer } from 'angular2/core';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
/**
 * The `NgStyle` directive changes styles based on a result of expression evaluation.
 *
 * An expression assigned to the `ngStyle` property must evaluate to an object and the
 * corresponding element styles are updated based on changes to this object. Style names to update
 * are taken from the object's keys, and values - from the corresponding object's values.
 *
 * ### Syntax
 *
 * - `<div [ngStyle]="{'font-style': style}"></div>`
 * - `<div [ngStyle]="styleExp"></div>` - here the `styleExp` must evaluate to an object
 *
 * ### Example ([live demo](http://plnkr.co/edit/YamGS6GkUh9GqWNQhCyM?p=preview)):
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgStyle} from 'angular2/common';
 *
 * @Component({
 *  selector: 'ngStyle-example',
 *  template: `
 *    <h1 [ngStyle]="{'font-style': style, 'font-size': size, 'font-weight': weight}">
 *      Change style of this text!
 *    </h1>
 *
 *    <hr>
 *
 *    <label>Italic: <input type="checkbox" (change)="changeStyle($event)"></label>
 *    <label>Bold: <input type="checkbox" (change)="changeWeight($event)"></label>
 *    <label>Size: <input type="text" [value]="size" (change)="size = $event.target.value"></label>
 *  `,
 *  directives: [NgStyle]
 * })
 * export class NgStyleExample {
 *    style = 'normal';
 *    weight = 'normal';
 *    size = '20px';
 *
 *    changeStyle($event: any) {
 *      this.style = $event.target.checked ? 'italic' : 'normal';
 *    }
 *
 *    changeWeight($event: any) {
 *      this.weight = $event.target.checked ? 'bold' : 'normal';
 *    }
 * }
 * ```
 *
 * In this example the `font-style`, `font-size` and `font-weight` styles will be updated
 * based on the `style` property's value changes.
 */
export let NgStyle = class {
    constructor(_differs, _ngEl, _renderer) {
        this._differs = _differs;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    set rawStyle(v) {
        this._rawStyle = v;
        if (isBlank(this._differ) && isPresent(v)) {
            this._differ = this._differs.find(this._rawStyle).create(null);
        }
    }
    ngDoCheck() {
        if (isPresent(this._differ)) {
            var changes = this._differ.diff(this._rawStyle);
            if (isPresent(changes)) {
                this._applyChanges(changes);
            }
        }
    }
    _applyChanges(changes) {
        changes.forEachAddedItem((record) => { this._setStyle(record.key, record.currentValue); });
        changes.forEachChangedItem((record) => { this._setStyle(record.key, record.currentValue); });
        changes.forEachRemovedItem((record) => { this._setStyle(record.key, null); });
    }
    _setStyle(name, val) {
        this._renderer.setElementStyle(this._ngEl.nativeElement, name, val);
    }
};
NgStyle = __decorate([
    Directive({ selector: '[ngStyle]', inputs: ['rawStyle: ngStyle'] }), 
    __metadata('design:paramtypes', [KeyValueDiffers, ElementRef, Renderer])
], NgStyle);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfc3R5bGUudHMiXSwibmFtZXMiOlsiTmdTdHlsZSIsIk5nU3R5bGUuY29uc3RydWN0b3IiLCJOZ1N0eWxlLnJhd1N0eWxlIiwiTmdTdHlsZS5uZ0RvQ2hlY2siLCJOZ1N0eWxlLl9hcHBseUNoYW5nZXMiLCJOZ1N0eWxlLl9zZXRTdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBMEIsZUFBZSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNoRyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQVEsTUFBTSwwQkFBMEI7QUFHbEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0g7SUFPRUEsWUFDWUEsUUFBeUJBLEVBQVVBLEtBQWlCQSxFQUFVQSxTQUFtQkE7UUFBakZDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWlCQTtRQUFVQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFZQTtRQUFVQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUVqR0QsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBMEJBO1FBQ3JDRSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pFQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERixTQUFTQTtRQUNQRyxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9ILGFBQWFBLENBQUNBLE9BQVlBO1FBQ2hDSSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQ3BCQSxDQUFDQSxNQUE0QkEsT0FBT0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUZBLE9BQU9BLENBQUNBLGtCQUFrQkEsQ0FDdEJBLENBQUNBLE1BQTRCQSxPQUFPQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1RkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUN0QkEsQ0FBQ0EsTUFBNEJBLE9BQU9BLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQy9FQSxDQUFDQTtJQUVPSixTQUFTQSxDQUFDQSxJQUFZQSxFQUFFQSxHQUFXQTtRQUN6Q0ssSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0FBQ0hMLENBQUNBO0FBdENEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUM7O1lBc0NqRTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEb0NoZWNrLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBFbGVtZW50UmVmLCBEaXJlY3RpdmUsIFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7S2V5VmFsdWVDaGFuZ2VSZWNvcmR9IGZyb20gJy4uLy4uL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9kaWZmZXJzL2RlZmF1bHRfa2V5dmFsdWVfZGlmZmVyJztcblxuLyoqXG4gKiBUaGUgYE5nU3R5bGVgIGRpcmVjdGl2ZSBjaGFuZ2VzIHN0eWxlcyBiYXNlZCBvbiBhIHJlc3VsdCBvZiBleHByZXNzaW9uIGV2YWx1YXRpb24uXG4gKlxuICogQW4gZXhwcmVzc2lvbiBhc3NpZ25lZCB0byB0aGUgYG5nU3R5bGVgIHByb3BlcnR5IG11c3QgZXZhbHVhdGUgdG8gYW4gb2JqZWN0IGFuZCB0aGVcbiAqIGNvcnJlc3BvbmRpbmcgZWxlbWVudCBzdHlsZXMgYXJlIHVwZGF0ZWQgYmFzZWQgb24gY2hhbmdlcyB0byB0aGlzIG9iamVjdC4gU3R5bGUgbmFtZXMgdG8gdXBkYXRlXG4gKiBhcmUgdGFrZW4gZnJvbSB0aGUgb2JqZWN0J3Mga2V5cywgYW5kIHZhbHVlcyAtIGZyb20gdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0J3MgdmFsdWVzLlxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8ZGl2IFtuZ1N0eWxlXT1cInsnZm9udC1zdHlsZSc6IHN0eWxlfVwiPjwvZGl2PmBcbiAqIC0gYDxkaXYgW25nU3R5bGVdPVwic3R5bGVFeHBcIj48L2Rpdj5gIC0gaGVyZSB0aGUgYHN0eWxlRXhwYCBtdXN0IGV2YWx1YXRlIHRvIGFuIG9iamVjdFxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYW1HUzZHa1VoOUdxV05RaEN5TT9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7TmdTdHlsZX0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ25nU3R5bGUtZXhhbXBsZScsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDxoMSBbbmdTdHlsZV09XCJ7J2ZvbnQtc3R5bGUnOiBzdHlsZSwgJ2ZvbnQtc2l6ZSc6IHNpemUsICdmb250LXdlaWdodCc6IHdlaWdodH1cIj5cbiAqICAgICAgQ2hhbmdlIHN0eWxlIG9mIHRoaXMgdGV4dCFcbiAqICAgIDwvaDE+XG4gKlxuICogICAgPGhyPlxuICpcbiAqICAgIDxsYWJlbD5JdGFsaWM6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAoY2hhbmdlKT1cImNoYW5nZVN0eWxlKCRldmVudClcIj48L2xhYmVsPlxuICogICAgPGxhYmVsPkJvbGQ6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAoY2hhbmdlKT1cImNoYW5nZVdlaWdodCgkZXZlbnQpXCI+PC9sYWJlbD5cbiAqICAgIDxsYWJlbD5TaXplOiA8aW5wdXQgdHlwZT1cInRleHRcIiBbdmFsdWVdPVwic2l6ZVwiIChjaGFuZ2UpPVwic2l6ZSA9ICRldmVudC50YXJnZXQudmFsdWVcIj48L2xhYmVsPlxuICogIGAsXG4gKiAgZGlyZWN0aXZlczogW05nU3R5bGVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE5nU3R5bGVFeGFtcGxlIHtcbiAqICAgIHN0eWxlID0gJ25vcm1hbCc7XG4gKiAgICB3ZWlnaHQgPSAnbm9ybWFsJztcbiAqICAgIHNpemUgPSAnMjBweCc7XG4gKlxuICogICAgY2hhbmdlU3R5bGUoJGV2ZW50OiBhbnkpIHtcbiAqICAgICAgdGhpcy5zdHlsZSA9ICRldmVudC50YXJnZXQuY2hlY2tlZCA/ICdpdGFsaWMnIDogJ25vcm1hbCc7XG4gKiAgICB9XG4gKlxuICogICAgY2hhbmdlV2VpZ2h0KCRldmVudDogYW55KSB7XG4gKiAgICAgIHRoaXMud2VpZ2h0ID0gJGV2ZW50LnRhcmdldC5jaGVja2VkID8gJ2JvbGQnIDogJ25vcm1hbCc7XG4gKiAgICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgdGhlIGBmb250LXN0eWxlYCwgYGZvbnQtc2l6ZWAgYW5kIGBmb250LXdlaWdodGAgc3R5bGVzIHdpbGwgYmUgdXBkYXRlZFxuICogYmFzZWQgb24gdGhlIGBzdHlsZWAgcHJvcGVydHkncyB2YWx1ZSBjaGFuZ2VzLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N0eWxlXScsIGlucHV0czogWydyYXdTdHlsZTogbmdTdHlsZSddfSlcbmV4cG9ydCBjbGFzcyBOZ1N0eWxlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jhd1N0eWxlOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlmZmVyOiBLZXlWYWx1ZURpZmZlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2RpZmZlcnM6IEtleVZhbHVlRGlmZmVycywgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7fVxuXG4gIHNldCByYXdTdHlsZSh2OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuX3Jhd1N0eWxlID0gdjtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9kaWZmZXIpICYmIGlzUHJlc2VudCh2KSkge1xuICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fZGlmZmVycy5maW5kKHRoaXMuX3Jhd1N0eWxlKS5jcmVhdGUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdTdHlsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKFxuICAgICAgICAocmVjb3JkOiBLZXlWYWx1ZUNoYW5nZVJlY29yZCkgPT4geyB0aGlzLl9zZXRTdHlsZShyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oXG4gICAgICAgIChyZWNvcmQ6IEtleVZhbHVlQ2hhbmdlUmVjb3JkKSA9PiB7IHRoaXMuX3NldFN0eWxlKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbShcbiAgICAgICAgKHJlY29yZDogS2V5VmFsdWVDaGFuZ2VSZWNvcmQpID0+IHsgdGhpcy5fc2V0U3R5bGUocmVjb3JkLmtleSwgbnVsbCk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2V0U3R5bGUobmFtZTogc3RyaW5nLCB2YWw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIG5hbWUsIHZhbCk7XG4gIH1cbn1cbiJdfQ==