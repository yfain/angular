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
import { resolveForwardRef } from 'angular2/src/core/di';
import { Type, isBlank, isPresent, isArray, stringify, isString, StringWrapper } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { NoAnnotationError } from 'angular2/src/core/di/exceptions';
import * as cpl from './compile_metadata';
import * as md from 'angular2/src/core/metadata/directives';
import * as dimd from 'angular2/src/core/metadata/di';
import { DirectiveResolver } from './directive_resolver';
import { PipeResolver } from './pipe_resolver';
import { ViewResolver } from './view_resolver';
import { hasLifecycleHook } from './directive_lifecycle_reflector';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/metadata/lifecycle_hooks';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable, Inject, Optional } from 'angular2/src/core/di';
import { PLATFORM_DIRECTIVES, PLATFORM_PIPES } from 'angular2/src/core/platform_directives_and_pipes';
import { MODULE_SUFFIX } from './util';
import { assertArrayOfStrings } from './assertions';
import { getUrlScheme } from 'angular2/src/compiler/url_resolver';
import { Provider, constructDependencies } from 'angular2/src/core/di/provider';
import { SelfMetadata, HostMetadata, SkipSelfMetadata } from 'angular2/src/core/di/metadata';
import { AttributeMetadata } from 'angular2/src/core/metadata/di';
export let RuntimeMetadataResolver = class RuntimeMetadataResolver {
    constructor(_directiveResolver, _pipeResolver, _viewResolver, _platformDirectives, _platformPipes) {
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
    sanitizeName(obj) {
        let result = StringWrapper.replaceAll(stringify(obj), /[\s-]/g, '_');
        if (result.indexOf('(') < 0) {
            return result;
        }
        let found = this._anonymousTypes.get(obj);
        if (isBlank(found)) {
            this._anonymousTypes.set(obj, this._anonymousTypeIndex++);
            found = this._anonymousTypes.get(obj);
        }
        return `anonymous_type_${found}_`;
    }
    getDirectiveMetadata(directiveType) {
        var meta = this._directiveCache.get(directiveType);
        if (isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var moduleUrl = null;
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            if (dirMeta instanceof md.ComponentMetadata) {
                assertArrayOfStrings('styles', dirMeta.styles);
                var cmpMeta = dirMeta;
                moduleUrl = calcModuleUrl(directiveType, cmpMeta);
                var viewMeta = this._viewResolver.resolve(directiveType);
                assertArrayOfStrings('styles', viewMeta.styles);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
                if (isPresent(dirMeta.viewProviders)) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders);
                }
            }
            var providers = [];
            if (isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers);
            }
            var queries = [];
            var viewQueries = [];
            if (isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: isPresent(templateMeta),
                type: this.getTypeMetadata(directiveType, moduleUrl),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, directiveType)),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    }
    getTypeMetadata(type, moduleUrl) {
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeName(type),
            moduleUrl: moduleUrl,
            runtime: type,
            diDeps: this.getDependenciesMetadata(type, null)
        });
    }
    getFactoryMetadata(factory, moduleUrl) {
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeName(factory),
            moduleUrl: moduleUrl,
            runtime: factory,
            diDeps: this.getDependenciesMetadata(factory, null)
        });
    }
    getPipeMetadata(pipeType) {
        var meta = this._pipeCache.get(pipeType);
        if (isBlank(meta)) {
            var pipeMeta = this._pipeResolver.resolve(pipeType);
            var moduleUrl = reflector.importUri(pipeType);
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, moduleUrl),
                name: pipeMeta.name,
                pure: pipeMeta.pure,
                lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, pipeType)),
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    }
    getViewDirectivesMetadata(component) {
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidType(directives[i])) {
                throw new BaseException(`Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
            }
        }
        return directives.map(type => this.getDirectiveMetadata(type));
    }
    getViewPipesMetadata(component) {
        var view = this._viewResolver.resolve(component);
        var pipes = flattenPipes(view, this._platformPipes);
        for (var i = 0; i < pipes.length; i++) {
            if (!isValidType(pipes[i])) {
                throw new BaseException(`Unexpected piped value '${stringify(pipes[i])}' on the View of component '${stringify(component)}'`);
            }
        }
        return pipes.map(type => this.getPipeMetadata(type));
    }
    getDependenciesMetadata(typeOrFunc, dependencies) {
        var deps;
        try {
            deps = constructDependencies(typeOrFunc, dependencies);
        }
        catch (e) {
            if (e instanceof NoAnnotationError) {
                deps = [];
            }
            else {
                throw e;
            }
        }
        return deps.map((dep) => {
            var compileToken;
            var p = dep.properties.find(p => p instanceof AttributeMetadata);
            var isAttribute = false;
            if (isPresent(p)) {
                compileToken = this.getTokenMetadata(p.attributeName);
                isAttribute = true;
            }
            else {
                compileToken = this.getTokenMetadata(dep.key.token);
            }
            var compileQuery = null;
            var q = dep.properties.find(p => p instanceof dimd.QueryMetadata);
            if (isPresent(q)) {
                compileQuery = this.getQueryMetadata(q, null);
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: dep.upperBoundVisibility instanceof HostMetadata,
                isSelf: dep.upperBoundVisibility instanceof SelfMetadata,
                isSkipSelf: dep.lowerBoundVisibility instanceof SkipSelfMetadata,
                isOptional: dep.optional,
                query: isPresent(q) && !q.isViewQuery ? compileQuery : null,
                viewQuery: isPresent(q) && q.isViewQuery ? compileQuery : null,
                token: compileToken
            });
        });
    }
    getRuntimeIdentifier(value) {
        return new cpl.CompileIdentifierMetadata({ runtime: value, name: this.sanitizeName(value) });
    }
    getTokenMetadata(token) {
        token = resolveForwardRef(token);
        var compileToken;
        if (isString(token)) {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({ identifier: this.getRuntimeIdentifier(token) });
        }
        return compileToken;
    }
    getProvidersMetadata(providers) {
        return providers.map((provider) => {
            provider = resolveForwardRef(provider);
            if (isArray(provider)) {
                return this.getProvidersMetadata(provider);
            }
            else if (provider instanceof Provider) {
                return this.getProviderMetadata(provider);
            }
            else {
                return this.getTypeMetadata(provider, null);
            }
        });
    }
    getProviderMetadata(provider) {
        var compileDeps;
        if (isPresent(provider.useClass)) {
            compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
        }
        else if (isPresent(provider.useFactory)) {
            compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: isPresent(provider.useClass) ? this.getTypeMetadata(provider.useClass, null) : null,
            useValue: isPresent(provider.useValue) ? this.getRuntimeIdentifier(provider.useValue) : null,
            useFactory: isPresent(provider.useFactory) ?
                this.getFactoryMetadata(provider.useFactory, null) :
                null,
            useExisting: isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                null,
            deps: compileDeps,
            multi: provider.multi
        });
    }
    getQueriesMetadata(queries, isViewQuery) {
        var compileQueries = [];
        StringMapWrapper.forEach(queries, (query, propertyName) => {
            if (query.isViewQuery === isViewQuery) {
                compileQueries.push(this.getQueryMetadata(query, propertyName));
            }
        });
        return compileQueries;
    }
    getQueryMetadata(q, propertyName) {
        var selectors;
        if (q.isVarBindingQuery) {
            selectors = q.varBindings.map(varName => this.getTokenMetadata(varName));
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
    }
};
RuntimeMetadataResolver = __decorate([
    Injectable(),
    __param(3, Optional()),
    __param(3, Inject(PLATFORM_DIRECTIVES)),
    __param(4, Optional()),
    __param(4, Inject(PLATFORM_PIPES)), 
    __metadata('design:paramtypes', [DirectiveResolver, PipeResolver, ViewResolver, Array, Array])
], RuntimeMetadataResolver);
function flattenDirectives(view, platformDirectives) {
    let directives = [];
    if (isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenPipes(view, platformPipes) {
    let pipes = [];
    if (isPresent(platformPipes)) {
        flattenArray(platformPipes, pipes);
    }
    if (isPresent(view.pipes)) {
        flattenArray(view.pipes, pipes);
    }
    return pipes;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = resolveForwardRef(tree[i]);
        if (isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isValidType(value) {
    return isPresent(value) && (value instanceof Type);
}
function calcModuleUrl(type, cmpMetadata) {
    var moduleId = cmpMetadata.moduleId;
    if (isPresent(moduleId)) {
        var scheme = getUrlScheme(moduleId);
        return isPresent(scheme) && scheme.length > 0 ? moduleId :
            `package:${moduleId}${MODULE_SUFFIX}`;
    }
    else {
        return reflector.importUri(type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtMTNmcWt2NGkudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0I7T0FDL0MsRUFDTCxJQUFJLEVBQ0osT0FBTyxFQUNQLFNBQVMsRUFDVCxPQUFPLEVBQ1AsU0FBUyxFQUNULFFBQVEsRUFFUixhQUFhLEVBQ2QsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0saUNBQWlDO09BQzFELEtBQUssR0FBRyxNQUFNLG9CQUFvQjtPQUNsQyxLQUFLLEVBQUUsTUFBTSx1Q0FBdUM7T0FDcEQsS0FBSyxJQUFJLE1BQU0sK0JBQStCO09BQzlDLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0I7T0FDL0MsRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUI7T0FDckMsRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUI7T0FFckMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlDQUFpQztPQUN6RCxFQUFpQixzQkFBc0IsRUFBQyxNQUFNLDRDQUE0QztPQUMxRixFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLE1BQU0sc0JBQXNCO09BQzFELEVBQUMsbUJBQW1CLEVBQUUsY0FBYyxFQUFDLE1BQU0saURBQWlEO09BQzVGLEVBQUMsYUFBYSxFQUFDLE1BQU0sUUFBUTtPQUM3QixFQUFDLG9CQUFvQixFQUFDLE1BQU0sY0FBYztPQUMxQyxFQUFDLFlBQVksRUFBQyxN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dEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQscUJBQXFCLEtBQVc7SUFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQsdUJBQXVCLElBQVUsRUFBRSxXQUFpQztJQUNsRSxJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUTtZQUNSLFdBQVcsUUFBUSxHQUFHLGFBQWEsRUFBRSxDQUFDO0lBQ3hGLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBpc0FycmF5LFxuICBzdHJpbmdpZnksXG4gIGlzU3RyaW5nLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge05vQW5ub3RhdGlvbkVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9leGNlcHRpb25zJztcbmltcG9ydCAqIGFzIGNwbCBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0ICogYXMgbWQgZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQgKiBhcyBkaW1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJy4vZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3UmVzb2x2ZXJ9IGZyb20gJy4vdmlld19yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4vZGlyZWN0aXZlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1BMQVRGT1JNX0RJUkVDVElWRVMsIFBMQVRGT1JNX1BJUEVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcyc7XG5pbXBvcnQge01PRFVMRV9TVUZGSVh9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2Fzc2VydEFycmF5T2ZTdHJpbmdzfSBmcm9tICcuL2Fzc2VydGlvbnMnO1xuaW1wb3J0IHtnZXRVcmxTY2hlbWV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtQcm92aWRlciwgY29uc3RydWN0RGVwZW5kZW5jaWVzLCBEZXBlbmRlbmN5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge1xuICBPcHRpb25hbE1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSdW50aW1lTWV0YWRhdGFSZXNvbHZlciB7XG4gIHByaXZhdGUgX2RpcmVjdGl2ZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9waXBlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlUGlwZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9hbm9ueW1vdXNUeXBlcyA9IG5ldyBNYXA8T2JqZWN0LCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX2Fub255bW91c1R5cGVJbmRleCA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlUmVzb2x2ZXI6IERpcmVjdGl2ZVJlc29sdmVyLCBwcml2YXRlIF9waXBlUmVzb2x2ZXI6IFBpcGVSZXNvbHZlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlld1Jlc29sdmVyOiBWaWV3UmVzb2x2ZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fRElSRUNUSVZFUykgcHJpdmF0ZSBfcGxhdGZvcm1EaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fUElQRVMpIHByaXZhdGUgX3BsYXRmb3JtUGlwZXM6IFR5cGVbXSkge31cblxuICAvKipcbiAgICogV3JhcCB0aGUgc3RyaW5naWZ5IG1ldGhvZCB0byBhdm9pZCBuYW1pbmcgdGhpbmdzIGBmdW5jdGlvbiAoYXJnMS4uLikge2BcbiAgICovXG4gIHByaXZhdGUgc2FuaXRpemVOYW1lKG9iajogYW55KTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHN0cmluZ2lmeShvYmopLCAvW1xccy1dL2csICdfJyk7XG4gICAgaWYgKHJlc3VsdC5pbmRleE9mKCcoJykgPCAwKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBsZXQgZm91bmQgPSB0aGlzLl9hbm9ueW1vdXNUeXBlcy5nZXQob2JqKTtcbiAgICBpZiAoaXNCbGFuayhmb3VuZCkpIHtcbiAgICAgIHRoaXMuX2Fub255bW91c1R5cGVzLnNldChvYmosIHRoaXMuX2Fub255bW91c1R5cGVJbmRleCsrKTtcbiAgICAgIGZvdW5kID0gdGhpcy5fYW5vbnltb3VzVHlwZXMuZ2V0KG9iaik7XG4gICAgfVxuICAgIHJldHVybiBgYW5vbnltb3VzX3R5cGVfJHtmb3VuZH1fYDtcbiAgfVxuXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldChkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgdmFyIG1vZHVsZVVybCA9IG51bGw7XG4gICAgICB2YXIgdGVtcGxhdGVNZXRhID0gbnVsbDtcbiAgICAgIHZhciBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IG51bGw7XG4gICAgICB2YXIgdmlld1Byb3ZpZGVycyA9IFtdO1xuXG4gICAgICBpZiAoZGlyTWV0YSBpbnN0YW5jZW9mIG1kLkNvbXBvbmVudE1ldGFkYXRhKSB7XG4gICAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCBkaXJNZXRhLnN0eWxlcyk7XG4gICAgICAgIHZhciBjbXBNZXRhID0gPG1kLkNvbXBvbmVudE1ldGFkYXRhPmRpck1ldGE7XG4gICAgICAgIG1vZHVsZVVybCA9IGNhbGNNb2R1bGVVcmwoZGlyZWN0aXZlVHlwZSwgY21wTWV0YSk7XG4gICAgICAgIHZhciB2aWV3TWV0YSA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBhc3NlcnRBcnJheU9mU3RyaW5ncygnc3R5bGVzJywgdmlld01ldGEuc3R5bGVzKTtcbiAgICAgICAgdGVtcGxhdGVNZXRhID0gbmV3IGNwbC5Db21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICAgICAgZW5jYXBzdWxhdGlvbjogdmlld01ldGEuZW5jYXBzdWxhdGlvbixcbiAgICAgICAgICB0ZW1wbGF0ZTogdmlld01ldGEudGVtcGxhdGUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IHZpZXdNZXRhLnRlbXBsYXRlVXJsLFxuICAgICAgICAgIHN0eWxlczogdmlld01ldGEuc3R5bGVzLFxuICAgICAgICAgIHN0eWxlVXJsczogdmlld01ldGEuc3R5bGVVcmxzXG4gICAgICAgIH0pO1xuICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IGNtcE1ldGEuY2hhbmdlRGV0ZWN0aW9uO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEudmlld1Byb3ZpZGVycykpIHtcbiAgICAgICAgICB2aWV3UHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShkaXJNZXRhLnZpZXdQcm92aWRlcnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm92aWRlcnMgPSBbXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS5wcm92aWRlcnMpKSB7XG4gICAgICAgIHByb3ZpZGVycyA9IHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEoZGlyTWV0YS5wcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIHF1ZXJpZXMgPSBbXTtcbiAgICAgIHZhciB2aWV3UXVlcmllcyA9IFtdO1xuICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnF1ZXJpZXMpKSB7XG4gICAgICAgIHF1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIGZhbHNlKTtcbiAgICAgICAgdmlld1F1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIHRydWUpO1xuICAgICAgfVxuICAgICAgbWV0YSA9IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICAgICAgc2VsZWN0b3I6IGRpck1ldGEuc2VsZWN0b3IsXG4gICAgICAgIGV4cG9ydEFzOiBkaXJNZXRhLmV4cG9ydEFzLFxuICAgICAgICBpc0NvbXBvbmVudDogaXNQcmVzZW50KHRlbXBsYXRlTWV0YSksXG4gICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUsIG1vZHVsZVVybCksXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZU1ldGEsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IGRpck1ldGEub3V0cHV0cyxcbiAgICAgICAgaG9zdDogZGlyTWV0YS5ob3N0LFxuICAgICAgICBsaWZlY3ljbGVIb29rczpcbiAgICAgICAgICAgIExJRkVDWUNMRV9IT09LU19WQUxVRVMuZmlsdGVyKGhvb2sgPT4gaGFzTGlmZWN5Y2xlSG9vayhob29rLCBkaXJlY3RpdmVUeXBlKSksXG4gICAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzLFxuICAgICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YTtcbiAgfVxuXG4gIGdldFR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVOYW1lKHR5cGUpLFxuICAgICAgbW9kdWxlVXJsOiBtb2R1bGVVcmwsXG4gICAgICBydW50aW1lOiB0eXBlLFxuICAgICAgZGlEZXBzOiB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHR5cGUsIG51bGwpXG4gICAgfSk7XG4gIH1cblxuICBnZXRGYWN0b3J5TWV0YWRhdGEoZmFjdG9yeTogRnVuY3Rpb24sIG1vZHVsZVVybDogc3RyaW5nKTogY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEoe1xuICAgICAgbmFtZTogdGhpcy5zYW5pdGl6ZU5hbWUoZmFjdG9yeSksXG4gICAgICBtb2R1bGVVcmw6IG1vZHVsZVVybCxcbiAgICAgIHJ1bnRpbWU6IGZhY3RvcnksXG4gICAgICBkaURlcHM6IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEoZmFjdG9yeSwgbnVsbClcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBpcGVNZXRhZGF0YShwaXBlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICB2YXIgcGlwZU1ldGEgPSB0aGlzLl9waXBlUmVzb2x2ZXIucmVzb2x2ZShwaXBlVHlwZSk7XG4gICAgICB2YXIgbW9kdWxlVXJsID0gcmVmbGVjdG9yLmltcG9ydFVyaShwaXBlVHlwZSk7XG4gICAgICBtZXRhID0gbmV3IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEocGlwZVR5cGUsIG1vZHVsZVVybCksXG4gICAgICAgIG5hbWU6IHBpcGVNZXRhLm5hbWUsXG4gICAgICAgIHB1cmU6IHBpcGVNZXRhLnB1cmUsXG4gICAgICAgIGxpZmVjeWNsZUhvb2tzOiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgcGlwZVR5cGUpKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGlwZUNhY2hlLnNldChwaXBlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0Vmlld0RpcmVjdGl2ZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtRGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKGRpcmVjdGl2ZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgZGlyZWN0aXZlIHZhbHVlICcke3N0cmluZ2lmeShkaXJlY3RpdmVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMubWFwKHR5cGUgPT4gdGhpcy5nZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXRWaWV3UGlwZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YVtdIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgdmFyIHBpcGVzID0gZmxhdHRlblBpcGVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtUGlwZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNWYWxpZFR5cGUocGlwZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgcGlwZWQgdmFsdWUgJyR7c3RyaW5naWZ5KHBpcGVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwaXBlcy5tYXAodHlwZSA9PiB0aGlzLmdldFBpcGVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlT3JGdW5jOiBUeXBlIHwgRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogYW55W10pOiBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10ge1xuICAgIHZhciBkZXBzOiBEZXBlbmRlbmN5W107XG4gICAgdHJ5IHtcbiAgICAgIGRlcHMgPSBjb25zdHJ1Y3REZXBlbmRlbmNpZXModHlwZU9yRnVuYywgZGVwZW5kZW5jaWVzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vQW5ub3RhdGlvbkVycm9yKSB7XG4gICAgICAgIGRlcHMgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXBzLm1hcCgoZGVwKSA9PiB7XG4gICAgICB2YXIgY29tcGlsZVRva2VuO1xuICAgICAgdmFyIHAgPSA8QXR0cmlidXRlTWV0YWRhdGE+ZGVwLnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgICB2YXIgaXNBdHRyaWJ1dGUgPSBmYWxzZTtcbiAgICAgIGlmIChpc1ByZXNlbnQocCkpIHtcbiAgICAgICAgY29tcGlsZVRva2VuID0gdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHAuYXR0cmlidXRlTmFtZSk7XG4gICAgICAgIGlzQXR0cmlidXRlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBpbGVUb2tlbiA9IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShkZXAua2V5LnRva2VuKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb21waWxlUXVlcnkgPSBudWxsO1xuICAgICAgdmFyIHEgPSA8ZGltZC5RdWVyeU1ldGFkYXRhPmRlcC5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgZGltZC5RdWVyeU1ldGFkYXRhKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocSkpIHtcbiAgICAgICAgY29tcGlsZVF1ZXJ5ID0gdGhpcy5nZXRRdWVyeU1ldGFkYXRhKHEsIG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtcbiAgICAgICAgaXNBdHRyaWJ1dGU6IGlzQXR0cmlidXRlLFxuICAgICAgICBpc0hvc3Q6IGRlcC51cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSxcbiAgICAgICAgaXNTZWxmOiBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTZWxmTWV0YWRhdGEsXG4gICAgICAgIGlzU2tpcFNlbGY6IGRlcC5sb3dlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEsXG4gICAgICAgIGlzT3B0aW9uYWw6IGRlcC5vcHRpb25hbCxcbiAgICAgICAgcXVlcnk6IGlzUHJlc2VudChxKSAmJiAhcS5pc1ZpZXdRdWVyeSA/IGNvbXBpbGVRdWVyeSA6IG51bGwsXG4gICAgICAgIHZpZXdRdWVyeTogaXNQcmVzZW50KHEpICYmIHEuaXNWaWV3UXVlcnkgPyBjb21waWxlUXVlcnkgOiBudWxsLFxuICAgICAgICB0b2tlbjogY29tcGlsZVRva2VuXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFJ1bnRpbWVJZGVudGlmaWVyKHZhbHVlOiBhbnkpOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7cnVudGltZTogdmFsdWUsIG5hbWU6IHRoaXMuc2FuaXRpemVOYW1lKHZhbHVlKX0pO1xuICB9XG5cbiAgZ2V0VG9rZW5NZXRhZGF0YSh0b2tlbjogYW55KTogY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcbiAgICB2YXIgY29tcGlsZVRva2VuO1xuICAgIGlmIChpc1N0cmluZyh0b2tlbikpIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IG5ldyBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEoe3ZhbHVlOiB0b2tlbn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21waWxlVG9rZW4gPSBuZXcgY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhKHtpZGVudGlmaWVyOiB0aGlzLmdldFJ1bnRpbWVJZGVudGlmaWVyKHRva2VuKX0pO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZVRva2VuO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXJzOiBhbnlbXSk6XG4gICAgICBBcnJheTxjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPiB7XG4gICAgcmV0dXJuIHByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICAgIGlmIChpc0FycmF5KHByb3ZpZGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlTWV0YWRhdGEocHJvdmlkZXIsIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcjogUHJvdmlkZXIpOiBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEge1xuICAgIHZhciBjb21waWxlRGVwcztcbiAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgICAgY29tcGlsZURlcHMgPSB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHByb3ZpZGVyLnVzZUNsYXNzLCBwcm92aWRlci5kZXBlbmRlbmNpZXMpO1xuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgICBjb21waWxlRGVwcyA9IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoe1xuICAgICAgdG9rZW46IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwcm92aWRlci50b2tlbiksXG4gICAgICB1c2VDbGFzczogaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSA/IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLnVzZUNsYXNzLCBudWxsKSA6IG51bGwsXG4gICAgICB1c2VWYWx1ZTogaXNQcmVzZW50KHByb3ZpZGVyLnVzZVZhbHVlKSA/IHRoaXMuZ2V0UnVudGltZUlkZW50aWZpZXIocHJvdmlkZXIudXNlVmFsdWUpIDogbnVsbCxcbiAgICAgIHVzZUZhY3Rvcnk6IGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSA/XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRGYWN0b3J5TWV0YWRhdGEocHJvdmlkZXIudXNlRmFjdG9yeSwgbnVsbCkgOlxuICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICB1c2VFeGlzdGluZzogaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSA/IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwcm92aWRlci51c2VFeGlzdGluZykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgZGVwczogY29tcGlsZURlcHMsXG4gICAgICBtdWx0aTogcHJvdmlkZXIubXVsdGlcbiAgICB9KTtcbiAgfVxuXG4gIGdldFF1ZXJpZXNNZXRhZGF0YShxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogZGltZC5RdWVyeU1ldGFkYXRhfSxcbiAgICAgICAgICAgICAgICAgICAgIGlzVmlld1F1ZXJ5OiBib29sZWFuKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10ge1xuICAgIHZhciBjb21waWxlUXVlcmllcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChxdWVyaWVzLCAocXVlcnksIHByb3BlcnR5TmFtZSkgPT4ge1xuICAgICAgaWYgKHF1ZXJ5LmlzVmlld1F1ZXJ5ID09PSBpc1ZpZXdRdWVyeSkge1xuICAgICAgICBjb21waWxlUXVlcmllcy5wdXNoKHRoaXMuZ2V0UXVlcnlNZXRhZGF0YShxdWVyeSwgcHJvcGVydHlOYW1lKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBpbGVRdWVyaWVzO1xuICB9XG5cbiAgZ2V0UXVlcnlNZXRhZGF0YShxOiBkaW1kLlF1ZXJ5TWV0YWRhdGEsIHByb3BlcnR5TmFtZTogc3RyaW5nKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgICB2YXIgc2VsZWN0b3JzO1xuICAgIGlmIChxLmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICBzZWxlY3RvcnMgPSBxLnZhckJpbmRpbmdzLm1hcCh2YXJOYW1lID0+IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YSh2YXJOYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdG9ycyA9IFt0aGlzLmdldFRva2VuTWV0YWRhdGEocS5zZWxlY3RvcildO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IHNlbGVjdG9ycyxcbiAgICAgIGZpcnN0OiBxLmZpcnN0LFxuICAgICAgZGVzY2VuZGFudHM6IHEuZGVzY2VuZGFudHMsXG4gICAgICBwcm9wZXJ0eU5hbWU6IHByb3BlcnR5TmFtZVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXc6IFZpZXdNZXRhZGF0YSwgcGxhdGZvcm1EaXJlY3RpdmVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBkaXJlY3RpdmVzID0gW107XG4gIGlmIChpc1ByZXNlbnQocGxhdGZvcm1EaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheShwbGF0Zm9ybURpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQodmlldy5kaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheSh2aWV3LmRpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVzO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuUGlwZXModmlldzogVmlld01ldGFkYXRhLCBwbGF0Zm9ybVBpcGVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBwaXBlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtUGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHBsYXRmb3JtUGlwZXMsIHBpcGVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcucGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHZpZXcucGlwZXMsIHBpcGVzKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BcnJheSh0cmVlOiBhbnlbXSwgb3V0OiBBcnJheTxUeXBlIHwgYW55W10+KTogdm9pZCB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gcmVzb2x2ZUZvcndhcmRSZWYodHJlZVtpXSk7XG4gICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIGZsYXR0ZW5BcnJheShpdGVtLCBvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFR5cGUodmFsdWU6IFR5cGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUHJlc2VudCh2YWx1ZSkgJiYgKHZhbHVlIGluc3RhbmNlb2YgVHlwZSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNNb2R1bGVVcmwodHlwZTogVHlwZSwgY21wTWV0YWRhdGE6IG1kLkNvbXBvbmVudE1ldGFkYXRhKTogc3RyaW5nIHtcbiAgdmFyIG1vZHVsZUlkID0gY21wTWV0YWRhdGEubW9kdWxlSWQ7XG4gIGlmIChpc1ByZXNlbnQobW9kdWxlSWQpKSB7XG4gICAgdmFyIHNjaGVtZSA9IGdldFVybFNjaGVtZShtb2R1bGVJZCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChzY2hlbWUpICYmIHNjaGVtZS5sZW5ndGggPiAwID8gbW9kdWxlSWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwYWNrYWdlOiR7bW9kdWxlSWR9JHtNT0RVTEVfU1VGRklYfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlZmxlY3Rvci5pbXBvcnRVcmkodHlwZSk7XG4gIH1cbn1cbiJdfQ==