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
export let RenderStore = class {
    constructor() {
        this._nextIndex = 0;
        this._lookupById = new Map();
        this._lookupByObject = new Map();
    }
    allocateId() { return this._nextIndex++; }
    store(obj, id) {
        this._lookupById.set(id, obj);
        this._lookupByObject.set(obj, id);
    }
    remove(obj) {
        var index = this._lookupByObject.get(obj);
        this._lookupByObject.delete(obj);
        this._lookupById.delete(index);
    }
    deserialize(id) {
        if (id == null) {
            return null;
        }
        if (!this._lookupById.has(id)) {
            return null;
        }
        return this._lookupById.get(id);
    }
    serialize(obj) {
        if (obj == null) {
            return null;
        }
        return this._lookupByObject.get(obj);
    }
};
RenderStore = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], RenderStore);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC13M0RSbFhKaS50bXAvYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyU3RvcmUiLCJSZW5kZXJTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclN0b3JlLmFsbG9jYXRlSWQiLCJSZW5kZXJTdG9yZS5zdG9yZSIsIlJlbmRlclN0b3JlLnJlbW92ZSIsIlJlbmRlclN0b3JlLmRlc2VyaWFsaXplIiwiUmVuZGVyU3RvcmUuc2VyaWFsaXplIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUUvQztJQU1FQTtRQUpRQyxlQUFVQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUs3QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBZUEsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLEdBQUdBLEVBQWVBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVERCxVQUFVQSxLQUFhRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsREYsS0FBS0EsQ0FBQ0EsR0FBUUEsRUFBRUEsRUFBVUE7UUFDeEJHLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFFREgsTUFBTUEsQ0FBQ0EsR0FBUUE7UUFDYkksSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFFREosV0FBV0EsQ0FBQ0EsRUFBVUE7UUFDcEJLLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2ZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7SUFFREwsU0FBU0EsQ0FBQ0EsR0FBUUE7UUFDaEJNLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7QUFDSE4sQ0FBQ0E7QUExQ0Q7SUFBQyxVQUFVLEVBQUU7O2dCQTBDWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZW5kZXJTdG9yZSB7XG4gIHByaXZhdGUgX25leHRJbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBfbG9va3VwQnlJZDogTWFwPG51bWJlciwgYW55PjtcbiAgcHJpdmF0ZSBfbG9va3VwQnlPYmplY3Q6IE1hcDxhbnksIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbG9va3VwQnlJZCA9IG5ldyBNYXA8bnVtYmVyLCBhbnk+KCk7XG4gICAgdGhpcy5fbG9va3VwQnlPYmplY3QgPSBuZXcgTWFwPGFueSwgbnVtYmVyPigpO1xuICB9XG5cbiAgYWxsb2NhdGVJZCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbmV4dEluZGV4Kys7IH1cblxuICBzdG9yZShvYmo6IGFueSwgaWQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2xvb2t1cEJ5SWQuc2V0KGlkLCBvYmopO1xuICAgIHRoaXMuX2xvb2t1cEJ5T2JqZWN0LnNldChvYmosIGlkKTtcbiAgfVxuXG4gIHJlbW92ZShvYmo6IGFueSk6IHZvaWQge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX2xvb2t1cEJ5T2JqZWN0LmdldChvYmopO1xuICAgIHRoaXMuX2xvb2t1cEJ5T2JqZWN0LmRlbGV0ZShvYmopO1xuICAgIHRoaXMuX2xvb2t1cEJ5SWQuZGVsZXRlKGluZGV4KTtcbiAgfVxuXG4gIGRlc2VyaWFsaXplKGlkOiBudW1iZXIpOiBhbnkge1xuICAgIGlmIChpZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2xvb2t1cEJ5SWQuaGFzKGlkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xvb2t1cEJ5SWQuZ2V0KGlkKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZShvYmo6IGFueSk6IG51bWJlciB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2xvb2t1cEJ5T2JqZWN0LmdldChvYmopO1xuICB9XG59XG4iXX0=