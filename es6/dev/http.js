import { provide } from 'angular2/core';
import { Http, Jsonp } from './src/http/http';
import { XHRBackend } from './src/http/backends/xhr_backend';
import { JSONPBackend, JSONPBackend_ } from './src/http/backends/jsonp_backend';
import { BrowserXhr } from './src/http/backends/browser_xhr';
import { BrowserJsonp } from './src/http/backends/browser_jsonp';
import { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
import { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { Request } from './src/http/static_request';
export { Response } from './src/http/static_response';
export { Connection, ConnectionBackend } from './src/http/interfaces';
export { BrowserXhr } from './src/http/backends/browser_xhr';
export { BaseRequestOptions, RequestOptions } from './src/http/base_request_options';
export { BaseResponseOptions, ResponseOptions } from './src/http/base_response_options';
export { XHRBackend, XHRConnection } from './src/http/backends/xhr_backend';
export { JSONPBackend, JSONPConnection } from './src/http/backends/jsonp_backend';
export { Http, Jsonp } from './src/http/http';
export { Headers } from './src/http/headers';
export { ResponseType, ReadyState, RequestMethod } from './src/http/enums';
export { URLSearchParams } from './src/http/url_search_params';
/**
 * Provides a basic set of injectables to use the {@link Http} service in any application.
 *
 * The `HTTP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/snj7Nv?p=preview))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {NgFor} from 'angular2/common';
 * import {HTTP_PROVIDERS, Http} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [HTTP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Object[];
 *   constructor(http:Http) {
 *     http.get('people.json').subscribe(res => {
 *       this.people = res.json();
 *     });
 *   }
 *   active:boolean = false;
 *   toggleActiveState() {
 *     this.active = !this.active;
 *   }
 * }
 *
 * bootstrap(App)
 *   .catch(err => console.error(err));
 * ```
 *
 * The primary public API included in `HTTP_PROVIDERS` is the {@link Http} class.
 * However, other providers required by `Http` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `HTTP_PROVIDERS` include:
 *  * {@link Http}
 *  * {@link XHRBackend}
 *  * `BrowserXHR` - Private factory to create `XMLHttpRequest` instances
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `HTTP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/aCMEXi?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {HTTP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link XHRBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7LWALD?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {HTTP_PROVIDERS, Http, Response, XHRBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 *
 * var injector = Injector.resolveAndCreate([
 *   HTTP_PROVIDERS,
 *   MockBackend,
 *   provide(XHRBackend, {useExisting: MockBackend})
 * ]);
 * var http = injector.get(Http);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   }
 * });
 *
 * http.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
 */
export const HTTP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Http, {
        useFactory: (xhrBackend, requestOptions) => new Http(xhrBackend, requestOptions),
        deps: [XHRBackend, RequestOptions]
    }),
    BrowserXhr, provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }), XHRBackend
];
/**
 * See {@link HTTP_PROVIDERS} instead.
 *
 * @deprecated
 */
