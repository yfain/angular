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
import { Directive, ViewContainerRef, TemplateRef, ContentChildren, QueryList, Attribute, Input } from 'angular2/core';
import { isPresent, NumberWrapper } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { SwitchView } from './ng_switch';
const _CATEGORY_DEFAULT = 'other';
export class NgLocalization {
}
/**
 * `ngPlural` is an i18n directive that displays DOM sub-trees that match the switch expression
 * value, or failing that, DOM sub-trees that match the switch expression's pluralization category.
 *
 * To use this directive, you must provide an extension of `NgLocalization` that maps values to
 * category names. You then define a container element that sets the `[ngPlural]` attribute to a
 * switch expression.
 *    - Inner elements defined with an `[ngPluralCase]` attribute will display based on their
 * expression.
 *    - If `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 * matches the switch expression exactly.
 *    - Otherwise, the view will be treated as a "category match", and will only display if exact
 * value matches aren't found and the value maps to its category using the `getPluralCategory`
 * function provided.
 *
 * If no matching views are found for a switch expression, inner elements marked
 * `[ngPluralCase]="other"` will be displayed.
 *
 * ```typescript
 * class MyLocalization extends NgLocalization {
 *    getPluralCategory(value: any) {
 *       if(value < 5) {
 *          return 'few';
 *       }
 *    }
 * }
 *
 * @Component({
 *    selector: 'app',
 *    providers: [provide(NgLocalization, {useClass: MyLocalization})]
 * })
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngPlural]="value">
 *       <template ngPluralCase="=0">there is nothing</template>
 *       <template ngPluralCase="=1">there is one</template>
 *       <template ngPluralCase="few">there are a few</template>
 *       <template ngPluralCase="other">there is some number</template>
 *     </div>
 *   `,
 *   directives: [NgPlural, NgPluralCase]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * ```
 */
