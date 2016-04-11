'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var abstract_change_detector_1 = require('./abstract_change_detector');
var change_detection_util_1 = require('./change_detection_util');
var constants_1 = require('./constants');
var proto_record_1 = require('./proto_record');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var async_1 = require('angular2/src/facade/async');
var DynamicChangeDetector = (function (_super) {
    __extends(DynamicChangeDetector, _super);
    function DynamicChangeDetector(id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy, _records, _eventBindings, _directiveRecords, _genConfig) {
        _super.call(this, id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy);
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._genConfig = _genConfig;
        var len = _records.length + 1;
        this.values = collection_1.ListWrapper.createFixedSize(len);
        this.localPipes = collection_1.ListWrapper.createFixedSize(len);
        this.prevContexts = collection_1.ListWrapper.createFixedSize(len);
        this.changes = collection_1.ListWrapper.createFixedSize(len);
        this.dehydrateDirectives(false);
    }
    DynamicChangeDetector.prototype.handleEventInternal = function (eventName, elIndex, locals) {
        var _this = this;
        var preventDefault = false;
        this._matchingEventBindings(eventName, elIndex).forEach(function (rec) {
            var res = _this._processEventBinding(rec, locals);
            if (res === false) {
                preventDefault = true;
            }
        });
        return preventDefault;
    };
    /** @internal */
    DynamicChangeDetector.prototype._processEventBinding = function (eb, locals) {
        var values = collection_1.ListWrapper.createFixedSize(eb.records.length);
        values[0] = this.values[0];
        for (var protoIdx = 0; protoIdx < eb.records.length; ++protoIdx) {
            var proto = eb.records[protoIdx];
            if (proto.isSkipRecord()) {
                protoIdx += this._computeSkipLength(protoIdx, proto, values);
            }
            else {
                if (proto.lastInBinding) {
                    this._markPathAsCheckOnce(proto);
                }
                var res = this._calculateCurrValue(proto, values, locals);
                if (proto.lastInBinding) {
                    return res;
                }
                else {
                    this._writeSelf(proto, res, values);
                }
            }
        }
        throw new exceptions_1.BaseException('Cannot be reached');
    };
    DynamicChangeDetector.prototype._computeSkipLength = function (protoIndex, proto, values) {
        if (proto.mode === proto_record_1.RecordType.SkipRecords) {
            return proto.fixedArgs[0] - protoIndex - 1;
        }
        if (proto.mode === proto_record_1.RecordType.SkipRecordsIf) {
            var condition = this._readContext(proto, values);
            return condition ? proto.fixedArgs[0] - protoIndex - 1 : 0;
        }
        if (proto.mode === proto_record_1.RecordType.SkipRecordsIfNot) {
            var condition = this._readContext(proto, values);
            return condition ? 0 : proto.fixedArgs[0] - protoIndex - 1;
        }
        throw new exceptions_1.BaseException('Cannot be reached');
    };
    /** @internal */
    DynamicChangeDetector.prototype._markPathAsCheckOnce = function (proto) {
        if (!proto.bindingRecord.isDefaultChangeDetection()) {
            var dir = proto.bindingRecord.directiveRecord;
            this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._matchingEventBindings = function (eventName, elIndex) {
        return this._eventBindings.filter(function (eb) { return eb.eventName == eventName && eb.elIndex === elIndex; });
    };
    DynamicChangeDetector.prototype.hydrateDirectives = function (dispatcher) {
        var _this = this;
        this.values[0] = this.context;
        this.dispatcher = dispatcher;
        this.outputSubscriptions = [];
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var r = this._directiveRecords[i];
            if (lang_1.isPresent(r.outputs)) {
                r.outputs.forEach(function (output) {
                    var eventHandler = _this._createEventHandler(r.directiveIndex.elementIndex, output[1]);
                    var directive = _this._getDirectiveFor(r.directiveIndex);
                    var getter = reflection_1.reflector.getter(output[0]);
                    _this.outputSubscriptions.push(async_1.ObservableWrapper.subscribe(getter(directive), eventHandler));
                });
            }
        }
    };
    DynamicChangeDetector.prototype._createEventHandler = function (boundElementIndex, eventName) {
        var _this = this;
        return function (event) { return _this.handleEvent(eventName, boundElementIndex, event); };
    };
    DynamicChangeDetector.prototype.dehydrateDirectives = function (destroyPipes) {
        if (destroyPipes) {
            this._destroyPipes();
            this._destroyDirectives();
        }
        this.values[0] = null;
        collection_1.ListWrapper.fill(this.values, change_detection_util_1.ChangeDetectionUtil.uninitialized, 1);
        collection_1.ListWrapper.fill(this.changes, false);
        collection_1.ListWrapper.fill(this.localPipes, null);
        collection_1.ListWrapper.fill(this.prevContexts, change_detection_util_1.ChangeDetectionUtil.uninitialized);
    };
    /** @internal */
    DynamicChangeDetector.prototype._destroyPipes = function () {
        for (var i = 0; i < this.localPipes.length; ++i) {
            if (lang_1.isPresent(this.localPipes[i])) {
                change_detection_util_1.ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._destroyDirectives = function () {
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var record = this._directiveRecords[i];
            if (record.callOnDestroy) {
                this._getDirectiveFor(record.directiveIndex).ngOnDestroy();
            }
        }
    };
    DynamicChangeDetector.prototype.checkNoChanges = function () { this.runDetectChanges(true); };
    DynamicChangeDetector.prototype.detectChangesInRecordsInternal = function (throwOnChange) {
        var protos = this._records;
        var changes = null;
        var isChanged = false;
        for (var protoIdx = 0; protoIdx < protos.length; ++protoIdx) {
            var proto = protos[protoIdx];
            var bindingRecord = proto.bindingRecord;
            var directiveRecord = bindingRecord.directiveRecord;
            if (this._firstInBinding(proto)) {
                this.propertyBindingIndex = proto.propertyBindingIndex;
            }
            if (proto.isLifeCycleRecord()) {
                if (proto.name === 'DoCheck' && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngDoCheck();
                }
                else if (proto.name === 'OnInit' && !throwOnChange &&
                    this.state == constants_1.ChangeDetectorState.NeverChecked) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnInit();
                }
                else if (proto.name === 'OnChanges' && lang_1.isPresent(changes) && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnChanges(changes);
                }
            }
            else if (proto.isSkipRecord()) {
                protoIdx += this._computeSkipLength(protoIdx, proto, this.values);
            }
            else {
                var change = this._check(proto, throwOnChange, this.values, this.locals);
                if (lang_1.isPresent(change)) {
                    this._updateDirectiveOrElement(change, bindingRecord);
                    isChanged = true;
                    changes = this._addChange(bindingRecord, change, changes);
                }
            }
            if (proto.lastInDirective) {
                changes = null;
                if (isChanged && !bindingRecord.isDefaultChangeDetection()) {
                    this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
                }
                isChanged = false;
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._firstInBinding = function (r) {
        var prev = change_detection_util_1.ChangeDetectionUtil.protoByIndex(this._records, r.selfIndex - 1);
        return lang_1.isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
    };
    DynamicChangeDetector.prototype.afterContentLifecycleCallbacksInternal = function () {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterContentInit && this.state == constants_1.ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentInit();
            }
            if (dir.callAfterContentChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentChecked();
            }
        }
    };
    DynamicChangeDetector.prototype.afterViewLifecycleCallbacksInternal = function () {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterViewInit && this.state == constants_1.ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewInit();
            }
            if (dir.callAfterViewChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewChecked();
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._updateDirectiveOrElement = function (change, bindingRecord) {
        if (lang_1.isBlank(bindingRecord.directiveRecord)) {
            _super.prototype.notifyDispatcher.call(this, change.currentValue);
        }
        else {
            var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
            bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
        }
        if (this._genConfig.logBindingUpdate) {
            _super.prototype.logBindingUpdate.call(this, change.currentValue);
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._addChange = function (bindingRecord, change, changes) {
        if (bindingRecord.callOnChanges()) {
            return _super.prototype.addChange.call(this, changes, change.previousValue, change.currentValue);
        }
        else {
            return changes;
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._getDirectiveFor = function (directiveIndex) {
        return this.dispatcher.getDirectiveFor(directiveIndex);
    };
    /** @internal */
    DynamicChangeDetector.prototype._getDetectorFor = function (directiveIndex) {
        return this.dispatcher.getDetectorFor(directiveIndex);
    };
    /** @internal */
    DynamicChangeDetector.prototype._check = function (proto, throwOnChange, values, locals) {
        if (proto.isPipeRecord()) {
            return this._pipeCheck(proto, throwOnChange, values);
        }
        else {
            return this._referenceCheck(proto, throwOnChange, values, locals);
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._referenceCheck = function (proto, throwOnChange, values, locals) {
        if (this._pureFuncAndArgsDidNotChange(proto)) {
            this._setChanged(proto, false);
            return null;
        }
        var currValue = this._calculateCurrValue(proto, values, locals);
        if (proto.shouldBeChecked()) {
            var prevValue = this._readSelf(proto, values);
            var detectedChange = throwOnChange ?
                !change_detection_util_1.ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                change_detection_util_1.ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
            if (detectedChange) {
                if (proto.lastInBinding) {
                    var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                    if (throwOnChange)
                        this.throwOnChangeError(prevValue, currValue);
                    this._writeSelf(proto, currValue, values);
                    this._setChanged(proto, true);
                    return change;
                }
                else {
                    this._writeSelf(proto, currValue, values);
                    this._setChanged(proto, true);
                    return null;
                }
            }
            else {
                this._setChanged(proto, false);
                return null;
            }
        }
        else {
            this._writeSelf(proto, currValue, values);
            this._setChanged(proto, true);
            return null;
        }
    };
    DynamicChangeDetector.prototype._calculateCurrValue = function (proto, values, locals) {
        switch (proto.mode) {
            case proto_record_1.RecordType.Self:
                return this._readContext(proto, values);
            case proto_record_1.RecordType.Const:
                return proto.funcOrValue;
            case proto_record_1.RecordType.PropertyRead:
                var context = this._readContext(proto, values);
                return proto.funcOrValue(context);
            case proto_record_1.RecordType.SafeProperty:
                var context = this._readContext(proto, values);
                return lang_1.isBlank(context) ? null : proto.funcOrValue(context);
            case proto_record_1.RecordType.PropertyWrite:
                var context = this._readContext(proto, values);
                var value = this._readArgs(proto, values)[0];
                proto.funcOrValue(context, value);
                return value;
            case proto_record_1.RecordType.KeyedWrite:
                var context = this._readContext(proto, values);
                var key = this._readArgs(proto, values)[0];
                var value = this._readArgs(proto, values)[1];
                context[key] = value;
                return value;
            case proto_record_1.RecordType.Local:
                return locals.get(proto.name);
            case proto_record_1.RecordType.InvokeMethod:
                var context = this._readContext(proto, values);
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.SafeMethodInvoke:
                var context = this._readContext(proto, values);
                if (lang_1.isBlank(context)) {
                    return null;
                }
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.KeyedRead:
                var arg = this._readArgs(proto, values)[0];
                return this._readContext(proto, values)[arg];
            case proto_record_1.RecordType.Chain:
                var args = this._readArgs(proto, values);
                return args[args.length - 1];
            case proto_record_1.RecordType.InvokeClosure:
                return lang_1.FunctionWrapper.apply(this._readContext(proto, values), this._readArgs(proto, values));
            case proto_record_1.RecordType.Interpolate:
            case proto_record_1.RecordType.PrimitiveOp:
            case proto_record_1.RecordType.CollectionLiteral:
                return lang_1.FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));
            default:
                throw new exceptions_1.BaseException("Unknown operation " + proto.mode);
        }
    };
    DynamicChangeDetector.prototype._pipeCheck = function (proto, throwOnChange, values) {
        var context = this._readContext(proto, values);
        var selectedPipe = this._pipeFor(proto, context);
        if (!selectedPipe.pure || this._argsOrContextChanged(proto)) {
            var args = this._readArgs(proto, values);
            var currValue = selectedPipe.pipe.transform(context, args);
            if (proto.shouldBeChecked()) {
                var prevValue = this._readSelf(proto, values);
                var detectedChange = throwOnChange ?
                    !change_detection_util_1.ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                    change_detection_util_1.ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
                if (detectedChange) {
                    currValue = change_detection_util_1.ChangeDetectionUtil.unwrapValue(currValue);
                    if (proto.lastInBinding) {
                        var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                        if (throwOnChange)
                            this.throwOnChangeError(prevValue, currValue);
                        this._writeSelf(proto, currValue, values);
                        this._setChanged(proto, true);
                        return change;
                    }
                    else {
                        this._writeSelf(proto, currValue, values);
                        this._setChanged(proto, true);
                        return null;
                    }
                }
                else {
                    this._setChanged(proto, false);
                    return null;
                }
            }
            else {
                this._writeSelf(proto, currValue, values);
                this._setChanged(proto, true);
                return null;
            }
        }
    };
    DynamicChangeDetector.prototype._pipeFor = function (proto, context) {
        var storedPipe = this._readPipe(proto);
        if (lang_1.isPresent(storedPipe))
            return storedPipe;
        var pipe = this.pipes.get(proto.name);
        this._writePipe(proto, pipe);
        return pipe;
    };
    DynamicChangeDetector.prototype._readContext = function (proto, values) {
        if (proto.contextIndex == -1) {
            return this._getDirectiveFor(proto.directiveIndex);
        }
        return values[proto.contextIndex];
    };
    DynamicChangeDetector.prototype._readSelf = function (proto, values) { return values[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writeSelf = function (proto, value, values) { values[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._readPipe = function (proto) { return this.localPipes[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writePipe = function (proto, value) { this.localPipes[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._setChanged = function (proto, value) {
        if (proto.argumentToPureFunction)
            this.changes[proto.selfIndex] = value;
    };
    DynamicChangeDetector.prototype._pureFuncAndArgsDidNotChange = function (proto) {
        return proto.isPureFunction() && !this._argsChanged(proto);
    };
    DynamicChangeDetector.prototype._argsChanged = function (proto) {
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            if (this.changes[args[i]]) {
                return true;
            }
        }
        return false;
    };
    DynamicChangeDetector.prototype._argsOrContextChanged = function (proto) {
        return this._argsChanged(proto) || this.changes[proto.contextIndex];
    };
    DynamicChangeDetector.prototype._readArgs = function (proto, values) {
        var res = collection_1.ListWrapper.createFixedSize(proto.args.length);
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            res[i] = values[args[i]];
        }
        return res;
    };
    return DynamicChangeDetector;
})(abstract_change_detector_1.AbstractChangeDetector);
exports.DynamicChangeDetector = DynamicChangeDetector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY19jaGFuZ2VfZGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVB2T3VSanZ4LnRtcC9hbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2R5bmFtaWNfY2hhbmdlX2RldGVjdG9yLnRzIl0sIm5hbWVzIjpbIkR5bmFtaWNDaGFuZ2VEZXRlY3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jb25zdHJ1Y3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5oYW5kbGVFdmVudEludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9wcm9jZXNzRXZlbnRCaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jb21wdXRlU2tpcExlbmd0aCIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWFya1BhdGhBc0NoZWNrT25jZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jcmVhdGVFdmVudEhhbmRsZXIiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuZGVoeWRyYXRlRGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZGVzdHJveVBpcGVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9kZXN0cm95RGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2ZpcnN0SW5CaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl91cGRhdGVEaXJlY3RpdmVPckVsZW1lbnQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FkZENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZ2V0RGlyZWN0aXZlRm9yIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9nZXREZXRlY3RvckZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fY2hlY2siLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlZmVyZW5jZUNoZWNrIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jYWxjdWxhdGVDdXJyVmFsdWUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3BpcGVDaGVjayIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcGlwZUZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcmVhZENvbnRleHQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRTZWxmIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVNlbGYiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRQaXBlIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVBpcGUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3NldENoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fYXJnc0NoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FyZ3NPckNvbnRleHRDaGFuZ2VkIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9yZWFkQXJncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBaUUsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RiwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCwyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUV6Rix5Q0FBcUMs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U0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3BFQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTs0QkFBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxTQUFTQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTt3QkFFakVBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO3dCQUMxQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBRTlCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtvQkFFaEJBLENBQUNBO29CQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7d0JBQzFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDOUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO29CQUNkQSxDQUFDQTtnQkFDSEEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNOQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtvQkFDL0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO2dCQUNkQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDOUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQ2RBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNB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Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNkQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNmQSxDQUFDQTtJQUVPakMscURBQXFCQSxHQUE3QkEsVUFBOEJBLEtBQWtCQTtRQUM5Q2tDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVPbEMseUNBQVNBLEdBQWpCQSxVQUFrQkEsS0FBa0JBLEVBQUVBLE1BQWFBO1FBQ2pEbUMsSUFBSUEsR0FBR0EsR0FBR0Esd0JBQVdBLENBQUNBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3pEQSxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUN0QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDckNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUNIbkMsNEJBQUNBO0FBQURBLENBQUNBLEFBemRELEVBQTJDLGlEQUFzQixFQXlkaEU7QUF6ZFksNkJBQXFCLHdCQXlkakMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBGdW5jdGlvbldyYXBwZXIsIFN0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0Fic3RyYWN0Q2hhbmdlRGV0ZWN0b3J9IGZyb20gJy4vYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yJztcbmltcG9ydCB7RXZlbnRCaW5kaW5nfSBmcm9tICcuL2V2ZW50X2JpbmRpbmcnO1xuaW1wb3J0IHtCaW5kaW5nUmVjb3JkLCBCaW5kaW5nVGFyZ2V0fSBmcm9tICcuL2JpbmRpbmdfcmVjb3JkJztcbmltcG9ydCB7RGlyZWN0aXZlUmVjb3JkLCBEaXJlY3RpdmVJbmRleH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVjb3JkJztcbmltcG9ydCB7TG9jYWxzfSBmcm9tICcuL3BhcnNlci9sb2NhbHMnO1xuaW1wb3J0IHtDaGFuZ2VEaXNwYXRjaGVyLCBDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZ30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uVXRpbCwgU2ltcGxlQ2hhbmdlfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDaGFuZ2VEZXRlY3RvclN0YXRlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1Byb3RvUmVjb3JkLCBSZWNvcmRUeXBlfSBmcm9tICcuL3Byb3RvX3JlY29yZCc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgY2xhc3MgRHluYW1pY0NoYW5nZURldGVjdG9yIGV4dGVuZHMgQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvcjxhbnk+IHtcbiAgdmFsdWVzOiBhbnlbXTtcbiAgY2hhbmdlczogYW55W107XG4gIGxvY2FsUGlwZXM6IGFueVtdO1xuICBwcmV2Q29udGV4dHM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgaWQ6IHN0cmluZywgbnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkczogbnVtYmVyLCBwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzOiBCaW5kaW5nVGFyZ2V0W10sXG4gICAgICBkaXJlY3RpdmVJbmRpY2VzOiBEaXJlY3RpdmVJbmRleFtdLCBzdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICBwcml2YXRlIF9yZWNvcmRzOiBQcm90b1JlY29yZFtdLCBwcml2YXRlIF9ldmVudEJpbmRpbmdzOiBFdmVudEJpbmRpbmdbXSxcbiAgICAgIHByaXZhdGUgX2RpcmVjdGl2ZVJlY29yZHM6IERpcmVjdGl2ZVJlY29yZFtdLCBwcml2YXRlIF9nZW5Db25maWc6IENoYW5nZURldGVjdG9yR2VuQ29uZmlnKSB7XG4gICAgc3VwZXIoaWQsIG51bWJlck9mUHJvcGVydHlQcm90b1JlY29yZHMsIHByb3BlcnR5QmluZGluZ1RhcmdldHMsIGRpcmVjdGl2ZUluZGljZXMsIHN0cmF0ZWd5KTtcbiAgICB2YXIgbGVuID0gX3JlY29yZHMubGVuZ3RoICsgMTtcbiAgICB0aGlzLnZhbHVlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMubG9jYWxQaXBlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMucHJldkNvbnRleHRzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5jaGFuZ2VzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG5cbiAgICB0aGlzLmRlaHlkcmF0ZURpcmVjdGl2ZXMoZmFsc2UpO1xuICB9XG5cbiAgaGFuZGxlRXZlbnRJbnRlcm5hbChldmVudE5hbWU6IHN0cmluZywgZWxJbmRleDogbnVtYmVyLCBsb2NhbHM6IExvY2Fscyk6IGJvb2xlYW4ge1xuICAgIHZhciBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzKGV2ZW50TmFtZSwgZWxJbmRleCkuZm9yRWFjaChyZWMgPT4ge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3Byb2Nlc3NFdmVudEJpbmRpbmcocmVjLCBsb2NhbHMpO1xuICAgICAgaWYgKHJlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJvY2Vzc0V2ZW50QmluZGluZyhlYjogRXZlbnRCaW5kaW5nLCBsb2NhbHM6IExvY2Fscyk6IGFueSB7XG4gICAgdmFyIHZhbHVlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShlYi5yZWNvcmRzLmxlbmd0aCk7XG4gICAgdmFsdWVzWzBdID0gdGhpcy52YWx1ZXNbMF07XG5cbiAgICBmb3IgKHZhciBwcm90b0lkeCA9IDA7IHByb3RvSWR4IDwgZWIucmVjb3Jkcy5sZW5ndGg7ICsrcHJvdG9JZHgpIHtcbiAgICAgIHZhciBwcm90byA9IGViLnJlY29yZHNbcHJvdG9JZHhdO1xuXG4gICAgICBpZiAocHJvdG8uaXNTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgcHJvdG9JZHggKz0gdGhpcy5fY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JZHgsIHByb3RvLCB2YWx1ZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHByb3RvLmxhc3RJbkJpbmRpbmcpIHtcbiAgICAgICAgICB0aGlzLl9tYXJrUGF0aEFzQ2hlY2tPbmNlKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fY2FsY3VsYXRlQ3VyclZhbHVlKHByb3RvLCB2YWx1ZXMsIGxvY2Fscyk7XG4gICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIHJlcywgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgYmUgcmVhY2hlZCcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JbmRleDogbnVtYmVyLCBwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pOiBudW1iZXIge1xuICAgIGlmIChwcm90by5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzKSB7XG4gICAgICByZXR1cm4gcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDE7XG4gICAgfVxuXG4gICAgaWYgKHByb3RvLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHNJZikge1xuICAgICAgbGV0IGNvbmRpdGlvbiA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgcmV0dXJuIGNvbmRpdGlvbiA/IHByb3RvLmZpeGVkQXJnc1swXSAtIHByb3RvSW5kZXggLSAxIDogMDtcbiAgICB9XG5cbiAgICBpZiAocHJvdG8ubW9kZSA9PT0gUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmTm90KSB7XG4gICAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICByZXR1cm4gY29uZGl0aW9uID8gMCA6IHByb3RvLmZpeGVkQXJnc1swXSAtIHByb3RvSW5kZXggLSAxO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDYW5ub3QgYmUgcmVhY2hlZCcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWFya1BhdGhBc0NoZWNrT25jZShwcm90bzogUHJvdG9SZWNvcmQpOiB2b2lkIHtcbiAgICBpZiAoIXByb3RvLmJpbmRpbmdSZWNvcmQuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgIHZhciBkaXIgPSBwcm90by5iaW5kaW5nUmVjb3JkLmRpcmVjdGl2ZVJlY29yZDtcbiAgICAgIHRoaXMuX2dldERldGVjdG9yRm9yKGRpci5kaXJlY3RpdmVJbmRleCkubWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hdGNoaW5nRXZlbnRCaW5kaW5ncyhldmVudE5hbWU6IHN0cmluZywgZWxJbmRleDogbnVtYmVyKTogRXZlbnRCaW5kaW5nW10ge1xuICAgIHJldHVybiB0aGlzLl9ldmVudEJpbmRpbmdzLmZpbHRlcihlYiA9PiBlYi5ldmVudE5hbWUgPT0gZXZlbnROYW1lICYmIGViLmVsSW5kZXggPT09IGVsSW5kZXgpO1xuICB9XG5cbiAgaHlkcmF0ZURpcmVjdGl2ZXMoZGlzcGF0Y2hlcjogQ2hhbmdlRGlzcGF0Y2hlcik6IHZvaWQge1xuICAgIHRoaXMudmFsdWVzWzBdID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICB0aGlzLm91dHB1dFN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciByID0gdGhpcy5fZGlyZWN0aXZlUmVjb3Jkc1tpXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoci5vdXRwdXRzKSkge1xuICAgICAgICByLm91dHB1dHMuZm9yRWFjaChvdXRwdXQgPT4ge1xuICAgICAgICAgIHZhciBldmVudEhhbmRsZXIgPVxuICAgICAgICAgICAgICA8YW55PnRoaXMuX2NyZWF0ZUV2ZW50SGFuZGxlcihyLmRpcmVjdGl2ZUluZGV4LmVsZW1lbnRJbmRleCwgb3V0cHV0WzFdKTtcbiAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKHIuZGlyZWN0aXZlSW5kZXgpO1xuICAgICAgICAgIHZhciBnZXR0ZXIgPSByZWZsZWN0b3IuZ2V0dGVyKG91dHB1dFswXSk7XG4gICAgICAgICAgdGhpcy5vdXRwdXRTdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShnZXR0ZXIoZGlyZWN0aXZlKSwgZXZlbnRIYW5kbGVyKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUV2ZW50SGFuZGxlcihib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZyk6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gKGV2ZW50KSA9PiB0aGlzLmhhbmRsZUV2ZW50KGV2ZW50TmFtZSwgYm91bmRFbGVtZW50SW5kZXgsIGV2ZW50KTtcbiAgfVxuXG5cbiAgZGVoeWRyYXRlRGlyZWN0aXZlcyhkZXN0cm95UGlwZXM6IGJvb2xlYW4pIHtcbiAgICBpZiAoZGVzdHJveVBpcGVzKSB7XG4gICAgICB0aGlzLl9kZXN0cm95UGlwZXMoKTtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lEaXJlY3RpdmVzKCk7XG4gICAgfVxuICAgIHRoaXMudmFsdWVzWzBdID0gbnVsbDtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMudmFsdWVzLCBDaGFuZ2VEZXRlY3Rpb25VdGlsLnVuaW5pdGlhbGl6ZWQsIDEpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5jaGFuZ2VzLCBmYWxzZSk7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLmxvY2FsUGlwZXMsIG51bGwpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5wcmV2Q29udGV4dHMsIENoYW5nZURldGVjdGlvblV0aWwudW5pbml0aWFsaXplZCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXN0cm95UGlwZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxvY2FsUGlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5sb2NhbFBpcGVzW2ldKSkge1xuICAgICAgICBDaGFuZ2VEZXRlY3Rpb25VdGlsLmNhbGxQaXBlT25EZXN0cm95KHRoaXMubG9jYWxQaXBlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVzdHJveURpcmVjdGl2ZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcmVjb3JkID0gdGhpcy5fZGlyZWN0aXZlUmVjb3Jkc1tpXTtcbiAgICAgIGlmIChyZWNvcmQuY2FsbE9uRGVzdHJveSkge1xuICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IocmVjb3JkLmRpcmVjdGl2ZUluZGV4KS5uZ09uRGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLnJ1bkRldGVjdENoYW5nZXModHJ1ZSk7IH1cblxuICBkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwodGhyb3dPbkNoYW5nZTogYm9vbGVhbikge1xuICAgIHZhciBwcm90b3MgPSB0aGlzLl9yZWNvcmRzO1xuXG4gICAgdmFyIGNoYW5nZXMgPSBudWxsO1xuICAgIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBwcm90b0lkeCA9IDA7IHByb3RvSWR4IDwgcHJvdG9zLmxlbmd0aDsgKytwcm90b0lkeCkge1xuICAgICAgdmFyIHByb3RvOiBQcm90b1JlY29yZCA9IHByb3Rvc1twcm90b0lkeF07XG4gICAgICB2YXIgYmluZGluZ1JlY29yZCA9IHByb3RvLmJpbmRpbmdSZWNvcmQ7XG4gICAgICB2YXIgZGlyZWN0aXZlUmVjb3JkID0gYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQ7XG5cbiAgICAgIGlmICh0aGlzLl9maXJzdEluQmluZGluZyhwcm90bykpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eUJpbmRpbmdJbmRleCA9IHByb3RvLnByb3BlcnR5QmluZGluZ0luZGV4O1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvdG8uaXNMaWZlQ3ljbGVSZWNvcmQoKSkge1xuICAgICAgICBpZiAocHJvdG8ubmFtZSA9PT0gJ0RvQ2hlY2snICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdEb0NoZWNrKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBwcm90by5uYW1lID09PSAnT25Jbml0JyAmJiAhdGhyb3dPbkNoYW5nZSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9PSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZCkge1xuICAgICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm5nT25Jbml0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdG8ubmFtZSA9PT0gJ09uQ2hhbmdlcycgJiYgaXNQcmVzZW50KGNoYW5nZXMpICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJvdG8uaXNTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgcHJvdG9JZHggKz0gdGhpcy5fY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JZHgsIHByb3RvLCB0aGlzLnZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY2hhbmdlID0gdGhpcy5fY2hlY2socHJvdG8sIHRocm93T25DaGFuZ2UsIHRoaXMudmFsdWVzLCB0aGlzLmxvY2Fscyk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlKSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChjaGFuZ2UsIGJpbmRpbmdSZWNvcmQpO1xuICAgICAgICAgIGlzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX2FkZENoYW5nZShiaW5kaW5nUmVjb3JkLCBjaGFuZ2UsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm90by5sYXN0SW5EaXJlY3RpdmUpIHtcbiAgICAgICAgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmIChpc0NoYW5nZWQgJiYgIWJpbmRpbmdSZWNvcmQuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgICAgICB0aGlzLl9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm1hcmtBc0NoZWNrT25jZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmlyc3RJbkJpbmRpbmcocjogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICB2YXIgcHJldiA9IENoYW5nZURldGVjdGlvblV0aWwucHJvdG9CeUluZGV4KHRoaXMuX3JlY29yZHMsIHIuc2VsZkluZGV4IC0gMSk7XG4gICAgcmV0dXJuIGlzQmxhbmsocHJldikgfHwgcHJldi5iaW5kaW5nUmVjb3JkICE9PSByLmJpbmRpbmdSZWNvcmQ7XG4gIH1cblxuICBhZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpIHtcbiAgICB2YXIgZGlycyA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHM7XG4gICAgZm9yICh2YXIgaSA9IGRpcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBkaXIgPSBkaXJzW2ldO1xuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJDb250ZW50SW5pdCAmJiB0aGlzLnN0YXRlID09IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyLmNhbGxBZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCkge1xuICAgIHZhciBkaXJzID0gdGhpcy5fZGlyZWN0aXZlUmVjb3JkcztcbiAgICBmb3IgKHZhciBpID0gZGlycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGRpciA9IGRpcnNbaV07XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdJbml0ICYmIHRoaXMuc3RhdGUgPT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpci5kaXJlY3RpdmVJbmRleCkubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICB9XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRGlyZWN0aXZlT3JFbGVtZW50KGNoYW5nZSwgYmluZGluZ1JlY29yZCkge1xuICAgIGlmIChpc0JsYW5rKGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkKSkge1xuICAgICAgc3VwZXIubm90aWZ5RGlzcGF0Y2hlcihjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluZGV4ID0gYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXg7XG4gICAgICBiaW5kaW5nUmVjb3JkLnNldHRlcih0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZ2VuQ29uZmlnLmxvZ0JpbmRpbmdVcGRhdGUpIHtcbiAgICAgIHN1cGVyLmxvZ0JpbmRpbmdVcGRhdGUoY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9hZGRDaGFuZ2UoYmluZGluZ1JlY29yZDogQmluZGluZ1JlY29yZCwgY2hhbmdlLCBjaGFuZ2VzKSB7XG4gICAgaWYgKGJpbmRpbmdSZWNvcmQuY2FsbE9uQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4gc3VwZXIuYWRkQ2hhbmdlKGNoYW5nZXMsIGNoYW5nZS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNoYW5nZXM7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXg6IERpcmVjdGl2ZUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVJbmRleDogRGlyZWN0aXZlSW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLmdldERldGVjdG9yRm9yKGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hlY2socHJvdG86IFByb3RvUmVjb3JkLCB0aHJvd09uQ2hhbmdlOiBib29sZWFuLCB2YWx1ZXM6IGFueVtdLCBsb2NhbHM6IExvY2Fscyk6XG4gICAgICBTaW1wbGVDaGFuZ2Uge1xuICAgIGlmIChwcm90by5pc1BpcGVSZWNvcmQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BpcGVDaGVjayhwcm90bywgdGhyb3dPbkNoYW5nZSwgdmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZUNoZWNrKHByb3RvLCB0aHJvd09uQ2hhbmdlLCB2YWx1ZXMsIGxvY2Fscyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yZWZlcmVuY2VDaGVjayhcbiAgICAgIHByb3RvOiBQcm90b1JlY29yZCwgdGhyb3dPbkNoYW5nZTogYm9vbGVhbiwgdmFsdWVzOiBhbnlbXSwgbG9jYWxzOiBMb2NhbHMpIHtcbiAgICBpZiAodGhpcy5fcHVyZUZ1bmNBbmRBcmdzRGlkTm90Q2hhbmdlKHByb3RvKSkge1xuICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGN1cnJWYWx1ZSA9IHRoaXMuX2NhbGN1bGF0ZUN1cnJWYWx1ZShwcm90bywgdmFsdWVzLCBsb2NhbHMpO1xuXG4gICAgaWYgKHByb3RvLnNob3VsZEJlQ2hlY2tlZCgpKSB7XG4gICAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fcmVhZFNlbGYocHJvdG8sIHZhbHVlcyk7XG4gICAgICB2YXIgZGV0ZWN0ZWRDaGFuZ2UgPSB0aHJvd09uQ2hhbmdlID9cbiAgICAgICAgICAhQ2hhbmdlRGV0ZWN0aW9uVXRpbC5kZXZNb2RlRXF1YWwocHJldlZhbHVlLCBjdXJyVmFsdWUpIDpcbiAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25VdGlsLmxvb3NlTm90SWRlbnRpY2FsKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgIGlmIChkZXRlY3RlZENoYW5nZSkge1xuICAgICAgICBpZiAocHJvdG8ubGFzdEluQmluZGluZykge1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSBDaGFuZ2VEZXRlY3Rpb25VdGlsLnNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICAgICAgaWYgKHRocm93T25DaGFuZ2UpIHRoaXMudGhyb3dPbkNoYW5nZUVycm9yKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcblxuICAgICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgICAgIHJldHVybiBjaGFuZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NhbGN1bGF0ZUN1cnJWYWx1ZShwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10sIGxvY2FsczogTG9jYWxzKSB7XG4gICAgc3dpdGNoIChwcm90by5tb2RlKSB7XG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2VsZjpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuQ29uc3Q6XG4gICAgICAgIHJldHVybiBwcm90by5mdW5jT3JWYWx1ZTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlByb3BlcnR5UmVhZDpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2FmZVByb3BlcnR5OlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gaXNCbGFuayhjb250ZXh0KSA/IG51bGwgOiBwcm90by5mdW5jT3JWYWx1ZShjb250ZXh0KTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlByb3BlcnR5V3JpdGU6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpWzBdO1xuICAgICAgICBwcm90by5mdW5jT3JWYWx1ZShjb250ZXh0LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLktleWVkV3JpdGU6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVswXTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcylbMV07XG4gICAgICAgIGNvbnRleHRba2V5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Mb2NhbDpcbiAgICAgICAgcmV0dXJuIGxvY2Fscy5nZXQocHJvdG8ubmFtZSk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5JbnZva2VNZXRob2Q6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHZhciBhcmdzID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBwcm90by5mdW5jT3JWYWx1ZShjb250ZXh0LCBhcmdzKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlNhZmVNZXRob2RJbnZva2U6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIGlmIChpc0JsYW5rKGNvbnRleHQpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQsIGFyZ3MpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuS2V5ZWRSZWFkOlxuICAgICAgICB2YXIgYXJnID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcylbMF07XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKVthcmddO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuQ2hhaW46XG4gICAgICAgIHZhciBhcmdzID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5JbnZva2VDbG9zdXJlOlxuICAgICAgICByZXR1cm4gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KFxuICAgICAgICAgICAgdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyksIHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludGVycG9sYXRlOlxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlByaW1pdGl2ZU9wOlxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkNvbGxlY3Rpb25MaXRlcmFsOlxuICAgICAgICByZXR1cm4gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KHByb3RvLmZ1bmNPclZhbHVlLCB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmtub3duIG9wZXJhdGlvbiAke3Byb3RvLm1vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGlwZUNoZWNrKHByb3RvOiBQcm90b1JlY29yZCwgdGhyb3dPbkNoYW5nZTogYm9vbGVhbiwgdmFsdWVzOiBhbnlbXSkge1xuICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgdmFyIHNlbGVjdGVkUGlwZSA9IHRoaXMuX3BpcGVGb3IocHJvdG8sIGNvbnRleHQpO1xuICAgIGlmICghc2VsZWN0ZWRQaXBlLnB1cmUgfHwgdGhpcy5fYXJnc09yQ29udGV4dENoYW5nZWQocHJvdG8pKSB7XG4gICAgICB2YXIgYXJncyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgdmFyIGN1cnJWYWx1ZSA9IHNlbGVjdGVkUGlwZS5waXBlLnRyYW5zZm9ybShjb250ZXh0LCBhcmdzKTtcblxuICAgICAgaWYgKHByb3RvLnNob3VsZEJlQ2hlY2tlZCgpKSB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLl9yZWFkU2VsZihwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIGRldGVjdGVkQ2hhbmdlID0gdGhyb3dPbkNoYW5nZSA/XG4gICAgICAgICAgICAhQ2hhbmdlRGV0ZWN0aW9uVXRpbC5kZXZNb2RlRXF1YWwocHJldlZhbHVlLCBjdXJyVmFsdWUpIDpcbiAgICAgICAgICAgIENoYW5nZURldGVjdGlvblV0aWwubG9vc2VOb3RJZGVudGljYWwocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICBpZiAoZGV0ZWN0ZWRDaGFuZ2UpIHtcbiAgICAgICAgICBjdXJyVmFsdWUgPSBDaGFuZ2VEZXRlY3Rpb25VdGlsLnVud3JhcFZhbHVlKGN1cnJWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocHJvdG8ubGFzdEluQmluZGluZykge1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IENoYW5nZURldGVjdGlvblV0aWwuc2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgIGlmICh0aHJvd09uQ2hhbmdlKSB0aGlzLnRocm93T25DaGFuZ2VFcnJvcihwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2U7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCBmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGlwZUZvcihwcm90bzogUHJvdG9SZWNvcmQsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RvcmVkUGlwZSA9IHRoaXMuX3JlYWRQaXBlKHByb3RvKTtcbiAgICBpZiAoaXNQcmVzZW50KHN0b3JlZFBpcGUpKSByZXR1cm4gc3RvcmVkUGlwZTtcblxuICAgIHZhciBwaXBlID0gdGhpcy5waXBlcy5nZXQocHJvdG8ubmFtZSk7XG4gICAgdGhpcy5fd3JpdGVQaXBlKHByb3RvLCBwaXBlKTtcbiAgICByZXR1cm4gcGlwZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYWRDb250ZXh0KHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSkge1xuICAgIGlmIChwcm90by5jb250ZXh0SW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXREaXJlY3RpdmVGb3IocHJvdG8uZGlyZWN0aXZlSW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzW3Byb3RvLmNvbnRleHRJbmRleF07XG4gIH1cblxuICBwcml2YXRlIF9yZWFkU2VsZihwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pIHsgcmV0dXJuIHZhbHVlc1twcm90by5zZWxmSW5kZXhdOyB9XG5cbiAgcHJpdmF0ZSBfd3JpdGVTZWxmKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWUsIHZhbHVlczogYW55W10pIHsgdmFsdWVzW3Byb3RvLnNlbGZJbmRleF0gPSB2YWx1ZTsgfVxuXG4gIHByaXZhdGUgX3JlYWRQaXBlKHByb3RvOiBQcm90b1JlY29yZCkgeyByZXR1cm4gdGhpcy5sb2NhbFBpcGVzW3Byb3RvLnNlbGZJbmRleF07IH1cblxuICBwcml2YXRlIF93cml0ZVBpcGUocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZSkgeyB0aGlzLmxvY2FsUGlwZXNbcHJvdG8uc2VsZkluZGV4XSA9IHZhbHVlOyB9XG5cbiAgcHJpdmF0ZSBfc2V0Q2hhbmdlZChwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHByb3RvLmFyZ3VtZW50VG9QdXJlRnVuY3Rpb24pIHRoaXMuY2hhbmdlc1twcm90by5zZWxmSW5kZXhdID0gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9wdXJlRnVuY0FuZEFyZ3NEaWROb3RDaGFuZ2UocHJvdG86IFByb3RvUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHByb3RvLmlzUHVyZUZ1bmN0aW9uKCkgJiYgIXRoaXMuX2FyZ3NDaGFuZ2VkKHByb3RvKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FyZ3NDaGFuZ2VkKHByb3RvOiBQcm90b1JlY29yZCk6IGJvb2xlYW4ge1xuICAgIHZhciBhcmdzID0gcHJvdG8uYXJncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh0aGlzLmNoYW5nZXNbYXJnc1tpXV0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2FyZ3NPckNvbnRleHRDaGFuZ2VkKHByb3RvOiBQcm90b1JlY29yZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hcmdzQ2hhbmdlZChwcm90bykgfHwgdGhpcy5jaGFuZ2VzW3Byb3RvLmNvbnRleHRJbmRleF07XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQXJncyhwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pIHtcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHByb3RvLmFyZ3MubGVuZ3RoKTtcbiAgICB2YXIgYXJncyA9IHByb3RvLmFyZ3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICByZXNbaV0gPSB2YWx1ZXNbYXJnc1tpXV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cbiJdfQ==