'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var provider_1 = require('angular2/src/core/di/provider');
var injector_1 = require('angular2/src/core/di/injector');
var provider_2 = require('angular2/src/core/di/provider');
var di_2 = require('../metadata/di');
var view_type_1 = require('./view_type');
var element_ref_1 = require('./element_ref');
var view_container_ref_1 = require('./view_container_ref');
var element_ref_2 = require('./element_ref');
var api_1 = require('angular2/src/core/render/api');
var template_ref_1 = require('./template_ref');
var directives_1 = require('../metadata/directives');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var query_list_1 = require('./query_list');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var pipe_provider_1 = require('angular2/src/core/pipes/pipe_provider');
var view_container_ref_2 = require('./view_container_ref');
var _staticKeys;
var StaticKeys = (function () {
    function StaticKeys() {
        this.templateRefId = di_1.Key.get(template_ref_1.TemplateRef).id;
        this.viewContainerId = di_1.Key.get(view_container_ref_1.ViewContainerRef).id;
        this.changeDetectorRefId = di_1.Key.get(change_detection_1.ChangeDetectorRef).id;
        this.elementRefId = di_1.Key.get(element_ref_2.ElementRef).id;
        this.rendererId = di_1.Key.get(api_1.Renderer).id;
    }
    StaticKeys.instance = function () {
        if (lang_1.isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    };
    return StaticKeys;
})();
exports.StaticKeys = StaticKeys;
var DirectiveDependency = (function (_super) {
    __extends(DirectiveDependency, _super);
    function DirectiveDependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties, attributeName, queryDecorator) {
        _super.call(this, key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    /** @internal */
    DirectiveDependency.prototype._verify = function () {
        var count = 0;
        if (lang_1.isPresent(this.queryDecorator))
            count++;
        if (lang_1.isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new exceptions_1.BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    };
    DirectiveDependency.createFrom = function (d) {
        return new DirectiveDependency(d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    };
    /** @internal */
    DirectiveDependency._attributeName = function (properties) {
        var p = properties.find(function (p) { return p instanceof di_2.AttributeMetadata; });
        return lang_1.isPresent(p) ? p.attributeName : null;
    };
    /** @internal */
    DirectiveDependency._query = function (properties) {
        return properties.find(function (p) { return p instanceof di_2.QueryMetadata; });
    };
    return DirectiveDependency;
})(di_1.Dependency);
exports.DirectiveDependency = DirectiveDependency;
var DirectiveProvider = (function (_super) {
    __extends(DirectiveProvider, _super);
    function DirectiveProvider(key, factory, deps, isComponent, providers, viewProviders, queries) {
        _super.call(this, key, [new provider_2.ResolvedFactory(factory, deps)], false);
        this.isComponent = isComponent;
        this.providers = providers;
        this.viewProviders = viewProviders;
        this.queries = queries;
    }
    Object.defineProperty(DirectiveProvider.prototype, "displayName", {
        get: function () { return this.key.displayName; },
        enumerable: true,
        configurable: true
    });
    DirectiveProvider.createFromType = function (type, meta) {
        var provider = new di_1.Provider(type, { useClass: type });
        if (lang_1.isBlank(meta)) {
            meta = new directives_1.DirectiveMetadata();
        }
        var rb = provider_2.resolveProvider(provider);
        var rf = rb.resolvedFactories[0];
        var deps = rf.dependencies.map(DirectiveDependency.createFrom);
        var isComponent = meta instanceof directives_1.ComponentMetadata;
        var resolvedProviders = lang_1.isPresent(meta.providers) ? di_1.Injector.resolve(meta.providers) : null;
        var resolvedViewProviders = meta instanceof directives_1.ComponentMetadata && lang_1.isPresent(meta.viewProviders) ?
            di_1.Injector.resolve(meta.viewProviders) :
            null;
        var queries = [];
        if (lang_1.isPresent(meta.queries)) {
            collection_1.StringMapWrapper.forEach(meta.queries, function (meta, fieldName) {
                var setter = reflection_1.reflector.setter(fieldName);
                queries.push(new QueryMetadataWithSetter(setter, meta));
            });
        }
        // queries passed into the constructor.
        // TODO: remove this after constructor queries are no longer supported
        deps.forEach(function (d) {
            if (lang_1.isPresent(d.queryDecorator)) {
                queries.push(new QueryMetadataWithSetter(null, d.queryDecorator));
            }
        });
        return new DirectiveProvider(rb.key, rf.factory, deps, isComponent, resolvedProviders, resolvedViewProviders, queries);
    };
    return DirectiveProvider;
})(provider_2.ResolvedProvider_);
exports.DirectiveProvider = DirectiveProvider;
var QueryMetadataWithSetter = (function () {
    function QueryMetadataWithSetter(setter, metadata) {
        this.setter = setter;
        this.metadata = metadata;
    }
    return QueryMetadataWithSetter;
})();
exports.QueryMetadataWithSetter = QueryMetadataWithSetter;
function setProvidersVisibility(providers, visibility, result) {
    for (var i = 0; i < providers.length; i++) {
        result.set(providers[i].key.id, visibility);
    }
}
var AppProtoElement = (function () {
    function AppProtoElement(firstProviderIsComponent, index, attributes, pwvs, protoQueryRefs, directiveVariableBindings) {
        this.firstProviderIsComponent = firstProviderIsComponent;
        this.index = index;
        this.attributes = attributes;
        this.protoQueryRefs = protoQueryRefs;
        this.directiveVariableBindings = directiveVariableBindings;
        var length = pwvs.length;
        if (length > 0) {
            this.protoInjector = new injector_1.ProtoInjector(pwvs);
        }
        else {
            this.protoInjector = null;
            this.protoQueryRefs = [];
        }
    }
    AppProtoElement.create = function (metadataCache, index, attributes, directiveTypes, directiveVariableBindings) {
        var componentDirProvider = null;
        var mergedProvidersMap = new Map();
        var providerVisibilityMap = new Map();
        var providers = collection_1.ListWrapper.createGrowableSize(directiveTypes.length);
        var protoQueryRefs = [];
        for (var i = 0; i < directiveTypes.length; i++) {
            var dirProvider = metadataCache.getResolvedDirectiveMetadata(directiveTypes[i]);
            providers[i] = new injector_1.ProviderWithVisibility(dirProvider, dirProvider.isComponent ? injector_1.Visibility.PublicAndPrivate : injector_1.Visibility.Public);
            if (dirProvider.isComponent) {
                componentDirProvider = dirProvider;
            }
            else {
                if (lang_1.isPresent(dirProvider.providers)) {
                    provider_1.mergeResolvedProviders(dirProvider.providers, mergedProvidersMap);
                    setProvidersVisibility(dirProvider.providers, injector_1.Visibility.Public, providerVisibilityMap);
                }
            }
            if (lang_1.isPresent(dirProvider.viewProviders)) {
                provider_1.mergeResolvedProviders(dirProvider.viewProviders, mergedProvidersMap);
                setProvidersVisibility(dirProvider.viewProviders, injector_1.Visibility.Private, providerVisibilityMap);
            }
            for (var queryIdx = 0; queryIdx < dirProvider.queries.length; queryIdx++) {
                var q = dirProvider.queries[queryIdx];
                protoQueryRefs.push(new ProtoQueryRef(i, q.setter, q.metadata));
            }
        }
        if (lang_1.isPresent(componentDirProvider) && lang_1.isPresent(componentDirProvider.providers)) {
            // directive providers need to be prioritized over component providers
            provider_1.mergeResolvedProviders(componentDirProvider.providers, mergedProvidersMap);
            setProvidersVisibility(componentDirProvider.providers, injector_1.Visibility.Public, providerVisibilityMap);
        }
        mergedProvidersMap.forEach(function (provider, _) {
            providers.push(new injector_1.ProviderWithVisibility(provider, providerVisibilityMap.get(provider.key.id)));
        });
        return new AppProtoElement(lang_1.isPresent(componentDirProvider), index, attributes, providers, protoQueryRefs, directiveVariableBindings);
    };
    AppProtoElement.prototype.getProviderAtIndex = function (index) { return this.protoInjector.getProviderAtIndex(index); };
    return AppProtoElement;
})();
exports.AppProtoElement = AppProtoElement;
var _Context = (function () {
    function _Context(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
    return _Context;
})();
var InjectorWithHostBoundary = (function () {
    function InjectorWithHostBoundary(injector, hostInjectorBoundary) {
        this.injector = injector;
        this.hostInjectorBoundary = hostInjectorBoundary;
    }
    return InjectorWithHostBoundary;
})();
exports.InjectorWithHostBoundary = InjectorWithHostBoundary;
var AppElement = (function () {
    function AppElement(proto, parentView, parent, nativeElement, embeddedViewFactory) {
        var _this = this;
        this.proto = proto;
        this.parentView = parentView;
        this.parent = parent;
        this.nativeElement = nativeElement;
        this.embeddedViewFactory = embeddedViewFactory;
        this.nestedViews = null;
        this.componentView = null;
        this.ref = new element_ref_1.ElementRef_(this);
        var parentInjector = lang_1.isPresent(parent) ? parent._injector : parentView.parentInjector;
        if (lang_1.isPresent(this.proto.protoInjector)) {
            var isBoundary;
            if (lang_1.isPresent(parent) && lang_1.isPresent(parent.proto.protoInjector)) {
                isBoundary = false;
            }
            else {
                isBoundary = parentView.hostInjectorBoundary;
            }
            this._queryStrategy = this._buildQueryStrategy();
            this._injector = new di_1.Injector(this.proto.protoInjector, parentInjector, isBoundary, this, function () { return _this._debugContext(); });
            // we couple ourselves to the injector strategy to avoid polymorphic calls
            var injectorStrategy = this._injector.internalStrategy;
            this._strategy = injectorStrategy instanceof injector_1.InjectorInlineStrategy ?
                new ElementDirectiveInlineStrategy(injectorStrategy, this) :
                new ElementDirectiveDynamicStrategy(injectorStrategy, this);
            this._strategy.init();
        }
        else {
            this._queryStrategy = null;
            this._injector = parentInjector;
            this._strategy = null;
        }
    }
    AppElement.getViewParentInjector = function (parentViewType, containerAppElement, imperativelyCreatedProviders, rootInjector) {
        var parentInjector;
        var hostInjectorBoundary;
        switch (parentViewType) {
            case view_type_1.ViewType.COMPONENT:
                parentInjector = containerAppElement._injector;
                hostInjectorBoundary = true;
                break;
            case view_type_1.ViewType.EMBEDDED:
                parentInjector = lang_1.isPresent(containerAppElement.proto.protoInjector) ?
                    containerAppElement._injector.parent :
                    containerAppElement._injector;
                hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                break;
            case view_type_1.ViewType.HOST:
                if (lang_1.isPresent(containerAppElement)) {
                    // host view is attached to a container
                    parentInjector = lang_1.isPresent(containerAppElement.proto.protoInjector) ?
                        containerAppElement._injector.parent :
                        containerAppElement._injector;
                    if (lang_1.isPresent(imperativelyCreatedProviders)) {
                        var imperativeProvidersWithVisibility = imperativelyCreatedProviders.map(function (p) { return new injector_1.ProviderWithVisibility(p, injector_1.Visibility.Public); });
                        // The imperative injector is similar to having an element between
                        // the dynamic-loaded component and its parent => no boundary between
                        // the component and imperativelyCreatedInjector.
                        parentInjector = new di_1.Injector(new injector_1.ProtoInjector(imperativeProvidersWithVisibility), parentInjector, true, null, null);
                        hostInjectorBoundary = false;
                    }
                    else {
                        hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                    }
                }
                else {
                    // bootstrap
                    parentInjector = rootInjector;
                    hostInjectorBoundary = true;
                }
                break;
        }
        return new InjectorWithHostBoundary(parentInjector, hostInjectorBoundary);
    };
    AppElement.prototype.attachComponentView = function (componentView) { this.componentView = componentView; };
    AppElement.prototype._debugContext = function () {
        var c = this.parentView.getDebugContext(this, null, null);
        return lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    };
    AppElement.prototype.hasVariableBinding = function (name) {
        var vb = this.proto.directiveVariableBindings;
        return lang_1.isPresent(vb) && collection_1.StringMapWrapper.contains(vb, name);
    };
    AppElement.prototype.getVariableBinding = function (name) {
        var index = this.proto.directiveVariableBindings[name];
        return lang_1.isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    };
    AppElement.prototype.get = function (token) { return this._injector.get(token); };
    AppElement.prototype.hasDirective = function (type) { return lang_1.isPresent(this._injector.getOptional(type)); };
    AppElement.prototype.getComponent = function () { return lang_1.isPresent(this._strategy) ? this._strategy.getComponent() : null; };
    AppElement.prototype.getInjector = function () { return this._injector; };
    AppElement.prototype.getElementRef = function () { return this.ref; };
    AppElement.prototype.getViewContainerRef = function () { return new view_container_ref_2.ViewContainerRef_(this); };
    AppElement.prototype.getTemplateRef = function () {
        if (lang_1.isPresent(this.embeddedViewFactory)) {
            return new template_ref_1.TemplateRef_(this.ref);
        }
        return null;
    };
    AppElement.prototype.getDependency = function (injector, provider, dep) {
        if (provider instanceof DirectiveProvider) {
            var dirDep = dep;
            if (lang_1.isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (lang_1.isPresent(dirDep.queryDecorator))
                return this._queryStrategy.findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector.ref;
                }
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
                return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
                return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().templateRefId) {
                var tr = this.getTemplateRef();
                if (lang_1.isBlank(tr) && !dirDep.optional) {
                    throw new di_1.NoProviderError(null, dirDep.key);
                }
                return tr;
            }
            if (dirDep.key.id === StaticKeys.instance().rendererId) {
                return this.parentView.renderer;
            }
        }
        else if (provider instanceof pipe_provider_1.PipeProvider) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector;
                }
            }
        }
        return injector_1.UNDEFINED;
    };
    AppElement.prototype._buildAttribute = function (dep) {
        var attributes = this.proto.attributes;
        if (lang_1.isPresent(attributes) && collection_1.StringMapWrapper.contains(attributes, dep.attributeName)) {
            return attributes[dep.attributeName];
        }
        else {
            return null;
        }
    };
    AppElement.prototype.addDirectivesMatchingQuery = function (query, list) {
        var templateRef = this.getTemplateRef();
        if (query.selector === template_ref_1.TemplateRef && lang_1.isPresent(templateRef)) {
            list.push(templateRef);
        }
        if (this._strategy != null) {
            this._strategy.addDirectivesMatchingQuery(query, list);
        }
    };
    AppElement.prototype._buildQueryStrategy = function () {
        if (this.proto.protoQueryRefs.length === 0) {
            return _emptyQueryStrategy;
        }
        else if (this.proto.protoQueryRefs.length <= InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
            return new InlineQueryStrategy(this);
        }
        else {
            return new DynamicQueryStrategy(this);
        }
    };
    AppElement.prototype.getDirectiveAtIndex = function (index) { return this._injector.getAt(index); };
    AppElement.prototype.ngAfterViewChecked = function () {
        if (lang_1.isPresent(this._queryStrategy))
            this._queryStrategy.updateViewQueries();
    };
    AppElement.prototype.ngAfterContentChecked = function () {
        if (lang_1.isPresent(this._queryStrategy))
            this._queryStrategy.updateContentQueries();
    };
    AppElement.prototype.traverseAndSetQueriesAsDirty = function () {
        var inj = this;
        while (lang_1.isPresent(inj)) {
            inj._setQueriesAsDirty();
            if (lang_1.isBlank(inj.parent) && inj.parentView.proto.type === view_type_1.ViewType.EMBEDDED) {
                inj = inj.parentView.containerAppElement;
            }
            else {
                inj = inj.parent;
            }
        }
    };
    AppElement.prototype._setQueriesAsDirty = function () {
        if (lang_1.isPresent(this._queryStrategy)) {
            this._queryStrategy.setContentQueriesAsDirty();
        }
        if (this.parentView.proto.type === view_type_1.ViewType.COMPONENT) {
            this.parentView.containerAppElement._queryStrategy.setViewQueriesAsDirty();
        }
    };
    return AppElement;
})();
exports.AppElement = AppElement;
var _EmptyQueryStrategy = (function () {
    function _EmptyQueryStrategy() {
    }
    _EmptyQueryStrategy.prototype.setContentQueriesAsDirty = function () { };
    _EmptyQueryStrategy.prototype.setViewQueriesAsDirty = function () { };
    _EmptyQueryStrategy.prototype.updateContentQueries = function () { };
    _EmptyQueryStrategy.prototype.updateViewQueries = function () { };
    _EmptyQueryStrategy.prototype.findQuery = function (query) {
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    return _EmptyQueryStrategy;
})();
var _emptyQueryStrategy = new _EmptyQueryStrategy();
var InlineQueryStrategy = (function () {
    function InlineQueryStrategy(ei) {
        var protoRefs = ei.proto.protoQueryRefs;
        if (protoRefs.length > 0)
            this.query0 = new QueryRef(protoRefs[0], ei);
        if (protoRefs.length > 1)
            this.query1 = new QueryRef(protoRefs[1], ei);
        if (protoRefs.length > 2)
            this.query2 = new QueryRef(protoRefs[2], ei);
    }
    InlineQueryStrategy.prototype.setContentQueriesAsDirty = function () {
        if (lang_1.isPresent(this.query0) && !this.query0.isViewQuery)
            this.query0.dirty = true;
        if (lang_1.isPresent(this.query1) && !this.query1.isViewQuery)
            this.query1.dirty = true;
        if (lang_1.isPresent(this.query2) && !this.query2.isViewQuery)
            this.query2.dirty = true;
    };
    InlineQueryStrategy.prototype.setViewQueriesAsDirty = function () {
        if (lang_1.isPresent(this.query0) && this.query0.isViewQuery)
            this.query0.dirty = true;
        if (lang_1.isPresent(this.query1) && this.query1.isViewQuery)
            this.query1.dirty = true;
        if (lang_1.isPresent(this.query2) && this.query2.isViewQuery)
            this.query2.dirty = true;
    };
    InlineQueryStrategy.prototype.updateContentQueries = function () {
        if (lang_1.isPresent(this.query0) && !this.query0.isViewQuery) {
            this.query0.update();
        }
        if (lang_1.isPresent(this.query1) && !this.query1.isViewQuery) {
            this.query1.update();
        }
        if (lang_1.isPresent(this.query2) && !this.query2.isViewQuery) {
            this.query2.update();
        }
    };
    InlineQueryStrategy.prototype.updateViewQueries = function () {
        if (lang_1.isPresent(this.query0) && this.query0.isViewQuery) {
            this.query0.update();
        }
        if (lang_1.isPresent(this.query1) && this.query1.isViewQuery) {
            this.query1.update();
        }
        if (lang_1.isPresent(this.query2) && this.query2.isViewQuery) {
            this.query2.update();
        }
    };
    InlineQueryStrategy.prototype.findQuery = function (query) {
        if (lang_1.isPresent(this.query0) && this.query0.protoQueryRef.query === query) {
            return this.query0;
        }
        if (lang_1.isPresent(this.query1) && this.query1.protoQueryRef.query === query) {
            return this.query1;
        }
        if (lang_1.isPresent(this.query2) && this.query2.protoQueryRef.query === query) {
            return this.query2;
        }
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES = 3;
    return InlineQueryStrategy;
})();
var DynamicQueryStrategy = (function () {
    function DynamicQueryStrategy(ei) {
        this.queries = ei.proto.protoQueryRefs.map(function (p) { return new QueryRef(p, ei); });
    }
    DynamicQueryStrategy.prototype.setContentQueriesAsDirty = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery)
                q.dirty = true;
        }
    };
    DynamicQueryStrategy.prototype.setViewQueriesAsDirty = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery)
                q.dirty = true;
        }
    };
    DynamicQueryStrategy.prototype.updateContentQueries = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery) {
                q.update();
            }
        }
    };
    DynamicQueryStrategy.prototype.updateViewQueries = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery) {
                q.update();
            }
        }
    };
    DynamicQueryStrategy.prototype.findQuery = function (query) {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.protoQueryRef.query === query) {
                return q;
            }
        }
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    return DynamicQueryStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
var ElementDirectiveInlineStrategy = (function () {
    function ElementDirectiveInlineStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementDirectiveInlineStrategy.prototype.init = function () {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        i.resetConstructionCounter();
        if (p.provider0 instanceof DirectiveProvider && lang_1.isPresent(p.keyId0) && i.obj0 === injector_1.UNDEFINED)
            i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
        if (p.provider1 instanceof DirectiveProvider && lang_1.isPresent(p.keyId1) && i.obj1 === injector_1.UNDEFINED)
            i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
        if (p.provider2 instanceof DirectiveProvider && lang_1.isPresent(p.keyId2) && i.obj2 === injector_1.UNDEFINED)
            i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
        if (p.provider3 instanceof DirectiveProvider && lang_1.isPresent(p.keyId3) && i.obj3 === injector_1.UNDEFINED)
            i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
        if (p.provider4 instanceof DirectiveProvider && lang_1.isPresent(p.keyId4) && i.obj4 === injector_1.UNDEFINED)
            i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
        if (p.provider5 instanceof DirectiveProvider && lang_1.isPresent(p.keyId5) && i.obj5 === injector_1.UNDEFINED)
            i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
        if (p.provider6 instanceof DirectiveProvider && lang_1.isPresent(p.keyId6) && i.obj6 === injector_1.UNDEFINED)
            i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
        if (p.provider7 instanceof DirectiveProvider && lang_1.isPresent(p.keyId7) && i.obj7 === injector_1.UNDEFINED)
            i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
        if (p.provider8 instanceof DirectiveProvider && lang_1.isPresent(p.keyId8) && i.obj8 === injector_1.UNDEFINED)
            i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
        if (p.provider9 instanceof DirectiveProvider && lang_1.isPresent(p.keyId9) && i.obj9 === injector_1.UNDEFINED)
            i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
    };
    ElementDirectiveInlineStrategy.prototype.getComponent = function () { return this.injectorStrategy.obj0; };
    ElementDirectiveInlineStrategy.prototype.isComponentKey = function (key) {
        return this._ei.proto.firstProviderIsComponent && lang_1.isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    };
    ElementDirectiveInlineStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (lang_1.isPresent(p.provider0) && p.provider0.key.token === query.selector) {
            if (i.obj0 === injector_1.UNDEFINED)
                i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
            list.push(i.obj0);
        }
        if (lang_1.isPresent(p.provider1) && p.provider1.key.token === query.selector) {
            if (i.obj1 === injector_1.UNDEFINED)
                i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
            list.push(i.obj1);
        }
        if (lang_1.isPresent(p.provider2) && p.provider2.key.token === query.selector) {
            if (i.obj2 === injector_1.UNDEFINED)
                i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
            list.push(i.obj2);
        }
        if (lang_1.isPresent(p.provider3) && p.provider3.key.token === query.selector) {
            if (i.obj3 === injector_1.UNDEFINED)
                i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
            list.push(i.obj3);
        }
        if (lang_1.isPresent(p.provider4) && p.provider4.key.token === query.selector) {
            if (i.obj4 === injector_1.UNDEFINED)
                i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
            list.push(i.obj4);
        }
        if (lang_1.isPresent(p.provider5) && p.provider5.key.token === query.selector) {
            if (i.obj5 === injector_1.UNDEFINED)
                i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
            list.push(i.obj5);
        }
        if (lang_1.isPresent(p.provider6) && p.provider6.key.token === query.selector) {
            if (i.obj6 === injector_1.UNDEFINED)
                i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
            list.push(i.obj6);
        }
        if (lang_1.isPresent(p.provider7) && p.provider7.key.token === query.selector) {
            if (i.obj7 === injector_1.UNDEFINED)
                i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
            list.push(i.obj7);
        }
        if (lang_1.isPresent(p.provider8) && p.provider8.key.token === query.selector) {
            if (i.obj8 === injector_1.UNDEFINED)
                i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
            list.push(i.obj8);
        }
        if (lang_1.isPresent(p.provider9) && p.provider9.key.token === query.selector) {
            if (i.obj9 === injector_1.UNDEFINED)
                i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
            list.push(i.obj9);
        }
    };
    return ElementDirectiveInlineStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
var ElementDirectiveDynamicStrategy = (function () {
    function ElementDirectiveDynamicStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementDirectiveDynamicStrategy.prototype.init = function () {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        inj.resetConstructionCounter();
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider && lang_1.isPresent(p.keyIds[i]) &&
                inj.objs[i] === injector_1.UNDEFINED) {
                inj.objs[i] = inj.instantiateProvider(p.providers[i], p.visibilities[i]);
            }
        }
    };
    ElementDirectiveDynamicStrategy.prototype.getComponent = function () { return this.injectorStrategy.objs[0]; };
    ElementDirectiveDynamicStrategy.prototype.isComponentKey = function (key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei.proto.firstProviderIsComponent && lang_1.isPresent(key) && key.id === p.keyIds[0];
    };
    ElementDirectiveDynamicStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i].key.token === query.selector) {
                if (ist.objs[i] === injector_1.UNDEFINED) {
                    ist.objs[i] = ist.instantiateProvider(p.providers[i], p.visibilities[i]);
                }
                list.push(ist.objs[i]);
            }
        }
    };
    return ElementDirectiveDynamicStrategy;
})();
var ProtoQueryRef = (function () {
    function ProtoQueryRef(dirIndex, setter, query) {
        this.dirIndex = dirIndex;
        this.setter = setter;
        this.query = query;
    }
    Object.defineProperty(ProtoQueryRef.prototype, "usesPropertySyntax", {
        get: function () { return lang_1.isPresent(this.setter); },
        enumerable: true,
        configurable: true
    });
    return ProtoQueryRef;
})();
exports.ProtoQueryRef = ProtoQueryRef;
var QueryRef = (function () {
    function QueryRef(protoQueryRef, originator) {
        this.protoQueryRef = protoQueryRef;
        this.originator = originator;
        this.list = new query_list_1.QueryList();
        this.dirty = true;
    }
    Object.defineProperty(QueryRef.prototype, "isViewQuery", {
        get: function () { return this.protoQueryRef.query.isViewQuery; },
        enumerable: true,
        configurable: true
    });
    QueryRef.prototype.update = function () {
        if (!this.dirty)
            return;
        this._update();
        this.dirty = false;
        // TODO delete the check once only field queries are supported
        if (this.protoQueryRef.usesPropertySyntax) {
            var dir = this.originator.getDirectiveAtIndex(this.protoQueryRef.dirIndex);
            if (this.protoQueryRef.query.first) {
                this.protoQueryRef.setter(dir, this.list.length > 0 ? this.list.first : null);
            }
            else {
                this.protoQueryRef.setter(dir, this.list);
            }
        }
        this.list.notifyOnChanges();
    };
    QueryRef.prototype._update = function () {
        var aggregator = [];
        if (this.protoQueryRef.query.isViewQuery) {
            // intentionally skipping originator for view queries.
            var nestedView = this.originator.componentView;
            if (lang_1.isPresent(nestedView))
                this._visitView(nestedView, aggregator);
        }
        else {
            this._visit(this.originator, aggregator);
        }
        this.list.reset(aggregator);
    };
    ;
    QueryRef.prototype._visit = function (inj, aggregator) {
        var view = inj.parentView;
        var startIdx = inj.proto.index;
        for (var i = startIdx; i < view.appElements.length; i++) {
            var curInj = view.appElements[i];
            // The first injector after inj, that is outside the subtree rooted at
            // inj has to have a null parent or a parent that is an ancestor of inj.
            if (i > startIdx && (lang_1.isBlank(curInj.parent) || curInj.parent.proto.index < startIdx)) {
                break;
            }
            if (!this.protoQueryRef.query.descendants &&
                !(curInj.parent == this.originator || curInj == this.originator))
                continue;
            // We visit the view container(VC) views right after the injector that contains
            // the VC. Theoretically, that might not be the right order if there are
            // child injectors of said injector. Not clear whether if such case can
            // even be constructed with the current apis.
            this._visitInjector(curInj, aggregator);
            this._visitViewContainerViews(curInj.nestedViews, aggregator);
        }
    };
    QueryRef.prototype._visitInjector = function (inj, aggregator) {
        if (this.protoQueryRef.query.isVarBindingQuery) {
            this._aggregateVariableBinding(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
    };
    QueryRef.prototype._visitViewContainerViews = function (views, aggregator) {
        if (lang_1.isPresent(views)) {
            for (var j = 0; j < views.length; j++) {
                this._visitView(views[j], aggregator);
            }
        }
    };
    QueryRef.prototype._visitView = function (view, aggregator) {
        for (var i = 0; i < view.appElements.length; i++) {
            var inj = view.appElements[i];
            this._visitInjector(inj, aggregator);
            this._visitViewContainerViews(inj.nestedViews, aggregator);
        }
    };
    QueryRef.prototype._aggregateVariableBinding = function (inj, aggregator) {
        var vb = this.protoQueryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    };
    QueryRef.prototype._aggregateDirective = function (inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
    };
    return QueryRef;
})();
exports.QueryRef = QueryRef;
var _ComponentViewChangeDetectorRef = (function (_super) {
    __extends(_ComponentViewChangeDetectorRef, _super);
    function _ComponentViewChangeDetectorRef(_appElement) {
        _super.call(this);
        this._appElement = _appElement;
    }
    _ComponentViewChangeDetectorRef.prototype.markForCheck = function () { this._appElement.componentView.changeDetector.ref.markForCheck(); };
    _ComponentViewChangeDetectorRef.prototype.detach = function () { this._appElement.componentView.changeDetector.ref.detach(); };
    _ComponentViewChangeDetectorRef.prototype.detectChanges = function () { this._appElement.componentView.changeDetector.ref.detectChanges(); };
    _ComponentViewChangeDetectorRef.prototype.checkNoChanges = function () { this._appElement.componentView.changeDetector.ref.checkNoChanges(); };
    _ComponentViewChangeDetectorRef.prototype.reattach = function () { this._appElement.componentView.changeDetector.ref.reattach(); };
    return _ComponentViewChangeDetectorRef;
})(change_detection_1.ChangeDetectorRef);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIuY3JlYXRlRnJvbVR5cGUiLCJRdWVyeU1ldGFkYXRhV2l0aFNldHRlciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyLmNvbnN0cnVjdG9yIiwic2V0UHJvdmlkZXJzVmlzaWJpbGl0eSIsIkFwcFByb3RvRWxlbWVudCIsIkFwcFByb3RvRWxlbWVudC5jb25zdHJ1Y3RvciIsIkFwcFByb3RvRWxlbWVudC5jcmVhdGUiLCJBcHBQcm90b0VsZW1lbnQuZ2V0UHJvdmlkZXJBdEluZGV4IiwiX0NvbnRleHQiLCJfQ29udGV4dC5jb25zdHJ1Y3RvciIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeS5jb25zdHJ1Y3RvciIsIkFwcEVsZW1lbnQiLCJBcHBFbGVtZW50LmNvbnN0cnVjdG9yIiwiQXBwRWxlbWVudC5nZXRWaWV3UGFyZW50SW5qZWN0b3IiLCJBcHBFbGVtZW50LmF0dGFjaENvbXBvbmVudFZpZXciLCJBcHBFbGVtZW50Ll9kZWJ1Z0NvbnRleHQiLCJBcHBFbGVtZW50Lmhhc1ZhcmlhYmxlQmluZGluZyIsIkFwcEVsZW1lbnQuZ2V0VmFyaWFibGVCaW5kaW5nIiwiQXBwRWxlbWVudC5nZXQiLCJBcHBFbGVtZW50Lmhhc0RpcmVjdGl2ZSIsIkFwcEVsZW1lbnQuZ2V0Q29tcG9uZW50IiwiQXBwRWxlbWVudC5nZXRJbmplY3RvciIsIkFwcEVsZW1lbnQuZ2V0RWxlbWVudFJlZiIsIkFwcEVsZW1lbnQuZ2V0Vmlld0NvbnRhaW5lclJlZiIsIkFwcEVsZW1lbnQuZ2V0VGVtcGxhdGVSZWYiLCJBcHBFbGVtZW50LmdldERlcGVuZGVuY3kiLCJBcHBFbGVtZW50Ll9idWlsZEF0dHJpYnV0ZSIsIkFwcEVsZW1lbnQuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJBcHBFbGVtZW50Ll9idWlsZFF1ZXJ5U3RyYXRlZ3kiLCJBcHBFbGVtZW50LmdldERpcmVjdGl2ZUF0SW5kZXgiLCJBcHBFbGVtZW50Lm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkFwcEVsZW1lbnQubmdBZnRlckNvbnRlbnRDaGVja2VkIiwiQXBwRWxlbWVudC50cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5IiwiQXBwRWxlbWVudC5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiSW5saW5lUXVlcnlTdHJhdGVneSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmluaXQiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneSIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmluaXQiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmdldENvbXBvbmVudCIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiUHJvdG9RdWVyeVJlZiIsIlByb3RvUXVlcnlSZWYuY29uc3RydWN0b3IiLCJQcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCIsIlF1ZXJ5UmVmIiwiUXVlcnlSZWYuY29uc3RydWN0b3IiLCJRdWVyeVJlZi5pc1ZpZXdRdWVyeSIsIlF1ZXJ5UmVmLnVwZGF0ZSIsIlF1ZXJ5UmVmLl91cGRhdGUiLCJRdWVyeVJlZi5fdmlzaXQiLCJRdWVyeVJlZi5fdmlzaXRJbmplY3RvciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXdDb250YWluZXJWaWV3cyIsIlF1ZXJ5UmVmLl92aXNpdFZpZXciLCJRdWVyeVJlZi5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nIiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZURpcmVjdGl2ZSIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYiLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLmNvbnN0cnVjdG9yIiwiX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2siLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLmRldGFjaCIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcyIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMiLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLnJlYXR0YWNoIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQUE2RSwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hHLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUF3RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FB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SUEsR0FBMEJBLEVBQUVBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdEZBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLFlBQVlBLDhCQUFpQkEsQ0FBQ0E7UUFDcERBLElBQUlBLGlCQUFpQkEsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLGFBQVFBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQzVGQSxJQUFJQSxxQkFBcUJBLEdBQUdBLElBQUlBLFlBQVlBLDhCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBO1lBQzFGQSxhQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtZQUNwQ0EsSUFBSUEsQ0FBQ0E7UUFDVEEsSUFBSUEsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDakJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsNkJBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxVQUFDQSxJQUFJQSxFQUFFQSxTQUFTQTtnQkFDckRBLElBQUlBLE1BQU1BLEdBQUdBLHNCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtnQkFDekNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLHVCQUF1QkEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMURBLENBQUNBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO1FBQ0RBLHVDQUF1Q0E7UUFDdkNBLHNFQUFzRUE7UUFDdEVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLENBQUNBO1lBQ1pBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaENBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLHVCQUF1QkEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEVBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLE1BQU1BLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FDeEJBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLFdBQVdBLEVBQUVBLGlCQUFpQkEsRUFBRUEscUJBQXFCQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNoR0EsQ0FBQ0E7SUFDSEgsd0JBQUNBO0FBQURBLENBQUNBLEFBeENELEVBQXVDLDRCQUFpQixFQXdDdkQ7QUF4Q1kseUJBQWlCLG9CQXdDN0IsQ0FBQTtBQUVEO0lBQ0VJLGlDQUFtQkEsTUFBZ0JBLEVBQVNBLFFBQXVCQTtRQUFoREMsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBVUE7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBZUE7SUFBR0EsQ0FBQ0E7SUFDekVELDhCQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGWSwrQkFBdUIsMEJBRW5DLENBQUE7QUFHRCxnQ0FDSSxTQUE2QixFQUFFLFVBQXNCLEVBQUUsTUFBK0I7SUFDeEZFLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQzFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRDtJQW1ERUMseUJBQ1dBLHdCQUFpQ0EsRUFBU0EsS0FBYUEsRUFDdkRBLFVBQW1DQSxFQUFFQSxJQUE4QkEsRUFDbkVBLGNBQStCQSxFQUMvQkEseUJBQWtEQTtRQUhsREMsNkJBQXdCQSxHQUF4QkEsd0JBQXdCQSxDQUFTQTtRQUFTQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFRQTtRQUN2REEsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBeUJBO1FBQ25DQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBaUJBO1FBQy9CQSw4QkFBeUJBLEdBQXpCQSx5QkFBeUJBLENBQXlCQTtRQUMzREEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2ZBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLHdCQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQTVETUQsc0JBQU1BLEdBQWJBLFVBQ0lBLGFBQW9DQSxFQUFFQSxLQUFhQSxFQUFFQSxVQUFtQ0EsRUFDeEZBLGNBQXNCQSxFQUFFQSx5QkFBa0RBO1FBQzVFRSxJQUFJQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hDQSxJQUFJQSxrQkFBa0JBLEdBQWtDQSxJQUFJQSxHQUFHQSxFQUE0QkEsQ0FBQ0E7UUFDNUZBLElBQUlBLHFCQUFxQkEsR0FBNEJBLElBQUlBLEdBQUdBLEVBQXNCQSxDQUFDQTtRQUNuRkEsSUFBSUEsU0FBU0EsR0FBR0Esd0JBQVdBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFdEVBLElBQUlBLGNBQWNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ3hCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUMvQ0EsSUFBSUEsV0FBV0EsR0FBR0EsYUFBYUEsQ0FBQ0EsNEJBQTRCQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoRkEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsaUNBQXNCQSxDQUNyQ0EsV0FBV0EsRUFBRUEsV0FBV0EsQ0FBQ0EsV0FBV0EsR0FBR0EscUJBQVVBLENBQUNBLGdCQUFnQkEsR0FBR0EscUJBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBRTVGQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLG9CQUFvQkEsR0FBR0EsV0FBV0EsQ0FBQ0E7WUFDckNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JDQSxpQ0FBc0JBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xFQSxzQkFBc0JBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLHFCQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxxQkFBcUJBLENBQUNBLENBQUNBO2dCQUMxRkEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6Q0EsaUNBQXNCQSxDQUFDQSxXQUFXQSxDQUFDQSxhQUFhQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO2dCQUN0RUEsc0JBQXNCQSxDQUNsQkEsV0FBV0EsQ0FBQ0EsYUFBYUEsRUFBRUEscUJBQVVBLENBQUNBLE9BQU9BLEVBQUVBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0E7WUFDNUVBLENBQUNBO1lBQ0RBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLEVBQUVBLFFBQVFBLEdBQUdBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLFFBQVFBLEVBQUVBLEVBQUVBLENBQUNBO2dCQUN6RUEsSUFBSUEsQ0FBQ0EsR0FBR0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakZBLHNFQUFzRUE7WUFDdEVBLGlDQUFzQkEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxTQUFTQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO1lBQzNFQSxzQkFBc0JBLENBQ2xCQSxvQkFBb0JBLENBQUNBLFNBQVNBLEVBQUVBLHFCQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxxQkFBcUJBLENBQUNBLENBQUNBO1FBQ2hGQSxDQUFDQTtRQUNEQSxrQkFBa0JBLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ3JDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUNWQSxJQUFJQSxpQ0FBc0JBLENBQUNBLFFBQVFBLEVBQUVBLHFCQUFxQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEZBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQ3RCQSxnQkFBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxFQUFFQSxLQUFLQSxFQUFFQSxVQUFVQSxFQUFFQSxTQUFTQSxFQUFFQSxjQUFjQSxFQUM3RUEseUJBQXlCQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFnQkRGLDRDQUFrQkEsR0FBbEJBLFVBQW1CQSxLQUFhQSxJQUFTRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxrQkFBa0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pHSCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsRUQsSUFrRUM7QUFsRVksdUJBQWUsa0JBa0UzQixDQUFBO0FBRUQ7SUFDRUksa0JBQW1CQSxPQUFZQSxFQUFTQSxnQkFBcUJBLEVBQVNBLFFBQWFBO1FBQWhFQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFLQTtRQUFTQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQUtBO1FBQVNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQUtBO0lBQUdBLENBQUNBO0lBQ3pGRCxlQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFFRDtJQUNFRSxrQ0FBbUJBLFFBQWtCQSxFQUFTQSxvQkFBNkJBO1FBQXhEQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSx5QkFBb0JBLEdBQXBCQSxvQkFBb0JBLENBQVNBO0lBQUdBLENBQUNBO0lBQ2pGRCwrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksZ0NBQXdCLDJCQUVwQyxDQUFBO0FBRUQ7SUF1REVFLG9CQUNXQSxLQUFzQkEsRUFBU0EsVUFBbUJBLEVBQVNBLE1BQWtCQSxFQUM3RUEsYUFBa0JBLEVBQVNBLG1CQUE2QkE7UUF6RHJFQyxpQkErT0NBO1FBdkxZQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFpQkE7UUFBU0EsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBU0E7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBWUE7UUFDN0VBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFLQTtRQUFTQSx3QkFBbUJBLEdBQW5CQSxtQkFBbUJBLENBQVVBO1FBVjVEQSxnQkFBV0EsR0FBY0EsSUFBSUEsQ0FBQ0E7UUFDOUJBLGtCQUFhQSxHQUFZQSxJQUFJQSxDQUFDQTtRQVVuQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEseUJBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxjQUFjQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsU0FBU0EsR0FBR0EsVUFBVUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDdEZBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsSUFBSUEsVUFBVUEsQ0FBQ0E7WUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLFVBQVVBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ3JCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtZQUMvQ0EsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxFQUFFQSxDQUFDQTtZQUNqREEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsYUFBUUEsQ0FDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGFBQWFBLEVBQUVBLGNBQWNBLEVBQUVBLFVBQVVBLEVBQUVBLElBQUlBLEVBQUVBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLGFBQWFBLEVBQUVBLEVBQXBCQSxDQUFvQkEsQ0FBQ0EsQ0FBQ0E7WUFFNUZBLDBFQUEwRUE7WUFDMUVBLElBQUlBLGdCQUFnQkEsR0FBUUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtZQUM1REEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsZ0JBQWdCQSxZQUFZQSxpQ0FBc0JBO2dCQUMvREEsSUFBSUEsOEJBQThCQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLElBQUlBLENBQUNBO2dCQUMxREEsSUFBSUEsK0JBQStCQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQ2hFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLGNBQWNBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFqRk1ELGdDQUFxQkEsR0FBNUJBLFVBQ0lBLGNBQXdCQSxFQUFFQSxtQkFBK0JBLEVBQ3pEQSw0QkFBZ0RBLEVBQ2hEQSxZQUFzQkE7UUFDeEJFLElBQUlBLGNBQWNBLENBQUNBO1FBQ25CQSxJQUFJQSxvQkFBb0JBLENBQUNBO1FBQ3pCQSxNQUFNQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsS0FBS0Esb0JBQVFBLENBQUNBLFNBQVNBO2dCQUNyQkEsY0FBY0EsR0FBR0EsbUJBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQTtnQkFDL0NBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQzVCQSxLQUFLQSxDQUFDQTtZQUNSQSxLQUFLQSxvQkFBUUEsQ0FBQ0EsUUFBUUE7Z0JBQ3BCQSxjQUFjQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQTtvQkFDL0RBLG1CQUFtQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUE7b0JBQ3BDQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBO2dCQUNsQ0Esb0JBQW9CQSxHQUFHQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLFlBQVlBLENBQUNBO2dCQUNsRUEsS0FBS0EsQ0FBQ0E7WUFDUkEsS0FBS0Esb0JBQVFBLENBQUNBLElBQUlBO2dCQUNoQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25DQSx1Q0FBdUNBO29CQUN2Q0EsY0FBY0EsR0FBR0EsZ0JBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7d0JBQy9EQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BO3dCQUNwQ0EsbUJBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQTtvQkFDbENBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSw0QkFBNEJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUM1Q0EsSUFBSUEsaUNBQWlDQSxHQUFHQSw0QkFBNEJBLENBQUNBLEdBQUdBLENBQ3BFQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxJQUFJQSxpQ0FBc0JBLENBQUNBLENBQUNBLEVBQUVBLHFCQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFoREEsQ0FBZ0RBLENBQUNBLENBQUNBO3dCQUMzREEsa0VBQWtFQTt3QkFDbEVBLHFFQUFxRUE7d0JBQ3JFQSxpREFBaURBO3dCQUNqREEsY0FBY0EsR0FBR0EsSUFBSUEsYUFBUUEsQ0FDekJBLElBQUlBLHdCQUFhQSxDQUFDQSxpQ0FBaUNBLENBQUNBLEVBQUVBLGNBQWNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQ2hGQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDVkEsb0JBQW9CQSxHQUFHQSxLQUFLQSxDQUFDQTtvQkFDL0JBLENBQUNBO29CQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDTkEsb0JBQW9CQSxHQUFHQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLFlBQVlBLENBQUNBO29CQUNwRUEsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsWUFBWUE7b0JBQ1pBLGNBQWNBLEdBQUdBLFlBQVlBLENBQUNBO29CQUM5QkEsb0JBQW9CQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDOUJBLENBQUNBO2dCQUNEQSxLQUFLQSxDQUFDQTtRQUNWQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSx3QkFBd0JBLENBQUNBLGNBQWNBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7SUFDNUVBLENBQUNBO0lBdUNERix3Q0FBbUJBLEdBQW5CQSxVQUFvQkEsYUFBc0JBLElBQUlHLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO0lBRTNFSCxrQ0FBYUEsR0FBckJBO1FBQ0VJLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQzFEQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN2RkEsQ0FBQ0E7SUFFREosdUNBQWtCQSxHQUFsQkEsVUFBbUJBLElBQVlBO1FBQzdCSyxJQUFJQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSx5QkFBeUJBLENBQUNBO1FBQzlDQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsNkJBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUM5REEsQ0FBQ0E7SUFFREwsdUNBQWtCQSxHQUFsQkEsVUFBbUJBLElBQVlBO1FBQzdCTSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSx5QkFBeUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZEQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFTQSxLQUFLQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtJQUMzRkEsQ0FBQ0E7SUFFRE4sd0JBQUdBLEdBQUhBLFVBQUlBLEtBQVVBLElBQVNPLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFEUCxpQ0FBWUEsR0FBWkEsVUFBYUEsSUFBVUEsSUFBYVEsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXpGUixpQ0FBWUEsR0FBWkEsY0FBc0JTLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoR1QsZ0NBQVdBLEdBQVhBLGNBQTBCVSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsRFYsa0NBQWFBLEdBQWJBLGNBQThCVyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRFgsd0NBQW1CQSxHQUFuQkEsY0FBMENZLE1BQU1BLENBQUNBLElBQUlBLHNDQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFL0VaLG1DQUFjQSxHQUFkQTtRQUNFYSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsMkJBQVlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3BDQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVEYixrQ0FBYUEsR0FBYkEsVUFBY0EsUUFBa0JBLEVBQUVBLFFBQTBCQSxFQUFFQSxHQUFlQTtRQUMzRWMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsWUFBWUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQ0EsSUFBSUEsTUFBTUEsR0FBd0JBLEdBQUdBLENBQUNBO1lBRXRDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBRXpFQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUVuRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaEVBLG9FQUFvRUE7Z0JBQ3BFQSw2REFBNkRBO2dCQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeENBLG1EQUFtREE7b0JBQ25EQSx5QkFBeUJBO29CQUN6QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsK0JBQStCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDbkRBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQzVDQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO1lBQzlCQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7WUFDcENBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxREEsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7Z0JBQy9CQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDcENBLE1BQU1BLElBQUlBLG9CQUFlQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDOUNBLENBQUNBO2dCQUNEQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNaQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBO1lBQ2xDQSxDQUFDQTtRQUVIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxZQUFZQSw0QkFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzdEQSxvRUFBb0VBO2dCQUNwRUEsNkRBQTZEQTtnQkFDN0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3hDQSxtREFBbURBO29CQUNuREEseUJBQXlCQTtvQkFDekJBLE1BQU1BLENBQUNBLElBQUlBLCtCQUErQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLGNBQWNBLENBQUNBO2dCQUN4Q0EsQ0FBQ0E7WUFDSEEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0Esb0JBQVNBLENBQUNBO0lBQ25CQSxDQUFDQTtJQUVPZCxvQ0FBZUEsR0FBdkJBLFVBQXdCQSxHQUF3QkE7UUFDOUNlLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsNkJBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxVQUFVQSxFQUFFQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0RkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURmLCtDQUEwQkEsR0FBMUJBLFVBQTJCQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURnQixJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQTtRQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsS0FBS0EsMEJBQVdBLElBQUlBLGdCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3REEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSwwQkFBMEJBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pEQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPaEIsd0NBQW1CQSxHQUEzQkE7UUFDRWlCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNDQSxNQUFNQSxDQUFDQSxtQkFBbUJBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUNOQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxJQUFJQSxtQkFBbUJBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEZBLE1BQU1BLENBQUNBLElBQUlBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBR0RqQix3Q0FBbUJBLEdBQW5CQSxVQUFvQkEsS0FBYUEsSUFBU2tCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRS9FbEIsdUNBQWtCQSxHQUFsQkE7UUFDRW1CLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBO0lBQzlFQSxDQUFDQTtJQUVEbkIsMENBQXFCQSxHQUFyQkE7UUFDRW9CLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBO0lBQ2pGQSxDQUFDQTtJQUVEcEIsaURBQTRCQSxHQUE1QkE7UUFDRXFCLElBQUlBLEdBQUdBLEdBQWVBLElBQUlBLENBQUNBO1FBQzNCQSxPQUFPQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDdEJBLEdBQUdBLENBQUNBLGtCQUFrQkEsRUFBRUEsQ0FBQ0E7WUFDekJBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0VBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLG1CQUFtQkEsQ0FBQ0E7WUFDM0NBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUNuQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT3JCLHVDQUFrQkEsR0FBMUJBO1FBQ0VzQixFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLHdCQUF3QkEsRUFBRUEsQ0FBQ0E7UUFDakRBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxjQUFjQSxDQUFDQSxxQkFBcUJBLEVBQUVBLENBQUNBO1FBQzdFQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNIdEIsaUJBQUNBO0FBQURBLENBQUNBLEFBL09ELElBK09DO0FBL09ZLGtCQUFVLGFBK090QixDQUFBO0FBVUQ7SUFBQXVCO0lBUUFDLENBQUNBO0lBUENELHNEQUF3QkEsR0FBeEJBLGNBQWtDRSxDQUFDQTtJQUNuQ0YsbURBQXFCQSxHQUFyQkEsY0FBK0JHLENBQUNBO0lBQ2hDSCxrREFBb0JBLEdBQXBCQSxjQUE4QkksQ0FBQ0E7SUFDL0JKLCtDQUFpQkEsR0FBakJBLGNBQTJCSyxDQUFDQTtJQUM1QkwsdUNBQVNBLEdBQVRBLFVBQVVBLEtBQW9CQTtRQUM1Qk0sTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHFDQUFtQ0EsS0FBS0EsTUFBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBQ0hOLDBCQUFDQTtBQUFEQSxDQUFDQSxBQVJELElBUUM7QUFFRCxJQUFJLG1CQUFtQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUVwRDtJQU9FTyw2QkFBWUEsRUFBY0E7UUFDeEJDLElBQUlBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLGNBQWNBLENBQUNBO1FBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3pFQSxDQUFDQTtJQUVERCxzREFBd0JBLEdBQXhCQTtRQUNFRSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakZBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVERixtREFBcUJBLEdBQXJCQTtRQUNFRyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2xGQSxDQUFDQTtJQUVESCxrREFBb0JBLEdBQXBCQTtRQUNFSSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESiwrQ0FBaUJBLEdBQWpCQTtRQUNFSyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVETCx1Q0FBU0EsR0FBVEEsVUFBVUEsS0FBb0JBO1FBQzVCTSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEs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Q0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERixxREFBWUEsR0FBWkEsY0FBc0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMURILHVEQUFjQSxHQUFkQSxVQUFlQSxHQUFRQTtRQUNyQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esd0JBQXdCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDNURBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDNURBLENBQUNBO0lBRURKLG1FQUEwQkEsR0FBMUJBLFVBQTJCQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURLLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENB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SUFDOUZMLGtEQUFRQSxHQUFSQSxjQUFtQk0sSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcEZOLHNDQUFDQTtBQUFEQSxDQUFDQSxBQVJELEVBQThDLG9DQUFpQixFQVE5RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBUeXBlLCBzdHJpbmdpZnksIENPTlNUX0VYUFIsIFN0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RvciwgS2V5LCBEZXBlbmRlbmN5LCBwcm92aWRlLCBQcm92aWRlciwgUmVzb2x2ZWRQcm92aWRlciwgTm9Qcm92aWRlckVycm9yLCBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsIEN5Y2xpY0RlcGVuZGVuY3lFcnJvciwgcmVzb2x2ZUZvcndhcmRSZWYsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7bWVyZ2VSZXNvbHZlZFByb3ZpZGVyc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtVTkRFRklORUQsIFByb3RvSW5qZWN0b3IsIFZpc2liaWxpdHksIEluamVjdG9ySW5saW5lU3RyYXRlZ3ksIEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBQcm92aWRlcldpdGhWaXNpYmlsaXR5LCBEZXBlbmRlbmN5UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2luamVjdG9yJztcbmltcG9ydCB7cmVzb2x2ZVByb3ZpZGVyLCBSZXNvbHZlZEZhY3RvcnksIFJlc29sdmVkUHJvdmlkZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5cbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIFF1ZXJ5TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtFbGVtZW50UmVmX30gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5cbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZiwgVGVtcGxhdGVSZWZffSBmcm9tICcuL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge0RpcmVjdGl2ZU1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yLCBDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1NldHRlckZufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3R5cGVzJztcbmltcG9ydCB7QWZ0ZXJWaWV3Q2hlY2tlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtQaXBlUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BpcGVzL3BpcGVfcHJvdmlkZXInO1xuXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZffSBmcm9tICcuL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge1Jlc29sdmVkTWV0YWRhdGFDYWNoZX0gZnJvbSAnLi9yZXNvbHZlZF9tZXRhZGF0YV9jYWNoZSc7XG5cbnZhciBfc3RhdGljS2V5cztcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0tleXMge1xuICB0ZW1wbGF0ZVJlZklkOiBudW1iZXI7XG4gIHZpZXdDb250YWluZXJJZDogbnVtYmVyO1xuICBjaGFuZ2VEZXRlY3RvclJlZklkOiBudW1iZXI7XG4gIGVsZW1lbnRSZWZJZDogbnVtYmVyO1xuICByZW5kZXJlcklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZVJlZklkID0gS2V5LmdldChUZW1wbGF0ZVJlZikuaWQ7XG4gICAgdGhpcy52aWV3Q29udGFpbmVySWQgPSBLZXkuZ2V0KFZpZXdDb250YWluZXJSZWYpLmlkO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWZJZCA9IEtleS5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpLmlkO1xuICAgIHRoaXMuZWxlbWVudFJlZklkID0gS2V5LmdldChFbGVtZW50UmVmKS5pZDtcbiAgICB0aGlzLnJlbmRlcmVySWQgPSBLZXkuZ2V0KFJlbmRlcmVyKS5pZDtcbiAgfVxuXG4gIHN0YXRpYyBpbnN0YW5jZSgpOiBTdGF0aWNLZXlzIHtcbiAgICBpZiAoaXNCbGFuayhfc3RhdGljS2V5cykpIF9zdGF0aWNLZXlzID0gbmV3IFN0YXRpY0tleXMoKTtcbiAgICByZXR1cm4gX3N0YXRpY0tleXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZURlcGVuZGVuY3kgZXh0ZW5kcyBEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsXG4gICAgICBwcm9wZXJ0aWVzOiBhbnlbXSwgcHVibGljIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgcHVibGljIHF1ZXJ5RGVjb3JhdG9yOiBRdWVyeU1ldGFkYXRhKSB7XG4gICAgc3VwZXIoa2V5LCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LCBwcm9wZXJ0aWVzKTtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZlcmlmeSgpOiB2b2lkIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeURlY29yYXRvcikpIGNvdW50Kys7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmF0dHJpYnV0ZU5hbWUpKSBjb3VudCsrO1xuICAgIGlmIChjb3VudCA+IDEpXG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAnQSBkaXJlY3RpdmUgaW5qZWN0YWJsZSBjYW4gY29udGFpbiBvbmx5IG9uZSBvZiB0aGUgZm9sbG93aW5nIEBBdHRyaWJ1dGUgb3IgQFF1ZXJ5LicpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb20oZDogRGVwZW5kZW5jeSk6IERpcmVjdGl2ZURlcGVuZGVuY3kge1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlRGVwZW5kZW5jeShcbiAgICAgICAgZC5rZXksIGQub3B0aW9uYWwsIGQubG93ZXJCb3VuZFZpc2liaWxpdHksIGQudXBwZXJCb3VuZFZpc2liaWxpdHksIGQucHJvcGVydGllcyxcbiAgICAgICAgRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZShkLnByb3BlcnRpZXMpLCBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9xdWVyeShkLnByb3BlcnRpZXMpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9hdHRyaWJ1dGVOYW1lKHByb3BlcnRpZXM6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgcCA9IDxBdHRyaWJ1dGVNZXRhZGF0YT5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgIHJldHVybiBpc1ByZXNlbnQocCkgPyBwLmF0dHJpYnV0ZU5hbWUgOiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3F1ZXJ5KHByb3BlcnRpZXM6IGFueVtdKTogUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIDxRdWVyeU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBRdWVyeU1ldGFkYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUHJvdmlkZXIgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyXyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAga2V5OiBLZXksIGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzOiBEZXBlbmRlbmN5W10sIHB1YmxpYyBpc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICAgIHB1YmxpYyBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSwgcHVibGljIHZpZXdQcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSxcbiAgICAgIHB1YmxpYyBxdWVyaWVzOiBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcltdKSB7XG4gICAgc3VwZXIoa2V5LCBbbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5LCBkZXBzKV0sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5rZXkuZGlzcGxheU5hbWU7IH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbVR5cGUodHlwZTogVHlwZSwgbWV0YTogRGlyZWN0aXZlTWV0YWRhdGEpOiBEaXJlY3RpdmVQcm92aWRlciB7XG4gICAgdmFyIHByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKHR5cGUsIHt1c2VDbGFzczogdHlwZX0pO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICBtZXRhID0gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKCk7XG4gICAgfVxuICAgIHZhciByYiA9IHJlc29sdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgdmFyIHJmID0gcmIucmVzb2x2ZWRGYWN0b3JpZXNbMF07XG4gICAgdmFyIGRlcHM6IERpcmVjdGl2ZURlcGVuZGVuY3lbXSA9IHJmLmRlcGVuZGVuY2llcy5tYXAoRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tKTtcbiAgICB2YXIgaXNDb21wb25lbnQgPSBtZXRhIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGE7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gaXNQcmVzZW50KG1ldGEucHJvdmlkZXJzKSA/IEluamVjdG9yLnJlc29sdmUobWV0YS5wcm92aWRlcnMpIDogbnVsbDtcbiAgICB2YXIgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzID0gbWV0YSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhICYmIGlzUHJlc2VudChtZXRhLnZpZXdQcm92aWRlcnMpID9cbiAgICAgICAgSW5qZWN0b3IucmVzb2x2ZShtZXRhLnZpZXdQcm92aWRlcnMpIDpcbiAgICAgICAgbnVsbDtcbiAgICB2YXIgcXVlcmllcyA9IFtdO1xuICAgIGlmIChpc1ByZXNlbnQobWV0YS5xdWVyaWVzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKG1ldGEucXVlcmllcywgKG1ldGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICB2YXIgc2V0dGVyID0gcmVmbGVjdG9yLnNldHRlcihmaWVsZE5hbWUpO1xuICAgICAgICBxdWVyaWVzLnB1c2gobmV3IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyKHNldHRlciwgbWV0YSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHF1ZXJpZXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIGFmdGVyIGNvbnN0cnVjdG9yIHF1ZXJpZXMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICBkZXBzLmZvckVhY2goZCA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGQucXVlcnlEZWNvcmF0b3IpKSB7XG4gICAgICAgIHF1ZXJpZXMucHVzaChuZXcgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIobnVsbCwgZC5xdWVyeURlY29yYXRvcikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlUHJvdmlkZXIoXG4gICAgICAgIHJiLmtleSwgcmYuZmFjdG9yeSwgZGVwcywgaXNDb21wb25lbnQsIHJlc29sdmVkUHJvdmlkZXJzLCByZXNvbHZlZFZpZXdQcm92aWRlcnMsIHF1ZXJpZXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgbWV0YWRhdGE6IFF1ZXJ5TWV0YWRhdGEpIHt9XG59XG5cblxuZnVuY3Rpb24gc2V0UHJvdmlkZXJzVmlzaWJpbGl0eShcbiAgICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSwgcmVzdWx0OiBNYXA8bnVtYmVyLCBWaXNpYmlsaXR5Pikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHJlc3VsdC5zZXQocHJvdmlkZXJzW2ldLmtleS5pZCwgdmlzaWJpbGl0eSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFwcFByb3RvRWxlbWVudCB7XG4gIHByb3RvSW5qZWN0b3I6IFByb3RvSW5qZWN0b3I7XG5cbiAgc3RhdGljIGNyZWF0ZShcbiAgICAgIG1ldGFkYXRhQ2FjaGU6IFJlc29sdmVkTWV0YWRhdGFDYWNoZSwgaW5kZXg6IG51bWJlciwgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICBkaXJlY3RpdmVUeXBlczogVHlwZVtdLCBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSk6IEFwcFByb3RvRWxlbWVudCB7XG4gICAgdmFyIGNvbXBvbmVudERpclByb3ZpZGVyID0gbnVsbDtcbiAgICB2YXIgbWVyZ2VkUHJvdmlkZXJzTWFwOiBNYXA8bnVtYmVyLCBSZXNvbHZlZFByb3ZpZGVyPiA9IG5ldyBNYXA8bnVtYmVyLCBSZXNvbHZlZFByb3ZpZGVyPigpO1xuICAgIHZhciBwcm92aWRlclZpc2liaWxpdHlNYXA6IE1hcDxudW1iZXIsIFZpc2liaWxpdHk+ID0gbmV3IE1hcDxudW1iZXIsIFZpc2liaWxpdHk+KCk7XG4gICAgdmFyIHByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUdyb3dhYmxlU2l6ZShkaXJlY3RpdmVUeXBlcy5sZW5ndGgpO1xuXG4gICAgdmFyIHByb3RvUXVlcnlSZWZzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVUeXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRpclByb3ZpZGVyID0gbWV0YWRhdGFDYWNoZS5nZXRSZXNvbHZlZERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGVzW2ldKTtcbiAgICAgIHByb3ZpZGVyc1tpXSA9IG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KFxuICAgICAgICAgIGRpclByb3ZpZGVyLCBkaXJQcm92aWRlci5pc0NvbXBvbmVudCA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljKTtcblxuICAgICAgaWYgKGRpclByb3ZpZGVyLmlzQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudERpclByb3ZpZGVyID0gZGlyUHJvdmlkZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGRpclByb3ZpZGVyLnByb3ZpZGVycykpIHtcbiAgICAgICAgICBtZXJnZVJlc29sdmVkUHJvdmlkZXJzKGRpclByb3ZpZGVyLnByb3ZpZGVycywgbWVyZ2VkUHJvdmlkZXJzTWFwKTtcbiAgICAgICAgICBzZXRQcm92aWRlcnNWaXNpYmlsaXR5KGRpclByb3ZpZGVyLnByb3ZpZGVycywgVmlzaWJpbGl0eS5QdWJsaWMsIHByb3ZpZGVyVmlzaWJpbGl0eU1hcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyUHJvdmlkZXIudmlld1Byb3ZpZGVycykpIHtcbiAgICAgICAgbWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhkaXJQcm92aWRlci52aWV3UHJvdmlkZXJzLCBtZXJnZWRQcm92aWRlcnNNYXApO1xuICAgICAgICBzZXRQcm92aWRlcnNWaXNpYmlsaXR5KFxuICAgICAgICAgICAgZGlyUHJvdmlkZXIudmlld1Byb3ZpZGVycywgVmlzaWJpbGl0eS5Qcml2YXRlLCBwcm92aWRlclZpc2liaWxpdHlNYXApO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgcXVlcnlJZHggPSAwOyBxdWVyeUlkeCA8IGRpclByb3ZpZGVyLnF1ZXJpZXMubGVuZ3RoOyBxdWVyeUlkeCsrKSB7XG4gICAgICAgIHZhciBxID0gZGlyUHJvdmlkZXIucXVlcmllc1txdWVyeUlkeF07XG4gICAgICAgIHByb3RvUXVlcnlSZWZzLnB1c2gobmV3IFByb3RvUXVlcnlSZWYoaSwgcS5zZXR0ZXIsIHEubWV0YWRhdGEpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnREaXJQcm92aWRlcikgJiYgaXNQcmVzZW50KGNvbXBvbmVudERpclByb3ZpZGVyLnByb3ZpZGVycykpIHtcbiAgICAgIC8vIGRpcmVjdGl2ZSBwcm92aWRlcnMgbmVlZCB0byBiZSBwcmlvcml0aXplZCBvdmVyIGNvbXBvbmVudCBwcm92aWRlcnNcbiAgICAgIG1lcmdlUmVzb2x2ZWRQcm92aWRlcnMoY29tcG9uZW50RGlyUHJvdmlkZXIucHJvdmlkZXJzLCBtZXJnZWRQcm92aWRlcnNNYXApO1xuICAgICAgc2V0UHJvdmlkZXJzVmlzaWJpbGl0eShcbiAgICAgICAgICBjb21wb25lbnREaXJQcm92aWRlci5wcm92aWRlcnMsIFZpc2liaWxpdHkuUHVibGljLCBwcm92aWRlclZpc2liaWxpdHlNYXApO1xuICAgIH1cbiAgICBtZXJnZWRQcm92aWRlcnNNYXAuZm9yRWFjaCgocHJvdmlkZXIsIF8pID0+IHtcbiAgICAgIHByb3ZpZGVycy5wdXNoKFxuICAgICAgICAgIG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KHByb3ZpZGVyLCBwcm92aWRlclZpc2liaWxpdHlNYXAuZ2V0KHByb3ZpZGVyLmtleS5pZCkpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQXBwUHJvdG9FbGVtZW50KFxuICAgICAgICBpc1ByZXNlbnQoY29tcG9uZW50RGlyUHJvdmlkZXIpLCBpbmRleCwgYXR0cmlidXRlcywgcHJvdmlkZXJzLCBwcm90b1F1ZXJ5UmVmcyxcbiAgICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sIHB1YmxpYyBpbmRleDogbnVtYmVyLFxuICAgICAgcHVibGljIGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBwd3ZzOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sXG4gICAgICBwdWJsaWMgcHJvdG9RdWVyeVJlZnM6IFByb3RvUXVlcnlSZWZbXSxcbiAgICAgIHB1YmxpYyBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSkge1xuICAgIHZhciBsZW5ndGggPSBwd3ZzLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm90b0luamVjdG9yID0gbmV3IFByb3RvSW5qZWN0b3IocHd2cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvdG9JbmplY3RvciA9IG51bGw7XG4gICAgICB0aGlzLnByb3RvUXVlcnlSZWZzID0gW107XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5wcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleChpbmRleCk7IH1cbn1cblxuY2xhc3MgX0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBob3N0SW5qZWN0b3JCb3VuZGFyeTogYm9vbGVhbikge31cbn1cblxuZXhwb3J0IGNsYXNzIEFwcEVsZW1lbnQgaW1wbGVtZW50cyBEZXBlbmRlbmN5UHJvdmlkZXIsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0NoZWNrZWQge1xuICBzdGF0aWMgZ2V0Vmlld1BhcmVudEluamVjdG9yKFxuICAgICAgcGFyZW50Vmlld1R5cGU6IFZpZXdUeXBlLCBjb250YWluZXJBcHBFbGVtZW50OiBBcHBFbGVtZW50LFxuICAgICAgaW1wZXJhdGl2ZWx5Q3JlYXRlZFByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgICAgcm9vdEluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSB7XG4gICAgdmFyIHBhcmVudEluamVjdG9yO1xuICAgIHZhciBob3N0SW5qZWN0b3JCb3VuZGFyeTtcbiAgICBzd2l0Y2ggKHBhcmVudFZpZXdUeXBlKSB7XG4gICAgICBjYXNlIFZpZXdUeXBlLkNPTVBPTkVOVDpcbiAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3RvcjtcbiAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuRU1CRURERUQ6XG4gICAgICAgIHBhcmVudEluamVjdG9yID0gaXNQcmVzZW50KGNvbnRhaW5lckFwcEVsZW1lbnQucHJvdG8ucHJvdG9JbmplY3RvcikgP1xuICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IucGFyZW50IDpcbiAgICAgICAgICAgIGNvbnRhaW5lckFwcEVsZW1lbnQuX2luamVjdG9yO1xuICAgICAgICBob3N0SW5qZWN0b3JCb3VuZGFyeSA9IGNvbnRhaW5lckFwcEVsZW1lbnQuX2luamVjdG9yLmhvc3RCb3VuZGFyeTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkhPU1Q6XG4gICAgICAgIGlmIChpc1ByZXNlbnQoY29udGFpbmVyQXBwRWxlbWVudCkpIHtcbiAgICAgICAgICAvLyBob3N0IHZpZXcgaXMgYXR0YWNoZWQgdG8gYSBjb250YWluZXJcbiAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IGlzUHJlc2VudChjb250YWluZXJBcHBFbGVtZW50LnByb3RvLnByb3RvSW5qZWN0b3IpID9cbiAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IucGFyZW50IDpcbiAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3I7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkUHJvdmlkZXJzKSkge1xuICAgICAgICAgICAgdmFyIGltcGVyYXRpdmVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSA9IGltcGVyYXRpdmVseUNyZWF0ZWRQcm92aWRlcnMubWFwKFxuICAgICAgICAgICAgICAgIHAgPT4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkocCwgVmlzaWJpbGl0eS5QdWJsaWMpKTtcbiAgICAgICAgICAgIC8vIFRoZSBpbXBlcmF0aXZlIGluamVjdG9yIGlzIHNpbWlsYXIgdG8gaGF2aW5nIGFuIGVsZW1lbnQgYmV0d2VlblxuICAgICAgICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyeSBiZXR3ZWVuXG4gICAgICAgICAgICAvLyB0aGUgY29tcG9uZW50IGFuZCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IuXG4gICAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IG5ldyBJbmplY3RvcihcbiAgICAgICAgICAgICAgICBuZXcgUHJvdG9JbmplY3RvcihpbXBlcmF0aXZlUHJvdmlkZXJzV2l0aFZpc2liaWxpdHkpLCBwYXJlbnRJbmplY3RvciwgdHJ1ZSwgbnVsbCxcbiAgICAgICAgICAgICAgICBudWxsKTtcbiAgICAgICAgICAgIGhvc3RJbmplY3RvckJvdW5kYXJ5ID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhvc3RJbmplY3RvckJvdW5kYXJ5ID0gY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IuaG9zdEJvdW5kYXJ5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBib290c3RyYXBcbiAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IHJvb3RJbmplY3RvcjtcbiAgICAgICAgICBob3N0SW5qZWN0b3JCb3VuZGFyeSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSW5qZWN0b3JXaXRoSG9zdEJvdW5kYXJ5KHBhcmVudEluamVjdG9yLCBob3N0SW5qZWN0b3JCb3VuZGFyeSk7XG4gIH1cblxuICBwdWJsaWMgbmVzdGVkVmlld3M6IEFwcFZpZXdbXSA9IG51bGw7XG4gIHB1YmxpYyBjb21wb25lbnRWaWV3OiBBcHBWaWV3ID0gbnVsbDtcblxuICBwcml2YXRlIF9xdWVyeVN0cmF0ZWd5OiBfUXVlcnlTdHJhdGVneTtcbiAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcml2YXRlIF9zdHJhdGVneTogX0VsZW1lbnREaXJlY3RpdmVTdHJhdGVneTtcbiAgcHVibGljIHJlZjogRWxlbWVudFJlZl87XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcHJvdG86IEFwcFByb3RvRWxlbWVudCwgcHVibGljIHBhcmVudFZpZXc6IEFwcFZpZXcsIHB1YmxpYyBwYXJlbnQ6IEFwcEVsZW1lbnQsXG4gICAgICBwdWJsaWMgbmF0aXZlRWxlbWVudDogYW55LCBwdWJsaWMgZW1iZWRkZWRWaWV3RmFjdG9yeTogRnVuY3Rpb24pIHtcbiAgICB0aGlzLnJlZiA9IG5ldyBFbGVtZW50UmVmXyh0aGlzKTtcbiAgICB2YXIgcGFyZW50SW5qZWN0b3IgPSBpc1ByZXNlbnQocGFyZW50KSA/IHBhcmVudC5faW5qZWN0b3IgOiBwYXJlbnRWaWV3LnBhcmVudEluamVjdG9yO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5wcm90by5wcm90b0luamVjdG9yKSkge1xuICAgICAgdmFyIGlzQm91bmRhcnk7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkgJiYgaXNQcmVzZW50KHBhcmVudC5wcm90by5wcm90b0luamVjdG9yKSkge1xuICAgICAgICBpc0JvdW5kYXJ5ID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0JvdW5kYXJ5ID0gcGFyZW50Vmlldy5ob3N0SW5qZWN0b3JCb3VuZGFyeTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kgPSB0aGlzLl9idWlsZFF1ZXJ5U3RyYXRlZ3koKTtcbiAgICAgIHRoaXMuX2luamVjdG9yID0gbmV3IEluamVjdG9yKFxuICAgICAgICAgIHRoaXMucHJvdG8ucHJvdG9JbmplY3RvciwgcGFyZW50SW5qZWN0b3IsIGlzQm91bmRhcnksIHRoaXMsICgpID0+IHRoaXMuX2RlYnVnQ29udGV4dCgpKTtcblxuICAgICAgLy8gd2UgY291cGxlIG91cnNlbHZlcyB0byB0aGUgaW5qZWN0b3Igc3RyYXRlZ3kgdG8gYXZvaWQgcG9seW1vcnBoaWMgY2FsbHNcbiAgICAgIHZhciBpbmplY3RvclN0cmF0ZWd5ID0gPGFueT50aGlzLl9pbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5O1xuICAgICAgdGhpcy5fc3RyYXRlZ3kgPSBpbmplY3RvclN0cmF0ZWd5IGluc3RhbmNlb2YgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSA/XG4gICAgICAgICAgbmV3IEVsZW1lbnREaXJlY3RpdmVJbmxpbmVTdHJhdGVneShpbmplY3RvclN0cmF0ZWd5LCB0aGlzKSA6XG4gICAgICAgICAgbmV3IEVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcyk7XG4gICAgICB0aGlzLl9zdHJhdGVneS5pbml0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kgPSBudWxsO1xuICAgICAgdGhpcy5faW5qZWN0b3IgPSBwYXJlbnRJbmplY3RvcjtcbiAgICAgIHRoaXMuX3N0cmF0ZWd5ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhdHRhY2hDb21wb25lbnRWaWV3KGNvbXBvbmVudFZpZXc6IEFwcFZpZXcpIHsgdGhpcy5jb21wb25lbnRWaWV3ID0gY29tcG9uZW50VmlldzsgfVxuXG4gIHByaXZhdGUgX2RlYnVnQ29udGV4dCgpOiBhbnkge1xuICAgIHZhciBjID0gdGhpcy5wYXJlbnRWaWV3LmdldERlYnVnQ29udGV4dCh0aGlzLCBudWxsLCBudWxsKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGMpID8gbmV3IF9Db250ZXh0KGMuZWxlbWVudCwgYy5jb21wb25lbnRFbGVtZW50LCBjLmluamVjdG9yKSA6IG51bGw7XG4gIH1cblxuICBoYXNWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIHZiID0gdGhpcy5wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICAgIHJldHVybiBpc1ByZXNlbnQodmIpICYmIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModmIsIG5hbWUpO1xuICB9XG5cbiAgZ2V0VmFyaWFibGVCaW5kaW5nKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzW25hbWVdO1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5kZXgpID8gdGhpcy5nZXREaXJlY3RpdmVBdEluZGV4KDxudW1iZXI+aW5kZXgpIDogdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQodG9rZW4pOyB9XG5cbiAgaGFzRGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9pbmplY3Rvci5nZXRPcHRpb25hbCh0eXBlKSk7IH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9zdHJhdGVneSkgPyB0aGlzLl9zdHJhdGVneS5nZXRDb21wb25lbnQoKSA6IG51bGw7IH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldEVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLnJlZjsgfVxuXG4gIGdldFZpZXdDb250YWluZXJSZWYoKTogVmlld0NvbnRhaW5lclJlZiB7IHJldHVybiBuZXcgVmlld0NvbnRhaW5lclJlZl8odGhpcyk7IH1cblxuICBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmVtYmVkZGVkVmlld0ZhY3RvcnkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlbXBsYXRlUmVmXyh0aGlzLnJlZik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3kpOiBhbnkge1xuICAgIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICB2YXIgZGlyRGVwID0gPERpcmVjdGl2ZURlcGVuZGVuY3k+ZGVwO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5hdHRyaWJ1dGVOYW1lKSkgcmV0dXJuIHRoaXMuX2J1aWxkQXR0cmlidXRlKGRpckRlcCk7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5KGRpckRlcC5xdWVyeURlY29yYXRvcikubGlzdDtcblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIC8vIFdlIHByb3ZpZGUgdGhlIGNvbXBvbmVudCdzIHZpZXcgY2hhbmdlIGRldGVjdG9yIHRvIGNvbXBvbmVudHMgYW5kXG4gICAgICAgIC8vIHRoZSBzdXJyb3VuZGluZyBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgdG8gZGlyZWN0aXZlcy5cbiAgICAgICAgaWYgKHRoaXMucHJvdG8uZmlyc3RQcm92aWRlcklzQ29tcG9uZW50KSB7XG4gICAgICAgICAgLy8gTm90ZTogVGhlIGNvbXBvbmVudCB2aWV3IGlzIG5vdCB5ZXQgY3JlYXRlZCB3aGVuXG4gICAgICAgICAgLy8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIVxuICAgICAgICAgIHJldHVybiBuZXcgX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZih0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmVsZW1lbnRSZWZJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudmlld0NvbnRhaW5lcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdDb250YWluZXJSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS50ZW1wbGF0ZVJlZklkKSB7XG4gICAgICAgIHZhciB0ciA9IHRoaXMuZ2V0VGVtcGxhdGVSZWYoKTtcbiAgICAgICAgaWYgKGlzQmxhbmsodHIpICYmICFkaXJEZXAub3B0aW9uYWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgTm9Qcm92aWRlckVycm9yKG51bGwsIGRpckRlcC5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5yZW5kZXJlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudFZpZXcucmVuZGVyZXI7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUGlwZVByb3ZpZGVyKSB7XG4gICAgICBpZiAoZGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgLy8gV2UgcHJvdmlkZSB0aGUgY29tcG9uZW50J3MgdmlldyBjaGFuZ2UgZGV0ZWN0b3IgdG8gY29tcG9uZW50cyBhbmRcbiAgICAgICAgLy8gdGhlIHN1cnJvdW5kaW5nIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciB0byBkaXJlY3RpdmVzLlxuICAgICAgICBpZiAodGhpcy5wcm90by5maXJzdFByb3ZpZGVySXNDb21wb25lbnQpIHtcbiAgICAgICAgICAvLyBOb3RlOiBUaGUgY29tcG9uZW50IHZpZXcgaXMgbm90IHlldCBjcmVhdGVkIHdoZW5cbiAgICAgICAgICAvLyB0aGlzIG1ldGhvZCBpcyBjYWxsZWQhXG4gICAgICAgICAgcmV0dXJuIG5ldyBfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBdHRyaWJ1dGUoZGVwOiBEaXJlY3RpdmVEZXBlbmRlbmN5KTogc3RyaW5nIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMucHJvdG8uYXR0cmlidXRlcztcbiAgICBpZiAoaXNQcmVzZW50KGF0dHJpYnV0ZXMpICYmIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoYXR0cmlidXRlcywgZGVwLmF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICByZXR1cm4gYXR0cmlidXRlc1tkZXAuYXR0cmlidXRlTmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB0ZW1wbGF0ZVJlZiA9IHRoaXMuZ2V0VGVtcGxhdGVSZWYoKTtcbiAgICBpZiAocXVlcnkuc2VsZWN0b3IgPT09IFRlbXBsYXRlUmVmICYmIGlzUHJlc2VudCh0ZW1wbGF0ZVJlZikpIHtcbiAgICAgIGxpc3QucHVzaCh0ZW1wbGF0ZVJlZik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdHJhdGVneSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeSwgbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRRdWVyeVN0cmF0ZWd5KCk6IF9RdWVyeVN0cmF0ZWd5IHtcbiAgICBpZiAodGhpcy5wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBfZW1wdHlRdWVyeVN0cmF0ZWd5O1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHRoaXMucHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoIDw9IElubGluZVF1ZXJ5U3RyYXRlZ3kuTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTKSB7XG4gICAgICByZXR1cm4gbmV3IElubGluZVF1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRHluYW1pY1F1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfVxuICB9XG5cblxuICBnZXREaXJlY3RpdmVBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0QXQoaW5kZXgpOyB9XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcXVlcnlTdHJhdGVneSkpIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3F1ZXJ5U3RyYXRlZ3kpKSB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk7XG4gIH1cblxuICB0cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIHZhciBpbmo6IEFwcEVsZW1lbnQgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoaW5qKSkge1xuICAgICAgaW5qLl9zZXRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgICAgaWYgKGlzQmxhbmsoaW5qLnBhcmVudCkgJiYgaW5qLnBhcmVudFZpZXcucHJvdG8udHlwZSA9PT0gVmlld1R5cGUuRU1CRURERUQpIHtcbiAgICAgICAgaW5qID0gaW5qLnBhcmVudFZpZXcuY29udGFpbmVyQXBwRWxlbWVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaiA9IGluai5wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9xdWVyeVN0cmF0ZWd5KSkge1xuICAgICAgdGhpcy5fcXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFyZW50Vmlldy5wcm90by50eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIHRoaXMucGFyZW50Vmlldy5jb250YWluZXJBcHBFbGVtZW50Ll9xdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpO1xuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQ7XG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk6IHZvaWQ7XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQ7XG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmO1xufVxuXG5jbGFzcyBfRW1wdHlRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7fVxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7fVxuICB1cGRhdGVDb250ZW50UXVlcmllcygpOiB2b2lkIHt9XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQge31cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbnZhciBfZW1wdHlRdWVyeVN0cmF0ZWd5ID0gbmV3IF9FbXB0eVF1ZXJ5U3RyYXRlZ3koKTtcblxuY2xhc3MgSW5saW5lUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc3RhdGljIE5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUyA9IDM7XG5cbiAgcXVlcnkwOiBRdWVyeVJlZjtcbiAgcXVlcnkxOiBRdWVyeVJlZjtcbiAgcXVlcnkyOiBRdWVyeVJlZjtcblxuICBjb25zdHJ1Y3RvcihlaTogQXBwRWxlbWVudCkge1xuICAgIHZhciBwcm90b1JlZnMgPSBlaS5wcm90by5wcm90b1F1ZXJ5UmVmcztcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDApIHRoaXMucXVlcnkwID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1swXSwgZWkpO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMSkgdGhpcy5xdWVyeTEgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzFdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAyKSB0aGlzLnF1ZXJ5MiA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMl0sIGVpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkwLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MS5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmICF0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTAudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmICF0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTEudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmICF0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTIudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkwLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTEudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5Mi51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgdGhpcy5xdWVyeTAucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxuY2xhc3MgRHluYW1pY1F1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHF1ZXJpZXM6IFF1ZXJ5UmVmW107XG5cbiAgY29uc3RydWN0b3IoZWk6IEFwcEVsZW1lbnQpIHtcbiAgICB0aGlzLnF1ZXJpZXMgPSBlaS5wcm90by5wcm90b1F1ZXJ5UmVmcy5tYXAocCA9PiBuZXcgUXVlcnlSZWYocCwgZWkpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoIXEuaXNWaWV3UXVlcnkpIHEuZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5pc1ZpZXdRdWVyeSkgcS5kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHEudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmludGVyZmFjZSBfRWxlbWVudERpcmVjdGl2ZVN0cmF0ZWd5IHtcbiAgZ2V0Q29tcG9uZW50KCk6IGFueTtcbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuO1xuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxOiBRdWVyeU1ldGFkYXRhLCByZXM6IGFueVtdKTogdm9pZDtcbiAgaW5pdCgpOiB2b2lkO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHVzZWQgYnkgdGhlIGBFbGVtZW50SW5qZWN0b3JgIHdoZW4gdGhlIG51bWJlciBvZiBwcm92aWRlcnMgaXMgMTAgb3IgbGVzcy5cbiAqIEluIHN1Y2ggYSBjYXNlLCBpbmxpbmluZyBmaWVsZHMgaXMgYmVuZWZpY2lhbCBmb3IgcGVyZm9ybWFuY2VzLlxuICovXG5jbGFzcyBFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kgaW1wbGVtZW50cyBfRWxlbWVudERpcmVjdGl2ZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9ySW5saW5lU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEFwcEVsZW1lbnQpIHt9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcbiAgICBpLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgaWYgKHAucHJvdmlkZXIwIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQwKSAmJiBpLm9iajAgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgaWYgKHAucHJvdmlkZXIxIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQxKSAmJiBpLm9iajEgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMSwgcC52aXNpYmlsaXR5MSk7XG4gICAgaWYgKHAucHJvdmlkZXIyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQyKSAmJiBpLm9iajIgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgaWYgKHAucHJvdmlkZXIzIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQzKSAmJiBpLm9iajMgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgaWYgKHAucHJvdmlkZXI0IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ0KSAmJiBpLm9iajQgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNCwgcC52aXNpYmlsaXR5NCk7XG4gICAgaWYgKHAucHJvdmlkZXI1IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ1KSAmJiBpLm9iajUgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgaWYgKHAucHJvdmlkZXI2IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ2KSAmJiBpLm9iajYgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgaWYgKHAucHJvdmlkZXI3IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ3KSAmJiBpLm9iajcgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNywgcC52aXNpYmlsaXR5Nyk7XG4gICAgaWYgKHAucHJvdmlkZXI4IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ4KSAmJiBpLm9iajggPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqOCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgaWYgKHAucHJvdmlkZXI5IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ5KSAmJiBpLm9iajkgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmowOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZWkucHJvdG8uZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ICYmIGlzUHJlc2VudChrZXkpICYmXG4gICAgICAgIGtleS5pZCA9PT0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3kua2V5SWQwO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMCkgJiYgcC5wcm92aWRlcjAua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMCA9PT0gVU5ERUZJTkVEKSBpLm9iajAgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjAsIHAudmlzaWJpbGl0eTApO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjEpICYmIHAucHJvdmlkZXIxLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajEgPT09IFVOREVGSU5FRCkgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajEpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIyKSAmJiBwLnByb3ZpZGVyMi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmoyID09PSBVTkRFRklORUQpIGkub2JqMiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgICBsaXN0LnB1c2goaS5vYmoyKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMykgJiYgcC5wcm92aWRlcjMua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMyA9PT0gVU5ERUZJTkVEKSBpLm9iajMgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjMsIHAudmlzaWJpbGl0eTMpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjQpICYmIHAucHJvdmlkZXI0LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajQgPT09IFVOREVGSU5FRCkgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajQpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI1KSAmJiBwLnByb3ZpZGVyNS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo1ID09PSBVTkRFRklORUQpIGkub2JqNSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo1KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNikgJiYgcC5wcm92aWRlcjYua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNiA9PT0gVU5ERUZJTkVEKSBpLm9iajYgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjYsIHAudmlzaWJpbGl0eTYpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjcpICYmIHAucHJvdmlkZXI3LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajcgPT09IFVOREVGSU5FRCkgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajcpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI4KSAmJiBwLnByb3ZpZGVyOC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo4ID09PSBVTkRFRklORUQpIGkub2JqOCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo4KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyOSkgJiYgcC5wcm92aWRlcjkua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqOSA9PT0gVU5ERUZJTkVEKSBpLm9iajkgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjksIHAudmlzaWJpbGl0eTkpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqOSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGlzIDExIG9yIG1vcmUuXG4gKiBJbiBzdWNoIGEgY2FzZSwgdGhlcmUgYXJlIHRvbyBtYW55IGZpZWxkcyB0byBpbmxpbmUgKHNlZSBFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneSkuXG4gKi9cbmNsYXNzIEVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kgaW1wbGVtZW50cyBfRWxlbWVudERpcmVjdGl2ZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBwdWJsaWMgX2VpOiBBcHBFbGVtZW50KSB7fVxuXG4gIGluaXQoKTogdm9pZCB7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGluai5wcm90b1N0cmF0ZWd5O1xuICAgIGluai5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5rZXlJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkc1tpXSkgJiZcbiAgICAgICAgICBpbmoub2Jqc1tpXSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIGluai5vYmpzW2ldID0gaW5qLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcnNbaV0sIHAudmlzaWJpbGl0aWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmpzWzBdOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICB2YXIgcCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneS5wcm90b1N0cmF0ZWd5O1xuICAgIHJldHVybiB0aGlzLl9laS5wcm90by5maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiYga2V5LmlkID09PSBwLmtleUlkc1swXTtcbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciBpc3QgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpc3QucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICAgIGlmIChpc3Qub2Jqc1tpXSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgICAgaXN0Lm9ianNbaV0gPSBpc3QuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGxpc3QucHVzaChpc3Qub2Jqc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b1F1ZXJ5UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRpckluZGV4OiBudW1iZXIsIHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgcXVlcnk6IFF1ZXJ5TWV0YWRhdGEpIHt9XG5cbiAgZ2V0IHVzZXNQcm9wZXJ0eVN5bnRheCgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnNldHRlcik7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5UmVmIHtcbiAgcHVibGljIGxpc3Q6IFF1ZXJ5TGlzdDxhbnk+O1xuICBwdWJsaWMgZGlydHk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3RvUXVlcnlSZWY6IFByb3RvUXVlcnlSZWYsIHByaXZhdGUgb3JpZ2luYXRvcjogQXBwRWxlbWVudCkge1xuICAgIHRoaXMubGlzdCA9IG5ldyBRdWVyeUxpc3Q8YW55PigpO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgZ2V0IGlzVmlld1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmlld1F1ZXJ5OyB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXJ0eSkgcmV0dXJuO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcblxuICAgIC8vIFRPRE8gZGVsZXRlIHRoZSBjaGVjayBvbmNlIG9ubHkgZmllbGQgcXVlcmllcyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi51c2VzUHJvcGVydHlTeW50YXgpIHtcbiAgICAgIHZhciBkaXIgPSB0aGlzLm9yaWdpbmF0b3IuZ2V0RGlyZWN0aXZlQXRJbmRleCh0aGlzLnByb3RvUXVlcnlSZWYuZGlySW5kZXgpO1xuICAgICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5maXJzdCkge1xuICAgICAgICB0aGlzLnByb3RvUXVlcnlSZWYuc2V0dGVyKGRpciwgdGhpcy5saXN0Lmxlbmd0aCA+IDAgPyB0aGlzLmxpc3QuZmlyc3QgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlzdC5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgYWdncmVnYXRvciA9IFtdO1xuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnkpIHtcbiAgICAgIC8vIGludGVudGlvbmFsbHkgc2tpcHBpbmcgb3JpZ2luYXRvciBmb3IgdmlldyBxdWVyaWVzLlxuICAgICAgdmFyIG5lc3RlZFZpZXcgPSB0aGlzLm9yaWdpbmF0b3IuY29tcG9uZW50VmlldztcbiAgICAgIGlmIChpc1ByZXNlbnQobmVzdGVkVmlldykpIHRoaXMuX3Zpc2l0VmlldyhuZXN0ZWRWaWV3LCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlzaXQodGhpcy5vcmlnaW5hdG9yLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gICAgdGhpcy5saXN0LnJlc2V0KGFnZ3JlZ2F0b3IpO1xuICB9O1xuXG4gIHByaXZhdGUgX3Zpc2l0KGluajogQXBwRWxlbWVudCwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdmlldyA9IGluai5wYXJlbnRWaWV3O1xuICAgIHZhciBzdGFydElkeCA9IGluai5wcm90by5pbmRleDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJZHg7IGkgPCB2aWV3LmFwcEVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VySW5qID0gdmlldy5hcHBFbGVtZW50c1tpXTtcbiAgICAgIC8vIFRoZSBmaXJzdCBpbmplY3RvciBhZnRlciBpbmosIHRoYXQgaXMgb3V0c2lkZSB0aGUgc3VidHJlZSByb290ZWQgYXRcbiAgICAgIC8vIGluaiBoYXMgdG8gaGF2ZSBhIG51bGwgcGFyZW50IG9yIGEgcGFyZW50IHRoYXQgaXMgYW4gYW5jZXN0b3Igb2YgaW5qLlxuICAgICAgaWYgKGkgPiBzdGFydElkeCAmJiAoaXNCbGFuayhjdXJJbmoucGFyZW50KSB8fCBjdXJJbmoucGFyZW50LnByb3RvLmluZGV4IDwgc3RhcnRJZHgpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5kZXNjZW5kYW50cyAmJlxuICAgICAgICAgICEoY3VySW5qLnBhcmVudCA9PSB0aGlzLm9yaWdpbmF0b3IgfHwgY3VySW5qID09IHRoaXMub3JpZ2luYXRvcikpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAvLyBXZSB2aXNpdCB0aGUgdmlldyBjb250YWluZXIoVkMpIHZpZXdzIHJpZ2h0IGFmdGVyIHRoZSBpbmplY3RvciB0aGF0IGNvbnRhaW5zXG4gICAgICAvLyB0aGUgVkMuIFRoZW9yZXRpY2FsbHksIHRoYXQgbWlnaHQgbm90IGJlIHRoZSByaWdodCBvcmRlciBpZiB0aGVyZSBhcmVcbiAgICAgIC8vIGNoaWxkIGluamVjdG9ycyBvZiBzYWlkIGluamVjdG9yLiBOb3QgY2xlYXIgd2hldGhlciBpZiBzdWNoIGNhc2UgY2FuXG4gICAgICAvLyBldmVuIGJlIGNvbnN0cnVjdGVkIHdpdGggdGhlIGN1cnJlbnQgYXBpcy5cbiAgICAgIHRoaXMuX3Zpc2l0SW5qZWN0b3IoY3VySW5qLCBhZ2dyZWdhdG9yKTtcbiAgICAgIHRoaXMuX3Zpc2l0Vmlld0NvbnRhaW5lclZpZXdzKGN1ckluai5uZXN0ZWRWaWV3cywgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRJbmplY3Rvcihpbmo6IEFwcEVsZW1lbnQsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgdGhpcy5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nKGluaiwgYWdncmVnYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmosIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlld0NvbnRhaW5lclZpZXdzKHZpZXdzOiBBcHBWaWV3W10sIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgaWYgKGlzUHJlc2VudCh2aWV3cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmlld3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdGhpcy5fdmlzaXRWaWV3KHZpZXdzW2pdLCBhZ2dyZWdhdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFZpZXcodmlldzogQXBwVmlldywgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcuYXBwRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpbmogPSB2aWV3LmFwcEVsZW1lbnRzW2ldO1xuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihpbmosIGFnZ3JlZ2F0b3IpO1xuICAgICAgdGhpcy5fdmlzaXRWaWV3Q29udGFpbmVyVmlld3MoaW5qLm5lc3RlZFZpZXdzLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qOiBBcHBFbGVtZW50LCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2YiA9IHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS52YXJCaW5kaW5ncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZiLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaW5qLmhhc1ZhcmlhYmxlQmluZGluZyh2YltpXSkpIHtcbiAgICAgICAgYWdncmVnYXRvci5wdXNoKGluai5nZXRWYXJpYWJsZUJpbmRpbmcodmJbaV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZ2dyZWdhdGVEaXJlY3RpdmUoaW5qOiBBcHBFbGVtZW50LCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIGluai5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeSh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnksIGFnZ3JlZ2F0b3IpO1xuICB9XG59XG5cbmNsYXNzIF9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYgZXh0ZW5kcyBDaGFuZ2VEZXRlY3RvclJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2FwcEVsZW1lbnQ6IEFwcEVsZW1lbnQpIHsgc3VwZXIoKTsgfVxuXG4gIG1hcmtGb3JDaGVjaygpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5tYXJrRm9yQ2hlY2soKTsgfVxuICBkZXRhY2goKTogdm9pZCB7IHRoaXMuX2FwcEVsZW1lbnQuY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWYuZGV0YWNoKCk7IH1cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5kZXRlY3RDaGFuZ2VzKCk7IH1cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7IHRoaXMuX2FwcEVsZW1lbnQuY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWYuY2hlY2tOb0NoYW5nZXMoKTsgfVxuICByZWF0dGFjaCgpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5yZWF0dGFjaCgpOyB9XG59XG4iXX0=