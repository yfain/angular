var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isString, isPresent } from 'angular2/src/facade/lang';
import { makeTypeError } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/core';
import { ConnectionBackend } from './interfaces';
import { Request } from './static_request';
import { RequestOptions } from './base_request_options';
import { RequestMethod } from './enums';
function httpRequest(backend, request) {
    return backend.createConnection(request).response;
}
function mergeOptions(defaultOpts, providedOpts, method, url) {
    var newOptions = defaultOpts;
    if (isPresent(providedOpts)) {
        // Hack so Dart can used named parameters
        return newOptions.merge(new RequestOptions({
            method: providedOpts.method || method,
            url: providedOpts.url || url,
            search: providedOpts.search,
            headers: providedOpts.headers,
            body: providedOpts.body
        }));
    }
    if (isPresent(method)) {
        return newOptions.merge(new RequestOptions({ method: method, url: url }));
    }
    else {
        return newOptions.merge(new RequestOptions({ url: url }));
    }
}
/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an `Observable` which will emit a single {@link Response} when a
 * response is received.
 *
 * ### Example
 *
 * ```typescript
 * import {Http, HTTP_PROVIDERS} from 'angular2/http';
 * @Component({
 *   selector: 'http-app',
 *   viewProviders: [HTTP_PROVIDERS],
 *   templateUrl: 'people.html'
 * })
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 *
 * ### Example
 *
 * ```
 * http.get('people.json').observer({next: (value) => this.people = value});
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {@link XHRBackend} provider, as in the following example:
 *
 * ### Example
 *
 * ```typescript
 * import {BaseRequestOptions, Http} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   provide(Http, {useFactory:
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       deps: [MockBackend, BaseRequestOptions]})
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 **/
export let Http = class {
    constructor(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    request(url, options) {
        var responseObservable;
        if (isString(url)) {
            responseObservable = httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, url)));
        }
        else if (url instanceof Request) {
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
    /**
     * Performs a request with `get` http method.
     */
    get(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, url)));
    }
    /**
     * Performs a request with `post` http method.
     */
    post(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Post, url)));
    }
    /**
     * Performs a request with `put` http method.
     */
    put(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Put, url)));
    }
    /**
     * Performs a request with `delete` http method.
     */
    delete(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Delete, url)));
    }
    /**
     * Performs a request with `patch` http method.
     */
    patch(url, body, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Patch, url)));
    }
    /**
     * Performs a request with `head` http method.
     */
    head(url, options) {
        return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Head, url)));
    }
};
Http = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ConnectionBackend, RequestOptions])
], Http);
export let Jsonp = class extends Http {
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    request(url, options) {
        var responseObservable;
        if (isString(url)) {
            url =
                new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, url));
        }
        if (url instanceof Request) {
            if (url.method !== RequestMethod.Get) {
                makeTypeError('JSONP requests must use GET request method.');
            }
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw makeTypeError('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
};
Jsonp = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ConnectionBackend, RequestOptions])
], Jsonp);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9odHRwL2h0dHAudHMiXSwibmFtZXMiOlsiaHR0cFJlcXVlc3QiLCJtZXJnZU9wdGlvbnMiLCJIdHRwIiwiSHR0cC5jb25zdHJ1Y3RvciIsIkh0dHAucmVxdWVzdCIsIkh0dHAuZ2V0IiwiSHR0cC5wb3N0IiwiSHR0cC5wdXQiLCJIdHRwLmRlbGV0ZSIsIkh0dHAucGF0Y2giLCJIdHRwLmhlYWQiLCJKc29ucCIsIkpzb25wLmNvbnN0cnVjdG9yIiwiSnNvbnAucmVxdWVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BQzlELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNqQyxFQUFpQyxpQkFBaUIsRUFBQyxNQUFNLGNBQWM7T0FDdkUsRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0I7T0FFakMsRUFBcUIsY0FBYyxFQUFDLE1BQU0sd0JBQXdCO09BQ2xFLEVBQUMsYUFBYSxFQUFDLE1BQU0sU0FBUztBQUdyQyxxQkFBcUIsT0FBMEIsRUFBRSxPQUFnQjtJQUMvREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtBQUNwREEsQ0FBQ0E7QUFFRCxzQkFDSSxXQUErQixFQUFFLFlBQWdDLEVBQUUsTUFBcUIsRUFDeEYsR0FBVztJQUNiQyxJQUFJQSxVQUFVQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLHlDQUF5Q0E7UUFDekNBLE1BQU1BLENBQUNBLFVBQVVB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QUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLFlBQVlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxLQUFLQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckNBLGFBQWFBLENBQUNBLDZDQUE2Q0EsQ0FBQ0EsQ0FBQ0E7WUFDL0RBLENBQUNBO1lBQ0RBLGtCQUFrQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLGFBQWFBLENBQUNBLDBEQUEwREEsQ0FBQ0EsQ0FBQ0E7UUFDbEZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLGtCQUFrQkEsQ0FBQ0E7SUFDNUJBLENBQUNBO0FBQ0hGLENBQUNBO0FBNUJEO0lBQUMsVUFBVSxFQUFFOztVQTRCWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1N0cmluZywgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHttYWtlVHlwZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UmVxdWVzdE9wdGlvbnNBcmdzLCBDb25uZWN0aW9uLCBDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7UmVxdWVzdH0gZnJvbSAnLi9zdGF0aWNfcmVxdWVzdCc7XG5pbXBvcnQge1Jlc3BvbnNlfSBmcm9tICcuL3N0YXRpY19yZXNwb25zZSc7XG5pbXBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuaW1wb3J0IHtSZXF1ZXN0TWV0aG9kfSBmcm9tICcuL2VudW1zJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcy9PYnNlcnZhYmxlJztcblxuZnVuY3Rpb24gaHR0cFJlcXVlc3QoYmFja2VuZDogQ29ubmVjdGlvbkJhY2tlbmQsIHJlcXVlc3Q6IFJlcXVlc3QpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gIHJldHVybiBiYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24ocmVxdWVzdCkucmVzcG9uc2U7XG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhcbiAgICBkZWZhdWx0T3B0czogQmFzZVJlcXVlc3RPcHRpb25zLCBwcm92aWRlZE9wdHM6IFJlcXVlc3RPcHRpb25zQXJncywgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLFxuICAgIHVybDogc3RyaW5nKTogUmVxdWVzdE9wdGlvbnMge1xuICB2YXIgbmV3T3B0aW9ucyA9IGRlZmF1bHRPcHRzO1xuICBpZiAoaXNQcmVzZW50KHByb3ZpZGVkT3B0cykpIHtcbiAgICAvLyBIYWNrIHNvIERhcnQgY2FuIHVzZWQgbmFtZWQgcGFyYW1ldGVyc1xuICAgIHJldHVybiBuZXdPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICBtZXRob2Q6IHByb3ZpZGVkT3B0cy5tZXRob2QgfHwgbWV0aG9kLFxuICAgICAgdXJsOiBwcm92aWRlZE9wdHMudXJsIHx8IHVybCxcbiAgICAgIHNlYXJjaDogcHJvdmlkZWRPcHRzLnNlYXJjaCxcbiAgICAgIGhlYWRlcnM6IHByb3ZpZGVkT3B0cy5oZWFkZXJzLFxuICAgICAgYm9keTogcHJvdmlkZWRPcHRzLmJvZHlcbiAgICB9KSk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChtZXRob2QpKSB7XG4gICAgcmV0dXJuIG5ld09wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHttZXRob2Q6IG1ldGhvZCwgdXJsOiB1cmx9KSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ld09wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHt1cmw6IHVybH0pKTtcbiAgfVxufVxuXG4vKipcbiAqIFBlcmZvcm1zIGh0dHAgcmVxdWVzdHMgdXNpbmcgYFhNTEh0dHBSZXF1ZXN0YCBhcyB0aGUgZGVmYXVsdCBiYWNrZW5kLlxuICpcbiAqIGBIdHRwYCBpcyBhdmFpbGFibGUgYXMgYW4gaW5qZWN0YWJsZSBjbGFzcywgd2l0aCBtZXRob2RzIHRvIHBlcmZvcm0gaHR0cCByZXF1ZXN0cy4gQ2FsbGluZ1xuICogYHJlcXVlc3RgIHJldHVybnMgYW4gYE9ic2VydmFibGVgIHdoaWNoIHdpbGwgZW1pdCBhIHNpbmdsZSB7QGxpbmsgUmVzcG9uc2V9IHdoZW4gYVxuICogcmVzcG9uc2UgaXMgcmVjZWl2ZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0h0dHAsIEhUVFBfUFJPVklERVJTfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2h0dHAtYXBwJyxcbiAqICAgdmlld1Byb3ZpZGVyczogW0hUVFBfUFJPVklERVJTXSxcbiAqICAgdGVtcGxhdGVVcmw6ICdwZW9wbGUuaHRtbCdcbiAqIH0pXG4gKiBjbGFzcyBQZW9wbGVDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcihodHRwOiBIdHRwKSB7XG4gKiAgICAgaHR0cC5nZXQoJ3Blb3BsZS5qc29uJylcbiAqICAgICAgIC8vIENhbGwgbWFwIG9uIHRoZSByZXNwb25zZSBvYnNlcnZhYmxlIHRvIGdldCB0aGUgcGFyc2VkIHBlb3BsZSBvYmplY3RcbiAqICAgICAgIC5tYXAocmVzID0+IHJlcy5qc29uKCkpXG4gKiAgICAgICAvLyBTdWJzY3JpYmUgdG8gdGhlIG9ic2VydmFibGUgdG8gZ2V0IHRoZSBwYXJzZWQgcGVvcGxlIG9iamVjdCBhbmQgYXR0YWNoIGl0IHRvIHRoZVxuICogICAgICAgLy8gY29tcG9uZW50XG4gKiAgICAgICAuc3Vic2NyaWJlKHBlb3BsZSA9PiB0aGlzLnBlb3BsZSA9IHBlb3BsZSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaHR0cC5nZXQoJ3Blb3BsZS5qc29uJykub2JzZXJ2ZXIoe25leHQ6ICh2YWx1ZSkgPT4gdGhpcy5wZW9wbGUgPSB2YWx1ZX0pO1xuICogYGBgXG4gKlxuICogVGhlIGRlZmF1bHQgY29uc3RydWN0IHVzZWQgdG8gcGVyZm9ybSByZXF1ZXN0cywgYFhNTEh0dHBSZXF1ZXN0YCwgaXMgYWJzdHJhY3RlZCBhcyBhIFwiQmFja2VuZFwiIChcbiAqIHtAbGluayBYSFJCYWNrZW5kfSBpbiB0aGlzIGNhc2UpLCB3aGljaCBjb3VsZCBiZSBtb2NrZWQgd2l0aCBkZXBlbmRlbmN5IGluamVjdGlvbiBieSByZXBsYWNpbmdcbiAqIHRoZSB7QGxpbmsgWEhSQmFja2VuZH0gcHJvdmlkZXIsIGFzIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZTpcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgQmFzZVJlcXVlc3RPcHRpb25zLFxuICogICBNb2NrQmFja2VuZCxcbiAqICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTpcbiAqICAgICAgIGZ1bmN0aW9uKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKSB7XG4gKiAgICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucyk7XG4gKiAgICAgICB9LFxuICogICAgICAgZGVwczogW01vY2tCYWNrZW5kLCBCYXNlUmVxdWVzdE9wdGlvbnNdfSlcbiAqIF0pO1xuICogdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gKiBodHRwLmdldCgncmVxdWVzdC1mcm9tLW1vY2stYmFja2VuZC5qc29uJykuc3Vic2NyaWJlKChyZXM6UmVzcG9uc2UpID0+IGRvU29tZXRoaW5nKHJlcykpO1xuICogYGBgXG4gKlxuICoqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHAge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2JhY2tlbmQ6IENvbm5lY3Rpb25CYWNrZW5kLCBwcm90ZWN0ZWQgX2RlZmF1bHRPcHRpb25zOiBSZXF1ZXN0T3B0aW9ucykge31cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW55IHR5cGUgb2YgaHR0cCByZXF1ZXN0LiBGaXJzdCBhcmd1bWVudCBpcyByZXF1aXJlZCwgYW5kIGNhbiBlaXRoZXIgYmUgYSB1cmwgb3JcbiAgICogYSB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UuIElmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBhIHVybCwgYW4gb3B0aW9uYWwge0BsaW5rIFJlcXVlc3RPcHRpb25zfVxuICAgKiBvYmplY3QgY2FuIGJlIHByb3ZpZGVkIGFzIHRoZSAybmQgYXJndW1lbnQuIFRoZSBvcHRpb25zIG9iamVjdCB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSB2YWx1ZXNcbiAgICogb2Yge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc30gYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHJlcXVlc3QuXG4gICAqL1xuICByZXF1ZXN0KHVybDogc3RyaW5nfFJlcXVlc3QsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgdmFyIHJlc3BvbnNlT2JzZXJ2YWJsZTogYW55O1xuICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICByZXNwb25zZU9ic2VydmFibGUgPSBodHRwUmVxdWVzdChcbiAgICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIDxzdHJpbmc+dXJsKSkpO1xuICAgIH0gZWxzZSBpZiAodXJsIGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWFrZVR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHVybCBzdHJpbmcgb3IgUmVxdWVzdCBpbnN0YW5jZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2YWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgZ2V0YCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGdldCh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gaHR0cFJlcXVlc3QoXG4gICAgICAgIHRoaXMuX2JhY2tlbmQsXG4gICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgcG9zdGAgaHR0cCBtZXRob2QuXG4gICAqL1xuICBwb3N0KHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLCBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucy5tZXJnZShuZXcgUmVxdWVzdE9wdGlvbnMoe2JvZHk6IGJvZHl9KSksIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0TWV0aG9kLlBvc3QsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgcHV0YCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHB1dCh1cmw6IHN0cmluZywgYm9keTogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiBodHRwUmVxdWVzdChcbiAgICAgICAgdGhpcy5fYmFja2VuZCwgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdE9wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtib2R5OiBib2R5fSkpLCBvcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdE1ldGhvZC5QdXQsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgZGVsZXRlYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGRlbGV0ZSAodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIFJlcXVlc3RNZXRob2QuRGVsZXRlLCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBhdGNoYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHBhdGNoKHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIGh0dHBSZXF1ZXN0KFxuICAgICAgICB0aGlzLl9iYWNrZW5kLCBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0T3B0aW9ucy5tZXJnZShuZXcgUmVxdWVzdE9wdGlvbnMoe2JvZHk6IGJvZHl9KSksIG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0TWV0aG9kLlBhdGNoLCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYGhlYWRgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgaGVhZCh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gaHR0cFJlcXVlc3QoXG4gICAgICAgIHRoaXMuX2JhY2tlbmQsXG4gICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5IZWFkLCB1cmwpKSk7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wIGV4dGVuZHMgSHR0cCB7XG4gIGNvbnN0cnVjdG9yKGJhY2tlbmQ6IENvbm5lY3Rpb25CYWNrZW5kLCBkZWZhdWx0T3B0aW9uczogUmVxdWVzdE9wdGlvbnMpIHtcbiAgICBzdXBlcihiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW55IHR5cGUgb2YgaHR0cCByZXF1ZXN0LiBGaXJzdCBhcmd1bWVudCBpcyByZXF1aXJlZCwgYW5kIGNhbiBlaXRoZXIgYmUgYSB1cmwgb3JcbiAgICogYSB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UuIElmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBhIHVybCwgYW4gb3B0aW9uYWwge0BsaW5rIFJlcXVlc3RPcHRpb25zfVxuICAgKiBvYmplY3QgY2FuIGJlIHByb3ZpZGVkIGFzIHRoZSAybmQgYXJndW1lbnQuIFRoZSBvcHRpb25zIG9iamVjdCB3aWxsIGJlIG1lcmdlZCB3aXRoIHRoZSB2YWx1ZXNcbiAgICogb2Yge0BsaW5rIEJhc2VSZXF1ZXN0T3B0aW9uc30gYmVmb3JlIHBlcmZvcm1pbmcgdGhlIHJlcXVlc3QuXG4gICAqL1xuICByZXF1ZXN0KHVybDogc3RyaW5nfFJlcXVlc3QsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgdmFyIHJlc3BvbnNlT2JzZXJ2YWJsZTogYW55O1xuICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICB1cmwgPVxuICAgICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIDxzdHJpbmc+dXJsKSk7XG4gICAgfVxuICAgIGlmICh1cmwgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAodXJsLm1ldGhvZCAhPT0gUmVxdWVzdE1ldGhvZC5HZXQpIHtcbiAgICAgICAgbWFrZVR5cGVFcnJvcignSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgR0VUIHJlcXVlc3QgbWV0aG9kLicpO1xuICAgICAgfVxuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWFrZVR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHVybCBzdHJpbmcgb3IgUmVxdWVzdCBpbnN0YW5jZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlT2JzZXJ2YWJsZTtcbiAgfVxufVxuIl19