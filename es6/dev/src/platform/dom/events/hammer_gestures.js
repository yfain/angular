var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { HammerGesturesPluginCommon } from './hammer_common';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable, Inject, OpaqueToken } from 'angular2/core';
export const HAMMER_GESTURE_CONFIG = CONST_EXPR(new OpaqueToken("HammerGestureConfig"));
export let HammerGestureConfig = class {
    constructor() {
        this.events = [];
        this.overrides = {};
    }
    buildHammer(element) {
        var mc = new Hammer(element);
        mc.get('pinch').set({ enable: true });
        mc.get('rotate').set({ enable: true });
        for (let eventName in this.overrides) {
            mc.get(eventName).set(this.overrides[eventName]);
        }
        return mc;
    }
};
HammerGestureConfig = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HammerGestureConfig);
export let HammerGesturesPlugin = class extends HammerGesturesPluginCommon {
    constructor(_config) {
        super();
        this._config = _config;
    }
    supports(eventName) {
        if (!super.supports(eventName) && !this.isCustomEvent(eventName))
            return false;
        if (!isPresent(window['Hammer'])) {
            throw new BaseException(`Hammer.js is not loaded, can not bind ${eventName} event`);
        }
        return true;
    }
    addEventListener(element, eventName, handler) {
        var zone = this.manager.getZone();
        eventName = eventName.toLowerCase();
        return zone.runOutsideAngular(() => {
            // Creating the manager bind events, must be done outside of angular
            var mc = this._config.buildHammer(element);
            var callback = function (eventObj) { zone.run(function () { handler(eventObj); }); };
            mc.on(eventName, callback);
            return () => { mc.off(eventName, callback); };
        });
    }
    isCustomEvent(eventName) { return this._config.events.indexOf(eventName) > -1; }
};
HammerGesturesPlugin = __decorate([
    Injectable(),
    __param(0, Inject(HAMMER_GESTURE_CONFIG)), 
    __metadata('design:paramtypes', [HammerGestureConfig])
], HammerGesturesPlugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1oNjBEMm0wbS50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVDb25maWciLCJIYW1tZXJHZXN0dXJlQ29uZmlnLmNvbnN0cnVjdG9yIiwiSGFtbWVyR2VzdHVyZUNvbmZpZy5idWlsZEhhbW1lciIsIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uY29uc3RydWN0b3IiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5zdXBwb3J0cyIsIkhhbW1lckdlc3R1cmVzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5pc0N1c3RvbUV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0saUJBQWlCO09BQ25ELEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUN2RCxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWU7QUFFN0QsYUFBYSxxQkFBcUIsR0FDOUIsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQU92RDtJQUFBQTtRQUVFQyxXQUFNQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUV0QkEsY0FBU0EsR0FBNEJBLEVBQUVBLENBQUNBO0lBYzFDQSxDQUFDQTtJQVpDRCxXQUFXQSxDQUFDQSxPQUFvQkE7UUFDOUJFLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBRTdCQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxP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QztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbn0gZnJvbSAnLi9oYW1tZXJfY29tbW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuZXhwb3J0IGNvbnN0IEhBTU1FUl9HRVNUVVJFX0NPTkZJRzogT3BhcXVlVG9rZW4gPVxuICAgIENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiSGFtbWVyR2VzdHVyZUNvbmZpZ1wiKSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGFtbWVySW5zdGFuY2Uge1xuICBvbihldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZDtcbiAgb2ZmKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGFtbWVyR2VzdHVyZUNvbmZpZyB7XG4gIGV2ZW50czogc3RyaW5nW10gPSBbXTtcblxuICBvdmVycmlkZXM6IHtba2V5OiBzdHJpbmddOiBPYmplY3R9ID0ge307XG5cbiAgYnVpbGRIYW1tZXIoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBIYW1tZXJJbnN0YW5jZSB7XG4gICAgdmFyIG1jID0gbmV3IEhhbW1lcihlbGVtZW50KTtcblxuICAgIG1jLmdldCgncGluY2gnKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgIG1jLmdldCgncm90YXRlJykuc2V0KHtlbmFibGU6IHRydWV9KTtcblxuICAgIGZvciAobGV0IGV2ZW50TmFtZSBpbiB0aGlzLm92ZXJyaWRlcykge1xuICAgICAgbWMuZ2V0KGV2ZW50TmFtZSkuc2V0KHRoaXMub3ZlcnJpZGVzW2V2ZW50TmFtZV0pO1xuICAgIH1cblxuICAgIHJldHVybiBtYztcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGFtbWVyR2VzdHVyZXNQbHVnaW4gZXh0ZW5kcyBIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbiB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoSEFNTUVSX0dFU1RVUkVfQ09ORklHKSBwcml2YXRlIF9jb25maWc6IEhhbW1lckdlc3R1cmVDb25maWcpIHsgc3VwZXIoKTsgfVxuXG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdXBlci5zdXBwb3J0cyhldmVudE5hbWUpICYmICF0aGlzLmlzQ3VzdG9tRXZlbnQoZXZlbnROYW1lKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFpc1ByZXNlbnQod2luZG93WydIYW1tZXInXSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBIYW1tZXIuanMgaXMgbm90IGxvYWRlZCwgY2FuIG5vdCBiaW5kICR7ZXZlbnROYW1lfSBldmVudGApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICBldmVudE5hbWUgPSBldmVudE5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIC8vIENyZWF0aW5nIHRoZSBtYW5hZ2VyIGJpbmQgZXZlbnRzLCBtdXN0IGJlIGRvbmUgb3V0c2lkZSBvZiBhbmd1bGFyXG4gICAgICB2YXIgbWMgPSB0aGlzLl9jb25maWcuYnVpbGRIYW1tZXIoZWxlbWVudCk7XG4gICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihldmVudE9iaikgeyB6b25lLnJ1bihmdW5jdGlvbigpIHsgaGFuZGxlcihldmVudE9iaik7IH0pOyB9O1xuICAgICAgbWMub24oZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICByZXR1cm4gKCkgPT4geyBtYy5vZmYoZXZlbnROYW1lLCBjYWxsYmFjayk7IH07XG4gICAgfSk7XG4gIH1cblxuICBpc0N1c3RvbUV2ZW50KGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9jb25maWcuZXZlbnRzLmluZGV4T2YoZXZlbnROYW1lKSA+IC0xOyB9XG59XG4iXX0=