var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { AppElement } from './element';
import { isPresent, isBlank, CONST, CONST_EXPR } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { flattenNestedViewRenderNodes, ensureSlotCount, arrayLooseIdentical, mapLooseIdentical } from './view_utils';
import { ChangeDetectionStrategy, ChangeDetectorState } from 'angular2/src/core/change_detection/change_detection';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { ExpressionChangedAfterItHasBeenCheckedException, ViewDestroyedException, ViewWrappedException } from './exceptions';
import { DebugContext } from './debug_context';
import { ElementInjector } from './element_injector';
export const HOST_VIEW_ELEMENT_NAME = '$hostViewEl';
const EMPTY_CONTEXT = CONST_EXPR(new Object());
var _scope_check = wtfCreateScope(`AppView#check(ascii id)`);
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement, cdMode, literalArrayCacheSize, literalMapCacheSize, staticNodeDebugInfos) {
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
        this.cdState = ChangeDetectorState.NeverChecked;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this._currentDebugContext = null;
        this.ref = new ViewRef_(this);
        if (type === ViewType.COMPONENT || type === ViewType.HOST) {
            this.renderer = viewManager.renderComponent(componentType);
        }
        else {
            this.renderer = declarationAppElement.parentView.renderer;
        }
        this._literalArrayCache = ListWrapper.createFixedSize(literalArrayCacheSize);
        this._literalMapCache = ListWrapper.createFixedSize(literalMapCacheSize);
    }
    create(givenProjectableNodes, rootSelector) {
        var context;
        var projectableNodes;
        switch (this.type) {
            case ViewType.COMPONENT:
                context = this.declarationAppElement.component;
                projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                break;
            case ViewType.EMBEDDED:
                context = this.declarationAppElement.parentView.context;
                projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                break;
            case ViewType.HOST:
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
    }
    /**
     * Overwritten by implementations
     */
    createInternal(rootSelector) { }
    init(rootNodesOrAppElements, allNodes, appElements, disposables, subscriptions) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.namedAppElements = appElements;
        this.disposables = disposables;
        this.subscriptions = subscriptions;
        if (this.type === ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.declarationAppElement.parentView.viewChildren.push(this);
            this.renderParent = this.declarationAppElement.parentView;
            this.dirtyParentQueriesInternal();
        }
    }
    getHostViewElement() { return this.namedAppElements[HOST_VIEW_ELEMENT_NAME]; }
    injectorGet(token, nodeIndex, notFoundResult) {
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
    }
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token, nodeIndex, notFoundResult) {
        return notFoundResult;
    }
    injector(nodeIndex) {
        if (isPresent(nodeIndex)) {
            return new ElementInjector(this, nodeIndex);
        }
        else {
            return this.parentInjector;
        }
    }
    destroy() {
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
    }
    _destroyLocal() {
        var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
        this.renderer.destroyView(hostElement, this.allNodes);
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        for (var i = 0; i < this.subscriptions.length; i++) {
            ObservableWrapper.dispose(this.subscriptions[i]);
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
    }
    /**
     * Overwritten by implementations
     */
    destroyInternal() { }
    get debugMode() { return isPresent(this.staticNodeDebugInfos); }
    get changeDetectorRef() { return this.ref; }
    get flatRootNodes() { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }
    get lastRootNode() {
        var lastNode = this.rootNodesOrAppElements.length > 0 ?
            this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
            null;
        return _findLastRenderNode(lastNode);
    }
    hasLocal(contextName) {
        return StringMapWrapper.contains(this.locals, contextName);
    }
    setLocal(contextName, value) { this.locals[contextName] = value; }
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal() { }
    addRenderContentChild(view) {
        this.contentChildren.push(view);
        view.renderParent = this;
        view.dirtyParentQueriesInternal();
    }
    removeContentChild(view) {
        ListWrapper.remove(this.contentChildren, view);
        view.dirtyParentQueriesInternal();
        view.renderParent = null;
    }
    detectChanges(throwOnChange) {
        var s = _scope_check(this.clazz);
        if (this.cdMode === ChangeDetectionStrategy.Detached ||
            this.cdMode === ChangeDetectionStrategy.Checked ||
            this.cdState === ChangeDetectorState.Errored)
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
        if (this.cdMode === ChangeDetectionStrategy.CheckOnce)
            this.cdMode = ChangeDetectionStrategy.Checked;
        this.cdState = ChangeDetectorState.CheckedBefore;
        wtfLeave(s);
    }
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange) {
        this.detectContentChildrenChanges(throwOnChange);
        this.detectViewChildrenChanges(throwOnChange);
    }
    detectContentChildrenChanges(throwOnChange) {
        for (var i = 0; i < this.contentChildren.length; ++i) {
            this.contentChildren[i].detectChanges(throwOnChange);
        }
    }
    detectViewChildrenChanges(throwOnChange) {
        for (var i = 0; i < this.viewChildren.length; ++i) {
            this.viewChildren[i].detectChanges(throwOnChange);
        }
    }
    literalArray(id, value) {
        var prevValue = this._literalArrayCache[id];
        if (isBlank(value)) {
            return value;
        }
        if (isBlank(prevValue) || !arrayLooseIdentical(prevValue, value)) {
            prevValue = this._literalArrayCache[id] = value;
        }
        return prevValue;
    }
    literalMap(id, value) {
        var prevValue = this._literalMapCache[id];
        if (isBlank(value)) {
            return value;
        }
        if (isBlank(prevValue) || !mapLooseIdentical(prevValue, value)) {
            prevValue = this._literalMapCache[id] = value;
        }
        return prevValue;
    }
    markAsCheckOnce() { this.cdMode = ChangeDetectionStrategy.CheckOnce; }
    markPathToRootAsCheckOnce() {
        var c = this;
        while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
            if (c.cdMode === ChangeDetectionStrategy.Checked) {
                c.cdMode = ChangeDetectionStrategy.CheckOnce;
            }
            c = c.renderParent;
        }
    }
    _resetDebug() { this._currentDebugContext = null; }
    debug(nodeIndex, rowNum, colNum) {
        return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
    }
    _rethrowWithContext(e, stack) {
        if (!(e instanceof ViewWrappedException)) {
            if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
                this.cdState = ChangeDetectorState.Errored;
            }
            if (isPresent(this._currentDebugContext)) {
                throw new ViewWrappedException(e, stack, this._currentDebugContext);
            }
        }
    }
    eventHandler(cb) {
        if (this.debugMode) {
            return (event) => {
                this._resetDebug();
                try {
                    return cb(event);
                }
                catch (e) {
                    this._rethrowWithContext(e, e.stack);
                    throw e;
                }
            };
        }
        else {
            return cb;
        }
    }
    throwDestroyedError(details) { throw new ViewDestroyedException(details); }
}
export let HostViewFactory = class HostViewFactory {
    constructor(selector, viewFactory) {
        this.selector = selector;
        this.viewFactory = viewFactory;
    }
};
HostViewFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function])
], HostViewFactory);
function _findLastRenderNode(node) {
    var lastNode;
    if (node instanceof AppElement) {
        var appEl = node;
        lastNode = appEl.nativeElement;
        if (isPresent(appEl.nestedViews)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbk1TZXZSa3EudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsV0FBVyxFQUdYLGdCQUFnQixFQUdqQixNQUFNLGdDQUFnQztPQUdoQyxFQUFDLFVBQVUsRUFBQyxNQUFNLFdBQVc7T0FDN0IsRUFFTCxTQUFTLEVBQ1QsT0FBTyxFQUlQLEtBQUssRUFDTCxVQUFVLEVBR1gsTUFBTSwwQkFBMEI7T0FFMUIsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUVwRCxFQUFDLFFBQVEsRUFBcUIsTUFBTSxZQUFZO09BR2hELEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYTtPQUM3QixFQUNMLDRCQUE0QixFQUM1QixlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNsQixNQUFNLGNBQWM7T0FDZCxFQUVMLHVCQUF1QixFQUN2QixtQkFBbUIsRUFHcEIsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFhLE1BQU0sb0JBQW9CO09BQ2hFLEVBQ0wsK0NBQStDLEVBQy9DLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDckIsTUFBTSxjQUFjO09BQ2QsRUFBc0IsWUFBWSxFQUFDLE1BQU0saUJBQWlCO09BQzFELEVBQUMsZUFBZSxFQUFDLE1BQU0sb0JBQW9CO0FBRWxELE9BQU8sTUFBTSxzQkFBc0IsR0FBRyxhQUFhLENBQUM7QUFFcEQsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUvQyxJQUFJLFlBQVksR0FBZSxjQUFjLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUV6RTs7O0dBR0c7QUFDSDtJQWdDRSxZQUFtQixLQUFVLEVBQVMsYUFBa0MsRUFBUyxJQUFjLEVBQzVF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QztJQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFlLElBQUksQ0FBQztRQUM3QixRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQywrQ0FBK0M7WUFDL0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkQsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxRQUFRLEdBQUcsbUJBQW1CLENBQzFCLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIExpc3RXcmFwcGVyLFxuICBNYXBXcmFwcGVyLFxuICBNYXAsXG4gIFN0cmluZ01hcFdyYXBwZXIsXG4gIGlzTGlzdExpa2VJdGVyYWJsZSxcbiAgYXJlSXRlcmFibGVzRXF1YWxcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICcuL2VsZW1lbnQnO1xuaW1wb3J0IHtcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgVHlwZSxcbiAgaXNBcnJheSxcbiAgaXNOdW1iZXIsXG4gIENPTlNULFxuICBDT05TVF9FWFBSLFxuICBzdHJpbmdpZnksXG4gIGlzUHJpbWl0aXZlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtSZW5kZXJlciwgUm9vdFJlbmRlcmVyLCBSZW5kZXJDb21wb25lbnRUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7Vmlld1JlZl8sIEhvc3RWaWV3RmFjdG9yeVJlZn0gZnJvbSAnLi92aWV3X3JlZic7XG5cbmltcG9ydCB7QXBwVmlld01hbmFnZXJfLCBBcHBWaWV3TWFuYWdlcn0gZnJvbSAnLi92aWV3X21hbmFnZXInO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtcbiAgZmxhdHRlbk5lc3RlZFZpZXdSZW5kZXJOb2RlcyxcbiAgZW5zdXJlU2xvdENvdW50LFxuICBhcnJheUxvb3NlSWRlbnRpY2FsLFxuICBtYXBMb29zZUlkZW50aWNhbFxufSBmcm9tICcuL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclN0YXRlLFxuICBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgZGV2TW9kZUVxdWFsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge3d0ZkNyZWF0ZVNjb3BlLCB3dGZMZWF2ZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7XG4gIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLFxuICBWaWV3RGVzdHJveWVkRXhjZXB0aW9uLFxuICBWaWV3V3JhcHBlZEV4Y2VwdGlvblxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdGF0aWNOb2RlRGVidWdJbmZvLCBEZWJ1Z0NvbnRleHR9IGZyb20gJy4vZGVidWdfY29udGV4dCc7XG5pbXBvcnQge0VsZW1lbnRJbmplY3Rvcn0gZnJvbSAnLi9lbGVtZW50X2luamVjdG9yJztcblxuZXhwb3J0IGNvbnN0IEhPU1RfVklFV19FTEVNRU5UX05BTUUgPSAnJGhvc3RWaWV3RWwnO1xuXG5jb25zdCBFTVBUWV9DT05URVhUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG52YXIgX3Njb3BlX2NoZWNrOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoYEFwcFZpZXcjY2hlY2soYXNjaWkgaWQpYCk7XG5cbi8qKlxuICogQ29zdCBvZiBtYWtpbmcgb2JqZWN0czogaHR0cDovL2pzcGVyZi5jb20vaW5zdGFudGlhdGUtc2l6ZS1vZi1vYmplY3RcbiAqXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBWaWV3PFQ+IHtcbiAgcmVmOiBWaWV3UmVmXztcbiAgcm9vdE5vZGVzT3JBcHBFbGVtZW50czogYW55W107XG4gIGFsbE5vZGVzOiBhbnlbXTtcbiAgZGlzcG9zYWJsZXM6IEZ1bmN0aW9uW107XG4gIHN1YnNjcmlwdGlvbnM6IGFueVtdO1xuICBuYW1lZEFwcEVsZW1lbnRzOiB7W2tleTogc3RyaW5nXTogQXBwRWxlbWVudH07XG4gIGNvbnRlbnRDaGlsZHJlbjogQXBwVmlldzxhbnk+W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBBcHBWaWV3PGFueT5bXSA9IFtdO1xuICByZW5kZXJQYXJlbnQ6IEFwcFZpZXc8YW55PjtcblxuICBwcml2YXRlIF9saXRlcmFsQXJyYXlDYWNoZTogYW55W11bXTtcbiAgcHJpdmF0ZSBfbGl0ZXJhbE1hcENhY2hlOiBBcnJheTx7W2tleTogc3RyaW5nXTogYW55fT47XG5cbiAgLy8gVGhlIG5hbWVzIG9mIHRoZSBiZWxvdyBmaWVsZHMgbXVzdCBiZSBrZXB0IGluIHN5bmMgd2l0aCBjb2RlZ2VuX25hbWVfdXRpbC50cyBvclxuICAvLyBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgZmFpbC5cbiAgY2RTdGF0ZTogQ2hhbmdlRGV0ZWN0b3JTdGF0ZSA9IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkO1xuXG4gIC8qKlxuICAgKiBUaGUgY29udGV4dCBhZ2FpbnN0IHdoaWNoIGRhdGEtYmluZGluZyBleHByZXNzaW9ucyBpbiB0aGlzIHZpZXcgYXJlIGV2YWx1YXRlZCBhZ2FpbnN0LlxuICAgKiBUaGlzIGlzIGFsd2F5cyBhIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICovXG4gIGNvbnRleHQ6IFQgPSBudWxsO1xuXG4gIHByb2plY3RhYmxlTm9kZXM6IEFycmF5PGFueSB8IGFueVtdPjtcblxuICBkZXN0cm95ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICByZW5kZXJlcjogUmVuZGVyZXI7XG5cbiAgcHJpdmF0ZSBfY3VycmVudERlYnVnQ29udGV4dDogRGVidWdDb250ZXh0ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2xheno6IGFueSwgcHVibGljIGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUsIHB1YmxpYyB0eXBlOiBWaWV3VHlwZSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2Fsczoge1trZXk6IHN0cmluZ106IGFueX0sIHB1YmxpYyB2aWV3TWFuYWdlcjogQXBwVmlld01hbmFnZXJfLFxuICAgICAgICAgICAgICBwdWJsaWMgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgZGVjbGFyYXRpb25BcHBFbGVtZW50OiBBcHBFbGVtZW50LFxuICAgICAgICAgICAgICBwdWJsaWMgY2RNb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgbGl0ZXJhbEFycmF5Q2FjaGVTaXplOiBudW1iZXIsXG4gICAgICAgICAgICAgIGxpdGVyYWxNYXBDYWNoZVNpemU6IG51bWJlciwgcHVibGljIHN0YXRpY05vZGVEZWJ1Z0luZm9zOiBTdGF0aWNOb2RlRGVidWdJbmZvW10pIHtcbiAgICB0aGlzLnJlZiA9IG5ldyBWaWV3UmVmXyh0aGlzKTtcbiAgICBpZiAodHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UIHx8IHR5cGUgPT09IFZpZXdUeXBlLkhPU1QpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIgPSB2aWV3TWFuYWdlci5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyZXIgPSBkZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50Vmlldy5yZW5kZXJlcjtcbiAgICB9XG4gICAgdGhpcy5fbGl0ZXJhbEFycmF5Q2FjaGUgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGl0ZXJhbEFycmF5Q2FjaGVTaXplKTtcbiAgICB0aGlzLl9saXRlcmFsTWFwQ2FjaGUgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGl0ZXJhbE1hcENhY2hlU2l6ZSk7XG4gIH1cblxuICBjcmVhdGUoZ2l2ZW5Qcm9qZWN0YWJsZU5vZGVzOiBBcnJheTxhbnkgfCBhbnlbXT4sIHJvb3RTZWxlY3Rvcjogc3RyaW5nKSB7XG4gICAgdmFyIGNvbnRleHQ7XG4gICAgdmFyIHByb2plY3RhYmxlTm9kZXM7XG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgVmlld1R5cGUuQ09NUE9ORU5UOlxuICAgICAgICBjb250ZXh0ID0gdGhpcy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQuY29tcG9uZW50O1xuICAgICAgICBwcm9qZWN0YWJsZU5vZGVzID0gZW5zdXJlU2xvdENvdW50KGdpdmVuUHJvamVjdGFibGVOb2RlcywgdGhpcy5jb21wb25lbnRUeXBlLnNsb3RDb3VudCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBWaWV3VHlwZS5FTUJFRERFRDpcbiAgICAgICAgY29udGV4dCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcuY29udGV4dDtcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcucHJvamVjdGFibGVOb2RlcztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkhPU1Q6XG4gICAgICAgIGNvbnRleHQgPSBFTVBUWV9DT05URVhUO1xuICAgICAgICAvLyBOb3RlOiBEb24ndCBlbnN1cmUgdGhlIHNsb3QgY291bnQgZm9yIHRoZSBwcm9qZWN0YWJsZU5vZGVzIGFzIHdlIHN0b3JlXG4gICAgICAgIC8vIHRoZW0gb25seSBmb3IgdGhlIGNvbnRhaW5lZCBjb21wb25lbnQgdmlldyAod2hpY2ggd2lsbCBsYXRlciBjaGVjayB0aGUgc2xvdCBjb3VudC4uLilcbiAgICAgICAgcHJvamVjdGFibGVOb2RlcyA9IGdpdmVuUHJvamVjdGFibGVOb2RlcztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5wcm9qZWN0YWJsZU5vZGVzID0gcHJvamVjdGFibGVOb2RlcztcbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkIHt9XG5cbiAgaW5pdChyb290Tm9kZXNPckFwcEVsZW1lbnRzOiBhbnlbXSwgYWxsTm9kZXM6IGFueVtdLCBhcHBFbGVtZW50czoge1trZXk6IHN0cmluZ106IEFwcEVsZW1lbnR9LFxuICAgICAgIGRpc3Bvc2FibGVzOiBGdW5jdGlvbltdLCBzdWJzY3JpcHRpb25zOiBhbnlbXSkge1xuICAgIHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cyA9IHJvb3ROb2Rlc09yQXBwRWxlbWVudHM7XG4gICAgdGhpcy5hbGxOb2RlcyA9IGFsbE5vZGVzO1xuICAgIHRoaXMubmFtZWRBcHBFbGVtZW50cyA9IGFwcEVsZW1lbnRzO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBkaXNwb3NhYmxlcztcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgLy8gTm90ZTogdGhlIHJlbmRlciBub2RlcyBoYXZlIGJlZW4gYXR0YWNoZWQgdG8gdGhlaXIgaG9zdCBlbGVtZW50XG4gICAgICAvLyBpbiB0aGUgVmlld0ZhY3RvcnkgYWxyZWFkeS5cbiAgICAgIHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXcudmlld0NoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICB0aGlzLnJlbmRlclBhcmVudCA9IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXc7XG4gICAgICB0aGlzLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SG9zdFZpZXdFbGVtZW50KCk6IEFwcEVsZW1lbnQgeyByZXR1cm4gdGhpcy5uYW1lZEFwcEVsZW1lbnRzW0hPU1RfVklFV19FTEVNRU5UX05BTUVdOyB9XG5cbiAgaW5qZWN0b3JHZXQodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIGlmICh0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgdGhpcy5fcmVzZXREZWJ1ZygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbiwgbm9kZUluZGV4LCBub3RGb3VuZFJlc3VsdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX3JldGhyb3dXaXRoQ29udGV4dChlLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbiwgbm9kZUluZGV4LCBub3RGb3VuZFJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5vdEZvdW5kUmVzdWx0O1xuICB9XG5cbiAgaW5qZWN0b3Iobm9kZUluZGV4OiBudW1iZXIpOiBJbmplY3RvciB7XG4gICAgaWYgKGlzUHJlc2VudChub2RlSW5kZXgpKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBub2RlSW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRJbmplY3RvcjtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmNvbnRlbnRDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIGNoaWxkcmVuID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lMb2NhbCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lMb2NhbCgpO1xuICAgIH1cblxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3lMb2NhbCgpIHtcbiAgICB2YXIgaG9zdEVsZW1lbnQgPVxuICAgICAgICB0aGlzLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCA/IHRoaXMuZGVjbGFyYXRpb25BcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgOiBudWxsO1xuICAgIHRoaXMucmVuZGVyZXIuZGVzdHJveVZpZXcoaG9zdEVsZW1lbnQsIHRoaXMuYWxsTm9kZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXNwb3NhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlc1tpXSgpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLnN1YnNjcmlwdGlvbnNbaV0pO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3lJbnRlcm5hbCgpO1xuXG4gICAgdGhpcy5kaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGVzdHJveUludGVybmFsKCk6IHZvaWQge31cblxuICBnZXQgZGVidWdNb2RlKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuc3RhdGljTm9kZURlYnVnSW5mb3MpOyB9XG5cbiAgZ2V0IGNoYW5nZURldGVjdG9yUmVmKCk6IENoYW5nZURldGVjdG9yUmVmIHsgcmV0dXJuIHRoaXMucmVmOyB9XG5cbiAgZ2V0IGZsYXRSb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gZmxhdHRlbk5lc3RlZFZpZXdSZW5kZXJOb2Rlcyh0aGlzLnJvb3ROb2Rlc09yQXBwRWxlbWVudHMpOyB9XG5cbiAgZ2V0IGxhc3RSb290Tm9kZSgpOiBhbnkge1xuICAgIHZhciBsYXN0Tm9kZSA9IHRoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290Tm9kZXNPckFwcEVsZW1lbnRzW3RoaXMucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggLSAxXSA6XG4gICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgcmV0dXJuIF9maW5kTGFzdFJlbmRlck5vZGUobGFzdE5vZGUpO1xuICB9XG5cbiAgaGFzTG9jYWwoY29udGV4dE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHRoaXMubG9jYWxzLCBjb250ZXh0TmFtZSk7XG4gIH1cblxuICBzZXRMb2NhbChjb250ZXh0TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7IHRoaXMubG9jYWxzW2NvbnRleHROYW1lXSA9IHZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0dGVuIGJ5IGltcGxlbWVudGF0aW9uc1xuICAgKi9cbiAgZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTogdm9pZCB7fVxuXG4gIGFkZFJlbmRlckNvbnRlbnRDaGlsZCh2aWV3OiBBcHBWaWV3PGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRDaGlsZHJlbi5wdXNoKHZpZXcpO1xuICAgIHZpZXcucmVuZGVyUGFyZW50ID0gdGhpcztcbiAgICB2aWV3LmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gIH1cblxuICByZW1vdmVDb250ZW50Q2hpbGQodmlldzogQXBwVmlldzxhbnk+KTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuY29udGVudENoaWxkcmVuLCB2aWV3KTtcbiAgICB2aWV3LmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgdmlldy5yZW5kZXJQYXJlbnQgPSBudWxsO1xuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIHMgPSBfc2NvcGVfY2hlY2sodGhpcy5jbGF6eik7XG4gICAgaWYgKHRoaXMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCB8fFxuICAgICAgICB0aGlzLmNkTW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZCB8fFxuICAgICAgICB0aGlzLmNkU3RhdGUgPT09IENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZClcbiAgICAgIHJldHVybjtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRoaXMudGhyb3dEZXN0cm95ZWRFcnJvcignZGV0ZWN0Q2hhbmdlcycpO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9yZXRocm93V2l0aENvbnRleHQoZSwgZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jZE1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZSlcbiAgICAgIHRoaXMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZDtcblxuICAgIHRoaXMuY2RTdGF0ZSA9IENoYW5nZURldGVjdG9yU3RhdGUuQ2hlY2tlZEJlZm9yZTtcbiAgICB3dGZMZWF2ZShzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdHRlbiBieSBpbXBsZW1lbnRhdGlvbnNcbiAgICovXG4gIGRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIHRoaXMuZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgfVxuXG4gIGRldGVjdENvbnRlbnRDaGlsZHJlbkNoYW5nZXModGhyb3dPbkNoYW5nZTogYm9vbGVhbikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZW50Q2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMuY29udGVudENoaWxkcmVuW2ldLmRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZpZXdDaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy52aWV3Q2hpbGRyZW5baV0uZGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBsaXRlcmFsQXJyYXkoaWQ6IG51bWJlciwgdmFsdWU6IGFueVtdKTogYW55W10ge1xuICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsQXJyYXlDYWNoZVtpZF07XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIWFycmF5TG9vc2VJZGVudGljYWwocHJldlZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxBcnJheUNhY2hlW2lkXSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcHJldlZhbHVlO1xuICB9XG5cbiAgbGl0ZXJhbE1hcChpZDogbnVtYmVyLCB2YWx1ZToge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX2xpdGVyYWxNYXBDYWNoZVtpZF07XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgIW1hcExvb3NlSWRlbnRpY2FsKHByZXZWYWx1ZSwgdmFsdWUpKSB7XG4gICAgICBwcmV2VmFsdWUgPSB0aGlzLl9saXRlcmFsTWFwQ2FjaGVbaWRdID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBwcmV2VmFsdWU7XG4gIH1cblxuICBtYXJrQXNDaGVja09uY2UoKTogdm9pZCB7IHRoaXMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlOyB9XG5cbiAgbWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpOiB2b2lkIHtcbiAgICB2YXIgYzogQXBwVmlldzxhbnk+ID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGMpICYmIGMuY2RNb2RlICE9PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCkge1xuICAgICAgaWYgKGMuY2RNb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkKSB7XG4gICAgICAgIGMuY2RNb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlO1xuICAgICAgfVxuICAgICAgYyA9IGMucmVuZGVyUGFyZW50O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Jlc2V0RGVidWcoKSB7IHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBudWxsOyB9XG5cbiAgZGVidWcobm9kZUluZGV4OiBudW1iZXIsIHJvd051bTogbnVtYmVyLCBjb2xOdW06IG51bWJlcik6IERlYnVnQ29udGV4dCB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQgPSBuZXcgRGVidWdDb250ZXh0KHRoaXMsIG5vZGVJbmRleCwgcm93TnVtLCBjb2xOdW0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmV0aHJvd1dpdGhDb250ZXh0KGU6IGFueSwgc3RhY2s6IGFueSkge1xuICAgIGlmICghKGUgaW5zdGFuY2VvZiBWaWV3V3JhcHBlZEV4Y2VwdGlvbikpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbikpIHtcbiAgICAgICAgdGhpcy5jZFN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jdXJyZW50RGVidWdDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVmlld1dyYXBwZWRFeGNlcHRpb24oZSwgc3RhY2ssIHRoaXMuX2N1cnJlbnREZWJ1Z0NvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGV2ZW50SGFuZGxlcihjYjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB7XG4gICAgICByZXR1cm4gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuX3Jlc2V0RGVidWcoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gY2IoZXZlbnQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhpcy5fcmV0aHJvd1dpdGhDb250ZXh0KGUsIGUuc3RhY2spO1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYjtcbiAgICB9XG4gIH1cblxuICB0aHJvd0Rlc3Ryb3llZEVycm9yKGRldGFpbHM6IHN0cmluZyk6IHZvaWQgeyB0aHJvdyBuZXcgVmlld0Rlc3Ryb3llZEV4Y2VwdGlvbihkZXRhaWxzKTsgfVxufVxuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RWaWV3RmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLCBwdWJsaWMgdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7fVxufVxuXG5mdW5jdGlvbiBfZmluZExhc3RSZW5kZXJOb2RlKG5vZGU6IGFueSk6IGFueSB7XG4gIHZhciBsYXN0Tm9kZTtcbiAgaWYgKG5vZGUgaW5zdGFuY2VvZiBBcHBFbGVtZW50KSB7XG4gICAgdmFyIGFwcEVsID0gPEFwcEVsZW1lbnQ+bm9kZTtcbiAgICBsYXN0Tm9kZSA9IGFwcEVsLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKGlzUHJlc2VudChhcHBFbC5uZXN0ZWRWaWV3cykpIHtcbiAgICAgIC8vIE5vdGU6IFZpZXdzIG1pZ2h0IGhhdmUgbm8gcm9vdCBub2RlcyBhdCBhbGwhXG4gICAgICBmb3IgKHZhciBpID0gYXBwRWwubmVzdGVkVmlld3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIG5lc3RlZFZpZXcgPSBhcHBFbC5uZXN0ZWRWaWV3c1tpXTtcbiAgICAgICAgaWYgKG5lc3RlZFZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGFzdE5vZGUgPSBfZmluZExhc3RSZW5kZXJOb2RlKFxuICAgICAgICAgICAgICBuZXN0ZWRWaWV3LnJvb3ROb2Rlc09yQXBwRWxlbWVudHNbbmVzdGVkVmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsYXN0Tm9kZSA9IG5vZGU7XG4gIH1cbiAgcmV0dXJuIGxhc3ROb2RlO1xufVxuIl19