export const HTTP_BINDINGS = HTTP_PROVIDERS;
/**
 * Provides a basic set of providers to use the {@link Jsonp} service in any application.
 *
 * The `JSONP_PROVIDERS` should be included either in a component's injector,
 * or in the root injector when bootstrapping an application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vmeN4F?p=preview))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgFor} from 'angular2/common';
 * import {JSONP_PROVIDERS, Jsonp} from 'angular2/http';
 *
 * @Component({
 *   selector: 'app',
 *   providers: [JSONP_PROVIDERS],
 *   template: `
 *     <div>
 *       <h1>People</h1>
 *       <ul>
 *         <li *ngFor="#person of people">
 *           {{person.name}}
 *         </li>
 *       </ul>
 *     </div>
 *   `,
 *   directives: [NgFor]
 * })
 * export class App {
 *   people: Array<Object>;
 *   constructor(jsonp:Jsonp) {
 *     jsonp.request('people.json').subscribe(res => {
 *       this.people = res.json();
 *     })
 *   }
 * }
 * ```
 *
 * The primary public API included in `JSONP_PROVIDERS` is the {@link Jsonp} class.
 * However, other providers required by `Jsonp` are included,
 * which may be beneficial to override in certain cases.
 *
 * The providers included in `JSONP_PROVIDERS` include:
 *  * {@link Jsonp}
 *  * {@link JSONPBackend}
 *  * `BrowserJsonp` - Private factory
 *  * {@link RequestOptions} - Bound to {@link BaseRequestOptions} class
 *  * {@link ResponseOptions} - Bound to {@link BaseResponseOptions} class
 *
 * There may be cases where it makes sense to extend the base request options,
 * such as to add a search string to be appended to all URLs.
 * To accomplish this, a new provider for {@link RequestOptions} should
 * be added in the same injector as `JSONP_PROVIDERS`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/TFug7x?p=preview))
 *
 * ```
 * import {provide} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {JSONP_PROVIDERS, BaseRequestOptions, RequestOptions} from 'angular2/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [JSONP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})])
 *   .catch(err => console.error(err));
 * ```
 *
 * Likewise, to use a mock backend for unit tests, the {@link JSONPBackend}
 * provider should be bound to {@link MockBackend}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/HDqZWL?p=preview))
 *
 * ```
 * import {provide, Injector} from 'angular2/core';
 * import {JSONP_PROVIDERS, Jsonp, Response, JSONPBackend} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 *
 * var people = [{name: 'Jeff'}, {name: 'Tobias'}];
 * var injector = Injector.resolveAndCreate([
 *   JSONP_PROVIDERS,
 *   MockBackend,
 *   provide(JSONPBackend, {useExisting: MockBackend})
 * ]);
 * var jsonp = injector.get(Jsonp);
 * var backend = injector.get(MockBackend);
 *
 * // Listen for any new requests
 * backend.connections.observer({
 *   next: connection => {
 *     var response = new Response({body: people});
 *     setTimeout(() => {
 *       // Send a response to the request
 *       connection.mockRespond(response);
 *     });
 *   }
 * });

 * jsonp.get('people.json').observer({
 *   next: res => {
 *     // Response came from mock backend
 *     console.log('first person', res.json()[0].name);
 *   }
 * });
 * ```
 */
export const JSONP_PROVIDERS = [
    // TODO(pascal): use factory type annotations once supported in DI
    // issue: https://github.com/angular/angular/issues/3183
    provide(Jsonp, {
        useFactory: (jsonpBackend, requestOptions) => new Jsonp(jsonpBackend, requestOptions),
        deps: [JSONPBackend, RequestOptions]
    }),
    BrowserJsonp, provide(RequestOptions, { useClass: BaseRequestOptions }),
    provide(ResponseOptions, { useClass: BaseResponseOptions }),
    provide(JSONPBackend, { useClass: JSONPBackend_ })
];
/**
 * See {@link JSONP_PROVIDERS} instead.
 *
 * @deprecated
 */
