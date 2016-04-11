import { XHR } from 'angular2/src/compiler/xhr';
import { BaseException } from 'angular2/src/facade/exceptions';
import { global } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/promise';
/**
 * An implementation of XHR that uses a template cache to avoid doing an actual
 * XHR.
 *
 * The template cache needs to be built and loaded into window.$templateCache
 * via a separate mechanism.
 */
export class CachedXHR extends XHR {
    constructor() {
        super();
        this._cache = global.$templateCache;
        if (this._cache == null) {
            throw new BaseException('CachedXHR: Template cache was not found in $templateCache.');
        }
    }
    get(url) {
        if (this._cache.hasOwnProperty(url)) {
            return PromiseWrapper.resolve(this._cache[url]);
        }
        else {
            return PromiseWrapper.reject('CachedXHR: Did not find cached template for ' + url, null);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2NhY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1oNjBEMm0wbS50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2Jyb3dzZXIveGhyX2NhY2hlLnRzIl0sIm5hbWVzIjpbIkNhY2hlZFhIUiIsIkNhY2hlZFhIUi5jb25zdHJ1Y3RvciIsIkNhY2hlZFhIUi5nZXQiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO09BQ3RDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsTUFBTSxFQUFDLE1BQU0sMEJBQTBCO09BQ3hDLEVBQUMsY0FBYyxFQUFDLE1BQU0sNkJBQTZCO0FBRTFEOzs7Ozs7R0FNRztBQUNILCtCQUErQixHQUFHO0lBR2hDQTtRQUNFQyxPQUFPQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFTQSxNQUFPQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMzQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLDREQUE0REEsQ0FBQ0EsQ0FBQ0E7UUFDeEZBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURELEdBQUdBLENBQUNBLEdBQVdBO1FBQ2JFLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsOENBQThDQSxHQUFHQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzRkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9wcm9taXNlJztcblxuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBYSFIgdGhhdCB1c2VzIGEgdGVtcGxhdGUgY2FjaGUgdG8gYXZvaWQgZG9pbmcgYW4gYWN0dWFsXG4gKiBYSFIuXG4gKlxuICogVGhlIHRlbXBsYXRlIGNhY2hlIG5lZWRzIHRvIGJlIGJ1aWx0IGFuZCBsb2FkZWQgaW50byB3aW5kb3cuJHRlbXBsYXRlQ2FjaGVcbiAqIHZpYSBhIHNlcGFyYXRlIG1lY2hhbmlzbS5cbiAqL1xuZXhwb3J0IGNsYXNzIENhY2hlZFhIUiBleHRlbmRzIFhIUiB7XG4gIHByaXZhdGUgX2NhY2hlOiB7W3VybDogc3RyaW5nXTogc3RyaW5nfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2NhY2hlID0gKDxhbnk+Z2xvYmFsKS4kdGVtcGxhdGVDYWNoZTtcbiAgICBpZiAodGhpcy5fY2FjaGUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0NhY2hlZFhIUjogVGVtcGxhdGUgY2FjaGUgd2FzIG5vdCBmb3VuZCBpbiAkdGVtcGxhdGVDYWNoZS4nKTtcbiAgICB9XG4gIH1cblxuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZS5oYXNPd25Qcm9wZXJ0eSh1cmwpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLl9jYWNoZVt1cmxdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlamVjdCgnQ2FjaGVkWEhSOiBEaWQgbm90IGZpbmQgY2FjaGVkIHRlbXBsYXRlIGZvciAnICsgdXJsLCBudWxsKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==