'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var platform_location_1 = require('angular2/src/router/location/platform_location');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var serialized_types_1 = require('angular2/src/web_workers/shared/serialized_types');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var event_deserializer_1 = require('./event_deserializer');
var WebWorkerPlatformLocation = (function (_super) {
    __extends(WebWorkerPlatformLocation, _super);
    function WebWorkerPlatformLocation(brokerFactory, bus, _serializer) {
        var _this = this;
        _super.call(this);
        this._serializer = _serializer;
        this._popStateListeners = [];
        this._hashChangeListeners = [];
        this._location = null;
        this._broker = brokerFactory.createMessageBroker(messaging_api_1.ROUTER_CHANNEL);
        this._channelSource = bus.from(messaging_api_1.ROUTER_CHANNEL);
        async_1.ObservableWrapper.subscribe(this._channelSource, function (msg) {
            var listeners = null;
            if (collection_1.StringMapWrapper.contains(msg, 'event')) {
                var type = msg['event']['type'];
                if (lang_1.StringWrapper.equals(type, 'popstate')) {
                    listeners = _this._popStateListeners;
                }
                else if (lang_1.StringWrapper.equals(type, 'hashchange')) {
                    listeners = _this._hashChangeListeners;
                }
                if (listeners !== null) {
                    var e = event_deserializer_1.deserializeGenericEvent(msg['event']);
                    // There was a popState or hashChange event, so the location object thas been updated
                    _this._location = _this._serializer.deserialize(msg['location'], serialized_types_1.LocationType);
                    listeners.forEach(function (fn) { return fn(e); });
                }
            }
        });
    }
    /** @internal **/
    WebWorkerPlatformLocation.prototype.init = function () {
        var _this = this;
        var args = new client_message_broker_1.UiArguments('getLocation');
        var locationPromise = this._broker.runOnService(args, serialized_types_1.LocationType);
        return async_1.PromiseWrapper.then(locationPromise, function (val) {
            _this._location = val;
            return true;
        }, function (err) { throw new exceptions_1.BaseException(err); });
    };
    WebWorkerPlatformLocation.prototype.getBaseHrefFromDOM = function () {
        throw new exceptions_1.BaseException('Attempt to get base href from DOM from WebWorker. You must either provide a value for the APP_BASE_HREF token through DI or use the hash location strategy.');
    };
    WebWorkerPlatformLocation.prototype.onPopState = function (fn) { this._popStateListeners.push(fn); };
    WebWorkerPlatformLocation.prototype.onHashChange = function (fn) { this._hashChangeListeners.push(fn); };
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "pathname", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.pathname;
        },
        set: function (newPath) {
            if (this._location === null) {
                throw new exceptions_1.BaseException('Attempt to set pathname before value is obtained from UI');
            }
            this._location.pathname = newPath;
            var fnArgs = [new client_message_broker_1.FnArg(newPath, serializer_1.PRIMITIVE)];
            var args = new client_message_broker_1.UiArguments('setPathname', fnArgs);
            this._broker.runOnService(args, null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "search", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.search;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "hash", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.hash;
        },
        enumerable: true,
        configurable: true
    });
    WebWorkerPlatformLocation.prototype.pushState = function (state, title, url) {
        var fnArgs = [new client_message_broker_1.FnArg(state, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(title, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(url, serializer_1.PRIMITIVE)];
        var args = new client_message_broker_1.UiArguments('pushState', fnArgs);
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.replaceState = function (state, title, url) {
        var fnArgs = [new client_message_broker_1.FnArg(state, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(title, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(url, serializer_1.PRIMITIVE)];
        var args = new client_message_broker_1.UiArguments('replaceState', fnArgs);
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.forward = function () {
        var args = new client_message_broker_1.UiArguments('forward');
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.back = function () {
        var args = new client_message_broker_1.UiArguments('back');
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, message_bus_1.MessageBus, serializer_1.Serializer])
    ], WebWorkerPlatformLocation);
    return WebWorkerPlatformLocation;
})(platform_location_1.PlatformLocation);
exports.WebWorkerPlatformLocation = WebWorkerPlatformLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24iLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5pbml0IiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00iLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZSIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24uaGFzaCIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlIiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmZvcndhcmQiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmJhY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsa0NBQWtFLGdEQUFnRCxDQUFDLENBQUE7QUFDbkgsc0NBQWtGLHVEQUF1RCxDQUFDLENBQUE7QUFDMUksOEJBQTZCLCtDQUErQyxDQUFDLENBQUE7QUFDN0UsaUNBQTJCLGtEQUFrRCxDQUFDLENBQUE7QUFDOUUsc0JBQThELDJCQUEyQixDQUFDLENBQUE7QUFDMUYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7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QUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFuSEhaO1FBQUNBLGVBQVVBLEVBQUVBOztrQ0FvSFpBO0lBQURBLGdDQUFDQTtBQUFEQSxDQUFDQSxBQXBIRCxFQUMrQyxvQ0FBZ0IsRUFtSDlEO0FBbkhZLGlDQUF5Qiw0QkFtSHJDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbiwgVXJsQ2hhbmdlRXZlbnQsIFVybENoYW5nZUxpc3RlbmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7Rm5BcmcsIFVpQXJndW1lbnRzLCBDbGllbnRNZXNzYWdlQnJva2VyLCBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtST1VURVJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7TG9jYXRpb25UeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZWRfdHlwZXMnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BSSU1JVElWRSwgU2VyaWFsaXplcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1N0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge2Rlc2VyaWFsaXplR2VuZXJpY0V2ZW50fSBmcm9tICcuL2V2ZW50X2Rlc2VyaWFsaXplcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uIGV4dGVuZHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgX2Jyb2tlcjogQ2xpZW50TWVzc2FnZUJyb2tlcjtcbiAgcHJpdmF0ZSBfcG9wU3RhdGVMaXN0ZW5lcnM6IEFycmF5PEZ1bmN0aW9uPiA9IFtdO1xuICBwcml2YXRlIF9oYXNoQ2hhbmdlTGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcbiAgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uVHlwZSA9IG51bGw7XG4gIHByaXZhdGUgX2NoYW5uZWxTb3VyY2U6IEV2ZW50RW1pdHRlcjxPYmplY3Q+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgYnJva2VyRmFjdG9yeTogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksIGJ1czogTWVzc2FnZUJ1cywgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fYnJva2VyID0gYnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFJPVVRFUl9DSEFOTkVMKTtcblxuICAgIHRoaXMuX2NoYW5uZWxTb3VyY2UgPSBidXMuZnJvbShST1VURVJfQ0hBTk5FTCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX2NoYW5uZWxTb3VyY2UsIChtc2c6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiB7XG4gICAgICB2YXIgbGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBudWxsO1xuICAgICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMobXNnLCAnZXZlbnQnKSkge1xuICAgICAgICBsZXQgdHlwZTogc3RyaW5nID0gbXNnWydldmVudCddWyd0eXBlJ107XG4gICAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyh0eXBlLCAncG9wc3RhdGUnKSkge1xuICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX3BvcFN0YXRlTGlzdGVuZXJzO1xuICAgICAgICB9IGVsc2UgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKHR5cGUsICdoYXNoY2hhbmdlJykpIHtcbiAgICAgICAgICBsaXN0ZW5lcnMgPSB0aGlzLl9oYXNoQ2hhbmdlTGlzdGVuZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVycyAhPT0gbnVsbCkge1xuICAgICAgICAgIGxldCBlID0gZGVzZXJpYWxpemVHZW5lcmljRXZlbnQobXNnWydldmVudCddKTtcbiAgICAgICAgICAvLyBUaGVyZSB3YXMgYSBwb3BTdGF0ZSBvciBoYXNoQ2hhbmdlIGV2ZW50LCBzbyB0aGUgbG9jYXRpb24gb2JqZWN0IHRoYXMgYmVlbiB1cGRhdGVkXG4gICAgICAgICAgdGhpcy5fbG9jYXRpb24gPSB0aGlzLl9zZXJpYWxpemVyLmRlc2VyaWFsaXplKG1zZ1snbG9jYXRpb24nXSwgTG9jYXRpb25UeXBlKTtcbiAgICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaCgoZm46IEZ1bmN0aW9uKSA9PiBmbihlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKiovXG4gIGluaXQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIGFyZ3M6IFVpQXJndW1lbnRzID0gbmV3IFVpQXJndW1lbnRzKCdnZXRMb2NhdGlvbicpO1xuXG4gICAgdmFyIGxvY2F0aW9uUHJvbWlzZTogUHJvbWlzZTxMb2NhdGlvblR5cGU+ID0gdGhpcy5fYnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBMb2NhdGlvblR5cGUpO1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci50aGVuKFxuICAgICAgICBsb2NhdGlvblByb21pc2UsICh2YWw6IExvY2F0aW9uVHlwZSk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAoZXJyKTogYm9vbGVhbiA9PiB7IHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGVycik7IH0pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICdBdHRlbXB0IHRvIGdldCBiYXNlIGhyZWYgZnJvbSBET00gZnJvbSBXZWJXb3JrZXIuIFlvdSBtdXN0IGVpdGhlciBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBBUFBfQkFTRV9IUkVGIHRva2VuIHRocm91Z2ggREkgb3IgdXNlIHRoZSBoYXNoIGxvY2F0aW9uIHN0cmF0ZWd5LicpO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogVXJsQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHsgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lcnMucHVzaChmbik7IH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZCB7IHRoaXMuX2hhc2hDaGFuZ2VMaXN0ZW5lcnMucHVzaChmbik7IH1cblxuICBnZXQgcGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5fbG9jYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5wYXRobmFtZTtcbiAgfVxuXG4gIGdldCBzZWFyY2goKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5fbG9jYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbi5zZWFyY2g7XG4gIH1cblxuICBnZXQgaGFzaCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLl9sb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLmhhc2g7XG4gIH1cblxuICBzZXQgcGF0aG5hbWUobmV3UGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuX2xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQXR0ZW1wdCB0byBzZXQgcGF0aG5hbWUgYmVmb3JlIHZhbHVlIGlzIG9idGFpbmVkIGZyb20gVUknKTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2NhdGlvbi5wYXRobmFtZSA9IG5ld1BhdGg7XG5cbiAgICB2YXIgZm5BcmdzID0gW25ldyBGbkFyZyhuZXdQYXRoLCBQUklNSVRJVkUpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cygnc2V0UGF0aG5hbWUnLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgZm5BcmdzID1cbiAgICAgICAgW25ldyBGbkFyZyhzdGF0ZSwgUFJJTUlUSVZFKSwgbmV3IEZuQXJnKHRpdGxlLCBQUklNSVRJVkUpLCBuZXcgRm5BcmcodXJsLCBQUklNSVRJVkUpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cygncHVzaFN0YXRlJywgZm5BcmdzKTtcbiAgICB0aGlzLl9icm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIGZuQXJncyA9XG4gICAgICAgIFtuZXcgRm5Bcmcoc3RhdGUsIFBSSU1JVElWRSksIG5ldyBGbkFyZyh0aXRsZSwgUFJJTUlUSVZFKSwgbmV3IEZuQXJnKHVybCwgUFJJTUlUSVZFKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoJ3JlcGxhY2VTdGF0ZScsIGZuQXJncyk7XG4gICAgdGhpcy5fYnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoJ2ZvcndhcmQnKTtcbiAgICB0aGlzLl9icm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cygnYmFjaycpO1xuICAgIHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cbn1cbiJdfQ==