export const JSON_BINDINGS = JSONP_PROVIDERS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BTU8sRUFBQyxPQUFPLEVBQVcsTUFBTSxlQUFlO09BQ3hDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxNQUFNLGlCQUFpQjtPQUNwQyxFQUFDLFVBQVUsRUFBZ0IsTUFBTSxpQ0FBaUM7T0FDbEUsRUFBQyxZQUFZLEVBQUUsYUFBYSxFQUFrQixNQUFNLG1DQUFtQztPQUN2RixFQUFDLFVBQVUsRUFBQyxNQUFNLGlDQUFpQztPQUNuRCxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQztPQUN2RCxFQUFDLGtCQUFrQixFQUFFLGNBQWMsRUFBQyxNQUFNLGlDQUFpQztPQUUzRSxFQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBQyxNQUFNLGtDQUFrQztBQUNyRixTQUFRLE9BQU8sUUFBTywyQkFBMkIsQ0FBQztBQUNsRCxTQUFRLFFBQVEsUUFBTyw0QkFBNEIsQ0FBQztBQUVwRCxTQUFpRCxVQUFVLEVBQUUsaUJBQWlCLFFBQU8sdUJBQXVCLENBQUM7QUFFN0csU0FBUSxVQUFVLFFBQU8saUNBQWlDLENBQUM7QUFDM0QsU0FBUSxrQkFBa0IsRUFBRSxjQUFjLFFBQU8saUNBQWlDLENBQUM7QUFDbkYsU0FBUSxtQkFBbUIsRUFBRSxlQUFlLFFBQU8sa0NBQWtDLENBQUM7QUFDdEYsU0FBUSxVQUFVLEVBQUUsYUFBYSxRQUFPLGlDQUFpQyxDQUFDO0FBQzFFLFNBQVEsWUFBWSxFQUFFLGVBQWUsUUFBTyxtQ0FBbUMsQ0FBQztBQUNoRixTQUFRLElBQUksRUFBRSxLQUFLLFFBQU8saUJBQWlCLENBQUM7QUFFNUMsU0FBUSxPQUFPLFFBQU8sb0JBQW9CLENBQUM7QUFFM0MsU0FBUSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsUUFBTyxrQkFBa0IsQ0FBQztBQUN6RSxTQUFRLGVBQWUsUUFBTyw4QkFBOEIsQ0FBQztBQUU3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvSEc7QUFDSCxhQUFhLGNBQWMsR0FBVTtJQUNuQyxrRUFBa0U7SUFDbEUsd0RBQXdEO0lBQ3hELE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDWixVQUFVLEVBQUUsQ0FBQyxVQUFzQixFQUFFLGNBQThCLEtBQ25ELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUM7UUFDcEQsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztLQUNuQyxDQUFDO0lBQ0YsVUFBVSxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztJQUNuRSxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFDLENBQUMsRUFBRSxVQUFVO0NBQ3RFLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsYUFBYSxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEdHO0FBQ0gsYUFBYSxlQUFlLEdBQVU7SUFDcEMsa0VBQWtFO0lBQ2xFLHdEQUF3RDtJQUN4RCxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2IsVUFBVSxFQUFFLENBQUMsWUFBMEIsRUFBRSxjQUE4QixLQUN2RCxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDO1FBQ3ZELElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7S0FDckMsQ0FBQztJQUNGLFlBQVksRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7SUFDckUsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBQyxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7Q0FDakQsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxhQUFhLGFBQWEsR0FBRyxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGh0dHAgbW9kdWxlIHByb3ZpZGVzIHNlcnZpY2VzIHRvIHBlcmZvcm0gaHR0cCByZXF1ZXN0cy4gVG8gZ2V0IHN0YXJ0ZWQsIHNlZSB0aGUge0BsaW5rIEh0dHB9XG4gKiBjbGFzcy5cbiAqL1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0h0dHAsIEpzb25wfSBmcm9tICcuL3NyYy9odHRwL2h0dHAnO1xuaW1wb3J0IHtYSFJCYWNrZW5kLCBYSFJDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL3hocl9iYWNrZW5kJztcbmltcG9ydCB7SlNPTlBCYWNrZW5kLCBKU09OUEJhY2tlbmRfLCBKU09OUENvbm5lY3Rpb259IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvanNvbnBfYmFja2VuZCc7XG5pbXBvcnQge0Jyb3dzZXJYaHJ9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl94aHInO1xuaW1wb3J0IHtCcm93c2VySnNvbnB9IGZyb20gJy4vc3JjL2h0dHAvYmFja2VuZHMvYnJvd3Nlcl9qc29ucCc7XG5pbXBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuaW1wb3J0IHtDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi9zcmMvaHR0cC9pbnRlcmZhY2VzJztcbmltcG9ydCB7QmFzZVJlc3BvbnNlT3B0aW9ucywgUmVzcG9uc2VPcHRpb25zfSBmcm9tICcuL3NyYy9odHRwL2Jhc2VfcmVzcG9uc2Vfb3B0aW9ucyc7XG5leHBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3JjL2h0dHAvc3RhdGljX3JlcXVlc3QnO1xuZXhwb3J0IHtSZXNwb25zZX0gZnJvbSAnLi9zcmMvaHR0cC9zdGF0aWNfcmVzcG9uc2UnO1xuXG5leHBvcnQge1JlcXVlc3RPcHRpb25zQXJncywgUmVzcG9uc2VPcHRpb25zQXJncywgQ29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4vc3JjL2h0dHAvaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB7QnJvd3Nlclhocn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX3hocic7XG5leHBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuZXhwb3J0IHtCYXNlUmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZU9wdGlvbnN9IGZyb20gJy4vc3JjL2h0dHAvYmFzZV9yZXNwb25zZV9vcHRpb25zJztcbmV4cG9ydCB7WEhSQmFja2VuZCwgWEhSQ29ubmVjdGlvbn0gZnJvbSAnLi9zcmMvaHR0cC9iYWNrZW5kcy94aHJfYmFja2VuZCc7XG5leHBvcnQge0pTT05QQmFja2VuZCwgSlNPTlBDb25uZWN0aW9ufSBmcm9tICcuL3NyYy9odHRwL2JhY2tlbmRzL2pzb25wX2JhY2tlbmQnO1xuZXhwb3J0IHtIdHRwLCBKc29ucH0gZnJvbSAnLi9zcmMvaHR0cC9odHRwJztcblxuZXhwb3J0IHtIZWFkZXJzfSBmcm9tICcuL3NyYy9odHRwL2hlYWRlcnMnO1xuXG5leHBvcnQge1Jlc3BvbnNlVHlwZSwgUmVhZHlTdGF0ZSwgUmVxdWVzdE1ldGhvZH0gZnJvbSAnLi9zcmMvaHR0cC9lbnVtcyc7XG5leHBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi9zcmMvaHR0cC91cmxfc2VhcmNoX3BhcmFtcyc7XG5cbi8qKlxuICogUHJvdmlkZXMgYSBiYXNpYyBzZXQgb2YgaW5qZWN0YWJsZXMgdG8gdXNlIHRoZSB7QGxpbmsgSHR0cH0gc2VydmljZSBpbiBhbnkgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBIVFRQX1BST1ZJREVSU2Agc2hvdWxkIGJlIGluY2x1ZGVkIGVpdGhlciBpbiBhIGNvbXBvbmVudCdzIGluamVjdG9yLFxuICogb3IgaW4gdGhlIHJvb3QgaW5qZWN0b3Igd2hlbiBib290c3RyYXBwaW5nIGFuIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zbmo3TnY/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7TmdGb3J9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKiBpbXBvcnQge0hUVFBfUFJPVklERVJTLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICBwcm92aWRlcnM6IFtIVFRQX1BST1ZJREVSU10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdj5cbiAqICAgICAgIDxoMT5QZW9wbGU8L2gxPlxuICogICAgICAgPHVsPlxuICogICAgICAgICA8bGkgKm5nRm9yPVwiI3BlcnNvbiBvZiBwZW9wbGVcIj5cbiAqICAgICAgICAgICB7e3BlcnNvbi5uYW1lfX1cbiAqICAgICAgICAgPC9saT5cbiAqICAgICAgIDwvdWw+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ0Zvcl1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgcGVvcGxlOiBPYmplY3RbXTtcbiAqICAgY29uc3RydWN0b3IoaHR0cDpIdHRwKSB7XG4gKiAgICAgaHR0cC5nZXQoJ3Blb3BsZS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiB7XG4gKiAgICAgICB0aGlzLnBlb3BsZSA9IHJlcy5qc29uKCk7XG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqICAgYWN0aXZlOmJvb2xlYW4gPSBmYWxzZTtcbiAqICAgdG9nZ2xlQWN0aXZlU3RhdGUoKSB7XG4gKiAgICAgdGhpcy5hY3RpdmUgPSAhdGhpcy5hY3RpdmU7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKVxuICogICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJpbWFyeSBwdWJsaWMgQVBJIGluY2x1ZGVkIGluIGBIVFRQX1BST1ZJREVSU2AgaXMgdGhlIHtAbGluayBIdHRwfSBjbGFzcy5cbiAqIEhvd2V2ZXIsIG90aGVyIHByb3ZpZGVycyByZXF1aXJlZCBieSBgSHR0cGAgYXJlIGluY2x1ZGVkLFxuICogd2hpY2ggbWF5IGJlIGJlbmVmaWNpYWwgdG8gb3ZlcnJpZGUgaW4gY2VydGFpbiBjYXNlcy5cbiAqXG4gKiBUaGUgcHJvdmlkZXJzIGluY2x1ZGVkIGluIGBIVFRQX1BST1ZJREVSU2AgaW5jbHVkZTpcbiAqICAqIHtAbGluayBIdHRwfVxuICogICoge0BsaW5rIFhIUkJhY2tlbmR9XG4gKiAgKiBgQnJvd3NlclhIUmAgLSBQcml2YXRlIGZhY3RvcnkgdG8gY3JlYXRlIGBYTUxIdHRwUmVxdWVzdGAgaW5zdGFuY2VzXG4gKiAgKiB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9IC0gQm91bmQgdG8ge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc30gY2xhc3NcbiAqICAqIHtAbGluayBSZXNwb25zZU9wdGlvbnN9IC0gQm91bmQgdG8ge0BsaW5rIEJhc2VSZXNwb25zZU9wdGlvbnN9IGNsYXNzXG4gKlxuICogVGhlcmUgbWF5IGJlIGNhc2VzIHdoZXJlIGl0IG1ha2VzIHNlbnNlIHRvIGV4dGVuZCB0aGUgYmFzZSByZXF1ZXN0IG9wdGlvbnMsXG4gKiBzdWNoIGFzIHRvIGFkZCBhIHNlYXJjaCBzdHJpbmcgdG8gYmUgYXBwZW5kZWQgdG8gYWxsIFVSTHMuXG4gKiBUbyBhY2NvbXBsaXNoIHRoaXMsIGEgbmV3IHByb3ZpZGVyIGZvciB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9IHNob3VsZFxuICogYmUgYWRkZWQgaW4gdGhlIHNhbWUgaW5qZWN0b3IgYXMgYEhUVFBfUFJPVklERVJTYC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYUNNRVhpP3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtIVFRQX1BST1ZJREVSUywgQmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlcXVlc3RPcHRpb25zIHtcbiAqICAgc2VhcmNoOiBzdHJpbmcgPSAnY29yZVRlYW09dHJ1ZSc7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCwgW0hUVFBfUFJPVklERVJTLCBwcm92aWRlKFJlcXVlc3RPcHRpb25zLCB7dXNlQ2xhc3M6IE15T3B0aW9uc30pXSlcbiAqICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKlxuICogTGlrZXdpc2UsIHRvIHVzZSBhIG1vY2sgYmFja2VuZCBmb3IgdW5pdCB0ZXN0cywgdGhlIHtAbGluayBYSFJCYWNrZW5kfVxuICogcHJvdmlkZXIgc2hvdWxkIGJlIGJvdW5kIHRvIHtAbGluayBNb2NrQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0LzdMV0FMRD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7SFRUUF9QUk9WSURFUlMsIEh0dHAsIFJlc3BvbnNlLCBYSFJCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKlxuICogdmFyIHBlb3BsZSA9IFt7bmFtZTogJ0plZmYnfSwge25hbWU6ICdUb2JpYXMnfV07XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIEhUVFBfUFJPVklERVJTLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShYSFJCYWNrZW5kLCB7dXNlRXhpc3Rpbmc6IE1vY2tCYWNrZW5kfSlcbiAqIF0pO1xuICogdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gKiB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKlxuICogLy8gTGlzdGVuIGZvciBhbnkgbmV3IHJlcXVlc3RzXG4gKiBiYWNrZW5kLmNvbm5lY3Rpb25zLm9ic2VydmVyKHtcbiAqICAgbmV4dDogY29ubmVjdGlvbiA9PiB7XG4gKiAgICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKHtib2R5OiBwZW9wbGV9KTtcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgIC8vIFNlbmQgYSByZXNwb25zZSB0byB0aGUgcmVxdWVzdFxuICogICAgICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChyZXNwb25zZSk7XG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqIH0pO1xuICpcbiAqIGh0dHAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtcbiAqICAgbmV4dDogcmVzID0+IHtcbiAqICAgICAvLyBSZXNwb25zZSBjYW1lIGZyb20gbW9jayBiYWNrZW5kXG4gKiAgICAgY29uc29sZS5sb2coJ2ZpcnN0IHBlcnNvbicsIHJlcy5qc29uKClbMF0ubmFtZSk7XG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX1BST1ZJREVSUzogYW55W10gPSBbXG4gIC8vIFRPRE8ocGFzY2FsKTogdXNlIGZhY3RvcnkgdHlwZSBhbm5vdGF0aW9ucyBvbmNlIHN1cHBvcnRlZCBpbiBESVxuICAvLyBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzE4M1xuICBwcm92aWRlKEh0dHAsIHtcbiAgICB1c2VGYWN0b3J5OiAoeGhyQmFja2VuZDogWEhSQmFja2VuZCwgcmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSA9PlxuICAgICAgICAgICAgICAgICAgICBuZXcgSHR0cCh4aHJCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucyksXG4gICAgZGVwczogW1hIUkJhY2tlbmQsIFJlcXVlc3RPcHRpb25zXVxuICB9KSxcbiAgQnJvd3NlclhociwgcHJvdmlkZShSZXF1ZXN0T3B0aW9ucywge3VzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9KSxcbiAgcHJvdmlkZShSZXNwb25zZU9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlc3BvbnNlT3B0aW9uc30pLCBYSFJCYWNrZW5kXG5dO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgSFRUUF9QUk9WSURFUlN9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfQklORElOR1MgPSBIVFRQX1BST1ZJREVSUztcblxuLyoqXG4gKiBQcm92aWRlcyBhIGJhc2ljIHNldCBvZiBwcm92aWRlcnMgdG8gdXNlIHRoZSB7QGxpbmsgSnNvbnB9IHNlcnZpY2UgaW4gYW55IGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgSlNPTlBfUFJPVklERVJTYCBzaG91bGQgYmUgaW5jbHVkZWQgZWl0aGVyIGluIGEgY29tcG9uZW50J3MgaW5qZWN0b3IsXG4gKiBvciBpbiB0aGUgcm9vdCBpbmplY3RvciB3aGVuIGJvb3RzdHJhcHBpbmcgYW4gYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3ZtZU40Rj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtOZ0Zvcn0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7SlNPTlBfUFJPVklERVJTLCBKc29ucH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgcHJvdmlkZXJzOiBbSlNPTlBfUFJPVklERVJTXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGgxPlBlb3BsZTwvaDE+XG4gKiAgICAgICA8dWw+XG4gKiAgICAgICAgIDxsaSAqbmdGb3I9XCIjcGVyc29uIG9mIHBlb3BsZVwiPlxuICogICAgICAgICAgIHt7cGVyc29uLm5hbWV9fVxuICogICAgICAgICA8L2xpPlxuICogICAgICAgPC91bD5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICBwZW9wbGU6IEFycmF5PE9iamVjdD47XG4gKiAgIGNvbnN0cnVjdG9yKGpzb25wOkpzb25wKSB7XG4gKiAgICAganNvbnAucmVxdWVzdCgncGVvcGxlLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAqICAgICAgIHRoaXMucGVvcGxlID0gcmVzLmpzb24oKTtcbiAqICAgICB9KVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJpbWFyeSBwdWJsaWMgQVBJIGluY2x1ZGVkIGluIGBKU09OUF9QUk9WSURFUlNgIGlzIHRoZSB7QGxpbmsgSnNvbnB9IGNsYXNzLlxuICogSG93ZXZlciwgb3RoZXIgcHJvdmlkZXJzIHJlcXVpcmVkIGJ5IGBKc29ucGAgYXJlIGluY2x1ZGVkLFxuICogd2hpY2ggbWF5IGJlIGJlbmVmaWNpYWwgdG8gb3ZlcnJpZGUgaW4gY2VydGFpbiBjYXNlcy5cbiAqXG4gKiBUaGUgcHJvdmlkZXJzIGluY2x1ZGVkIGluIGBKU09OUF9QUk9WSURFUlNgIGluY2x1ZGU6XG4gKiAgKiB7QGxpbmsgSnNvbnB9XG4gKiAgKiB7QGxpbmsgSlNPTlBCYWNrZW5kfVxuICogICogYEJyb3dzZXJKc29ucGAgLSBQcml2YXRlIGZhY3RvcnlcbiAqICAqIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogICoge0BsaW5rIFJlc3BvbnNlT3B0aW9uc30gLSBCb3VuZCB0byB7QGxpbmsgQmFzZVJlc3BvbnNlT3B0aW9uc30gY2xhc3NcbiAqXG4gKiBUaGVyZSBtYXkgYmUgY2FzZXMgd2hlcmUgaXQgbWFrZXMgc2Vuc2UgdG8gZXh0ZW5kIHRoZSBiYXNlIHJlcXVlc3Qgb3B0aW9ucyxcbiAqIHN1Y2ggYXMgdG8gYWRkIGEgc2VhcmNoIHN0cmluZyB0byBiZSBhcHBlbmRlZCB0byBhbGwgVVJMcy5cbiAqIFRvIGFjY29tcGxpc2ggdGhpcywgYSBuZXcgcHJvdmlkZXIgZm9yIHtAbGluayBSZXF1ZXN0T3B0aW9uc30gc2hvdWxkXG4gKiBiZSBhZGRlZCBpbiB0aGUgc2FtZSBpbmplY3RvciBhcyBgSlNPTlBfUFJPVklERVJTYC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVEZ1Zzd4P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge3Byb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEJhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIGNsYXNzIE15T3B0aW9ucyBleHRlbmRzIEJhc2VSZXF1ZXN0T3B0aW9ucyB7XG4gKiAgIHNlYXJjaDogc3RyaW5nID0gJ2NvcmVUZWFtPXRydWUnO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHAsIFtKU09OUF9QUk9WSURFUlMsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogTXlPcHRpb25zfSldKVxuICogICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqXG4gKiBMaWtld2lzZSwgdG8gdXNlIGEgbW9jayBiYWNrZW5kIGZvciB1bml0IHRlc3RzLCB0aGUge0BsaW5rIEpTT05QQmFja2VuZH1cbiAqIHByb3ZpZGVyIHNob3VsZCBiZSBib3VuZCB0byB7QGxpbmsgTW9ja0JhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9IRHFaV0w/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7cHJvdmlkZSwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtKU09OUF9QUk9WSURFUlMsIEpzb25wLCBSZXNwb25zZSwgSlNPTlBCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKlxuICogdmFyIHBlb3BsZSA9IFt7bmFtZTogJ0plZmYnfSwge25hbWU6ICdUb2JpYXMnfV07XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgSlNPTlBfUFJPVklERVJTLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShKU09OUEJhY2tlbmQsIHt1c2VFeGlzdGluZzogTW9ja0JhY2tlbmR9KVxuICogXSk7XG4gKiB2YXIganNvbnAgPSBpbmplY3Rvci5nZXQoSnNvbnApO1xuICogdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICpcbiAqIC8vIExpc3RlbiBmb3IgYW55IG5ldyByZXF1ZXN0c1xuICogYmFja2VuZC5jb25uZWN0aW9ucy5vYnNlcnZlcih7XG4gKiAgIG5leHQ6IGNvbm5lY3Rpb24gPT4ge1xuICogICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh7Ym9keTogcGVvcGxlfSk7XG4gKiAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAvLyBTZW5kIGEgcmVzcG9uc2UgdG8gdGhlIHJlcXVlc3RcbiAqICAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQocmVzcG9uc2UpO1xuICogICAgIH0pO1xuICogICB9XG4gKiB9KTtcblxuICoganNvbnAuZ2V0KCdwZW9wbGUuanNvbicpLm9ic2VydmVyKHtcbiAqICAgbmV4dDogcmVzID0+IHtcbiAqICAgICAvLyBSZXNwb25zZSBjYW1lIGZyb20gbW9jayBiYWNrZW5kXG4gKiAgICAgY29uc29sZS5sb2coJ2ZpcnN0IHBlcnNvbicsIHJlcy5qc29uKClbMF0ubmFtZSk7XG4gKiAgIH1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBKU09OUF9QUk9WSURFUlM6IGFueVtdID0gW1xuICAvLyBUT0RPKHBhc2NhbCk6IHVzZSBmYWN0b3J5IHR5cGUgYW5ub3RhdGlvbnMgb25jZSBzdXBwb3J0ZWQgaW4gRElcbiAgLy8gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMxODNcbiAgcHJvdmlkZShKc29ucCwge1xuICAgIHVzZUZhY3Rvcnk6IChqc29ucEJhY2tlbmQ6IEpTT05QQmFja2VuZCwgcmVxdWVzdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSA9PlxuICAgICAgICAgICAgICAgICAgICBuZXcgSnNvbnAoanNvbnBCYWNrZW5kLCByZXF1ZXN0T3B0aW9ucyksXG4gICAgZGVwczogW0pTT05QQmFja2VuZCwgUmVxdWVzdE9wdGlvbnNdXG4gIH0pLFxuICBCcm93c2VySnNvbnAsIHByb3ZpZGUoUmVxdWVzdE9wdGlvbnMsIHt1c2VDbGFzczogQmFzZVJlcXVlc3RPcHRpb25zfSksXG4gIHByb3ZpZGUoUmVzcG9uc2VPcHRpb25zLCB7dXNlQ2xhc3M6IEJhc2VSZXNwb25zZU9wdGlvbnN9KSxcbiAgcHJvdmlkZShKU09OUEJhY2tlbmQsIHt1c2VDbGFzczogSlNPTlBCYWNrZW5kX30pXG5dO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgSlNPTlBfUFJPVklERVJTfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBKU09OX0JJTkRJTkdTID0gSlNPTlBfUFJPVklERVJTO1xuIl19