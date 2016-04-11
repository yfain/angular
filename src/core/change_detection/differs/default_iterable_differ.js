'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_2 = require('angular2/src/facade/lang');
var DefaultIterableDifferFactory = (function () {
    function DefaultIterableDifferFactory() {
    }
    DefaultIterableDifferFactory.prototype.supports = function (obj) { return collection_1.isListLikeIterable(obj); };
    DefaultIterableDifferFactory.prototype.create = function (cdRef, trackByFn) {
        return new DefaultIterableDiffer(trackByFn);
    };
    DefaultIterableDifferFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], DefaultIterableDifferFactory);
    return DefaultIterableDifferFactory;
})();
exports.DefaultIterableDifferFactory = DefaultIterableDifferFactory;
var trackByIdentity = function (index, item) { return item; };
var DefaultIterableDiffer = (function () {
    function DefaultIterableDiffer(_trackByFn) {
        this._trackByFn = _trackByFn;
        this._length = null;
        this._collection = null;
        // Keeps track of the used records at any point in time (during & across `_check()` calls)
        this._linkedRecords = null;
        // Keeps track of the removed records at any point in time during `_check()` calls.
        this._unlinkedRecords = null;
        this._previousItHead = null;
        this._itHead = null;
        this._itTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._movesHead = null;
        this._movesTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
        // Keeps track of records where custom track by is the same, but item identity has changed
        this._identityChangesHead = null;
        this._identityChangesTail = null;
        this._trackByFn = lang_2.isPresent(this._trackByFn) ? this._trackByFn : trackByIdentity;
    }
    Object.defineProperty(DefaultIterableDiffer.prototype, "collection", {
        get: function () { return this._collection; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultIterableDiffer.prototype, "length", {
        get: function () { return this._length; },
        enumerable: true,
        configurable: true
    });
    DefaultIterableDiffer.prototype.forEachItem = function (fn) {
        var record;
        for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachPreviousItem = function (fn) {
        var record;
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachAddedItem = function (fn) {
        var record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachMovedItem = function (fn) {
        var record;
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachRemovedItem = function (fn) {
        var record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.forEachIdentityChange = function (fn) {
        var record;
        for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
            fn(record);
        }
    };
    DefaultIterableDiffer.prototype.diff = function (collection) {
        if (lang_2.isBlank(collection))
            collection = [];
        if (!collection_1.isListLikeIterable(collection)) {
            throw new exceptions_1.BaseException("Error trying to diff '" + collection + "'");
        }
        if (this.check(collection)) {
            return this;
        }
        else {
            return null;
        }
    };
    DefaultIterableDiffer.prototype.onDestroy = function () { };
    DefaultIterableDiffer.prototype.check = function (collection) {
        var _this = this;
        this._reset();
        var record = this._itHead;
        var mayBeDirty = false;
        var index;
        var item;
        var itemTrackBy;
        if (lang_2.isArray(collection)) {
            if (collection !== this._collection || !collection_1.ListWrapper.isImmutable(collection)) {
                var list = collection;
                this._length = collection.length;
                for (index = 0; index < this._length; index++) {
                    item = list[index];
                    itemTrackBy = this._trackByFn(index, item);
                    if (record === null || !lang_2.looseIdentical(record.trackById, itemTrackBy)) {
                        record = this._mismatch(record, item, itemTrackBy, index);
                        mayBeDirty = true;
                    }
                    else {
                        if (mayBeDirty) {
                            // TODO(misko): can we limit this to duplicates only?
                            record = this._verifyReinsertion(record, item, itemTrackBy, index);
                        }
                        if (!lang_2.looseIdentical(record.item, item))
                            this._addIdentityChange(record, item);
                    }
                    record = record._next;
                }
                this._truncate(record);
            }
        }
        else {
            index = 0;
            collection_1.iterateListLike(collection, function (item) {
                itemTrackBy = _this._trackByFn(index, item);
                if (record === null || !lang_2.looseIdentical(record.trackById, itemTrackBy)) {
                    record = _this._mismatch(record, item, itemTrackBy, index);
                    mayBeDirty = true;
                }
                else {
                    if (mayBeDirty) {
                        // TODO(misko): can we limit this to duplicates only?
                        record = _this._verifyReinsertion(record, item, itemTrackBy, index);
                    }
                    if (!lang_2.looseIdentical(record.item, item))
                        _this._addIdentityChange(record, item);
                }
                record = record._next;
                index++;
            });
            this._length = index;
            this._truncate(record);
        }
        this._collection = collection;
        return this.isDirty;
    };
    Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
        /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
         * changes.
         */
        get: function () {
            return this._additionsHead !== null || this._movesHead !== null ||
                this._removalsHead !== null || this._identityChangesHead !== null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._reset = function () {
        if (this.isDirty) {
            var record;
            var nextRecord;
            for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
            }
            this._additionsHead = this._additionsTail = null;
            for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
            }
            this._movesHead = this._movesTail = null;
            this._removalsHead = this._removalsTail = null;
            this._identityChangesHead = this._identityChangesTail = null;
        }
    };
    /**
     * This is the core function which handles differences between collections.
     *
     * - `record` is the record which we saw at this position last time. If null then it is a new
     *   item.
     * - `item` is the current item in the collection
     * - `index` is the position of the item in the collection
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._mismatch = function (record, item, itemTrackBy, index) {
        // The previous record after which we will append the current one.
        var previousRecord;
        if (record === null) {
            previousRecord = this._itTail;
        }
        else {
            previousRecord = record._prev;
            // Remove the record from the collection since we know it does not match the item.
            this._remove(record);
        }
        // Attempt to see if we have seen the item before.
        record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
        if (record !== null) {
            // We have seen this before, we need to move it forward in the collection.
            // But first we need to check if identity changed, so we can update in view if necessary
            if (!lang_2.looseIdentical(record.item, item))
                this._addIdentityChange(record, item);
            this._moveAfter(record, previousRecord, index);
        }
        else {
            // Never seen it, check evicted list.
            record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
            if (record !== null) {
                // It is an item which we have evicted earlier: reinsert it back into the list.
                // But first we need to check if identity changed, so we can update in view if necessary
                if (!lang_2.looseIdentical(record.item, item))
                    this._addIdentityChange(record, item);
                this._reinsertAfter(record, previousRecord, index);
            }
            else {
                // It is a new item: add it.
                record =
                    this._addAfter(new CollectionChangeRecord(item, itemTrackBy), previousRecord, index);
            }
        }
        return record;
    };
    /**
     * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
     *
     * Use case: `[a, a]` => `[b, a, a]`
     *
     * If we did not have this check then the insertion of `b` would:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) leave `a` at index `1` as is. <-- this is wrong!
     *   3) reinsert `a` at index 2. <-- this is wrong!
     *
     * The correct behavior is:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) reinsert `a` at index 1.
     *   3) move `a` at from `1` to `2`.
     *
     *
     * Double check that we have not evicted a duplicate item. We need to check if the item type may
     * have already been removed:
     * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
     * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
     * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
     * at the end.
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._verifyReinsertion = function (record, item, itemTrackBy, index) {
        var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
        if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, record._prev, index);
        }
        else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
        }
        return record;
    };
    /**
     * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
     *
     * - `record` The first excess {@link CollectionChangeRecord}.
     *
     * @internal
     */
    DefaultIterableDiffer.prototype._truncate = function (record) {
        // Anything after that needs to be removed;
        while (record !== null) {
            var nextRecord = record._next;
            this._addToRemovals(this._unlink(record));
            record = nextRecord;
        }
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.clear();
        }
        if (this._additionsTail !== null) {
            this._additionsTail._nextAdded = null;
        }
        if (this._movesTail !== null) {
            this._movesTail._nextMoved = null;
        }
        if (this._itTail !== null) {
            this._itTail._next = null;
        }
        if (this._removalsTail !== null) {
            this._removalsTail._nextRemoved = null;
        }
        if (this._identityChangesTail !== null) {
            this._identityChangesTail._nextIdentityChange = null;
        }
    };
    /** @internal */
    DefaultIterableDiffer.prototype._reinsertAfter = function (record, prevRecord, index) {
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.remove(record);
        }
        var prev = record._prevRemoved;
        var next = record._nextRemoved;
        if (prev === null) {
            this._removalsHead = next;
        }
        else {
            prev._nextRemoved = next;
        }
        if (next === null) {
            this._removalsTail = prev;
        }
        else {
            next._prevRemoved = prev;
        }
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._moveAfter = function (record, prevRecord, index) {
        this._unlink(record);
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addAfter = function (record, prevRecord, index) {
        this._insertAfter(record, prevRecord, index);
        if (this._additionsTail === null) {
            // todo(vicb)
            // assert(this._additionsHead === null);
            this._additionsTail = this._additionsHead = record;
        }
        else {
            // todo(vicb)
            // assert(_additionsTail._nextAdded === null);
            // assert(record._nextAdded === null);
            this._additionsTail = this._additionsTail._nextAdded = record;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._insertAfter = function (record, prevRecord, index) {
        // todo(vicb)
        // assert(record != prevRecord);
        // assert(record._next === null);
        // assert(record._prev === null);
        var next = prevRecord === null ? this._itHead : prevRecord._next;
        // todo(vicb)
        // assert(next != record);
        // assert(prevRecord != record);
        record._next = next;
        record._prev = prevRecord;
        if (next === null) {
            this._itTail = record;
        }
        else {
            next._prev = record;
        }
        if (prevRecord === null) {
            this._itHead = record;
        }
        else {
            prevRecord._next = record;
        }
        if (this._linkedRecords === null) {
            this._linkedRecords = new _DuplicateMap();
        }
        this._linkedRecords.put(record);
        record.currentIndex = index;
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._remove = function (record) {
        return this._addToRemovals(this._unlink(record));
    };
    /** @internal */
    DefaultIterableDiffer.prototype._unlink = function (record) {
        if (this._linkedRecords !== null) {
            this._linkedRecords.remove(record);
        }
        var prev = record._prev;
        var next = record._next;
        // todo(vicb)
        // assert((record._prev = null) === null);
        // assert((record._next = null) === null);
        if (prev === null) {
            this._itHead = next;
        }
        else {
            prev._next = next;
        }
        if (next === null) {
            this._itTail = prev;
        }
        else {
            next._prev = prev;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addToMoves = function (record, toIndex) {
        // todo(vicb)
        // assert(record._nextMoved === null);
        if (record.previousIndex === toIndex) {
            return record;
        }
        if (this._movesTail === null) {
            // todo(vicb)
            // assert(_movesHead === null);
            this._movesTail = this._movesHead = record;
        }
        else {
            // todo(vicb)
            // assert(_movesTail._nextMoved === null);
            this._movesTail = this._movesTail._nextMoved = record;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addToRemovals = function (record) {
        if (this._unlinkedRecords === null) {
            this._unlinkedRecords = new _DuplicateMap();
        }
        this._unlinkedRecords.put(record);
        record.currentIndex = null;
        record._nextRemoved = null;
        if (this._removalsTail === null) {
            // todo(vicb)
            // assert(_removalsHead === null);
            this._removalsTail = this._removalsHead = record;
            record._prevRemoved = null;
        }
        else {
            // todo(vicb)
            // assert(_removalsTail._nextRemoved === null);
            // assert(record._nextRemoved === null);
            record._prevRemoved = this._removalsTail;
            this._removalsTail = this._removalsTail._nextRemoved = record;
        }
        return record;
    };
    /** @internal */
    DefaultIterableDiffer.prototype._addIdentityChange = function (record, item) {
        record.item = item;
        if (this._identityChangesTail === null) {
            this._identityChangesTail = this._identityChangesHead = record;
        }
        else {
            this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
        }
        return record;
    };
    DefaultIterableDiffer.prototype.toString = function () {
        var list = [];
        this.forEachItem(function (record) { return list.push(record); });
        var previous = [];
        this.forEachPreviousItem(function (record) { return previous.push(record); });
        var additions = [];
        this.forEachAddedItem(function (record) { return additions.push(record); });
        var moves = [];
        this.forEachMovedItem(function (record) { return moves.push(record); });
        var removals = [];
        this.forEachRemovedItem(function (record) { return removals.push(record); });
        var identityChanges = [];
        this.forEachIdentityChange(function (record) { return identityChanges.push(record); });
        return 'collection: ' + list.join(', ') + '\n' +
            'previous: ' + previous.join(', ') + '\n' +
            'additions: ' + additions.join(', ') + '\n' +
            'moves: ' + moves.join(', ') + '\n' +
            'removals: ' + removals.join(', ') + '\n' +
            'identityChanges: ' + identityChanges.join(', ') + '\n';
    };
    return DefaultIterableDiffer;
})();
exports.DefaultIterableDiffer = DefaultIterableDiffer;
var CollectionChangeRecord = (function () {
    function CollectionChangeRecord(item, trackById) {
        this.item = item;
        this.trackById = trackById;
        this.currentIndex = null;
        this.previousIndex = null;
        /** @internal */
        this._nextPrevious = null;
        /** @internal */
        this._prev = null;
        /** @internal */
        this._next = null;
        /** @internal */
        this._prevDup = null;
        /** @internal */
        this._nextDup = null;
        /** @internal */
        this._prevRemoved = null;
        /** @internal */
        this._nextRemoved = null;
        /** @internal */
        this._nextAdded = null;
        /** @internal */
        this._nextMoved = null;
        /** @internal */
        this._nextIdentityChange = null;
    }
    CollectionChangeRecord.prototype.toString = function () {
        return this.previousIndex === this.currentIndex ? lang_2.stringify(this.item) :
            lang_2.stringify(this.item) + '[' +
                lang_2.stringify(this.previousIndex) + '->' + lang_2.stringify(this.currentIndex) + ']';
    };
    return CollectionChangeRecord;
})();
exports.CollectionChangeRecord = CollectionChangeRecord;
// A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
var _DuplicateItemRecordList = (function () {
    function _DuplicateItemRecordList() {
        /** @internal */
        this._head = null;
        /** @internal */
        this._tail = null;
    }
    /**
     * Append the record to the list of duplicates.
     *
     * Note: by design all records in the list of duplicates hold the same value in record.item.
     */
    _DuplicateItemRecordList.prototype.add = function (record) {
        if (this._head === null) {
            this._head = this._tail = record;
            record._nextDup = null;
            record._prevDup = null;
        }
        else {
            // todo(vicb)
            // assert(record.item ==  _head.item ||
            //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
            this._tail._nextDup = record;
            record._prevDup = this._tail;
            record._nextDup = null;
            this._tail = record;
        }
    };
    // Returns a CollectionChangeRecord having CollectionChangeRecord.trackById == trackById and
    // CollectionChangeRecord.currentIndex >= afterIndex
    _DuplicateItemRecordList.prototype.get = function (trackById, afterIndex) {
        var record;
        for (record = this._head; record !== null; record = record._nextDup) {
            if ((afterIndex === null || afterIndex < record.currentIndex) &&
                lang_2.looseIdentical(record.trackById, trackById)) {
                return record;
            }
        }
        return null;
    };
    /**
     * Remove one {@link CollectionChangeRecord} from the list of duplicates.
     *
     * Returns whether the list of duplicates is empty.
     */
    _DuplicateItemRecordList.prototype.remove = function (record) {
        // todo(vicb)
        // assert(() {
        //  // verify that the record being removed is in the list.
        //  for (CollectionChangeRecord cursor = _head; cursor != null; cursor = cursor._nextDup) {
        //    if (identical(cursor, record)) return true;
        //  }
        //  return false;
        //});
        var prev = record._prevDup;
        var next = record._nextDup;
        if (prev === null) {
            this._head = next;
        }
        else {
            prev._nextDup = next;
        }
        if (next === null) {
            this._tail = prev;
        }
        else {
            next._prevDup = prev;
        }
        return this._head === null;
    };
    return _DuplicateItemRecordList;
})();
var _DuplicateMap = (function () {
    function _DuplicateMap() {
        this.map = new Map();
    }
    _DuplicateMap.prototype.put = function (record) {
        // todo(vicb) handle corner cases
        var key = lang_2.getMapKey(record.trackById);
        var duplicates = this.map.get(key);
        if (!lang_2.isPresent(duplicates)) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
        }
        duplicates.add(record);
    };
    /**
     * Retrieve the `value` using key. Because the CollectionChangeRecord value may be one which we
     * have already iterated over, we use the afterIndex to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the last `a` not the first or second.
     */
    _DuplicateMap.prototype.get = function (trackById, afterIndex) {
        if (afterIndex === void 0) { afterIndex = null; }
        var key = lang_2.getMapKey(trackById);
        var recordList = this.map.get(key);
        return lang_2.isBlank(recordList) ? null : recordList.get(trackById, afterIndex);
    };
    /**
     * Removes a {@link CollectionChangeRecord} from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     */
    _DuplicateMap.prototype.remove = function (record) {
        var key = lang_2.getMapKey(record.trackById);
        // todo(vicb)
        // assert(this.map.containsKey(key));
        var recordList = this.map.get(key);
        // Remove the list of duplicates when it gets empty
        if (recordList.remove(record)) {
            this.map.delete(key);
        }
        return record;
    };
    Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
        get: function () { return this.map.size === 0; },
        enumerable: true,
        configurable: true
    });
    _DuplicateMap.prototype.clear = function () { this.map.clear(); };
    _DuplicateMap.prototype.toString = function () { return '_DuplicateMap(' + lang_2.stringify(this.map) + ')'; };
    return _DuplicateMap;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVB2T3VSanZ4LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIudHMiXSwibmFtZXMiOlsiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnkuY29uc3RydWN0b3IiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5LnN1cHBvcnRzIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyRmFjdG9yeS5jcmVhdGUiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuY29uc3RydWN0b3IiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuY29sbGVjdGlvbiIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5sZW5ndGgiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaFByZXZpb3VzSXRlbSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5mb3JFYWNoQWRkZWRJdGVtIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmZvckVhY2hNb3ZlZEl0ZW0iLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuZm9yRWFjaFJlbW92ZWRJdGVtIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLmZvckVhY2hJZGVudGl0eUNoYW5nZSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5kaWZmIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLm9uRGVzdHJveSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5jaGVjayIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5pc0RpcnR5IiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9yZXNldCIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fbWlzbWF0Y2giLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3ZlcmlmeVJlaW5zZXJ0aW9uIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl90cnVuY2F0ZSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fcmVpbnNlcnRBZnRlciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fbW92ZUFmdGVyIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9hZGRBZnRlciIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5faW5zZXJ0QWZ0ZXIiLCJEZWZhdWx0SXRlcmFibGVEaWZmZXIuX3JlbW92ZSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci5fdW5saW5rIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9hZGRUb01vdmVzIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9hZGRUb1JlbW92YWxzIiwiRGVmYXVsdEl0ZXJhYmxlRGlmZmVyLl9hZGRJZGVudGl0eUNoYW5nZSIsIkRlZmF1bHRJdGVyYWJsZURpZmZlci50b1N0cmluZyIsIkNvbGxlY3Rpb25DaGFuZ2VSZWNvcmQiLCJDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLmNvbnN0cnVjdG9yIiwiQ29sbGVjdGlvbkNoYW5nZVJlY29yZC50b1N0cmluZyIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdCIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdC5jb25zdHJ1Y3RvciIsIl9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdC5hZGQiLCJfRHVwbGljYXRlSXRlbVJlY29yZExpc3QuZ2V0IiwiX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0LnJlbW92ZSIsIl9EdXBsaWNhdGVNYXAiLCJfRHVwbGljYXRlTWFwLmNvbnN0cnVjdG9yIiwiX0R1cGxpY2F0ZU1hcC5wdXQiLCJfRHVwbGljYXRlTWFwLmdldCIsIl9EdXBsaWNhdGVNYXAucmVtb3ZlIiwiX0R1cGxpY2F0ZU1hcC5pc0VtcHR5IiwiX0R1cGxpY2F0ZU1hcC5jbGVhciIsIl9EdXBsaWNhdGVNYXAudG9TdHJpbmciXSwi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R0EsR0FBR0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3RDQSxhQUFhQTtRQUNiQSxxQ0FBcUNBO1FBQ3JDQSxJQUFJQSxVQUFVQSxHQUE2QkEsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLG1EQUFtREE7UUFDbkRBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURKLHNCQUFJQSxrQ0FBT0E7YUFBWEEsY0FBeUJLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUw7SUFFdERBLDZCQUFLQSxHQUFMQSxjQUFVTSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU3Qk4sZ0NBQVFBLEdBQVJBLGNBQXFCTyxNQUFNQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3RVAsb0JBQUNBO0FBQURBLENBQUNBLEFBbkRELElBbURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7aXNMaXN0TGlrZUl0ZXJhYmxlLCBpdGVyYXRlTGlzdExpa2UsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgc3RyaW5naWZ5LCBnZXRNYXBLZXksIGxvb3NlSWRlbnRpY2FsLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7SXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSwgVHJhY2tCeUZufSBmcm9tICcuLi9kaWZmZXJzL2l0ZXJhYmxlX2RpZmZlcnMnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnkgaW1wbGVtZW50cyBJdGVyYWJsZURpZmZlckZhY3Rvcnkge1xuICBzdXBwb3J0cyhvYmo6IE9iamVjdCk6IGJvb2xlYW4geyByZXR1cm4gaXNMaXN0TGlrZUl0ZXJhYmxlKG9iaik7IH1cbiAgY3JlYXRlKGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgdHJhY2tCeUZuPzogVHJhY2tCeUZuKTogRGVmYXVsdEl0ZXJhYmxlRGlmZmVyIHtcbiAgICByZXR1cm4gbmV3IERlZmF1bHRJdGVyYWJsZURpZmZlcih0cmFja0J5Rm4pO1xuICB9XG59XG5cbnZhciB0cmFja0J5SWRlbnRpdHkgPSAoaW5kZXg6IG51bWJlciwgaXRlbTogYW55KSA9PiBpdGVtO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyIGltcGxlbWVudHMgSXRlcmFibGVEaWZmZXIge1xuICBwcml2YXRlIF9sZW5ndGg6IG51bWJlciA9IG51bGw7XG4gIHByaXZhdGUgX2NvbGxlY3Rpb24gPSBudWxsO1xuICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgdXNlZCByZWNvcmRzIGF0IGFueSBwb2ludCBpbiB0aW1lIChkdXJpbmcgJiBhY3Jvc3MgYF9jaGVjaygpYCBjYWxscylcbiAgcHJpdmF0ZSBfbGlua2VkUmVjb3JkczogX0R1cGxpY2F0ZU1hcCA9IG51bGw7XG4gIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSByZW1vdmVkIHJlY29yZHMgYXQgYW55IHBvaW50IGluIHRpbWUgZHVyaW5nIGBfY2hlY2soKWAgY2FsbHMuXG4gIHByaXZhdGUgX3VubGlua2VkUmVjb3JkczogX0R1cGxpY2F0ZU1hcCA9IG51bGw7XG4gIHByaXZhdGUgX3ByZXZpb3VzSXRIZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfaXRIZWFkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfaXRUYWlsOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWRkaXRpb25zSGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX2FkZGl0aW9uc1RhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9tb3Zlc0hlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9tb3Zlc1RhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9yZW1vdmFsc0hlYWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICBwcml2YXRlIF9yZW1vdmFsc1RhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvLyBLZWVwcyB0cmFjayBvZiByZWNvcmRzIHdoZXJlIGN1c3RvbSB0cmFjayBieSBpcyB0aGUgc2FtZSwgYnV0IGl0ZW0gaWRlbnRpdHkgaGFzIGNoYW5nZWRcbiAgcHJpdmF0ZSBfaWRlbnRpdHlDaGFuZ2VzSGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIHByaXZhdGUgX2lkZW50aXR5Q2hhbmdlc1RhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3RyYWNrQnlGbj86IFRyYWNrQnlGbikge1xuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGlzUHJlc2VudCh0aGlzLl90cmFja0J5Rm4pID8gdGhpcy5fdHJhY2tCeUZuIDogdHJhY2tCeUlkZW50aXR5O1xuICB9XG5cbiAgZ2V0IGNvbGxlY3Rpb24oKSB7IHJldHVybiB0aGlzLl9jb2xsZWN0aW9uOyB9XG5cbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbGVuZ3RoOyB9XG5cbiAgZm9yRWFjaEl0ZW0oZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFByZXZpb3VzSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UHJldmlvdXMpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaEFkZGVkSXRlbShmbjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5fYWRkaXRpb25zSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRBZGRlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoTW92ZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tb3Zlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0TW92ZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFJlbW92ZWRJdGVtKGZuOiBGdW5jdGlvbikge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0UmVtb3ZlZCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoSWRlbnRpdHlDaGFuZ2UoZm46IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0SWRlbnRpdHlDaGFuZ2UpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZGlmZihjb2xsZWN0aW9uOiBhbnkpOiBEZWZhdWx0SXRlcmFibGVEaWZmZXIge1xuICAgIGlmIChpc0JsYW5rKGNvbGxlY3Rpb24pKSBjb2xsZWN0aW9uID0gW107XG4gICAgaWYgKCFpc0xpc3RMaWtlSXRlcmFibGUoY29sbGVjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBFcnJvciB0cnlpbmcgdG8gZGlmZiAnJHtjb2xsZWN0aW9ufSdgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGVjayhjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG9uRGVzdHJveSgpIHt9XG5cbiAgY2hlY2soY29sbGVjdGlvbjogYW55KTogYm9vbGVhbiB7XG4gICAgdGhpcy5fcmVzZXQoKTtcblxuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSB0aGlzLl9pdEhlYWQ7XG4gICAgdmFyIG1heUJlRGlydHk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICB2YXIgaW5kZXg6IG51bWJlcjtcbiAgICB2YXIgaXRlbTtcbiAgICB2YXIgaXRlbVRyYWNrQnk7XG4gICAgaWYgKGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgIGlmIChjb2xsZWN0aW9uICE9PSB0aGlzLl9jb2xsZWN0aW9uIHx8ICFMaXN0V3JhcHBlci5pc0ltbXV0YWJsZShjb2xsZWN0aW9uKSkge1xuICAgICAgICB2YXIgbGlzdCA9IGNvbGxlY3Rpb247XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuX2xlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGl0ZW0gPSBsaXN0W2luZGV4XTtcbiAgICAgICAgICBpdGVtVHJhY2tCeSA9IHRoaXMuX3RyYWNrQnlGbihpbmRleCwgaXRlbSk7XG4gICAgICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCB8fCAhbG9vc2VJZGVudGljYWwocmVjb3JkLnRyYWNrQnlJZCwgaXRlbVRyYWNrQnkpKSB7XG4gICAgICAgICAgICByZWNvcmQgPSB0aGlzLl9taXNtYXRjaChyZWNvcmQsIGl0ZW0sIGl0ZW1UcmFja0J5LCBpbmRleCk7XG4gICAgICAgICAgICBtYXlCZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1heUJlRGlydHkpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETyhtaXNrbyk6IGNhbiB3ZSBsaW1pdCB0aGlzIHRvIGR1cGxpY2F0ZXMgb25seT9cbiAgICAgICAgICAgICAgcmVjb3JkID0gdGhpcy5fdmVyaWZ5UmVpbnNlcnRpb24ocmVjb3JkLCBpdGVtLCBpdGVtVHJhY2tCeSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3RydW5jYXRlKHJlY29yZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICAgIGl0ZXJhdGVMaXN0TGlrZShjb2xsZWN0aW9uLCAoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtVHJhY2tCeSA9IHRoaXMuX3RyYWNrQnlGbihpbmRleCwgaXRlbSk7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IG51bGwgfHwgIWxvb3NlSWRlbnRpY2FsKHJlY29yZC50cmFja0J5SWQsIGl0ZW1UcmFja0J5KSkge1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX21pc21hdGNoKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICBtYXlCZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobWF5QmVEaXJ0eSkge1xuICAgICAgICAgICAgLy8gVE9ETyhtaXNrbyk6IGNhbiB3ZSBsaW1pdCB0aGlzIHRvIGR1cGxpY2F0ZXMgb25seT9cbiAgICAgICAgICAgIHJlY29yZCA9IHRoaXMuX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9sZW5ndGggPSBpbmRleDtcbiAgICAgIHRoaXMuX3RydW5jYXRlKHJlY29yZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG4gICAgcmV0dXJuIHRoaXMuaXNEaXJ0eTtcbiAgfVxuXG4gIC8qIENvbGxlY3Rpb25DaGFuZ2VzIGlzIGNvbnNpZGVyZWQgZGlydHkgaWYgaXQgaGFzIGFueSBhZGRpdGlvbnMsIG1vdmVzLCByZW1vdmFscywgb3IgaWRlbnRpdHlcbiAgICogY2hhbmdlcy5cbiAgICovXG4gIGdldCBpc0RpcnR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hZGRpdGlvbnNIZWFkICE9PSBudWxsIHx8IHRoaXMuX21vdmVzSGVhZCAhPT0gbnVsbCB8fFxuICAgICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgIT09IG51bGwgfHwgdGhpcy5faWRlbnRpdHlDaGFuZ2VzSGVhZCAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgc3RhdGUgb2YgdGhlIGNoYW5nZSBvYmplY3RzIHRvIHNob3cgbm8gY2hhbmdlcy4gVGhpcyBtZWFucyBzZXQgcHJldmlvdXNLZXkgdG9cbiAgICogY3VycmVudEtleSwgYW5kIGNsZWFyIGFsbCBvZiB0aGUgcXVldWVzIChhZGRpdGlvbnMsIG1vdmVzLCByZW1vdmFscykuXG4gICAqIFNldCB0aGUgcHJldmlvdXNJbmRleGVzIG9mIG1vdmVkIGFuZCBhZGRlZCBpdGVtcyB0byB0aGVpciBjdXJyZW50SW5kZXhlc1xuICAgKiBSZXNldCB0aGUgbGlzdCBvZiBhZGRpdGlvbnMsIG1vdmVzIGFuZCByZW1vdmFsc1xuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9yZXNldCgpIHtcbiAgICBpZiAodGhpcy5pc0RpcnR5KSB7XG4gICAgICB2YXIgcmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkO1xuICAgICAgdmFyIG5leHRSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG5cbiAgICAgIGZvciAocmVjb3JkID0gdGhpcy5fcHJldmlvdXNJdEhlYWQgPSB0aGlzLl9pdEhlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0KSB7XG4gICAgICAgIHJlY29yZC5fbmV4dFByZXZpb3VzID0gcmVjb3JkLl9uZXh0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgICAgcmVjb3JkLnByZXZpb3VzSW5kZXggPSByZWNvcmQuY3VycmVudEluZGV4O1xuICAgICAgfVxuICAgICAgdGhpcy5fYWRkaXRpb25zSGVhZCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwgPSBudWxsO1xuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX21vdmVzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSBuZXh0UmVjb3JkKSB7XG4gICAgICAgIHJlY29yZC5wcmV2aW91c0luZGV4ID0gcmVjb3JkLmN1cnJlbnRJbmRleDtcbiAgICAgICAgbmV4dFJlY29yZCA9IHJlY29yZC5fbmV4dE1vdmVkO1xuICAgICAgfVxuICAgICAgdGhpcy5fbW92ZXNIZWFkID0gdGhpcy5fbW92ZXNUYWlsID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCA9IHRoaXMuX3JlbW92YWxzVGFpbCA9IG51bGw7XG4gICAgICB0aGlzLl9pZGVudGl0eUNoYW5nZXNIZWFkID0gdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9IG51bGw7XG5cbiAgICAgIC8vIHRvZG8odmljYikgd2hlbiBhc3NlcnQgZ2V0cyBzdXBwb3J0ZWRcbiAgICAgIC8vIGFzc2VydCghdGhpcy5pc0RpcnR5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgY29yZSBmdW5jdGlvbiB3aGljaCBoYW5kbGVzIGRpZmZlcmVuY2VzIGJldHdlZW4gY29sbGVjdGlvbnMuXG4gICAqXG4gICAqIC0gYHJlY29yZGAgaXMgdGhlIHJlY29yZCB3aGljaCB3ZSBzYXcgYXQgdGhpcyBwb3NpdGlvbiBsYXN0IHRpbWUuIElmIG51bGwgdGhlbiBpdCBpcyBhIG5ld1xuICAgKiAgIGl0ZW0uXG4gICAqIC0gYGl0ZW1gIGlzIHRoZSBjdXJyZW50IGl0ZW0gaW4gdGhlIGNvbGxlY3Rpb25cbiAgICogLSBgaW5kZXhgIGlzIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSBpbiB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9taXNtYXRjaChyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIGl0ZW06IGFueSwgaXRlbVRyYWNrQnk6IGFueSwgaW5kZXg6IG51bWJlcik6XG4gICAgICBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICAvLyBUaGUgcHJldmlvdXMgcmVjb3JkIGFmdGVyIHdoaWNoIHdlIHdpbGwgYXBwZW5kIHRoZSBjdXJyZW50IG9uZS5cbiAgICB2YXIgcHJldmlvdXNSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG5cbiAgICBpZiAocmVjb3JkID09PSBudWxsKSB7XG4gICAgICBwcmV2aW91c1JlY29yZCA9IHRoaXMuX2l0VGFpbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNSZWNvcmQgPSByZWNvcmQuX3ByZXY7XG4gICAgICAvLyBSZW1vdmUgdGhlIHJlY29yZCBmcm9tIHRoZSBjb2xsZWN0aW9uIHNpbmNlIHdlIGtub3cgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGl0ZW0uXG4gICAgICB0aGlzLl9yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIHNlZSBpZiB3ZSBoYXZlIHNlZW4gdGhlIGl0ZW0gYmVmb3JlLlxuICAgIHJlY29yZCA9IHRoaXMuX2xpbmtlZFJlY29yZHMgPT09IG51bGwgPyBudWxsIDogdGhpcy5fbGlua2VkUmVjb3Jkcy5nZXQoaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICBpZiAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICAvLyBXZSBoYXZlIHNlZW4gdGhpcyBiZWZvcmUsIHdlIG5lZWQgdG8gbW92ZSBpdCBmb3J3YXJkIGluIHRoZSBjb2xsZWN0aW9uLlxuICAgICAgLy8gQnV0IGZpcnN0IHdlIG5lZWQgdG8gY2hlY2sgaWYgaWRlbnRpdHkgY2hhbmdlZCwgc28gd2UgY2FuIHVwZGF0ZSBpbiB2aWV3IGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG5cbiAgICAgIHRoaXMuX21vdmVBZnRlcihyZWNvcmQsIHByZXZpb3VzUmVjb3JkLCBpbmRleCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5ldmVyIHNlZW4gaXQsIGNoZWNrIGV2aWN0ZWQgbGlzdC5cbiAgICAgIHJlY29yZCA9IHRoaXMuX3VubGlua2VkUmVjb3JkcyA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl91bmxpbmtlZFJlY29yZHMuZ2V0KGl0ZW1UcmFja0J5KTtcbiAgICAgIGlmIChyZWNvcmQgIT09IG51bGwpIHtcbiAgICAgICAgLy8gSXQgaXMgYW4gaXRlbSB3aGljaCB3ZSBoYXZlIGV2aWN0ZWQgZWFybGllcjogcmVpbnNlcnQgaXQgYmFjayBpbnRvIHRoZSBsaXN0LlxuICAgICAgICAvLyBCdXQgZmlyc3Qgd2UgbmVlZCB0byBjaGVjayBpZiBpZGVudGl0eSBjaGFuZ2VkLCBzbyB3ZSBjYW4gdXBkYXRlIGluIHZpZXcgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICghbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB0aGlzLl9hZGRJZGVudGl0eUNoYW5nZShyZWNvcmQsIGl0ZW0pO1xuXG4gICAgICAgIHRoaXMuX3JlaW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSXQgaXMgYSBuZXcgaXRlbTogYWRkIGl0LlxuICAgICAgICByZWNvcmQgPVxuICAgICAgICAgICAgdGhpcy5fYWRkQWZ0ZXIobmV3IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQoaXRlbSwgaXRlbVRyYWNrQnkpLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2hlY2sgaXMgb25seSBuZWVkZWQgaWYgYW4gYXJyYXkgY29udGFpbnMgZHVwbGljYXRlcy4gKFNob3J0IGNpcmN1aXQgb2Ygbm90aGluZyBkaXJ0eSlcbiAgICpcbiAgICogVXNlIGNhc2U6IGBbYSwgYV1gID0+IGBbYiwgYSwgYV1gXG4gICAqXG4gICAqIElmIHdlIGRpZCBub3QgaGF2ZSB0aGlzIGNoZWNrIHRoZW4gdGhlIGluc2VydGlvbiBvZiBgYmAgd291bGQ6XG4gICAqICAgMSkgZXZpY3QgZmlyc3QgYGFgXG4gICAqICAgMikgaW5zZXJ0IGBiYCBhdCBgMGAgaW5kZXguXG4gICAqICAgMykgbGVhdmUgYGFgIGF0IGluZGV4IGAxYCBhcyBpcy4gPC0tIHRoaXMgaXMgd3JvbmchXG4gICAqICAgMykgcmVpbnNlcnQgYGFgIGF0IGluZGV4IDIuIDwtLSB0aGlzIGlzIHdyb25nIVxuICAgKlxuICAgKiBUaGUgY29ycmVjdCBiZWhhdmlvciBpczpcbiAgICogICAxKSBldmljdCBmaXJzdCBgYWBcbiAgICogICAyKSBpbnNlcnQgYGJgIGF0IGAwYCBpbmRleC5cbiAgICogICAzKSByZWluc2VydCBgYWAgYXQgaW5kZXggMS5cbiAgICogICAzKSBtb3ZlIGBhYCBhdCBmcm9tIGAxYCB0byBgMmAuXG4gICAqXG4gICAqXG4gICAqIERvdWJsZSBjaGVjayB0aGF0IHdlIGhhdmUgbm90IGV2aWN0ZWQgYSBkdXBsaWNhdGUgaXRlbS4gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgaXRlbSB0eXBlIG1heVxuICAgKiBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkOlxuICAgKiBUaGUgaW5zZXJ0aW9uIG9mIGIgd2lsbCBldmljdCB0aGUgZmlyc3QgJ2EnLiBJZiB3ZSBkb24ndCByZWluc2VydCBpdCBub3cgaXQgd2lsbCBiZSByZWluc2VydGVkXG4gICAqIGF0IHRoZSBlbmQuIFdoaWNoIHdpbGwgc2hvdyB1cCBhcyB0aGUgdHdvICdhJ3Mgc3dpdGNoaW5nIHBvc2l0aW9uLiBUaGlzIGlzIGluY29ycmVjdCwgc2luY2UgYVxuICAgKiBiZXR0ZXIgd2F5IHRvIHRoaW5rIG9mIGl0IGlzIGFzIGluc2VydCBvZiAnYicgcmF0aGVyIHRoZW4gc3dpdGNoICdhJyB3aXRoICdiJyBhbmQgdGhlbiBhZGQgJ2EnXG4gICAqIGF0IHRoZSBlbmQuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgaXRlbTogYW55LCBpdGVtVHJhY2tCeTogYW55LCBpbmRleDogbnVtYmVyKTpcbiAgICAgIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciByZWluc2VydFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9XG4gICAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl91bmxpbmtlZFJlY29yZHMuZ2V0KGl0ZW1UcmFja0J5KTtcbiAgICBpZiAocmVpbnNlcnRSZWNvcmQgIT09IG51bGwpIHtcbiAgICAgIHJlY29yZCA9IHRoaXMuX3JlaW5zZXJ0QWZ0ZXIocmVpbnNlcnRSZWNvcmQsIHJlY29yZC5fcHJldiwgaW5kZXgpO1xuICAgIH0gZWxzZSBpZiAocmVjb3JkLmN1cnJlbnRJbmRleCAhPSBpbmRleCkge1xuICAgICAgcmVjb3JkLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmlkIG9mIGFueSBleGNlc3Mge0BsaW5rIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9cyBmcm9tIHRoZSBwcmV2aW91cyBjb2xsZWN0aW9uXG4gICAqXG4gICAqIC0gYHJlY29yZGAgVGhlIGZpcnN0IGV4Y2VzcyB7QGxpbmsgQ29sbGVjdGlvbkNoYW5nZVJlY29yZH0uXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3RydW5jYXRlKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCkge1xuICAgIC8vIEFueXRoaW5nIGFmdGVyIHRoYXQgbmVlZHMgdG8gYmUgcmVtb3ZlZDtcbiAgICB3aGlsZSAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICB2YXIgbmV4dFJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IHJlY29yZC5fbmV4dDtcbiAgICAgIHRoaXMuX2FkZFRvUmVtb3ZhbHModGhpcy5fdW5saW5rKHJlY29yZCkpO1xuICAgICAgcmVjb3JkID0gbmV4dFJlY29yZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3VubGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2FkZGl0aW9uc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tb3Zlc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX21vdmVzVGFpbC5fbmV4dE1vdmVkID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2l0VGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsLl9uZXh0ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3JlbW92YWxzVGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsLl9uZXh0SWRlbnRpdHlDaGFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlaW5zZXJ0QWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBpbmRleDogbnVtYmVyKTpcbiAgICAgIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG4gICAgdmFyIHByZXYgPSByZWNvcmQuX3ByZXZSZW1vdmVkO1xuICAgIHZhciBuZXh0ID0gcmVjb3JkLl9uZXh0UmVtb3ZlZDtcblxuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0UmVtb3ZlZCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2UmVtb3ZlZCA9IHByZXY7XG4gICAgfVxuXG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG4gICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW92ZUFmdGVyKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgcHJldlJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgaW5kZXg6IG51bWJlcik6XG4gICAgICBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICB0aGlzLl91bmxpbmsocmVjb3JkKTtcbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcbiAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRBZnRlcihyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIHByZXZSZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIGluZGV4OiBudW1iZXIpOlxuICAgICAgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG5cbiAgICBpZiAodGhpcy5fYWRkaXRpb25zVGFpbCA9PT0gbnVsbCkge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KHRoaXMuX2FkZGl0aW9uc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChfYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID09PSBudWxsKTtcbiAgICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRBZGRlZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsID0gdGhpcy5fYWRkaXRpb25zVGFpbC5fbmV4dEFkZGVkID0gcmVjb3JkO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaW5zZXJ0QWZ0ZXIocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBwcmV2UmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkLCBpbmRleDogbnVtYmVyKTpcbiAgICAgIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQocmVjb3JkICE9IHByZXZSZWNvcmQpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHQgPT09IG51bGwpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX3ByZXYgPT09IG51bGwpO1xuXG4gICAgdmFyIG5leHQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBwcmV2UmVjb3JkID09PSBudWxsID8gdGhpcy5faXRIZWFkIDogcHJldlJlY29yZC5fbmV4dDtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KG5leHQgIT0gcmVjb3JkKTtcbiAgICAvLyBhc3NlcnQocHJldlJlY29yZCAhPSByZWNvcmQpO1xuICAgIHJlY29yZC5fbmV4dCA9IG5leHQ7XG4gICAgcmVjb3JkLl9wcmV2ID0gcHJldlJlY29yZDtcbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2ID0gcmVjb3JkO1xuICAgIH1cbiAgICBpZiAocHJldlJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2UmVjb3JkLl9uZXh0ID0gcmVjb3JkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9saW5rZWRSZWNvcmRzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9saW5rZWRSZWNvcmRzID0gbmV3IF9EdXBsaWNhdGVNYXAoKTtcbiAgICB9XG4gICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcblxuICAgIHJlY29yZC5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVtb3ZlKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHJldHVybiB0aGlzLl9hZGRUb1JlbW92YWxzKHRoaXMuX3VubGluayhyZWNvcmQpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VubGluayhyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkIHtcbiAgICBpZiAodGhpcy5fbGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICB2YXIgcHJldiA9IHJlY29yZC5fcHJldjtcbiAgICB2YXIgbmV4dCA9IHJlY29yZC5fbmV4dDtcblxuICAgIC8vIHRvZG8odmljYilcbiAgICAvLyBhc3NlcnQoKHJlY29yZC5fcHJldiA9IG51bGwpID09PSBudWxsKTtcbiAgICAvLyBhc3NlcnQoKHJlY29yZC5fbmV4dCA9IG51bGwpID09PSBudWxsKTtcblxuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9pdEhlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXYgPSBwcmV2O1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRUb01vdmVzKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCwgdG9JbmRleDogbnVtYmVyKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgLy8gdG9kbyh2aWNiKVxuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHRNb3ZlZCA9PT0gbnVsbCk7XG5cbiAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT09IHRvSW5kZXgpIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21vdmVzVGFpbCA9PT0gbnVsbCkge1xuICAgICAgLy8gdG9kbyh2aWNiKVxuICAgICAgLy8gYXNzZXJ0KF9tb3Zlc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fbW92ZXNUYWlsID0gdGhpcy5fbW92ZXNIZWFkID0gcmVjb3JkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX21vdmVzVGFpbC5fbmV4dE1vdmVkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX21vdmVzVGFpbCA9IHRoaXMuX21vdmVzVGFpbC5fbmV4dE1vdmVkID0gcmVjb3JkO1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRUb1JlbW92YWxzKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9IG5ldyBfRHVwbGljYXRlTWFwKCk7XG4gICAgfVxuICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5wdXQocmVjb3JkKTtcbiAgICByZWNvcmQuY3VycmVudEluZGV4ID0gbnVsbDtcbiAgICByZWNvcmQuX25leHRSZW1vdmVkID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9yZW1vdmFsc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIHRvZG8odmljYilcbiAgICAgIC8vIGFzc2VydChfcmVtb3ZhbHNIZWFkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHRoaXMuX3JlbW92YWxzSGVhZCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fcHJldlJlbW92ZWQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQoX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgcmVjb3JkLl9wcmV2UmVtb3ZlZCA9IHRoaXMuX3JlbW92YWxzVGFpbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSByZWNvcmQ7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRJZGVudGl0eUNoYW5nZShyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQsIGl0ZW06IGFueSkge1xuICAgIHJlY29yZC5pdGVtID0gaXRlbTtcbiAgICBpZiAodGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lkZW50aXR5Q2hhbmdlc1RhaWwgPSB0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsLl9uZXh0SWRlbnRpdHlDaGFuZ2UgPSByZWNvcmQ7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdmFyIGxpc3QgPSBbXTtcbiAgICB0aGlzLmZvckVhY2hJdGVtKChyZWNvcmQpID0+IGxpc3QucHVzaChyZWNvcmQpKTtcblxuICAgIHZhciBwcmV2aW91cyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaFByZXZpb3VzSXRlbSgocmVjb3JkKSA9PiBwcmV2aW91cy5wdXNoKHJlY29yZCkpO1xuXG4gICAgdmFyIGFkZGl0aW9ucyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiBhZGRpdGlvbnMucHVzaChyZWNvcmQpKTtcblxuICAgIHZhciBtb3ZlcyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaE1vdmVkSXRlbSgocmVjb3JkKSA9PiBtb3Zlcy5wdXNoKHJlY29yZCkpO1xuXG4gICAgdmFyIHJlbW92YWxzID0gW107XG4gICAgdGhpcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4gcmVtb3ZhbHMucHVzaChyZWNvcmQpKTtcblxuICAgIHZhciBpZGVudGl0eUNoYW5nZXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkKSA9PiBpZGVudGl0eUNoYW5nZXMucHVzaChyZWNvcmQpKTtcblxuICAgIHJldHVybiAnY29sbGVjdGlvbjogJyArIGxpc3Quam9pbignLCAnKSArICdcXG4nICtcbiAgICAgICAgJ3ByZXZpb3VzOiAnICsgcHJldmlvdXMuam9pbignLCAnKSArICdcXG4nICtcbiAgICAgICAgJ2FkZGl0aW9uczogJyArIGFkZGl0aW9ucy5qb2luKCcsICcpICsgJ1xcbicgK1xuICAgICAgICAnbW92ZXM6ICcgKyBtb3Zlcy5qb2luKCcsICcpICsgJ1xcbicgK1xuICAgICAgICAncmVtb3ZhbHM6ICcgKyByZW1vdmFscy5qb2luKCcsICcpICsgJ1xcbicgK1xuICAgICAgICAnaWRlbnRpdHlDaGFuZ2VzOiAnICsgaWRlbnRpdHlDaGFuZ2VzLmpvaW4oJywgJykgKyAnXFxuJztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gIGN1cnJlbnRJbmRleDogbnVtYmVyID0gbnVsbDtcbiAgcHJldmlvdXNJbmRleDogbnVtYmVyID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UHJldmlvdXM6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2OiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXZEdXA6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0RHVwOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJldlJlbW92ZWQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UmVtb3ZlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRBZGRlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRNb3ZlZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRJZGVudGl0eUNoYW5nZTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaXRlbTogYW55LCBwdWJsaWMgdHJhY2tCeUlkOiBhbnkpIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcmV2aW91c0luZGV4ID09PSB0aGlzLmN1cnJlbnRJbmRleCA/IHN0cmluZ2lmeSh0aGlzLml0ZW0pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ2lmeSh0aGlzLml0ZW0pICsgJ1snICtcbiAgICAgICAgICAgIHN0cmluZ2lmeSh0aGlzLnByZXZpb3VzSW5kZXgpICsgJy0+JyArIHN0cmluZ2lmeSh0aGlzLmN1cnJlbnRJbmRleCkgKyAnXSc7XG4gIH1cbn1cblxuLy8gQSBsaW5rZWQgbGlzdCBvZiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkcyB3aXRoIHRoZSBzYW1lIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQuaXRlbVxuY2xhc3MgX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaGVhZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RhaWw6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgdGhlIHJlY29yZCB0byB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzLlxuICAgKlxuICAgKiBOb3RlOiBieSBkZXNpZ24gYWxsIHJlY29yZHMgaW4gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBob2xkIHRoZSBzYW1lIHZhbHVlIGluIHJlY29yZC5pdGVtLlxuICAgKi9cbiAgYWRkKHJlY29yZDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9oZWFkID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9oZWFkID0gdGhpcy5fdGFpbCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fbmV4dER1cCA9IG51bGw7XG4gICAgICByZWNvcmQuX3ByZXZEdXAgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0b2RvKHZpY2IpXG4gICAgICAvLyBhc3NlcnQocmVjb3JkLml0ZW0gPT0gIF9oZWFkLml0ZW0gfHxcbiAgICAgIC8vICAgICAgIHJlY29yZC5pdGVtIGlzIG51bSAmJiByZWNvcmQuaXRlbS5pc05hTiAmJiBfaGVhZC5pdGVtIGlzIG51bSAmJiBfaGVhZC5pdGVtLmlzTmFOKTtcbiAgICAgIHRoaXMuX3RhaWwuX25leHREdXAgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX3ByZXZEdXAgPSB0aGlzLl90YWlsO1xuICAgICAgcmVjb3JkLl9uZXh0RHVwID0gbnVsbDtcbiAgICAgIHRoaXMuX3RhaWwgPSByZWNvcmQ7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJucyBhIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgaGF2aW5nIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQudHJhY2tCeUlkID09IHRyYWNrQnlJZCBhbmRcbiAgLy8gQ29sbGVjdGlvbkNoYW5nZVJlY29yZC5jdXJyZW50SW5kZXggPj0gYWZ0ZXJJbmRleFxuICBnZXQodHJhY2tCeUlkOiBhbnksIGFmdGVySW5kZXg6IG51bWJlcik6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciByZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQ7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9oZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dER1cCkge1xuICAgICAgaWYgKChhZnRlckluZGV4ID09PSBudWxsIHx8IGFmdGVySW5kZXggPCByZWNvcmQuY3VycmVudEluZGV4KSAmJlxuICAgICAgICAgIGxvb3NlSWRlbnRpY2FsKHJlY29yZC50cmFja0J5SWQsIHRyYWNrQnlJZCkpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIG9uZSB7QGxpbmsgQ29sbGVjdGlvbkNoYW5nZVJlY29yZH0gZnJvbSB0aGUgbGlzdCBvZiBkdXBsaWNhdGVzLlxuICAgKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBpcyBlbXB0eS5cbiAgICovXG4gIHJlbW92ZShyZWNvcmQ6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQpOiBib29sZWFuIHtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KCgpIHtcbiAgICAvLyAgLy8gdmVyaWZ5IHRoYXQgdGhlIHJlY29yZCBiZWluZyByZW1vdmVkIGlzIGluIHRoZSBsaXN0LlxuICAgIC8vICBmb3IgKENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgY3Vyc29yID0gX2hlYWQ7IGN1cnNvciAhPSBudWxsOyBjdXJzb3IgPSBjdXJzb3IuX25leHREdXApIHtcbiAgICAvLyAgICBpZiAoaWRlbnRpY2FsKGN1cnNvciwgcmVjb3JkKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gIH1cbiAgICAvLyAgcmV0dXJuIGZhbHNlO1xuICAgIC8vfSk7XG5cbiAgICB2YXIgcHJldjogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IHJlY29yZC5fcHJldkR1cDtcbiAgICB2YXIgbmV4dDogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCA9IHJlY29yZC5fbmV4dER1cDtcbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHREdXAgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fdGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXZEdXAgPSBwcmV2O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faGVhZCA9PT0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBfRHVwbGljYXRlTWFwIHtcbiAgbWFwID0gbmV3IE1hcDxhbnksIF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdD4oKTtcblxuICBwdXQocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKSB7XG4gICAgLy8gdG9kbyh2aWNiKSBoYW5kbGUgY29ybmVyIGNhc2VzXG4gICAgdmFyIGtleSA9IGdldE1hcEtleShyZWNvcmQudHJhY2tCeUlkKTtcblxuICAgIHZhciBkdXBsaWNhdGVzID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgaWYgKCFpc1ByZXNlbnQoZHVwbGljYXRlcykpIHtcbiAgICAgIGR1cGxpY2F0ZXMgPSBuZXcgX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0KCk7XG4gICAgICB0aGlzLm1hcC5zZXQoa2V5LCBkdXBsaWNhdGVzKTtcbiAgICB9XG4gICAgZHVwbGljYXRlcy5hZGQocmVjb3JkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYHZhbHVlYCB1c2luZyBrZXkuIEJlY2F1c2UgdGhlIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQgdmFsdWUgbWF5IGJlIG9uZSB3aGljaCB3ZVxuICAgKiBoYXZlIGFscmVhZHkgaXRlcmF0ZWQgb3Zlciwgd2UgdXNlIHRoZSBhZnRlckluZGV4IHRvIHByZXRlbmQgaXQgaXMgbm90IHRoZXJlLlxuICAgKlxuICAgKiBVc2UgY2FzZTogYFthLCBiLCBjLCBhLCBhXWAgaWYgd2UgYXJlIGF0IGluZGV4IGAzYCB3aGljaCBpcyB0aGUgc2Vjb25kIGBhYCB0aGVuIGFza2luZyBpZiB3ZVxuICAgKiBoYXZlIGFueSBtb3JlIGBhYHMgbmVlZHMgdG8gcmV0dXJuIHRoZSBsYXN0IGBhYCBub3QgdGhlIGZpcnN0IG9yIHNlY29uZC5cbiAgICovXG4gIGdldCh0cmFja0J5SWQ6IGFueSwgYWZ0ZXJJbmRleDogbnVtYmVyID0gbnVsbCk6IENvbGxlY3Rpb25DaGFuZ2VSZWNvcmQge1xuICAgIHZhciBrZXkgPSBnZXRNYXBLZXkodHJhY2tCeUlkKTtcblxuICAgIHZhciByZWNvcmRMaXN0ID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgcmV0dXJuIGlzQmxhbmsocmVjb3JkTGlzdCkgPyBudWxsIDogcmVjb3JkTGlzdC5nZXQodHJhY2tCeUlkLCBhZnRlckluZGV4KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEge0BsaW5rIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmR9IGZyb20gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogVGhlIGxpc3Qgb2YgZHVwbGljYXRlcyBhbHNvIGlzIHJlbW92ZWQgZnJvbSB0aGUgbWFwIGlmIGl0IGdldHMgZW1wdHkuXG4gICAqL1xuICByZW1vdmUocmVjb3JkOiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkKTogQ29sbGVjdGlvbkNoYW5nZVJlY29yZCB7XG4gICAgdmFyIGtleSA9IGdldE1hcEtleShyZWNvcmQudHJhY2tCeUlkKTtcbiAgICAvLyB0b2RvKHZpY2IpXG4gICAgLy8gYXNzZXJ0KHRoaXMubWFwLmNvbnRhaW5zS2V5KGtleSkpO1xuICAgIHZhciByZWNvcmRMaXN0OiBfRHVwbGljYXRlSXRlbVJlY29yZExpc3QgPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICAvLyBSZW1vdmUgdGhlIGxpc3Qgb2YgZHVwbGljYXRlcyB3aGVuIGl0IGdldHMgZW1wdHlcbiAgICBpZiAocmVjb3JkTGlzdC5yZW1vdmUocmVjb3JkKSkge1xuICAgICAgdGhpcy5tYXAuZGVsZXRlKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICBnZXQgaXNFbXB0eSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubWFwLnNpemUgPT09IDA7IH1cblxuICBjbGVhcigpIHsgdGhpcy5tYXAuY2xlYXIoKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiAnX0R1cGxpY2F0ZU1hcCgnICsgc3RyaW5naWZ5KHRoaXMubWFwKSArICcpJzsgfVxufVxuIl19