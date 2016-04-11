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
export const HAMMER_GESTURE_CONFIG = CONST_EXPR(new OpaqueToken('HammerGestureConfig'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WdmlwQ0JVUC50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVDb25maWciLCJIYW1tZXJHZXN0dXJlQ29uZmlnLmNvbnN0cnVjdG9yIiwiSGFtbWVyR2VzdHVyZUNvbmZpZy5idWlsZEhhbW1lciIsIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uY29uc3RydWN0b3IiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5zdXBwb3J0cyIsIkhhbW1lckdlc3R1cmVzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5pc0N1c3RvbUV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0saUJBQWlCO09BQ25ELEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUN2RCxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWU7QUFFN0QsYUFBYSxxQkFBcUIsR0FDOUIsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQU92RDtJQUFBQTtRQUVFQyxXQUFNQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUV0QkEsY0FBU0EsR0FBNEJBLEVBQUVBLENBQUNBO0lBYzFDQSxDQUFDQTtJQVpDRCxXQUFXQSxDQUFDQSxPQUFvQkE7UUFDOUJFLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBRTdCQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxP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QztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbn0gZnJvbSAnLi9oYW1tZXJfY29tbW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuZXhwb3J0IGNvbnN0IEhBTU1FUl9HRVNUVVJFX0NPTkZJRzogT3BhcXVlVG9rZW4gPVxuICAgIENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdIYW1tZXJHZXN0dXJlQ29uZmlnJykpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEhhbW1lckluc3RhbmNlIHtcbiAgb24oZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQ7XG4gIG9mZihldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZDtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhhbW1lckdlc3R1cmVDb25maWcge1xuICBldmVudHM6IHN0cmluZ1tdID0gW107XG5cbiAgb3ZlcnJpZGVzOiB7W2tleTogc3RyaW5nXTogT2JqZWN0fSA9IHt9O1xuXG4gIGJ1aWxkSGFtbWVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSGFtbWVySW5zdGFuY2Uge1xuICAgIHZhciBtYyA9IG5ldyBIYW1tZXIoZWxlbWVudCk7XG5cbiAgICBtYy5nZXQoJ3BpbmNoJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICBtYy5nZXQoJ3JvdGF0ZScpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG5cbiAgICBmb3IgKGxldCBldmVudE5hbWUgaW4gdGhpcy5vdmVycmlkZXMpIHtcbiAgICAgIG1jLmdldChldmVudE5hbWUpLnNldCh0aGlzLm92ZXJyaWRlc1tldmVudE5hbWVdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWM7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhhbW1lckdlc3R1cmVzUGx1Z2luIGV4dGVuZHMgSGFtbWVyR2VzdHVyZXNQbHVnaW5Db21tb24ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KEhBTU1FUl9HRVNUVVJFX0NPTkZJRykgcHJpdmF0ZSBfY29uZmlnOiBIYW1tZXJHZXN0dXJlQ29uZmlnKSB7IHN1cGVyKCk7IH1cblxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghc3VwZXIuc3VwcG9ydHMoZXZlbnROYW1lKSAmJiAhdGhpcy5pc0N1c3RvbUV2ZW50KGV2ZW50TmFtZSkpIHJldHVybiBmYWxzZTtcblxuICAgIGlmICghaXNQcmVzZW50KHdpbmRvd1snSGFtbWVyJ10pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgSGFtbWVyLmpzIGlzIG5vdCBsb2FkZWQsIGNhbiBub3QgYmluZCAke2V2ZW50TmFtZX0gZXZlbnRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgZXZlbnROYW1lID0gZXZlbnROYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICByZXR1cm4gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAvLyBDcmVhdGluZyB0aGUgbWFuYWdlciBiaW5kIGV2ZW50cywgbXVzdCBiZSBkb25lIG91dHNpZGUgb2YgYW5ndWxhclxuICAgICAgdmFyIG1jID0gdGhpcy5fY29uZmlnLmJ1aWxkSGFtbWVyKGVsZW1lbnQpO1xuICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oZXZlbnRPYmopIHsgem9uZS5ydW4oZnVuY3Rpb24oKSB7IGhhbmRsZXIoZXZlbnRPYmopOyB9KTsgfTtcbiAgICAgIG1jLm9uKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuICgpID0+IHsgbWMub2ZmKGV2ZW50TmFtZSwgY2FsbGJhY2spOyB9O1xuICAgIH0pO1xuICB9XG5cbiAgaXNDdXN0b21FdmVudChldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fY29uZmlnLmV2ZW50cy5pbmRleE9mKGV2ZW50TmFtZSkgPiAtMTsgfVxufVxuIl19