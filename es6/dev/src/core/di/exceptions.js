import { ListWrapper } from 'angular2/src/facade/collection';
import { stringify, isBlank } from 'angular2/src/facade/lang';
import { BaseException, WrappedException } from 'angular2/src/facade/exceptions';
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (ListWrapper.contains(res, keys[i])) {
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
        var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
        var tokenStrs = reversed.map(k => stringify(k.token));
        return ' (' + tokenStrs.join(' -> ') + ')';
    }
    else {
        return '';
    }
}
/**
 * Base class for all errors arising from misconfigured providers.
 */
export class AbstractProviderError extends BaseException {
    constructor(injector, key, constructResolvingMessage) {
        super('DI Exception');
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    addKey(injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    }
    get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}
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
export class NoProviderError extends AbstractProviderError {
    constructor(injector, key) {
        super(injector, key, function (keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return `No provider for ${first}!${constructResolvingPath(keys)}`;
        });
    }
}
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
export class CyclicDependencyError extends AbstractProviderError {
    constructor(injector, key) {
        super(injector, key, function (keys) {
            return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
        });
    }
}
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
export class InstantiationError extends WrappedException {
    constructor(injector, originalException, originalStack, key) {
        super('DI Exception', originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
    }
    addKey(injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
    }
    get wrapperMessage() {
        var first = stringify(ListWrapper.first(this.keys).token);
        return `Error during instantiation of ${first}!${constructResolvingPath(this.keys)}.`;
    }
    get causeKey() { return this.keys[0]; }
    get context() { return this.injectors[this.injectors.length - 1].debugContext(); }
}
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
export class InvalidProviderError extends BaseException {
    constructor(provider) {
        super('Invalid provider - only instances of Provider and Type are allowed, got: ' +
            provider.toString());
    }
}
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
export class NoAnnotationError extends BaseException {
    constructor(typeOrFunc, params) {
        super(NoAnnotationError._genMessage(typeOrFunc, params));
    }
    static _genMessage(typeOrFunc, params) {
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(parameter.map(stringify).join(' '));
            }
        }
        return 'Cannot resolve all parameters for \'' + stringify(typeOrFunc) + '\'(' +
            signature.join(', ') + '). ' +
            'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' +
            stringify(typeOrFunc) + '\' is decorated with Injectable.';
    }
}
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
export class OutOfBoundsError extends BaseException {
    constructor(index) {
        super(`Index ${index} is out-of-bounds.`);
    }
}
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
export class MixingMultiProvidersWithRegularProvidersError extends BaseException {
    constructor(provider1, provider2) {
        super('Cannot mix multi providers and regular providers, got: ' + provider1.toString() + ' ' +
            provider2.toString());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVnZpcENCVVAudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2V4Y2VwdGlvbnMudHMiXSwibmFtZXMiOlsiZmluZEZpcnN0Q2xvc2VkQ3ljbGUiLCJjb25zdHJ1Y3RSZXNvbHZpbmdQYXRoIiwiQWJzdHJhY3RQcm92aWRlckVycm9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RQcm92aWRlckVycm9yLmFkZEtleSIsIkFic3RyYWN0UHJvdmlkZXJFcnJvci5jb250ZXh0IiwiTm9Qcm92aWRlckVycm9yIiwiTm9Qcm92aWRlckVycm9yLmNvbnN0cnVjdG9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yIiwiQ3ljbGljRGVwZW5kZW5jeUVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmNvbnN0cnVjdG9yIiwiSW5zdGFudGlhdGlvbkVycm9yLmFkZEtleSIsIkluc3RhbnRpYXRpb25FcnJvci53cmFwcGVyTWVzc2FnZSIsIkluc3RhbnRpYXRpb25FcnJvci5jYXVzZUtleSIsIkluc3RhbnRpYXRpb25FcnJvci5jb250ZXh0IiwiSW52YWxpZFByb3ZpZGVyRXJyb3IiLCJJbnZhbGlkUHJvdmlkZXJFcnJvci5jb25zdHJ1Y3RvciIsIk5vQW5ub3RhdGlvbkVycm9yIiwiTm9Bbm5vdGF0aW9uRXJyb3IuY29uc3RydWN0b3IiLCJOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSIsIk91dE9mQm91bmRzRXJyb3IiLCJPdXRPZkJvdW5kc0Vycm9yLmNvbnN0cnVjdG9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yIiwiTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9y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U0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0Esa0NBQWtDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxzQ0FBc0MsYUFBYTtJQUNqREcsWUFBWUEsS0FBS0E7UUFBSUMsTUFBTUEsU0FBU0EsS0FBS0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtBQUNuRUQsQ0FBQ0E7QUFFRCx3REFBd0Q7QUFDeEQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxtRUFBbUUsYUFBYTtJQUM5RUUsWUFBWUEsU0FBU0EsRUFBRUEsU0FBU0E7UUFDOUJDLE1BQ0lBLHlEQUF5REEsR0FBR0EsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsR0FBR0E7WUFDdEZBLFNBQVNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLENBQUNBO0lBQzVCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7c3RyaW5naWZ5LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9uLCB1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4vaW5qZWN0b3InO1xuXG5mdW5jdGlvbiBmaW5kRmlyc3RDbG9zZWRDeWNsZShrZXlzOiBhbnlbXSk6IGFueVtdIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuY29udGFpbnMocmVzLCBrZXlzW2ldKSkge1xuICAgICAgcmVzLnB1c2goa2V5c1tpXSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMucHVzaChrZXlzW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0UmVzb2x2aW5nUGF0aChrZXlzOiBhbnlbXSk6IHN0cmluZyB7XG4gIGlmIChrZXlzLmxlbmd0aCA+IDEpIHtcbiAgICB2YXIgcmV2ZXJzZWQgPSBmaW5kRmlyc3RDbG9zZWRDeWNsZShMaXN0V3JhcHBlci5yZXZlcnNlZChrZXlzKSk7XG4gICAgdmFyIHRva2VuU3RycyA9IHJldmVyc2VkLm1hcChrID0+IHN0cmluZ2lmeShrLnRva2VuKSk7XG4gICAgcmV0dXJuICcgKCcgKyB0b2tlblN0cnMuam9pbignIC0+ICcpICsgJyknO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIGVycm9ycyBhcmlzaW5nIGZyb20gbWlzY29uZmlndXJlZCBwcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBrZXlzOiBLZXlbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIGluamVjdG9yczogSW5qZWN0b3JbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2U6IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKGluamVjdG9yOiBJbmplY3Rvciwga2V5OiBLZXksIGNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2U6IEZ1bmN0aW9uKSB7XG4gICAgc3VwZXIoJ0RJIEV4Y2VwdGlvbicpO1xuICAgIHRoaXMua2V5cyA9IFtrZXldO1xuICAgIHRoaXMuaW5qZWN0b3JzID0gW2luamVjdG9yXTtcbiAgICB0aGlzLmNvbnN0cnVjdFJlc29sdmluZ01lc3NhZ2UgPSBjb25zdHJ1Y3RSZXNvbHZpbmdNZXNzYWdlO1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZSh0aGlzLmtleXMpO1xuICB9XG5cbiAgYWRkS2V5KGluamVjdG9yOiBJbmplY3Rvciwga2V5OiBLZXkpOiB2b2lkIHtcbiAgICB0aGlzLmluamVjdG9ycy5wdXNoKGluamVjdG9yKTtcbiAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0UmVzb2x2aW5nTWVzc2FnZSh0aGlzLmtleXMpO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLmluamVjdG9yc1t0aGlzLmluamVjdG9ycy5sZW5ndGggLSAxXS5kZWJ1Z0NvbnRleHQoKTsgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRyeWluZyB0byByZXRyaWV2ZSBhIGRlcGVuZGVuY3kgYnkgYEtleWAgZnJvbSB7QGxpbmsgSW5qZWN0b3J9LCBidXQgdGhlXG4gKiB7QGxpbmsgSW5qZWN0b3J9IGRvZXMgbm90IGhhdmUgYSB7QGxpbmsgUHJvdmlkZXJ9IGZvciB7QGxpbmsgS2V5fS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdnE4RDNGUkI5YUdibldKcXRFUEU/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjbGFzcyBBIHtcbiAqICAgY29uc3RydWN0b3IoYjpCKSB7fVxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOb1Byb3ZpZGVyRXJyb3IgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIGtleSwgZnVuY3Rpb24oa2V5czogYW55W10pIHtcbiAgICAgIHZhciBmaXJzdCA9IHN0cmluZ2lmeShMaXN0V3JhcHBlci5maXJzdChrZXlzKS50b2tlbik7XG4gICAgICByZXR1cm4gYE5vIHByb3ZpZGVyIGZvciAke2ZpcnN0fSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgoa2V5cyl9YDtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGRlcGVuZGVuY2llcyBmb3JtIGEgY3ljbGUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3dZUWROb3MwVHpxbDNlaTFFVjlqP3A9aW5mbykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIHByb3ZpZGUoXCJvbmVcIiwge3VzZUZhY3Rvcnk6ICh0d28pID0+IFwidHdvXCIsIGRlcHM6IFtbbmV3IEluamVjdChcInR3b1wiKV1dfSksXG4gKiAgIHByb3ZpZGUoXCJ0d29cIiwge3VzZUZhY3Rvcnk6IChvbmUpID0+IFwib25lXCIsIGRlcHM6IFtbbmV3IEluamVjdChcIm9uZVwiKV1dfSlcbiAqIF0pO1xuICpcbiAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJvbmVcIikpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKlxuICogUmV0cmlldmluZyBgQWAgb3IgYEJgIHRocm93cyBhIGBDeWNsaWNEZXBlbmRlbmN5RXJyb3JgIGFzIHRoZSBncmFwaCBhYm92ZSBjYW5ub3QgYmUgY29uc3RydWN0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDeWNsaWNEZXBlbmRlbmN5RXJyb3IgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihpbmplY3RvcjogSW5qZWN0b3IsIGtleTogS2V5KSB7XG4gICAgc3VwZXIoaW5qZWN0b3IsIGtleSwgZnVuY3Rpb24oa2V5czogYW55W10pIHtcbiAgICAgIHJldHVybiBgQ2Fubm90IGluc3RhbnRpYXRlIGN5Y2xpYyBkZXBlbmRlbmN5ISR7Y29uc3RydWN0UmVzb2x2aW5nUGF0aChrZXlzKX1gO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBjb25zdHJ1Y3RpbmcgdHlwZSByZXR1cm5zIHdpdGggYW4gRXJyb3IuXG4gKlxuICogVGhlIGBJbnN0YW50aWF0aW9uRXJyb3JgIGNsYXNzIGNvbnRhaW5zIHRoZSBvcmlnaW5hbCBlcnJvciBwbHVzIHRoZSBkZXBlbmRlbmN5IGdyYXBoIHdoaWNoIGNhdXNlZFxuICogdGhpcyBvYmplY3QgdG8gYmUgaW5zdGFudGlhdGVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC83YVdZZGNxVFFzUDBlTnFFZFVBZj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aHJvdyBuZXcgRXJyb3IoJ21lc3NhZ2UnKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0FdKTtcblxuICogdHJ5IHtcbiAqICAgaW5qZWN0b3IuZ2V0KEEpO1xuICogfSBjYXRjaCAoZSkge1xuICogICBleHBlY3QoZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRpb25FcnJvcikudG9CZSh0cnVlKTtcbiAqICAgZXhwZWN0KGUub3JpZ2luYWxFeGNlcHRpb24ubWVzc2FnZSkudG9FcXVhbChcIm1lc3NhZ2VcIik7XG4gKiAgIGV4cGVjdChlLm9yaWdpbmFsU3RhY2spLnRvQmVEZWZpbmVkKCk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEluc3RhbnRpYXRpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICAvKiogQGludGVybmFsICovXG4gIGtleXM6IEtleVtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgaW5qZWN0b3JzOiBJbmplY3RvcltdO1xuXG4gIGNvbnN0cnVjdG9yKGluamVjdG9yOiBJbmplY3Rvciwgb3JpZ2luYWxFeGNlcHRpb24sIG9yaWdpbmFsU3RhY2ssIGtleTogS2V5KSB7XG4gICAgc3VwZXIoJ0RJIEV4Y2VwdGlvbicsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBudWxsKTtcbiAgICB0aGlzLmtleXMgPSBba2V5XTtcbiAgICB0aGlzLmluamVjdG9ycyA9IFtpbmplY3Rvcl07XG4gIH1cblxuICBhZGRLZXkoaW5qZWN0b3I6IEluamVjdG9yLCBrZXk6IEtleSk6IHZvaWQge1xuICAgIHRoaXMuaW5qZWN0b3JzLnB1c2goaW5qZWN0b3IpO1xuICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gIH1cblxuICBnZXQgd3JhcHBlck1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICB2YXIgZmlyc3QgPSBzdHJpbmdpZnkoTGlzdFdyYXBwZXIuZmlyc3QodGhpcy5rZXlzKS50b2tlbik7XG4gICAgcmV0dXJuIGBFcnJvciBkdXJpbmcgaW5zdGFudGlhdGlvbiBvZiAke2ZpcnN0fSEke2NvbnN0cnVjdFJlc29sdmluZ1BhdGgodGhpcy5rZXlzKX0uYDtcbiAgfVxuXG4gIGdldCBjYXVzZUtleSgpOiBLZXkgeyByZXR1cm4gdGhpcy5rZXlzWzBdOyB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLmluamVjdG9yc1t0aGlzLmluamVjdG9ycy5sZW5ndGggLSAxXS5kZWJ1Z0NvbnRleHQoKTsgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGFuIG9iamVjdCBvdGhlciB0aGVuIHtAbGluayBQcm92aWRlcn0gKG9yIGBUeXBlYCkgaXMgcGFzc2VkIHRvIHtAbGluayBJbmplY3Rvcn1cbiAqIGNyZWF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZYXRDRmJQQU1DTDBKU1NRNG12SD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcIm5vdCBhIHR5cGVcIl0pKS50b1Rocm93RXJyb3IoKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSW52YWxpZFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocHJvdmlkZXIpIHtcbiAgICBzdXBlcihcbiAgICAgICAgJ0ludmFsaWQgcHJvdmlkZXIgLSBvbmx5IGluc3RhbmNlcyBvZiBQcm92aWRlciBhbmQgVHlwZSBhcmUgYWxsb3dlZCwgZ290OiAnICtcbiAgICAgICAgcHJvdmlkZXIudG9TdHJpbmcoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgY2xhc3MgaGFzIG5vIGFubm90YXRpb24gaW5mb3JtYXRpb24uXG4gKlxuICogTGFjayBvZiBhbm5vdGF0aW9uIGluZm9ybWF0aW9uIHByZXZlbnRzIHRoZSB7QGxpbmsgSW5qZWN0b3J9IGZyb20gZGV0ZXJtaW5pbmcgd2hpY2ggZGVwZW5kZW5jaWVzXG4gKiBuZWVkIHRvIGJlIGluamVjdGVkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ySG5adGxOUzd2Sk9QUTZwY1ZrbT9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiKSB7fVxuICogfVxuICpcbiAqIGV4cGVjdCgoKSA9PiBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKlxuICogVGhpcyBlcnJvciBpcyBhbHNvIHRocm93biB3aGVuIHRoZSBjbGFzcyBub3QgbWFya2VkIHdpdGgge0BsaW5rIEluamVjdGFibGV9IGhhcyBwYXJhbWV0ZXIgdHlwZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogY2xhc3MgQiB7fVxuICpcbiAqIGNsYXNzIEEge1xuICogICBjb25zdHJ1Y3RvcihiOkIpIHt9IC8vIG5vIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwYXJhbWV0ZXIgdHlwZXMgb2YgQSBpcyBhdmFpbGFibGUgYXQgcnVudGltZS5cbiAqIH1cbiAqXG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQSxCXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOb0Fubm90YXRpb25FcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcih0eXBlT3JGdW5jLCBwYXJhbXM6IGFueVtdW10pIHtcbiAgICBzdXBlcihOb0Fubm90YXRpb25FcnJvci5fZ2VuTWVzc2FnZSh0eXBlT3JGdW5jLCBwYXJhbXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9nZW5NZXNzYWdlKHR5cGVPckZ1bmMsIHBhcmFtczogYW55W11bXSkge1xuICAgIHZhciBzaWduYXR1cmUgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXJhbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgdmFyIHBhcmFtZXRlciA9IHBhcmFtc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcmFtZXRlcikgfHwgcGFyYW1ldGVyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNpZ25hdHVyZS5wdXNoKCc/Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaWduYXR1cmUucHVzaChwYXJhbWV0ZXIubWFwKHN0cmluZ2lmeSkuam9pbignICcpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICdDYW5ub3QgcmVzb2x2ZSBhbGwgcGFyYW1ldGVycyBmb3IgXFwnJyArIHN0cmluZ2lmeSh0eXBlT3JGdW5jKSArICdcXCcoJyArXG4gICAgICAgIHNpZ25hdHVyZS5qb2luKCcsICcpICsgJykuICcgK1xuICAgICAgICAnTWFrZSBzdXJlIHRoYXQgYWxsIHRoZSBwYXJhbWV0ZXJzIGFyZSBkZWNvcmF0ZWQgd2l0aCBJbmplY3Qgb3IgaGF2ZSB2YWxpZCB0eXBlIGFubm90YXRpb25zIGFuZCB0aGF0IFxcJycgK1xuICAgICAgICBzdHJpbmdpZnkodHlwZU9yRnVuYykgKyAnXFwnIGlzIGRlY29yYXRlZCB3aXRoIEluamVjdGFibGUuJztcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGdldHRpbmcgYW4gb2JqZWN0IGJ5IGluZGV4LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9iUnMwU1gyT1RRaUp6cXZqZ2w4UD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIEEge31cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtBXSk7XG4gKlxuICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldEF0KDEwMCkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBPdXRPZkJvdW5kc0Vycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGluZGV4KSB7IHN1cGVyKGBJbmRleCAke2luZGV4fSBpcyBvdXQtb2YtYm91bmRzLmApOyB9XG59XG5cbi8vIFRPRE86IGFkZCBhIHdvcmtpbmcgZXhhbXBsZSBhZnRlciBhbHBoYTM4IGlzIHJlbGVhc2VkXG4vKipcbiAqIFRocm93biB3aGVuIGEgbXVsdGkgcHJvdmlkZXIgYW5kIGEgcmVndWxhciBwcm92aWRlciBhcmUgYm91bmQgdG8gdGhlIHNhbWUgdG9rZW4uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBlY3QoKCkgPT4gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwge3VzZVZhbHVlOiBcInN0cmluZzFcIiwgbXVsdGk6IHRydWV9KSxcbiAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7dXNlVmFsdWU6IFwic3RyaW5nMlwiLCBtdWx0aTogZmFsc2V9KVxuICogXSkpLnRvVGhyb3dFcnJvcigpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocHJvdmlkZXIxLCBwcm92aWRlcjIpIHtcbiAgICBzdXBlcihcbiAgICAgICAgJ0Nhbm5vdCBtaXggbXVsdGkgcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycywgZ290OiAnICsgcHJvdmlkZXIxLnRvU3RyaW5nKCkgKyAnICcgK1xuICAgICAgICBwcm92aWRlcjIudG9TdHJpbmcoKSk7XG4gIH1cbn1cbiJdfQ==