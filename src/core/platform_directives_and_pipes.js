'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
/**
 * A token that can be provided when bootstraping an application to make an array of directives
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_DIRECTIVES} from 'angular2/core';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     <!-- can use other directive even though the component does not list it in `directives` -->
 *     <other-directive></other-directive>
 *   `
 * })
 * export class MyComponent {
 *   ...
 * }
 *
 * bootstrap(MyComponent, [provide(PLATFORM_DIRECTIVES, {useValue: [OtherDirective], multi:true})]);
 * ```
 */
exports.PLATFORM_DIRECTIVES = lang_1.CONST_EXPR(new di_1.OpaqueToken('Platform Directives'));
/**
 * A token that can be provided when bootstraping an application to make an array of pipes
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_PIPES} from 'angular2/core';
 * import {OtherPipe} from './myPipe';
 *
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     {{123 | other-pipe}}
 *   `
 * })
 * export class MyComponent {
 *   ...
 * }
 *
 * bootstrap(MyComponent, [provide(PLATFORM_PIPES, {useValue: [OtherPipe], multi:true})]);
 * ```
 */
exports.PLATFORM_PIPES = lang_1.CONST_EXPR(new di_1.OpaqueToken('Platform Pipes'));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVB2T3VSanZ4LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtQkFBMEIsc0JBQXNCLENBQUMsQ0FBQTtBQUNqRCxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDVSwyQkFBbUIsR0FBZ0IsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ1Usc0JBQWMsR0FBZ0IsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgcHJvdmlkZWQgd2hlbiBib290c3RyYXBpbmcgYW4gYXBwbGljYXRpb24gdG8gbWFrZSBhbiBhcnJheSBvZiBkaXJlY3RpdmVzXG4gKiBhdmFpbGFibGUgaW4gZXZlcnkgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UExBVEZPUk1fRElSRUNUSVZFU30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8IS0tIGNhbiB1c2Ugb3RoZXIgZGlyZWN0aXZlIGV2ZW4gdGhvdWdoIHRoZSBjb21wb25lbnQgZG9lcyBub3QgbGlzdCBpdCBpbiBgZGlyZWN0aXZlc2AgLS0+XG4gKiAgICAgPG90aGVyLWRpcmVjdGl2ZT48L290aGVyLWRpcmVjdGl2ZT5cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChNeUNvbXBvbmVudCwgW3Byb3ZpZGUoUExBVEZPUk1fRElSRUNUSVZFUywge3VzZVZhbHVlOiBbT3RoZXJEaXJlY3RpdmVdLCBtdWx0aTp0cnVlfSldKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fRElSRUNUSVZFUzogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignUGxhdGZvcm0gRGlyZWN0aXZlcycpKTtcblxuLyoqXG4gKiBBIHRva2VuIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHdoZW4gYm9vdHN0cmFwaW5nIGFuIGFwcGxpY2F0aW9uIHRvIG1ha2UgYW4gYXJyYXkgb2YgcGlwZXNcbiAqIGF2YWlsYWJsZSBpbiBldmVyeSBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtQTEFURk9STV9QSVBFU30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge090aGVyUGlwZX0gZnJvbSAnLi9teVBpcGUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAge3sxMjMgfCBvdGhlci1waXBlfX1cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChNeUNvbXBvbmVudCwgW3Byb3ZpZGUoUExBVEZPUk1fUElQRVMsIHt1c2VWYWx1ZTogW090aGVyUGlwZV0sIG11bHRpOnRydWV9KV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFURk9STV9QSVBFUzogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignUGxhdGZvcm0gUGlwZXMnKSk7XG4iXX0=