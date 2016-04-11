import { ListWrapper } from 'angular2/src/facade/collection';
import { resolveProviders } from './provider';
import { AbstractProviderError, NoProviderError, CyclicDependencyError, InstantiationError, OutOfBoundsError } from './exceptions';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Key } from './key';
import { SelfMetadata, HostMetadata, SkipSelfMetadata } from './metadata';
// Threshold for the dynamic version
const _MAX_CONSTRUCTION_COUNTER = 10;
export const UNDEFINED = CONST_EXPR(new Object());
/**
 * Visibility of a {@link Provider}.
 */
export var Visibility;
(function (Visibility) {
    /**
     * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
     */
    Visibility[Visibility["Public"] = 0] = "Public";
    /**
     * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
     */
    Visibility[Visibility["Private"] = 1] = "Private";
    /**
     * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
     */
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
})(Visibility || (Visibility = {}));
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
export class ProtoInjectorInlineStrategy {
    constructor(protoEI, bwv) {
        this.provider0 = null;
        this.provider1 = null;
        this.provider2 = null;
        this.provider3 = null;
        this.provider4 = null;
        this.provider5 = null;
        this.provider6 = null;
        this.provider7 = null;
        this.provider8 = null;
        this.provider9 = null;
        this.keyId0 = null;
        this.keyId1 = null;
        this.keyId2 = null;
        this.keyId3 = null;
        this.keyId4 = null;
        this.keyId5 = null;
        this.keyId6 = null;
        this.keyId7 = null;
        this.keyId8 = null;
        this.keyId9 = null;
        this.visibility0 = null;
        this.visibility1 = null;
        this.visibility2 = null;
        this.visibility3 = null;
        this.visibility4 = null;
        this.visibility5 = null;
        this.visibility6 = null;
        this.visibility7 = null;
        this.visibility8 = null;
        this.visibility9 = null;
        var length = bwv.length;
        if (length > 0) {
            this.provider0 = bwv[0].provider;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
        }
        if (length > 1) {
            this.provider1 = bwv[1].provider;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
        }
        if (length > 2) {
            this.provider2 = bwv[2].provider;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
        }
        if (length > 3) {
            this.provider3 = bwv[3].provider;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
        }
        if (length > 4) {
            this.provider4 = bwv[4].provider;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
        }
        if (length > 5) {
            this.provider5 = bwv[5].provider;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
        }
        if (length > 6) {
            this.provider6 = bwv[6].provider;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
        }
        if (length > 7) {
            this.provider7 = bwv[7].provider;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
        }
        if (length > 8) {
            this.provider8 = bwv[8].provider;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
        }
        if (length > 9) {
            this.provider9 = bwv[9].provider;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
        }
    }
    getProviderAtIndex(index) {
        if (index == 0)
            return this.provider0;
        if (index == 1)
            return this.provider1;
        if (index == 2)
            return this.provider2;
        if (index == 3)
            return this.provider3;
        if (index == 4)
            return this.provider4;
        if (index == 5)
            return this.provider5;
        if (index == 6)
            return this.provider6;
        if (index == 7)
            return this.provider7;
        if (index == 8)
            return this.provider8;
        if (index == 9)
            return this.provider9;
        throw new OutOfBoundsError(index);
    }
    createInjectorStrategy(injector) {
        return new InjectorInlineStrategy(injector, this);
    }
}
export class ProtoInjectorDynamicStrategy {
    constructor(protoInj, bwv) {
        var len = bwv.length;
        this.providers = ListWrapper.createFixedSize(len);
        this.keyIds = ListWrapper.createFixedSize(len);
        this.visibilities = ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.providers[i] = bwv[i].provider;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    getProviderAtIndex(index) {
        if (index < 0 || index >= this.providers.length) {
            throw new OutOfBoundsError(index);
        }
        return this.providers[index];
    }
    createInjectorStrategy(ei) {
        return new InjectorDynamicStrategy(this, ei);
    }
}
export class ProtoInjector {
    constructor(bwv) {
        this.numberOfProviders = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    static fromResolvedProviders(providers) {
        var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
        return new ProtoInjector(bd);
    }
    getProviderAtIndex(index) {
        return this._strategy.getProviderAtIndex(index);
    }
}
export class InjectorInlineStrategy {
    constructor(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = UNDEFINED;
        this.obj1 = UNDEFINED;
        this.obj2 = UNDEFINED;
        this.obj3 = UNDEFINED;
        this.obj4 = UNDEFINED;
        this.obj5 = UNDEFINED;
        this.obj6 = UNDEFINED;
        this.obj7 = UNDEFINED;
        this.obj8 = UNDEFINED;
        this.obj9 = UNDEFINED;
    }
    resetConstructionCounter() { this.injector._constructionCounter = 0; }
    instantiateProvider(provider, visibility) {
        return this.injector._new(provider, visibility);
    }
    getObjByKeyId(keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === UNDEFINED) {
                this.obj0 = inj._new(p.provider0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === UNDEFINED) {
                this.obj1 = inj._new(p.provider1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === UNDEFINED) {
                this.obj2 = inj._new(p.provider2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === UNDEFINED) {
                this.obj3 = inj._new(p.provider3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === UNDEFINED) {
                this.obj4 = inj._new(p.provider4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === UNDEFINED) {
                this.obj5 = inj._new(p.provider5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === UNDEFINED) {
                this.obj6 = inj._new(p.provider6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === UNDEFINED) {
                this.obj7 = inj._new(p.provider7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === UNDEFINED) {
                this.obj8 = inj._new(p.provider8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === UNDEFINED) {
                this.obj9 = inj._new(p.provider9, p.visibility9);
            }
            return this.obj9;
        }
        return UNDEFINED;
    }
    getObjAtIndex(index) {
        if (index == 0)
            return this.obj0;
        if (index == 1)
            return this.obj1;
        if (index == 2)
            return this.obj2;
        if (index == 3)
            return this.obj3;
        if (index == 4)
            return this.obj4;
        if (index == 5)
            return this.obj5;
        if (index == 6)
            return this.obj6;
        if (index == 7)
            return this.obj7;
        if (index == 8)
            return this.obj8;
        if (index == 9)
            return this.obj9;
        throw new OutOfBoundsError(index);
    }
    getMaxNumberOfObjects() { return _MAX_CONSTRUCTION_COUNTER; }
}
export class InjectorDynamicStrategy {
    constructor(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = ListWrapper.createFixedSize(protoStrategy.providers.length);
        ListWrapper.fill(this.objs, UNDEFINED);
    }
    resetConstructionCounter() { this.injector._constructionCounter = 0; }
    instantiateProvider(provider, visibility) {
        return this.injector._new(provider, visibility);
    }
    getObjByKeyId(keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === UNDEFINED) {
                    this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return UNDEFINED;
    }
    getObjAtIndex(index) {
        if (index < 0 || index >= this.objs.length) {
            throw new OutOfBoundsError(index);
        }
        return this.objs[index];
    }
    getMaxNumberOfObjects() { return this.objs.length; }
}
export class ProviderWithVisibility {
    constructor(provider, visibility) {
        this.provider = provider;
        this.visibility = visibility;
    }
    ;
    getKeyId() { return this.provider.key.id; }
}
/**
 * A dependency injection container used for instantiating objects and resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 *
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
 *
 * The following example creates an `Injector` configured to create `Engine` and `Car`.
 *
 * ```typescript
 * @Injectable()
 * class Engine {
 * }
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine:Engine) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
export class Injector {
    /**
     * Private
     */
    constructor(_proto /* ProtoInjector */, _parent = null, _isHostBoundary = false, _depProvider = null, _debugContext = null) {
        this._isHostBoundary = _isHostBoundary;
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
        /** @internal */
        this._constructionCounter = 0;
        this._proto = _proto;
        this._parent = _parent;
        this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
    /**
     * Turns an array of provider definitions into an array of resolved providers.
     *
     * A resolution is a process of flattening multiple nested arrays and converting individual
     * providers into an array of {@link ResolvedProvider}s.
     *
     * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, [[Engine]]]);
     *
     * expect(providers.length).toEqual(2);
     *
     * expect(providers[0] instanceof ResolvedProvider).toBe(true);
     * expect(providers[0].key.displayName).toBe("Car");
     * expect(providers[0].dependencies.length).toEqual(1);
     * expect(providers[0].factory).toBeDefined();
     *
     * expect(providers[1].key.displayName).toBe("Engine");
     * });
     * ```
     *
     * See {@link Injector#fromResolvedProviders} for more info.
     */
    static resolve(providers) {
        return resolveProviders(providers);
    }
    /**
     * Resolves an array of providers and creates an injector from those providers.
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Car, Engine]);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     *
     * This function is slower than the corresponding `fromResolvedProviders`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
     */
    static resolveAndCreate(providers) {
        var resolvedProviders = Injector.resolve(providers);
        return Injector.fromResolvedProviders(resolvedProviders);
    }
    /**
     * Creates an injector from previously resolved providers.
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, Engine]);
     * var injector = Injector.fromResolvedProviders(providers);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     */
    static fromResolvedProviders(providers) {
        return new Injector(ProtoInjector.fromResolvedProviders(providers));
    }
    /**
     * @deprecated
     */
    static fromResolvedBindings(providers) {
        return Injector.fromResolvedProviders(providers);
    }
    /**
     * Whether this injector is a boundary to a host.
     * @internal
     */
    get hostBoundary() { return this._isHostBoundary; }
    /**
     * @internal
     */
    debugContext() { return this._debugContext(); }
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Throws {@link NoProviderError} if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    get(token) {
        return this._getByKey(Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    }
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Returns null if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/tpEbEy?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.getOptional("validToken")).toEqual("Value");
     * expect(injector.getOptional("invalidToken")).toBe(null);
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.getOptional(Injector)).toBe(injector);
     * ```
     */
    getOptional(token) {
        return this._getByKey(Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    }
    /**
     * @internal
     */
    getAt(index) { return this._strategy.getObjAtIndex(index); }
    /**
     * Parent of this injector.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
     *
     * ```typescript
     * var parent = Injector.resolveAndCreate([]);
     * var child = parent.resolveAndCreateChild([]);
     * expect(child.parent).toBe(parent);
     * ```
     */
    get parent() { return this._parent; }
    /**
     * @internal
     * Internal. Do not use.
     * We return `any` not to export the InjectorStrategy type.
     */
    get internalStrategy() { return this._strategy; }
    /**
     * Resolves an array of providers and creates a child injector from those providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parent = Injector.resolveAndCreate([ParentProvider]);
     * var child = parent.resolveAndCreateChild([ChildProvider]);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     *
     * This function is slower than the corresponding `createChildFromResolved`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
     */
    resolveAndCreateChild(providers) {
        var resolvedProviders = Injector.resolve(providers);
        return this.createChildFromResolved(resolvedProviders);
    }
    /**
     * Creates a child injector from previously resolved providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parentProviders = Injector.resolve([ParentProvider]);
     * var childProviders = Injector.resolve([ChildProvider]);
     *
     * var parent = Injector.fromResolvedProviders(parentProviders);
     * var child = parent.createChildFromResolved(childProviders);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     */
    createChildFromResolved(providers) {
        var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto);
        inj._parent = this;
        return inj;
    }
    /**
     * Resolves a provider and instantiates an object in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     *
     * var car = injector.resolveAndInstantiate(Car);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
     * ```
     */
    resolveAndInstantiate(provider) {
        return this.instantiateResolved(Injector.resolve([provider])[0]);
    }
    /**
     * Instantiates an object using a resolved provider in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     * var carProvider = Injector.resolve([Car])[0];
     * var car = injector.instantiateResolved(carProvider);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.instantiateResolved(carProvider));
     * ```
     */
    instantiateResolved(provider) {
        return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
    }
    /** @internal */
    _new(provider, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new CyclicDependencyError(this, provider.key);
        }
        return this._instantiateProvider(provider, visibility);
    }
    _instantiateProvider(provider, visibility) {
        if (provider.multiProvider) {
            var res = ListWrapper.createFixedSize(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(provider, provider.resolvedFactories[0], visibility);
        }
    }
    _instantiate(provider, resolvedFactory, visibility) {
        var factory = resolvedFactory.factory;
        var deps = resolvedFactory.dependencies;
        var length = deps.length;
        var d0;
        var d1;
        var d2;
        var d3;
        var d4;
        var d5;
        var d6;
        var d7;
        var d8;
        var d9;
        var d10;
        var d11;
        var d12;
        var d13;
        var d14;
        var d15;
        var d16;
        var d17;
        var d18;
        var d19;
        try {
            d0 = length > 0 ? this._getByDependency(provider, deps[0], visibility) : null;
            d1 = length > 1 ? this._getByDependency(provider, deps[1], visibility) : null;
            d2 = length > 2 ? this._getByDependency(provider, deps[2], visibility) : null;
            d3 = length > 3 ? this._getByDependency(provider, deps[3], visibility) : null;
            d4 = length > 4 ? this._getByDependency(provider, deps[4], visibility) : null;
            d5 = length > 5 ? this._getByDependency(provider, deps[5], visibility) : null;
            d6 = length > 6 ? this._getByDependency(provider, deps[6], visibility) : null;
            d7 = length > 7 ? this._getByDependency(provider, deps[7], visibility) : null;
            d8 = length > 8 ? this._getByDependency(provider, deps[8], visibility) : null;
            d9 = length > 9 ? this._getByDependency(provider, deps[9], visibility) : null;
            d10 = length > 10 ? this._getByDependency(provider, deps[10], visibility) : null;
            d11 = length > 11 ? this._getByDependency(provider, deps[11], visibility) : null;
            d12 = length > 12 ? this._getByDependency(provider, deps[12], visibility) : null;
            d13 = length > 13 ? this._getByDependency(provider, deps[13], visibility) : null;
            d14 = length > 14 ? this._getByDependency(provider, deps[14], visibility) : null;
            d15 = length > 15 ? this._getByDependency(provider, deps[15], visibility) : null;
            d16 = length > 16 ? this._getByDependency(provider, deps[16], visibility) : null;
            d17 = length > 17 ? this._getByDependency(provider, deps[17], visibility) : null;
            d18 = length > 18 ? this._getByDependency(provider, deps[18], visibility) : null;
            d19 = length > 19 ? this._getByDependency(provider, deps[19], visibility) : null;
        }
        catch (e) {
            if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
                e.addKey(this, provider.key);
            }
            throw e;
        }
        var obj;
        try {
            switch (length) {
                case 0:
                    obj = factory();
                    break;
                case 1:
                    obj = factory(d0);
                    break;
                case 2:
                    obj = factory(d0, d1);
                    break;
                case 3:
                    obj = factory(d0, d1, d2);
                    break;
                case 4:
                    obj = factory(d0, d1, d2, d3);
                    break;
                case 5:
                    obj = factory(d0, d1, d2, d3, d4);
                    break;
                case 6:
                    obj = factory(d0, d1, d2, d3, d4, d5);
                    break;
                case 7:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6);
                    break;
                case 8:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                    break;
                case 9:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                    break;
                case 10:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                    break;
                case 11:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                    break;
                case 12:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                    break;
                case 13:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                    break;
                case 14:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                    break;
                case 15:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                    break;
                case 16:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                    break;
                case 17:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                    break;
                case 18:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                    break;
                case 19:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                    break;
                case 20:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                    break;
                default:
                    throw new BaseException(`Cannot instantiate '${provider.key.displayName}' because it has more than 20 dependencies`);
            }
        }
        catch (e) {
            throw new InstantiationError(this, e, e.stack, provider.key);
        }
        return obj;
    }
    _getByDependency(provider, dep, providerVisibility) {
        var special = isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, provider, dep) :
            UNDEFINED;
        if (special !== UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, providerVisibility);
        }
    }
    _getByKey(key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof SelfMetadata) {
            return this._getByKeySelf(key, optional, providerVisibility);
        }
        else if (upperBoundVisibility instanceof HostMetadata) {
            return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
        }
    }
    /** @internal */
    _throwOrNull(key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new NoProviderError(this, key);
        }
    }
    /** @internal */
    _getByKeySelf(key, optional, providerVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
        return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
    }
    /** @internal */
    _getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof SkipSelfMetadata) {
            if (inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== UNDEFINED)
                return obj;
            if (isPresent(inj._parent) && inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    }
    /** @internal */
    _getPrivateDependency(key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
    }
    /** @internal */
    _getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof SkipSelfMetadata) {
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== UNDEFINED)
                return obj;
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    }
    get displayName() {
        return `Injector(providers: [${_mapProviders(this, (b) => ` '${b.key.displayName}' `).join(", ")}])`;
    }
    toString() { return this.displayName; }
}
var INJECTOR_KEY = Key.get(Injector);
function _mapProviders(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
        res.push(fn(injector._proto.getProviderAtIndex(i)));
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6WyJWaXNpYmlsaXR5IiwiY2FuU2VlIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSIsIlByb3RvSW5qZWN0b3IiLCJQcm90b0luamVjdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJQcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleCIsIkluamVjdG9ySW5saW5lU3RyYXRlZ3kiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5Lmluc3RhbnRpYXRlUHJvdmlkZXIiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakJ5S2V5SWQiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE1heE51bWJlck9mT2JqZWN0cyIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZCIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRNYXhOdW1iZXJPZk9iamVjdHMiLCJQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdmlkZXJXaXRoVmlzaWJpbGl0eS5jb25zdHJ1Y3RvciIsIlByb3ZpZGVyV2l0aFZpc2liaWxpdHkuZ2V0S2V5SWQiLCJJbmplY3RvciIsIkluamVjdG9yLmNvbnN0cnVjdG9yIiwiSW5qZWN0b3IucmVzb2x2ZSIsIkluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRCaW5kaW5ncyIsIkluamVjdG9yLmhvc3RCb3VuZGFyeSIsIkluamVjdG9yLmRlYnVnQ29udGV4dCIsIkluamVjdG9yLmdldCIsIkluamVjdG9yLmdldE9wdGlvbmFsIiwiSW5qZWN0b3IuZ2V0QXQiLCJJbmplY3Rvci5wYXJlbnQiLCJJbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5IiwiSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkIiwiSW5qZWN0b3IuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQiLCJJbmplY3Rvci5yZXNvbHZlQW5kSW5zdGFudGlhdGUiLCJJbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkIiwiSW5qZWN0b3IuX25ldyIsIkluamVjdG9yLl9pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3IuX2luc3RhbnRpYXRlIiwiSW5qZWN0b3IuX2dldEJ5RGVwZW5kZW5jeSIsIkluamVjdG9yLl9nZXRCeUtleSIsIkluamVjdG9yLl90aHJvd09yTnVsbCIsIkluamVjdG9yLl9nZXRCeUtleVNlbGYiLCJJbmplY3Rvci5fZ2V0QnlLZXlIb3N0IiwiSW5qZWN0b3IuX2dldFByaXZhdGVEZXBlbmRlbmN5IiwiSW5qZWN0b3IuX2dldEJ5S2V5RGVmYXVsdCIsIkluamVjdG9yLmRpc3BsYXlOYW1lIiwiSW5qZWN0b3IudG9TdHJpbmciLCJfbWFwUHJvdmlkZXJzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFrQixXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBb0YsZ0JBQWdCLEVBQUMsTUFBTSxZQUFZO09BQ3ZILEVBQUMscUJBQXFCLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixFQUFFLGtCQUFrQixFQUF3QixnQkFBZ0IsRUFBQyxNQUFNLGNBQWM7T0FDL0ksRUFBd0IsU0FBUyxFQUFXLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUN2RixFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLEdBQUcsRUFBQyxNQUFNLE9BQU87T0FDbEIsRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sWUFBWTtBQUV2RSxvQ0FBb0M7QUFDcEMsTUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUM7QUFFckMsYUFBYSxTQUFTLEdBQVcsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztBQUUxRDs7R0FFRztBQUNILFdBQVksVUFhWDtBQWJELFdBQVksVUFBVTtJQUNwQkE7O09BRUdBO0lBQ0hBLCtDQUFNQSxDQUFBQTtJQUNOQTs7T0FFR0E7SUFDSEEsaURBQU9BLENBQUFBO0lBQ1BBOztPQUVHQTtJQUNIQSxtRUFBZ0JBLENBQUFBO0FBQ2xCQSxDQUFDQSxFQWJXLFVBQVUsS0FBVixVQUFVLFFBYXJCO0FBRUQsZ0JBQWdCLEdBQWUsRUFBRSxHQUFlO0lBQzlDQyxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxHQUFHQSxDQUFDQTtRQUNoQkEsQ0FBQ0EsR0FBR0EsS0FBS0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxHQUFHQSxLQUFLQSxVQUFVQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO0FBQ25GQSxDQUFDQTtBQVFEO0lBa0NFQyxZQUFZQSxPQUFzQkEsRUFBRUEsR0FBNkJBO1FBakNqRUMsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBRW5DQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUV0QkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBRzdCQSxJQUFJQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREQsa0JBQWtCQSxDQUFDQSxLQUFhQTtRQUM5QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLE1BQU1BLElBQUlBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBRURGLHNCQUFzQkEsQ0FBQ0EsUUFBa0JBO1FBQ3ZDRyxNQUFNQSxDQUFDQSxJQUFJQSxzQkFBc0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ3BEQSxDQUFDQTtBQUNISCxDQUFDQTtBQUVEO0lBS0VJLFlBQVlBLFFBQXVCQSxFQUFFQSxHQUE2QkE7UUFDaEVDLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBO1FBRXJCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxX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QUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7SUFDbkJBLENBQUNBO0lBRURKLGFBQWFBLENBQUNBLEtBQWFBO1FBQ3pCSyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsTUFBTUEsSUFBSUEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNwQ0Es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Q0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsRUFBT0EsQ0FBQ0E7UUFDWkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsR0FBUUEsQ0FBQ0E7UUFDYkEsSUFBSUEsQ0FBQ0E7WUFDSEEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5RUEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqRkEsR0FBR0EsR0FBR0EsTUFBTUEsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuRkEsQ0FBRUE7UUFBQUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEscUJBQXFCQSxJQUFJQSxDQUFDQSxZQUFZQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO1FBRURBLElBQUlBLEdBQUdBLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBO1lBQ0hBLE1BQU1BLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUNmQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsRUFBRUEsQ0FBQ0E7b0JBQ2hCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO29CQUNsQkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDdEJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUM5QkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbENBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3RDQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMxQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDOUNBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xEQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUN0REEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDM0RBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hFQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNyRUEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDMUVBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQy9FQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNwRkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDekZBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FDVEEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BGQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQ1RBLEVBQUVBLEVBQUVBLEVBQUVB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Q0FBQ0EsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDYkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Jlc29sdmVkUHJvdmlkZXIsIFByb3ZpZGVyLCBEZXBlbmRlbmN5LCBQcm92aWRlckJ1aWxkZXIsIFJlc29sdmVkRmFjdG9yeSwgcHJvdmlkZSwgcmVzb2x2ZVByb3ZpZGVyc30gZnJvbSAnLi9wcm92aWRlcic7XG5pbXBvcnQge0Fic3RyYWN0UHJvdmlkZXJFcnJvciwgTm9Qcm92aWRlckVycm9yLCBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsIEluc3RhbnRpYXRpb25FcnJvciwgSW52YWxpZFByb3ZpZGVyRXJyb3IsIE91dE9mQm91bmRzRXJyb3J9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge0Z1bmN0aW9uV3JhcHBlciwgVHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7U2VsZk1ldGFkYXRhLCBIb3N0TWV0YWRhdGEsIFNraXBTZWxmTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGEnO1xuXG4vLyBUaHJlc2hvbGQgZm9yIHRoZSBkeW5hbWljIHZlcnNpb25cbmNvbnN0IF9NQVhfQ09OU1RSVUNUSU9OX0NPVU5URVIgPSAxMDtcblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRDogT2JqZWN0ID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG4vKipcbiAqIFZpc2liaWxpdHkgb2YgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgZW51bSBWaXNpYmlsaXR5IHtcbiAgLyoqXG4gICAqIEEgYFB1YmxpY2Age0BsaW5rIFByb3ZpZGVyfSBpcyBvbmx5IHZpc2libGUgdG8gcmVndWxhciAoYXMgb3Bwb3NlZCB0byBob3N0KSBjaGlsZCBpbmplY3RvcnMuXG4gICAqL1xuICBQdWJsaWMsXG4gIC8qKlxuICAgKiBBIGBQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIG9ubHkgdmlzaWJsZSB0byBob3N0IChhcyBvcHBvc2VkIHRvIHJlZ3VsYXIpIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFByaXZhdGUsXG4gIC8qKlxuICAgKiBBIGBQdWJsaWNBbmRQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIHZpc2libGUgdG8gYm90aCBob3N0IGFuZCByZWd1bGFyIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFB1YmxpY0FuZFByaXZhdGVcbn1cblxuZnVuY3Rpb24gY2FuU2VlKHNyYzogVmlzaWJpbGl0eSwgZHN0OiBWaXNpYmlsaXR5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoc3JjID09PSBkc3QpIHx8XG4gICAgICAoZHN0ID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgfHwgc3JjID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyO1xuICBjcmVhdGVJbmplY3RvclN0cmF0ZWd5KGluajogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5O1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgcHJvdmlkZXIwOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIxOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIyOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIzOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI0OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI1OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI2OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI3OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI4OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI5OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcblxuICBrZXlJZDA6IG51bWJlciA9IG51bGw7XG4gIGtleUlkMTogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQyOiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDM6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNDogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ1OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDY6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNzogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ4OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDk6IG51bWJlciA9IG51bGw7XG5cbiAgdmlzaWJpbGl0eTA6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5MTogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHkyOiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTM6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NDogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk1OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTY6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NzogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk4OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTk6IFZpc2liaWxpdHkgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RvRUk6IFByb3RvSW5qZWN0b3IsIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIGxlbmd0aCA9IGJ3di5sZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm92aWRlcjAgPSBid3ZbMF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMCA9IGJ3dlswXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MCA9IGJ3dlswXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5wcm92aWRlcjEgPSBid3ZbMV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMSA9IGJ3dlsxXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MSA9IGJ3dlsxXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5wcm92aWRlcjIgPSBid3ZbMl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMiA9IGJ3dlsyXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MiA9IGJ3dlsyXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMykge1xuICAgICAgdGhpcy5wcm92aWRlcjMgPSBid3ZbM10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMyA9IGJ3dlszXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MyA9IGJ3dlszXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNCkge1xuICAgICAgdGhpcy5wcm92aWRlcjQgPSBid3ZbNF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNCA9IGJ3dls0XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NCA9IGJ3dls0XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNSkge1xuICAgICAgdGhpcy5wcm92aWRlcjUgPSBid3ZbNV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNSA9IGJ3dls1XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NSA9IGJ3dls1XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNikge1xuICAgICAgdGhpcy5wcm92aWRlcjYgPSBid3ZbNl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNiA9IGJ3dls2XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NiA9IGJ3dls2XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNykge1xuICAgICAgdGhpcy5wcm92aWRlcjcgPSBid3ZbN10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNyA9IGJ3dls3XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NyA9IGJ3dls3XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOCkge1xuICAgICAgdGhpcy5wcm92aWRlcjggPSBid3ZbOF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOCA9IGJ3dls4XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OCA9IGJ3dls4XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOSkge1xuICAgICAgdGhpcy5wcm92aWRlcjkgPSBid3ZbOV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOSA9IGJ3dls5XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OSA9IGJ3dls5XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybiB0aGlzLnByb3ZpZGVyMDtcbiAgICBpZiAoaW5kZXggPT0gMSkgcmV0dXJuIHRoaXMucHJvdmlkZXIxO1xuICAgIGlmIChpbmRleCA9PSAyKSByZXR1cm4gdGhpcy5wcm92aWRlcjI7XG4gICAgaWYgKGluZGV4ID09IDMpIHJldHVybiB0aGlzLnByb3ZpZGVyMztcbiAgICBpZiAoaW5kZXggPT0gNCkgcmV0dXJuIHRoaXMucHJvdmlkZXI0O1xuICAgIGlmIChpbmRleCA9PSA1KSByZXR1cm4gdGhpcy5wcm92aWRlcjU7XG4gICAgaWYgKGluZGV4ID09IDYpIHJldHVybiB0aGlzLnByb3ZpZGVyNjtcbiAgICBpZiAoaW5kZXggPT0gNykgcmV0dXJuIHRoaXMucHJvdmlkZXI3O1xuICAgIGlmIChpbmRleCA9PSA4KSByZXR1cm4gdGhpcy5wcm92aWRlcjg7XG4gICAgaWYgKGluZGV4ID09IDkpIHJldHVybiB0aGlzLnByb3ZpZGVyOTtcbiAgICB0aHJvdyBuZXcgT3V0T2ZCb3VuZHNFcnJvcihpbmRleCk7XG4gIH1cblxuICBjcmVhdGVJbmplY3RvclN0cmF0ZWd5KGluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yU3RyYXRlZ3kge1xuICAgIHJldHVybiBuZXcgSW5qZWN0b3JJbmxpbmVTdHJhdGVneShpbmplY3RvciwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kgaW1wbGVtZW50cyBQcm90b0luamVjdG9yU3RyYXRlZ3kge1xuICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXTtcbiAga2V5SWRzOiBudW1iZXJbXTtcbiAgdmlzaWJpbGl0aWVzOiBWaXNpYmlsaXR5W107XG5cbiAgY29uc3RydWN0b3IocHJvdG9Jbmo6IFByb3RvSW5qZWN0b3IsIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIGxlbiA9IGJ3di5sZW5ndGg7XG5cbiAgICB0aGlzLnByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMua2V5SWRzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy52aXNpYmlsaXRpZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMucHJvdmlkZXJzW2ldID0gYnd2W2ldLnByb3ZpZGVyO1xuICAgICAgdGhpcy5rZXlJZHNbaV0gPSBid3ZbaV0uZ2V0S2V5SWQoKTtcbiAgICAgIHRoaXMudmlzaWJpbGl0aWVzW2ldID0gYnd2W2ldLnZpc2liaWxpdHk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMucHJvdmlkZXJzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm92aWRlcnNbaW5kZXhdO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3JTdHJhdGVneShlaTogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5IHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5KHRoaXMsIGVpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvciB7XG4gIHN0YXRpYyBmcm9tUmVzb2x2ZWRQcm92aWRlcnMocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBQcm90b0luamVjdG9yIHtcbiAgICB2YXIgYmQgPSBwcm92aWRlcnMubWFwKGIgPT4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5QdWJsaWMpKTtcbiAgICByZXR1cm4gbmV3IFByb3RvSW5qZWN0b3IoYmQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyYXRlZ3k6IFByb3RvSW5qZWN0b3JTdHJhdGVneTtcbiAgbnVtYmVyT2ZQcm92aWRlcnM6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihid3Y6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHRoaXMubnVtYmVyT2ZQcm92aWRlcnMgPSBid3YubGVuZ3RoO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gYnd2Lmxlbmd0aCA+IF9NQVhfQ09OU1RSVUNUSU9OX0NPVU5URVIgP1xuICAgICAgICBuZXcgUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSh0aGlzLCBid3YpIDpcbiAgICAgICAgbmV3IFByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneSh0aGlzLCBid3YpO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyYXRlZ3kuZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4KTtcbiAgfVxufVxuXG5cblxuZXhwb3J0IGludGVyZmFjZSBJbmplY3RvclN0cmF0ZWd5IHtcbiAgZ2V0T2JqQnlLZXlJZChrZXlJZDogbnVtYmVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55O1xuICBnZXRPYmpBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnk7XG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXI7XG5cbiAgcmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk6IHZvaWQ7XG4gIGluc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgSW5qZWN0b3JTdHJhdGVneSB7XG4gIG9iajA6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqMTogYW55ID0gVU5ERUZJTkVEO1xuICBvYmoyOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajM6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNDogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo1OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajY6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNzogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo4OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajk6IGFueSA9IFVOREVGSU5FRDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgcHJvdG9TdHJhdGVneTogUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5KSB7fVxuXG4gIHJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpOiB2b2lkIHsgdGhpcy5pbmplY3Rvci5fY29uc3RydWN0aW9uQ291bnRlciA9IDA7IH1cblxuICBpbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5fbmV3KHByb3ZpZGVyLCB2aXNpYmlsaXR5KTtcbiAgfVxuXG4gIGdldE9iakJ5S2V5SWQoa2V5SWQ6IG51bWJlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIHAgPSB0aGlzLnByb3RvU3RyYXRlZ3k7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3I7XG5cbiAgICBpZiAocC5rZXlJZDAgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkwLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMCA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMCA9IGluai5fbmV3KHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajA7XG4gICAgfVxuICAgIGlmIChwLmtleUlkMSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTEsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmoxID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmoxID0gaW5qLl9uZXcocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqMTtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQyID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MiwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajIgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajIgPSBpbmouX25ldyhwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmoyO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDMgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkzLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMyA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMyA9IGluai5fbmV3KHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajM7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNCA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTQsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo0ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo0ID0gaW5qLl9uZXcocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNDtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ1ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5NSwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajUgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajUgPSBpbmouX25ldyhwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo1O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDYgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk2LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNiA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNiA9IGluai5fbmV3KHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajY7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNyA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTcsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo3ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo3ID0gaW5qLl9uZXcocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNztcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ4ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5OCwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajggPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajggPSBpbmouX25ldyhwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo4O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDkgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk5LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqOSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqOSA9IGluai5fbmV3KHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIGdldE9iakF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybiB0aGlzLm9iajA7XG4gICAgaWYgKGluZGV4ID09IDEpIHJldHVybiB0aGlzLm9iajE7XG4gICAgaWYgKGluZGV4ID09IDIpIHJldHVybiB0aGlzLm9iajI7XG4gICAgaWYgKGluZGV4ID09IDMpIHJldHVybiB0aGlzLm9iajM7XG4gICAgaWYgKGluZGV4ID09IDQpIHJldHVybiB0aGlzLm9iajQ7XG4gICAgaWYgKGluZGV4ID09IDUpIHJldHVybiB0aGlzLm9iajU7XG4gICAgaWYgKGluZGV4ID09IDYpIHJldHVybiB0aGlzLm9iajY7XG4gICAgaWYgKGluZGV4ID09IDcpIHJldHVybiB0aGlzLm9iajc7XG4gICAgaWYgKGluZGV4ID09IDgpIHJldHVybiB0aGlzLm9iajg7XG4gICAgaWYgKGluZGV4ID09IDkpIHJldHVybiB0aGlzLm9iajk7XG4gICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICB9XG5cbiAgZ2V0TWF4TnVtYmVyT2ZPYmplY3RzKCk6IG51bWJlciB7IHJldHVybiBfTUFYX0NPTlNUUlVDVElPTl9DT1VOVEVSOyB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IGltcGxlbWVudHMgSW5qZWN0b3JTdHJhdGVneSB7XG4gIG9ianM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm90b1N0cmF0ZWd5OiBQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5vYmpzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHByb3RvU3RyYXRlZ3kucHJvdmlkZXJzLmxlbmd0aCk7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLm9ianMsIFVOREVGSU5FRCk7XG4gIH1cblxuICByZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTogdm9pZCB7IHRoaXMuaW5qZWN0b3IuX2NvbnN0cnVjdGlvbkNvdW50ZXIgPSAwOyB9XG5cbiAgaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuX25ldyhwcm92aWRlciwgdmlzaWJpbGl0eSk7XG4gIH1cblxuICBnZXRPYmpCeUtleUlkKGtleUlkOiBudW1iZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBwID0gdGhpcy5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAua2V5SWRzW2ldID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXRpZXNbaV0sIHZpc2liaWxpdHkpKSB7XG4gICAgICAgIGlmICh0aGlzLm9ianNbaV0gPT09IFVOREVGSU5FRCkge1xuICAgICAgICAgIHRoaXMub2Jqc1tpXSA9IHRoaXMuaW5qZWN0b3IuX25ldyhwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub2Jqc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgZ2V0T2JqQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMub2Jqcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vYmpzW2luZGV4XTtcbiAgfVxuXG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5vYmpzLmxlbmd0aDsgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgcHVibGljIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpe307XG5cbiAgZ2V0S2V5SWQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMucHJvdmlkZXIua2V5LmlkOyB9XG59XG5cbi8qKlxuICogVXNlZCB0byBwcm92aWRlIGRlcGVuZGVuY2llcyB0aGF0IGNhbm5vdCBiZSBlYXNpbHkgZXhwcmVzc2VkIGFzIHByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZXBlbmRlbmN5UHJvdmlkZXIge1xuICBnZXREZXBlbmRlbmN5KGluamVjdG9yOiBJbmplY3RvciwgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpOiBhbnk7XG59XG5cbi8qKlxuICogQSBkZXBlbmRlbmN5IGluamVjdGlvbiBjb250YWluZXIgdXNlZCBmb3IgaW5zdGFudGlhdGluZyBvYmplY3RzIGFuZCByZXNvbHZpbmcgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEFuIGBJbmplY3RvcmAgaXMgYSByZXBsYWNlbWVudCBmb3IgYSBgbmV3YCBvcGVyYXRvciwgd2hpY2ggY2FuIGF1dG9tYXRpY2FsbHkgcmVzb2x2ZSB0aGVcbiAqIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBJbiB0eXBpY2FsIHVzZSwgYXBwbGljYXRpb24gY29kZSBhc2tzIGZvciB0aGUgZGVwZW5kZW5jaWVzIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhleSBhcmVcbiAqIHJlc29sdmVkIGJ5IHRoZSBgSW5qZWN0b3JgLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9qemplYzA/cD1wcmV2aWV3KSlcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhbiBgSW5qZWN0b3JgIGNvbmZpZ3VyZWQgdG8gY3JlYXRlIGBFbmdpbmVgIGFuZCBgQ2FyYC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBFbmdpbmUge1xuICogfVxuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIENhciB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICogfVxuICpcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0NhciwgRW5naW5lXSk7XG4gKiB2YXIgY2FyID0gaW5qZWN0b3IuZ2V0KENhcik7XG4gKiBleHBlY3QoY2FyIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICogZXhwZWN0KGNhci5lbmdpbmUgaW5zdGFuY2VvZiBFbmdpbmUpLnRvQmUodHJ1ZSk7XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UsIHdlIGRvbid0IHVzZSB0aGUgYG5ld2Agb3BlcmF0b3IgYmVjYXVzZSB3ZSBleHBsaWNpdGx5IHdhbnQgdG8gaGF2ZSB0aGUgYEluamVjdG9yYFxuICogcmVzb2x2ZSBhbGwgb2YgdGhlIG9iamVjdCdzIGRlcGVuZGVuY2llcyBhdXRvbWF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgSW5qZWN0b3Ige1xuICAvKipcbiAgICogVHVybnMgYW4gYXJyYXkgb2YgcHJvdmlkZXIgZGVmaW5pdGlvbnMgaW50byBhbiBhcnJheSBvZiByZXNvbHZlZCBwcm92aWRlcnMuXG4gICAqXG4gICAqIEEgcmVzb2x1dGlvbiBpcyBhIHByb2Nlc3Mgb2YgZmxhdHRlbmluZyBtdWx0aXBsZSBuZXN0ZWQgYXJyYXlzIGFuZCBjb252ZXJ0aW5nIGluZGl2aWR1YWxcbiAgICogcHJvdmlkZXJzIGludG8gYW4gYXJyYXkgb2Yge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0FpWFRIaT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NhciwgW1tFbmdpbmVdXV0pO1xuICAgKlxuICAgKiBleHBlY3QocHJvdmlkZXJzLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVyc1swXSBpbnN0YW5jZW9mIFJlc29sdmVkUHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0ua2V5LmRpc3BsYXlOYW1lKS50b0JlKFwiQ2FyXCIpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmRlcGVuZGVuY2llcy5sZW5ndGgpLnRvRXF1YWwoMSk7XG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0uZmFjdG9yeSkudG9CZURlZmluZWQoKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVyc1sxXS5rZXkuZGlzcGxheU5hbWUpLnRvQmUoXCJFbmdpbmVcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogU2VlIHtAbGluayBJbmplY3RvciNmcm9tUmVzb2x2ZWRQcm92aWRlcnN9IGZvciBtb3JlIGluZm8uXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZShwcm92aWRlcnM6IEFycmF5PFR5cGV8UHJvdmlkZXJ8YW55W10+KTogUmVzb2x2ZWRQcm92aWRlcltdIHtcbiAgICByZXR1cm4gcmVzb2x2ZVByb3ZpZGVycyhwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGFuIGFycmF5IG9mIHByb3ZpZGVycyBhbmQgY3JlYXRlcyBhbiBpbmplY3RvciBmcm9tIHRob3NlIHByb3ZpZGVycy5cbiAgICpcbiAgICogVGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgY2FuIGJlIGFuIGFycmF5IG9mIGBUeXBlYCwge0BsaW5rIFByb3ZpZGVyfSxcbiAgICogb3IgYSByZWN1cnNpdmUgYXJyYXkgb2YgbW9yZSBwcm92aWRlcnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lUE9jY0E/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0NhciwgRW5naW5lXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoQ2FyKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgc2xvd2VyIHRoYW4gdGhlIGNvcnJlc3BvbmRpbmcgYGZyb21SZXNvbHZlZFByb3ZpZGVyc2BcbiAgICogYmVjYXVzZSBpdCBuZWVkcyB0byByZXNvbHZlIHRoZSBwYXNzZWQtaW4gcHJvdmlkZXJzIGZpcnN0LlxuICAgKiBTZWUge0BsaW5rIEluamVjdG9yI3Jlc29sdmV9IGFuZCB7QGxpbmsgSW5qZWN0b3IjZnJvbVJlc29sdmVkUHJvdmlkZXJzfS5cbiAgICovXG4gIHN0YXRpYyByZXNvbHZlQW5kQ3JlYXRlKHByb3ZpZGVyczogQXJyYXk8VHlwZXxQcm92aWRlcnxhbnlbXT4pOiBJbmplY3RvciB7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShwcm92aWRlcnMpO1xuICAgIHJldHVybiBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWRQcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5qZWN0b3IgZnJvbSBwcmV2aW91c2x5IHJlc29sdmVkIHByb3ZpZGVycy5cbiAgICpcbiAgICogVGhpcyBBUEkgaXMgdGhlIHJlY29tbWVuZGVkIHdheSB0byBjb25zdHJ1Y3QgaW5qZWN0b3JzIGluIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBwYXJ0cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tyU01jaT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NhciwgRW5naW5lXSk7XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yKFByb3RvSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc29sdmVkQmluZGluZ3MocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyYXRlZ3k6IEluamVjdG9yU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnN0cnVjdGlvbkNvdW50ZXI6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wcm90bzogYW55IC8qIFByb3RvSW5qZWN0b3IgKi87XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yO1xuICAvKipcbiAgICogUHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBfcHJvdG86IGFueSAvKiBQcm90b0luamVjdG9yICovLCBfcGFyZW50OiBJbmplY3RvciA9IG51bGwsXG4gICAgICBwcml2YXRlIF9pc0hvc3RCb3VuZGFyeTogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgcHJpdmF0ZSBfZGVwUHJvdmlkZXI6IGFueSAvKiBEZXBlbmRlbmN5UHJvdmlkZXIgKi8gPSBudWxsLFxuICAgICAgcHJpdmF0ZSBfZGVidWdDb250ZXh0OiBGdW5jdGlvbiA9IG51bGwpIHtcbiAgICB0aGlzLl9wcm90byA9IF9wcm90bztcbiAgICB0aGlzLl9wYXJlbnQgPSBfcGFyZW50O1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gX3Byb3RvLl9zdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBpbmplY3RvciBpcyBhIGJvdW5kYXJ5IHRvIGEgaG9zdC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBnZXQgaG9zdEJvdW5kYXJ5KCkgeyByZXR1cm4gdGhpcy5faXNIb3N0Qm91bmRhcnk7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBkZWJ1Z0NvbnRleHQoKTogYW55IHsgcmV0dXJuIHRoaXMuX2RlYnVnQ29udGV4dCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdG9rZW4uXG4gICAqIFRocm93cyB7QGxpbmsgTm9Qcm92aWRlckVycm9yfSBpZiBub3QgZm91bmQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9IZVhTSGc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKFwidmFsaWRUb2tlblwiLCB7dXNlVmFsdWU6IFwiVmFsdWVcIn0pXG4gICAqIF0pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwidmFsaWRUb2tlblwiKSkudG9FcXVhbChcIlZhbHVlXCIpO1xuICAgKiBleHBlY3QoKCkgPT4gaW5qZWN0b3IuZ2V0KFwiaW52YWxpZFRva2VuXCIpKS50b1Rocm93RXJyb3IoKTtcbiAgICogYGBgXG4gICAqXG4gICAqIGBJbmplY3RvcmAgcmV0dXJucyBpdHNlbGYgd2hlbiBnaXZlbiBgSW5qZWN0b3JgIGFzIGEgdG9rZW4uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoSW5qZWN0b3IpKS50b0JlKGluamVjdG9yKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQodG9rZW46IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5KEtleS5nZXQodG9rZW4pLCBudWxsLCBudWxsLCBmYWxzZSwgVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBSZXR1cm5zIG51bGwgaWYgbm90IGZvdW5kLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdHBFYkV5P3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShcInZhbGlkVG9rZW5cIiwge3VzZVZhbHVlOiBcIlZhbHVlXCJ9KVxuICAgKiBdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldE9wdGlvbmFsKFwidmFsaWRUb2tlblwiKSkudG9FcXVhbChcIlZhbHVlXCIpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0T3B0aW9uYWwoXCJpbnZhbGlkVG9rZW5cIikpLnRvQmUobnVsbCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBgSW5qZWN0b3JgIHJldHVybnMgaXRzZWxmIHdoZW4gZ2l2ZW4gYEluamVjdG9yYCBhcyBhIHRva2VuLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW10pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0T3B0aW9uYWwoSW5qZWN0b3IpKS50b0JlKGluamVjdG9yKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXRPcHRpb25hbCh0b2tlbjogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXkoS2V5LmdldCh0b2tlbiksIG51bGwsIG51bGwsIHRydWUsIFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBnZXRBdChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmdldE9iakF0SW5kZXgoaW5kZXgpOyB9XG5cbiAgLyoqXG4gICAqIFBhcmVudCBvZiB0aGlzIGluamVjdG9yLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gdGhlIHNlY3Rpb24gb2YgdGhlIHVzZXIgZ3VpZGUgdGFsa2luZyBhYm91dCBoaWVyYXJjaGljYWwgaW5qZWN0aW9uLlxuICAgKiAtLT5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2Vvc01Hbz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBwYXJlbnQgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogdmFyIGNoaWxkID0gcGFyZW50LnJlc29sdmVBbmRDcmVhdGVDaGlsZChbXSk7XG4gICAqIGV4cGVjdChjaGlsZC5wYXJlbnQpLnRvQmUocGFyZW50KTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQgcGFyZW50KCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX3BhcmVudDsgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogSW50ZXJuYWwuIERvIG5vdCB1c2UuXG4gICAqIFdlIHJldHVybiBgYW55YCBub3QgdG8gZXhwb3J0IHRoZSBJbmplY3RvclN0cmF0ZWd5IHR5cGUuXG4gICAqL1xuICBnZXQgaW50ZXJuYWxTdHJhdGVneSgpOiBhbnkgeyByZXR1cm4gdGhpcy5fc3RyYXRlZ3k7IH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgYW4gYXJyYXkgb2YgcHJvdmlkZXJzIGFuZCBjcmVhdGVzIGEgY2hpbGQgaW5qZWN0b3IgZnJvbSB0aG9zZSBwcm92aWRlcnMuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byB0aGUgc2VjdGlvbiBvZiB0aGUgdXNlciBndWlkZSB0YWxraW5nIGFib3V0IGhpZXJhcmNoaWNhbCBpbmplY3Rpb24uXG4gICAqIC0tPlxuICAgKlxuICAgKiBUaGUgcGFzc2VkLWluIHByb3ZpZGVycyBjYW4gYmUgYW4gYXJyYXkgb2YgYFR5cGVgLCB7QGxpbmsgUHJvdmlkZXJ9LFxuICAgKiBvciBhIHJlY3Vyc2l2ZSBhcnJheSBvZiBtb3JlIHByb3ZpZGVycy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L29wQjNUND9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFBhcmVudFByb3ZpZGVyIHt9XG4gICAqIGNsYXNzIENoaWxkUHJvdmlkZXIge31cbiAgICpcbiAgICogdmFyIHBhcmVudCA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1BhcmVudFByb3ZpZGVyXSk7XG4gICAqIHZhciBjaGlsZCA9IHBhcmVudC5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoW0NoaWxkUHJvdmlkZXJdKTtcbiAgICpcbiAgICogZXhwZWN0KGNoaWxkLmdldChQYXJlbnRQcm92aWRlcikgaW5zdGFuY2VvZiBQYXJlbnRQcm92aWRlcikudG9CZSh0cnVlKTtcbiAgICogZXhwZWN0KGNoaWxkLmdldChDaGlsZFByb3ZpZGVyKSBpbnN0YW5jZW9mIENoaWxkUHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChjaGlsZC5nZXQoUGFyZW50UHJvdmlkZXIpKS50b0JlKHBhcmVudC5nZXQoUGFyZW50UHJvdmlkZXIpKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgc2xvd2VyIHRoYW4gdGhlIGNvcnJlc3BvbmRpbmcgYGNyZWF0ZUNoaWxkRnJvbVJlc29sdmVkYFxuICAgKiBiZWNhdXNlIGl0IG5lZWRzIHRvIHJlc29sdmUgdGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgZmlyc3QuXG4gICAqIFNlZSB7QGxpbmsgSW5qZWN0b3IjcmVzb2x2ZX0gYW5kIHtAbGluayBJbmplY3RvciNjcmVhdGVDaGlsZEZyb21SZXNvbHZlZH0uXG4gICAqL1xuICByZXNvbHZlQW5kQ3JlYXRlQ2hpbGQocHJvdmlkZXJzOiBBcnJheTxUeXBlfFByb3ZpZGVyfGFueVtdPik6IEluamVjdG9yIHtcbiAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQocmVzb2x2ZWRQcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjaGlsZCBpbmplY3RvciBmcm9tIHByZXZpb3VzbHkgcmVzb2x2ZWQgcHJvdmlkZXJzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gdGhlIHNlY3Rpb24gb2YgdGhlIHVzZXIgZ3VpZGUgdGFsa2luZyBhYm91dCBoaWVyYXJjaGljYWwgaW5qZWN0aW9uLlxuICAgKiAtLT5cbiAgICpcbiAgICogVGhpcyBBUEkgaXMgdGhlIHJlY29tbWVuZGVkIHdheSB0byBjb25zdHJ1Y3QgaW5qZWN0b3JzIGluIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBwYXJ0cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1ZoeWZqTj9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFBhcmVudFByb3ZpZGVyIHt9XG4gICAqIGNsYXNzIENoaWxkUHJvdmlkZXIge31cbiAgICpcbiAgICogdmFyIHBhcmVudFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW1BhcmVudFByb3ZpZGVyXSk7XG4gICAqIHZhciBjaGlsZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NoaWxkUHJvdmlkZXJdKTtcbiAgICpcbiAgICogdmFyIHBhcmVudCA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwYXJlbnRQcm92aWRlcnMpO1xuICAgKiB2YXIgY2hpbGQgPSBwYXJlbnQuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQoY2hpbGRQcm92aWRlcnMpO1xuICAgKlxuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSBpbnN0YW5jZW9mIFBhcmVudFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KENoaWxkUHJvdmlkZXIpIGluc3RhbmNlb2YgQ2hpbGRQcm92aWRlcikudG9CZSh0cnVlKTtcbiAgICogZXhwZWN0KGNoaWxkLmdldChQYXJlbnRQcm92aWRlcikpLnRvQmUocGFyZW50LmdldChQYXJlbnRQcm92aWRlcikpO1xuICAgKiBgYGBcbiAgICovXG4gIGNyZWF0ZUNoaWxkRnJvbVJlc29sdmVkKHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdKTogSW5qZWN0b3Ige1xuICAgIHZhciBiZCA9IHByb3ZpZGVycy5tYXAoYiA9PiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShiLCBWaXNpYmlsaXR5LlB1YmxpYykpO1xuICAgIHZhciBwcm90byA9IG5ldyBQcm90b0luamVjdG9yKGJkKTtcbiAgICB2YXIgaW5qID0gbmV3IEluamVjdG9yKHByb3RvKTtcbiAgICBpbmouX3BhcmVudCA9IHRoaXM7XG4gICAgcmV0dXJuIGluajtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBhIHByb3ZpZGVyIGFuZCBpbnN0YW50aWF0ZXMgYW4gb2JqZWN0IGluIHRoZSBjb250ZXh0IG9mIHRoZSBpbmplY3Rvci5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgb2JqZWN0IGRvZXMgbm90IGdldCBjYWNoZWQgYnkgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQveXZWWG9CP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFbmdpbmUge1xuICAgKiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgQ2FyIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAgICogfVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtFbmdpbmVdKTtcbiAgICpcbiAgICogdmFyIGNhciA9IGluamVjdG9yLnJlc29sdmVBbmRJbnN0YW50aWF0ZShDYXIpO1xuICAgKiBleHBlY3QoY2FyLmVuZ2luZSkudG9CZShpbmplY3Rvci5nZXQoRW5naW5lKSk7XG4gICAqIGV4cGVjdChjYXIpLm5vdC50b0JlKGluamVjdG9yLnJlc29sdmVBbmRJbnN0YW50aWF0ZShDYXIpKTtcbiAgICogYGBgXG4gICAqL1xuICByZXNvbHZlQW5kSW5zdGFudGlhdGUocHJvdmlkZXI6IFR5cGV8UHJvdmlkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmluc3RhbnRpYXRlUmVzb2x2ZWQoSW5qZWN0b3IucmVzb2x2ZShbcHJvdmlkZXJdKVswXSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zdGFudGlhdGVzIGFuIG9iamVjdCB1c2luZyBhIHJlc29sdmVkIHByb3ZpZGVyIGluIHRoZSBjb250ZXh0IG9mIHRoZSBpbmplY3Rvci5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgb2JqZWN0IGRvZXMgbm90IGdldCBjYWNoZWQgYnkgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvcHRDSW1RP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFbmdpbmUge1xuICAgKiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgQ2FyIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAgICogfVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtFbmdpbmVdKTtcbiAgICogdmFyIGNhclByb3ZpZGVyID0gSW5qZWN0b3IucmVzb2x2ZShbQ2FyXSlbMF07XG4gICAqIHZhciBjYXIgPSBpbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkKGNhclByb3ZpZGVyKTtcbiAgICogZXhwZWN0KGNhci5lbmdpbmUpLnRvQmUoaW5qZWN0b3IuZ2V0KEVuZ2luZSkpO1xuICAgKiBleHBlY3QoY2FyKS5ub3QudG9CZShpbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkKGNhclByb3ZpZGVyKSk7XG4gICAqIGBgYFxuICAgKi9cbiAgaW5zdGFudGlhdGVSZXNvbHZlZChwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlcik6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXIsIFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9uZXcocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIGlmICh0aGlzLl9jb25zdHJ1Y3Rpb25Db3VudGVyKysgPiB0aGlzLl9zdHJhdGVneS5nZXRNYXhOdW1iZXJPZk9iamVjdHMoKSkge1xuICAgICAgdGhyb3cgbmV3IEN5Y2xpY0RlcGVuZGVuY3lFcnJvcih0aGlzLCBwcm92aWRlci5rZXkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlciwgdmlzaWJpbGl0eSk7XG4gIH1cblxuICBwcml2YXRlIF9pbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlcikge1xuICAgICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllcy5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgICByZXNbaV0gPSB0aGlzLl9pbnN0YW50aWF0ZShwcm92aWRlciwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXNbaV0sIHZpc2liaWxpdHkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbnRpYXRlKHByb3ZpZGVyLCBwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllc1swXSwgdmlzaWJpbGl0eSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaW5zdGFudGlhdGUoXG4gICAgICBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgcmVzb2x2ZWRGYWN0b3J5OiBSZXNvbHZlZEZhY3RvcnksIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBmYWN0b3J5ID0gcmVzb2x2ZWRGYWN0b3J5LmZhY3Rvcnk7XG4gICAgdmFyIGRlcHMgPSByZXNvbHZlZEZhY3RvcnkuZGVwZW5kZW5jaWVzO1xuICAgIHZhciBsZW5ndGggPSBkZXBzLmxlbmd0aDtcblxuICAgIHZhciBkMDogYW55O1xuICAgIHZhciBkMTogYW55O1xuICAgIHZhciBkMjogYW55O1xuICAgIHZhciBkMzogYW55O1xuICAgIHZhciBkNDogYW55O1xuICAgIHZhciBkNTogYW55O1xuICAgIHZhciBkNjogYW55O1xuICAgIHZhciBkNzogYW55O1xuICAgIHZhciBkODogYW55O1xuICAgIHZhciBkOTogYW55O1xuICAgIHZhciBkMTA6IGFueTtcbiAgICB2YXIgZDExOiBhbnk7XG4gICAgdmFyIGQxMjogYW55O1xuICAgIHZhciBkMTM6IGFueTtcbiAgICB2YXIgZDE0OiBhbnk7XG4gICAgdmFyIGQxNTogYW55O1xuICAgIHZhciBkMTY6IGFueTtcbiAgICB2YXIgZDE3OiBhbnk7XG4gICAgdmFyIGQxODogYW55O1xuICAgIHZhciBkMTk6IGFueTtcbiAgICB0cnkge1xuICAgICAgZDAgPSBsZW5ndGggPiAwID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzBdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMSA9IGxlbmd0aCA+IDEgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQyID0gbGVuZ3RoID4gMiA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1syXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDMgPSBsZW5ndGggPiAzID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzNdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkNCA9IGxlbmd0aCA+IDQgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbNF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ1ID0gbGVuZ3RoID4gNSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s1XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDYgPSBsZW5ndGggPiA2ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzZdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkNyA9IGxlbmd0aCA+IDcgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbN10sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ4ID0gbGVuZ3RoID4gOCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s4XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDkgPSBsZW5ndGggPiA5ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzldLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTAgPSBsZW5ndGggPiAxMCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxMF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxMSA9IGxlbmd0aCA+IDExID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzExXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEyID0gbGVuZ3RoID4gMTIgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTJdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTMgPSBsZW5ndGggPiAxMyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxM10sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxNCA9IGxlbmd0aCA+IDE0ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE0XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE1ID0gbGVuZ3RoID4gMTUgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTVdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTYgPSBsZW5ndGggPiAxNiA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxNl0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxNyA9IGxlbmd0aCA+IDE3ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE3XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE4ID0gbGVuZ3RoID4gMTggPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMThdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTkgPSBsZW5ndGggPiAxOSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxOV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEFic3RyYWN0UHJvdmlkZXJFcnJvciB8fCBlIGluc3RhbmNlb2YgSW5zdGFudGlhdGlvbkVycm9yKSB7XG4gICAgICAgIGUuYWRkS2V5KHRoaXMsIHByb3ZpZGVyLmtleSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciBvYmo7XG4gICAgdHJ5IHtcbiAgICAgIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KFxuICAgICAgICAgICAgICBkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LCBkMTcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoXG4gICAgICAgICAgICAgIGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYsIGQxNywgZDE4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KFxuICAgICAgICAgICAgICBkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LCBkMTcsIGQxOCxcbiAgICAgICAgICAgICAgZDE5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgYENhbm5vdCBpbnN0YW50aWF0ZSAnJHtwcm92aWRlci5rZXkuZGlzcGxheU5hbWV9JyBiZWNhdXNlIGl0IGhhcyBtb3JlIHRoYW4gMjAgZGVwZW5kZW5jaWVzYCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEluc3RhbnRpYXRpb25FcnJvcih0aGlzLCBlLCBlLnN0YWNrLCBwcm92aWRlci5rZXkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QnlEZXBlbmRlbmN5KFxuICAgICAgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIGRlcDogRGVwZW5kZW5jeSwgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICB2YXIgc3BlY2lhbCA9IGlzUHJlc2VudCh0aGlzLl9kZXBQcm92aWRlcikgP1xuICAgICAgICB0aGlzLl9kZXBQcm92aWRlci5nZXREZXBlbmRlbmN5KHRoaXMsIHByb3ZpZGVyLCBkZXApIDpcbiAgICAgICAgVU5ERUZJTkVEO1xuICAgIGlmIChzcGVjaWFsICE9PSBVTkRFRklORUQpIHtcbiAgICAgIHJldHVybiBzcGVjaWFsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXkoXG4gICAgICAgICAgZGVwLmtleSwgZGVwLmxvd2VyQm91bmRWaXNpYmlsaXR5LCBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHksIGRlcC5vcHRpb25hbCxcbiAgICAgICAgICBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEJ5S2V5KFxuICAgICAga2V5OiBLZXksIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIG9wdGlvbmFsOiBib29sZWFuLFxuICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAoa2V5ID09PSBJTkpFQ1RPUl9LRVkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5U2VsZihrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHkpO1xuXG4gICAgfSBlbHNlIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5SG9zdChrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHksIGxvd2VyQm91bmRWaXNpYmlsaXR5KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXlEZWZhdWx0KGtleSwgb3B0aW9uYWwsIHByb3ZpZGVyVmlzaWJpbGl0eSwgbG93ZXJCb3VuZFZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rocm93T3JOdWxsKGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbik6IGFueSB7XG4gICAgaWYgKG9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE5vUHJvdmlkZXJFcnJvcih0aGlzLCBrZXkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldEJ5S2V5U2VsZihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIG9iaiA9IHRoaXMuX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIHJldHVybiAob2JqICE9PSBVTkRFRklORUQpID8gb2JqIDogdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRCeUtleUhvc3QoXG4gICAgICBrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSxcbiAgICAgIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QpOiBhbnkge1xuICAgIHZhciBpbmo6IEluamVjdG9yID0gdGhpcztcblxuICAgIGlmIChsb3dlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIGlmIChpbmouX2lzSG9zdEJvdW5kYXJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXksIG9wdGlvbmFsLCBpbmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKGluaiAhPSBudWxsKSB7XG4gICAgICB2YXIgb2JqID0gaW5qLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICAgIGlmIChvYmogIT09IFVOREVGSU5FRCkgcmV0dXJuIG9iajtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbmouX3BhcmVudCkgJiYgaW5qLl9pc0hvc3RCb3VuZGFyeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJpdmF0ZURlcGVuZGVuY3koa2V5LCBvcHRpb25hbCwgaW5qKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaiA9IGluai5fcGFyZW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90aHJvd09yTnVsbChrZXksIG9wdGlvbmFsKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldFByaXZhdGVEZXBlbmRlbmN5KGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbiwgaW5qOiBJbmplY3Rvcik6IGFueSB7XG4gICAgdmFyIG9iaiA9IGluai5fcGFyZW50Ll9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgVmlzaWJpbGl0eS5Qcml2YXRlKTtcbiAgICByZXR1cm4gKG9iaiAhPT0gVU5ERUZJTkVEKSA/IG9iaiA6IHRoaXMuX3Rocm93T3JOdWxsKGtleSwgb3B0aW9uYWwpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0QnlLZXlEZWZhdWx0KFxuICAgICAga2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHksXG4gICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0KTogYW55IHtcbiAgICB2YXIgaW5qOiBJbmplY3RvciA9IHRoaXM7XG5cbiAgICBpZiAobG93ZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhKSB7XG4gICAgICBwcm92aWRlclZpc2liaWxpdHkgPSBpbmouX2lzSG9zdEJvdW5kYXJ5ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWM7XG4gICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICB9XG5cbiAgICB3aGlsZSAoaW5qICE9IG51bGwpIHtcbiAgICAgIHZhciBvYmogPSBpbmouX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgICAgaWYgKG9iaiAhPT0gVU5ERUZJTkVEKSByZXR1cm4gb2JqO1xuXG4gICAgICBwcm92aWRlclZpc2liaWxpdHkgPSBpbmouX2lzSG9zdEJvdW5kYXJ5ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWM7XG4gICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYEluamVjdG9yKHByb3ZpZGVyczogWyR7X21hcFByb3ZpZGVycyh0aGlzLCAoYjogUmVzb2x2ZWRQcm92aWRlcikgPT4gYCAnJHtiLmtleS5kaXNwbGF5TmFtZX0nIGApLmpvaW4oXCIsIFwiKX1dKWA7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5kaXNwbGF5TmFtZTsgfVxufVxuXG52YXIgSU5KRUNUT1JfS0VZID0gS2V5LmdldChJbmplY3Rvcik7XG5cblxuZnVuY3Rpb24gX21hcFByb3ZpZGVycyhpbmplY3RvcjogSW5qZWN0b3IsIGZuOiBGdW5jdGlvbik6IGFueVtdIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGluamVjdG9yLl9wcm90by5udW1iZXJPZlByb3ZpZGVyczsgKytpKSB7XG4gICAgcmVzLnB1c2goZm4oaW5qZWN0b3IuX3Byb3RvLmdldFByb3ZpZGVyQXRJbmRleChpKSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG4iXX0=