export let NgPluralCase = class {
    constructor(value, template, viewContainer) {
        this.value = value;
        this._view = new SwitchView(viewContainer, template);
    }
};
NgPluralCase = __decorate([
    Directive({ selector: '[ngPluralCase]' }),
    __param(0, Attribute('ngPluralCase')), 
    __metadata('design:paramtypes', [String, TemplateRef, ViewContainerRef])
], NgPluralCase);
export let NgPlural = class {
    constructor(_localization) {
        this._localization = _localization;
        this._caseViews = new Map();
        this.cases = null;
    }
    set ngPlural(value) {
        this._switchValue = value;
        this._updateView();
    }
    ngAfterContentInit() {
        this.cases.forEach((pluralCase) => {
            this._caseViews.set(this._formatValue(pluralCase), pluralCase._view);
        });
        this._updateView();
    }
    /** @internal */
    _updateView() {
        this._clearViews();
        var view = this._caseViews.get(this._switchValue);
        if (!isPresent(view))
            view = this._getCategoryView(this._switchValue);
        this._activateView(view);
    }
    /** @internal */
    _clearViews() {
        if (isPresent(this._activeView))
            this._activeView.destroy();
    }
    /** @internal */
    _activateView(view) {
        if (!isPresent(view))
            return;
        this._activeView = view;
        this._activeView.create();
    }
    /** @internal */
    _getCategoryView(value) {
        var category = this._localization.getPluralCategory(value);
        var categoryView = this._caseViews.get(category);
        return isPresent(categoryView) ? categoryView : this._caseViews.get(_CATEGORY_DEFAULT);
    }
    /** @internal */
    _isValueView(pluralCase) { return pluralCase.value[0] === '='; }
    /** @internal */
    _formatValue(pluralCase) {
        return this._isValueView(pluralCase) ? this._stripValue(pluralCase.value) : pluralCase.value;
    }
    /** @internal */
    _stripValue(value) { return NumberWrapper.parseInt(value.substring(1), 10); }
};
__decorate([
    ContentChildren(NgPluralCase), 
    __metadata('design:type', QueryList)
], NgPlural.prototype, "cases", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Number), 
    __metadata('design:paramtypes', [Number])
], NgPlural.prototype, "ngPlural", null);
NgPlural = __decorate([
    Directive({ selector: '[ngPlural]' }), 
    __metadata('design:paramtypes', [NgLocalization])
], NgPlural);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WdmlwQ0JVUC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6WyJOZ0xvY2FsaXphdGlvbiIsIk5nUGx1cmFsQ2FzZSIsIk5nUGx1cmFsQ2FzZS5jb25zdHJ1Y3RvciIsIk5nUGx1cmFsIiwiTmdQbHVyYWwuY29uc3RydWN0b3IiLCJOZ1BsdXJhbC5uZ1BsdXJhbCIsIk5nUGx1cmFsLm5nQWZ0ZXJDb250ZW50SW5pdCIsIk5nUGx1cmFsLl91cGRhdGVWaWV3IiwiTmdQbHVyYWwuX2NsZWFyVmlld3MiLCJOZ1BsdXJhbC5fYWN0aXZhdGVWaWV3IiwiTmdQbHVyYWwuX2dldENhdGVnb3J5VmlldyIsIk5nUGx1cmFsLl9pc1ZhbHVlVmlldyIsIk5nUGx1cmFsLl9mb3JtYXRWYWx1ZSIsIk5nUGx1cmFsLl9zdHJpcFZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQW9CLEtBQUssRUFBQyxNQUFNLGVBQWU7T0FDL0gsRUFBQyxTQUFTLEVBQUUsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO09BQzFELEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0NBQWdDO09BQzNDLEVBQUMsVUFBVSxFQUFDLE1BQU0sYUFBYTtBQUV0QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztBQUVsQztBQUF1RkEsQ0FBQ0E7QUFFeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNERztBQUVIO0lBSUVDLFlBQ3NDQSxLQUFhQSxFQUFFQSxRQUFxQkEsRUFDdEVBLGFBQStCQTtRQURHQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFR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QUFnQkE7SUFDaEJBLFlBQVlBLENBQUNBLFVBQXdCQSxJQUFhUSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2RlIsZ0JBQWdCQTtJQUNoQkEsWUFBWUEsQ0FBQ0EsVUFBd0JBO1FBQ25DUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUMvRkEsQ0FBQ0E7SUFFRFQsZ0JBQWdCQTtJQUNoQkEsV0FBV0EsQ0FBQ0EsS0FBYUEsSUFBWVUsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0ZWLENBQUNBO0FBeERDO0lBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQzs7R0FBQywyQkFBSyxVQUFpQztBQUlyRTtJQUFDLEtBQUssRUFBRTs7O0dBQ0osOEJBQVEsUUFHWDtBQWJIO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBQyxDQUFDOzthQTZEbkM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZiwgQ29udGVudENoaWxkcmVuLCBRdWVyeUxpc3QsIEF0dHJpYnV0ZSwgQWZ0ZXJDb250ZW50SW5pdCwgSW5wdXR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIE51bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7U3dpdGNoVmlld30gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuXG5jb25zdCBfQ0FURUdPUllfREVGQVVMVCA9ICdvdGhlcic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0xvY2FsaXphdGlvbiB7IGFic3RyYWN0IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnkpOiBzdHJpbmc7IH1cblxuLyoqXG4gKiBgbmdQbHVyYWxgIGlzIGFuIGkxOG4gZGlyZWN0aXZlIHRoYXQgZGlzcGxheXMgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUsIG9yIGZhaWxpbmcgdGhhdCwgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbidzIHBsdXJhbGl6YXRpb24gY2F0ZWdvcnkuXG4gKlxuICogVG8gdXNlIHRoaXMgZGlyZWN0aXZlLCB5b3UgbXVzdCBwcm92aWRlIGFuIGV4dGVuc2lvbiBvZiBgTmdMb2NhbGl6YXRpb25gIHRoYXQgbWFwcyB2YWx1ZXMgdG9cbiAqIGNhdGVnb3J5IG5hbWVzLiBZb3UgdGhlbiBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHNldHMgdGhlIGBbbmdQbHVyYWxdYCBhdHRyaWJ1dGUgdG8gYVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKiAgICAtIElubmVyIGVsZW1lbnRzIGRlZmluZWQgd2l0aCBhbiBgW25nUGx1cmFsQ2FzZV1gIGF0dHJpYnV0ZSB3aWxsIGRpc3BsYXkgYmFzZWQgb24gdGhlaXJcbiAqIGV4cHJlc3Npb24uXG4gKiAgICAtIElmIGBbbmdQbHVyYWxDYXNlXWAgaXMgc2V0IHRvIGEgdmFsdWUgc3RhcnRpbmcgd2l0aCBgPWAsIGl0IHdpbGwgb25seSBkaXNwbGF5IGlmIHRoZSB2YWx1ZVxuICogbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24gZXhhY3RseS5cbiAqICAgIC0gT3RoZXJ3aXNlLCB0aGUgdmlldyB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBcImNhdGVnb3J5IG1hdGNoXCIsIGFuZCB3aWxsIG9ubHkgZGlzcGxheSBpZiBleGFjdFxuICogdmFsdWUgbWF0Y2hlcyBhcmVuJ3QgZm91bmQgYW5kIHRoZSB2YWx1ZSBtYXBzIHRvIGl0cyBjYXRlZ29yeSB1c2luZyB0aGUgYGdldFBsdXJhbENhdGVnb3J5YFxuICogZnVuY3Rpb24gcHJvdmlkZWQuXG4gKlxuICogSWYgbm8gbWF0Y2hpbmcgdmlld3MgYXJlIGZvdW5kIGZvciBhIHN3aXRjaCBleHByZXNzaW9uLCBpbm5lciBlbGVtZW50cyBtYXJrZWRcbiAqIGBbbmdQbHVyYWxDYXNlXT1cIm90aGVyXCJgIHdpbGwgYmUgZGlzcGxheWVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15TG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICogICAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSkge1xuICogICAgICAgaWYodmFsdWUgPCA1KSB7XG4gKiAgICAgICAgICByZXR1cm4gJ2Zldyc7XG4gKiAgICAgICB9XG4gKiAgICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgICBwcm92aWRlcnM6IFtwcm92aWRlKE5nTG9jYWxpemF0aW9uLCB7dXNlQ2xhc3M6IE15TG9jYWxpemF0aW9ufSldXG4gKiB9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxwPlZhbHVlID0ge3t2YWx1ZX19PC9wPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cImluYygpXCI+SW5jcmVtZW50PC9idXR0b24+XG4gKlxuICogICAgIDxkaXYgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj50aGVyZSBpcyBub3RoaW5nPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MVwiPnRoZXJlIGlzIG9uZTwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiZmV3XCI+dGhlcmUgYXJlIGEgZmV3PC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPnRoZXJlIGlzIHNvbWUgbnVtYmVyPC90ZW1wbGF0ZT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nUGx1cmFsLCBOZ1BsdXJhbENhc2VdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlID0gJ2luaXQnO1xuICpcbiAqICAgaW5jKCkge1xuICogICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID09PSAnaW5pdCcgPyAwIDogdGhpcy52YWx1ZSArIDE7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBgYGBcbiAqL1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWxDYXNlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogU3dpdGNoVmlldztcbiAgY29uc3RydWN0b3IoXG4gICAgICBAQXR0cmlidXRlKCduZ1BsdXJhbENhc2UnKSBwdWJsaWMgdmFsdWU6IHN0cmluZywgdGVtcGxhdGU6IFRlbXBsYXRlUmVmLFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZSk7XG4gIH1cbn1cblxuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1BsdXJhbCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQge1xuICBwcml2YXRlIF9zd2l0Y2hWYWx1ZTogbnVtYmVyO1xuICBwcml2YXRlIF9hY3RpdmVWaWV3OiBTd2l0Y2hWaWV3O1xuICBwcml2YXRlIF9jYXNlVmlld3MgPSBuZXcgTWFwPGFueSwgU3dpdGNoVmlldz4oKTtcbiAgQENvbnRlbnRDaGlsZHJlbihOZ1BsdXJhbENhc2UpIGNhc2VzOiBRdWVyeUxpc3Q8TmdQbHVyYWxDYXNlPiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbikge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdQbHVyYWwodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX3N3aXRjaFZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlVmlldygpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuY2FzZXMuZm9yRWFjaCgocGx1cmFsQ2FzZTogTmdQbHVyYWxDYXNlKTogdm9pZCA9PiB7XG4gICAgICB0aGlzLl9jYXNlVmlld3Muc2V0KHRoaXMuX2Zvcm1hdFZhbHVlKHBsdXJhbENhc2UpLCBwbHVyYWxDYXNlLl92aWV3KTtcbiAgICB9KTtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91cGRhdGVWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFyVmlld3MoKTtcblxuICAgIHZhciB2aWV3OiBTd2l0Y2hWaWV3ID0gdGhpcy5fY2FzZVZpZXdzLmdldCh0aGlzLl9zd2l0Y2hWYWx1ZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQodmlldykpIHZpZXcgPSB0aGlzLl9nZXRDYXRlZ29yeVZpZXcodGhpcy5fc3dpdGNoVmFsdWUpO1xuXG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3KHZpZXcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xlYXJWaWV3cygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2FjdGl2ZVZpZXcpKSB0aGlzLl9hY3RpdmVWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FjdGl2YXRlVmlldyh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKCFpc1ByZXNlbnQodmlldykpIHJldHVybjtcbiAgICB0aGlzLl9hY3RpdmVWaWV3ID0gdmlldztcbiAgICB0aGlzLl9hY3RpdmVWaWV3LmNyZWF0ZSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0Q2F0ZWdvcnlWaWV3KHZhbHVlOiBudW1iZXIpOiBTd2l0Y2hWaWV3IHtcbiAgICB2YXIgY2F0ZWdvcnk6IHN0cmluZyA9IHRoaXMuX2xvY2FsaXphdGlvbi5nZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZSk7XG4gICAgdmFyIGNhdGVnb3J5VmlldzogU3dpdGNoVmlldyA9IHRoaXMuX2Nhc2VWaWV3cy5nZXQoY2F0ZWdvcnkpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoY2F0ZWdvcnlWaWV3KSA/IGNhdGVnb3J5VmlldyA6IHRoaXMuX2Nhc2VWaWV3cy5nZXQoX0NBVEVHT1JZX0RFRkFVTFQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNWYWx1ZVZpZXcocGx1cmFsQ2FzZTogTmdQbHVyYWxDYXNlKTogYm9vbGVhbiB7IHJldHVybiBwbHVyYWxDYXNlLnZhbHVlWzBdID09PSAnPSc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9mb3JtYXRWYWx1ZShwbHVyYWxDYXNlOiBOZ1BsdXJhbENhc2UpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9pc1ZhbHVlVmlldyhwbHVyYWxDYXNlKSA/IHRoaXMuX3N0cmlwVmFsdWUocGx1cmFsQ2FzZS52YWx1ZSkgOiBwbHVyYWxDYXNlLnZhbHVlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaXBWYWx1ZSh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHsgcmV0dXJuIE51bWJlcldyYXBwZXIucGFyc2VJbnQodmFsdWUuc3Vic3RyaW5nKDEpLCAxMCk7IH1cbn1cbiJdfQ==