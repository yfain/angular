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
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var di_1 = require('angular2/src/core/di');
var lang_2 = require('angular2/src/facade/lang');
var lang_3 = require('angular2/src/facade/lang');
exports.Type = lang_3.Type;
var ClientMessageBrokerFactory = (function () {
    function ClientMessageBrokerFactory() {
    }
    return ClientMessageBrokerFactory;
})();
exports.ClientMessageBrokerFactory = ClientMessageBrokerFactory;
var ClientMessageBrokerFactory_ = (function (_super) {
    __extends(ClientMessageBrokerFactory_, _super);
    function ClientMessageBrokerFactory_(_messageBus, _serializer) {
        _super.call(this);
        this._messageBus = _messageBus;
        this._serializer = _serializer;
    }
    /**
     * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
     */
    ClientMessageBrokerFactory_.prototype.createMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        this._messageBus.initChannel(channel, runInZone);
        return new ClientMessageBroker_(this._messageBus, this._serializer, channel);
    };
    ClientMessageBrokerFactory_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, serializer_1.Serializer])
    ], ClientMessageBrokerFactory_);
    return ClientMessageBrokerFactory_;
})(ClientMessageBrokerFactory);
exports.ClientMessageBrokerFactory_ = ClientMessageBrokerFactory_;
var ClientMessageBroker = (function () {
    function ClientMessageBroker() {
    }
    return ClientMessageBroker;
})();
exports.ClientMessageBroker = ClientMessageBroker;
var ClientMessageBroker_ = (function (_super) {
    __extends(ClientMessageBroker_, _super);
    function ClientMessageBroker_(messageBus, _serializer, channel) {
        var _this = this;
        _super.call(this);
        this.channel = channel;
        this._pending = new Map();
        this._sink = messageBus.to(channel);
        this._serializer = _serializer;
        var source = messageBus.from(channel);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._handleMessage(message); });
    }
    ClientMessageBroker_.prototype._generateMessageId = function (name) {
        var time = lang_1.stringify(lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now()));
        var iteration = 0;
        var id = name + time + lang_1.stringify(iteration);
        while (lang_1.isPresent(this._pending[id])) {
            id = "" + name + time + iteration;
            iteration++;
        }
        return id;
    };
    ClientMessageBroker_.prototype.runOnService = function (args, returnType) {
        var _this = this;
        var fnArgs = [];
        if (lang_1.isPresent(args.args)) {
            args.args.forEach(function (argument) {
                if (argument.type != null) {
                    fnArgs.push(_this._serializer.serialize(argument.value, argument.type));
                }
                else {
                    fnArgs.push(argument.value);
                }
            });
        }
        var promise;
        var id = null;
        if (returnType != null) {
            var completer = async_1.PromiseWrapper.completer();
            id = this._generateMessageId(args.method);
            this._pending.set(id, completer);
            async_1.PromiseWrapper.catchError(completer.promise, function (err, stack) {
                lang_1.print(err);
                completer.reject(err, stack);
            });
            promise = async_1.PromiseWrapper.then(completer.promise, function (value) {
                if (_this._serializer == null) {
                    return value;
                }
                else {
                    return _this._serializer.deserialize(value, returnType);
                }
            });
        }
        else {
            promise = null;
        }
        // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap #3685
        var message = { 'method': args.method, 'args': fnArgs };
        if (id != null) {
            message['id'] = id;
        }
        async_1.ObservableWrapper.callEmit(this._sink, message);
        return promise;
    };
    ClientMessageBroker_.prototype._handleMessage = function (message) {
        var data = new MessageData(message);
        // TODO(jteplitz602): replace these strings with messaging constants #3685
        if (lang_2.StringWrapper.equals(data.type, 'result') || lang_2.StringWrapper.equals(data.type, 'error')) {
            var id = data.id;
            if (this._pending.has(id)) {
                if (lang_2.StringWrapper.equals(data.type, 'result')) {
                    this._pending.get(id).resolve(data.value);
                }
                else {
                    this._pending.get(id).reject(data.value, null);
                }
                this._pending.delete(id);
            }
        }
    };
    return ClientMessageBroker_;
})(ClientMessageBroker);
exports.ClientMessageBroker_ = ClientMessageBroker_;
var MessageData = (function () {
    function MessageData(data) {
        this.type = collection_1.StringMapWrapper.get(data, 'type');
        this.id = this._getValueIfPresent(data, 'id');
        this.value = this._getValueIfPresent(data, 'value');
    }
    /**
     * Returns the value from the StringMap if present. Otherwise returns null
     * @internal
     */
    MessageData.prototype._getValueIfPresent = function (data, key) {
        if (collection_1.StringMapWrapper.contains(data, key)) {
            return collection_1.StringMapWrapper.get(data, key);
        }
        else {
            return null;
        }
    };
    return MessageData;
})();
var FnArg = (function () {
    function FnArg(value, type) {
        this.value = value;
        this.type = type;
    }
    return FnArg;
})();
exports.FnArg = FnArg;
var UiArguments = (function () {
    function UiArguments(method, args) {
        this.method = method;
        this.args = args;
    }
    return UiArguments;
})();
exports.UiArguments = UiArguments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50X21lc3NhZ2VfYnJva2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXIudHMiXSwibmFtZXMiOlsiQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnkiLCJDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeS5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jcmVhdGVNZXNzYWdlQnJva2VyIiwiQ2xpZW50TWVzc2FnZUJyb2tlciIsIkNsaWVudE1lc3NhZ2VCcm9rZXIuY29uc3RydWN0b3IiLCJDbGllbnRNZXNzYWdlQnJva2VyXyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2dlbmVyYXRlTWVzc2FnZUlkIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8ucnVuT25TZXJ2aWNlIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2hhbmRsZU1lc3NhZ2UiLCJNZXNzYWdlRGF0YSIsIk1lc3NhZ2VEYXRhLmNvbnN0cnVjdG9yIiwiTWVzc2FnZURhdGEuX2dldFZhbHVlSWZQcmVzZW50IiwiRm5BcmciLCJGbkFyZy5jb25zdHJ1Y3RvciIsIlVpQXJndW1lbnRzIiwiVWlBcmd1bWVudHMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUscUJBQXVELDBCQUEwQixDQUFDLENBQUE7QUFDbEYsc0JBQWdGLDJCQUEyQixDQUFDLENBQUE7QUFDNUcsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7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QUxBLEtBQUtBLENBQUFBO1FBQVNBLFNBQUlBLEdBQUpBLElBQUlBLENBQU1BO0lBQUdBLENBQUNBO0lBQ2pERCxZQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGWSxhQUFLLFFBRWpCLENBQUE7QUFFRDtJQUNFRSxxQkFBbUJBLE1BQWNBLEVBQVNBLElBQWNBO1FBQXJDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUM5REQsa0JBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZZLG1CQUFXLGNBRXZCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtwcmludCwgaXNQcmVzZW50LCBEYXRlV3JhcHBlciwgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlQ29tcGxldGVyLCBQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgU3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmV4cG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBnaXZlbiBjaGFubmVsIGFuZCBhdHRhY2hlcyBhIG5ldyB7QGxpbmsgQ2xpZW50TWVzc2FnZUJyb2tlcn0gdG8gaXQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lPzogYm9vbGVhbik6IENsaWVudE1lc3NhZ2VCcm9rZXI7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeV8gZXh0ZW5kcyBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBfc2VyaWFsaXplcjogU2VyaWFsaXplcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2VyaWFsaXplciA9IF9zZXJpYWxpemVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBnaXZlbiBjaGFubmVsIGFuZCBhdHRhY2hlcyBhIG5ldyB7QGxpbmsgQ2xpZW50TWVzc2FnZUJyb2tlcn0gdG8gaXQuXG4gICAqL1xuICBjcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lOiBib29sZWFuID0gdHJ1ZSk6IENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICAgIHRoaXMuX21lc3NhZ2VCdXMuaW5pdENoYW5uZWwoY2hhbm5lbCwgcnVuSW5ab25lKTtcbiAgICByZXR1cm4gbmV3IENsaWVudE1lc3NhZ2VCcm9rZXJfKHRoaXMuX21lc3NhZ2VCdXMsIHRoaXMuX3NlcmlhbGl6ZXIsIGNoYW5uZWwpO1xuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDbGllbnRNZXNzYWdlQnJva2VyIHtcbiAgYWJzdHJhY3QgcnVuT25TZXJ2aWNlKGFyZ3M6IFVpQXJndW1lbnRzLCByZXR1cm5UeXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+O1xufVxuXG5leHBvcnQgY2xhc3MgQ2xpZW50TWVzc2FnZUJyb2tlcl8gZXh0ZW5kcyBDbGllbnRNZXNzYWdlQnJva2VyIHtcbiAgcHJpdmF0ZSBfcGVuZGluZzogTWFwPHN0cmluZywgUHJvbWlzZUNvbXBsZXRlcjxhbnk+PiA9IG5ldyBNYXA8c3RyaW5nLCBQcm9taXNlQ29tcGxldGVyPGFueT4+KCk7XG4gIHByaXZhdGUgX3Npbms6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfc2VyaWFsaXplcjogU2VyaWFsaXplcjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnVzOiBNZXNzYWdlQnVzLCBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHVibGljIGNoYW5uZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NpbmsgPSBtZXNzYWdlQnVzLnRvKGNoYW5uZWwpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXIgPSBfc2VyaWFsaXplcjtcbiAgICB2YXIgc291cmNlID0gbWVzc2FnZUJ1cy5mcm9tKGNoYW5uZWwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShcbiAgICAgICAgc291cmNlLCAobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0pID0+IHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2VuZXJhdGVNZXNzYWdlSWQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgdGltZTogc3RyaW5nID0gc3RyaW5naWZ5KERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKSk7XG4gICAgdmFyIGl0ZXJhdGlvbjogbnVtYmVyID0gMDtcbiAgICB2YXIgaWQ6IHN0cmluZyA9IG5hbWUgKyB0aW1lICsgc3RyaW5naWZ5KGl0ZXJhdGlvbik7XG4gICAgd2hpbGUgKGlzUHJlc2VudCh0aGlzLl9wZW5kaW5nW2lkXSkpIHtcbiAgICAgIGlkID0gYCR7bmFtZX0ke3RpbWV9JHtpdGVyYXRpb259YDtcbiAgICAgIGl0ZXJhdGlvbisrO1xuICAgIH1cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBydW5PblNlcnZpY2UoYXJnczogVWlBcmd1bWVudHMsIHJldHVyblR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBmbkFyZ3MgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KGFyZ3MuYXJncykpIHtcbiAgICAgIGFyZ3MuYXJncy5mb3JFYWNoKGFyZ3VtZW50ID0+IHtcbiAgICAgICAgaWYgKGFyZ3VtZW50LnR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgIGZuQXJncy5wdXNoKHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKGFyZ3VtZW50LnZhbHVlLCBhcmd1bWVudC50eXBlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm5BcmdzLnB1c2goYXJndW1lbnQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuICAgIHZhciBpZDogc3RyaW5nID0gbnVsbDtcbiAgICBpZiAocmV0dXJuVHlwZSAhPSBudWxsKSB7XG4gICAgICB2YXIgY29tcGxldGVyOiBQcm9taXNlQ29tcGxldGVyPGFueT4gPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICAgIGlkID0gdGhpcy5fZ2VuZXJhdGVNZXNzYWdlSWQoYXJncy5tZXRob2QpO1xuICAgICAgdGhpcy5fcGVuZGluZy5zZXQoaWQsIGNvbXBsZXRlcik7XG4gICAgICBQcm9taXNlV3JhcHBlci5jYXRjaEVycm9yKGNvbXBsZXRlci5wcm9taXNlLCAoZXJyLCBzdGFjaz8pID0+IHtcbiAgICAgICAgcHJpbnQoZXJyKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlcnIsIHN0YWNrKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlID0gUHJvbWlzZVdyYXBwZXIudGhlbihjb21wbGV0ZXIucHJvbWlzZSwgKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlcmlhbGl6ZXIgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZSh2YWx1ZSwgcmV0dXJuVHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogQ3JlYXRlIGEgY2xhc3MgZm9yIHRoZXNlIG1lc3NhZ2VzIHNvIHdlIGRvbid0IGtlZXAgdXNpbmcgU3RyaW5nTWFwICMzNjg1XG4gICAgdmFyIG1lc3NhZ2UgPSB7J21ldGhvZCc6IGFyZ3MubWV0aG9kLCAnYXJncyc6IGZuQXJnc307XG4gICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2VbJ2lkJ10gPSBpZDtcbiAgICB9XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc2luaywgbWVzc2FnZSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZU1lc3NhZ2UobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgZGF0YSA9IG5ldyBNZXNzYWdlRGF0YShtZXNzYWdlKTtcbiAgICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogcmVwbGFjZSB0aGVzZSBzdHJpbmdzIHdpdGggbWVzc2FnaW5nIGNvbnN0YW50cyAjMzY4NVxuICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsICdyZXN1bHQnKSB8fCBTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsICdlcnJvcicpKSB7XG4gICAgICB2YXIgaWQgPSBkYXRhLmlkO1xuICAgICAgaWYgKHRoaXMuX3BlbmRpbmcuaGFzKGlkKSkge1xuICAgICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoZGF0YS50eXBlLCAncmVzdWx0JykpIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nLmdldChpZCkucmVzb2x2ZShkYXRhLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nLmdldChpZCkucmVqZWN0KGRhdGEudmFsdWUsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BlbmRpbmcuZGVsZXRlKGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTWVzc2FnZURhdGEge1xuICB0eXBlOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLnR5cGUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChkYXRhLCAndHlwZScpO1xuICAgIHRoaXMuaWQgPSB0aGlzLl9nZXRWYWx1ZUlmUHJlc2VudChkYXRhLCAnaWQnKTtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5fZ2V0VmFsdWVJZlByZXNlbnQoZGF0YSwgJ3ZhbHVlJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgZnJvbSB0aGUgU3RyaW5nTWFwIGlmIHByZXNlbnQuIE90aGVyd2lzZSByZXR1cm5zIG51bGxcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfZ2V0VmFsdWVJZlByZXNlbnQoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogc3RyaW5nKSB7XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoZGF0YSwga2V5KSkge1xuICAgICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuZ2V0KGRhdGEsIGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm5Bcmcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWUsIHB1YmxpYyB0eXBlOiBUeXBlKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgVWlBcmd1bWVudHMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWV0aG9kOiBzdHJpbmcsIHB1YmxpYyBhcmdzPzogRm5BcmdbXSkge31cbn1cbiJdfQ==