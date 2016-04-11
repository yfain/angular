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
var exceptions_1 = require("../../facade/exceptions");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ZRlRZQUt3US50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX2Zvci50cyJdLCJuYW1lcyI6WyJOZ0ZvciIsIk5nRm9yLmNvbnN0cnVjdG9yIiwiTmdGb3IubmdGb3JPZiIsIk5nRm9yLm5nRm9yVGVtcGxhdGUiLCJOZ0Zvci5uZ0ZvclRyYWNrQnkiLCJOZ0Zvci5uZ0RvQ2hlY2siLCJOZ0Zvci5fYXBwbHlDaGFuZ2VzIiwiTmdGb3IuX3BlclZpZXdDaGFuZ2UiLCJOZ0Zvci5fYnVsa1JlbW92ZSIsIk5nRm9yLl9idWxrSW5zZXJ0IiwiUmVjb3JkVmlld1R1cGxlIiwiUmVjb3JkVmlld1R1cGxlLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFVTyxlQUFlLENBQUMsQ0FBQTtBQUN2QixxQkFBcUUsMEJBQTBCLENBQUMsQ0FBQTtBQUtoRywyQkFBNEIseUJBQXlCLENBQUMsQ0FBQTtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0RHO0FBQ0g7SUFRRUEsZUFBb0JBLGNBQWdDQSxFQUFVQSxZQUF5QkEsRUFDbkVBLGdCQUFpQ0EsRUFBVUEsSUFBdUJBO1FBRGxFQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBa0JBO1FBQVVBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFhQTtRQUNuRUEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFBVUEsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBbUJBO0lBQUdBLENBQUNBO0lBRTFGRCxzQkFBSUEsMEJBQU9BO2FBQVhBLFVBQVlBLEtBQVVBO1lBQ3BCRSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsSUFBSUEs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QUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7UUFFREEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDakVBLElBQUlBLE9BQU9BLEdBQW9CQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxREEsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsS0FBS0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBO1FBRURBLE9BQU9BLENBQUNBLHFCQUFxQkEsQ0FBQ0EsVUFBQ0EsTUFBTUE7WUFDbkNBLElBQUlBLE9BQU9BLEdBQW9CQSxLQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUM1RUEsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRU9OLDhCQUFjQSxHQUF0QkEsVUFBdUJBLElBQXFCQSxFQUFFQSxNQUE4QkE7UUFDMUVPLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENB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Q0EsSUFBSUE7b0JBQ05BLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFDM0ZBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQTFHSFQ7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLGtCQUFrQkEsRUFBRUEsTUFBTUEsRUFBRUEsQ0FBQ0EsY0FBY0EsRUFBRUEsU0FBU0EsRUFBRUEsZUFBZUEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2NBMkcvRkE7SUFBREEsWUFBQ0E7QUFBREEsQ0FBQ0EsQUEzR0QsSUEyR0M7QUExR1ksYUFBSyxRQTBHakIsQ0FBQTtBQUVEO0lBR0VVLHlCQUFZQSxNQUFXQSxFQUFFQSxJQUFxQkE7UUFDNUNDLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFDSEQsc0JBQUNBO0FBQURBLENBQUNBLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERvQ2hlY2ssXG4gIERpcmVjdGl2ZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFRlbXBsYXRlUmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIFRyYWNrQnlGblxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBzdHJpbmdpZnksIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLFxuICBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkXG59IGZyb20gXCIuLi8uLi9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9kZWZhdWx0X2l0ZXJhYmxlX2RpZmZlclwiO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tIFwiLi4vLi4vZmFjYWRlL2V4Y2VwdGlvbnNcIjtcblxuLyoqXG4gKiBUaGUgYE5nRm9yYCBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIGEgdGVtcGxhdGUgb25jZSBwZXIgaXRlbSBmcm9tIGFuIGl0ZXJhYmxlLiBUaGUgY29udGV4dCBmb3JcbiAqIGVhY2ggaW5zdGFudGlhdGVkIHRlbXBsYXRlIGluaGVyaXRzIGZyb20gdGhlIG91dGVyIGNvbnRleHQgd2l0aCB0aGUgZ2l2ZW4gbG9vcCB2YXJpYWJsZSBzZXRcbiAqIHRvIHRoZSBjdXJyZW50IGl0ZW0gZnJvbSB0aGUgaXRlcmFibGUuXG4gKlxuICogIyBMb2NhbCBWYXJpYWJsZXNcbiAqXG4gKiBgTmdGb3JgIHByb3ZpZGVzIHNldmVyYWwgZXhwb3J0ZWQgdmFsdWVzIHRoYXQgY2FuIGJlIGFsaWFzZWQgdG8gbG9jYWwgdmFyaWFibGVzOlxuICpcbiAqICogYGluZGV4YCB3aWxsIGJlIHNldCB0byB0aGUgY3VycmVudCBsb29wIGl0ZXJhdGlvbiBmb3IgZWFjaCB0ZW1wbGF0ZSBjb250ZXh0LlxuICogKiBgbGFzdGAgd2lsbCBiZSBzZXQgdG8gYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgaXRlbSBpcyB0aGUgbGFzdCBvbmUgaW4gdGhlXG4gKiAgIGl0ZXJhdGlvbi5cbiAqICogYGV2ZW5gIHdpbGwgYmUgc2V0IHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhpcyBpdGVtIGhhcyBhbiBldmVuIGluZGV4LlxuICogKiBgb2RkYCB3aWxsIGJlIHNldCB0byBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaXRlbSBoYXMgYW4gb2RkIGluZGV4LlxuICpcbiAqICMgQ2hhbmdlIFByb3BhZ2F0aW9uXG4gKlxuICogV2hlbiB0aGUgY29udGVudHMgb2YgdGhlIGl0ZXJhdG9yIGNoYW5nZXMsIGBOZ0ZvcmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKiAqIE90aGVyd2lzZSwgdGhlIERPTSBlbGVtZW50IGZvciB0aGF0IGl0ZW0gd2lsbCByZW1haW4gdGhlIHNhbWUuXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHNcbiAqIChzdWNoIGFzIGA8aW5wdXQ+YCBlbGVtZW50cyB3aGljaCBhY2NlcHQgdXNlciBpbnB1dCkgdGhhdCBhcmUgcHJlc2VudC4gSW5zZXJ0ZWQgcm93cyBjYW4gYmVcbiAqIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZSBzdWNoXG4gKiBhcyB1c2VyIGlucHV0LlxuICpcbiAqIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgdG8gY2hhbmdlIHdoaWxlIHRoZSBkYXRhIGRvZXMgbm90LlxuICogVGhpcyBjYW4gaGFwcGVuLCBmb3IgZXhhbXBsZSwgaWYgdGhlIGl0ZXJhdG9yIHByb2R1Y2VkIGZyb20gYW4gUlBDIHRvIHRoZSBzZXJ2ZXIsIGFuZCB0aGF0XG4gKiBSUEMgaXMgcmUtcnVuLiBFdmVuIGlmIHRoZSBkYXRhIGhhc24ndCBjaGFuZ2VkLCB0aGUgc2Vjb25kIHJlc3BvbnNlIHdpbGwgcHJvZHVjZSBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciB3aWxsIHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS4gVGhpcyBpcyBhbiBleHBlbnNpdmUgb3BlcmF0aW9uIGFuZCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgaWYgcG9zc2libGUuXG4gKlxuICogIyBTeW50YXhcbiAqXG4gKiAtIGA8bGkgKm5nRm9yPVwiI2l0ZW0gb2YgaXRlbXM7ICNpID0gaW5kZXhcIj4uLi48L2xpPmBcbiAqIC0gYDxsaSB0ZW1wbGF0ZT1cIm5nRm9yICNpdGVtIG9mIGl0ZW1zOyAjaSA9IGluZGV4XCI+Li4uPC9saT5gXG4gKiAtIGA8dGVtcGxhdGUgbmdGb3IgI2l0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIiAjaT1cImluZGV4XCI+PGxpPi4uLjwvbGk+PC90ZW1wbGF0ZT5gXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTZWUgYSBbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9LVnVYeERwMHFpbkdEeW8zMDdRVz9wPXByZXZpZXcpIGZvciBhIG1vcmUgZGV0YWlsZWRcbiAqIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXScsIGlucHV0czogWyduZ0ZvclRyYWNrQnknLCAnbmdGb3JPZicsICduZ0ZvclRlbXBsYXRlJ119KVxuZXhwb3J0IGNsYXNzIE5nRm9yIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25nRm9yT2Y6IGFueTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmdGb3JUcmFja0J5OiBUcmFja0J5Rm47XG4gIHByaXZhdGUgX2RpZmZlcjogSXRlcmFibGVEaWZmZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLFxuICAgICAgICAgICAgICBwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfY2RyOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBzZXQgbmdGb3JPZih2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fbmdGb3JPZiA9IHZhbHVlO1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2RpZmZlcikgJiYgaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLl9jZHIsIHRoaXMuX25nRm9yVHJhY2tCeSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXQgbmdGb3JUZW1wbGF0ZSh2YWx1ZTogVGVtcGxhdGVSZWYpIHtcbiAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGVSZWYgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXQgbmdGb3JUcmFja0J5KHZhbHVlOiBUcmFja0J5Rm4pIHsgdGhpcy5fbmdGb3JUcmFja0J5ID0gdmFsdWU7IH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9kaWZmZXIpKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX25nRm9yT2YpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBEZWZhdWx0SXRlcmFibGVEaWZmZXIpIHtcbiAgICAvLyBUT0RPKHJhZG8pOiBjaGVjayBpZiBjaGFuZ2UgZGV0ZWN0aW9uIGNhbiBwcm9kdWNlIGEgY2hhbmdlIHJlY29yZCB0aGF0IGlzXG4gICAgLy8gZWFzaWVyIHRvIGNvbnN1bWUgdGhhbiBjdXJyZW50LlxuICAgIHZhciByZWNvcmRWaWV3VHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSA9IFtdO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZW1vdmVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvcmRWaWV3VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShyZW1vdmVkUmVjb3JkLCBudWxsKSkpO1xuXG4gICAgY2hhbmdlcy5mb3JFYWNoTW92ZWRJdGVtKChtb3ZlZFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZFZpZXdUdXBsZXMucHVzaChuZXcgUmVjb3JkVmlld1R1cGxlKG1vdmVkUmVjb3JkLCBudWxsKSkpO1xuXG4gICAgdmFyIGluc2VydFR1cGxlcyA9IHRoaXMuX2J1bGtSZW1vdmUocmVjb3JkVmlld1R1cGxlcyk7XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKGFkZGVkUmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2gobmV3IFJlY29yZFZpZXdUdXBsZShhZGRlZFJlY29yZCwgbnVsbCkpKTtcblxuICAgIHRoaXMuX2J1bGtJbnNlcnQoaW5zZXJ0VHVwbGVzKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zZXJ0VHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9wZXJWaWV3Q2hhbmdlKGluc2VydFR1cGxlc1tpXS52aWV3LCBpbnNlcnRUdXBsZXNbaV0ucmVjb3JkKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IHRoaXMuX3ZpZXdDb250YWluZXIubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICB2YXIgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY+dGhpcy5fdmlld0NvbnRhaW5lci5nZXQoaSk7XG4gICAgICB2aWV3UmVmLnNldExvY2FsKCdsYXN0JywgaSA9PT0gaWxlbiAtIDEpO1xuICAgIH1cblxuICAgIGNoYW5nZXMuZm9yRWFjaElkZW50aXR5Q2hhbmdlKChyZWNvcmQpID0+IHtcbiAgICAgIHZhciB2aWV3UmVmID0gPEVtYmVkZGVkVmlld1JlZj50aGlzLl92aWV3Q29udGFpbmVyLmdldChyZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIHZpZXdSZWYuc2V0TG9jYWwoJ1xcJGltcGxpY2l0JywgcmVjb3JkLml0ZW0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGVyVmlld0NoYW5nZSh2aWV3OiBFbWJlZGRlZFZpZXdSZWYsIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkge1xuICAgIHZpZXcuc2V0TG9jYWwoJ1xcJGltcGxpY2l0JywgcmVjb3JkLml0ZW0pO1xuICAgIHZpZXcuc2V0TG9jYWwoJ2luZGV4JywgcmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgdmlldy5zZXRMb2NhbCgnZXZlbicsIChyZWNvcmQuY3VycmVudEluZGV4ICUgMiA9PSAwKSk7XG4gICAgdmlldy5zZXRMb2NhbCgnb2RkJywgKHJlY29yZC5jdXJyZW50SW5kZXggJSAyID09IDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1bGtSZW1vdmUodHVwbGVzOiBSZWNvcmRWaWV3VHVwbGVbXSk6IFJlY29yZFZpZXdUdXBsZVtdIHtcbiAgICB0dXBsZXMuc29ydCgoYTogUmVjb3JkVmlld1R1cGxlLCBiOiBSZWNvcmRWaWV3VHVwbGUpID0+XG4gICAgICAgICAgICAgICAgICAgIGEucmVjb3JkLnByZXZpb3VzSW5kZXggLSBiLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICB2YXIgbW92ZWRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdID0gW107XG4gICAgZm9yICh2YXIgaSA9IHR1cGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHR1cGxlID0gdHVwbGVzW2ldO1xuICAgICAgLy8gc2VwYXJhdGUgbW92ZWQgdmlld3MgZnJvbSByZW1vdmVkIHZpZXdzLlxuICAgICAgaWYgKGlzUHJlc2VudCh0dXBsZS5yZWNvcmQuY3VycmVudEluZGV4KSkge1xuICAgICAgICB0dXBsZS52aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5kZXRhY2godHVwbGUucmVjb3JkLnByZXZpb3VzSW5kZXgpO1xuICAgICAgICBtb3ZlZFR1cGxlcy5wdXNoKHR1cGxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIucmVtb3ZlKHR1cGxlLnJlY29yZC5wcmV2aW91c0luZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVkVHVwbGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVsa0luc2VydCh0dXBsZXM6IFJlY29yZFZpZXdUdXBsZVtdKTogUmVjb3JkVmlld1R1cGxlW10ge1xuICAgIHR1cGxlcy5zb3J0KChhLCBiKSA9PiBhLnJlY29yZC5jdXJyZW50SW5kZXggLSBiLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHVwbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdHVwbGUgPSB0dXBsZXNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHR1cGxlLnZpZXcpKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuaW5zZXJ0KHR1cGxlLnZpZXcsIHR1cGxlLnJlY29yZC5jdXJyZW50SW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHVwbGUudmlldyA9XG4gICAgICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZiwgdHVwbGUucmVjb3JkLmN1cnJlbnRJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0dXBsZXM7XG4gIH1cbn1cblxuY2xhc3MgUmVjb3JkVmlld1R1cGxlIHtcbiAgdmlldzogRW1iZWRkZWRWaWV3UmVmO1xuICByZWNvcmQ6IGFueTtcbiAgY29uc3RydWN0b3IocmVjb3JkOiBhbnksIHZpZXc6IEVtYmVkZGVkVmlld1JlZikge1xuICAgIHRoaXMucmVjb3JkID0gcmVjb3JkO1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gIH1cbn1cbiJdfQ==