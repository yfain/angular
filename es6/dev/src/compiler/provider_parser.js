import { isPresent, isBlank, isArray, normalizeBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { ProviderAst, ProviderAstType } from './template_ast';
import { CompileTypeMetadata, CompileTokenMap, CompileTokenMetadata, CompileProviderMetadata, CompileDiDependencyMetadata } from './compile_metadata';
import { Identifiers, identifierToken } from './identifiers';
import { ParseError } from './parse_util';
export class ProviderError extends ParseError {
    constructor(message, span) {
        super(span, message);
    }
}
export class ProviderViewContext {
    constructor(component, sourceSpan) {
        this.component = component;
        this.sourceSpan = sourceSpan;
        this.errors = [];
        this.viewQueries = _getViewQueries(component);
        this.viewProviders = new CompileTokenMap();
        _normalizeProviders(component.viewProviders, sourceSpan, this.errors)
            .forEach((provider) => {
            if (isBlank(this.viewProviders.get(provider.token))) {
                this.viewProviders.add(provider.token, true);
            }
        });
    }
}
export class ProviderElementContext {
    constructor(_viewContext, _parent, _isViewRoot, _directiveAsts, attrs, _sourceSpan) {
        this._viewContext = _viewContext;
        this._parent = _parent;
        this._isViewRoot = _isViewRoot;
        this._directiveAsts = _directiveAsts;
        this._sourceSpan = _sourceSpan;
        this._transformedProviders = new CompileTokenMap();
        this._seenProviders = new CompileTokenMap();
        this._attrs = {};
        attrs.forEach((attrAst) => this._attrs[attrAst.name] = attrAst.value);
        var directivesMeta = _directiveAsts.map(directiveAst => directiveAst.directive);
        this._allProviders =
            _resolveProvidersFromDirectives(directivesMeta, _sourceSpan, _viewContext.errors);
        this._contentQueries = _getContentQueries(directivesMeta);
        // create the providers that we know are eager first
        this._allProviders.values().forEach((provider) => {
            if (provider.eager || this.isQueried(provider.token)) {
                this._getLocalProvider(provider.providerType, provider.token, true);
            }
        });
    }
    afterElement() {
        // collect lazy providers
        this._allProviders.values().forEach((provider) => { this._getLocalProvider(provider.providerType, provider.token, false); });
    }
    get transformProviders() { return this._transformedProviders.values(); }
    get transformedDirectiveAsts() {
        var sortedProviderTypes = this._transformedProviders.values().map(provider => provider.token.identifier);
        var sortedDirectives = ListWrapper.clone(this._directiveAsts);
        ListWrapper.sort(this._directiveAsts, (dir1, dir2) => sortedProviderTypes.indexOf(dir1.directive.type) -
            sortedProviderTypes.indexOf(dir2.directive.type));
        return sortedDirectives;
    }
    isQueried(token) {
        var currentEl = this;
        var distance = 0;
        while (currentEl !== null) {
            var localQueries = currentEl._contentQueries.get(token);
            if (isPresent(localQueries)) {
                if (localQueries.some((query) => query.descendants || distance <= 1)) {
                    return true;
                }
            }
            if (currentEl._directiveAsts.length > 0) {
                distance++;
            }
            currentEl = currentEl._parent;
        }
        if (isPresent(this._viewContext.viewQueries.get(token))) {
            return true;
        }
        return false;
    }
    _getLocalProvider(requestingProviderType, token, eager) {
        var resolvedProvider = this._allProviders.get(token);
        if (isBlank(resolvedProvider) ||
            ((requestingProviderType === ProviderAstType.Directive ||
                requestingProviderType === ProviderAstType.PublicService) &&
                resolvedProvider.providerType === ProviderAstType.PrivateService) ||
            ((requestingProviderType === ProviderAstType.PrivateService ||
                requestingProviderType === ProviderAstType.PublicService) &&
                resolvedProvider.providerType === ProviderAstType.Builtin)) {
            return null;
        }
        var transformedProviderAst = this._transformedProviders.get(token);
        if (isPresent(transformedProviderAst)) {
            return transformedProviderAst;
        }
        if (isPresent(this._seenProviders.get(token))) {
            this._viewContext.errors.push(new ProviderError(`Cannot instantiate cyclic dependency! ${token.name}`, this._sourceSpan));
            return null;
        }
        this._seenProviders.add(token, true);
        var transformedProviders = resolvedProvider.providers.map((provider) => {
            var transformedUseValue = provider.useValue;
            var transformedUseExisting = provider.useExisting;
            var transformedDeps;
            if (isPresent(provider.useExisting)) {
                var existingDiDep = this._getDependency(resolvedProvider.providerType, new CompileDiDependencyMetadata({ token: provider.useExisting }), eager);
                if (isPresent(existingDiDep.token)) {
                    transformedUseExisting = existingDiDep.token;
                }
                else {
                    transformedUseExisting = null;
                    transformedUseValue = existingDiDep.value;
                }
            }
            else if (isPresent(provider.useFactory)) {
                var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                transformedDeps =
                    deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager));
            }
            else if (isPresent(provider.useClass)) {
                var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                transformedDeps =
                    deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager));
            }
            return _transformProvider(provider, {
                useExisting: transformedUseExisting,
                useValue: transformedUseValue,
                deps: transformedDeps
            });
        });
        transformedProviderAst =
            _transformProviderAst(resolvedProvider, { eager: eager, providers: transformedProviders });
        this._transformedProviders.add(token, transformedProviderAst);
        return transformedProviderAst;
    }
    _getLocalDependency(requestingProviderType, dep, eager = null) {
        if (dep.isAttribute) {
            var attrValue = this._attrs[dep.token.value];
            return new CompileDiDependencyMetadata({ isValue: true, value: normalizeBlank(attrValue) });
        }
        if (isPresent(dep.query) || isPresent(dep.viewQuery)) {
            return dep;
        }
        if (isPresent(dep.token)) {
            // access builtints
            if ((requestingProviderType === ProviderAstType.Directive ||
                requestingProviderType === ProviderAstType.Component)) {
                if (dep.token.equalsTo(identifierToken(Identifiers.Renderer)) ||
                    dep.token.equalsTo(identifierToken(Identifiers.ElementRef)) ||
                    dep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef)) ||
                    dep.token.equalsTo(identifierToken(Identifiers.ViewContainerRef)) ||
                    dep.token.equalsTo(identifierToken(Identifiers.TemplateRef))) {
                    return dep;
                }
            }
            // access the injector
            if (dep.token.equalsTo(identifierToken(Identifiers.Injector))) {
                return dep;
            }
            // access providers
            if (isPresent(this._getLocalProvider(requestingProviderType, dep.token, eager))) {
                return dep;
            }
        }
        return null;
    }
    _getDependency(requestingProviderType, dep, eager = null) {
        var currElement = this;
        var currEager = eager;
        var result = null;
        if (!dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep, eager);
        }
        if (dep.isSelf) {
            if (isBlank(result) && dep.isOptional) {
                result = new CompileDiDependencyMetadata({ isValue: true, value: null });
            }
        }
        else {
            // check parent elements
            while (isBlank(result) && isPresent(currElement._parent)) {
                var prevElement = currElement;
                currElement = currElement._parent;
                if (prevElement._isViewRoot) {
                    currEager = false;
                }
                result = currElement._getLocalDependency(ProviderAstType.PublicService, dep, currEager);
            }
            // check @Host restriction
            if (isBlank(result)) {
                if (!dep.isHost || this._viewContext.component.type.isHost ||
                    identifierToken(this._viewContext.component.type).equalsTo(dep.token) ||
                    isPresent(this._viewContext.viewProviders.get(dep.token))) {
                    result = dep;
                }
                else {
                    result = dep.isOptional ?
                        result = new CompileDiDependencyMetadata({ isValue: true, value: null }) :
                        null;
                }
            }
        }
        if (isBlank(result)) {
            this._viewContext.errors.push(new ProviderError(`No provider for ${dep.token.name}`, this._sourceSpan));
        }
        return result;
    }
}
function _transformProvider(provider, { useExisting, useValue, deps }) {
    return new CompileProviderMetadata({
        token: provider.token,
        useClass: provider.useClass,
        useExisting: useExisting,
        useFactory: provider.useFactory,
        useValue: useValue,
        deps: deps,
        multi: provider.multi
    });
}
function _transformProviderAst(provider, { eager, providers }) {
    return new ProviderAst(provider.token, provider.multiProvider, provider.eager || eager, providers, provider.providerType, provider.sourceSpan);
}
function _normalizeProviders(providers, sourceSpan, targetErrors, targetProviders = null) {
    if (isBlank(targetProviders)) {
        targetProviders = [];
    }
    if (isPresent(providers)) {
        providers.forEach((provider) => {
            if (isArray(provider)) {
                _normalizeProviders(provider, sourceSpan, targetErrors, targetProviders);
            }
            else {
                var normalizeProvider;
                if (provider instanceof CompileProviderMetadata) {
                    normalizeProvider = provider;
                }
                else if (provider instanceof CompileTypeMetadata) {
                    normalizeProvider = new CompileProviderMetadata({ token: new CompileTokenMetadata({ identifier: provider }), useClass: provider });
                }
                else {
                    targetErrors.push(new ProviderError(`Unknown provider type ${provider}`, sourceSpan));
                }
                if (isPresent(normalizeProvider)) {
                    targetProviders.push(normalizeProvider);
                }
            }
        });
    }
    return targetProviders;
}
function _resolveProvidersFromDirectives(directives, sourceSpan, targetErrors) {
    var providersByToken = new CompileTokenMap();
    directives.forEach((directive) => {
        var dirProvider = new CompileProviderMetadata({ token: new CompileTokenMetadata({ identifier: directive.type }), useClass: directive.type });
        _resolveProviders([dirProvider], directive.isComponent ? ProviderAstType.Component : ProviderAstType.Directive, true, sourceSpan, targetErrors, providersByToken);
    });
    // Note: directives need to be able to overwrite providers of a component!
    var directivesWithComponentFirst = directives.filter(dir => dir.isComponent).concat(directives.filter(dir => !dir.isComponent));
    directivesWithComponentFirst.forEach((directive) => {
        _resolveProviders(_normalizeProviders(directive.providers, sourceSpan, targetErrors), ProviderAstType.PublicService, false, sourceSpan, targetErrors, providersByToken);
        _resolveProviders(_normalizeProviders(directive.viewProviders, sourceSpan, targetErrors), ProviderAstType.PrivateService, false, sourceSpan, targetErrors, providersByToken);
    });
    return providersByToken;
}
function _resolveProviders(providers, providerType, eager, sourceSpan, targetErrors, targetProvidersByToken) {
    providers.forEach((provider) => {
        var resolvedProvider = targetProvidersByToken.get(provider.token);
        if (isPresent(resolvedProvider) && resolvedProvider.multiProvider !== provider.multi) {
            targetErrors.push(new ProviderError(`Mixing multi and non multi provider is not possible for token ${resolvedProvider.token.name}`, sourceSpan));
        }
        if (isBlank(resolvedProvider)) {
            resolvedProvider = new ProviderAst(provider.token, provider.multi, eager, [provider], providerType, sourceSpan);
            targetProvidersByToken.add(provider.token, resolvedProvider);
        }
        else {
            if (!provider.multi) {
                ListWrapper.clear(resolvedProvider.providers);
            }
            resolvedProvider.providers.push(provider);
        }
    });
}
function _getViewQueries(component) {
    var viewQueries = new CompileTokenMap();
    if (isPresent(component.viewQueries)) {
        component.viewQueries.forEach((query) => _addQueryToTokenMap(viewQueries, query));
    }
    component.type.diDeps.forEach((dep) => {
        if (isPresent(dep.viewQuery)) {
            _addQueryToTokenMap(viewQueries, dep.viewQuery);
        }
    });
    return viewQueries;
}
function _getContentQueries(directives) {
    var contentQueries = new CompileTokenMap();
    directives.forEach(directive => {
        if (isPresent(directive.queries)) {
            directive.queries.forEach((query) => _addQueryToTokenMap(contentQueries, query));
        }
        directive.type.diDeps.forEach((dep) => {
            if (isPresent(dep.query)) {
                _addQueryToTokenMap(contentQueries, dep.query);
            }
        });
    });
    return contentQueries;
}
function _addQueryToTokenMap(map, query) {
    query.selectors.forEach((selector) => {
        var entry = map.get(selector);
        if (isBlank(entry)) {
            entry = [];
            map.add(selector, entry);
        }
        entry.push(query);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1XOVp5RDVXcC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3Byb3ZpZGVyX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBQyxNQUFNLDBCQUEwQjtPQUM3RSxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUNuRCxFQWdCTCxXQUFXLEVBQ1gsZUFBZSxFQUNoQixNQUFNLGdCQUFnQjtPQUNoQixFQUNMLG1CQUFtQixFQUNuQixlQUFlLEVBRWYsb0JBQW9CLEVBQ3BCLHVCQUF1QixFQUV2QiwyQkFBMkIsRUFDNUIsTUFBTSxvQkFBb0I7T0FDcEIsRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZTtPQUNuRCxFQUFrQixVQUFVLEVBQWdCLE1BQU0sY0FBYztBQUV2RSxtQ0FBbUMsVUFBVTtJQUMzQyxZQUFZLE9BQWUsRUFBRSxJQUFxQjtRQUFJLE1BQU0sSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQ7SUFXRSxZQUFtQixTQUFtQyxFQUFTLFVBQTJCO1FBQXZFLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFGMUYsV0FBTSxHQUFvQixFQUFFLENBQUM7UUFHM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGVBQWUsRUFBVyxDQUFDO1FBQ3BELG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDaEUsT0FBTyxDQUFDLENBQUMsUUFBUTtZQUNoQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7QUFDSCxDQUFDO0FBRUQ7SUFRRSxZQUFvQixZQUFpQyxFQUFVLE9BQStCLEVBQzFFLFdBQW9CLEVBQVUsY0FBOEIsRUFDcEUsS0FBZ0IsRUFBVSxXQUE0QjtRQUY5QyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUF3QjtRQUMxRSxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUMxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7UUFQMUQsMEJBQXFCLEdBQUcsSUFBSSxlQUFlLEVBQWUsQ0FBQztRQUMzRCxtQkFBYyxHQUFHLElBQUksZUFBZSxFQUFXLENBQUM7UUFPdEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEUsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxhQUFhO1lBQ2QsK0JBQStCLENBQUMsY0FBYyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRCxvREFBb0Q7UUFDcEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxZQUFZO1FBQ1YseUJBQXlCO1FBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUMvQixDQUFDLFFBQVEsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVELElBQUksa0JBQWtCLEtBQW9CLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXZGLElBQUksd0JBQXdCO1FBQzFCLElBQUksbUJBQW1CLEdBQ25CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkYsSUFBSSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM5RCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQ25CLENBQUMsSUFBSSxFQUFFLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDaEQsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRixNQUFNLENBQUMsZ0JBQWdCLENBQUM7SUFDMUIsQ0FBQztJQUVPLFNBQVMsQ0FBQyxLQUEyQjtRQUMzQyxJQUFJLFNBQVMsR0FBMkIsSUFBSSxDQUFDO1FBQzdDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixPQUFPLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMxQixJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxXQUFXLElBQUksUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckUsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDZCxDQUFDO1lBQ0gsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLFFBQVEsRUFBRSxDQUFDO1lBQ2IsQ0FBQztZQUNELFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQ2hDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNmLENBQUM7SUFHTyxpQkFBaUIsQ0FBQyxzQkFBdUMsRUFBRSxLQUEyQixFQUNwRSxLQUFjO1FBQ3RDLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1lBQ3pCLENBQUMsQ0FBQyxzQkFBc0IsS0FBSyxlQUFlLENBQUMsU0FBUztnQkFDcEQsc0JBQXNCLEtBQUssZUFBZSxDQUFDLGFBQWEsQ0FBQztnQkFDMUQsZ0JBQWdCLENBQUMsWUFBWSxLQUFLLGVBQWUsQ0FBQyxjQUFjLENBQUM7WUFDbEUsQ0FBQyxDQUFDLHNCQUFzQixLQUFLLGVBQWUsQ0FBQyxjQUFjO2dCQUN6RCxzQkFBc0IsS0FBSyxlQUFlLENBQUMsYUFBYSxDQUFDO2dCQUMxRCxnQkFBZ0IsQ0FBQyxZQUFZLEtBQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLHNCQUFzQixDQUFDO1FBQ2hDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUMzQyx5Q0FBeUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVE7WUFDakUsSUFBSSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQzVDLElBQUksc0JBQXNCLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNsRCxJQUFJLGVBQWUsQ0FBQztZQUNwQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FDbkMsZ0JBQWdCLENBQUMsWUFBWSxFQUM3QixJQUFJLDJCQUEyQixDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMzRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsc0JBQXNCLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztnQkFDL0MsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixzQkFBc0IsR0FBRyxJQUFJLENBQUM7b0JBQzlCLG1CQUFtQixHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUM7Z0JBQzVDLENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2pGLGVBQWU7b0JBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQy9FLGVBQWU7b0JBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBQ0QsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtnQkFDbEMsV0FBVyxFQUFFLHNCQUFzQjtnQkFDbkMsUUFBUSxFQUFFLG1CQUFtQjtnQkFDN0IsSUFBSSxFQUFFLGVBQWU7YUFDdEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxzQkFBc0I7WUFDbEIscUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBQyxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUM5RCxNQUFNLENBQUMsc0JBQXNCLENBQUM7SUFDaEMsQ0FBQztJQUVPLG1CQUFtQixDQUFDLHNCQUF1QyxFQUN2QyxHQUFnQyxFQUNoQyxLQUFLLEdBQVksSUFBSTtRQUMvQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLElBQUksMkJBQTJCLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDYixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsbUJBQW1CO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEtBQUssZUFBZSxDQUFDLFNBQVM7Z0JBQ3BELHNCQUFzQixLQUFLLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pELEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzNELEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDbEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNqRSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLENBQUM7WUFDSCxDQUFDO1lBQ0Qsc0JBQXNCO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDYixDQUFDO1lBQ0QsbUJBQW1CO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUNiLENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxjQUFjLENBQUMsc0JBQXVDLEVBQUUsR0FBZ0MsRUFDekUsS0FBSyxHQUFZLElBQUk7UUFDMUMsSUFBSSxXQUFXLEdBQTJCLElBQUksQ0FBQztRQUMvQyxJQUFJLFNBQVMsR0FBWSxLQUFLLENBQUM7UUFDL0IsSUFBSSxNQUFNLEdBQWdDLElBQUksQ0FBQztRQUMvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNmLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxHQUFHLElBQUksMkJBQTJCLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQ3pFLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTix3QkFBd0I7WUFDeEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN6RCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQzlCLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDcEIsQ0FBQztnQkFDRCxNQUFNLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFDRCwwQkFBMEI7WUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNO29CQUN0RCxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7b0JBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUNmLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxHQUFHLEdBQUcsQ0FBQyxVQUFVO3dCQUNWLE1BQU0sR0FBRyxJQUFJLDJCQUEyQixDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUM7d0JBQ3RFLElBQUksQ0FBQztnQkFDcEIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3pCLElBQUksYUFBYSxDQUFDLG1CQUFtQixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBRUQsNEJBQ0ksUUFBaUMsRUFDakMsRUFBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFDK0Q7SUFDN0YsTUFBTSxDQUFDLElBQUksdUJBQXVCLENBQUM7UUFDakMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1FBQ3JCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtRQUMzQixXQUFXLEVBQUUsV0FBVztRQUN4QixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7UUFDL0IsUUFBUSxFQUFFLFFBQVE7UUFDbEIsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7S0FDdEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELCtCQUNJLFFBQXFCLEVBQ3JCLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBeUQ7SUFDNUUsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLEtBQUssRUFBRSxTQUFTLEVBQzFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCw2QkFDSSxTQUF1RSxFQUN2RSxVQUEyQixFQUFFLFlBQTBCLEVBQ3ZELGVBQWUsR0FBOEIsSUFBSTtJQUNuRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGVBQWUsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVE7WUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsbUJBQW1CLENBQVEsUUFBUSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDbEYsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksaUJBQTBDLENBQUM7Z0JBQy9DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsWUFBWSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELGlCQUFpQixHQUFHLFFBQVEsQ0FBQztnQkFDL0IsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxZQUFZLG1CQUFtQixDQUFDLENBQUMsQ0FBQztvQkFDbkQsaUJBQWlCLEdBQUcsSUFBSSx1QkFBdUIsQ0FDM0MsRUFBQyxLQUFLLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUNyRixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMseUJBQXlCLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hGLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzFDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUN6QixDQUFDO0FBR0QseUNBQXlDLFVBQXNDLEVBQ3RDLFVBQTJCLEVBQzNCLFlBQTBCO0lBQ2pFLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLEVBQWUsQ0FBQztJQUMxRCxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUztRQUMzQixJQUFJLFdBQVcsR0FBRyxJQUFJLHVCQUF1QixDQUN6QyxFQUFDLEtBQUssRUFBRSxJQUFJLG9CQUFvQixDQUFDLEVBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMvRixpQkFBaUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUNiLFNBQVMsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUMsU0FBUyxFQUM3RSxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBRUgsMEVBQTBFO0lBQzFFLElBQUksNEJBQTRCLEdBQzVCLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNqRyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTO1FBQzdDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxFQUNsRSxlQUFlLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUM5RCxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxFQUN0RSxlQUFlLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUMvRCxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBQzFCLENBQUM7QUFFRCwyQkFBMkIsU0FBb0MsRUFBRSxZQUE2QixFQUNuRSxLQUFjLEVBQUUsVUFBMkIsRUFBRSxZQUEwQixFQUN2RSxzQkFBb0Q7SUFDN0UsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVE7UUFDekIsSUFBSSxnQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLGFBQWEsS0FBSyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNyRixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUMvQixpRUFBaUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUM5RixVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25CLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsZ0JBQWdCLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNqRCxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0Qsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixXQUFXLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFDRCxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFHRCx5QkFDSSxTQUFtQztJQUNyQyxJQUFJLFdBQVcsR0FBRyxJQUFJLGVBQWUsRUFBMEIsQ0FBQztJQUNoRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRztRQUNoQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDckIsQ0FBQztBQUVELDRCQUNJLFVBQXNDO0lBQ3hDLElBQUksY0FBYyxHQUFHLElBQUksZUFBZSxFQUEwQixDQUFDO0lBQ25FLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUztRQUMxQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRztZQUNoQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsbUJBQW1CLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQUVELDZCQUE2QixHQUE0QyxFQUM1QyxLQUEyQjtJQUN0RCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVE7UUFDL0IsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDWCxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgaXNBcnJheSwgbm9ybWFsaXplQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgTmdDb250ZW50QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBFbGVtZW50QXN0LFxuICBWYXJpYWJsZUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBQcm92aWRlckFzdCxcbiAgUHJvdmlkZXJBc3RUeXBlXG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFcbn0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGlkZW50aWZpZXJUb2tlbn0gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VFcnJvciwgUGFyc2VMb2NhdGlvbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcblxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHsgc3VwZXIoc3BhbiwgbWVzc2FnZSk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyVmlld0NvbnRleHQge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICB2aWV3UXVlcmllczogQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeU1ldGFkYXRhW10+O1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlVG9rZW5NYXA8Ym9vbGVhbj47XG4gIGVycm9yczogUHJvdmlkZXJFcnJvcltdID0gW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IF9nZXRWaWV3UXVlcmllcyhjb21wb25lbnQpO1xuICAgIHRoaXMudmlld1Byb3ZpZGVycyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Ym9vbGVhbj4oKTtcbiAgICBfbm9ybWFsaXplUHJvdmlkZXJzKGNvbXBvbmVudC52aWV3UHJvdmlkZXJzLCBzb3VyY2VTcGFuLCB0aGlzLmVycm9ycylcbiAgICAgICAgLmZvckVhY2goKHByb3ZpZGVyKSA9PiB7XG4gICAgICAgICAgaWYgKGlzQmxhbmsodGhpcy52aWV3UHJvdmlkZXJzLmdldChwcm92aWRlci50b2tlbikpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdQcm92aWRlcnMuYWRkKHByb3ZpZGVyLnRva2VuLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlckVsZW1lbnRDb250ZXh0IHtcbiAgcHJpdmF0ZSBfY29udGVudFF1ZXJpZXM6IENvbXBpbGVUb2tlbk1hcDxDb21waWxlUXVlcnlNZXRhZGF0YVtdPjtcblxuICBwcml2YXRlIF90cmFuc2Zvcm1lZFByb3ZpZGVycyA9IG5ldyBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+KCk7XG4gIHByaXZhdGUgX3NlZW5Qcm92aWRlcnMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPGJvb2xlYW4+KCk7XG4gIHByaXZhdGUgX2FsbFByb3ZpZGVyczogQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PjtcbiAgcHJpdmF0ZSBfYXR0cnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250ZXh0OiBQcm92aWRlclZpZXdDb250ZXh0LCBwcml2YXRlIF9wYXJlbnQ6IFByb3ZpZGVyRWxlbWVudENvbnRleHQsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzVmlld1Jvb3Q6IGJvb2xlYW4sIHByaXZhdGUgX2RpcmVjdGl2ZUFzdHM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICBhdHRyczogQXR0ckFzdFtdLCBwcml2YXRlIF9zb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLl9hdHRycyA9IHt9O1xuICAgIGF0dHJzLmZvckVhY2goKGF0dHJBc3QpID0+IHRoaXMuX2F0dHJzW2F0dHJBc3QubmFtZV0gPSBhdHRyQXN0LnZhbHVlKTtcbiAgICB2YXIgZGlyZWN0aXZlc01ldGEgPSBfZGlyZWN0aXZlQXN0cy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHRoaXMuX2FsbFByb3ZpZGVycyA9XG4gICAgICAgIF9yZXNvbHZlUHJvdmlkZXJzRnJvbURpcmVjdGl2ZXMoZGlyZWN0aXZlc01ldGEsIF9zb3VyY2VTcGFuLCBfdmlld0NvbnRleHQuZXJyb3JzKTtcbiAgICB0aGlzLl9jb250ZW50UXVlcmllcyA9IF9nZXRDb250ZW50UXVlcmllcyhkaXJlY3RpdmVzTWV0YSk7XG4gICAgLy8gY3JlYXRlIHRoZSBwcm92aWRlcnMgdGhhdCB3ZSBrbm93IGFyZSBlYWdlciBmaXJzdFxuICAgIHRoaXMuX2FsbFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKChwcm92aWRlcikgPT4ge1xuICAgICAgaWYgKHByb3ZpZGVyLmVhZ2VyIHx8IHRoaXMuaXNRdWVyaWVkKHByb3ZpZGVyLnRva2VuKSkge1xuICAgICAgICB0aGlzLl9nZXRMb2NhbFByb3ZpZGVyKHByb3ZpZGVyLnByb3ZpZGVyVHlwZSwgcHJvdmlkZXIudG9rZW4sIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYWZ0ZXJFbGVtZW50KCkge1xuICAgIC8vIGNvbGxlY3QgbGF6eSBwcm92aWRlcnNcbiAgICB0aGlzLl9hbGxQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaChcbiAgICAgICAgKHByb3ZpZGVyKSA9PiB7IHRoaXMuX2dldExvY2FsUHJvdmlkZXIocHJvdmlkZXIucHJvdmlkZXJUeXBlLCBwcm92aWRlci50b2tlbiwgZmFsc2UpOyB9KTtcbiAgfVxuXG4gIGdldCB0cmFuc2Zvcm1Qcm92aWRlcnMoKTogUHJvdmlkZXJBc3RbXSB7IHJldHVybiB0aGlzLl90cmFuc2Zvcm1lZFByb3ZpZGVycy52YWx1ZXMoKTsgfVxuXG4gIGdldCB0cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMoKTogRGlyZWN0aXZlQXN0W10ge1xuICAgIHZhciBzb3J0ZWRQcm92aWRlclR5cGVzID1cbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMudmFsdWVzKCkubWFwKHByb3ZpZGVyID0+IHByb3ZpZGVyLnRva2VuLmlkZW50aWZpZXIpO1xuICAgIHZhciBzb3J0ZWREaXJlY3RpdmVzID0gTGlzdFdyYXBwZXIuY2xvbmUodGhpcy5fZGlyZWN0aXZlQXN0cyk7XG4gICAgTGlzdFdyYXBwZXIuc29ydCh0aGlzLl9kaXJlY3RpdmVBc3RzLFxuICAgICAgICAgICAgICAgICAgICAgKGRpcjEsIGRpcjIpID0+IHNvcnRlZFByb3ZpZGVyVHlwZXMuaW5kZXhPZihkaXIxLmRpcmVjdGl2ZS50eXBlKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVkUHJvdmlkZXJUeXBlcy5pbmRleE9mKGRpcjIuZGlyZWN0aXZlLnR5cGUpKTtcbiAgICByZXR1cm4gc29ydGVkRGlyZWN0aXZlcztcbiAgfVxuXG4gIHByaXZhdGUgaXNRdWVyaWVkKHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YSk6IGJvb2xlYW4ge1xuICAgIHZhciBjdXJyZW50RWw6IFByb3ZpZGVyRWxlbWVudENvbnRleHQgPSB0aGlzO1xuICAgIHZhciBkaXN0YW5jZSA9IDA7XG4gICAgd2hpbGUgKGN1cnJlbnRFbCAhPT0gbnVsbCkge1xuICAgICAgdmFyIGxvY2FsUXVlcmllcyA9IGN1cnJlbnRFbC5fY29udGVudFF1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQobG9jYWxRdWVyaWVzKSkge1xuICAgICAgICBpZiAobG9jYWxRdWVyaWVzLnNvbWUoKHF1ZXJ5KSA9PiBxdWVyeS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVBc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5fcGFyZW50O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3ZpZXdDb250ZXh0LnZpZXdRdWVyaWVzLmdldCh0b2tlbikpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICBwcml2YXRlIF9nZXRMb2NhbFByb3ZpZGVyKHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSwgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhZ2VyOiBib29sZWFuKTogUHJvdmlkZXJBc3Qge1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVyID0gdGhpcy5fYWxsUHJvdmlkZXJzLmdldCh0b2tlbik7XG4gICAgaWYgKGlzQmxhbmsocmVzb2x2ZWRQcm92aWRlcikgfHxcbiAgICAgICAgKChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuRGlyZWN0aXZlIHx8XG4gICAgICAgICAgcmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UpICYmXG4gICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLlByaXZhdGVTZXJ2aWNlKSB8fFxuICAgICAgICAoKHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5Qcml2YXRlU2VydmljZSB8fFxuICAgICAgICAgIHJlcXVlc3RpbmdQcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5QdWJsaWNTZXJ2aWNlKSAmJlxuICAgICAgICAgcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUgPT09IFByb3ZpZGVyQXN0VHlwZS5CdWlsdGluKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0ID0gdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMuZ2V0KHRva2VuKTtcbiAgICBpZiAoaXNQcmVzZW50KHRyYW5zZm9ybWVkUHJvdmlkZXJBc3QpKSB7XG4gICAgICByZXR1cm4gdHJhbnNmb3JtZWRQcm92aWRlckFzdDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9zZWVuUHJvdmlkZXJzLmdldCh0b2tlbikpKSB7XG4gICAgICB0aGlzLl92aWV3Q29udGV4dC5lcnJvcnMucHVzaChuZXcgUHJvdmlkZXJFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IGluc3RhbnRpYXRlIGN5Y2xpYyBkZXBlbmRlbmN5ISAke3Rva2VuLm5hbWV9YCwgdGhpcy5fc291cmNlU3BhbikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3NlZW5Qcm92aWRlcnMuYWRkKHRva2VuLCB0cnVlKTtcbiAgICB2YXIgdHJhbnNmb3JtZWRQcm92aWRlcnMgPSByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICB2YXIgdHJhbnNmb3JtZWRVc2VWYWx1ZSA9IHByb3ZpZGVyLnVzZVZhbHVlO1xuICAgICAgdmFyIHRyYW5zZm9ybWVkVXNlRXhpc3RpbmcgPSBwcm92aWRlci51c2VFeGlzdGluZztcbiAgICAgIHZhciB0cmFuc2Zvcm1lZERlcHM7XG4gICAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSkge1xuICAgICAgICB2YXIgZXhpc3RpbmdEaURlcCA9IHRoaXMuX2dldERlcGVuZGVuY3koXG4gICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSxcbiAgICAgICAgICAgIG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe3Rva2VuOiBwcm92aWRlci51c2VFeGlzdGluZ30pLCBlYWdlcik7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZXhpc3RpbmdEaURlcC50b2tlbikpIHtcbiAgICAgICAgICB0cmFuc2Zvcm1lZFVzZUV4aXN0aW5nID0gZXhpc3RpbmdEaURlcC50b2tlbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cmFuc2Zvcm1lZFVzZUV4aXN0aW5nID0gbnVsbDtcbiAgICAgICAgICB0cmFuc2Zvcm1lZFVzZVZhbHVlID0gZXhpc3RpbmdEaURlcC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlRmFjdG9yeS5kaURlcHM7XG4gICAgICAgIHRyYW5zZm9ybWVkRGVwcyA9XG4gICAgICAgICAgICBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlLCBkZXAsIGVhZ2VyKSk7XG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlQ2xhc3MuZGlEZXBzO1xuICAgICAgICB0cmFuc2Zvcm1lZERlcHMgPVxuICAgICAgICAgICAgZGVwcy5tYXAoKGRlcCkgPT4gdGhpcy5fZ2V0RGVwZW5kZW5jeShyZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSwgZGVwLCBlYWdlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF90cmFuc2Zvcm1Qcm92aWRlcihwcm92aWRlciwge1xuICAgICAgICB1c2VFeGlzdGluZzogdHJhbnNmb3JtZWRVc2VFeGlzdGluZyxcbiAgICAgICAgdXNlVmFsdWU6IHRyYW5zZm9ybWVkVXNlVmFsdWUsXG4gICAgICAgIGRlcHM6IHRyYW5zZm9ybWVkRGVwc1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdHJhbnNmb3JtZWRQcm92aWRlckFzdCA9XG4gICAgICAgIF90cmFuc2Zvcm1Qcm92aWRlckFzdChyZXNvbHZlZFByb3ZpZGVyLCB7ZWFnZXI6IGVhZ2VyLCBwcm92aWRlcnM6IHRyYW5zZm9ybWVkUHJvdmlkZXJzfSk7XG4gICAgdGhpcy5fdHJhbnNmb3JtZWRQcm92aWRlcnMuYWRkKHRva2VuLCB0cmFuc2Zvcm1lZFByb3ZpZGVyQXN0KTtcbiAgICByZXR1cm4gdHJhbnNmb3JtZWRQcm92aWRlckFzdDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhZ2VyOiBib29sZWFuID0gbnVsbCk6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSB7XG4gICAgaWYgKGRlcC5pc0F0dHJpYnV0ZSkge1xuICAgICAgdmFyIGF0dHJWYWx1ZSA9IHRoaXMuX2F0dHJzW2RlcC50b2tlbi52YWx1ZV07XG4gICAgICByZXR1cm4gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7aXNWYWx1ZTogdHJ1ZSwgdmFsdWU6IG5vcm1hbGl6ZUJsYW5rKGF0dHJWYWx1ZSl9KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChkZXAucXVlcnkpIHx8IGlzUHJlc2VudChkZXAudmlld1F1ZXJ5KSkge1xuICAgICAgcmV0dXJuIGRlcDtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KGRlcC50b2tlbikpIHtcbiAgICAgIC8vIGFjY2VzcyBidWlsdGludHNcbiAgICAgIGlmICgocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZSA9PT0gUHJvdmlkZXJBc3RUeXBlLkRpcmVjdGl2ZSB8fFxuICAgICAgICAgICByZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuQ29tcG9uZW50KSkge1xuICAgICAgICBpZiAoZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5SZW5kZXJlcikpIHx8XG4gICAgICAgICAgICBkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLkVsZW1lbnRSZWYpKSB8fFxuICAgICAgICAgICAgZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5DaGFuZ2VEZXRlY3RvclJlZikpIHx8XG4gICAgICAgICAgICBkZXAudG9rZW4uZXF1YWxzVG8oaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlZpZXdDb250YWluZXJSZWYpKSB8fFxuICAgICAgICAgICAgZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZikpKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYWNjZXNzIHRoZSBpbmplY3RvclxuICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuSW5qZWN0b3IpKSkge1xuICAgICAgICByZXR1cm4gZGVwO1xuICAgICAgfVxuICAgICAgLy8gYWNjZXNzIHByb3ZpZGVyc1xuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9nZXRMb2NhbFByb3ZpZGVyKHJlcXVlc3RpbmdQcm92aWRlclR5cGUsIGRlcC50b2tlbiwgZWFnZXIpKSkge1xuICAgICAgICByZXR1cm4gZGVwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldERlcGVuZGVuY3kocmVxdWVzdGluZ1Byb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLCBkZXA6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBlYWdlcjogYm9vbGVhbiA9IG51bGwpOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAgIHZhciBjdXJyRWxlbWVudDogUHJvdmlkZXJFbGVtZW50Q29udGV4dCA9IHRoaXM7XG4gICAgdmFyIGN1cnJFYWdlcjogYm9vbGVhbiA9IGVhZ2VyO1xuICAgIHZhciByZXN1bHQ6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSA9IG51bGw7XG4gICAgaWYgKCFkZXAuaXNTa2lwU2VsZikge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGUsIGRlcCwgZWFnZXIpO1xuICAgIH1cbiAgICBpZiAoZGVwLmlzU2VsZikge1xuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBkZXAuaXNPcHRpb25hbCkge1xuICAgICAgICByZXN1bHQgPSBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtpc1ZhbHVlOiB0cnVlLCB2YWx1ZTogbnVsbH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICAgIHdoaWxlIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGN1cnJFbGVtZW50Ll9wYXJlbnQpKSB7XG4gICAgICAgIHZhciBwcmV2RWxlbWVudCA9IGN1cnJFbGVtZW50O1xuICAgICAgICBjdXJyRWxlbWVudCA9IGN1cnJFbGVtZW50Ll9wYXJlbnQ7XG4gICAgICAgIGlmIChwcmV2RWxlbWVudC5faXNWaWV3Um9vdCkge1xuICAgICAgICAgIGN1cnJFYWdlciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGN1cnJFbGVtZW50Ll9nZXRMb2NhbERlcGVuZGVuY3koUHJvdmlkZXJBc3RUeXBlLlB1YmxpY1NlcnZpY2UsIGRlcCwgY3VyckVhZ2VyKTtcbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIEBIb3N0IHJlc3RyaWN0aW9uXG4gICAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICAgIGlmICghZGVwLmlzSG9zdCB8fCB0aGlzLl92aWV3Q29udGV4dC5jb21wb25lbnQudHlwZS5pc0hvc3QgfHxcbiAgICAgICAgICAgIGlkZW50aWZpZXJUb2tlbih0aGlzLl92aWV3Q29udGV4dC5jb21wb25lbnQudHlwZSkuZXF1YWxzVG8oZGVwLnRva2VuKSB8fFxuICAgICAgICAgICAgaXNQcmVzZW50KHRoaXMuX3ZpZXdDb250ZXh0LnZpZXdQcm92aWRlcnMuZ2V0KGRlcC50b2tlbikpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZGVwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCA9IGRlcC5pc09wdGlvbmFsID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7aXNWYWx1ZTogdHJ1ZSwgdmFsdWU6IG51bGx9KSA6XG4gICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgdGhpcy5fdmlld0NvbnRleHQuZXJyb3JzLnB1c2goXG4gICAgICAgICAgbmV3IFByb3ZpZGVyRXJyb3IoYE5vIHByb3ZpZGVyIGZvciAke2RlcC50b2tlbi5uYW1lfWAsIHRoaXMuX3NvdXJjZVNwYW4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBfdHJhbnNmb3JtUHJvdmlkZXIoXG4gICAgcHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICAgIHt1c2VFeGlzdGluZywgdXNlVmFsdWUsIGRlcHN9OlxuICAgICAgICB7dXNlRXhpc3Rpbmc6IENvbXBpbGVUb2tlbk1ldGFkYXRhLCB1c2VWYWx1ZTogYW55LCBkZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXX0pIHtcbiAgcmV0dXJuIG5ldyBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSh7XG4gICAgdG9rZW46IHByb3ZpZGVyLnRva2VuLFxuICAgIHVzZUNsYXNzOiBwcm92aWRlci51c2VDbGFzcyxcbiAgICB1c2VFeGlzdGluZzogdXNlRXhpc3RpbmcsXG4gICAgdXNlRmFjdG9yeTogcHJvdmlkZXIudXNlRmFjdG9yeSxcbiAgICB1c2VWYWx1ZTogdXNlVmFsdWUsXG4gICAgZGVwczogZGVwcyxcbiAgICBtdWx0aTogcHJvdmlkZXIubXVsdGlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF90cmFuc2Zvcm1Qcm92aWRlckFzdChcbiAgICBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAge2VhZ2VyLCBwcm92aWRlcnN9OiB7ZWFnZXI6IGJvb2xlYW4sIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXX0pOiBQcm92aWRlckFzdCB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXJBc3QocHJvdmlkZXIudG9rZW4sIHByb3ZpZGVyLm11bHRpUHJvdmlkZXIsIHByb3ZpZGVyLmVhZ2VyIHx8IGVhZ2VyLCBwcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIucHJvdmlkZXJUeXBlLCBwcm92aWRlci5zb3VyY2VTcGFuKTtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVycyhcbiAgICBwcm92aWRlcnM6IEFycmF5PENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHRhcmdldEVycm9yczogUGFyc2VFcnJvcltdLFxuICAgIHRhcmdldFByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IG51bGwpOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdIHtcbiAgaWYgKGlzQmxhbmsodGFyZ2V0UHJvdmlkZXJzKSkge1xuICAgIHRhcmdldFByb3ZpZGVycyA9IFtdO1xuICB9XG4gIGlmIChpc1ByZXNlbnQocHJvdmlkZXJzKSkge1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcikgPT4ge1xuICAgICAgaWYgKGlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgICAgIF9ub3JtYWxpemVQcm92aWRlcnMoPGFueVtdPnByb3ZpZGVyLCBzb3VyY2VTcGFuLCB0YXJnZXRFcnJvcnMsIHRhcmdldFByb3ZpZGVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbm9ybWFsaXplUHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhO1xuICAgICAgICBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSkge1xuICAgICAgICAgIG5vcm1hbGl6ZVByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBDb21waWxlVHlwZU1ldGFkYXRhKSB7XG4gICAgICAgICAgbm9ybWFsaXplUHJvdmlkZXIgPSBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgICAgICAgIHt0b2tlbjogbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHtpZGVudGlmaWVyOiBwcm92aWRlcn0pLCB1c2VDbGFzczogcHJvdmlkZXJ9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRFcnJvcnMucHVzaChuZXcgUHJvdmlkZXJFcnJvcihgVW5rbm93biBwcm92aWRlciB0eXBlICR7cHJvdmlkZXJ9YCwgc291cmNlU3BhbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1ByZXNlbnQobm9ybWFsaXplUHJvdmlkZXIpKSB7XG4gICAgICAgICAgdGFyZ2V0UHJvdmlkZXJzLnB1c2gobm9ybWFsaXplUHJvdmlkZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRhcmdldFByb3ZpZGVycztcbn1cblxuXG5mdW5jdGlvbiBfcmVzb2x2ZVByb3ZpZGVyc0Zyb21EaXJlY3RpdmVzKGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEVycm9yczogUGFyc2VFcnJvcltdKTogQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PiB7XG4gIHZhciBwcm92aWRlcnNCeVRva2VuID0gbmV3IENvbXBpbGVUb2tlbk1hcDxQcm92aWRlckFzdD4oKTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKChkaXJlY3RpdmUpID0+IHtcbiAgICB2YXIgZGlyUHJvdmlkZXIgPSBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgIHt0b2tlbjogbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHtpZGVudGlmaWVyOiBkaXJlY3RpdmUudHlwZX0pLCB1c2VDbGFzczogZGlyZWN0aXZlLnR5cGV9KTtcbiAgICBfcmVzb2x2ZVByb3ZpZGVycyhbZGlyUHJvdmlkZXJdLFxuICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZS5pc0NvbXBvbmVudCA/IFByb3ZpZGVyQXN0VHlwZS5Db21wb25lbnQgOiBQcm92aWRlckFzdFR5cGUuRGlyZWN0aXZlLFxuICAgICAgICAgICAgICAgICAgICAgIHRydWUsIHNvdXJjZVNwYW4sIHRhcmdldEVycm9ycywgcHJvdmlkZXJzQnlUb2tlbik7XG4gIH0pO1xuXG4gIC8vIE5vdGU6IGRpcmVjdGl2ZXMgbmVlZCB0byBiZSBhYmxlIHRvIG92ZXJ3cml0ZSBwcm92aWRlcnMgb2YgYSBjb21wb25lbnQhXG4gIHZhciBkaXJlY3RpdmVzV2l0aENvbXBvbmVudEZpcnN0ID1cbiAgICAgIGRpcmVjdGl2ZXMuZmlsdGVyKGRpciA9PiBkaXIuaXNDb21wb25lbnQpLmNvbmNhdChkaXJlY3RpdmVzLmZpbHRlcihkaXIgPT4gIWRpci5pc0NvbXBvbmVudCkpO1xuICBkaXJlY3RpdmVzV2l0aENvbXBvbmVudEZpcnN0LmZvckVhY2goKGRpcmVjdGl2ZSkgPT4ge1xuICAgIF9yZXNvbHZlUHJvdmlkZXJzKF9ub3JtYWxpemVQcm92aWRlcnMoZGlyZWN0aXZlLnByb3ZpZGVycywgc291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICBQcm92aWRlckFzdFR5cGUuUHVibGljU2VydmljZSwgZmFsc2UsIHNvdXJjZVNwYW4sIHRhcmdldEVycm9ycyxcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnNCeVRva2VuKTtcbiAgICBfcmVzb2x2ZVByb3ZpZGVycyhfbm9ybWFsaXplUHJvdmlkZXJzKGRpcmVjdGl2ZS52aWV3UHJvdmlkZXJzLCBzb3VyY2VTcGFuLCB0YXJnZXRFcnJvcnMpLFxuICAgICAgICAgICAgICAgICAgICAgIFByb3ZpZGVyQXN0VHlwZS5Qcml2YXRlU2VydmljZSwgZmFsc2UsIHNvdXJjZVNwYW4sIHRhcmdldEVycm9ycyxcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnNCeVRva2VuKTtcbiAgfSk7XG4gIHJldHVybiBwcm92aWRlcnNCeVRva2VuO1xufVxuXG5mdW5jdGlvbiBfcmVzb2x2ZVByb3ZpZGVycyhwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sIHByb3ZpZGVyVHlwZTogUHJvdmlkZXJBc3RUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFnZXI6IGJvb2xlYW4sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgdGFyZ2V0RXJyb3JzOiBQYXJzZUVycm9yW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm92aWRlcnNCeVRva2VuOiBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+KSB7XG4gIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcikgPT4ge1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVyID0gdGFyZ2V0UHJvdmlkZXJzQnlUb2tlbi5nZXQocHJvdmlkZXIudG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQocmVzb2x2ZWRQcm92aWRlcikgJiYgcmVzb2x2ZWRQcm92aWRlci5tdWx0aVByb3ZpZGVyICE9PSBwcm92aWRlci5tdWx0aSkge1xuICAgICAgdGFyZ2V0RXJyb3JzLnB1c2gobmV3IFByb3ZpZGVyRXJyb3IoXG4gICAgICAgICAgYE1peGluZyBtdWx0aSBhbmQgbm9uIG11bHRpIHByb3ZpZGVyIGlzIG5vdCBwb3NzaWJsZSBmb3IgdG9rZW4gJHtyZXNvbHZlZFByb3ZpZGVyLnRva2VuLm5hbWV9YCxcbiAgICAgICAgICBzb3VyY2VTcGFuKSk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc29sdmVkUHJvdmlkZXIpKSB7XG4gICAgICByZXNvbHZlZFByb3ZpZGVyID0gbmV3IFByb3ZpZGVyQXN0KHByb3ZpZGVyLnRva2VuLCBwcm92aWRlci5tdWx0aSwgZWFnZXIsIFtwcm92aWRlcl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVHlwZSwgc291cmNlU3Bhbik7XG4gICAgICB0YXJnZXRQcm92aWRlcnNCeVRva2VuLmFkZChwcm92aWRlci50b2tlbiwgcmVzb2x2ZWRQcm92aWRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcHJvdmlkZXIubXVsdGkpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuY2xlYXIocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Vmlld1F1ZXJpZXMoXG4gICAgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT4ge1xuICB2YXIgdmlld1F1ZXJpZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeU1ldGFkYXRhW10+KCk7XG4gIGlmIChpc1ByZXNlbnQoY29tcG9uZW50LnZpZXdRdWVyaWVzKSkge1xuICAgIGNvbXBvbmVudC52aWV3UXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gX2FkZFF1ZXJ5VG9Ub2tlbk1hcCh2aWV3UXVlcmllcywgcXVlcnkpKTtcbiAgfVxuICBjb21wb25lbnQudHlwZS5kaURlcHMuZm9yRWFjaCgoZGVwKSA9PiB7XG4gICAgaWYgKGlzUHJlc2VudChkZXAudmlld1F1ZXJ5KSkge1xuICAgICAgX2FkZFF1ZXJ5VG9Ub2tlbk1hcCh2aWV3UXVlcmllcywgZGVwLnZpZXdRdWVyeSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHZpZXdRdWVyaWVzO1xufVxuXG5mdW5jdGlvbiBfZ2V0Q29udGVudFF1ZXJpZXMoXG4gICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10pOiBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT4ge1xuICB2YXIgY29udGVudFF1ZXJpZXMgPSBuZXcgQ29tcGlsZVRva2VuTWFwPENvbXBpbGVRdWVyeU1ldGFkYXRhW10+KCk7XG4gIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgIGlmIChpc1ByZXNlbnQoZGlyZWN0aXZlLnF1ZXJpZXMpKSB7XG4gICAgICBkaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gX2FkZFF1ZXJ5VG9Ub2tlbk1hcChjb250ZW50UXVlcmllcywgcXVlcnkpKTtcbiAgICB9XG4gICAgZGlyZWN0aXZlLnR5cGUuZGlEZXBzLmZvckVhY2goKGRlcCkgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChkZXAucXVlcnkpKSB7XG4gICAgICAgIF9hZGRRdWVyeVRvVG9rZW5NYXAoY29udGVudFF1ZXJpZXMsIGRlcC5xdWVyeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gY29udGVudFF1ZXJpZXM7XG59XG5cbmZ1bmN0aW9uIF9hZGRRdWVyeVRvVG9rZW5NYXAobWFwOiBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5TWV0YWRhdGFbXT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBDb21waWxlUXVlcnlNZXRhZGF0YSkge1xuICBxdWVyeS5zZWxlY3RvcnMuZm9yRWFjaCgoc2VsZWN0b3IpID0+IHtcbiAgICB2YXIgZW50cnkgPSBtYXAuZ2V0KHNlbGVjdG9yKTtcbiAgICBpZiAoaXNCbGFuayhlbnRyeSkpIHtcbiAgICAgIGVudHJ5ID0gW107XG4gICAgICBtYXAuYWRkKHNlbGVjdG9yLCBlbnRyeSk7XG4gICAgfVxuICAgIGVudHJ5LnB1c2gocXVlcnkpO1xuICB9KTtcbn1cbiJdfQ==