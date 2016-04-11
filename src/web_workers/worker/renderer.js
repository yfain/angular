'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var api_1 = require('angular2/src/core/render/api');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var render_store_1 = require('angular2/src/web_workers/shared/render_store');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var messaging_api_2 = require('angular2/src/web_workers/shared/messaging_api');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var async_1 = require('angular2/src/facade/async');
var view_1 = require('angular2/src/core/metadata/view');
var event_deserializer_1 = require('./event_deserializer');
var WebWorkerRootRenderer = (function () {
    function WebWorkerRootRenderer(messageBrokerFactory, bus, _serializer, _renderStore) {
        var _this = this;
        this._serializer = _serializer;
        this._renderStore = _renderStore;
        this.globalEvents = new NamedEventEmitter();
        this._componentRenderers = new Map();
        this._messageBroker = messageBrokerFactory.createMessageBroker(messaging_api_1.RENDERER_CHANNEL);
        bus.initChannel(messaging_api_2.EVENT_CHANNEL);
        var source = bus.from(messaging_api_2.EVENT_CHANNEL);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._dispatchEvent(message); });
    }
    WebWorkerRootRenderer.prototype._dispatchEvent = function (message) {
        var eventName = message['eventName'];
        var target = message['eventTarget'];
        var event = event_deserializer_1.deserializeGenericEvent(message['event']);
        if (lang_1.isPresent(target)) {
            this.globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
        }
        else {
            var element = this._serializer.deserialize(message['element'], serializer_1.RenderStoreObject);
            element.events.dispatchEvent(eventName, event);
        }
    };
    WebWorkerRootRenderer.prototype.renderComponent = function (componentType) {
        var result = this._componentRenderers.get(componentType.id);
        if (lang_1.isBlank(result)) {
            result = new WebWorkerRenderer(this, componentType);
            this._componentRenderers.set(componentType.id, result);
            var id = this._renderStore.allocateId();
            this._renderStore.store(result, id);
            this.runOnService('renderComponent', [
                new client_message_broker_1.FnArg(componentType, api_1.RenderComponentType),
                new client_message_broker_1.FnArg(result, serializer_1.RenderStoreObject),
            ]);
        }
        return result;
    };
    WebWorkerRootRenderer.prototype.runOnService = function (fnName, fnArgs) {
        var args = new client_message_broker_1.UiArguments(fnName, fnArgs);
        this._messageBroker.runOnService(args, null);
    };
    WebWorkerRootRenderer.prototype.allocateNode = function () {
        var result = new WebWorkerRenderNode();
        var id = this._renderStore.allocateId();
        this._renderStore.store(result, id);
        return result;
    };
    WebWorkerRootRenderer.prototype.allocateId = function () { return this._renderStore.allocateId(); };
    WebWorkerRootRenderer.prototype.destroyNodes = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this._renderStore.remove(nodes[i]);
        }
    };
    WebWorkerRootRenderer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, message_bus_1.MessageBus, serializer_1.Serializer, render_store_1.RenderStore])
    ], WebWorkerRootRenderer);
    return WebWorkerRootRenderer;
})();
exports.WebWorkerRootRenderer = WebWorkerRootRenderer;
var WebWorkerRenderer = (function () {
    function WebWorkerRenderer(_rootRenderer, _componentType) {
        this._rootRenderer = _rootRenderer;
        this._componentType = _componentType;
    }
    WebWorkerRenderer.prototype.renderComponent = function (componentType) {
        return this._rootRenderer.renderComponent(componentType);
    };
    WebWorkerRenderer.prototype._runOnService = function (fnName, fnArgs) {
        var fnArgsWithRenderer = [new client_message_broker_1.FnArg(this, serializer_1.RenderStoreObject)].concat(fnArgs);
        this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
    };
    WebWorkerRenderer.prototype.selectRootElement = function (selector) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('selectRootElement', [new client_message_broker_1.FnArg(selector, null), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createElement = function (parentElement, name) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createElement', [
            new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(name, null),
            new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)
        ]);
        return node;
    };
    WebWorkerRenderer.prototype.createViewRoot = function (hostElement) {
        var viewRoot = this._componentType.encapsulation === view_1.ViewEncapsulation.Native ?
            this._rootRenderer.allocateNode() :
            hostElement;
        this._runOnService('createViewRoot', [new client_message_broker_1.FnArg(hostElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewRoot, serializer_1.RenderStoreObject)]);
        return viewRoot;
    };
    WebWorkerRenderer.prototype.createTemplateAnchor = function (parentElement) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createTemplateAnchor', [new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)]);
        return node;
    };
    WebWorkerRenderer.prototype.createText = function (parentElement, value) {
        var node = this._rootRenderer.allocateNode();
        this._runOnService('createText', [
            new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(value, null),
            new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject)
        ]);
        return node;
    };
    WebWorkerRenderer.prototype.projectNodes = function (parentElement, nodes) {
        this._runOnService('projectNodes', [new client_message_broker_1.FnArg(parentElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(nodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
        this._runOnService('attachViewAfter', [new client_message_broker_1.FnArg(node, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewRootNodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.detachView = function (viewRootNodes) {
        this._runOnService('detachView', [new client_message_broker_1.FnArg(viewRootNodes, serializer_1.RenderStoreObject)]);
    };
    WebWorkerRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
        this._runOnService('destroyView', [new client_message_broker_1.FnArg(hostElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(viewAllNodes, serializer_1.RenderStoreObject)]);
        this._rootRenderer.destroyNodes(viewAllNodes);
    };
    WebWorkerRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        this._runOnService('setElementProperty', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
        this._runOnService('setElementAttribute', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(attributeName, null),
            new client_message_broker_1.FnArg(attributeValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
        this._runOnService('setBindingDebugInfo', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(propertyName, null),
            new client_message_broker_1.FnArg(propertyValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementDebugInfo = function (renderElement, info) { };
    WebWorkerRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
        this._runOnService('setElementClass', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(className, null),
            new client_message_broker_1.FnArg(isAdd, null)
        ]);
    };
    WebWorkerRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        this._runOnService('setElementStyle', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(styleName, null),
            new client_message_broker_1.FnArg(styleValue, null)
        ]);
    };
    WebWorkerRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        this._runOnService('invokeElementMethod', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(methodName, null),
            new client_message_broker_1.FnArg(args, null)
        ]);
    };
    WebWorkerRenderer.prototype.setText = function (renderNode, text) {
        this._runOnService('setText', [new client_message_broker_1.FnArg(renderNode, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(text, null)]);
    };
    WebWorkerRenderer.prototype.listen = function (renderElement, name, callback) {
        var _this = this;
        renderElement.events.listen(name, callback);
        var unlistenCallbackId = this._rootRenderer.allocateId();
        this._runOnService('listen', [
            new client_message_broker_1.FnArg(renderElement, serializer_1.RenderStoreObject), new client_message_broker_1.FnArg(name, null),
            new client_message_broker_1.FnArg(unlistenCallbackId, null)
        ]);
        return function () {
            renderElement.events.unlisten(name, callback);
            _this._runOnService('listenDone', [new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        };
    };
    WebWorkerRenderer.prototype.listenGlobal = function (target, name, callback) {
        var _this = this;
        this._rootRenderer.globalEvents.listen(eventNameWithTarget(target, name), callback);
        var unlistenCallbackId = this._rootRenderer.allocateId();
        this._runOnService('listenGlobal', [new client_message_broker_1.FnArg(target, null), new client_message_broker_1.FnArg(name, null), new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        return function () {
            _this._rootRenderer.globalEvents.unlisten(eventNameWithTarget(target, name), callback);
            _this._runOnService('listenDone', [new client_message_broker_1.FnArg(unlistenCallbackId, null)]);
        };
    };
    return WebWorkerRenderer;
})();
exports.WebWorkerRenderer = WebWorkerRenderer;
var NamedEventEmitter = (function () {
    function NamedEventEmitter() {
    }
    NamedEventEmitter.prototype._getListeners = function (eventName) {
        if (lang_1.isBlank(this._listeners)) {
            this._listeners = new Map();
        }
        var listeners = this._listeners.get(eventName);
        if (lang_1.isBlank(listeners)) {
            listeners = [];
            this._listeners.set(eventName, listeners);
        }
        return listeners;
    };
    NamedEventEmitter.prototype.listen = function (eventName, callback) { this._getListeners(eventName).push(callback); };
    NamedEventEmitter.prototype.unlisten = function (eventName, callback) {
        collection_1.ListWrapper.remove(this._getListeners(eventName), callback);
    };
    NamedEventEmitter.prototype.dispatchEvent = function (eventName, event) {
        var listeners = this._getListeners(eventName);
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](event);
        }
    };
    return NamedEventEmitter;
})();
exports.NamedEventEmitter = NamedEventEmitter;
function eventNameWithTarget(target, eventName) {
    return target + ":" + eventName;
}
var WebWorkerRenderNode = (function () {
    function WebWorkerRenderNode() {
        this.events = new NamedEventEmitter();
    }
    return WebWorkerRenderNode;
})();
exports.WebWorkerRenderNode = WebWorkerRenderNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclJvb3RSZW5kZXJlciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5jb25zdHJ1Y3RvciIsIldlYldvcmtlclJvb3RSZW5kZXJlci5fZGlzcGF0Y2hFdmVudCIsIldlYldvcmtlclJvb3RSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSb290UmVuZGVyZXIucnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSIsIldlYldvcmtlclJvb3RSZW5kZXJlci5hbGxvY2F0ZUlkIiwiV2ViV29ya2VyUm9vdFJlbmRlcmVyLmRlc3Ryb3lOb2RlcyIsIldlYldvcmtlclJlbmRlcmVyIiwiV2ViV29ya2VyUmVuZGVyZXIuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJlci5yZW5kZXJDb21wb25lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5fcnVuT25TZXJ2aWNlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVFbGVtZW50IiwiV2ViV29ya2VyUmVuZGVyZXIuY3JlYXRlVmlld1Jvb3QiLCJXZWJXb3JrZXJSZW5kZXJlci5jcmVhdGVUZW1wbGF0ZUFuY2hvciIsIldlYldvcmtlclJlbmRlcmVyLmNyZWF0ZVRleHQiLCJXZWJXb3JrZXJSZW5kZXJlci5wcm9qZWN0Tm9kZXMiLCJXZWJXb3JrZXJSZW5kZXJlci5hdHRhY2hWaWV3QWZ0ZXIiLCJXZWJXb3JrZXJSZW5kZXJlci5kZXRhY2hWaWV3IiwiV2ViV29ya2VyUmVuZGVyZXIuZGVzdHJveVZpZXciLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50QXR0cmlidXRlIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0QmluZGluZ0RlYnVnSW5mbyIsIldlYldvcmtlclJlbmRlcmVyLnNldEVsZW1lbnREZWJ1Z0luZm8iLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50Q2xhc3MiLCJXZWJXb3JrZXJSZW5kZXJlci5zZXRFbGVtZW50U3R5bGUiLCJXZWJXb3JrZXJSZW5kZXJlci5pbnZva2VFbGVtZW50TWV0aG9kIiwiV2ViV29ya2VyUmVuZGVyZXIuc2V0VGV4dCIsIldlYldvcmtlclJlbmRlcmVyLmxpc3RlbiIsIldlYldvcmtlclJlbmRlcmVyLmxpc3Rlbkdsb2JhbCIsIk5hbWVkRXZlbnRFbWl0dGVyIiwiTmFtZWRFdmVudEVtaXR0ZXIuY29uc3RydWN0b3IiLCJOYW1lZEV2ZW50RW1pdHRlci5fZ2V0TGlzdGVuZXJzIiwiTmFtZWRFdmVudEVtaXR0ZXIubGlzdGVuIiwiTmFtZWRFdmVudEVtaXR0ZXIudW5saXN0ZW4iLCJOYW1lZEV2ZW50RW1pdHRlci5kaXNwYXRjaEV2ZW50IiwiZXZlbnROYW1lV2l0aFRhcmdldCIsIldlYldvcmtlclJlbmRlck5vZGUiLCJXZWJXb3JrZXJSZW5kZXJOb2RlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxvQkFBMkUsOEJBQThCLENBQUMsQ0FBQTtBQUMxRyxzQ0FBa0YsdURBQXVELENBQUMsQ0FBQTtBQUMxSSxxQkFBd0MsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCw2QkFBMEIsOENBQThDLENBQUMsQ0FBQTtBQUN6RSw4QkFBK0IsK0NBQStDLENBQUMsQ0FBQTtBQUMvRSwyQkFBNEMsNENBQTRDLENBQUMsQ0FBQTtBQUN6Riw4QkFBNEIsK0NBQStDLENBQUMsQ0FBQTtBQUM1RSw0QkFBeUIs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QW1DQyxXQUFNQSxHQUFzQkEsSUFBSUEsaUJBQWlCQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUFERCwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFBekYsSUFBeUY7QUFBNUUsMkJBQW1CLHNCQUF5RCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlLCBSZW5kZXJEZWJ1Z0luZm99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtDbGllbnRNZXNzYWdlQnJva2VyLCBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSwgRm5BcmcsIFVpQXJndW1lbnRzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2NsaWVudF9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgcHJpbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1JlbmRlclN0b3JlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl9zdG9yZSc7XG5pbXBvcnQge1JFTkRFUkVSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5pbXBvcnQge1NlcmlhbGl6ZXIsIFJlbmRlclN0b3JlT2JqZWN0fSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtFVkVOVF9DSEFOTkVMfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2luZ19hcGknO1xuaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7ZGVzZXJpYWxpemVHZW5lcmljRXZlbnR9IGZyb20gJy4vZXZlbnRfZGVzZXJpYWxpemVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJvb3RSZW5kZXJlciBpbXBsZW1lbnRzIFJvb3RSZW5kZXJlciB7XG4gIHByaXZhdGUgX21lc3NhZ2VCcm9rZXI7XG4gIHB1YmxpYyBnbG9iYWxFdmVudHM6IE5hbWVkRXZlbnRFbWl0dGVyID0gbmV3IE5hbWVkRXZlbnRFbWl0dGVyKCk7XG4gIHByaXZhdGUgX2NvbXBvbmVudFJlbmRlcmVyczogTWFwPHN0cmluZywgV2ViV29ya2VyUmVuZGVyZXI+ID1cbiAgICAgIG5ldyBNYXA8c3RyaW5nLCBXZWJXb3JrZXJSZW5kZXJlcj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIG1lc3NhZ2VCcm9rZXJGYWN0b3J5OiBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSwgYnVzOiBNZXNzYWdlQnVzLFxuICAgICAgcHJpdmF0ZSBfc2VyaWFsaXplcjogU2VyaWFsaXplciwgcHJpdmF0ZSBfcmVuZGVyU3RvcmU6IFJlbmRlclN0b3JlKSB7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlciA9IG1lc3NhZ2VCcm9rZXJGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VCcm9rZXIoUkVOREVSRVJfQ0hBTk5FTCk7XG4gICAgYnVzLmluaXRDaGFubmVsKEVWRU5UX0NIQU5ORUwpO1xuICAgIHZhciBzb3VyY2UgPSBidXMuZnJvbShFVkVOVF9DSEFOTkVMKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLCAobWVzc2FnZSkgPT4gdGhpcy5fZGlzcGF0Y2hFdmVudChtZXNzYWdlKSk7XG4gIH1cblxuICBwcml2YXRlIF9kaXNwYXRjaEV2ZW50KG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIGV2ZW50TmFtZSA9IG1lc3NhZ2VbJ2V2ZW50TmFtZSddO1xuICAgIHZhciB0YXJnZXQgPSBtZXNzYWdlWydldmVudFRhcmdldCddO1xuICAgIHZhciBldmVudCA9IGRlc2VyaWFsaXplR2VuZXJpY0V2ZW50KG1lc3NhZ2VbJ2V2ZW50J10pO1xuICAgIGlmIChpc1ByZXNlbnQodGFyZ2V0KSkge1xuICAgICAgdGhpcy5nbG9iYWxFdmVudHMuZGlzcGF0Y2hFdmVudChldmVudE5hbWVXaXRoVGFyZ2V0KHRhcmdldCwgZXZlbnROYW1lKSwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxlbWVudCA9XG4gICAgICAgICAgPFdlYldvcmtlclJlbmRlck5vZGU+dGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZShtZXNzYWdlWydlbGVtZW50J10sIFJlbmRlclN0b3JlT2JqZWN0KTtcbiAgICAgIGVsZW1lbnQuZXZlbnRzLmRpc3BhdGNoRXZlbnQoZXZlbnROYW1lLCBldmVudCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlciB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NvbXBvbmVudFJlbmRlcmVycy5nZXQoY29tcG9uZW50VHlwZS5pZCk7XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gbmV3IFdlYldvcmtlclJlbmRlcmVyKHRoaXMsIGNvbXBvbmVudFR5cGUpO1xuICAgICAgdGhpcy5fY29tcG9uZW50UmVuZGVyZXJzLnNldChjb21wb25lbnRUeXBlLmlkLCByZXN1bHQpO1xuICAgICAgdmFyIGlkID0gdGhpcy5fcmVuZGVyU3RvcmUuYWxsb2NhdGVJZCgpO1xuICAgICAgdGhpcy5fcmVuZGVyU3RvcmUuc3RvcmUocmVzdWx0LCBpZCk7XG4gICAgICB0aGlzLnJ1bk9uU2VydmljZSgncmVuZGVyQ29tcG9uZW50JywgW1xuICAgICAgICBuZXcgRm5BcmcoY29tcG9uZW50VHlwZSwgUmVuZGVyQ29tcG9uZW50VHlwZSksXG4gICAgICAgIG5ldyBGbkFyZyhyZXN1bHQsIFJlbmRlclN0b3JlT2JqZWN0KSxcbiAgICAgIF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcnVuT25TZXJ2aWNlKGZuTmFtZTogc3RyaW5nLCBmbkFyZ3M6IEZuQXJnW10pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhmbk5hbWUsIGZuQXJncyk7XG4gICAgdGhpcy5fbWVzc2FnZUJyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBhbGxvY2F0ZU5vZGUoKTogV2ViV29ya2VyUmVuZGVyTm9kZSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBXZWJXb3JrZXJSZW5kZXJOb2RlKCk7XG4gICAgdmFyIGlkID0gdGhpcy5fcmVuZGVyU3RvcmUuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3JlbmRlclN0b3JlLnN0b3JlKHJlc3VsdCwgaWQpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhbGxvY2F0ZUlkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yZW5kZXJTdG9yZS5hbGxvY2F0ZUlkKCk7IH1cblxuICBkZXN0cm95Tm9kZXMobm9kZXM6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fcmVuZGVyU3RvcmUucmVtb3ZlKG5vZGVzW2ldKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlcmVyIGltcGxlbWVudHMgUmVuZGVyZXIsIFJlbmRlclN0b3JlT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9yb290UmVuZGVyZXI6IFdlYldvcmtlclJvb3RSZW5kZXJlciwgcHJpdmF0ZSBfY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSkge31cblxuICByZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSk6IFJlbmRlcmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcm9vdFJlbmRlcmVyLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3J1bk9uU2VydmljZShmbk5hbWU6IHN0cmluZywgZm5BcmdzOiBGbkFyZ1tdKSB7XG4gICAgdmFyIGZuQXJnc1dpdGhSZW5kZXJlciA9IFtuZXcgRm5BcmcodGhpcywgUmVuZGVyU3RvcmVPYmplY3QpXS5jb25jYXQoZm5BcmdzKTtcbiAgICB0aGlzLl9yb290UmVuZGVyZXIucnVuT25TZXJ2aWNlKGZuTmFtZSwgZm5BcmdzV2l0aFJlbmRlcmVyKTtcbiAgfVxuXG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ3NlbGVjdFJvb3RFbGVtZW50JywgW25ldyBGbkFyZyhzZWxlY3RvciwgbnVsbCksIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdCldKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQocGFyZW50RWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBub2RlID0gdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnY3JlYXRlRWxlbWVudCcsIFtcbiAgICAgIG5ldyBGbkFyZyhwYXJlbnRFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyhuYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdClcbiAgICBdKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNyZWF0ZVZpZXdSb290KGhvc3RFbGVtZW50OiBhbnkpOiBhbnkge1xuICAgIHZhciB2aWV3Um9vdCA9IHRoaXMuX2NvbXBvbmVudFR5cGUuZW5jYXBzdWxhdGlvbiA9PT0gVmlld0VuY2Fwc3VsYXRpb24uTmF0aXZlID9cbiAgICAgICAgdGhpcy5fcm9vdFJlbmRlcmVyLmFsbG9jYXRlTm9kZSgpIDpcbiAgICAgICAgaG9zdEVsZW1lbnQ7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnY3JlYXRlVmlld1Jvb3QnLFxuICAgICAgICBbbmV3IEZuQXJnKGhvc3RFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh2aWV3Um9vdCwgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgcmV0dXJuIHZpZXdSb290O1xuICB9XG5cbiAgY3JlYXRlVGVtcGxhdGVBbmNob3IocGFyZW50RWxlbWVudDogYW55KTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZU5vZGUoKTtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdjcmVhdGVUZW1wbGF0ZUFuY2hvcicsXG4gICAgICAgIFtuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcobm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjcmVhdGVUZXh0KHBhcmVudEVsZW1lbnQ6IGFueSwgdmFsdWU6IHN0cmluZyk6IGFueSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVOb2RlKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdjcmVhdGVUZXh0JywgW1xuICAgICAgbmV3IEZuQXJnKHBhcmVudEVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZhbHVlLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhub2RlLCBSZW5kZXJTdG9yZU9iamVjdClcbiAgICBdKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHByb2plY3ROb2RlcyhwYXJlbnRFbGVtZW50OiBhbnksIG5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZShcbiAgICAgICAgJ3Byb2plY3ROb2RlcycsXG4gICAgICAgIFtuZXcgRm5BcmcocGFyZW50RWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5Bcmcobm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgYXR0YWNoVmlld0FmdGVyKG5vZGU6IGFueSwgdmlld1Jvb3ROb2RlczogYW55W10pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoXG4gICAgICAgICdhdHRhY2hWaWV3QWZ0ZXInLFxuICAgICAgICBbbmV3IEZuQXJnKG5vZGUsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHZpZXdSb290Tm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICB9XG5cbiAgZGV0YWNoVmlldyh2aWV3Um9vdE5vZGVzOiBhbnlbXSkge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnZGV0YWNoVmlldycsIFtuZXcgRm5Bcmcodmlld1Jvb3ROb2RlcywgUmVuZGVyU3RvcmVPYmplY3QpXSk7XG4gIH1cblxuICBkZXN0cm95Vmlldyhob3N0RWxlbWVudDogYW55LCB2aWV3QWxsTm9kZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnZGVzdHJveVZpZXcnLFxuICAgICAgICBbbmV3IEZuQXJnKGhvc3RFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyh2aWV3QWxsTm9kZXMsIFJlbmRlclN0b3JlT2JqZWN0KV0pO1xuICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5kZXN0cm95Tm9kZXModmlld0FsbE5vZGVzKTtcbiAgfVxuXG4gIHNldEVsZW1lbnRQcm9wZXJ0eShyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRQcm9wZXJ0eScsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyhwcm9wZXJ0eU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHByb3BlcnR5VmFsdWUsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRFbGVtZW50QXR0cmlidXRlKHJlbmRlckVsZW1lbnQ6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdzZXRFbGVtZW50QXR0cmlidXRlJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKGF0dHJpYnV0ZU5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGF0dHJpYnV0ZVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0QmluZGluZ0RlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEJpbmRpbmdEZWJ1Z0luZm8nLCBbXG4gICAgICBuZXcgRm5BcmcocmVuZGVyRWxlbWVudCwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5BcmcocHJvcGVydHlOYW1lLCBudWxsKSxcbiAgICAgIG5ldyBGbkFyZyhwcm9wZXJ0eVZhbHVlLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudERlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBhbnksIGluZm86IFJlbmRlckRlYnVnSW5mbykge31cblxuICBzZXRFbGVtZW50Q2xhc3MocmVuZGVyRWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ3NldEVsZW1lbnRDbGFzcycsIFtcbiAgICAgIG5ldyBGbkFyZyhyZW5kZXJFbGVtZW50LCBSZW5kZXJTdG9yZU9iamVjdCksIG5ldyBGbkFyZyhjbGFzc05hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGlzQWRkLCBudWxsKVxuICAgIF0pO1xuICB9XG5cbiAgc2V0RWxlbWVudFN0eWxlKHJlbmRlckVsZW1lbnQ6IGFueSwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnc2V0RWxlbWVudFN0eWxlJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKHN0eWxlTmFtZSwgbnVsbCksXG4gICAgICBuZXcgRm5Bcmcoc3R5bGVWYWx1ZSwgbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIGludm9rZUVsZW1lbnRNZXRob2QocmVuZGVyRWxlbWVudDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdpbnZva2VFbGVtZW50TWV0aG9kJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKG1ldGhvZE5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKGFyZ3MsIG51bGwpXG4gICAgXSk7XG4gIH1cblxuICBzZXRUZXh0KHJlbmRlck5vZGU6IGFueSwgdGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnc2V0VGV4dCcsIFtuZXcgRm5BcmcocmVuZGVyTm9kZSwgUmVuZGVyU3RvcmVPYmplY3QpLCBuZXcgRm5BcmcodGV4dCwgbnVsbCldKTtcbiAgfVxuXG4gIGxpc3RlbihyZW5kZXJFbGVtZW50OiBXZWJXb3JrZXJSZW5kZXJOb2RlLCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZW5kZXJFbGVtZW50LmV2ZW50cy5saXN0ZW4obmFtZSwgY2FsbGJhY2spO1xuICAgIHZhciB1bmxpc3RlbkNhbGxiYWNrSWQgPSB0aGlzLl9yb290UmVuZGVyZXIuYWxsb2NhdGVJZCgpO1xuICAgIHRoaXMuX3J1bk9uU2VydmljZSgnbGlzdGVuJywgW1xuICAgICAgbmV3IEZuQXJnKHJlbmRlckVsZW1lbnQsIFJlbmRlclN0b3JlT2JqZWN0KSwgbmV3IEZuQXJnKG5hbWUsIG51bGwpLFxuICAgICAgbmV3IEZuQXJnKHVubGlzdGVuQ2FsbGJhY2tJZCwgbnVsbClcbiAgICBdKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcmVuZGVyRWxlbWVudC5ldmVudHMudW5saXN0ZW4obmFtZSwgY2FsbGJhY2spO1xuICAgICAgdGhpcy5fcnVuT25TZXJ2aWNlKCdsaXN0ZW5Eb25lJywgW25ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXSk7XG4gICAgfTtcbiAgfVxuXG4gIGxpc3Rlbkdsb2JhbCh0YXJnZXQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdGhpcy5fcm9vdFJlbmRlcmVyLmdsb2JhbEV2ZW50cy5saXN0ZW4oZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQsIG5hbWUpLCBjYWxsYmFjayk7XG4gICAgdmFyIHVubGlzdGVuQ2FsbGJhY2tJZCA9IHRoaXMuX3Jvb3RSZW5kZXJlci5hbGxvY2F0ZUlkKCk7XG4gICAgdGhpcy5fcnVuT25TZXJ2aWNlKFxuICAgICAgICAnbGlzdGVuR2xvYmFsJyxcbiAgICAgICAgW25ldyBGbkFyZyh0YXJnZXQsIG51bGwpLCBuZXcgRm5BcmcobmFtZSwgbnVsbCksIG5ldyBGbkFyZyh1bmxpc3RlbkNhbGxiYWNrSWQsIG51bGwpXSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5nbG9iYWxFdmVudHMudW5saXN0ZW4oZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQsIG5hbWUpLCBjYWxsYmFjayk7XG4gICAgICB0aGlzLl9ydW5PblNlcnZpY2UoJ2xpc3RlbkRvbmUnLCBbbmV3IEZuQXJnKHVubGlzdGVuQ2FsbGJhY2tJZCwgbnVsbCldKTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOYW1lZEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgX2xpc3RlbmVyczogTWFwPHN0cmluZywgRnVuY3Rpb25bXT47XG5cbiAgcHJpdmF0ZSBfZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZTogc3RyaW5nKTogRnVuY3Rpb25bXSB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fbGlzdGVuZXJzKSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEZ1bmN0aW9uW10+KCk7XG4gICAgfVxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSk7XG4gICAgaWYgKGlzQmxhbmsobGlzdGVuZXJzKSkge1xuICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbiAgICB9XG4gICAgcmV0dXJuIGxpc3RlbmVycztcbiAgfVxuXG4gIGxpc3RlbihldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IHRoaXMuX2dldExpc3RlbmVycyhldmVudE5hbWUpLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgdW5saXN0ZW4oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKSwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcGF0Y2hFdmVudChldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnROYW1lV2l0aFRhcmdldCh0YXJnZXQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dGFyZ2V0fToke2V2ZW50TmFtZX1gO1xufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyTm9kZSB7IGV2ZW50czogTmFtZWRFdmVudEVtaXR0ZXIgPSBuZXcgTmFtZWRFdmVudEVtaXR0ZXIoKTsgfVxuIl19