import { CONST_EXPR } from 'angular2/src/facade/lang';
import { NgClass } from './ng_class';
import { NgFor } from './ng_for';
import { NgIf } from './ng_if';
import { NgStyle } from './ng_style';
import { NgSwitch, NgSwitchWhen, NgSwitchDefault } from './ng_switch';
import { NgPlural, NgPluralCase } from './ng_plural';
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
export const CORE_DIRECTIVES = CONST_EXPR([
    NgClass,
    NgFor,
    NgIf,
    NgStyle,
    NgSwitch,
    NgSwitchWhen,
    NgSwitchDefault,
    NgPlural,
    NgPluralCase
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZV9kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL2NvcmVfZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFVBQVUsRUFBTyxNQUFNLDBCQUEwQjtPQUNsRCxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVk7T0FDM0IsRUFBQyxLQUFLLEVBQUMsTUFBTSxVQUFVO09BQ3ZCLEVBQUMsSUFBSSxFQUFDLE1BQU0sU0FBUztPQUNyQixFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVk7T0FDM0IsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBQyxNQUFNLGFBQWE7T0FDNUQsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYTtBQUVsRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ0gsYUFBYSxlQUFlLEdBQVcsVUFBVSxDQUFDO0lBQ2hELE9BQU87SUFDUCxLQUFLO0lBQ0wsSUFBSTtJQUNKLE9BQU87SUFDUCxRQUFRO0lBQ1IsWUFBWTtJQUNaLGVBQWU7SUFDZixRQUFRO0lBQ1IsWUFBWTtDQUNiLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TmdDbGFzc30gZnJvbSAnLi9uZ19jbGFzcyc7XG5pbXBvcnQge05nRm9yfSBmcm9tICcuL25nX2Zvcic7XG5pbXBvcnQge05nSWZ9IGZyb20gJy4vbmdfaWYnO1xuaW1wb3J0IHtOZ1N0eWxlfSBmcm9tICcuL25nX3N0eWxlJztcbmltcG9ydCB7TmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0fSBmcm9tICcuL25nX3N3aXRjaCc7XG5pbXBvcnQge05nUGx1cmFsLCBOZ1BsdXJhbENhc2V9IGZyb20gJy4vbmdfcGx1cmFsJztcblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gb2YgQW5ndWxhciBjb3JlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgbGlrZWx5IHRvIGJlIHVzZWQgaW4gZWFjaCBhbmQgZXZlcnkgQW5ndWxhclxuICogYXBwbGljYXRpb24uXG4gKlxuICogVGhpcyBjb2xsZWN0aW9uIGNhbiBiZSB1c2VkIHRvIHF1aWNrbHkgZW51bWVyYXRlIGFsbCB0aGUgYnVpbHQtaW4gZGlyZWN0aXZlcyBpbiB0aGUgYGRpcmVjdGl2ZXNgXG4gKiBwcm9wZXJ0eSBvZiB0aGUgYEBWaWV3YCBhbm5vdGF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC95YWtHd3BDZFVrZzBxZnpYNW04Zz9wPXByZXZpZXcpKVxuICpcbiAqIEluc3RlYWQgb2Ygd3JpdGluZzpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge05nQ2xhc3MsIE5nSWYsIE5nRm9yLCBOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHR9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteUNvbXBvbmVudC5odG1sJyxcbiAqICAgZGlyZWN0aXZlczogW05nQ2xhc3MsIE5nSWYsIE5nRm9yLCBOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHQsIE90aGVyRGlyZWN0aXZlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKiBvbmUgY291bGQgaW1wb3J0IGFsbCB0aGUgY29yZSBkaXJlY3RpdmVzIGF0IG9uY2U6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtDT1JFX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteUNvbXBvbmVudC5odG1sJyxcbiAqICAgZGlyZWN0aXZlczogW0NPUkVfRElSRUNUSVZFUywgT3RoZXJEaXJlY3RpdmVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IENPUkVfRElSRUNUSVZFUzogVHlwZVtdID0gQ09OU1RfRVhQUihbXG4gIE5nQ2xhc3MsXG4gIE5nRm9yLFxuICBOZ0lmLFxuICBOZ1N0eWxlLFxuICBOZ1N3aXRjaCxcbiAgTmdTd2l0Y2hXaGVuLFxuICBOZ1N3aXRjaERlZmF1bHQsXG4gIE5nUGx1cmFsLFxuICBOZ1BsdXJhbENhc2Vcbl0pO1xuIl19