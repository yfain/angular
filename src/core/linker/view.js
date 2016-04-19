'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var collection_1 = require('angular2/src/facade/collection');
var element_1 = require('./element');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var view_ref_1 = require('./view_ref');
var view_type_1 = require('./view_type');
var view_utils_1 = require('./view_utils');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var profile_1 = require('../profile/profile');
var exceptions_1 = require('./exceptions');
var debug_context_1 = require('./debug_context');
var element_injector_1 = require('./element_injector');
exports.HOST_VIEW_ELEMENT_NAME = '$hostViewEl';
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
var _scope_check = profile_1.wtfCreateScope("AppView#check(ascii id)");
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize, staticNodeDebugInfos) {
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.locals = locals;
        this.viewManager = viewManager;
        this.parentInjector = parentInjector;
        this.declarationAppElement = declarationAppElement;
        this.cdMode = cdMode;
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this.contentChildren = [];
        this.viewChildren = [];
        // The names of the below fields must be kept in sync with codegen_name_util.ts or
        // change detection will fail.
        this.cdState = change_detection_1.ChangeDetectorState.NeverChecked;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this._currentDebugContext = null;
        this.ref = new view_ref_1.ViewRef_(this);
        if (type === view_type_1.ViewType.COMPONENT || type === view_type_1.ViewType.HOST) {
            this.renderer = viewManager.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
        this._literalArrayCache = collection_1.ListWrapper.createFixedSize(literalArrayCacheSize);
        this._literalMapCache = collection_1.ListWrapper.createFixedSize(literalMapCacheSize);
    }
    AppView.prototype.create = function (givenProjectableNodes, rootSelector) {
        var context;
        var projectableNodes;
        switch (this.type) {
            case view_type_1.ViewType.COMPONENT:
                context = this.declarationAppElement.component;
                projectableNodes = view_utils_1.ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case view_type_1.ViewType.EMBEDDED:
                context = this.declarationAppElement.parentView.context;
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case view_type_1.ViewType.HOST:
                context = EMPTY_CONTEXT;
                // Note: Don't ensure the slot count for the projectableNodes as we store
                // them only for the contained component view (which will later check the slot count...)
                projectableNodes = givenProjectableNodes;
                break;
        }
        this.context = context;
        this.projectableNodes = projectableNodes;
        if (this.debugMode) {
            this._resetDebug();
            try {
                this.createInternal(rootSelector);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        }
        else {
            this.createInternal(rootSelector);
        }
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.createInternal = function (rootSelector) { };
    AppView.prototype.init = function (rootNodesOrAppElements, allNodes, appElements, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.namedAppElements = appElements;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === view_type_1.ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.renderParent = this.declarationAppElement.parentView;
            this.dirtyParentQueriesInternal();
        }
    };
    AppView.prototype.getHostViewElement = function () { return this.namedAppElements[exports.HOST_VIEW_ELEMENT_NAME]; };
    AppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
        if (this.debugMode) {
            this._resetDebug();
            try {
                return this.injectorGetInternal(token, nodeIndex, notFoundResult);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        }
        else {
            return this.injectorGetInternal(token, nodeIndex, notFoundResult);
        }
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
        return notFoundResult;
    };
    AppView.prototype.injector = function (nodeIndex) {
        if (lang_1.isPresent(nodeIndex)) {
            return new element_injector_1.ElementInjector(this, nodeIndex);
        }
        else {
            return this.parentInjector;
        }
    };
    AppView.prototype.destroy = function () {
        if (this.destroyed) {
            return;
        }
        var children = this.contentChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        children = this.viewChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        if (this.debugMode) {
            this._resetDebug();
            try {
                this._destroyLocal();
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        }
        else {
            this._destroyLocal();
        }
        this.destroyed = true;
    };
    AppView.prototype._destroyLocal = function () {
        var hostElement = this.type === view_type_1.ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        this.renderer.destroyView(hostElement, this.allNodes);
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            async_1.ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.destroyInternal = function () { };
    Object.defineProperty(AppView.prototype, "debugMode", {
        get: function () { return lang_1.isPresent(this.staticNodeDebugInfos); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "changeDetectorRef", {
        get: function () { return this.ref; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "flatRootNodes", {
        get: function () { return view_utils_1.flattenNestedViewRenderNodes(this.rootNodesOrAppElements); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "lastRootNode", {
        get: function () {
            var lastNode = this.rootNodesOrAppElements.length > 0 ?
                this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                null;
            return _findLastRenderNode(lastNode);
        },
        enumerable: true,
        configurable: true
    });
    AppView.prototype.hasLocal = function (contextName) {
        return collection_1.StringMapWrapper.contains(this.locals, contextName);
    };
    AppView.prototype.setLocal = function (contextName, value) { this.locals[contextName] = value; };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.dirtyParentQueriesInternal = function () { };
    AppView.prototype.addRenderContentChild = function (view) {
        this.contentChildren.push(view);
        view.renderParent = this;
        view.dirtyParentQueriesInternal();
    };
    AppView.prototype.removeContentChild = function (view) {
        collection_1.ListWrapper.remove(this.contentChildren, view);
        view.dirtyParentQueriesInternal();
        view.renderParent = null;
    };
    AppView.prototype.detectChanges = function (throwOnChange) {
        var s = _scope_check(this.clazz);
        if (this.cdMode === change_detection_1.ChangeDetectionStrategy.Detached ||
            this.cdMode === change_detection_1.ChangeDetectionStrategy.Checked ||
            this.cdState === change_detection_1.ChangeDetectorState.Errored)
            return;
        if (this.destroyed) {
            this.throwDestroyedError('detectChanges');
        }
        if (this.debugMode) {
            this._resetDebug();
            try {
                this.detectChangesInternal(throwOnChange);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        }
        else {
            this.detectChangesInternal(throwOnChange);
        }
        if (this.cdMode === change_detection_1.ChangeDetectionStrategy.CheckOnce)
            this.cdMode = change_detection_1.ChangeDetectionStrategy.Checked;
        this.cdState = change_detection_1.ChangeDetectorState.CheckedBefore;
        profile_1.wtfLeave(s);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.detectChangesInternal = function (throwOnChange) {
        this.detectContentChildrenChanges(throwOnChange);
        this.detectViewChildrenChanges(throwOnChange);
    };
    AppView.prototype.detectContentChildrenChanges = function (throwOnChange) {
        for (var i = 0; i < this.contentChildren.length; ++i) {
            this.contentChildren[i].detectChanges(throwOnChange);
        }
    };
    AppView.prototype.detectViewChildrenChanges = function (throwOnChange) {
        for (var i = 0; i < this.viewChildren.length; ++i) {
            this.viewChildren[i].detectChanges(throwOnChange);
        }
    };
    AppView.prototype.literalArray = function (id, value) {
        var prevValue = this._literalArrayCache[id];
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (lang_1.isBlank(prevValue) || !view_utils_1.arrayLooseIdentical(prevValue, value)) {
            prevValue = this._literalArrayCache[id] = value;
        }
        return prevValue;
    };
    AppView.prototype.literalMap = function (id, value) {
        var prevValue = this._literalMapCache[id];
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (lang_1.isBlank(prevValue) || !view_utils_1.mapLooseIdentical(prevValue, value)) {
            prevValue = this._literalMapCache[id] = value;
        }
        return prevValue;
    };
    AppView.prototype.markAsCheckOnce = function () { this.cdMode = change_detection_1.ChangeDetectionStrategy.CheckOnce; };
    AppView.prototype.markPathToRootAsCheckOnce = function () {
        var c = this;
        while (lang_1.isPresent(c) && c.cdMode !== change_detection_1.ChangeDetectionStrategy.Detached) {
            if (c.cdMode === change_detection_1.ChangeDetectionStrategy.Checked) {
                c.cdMode = change_detection_1.ChangeDetectionStrategy.CheckOnce;
            }
            c = c.renderParent;
        }
    };
    AppView.prototype._resetDebug = function () { this._currentDebugContext = null; };
    AppView.prototype.debug = function (nodeIndex, rowNum, colNum) {
        return this._currentDebugContext = new debug_context_1.DebugContext(this, nodeIndex, rowNum, colNum);
    };
    AppView.prototype._rethrowWithContext = function (e, stack) {
        if (!(e instanceof exceptions_1.ViewWrappedException)) {
            if (!(e instanceof exceptions_1.ExpressionChangedAfterItHasBeenCheckedException)) {
                this.cdState = change_detection_1.ChangeDetectorState.Errored;
            }
            if (lang_1.isPresent(this._currentDebugContext)) {
                throw new exceptions_1.ViewWrappedException(e, stack, this._currentDebugContext);
            }
        }
    };
    AppView.prototype.eventHandler = function (cb) {
        var _this = this;
        if (this.debugMode) {
            return function (event) {
                _this._resetDebug();
                try {
                    return cb(event);
                }
                catch (e) {
                    _this._rethrowWithContext(e, e.stack);
                    throw e;
                }
            };
        }
        else {
            return cb;
        }
    };
    AppView.prototype.throwDestroyedError = function (details) { throw new exceptions_1.ViewDestroyedException(details); };
    return AppView;
}());
exports.AppView = AppView;
var HostViewFactory = (function () {
    function HostViewFactory(selector, viewFactory) {
        this.selector = selector;
        this.viewFactory = viewFactory;
    }
    HostViewFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Function])
    ], HostViewFactory);
    return HostViewFactory;
}());
exports.HostViewFactory = HostViewFactory;
function _findLastRenderNode(node) {
    var lastNode;
    if (node instanceof element_1.AppElement) {
        var appEl = node;
        lastNode = appEl.nativeElement;
        if (lang_1.isPresent(appEl.nestedViews)) {
            // Note: Views might have no root nodes at all!
            for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
                var nestedView = appEl.nestedViews[i];
                if (nestedView.rootNodesOrAppElements.length > 0) {
                    lastNode = _findLastRenderNode(nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
                }
            }
        }
    }
    else {
        lastNode = node;
    }
    return lastNode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtTkxjVG1CQ0kudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwyQkFPTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBR3hDLHdCQUF5QixXQUFXLENBQUMsQ0FBQTtBQUNyQyxxQkFXTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRTVELHlCQUEyQyxZQUFZLENBQUMsQ0FBQTtBQUd4RCwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsMkJBS08sY0FBYyxDQUFDLENBQUE7QUFDdEIsaUNBTU8scURBQXFELENBQUMsQ0FBQTtBQUM3RCx3QkFBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSwyQkFJTyxjQUFjLENBQUMsQ0FBQTtBQUN0Qiw4QkFBZ0QsaUJBQWlCLENBQUMsQ0FBQTtBQUNsRSxpQ0FBOEIsb0JBQW9CLENBQUMsQ0FBQTtBQUV0Qyw4QkFBc0IsR0FBRyxhQUFhLENBQUM7QUFFcEQsSUFBTSxhQUFhLEdBQUcsaUJBQVUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFFL0MsSUFBSSxZQUFZLEdBQWUsd0JBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXpFOzs7R0FHRztBQUNIO0lBZ0NFLGlCQUFtQixLQUFVLEVBQVMsYUFBa0MsRUFBUyxJQUFjLEVBQzVFLE1BQTRCLEVBQVMsV0FBNEIsRUFDakUsY0FBd0IsRUFBUyxxQkFBaUMsRUFDbEUsTUFBK0IsRUFBRSxxQkFBNkIsRUFDckUsbUJBQTJCLEVBQVMsb0JBQTJDO1FBSnhFLFVBQUssR0FBTCxLQUFLLENBQUs7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBcUI7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBQzVFLFdBQU0sR0FBTixN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YXBwZXIsXG4gIE1hcFdyYXBwZXIsXG4gIE1hcCxcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgaXNMaXN0TGlrZUl0ZXJhYmxlLFxuICBhcmVJdGVyYWJsZXNFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1xuICBhc3NlcnRpb25zRW5hYmxlZCxcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBUeXBlLFxuICBpc0FycmF5LFxuICBpc051bWJlcixcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNQcmltaXRpdmVcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1JlbmRlcmVyLCBSb290UmVuZGVyZXIsIFJlbmRlckNvbXBvbmVudFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtWaWV3UmVmXywgSG9zdFZpZXdGYWN0b3J5UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcblxuaW1wb3J0IHtBcHBWaWV3TWFuYWdlcl8sIEFwcFZpZXdNYW5hZ2VyfSBmcm9tICcuL3ZpZXdfbWFuYWdlcic7XG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1xuICBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzLFxuICBlbnN1cmVTbG90Q291bnQsXG4gIGFycmF5TG9vc2VJZGVudGljYWwsXG4gIG1hcExvb3NlSWRlbnRpY2FsXG59IGZyb20gJy4vdmlld191dGlscyc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yU3RhdGUsXG4gIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBkZXZNb2RlRXF1YWxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7d3RmQ3JlYXRlU2NvcGUsIHd0ZkxlYXZlLCBXdGZTY29wZUZufSBmcm9tICcuLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtcbiAgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24sXG4gIFZpZXdEZXN0cm95ZWRFeGNlcHRpb24sXG4gIFZpZXdXcmFwcGVkRXhjZXB0aW9uXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N0YXRpY05vZGVEZWJ1Z0luZm8sIERlYnVnQ29udGV4dH0gZnJvbSAnLi9kZWJ1Z19jb250ZXh0JztcbmltcG9ydCB7RWxlbWVudEluamVjdG9yfSBmcm9tICcuL2VsZW1lbnRfaW5qZWN0b3InO1xuXG5leHBvcnQgY29uc3QgSE9TVF9WSUVXX0VMRU1FTlRfTkFNRSA9ICckaG9zdFZpZXdFbCc7XG5cbmNvbnN0IEVNUFRZX0NPTlRFWFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbnZhciBfc2NvcGVfY2hlY2s6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZShgQXBwVmlldyNjaGVjayhhc2NpaSBpZClgKTtcblxuLyoqXG4gKiBDb3N0IG9mIG1ha2luZyBvYmplY3RzOiBodHRwOi8vanNwZXJmLmNvbS9pbnN0YW50aWF0ZS1zaXplLW9mLW9iamVjdFxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcFZpZXc8VD4ge1xuICByZWY6IFZpZXdSZWZfO1xuICByb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXTtcbiAgYWxsTm9kZXM6IGFueVtdO1xuICBkaXNwb3NhYmxlczogRnVuY3Rpb25bXTtcbiAgc3Vic2NyaXB0aW9uczogYW55W107XG4gIG5hbWVkQXBwRWxlbWVudHM6IHtba2V5OiBzdHJpbmddOiBBcHBFbGVtZW50fTtcbiAgY29udGVudENoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICB2aWV3Q2hpbGRyZW46IEFwcFZpZXc8YW55PltdID0gW107XG4gIHJlbmRlclBhcmVudDogQXBwVmlldzxhbnk+O1xuXG4gIHByaXZhdGUgX2xpdGVyYWxBcnJheUNhY2hlOiBhbnlbXVtdO1xuICBwcml2YXRlIF9saXRlcmFsTWFwQ2FjaGU6IEFycmF5PHtba2V5OiBzdHJpbmddOiBhbnl9PjtcblxuICAvLyBUaGUgbmFtZXMgb2YgdGhlIGJlbG93IGZpZWxkcyBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGNvZGVnZW5fbmFtZV91dGlsLnRzIG9yXG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBmYWlsLlxuICBjZFN0YXRlOiBDaGFuZ2VEZXRlY3RvclN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250ZXh0IGFnYWluc3Qgd2hpY2ggZGF0YS1iaW5kaW5nIGV4cHJlc3Npb25zIGluIHRoaXMgdmlldyBhcmUgZXZhbHVhdGVkIGFnYWluc3QuXG4gICAqIFRoaXMgaXMgYWx3YXlzIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgY29udGV4dDogVCA9IG51bGw7XG5cbiAgcHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+O1xuXG4gIGRlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjtcblxuICBwcml2YXRlIF9jdXJyZW50RGVidWdDb250ZXh0OiBEZWJ1Z0NvbnRleHQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjbGF6ejogYW55LCBwdWJsaWMgY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSwgcHVibGljIHR5cGU6IFZpZXdUeXBlLFxuICAgICAgICAgICAgICBwdWJsaWMgbG9jYWxzOiB7W2tleTogc3RyaW5nXTogYW55fSwgcHVibGljIHZpZXdNYW5hZ2VyOiBBcHBWaWV3TWFuYWdlcl8sXG4gICAgICAgICAgICAgIHB1YmxpYyBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIHB1YmxpYyBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBsaXRlcmFsQXJyYXlDYWNoZVNpemU6IG51bWJlcixcbiAgICAgICAgICAgICAgbGl0ZXJhbE1hcENhY2hlU2l6ZTogbnVtYmVyLCBwdWJsaWMgc3RhdGljTm9kZURlYnVnSW5mb3M6IFN0YXRpY05vZGVEZWJ1Z0luZm9bXSkge1xuICAgIHRoaXMucmVmID0gbmV3IFZpZXdSZWZfKHRoaXMpO1xuICAgIGlmICh0eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQgfHwgdHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IHZpZXdNYW5hZ2VyLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IGRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgIH1cbiAgICB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsQXJyYXlDYWNoZVNpemUpO1xuICAgIHRoaXMuX2xpdGVyYWxNYXBDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsTWFwQ2FjaGVTaXplKTtcbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICB2YXIgY29udGV4dDtcbiAgICB2YXIgcHJvamVjdGFibGVOb2RlcztcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIGNvbnRleHQgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5jb21wb25lbnQ7XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBlbnN1cmVTbG90Q291bnQoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmNvbXBvbmVudFR5cGUuc2xvdENvdW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZXh0O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgY29udGV4dCA9IEVNUFRZX0NPTlRFWFQ7XG4gICAgICAgIC8vIE5vdGU6IERvbid0IGVuc3VyZSB0aGUgc2xvdCBjb3VudCBmb3IgdGhlIHByb2plY3RhYmxlTm9kZXMgYXMgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlbSBvbmx5IGZvciB0aGUgY29udGFpbmVkIGNvbXBvbmVudCB2aWV3ICh3aGljaCB3aWxsIGxhdGVyIGNoZWNrIHRoZSBzbG90IGNvdW50Li4uKVxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLnByb2plY3RhYmxlTm9kZXMgPSBwcm9qZWN0YWJsZU5vZGVzO1xuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5jcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3IpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBjcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3I6IHN0cmluZyk6IHZvaWQge31cblxuICBpbml0KHJvb3ROb2Rlc09yQXBwRWxlbWVudHM6IGFueVtdLCBhbGxOb2RlczogYW55W10sIGFwcEVsZW1lbnRzOiB7W2tleTogc3RyaW5nXTogQXBwRWxlbWVudH0sXG4gICAgICAgZGlzcG9zYWJsZXM6IEZ1bmN0aW9uW10sIHN1YnNjcmlwdGlvbnM6IGFueVtdKSB7XG4gICAgdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzID0gcm9vdE5vZGVzT3JBcHBFbGVtZW50cztcbiAgICB0aGlzLmFsbE5vZGVzID0gYWxsTm9kZXM7XG4gICAgdGhpcy5uYW1lZEFwcEVsZW1lbnRzID0gYXBwRWxlbWVudHM7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IGRpc3Bvc2FibGVzO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAvLyBOb3RlOiB0aGUgcmVuZGVyIG5vZGVzIGhhdmUgYmVlbiBhdHRhY2hlZCB0byB0aGVpciBob3N0IGVsZW1lbnRcbiAgICAgIC8vIGluIHRoZSBWaWV3RmFjdG9yeSBhbHJlYWR5LlxuICAgICAgdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy52aWV3Q2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgIHRoaXMucmVuZGVyUGFyZW50ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldztcbiAgICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gIH1cblxuICBnZXRIb3N0Vmlld0VsZW1lbnQoKTogQXBwRWxlbWVudCB7IHJldHVybiB0aGlzLm5hbWVkQXBwRWxlbWVudHNbSE9TVF9WSUVXX0VMRU1FTlRfTkFNRV07IH1cblxuICBpbmplY3RvckdldCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RvckdldEludGVybmFsKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmplY3RvckdldEludGVybmFsKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBpbmplY3RvckdldEludGVybmFsKHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbm90Rm91bmRSZXN1bHQ7XG4gIH1cblxuICBpbmplY3Rvcihub2RlSW5kZXg6IG51bWJlcik6IEluamVjdG9yIHtcbiAgICBpZiAoaXNQcmVzZW50KG5vZGVJbmRleCkpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlbWVudEluamVjdG9yKHRoaXMsIG5vZGVJbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudEluamVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgY2hpbGRyZW4gPSB0aGlzLnZpZXdDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fZGVzdHJveUxvY2FsKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGVzdHJveUxvY2FsKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveUxvY2FsKCkge1xuICAgIHZhciBob3N0RWxlbWVudCA9XG4gICAgICAgIHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgdGhpcy5yZW5kZXJlci5kZXN0cm95Vmlldyhob3N0RWxlbWVudCwgdGhpcy5hbGxOb2Rlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpc3Bvc2FibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzW2ldKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUludGVybmFsKCk7XG5cbiAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkZXN0cm95SW50ZXJuYWwoKTogdm9pZCB7fVxuXG4gIGdldCBkZWJ1Z01vZGUoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5zdGF0aWNOb2RlRGVidWdJbmZvcyk7IH1cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXQgZmxhdFJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyk7IH1cblxuICBnZXQgbGFzdFJvb3ROb2RlKCk6IGFueSB7XG4gICAgdmFyIGxhc3ROb2RlID0gdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gX2ZpbmRMYXN0UmVuZGVyTm9kZShsYXN0Tm9kZSk7XG4gIH1cblxuICBoYXNMb2NhbChjb250ZXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5sb2NhbHMsIGNvbnRleHROYW1lKTtcbiAgfVxuXG4gIHNldExvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHsgdGhpcy5sb2NhbHNbY29udGV4dE5hbWVdID0gdmFsdWU7IH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgYWRkUmVuZGVyQ29udGVudENoaWxkKHZpZXc6IEFwcFZpZXc8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuY29udGVudENoaWxkcmVuLnB1c2godmlldyk7XG4gICAgdmlldy5yZW5kZXJQYXJlbnQgPSB0aGlzO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRlbnRDaGlsZCh2aWV3OiBBcHBWaWV3PGFueT4pOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5jb250ZW50Q2hpbGRyZW4sIHZpZXcpO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB2aWV3LnJlbmRlclBhcmVudCA9IG51bGw7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmNsYXp6KTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkIHx8XG4gICAgICAgIHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy50aHJvd0Rlc3Ryb3llZEVycm9yKCdkZXRlY3RDaGFuZ2VzJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkO1xuXG4gICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgdGhpcy5kZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICB9XG5cbiAgZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnRDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5jb250ZW50Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlld0NoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnZpZXdDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGxpdGVyYWxBcnJheShpZDogbnVtYmVyLCB2YWx1ZTogYW55W10pOiBhbnlbXSB7XG4gICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhYXJyYXlMb29zZUlkZW50aWNhbChwcmV2VmFsdWUsIHZhbHVlKSkge1xuICAgICAgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBsaXRlcmFsTWFwKGlkOiBudW1iZXIsIHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbE1hcENhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhbWFwTG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxNYXBDYWNoZVtpZF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHByZXZWYWx1ZTtcbiAgfVxuXG4gIG1hcmtBc0NoZWNrT25jZSgpOiB2b2lkIHsgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIHZhciBjOiBBcHBWaWV3PGFueT4gPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYykgJiYgYy5jZE1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIHtcbiAgICAgICAgYy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICB9XG4gICAgICBjID0gYy5yZW5kZXJQYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREZWJ1ZygpIHsgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG51bGw7IH1cblxuICBkZWJ1Zyhub2RlSW5kZXg6IG51bWJlciwgcm93TnVtOiBudW1iZXIsIGNvbE51bTogbnVtYmVyKTogRGVidWdDb250ZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG5ldyBEZWJ1Z0NvbnRleHQodGhpcywgbm9kZUluZGV4LCByb3dOdW0sIGNvbE51bSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXRocm93V2l0aENvbnRleHQoZTogYW55LCBzdGFjazogYW55KSB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIFZpZXdXcmFwcGVkRXhjZXB0aW9uKSkge1xuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBWaWV3V3JhcHBlZEV4Y2VwdGlvbihlLCBzdGFjaywgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHJldHVybiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBjYihldmVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNiO1xuICAgIH1cbiAgfVxuXG4gIHRocm93RGVzdHJveWVkRXJyb3IoZGV0YWlsczogc3RyaW5nKTogdm9pZCB7IHRocm93IG5ldyBWaWV3RGVzdHJveWVkRXhjZXB0aW9uKGRldGFpbHMpOyB9XG59XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSG9zdFZpZXdGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yOiBzdHJpbmcsIHB1YmxpYyB2aWV3RmFjdG9yeTogRnVuY3Rpb24pIHt9XG59XG5cbmZ1bmN0aW9uIF9maW5kTGFzdFJlbmRlck5vZGUobm9kZTogYW55KTogYW55IHtcbiAgdmFyIGxhc3ROb2RlO1xuICBpZiAobm9kZSBpbnN0YW5jZW9mIEFwcEVsZW1lbnQpIHtcbiAgICB2YXIgYXBwRWwgPSA8QXBwRWxlbWVudD5ub2RlO1xuICAgIGxhc3ROb2RlID0gYXBwRWwubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoaXNQcmVzZW50KGFwcEVsLm5lc3RlZFZpZXdzKSkge1xuICAgICAgLy8gTm90ZTogVmlld3MgbWlnaHQgaGF2ZSBubyByb290IG5vZGVzIGF0IGFsbCFcbiAgICAgIGZvciAodmFyIGkgPSBhcHBFbC5uZXN0ZWRWaWV3cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbmVzdGVkVmlldyA9IGFwcEVsLm5lc3RlZFZpZXdzW2ldO1xuICAgICAgICBpZiAobmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsYXN0Tm9kZSA9IF9maW5kTGFzdFJlbmRlck5vZGUoXG4gICAgICAgICAgICAgIG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50c1tuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxhc3ROb2RlID0gbm9kZTtcbiAgfVxuICByZXR1cm4gbGFzdE5vZGU7XG59XG4iXX0=