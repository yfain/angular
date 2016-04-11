'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('../../facade/exceptions');
/**
 * The `NgFor` directive instantiates a template once per item from an iterable. The context for
 * each instantiated template inherits from the outer context with the given loop variable set
 * to the current item from the iterable.
 *
 * # Local Variables
 *
 * `NgFor` provides several exported values that can be aliased to local variables:
 *
 * * `index` will be set to the current loop iteration for each template context.
 * * `first` will be set to a boolean value indicating whether the item is the first one in the
 *   iteration.
 * * `last` will be set to a boolean value indicating whether the item is the last one in the
 *   iteration.
 * * `even` will be set to a boolean value indicating whether this item has an even index.
 * * `odd` will be set to a boolean value indicating whether this item has an odd index.
 *
 * # Change Propagation
 *
 * When the contents of the iterator changes, `NgFor` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 * * Otherwise, the DOM element for that item will remain the same.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls
 * (such as `<input>` elements which accept user input) that are present. Inserted rows can be
 * animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state such
 * as user input.
 *
 * It is possible for the identities of elements in the iterator to change while the data does not.
 * This can happen, for example, if the iterator produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response will produce objects with
 * different identities, and Angular will tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted). This is an expensive operation and should
 * be avoided if possible.
 *
 * # Syntax
 *
 * - `<li *ngFor="#item of items; #i = index">...</li>`
 * - `<li template="ngFor #item of items; #i = index">...</li>`
 * - `<template ngFor #item [ngForOf]="items" #i="index"><li>...</li></template>`
 *
 * ### Example
 *
 * See a [live demo](http://plnkr.co/edit/KVuXxDp0qinGDyo307QW?p=preview) for a more detailed
 * example.
 */
