'use strict';"use strict";
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
var EMPTY_CONTEXT = lang_1.CONST_EXPR(new Object());
var _scope_check = profile_1.wtfCreateScope("AppView#check(ascii id)");
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(clazz, componentType, type, locals, viewUtils, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize, staticNodeDebugInfos) {
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.locals = locals;
        this.viewUtils = viewUtils;
        this.parentInjector = parentInjector;
        this.declarationAppElement = declarationAppElement;
        this.cdMode = cdMode;
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this.contentChildren = [];
        this.viewChildren = [];
        this.viewContainerElement = null;
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
            this.renderer = viewUtils.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
        this._literalArrayCache = collection_1.ListWrapper.createFixedSize(literalArrayCacheSize);
        this._literalMapCache = collection_1.ListWrapper.createFixedSize(literalMapCacheSize);
    }
    AppView.prototype.create = function (givenProjectableNodes, rootSelectorOrNode) {
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
        this._hasExternalHostElement = lang_1.isPresent(rootSelectorOrNode);
        this.context = context;
        this.projectableNodes = projectableNodes;
        if (this.debugMode) {
            this._resetDebug();
            try {
                return this.createInternal(rootSelectorOrNode);
            }
            catch (e) {
                this._rethrowWithContext(e, e.stack);
                throw e;
            }
        }
        else {
            return this.createInternal(rootSelectorOrNode);
        }
    };
    /**
     * Overwritten by implementations.
     * Returns the AppElement for the host element for ViewType.HOST.
     */
    AppView.prototype.createInternal = function (rootSelectorOrNode) { return null; };
    AppView.prototype.init = function (rootNodesOrAppElements, allNodes, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
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
    AppView.prototype.selectOrCreateHostElement = function (elementName, rootSelectorOrNode, debugCtx) {
        var hostElement;
        if (lang_1.isPresent(rootSelectorOrNode)) {
            hostElement = this.renderer.selectRootElement(rootSelectorOrNode, debugCtx);
        }
        else {
            hostElement = this.renderer.createElement(null, elementName, debugCtx);
        }
        return hostElement;
    };
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
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (lang_1.isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        this._destroyRecurse();
    };
    AppView.prototype._destroyRecurse = function () {
        if (this.destroyed) {
            return;
        }
        var children = this.contentChildren;
        for (var i = 0; i < children.length; i++) {
            children[i]._destroyRecurse();
        }
        children = this.viewChildren;
        for (var i = 0; i < children.length; i++) {
            children[i]._destroyRecurse();
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
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            async_1.ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        if (this._hasExternalHostElement) {
            this.renderer.detachView(this.flatRootNodes);
        }
        else if (lang_1.isPresent(this.viewContainerElement)) {
            this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
        }
        else {
            this.dirtyParentQueriesInternal();
        }
        this.renderer.destroyView(hostElement, this.allNodes);
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
    AppView.prototype.addToContentChildren = function (renderAppElement) {
        renderAppElement.parentView.contentChildren.push(this);
        this.viewContainerElement = renderAppElement;
        this.dirtyParentQueriesInternal();
    };
    AppView.prototype.removeFromContentChildren = function (renderAppElement) {
        collection_1.ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
        this.dirtyParentQueriesInternal();
        this.viewContainerElement = null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtS253YWpSbFIudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFPTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBR3hDLHdCQUF5QixXQUFXLENBQUMsQ0FBQTtBQUNyQyxxQkFZTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRTVELHlCQUF1QixZQUFZLENBQUMsQ0FBQTtBQUVwQywwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsMkJBTU8sY0FBYyxDQUFDLENBQUE7QUFDdEIsaUNBTU8scURBQXFELENBQUMsQ0FBQTtBQUM3RCx3QkFBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSwyQkFJTyxjQUFjLENBQUMsQ0FBQTtBQUN0Qiw4QkFBZ0QsaUJBQWlCLENBQUMsQ0FBQTtBQUNsRSxpQ0FBOEIsb0JBQW9CLENBQUMsQ0FBQTtBQUVuRCxJQUFNLGFBQWEsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQyxJQUFJLFlBQVksR0FBZSx3QkFBYyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFekU7OztHQUdHO0FBQ0g7SUFrQ0UsaUJBQW1CLEtBQVUsRUFBUyxhQUFrQyxFQUFTLElBQWMsRUFDNUUsTUFBNEIsRUFBUyxTQUFvQixFQUN6RCxjQUF3QixFQUFTLHFCQUFpQyxFQUNsRSxNQUErQixFQUFFLHFCQUE2QixFQUNyRSxtQkFBMkIsRUFBUyxvQkFBMkM7UUFKeEUsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVU7UUFDNUUsV0FBTSxHQUFOLE1BQU0sQ0FBc0I7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FB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Q0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELFFBQVEsR0FBRyxtQkFBbUIsQ0FDMUIsVUFBVSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkYsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sUUFBUSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTGlzdFdyYXBwZXIsXG4gIE1hcFdyYXBwZXIsXG4gIE1hcCxcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgaXNMaXN0TGlrZUl0ZXJhYmxlLFxuICBhcmVJdGVyYWJsZXNFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FwcEVsZW1lbnR9IGZyb20gJy4vZWxlbWVudCc7XG5pbXBvcnQge1xuICBhc3NlcnRpb25zRW5hYmxlZCxcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBUeXBlLFxuICBpc0FycmF5LFxuICBpc051bWJlcixcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNQcmltaXRpdmUsXG4gIGlzU3RyaW5nXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld1JlZl99IGZyb20gJy4vdmlld19yZWYnO1xuXG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1xuICBWaWV3VXRpbHMsXG4gIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMsXG4gIGVuc3VyZVNsb3RDb3VudCxcbiAgYXJyYXlMb29zZUlkZW50aWNhbCxcbiAgbWFwTG9vc2VJZGVudGljYWxcbn0gZnJvbSAnLi92aWV3X3V0aWxzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSxcbiAgaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIGRldk1vZGVFcXVhbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge1xuICBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbixcbiAgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbixcbiAgVmlld1dyYXBwZWRFeGNlcHRpb25cbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7U3RhdGljTm9kZURlYnVnSW5mbywgRGVidWdDb250ZXh0fSBmcm9tICcuL2RlYnVnX2NvbnRleHQnO1xuaW1wb3J0IHtFbGVtZW50SW5qZWN0b3J9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5cbmNvbnN0IEVNUFRZX0NPTlRFWFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbnZhciBfc2NvcGVfY2hlY2s6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZShgQXBwVmlldyNjaGVjayhhc2NpaSBpZClgKTtcblxuLyoqXG4gKiBDb3N0IG9mIG1ha2luZyBvYmplY3RzOiBodHRwOi8vanNwZXJmLmNvbS9pbnN0YW50aWF0ZS1zaXplLW9mLW9iamVjdFxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcFZpZXc8VD4ge1xuICByZWY6IFZpZXdSZWZfO1xuICByb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXTtcbiAgYWxsTm9kZXM6IGFueVtdO1xuICBkaXNwb3NhYmxlczogRnVuY3Rpb25bXTtcbiAgc3Vic2NyaXB0aW9uczogYW55W107XG4gIGNvbnRlbnRDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICByZW5kZXJQYXJlbnQ6IEFwcFZpZXc8YW55PjtcbiAgdmlld0NvbnRhaW5lckVsZW1lbnQ6IEFwcEVsZW1lbnQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2xpdGVyYWxBcnJheUNhY2hlOiBhbnlbXVtdO1xuICBwcml2YXRlIF9saXRlcmFsTWFwQ2FjaGU6IEFycmF5PHtba2V5OiBzdHJpbmddOiBhbnl9PjtcblxuICAvLyBUaGUgbmFtZXMgb2YgdGhlIGJlbG93IGZpZWxkcyBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGNvZGVnZW5fbmFtZV91dGlsLnRzIG9yXG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBmYWlsLlxuICBjZFN0YXRlOiBDaGFuZ2VEZXRlY3RvclN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250ZXh0IGFnYWluc3Qgd2hpY2ggZGF0YS1iaW5kaW5nIGV4cHJlc3Npb25zIGluIHRoaXMgdmlldyBhcmUgZXZhbHVhdGVkIGFnYWluc3QuXG4gICAqIFRoaXMgaXMgYWx3YXlzIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cbiAgY29udGV4dDogVCA9IG51bGw7XG5cbiAgcHJvamVjdGFibGVOb2RlczogQXJyYXk8YW55IHwgYW55W10+O1xuXG4gIGRlc3Ryb3llZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHJlbmRlcmVyOiBSZW5kZXJlcjtcblxuICBwcml2YXRlIF9jdXJyZW50RGVidWdDb250ZXh0OiBEZWJ1Z0NvbnRleHQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNsYXp6OiBhbnksIHB1YmxpYyBjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlLCBwdWJsaWMgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIHB1YmxpYyBsb2NhbHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBwdWJsaWMgdmlld1V0aWxzOiBWaWV3VXRpbHMsXG4gICAgICAgICAgICAgIHB1YmxpYyBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBkZWNsYXJhdGlvbkFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIHB1YmxpYyBjZE1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBsaXRlcmFsQXJyYXlDYWNoZVNpemU6IG51bWJlcixcbiAgICAgICAgICAgICAgbGl0ZXJhbE1hcENhY2hlU2l6ZTogbnVtYmVyLCBwdWJsaWMgc3RhdGljTm9kZURlYnVnSW5mb3M6IFN0YXRpY05vZGVEZWJ1Z0luZm9bXSkge1xuICAgIHRoaXMucmVmID0gbmV3IFZpZXdSZWZfKHRoaXMpO1xuICAgIGlmICh0eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQgfHwgdHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IHZpZXdVdGlscy5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyZXIgPSBkZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5yZW5kZXJlcjtcbiAgICB9XG4gICAgdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGUgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGl0ZXJhbEFycmF5Q2FjaGVTaXplKTtcbiAgICB0aGlzLl9saXRlcmFsTWFwQ2FjaGUgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGl0ZXJhbE1hcENhY2hlU2l6ZSk7XG4gIH1cblxuICBjcmVhdGUoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT4sIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7XG4gICAgdmFyIGNvbnRleHQ7XG4gICAgdmFyIHByb2plY3RhYmxlTm9kZXM7XG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgVmlld1R5cGUuQ09NUE9ORU5UOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQuY29tcG9uZW50O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZW5zdXJlU2xvdENvdW50KGdpdmVuUHJvamVjdGFibGVOb2RlcywgdGhpcy5jb21wb25lbnRUeXBlLnNsb3RDb3VudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBWaWV3VHlwZS5FTUJFRERFRDpcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGV4dDtcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcucHJvamVjdGFibGVOb2RlcztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkhPU1Q6XG4gICAgICAgIGNvbnRleHQgPSBFTVBUWV9DT05URVhUO1xuICAgICAgICAvLyBOb3RlOiBEb24ndCBlbnN1cmUgdGhlIHNsb3QgY291bnQgZm9yIHRoZSBwcm9qZWN0YWJsZU5vZGVzIGFzIHdlIHN0b3JlXG4gICAgICAgIC8vIHRoZW0gb25seSBmb3IgdGhlIGNvbnRhaW5lZCBjb21wb25lbnQgdmlldyAod2hpY2ggd2lsbCBsYXRlciBjaGVjayB0aGUgc2xvdCBjb3VudC4uLilcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IGdpdmVuUHJvamVjdGFibGVOb2RlcztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQgPSBpc1ByZXNlbnQocm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMucHJvamVjdGFibGVOb2RlcyA9IHByb2plY3RhYmxlTm9kZXM7XG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3JPck5vZGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9ucy5cbiAgICogUmV0dXJucyB0aGUgQXBwRWxlbWVudCBmb3IgdGhlIGhvc3QgZWxlbWVudCBmb3IgVmlld1R5cGUuSE9TVC5cbiAgICovXG4gIGNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55KTogQXBwRWxlbWVudCB7IHJldHVybiBudWxsOyB9XG5cbiAgaW5pdChyb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXSwgYWxsTm9kZXM6IGFueVtdLCBkaXNwb3NhYmxlczogRnVuY3Rpb25bXSxcbiAgICAgICBzdWJzY3JpcHRpb25zOiBhbnlbXSkge1xuICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyA9IHJvb3ROb2Rlc09yQXBwRWxlbWVudHM7XG4gICAgdGhpcy5hbGxOb2RlcyA9IGFsbE5vZGVzO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgLy8gTm90ZTogdGhlIHJlbmRlciBub2RlcyBoYXZlIGJlZW4gYXR0YWNoZWQgdG8gdGhlaXIgaG9zdCBlbGVtZW50XG4gICAgICAvLyBpbiB0aGUgVmlld0ZhY3RvcnkgYWxyZWFkeS5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcudmlld0NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICB0aGlzLnJlbmRlclBhcmVudCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXc7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0T3JDcmVhdGVIb3N0RWxlbWVudChlbGVtZW50TmFtZTogc3RyaW5nLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0N0eDogRGVidWdDb250ZXh0KTogYW55IHtcbiAgICB2YXIgaG9zdEVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChyb290U2VsZWN0b3JPck5vZGUpKSB7XG4gICAgICBob3N0RWxlbWVudCA9IHRoaXMucmVuZGVyZXIuc2VsZWN0Um9vdEVsZW1lbnQocm9vdFNlbGVjdG9yT3JOb2RlLCBkZWJ1Z0N0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhvc3RFbGVtZW50ID0gdGhpcy5yZW5kZXJlci5jcmVhdGVFbGVtZW50KG51bGwsIGVsZW1lbnROYW1lLCBkZWJ1Z0N0eCk7XG4gICAgfVxuICAgIHJldHVybiBob3N0RWxlbWVudDtcbiAgfVxuXG4gIGluamVjdG9yR2V0KHRva2VuOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBub3RGb3VuZFJlc3VsdDogYW55KTogYW55IHtcbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdG9yR2V0SW50ZXJuYWwodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmluamVjdG9yR2V0SW50ZXJuYWwodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGluamVjdG9yR2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBub3RGb3VuZFJlc3VsdDtcbiAgfVxuXG4gIGluamVjdG9yKG5vZGVJbmRleDogbnVtYmVyKTogSW5qZWN0b3Ige1xuICAgIGlmIChpc1ByZXNlbnQobm9kZUluZGV4KSkge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgbm9kZUluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50SW5qZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5kZXRhY2hWaWV3KHRoaXMuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCkpIHtcbiAgICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQuZGV0YWNoVmlldyh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50Lm5lc3RlZFZpZXdzLmluZGV4T2YodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95UmVjdXJzZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveVJlY3Vyc2UoKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICBjaGlsZHJlbiA9IHRoaXMudmlld0NoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLl9kZXN0cm95UmVjdXJzZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lMb2NhbCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lMb2NhbCgpO1xuICAgIH1cblxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3lMb2NhbCgpIHtcbiAgICB2YXIgaG9zdEVsZW1lbnQgPVxuICAgICAgICB0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCA/IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgOiBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwb3NhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlc1tpXSgpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLnN1YnNjcmlwdGlvbnNbaV0pO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lJbnRlcm5hbCgpO1xuICAgIGlmICh0aGlzLl9oYXNFeHRlcm5hbEhvc3RFbGVtZW50KSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLmRldGFjaFZpZXcodGhpcy5mbGF0Um9vdE5vZGVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50KSkge1xuICAgICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudC5kZXRhY2hWaWV3KHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQubmVzdGVkVmlld3MuaW5kZXhPZih0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJlci5kZXN0cm95Vmlldyhob3N0RWxlbWVudCwgdGhpcy5hbGxOb2Rlcyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkZXN0cm95SW50ZXJuYWwoKTogdm9pZCB7fVxuXG4gIGdldCBkZWJ1Z01vZGUoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5zdGF0aWNOb2RlRGVidWdJbmZvcyk7IH1cblxuICBnZXQgY2hhbmdlRGV0ZWN0b3JSZWYoKTogQ2hhbmdlRGV0ZWN0b3JSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXQgZmxhdFJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzKHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyk7IH1cblxuICBnZXQgbGFzdFJvb3ROb2RlKCk6IGFueSB7XG4gICAgdmFyIGxhc3ROb2RlID0gdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdIDpcbiAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICByZXR1cm4gX2ZpbmRMYXN0UmVuZGVyTm9kZShsYXN0Tm9kZSk7XG4gIH1cblxuICBoYXNMb2NhbChjb250ZXh0TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModGhpcy5sb2NhbHMsIGNvbnRleHROYW1lKTtcbiAgfVxuXG4gIHNldExvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHsgdGhpcy5sb2NhbHNbY29udGV4dE5hbWVdID0gdmFsdWU7IH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgYWRkUmVuZGVyQ29udGVudENoaWxkKHZpZXc6IEFwcFZpZXc8YW55Pik6IHZvaWQge1xuICAgIHRoaXMuY29udGVudENoaWxkcmVuLnB1c2godmlldyk7XG4gICAgdmlldy5yZW5kZXJQYXJlbnQgPSB0aGlzO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIHJlbW92ZUNvbnRlbnRDaGlsZCh2aWV3OiBBcHBWaWV3PGFueT4pOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5jb250ZW50Q2hpbGRyZW4sIHZpZXcpO1xuICAgIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB2aWV3LnJlbmRlclBhcmVudCA9IG51bGw7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmNsYXp6KTtcbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkIHx8XG4gICAgICAgIHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8XG4gICAgICAgIHRoaXMuY2RTdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgdGhpcy50aHJvd0Rlc3Ryb3llZEVycm9yKCdkZXRlY3RDaGFuZ2VzJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkO1xuXG4gICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgdGhpcy5kZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICB9XG5cbiAgZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRlbnRDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5jb250ZW50Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBkZXRlY3RWaWV3Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmlld0NoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLnZpZXdDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICByZW5kZXJBcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGVudENoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudCA9IHJlbmRlckFwcEVsZW1lbnQ7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNvbnRlbnRDaGlsZHJlbihyZW5kZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50KTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4sIHRoaXMpO1xuICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gbnVsbDtcbiAgfVxuXG4gIGxpdGVyYWxBcnJheShpZDogbnVtYmVyLCB2YWx1ZTogYW55W10pOiBhbnlbXSB7XG4gICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhYXJyYXlMb29zZUlkZW50aWNhbChwcmV2VmFsdWUsIHZhbHVlKSkge1xuICAgICAgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBsaXRlcmFsTWFwKGlkOiBudW1iZXIsIHZhbHVlOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbE1hcENhY2hlW2lkXTtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCAhbWFwTG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxNYXBDYWNoZVtpZF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHByZXZWYWx1ZTtcbiAgfVxuXG4gIG1hcmtBc0NoZWNrT25jZSgpOiB2b2lkIHsgdGhpcy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIHZhciBjOiBBcHBWaWV3PGFueT4gPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYykgJiYgYy5jZE1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIHtcbiAgICAgICAgYy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICB9XG4gICAgICBjID0gYy5yZW5kZXJQYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVzZXREZWJ1ZygpIHsgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG51bGw7IH1cblxuICBkZWJ1Zyhub2RlSW5kZXg6IG51bWJlciwgcm93TnVtOiBudW1iZXIsIGNvbE51bTogbnVtYmVyKTogRGVidWdDb250ZXh0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCA9IG5ldyBEZWJ1Z0NvbnRleHQodGhpcywgbm9kZUluZGV4LCByb3dOdW0sIGNvbE51bSk7XG4gIH1cblxuICBwcml2YXRlIF9yZXRocm93V2l0aENvbnRleHQoZTogYW55LCBzdGFjazogYW55KSB7XG4gICAgaWYgKCEoZSBpbnN0YW5jZW9mIFZpZXdXcmFwcGVkRXhjZXB0aW9uKSkge1xuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBWaWV3V3JhcHBlZEV4Y2VwdGlvbihlLCBzdGFjaywgdGhpcy5fY3VycmVudERlYnVnQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXZlbnRIYW5kbGVyKGNiOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHJldHVybiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBjYihldmVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNiO1xuICAgIH1cbiAgfVxuXG4gIHRocm93RGVzdHJveWVkRXJyb3IoZGV0YWlsczogc3RyaW5nKTogdm9pZCB7IHRocm93IG5ldyBWaWV3RGVzdHJveWVkRXhjZXB0aW9uKGRldGFpbHMpOyB9XG59XG5cbmZ1bmN0aW9uIF9maW5kTGFzdFJlbmRlck5vZGUobm9kZTogYW55KTogYW55IHtcbiAgdmFyIGxhc3ROb2RlO1xuICBpZiAobm9kZSBpbnN0YW5jZW9mIEFwcEVsZW1lbnQpIHtcbiAgICB2YXIgYXBwRWwgPSA8QXBwRWxlbWVudD5ub2RlO1xuICAgIGxhc3ROb2RlID0gYXBwRWwubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoaXNQcmVzZW50KGFwcEVsLm5lc3RlZFZpZXdzKSkge1xuICAgICAgLy8gTm90ZTogVmlld3MgbWlnaHQgaGF2ZSBubyByb290IG5vZGVzIGF0IGFsbCFcbiAgICAgIGZvciAodmFyIGkgPSBhcHBFbC5uZXN0ZWRWaWV3cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbmVzdGVkVmlldyA9IGFwcEVsLm5lc3RlZFZpZXdzW2ldO1xuICAgICAgICBpZiAobmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsYXN0Tm9kZSA9IF9maW5kTGFzdFJlbmRlck5vZGUoXG4gICAgICAgICAgICAgIG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50c1tuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxhc3ROb2RlID0gbm9kZTtcbiAgfVxuICByZXR1cm4gbGFzdE5vZGU7XG59XG4iXX0=