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
    AppView.prototype.checkPurePipe = function (id, newArgs) {
        var prevArgs = this._literalArrayCache[id];
        var newPresent = lang_1.isPresent(newArgs);
        var prevPresent = lang_1.isPresent(prevArgs);
        if (newPresent !== prevPresent || (newPresent && !view_utils_1.arrayLooseIdentical(prevArgs, newArgs))) {
            this._literalArrayCache[id] = newArgs;
            return true;
        }
        else {
            return false;
        }
    };
    AppView.prototype.literalArray = function (id, value) {
        if (lang_1.isBlank(value)) {
            return value;
        }
        var prevValue = this._literalArrayCache[id];
        if (lang_1.isBlank(prevValue) || !view_utils_1.arrayLooseIdentical(prevValue, value)) {
            prevValue = this._literalArrayCache[id] = value;
        }
        return prevValue;
    };
    AppView.prototype.literalMap = function (id, value) {
        if (lang_1.isBlank(value)) {
            return value;
        }
        var prevValue = this._literalMapCache[id];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtRklESlphTzkudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFPTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBR3hDLHdCQUF5QixXQUFXLENBQUMsQ0FBQTtBQUNyQyxxQkFZTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRTVELHlCQUF1QixZQUFZLENBQUMsQ0FBQTtBQUVwQywwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsMkJBTU8sY0FBYyxDQUFDLENBQUE7QUFDdEIsaUNBTU8scURBQXFELENBQUMsQ0FBQTtBQUM3RCx3QkFBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSwyQkFJTyxjQUFjLENBQUMsQ0FBQTtBQUN0Qiw4QkFBZ0QsaUJBQWlCLENBQUMsQ0FBQTtBQUNsRSxpQ0FBOEIsb0JBQW9CLENBQUMsQ0FBQTtBQUVuRCxJQUFNLGFBQWEsR0FBRyxpQkFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQyxJQUFJLFlBQVksR0FBZSx3QkFBYyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFekU7OztHQUdHO0FBQ0g7SUFrQ0UsaUJBQW1CLEtBQVUsRUFBUyxhQUFrQyxFQUFTLElBQWMsRUFDNUUsTUFBNEIsRUFBUyxTQUFvQixFQUN6RCxjQUF3QixFQUFTLHFCQUFpQyxFQUNsRSxNQUErQixFQUFFLHFCQUE2QixFQUNyRSxtQkFBMkIsRUFBUyxvQkFBMkM7UUFKeEUsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVU7UUFDNUUsV0FBTSxHQUFOLE1BQU0sQ0FBc0I7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FB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QTZYQztBQTdYcUIsZUFBTyxVQTZYNUIsQ0FBQTtBQUVELDZCQUE2QixJQUFTO0lBQ3BDLElBQUksUUFBUSxDQUFDO0lBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLG9CQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFlLElBQUksQ0FBQztRQUM3QixRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsK0NBQStDO1lBQy9DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsUUFBUSxHQUFHLG1CQUFtQixDQUMxQixVQUFVLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgTWFwV3JhcHBlcixcbiAgTWFwLFxuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGFyZUl0ZXJhYmxlc0VxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnLi9lbGVtZW50JztcbmltcG9ydCB7XG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIGlzQXJyYXksXG4gIGlzTnVtYmVyLFxuICBDT05TVCxcbiAgQ09OU1RfRVhQUixcbiAgc3RyaW5naWZ5LFxuICBpc1ByaW1pdGl2ZSxcbiAgaXNTdHJpbmdcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1JlbmRlcmVyLCBSb290UmVuZGVyZXIsIFJlbmRlckNvbXBvbmVudFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5cbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcbmltcG9ydCB7XG4gIFZpZXdVdGlscyxcbiAgZmxhdHRlbk5lc3RlZFZpZXdSZW5kZXJOb2RlcyxcbiAgZW5zdXJlU2xvdENvdW50LFxuICBhcnJheUxvb3NlSWRlbnRpY2FsLFxuICBtYXBMb29zZUlkZW50aWNhbFxufSBmcm9tICcuL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLFxuICBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgZGV2TW9kZUVxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge3d0ZkNyZWF0ZVNjb3BlLCB3dGZMZWF2ZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7XG4gIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLFxuICBWaWV3RGVzdHJveWVkRXhjZXB0aW9uLFxuICBWaWV3V3JhcHBlZEV4Y2VwdGlvblxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdGF0aWNOb2RlRGVidWdJbmZvLCBEZWJ1Z0NvbnRleHR9IGZyb20gJy4vZGVidWdfY29udGV4dCc7XG5pbXBvcnQge0VsZW1lbnRJbmplY3Rvcn0gZnJvbSAnLi9lbGVtZW50X2luamVjdG9yJztcblxuY29uc3QgRU1QVFlfQ09OVEVYVCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcblxudmFyIF9zY29wZV9jaGVjazogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKGBBcHBWaWV3I2NoZWNrKGFzY2lpIGlkKWApO1xuXG4vKipcbiAqIENvc3Qgb2YgbWFraW5nIG9iamVjdHM6IGh0dHA6Ly9qc3BlcmYuY29tL2luc3RhbnRpYXRlLXNpemUtb2Ytb2JqZWN0XG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQXBwVmlldzxUPiB7XG4gIHJlZjogVmlld1JlZl87XG4gIHJvb3ROb2Rlc09yQXBwRWxlbWVudHM6IGFueVtdO1xuICBhbGxOb2RlczogYW55W107XG4gIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdO1xuICBzdWJzY3JpcHRpb25zOiBhbnlbXTtcbiAgY29udGVudENoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICB2aWV3Q2hpbGRyZW46IEFwcFZpZXc8YW55PltdID0gW107XG4gIHJlbmRlclBhcmVudDogQXBwVmlldzxhbnk+O1xuICB2aWV3Q29udGFpbmVyRWxlbWVudDogQXBwRWxlbWVudCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfbGl0ZXJhbEFycmF5Q2FjaGU6IGFueVtdW107XG4gIHByaXZhdGUgX2xpdGVyYWxNYXBDYWNoZTogQXJyYXk8e1trZXk6IHN0cmluZ106IGFueX0+O1xuXG4gIC8vIFRoZSBuYW1lcyBvZiB0aGUgYmVsb3cgZmllbGRzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggY29kZWdlbl9uYW1lX3V0aWwudHMgb3JcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiB3aWxsIGZhaWwuXG4gIGNkU3RhdGU6IENoYW5nZURldGVjdG9yU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZDtcblxuICAvKipcbiAgICogVGhlIGNvbnRleHQgYWdhaW5zdCB3aGljaCBkYXRhLWJpbmRpbmcgZXhwcmVzc2lvbnMgaW4gdGhpcyB2aWV3IGFyZSBldmFsdWF0ZWQgYWdhaW5zdC5cbiAgICogVGhpcyBpcyBhbHdheXMgYSBjb21wb25lbnQgaW5zdGFuY2UuXG4gICAqL1xuICBjb250ZXh0OiBUID0gbnVsbDtcblxuICBwcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT47XG5cbiAgZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcmVuZGVyZXI6IFJlbmRlcmVyO1xuXG4gIHByaXZhdGUgX2N1cnJlbnREZWJ1Z0NvbnRleHQ6IERlYnVnQ29udGV4dCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfaGFzRXh0ZXJuYWxIb3N0RWxlbWVudDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2xheno6IGFueSwgcHVibGljIGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUsIHB1YmxpYyB0eXBlOiBWaWV3VHlwZSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2Fsczoge1trZXk6IHN0cmluZ106IGFueX0sIHB1YmxpYyB2aWV3VXRpbHM6IFZpZXdVdGlscyxcbiAgICAgICAgICAgICAgcHVibGljIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgcHVibGljIGRlY2xhcmF0aW9uQXBwRWxlbWVudDogQXBwRWxlbWVudCxcbiAgICAgICAgICAgICAgcHVibGljIGNkTW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIGxpdGVyYWxBcnJheUNhY2hlU2l6ZTogbnVtYmVyLFxuICAgICAgICAgICAgICBsaXRlcmFsTWFwQ2FjaGVTaXplOiBudW1iZXIsIHB1YmxpYyBzdGF0aWNOb2RlRGVidWdJbmZvczogU3RhdGljTm9kZURlYnVnSW5mb1tdKSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgVmlld1JlZl8odGhpcyk7XG4gICAgaWYgKHR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCB8fCB0eXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyID0gdmlld1V0aWxzLnJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJlciA9IGRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgIH1cbiAgICB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsQXJyYXlDYWNoZVNpemUpO1xuICAgIHRoaXMuX2xpdGVyYWxNYXBDYWNoZSA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsaXRlcmFsTWFwQ2FjaGVTaXplKTtcbiAgfVxuXG4gIGNyZWF0ZShnaXZlblByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPiwgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHtcbiAgICB2YXIgY29udGV4dDtcbiAgICB2YXIgcHJvamVjdGFibGVOb2RlcztcbiAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIGNvbnRleHQgPSB0aGlzLmRlY2xhcmF0aW9uQXBwRWxlbWVudC5jb21wb25lbnQ7XG4gICAgICAgIHByb2plY3RhYmxlTm9kZXMgPSBlbnN1cmVTbG90Q291bnQoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmNvbXBvbmVudFR5cGUuc2xvdENvdW50KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZXh0O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5wcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgY29udGV4dCA9IEVNUFRZX0NPTlRFWFQ7XG4gICAgICAgIC8vIE5vdGU6IERvbid0IGVuc3VyZSB0aGUgc2xvdCBjb3VudCBmb3IgdGhlIHByb2plY3RhYmxlTm9kZXMgYXMgd2Ugc3RvcmVcbiAgICAgICAgLy8gdGhlbSBvbmx5IGZvciB0aGUgY29udGFpbmVkIGNvbXBvbmVudCB2aWV3ICh3aGljaCB3aWxsIGxhdGVyIGNoZWNrIHRoZSBzbG90IGNvdW50Li4uKVxuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhpcy5faGFzRXh0ZXJuYWxIb3N0RWxlbWVudCA9IGlzUHJlc2VudChyb290U2VsZWN0b3JPck5vZGUpO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5wcm9qZWN0YWJsZU5vZGVzID0gcHJvamVjdGFibGVOb2RlcztcbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zLlxuICAgKiBSZXR1cm5zIHRoZSBBcHBFbGVtZW50IGZvciB0aGUgaG9zdCBlbGVtZW50IGZvciBWaWV3VHlwZS5IT1NULlxuICAgKi9cbiAgY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnkpOiBBcHBFbGVtZW50IHsgcmV0dXJuIG51bGw7IH1cblxuICBpbml0KHJvb3ROb2Rlc09yQXBwRWxlbWVudHM6IGFueVtdLCBhbGxOb2RlczogYW55W10sIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdLFxuICAgICAgIHN1YnNjcmlwdGlvbnM6IGFueVtdKSB7XG4gICAgdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzID0gcm9vdE5vZGVzT3JBcHBFbGVtZW50cztcbiAgICB0aGlzLmFsbE5vZGVzID0gYWxsTm9kZXM7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IGRpc3Bvc2FibGVzO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAvLyBOb3RlOiB0aGUgcmVuZGVyIG5vZGVzIGhhdmUgYmVlbiBhdHRhY2hlZCB0byB0aGVpciBob3N0IGVsZW1lbnRcbiAgICAgIC8vIGluIHRoZSBWaWV3RmFjdG9yeSBhbHJlYWR5LlxuICAgICAgdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy52aWV3Q2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgIHRoaXMucmVuZGVyUGFyZW50ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldztcbiAgICAgIHRoaXMuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gIH1cblxuICBzZWxlY3RPckNyZWF0ZUhvc3RFbGVtZW50KGVsZW1lbnROYW1lOiBzdHJpbmcsIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnQ3R4OiBEZWJ1Z0NvbnRleHQpOiBhbnkge1xuICAgIHZhciBob3N0RWxlbWVudDtcbiAgICBpZiAoaXNQcmVzZW50KHJvb3RTZWxlY3Rvck9yTm9kZSkpIHtcbiAgICAgIGhvc3RFbGVtZW50ID0gdGhpcy5yZW5kZXJlci5zZWxlY3RSb290RWxlbWVudChyb290U2VsZWN0b3JPck5vZGUsIGRlYnVnQ3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaG9zdEVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyLmNyZWF0ZUVsZW1lbnQobnVsbCwgZWxlbWVudE5hbWUsIGRlYnVnQ3R4KTtcbiAgICB9XG4gICAgcmV0dXJuIGhvc3RFbGVtZW50O1xuICB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbiwgbm9kZUluZGV4LCBub3RGb3VuZFJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbiwgbm9kZUluZGV4LCBub3RGb3VuZFJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5vdEZvdW5kUmVzdWx0O1xuICB9XG5cbiAgaW5qZWN0b3Iobm9kZUluZGV4OiBudW1iZXIpOiBJbmplY3RvciB7XG4gICAgaWYgKGlzUHJlc2VudChub2RlSW5kZXgpKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBub2RlSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRJbmplY3RvcjtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9oYXNFeHRlcm5hbEhvc3RFbGVtZW50KSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLmRldGFjaFZpZXcodGhpcy5mbGF0Um9vdE5vZGVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0aGlzLnZpZXdDb250YWluZXJFbGVtZW50KSkge1xuICAgICAgdGhpcy52aWV3Q29udGFpbmVyRWxlbWVudC5kZXRhY2hWaWV3KHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQubmVzdGVkVmlld3MuaW5kZXhPZih0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95UmVjdXJzZSgpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy5jb250ZW50Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gICAgfVxuICAgIGNoaWxkcmVuID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uX2Rlc3Ryb3lSZWN1cnNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fZGVzdHJveUxvY2FsKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGVzdHJveUxvY2FsKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVzdHJveUxvY2FsKCkge1xuICAgIHZhciBob3N0RWxlbWVudCA9XG4gICAgICAgIHRoaXMudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UID8gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpc3Bvc2FibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzW2ldKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgfVxuICAgIHRoaXMuZGVzdHJveUludGVybmFsKCk7XG4gICAgaWYgKHRoaXMuX2hhc0V4dGVybmFsSG9zdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuZGV0YWNoVmlldyh0aGlzLmZsYXRSb290Tm9kZXMpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQpKSB7XG4gICAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50LmRldGFjaFZpZXcodGhpcy52aWV3Q29udGFpbmVyRWxlbWVudC5uZXN0ZWRWaWV3cy5pbmRleE9mKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcmVyLmRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50LCB0aGlzLmFsbE5vZGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRlc3Ryb3lJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgZ2V0IGRlYnVnTW9kZSgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnN0YXRpY05vZGVEZWJ1Z0luZm9zKTsgfVxuXG4gIGdldCBjaGFuZ2VEZXRlY3RvclJlZigpOiBDaGFuZ2VEZXRlY3RvclJlZiB7IHJldHVybiB0aGlzLnJlZjsgfVxuXG4gIGdldCBmbGF0Um9vdE5vZGVzKCk6IGFueVtdIHsgcmV0dXJuIGZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXModGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzKTsgfVxuXG4gIGdldCBsYXN0Um9vdE5vZGUoKTogYW55IHtcbiAgICB2YXIgbGFzdE5vZGUgPSB0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50c1t0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMubGVuZ3RoIC0gMV0gOlxuICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIHJldHVybiBfZmluZExhc3RSZW5kZXJOb2RlKGxhc3ROb2RlKTtcbiAgfVxuXG4gIGhhc0xvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLmxvY2FscywgY29udGV4dE5hbWUpO1xuICB9XG5cbiAgc2V0TG9jYWwoY29udGV4dE5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQgeyB0aGlzLmxvY2Fsc1tjb250ZXh0TmFtZV0gPSB2YWx1ZTsgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge31cblxuICBhZGRSZW5kZXJDb250ZW50Q2hpbGQodmlldzogQXBwVmlldzxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50Q2hpbGRyZW4ucHVzaCh2aWV3KTtcbiAgICB2aWV3LnJlbmRlclBhcmVudCA9IHRoaXM7XG4gICAgdmlldy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgcmVtb3ZlQ29udGVudENoaWxkKHZpZXc6IEFwcFZpZXc8YW55Pik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLmNvbnRlbnRDaGlsZHJlbiwgdmlldyk7XG4gICAgdmlldy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIHZpZXcucmVuZGVyUGFyZW50ID0gbnVsbDtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHZhciBzID0gX3Njb3BlX2NoZWNrKHRoaXMuY2xhenopO1xuICAgIGlmICh0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQgfHxcbiAgICAgICAgdGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQgfHxcbiAgICAgICAgdGhpcy5jZFN0YXRlID09PSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQpXG4gICAgICByZXR1cm47XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLnRocm93RGVzdHJveWVkRXJyb3IoJ2RldGVjdENoYW5nZXMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICB0aGlzLl9yZXNldERlYnVnKCk7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2UpXG4gICAgICB0aGlzLmNkTW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQ7XG5cbiAgICB0aGlzLmNkU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkNoZWNrZWRCZWZvcmU7XG4gICAgd3RmTGVhdmUocyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcndyaXR0ZW4gYnkgaW1wbGVtZW50YXRpb25zXG4gICAqL1xuICBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwodGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGV0ZWN0Q29udGVudENoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB0aGlzLmRldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gIH1cblxuICBkZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGVudENoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLmNvbnRlbnRDaGlsZHJlbltpXS5kZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGRldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52aWV3Q2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMudmlld0NoaWxkcmVuW2ldLmRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9Db250ZW50Q2hpbGRyZW4ocmVuZGVyQXBwRWxlbWVudDogQXBwRWxlbWVudCk6IHZvaWQge1xuICAgIHJlbmRlckFwcEVsZW1lbnQucGFyZW50Vmlldy5jb250ZW50Q2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICB0aGlzLnZpZXdDb250YWluZXJFbGVtZW50ID0gcmVuZGVyQXBwRWxlbWVudDtcbiAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gIH1cblxuICByZW1vdmVGcm9tQ29udGVudENoaWxkcmVuKHJlbmRlckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUocmVuZGVyQXBwRWxlbWVudC5wYXJlbnRWaWV3LmNvbnRlbnRDaGlsZHJlbiwgdGhpcyk7XG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICAgIHRoaXMudmlld0NvbnRhaW5lckVsZW1lbnQgPSBudWxsO1xuICB9XG5cbiAgY2hlY2tQdXJlUGlwZShpZDogbnVtYmVyLCBuZXdBcmdzOiBhbnlbXSk6IGJvb2xlYW4ge1xuICAgIHZhciBwcmV2QXJncyA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXTtcbiAgICB2YXIgbmV3UHJlc2VudCA9IGlzUHJlc2VudChuZXdBcmdzKTtcbiAgICB2YXIgcHJldlByZXNlbnQgPSBpc1ByZXNlbnQocHJldkFyZ3MpO1xuICAgIGlmIChuZXdQcmVzZW50ICE9PSBwcmV2UHJlc2VudCB8fCAobmV3UHJlc2VudCAmJiAhYXJyYXlMb29zZUlkZW50aWNhbChwcmV2QXJncywgbmV3QXJncykpKSB7XG4gICAgICB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZVtpZF0gPSBuZXdBcmdzO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBsaXRlcmFsQXJyYXkoaWQ6IG51bWJlciwgdmFsdWU6IGFueVtdKTogYW55W10ge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGVbaWRdO1xuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIWFycmF5TG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcHJldlZhbHVlO1xuICB9XG5cbiAgbGl0ZXJhbE1hcChpZDogbnVtYmVyLCB2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsTWFwQ2FjaGVbaWRdO1xuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIW1hcExvb3NlSWRlbnRpY2FsKHByZXZWYWx1ZSwgdmFsdWUpKSB7XG4gICAgICBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsTWFwQ2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBtYXJrQXNDaGVja09uY2UoKTogdm9pZCB7IHRoaXMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlOyB9XG5cbiAgbWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpOiB2b2lkIHtcbiAgICB2YXIgYzogQXBwVmlldzxhbnk+ID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGMpICYmIGMuY2RNb2RlICE9PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCkge1xuICAgICAgaWYgKGMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkKSB7XG4gICAgICAgIGMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlO1xuICAgICAgfVxuICAgICAgYyA9IGMucmVuZGVyUGFyZW50O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc2V0RGVidWcoKSB7IHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBudWxsOyB9XG5cbiAgZGVidWcobm9kZUluZGV4OiBudW1iZXIsIHJvd051bTogbnVtYmVyLCBjb2xOdW06IG51bWJlcik6IERlYnVnQ29udGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBuZXcgRGVidWdDb250ZXh0KHRoaXMsIG5vZGVJbmRleCwgcm93TnVtLCBjb2xOdW0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmV0aHJvd1dpdGhDb250ZXh0KGU6IGFueSwgc3RhY2s6IGFueSkge1xuICAgIGlmICghKGUgaW5zdGFuY2VvZiBWaWV3V3JhcHBlZEV4Y2VwdGlvbikpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbikpIHtcbiAgICAgICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVmlld1dyYXBwZWRFeGNlcHRpb24oZSwgc3RhY2ssIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGV2ZW50SGFuZGxlcihjYjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gY2IoZXZlbnQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYjtcbiAgICB9XG4gIH1cblxuICB0aHJvd0Rlc3Ryb3llZEVycm9yKGRldGFpbHM6IHN0cmluZyk6IHZvaWQgeyB0aHJvdyBuZXcgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbihkZXRhaWxzKTsgfVxufVxuXG5mdW5jdGlvbiBfZmluZExhc3RSZW5kZXJOb2RlKG5vZGU6IGFueSk6IGFueSB7XG4gIHZhciBsYXN0Tm9kZTtcbiAgaWYgKG5vZGUgaW5zdGFuY2VvZiBBcHBFbGVtZW50KSB7XG4gICAgdmFyIGFwcEVsID0gPEFwcEVsZW1lbnQ+bm9kZTtcbiAgICBsYXN0Tm9kZSA9IGFwcEVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChhcHBFbC5uZXN0ZWRWaWV3cykpIHtcbiAgICAgIC8vIE5vdGU6IFZpZXdzIG1pZ2h0IGhhdmUgbm8gcm9vdCBub2RlcyBhdCBhbGwhXG4gICAgICBmb3IgKHZhciBpID0gYXBwRWwubmVzdGVkVmlld3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIG5lc3RlZFZpZXcgPSBhcHBFbC5uZXN0ZWRWaWV3c1tpXTtcbiAgICAgICAgaWYgKG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGFzdE5vZGUgPSBfZmluZExhc3RSZW5kZXJOb2RlKFxuICAgICAgICAgICAgICBuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsYXN0Tm9kZSA9IG5vZGU7XG4gIH1cbiAgcmV0dXJuIGxhc3ROb2RlO1xufVxuIl19