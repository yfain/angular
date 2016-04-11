'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var static_request_1 = require('../static_request');
var enums_1 = require('../enums');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var Subject_1 = require('rxjs/Subject');
var ReplaySubject_1 = require('rxjs/subject/ReplaySubject');
var take_1 = require('rxjs/operator/take');
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
var MockConnection = (function () {
    function MockConnection(req) {
        this.response = take_1.take.call(new ReplaySubject_1.ReplaySubject(1), 1);
        this.readyState = enums_1.ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {@link EventEmitter} returned by {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response('fake response')); //logs 'fake response'
     * ```
     *
     */
    MockConnection.prototype.mockRespond = function (res) {
        if (this.readyState === enums_1.ReadyState.Done || this.readyState === enums_1.ReadyState.Cancelled) {
            throw new exceptions_1.BaseException('Connection has already been resolved');
        }
        this.readyState = enums_1.ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    };
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    MockConnection.prototype.mockDownload = function (res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    };
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     */
    MockConnection.prototype.mockError = function (err) {
        // Matches XHR semantics
        this.readyState = enums_1.ReadyState.Done;
        this.response.error(err);
    };
    return MockConnection;
})();
exports.MockConnection = MockConnection;
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {BaseRequestOptions, Http} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 * it('should get some data', inject([AsyncTestCompleter], (async) => {
 *   var connection;
 *   var injector = Injector.resolveAndCreate([
 *     MockBackend,
 *     provide(Http, {useFactory: (backend, options) => {
 *       return new Http(backend, options);
 *     }, deps: [MockBackend, BaseRequestOptions]})]);
 *   var http = injector.get(Http);
 *   var backend = injector.get(MockBackend);
 *   //Assign any newly-created connection to local variable
 *   backend.connections.subscribe(c => connection = c);
 *   http.request('data.json').subscribe((res) => {
 *     expect(res.text()).toBe('awesome');
 *     async.done();
 *   });
 *   connection.mockRespond(new Response('awesome'));
 * }));
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 **/
var MockBackend = (function () {
    function MockBackend() {
        var _this = this;
        this.connectionsArray = [];
        this.connections = new Subject_1.Subject();
        this.connections.subscribe(function (connection) { return _this.connectionsArray.push(connection); });
        this.pendingConnections = new Subject_1.Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.verifyNoPendingRequests = function () {
        var pending = 0;
        this.pendingConnections.subscribe(function (c) { return pending++; });
        if (pending > 0)
            throw new exceptions_1.BaseException(pending + " pending connections to be resolved");
    };
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.resolveAllConnections = function () { this.connections.subscribe(function (c) { return c.readyState = 4; }); };
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    MockBackend.prototype.createConnection = function (req) {
        if (!lang_1.isPresent(req) || !(req instanceof static_request_1.Request)) {
            throw new exceptions_1.BaseException("createConnection requires an instance of Request, got " + req);
        }
        var connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    };
    MockBackend = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockBackend);
    return MockBackend;
})();
exports.MockBackend = MockBackend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QywrQkFBc0IsbUJBQW1CLENBQUMsQ0FBQTtBQUUxQyxzQkFBeUIsVUFBVSxDQUFDLENBQUE7QUFFcEMscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Usd0JBQXNCLGNBQWMsQ0FBQyxDQUFBO0FBQ3JDLDhCQUE0Qiw0QkFBNEIsQ0FBQyxDQUFBO0FBQ3pELHFCQUFtQixvQkFBb0IsQ0FBQyxDQUFBO0FBRXhDOzs7O0lBSUk7QUFDSjtJQW9CRUEsd0JBQVlBLEdBQVlBO1FBQ3RCQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxXQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSw2QkFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxJQUFJQSxD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QUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxZQUFZQSx3QkFBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSwyREFBeURBLEdBQUtBLENBQUNBLENBQUNBO1FBQzFGQSxDQUFDQTtRQUNEQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6Q0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDbENBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQTdGSEo7UUFBQ0EsaUJBQVVBLEVBQUVBOztvQkE4RlpBO0lBQURBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQTlGRCxJQThGQztBQTdGWSxtQkFBVyxjQTZGdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1JlcXVlc3R9IGZyb20gJy4uL3N0YXRpY19yZXF1ZXN0JztcbmltcG9ydCB7UmVzcG9uc2V9IGZyb20gJy4uL3N0YXRpY19yZXNwb25zZSc7XG5pbXBvcnQge1JlYWR5U3RhdGV9IGZyb20gJy4uL2VudW1zJztcbmltcG9ydCB7Q29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQge1JlcGxheVN1YmplY3R9IGZyb20gJ3J4anMvc3ViamVjdC9SZXBsYXlTdWJqZWN0JztcbmltcG9ydCB7dGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvci90YWtlJztcblxuLyoqXG4gKlxuICogTW9jayBDb25uZWN0aW9uIHRvIHJlcHJlc2VudCBhIHtAbGluayBDb25uZWN0aW9ufSBmb3IgdGVzdHMuXG4gKlxuICoqL1xuZXhwb3J0IGNsYXNzIE1vY2tDb25uZWN0aW9uIGltcGxlbWVudHMgQ29ubmVjdGlvbiB7XG4gIC8vIFRPRE8gTmFtZSBgcmVhZHlTdGF0ZWAgc2hvdWxkIGNoYW5nZSB0byBiZSBtb3JlIGdlbmVyaWMsIGFuZCBzdGF0ZXMgY291bGQgYmUgbWFkZSB0byBiZSBtb3JlXG4gIC8vIGRlc2NyaXB0aXZlIHRoYW4gWEhSIHN0YXRlcy5cbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbm5lY3Rpb24sIGJhc2VkIG9uIGBYTUxIdHRwUmVxdWVzdC5yZWFkeVN0YXRlYCwgYnV0IHdpdGhcbiAgICogYWRkaXRpb25hbCBzdGF0ZXMuIEZvciBleGFtcGxlLCBzdGF0ZSA1IGluZGljYXRlcyBhbiBhYm9ydGVkIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZWFkeVN0YXRlOiBSZWFkeVN0YXRlO1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UgdXNlZCB0byBjcmVhdGUgdGhlIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0OiBSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgUmVzcG9uc2V9LiBDYW4gYmUgc3Vic2NyaWJlZCB0byBpbiBvcmRlciB0byBiZSBub3RpZmllZCB3aGVuIGFcbiAgICogcmVzcG9uc2UgaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgcmVzcG9uc2U6IFJlcGxheVN1YmplY3Q8UmVzcG9uc2U+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcTogUmVxdWVzdCkge1xuICAgIHRoaXMucmVzcG9uc2UgPSB0YWtlLmNhbGwobmV3IFJlcGxheVN1YmplY3QoMSksIDEpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuT3BlbjtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBtb2NrIHJlc3BvbnNlIHRvIHRoZSBjb25uZWN0aW9uLiBUaGlzIHJlc3BvbnNlIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIGVtaXR0ZWQgdG8gdGhlXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IHJldHVybmVkIGJ5IHtAbGluayBIdHRwfS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBjb25uZWN0aW9uO1xuICAgKiBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IGNvbnNvbGUubG9nKHJlcy50ZXh0KCkpKTtcbiAgICogY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UoJ2Zha2UgcmVzcG9uc2UnKSk7IC8vbG9ncyAnZmFrZSByZXNwb25zZSdcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBtb2NrUmVzcG9uZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5Eb25lIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5DYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZS5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UubmV4dChyZXMpO1xuICAgIHRoaXMucmVzcG9uc2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3QgeWV0IGltcGxlbWVudGVkIVxuICAgKlxuICAgKiBTZW5kcyB0aGUgcHJvdmlkZWQge0BsaW5rIFJlc3BvbnNlfSB0byB0aGUgYGRvd25sb2FkT2JzZXJ2ZXJgIG9mIHRoZSBgUmVxdWVzdGBcbiAgICogYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29ubmVjdGlvbi5cbiAgICovXG4gIG1vY2tEb3dubG9hZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgLy8gdGhpcy5yZXF1ZXN0LmRvd25sb2FkT2JzZXJ2ZXIub25OZXh0KHJlcyk7XG4gICAgLy8gaWYgKHJlcy5ieXRlc0xvYWRlZCA9PT0gcmVzLnRvdGFsQnl0ZXMpIHtcbiAgICAvLyAgIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgLy8gfVxuICB9XG5cbiAgLy8gVE9ETyhqZWZmYmNyb3NzKTogY29uc2lkZXIgdXNpbmcgUmVzcG9uc2UgdHlwZVxuICAvKipcbiAgICogRW1pdHMgdGhlIHByb3ZpZGVkIGVycm9yIG9iamVjdCBhcyBhbiBlcnJvciB0byB0aGUge0BsaW5rIFJlc3BvbnNlfSB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiByZXR1cm5lZFxuICAgKiBmcm9tIHtAbGluayBIdHRwfS5cbiAgICovXG4gIG1vY2tFcnJvcihlcnI/OiBFcnJvcikge1xuICAgIC8vIE1hdGNoZXMgWEhSIHNlbWFudGljc1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLmVycm9yKGVycik7XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1vY2sgYmFja2VuZCBmb3IgdGVzdGluZyB0aGUge0BsaW5rIEh0dHB9IHNlcnZpY2UuXG4gKlxuICogVGhpcyBjbGFzcyBjYW4gYmUgaW5qZWN0ZWQgaW4gdGVzdHMsIGFuZCBzaG91bGQgYmUgdXNlZCB0byBvdmVycmlkZSBwcm92aWRlcnNcbiAqIHRvIG90aGVyIGJhY2tlbmRzLCBzdWNoIGFzIHtAbGluayBYSFJCYWNrZW5kfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIEh0dHB9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cC90ZXN0aW5nJztcbiAqIGl0KCdzaG91bGQgZ2V0IHNvbWUgZGF0YScsIGluamVjdChbQXN5bmNUZXN0Q29tcGxldGVyXSwgKGFzeW5jKSA9PiB7XG4gKiAgIHZhciBjb25uZWN0aW9uO1xuICogICB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgICBNb2NrQmFja2VuZCxcbiAqICAgICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OiAoYmFja2VuZCwgb3B0aW9ucykgPT4ge1xuICogICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIG9wdGlvbnMpO1xuICogICAgIH0sIGRlcHM6IFtNb2NrQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zXX0pXSk7XG4gKiAgIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogICB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKiAgIC8vQXNzaWduIGFueSBuZXdseS1jcmVhdGVkIGNvbm5lY3Rpb24gdG8gbG9jYWwgdmFyaWFibGVcbiAqICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gKiAgIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKChyZXMpID0+IHtcbiAqICAgICBleHBlY3QocmVzLnRleHQoKSkudG9CZSgnYXdlc29tZScpO1xuICogICAgIGFzeW5jLmRvbmUoKTtcbiAqICAgfSk7XG4gKiAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdhd2Vzb21lJykpO1xuICogfSkpO1xuICogYGBgXG4gKlxuICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICoqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tCYWNrZW5kIGltcGxlbWVudHMgQ29ubmVjdGlvbkJhY2tlbmQge1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuIENhbiBiZSBzdWJzY3JpYmVkXG4gICAqIHRvIGluIG9yZGVyIHRvIHJlc3BvbmQgdG8gY29ubmVjdGlvbnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBpbXBvcnQge0h0dHAsIEJhc2VSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gICAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gICAqIGltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICAgKlxuICAgKiBpdCgnc2hvdWxkIGdldCBhIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgKiAgIHZhciBjb25uZWN0aW9uOyAvL3RoaXMgd2lsbCBiZSBzZXQgd2hlbiBhIG5ldyBjb25uZWN0aW9uIGlzIGVtaXR0ZWQgZnJvbSB0aGUgYmFja2VuZC5cbiAgICogICB2YXIgdGV4dDsgLy90aGlzIHdpbGwgYmUgc2V0IGZyb20gbW9jayByZXNwb25zZVxuICAgKiAgIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgICAgTW9ja0JhY2tlbmQsXG4gICAqICAgICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OiAoYmFja2VuZCwgb3B0aW9ucykgPT4ge1xuICAgKiAgICAgICByZXR1cm4gbmV3IEh0dHAoYmFja2VuZCwgb3B0aW9ucyk7XG4gICAqICAgICB9LCBkZXBzOiBbTW9ja0JhY2tlbmQsIEJhc2VSZXF1ZXN0T3B0aW9uc119XSk7XG4gICAqICAgdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICAgKiAgIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICAgKiAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiAgIGh0dHAucmVxdWVzdCgnc29tZXRoaW5nLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAgICogICAgIHRleHQgPSByZXMudGV4dCgpO1xuICAgKiAgIH0pO1xuICAgKiAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKHtib2R5OiAnU29tZXRoaW5nJ30pKTtcbiAgICogICBleHBlY3QodGV4dCkudG9CZSgnU29tZXRoaW5nJyk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBjb25uZWN0aW9uczogYW55OyAgLy88TW9ja0Nvbm5lY3Rpb24+XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIGBjb25uZWN0aW9uc2AuIFRoaXMgYXJyYXkgd2lsbCBiZSB1cGRhdGVkIHdpdGggZWFjaCBjb25uZWN0aW9uIHRoYXRcbiAgICogaXMgY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnNBcnJheTogTW9ja0Nvbm5lY3Rpb25bXTtcbiAgLyoqXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IG9mIHtAbGluayBNb2NrQ29ubmVjdGlvbn0gaW5zdGFuY2VzIHRoYXQgaGF2ZW4ndCB5ZXQgYmVlbiByZXNvbHZlZCAoaS5lLlxuICAgKiB3aXRoIGEgYHJlYWR5U3RhdGVgXG4gICAqIGxlc3MgdGhhbiA0KS4gVXNlZCBpbnRlcm5hbGx5IHRvIHZlcmlmeSB0aGF0IG5vIGNvbm5lY3Rpb25zIGFyZSBwZW5kaW5nIHZpYSB0aGVcbiAgICogYHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzYCBtZXRob2QuXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgcGVuZGluZ0Nvbm5lY3Rpb25zOiBhbnk7ICAvLyBTdWJqZWN0PE1vY2tDb25uZWN0aW9uPlxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25zQXJyYXkgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zLnN1YnNjcmliZShcbiAgICAgICAgKGNvbm5lY3Rpb246IE1vY2tDb25uZWN0aW9uKSA9PiB0aGlzLmNvbm5lY3Rpb25zQXJyYXkucHVzaChjb25uZWN0aW9uKSk7XG4gICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhbGwgY29ubmVjdGlvbnMsIGFuZCByYWlzZXMgYW4gZXhjZXB0aW9uIGlmIGFueSBjb25uZWN0aW9uIGhhcyBub3QgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHMoKSB7XG4gICAgbGV0IHBlbmRpbmcgPSAwO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zLnN1YnNjcmliZSgoYzogTW9ja0Nvbm5lY3Rpb24pID0+IHBlbmRpbmcrKyk7XG4gICAgaWYgKHBlbmRpbmcgPiAwKSB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtwZW5kaW5nfSBwZW5kaW5nIGNvbm5lY3Rpb25zIHRvIGJlIHJlc29sdmVkYCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIHRvIHJlc29sdmUgYW55IG5vdC15ZXQtcmVzb2x2ZVxuICAgKiBjb25uZWN0aW9ucywgaWYgaXQncyBleHBlY3RlZCB0aGF0IHRoZXJlIGFyZSBjb25uZWN0aW9ucyB0aGF0IGhhdmUgbm90IHlldCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICByZXNvbHZlQWxsQ29ubmVjdGlvbnMoKSB7IHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKChjOiBNb2NrQ29ubmVjdGlvbikgPT4gYy5yZWFkeVN0YXRlID0gNCk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259LiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gY2FsbGluZyBgbmV3XG4gICAqIE1vY2tDb25uZWN0aW9uKClgLCBleGNlcHQgdGhhdCBpdCBhbHNvIHdpbGwgZW1pdCB0aGUgbmV3IGBDb25uZWN0aW9uYCB0byB0aGUgYGNvbm5lY3Rpb25zYFxuICAgKiBlbWl0dGVyIG9mIHRoaXMgYE1vY2tCYWNrZW5kYCBpbnN0YW5jZS4gVGhpcyBtZXRob2Qgd2lsbCB1c3VhbGx5IG9ubHkgYmUgdXNlZCBieSB0ZXN0c1xuICAgKiBhZ2FpbnN0IHRoZSBmcmFtZXdvcmsgaXRzZWxmLCBub3QgYnkgZW5kLXVzZXJzLlxuICAgKi9cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXE6IFJlcXVlc3QpOiBNb2NrQ29ubmVjdGlvbiB7XG4gICAgaWYgKCFpc1ByZXNlbnQocmVxKSB8fCAhKHJlcSBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgY3JlYXRlQ29ubmVjdGlvbiByZXF1aXJlcyBhbiBpbnN0YW5jZSBvZiBSZXF1ZXN0LCBnb3QgJHtyZXF9YCk7XG4gICAgfVxuICAgIGxldCBjb25uZWN0aW9uID0gbmV3IE1vY2tDb25uZWN0aW9uKHJlcSk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5uZXh0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG59XG4iXX0=