var NgFor = (function () {
    function NgFor(_viewContainer, _templateRef, _iterableDiffers, _cdr) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._iterableDiffers = _iterableDiffers;
        this._cdr = _cdr;
    }
    Object.defineProperty(NgFor.prototype, "ngForOf", {
        set: function (value) {
            this._ngForOf = value;
            if (lang_1.isBlank(this._differ) && lang_1.isPresent(value)) {
                try {
                    this._differ = this._iterableDiffers.find(value).create(this._cdr, this._ngForTrackBy);
                }
                catch (e) {
                    throw new exceptions_1.BaseException("Cannot find a differ supporting object '" + value + "' of type '" + lang_1.getTypeNameForDebugging(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFor.prototype, "ngForTemplate", {
        set: function (value) {
            if (lang_1.isPresent(value)) {
                this._templateRef = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgFor.prototype, "ngForTrackBy", {
        set: function (value) { this._ngForTrackBy = value; },
        enumerable: true,
        configurable: true
    });
    NgFor.prototype.ngDoCheck = function () {
        if (lang_1.isPresent(this._differ)) {
            var changes = this._differ.diff(this._ngForOf);
            if (lang_1.isPresent(changes))
                this._applyChanges(changes);
        }
    };
    NgFor.prototype._applyChanges = function (changes) {
        var _this = this;
        // TODO(rado): check if change detection can produce a change record that is
        // easier to consume than current.
        var recordViewTuples = [];
        changes.forEachRemovedItem(function (removedRecord) {
            return recordViewTuples.push(new RecordViewTuple(removedRecord, null));
        });
        changes.forEachMovedItem(function (movedRecord) {
            return recordViewTuples.push(new RecordViewTuple(movedRecord, null));
        });
        var insertTuples = this._bulkRemove(recordViewTuples);
        changes.forEachAddedItem(function (addedRecord) {
            return insertTuples.push(new RecordViewTuple(addedRecord, null));
        });
        this._bulkInsert(insertTuples);
        for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (var i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            var viewRef = this._viewContainer.get(i);
            viewRef.setLocal('first', i === 0);
            viewRef.setLocal('last', i === ilen - 1);
        }
        changes.forEachIdentityChange(function (record) {
            var viewRef = _this._viewContainer.get(record.currentIndex);
            viewRef.setLocal('\$implicit', record.item);
        });
    };
    NgFor.prototype._perViewChange = function (view, record) {
        view.setLocal('\$implicit', record.item);
        view.setLocal('index', record.currentIndex);
        view.setLocal('even', (record.currentIndex % 2 == 0));
        view.setLocal('odd', (record.currentIndex % 2 == 1));
    };
    NgFor.prototype._bulkRemove = function (tuples) {
        tuples.sort(function (a, b) {
            return a.record.previousIndex - b.record.previousIndex;
        });
        var movedTuples = [];
        for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            // separate moved views from removed views.
            if (lang_1.isPresent(tuple.record.currentIndex)) {
                tuple.view = this._viewContainer.detach(tuple.record.previousIndex);
                movedTuples.push(tuple);
            }
            else {
                this._viewContainer.remove(tuple.record.previousIndex);
            }
        }
        return movedTuples;
    };
    NgFor.prototype._bulkInsert = function (tuples) {
        tuples.sort(function (a, b) { return a.record.currentIndex - b.record.currentIndex; });
        for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];
            if (lang_1.isPresent(tuple.view)) {
                this._viewContainer.insert(tuple.view, tuple.record.currentIndex);
            }
            else {
                tuple.view =
                    this._viewContainer.createEmbeddedView(this._templateRef, tuple.record.currentIndex);
            }
        }
        return tuples;
    };
    NgFor = __decorate([
        core_1.Directive({ selector: '[ngFor][ngForOf]', inputs: ['ngForTrackBy', 'ngForOf', 'ngForTemplate'] }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, core_1.IterableDiffers, core_1.ChangeDetectorRef])
    ], NgFor);
    return NgFor;
})();
exports.NgFor = NgFor;
var RecordViewTuple = (function () {
    function RecordViewTuple(record, view) {
        this.record = record;
        this.view = view;
    }
    return RecordViewTuple;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX2Zvci50cyJdLCJuYW1lcyI6WyJOZ0ZvciIsIk5nRm9yLmNvbnN0cnVjdG9yIiwiTmdGb3IubmdGb3JPZiIsIk5nRm9yLm5nRm9yVGVtcGxhdGUiLCJOZ0Zvci5uZ0ZvclRyYWNrQnkiLCJOZ0Zvci5uZ0RvQ2hlY2siLCJOZ0Zvci5fYXBwbHlDaGFuZ2VzIiwiTmdGb3IuX3BlclZpZXdDaGFuZ2UiLCJOZ0Zvci5fYnVsa1JlbW92ZSIsIk5nRm9yLl9idWxrSW5zZXJ0IiwiUmVjb3JkVmlld1R1cGxlIiwiUmVjb3JkVmlld1R1cGxlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBZ0osZUFBZSxDQUFDLENBQUE7QUFDaEsscUJBQXFFLDBCQUEwQixDQUFDLENBQUE7QUFFaEcsMkJBQTRCLHlCQUF5QixDQUFDLENBQUE7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBQ0g7SUFRRUEsZUFDWUEsY0FBZ0NBLEVBQVVBLFlBQXlCQSxFQUNuRUEsZ0JBQWlDQSxFQUFVQSxJQUF1QkE7UUFEbEVDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFrQkE7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO1FBQ25FQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUFVQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFtQkE7SUFBR0EsQ0FBQ0E7SUFFbEZELHNCQUFJQSwwQkFBT0E7YUFBWEEsVUFBWUEsS0FBVUE7WUFDcEJFLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJ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Q0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3BFQSxDQUFDQTtRQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUNqRUEsSUFBSUEsT0FBT0EsR0FBb0JBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFEQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsS0FBS0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBO1FBRURBLE9BQU9BLENBQUNBLHFCQUFxQkEsQ0FBQ0EsVUFBQ0EsTUFBTUE7WUFDbkNBLElBQUlBLE9BQU9BLEdBQW9CQSxLQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUM1RUEsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRU9OLDhCQUFjQSxHQUF0QkEsVUFBdUJBLElBQXFC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LENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1lBQ3BFQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsS0FBS0EsQ0FBQ0EsSUFBSUE7b0JBQ05BLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFDM0ZBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQWhISFQ7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLGtCQUFrQkEsRUFBRUEsTUFBTUEsRUFBRUEsQ0FBQ0EsY0FBY0EsRUFBRUEsU0FBU0EsRUFBRUEsZUFBZUEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2NBaUgvRkE7SUFBREEsWUFBQ0E7QUFBREEsQ0FBQ0EsQUFqSEQsSUFpSEM7QUFoSFksYUFBSyxRQWdIakIsQ0FBQTtBQUVEO0lBR0VVLHlCQUFZQSxNQUFXQSxFQUFFQSxJQUFxQkE7UUFDNUNDLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFDSEQsc0JBQUNBO0FBQURBLENBQUNBLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RG9DaGVjaywgRGlyZWN0aXZlLCBDaGFuZ2VEZXRlY3RvclJlZiwgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWYsIEVtYmVkZGVkVmlld1JlZiwgVHJhY2tCeUZufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBzdHJpbmdpZnksIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEZWZhdWx0SXRlcmFibGVEaWZmZXIsIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9IGZyb20gJy4uLy4uL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9kaWZmZXJzL2RlZmF1bHRfaXRlcmFibGVfZGlmZmVyJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnLi4vLi4vZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG4vKipcbiAqIFRoZSBgTmdGb3JgIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgYSB0ZW1wbGF0ZSBvbmNlIHBlciBpdGVtIGZyb20gYW4gaXRlcmFibGUuIFRoZSBjb250ZXh0IGZvclxuICogZWFjaCBpbnN0YW50aWF0ZWQgdGVtcGxhdGUgaW5oZXJpdHMgZnJvbSB0aGUgb3V0ZXIgY29udGV4dCB3aXRoIHRoZSBnaXZlbiBsb29wIHZhcmlhYmxlIHNldFxuICogdG8gdGhlIGN1cnJlbnQgaXRlbSBmcm9tIHRoZSBpdGVyYWJsZS5cbiAqXG4gKiAjIExvY2FsIFZhcmlhYmxlc1xuICpcbiAqIGBOZ0ZvcmAgcHJvdmlkZXMgc2V2ZXJhbCBleHBvcnRlZCB2YWx1ZXMgdGhhdCBjYW4gYmUgYWxpYXNlZCB0byBsb2NhbCB2YXJpYWJsZXM6XG4gKlxuICogKiBgaW5kZXhgIHdpbGwgYmUgc2V0IHRvIHRoZSBjdXJyZW50IGxvb3AgaXRlcmF0aW9uIGZvciBlYWNoIHRlbXBsYXRlIGNvbnRleHQuXG4gKiAqIGBmaXJzdGAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgaXRlbSBpcyB0aGUgZmlyc3Qgb25lIGluIHRoZVxuICogICBpdGVyYXRpb24uXG4gKiAqIGBsYXN0YCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBpdGVtIGlzIHRoZSBsYXN0IG9uZSBpbiB0aGVcbiAqICAgaXRlcmF0aW9uLlxuICogKiBgZXZlbmAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGlzIGl0ZW0gaGFzIGFuIGV2ZW4gaW5kZXguXG4gKiAqIGBvZGRgIHdpbGwgYmUgc2V0IHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhpcyBpdGVtIGhhcyBhbiBvZGQgaW5kZXguXG4gKlxuICogIyBDaGFuZ2UgUHJvcGFnYXRpb25cbiAqXG4gKiBXaGVuIHRoZSBjb250ZW50cyBvZiB0aGUgaXRlcmF0b3IgY2hhbmdlcywgYE5nRm9yYCBtYWtlcyB0aGUgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIHRoZSBET006XG4gKlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgYWRkZWQsIGEgbmV3IGluc3RhbmNlIG9mIHRoZSB0ZW1wbGF0ZSBpcyBhZGRlZCB0byB0aGUgRE9NLlxuICogKiBXaGVuIGFuIGl0ZW0gaXMgcmVtb3ZlZCwgaXRzIHRlbXBsYXRlIGluc3RhbmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICogKiBXaGVuIGl0ZW1zIGFyZSByZW9yZGVyZWQsIHRoZWlyIHJlc3BlY3RpdmUgdGVtcGxhdGVzIGFyZSByZW9yZGVyZWQgaW4gdGhlIERPTS5cbiAqICogT3RoZXJ3aXNlLCB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoYXQgaXRlbSB3aWxsIHJlbWFpbiB0aGUgc2FtZS5cbiAqXG4gKiBBbmd1bGFyIHVzZXMgb2JqZWN0IGlkZW50aXR5IHRvIHRyYWNrIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB3aXRoaW4gdGhlIGl0ZXJhdG9yIGFuZCByZXByb2R1Y2VcbiAqIHRob3NlIGNoYW5nZXMgaW4gdGhlIERPTS4gVGhpcyBoYXMgaW1wb3J0YW50IGltcGxpY2F0aW9ucyBmb3IgYW5pbWF0aW9ucyBhbmQgYW55IHN0YXRlZnVsXG4gKiBjb250cm9sc1xuICogKHN1Y2ggYXMgYDxpbnB1dD5gIGVsZW1lbnRzIHdoaWNoIGFjY2VwdCB1c2VyIGlucHV0KSB0aGF0IGFyZSBwcmVzZW50LiBJbnNlcnRlZCByb3dzIGNhbiBiZVxuICogYW5pbWF0ZWQgaW4sIGRlbGV0ZWQgcm93cyBjYW4gYmUgYW5pbWF0ZWQgb3V0LCBhbmQgdW5jaGFuZ2VkIHJvd3MgcmV0YWluIGFueSB1bnNhdmVkIHN0YXRlIHN1Y2hcbiAqIGFzIHVzZXIgaW5wdXQuXG4gKlxuICogSXQgaXMgcG9zc2libGUgZm9yIHRoZSBpZGVudGl0aWVzIG9mIGVsZW1lbnRzIGluIHRoZSBpdGVyYXRvciB0byBjaGFuZ2Ugd2hpbGUgdGhlIGRhdGEgZG9lcyBub3QuXG4gKiBUaGlzIGNhbiBoYXBwZW4sIGZvciBleGFtcGxlLCBpZiB0aGUgaXRlcmF0b3IgcHJvZHVjZWQgZnJvbSBhbiBSUEMgdG8gdGhlIHNlcnZlciwgYW5kIHRoYXRcbiAqIFJQQyBpcyByZS1ydW4uIEV2ZW4gaWYgdGhlIGRhdGEgaGFzbid0IGNoYW5nZWQsIHRoZSBzZWNvbmQgcmVzcG9uc2Ugd2lsbCBwcm9kdWNlIG9iamVjdHMgd2l0aFxuICogZGlmZmVyZW50IGlkZW50aXRpZXMsIGFuZCBBbmd1bGFyIHdpbGwgdGVhciBkb3duIHRoZSBlbnRpcmUgRE9NIGFuZCByZWJ1aWxkIGl0IChhcyBpZiBhbGwgb2xkXG4gKiBlbGVtZW50cyB3ZXJlIGRlbGV0ZWQgYW5kIGFsbCBuZXcgZWxlbWVudHMgaW5zZXJ0ZWQpLiBUaGlzIGlzIGFuIGV4cGVuc2l2ZSBvcGVyYXRpb24gYW5kIHNob3VsZFxuICogYmUgYXZvaWRlZCBpZiBwb3NzaWJsZS5cbiAqXG4gKiAjIFN5bnRheFxuICpcbiAqIC0gYDxsaSAqbmdGb3I9XCIjaXRlbSBvZiBpdGVtczsgI2kgPSBpbmRleFwiPi4uLjwvbGk+YFxuICogLSBgPGxpIHRlbXBsYXRlPVwibmdGb3IgI2l0ZW0gb2YgaXRlbXM7ICNpID0gaW5kZXhcIj4uLi48L2xpPmBcbiAqIC0gYDx0ZW1wbGF0ZSBuZ0ZvciAjaXRlbSBbbmdGb3JPZl09XCJpdGVtc1wiICNpPVwiaW5kZXhcIj48bGk+Li4uPC9saT48L3RlbXBsYXRlPmBcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFNlZSBhIFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tWdVh4RHAwcWluR0R5bzMwN1FXP3A9cHJldmlldykgZm9yIGEgbW9yZSBkZXRhaWxlZFxuICogZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdGb3JdW25nRm9yT2ZdJywgaW5wdXRzOiBbJ25nRm9yVHJhY2tCeScsICduZ0Zvck9mJywgJ25nRm9yVGVtcGxhdGUnXX0pXG5leHBvcnQgY2xhc3MgTmdGb3IgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmdGb3JPZjogYW55O1xuICAvKiogQGludGVybmFsICovXG4gIF9uZ0ZvclRyYWNrQnk6IFRyYWNrQnlGbjtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZixcbiAgICAgIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9jZHI6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIHNldCBuZ0Zvck9mKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLl9uZ0Zvck9mID0gdmFsdWU7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fZGlmZmVyKSAmJiBpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh2YWx1ZSkuY3JlYXRlKHRoaXMuX2NkciwgdGhpcy5fbmdGb3JUcmFja0J5KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7dmFsdWV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHZhbHVlKX0nLiBOZ0ZvciBvbmx5IHN1cHBvcnRzIGJpbmRpbmcgdG8gSXRlcmFibGVzIHN1Y2ggYXMgQXJyYXlzLmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBuZ0ZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZikge1xuICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZVJlZiA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNldCBuZ0ZvclRyYWNrQnkodmFsdWU6IFRyYWNrQnlGbikgeyB0aGlzLl9uZ0ZvclRyYWNrQnkgPSB2YWx1ZTsgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2RpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB0aGlzLl9hcHBseUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IERlZmF1bHRJdGVyYWJsZURpZmZlcikge1xuICAgIC8vIFRPRE8ocmFkbyk6IGNoZWNrIGlmIGNoYW5nZSBkZXRlY3Rpb24gY2FuIHByb2R1Y2UgYSBjaGFuZ2UgcmVjb3JkIHRoYXQgaXNcbiAgICAvLyBlYXNpZXIgdG8gY29uc3VtZSB0aGFuIGN1cnJlbnQuXG4gICAgdmFyIHJlY29yZFZpZXdUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oXG4gICAgICAgIChyZW1vdmVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgcmVjb3JkVmlld1R1cGxlcy5wdXNoKG5ldyBSZWNvcmRWaWV3VHVwbGUocmVtb3ZlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaE1vdmVkSXRlbShcbiAgICAgICAgKG1vdmVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgcmVjb3JkVmlld1R1cGxlcy5wdXNoKG5ldyBSZWNvcmRWaWV3VHVwbGUobW92ZWRSZWNvcmQsIG51bGwpKSk7XG5cbiAgICB2YXIgaW5zZXJ0VHVwbGVzID0gdGhpcy5fYnVsa1JlbW92ZShyZWNvcmRWaWV3VHVwbGVzKTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbShcbiAgICAgICAgKGFkZGVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShhZGRlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIHRoaXMuX2J1bGtJbnNlcnQoaW5zZXJ0VHVwbGVzKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zZXJ0VHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9wZXJWaWV3Q2hhbmdlKGluc2VydFR1cGxlc1tpXS52aWV3LCBpbnNlcnRUdXBsZXNbaV0ucmVjb3JkKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IHRoaXMuX3ZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICB2YXIgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQoaSk7XG4gICAgICB2aWV3UmVmLnNldExvY2FsKCdmaXJzdCcsIGkgPT09IDApO1xuICAgICAgdmlld1JlZi5zZXRMb2NhbCgnbGFzdCcsIGkgPT09IGlsZW4gLSAxKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkKSA9PiB7XG4gICAgICB2YXIgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQocmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB2aWV3UmVmLnNldExvY2FsKCdcXCRpbXBsaWNpdCcsIHJlY29yZC5pdGVtKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3BlclZpZXdDaGFuZ2UodmlldzogRW1iZWRkZWRWaWV3UmVmLCByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpIHtcbiAgICB2aWV3LnNldExvY2FsKCdcXCRpbXBsaWNpdCcsIHJlY29yZC5pdGVtKTtcbiAgICB2aWV3LnNldExvY2FsKCdpbmRleCcsIHJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgIHZpZXcuc2V0TG9jYWwoJ2V2ZW4nLCAocmVjb3JkLmN1cnJlbnRJbmRleCAlIDIgPT0gMCkpO1xuICAgIHZpZXcuc2V0TG9jYWwoJ29kZCcsIChyZWNvcmQuY3VycmVudEluZGV4ICUgMiA9PSAxKSk7XG4gIH1cblxuICBwcml2YXRlIF9idWxrUmVtb3ZlKHR1cGxlczogUmVjb3JkVmlld1R1cGxlW10pOiBSZWNvcmRWaWV3VHVwbGVbXSB7XG4gICAgdHVwbGVzLnNvcnQoXG4gICAgICAgIChhOiBSZWNvcmRWaWV3VHVwbGUsIGI6IFJlY29yZFZpZXdUdXBsZSkgPT5cbiAgICAgICAgICAgIGEucmVjb3JkLnByZXZpb3VzSW5kZXggLSBiLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICB2YXIgbW92ZWRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgZm9yICh2YXIgaSA9IHR1cGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgLy8gc2VwYXJhdGUgbW92ZWQgdmlld3MgZnJvbSByZW1vdmVkIHZpZXdzLlxuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KSkge1xuICAgICAgICB0dXBsZS52aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5kZXRhY2godHVwbGUucmVjb3JkLnByZXZpb3VzSW5kZXgpO1xuICAgICAgICBtb3ZlZFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKHR1cGxlLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVkVHVwbGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVsa0luc2VydCh0dXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdKTogUmVjb3JkVmlld1R1cGxlW10ge1xuICAgIHR1cGxlcy5zb3J0KChhLCBiKSA9PiBhLnJlY29yZC5jdXJyZW50SW5kZXggLSBiLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdHVwbGUgPSB0dXBsZXNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHR1cGxlLnZpZXcpKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuaW5zZXJ0KHR1cGxlLnZpZXcsIHR1cGxlLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHVwbGUudmlldyA9XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZiwgdHVwbGUucmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0dXBsZXM7XG4gIH1cbn1cblxuY2xhc3MgUmVjb3JkVmlld1R1cGxlIHtcbiAgdmlldzogRW1iZWRkZWRWaWV3UmVmO1xuICByZWNvcmQ6IGFueTtcbiAgY29uc3RydWN0b3IocmVjb3JkOiBhbnksIHZpZXc6IEVtYmVkZGVkVmlld1JlZikge1xuICAgIHRoaXMucmVjb3JkID0gcmVjb3JkO1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gIH1cbn1cbiJdfQ==