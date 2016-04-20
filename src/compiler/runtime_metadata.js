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
var reflective_exceptions_1 = require('angular2/src/core/di/reflective_exceptions');
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
var reflective_provider_1 = require('angular2/src/core/di/reflective_provider');
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
            deps = reflective_provider_1.constructDependencies(typeOrFunc, dependencies);
        }
        catch (e) {
            if (e instanceof reflective_exceptions_1.NoAnnotationError) {
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
            propertyName: propertyName,
            read: lang_1.isPresent(q.read) ? this.getTokenMetadata(q.read) : null
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUkdiUDk4SHIudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBZ0Msc0JBQXNCLENBQUMsQ0FBQTtBQUN2RCxxQkFTTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHNDQUFnQyw0Q0FBNEMsQ0FBQyxDQUFBO0FBQzdFLElBQVksR0FBRyxXQUFNLG9CQUFvQixDQUFDLENBQUE7QUFDMUMsSUFBWSxFQUFFLFdBQU0sdUNBQXVDLENBQUMsQ0FBQTtBQUM1RCxJQUFZLElBQUksV0FBTSwrQkFBK0IsQ0FBQyxDQUFBO0FBQ3RELG1DQUFnQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzdDLDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBRTdDLDhDQUErQixpQ0FBaUMsQ0FBQyxDQUFBO0FBQ2pFLGdDQUFxRCw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ2xHLDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBQ2xFLG1CQUEyQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ2xFLDhDQUFrRCxpREFBaUQsQ0FBQyxDQUFBO0FBQ3BHLHFCQUE0QixRQUFRLENBQUMsQ0FBQTtBQUNyQywyQkFBbUMsY0FBYyxDQUFDLENBQUE7QUFDbEQsNkJBQTJCLG9DQUFvQyxDQUFDLENBQUE7QUFDaEUseUJBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQsb0NBR08sMENBQTBDLENBQUMsQ0FBQTtBQUNsRCx5QkFLTywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3ZDLG1CQUFnQywrQkFBK0IsQ0FBQyxD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QUMsR0FBRyxRQUFRO1lBQ1IsYUFBVyxRQUFRLEdBQUcsb0JBQWUsQ0FBQztJQUN4RixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsc0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIGlzQXJyYXksXG4gIHN0cmluZ2lmeSxcbiAgaXNTdHJpbmcsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Tm9Bbm5vdGF0aW9uRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3JlZmxlY3RpdmVfZXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBjcGwgZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCAqIGFzIG1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0ICogYXMgZGltZCBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaSc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICcuL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge1BpcGVSZXNvbHZlcn0gZnJvbSAnLi9waXBlX3Jlc29sdmVyJztcbmltcG9ydCB7Vmlld1Jlc29sdmVyfSBmcm9tICcuL3ZpZXdfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3TWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuL2RpcmVjdGl2ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3MsIExJRkVDWUNMRV9IT09LU19WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2xpZmVjeWNsZV9ob29rcyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtQTEFURk9STV9ESVJFQ1RJVkVTLCBQTEFURk9STV9QSVBFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMnO1xuaW1wb3J0IHtNT0RVTEVfU1VGRklYfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHthc3NlcnRBcnJheU9mU3RyaW5nc30gZnJvbSAnLi9hc3NlcnRpb25zJztcbmltcG9ydCB7Z2V0VXJsU2NoZW1lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIGNvbnN0cnVjdERlcGVuZGVuY2llcyxcbiAgUmVmbGVjdGl2ZURlcGVuZGVuY3lcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcmVmbGVjdGl2ZV9wcm92aWRlcic7XG5pbXBvcnQge1xuICBPcHRpb25hbE1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSdW50aW1lTWV0YWRhdGFSZXNvbHZlciB7XG4gIHByaXZhdGUgX2RpcmVjdGl2ZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9waXBlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlUGlwZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9hbm9ueW1vdXNUeXBlcyA9IG5ldyBNYXA8T2JqZWN0LCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX2Fub255bW91c1R5cGVJbmRleCA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlUmVzb2x2ZXI6IERpcmVjdGl2ZVJlc29sdmVyLCBwcml2YXRlIF9waXBlUmVzb2x2ZXI6IFBpcGVSZXNvbHZlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlld1Jlc29sdmVyOiBWaWV3UmVzb2x2ZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fRElSRUNUSVZFUykgcHJpdmF0ZSBfcGxhdGZvcm1EaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fUElQRVMpIHByaXZhdGUgX3BsYXRmb3JtUGlwZXM6IFR5cGVbXSkge31cblxuICAvKipcbiAgICogV3JhcCB0aGUgc3RyaW5naWZ5IG1ldGhvZCB0byBhdm9pZCBuYW1pbmcgdGhpbmdzIGBmdW5jdGlvbiAoYXJnMS4uLikge2BcbiAgICovXG4gIHByaXZhdGUgc2FuaXRpemVOYW1lKG9iajogYW55KTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHN0cmluZ2lmeShvYmopLCAvW1xccy1dL2csICdfJyk7XG4gICAgaWYgKHJlc3VsdC5pbmRleE9mKCcoJykgPCAwKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBsZXQgZm91bmQgPSB0aGlzLl9hbm9ueW1vdXNUeXBlcy5nZXQob2JqKTtcbiAgICBpZiAoaXNCbGFuayhmb3VuZCkpIHtcbiAgICAgIHRoaXMuX2Fub255bW91c1R5cGVzLnNldChvYmosIHRoaXMuX2Fub255bW91c1R5cGVJbmRleCsrKTtcbiAgICAgIGZvdW5kID0gdGhpcy5fYW5vbnltb3VzVHlwZXMuZ2V0KG9iaik7XG4gICAgfVxuICAgIHJldHVybiBgYW5vbnltb3VzX3R5cGVfJHtmb3VuZH1fYDtcbiAgfVxuXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldChkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgdmFyIG1vZHVsZVVybCA9IG51bGw7XG4gICAgICB2YXIgdGVtcGxhdGVNZXRhID0gbnVsbDtcbiAgICAgIHZhciBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IG51bGw7XG4gICAgICB2YXIgdmlld1Byb3ZpZGVycyA9IFtdO1xuXG4gICAgICBpZiAoZGlyTWV0YSBpbnN0YW5jZW9mIG1kLkNvbXBvbmVudE1ldGFkYXRhKSB7XG4gICAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCBkaXJNZXRhLnN0eWxlcyk7XG4gICAgICAgIHZhciBjbXBNZXRhID0gPG1kLkNvbXBvbmVudE1ldGFkYXRhPmRpck1ldGE7XG4gICAgICAgIG1vZHVsZVVybCA9IGNhbGNNb2R1bGVVcmwoZGlyZWN0aXZlVHlwZSwgY21wTWV0YSk7XG4gICAgICAgIHZhciB2aWV3TWV0YSA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBhc3NlcnRBcnJheU9mU3RyaW5ncygnc3R5bGVzJywgdmlld01ldGEuc3R5bGVzKTtcbiAgICAgICAgdGVtcGxhdGVNZXRhID0gbmV3IGNwbC5Db21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICAgICAgZW5jYXBzdWxhdGlvbjogdmlld01ldGEuZW5jYXBzdWxhdGlvbixcbiAgICAgICAgICB0ZW1wbGF0ZTogdmlld01ldGEudGVtcGxhdGUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IHZpZXdNZXRhLnRlbXBsYXRlVXJsLFxuICAgICAgICAgIHN0eWxlczogdmlld01ldGEuc3R5bGVzLFxuICAgICAgICAgIHN0eWxlVXJsczogdmlld01ldGEuc3R5bGVVcmxzXG4gICAgICAgIH0pO1xuICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IGNtcE1ldGEuY2hhbmdlRGV0ZWN0aW9uO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEudmlld1Byb3ZpZGVycykpIHtcbiAgICAgICAgICB2aWV3UHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShkaXJNZXRhLnZpZXdQcm92aWRlcnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm92aWRlcnMgPSBbXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS5wcm92aWRlcnMpKSB7XG4gICAgICAgIHByb3ZpZGVycyA9IHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEoZGlyTWV0YS5wcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIHF1ZXJpZXMgPSBbXTtcbiAgICAgIHZhciB2aWV3UXVlcmllcyA9IFtdO1xuICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnF1ZXJpZXMpKSB7XG4gICAgICAgIHF1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIGZhbHNlKTtcbiAgICAgICAgdmlld1F1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIHRydWUpO1xuICAgICAgfVxuICAgICAgbWV0YSA9IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICAgICAgc2VsZWN0b3I6IGRpck1ldGEuc2VsZWN0b3IsXG4gICAgICAgIGV4cG9ydEFzOiBkaXJNZXRhLmV4cG9ydEFzLFxuICAgICAgICBpc0NvbXBvbmVudDogaXNQcmVzZW50KHRlbXBsYXRlTWV0YSksXG4gICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUsIG1vZHVsZVVybCksXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZU1ldGEsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IGRpck1ldGEub3V0cHV0cyxcbiAgICAgICAgaG9zdDogZGlyTWV0YS5ob3N0LFxuICAgICAgICBsaWZlY3ljbGVIb29rczpcbiAgICAgICAgICAgIExJRkVDWUNMRV9IT09LU19WQUxVRVMuZmlsdGVyKGhvb2sgPT4gaGFzTGlmZWN5Y2xlSG9vayhob29rLCBkaXJlY3RpdmVUeXBlKSksXG4gICAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzLFxuICAgICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YTtcbiAgfVxuXG4gIGdldFR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVOYW1lKHR5cGUpLFxuICAgICAgbW9kdWxlVXJsOiBtb2R1bGVVcmwsXG4gICAgICBydW50aW1lOiB0eXBlLFxuICAgICAgZGlEZXBzOiB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHR5cGUsIG51bGwpXG4gICAgfSk7XG4gIH1cblxuICBnZXRGYWN0b3J5TWV0YWRhdGEoZmFjdG9yeTogRnVuY3Rpb24sIG1vZHVsZVVybDogc3RyaW5nKTogY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEoe1xuICAgICAgbmFtZTogdGhpcy5zYW5pdGl6ZU5hbWUoZmFjdG9yeSksXG4gICAgICBtb2R1bGVVcmw6IG1vZHVsZVVybCxcbiAgICAgIHJ1bnRpbWU6IGZhY3RvcnksXG4gICAgICBkaURlcHM6IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEoZmFjdG9yeSwgbnVsbClcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBpcGVNZXRhZGF0YShwaXBlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICB2YXIgcGlwZU1ldGEgPSB0aGlzLl9waXBlUmVzb2x2ZXIucmVzb2x2ZShwaXBlVHlwZSk7XG4gICAgICB2YXIgbW9kdWxlVXJsID0gcmVmbGVjdG9yLmltcG9ydFVyaShwaXBlVHlwZSk7XG4gICAgICBtZXRhID0gbmV3IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEocGlwZVR5cGUsIG1vZHVsZVVybCksXG4gICAgICAgIG5hbWU6IHBpcGVNZXRhLm5hbWUsXG4gICAgICAgIHB1cmU6IHBpcGVNZXRhLnB1cmUsXG4gICAgICAgIGxpZmVjeWNsZUhvb2tzOiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgcGlwZVR5cGUpKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGlwZUNhY2hlLnNldChwaXBlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0Vmlld0RpcmVjdGl2ZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtRGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKGRpcmVjdGl2ZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgZGlyZWN0aXZlIHZhbHVlICcke3N0cmluZ2lmeShkaXJlY3RpdmVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMubWFwKHR5cGUgPT4gdGhpcy5nZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXRWaWV3UGlwZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YVtdIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgdmFyIHBpcGVzID0gZmxhdHRlblBpcGVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtUGlwZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNWYWxpZFR5cGUocGlwZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgcGlwZWQgdmFsdWUgJyR7c3RyaW5naWZ5KHBpcGVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwaXBlcy5tYXAodHlwZSA9PiB0aGlzLmdldFBpcGVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlT3JGdW5jOiBUeXBlIHwgRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogYW55W10pOiBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10ge1xuICAgIHZhciBkZXBzOiBSZWZsZWN0aXZlRGVwZW5kZW5jeVtdO1xuICAgIHRyeSB7XG4gICAgICBkZXBzID0gY29uc3RydWN0RGVwZW5kZW5jaWVzKHR5cGVPckZ1bmMsIGRlcGVuZGVuY2llcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOb0Fubm90YXRpb25FcnJvcikge1xuICAgICAgICBkZXBzID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVwcy5tYXAoKGRlcCkgPT4ge1xuICAgICAgdmFyIGNvbXBpbGVUb2tlbjtcbiAgICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPmRlcC5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgICAgdmFyIGlzQXR0cmlidXRlID0gZmFsc2U7XG4gICAgICBpZiAoaXNQcmVzZW50KHApKSB7XG4gICAgICAgIGNvbXBpbGVUb2tlbiA9IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwLmF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBpc0F0dHJpYnV0ZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlVG9rZW4gPSB0aGlzLmdldFRva2VuTWV0YWRhdGEoZGVwLmtleS50b2tlbik7XG4gICAgICB9XG4gICAgICB2YXIgY29tcGlsZVF1ZXJ5ID0gbnVsbDtcbiAgICAgIHZhciBxID0gPGRpbWQuUXVlcnlNZXRhZGF0YT5kZXAucHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIGRpbWQuUXVlcnlNZXRhZGF0YSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHEpKSB7XG4gICAgICAgIGNvbXBpbGVRdWVyeSA9IHRoaXMuZ2V0UXVlcnlNZXRhZGF0YShxLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7XG4gICAgICAgIGlzQXR0cmlidXRlOiBpc0F0dHJpYnV0ZSxcbiAgICAgICAgaXNIb3N0OiBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEsXG4gICAgICAgIGlzU2VsZjogZGVwLnVwcGVyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc1NraXBTZWxmOiBkZXAubG93ZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhLFxuICAgICAgICBpc09wdGlvbmFsOiBkZXAub3B0aW9uYWwsXG4gICAgICAgIHF1ZXJ5OiBpc1ByZXNlbnQocSkgJiYgIXEuaXNWaWV3UXVlcnkgPyBjb21waWxlUXVlcnkgOiBudWxsLFxuICAgICAgICB2aWV3UXVlcnk6IGlzUHJlc2VudChxKSAmJiBxLmlzVmlld1F1ZXJ5ID8gY29tcGlsZVF1ZXJ5IDogbnVsbCxcbiAgICAgICAgdG9rZW46IGNvbXBpbGVUb2tlblxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRSdW50aW1lSWRlbnRpZmllcih2YWx1ZTogYW55KTogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe3J1bnRpbWU6IHZhbHVlLCBuYW1lOiB0aGlzLnNhbml0aXplTmFtZSh2YWx1ZSl9KTtcbiAgfVxuXG4gIGdldFRva2VuTWV0YWRhdGEodG9rZW46IGFueSk6IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSB7XG4gICAgdG9rZW4gPSByZXNvbHZlRm9yd2FyZFJlZih0b2tlbik7XG4gICAgdmFyIGNvbXBpbGVUb2tlbjtcbiAgICBpZiAoaXNTdHJpbmcodG9rZW4pKSB7XG4gICAgICBjb21waWxlVG9rZW4gPSBuZXcgY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdG9rZW59KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcGlsZVRva2VuID0gbmV3IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSh7aWRlbnRpZmllcjogdGhpcy5nZXRSdW50aW1lSWRlbnRpZmllcih0b2tlbil9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGVUb2tlbjtcbiAgfVxuXG4gIGdldFByb3ZpZGVyc01ldGFkYXRhKHByb3ZpZGVyczogYW55W10pOlxuICAgICAgQXJyYXk8Y3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT4ge1xuICAgIHJldHVybiBwcm92aWRlcnMubWFwKChwcm92aWRlcikgPT4ge1xuICAgICAgcHJvdmlkZXIgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlcik7XG4gICAgICBpZiAoaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLCBudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXI6IFByb3ZpZGVyKTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICB2YXIgY29tcGlsZURlcHM7XG4gICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICAgIGNvbXBpbGVEZXBzID0gdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgY29tcGlsZURlcHMgPSB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudG9rZW4pLFxuICAgICAgdXNlQ2xhc3M6IGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykgPyB0aGlzLmdldFR5cGVNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgbnVsbCkgOiBudWxsLFxuICAgICAgdXNlVmFsdWU6IGlzUHJlc2VudChwcm92aWRlci51c2VWYWx1ZSkgPyB0aGlzLmdldFJ1bnRpbWVJZGVudGlmaWVyKHByb3ZpZGVyLnVzZVZhbHVlKSA6IG51bGwsXG4gICAgICB1c2VGYWN0b3J5OiBpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RmFjdG9yeU1ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIG51bGwpIDpcbiAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgdXNlRXhpc3Rpbmc6IGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykgPyB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGRlcHM6IGNvbXBpbGVEZXBzLFxuICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpXG4gICAgfSk7XG4gIH1cblxuICBnZXRRdWVyaWVzTWV0YWRhdGEocXVlcmllczoge1trZXk6IHN0cmluZ106IGRpbWQuUXVlcnlNZXRhZGF0YX0sXG4gICAgICAgICAgICAgICAgICAgICBpc1ZpZXdRdWVyeTogYm9vbGVhbik6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdIHtcbiAgICB2YXIgY29tcGlsZVF1ZXJpZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocXVlcmllcywgKHF1ZXJ5LCBwcm9wZXJ0eU5hbWUpID0+IHtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgY29tcGlsZVF1ZXJpZXMucHVzaCh0aGlzLmdldFF1ZXJ5TWV0YWRhdGEocXVlcnksIHByb3BlcnR5TmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21waWxlUXVlcmllcztcbiAgfVxuXG4gIGdldFF1ZXJ5TWV0YWRhdGEocTogZGltZC5RdWVyeU1ldGFkYXRhLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgdmFyIHNlbGVjdG9ycztcbiAgICBpZiAocS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgc2VsZWN0b3JzID0gcS52YXJCaW5kaW5ncy5tYXAodmFyTmFtZSA9PiB0aGlzLmdldFRva2VuTWV0YWRhdGEodmFyTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RvcnMgPSBbdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHEuc2VsZWN0b3IpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLFxuICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgICByZWFkOiBpc1ByZXNlbnQocS5yZWFkKSA/IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShxLnJlYWQpIDogbnVsbFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXc6IFZpZXdNZXRhZGF0YSwgcGxhdGZvcm1EaXJlY3RpdmVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBkaXJlY3RpdmVzID0gW107XG4gIGlmIChpc1ByZXNlbnQocGxhdGZvcm1EaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheShwbGF0Zm9ybURpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQodmlldy5kaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheSh2aWV3LmRpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVzO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuUGlwZXModmlldzogVmlld01ldGFkYXRhLCBwbGF0Zm9ybVBpcGVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBwaXBlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtUGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHBsYXRmb3JtUGlwZXMsIHBpcGVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcucGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHZpZXcucGlwZXMsIHBpcGVzKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BcnJheSh0cmVlOiBhbnlbXSwgb3V0OiBBcnJheTxUeXBlIHwgYW55W10+KTogdm9pZCB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gcmVzb2x2ZUZvcndhcmRSZWYodHJlZVtpXSk7XG4gICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIGZsYXR0ZW5BcnJheShpdGVtLCBvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFR5cGUodmFsdWU6IFR5cGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUHJlc2VudCh2YWx1ZSkgJiYgKHZhbHVlIGluc3RhbmNlb2YgVHlwZSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNNb2R1bGVVcmwodHlwZTogVHlwZSwgY21wTWV0YWRhdGE6IG1kLkNvbXBvbmVudE1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIG1vZHVsZUlkID0gY21wTWV0YWRhdGEubW9kdWxlSWQ7XG4gIGlmIChpc1ByZXNlbnQobW9kdWxlSWQpKSB7XG4gICAgdmFyIHNjaGVtZSA9IGdldFVybFNjaGVtZShtb2R1bGVJZCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChzY2hlbWUpICYmIHNjaGVtZS5sZW5ndGggPiAwID8gbW9kdWxlSWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwYWNrYWdlOiR7bW9kdWxlSWR9JHtNT0RVTEVfU1VGRklYfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlZmxlY3Rvci5pbXBvcnRVcmkodHlwZSk7XG4gIH1cbn1cbiJdfQ==