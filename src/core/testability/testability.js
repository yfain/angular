'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ng_zone_1 = require('../zone/ng_zone');
var async_1 = require('angular2/src/facade/async');
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
var Testability = (function () {
    function Testability(_ngZone) {
        this._ngZone = _ngZone;
        /** @internal */
        this._pendingCount = 0;
        /** @internal */
        this._isZoneStable = true;
        /**
         * Whether any work was done since the last 'whenStable' callback. This is
         * useful to detect if this could have potentially destabilized another
         * component while it is stabilizing.
         * @internal
         */
        this._didWork = false;
        /** @internal */
        this._callbacks = [];
        this._watchAngularEvents();
    }
    /** @internal */
    Testability.prototype._watchAngularEvents = function () {
        var _this = this;
        async_1.ObservableWrapper.subscribe(this._ngZone.onUnstable, function (_) {
            _this._didWork = true;
            _this._isZoneStable = false;
        });
        this._ngZone.runOutsideAngular(function () {
            async_1.ObservableWrapper.subscribe(_this._ngZone.onStable, function (_) {
                ng_zone_1.NgZone.assertNotInAngularZone();
                lang_1.scheduleMicroTask(function () {
                    _this._isZoneStable = true;
                    _this._runCallbacksIfReady();
                });
            });
        });
    };
    Testability.prototype.increasePendingRequestCount = function () {
        this._pendingCount += 1;
        this._didWork = true;
        return this._pendingCount;
    };
    Testability.prototype.decreasePendingRequestCount = function () {
        this._pendingCount -= 1;
        if (this._pendingCount < 0) {
            throw new exceptions_1.BaseException('pending async requests below zero');
        }
        this._runCallbacksIfReady();
        return this._pendingCount;
    };
    Testability.prototype.isStable = function () {
        return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
    };
    /** @internal */
    Testability.prototype._runCallbacksIfReady = function () {
        var _this = this;
        if (this.isStable()) {
            // Schedules the call backs in a new frame so that it is always async.
            lang_1.scheduleMicroTask(function () {
                while (_this._callbacks.length !== 0) {
                    (_this._callbacks.pop())(_this._didWork);
                }
                _this._didWork = false;
            });
        }
        else {
            // Not Ready
            this._didWork = true;
        }
    };
    Testability.prototype.whenStable = function (callback) {
        this._callbacks.push(callback);
        this._runCallbacksIfReady();
    };
    Testability.prototype.getPendingRequestCount = function () { return this._pendingCount; };
    Testability.prototype.findBindings = function (using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    };
    Testability.prototype.findProviders = function (using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    };
    Testability = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [ng_zone_1.NgZone])
    ], Testability);
    return Testability;
})();
exports.Testability = Testability;
/**
 * A global registry of {@link Testability} instances for specific elements.
 */
