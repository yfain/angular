'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (collection_1.ListWrapper.contains(res, keys[i])) {
            res.push(keys[i]);
            return res;
        }
        else {
            res.push(keys[i]);
        }
    }
    return res;
}
function constructResolvingPath(keys) {
    if (keys.length > 1) {
        var reversed = findFirstClosedCycle(collection_1.ListWrapper.reversed(keys));
        var tokenStrs = reversed.map(function (k) { return lang_1.stringify(k.token); });
        return ' (' + tokenStrs.join(' -> ') + ')';
    }
    else {
        return '';
    }
}
/**
 * Base class for all errors arising from misconfigured providers.
 */
var AbstractProviderError = (function (_super) {
    __extends(AbstractProviderError, _super);
    function AbstractProviderError(injector, key, constructResolvingMessage) {
        _super.call(this, 'DI Exception');
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    AbstractProviderError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    };
    Object.defineProperty(AbstractProviderError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return AbstractProviderError;
})(exceptions_1.BaseException);
exports.AbstractProviderError = AbstractProviderError;
/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Provider} for {@link Key}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b:B) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 */
var NoProviderError = (function (_super) {
    __extends(NoProviderError, _super);
    function NoProviderError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            var first = lang_1.stringify(collection_1.ListWrapper.first(keys).token);
            return "No provider for " + first + "!" + constructResolvingPath(keys);
        });
    }
    return NoProviderError;
})(AbstractProviderError);
exports.NoProviderError = NoProviderError;
/**
 * Thrown when dependencies form a cycle.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
 *
 * ```typescript
 * var injector = Injector.resolveAndCreate([
 *   provide("one", {useFactory: (two) => "two", deps: [[new Inject("two")]]}),
 *   provide("two", {useFactory: (one) => "one", deps: [[new Inject("one")]]})
 * ]);
 *
 * expect(() => injector.get("one")).toThrowError();
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
var CyclicDependencyError = (function (_super) {
    __extends(CyclicDependencyError, _super);
    function CyclicDependencyError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
        });
    }
    return CyclicDependencyError;
})(AbstractProviderError);
exports.CyclicDependencyError = CyclicDependencyError;
/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor() {
 *     throw new Error('message');
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([A]);

 * try {
 *   injector.get(A);
 * } catch (e) {
 *   expect(e instanceof InstantiationError).toBe(true);
 *   expect(e.originalException.message).toEqual("message");
 *   expect(e.originalStack).toBeDefined();
 * }
 * ```
 */
