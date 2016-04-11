import { OpaqueToken } from 'angular2/src/core/di';
import { CONST_EXPR } from 'angular2/src/facade/lang';
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
export const PLATFORM_DIRECTIVES = CONST_EXPR(new OpaqueToken('Platform Directives'));
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
export const PLATFORM_PIPES = CONST_EXPR(new OpaqueToken('Platform Pipes'));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczRFJsWEppLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQjtPQUN6QyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxhQUFhLG1CQUFtQixHQUFnQixVQUFVLENBQUMsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsYUFBYSxjQUFjLEdBQWdCLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogQSB0b2tlbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB3aGVuIGJvb3RzdHJhcGluZyBhbiBhcHBsaWNhdGlvbiB0byBtYWtlIGFuIGFycmF5IG9mIGRpcmVjdGl2ZXNcbiAqIGF2YWlsYWJsZSBpbiBldmVyeSBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtQTEFURk9STV9ESVJFQ1RJVkVTfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDwhLS0gY2FuIHVzZSBvdGhlciBkaXJlY3RpdmUgZXZlbiB0aG91Z2ggdGhlIGNvbXBvbmVudCBkb2VzIG5vdCBsaXN0IGl0IGluIGBkaXJlY3RpdmVzYCAtLT5cbiAqICAgICA8b3RoZXItZGlyZWN0aXZlPjwvb3RoZXItZGlyZWN0aXZlPlxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9ESVJFQ1RJVkVTLCB7dXNlVmFsdWU6IFtPdGhlckRpcmVjdGl2ZV0sIG11bHRpOnRydWV9KV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFURk9STV9ESVJFQ1RJVkVTOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdQbGF0Zm9ybSBEaXJlY3RpdmVzJykpO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgcHJvdmlkZWQgd2hlbiBib290c3RyYXBpbmcgYW4gYXBwbGljYXRpb24gdG8gbWFrZSBhbiBhcnJheSBvZiBwaXBlc1xuICogYXZhaWxhYmxlIGluIGV2ZXJ5IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge1BMQVRGT1JNX1BJUEVTfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7T3RoZXJQaXBlfSBmcm9tICcuL215UGlwZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICB7ezEyMyB8IG90aGVyLXBpcGV9fVxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9QSVBFUywge3VzZVZhbHVlOiBbT3RoZXJQaXBlXSwgbXVsdGk6dHJ1ZX0pXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX1BJUEVTOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdQbGF0Zm9ybSBQaXBlcycpKTtcbiJdfQ==