var TestabilityRegistry = (function () {
    function TestabilityRegistry() {
        /** @internal */
        this._applications = new collection_1.Map();
        _testabilityGetter.addToWindow(this);
    }
    TestabilityRegistry.prototype.registerApplication = function (token, testability) {
        this._applications.set(token, testability);
    };
    TestabilityRegistry.prototype.getTestability = function (elem) { return this._applications.get(elem); };
    TestabilityRegistry.prototype.getAllTestabilities = function () { return collection_1.MapWrapper.values(this._applications); };
    TestabilityRegistry.prototype.getAllRootElements = function () { return collection_1.MapWrapper.keys(this._applications); };
    TestabilityRegistry.prototype.findTestabilityInTree = function (elem, findInAncestors) {
        if (findInAncestors === void 0) { findInAncestors = true; }
        return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
    };
    TestabilityRegistry = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TestabilityRegistry);
    return TestabilityRegistry;
})();
exports.TestabilityRegistry = TestabilityRegistry;
var _NoopGetTestability = (function () {
    function _NoopGetTestability() {
    }
    _NoopGetTestability.prototype.addToWindow = function (registry) { };
    _NoopGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
        return null;
    };
    _NoopGetTestability = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], _NoopGetTestability);
    return _NoopGetTestability;
})();
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 */
function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
exports.setTestabilityGetter = setTestabilityGetter;
var _testabilityGetter = lang_1.CONST_EXPR(new _NoopGetTestability());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUF1YXNXTDFrLnRtcC9hbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6WyJUZXN0YWJpbGl0eSIsIlRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiVGVzdGFiaWxpdHkuX3dhdGNoQW5ndWxhckV2ZW50cyIsIlRlc3RhYmlsaXR5LmluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzU3RhYmxlIiwiVGVzdGFiaWxpdHkuX3J1bkNhbGxiYWNrc0lmUmVhZHkiLCJUZXN0YWJpbGl0eS53aGVuU3RhYmxlIiwiVGVzdGFiaWxpdHkuZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyIsIlRlc3RhYmlsaXR5LmZpbmRQcm92aWRlcnMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5IiwiVGVzdGFiaWxpdHlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlRlc3RhYmlsaXR5UmVnaXN0cnkucmVnaXN0ZXJBcHBsaWNhdGlvbiIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFJvb3RFbGVtZW50cyIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZmluZFRlc3RhYmlsaXR5SW5UcmVlIiwiX05vb3BHZXRUZXN0YWJpbGl0eSIsIl9Ob29wR2V0VGVzdGFiaWxpdHkuY29uc3RydWN0b3IiLCJfTm9vcEdldFRlc3RhYmlsaXR5LmFkZFRvV2luZG93IiwiX05vb3BHZXRUZXN0YWJpbGl0eS5maW5kVGVzdGFiaWxpdHlJblRyZWUiLCJzZXRUZXN0YWJpbGl0eUdldHRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQW1ELDBCQUEwQixDQUFDLENBQUE7QUFDOUUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsd0JBQXFCLGlCQUFpQixDQUFDLENBQUE7QUFDdkMsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFHNUQ7Ozs7R0FJRztBQUNIO0lBZUVBLHFCQUFvQkEsT0FBZUE7UUFBZkMsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBUUE7UUFibkNBLGdCQUFnQkE7UUFDaEJBLGtCQUFhQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUMxQkEsZ0JBQWdCQTtRQUNoQkEsa0JBQWFBLEdBQVlBLElBQUlBLENBQUNBO1FBQzlCQTs7Ozs7V0FLR0E7UUFDSEEsYUFBUUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFDMUJBLGdCQUFnQkE7UUFDaEJBLGVBQVVBLEdBQWVBLEVBQUVBLENBQUNBO1FBQ1dBLElBQUlBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFcEVELGdCQUFnQkE7SUFDaEJBLHlDQUFtQkEsR0FBbkJBO1FBQUFFLGlCQWVDQTtRQWRDQSx5QkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFVBQVVBLEVBQUVBLFVBQUNBLENBQUNBO1lBQ3JEQSxLQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNyQkEsS0FBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDN0JBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGlCQUFpQkEsQ0FBQ0E7WUFDN0JBLHlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBQ0EsQ0FBQ0E7Z0JBQ25EQSxnQkFBTUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtnQkFDaENBLHdCQUFpQkEsQ0FBQ0E7b0JBQ2hCQSxLQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQTtvQkFDMUJBLEtBQUlBLENBQUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0E7Z0JBQzlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNMQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNMQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVERixpREFBMkJBLEdBQTNCQTtRQUNFRyxJQUFJQSxDQUFDQSxhQUFhQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN4QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDckJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUVESCxpREFBMkJBLEdBQTNCQTtRQUNFSSxJQUFJQSxDQUFDQSxhQUFhQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxtQ0FBbUNBLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBO1FBQzVCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtJQUM1QkEsQ0FBQ0E7SUFFREosOEJBQVFBLEdBQVJBO1FBQ0VLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLElBQUlBLElBQUlBLENBQUNBLGFBQWFBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLG9CQUFvQkEsQ0FBQ0E7SUFDN0ZBLENBQUNBO0lBRURMLGdCQUFnQkE7SUFDaEJBLDBDQUFvQkEsR0FBcEJBO1FBQUFNLGlCQWFDQTtRQVpDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsc0VBQXNFQTtZQUN0RUEsd0JBQWlCQSxDQUFDQTtnQkFDaEJBLE9BQU9BLEtBQUlBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBO29CQUNwQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pDQSxDQUFDQTtnQkFDREEsS0FBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDeEJBLENBQUNBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLFlBQVlBO1lBQ1pBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVETixnQ0FBVUEsR0FBVkEsVUFBV0EsUUFBa0JBO1FBQzNCTyxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFRFAsNENBQXNCQSxHQUF0QkEsY0FBbUNRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRS9EUixrQ0FBWUEsR0FBWkEsVUFBYUEsS0FBVUEsRUFBRUEsUUFBZ0JBLEVBQUVBLFVBQW1CQTtRQUM1RFMsNEJBQTRCQTtRQUM1QkEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDWkEsQ0FBQ0E7SUFFRFQsbUNBQWFBLEdBQWJBLFVBQWNBLEtBQVVBLEVBQUVBLFFBQWdCQSxFQUFFQSxVQUFtQkE7UUFDN0RVLDRCQUE0QkE7UUFDNUJBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO0lBQ1pBLENBQUNBO0lBckZIVjtRQUFDQSxlQUFVQSxFQUFFQTs7b0JBc0ZaQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUF0RkQsSUFzRkM7QUFyRlksbUJBQVcsY0FxRnZCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBS0VXO1FBSEFDLGdCQUFnQkE7UUFDaEJBLGtCQUFhQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBb0JBLENBQUNBO1FBRTVCQSxrQkFBa0JBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBRXZERCxpREFBbUJBLEdBQW5CQSxVQUFvQkEsS0FBVUEsRUFBRUEsV0FBd0JBO1FBQ3RERSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREYsNENBQWNBLEdBQWRBLFVBQWVBLElBQVNBLElBQWlCRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUvRUgsaURBQW1CQSxHQUFuQkEsY0FBdUNJLE1BQU1BLENBQUNBLHVCQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV0RkosZ0RBQWtCQSxHQUFsQkEsY0FBOEJLLE1BQU1BLENBQUNBLHVCQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUzRUwsbURBQXFCQSxHQUFyQkEsVUFBc0JBLElBQVVBLEVBQUVBLGVBQStCQTtRQUEvQk0sK0JBQStCQSxHQUEvQkEsc0JBQStCQTtRQUMvREEsTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO0lBQy9FQSxDQUFDQTtJQW5CSE47UUFBQ0EsZUFBVUEsRUFBRUE7OzRCQW9CWkE7SUFBREEsMEJBQUNBO0FBQURBLENBQUNBLEFBcEJELElBb0JDO0FBbkJZLDJCQUFtQixzQkFtQi9CLENBQUE7QUFZRDtJQUFBTztJQU9BQyxDQUFDQTtJQUxDRCx5Q0FBV0EsR0FBWEEsVUFBWUEsUUFBNkJBLElBQVNFLENBQUNBO0lBQ25ERixtREFBcUJBLEdBQXJCQSxVQUFzQkEsUUFBNkJBLEVBQUVBLElBQVNBLEVBQ3hDQSxlQUF3QkE7UUFDNUNHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBTkhIO1FBQUNBLFlBQUtBLEVBQUVBOzs0QkFPUEE7SUFBREEsMEJBQUNBO0FBQURBLENBQUNBLEFBUEQsSUFPQztBQUVEOztHQUVHO0FBQ0gsOEJBQXFDLE1BQXNCO0lBQ3pESSxrQkFBa0JBLEdBQUdBLE1BQU1BLENBQUNBO0FBQzlCQSxDQUFDQTtBQUZlLDRCQUFvQix1QkFFbkMsQ0FBQTtBQUVELElBQUksa0JBQWtCLEdBQW1CLGlCQUFVLENBQUMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q09OU1QsIENPTlNUX0VYUFIsIHNjaGVkdWxlTWljcm9UYXNrfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIFRoZSBUZXN0YWJpbGl0eSBzZXJ2aWNlIHByb3ZpZGVzIHRlc3RpbmcgaG9va3MgdGhhdCBjYW4gYmUgYWNjZXNzZWQgZnJvbVxuICogdGhlIGJyb3dzZXIgYW5kIGJ5IHNlcnZpY2VzIHN1Y2ggYXMgUHJvdHJhY3Rvci4gRWFjaCBib290c3RyYXBwZWQgQW5ndWxhclxuICogYXBwbGljYXRpb24gb24gdGhlIHBhZ2Ugd2lsbCBoYXZlIGFuIGluc3RhbmNlIG9mIFRlc3RhYmlsaXR5LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdGFiaWxpdHkge1xuICAvKiogQGludGVybmFsICovXG4gIF9wZW5kaW5nQ291bnQ6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lzWm9uZVN0YWJsZTogYm9vbGVhbiA9IHRydWU7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGFueSB3b3JrIHdhcyBkb25lIHNpbmNlIHRoZSBsYXN0ICd3aGVuU3RhYmxlJyBjYWxsYmFjay4gVGhpcyBpc1xuICAgKiB1c2VmdWwgdG8gZGV0ZWN0IGlmIHRoaXMgY291bGQgaGF2ZSBwb3RlbnRpYWxseSBkZXN0YWJpbGl6ZWQgYW5vdGhlclxuICAgKiBjb21wb25lbnQgd2hpbGUgaXQgaXMgc3RhYmlsaXppbmcuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2RpZFdvcms6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2FsbGJhY2tzOiBGdW5jdGlvbltdID0gW107XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7IHRoaXMuX3dhdGNoQW5ndWxhckV2ZW50cygpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfd2F0Y2hBbmd1bGFyRXZlbnRzKCk6IHZvaWQge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl9uZ1pvbmUub25VbnN0YWJsZSwgKF8pID0+IHtcbiAgICAgIHRoaXMuX2RpZFdvcmsgPSB0cnVlO1xuICAgICAgdGhpcy5faXNab25lU3RhYmxlID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX25nWm9uZS5vblN0YWJsZSwgKF8pID0+IHtcbiAgICAgICAgTmdab25lLmFzc2VydE5vdEluQW5ndWxhclpvbmUoKTtcbiAgICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2lzWm9uZVN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5jcmVhc2VQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7XG4gICAgdGhpcy5fcGVuZGluZ0NvdW50ICs9IDE7XG4gICAgdGhpcy5fZGlkV29yayA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdDb3VudDtcbiAgfVxuXG4gIGRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIge1xuICAgIHRoaXMuX3BlbmRpbmdDb3VudCAtPSAxO1xuICAgIGlmICh0aGlzLl9wZW5kaW5nQ291bnQgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbigncGVuZGluZyBhc3luYyByZXF1ZXN0cyBiZWxvdyB6ZXJvJyk7XG4gICAgfVxuICAgIHRoaXMuX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50O1xuICB9XG5cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzWm9uZVN0YWJsZSAmJiB0aGlzLl9wZW5kaW5nQ291bnQgPT0gMCAmJiAhdGhpcy5fbmdab25lLmhhc1BlbmRpbmdNYWNyb3Rhc2tzO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcnVuQ2FsbGJhY2tzSWZSZWFkeSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1N0YWJsZSgpKSB7XG4gICAgICAvLyBTY2hlZHVsZXMgdGhlIGNhbGwgYmFja3MgaW4gYSBuZXcgZnJhbWUgc28gdGhhdCBpdCBpcyBhbHdheXMgYXN5bmMuXG4gICAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB7XG4gICAgICAgIHdoaWxlICh0aGlzLl9jYWxsYmFja3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgKHRoaXMuX2NhbGxiYWNrcy5wb3AoKSkodGhpcy5fZGlkV29yayk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZGlkV29yayA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdCBSZWFkeVxuICAgICAgdGhpcy5fZGlkV29yayA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICB9XG5cbiAgZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50OyB9XG5cbiAgZmluZEJpbmRpbmdzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgLy8gVE9ETyhqdWxpZW1yKTogaW1wbGVtZW50LlxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGZpbmRQcm92aWRlcnModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICAvLyBUT0RPKGp1bGllbXIpOiBpbXBsZW1lbnQuXG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbi8qKlxuICogQSBnbG9iYWwgcmVnaXN0cnkgb2Yge0BsaW5rIFRlc3RhYmlsaXR5fSBpbnN0YW5jZXMgZm9yIHNwZWNpZmljIGVsZW1lbnRzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdGFiaWxpdHlSZWdpc3RyeSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FwcGxpY2F0aW9ucyA9IG5ldyBNYXA8YW55LCBUZXN0YWJpbGl0eT4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHsgX3Rlc3RhYmlsaXR5R2V0dGVyLmFkZFRvV2luZG93KHRoaXMpOyB9XG5cbiAgcmVnaXN0ZXJBcHBsaWNhdGlvbih0b2tlbjogYW55LCB0ZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkpIHtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMuc2V0KHRva2VuLCB0ZXN0YWJpbGl0eSk7XG4gIH1cblxuICBnZXRUZXN0YWJpbGl0eShlbGVtOiBhbnkpOiBUZXN0YWJpbGl0eSB7IHJldHVybiB0aGlzLl9hcHBsaWNhdGlvbnMuZ2V0KGVsZW0pOyB9XG5cbiAgZ2V0QWxsVGVzdGFiaWxpdGllcygpOiBUZXN0YWJpbGl0eVtdIHsgcmV0dXJuIE1hcFdyYXBwZXIudmFsdWVzKHRoaXMuX2FwcGxpY2F0aW9ucyk7IH1cblxuICBnZXRBbGxSb290RWxlbWVudHMoKTogYW55W10geyByZXR1cm4gTWFwV3JhcHBlci5rZXlzKHRoaXMuX2FwcGxpY2F0aW9ucyk7IH1cblxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUoZWxlbTogTm9kZSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuID0gdHJ1ZSk6IFRlc3RhYmlsaXR5IHtcbiAgICByZXR1cm4gX3Rlc3RhYmlsaXR5R2V0dGVyLmZpbmRUZXN0YWJpbGl0eUluVHJlZSh0aGlzLCBlbGVtLCBmaW5kSW5BbmNlc3RvcnMpO1xuICB9XG59XG5cbi8qKlxuICogQWRhcHRlciBpbnRlcmZhY2UgZm9yIHJldHJpZXZpbmcgdGhlIGBUZXN0YWJpbGl0eWAgc2VydmljZSBhc3NvY2lhdGVkIGZvciBhXG4gKiBwYXJ0aWN1bGFyIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2V0VGVzdGFiaWxpdHkge1xuICBhZGRUb1dpbmRvdyhyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSk6IHZvaWQ7XG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSwgZWxlbTogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTogVGVzdGFiaWxpdHk7XG59XG5cbkBDT05TVCgpXG5jbGFzcyBfTm9vcEdldFRlc3RhYmlsaXR5IGltcGxlbWVudHMgR2V0VGVzdGFiaWxpdHkge1xuICBhZGRUb1dpbmRvdyhyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSk6IHZvaWQge31cbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4pOiBUZXN0YWJpbGl0eSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgdGhlIHtAbGluayBHZXRUZXN0YWJpbGl0eX0gaW1wbGVtZW50YXRpb24gdXNlZCBieSB0aGUgQW5ndWxhciB0ZXN0aW5nIGZyYW1ld29yay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRlc3RhYmlsaXR5R2V0dGVyKGdldHRlcjogR2V0VGVzdGFiaWxpdHkpOiB2b2lkIHtcbiAgX3Rlc3RhYmlsaXR5R2V0dGVyID0gZ2V0dGVyO1xufVxuXG52YXIgX3Rlc3RhYmlsaXR5R2V0dGVyOiBHZXRUZXN0YWJpbGl0eSA9IENPTlNUX0VYUFIobmV3IF9Ob29wR2V0VGVzdGFiaWxpdHkoKSk7XG4iXX0=