var InstantiationError = (function (_super) {
    __extends(InstantiationError, _super);
    function InstantiationError(injector, originalException, originalStack, key) {
        _super.call(this, 'DI Exception', originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
    }
    InstantiationError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
    };
    Object.defineProperty(InstantiationError.prototype, "wrapperMessage", {
        get: function () {
            var first = lang_1.stringify(collection_1.ListWrapper.first(this.keys).token);
            return "Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "causeKey", {
        get: function () { return this.keys[0]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return InstantiationError;
})(exceptions_1.WrappedException);
exports.InstantiationError = InstantiationError;
/**
 * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
 * creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
 * ```
 */
var InvalidProviderError = (function (_super) {
    __extends(InvalidProviderError, _super);
    function InvalidProviderError(provider) {
        _super.call(this, 'Invalid provider - only instances of Provider and Type are allowed, got: ' +
            provider.toString());
    }
    return InvalidProviderError;
})(exceptions_1.BaseException);
exports.InvalidProviderError = InvalidProviderError;
/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 *
 * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 *
 * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
 *
 * ```typescript
 * class B {}
 *
 * class A {
 *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
 * }
 *
 * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
 * ```
 */
var NoAnnotationError = (function (_super) {
    __extends(NoAnnotationError, _super);
    function NoAnnotationError(typeOrFunc, params) {
        _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
    }
    NoAnnotationError._genMessage = function (typeOrFunc, params) {
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (lang_1.isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(parameter.map(lang_1.stringify).join(' '));
            }
        }
        return 'Cannot resolve all parameters for \'' + lang_1.stringify(typeOrFunc) + '\'(' +
            signature.join(', ') + '). ' +
            'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' +
            lang_1.stringify(typeOrFunc) + '\' is decorated with Injectable.';
    };
    return NoAnnotationError;
})(exceptions_1.BaseException);
exports.NoAnnotationError = NoAnnotationError;
/**
 * Thrown when getting an object by index.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class A {}
 *
 * var injector = Injector.resolveAndCreate([A]);
 *
 * expect(() => injector.getAt(100)).toThrowError();
 * ```
 */
var OutOfBoundsError = (function (_super) {
    __extends(OutOfBoundsError, _super);
    function OutOfBoundsError(index) {
        _super.call(this, "Index " + index + " is out-of-bounds.");
    }
    return OutOfBoundsError;
})(exceptions_1.BaseException);
exports.OutOfBoundsError = OutOfBoundsError;
// TODO: add a working example after alpha38 is released
/**
 * Thrown when a multi provider and a regular provider are bound to the same token.
 *
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate([
 *   new Provider("Strings", {useValue: "string1", multi: true}),
 *   new Provider("Strings", {useValue: "string2", multi: false})
 * ])).toThrowError();
 * ```
 */
var MixingMultiProvidersWithRegularProvidersError = (function (_super) {
    __extends(MixingMultiProvidersWithRegularProvidersError, _super);
    function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
        _super.call(this, 'Cannot mix multi providers and regular providers, got: ' + provider1.toString() + ' ' +
            provider2.toString());
    }
    return MixingMultiProvidersWithRegularProvidersError;
})(exceptions_1.BaseException);
exports.MixingMultiProvidersWithRegularProvidersError = MixingMultiProvidersWithRegularProvidersError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2V4Y2VwdGlvbnMudHMiXSwibmFtZXMiOlsiZmluZEZpcnN0Q2xvc2VkQ3ljbGUiLCJjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoIiwiQWJzdHJhY3RQcm92aWRlckVycm9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmFkZEtleSIsIkFic3RyYWN0UHJvdmlkZXJFcnJvci5jb250ZXh0IiwiTm9Qcm92aWRlckVycm9yIiwiTm9Qcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmFkZEtleSIsIkluc3RhbnRpYXRpb25FcnJvci53cmFwcGVyTWVzc2FnZSIsIkluc3RhbnRpYXRpb25FcnJvci5jYXVzZUtleSIsIkluc3RhbnRpYXRpb25FcnJvci5jb250ZXh0IiwiSW52YWxpZFByb3ZpZGVyRXJyb3IiLCJJbnZhbGlkUHJvdmlkZXJFcnJvci5jb25zdHJ1Y3RvciIsIk5vQW5ub3RhdGlvbkVycm9yIiwiTm9Bbm5vdGF0aW9uRXJyb3IuY29uc3RydWN0b3IiLCJOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSIsIk91dE9mQm91bmRzRXJyb3IiLCJPdXRPZkJvdW5kc0Vycm9yLmNvbnN0cnVjdG9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9y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LFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUNIRCxvREFBQ0E7QUFBREEsQ0FBQ0EsQUFORCxFQUFtRSwwQkFBYSxFQU0vRTtBQU5ZLHFEQUE2QyxnREFNekQsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3N0cmluZ2lmeSwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7S2V5fSBmcm9tICcuL2tleSc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuL2luamVjdG9yJztcblxuZnVuY3Rpb24gZmluZEZpcnN0Q2xvc2VkQ3ljbGUoa2V5czogYW55W10pOiBhbnlbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKExpc3RXcmFwcGVyLmNvbnRhaW5zKHJlcywga2V5c1tpXSkpIHtcbiAgICAgIHJlcy5wdXNoKGtleXNbaV0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzLnB1c2goa2V5c1tpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5czogYW55W10pOiBzdHJpbmcge1xuICBpZiAoa2V5cy5sZW5ndGggPiAxKSB7XG4gICAgdmFyIHJldmVyc2VkID0gZmluZEZpcnN0Q2xvc2VkQ3ljbGUoTGlzdFdyYXBwZXIucmV2ZXJzZWQoa2V5cykpO1xuICAgIHZhciB0b2tlblN0cnMgPSByZXZlcnNlZC5tYXAoayA9PiBzdHJpbmdpZnkoay50b2tlbikpO1xuICAgIHJldHVybiAnICgnICsgdG9rZW5TdHJzLmpvaW4oJyAtPiAnKSArICcpJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBlcnJvcnMgYXJpc2luZyBmcm9tIG1pc2NvbmZpZ3VyZWQgcHJvdmlkZXJzLlxuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RQcm92aWRlckVycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAga2V5czogS2V5W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBpbmplY3RvcnM6IEluamVjdG9yW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5LCBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlOiBGdW5jdGlvbikge1xuICAgIHN1cGVyKCdESSBFeGNlcHRpb24nKTtcbiAgICB0aGlzLmtleXMgPSBba2V5XTtcbiAgICB0aGlzLmluamVjdG9ycyA9IFtpbmplY3Rvcl07XG4gICAgdGhpcy5jb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlID0gY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZTtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UodGhpcy5rZXlzKTtcbiAgfVxuXG4gIGFkZEtleShpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KTogdm9pZCB7XG4gICAgdGhpcy5pbmplY3RvcnMucHVzaChpbmplY3Rvcik7XG4gICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UodGhpcy5rZXlzKTtcbiAgfVxuXG4gIGdldCBjb250ZXh0KCkgeyByZXR1cm4gdGhpcy5pbmplY3RvcnNbdGhpcy5pbmplY3RvcnMubGVuZ3RoIC0gMV0uZGVidWdDb250ZXh0KCk7IH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0cnlpbmcgdG8gcmV0cmlldmUgYSBkZXBlbmRlbmN5IGJ5IGBLZXlgIGZyb20ge0BsaW5rIEluamVjdG9yfSwgYnV0IHRoZVxuICoge0BsaW5rIEluamVjdG9yfSBkb2VzIG5vdCBoYXZlIGEge0BsaW5rIFByb3ZpZGVyfSBmb3Ige0BsaW5rIEtleX0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3ZxOEQzRlJCOWFHYm5XSnF0RVBFP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQSB7XG4gKiAgIGNvbnN0cnVjdG9yKGI6Qikge31cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQV0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTm9Qcm92aWRlckVycm9yIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlckVycm9yIHtcbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKGluamVjdG9yLCBrZXksIGZ1bmN0aW9uKGtleXM6IGFueVtdKSB7XG4gICAgICB2YXIgZmlyc3QgPSBzdHJpbmdpZnkoTGlzdFdyYXBwZXIuZmlyc3Qoa2V5cykudG9rZW4pO1xuICAgICAgcmV0dXJuIGBObyBwcm92aWRlciBmb3IgJHtmaXJzdH0hJHtjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoKGtleXMpfWA7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBkZXBlbmRlbmNpZXMgZm9ybSBhIGN5Y2xlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93WVFkTm9zMFR6cWwzZWkxRVY5aj9wPWluZm8pKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBwcm92aWRlKFwib25lXCIsIHt1c2VGYWN0b3J5OiAodHdvKSA9PiBcInR3b1wiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJ0d29cIildXX0pLFxuICogICBwcm92aWRlKFwidHdvXCIsIHt1c2VGYWN0b3J5OiAob25lKSA9PiBcIm9uZVwiLCBkZXBzOiBbW25ldyBJbmplY3QoXCJvbmVcIildXX0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0KFwib25lXCIpKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICpcbiAqIFJldHJpZXZpbmcgYEFgIG9yIGBCYCB0aHJvd3MgYSBgQ3ljbGljRGVwZW5kZW5jeUVycm9yYCBhcyB0aGUgZ3JhcGggYWJvdmUgY2Fubm90IGJlIGNvbnN0cnVjdGVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3ljbGljRGVwZW5kZW5jeUVycm9yIGV4dGVuZHMgQWJzdHJhY3RQcm92aWRlckVycm9yIHtcbiAgY29uc3RydWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKGluamVjdG9yLCBrZXksIGZ1bmN0aW9uKGtleXM6IGFueVtdKSB7XG4gICAgICByZXR1cm4gYENhbm5vdCBpbnN0YW50aWF0ZSBjeWNsaWMgZGVwZW5kZW5jeSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5cyl9YDtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgY29uc3RydWN0aW5nIHR5cGUgcmV0dXJucyB3aXRoIGFuIEVycm9yLlxuICpcbiAqIFRoZSBgSW5zdGFudGlhdGlvbkVycm9yYCBjbGFzcyBjb250YWlucyB0aGUgb3JpZ2luYWwgZXJyb3IgcGx1cyB0aGUgZGVwZW5kZW5jeSBncmFwaCB3aGljaCBjYXVzZWRcbiAqIHRoaXMgb2JqZWN0IHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvN2FXWWRjcVRRc1AwZU5xRWRVQWY/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhyb3cgbmV3IEVycm9yKCdtZXNzYWdlJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSk7XG5cbiAqIHRyeSB7XG4gKiAgIGluamVjdG9yLmdldChBKTtcbiAqIH0gY2F0Y2ggKGUpIHtcbiAqICAgZXhwZWN0KGUgaW5zdGFuY2VvZiBJbnN0YW50aWF0aW9uRXJyb3IpLnRvQmUodHJ1ZSk7XG4gKiAgIGV4cGVjdChlLm9yaWdpbmFsRXhjZXB0aW9uLm1lc3NhZ2UpLnRvRXF1YWwoXCJtZXNzYWdlXCIpO1xuICogICBleHBlY3QoZS5vcmlnaW5hbFN0YWNrKS50b0JlRGVmaW5lZCgpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnN0YW50aWF0aW9uRXJyb3IgZXh0ZW5kcyBXcmFwcGVkRXhjZXB0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBrZXlzOiBLZXlbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIGluamVjdG9yczogSW5qZWN0b3JbXTtcblxuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBrZXk6IEtleSkge1xuICAgIHN1cGVyKCdESSBFeGNlcHRpb24nLCBvcmlnaW5hbEV4Y2VwdGlvbiwgb3JpZ2luYWxTdGFjaywgbnVsbCk7XG4gICAgdGhpcy5rZXlzID0gW2tleV07XG4gICAgdGhpcy5pbmplY3RvcnMgPSBbaW5qZWN0b3JdO1xuICB9XG5cbiAgYWRkS2V5KGluamVjdG9yOiBJbmplY3Rvciwga2V5OiBLZXkpOiB2b2lkIHtcbiAgICB0aGlzLmluamVjdG9ycy5wdXNoKGluamVjdG9yKTtcbiAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICB9XG5cbiAgZ2V0IHdyYXBwZXJNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgdmFyIGZpcnN0ID0gc3RyaW5naWZ5KExpc3RXcmFwcGVyLmZpcnN0KHRoaXMua2V5cykudG9rZW4pO1xuICAgIHJldHVybiBgRXJyb3IgZHVyaW5nIGluc3RhbnRpYXRpb24gb2YgJHtmaXJzdH0hJHtjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoKHRoaXMua2V5cyl9LmA7XG4gIH1cblxuICBnZXQgY2F1c2VLZXkoKTogS2V5IHsgcmV0dXJuIHRoaXMua2V5c1swXTsgfVxuXG4gIGdldCBjb250ZXh0KCkgeyByZXR1cm4gdGhpcy5pbmplY3RvcnNbdGhpcy5pbmplY3RvcnMubGVuZ3RoIC0gMV0uZGVidWdDb250ZXh0KCk7IH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhbiBvYmplY3Qgb3RoZXIgdGhlbiB7QGxpbmsgUHJvdmlkZXJ9IChvciBgVHlwZWApIGlzIHBhc3NlZCB0byB7QGxpbmsgSW5qZWN0b3J9XG4gKiBjcmVhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWWF0Q0ZiUEFNQ0wwSlNTUTRtdkg/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXCJub3QgYSB0eXBlXCJdKSkudG9UaHJvd0Vycm9yKCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEludmFsaWRQcm92aWRlckVycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByb3ZpZGVyKSB7XG4gICAgc3VwZXIoXG4gICAgICAgICdJbnZhbGlkIHByb3ZpZGVyIC0gb25seSBpbnN0YW5jZXMgb2YgUHJvdmlkZXIgYW5kIFR5cGUgYXJlIGFsbG93ZWQsIGdvdDogJyArXG4gICAgICAgIHByb3ZpZGVyLnRvU3RyaW5nKCkpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIGNsYXNzIGhhcyBubyBhbm5vdGF0aW9uIGluZm9ybWF0aW9uLlxuICpcbiAqIExhY2sgb2YgYW5ub3RhdGlvbiBpbmZvcm1hdGlvbiBwcmV2ZW50cyB0aGUge0BsaW5rIEluamVjdG9yfSBmcm9tIGRldGVybWluaW5nIHdoaWNoIGRlcGVuZGVuY2llc1xuICogbmVlZCB0byBiZSBpbmplY3RlZCBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvckhuWnRsTlM3dkpPUFE2cGNWa20/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoYikge31cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQV0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgZXJyb3IgaXMgYWxzbyB0aHJvd24gd2hlbiB0aGUgY2xhc3Mgbm90IG1hcmtlZCB3aXRoIHtAbGluayBJbmplY3RhYmxlfSBoYXMgcGFyYW1ldGVyIHR5cGVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEIge31cbiAqXG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoYjpCKSB7fSAvLyBubyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcGFyYW1ldGVyIHR5cGVzIG9mIEEgaXMgYXZhaWxhYmxlIGF0IHJ1bnRpbWUuXG4gKiB9XG4gKlxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0EsQl0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTm9Bbm5vdGF0aW9uRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IodHlwZU9yRnVuYywgcGFyYW1zOiBhbnlbXVtdKSB7XG4gICAgc3VwZXIoTm9Bbm5vdGF0aW9uRXJyb3IuX2dlbk1lc3NhZ2UodHlwZU9yRnVuYywgcGFyYW1zKSk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfZ2VuTWVzc2FnZSh0eXBlT3JGdW5jLCBwYXJhbXM6IGFueVtdW10pIHtcbiAgICB2YXIgc2lnbmF0dXJlID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGFyYW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIHZhciBwYXJhbWV0ZXIgPSBwYXJhbXNbaV07XG4gICAgICBpZiAoaXNCbGFuayhwYXJhbWV0ZXIpIHx8IHBhcmFtZXRlci5sZW5ndGggPT0gMCkge1xuICAgICAgICBzaWduYXR1cmUucHVzaCgnPycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2lnbmF0dXJlLnB1c2gocGFyYW1ldGVyLm1hcChzdHJpbmdpZnkpLmpvaW4oJyAnKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAnQ2Fubm90IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yIFxcJycgKyBzdHJpbmdpZnkodHlwZU9yRnVuYykgKyAnXFwnKCcgK1xuICAgICAgICBzaWduYXR1cmUuam9pbignLCAnKSArICcpLiAnICtcbiAgICAgICAgJ01ha2Ugc3VyZSB0aGF0IGFsbCB0aGUgcGFyYW1ldGVycyBhcmUgZGVjb3JhdGVkIHdpdGggSW5qZWN0IG9yIGhhdmUgdmFsaWQgdHlwZSBhbm5vdGF0aW9ucyBhbmQgdGhhdCBcXCcnICtcbiAgICAgICAgc3RyaW5naWZ5KHR5cGVPckZ1bmMpICsgJ1xcJyBpcyBkZWNvcmF0ZWQgd2l0aCBJbmplY3RhYmxlLic7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBnZXR0aW5nIGFuIG9iamVjdCBieSBpbmRleC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYlJzMFNYMk9UUWlKenF2amdsOFA/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHt9XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQV0pO1xuICpcbiAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXRBdCgxMDApKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgT3V0T2ZCb3VuZHNFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihpbmRleCkgeyBzdXBlcihgSW5kZXggJHtpbmRleH0gaXMgb3V0LW9mLWJvdW5kcy5gKTsgfVxufVxuXG4vLyBUT0RPOiBhZGQgYSB3b3JraW5nIGV4YW1wbGUgYWZ0ZXIgYWxwaGEzOCBpcyByZWxlYXNlZFxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIG11bHRpIHByb3ZpZGVyIGFuZCBhIHJlZ3VsYXIgcHJvdmlkZXIgYXJlIGJvdW5kIHRvIHRoZSBzYW1lIHRva2VuLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwZWN0KCgpID0+IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHt1c2VWYWx1ZTogXCJzdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwge3VzZVZhbHVlOiBcInN0cmluZzJcIiwgbXVsdGk6IGZhbHNlfSlcbiAqIF0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByb3ZpZGVyMSwgcHJvdmlkZXIyKSB7XG4gICAgc3VwZXIoXG4gICAgICAgICdDYW5ub3QgbWl4IG11bHRpIHByb3ZpZGVycyBhbmQgcmVndWxhciBwcm92aWRlcnMsIGdvdDogJyArIHByb3ZpZGVyMS50b1N0cmluZygpICsgJyAnICtcbiAgICAgICAgcHJvdmlkZXIyLnRvU3RyaW5nKCkpO1xuICB9XG59XG4iXX0=