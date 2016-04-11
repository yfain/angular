'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
 *
 * The only known difference between this `Headers` implementation and the spec is the
 * lack of an `entries` method.
 *
 * ### Example ([live demo](http://plnkr.co/edit/MTdwT6?p=preview))
 *
 * ```
 * import {Headers} from 'angular2/http';
 *
 * var firstHeaders = new Headers();
 * firstHeaders.append('Content-Type', 'image/jpeg');
 * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
 *
 * // Create headers from Plain Old JavaScript Object
 * var secondHeaders = new Headers({
 *   'X-My-Custom-Header': 'Angular'
 * });
 * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
 *
 * var thirdHeaders = new Headers(secondHeaders);
 * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
 * ```
 */
var Headers = (function () {
    function Headers(headers) {
        var _this = this;
        if (headers instanceof Headers) {
            this._headersMap = headers._headersMap;
            return;
        }
        this._headersMap = new collection_1.Map();
        if (lang_1.isBlank(headers)) {
            return;
        }
        // headers instanceof StringMap
        collection_1.StringMapWrapper.forEach(headers, function (v, k) {
            _this._headersMap.set(k, collection_1.isListLikeIterable(v) ? v : [v]);
        });
    }
    /**
     * Returns a new Headers instance from the given DOMString of Response Headers
     */
    Headers.fromResponseHeaderString = function (headersString) {
        return headersString.trim()
            .split('\n')
            .map(function (val) { return val.split(':'); })
            .map(function (_a) {
            var key = _a[0], parts = _a.slice(1);
            return ([key.trim(), parts.join(':').trim()]);
        })
            .reduce(function (headers, _a) {
            var key = _a[0], value = _a[1];
            return !headers.set(key, value) && headers;
        }, new Headers());
    };
    /**
     * Appends a header to existing list of header values for a given header name.
     */
    Headers.prototype.append = function (name, value) {
        var mapName = this._headersMap.get(name);
        var list = collection_1.isListLikeIterable(mapName) ? mapName : [];
        list.push(value);
        this._headersMap.set(name, list);
    };
    /**
     * Deletes all header values for the given name.
     */
    Headers.prototype.delete = function (name) { this._headersMap.delete(name); };
    Headers.prototype.forEach = function (fn) {
        this._headersMap.forEach(fn);
    };
    /**
     * Returns first header that matches given name.
     */
    Headers.prototype.get = function (header) { return collection_1.ListWrapper.first(this._headersMap.get(header)); };
    /**
     * Check for existence of header by given name.
     */
    Headers.prototype.has = function (header) { return this._headersMap.has(header); };
    /**
     * Provides names of set headers
     */
    Headers.prototype.keys = function () { return collection_1.MapWrapper.keys(this._headersMap); };
    /**
     * Sets or overrides header value for given name.
     */
    Headers.prototype.set = function (header, value) {
        var list = [];
        if (collection_1.isListLikeIterable(value)) {
            var pushValue = value.join(',');
            list.push(pushValue);
        }
        else {
            list.push(value);
        }
        this._headersMap.set(header, list);
    };
    /**
     * Returns values of all headers.
     */
    Headers.prototype.values = function () { return collection_1.MapWrapper.values(this._headersMap); };
    /**
     * Returns string of all headers.
     */
    Headers.prototype.toJSON = function () {
        var serializableHeaders = {};
        this._headersMap.forEach(function (values, name) {
            var list = [];
            collection_1.iterateListLike(values, function (val) { return list = collection_1.ListWrapper.concat(list, val.split(',')); });
            serializableHeaders[name] = list;
        });
        return serializableHeaders;
    };
    /**
     * Returns list of header values for a given name.
     */
    Headers.prototype.getAll = function (header) {
        var headers = this._headersMap.get(header);
        return collection_1.isListLikeIterable(headers) ? headers : [];
    };
    /**
     * This method is not implemented.
     */
    Headers.prototype.entries = function () { throw new exceptions_1.BaseException('"entries" method is not implemented on Headers class'); };
    return Headers;
})();
exports.Headers = Headers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9odHRwL2hlYWRlcnMudHMiXSwibmFtZXMiOlsiSGVhZGVycyIsIkhlYWRlcnMuY29uc3RydWN0b3IiLCJIZWFkZXJzLmZyb21SZXNwb25zZUhlYWRlclN0cmluZyIsIkhlYWRlcnMuYXBwZW5kIiwiSGVhZGVycy5kZWxldGUiLCJIZWFkZXJzLmZvckVhY2giLCJIZWFkZXJzLmdldCIsIkhlYWRlcnMuaGFzIiwiSGVhZGVycy5rZXlzIiwiSGVhZGVycy5zZXQiLCJIZWFkZXJzLnZhbHVlcyIsIkhlYWRlcnMudG9KU09OIiwiSGVhZGVycy5nZXRBbGwiLCJIZWFkZXJzLmVudHJpZXMiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUEwRSwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3JHLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLDJCQUFtRyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXBJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0g7SUFHRUEsaUJBQVlBLE9BQXNDQTtRQUhwREMsaUJBa0hDQTtRQTlHR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsWUFBWUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLElBQUlBLENBQUNBLFdBQVdBLEdBQWFBLE9BQVFBLENBQUNBLFdBQVdBLENBQUNBO1lBQ2xEQSxNQUFNQSxDQUFDQTtRQUNUQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBb0JBLENBQUNBO1FBRS9DQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFFREEsK0JBQStCQTtRQUMvQkEsNkJBQWdC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LEdBQUdBLENBQUNBLENBQUNBLEVBQS9DQSxDQUErQ0EsQ0FBQ0EsQ0FBQ0E7WUFFaEZBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkNBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBRURYOztPQUVHQTtJQUNIQSx3QkFBTUEsR0FBTkEsVUFBT0EsTUFBY0E7UUFDbkJZLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQzNDQSxNQUFNQSxDQUFDQSwrQkFBa0JBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLE9BQU9BLEdBQUdBLEVBQUVBLENBQUNBO0lBQ3BEQSxDQUFDQTtJQUVEWjs7T0FFR0E7SUFDSEEseUJBQU9BLEdBQVBBLGNBQVlhLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxzREFBc0RBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hHYixjQUFDQTtBQUFEQSxDQUFDQSxBQWxIRCxJQWtIQztBQWxIWSxlQUFPLFVBa0huQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIGlzSnNPYmplY3QsIGlzVHlwZSwgU3RyaW5nV3JhcHBlciwgSnNvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7aXNMaXN0TGlrZUl0ZXJhYmxlLCBpdGVyYXRlTGlzdExpa2UsIE1hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXIsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBbSGVhZGVyc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hlYWRlcnMvSGVhZGVycyksIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIFtGZXRjaCBTcGVjXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jaGVhZGVycy1jbGFzcykuXG4gKlxuICogVGhlIG9ubHkga25vd24gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYEhlYWRlcnNgIGltcGxlbWVudGF0aW9uIGFuZCB0aGUgc3BlYyBpcyB0aGVcbiAqIGxhY2sgb2YgYW4gYGVudHJpZXNgIG1ldGhvZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvTVRkd1Q2P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0hlYWRlcnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIHZhciBmaXJzdEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICogZmlyc3RIZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2ltYWdlL2pwZWcnKTtcbiAqIGNvbnNvbGUubG9nKGZpcnN0SGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpKSAvLydpbWFnZS9qcGVnJ1xuICpcbiAqIC8vIENyZWF0ZSBoZWFkZXJzIGZyb20gUGxhaW4gT2xkIEphdmFTY3JpcHQgT2JqZWN0XG4gKiB2YXIgc2Vjb25kSGVhZGVycyA9IG5ldyBIZWFkZXJzKHtcbiAqICAgJ1gtTXktQ3VzdG9tLUhlYWRlcic6ICdBbmd1bGFyJ1xuICogfSk7XG4gKiBjb25zb2xlLmxvZyhzZWNvbmRIZWFkZXJzLmdldCgnWC1NeS1DdXN0b20tSGVhZGVyJykpOyAvLydBbmd1bGFyJ1xuICpcbiAqIHZhciB0aGlyZEhlYWRlcnMgPSBuZXcgSGVhZGVycyhzZWNvbmRIZWFkZXJzKTtcbiAqIGNvbnNvbGUubG9nKHRoaXJkSGVhZGVycy5nZXQoJ1gtTXktQ3VzdG9tLUhlYWRlcicpKTsgLy8nQW5ndWxhcidcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSGVhZGVycyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hlYWRlcnNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgY29uc3RydWN0b3IoaGVhZGVycz86IEhlYWRlcnN8e1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIHRoaXMuX2hlYWRlcnNNYXAgPSAoPEhlYWRlcnM+aGVhZGVycykuX2hlYWRlcnNNYXA7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faGVhZGVyc01hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcblxuICAgIGlmIChpc0JsYW5rKGhlYWRlcnMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaGVhZGVycyBpbnN0YW5jZW9mIFN0cmluZ01hcFxuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChoZWFkZXJzLCAodjogYW55LCBrOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KGssIGlzTGlzdExpa2VJdGVyYWJsZSh2KSA/IHYgOiBbdl0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgSGVhZGVycyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiBET01TdHJpbmcgb2YgUmVzcG9uc2UgSGVhZGVyc1xuICAgKi9cbiAgc3RhdGljIGZyb21SZXNwb25zZUhlYWRlclN0cmluZyhoZWFkZXJzU3RyaW5nOiBzdHJpbmcpOiBIZWFkZXJzIHtcbiAgICByZXR1cm4gaGVhZGVyc1N0cmluZy50cmltKClcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHZhbCA9PiB2YWwuc3BsaXQoJzonKSlcbiAgICAgICAgLm1hcCgoW2tleSwgLi4ucGFydHNdKSA9PiAoW2tleS50cmltKCksIHBhcnRzLmpvaW4oJzonKS50cmltKCldKSlcbiAgICAgICAgLnJlZHVjZSgoaGVhZGVycywgW2tleSwgdmFsdWVdKSA9PiAhaGVhZGVycy5zZXQoa2V5LCB2YWx1ZSkgJiYgaGVhZGVycywgbmV3IEhlYWRlcnMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIGhlYWRlciB0byBleGlzdGluZyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gaGVhZGVyIG5hbWUuXG4gICAqL1xuICBhcHBlbmQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIG1hcE5hbWUgPSB0aGlzLl9oZWFkZXJzTWFwLmdldChuYW1lKTtcbiAgICB2YXIgbGlzdCA9IGlzTGlzdExpa2VJdGVyYWJsZShtYXBOYW1lKSA/IG1hcE5hbWUgOiBbXTtcbiAgICBsaXN0LnB1c2godmFsdWUpO1xuICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KG5hbWUsIGxpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgYWxsIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZGVsZXRlIChuYW1lOiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5faGVhZGVyc01hcC5kZWxldGUobmFtZSk7IH1cblxuICBmb3JFYWNoKGZuOiAodmFsdWVzOiBzdHJpbmdbXSwgbmFtZTogc3RyaW5nLCBoZWFkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFkZXJzTWFwLmZvckVhY2goZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZmlyc3QgaGVhZGVyIHRoYXQgbWF0Y2hlcyBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZ2V0KGhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIExpc3RXcmFwcGVyLmZpcnN0KHRoaXMuX2hlYWRlcnNNYXAuZ2V0KGhlYWRlcikpOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciBleGlzdGVuY2Ugb2YgaGVhZGVyIGJ5IGdpdmVuIG5hbWUuXG4gICAqL1xuICBoYXMoaGVhZGVyOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2hlYWRlcnNNYXAuaGFzKGhlYWRlcik7IH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgbmFtZXMgb2Ygc2V0IGhlYWRlcnNcbiAgICovXG4gIGtleXMoKTogc3RyaW5nW10geyByZXR1cm4gTWFwV3JhcHBlci5rZXlzKHRoaXMuX2hlYWRlcnNNYXApOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgb3Igb3ZlcnJpZGVzIGhlYWRlciB2YWx1ZSBmb3IgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIHNldChoZWFkZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xzdHJpbmdbXSk6IHZvaWQge1xuICAgIHZhciBsaXN0OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgIHZhciBwdXNoVmFsdWUgPSAoPHN0cmluZ1tdPnZhbHVlKS5qb2luKCcsJyk7XG4gICAgICBsaXN0LnB1c2gocHVzaFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5wdXNoKDxzdHJpbmc+dmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KGhlYWRlciwgbGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB2YWx1ZXMgb2YgYWxsIGhlYWRlcnMuXG4gICAqL1xuICB2YWx1ZXMoKTogc3RyaW5nW11bXSB7IHJldHVybiBNYXBXcmFwcGVyLnZhbHVlcyh0aGlzLl9oZWFkZXJzTWFwKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHN0cmluZyBvZiBhbGwgaGVhZGVycy5cbiAgICovXG4gIHRvSlNPTigpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgbGV0IHNlcmlhbGl6YWJsZUhlYWRlcnMgPSB7fTtcbiAgICB0aGlzLl9oZWFkZXJzTWFwLmZvckVhY2goKHZhbHVlczogc3RyaW5nW10sIG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgbGV0IGxpc3QgPSBbXTtcblxuICAgICAgaXRlcmF0ZUxpc3RMaWtlKHZhbHVlcywgdmFsID0+IGxpc3QgPSBMaXN0V3JhcHBlci5jb25jYXQobGlzdCwgdmFsLnNwbGl0KCcsJykpKTtcblxuICAgICAgc2VyaWFsaXphYmxlSGVhZGVyc1tuYW1lXSA9IGxpc3Q7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlcmlhbGl6YWJsZUhlYWRlcnM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldEFsbChoZWFkZXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICB2YXIgaGVhZGVycyA9IHRoaXMuX2hlYWRlcnNNYXAuZ2V0KGhlYWRlcik7XG4gICAgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShoZWFkZXJzKSA/IGhlYWRlcnMgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQuXG4gICAqL1xuICBlbnRyaWVzKCkgeyB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignXCJlbnRyaWVzXCIgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBvbiBIZWFkZXJzIGNsYXNzJyk7IH1cbn1cbiJdfQ==