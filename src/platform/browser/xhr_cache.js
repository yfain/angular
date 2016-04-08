'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xhr_1 = require('angular2/src/compiler/xhr');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
/**
 * An implementation of XHR that uses a template cache to avoid doing an actual
 * XHR.
 *
 * The template cache needs to be built and loaded into window.$templateCache
 * via a separate mechanism.
 */
var CachedXHR = (function (_super) {
    __extends(CachedXHR, _super);
    function CachedXHR() {
        _super.call(this);
        this._cache = lang_1.global.$templateCache;
        if (this._cache == null) {
            throw new exceptions_1.BaseException('CachedXHR: Template cache was not found in $templateCache.');
        }
    }
    CachedXHR.prototype.get = function (url) {
        if (this._cache.hasOwnProperty(url)) {
            return promise_1.PromiseWrapper.resolve(this._cache[url]);
        }
        else {
            return promise_1.PromiseWrapper.reject('CachedXHR: Did not find cached template for ' + url, null);
        }
    };
    return CachedXHR;
})(xhr_1.XHR);
exports.CachedXHR = CachedXHR;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2NhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1mRXVkOUd6bS50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIveGhyX2NhY2hlLnRzIl0sIm5hbWVzIjpbIkNhY2hlZFhIUiIsIkNhY2hlZFhIUi5jb25zdHJ1Y3RvciIsIkNhY2hlZFhIUi5nZXQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsd0JBQTZCLDZCQUE2QixDQUFDLENBQUE7QUFFM0Q7Ozs7OztHQU1HO0FBQ0g7SUFBK0JBLDZCQUFHQTtJQUdoQ0E7UUFDRUMsaUJBQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLE1BQU1BLEdBQVNBLGFBQU9BLENBQUNBLGNBQWNBLENBQUNBO1FBQzNDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDREQUE0REEsQ0FBQ0EsQ0FBQ0E7UUFDeEZBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURELHVCQUFHQSxHQUFIQSxVQUFJQSxHQUFXQTtRQUNiRSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQ0EsTUFBTUEsQ0FBQ0Esd0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ2xEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSx3QkFBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsOENBQThDQSxHQUFHQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzRkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDSEYsZ0JBQUNBO0FBQURBLENBQUNBLEFBbEJELEVBQStCLFNBQUcsRUFrQmpDO0FBbEJZLGlCQUFTLFlBa0JyQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIFhIUiB0aGF0IHVzZXMgYSB0ZW1wbGF0ZSBjYWNoZSB0byBhdm9pZCBkb2luZyBhbiBhY3R1YWxcbiAqIFhIUi5cbiAqXG4gKiBUaGUgdGVtcGxhdGUgY2FjaGUgbmVlZHMgdG8gYmUgYnVpbHQgYW5kIGxvYWRlZCBpbnRvIHdpbmRvdy4kdGVtcGxhdGVDYWNoZVxuICogdmlhIGEgc2VwYXJhdGUgbWVjaGFuaXNtLlxuICovXG5leHBvcnQgY2xhc3MgQ2FjaGVkWEhSIGV4dGVuZHMgWEhSIHtcbiAgcHJpdmF0ZSBfY2FjaGU6IHtbdXJsOiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fY2FjaGUgPSAoPGFueT5nbG9iYWwpLiR0ZW1wbGF0ZUNhY2hlO1xuICAgIGlmICh0aGlzLl9jYWNoZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2FjaGVkWEhSOiBUZW1wbGF0ZSBjYWNoZSB3YXMgbm90IGZvdW5kIGluICR0ZW1wbGF0ZUNhY2hlLicpO1xuICAgIH1cbiAgfVxuXG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKHRoaXMuX2NhY2hlLmhhc093blByb3BlcnR5KHVybCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuX2NhY2hlW3VybF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVqZWN0KCdDYWNoZWRYSFI6IERpZCBub3QgZmluZCBjYWNoZWQgdGVtcGxhdGUgZm9yICcgKyB1cmwsIG51bGwpO1xuICAgIH1cbiAgfVxufVxuIl19