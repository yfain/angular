'use strict';var lang_1 = require('angular2/src/facade/lang');
var ng_class_1 = require('./ng_class');
var ng_for_1 = require('./ng_for');
var ng_if_1 = require('./ng_if');
var ng_style_1 = require('./ng_style');
var ng_switch_1 = require('./ng_switch');
var ng_plural_1 = require('./ng_plural');
/**
 * A collection of Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `directives`
 * property of the `@View` annotation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yakGwpCdUkg0qfzX5m8g?p=preview))
 *
 * Instead of writing:
 *
 * ```typescript
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/common';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could import all the core directives at once:
 *
 * ```typescript
 * import {CORE_DIRECTIVES} from 'angular2/common';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [CORE_DIRECTIVES, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 */
exports.CORE_DIRECTIVES = lang_1.CONST_EXPR([
    ng_class_1.NgClass,
    ng_for_1.NgFor,
    ng_if_1.NgIf,
    ng_style_1.NgStyle,
    ng_switch_1.NgSwitch,
    ng_switch_1.NgSwitchWhen,
    ng_switch_1.NgSwitchDefault,
    ng_plural_1.NgPlural,
    ng_plural_1.NgPluralCase
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZV9kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL2NvcmVfZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxQkFBK0IsMEJBQTBCLENBQUMsQ0FBQTtBQUMxRCx5QkFBc0IsWUFBWSxDQUFDLENBQUE7QUFDbkMsdUJBQW9CLFVBQVUsQ0FBQyxDQUFBO0FBQy9CLHNCQUFtQixTQUFTLENBQUMsQ0FBQTtBQUM3Qix5QkFBc0IsWUFBWSxDQUFDLENBQUE7QUFDbkMsMEJBQXNELGFBQWEsQ0FBQyxDQUFBO0FBQ3BFLDBCQUFxQyxhQUFhLENBQUMsQ0FBQTtBQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ1UsdUJBQWUsR0FBVyxpQkFBVSxDQUFDO0lBQ2hELGtCQUFPO0lBQ1AsY0FBSztJQUNMLFlBQUk7SUFDSixrQkFBTztJQUNQLG9CQUFRO0lBQ1Isd0JBQVk7SUFDWiwyQkFBZTtJQUNmLG9CQUFRO0lBQ1Isd0JBQVk7Q0FDYixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge05nQ2xhc3N9IGZyb20gJy4vbmdfY2xhc3MnO1xuaW1wb3J0IHtOZ0Zvcn0gZnJvbSAnLi9uZ19mb3InO1xuaW1wb3J0IHtOZ0lmfSBmcm9tICcuL25nX2lmJztcbmltcG9ydCB7TmdTdHlsZX0gZnJvbSAnLi9uZ19zdHlsZSc7XG5pbXBvcnQge05nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdH0gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuaW1wb3J0IHtOZ1BsdXJhbCwgTmdQbHVyYWxDYXNlfSBmcm9tICcuL25nX3BsdXJhbCc7XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIEFuZ3VsYXIgY29yZSBkaXJlY3RpdmVzIHRoYXQgYXJlIGxpa2VseSB0byBiZSB1c2VkIGluIGVhY2ggYW5kIGV2ZXJ5IEFuZ3VsYXJcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoaXMgY29sbGVjdGlvbiBjYW4gYmUgdXNlZCB0byBxdWlja2x5IGVudW1lcmF0ZSBhbGwgdGhlIGJ1aWx0LWluIGRpcmVjdGl2ZXMgaW4gdGhlIGBkaXJlY3RpdmVzYFxuICogcHJvcGVydHkgb2YgdGhlIGBAVmlld2AgYW5ub3RhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQveWFrR3dwQ2RVa2cwcWZ6WDVtOGc/cD1wcmV2aWV3KSlcbiAqXG4gKiBJbnN0ZWFkIG9mIHdyaXRpbmc6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtOZ0NsYXNzLCBOZ0lmLCBOZ0ZvciwgTmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0fSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICogaW1wb3J0IHtPdGhlckRpcmVjdGl2ZX0gZnJvbSAnLi9teURpcmVjdGl2ZXMnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXlDb21wb25lbnQuaHRtbCcsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ0NsYXNzLCBOZ0lmLCBOZ0ZvciwgTmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0LCBPdGhlckRpcmVjdGl2ZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqIGBgYFxuICogb25lIGNvdWxkIGltcG9ydCBhbGwgdGhlIGNvcmUgZGlyZWN0aXZlcyBhdCBvbmNlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q09SRV9ESVJFQ1RJVkVTfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICogaW1wb3J0IHtPdGhlckRpcmVjdGl2ZX0gZnJvbSAnLi9teURpcmVjdGl2ZXMnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXlDb21wb25lbnQuaHRtbCcsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDT1JFX0RJUkVDVElWRVMsIE90aGVyRGlyZWN0aXZlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBDT1JFX0RJUkVDVElWRVM6IFR5cGVbXSA9IENPTlNUX0VYUFIoW1xuICBOZ0NsYXNzLFxuICBOZ0ZvcixcbiAgTmdJZixcbiAgTmdTdHlsZSxcbiAgTmdTd2l0Y2gsXG4gIE5nU3dpdGNoV2hlbixcbiAgTmdTd2l0Y2hEZWZhdWx0LFxuICBOZ1BsdXJhbCxcbiAgTmdQbHVyYWxDYXNlXG5dKTtcbiJdfQ==