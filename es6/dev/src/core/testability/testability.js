var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Map, MapWrapper } from 'angular2/src/facade/collection';
import { CONST, CONST_EXPR, scheduleMicroTask } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { NgZone } from '../zone/ng_zone';
import { ObservableWrapper } from 'angular2/src/facade/async';
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
export let Testability = class {
    constructor(_ngZone) {
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
    _watchAngularEvents() {
        ObservableWrapper.subscribe(this._ngZone.onUnstable, (_) => {
            this._didWork = true;
            this._isZoneStable = false;
        });
        this._ngZone.runOutsideAngular(() => {
            ObservableWrapper.subscribe(this._ngZone.onStable, (_) => {
                NgZone.assertNotInAngularZone();
                scheduleMicroTask(() => {
                    this._isZoneStable = true;
                    this._runCallbacksIfReady();
                });
            });
        });
    }
    increasePendingRequestCount() {
        this._pendingCount += 1;
        this._didWork = true;
        return this._pendingCount;
    }
    decreasePendingRequestCount() {
        this._pendingCount -= 1;
        if (this._pendingCount < 0) {
            throw new BaseException('pending async requests below zero');
        }
        this._runCallbacksIfReady();
        return this._pendingCount;
    }
    isStable() {
        return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
    }
    /** @internal */
    _runCallbacksIfReady() {
        if (this.isStable()) {
            // Schedules the call backs in a new frame so that it is always async.
            scheduleMicroTask(() => {
                while (this._callbacks.length !== 0) {
                    (this._callbacks.pop())(this._didWork);
                }
                this._didWork = false;
            });
        }
        else {
            // Not Ready
            this._didWork = true;
        }
    }
    whenStable(callback) {
        this._callbacks.push(callback);
        this._runCallbacksIfReady();
    }
    getPendingRequestCount() { return this._pendingCount; }
    findBindings(using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    }
    findProviders(using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    }
};
Testability = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [NgZone])
], Testability);
/**
 * A global registry of {@link Testability} instances for specific elements.
 */
