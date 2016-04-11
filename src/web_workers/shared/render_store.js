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
var RenderStore = (function () {
    function RenderStore() {
        this._nextIndex = 0;
        this._lookupById = new Map();
        this._lookupByObject = new Map();
    }
    RenderStore.prototype.allocateId = function () { return this._nextIndex++; };
    RenderStore.prototype.store = function (obj, id) {
        this._lookupById.set(id, obj);
        this._lookupByObject.set(obj, id);
    };
    RenderStore.prototype.remove = function (obj) {
        var index = this._lookupByObject.get(obj);
        this._lookupByObject.delete(obj);
        this._lookupById.delete(index);
    };
    RenderStore.prototype.deserialize = function (id) {
        if (id == null) {
            return null;
        }
        if (!this._lookupById.has(id)) {
            return null;
        }
        return this._lookupById.get(id);
    };
    RenderStore.prototype.serialize = function (obj) {
        if (obj == null) {
            return null;
        }
        return this._lookupByObject.get(obj);
    };
    RenderStore = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], RenderStore);
    return RenderStore;
})();
exports.RenderStore = RenderStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyU3RvcmUiLCJSZW5kZXJTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclN0b3JlLmFsbG9jYXRlSWQiLCJSZW5kZXJTdG9yZS5zdG9yZSIsIlJlbmRlclN0b3JlLnJlbW92ZSIsIlJlbmRlclN0b3JlLmRlc2VyaWFsaXplIiwiUmVuZGVyU3RvcmUuc2VyaWFsaXplIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRDtJQU1FQTtRQUpRQyxlQUFVQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUs3QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBZUEsQ0FBQ0E7UUFDMUNBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLEdBQUdBLEVBQWVBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVERCxnQ0FBVUEsR0FBVkEsY0FBdUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRWxERiwyQkFBS0EsR0FBTEEsVUFBTUEsR0FBUUEsRUFBRUEsRUFBVUE7UUFDeEJHLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFFREgsNEJBQU1BLEdBQU5BLFVBQU9BLEdBQVFBO1FBQ2JJLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQzFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBRURKLGlDQUFXQSxHQUFYQSxVQUFZQSxFQUFVQTtRQUNwQkssRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQ2xDQSxDQUFDQTtJQUVETCwrQkFBU0EsR0FBVEEsVUFBVUEsR0FBUUE7UUFDaEJNLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUF6Q0hOO1FBQUNBLGVBQVVBLEVBQUVBOztvQkEwQ1pBO0lBQURBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQTFDRCxJQTBDQztBQXpDWSxtQkFBVyxjQXlDdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVuZGVyU3RvcmUge1xuICBwcml2YXRlIF9uZXh0SW5kZXg6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgX2xvb2t1cEJ5SWQ6IE1hcDxudW1iZXIsIGFueT47XG4gIHByaXZhdGUgX2xvb2t1cEJ5T2JqZWN0OiBNYXA8YW55LCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2xvb2t1cEJ5SWQgPSBuZXcgTWFwPG51bWJlciwgYW55PigpO1xuICAgIHRoaXMuX2xvb2t1cEJ5T2JqZWN0ID0gbmV3IE1hcDxhbnksIG51bWJlcj4oKTtcbiAgfVxuXG4gIGFsbG9jYXRlSWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX25leHRJbmRleCsrOyB9XG5cbiAgc3RvcmUob2JqOiBhbnksIGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9sb29rdXBCeUlkLnNldChpZCwgb2JqKTtcbiAgICB0aGlzLl9sb29rdXBCeU9iamVjdC5zZXQob2JqLCBpZCk7XG4gIH1cblxuICByZW1vdmUob2JqOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9sb29rdXBCeU9iamVjdC5nZXQob2JqKTtcbiAgICB0aGlzLl9sb29rdXBCeU9iamVjdC5kZWxldGUob2JqKTtcbiAgICB0aGlzLl9sb29rdXBCeUlkLmRlbGV0ZShpbmRleCk7XG4gIH1cblxuICBkZXNlcmlhbGl6ZShpZDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9sb29rdXBCeUlkLmhhcyhpZCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb29rdXBCeUlkLmdldChpZCk7XG4gIH1cblxuICBzZXJpYWxpemUob2JqOiBhbnkpOiBudW1iZXIge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9sb29rdXBCeU9iamVjdC5nZXQob2JqKTtcbiAgfVxufVxuIl19