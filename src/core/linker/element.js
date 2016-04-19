'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_type_1 = require('./view_type');
var element_ref_1 = require('./element_ref');
var view_container_ref_1 = require('./view_container_ref');
var AppElement = (function () {
    function AppElement(index, parentIndex, parentView, nativeElement) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.parentView = parentView;
        this.nativeElement = nativeElement;
        this.nestedViews = null;
        this.componentView = null;
    }
    Object.defineProperty(AppElement.prototype, "ref", {
        get: function () {
            if (lang_1.isBlank(this._ref)) {
                this._ref = new element_ref_1.ElementRef_(this);
            }
            return this._ref;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "vcRef", {
        get: function () {
            if (lang_1.isBlank(this._vcRef)) {
                this._vcRef = new view_container_ref_1.ViewContainerRef_(this);
            }
            return this._vcRef;
        },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
        this.component = component;
        this.componentConstructorViewQueries = componentConstructorViewQueries;
        this.componentView = view;
    };
    Object.defineProperty(AppElement.prototype, "parentInjector", {
        get: function () { return this.parentView.injector(this.parentIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "injector", {
        get: function () { return this.parentView.injector(this.index); },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.mapNestedViews = function (nestedViewClass, callback) {
        var result = [];
        if (lang_1.isPresent(this.nestedViews)) {
            this.nestedViews.forEach(function (nestedView) {
                if (nestedView.clazz === nestedViewClass) {
                    result.push(callback(nestedView));
                }
            });
        }
        return result;
    };
    AppElement.prototype.attachView = function (view, viewIndex) {
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        collection_1.ListWrapper.insert(nestedViews, viewIndex, view);
        var refRenderNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refRenderNode = prevView.lastRootNode;
        }
        else {
            refRenderNode = this.nativeElement;
        }
        if (lang_1.isPresent(refRenderNode)) {
            view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
        }
        this.parentView.addRenderContentChild(view);
    };
    AppElement.prototype.detachView = function (viewIndex) {
        var view = collection_1.ListWrapper.removeAt(this.nestedViews, viewIndex);
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        view.renderer.detachView(view.flatRootNodes);
        view.renderParent.removeContentChild(view);
        return view;
    };
    return AppElement;
}());
exports.AppElement = AppElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtelBUTGZqRWMudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUs3RCwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsNEJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBRTFDLG1DQUFrRCxzQkFBc0IsQ0FBQyxDQUFBO0FBSXpFO0lBU0Usb0JBQW1CLEtBQWEsRUFBUyxXQUFtQixFQUFTLFVBQXdCLEVBQzFFLGFBQWtCO1FBRGxCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWM7UUFDMUUsa0JBQWEsR0FBYixhQUFhLENBQUs7UUFUOUIsZ0JBQVcsR0FBbUIsSUFBSSxDQUFDO1FBQ25DLGtCQUFhLEdBQWlCLElBQUksQ0FBQztJQVFGLENBQUM7SUFFekMsc0JBQUksMkJBQUc7YUFBUDtZQUNFLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw2QkFBSzthQUFUO1lBQ0UsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFB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QUFDO1FBQzdELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssb0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sSUFBSSwwQkFBYSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBbkZELElBbUZDO0FBbkZZLGtCQUFVLGFBbUZ0QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCB7QXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcbmltcG9ydCB7RWxlbWVudFJlZl99IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWYsIFZpZXdDb250YWluZXJSZWZffSBmcm9tICcuL3ZpZXdfY29udGFpbmVyX3JlZic7XG5cbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuXG5leHBvcnQgY2xhc3MgQXBwRWxlbWVudCB7XG4gIHB1YmxpYyBuZXN0ZWRWaWV3czogQXBwVmlldzxhbnk+W10gPSBudWxsO1xuICBwdWJsaWMgY29tcG9uZW50VmlldzogQXBwVmlldzxhbnk+ID0gbnVsbDtcblxuICBwcml2YXRlIF9yZWY6IEVsZW1lbnRSZWZfO1xuICBwcml2YXRlIF92Y1JlZjogVmlld0NvbnRhaW5lclJlZl87XG4gIHB1YmxpYyBjb21wb25lbnQ6IGFueTtcbiAgcHVibGljIGNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJpZXM6IFF1ZXJ5TGlzdDxhbnk+W107XG5cbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBwYXJlbnRJbmRleDogbnVtYmVyLCBwdWJsaWMgcGFyZW50VmlldzogQXBwVmlldzxhbnk+LFxuICAgICAgICAgICAgICBwdWJsaWMgbmF0aXZlRWxlbWVudDogYW55KSB7fVxuXG4gIGdldCByZWYoKTogRWxlbWVudFJlZl8ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX3JlZikpIHtcbiAgICAgIHRoaXMuX3JlZiA9IG5ldyBFbGVtZW50UmVmXyh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlZjtcbiAgfVxuXG4gIGdldCB2Y1JlZigpOiBWaWV3Q29udGFpbmVyUmVmXyB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fdmNSZWYpKSB7XG4gICAgICB0aGlzLl92Y1JlZiA9IG5ldyBWaWV3Q29udGFpbmVyUmVmXyh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3ZjUmVmO1xuICB9XG5cbiAgaW5pdENvbXBvbmVudChjb21wb25lbnQ6IGFueSwgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcmllczogUXVlcnlMaXN0PGFueT5bXSxcbiAgICAgICAgICAgICAgICB2aWV3OiBBcHBWaWV3PGFueT4pIHtcbiAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLmNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJpZXMgPSBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyaWVzO1xuICAgIHRoaXMuY29tcG9uZW50VmlldyA9IHZpZXc7XG4gIH1cblxuICBnZXQgcGFyZW50SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmluamVjdG9yKHRoaXMucGFyZW50SW5kZXgpOyB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLnBhcmVudFZpZXcuaW5qZWN0b3IodGhpcy5pbmRleCk7IH1cblxuICBtYXBOZXN0ZWRWaWV3cyhuZXN0ZWRWaWV3Q2xhc3M6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55W10ge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMubmVzdGVkVmlld3MpKSB7XG4gICAgICB0aGlzLm5lc3RlZFZpZXdzLmZvckVhY2goKG5lc3RlZFZpZXcpID0+IHtcbiAgICAgICAgaWYgKG5lc3RlZFZpZXcuY2xhenogPT09IG5lc3RlZFZpZXdDbGFzcykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGNhbGxiYWNrKG5lc3RlZFZpZXcpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIGF0dGFjaFZpZXcodmlldzogQXBwVmlldzxhbnk+LCB2aWV3SW5kZXg6IG51bWJlcikge1xuICAgIGlmICh2aWV3LnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCB2aWV3cyBjYW4ndCBiZSBtb3ZlZCFgKTtcbiAgICB9XG4gICAgdmFyIG5lc3RlZFZpZXdzID0gdGhpcy5uZXN0ZWRWaWV3cztcbiAgICBpZiAobmVzdGVkVmlld3MgPT0gbnVsbCkge1xuICAgICAgbmVzdGVkVmlld3MgPSBbXTtcbiAgICAgIHRoaXMubmVzdGVkVmlld3MgPSBuZXN0ZWRWaWV3cztcbiAgICB9XG4gICAgTGlzdFdyYXBwZXIuaW5zZXJ0KG5lc3RlZFZpZXdzLCB2aWV3SW5kZXgsIHZpZXcpO1xuICAgIHZhciByZWZSZW5kZXJOb2RlO1xuICAgIGlmICh2aWV3SW5kZXggPiAwKSB7XG4gICAgICB2YXIgcHJldlZpZXcgPSBuZXN0ZWRWaWV3c1t2aWV3SW5kZXggLSAxXTtcbiAgICAgIHJlZlJlbmRlck5vZGUgPSBwcmV2Vmlldy5sYXN0Um9vdE5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZlJlbmRlck5vZGUgPSB0aGlzLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocmVmUmVuZGVyTm9kZSkpIHtcbiAgICAgIHZpZXcucmVuZGVyZXIuYXR0YWNoVmlld0FmdGVyKHJlZlJlbmRlck5vZGUsIHZpZXcuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfVxuICAgIHRoaXMucGFyZW50Vmlldy5hZGRSZW5kZXJDb250ZW50Q2hpbGQodmlldyk7XG4gIH1cblxuICBkZXRhY2hWaWV3KHZpZXdJbmRleDogbnVtYmVyKTogQXBwVmlldzxhbnk+IHtcbiAgICB2YXIgdmlldyA9IExpc3RXcmFwcGVyLnJlbW92ZUF0KHRoaXMubmVzdGVkVmlld3MsIHZpZXdJbmRleCk7XG4gICAgaWYgKHZpZXcudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ29tcG9uZW50IHZpZXdzIGNhbid0IGJlIG1vdmVkIWApO1xuICAgIH1cblxuICAgIHZpZXcucmVuZGVyZXIuZGV0YWNoVmlldyh2aWV3LmZsYXRSb290Tm9kZXMpO1xuXG4gICAgdmlldy5yZW5kZXJQYXJlbnQucmVtb3ZlQ29udGVudENoaWxkKHZpZXcpO1xuICAgIHJldHVybiB2aWV3O1xuICB9XG59XG4iXX0=