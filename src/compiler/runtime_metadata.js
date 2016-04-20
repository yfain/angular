'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var exceptions_2 = require('angular2/src/core/di/exceptions');
var cpl = require('./compile_metadata');
var md = require('angular2/src/core/metadata/directives');
var dimd = require('angular2/src/core/metadata/di');
var directive_resolver_1 = require('./directive_resolver');
var pipe_resolver_1 = require('./pipe_resolver');
var view_resolver_1 = require('./view_resolver');
var directive_lifecycle_reflector_1 = require('./directive_lifecycle_reflector');
var lifecycle_hooks_1 = require('angular2/src/core/metadata/lifecycle_hooks');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var di_2 = require('angular2/src/core/di');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
var util_1 = require('./util');
var assertions_1 = require('./assertions');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var provider_1 = require('angular2/src/core/di/provider');
var metadata_1 = require('angular2/src/core/di/metadata');
var di_3 = require('angular2/src/core/metadata/di');
var RuntimeMetadataResolver = (function () {
    function RuntimeMetadataResolver(_directiveResolver, _pipeResolver, _viewResolver, _platformDirectives, _platformPipes) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._platformPipes = _platformPipes;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
    }
    /**
     * Wrap the stringify method to avoid naming things `function (arg1...) {`
     */
    RuntimeMetadataResolver.prototype.sanitizeName = function (obj) {
        var result = lang_1.StringWrapper.replaceAll(lang_1.stringify(obj), /[\s-]/g, '_');
        if (result.indexOf('(') < 0) {
            return result;
        }
        var found = this._anonymousTypes.get(obj);
        if (lang_1.isBlank(found)) {
            this._anonymousTypes.set(obj, this._anonymousTypeIndex++);
            found = this._anonymousTypes.get(obj);
        }
        return "anonymous_type_" + found + "_";
    };
    RuntimeMetadataResolver.prototype.getDirectiveMetadata = function (directiveType) {
        var meta = this._directiveCache.get(directiveType);
        if (lang_1.isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var moduleUrl = null;
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            if (dirMeta instanceof md.ComponentMetadata) {
                assertions_1.assertArrayOfStrings('styles', dirMeta.styles);
                var cmpMeta = dirMeta;
                moduleUrl = calcModuleUrl(directiveType, cmpMeta);
                var viewMeta = this._viewResolver.resolve(directiveType);
                assertions_1.assertArrayOfStrings('styles', viewMeta.styles);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
                if (lang_1.isPresent(dirMeta.viewProviders)) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders);
                }
            }
            var providers = [];
            if (lang_1.isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers);
            }
            var queries = [];
            var viewQueries = [];
            if (lang_1.isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: lang_1.isPresent(templateMeta),
                type: this.getTypeMetadata(directiveType, moduleUrl),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, directiveType); }),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    };
    RuntimeMetadataResolver.prototype.getTypeMetadata = function (type, moduleUrl) {
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeName(type),
            moduleUrl: moduleUrl,
            runtime: type,
            diDeps: this.getDependenciesMetadata(type, null)
        });
    };
    RuntimeMetadataResolver.prototype.getFactoryMetadata = function (factory, moduleUrl) {
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeName(factory),
            moduleUrl: moduleUrl,
            runtime: factory,
            diDeps: this.getDependenciesMetadata(factory, null)
        });
    };
    RuntimeMetadataResolver.prototype.getPipeMetadata = function (pipeType) {
        var meta = this._pipeCache.get(pipeType);
        if (lang_1.isBlank(meta)) {
            var pipeMeta = this._pipeResolver.resolve(pipeType);
            var moduleUrl = reflection_1.reflector.importUri(pipeType);
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, moduleUrl),
                name: pipeMeta.name,
                pure: pipeMeta.pure,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, pipeType); }),
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    };
    RuntimeMetadataResolver.prototype.getViewDirectivesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidType(directives[i])) {
                throw new exceptions_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return directives.map(function (type) { return _this.getDirectiveMetadata(type); });
    };
    RuntimeMetadataResolver.prototype.getViewPipesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var pipes = flattenPipes(view, this._platformPipes);
        for (var i = 0; i < pipes.length; i++) {
            if (!isValidType(pipes[i])) {
                throw new exceptions_1.BaseException("Unexpected piped value '" + lang_1.stringify(pipes[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return pipes.map(function (type) { return _this.getPipeMetadata(type); });
    };
    RuntimeMetadataResolver.prototype.getDependenciesMetadata = function (typeOrFunc, dependencies) {
        var _this = this;
        var deps;
        try {
            deps = provider_1.constructDependencies(typeOrFunc, dependencies);
        }
        catch (e) {
            if (e instanceof exceptions_2.NoAnnotationError) {
                deps = [];
            }
            else {
                throw e;
            }
        }
        return deps.map(function (dep) {
            var compileToken;
            var p = dep.properties.find(function (p) { return p instanceof di_3.AttributeMetadata; });
            var isAttribute = false;
            if (lang_1.isPresent(p)) {
                compileToken = _this.getTokenMetadata(p.attributeName);
                isAttribute = true;
            }
            else {
                compileToken = _this.getTokenMetadata(dep.key.token);
            }
            var compileQuery = null;
            var q = dep.properties.find(function (p) { return p instanceof dimd.QueryMetadata; });
            if (lang_1.isPresent(q)) {
                compileQuery = _this.getQueryMetadata(q, null);
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: dep.upperBoundVisibility instanceof metadata_1.HostMetadata,
                isSelf: dep.upperBoundVisibility instanceof metadata_1.SelfMetadata,
                isSkipSelf: dep.lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata,
                isOptional: dep.optional,
                query: lang_1.isPresent(q) && !q.isViewQuery ? compileQuery : null,
                viewQuery: lang_1.isPresent(q) && q.isViewQuery ? compileQuery : null,
                token: compileToken
            });
        });
    };
    RuntimeMetadataResolver.prototype.getRuntimeIdentifier = function (value) {
        return new cpl.CompileIdentifierMetadata({ runtime: value, name: this.sanitizeName(value) });
    };
    RuntimeMetadataResolver.prototype.getTokenMetadata = function (token) {
        token = di_1.resolveForwardRef(token);
        var compileToken;
        if (lang_1.isString(token)) {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({ identifier: this.getRuntimeIdentifier(token) });
        }
        return compileToken;
    };
    RuntimeMetadataResolver.prototype.getProvidersMetadata = function (providers) {
        var _this = this;
        return providers.map(function (provider) {
            provider = di_1.resolveForwardRef(provider);
            if (lang_1.isArray(provider)) {
                return _this.getProvidersMetadata(provider);
            }
            else if (provider instanceof provider_1.Provider) {
                return _this.getProviderMetadata(provider);
            }
            else {
                return _this.getTypeMetadata(provider, null);
            }
        });
    };
    RuntimeMetadataResolver.prototype.getProviderMetadata = function (provider) {
        var compileDeps;
        if (lang_1.isPresent(provider.useClass)) {
            compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
        }
        else if (lang_1.isPresent(provider.useFactory)) {
            compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: lang_1.isPresent(provider.useClass) ? this.getTypeMetadata(provider.useClass, null) : null,
            useValue: lang_1.isPresent(provider.useValue) ? this.getRuntimeIdentifier(provider.useValue) : null,
            useFactory: lang_1.isPresent(provider.useFactory) ?
                this.getFactoryMetadata(provider.useFactory, null) :
                null,
            useExisting: lang_1.isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                null,
            deps: compileDeps,
            multi: provider.multi
        });
    };
    RuntimeMetadataResolver.prototype.getQueriesMetadata = function (queries, isViewQuery) {
        var _this = this;
        var compileQueries = [];
        collection_1.StringMapWrapper.forEach(queries, function (query, propertyName) {
            if (query.isViewQuery === isViewQuery) {
                compileQueries.push(_this.getQueryMetadata(query, propertyName));
            }
        });
        return compileQueries;
    };
    RuntimeMetadataResolver.prototype.getQueryMetadata = function (q, propertyName) {
        var _this = this;
        var selectors;
        if (q.isVarBindingQuery) {
            selectors = q.varBindings.map(function (varName) { return _this.getTokenMetadata(varName); });
        }
        else {
            selectors = [this.getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants,
            propertyName: propertyName
        });
    };
    RuntimeMetadataResolver = __decorate([
        di_2.Injectable(),
        __param(3, di_2.Optional()),
        __param(3, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_DIRECTIVES)),
        __param(4, di_2.Optional()),
        __param(4, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_PIPES)), 
        __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, view_resolver_1.ViewResolver, Array, Array])
    ], RuntimeMetadataResolver);
    return RuntimeMetadataResolver;
}());
exports.RuntimeMetadataResolver = RuntimeMetadataResolver;
function flattenDirectives(view, platformDirectives) {
    var directives = [];
    if (lang_1.isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (lang_1.isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenPipes(view, platformPipes) {
    var pipes = [];
    if (lang_1.isPresent(platformPipes)) {
        flattenArray(platformPipes, pipes);
    }
    if (lang_1.isPresent(view.pipes)) {
        flattenArray(view.pipes, pipes);
    }
    return pipes;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = di_1.resolveForwardRef(tree[i]);
        if (lang_1.isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isValidType(value) {
    return lang_1.isPresent(value) && (value instanceof lang_1.Type);
}
function calcModuleUrl(type, cmpMetadata) {
    var moduleId = cmpMetadata.moduleId;
    if (lang_1.isPresent(moduleId)) {
        var scheme = url_resolver_1.getUrlScheme(moduleId);
        return lang_1.isPresent(scheme) && scheme.length > 0 ? moduleId :
            "package:" + moduleId + util_1.MODULE_SUFFIX;
    }
    else {
        return reflection_1.reflector.importUri(type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtaEdvQ0ViUjYudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBZ0Msc0JBQXNCLENBQUMsQ0FBQTtBQUN2RCxxQkFTTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUFnQyxpQ0FBaUMsQ0FBQyxDQUFBO0FBQ2xFLElBQVksR0FBRyxXQUFNLG9CQUFvQixDQUFDLENBQUE7QUFDMUMsSUFBWSxFQUFFLFdBQU0sdUNBQXVDLENBQUMsQ0FBQTtBQUM1RCxJQUFZLElBQUksV0FBTSwrQkFBK0IsQ0FBQyxDQUFBO0FBQ3RELG1DQUFnQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzdDLDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBRTdDLDhDQUErQixpQ0FBaUMsQ0FBQyxDQUFBO0FBQ2pFLGdDQUFxRCw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ2xHLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBQ2xFLG1CQUEyQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ2xFLDhDQUFrRCxpREFBaUQsQ0FBQyxDQUFBO0FBQ3BHLHFCQUE0QixRQUFRLENBQUMsQ0FBQTtBQUNyQywyQkFBbUMsY0FBYyxDQUFDLENBQUE7QUFDbEQsNkJBQTJCLG9DQUFvQyxDQUFDLENBQUE7QUFDaEUseUJBQTBELCtCQUErQixDQUFDLENBQUE7QUFDMUYseUJBS08sK0JBQStCLENBQUMsQ0FBQTtBQUN2QyxtQkFBZ0MsK0JBQStCLENBQUMsQ0FBQTtBQUdoRTtJQU1FLGlDQUFvQixrQkFBcUMs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QUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgaXNBcnJheSxcbiAgc3RyaW5naWZ5LFxuICBpc1N0cmluZyxcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOb0Fubm90YXRpb25FcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBjcGwgZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCAqIGFzIG1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0ICogYXMgZGltZCBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaSc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICcuL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge1BpcGVSZXNvbHZlcn0gZnJvbSAnLi9waXBlX3Jlc29sdmVyJztcbmltcG9ydCB7Vmlld1Jlc29sdmVyfSBmcm9tICcuL3ZpZXdfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3TWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuL2RpcmVjdGl2ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtQTEFURk9STV9ESVJFQ1RJVkVTLCBQTEFURk9STV9QSVBFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMnO1xuaW1wb3J0IHtNT0RVTEVfU1VGRklYfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHthc3NlcnRBcnJheU9mU3RyaW5nc30gZnJvbSAnLi9hc3NlcnRpb25zJztcbmltcG9ydCB7Z2V0VXJsU2NoZW1lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7UHJvdmlkZXIsIGNvbnN0cnVjdERlcGVuZGVuY2llcywgRGVwZW5kZW5jeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBIb3N0TWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGFcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnVudGltZU1ldGFkYXRhUmVzb2x2ZXIge1xuICBwcml2YXRlIF9kaXJlY3RpdmVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfcGlwZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfYW5vbnltb3VzVHlwZXMgPSBuZXcgTWFwPE9iamVjdCwgbnVtYmVyPigpO1xuICBwcml2YXRlIF9hbm9ueW1vdXNUeXBlSW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RpcmVjdGl2ZVJlc29sdmVyOiBEaXJlY3RpdmVSZXNvbHZlciwgcHJpdmF0ZSBfcGlwZVJlc29sdmVyOiBQaXBlUmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3ZpZXdSZXNvbHZlcjogVmlld1Jlc29sdmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBMQVRGT1JNX0RJUkVDVElWRVMpIHByaXZhdGUgX3BsYXRmb3JtRGlyZWN0aXZlczogVHlwZVtdLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBMQVRGT1JNX1BJUEVTKSBwcml2YXRlIF9wbGF0Zm9ybVBpcGVzOiBUeXBlW10pIHt9XG5cbiAgLyoqXG4gICAqIFdyYXAgdGhlIHN0cmluZ2lmeSBtZXRob2QgdG8gYXZvaWQgbmFtaW5nIHRoaW5ncyBgZnVuY3Rpb24gKGFyZzEuLi4pIHtgXG4gICAqL1xuICBwcml2YXRlIHNhbml0aXplTmFtZShvYmo6IGFueSk6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzdHJpbmdpZnkob2JqKSwgL1tcXHMtXS9nLCAnXycpO1xuICAgIGlmIChyZXN1bHQuaW5kZXhPZignKCcpIDwgMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgbGV0IGZvdW5kID0gdGhpcy5fYW5vbnltb3VzVHlwZXMuZ2V0KG9iaik7XG4gICAgaWYgKGlzQmxhbmsoZm91bmQpKSB7XG4gICAgICB0aGlzLl9hbm9ueW1vdXNUeXBlcy5zZXQob2JqLCB0aGlzLl9hbm9ueW1vdXNUeXBlSW5kZXgrKyk7XG4gICAgICBmb3VuZCA9IHRoaXMuX2Fub255bW91c1R5cGVzLmdldChvYmopO1xuICAgIH1cbiAgICByZXR1cm4gYGFub255bW91c190eXBlXyR7Zm91bmR9X2A7XG4gIH1cblxuICBnZXREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlOiBUeXBlKTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGEgPSB0aGlzLl9kaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSk7XG4gICAgaWYgKGlzQmxhbmsobWV0YSkpIHtcbiAgICAgIHZhciBkaXJNZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlKTtcbiAgICAgIHZhciBtb2R1bGVVcmwgPSBudWxsO1xuICAgICAgdmFyIHRlbXBsYXRlTWV0YSA9IG51bGw7XG4gICAgICB2YXIgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsO1xuICAgICAgdmFyIHZpZXdQcm92aWRlcnMgPSBbXTtcblxuICAgICAgaWYgKGRpck1ldGEgaW5zdGFuY2VvZiBtZC5Db21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgICBhc3NlcnRBcnJheU9mU3RyaW5ncygnc3R5bGVzJywgZGlyTWV0YS5zdHlsZXMpO1xuICAgICAgICB2YXIgY21wTWV0YSA9IDxtZC5Db21wb25lbnRNZXRhZGF0YT5kaXJNZXRhO1xuICAgICAgICBtb2R1bGVVcmwgPSBjYWxjTW9kdWxlVXJsKGRpcmVjdGl2ZVR5cGUsIGNtcE1ldGEpO1xuICAgICAgICB2YXIgdmlld01ldGEgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlKTtcbiAgICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlcycsIHZpZXdNZXRhLnN0eWxlcyk7XG4gICAgICAgIHRlbXBsYXRlTWV0YSA9IG5ldyBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgICAgIGVuY2Fwc3VsYXRpb246IHZpZXdNZXRhLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgdGVtcGxhdGU6IHZpZXdNZXRhLnRlbXBsYXRlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiB2aWV3TWV0YS50ZW1wbGF0ZVVybCxcbiAgICAgICAgICBzdHlsZXM6IHZpZXdNZXRhLnN0eWxlcyxcbiAgICAgICAgICBzdHlsZVVybHM6IHZpZXdNZXRhLnN0eWxlVXJsc1xuICAgICAgICB9KTtcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBjbXBNZXRhLmNoYW5nZURldGVjdGlvbjtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnZpZXdQcm92aWRlcnMpKSB7XG4gICAgICAgICAgdmlld1Byb3ZpZGVycyA9IHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEoZGlyTWV0YS52aWV3UHJvdmlkZXJzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcHJvdmlkZXJzID0gW107XG4gICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEucHJvdmlkZXJzKSkge1xuICAgICAgICBwcm92aWRlcnMgPSB0aGlzLmdldFByb3ZpZGVyc01ldGFkYXRhKGRpck1ldGEucHJvdmlkZXJzKTtcbiAgICAgIH1cbiAgICAgIHZhciBxdWVyaWVzID0gW107XG4gICAgICB2YXIgdmlld1F1ZXJpZXMgPSBbXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS5xdWVyaWVzKSkge1xuICAgICAgICBxdWVyaWVzID0gdGhpcy5nZXRRdWVyaWVzTWV0YWRhdGEoZGlyTWV0YS5xdWVyaWVzLCBmYWxzZSk7XG4gICAgICAgIHZpZXdRdWVyaWVzID0gdGhpcy5nZXRRdWVyaWVzTWV0YWRhdGEoZGlyTWV0YS5xdWVyaWVzLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIG1ldGEgPSBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgICAgIHNlbGVjdG9yOiBkaXJNZXRhLnNlbGVjdG9yLFxuICAgICAgICBleHBvcnRBczogZGlyTWV0YS5leHBvcnRBcyxcbiAgICAgICAgaXNDb21wb25lbnQ6IGlzUHJlc2VudCh0ZW1wbGF0ZU1ldGEpLFxuICAgICAgICB0eXBlOiB0aGlzLmdldFR5cGVNZXRhZGF0YShkaXJlY3RpdmVUeXBlLCBtb2R1bGVVcmwpLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVNZXRhLFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgICAgICBpbnB1dHM6IGRpck1ldGEuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBkaXJNZXRhLm91dHB1dHMsXG4gICAgICAgIGhvc3Q6IGRpck1ldGEuaG9zdCxcbiAgICAgICAgbGlmZWN5Y2xlSG9va3M6XG4gICAgICAgICAgICBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgZGlyZWN0aXZlVHlwZSkpLFxuICAgICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgICAgdmlld1Byb3ZpZGVyczogdmlld1Byb3ZpZGVycyxcbiAgICAgICAgcXVlcmllczogcXVlcmllcyxcbiAgICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZUNhY2hlLnNldChkaXJlY3RpdmVUeXBlLCBtZXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1ldGE7XG4gIH1cblxuICBnZXRUeXBlTWV0YWRhdGEodHlwZTogVHlwZSwgbW9kdWxlVXJsOiBzdHJpbmcpOiBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSh7XG4gICAgICBuYW1lOiB0aGlzLnNhbml0aXplTmFtZSh0eXBlKSxcbiAgICAgIG1vZHVsZVVybDogbW9kdWxlVXJsLFxuICAgICAgcnVudGltZTogdHlwZSxcbiAgICAgIGRpRGVwczogdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlLCBudWxsKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmFjdG9yeU1ldGFkYXRhKGZhY3Rvcnk6IEZ1bmN0aW9uLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVOYW1lKGZhY3RvcnkpLFxuICAgICAgbW9kdWxlVXJsOiBtb2R1bGVVcmwsXG4gICAgICBydW50aW1lOiBmYWN0b3J5LFxuICAgICAgZGlEZXBzOiB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKGZhY3RvcnksIG51bGwpXG4gICAgfSk7XG4gIH1cblxuICBnZXRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGEgPSB0aGlzLl9waXBlQ2FjaGUuZ2V0KHBpcGVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIHBpcGVNZXRhID0gdGhpcy5fcGlwZVJlc29sdmVyLnJlc29sdmUocGlwZVR5cGUpO1xuICAgICAgdmFyIG1vZHVsZVVybCA9IHJlZmxlY3Rvci5pbXBvcnRVcmkocGlwZVR5cGUpO1xuICAgICAgbWV0YSA9IG5ldyBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHBpcGVUeXBlLCBtb2R1bGVVcmwpLFxuICAgICAgICBuYW1lOiBwaXBlTWV0YS5uYW1lLFxuICAgICAgICBwdXJlOiBwaXBlTWV0YS5wdXJlLFxuICAgICAgICBsaWZlY3ljbGVIb29rczogTElGRUNZQ0xFX0hPT0tTX1ZBTFVFUy5maWx0ZXIoaG9vayA9PiBoYXNMaWZlY3ljbGVIb29rKGhvb2ssIHBpcGVUeXBlKSksXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3BpcGVDYWNoZS5zZXQocGlwZVR5cGUsIG1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YTtcbiAgfVxuXG4gIGdldFZpZXdEaXJlY3RpdmVzTWV0YWRhdGEoY29tcG9uZW50OiBUeXBlKTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBmbGF0dGVuRGlyZWN0aXZlcyh2aWV3LCB0aGlzLl9wbGF0Zm9ybURpcmVjdGl2ZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyZWN0aXZlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFpc1ZhbGlkVHlwZShkaXJlY3RpdmVzW2ldKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBVbmV4cGVjdGVkIGRpcmVjdGl2ZSB2YWx1ZSAnJHtzdHJpbmdpZnkoZGlyZWN0aXZlc1tpXSl9JyBvbiB0aGUgVmlldyBvZiBjb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9J2ApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3RpdmVzLm1hcCh0eXBlID0+IHRoaXMuZ2V0RGlyZWN0aXZlTWV0YWRhdGEodHlwZSkpO1xuICB9XG5cbiAgZ2V0Vmlld1BpcGVzTWV0YWRhdGEoY29tcG9uZW50OiBUeXBlKTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGFbXSB7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShjb21wb25lbnQpO1xuICAgIHZhciBwaXBlcyA9IGZsYXR0ZW5QaXBlcyh2aWV3LCB0aGlzLl9wbGF0Zm9ybVBpcGVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBpcGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKHBpcGVzW2ldKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBVbmV4cGVjdGVkIHBpcGVkIHZhbHVlICcke3N0cmluZ2lmeShwaXBlc1tpXSl9JyBvbiB0aGUgVmlldyBvZiBjb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9J2ApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGlwZXMubWFwKHR5cGUgPT4gdGhpcy5nZXRQaXBlTWV0YWRhdGEodHlwZSkpO1xuICB9XG5cbiAgZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEodHlwZU9yRnVuYzogVHlwZSB8IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmNpZXM6IGFueVtdKTogY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdIHtcbiAgICB2YXIgZGVwczogRGVwZW5kZW5jeVtdO1xuICAgIHRyeSB7XG4gICAgICBkZXBzID0gY29uc3RydWN0RGVwZW5kZW5jaWVzKHR5cGVPckZ1bmMsIGRlcGVuZGVuY2llcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOb0Fubm90YXRpb25FcnJvcikge1xuICAgICAgICBkZXBzID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVwcy5tYXAoKGRlcCkgPT4ge1xuICAgICAgdmFyIGNvbXBpbGVUb2tlbjtcbiAgICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPmRlcC5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgICAgdmFyIGlzQXR0cmlidXRlID0gZmFsc2U7XG4gICAgICBpZiAoaXNQcmVzZW50KHApKSB7XG4gICAgICAgIGNvbXBpbGVUb2tlbiA9IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwLmF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBpc0F0dHJpYnV0ZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlVG9rZW4gPSB0aGlzLmdldFRva2VuTWV0YWRhdGEoZGVwLmtleS50b2tlbik7XG4gICAgICB9XG4gICAgICB2YXIgY29tcGlsZVF1ZXJ5ID0gbnVsbDtcbiAgICAgIHZhciBxID0gPGRpbWQuUXVlcnlNZXRhZGF0YT5kZXAucHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIGRpbWQuUXVlcnlNZXRhZGF0YSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHEpKSB7XG4gICAgICAgIGNvbXBpbGVRdWVyeSA9IHRoaXMuZ2V0UXVlcnlNZXRhZGF0YShxLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICAgIGlzQXR0cmlidXRlOiBpc0F0dHJpYnV0ZSxcbiAgICAgICAgaXNIb3N0OiBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEsXG4gICAgICAgIGlzU2VsZjogZGVwLnVwcGVyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc1NraXBTZWxmOiBkZXAubG93ZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc09wdGlvbmFsOiBkZXAub3B0aW9uYWwsXG4gICAgICAgIHF1ZXJ5OiBpc1ByZXNlbnQocSkgJiYgIXEuaXNWaWV3UXVlcnkgPyBjb21waWxlUXVlcnkgOiBudWxsLFxuICAgICAgICB2aWV3UXVlcnk6IGlzUHJlc2VudChxKSAmJiBxLmlzVmlld1F1ZXJ5ID8gY29tcGlsZVF1ZXJ5IDogbnVsbCxcbiAgICAgICAgdG9rZW46IGNvbXBpbGVUb2tlblxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRSdW50aW1lSWRlbnRpZmllcih2YWx1ZTogYW55KTogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe3J1bnRpbWU6IHZhbHVlLCBuYW1lOiB0aGlzLnNhbml0aXplTmFtZSh2YWx1ZSl9KTtcbiAgfVxuXG4gIGdldFRva2VuTWV0YWRhdGEodG9rZW46IGFueSk6IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSB7XG4gICAgdG9rZW4gPSByZXNvbHZlRm9yd2FyZFJlZih0b2tlbik7XG4gICAgdmFyIGNvbXBpbGVUb2tlbjtcbiAgICBpZiAoaXNTdHJpbmcodG9rZW4pKSB7XG4gICAgICBjb21waWxlVG9rZW4gPSBuZXcgY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdG9rZW59KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcGlsZVRva2VuID0gbmV3IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSh7aWRlbnRpZmllcjogdGhpcy5nZXRSdW50aW1lSWRlbnRpZmllcih0b2tlbil9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGVUb2tlbjtcbiAgfVxuXG4gIGdldFByb3ZpZGVyc01ldGFkYXRhKHByb3ZpZGVyczogYW55W10pOlxuICAgICAgQXJyYXk8Y3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT4ge1xuICAgIHJldHVybiBwcm92aWRlcnMubWFwKChwcm92aWRlcikgPT4ge1xuICAgICAgcHJvdmlkZXIgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlcik7XG4gICAgICBpZiAoaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLCBudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXI6IFByb3ZpZGVyKTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICB2YXIgY29tcGlsZURlcHM7XG4gICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICAgIGNvbXBpbGVEZXBzID0gdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgY29tcGlsZURlcHMgPSB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudG9rZW4pLFxuICAgICAgdXNlQ2xhc3M6IGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykgPyB0aGlzLmdldFR5cGVNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgbnVsbCkgOiBudWxsLFxuICAgICAgdXNlVmFsdWU6IGlzUHJlc2VudChwcm92aWRlci51c2VWYWx1ZSkgPyB0aGlzLmdldFJ1bnRpbWVJZGVudGlmaWVyKHByb3ZpZGVyLnVzZVZhbHVlKSA6IG51bGwsXG4gICAgICB1c2VGYWN0b3J5OiBpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RmFjdG9yeU1ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIG51bGwpIDpcbiAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgdXNlRXhpc3Rpbmc6IGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykgPyB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGRlcHM6IGNvbXBpbGVEZXBzLFxuICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpXG4gICAgfSk7XG4gIH1cblxuICBnZXRRdWVyaWVzTWV0YWRhdGEocXVlcmllczoge1trZXk6IHN0cmluZ106IGRpbWQuUXVlcnlNZXRhZGF0YX0sXG4gICAgICAgICAgICAgICAgICAgICBpc1ZpZXdRdWVyeTogYm9vbGVhbik6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdIHtcbiAgICB2YXIgY29tcGlsZVF1ZXJpZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocXVlcmllcywgKHF1ZXJ5LCBwcm9wZXJ0eU5hbWUpID0+IHtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgY29tcGlsZVF1ZXJpZXMucHVzaCh0aGlzLmdldFF1ZXJ5TWV0YWRhdGEocXVlcnksIHByb3BlcnR5TmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21waWxlUXVlcmllcztcbiAgfVxuXG4gIGdldFF1ZXJ5TWV0YWRhdGEocTogZGltZC5RdWVyeU1ldGFkYXRhLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgdmFyIHNlbGVjdG9ycztcbiAgICBpZiAocS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgc2VsZWN0b3JzID0gcS52YXJCaW5kaW5ncy5tYXAodmFyTmFtZSA9PiB0aGlzLmdldFRva2VuTWV0YWRhdGEodmFyTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RvcnMgPSBbdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHEuc2VsZWN0b3IpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLFxuICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWVcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuRGlyZWN0aXZlcyh2aWV3OiBWaWV3TWV0YWRhdGEsIHBsYXRmb3JtRGlyZWN0aXZlczogYW55W10pOiBUeXBlW10ge1xuICBsZXQgZGlyZWN0aXZlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtRGlyZWN0aXZlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkocGxhdGZvcm1EaXJlY3RpdmVzLCBkaXJlY3RpdmVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcuZGlyZWN0aXZlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkodmlldy5kaXJlY3RpdmVzLCBkaXJlY3RpdmVzKTtcbiAgfVxuICByZXR1cm4gZGlyZWN0aXZlcztcbn1cblxuZnVuY3Rpb24gZmxhdHRlblBpcGVzKHZpZXc6IFZpZXdNZXRhZGF0YSwgcGxhdGZvcm1QaXBlczogYW55W10pOiBUeXBlW10ge1xuICBsZXQgcGlwZXMgPSBbXTtcbiAgaWYgKGlzUHJlc2VudChwbGF0Zm9ybVBpcGVzKSkge1xuICAgIGZsYXR0ZW5BcnJheShwbGF0Zm9ybVBpcGVzLCBwaXBlcyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudCh2aWV3LnBpcGVzKSkge1xuICAgIGZsYXR0ZW5BcnJheSh2aWV3LnBpcGVzLCBwaXBlcyk7XG4gIH1cbiAgcmV0dXJuIHBpcGVzO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuQXJyYXkodHJlZTogYW55W10sIG91dDogQXJyYXk8VHlwZSB8IGFueVtdPik6IHZvaWQge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IHJlc29sdmVGb3J3YXJkUmVmKHRyZWVbaV0pO1xuICAgIGlmIChpc0FycmF5KGl0ZW0pKSB7XG4gICAgICBmbGF0dGVuQXJyYXkoaXRlbSwgb3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRUeXBlKHZhbHVlOiBUeXBlKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1ByZXNlbnQodmFsdWUpICYmICh2YWx1ZSBpbnN0YW5jZW9mIFR5cGUpO1xufVxuXG5mdW5jdGlvbiBjYWxjTW9kdWxlVXJsKHR5cGU6IFR5cGUsIGNtcE1ldGFkYXRhOiBtZC5Db21wb25lbnRNZXRhZGF0YSk6IHN0cmluZyB7XG4gIHZhciBtb2R1bGVJZCA9IGNtcE1ldGFkYXRhLm1vZHVsZUlkO1xuICBpZiAoaXNQcmVzZW50KG1vZHVsZUlkKSkge1xuICAgIHZhciBzY2hlbWUgPSBnZXRVcmxTY2hlbWUobW9kdWxlSWQpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoc2NoZW1lKSAmJiBzY2hlbWUubGVuZ3RoID4gMCA/IG1vZHVsZUlkIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgcGFja2FnZToke21vZHVsZUlkfSR7TU9EVUxFX1NVRkZJWH1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZWZsZWN0b3IuaW1wb3J0VXJpKHR5cGUpO1xuICB9XG59XG4iXX0=