export let TestabilityRegistry = class {
    constructor() {
        /** @internal */
        this._applications = new Map();
        _testabilityGetter.addToWindow(this);
    }
    registerApplication(token, testability) {
        this._applications.set(token, testability);
    }
    getTestability(elem) { return this._applications.get(elem); }
    getAllTestabilities() { return MapWrapper.values(this._applications); }
    getAllRootElements() { return MapWrapper.keys(this._applications); }
    findTestabilityInTree(elem, findInAncestors = true) {
        return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
    }
};
TestabilityRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], TestabilityRegistry);
let _NoopGetTestability = class {
    addToWindow(registry) { }
    findTestabilityInTree(registry, elem, findInAncestors) {
        return null;
    }
};
_NoopGetTestability = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [])
], _NoopGetTestability);
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 */
export function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
var _testabilityGetter = CONST_EXPR(new _NoopGetTestability());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXczRFJsWEppLnRtcC9hbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6WyJUZXN0YWJpbGl0eSIsIlRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiVGVzdGFiaWxpdHkuX3dhdGNoQW5ndWxhckV2ZW50cyIsIlRlc3RhYmlsaXR5LmluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzU3RhYmxlIiwiVGVzdGFiaWxpdHkuX3J1bkNhbGxiYWNrc0lmUmVhZHkiLCJUZXN0YWJpbGl0eS53aGVuU3RhYmxlIiwiVGVzdGFiaWxpdHkuZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyIsIlRlc3RhYmlsaXR5LmZpbmRQcm92aWRlcnMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5IiwiVGVzdGFiaWxpdHlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlRlc3RhYmlsaXR5UmVnaXN0cnkucmVnaXN0ZXJBcHBsaWNhdGlvbiIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFJvb3RFbGVtZW50cyIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZmluZFRlc3RhYmlsaXR5SW5UcmVlIiwiX05vb3BHZXRUZXN0YWJpbGl0eSIsIl9Ob29wR2V0VGVzdGFiaWxpdHkuYWRkVG9XaW5kb3ciLCJfTm9vcEdldFRlc3RhYmlsaXR5LmZpbmRUZXN0YWJpbGl0eUluVHJlZSIsInNldFRlc3RhYmlsaXR5R2V0dGVyIl0sIm1hcHBpbmdzIjoi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S0FBSyxFQUFFOzt3QkFPUDtBQUVEOztHQUVHO0FBQ0gscUNBQXFDLE1BQXNCO0lBQ3pERyxrQkFBa0JBLEdBQUdBLE1BQU1BLENBQUNBO0FBQzlCQSxDQUFDQTtBQUVELElBQUksa0JBQWtCLEdBQW1CLFVBQVUsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDT05TVCwgQ09OU1RfRVhQUiwgc2NoZWR1bGVNaWNyb1Rhc2t9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnLi4vem9uZS9uZ196b25lJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogVGhlIFRlc3RhYmlsaXR5IHNlcnZpY2UgcHJvdmlkZXMgdGVzdGluZyBob29rcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBmcm9tXG4gKiB0aGUgYnJvd3NlciBhbmQgYnkgc2VydmljZXMgc3VjaCBhcyBQcm90cmFjdG9yLiBFYWNoIGJvb3RzdHJhcHBlZCBBbmd1bGFyXG4gKiBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSB3aWxsIGhhdmUgYW4gaW5zdGFuY2Ugb2YgVGVzdGFiaWxpdHkuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0YWJpbGl0eSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BlbmRpbmdDb3VudDogbnVtYmVyID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNab25lU3RhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYW55IHdvcmsgd2FzIGRvbmUgc2luY2UgdGhlIGxhc3QgJ3doZW5TdGFibGUnIGNhbGxiYWNrLiBUaGlzIGlzXG4gICAqIHVzZWZ1bCB0byBkZXRlY3QgaWYgdGhpcyBjb3VsZCBoYXZlIHBvdGVudGlhbGx5IGRlc3RhYmlsaXplZCBhbm90aGVyXG4gICAqIGNvbXBvbmVudCB3aGlsZSBpdCBpcyBzdGFiaWxpemluZy5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfZGlkV29yazogYm9vbGVhbiA9IGZhbHNlO1xuICAvKiogQGludGVybmFsICovXG4gIF9jYWxsYmFja3M6IEZ1bmN0aW9uW10gPSBbXTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHsgdGhpcy5fd2F0Y2hBbmd1bGFyRXZlbnRzKCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF93YXRjaEFuZ3VsYXJFdmVudHMoKTogdm9pZCB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX25nWm9uZS5vblVuc3RhYmxlLCAoXykgPT4ge1xuICAgICAgdGhpcy5fZGlkV29yayA9IHRydWU7XG4gICAgICB0aGlzLl9pc1pvbmVTdGFibGUgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fbmdab25lLm9uU3RhYmxlLCAoXykgPT4ge1xuICAgICAgICBOZ1pvbmUuYXNzZXJ0Tm90SW5Bbmd1bGFyWm9uZSgpO1xuICAgICAgICBzY2hlZHVsZU1pY3JvVGFzaygoKSA9PiB7XG4gICAgICAgICAgdGhpcy5faXNab25lU3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbmNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgKz0gMTtcbiAgICB0aGlzLl9kaWRXb3JrID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50O1xuICB9XG5cbiAgZGVjcmVhc2VQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7XG4gICAgdGhpcy5fcGVuZGluZ0NvdW50IC09IDE7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdDb3VudCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdwZW5kaW5nIGFzeW5jIHJlcXVlc3RzIGJlbG93IHplcm8nKTtcbiAgICB9XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7XG4gIH1cblxuICBpc1N0YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNab25lU3RhYmxlICYmIHRoaXMuX3BlbmRpbmdDb3VudCA9PSAwICYmICF0aGlzLl9uZ1pvbmUuaGFzUGVuZGluZ01hY3JvdGFza3M7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ydW5DYWxsYmFja3NJZlJlYWR5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzU3RhYmxlKCkpIHtcbiAgICAgIC8vIFNjaGVkdWxlcyB0aGUgY2FsbCBiYWNrcyBpbiBhIG5ldyBmcmFtZSBzbyB0aGF0IGl0IGlzIGFsd2F5cyBhc3luYy5cbiAgICAgIHNjaGVkdWxlTWljcm9UYXNrKCgpID0+IHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX2NhbGxiYWNrcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAodGhpcy5fY2FsbGJhY2tzLnBvcCgpKSh0aGlzLl9kaWRXb3JrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kaWRXb3JrID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm90IFJlYWR5XG4gICAgICB0aGlzLl9kaWRXb3JrID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gIH1cblxuICBnZXRQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7IH1cblxuICBmaW5kQmluZGluZ3ModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICAvLyBUT0RPKGp1bGllbXIpOiBpbXBsZW1lbnQuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZmluZFByb3ZpZGVycyh1c2luZzogYW55LCBwcm92aWRlcjogc3RyaW5nLCBleGFjdE1hdGNoOiBib29sZWFuKTogYW55W10ge1xuICAgIC8vIFRPRE8oanVsaWVtcik6IGltcGxlbWVudC5cbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuLyoqXG4gKiBBIGdsb2JhbCByZWdpc3RyeSBvZiB7QGxpbmsgVGVzdGFiaWxpdHl9IGluc3RhbmNlcyBmb3Igc3BlY2lmaWMgZWxlbWVudHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0YWJpbGl0eVJlZ2lzdHJ5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zID0gbmV3IE1hcDxhbnksIFRlc3RhYmlsaXR5PigpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBfdGVzdGFiaWxpdHlHZXR0ZXIuYWRkVG9XaW5kb3codGhpcyk7IH1cblxuICByZWdpc3RlckFwcGxpY2F0aW9uKHRva2VuOiBhbnksIHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkge1xuICAgIHRoaXMuX2FwcGxpY2F0aW9ucy5zZXQodG9rZW4sIHRlc3RhYmlsaXR5KTtcbiAgfVxuXG4gIGdldFRlc3RhYmlsaXR5KGVsZW06IGFueSk6IFRlc3RhYmlsaXR5IHsgcmV0dXJuIHRoaXMuX2FwcGxpY2F0aW9ucy5nZXQoZWxlbSk7IH1cblxuICBnZXRBbGxUZXN0YWJpbGl0aWVzKCk6IFRlc3RhYmlsaXR5W10geyByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXModGhpcy5fYXBwbGljYXRpb25zKTsgfVxuXG4gIGdldEFsbFJvb3RFbGVtZW50cygpOiBhbnlbXSB7IHJldHVybiBNYXBXcmFwcGVyLmtleXModGhpcy5fYXBwbGljYXRpb25zKTsgfVxuXG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShlbGVtOiBOb2RlLCBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4gPSB0cnVlKTogVGVzdGFiaWxpdHkge1xuICAgIHJldHVybiBfdGVzdGFiaWxpdHlHZXR0ZXIuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHRoaXMsIGVsZW0sIGZpbmRJbkFuY2VzdG9ycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGFwdGVyIGludGVyZmFjZSBmb3IgcmV0cmlldmluZyB0aGUgYFRlc3RhYmlsaXR5YCBzZXJ2aWNlIGFzc29jaWF0ZWQgZm9yIGFcbiAqIHBhcnRpY3VsYXIgY29udGV4dC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZDtcbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6XG4gICAgICBUZXN0YWJpbGl0eTtcbn1cblxuQENPTlNUKClcbmNsYXNzIF9Ob29wR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7fVxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTpcbiAgICAgIFRlc3RhYmlsaXR5IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFNldCB0aGUge0BsaW5rIEdldFRlc3RhYmlsaXR5fSBpbXBsZW1lbnRhdGlvbiB1c2VkIGJ5IHRoZSBBbmd1bGFyIHRlc3RpbmcgZnJhbWV3b3JrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VGVzdGFiaWxpdHlHZXR0ZXIoZ2V0dGVyOiBHZXRUZXN0YWJpbGl0eSk6IHZvaWQge1xuICBfdGVzdGFiaWxpdHlHZXR0ZXIgPSBnZXR0ZXI7XG59XG5cbnZhciBfdGVzdGFiaWxpdHlHZXR0ZXI6IEdldFRlc3RhYmlsaXR5ID0gQ09OU1RfRVhQUihuZXcgX05vb3BHZXRUZXN0YWJpbGl0eSgpKTtcbiJdfQ==