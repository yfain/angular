'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('../output/output_ast');
var identifiers_1 = require('../identifiers');
var constants_1 = require('./constants');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var template_ast_1 = require('../template_ast');
var compile_metadata_1 = require('../compile_metadata');
var util_1 = require('./util');
var compile_query_1 = require('./compile_query');
var compile_method_1 = require('./compile_method');
var CompileNode = (function () {
    function CompileNode(parent, view, nodeIndex, renderNode, sourceAst) {
        this.parent = parent;
        this.view = view;
        this.nodeIndex = nodeIndex;
        this.renderNode = renderNode;
        this.sourceAst = sourceAst;
    }
    CompileNode.prototype.isNull = function () { return lang_1.isBlank(this.renderNode); };
    CompileNode.prototype.isRootElement = function () { return this.view != this.parent.view; };
    return CompileNode;
}());
exports.CompileNode = CompileNode;
var CompileElement = (function (_super) {
    __extends(CompileElement, _super);
    function CompileElement(parent, view, nodeIndex, renderNode, sourceAst, component, _directives, _resolvedProvidersArray, hasViewContainer, hasEmbeddedView, variableTokens) {
        _super.call(this, parent, view, nodeIndex, renderNode, sourceAst);
        this.component = component;
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.hasViewContainer = hasViewContainer;
        this.hasEmbeddedView = hasEmbeddedView;
        this.variableTokens = variableTokens;
        this._compViewExpr = null;
        this._instances = new compile_metadata_1.CompileTokenMap();
        this._queryCount = 0;
        this._queries = new compile_metadata_1.CompileTokenMap();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
        this.elementRef = o.importExpr(identifiers_1.Identifiers.ElementRef).instantiate([this.renderNode]);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.ElementRef), this.elementRef);
        this.injector = o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.Injector), this.injector);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.Renderer), o.THIS_EXPR.prop('renderer'));
        if (this.hasViewContainer || this.hasEmbeddedView || lang_1.isPresent(this.component)) {
            this._createAppElement();
        }
    }
    CompileElement.createNull = function () {
        return new CompileElement(null, null, null, null, null, null, [], [], false, false, {});
    };
    CompileElement.prototype._createAppElement = function () {
        var fieldName = "_appEl_" + this.nodeIndex;
        var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(identifiers_1.Identifiers.AppElement), [o.StmtModifier.Private]));
        var statement = o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(identifiers_1.Identifiers.AppElement)
            .instantiate([
            o.literal(this.nodeIndex),
            o.literal(parentNodeIndex),
            o.THIS_EXPR,
            this.renderNode
        ]))
            .toStmt();
        this.view.createMethod.addStmt(statement);
        this.appElement = o.THIS_EXPR.prop(fieldName);
        this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.AppElement), this.appElement);
    };
    CompileElement.prototype.setComponentView = function (compViewExpr) {
        this._compViewExpr = compViewExpr;
        this.contentNodesByNgContentIndex =
            collection_1.ListWrapper.createFixedSize(this.component.template.ngContentSelectors.length);
        for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
            this.contentNodesByNgContentIndex[i] = [];
        }
    };
    CompileElement.prototype.setEmbeddedView = function (embeddedView) {
        this.embeddedView = embeddedView;
        if (lang_1.isPresent(embeddedView)) {
            var createTemplateRefExpr = o.importExpr(identifiers_1.Identifiers.TemplateRef_)
                .instantiate([this.appElement, this.embeddedView.viewFactory]);
            var provider = new compile_metadata_1.CompileProviderMetadata({ token: identifiers_1.identifierToken(identifiers_1.Identifiers.TemplateRef), useValue: createTemplateRefExpr });
            // Add TemplateRef as first provider as it does not have deps on other providers
            this._resolvedProvidersArray.unshift(new template_ast_1.ProviderAst(provider.token, false, true, [provider], template_ast_1.ProviderAstType.Builtin, this.sourceAst.sourceSpan));
        }
    };
    CompileElement.prototype.beforeChildren = function () {
        var _this = this;
        if (this.hasViewContainer) {
            this._instances.add(identifiers_1.identifierToken(identifiers_1.Identifiers.ViewContainerRef), this.appElement.prop('vcRef'));
        }
        this._resolvedProviders = new compile_metadata_1.CompileTokenMap();
        this._resolvedProvidersArray.forEach(function (provider) {
            return _this._resolvedProviders.add(provider.token, provider);
        });
        // create all the provider instances, some in the view constructor,
        // some as getters. We rely on the fact that they are already sorted topologically.
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var providerValueExpressions = resolvedProvider.providers.map(function (provider) {
                if (lang_1.isPresent(provider.useExisting)) {
                    return _this._getDependency(resolvedProvider.providerType, new compile_metadata_1.CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (lang_1.isPresent(provider.useFactory)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    return o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (lang_1.isPresent(provider.useClass)) {
                    var deps = lang_1.isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    return o.importExpr(provider.useClass)
                        .instantiate(depsExpr, o.importType(provider.useClass));
                }
                else {
                    if (provider.useValue instanceof compile_metadata_1.CompileIdentifierMetadata) {
                        return o.importExpr(provider.useValue);
                    }
                    else if (provider.useValue instanceof o.Expression) {
                        return provider.useValue;
                    }
                    else {
                        return o.literal(provider.useValue);
                    }
                }
            });
            var propName = "_" + resolvedProvider.token.name + "_" + _this.nodeIndex + "_" + _this._instances.size;
            var instance = createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager, _this);
            _this._instances.add(resolvedProvider.token, instance);
        });
        this.directiveInstances =
            this._directives.map(function (directive) { return _this._instances.get(identifiers_1.identifierToken(directive.type)); });
        for (var i = 0; i < this.directiveInstances.length; i++) {
            var directiveInstance = this.directiveInstances[i];
            var directive = this._directives[i];
            directive.queries.forEach(function (queryMeta) { _this._addQuery(queryMeta, directiveInstance); });
        }
        var queriesWithReads = [];
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            var queriesForProvider = _this._getQueriesFor(resolvedProvider.token);
            collection_1.ListWrapper.addAll(queriesWithReads, queriesForProvider.map(function (query) { return new _QueryWithRead(query, resolvedProvider.token); }));
        });
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, varName) {
            var token = _this.variableTokens[varName];
            var varValue;
            if (lang_1.isPresent(token)) {
                varValue = _this._instances.get(token);
            }
            else {
                varValue = _this.renderNode;
            }
            _this.view.variables.set(varName, varValue);
            var varToken = new compile_metadata_1.CompileTokenMetadata({ value: varName });
            collection_1.ListWrapper.addAll(queriesWithReads, _this._getQueriesFor(varToken)
                .map(function (query) { return new _QueryWithRead(query, varToken); }));
        });
        queriesWithReads.forEach(function (queryWithRead) {
            var value;
            if (lang_1.isPresent(queryWithRead.read.identifier)) {
                // query for an identifier
                value = _this._instances.get(queryWithRead.read);
            }
            else {
                // query for a variable
                var token = _this.variableTokens[queryWithRead.read.value];
                if (lang_1.isPresent(token)) {
                    value = _this._instances.get(token);
                }
                else {
                    value = _this.elementRef;
                }
            }
            if (lang_1.isPresent(value)) {
                queryWithRead.query.addValue(value, _this.view);
            }
        });
        if (lang_1.isPresent(this.component)) {
            var componentConstructorViewQueryList = lang_1.isPresent(this.component) ? o.literalArr(this._componentConstructorViewQueryLists) :
                o.NULL_EXPR;
            var compExpr = lang_1.isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
            this.view.createMethod.addStmt(this.appElement.callMethod('initComponent', [compExpr, componentConstructorViewQueryList, this._compViewExpr])
                .toStmt());
        }
    };
    CompileElement.prototype.afterChildren = function (childNodeCount) {
        var _this = this;
        this._resolvedProviders.values().forEach(function (resolvedProvider) {
            // Note: afterChildren is called after recursing into children.
            // This is good so that an injector match in an element that is closer to a requesting element
            // matches first.
            var providerExpr = _this._instances.get(resolvedProvider.token);
            // Note: view providers are only visible on the injector of that element.
            // This is not fully correct as the rules during codegen don't allow a directive
            // to get hold of a view provdier on the same element. We still do this semantic
            // as it simplifies our model to having only one runtime injector per element.
            var providerChildNodeCount = resolvedProvider.providerType === template_ast_1.ProviderAstType.PrivateService ? 0 : childNodeCount;
            _this.view.injectorGetMethod.addStmt(createInjectInternalCondition(_this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
        });
        this._queries.values().forEach(function (queries) {
            return queries.forEach(function (query) { return query.afterChildren(_this.view.updateContentQueriesMethod); });
        });
    };
    CompileElement.prototype.addContentNode = function (ngContentIndex, nodeExpr) {
        this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
    };
    CompileElement.prototype.getComponent = function () {
        return lang_1.isPresent(this.component) ? this._instances.get(identifiers_1.identifierToken(this.component.type)) :
            null;
    };
    CompileElement.prototype.getProviderTokens = function () {
        return this._resolvedProviders.values().map(function (resolvedProvider) { return util_1.createDiTokenExpression(resolvedProvider.token); });
    };
    CompileElement.prototype.getDeclaredVariablesNames = function () {
        var res = [];
        collection_1.StringMapWrapper.forEach(this.variableTokens, function (_, key) { res.push(key); });
        return res;
    };
    CompileElement.prototype._getQueriesFor = function (token) {
        var result = [];
        var currentEl = this;
        var distance = 0;
        var queries;
        while (!currentEl.isNull()) {
            queries = currentEl._queries.get(token);
            if (lang_1.isPresent(queries)) {
                collection_1.ListWrapper.addAll(result, queries.filter(function (query) { return query.meta.descendants || distance <= 1; }));
            }
            if (currentEl._directives.length > 0) {
                distance++;
            }
            currentEl = currentEl.parent;
        }
        queries = this.view.componentView.viewQueries.get(token);
        if (lang_1.isPresent(queries)) {
            collection_1.ListWrapper.addAll(result, queries);
        }
        return result;
    };
    CompileElement.prototype._addQuery = function (queryMeta, directiveInstance) {
        var propName = "_query_" + queryMeta.selectors[0].name + "_" + this.nodeIndex + "_" + this._queryCount++;
        var queryList = compile_query_1.createQueryList(queryMeta, directiveInstance, propName, this.view);
        var query = new compile_query_1.CompileQuery(queryMeta, queryList, directiveInstance, this.view);
        compile_query_1.addQueryToTokenMap(this._queries, query);
        return query;
    };
    CompileElement.prototype._getLocalDependency = function (requestingProviderType, dep) {
        var result = null;
        // constructor content query
        if (lang_1.isBlank(result) && lang_1.isPresent(dep.query)) {
            result = this._addQuery(dep.query, null).queryList;
        }
        // constructor view query
        if (lang_1.isBlank(result) && lang_1.isPresent(dep.viewQuery)) {
            result = compile_query_1.createQueryList(dep.viewQuery, null, "_viewQuery_" + dep.viewQuery.selectors[0].name + "_" + this.nodeIndex + "_" + this._componentConstructorViewQueryLists.length, this.view);
            this._componentConstructorViewQueryLists.push(result);
        }
        if (lang_1.isPresent(dep.token)) {
            // access builtins with special visibility
            if (lang_1.isBlank(result)) {
                if (dep.token.equalsTo(identifiers_1.identifierToken(identifiers_1.Identifiers.ChangeDetectorRef))) {
                    if (requestingProviderType === template_ast_1.ProviderAstType.Component) {
                        return this._compViewExpr.prop('ref');
                    }
                    else {
                        return o.THIS_EXPR.prop('ref');
                    }
                }
            }
            // access regular providers on the element
            if (lang_1.isBlank(result)) {
                result = this._instances.get(dep.token);
            }
        }
        return result;
    };
    CompileElement.prototype._getDependency = function (requestingProviderType, dep) {
        var currElement = this;
        var currView = currElement.view;
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (lang_1.isBlank(result) && !dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep);
        }
        var resultViewPath = [];
        // check parent elements
        while (lang_1.isBlank(result) && !currElement.parent.isNull()) {
            currElement = currElement.parent;
            while (currElement.view !== currView && currView != null) {
                currView = currView.declarationElement.view;
                resultViewPath.push(currView);
            }
            result = currElement._getLocalDependency(template_ast_1.ProviderAstType.PublicService, new compile_metadata_1.CompileDiDependencyMetadata({ token: dep.token }));
        }
        if (lang_1.isBlank(result)) {
            result = util_1.injectFromViewParentInjector(dep.token, dep.isOptional);
        }
        if (lang_1.isBlank(result)) {
            result = o.NULL_EXPR;
        }
        return util_1.getPropertyInView(result, resultViewPath);
    };
    return CompileElement;
}(CompileNode));
exports.CompileElement = CompileElement;
function createInjectInternalCondition(nodeIndex, childNodeCount, provider, providerExpr) {
    var indexCondition;
    if (childNodeCount > 0) {
        indexCondition = o.literal(nodeIndex)
            .lowerEquals(constants_1.InjectMethodVars.requestNodeIndex)
            .and(constants_1.InjectMethodVars.requestNodeIndex.lowerEquals(o.literal(nodeIndex + childNodeCount)));
    }
    else {
        indexCondition = o.literal(nodeIndex).identical(constants_1.InjectMethodVars.requestNodeIndex);
    }
    return new o.IfStmt(constants_1.InjectMethodVars.token.identical(util_1.createDiTokenExpression(provider.token)).and(indexCondition), [new o.ReturnStatement(providerExpr)]);
}
function createProviderProperty(propName, provider, providerValueExpressions, isMulti, isEager, compileElement) {
    var view = compileElement.view;
    var resolvedProviderValueExpr;
    var type;
    if (isMulti) {
        resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
        type = new o.ArrayType(o.DYNAMIC_TYPE);
    }
    else {
        resolvedProviderValueExpr = providerValueExpressions[0];
        type = providerValueExpressions[0].type;
    }
    if (lang_1.isBlank(type)) {
        type = o.DYNAMIC_TYPE;
    }
    if (isEager) {
        view.fields.push(new o.ClassField(propName, type, [o.StmtModifier.Private]));
        view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    }
    else {
        var internalField = "_" + propName;
        view.fields.push(new o.ClassField(internalField, type, [o.StmtModifier.Private]));
        var getter = new compile_method_1.CompileMethod(view);
        getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
        // Note: Equals is important for JS so that it also checks the undefined case!
        getter.addStmt(new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
        getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
        view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
    }
    return o.THIS_EXPR.prop(propName);
}
var _QueryWithRead = (function () {
    function _QueryWithRead(query, match) {
        this.query = query;
        this.read = lang_1.isPresent(query.meta.read) ? query.meta.read : match;
    }
    return _QueryWithRead;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1xd1NjTG11ay50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvY29tcGlsZV9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTJDLGdCQUFnQixDQUFDLENBQUE7QUFDNUQsMEJBQStCLGFBQWEsQ0FBQyxDQUFBO0FBRTdDLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdFLDZCQUF3RCxpQkFBaUIsQ0FBQyxDQUFBO0FBQzFFLGlDQVNPLHFCQUFxQixDQUFDLENBQUE7QUFDN0IscUJBQXVGLFFBQVEsQ0FBQyxDQUFBO0FBQ2hHLDhCQUFnRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2xGLCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBRS9DO0lBQ0UscUJBQW1CLE1BQXNCLEVBQVMsSUFBaUIsRUFBUyxTQUFpQixFQUMxRSxVQUF3QixFQUFTLFNBQXNCO1FBRHZELFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDMUUsZUFBVSxHQUFWLFVBQVUsQ0FBYztRQUFTLGNBQVMsR0FBVCxTQUFTLENBQWE7SUFBRyxDQUFDO0lBRTlFLDRCQUFNLEdBQU4sY0FBb0IsTUFBTSxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRELG1DQUFhLEdBQWIsY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLGtCQUFDO0FBQUQs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Q0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNuRSxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgaWRlbnRpZmllclRva2VufSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge0luamVjdE1ldGhvZFZhcnN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVtcGxhdGVBc3QsIFByb3ZpZGVyQXN0LCBQcm92aWRlckFzdFR5cGV9IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1xuICBDb21waWxlVG9rZW5NYXAsXG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gIENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlVHlwZU1ldGFkYXRhXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtnZXRQcm9wZXJ0eUluVmlldywgY3JlYXRlRGlUb2tlbkV4cHJlc3Npb24sIGluamVjdEZyb21WaWV3UGFyZW50SW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge0NvbXBpbGVRdWVyeSwgY3JlYXRlUXVlcnlMaXN0LCBhZGRRdWVyeVRvVG9rZW5NYXB9IGZyb20gJy4vY29tcGlsZV9xdWVyeSc7XG5pbXBvcnQge0NvbXBpbGVNZXRob2R9IGZyb20gJy4vY29tcGlsZV9tZXRob2QnO1xuXG5leHBvcnQgY2xhc3MgQ29tcGlsZU5vZGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBDb21waWxlRWxlbWVudCwgcHVibGljIHZpZXc6IENvbXBpbGVWaWV3LCBwdWJsaWMgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyByZW5kZXJOb2RlOiBvLkV4cHJlc3Npb24sIHB1YmxpYyBzb3VyY2VBc3Q6IFRlbXBsYXRlQXN0KSB7fVxuXG4gIGlzTnVsbCgpOiBib29sZWFuIHsgcmV0dXJuIGlzQmxhbmsodGhpcy5yZW5kZXJOb2RlKTsgfVxuXG4gIGlzUm9vdEVsZW1lbnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnZpZXcgIT0gdGhpcy5wYXJlbnQudmlldzsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZUVsZW1lbnQgZXh0ZW5kcyBDb21waWxlTm9kZSB7XG4gIHN0YXRpYyBjcmVhdGVOdWxsKCk6IENvbXBpbGVFbGVtZW50IHtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVFbGVtZW50KG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIFtdLCBbXSwgZmFsc2UsIGZhbHNlLCB7fSk7XG4gIH1cblxuICBwcml2YXRlIF9jb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbiA9IG51bGw7XG4gIHB1YmxpYyBhcHBFbGVtZW50OiBvLlJlYWRQcm9wRXhwcjtcbiAgcHVibGljIGVsZW1lbnRSZWY6IG8uRXhwcmVzc2lvbjtcbiAgcHVibGljIGluamVjdG9yOiBvLkV4cHJlc3Npb247XG4gIHByaXZhdGUgX2luc3RhbmNlcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8by5FeHByZXNzaW9uPigpO1xuICBwcml2YXRlIF9yZXNvbHZlZFByb3ZpZGVyczogQ29tcGlsZVRva2VuTWFwPFByb3ZpZGVyQXN0PjtcblxuICBwcml2YXRlIF9xdWVyeUNvdW50ID0gMDtcbiAgcHJpdmF0ZSBfcXVlcmllcyA9IG5ldyBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5W10+KCk7XG4gIHByaXZhdGUgX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgcHVibGljIGNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXg6IEFycmF5PG8uRXhwcmVzc2lvbj5bXSA9IG51bGw7XG4gIHB1YmxpYyBlbWJlZGRlZFZpZXc6IENvbXBpbGVWaWV3O1xuICBwdWJsaWMgZGlyZWN0aXZlSW5zdGFuY2VzOiBvLkV4cHJlc3Npb25bXTtcblxuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IENvbXBpbGVFbGVtZW50LCB2aWV3OiBDb21waWxlVmlldywgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHJlbmRlck5vZGU6IG8uRXhwcmVzc2lvbiwgc291cmNlQXN0OiBUZW1wbGF0ZUFzdCxcbiAgICAgICAgICAgICAgcHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwcml2YXRlIF9kaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcmVzb2x2ZWRQcm92aWRlcnNBcnJheTogUHJvdmlkZXJBc3RbXSwgcHVibGljIGhhc1ZpZXdDb250YWluZXI6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBoYXNFbWJlZGRlZFZpZXc6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YXJpYWJsZVRva2Vuczoge1trZXk6IHN0cmluZ106IENvbXBpbGVUb2tlbk1ldGFkYXRhfSkge1xuICAgIHN1cGVyKHBhcmVudCwgdmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBzb3VyY2VBc3QpO1xuICAgIHRoaXMuZWxlbWVudFJlZiA9IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5FbGVtZW50UmVmKS5pbnN0YW50aWF0ZShbdGhpcy5yZW5kZXJOb2RlXSk7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuRWxlbWVudFJlZiksIHRoaXMuZWxlbWVudFJlZik7XG4gICAgdGhpcy5pbmplY3RvciA9IG8uVEhJU19FWFBSLmNhbGxNZXRob2QoJ2luamVjdG9yJywgW28ubGl0ZXJhbCh0aGlzLm5vZGVJbmRleCldKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5JbmplY3RvciksIHRoaXMuaW5qZWN0b3IpO1xuICAgIHRoaXMuX2luc3RhbmNlcy5hZGQoaWRlbnRpZmllclRva2VuKElkZW50aWZpZXJzLlJlbmRlcmVyKSwgby5USElTX0VYUFIucHJvcCgncmVuZGVyZXInKSk7XG4gICAgaWYgKHRoaXMuaGFzVmlld0NvbnRhaW5lciB8fCB0aGlzLmhhc0VtYmVkZGVkVmlldyB8fCBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB0aGlzLl9jcmVhdGVBcHBFbGVtZW50KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlQXBwRWxlbWVudCgpIHtcbiAgICB2YXIgZmllbGROYW1lID0gYF9hcHBFbF8ke3RoaXMubm9kZUluZGV4fWA7XG4gICAgdmFyIHBhcmVudE5vZGVJbmRleCA9IHRoaXMuaXNSb290RWxlbWVudCgpID8gbnVsbCA6IHRoaXMucGFyZW50Lm5vZGVJbmRleDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZE5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBFbGVtZW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB2YXIgc3RhdGVtZW50ID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0KG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5BcHBFbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHRoaXMubm9kZUluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHBhcmVudE5vZGVJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uVEhJU19FWFBSLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RtdCgpO1xuICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChzdGF0ZW1lbnQpO1xuICAgIHRoaXMuYXBwRWxlbWVudCA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKTtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5BcHBFbGVtZW50KSwgdGhpcy5hcHBFbGVtZW50KTtcbiAgfVxuXG4gIHNldENvbXBvbmVudFZpZXcoY29tcFZpZXdFeHByOiBvLkV4cHJlc3Npb24pIHtcbiAgICB0aGlzLl9jb21wVmlld0V4cHIgPSBjb21wVmlld0V4cHI7XG4gICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4ID1cbiAgICAgICAgTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHRoaXMuY29tcG9uZW50LnRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmNvbnRlbnROb2Rlc0J5TmdDb250ZW50SW5kZXhbaV0gPSBbXTtcbiAgICB9XG4gIH1cblxuICBzZXRFbWJlZGRlZFZpZXcoZW1iZWRkZWRWaWV3OiBDb21waWxlVmlldykge1xuICAgIHRoaXMuZW1iZWRkZWRWaWV3ID0gZW1iZWRkZWRWaWV3O1xuICAgIGlmIChpc1ByZXNlbnQoZW1iZWRkZWRWaWV3KSkge1xuICAgICAgdmFyIGNyZWF0ZVRlbXBsYXRlUmVmRXhwciA9XG4gICAgICAgICAgby5pbXBvcnRFeHByKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmXylcbiAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKFt0aGlzLmFwcEVsZW1lbnQsIHRoaXMuZW1iZWRkZWRWaWV3LnZpZXdGYWN0b3J5XSk7XG4gICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEoXG4gICAgICAgICAge3Rva2VuOiBpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpLCB1c2VWYWx1ZTogY3JlYXRlVGVtcGxhdGVSZWZFeHByfSk7XG4gICAgICAvLyBBZGQgVGVtcGxhdGVSZWYgYXMgZmlyc3QgcHJvdmlkZXIgYXMgaXQgZG9lcyBub3QgaGF2ZSBkZXBzIG9uIG90aGVyIHByb3ZpZGVyc1xuICAgICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnNBcnJheS51bnNoaWZ0KG5ldyBQcm92aWRlckFzdChwcm92aWRlci50b2tlbiwgZmFsc2UsIHRydWUsIFtwcm92aWRlcl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb3ZpZGVyQXN0VHlwZS5CdWlsdGluLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZUFzdC5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgYmVmb3JlQ2hpbGRyZW4oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFzVmlld0NvbnRhaW5lcikge1xuICAgICAgdGhpcy5faW5zdGFuY2VzLmFkZChpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuVmlld0NvbnRhaW5lclJlZiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5wcm9wKCd2Y1JlZicpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycyA9IG5ldyBDb21waWxlVG9rZW5NYXA8UHJvdmlkZXJBc3Q+KCk7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnNBcnJheS5mb3JFYWNoKHByb3ZpZGVyID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy5hZGQocHJvdmlkZXIudG9rZW4sIHByb3ZpZGVyKSk7XG5cbiAgICAvLyBjcmVhdGUgYWxsIHRoZSBwcm92aWRlciBpbnN0YW5jZXMsIHNvbWUgaW4gdGhlIHZpZXcgY29uc3RydWN0b3IsXG4gICAgLy8gc29tZSBhcyBnZXR0ZXJzLiBXZSByZWx5IG9uIHRoZSBmYWN0IHRoYXQgdGhleSBhcmUgYWxyZWFkeSBzb3J0ZWQgdG9wb2xvZ2ljYWxseS5cbiAgICB0aGlzLl9yZXNvbHZlZFByb3ZpZGVycy52YWx1ZXMoKS5mb3JFYWNoKChyZXNvbHZlZFByb3ZpZGVyKSA9PiB7XG4gICAgICB2YXIgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zID0gcmVzb2x2ZWRQcm92aWRlci5wcm92aWRlcnMubWFwKChwcm92aWRlcikgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9nZXREZXBlbmRlbmN5KFxuICAgICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLnByb3ZpZGVyVHlwZSxcbiAgICAgICAgICAgICAgbmV3IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSh7dG9rZW46IHByb3ZpZGVyLnVzZUV4aXN0aW5nfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgICAgIHZhciBkZXBzID0gaXNQcmVzZW50KHByb3ZpZGVyLmRlcHMpID8gcHJvdmlkZXIuZGVwcyA6IHByb3ZpZGVyLnVzZUZhY3RvcnkuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlRmFjdG9yeSkuY2FsbEZuKGRlcHNFeHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlQ2xhc3MuZGlEZXBzO1xuICAgICAgICAgIHZhciBkZXBzRXhwciA9IGRlcHMubWFwKChkZXApID0+IHRoaXMuX2dldERlcGVuZGVuY3kocmVzb2x2ZWRQcm92aWRlci5wcm92aWRlclR5cGUsIGRlcCkpO1xuICAgICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlQ2xhc3MpXG4gICAgICAgICAgICAgIC5pbnN0YW50aWF0ZShkZXBzRXhwciwgby5pbXBvcnRUeXBlKHByb3ZpZGVyLnVzZUNsYXNzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHByb3ZpZGVyLnVzZVZhbHVlIGluc3RhbmNlb2YgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihwcm92aWRlci51c2VWYWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcm92aWRlci51c2VWYWx1ZSBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLnVzZVZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gby5saXRlcmFsKHByb3ZpZGVyLnVzZVZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFyIHByb3BOYW1lID0gYF8ke3Jlc29sdmVkUHJvdmlkZXIudG9rZW4ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9pbnN0YW5jZXMuc2l6ZX1gO1xuICAgICAgdmFyIGluc3RhbmNlID1cbiAgICAgICAgICBjcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lLCByZXNvbHZlZFByb3ZpZGVyLCBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFByb3ZpZGVyLm11bHRpUHJvdmlkZXIsIHJlc29sdmVkUHJvdmlkZXIuZWFnZXIsIHRoaXMpO1xuICAgICAgdGhpcy5faW5zdGFuY2VzLmFkZChyZXNvbHZlZFByb3ZpZGVyLnRva2VuLCBpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlcyA9XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmUpID0+IHRoaXMuX2luc3RhbmNlcy5nZXQoaWRlbnRpZmllclRva2VuKGRpcmVjdGl2ZS50eXBlKSkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IHRoaXMuZGlyZWN0aXZlSW5zdGFuY2VzW2ldO1xuICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2RpcmVjdGl2ZXNbaV07XG4gICAgICBkaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeU1ldGEpID0+IHsgdGhpcy5fYWRkUXVlcnkocXVlcnlNZXRhLCBkaXJlY3RpdmVJbnN0YW5jZSk7IH0pO1xuICAgIH1cbiAgICB2YXIgcXVlcmllc1dpdGhSZWFkczogX1F1ZXJ5V2l0aFJlYWRbXSA9IFtdO1xuICAgIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLmZvckVhY2goKHJlc29sdmVkUHJvdmlkZXIpID0+IHtcbiAgICAgIHZhciBxdWVyaWVzRm9yUHJvdmlkZXIgPSB0aGlzLl9nZXRRdWVyaWVzRm9yKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKFxuICAgICAgICAgIHF1ZXJpZXNXaXRoUmVhZHMsXG4gICAgICAgICAgcXVlcmllc0ZvclByb3ZpZGVyLm1hcChxdWVyeSA9PiBuZXcgX1F1ZXJ5V2l0aFJlYWQocXVlcnksIHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKSk7XG4gICAgfSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMudmFyaWFibGVUb2tlbnMsIChfLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLnZhcmlhYmxlVG9rZW5zW3Zhck5hbWVdO1xuICAgICAgdmFyIHZhclZhbHVlO1xuICAgICAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICAgICAgdmFyVmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhclZhbHVlID0gdGhpcy5yZW5kZXJOb2RlO1xuICAgICAgfVxuICAgICAgdGhpcy52aWV3LnZhcmlhYmxlcy5zZXQodmFyTmFtZSwgdmFyVmFsdWUpO1xuICAgICAgdmFyIHZhclRva2VuID0gbmV3IENvbXBpbGVUb2tlbk1ldGFkYXRhKHt2YWx1ZTogdmFyTmFtZX0pO1xuICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHF1ZXJpZXNXaXRoUmVhZHMsIHRoaXMuX2dldFF1ZXJpZXNGb3IodmFyVG9rZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocXVlcnkgPT4gbmV3IF9RdWVyeVdpdGhSZWFkKHF1ZXJ5LCB2YXJUb2tlbikpKTtcbiAgICB9KTtcbiAgICBxdWVyaWVzV2l0aFJlYWRzLmZvckVhY2goKHF1ZXJ5V2l0aFJlYWQpID0+IHtcbiAgICAgIHZhciB2YWx1ZTogby5FeHByZXNzaW9uO1xuICAgICAgaWYgKGlzUHJlc2VudChxdWVyeVdpdGhSZWFkLnJlYWQuaWRlbnRpZmllcikpIHtcbiAgICAgICAgLy8gcXVlcnkgZm9yIGFuIGlkZW50aWZpZXJcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHF1ZXJ5V2l0aFJlYWQucmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBxdWVyeSBmb3IgYSB2YXJpYWJsZVxuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnZhcmlhYmxlVG9rZW5zW3F1ZXJ5V2l0aFJlYWQucmVhZC52YWx1ZV07XG4gICAgICAgIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuZWxlbWVudFJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgcXVlcnlXaXRoUmVhZC5xdWVyeS5hZGRWYWx1ZSh2YWx1ZSwgdGhpcy52aWV3KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0ID1cbiAgICAgICAgICBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gby5saXRlcmFsQXJyKHRoaXMuX2NvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJ5TGlzdHMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5OVUxMX0VYUFI7XG4gICAgICB2YXIgY29tcEV4cHIgPSBpc1ByZXNlbnQodGhpcy5nZXRDb21wb25lbnQoKSkgPyB0aGlzLmdldENvbXBvbmVudCgpIDogby5OVUxMX0VYUFI7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbml0Q29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbXBFeHByLCBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyeUxpc3QsIHRoaXMuX2NvbXBWaWV3RXhwcl0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJDaGlsZHJlbihjaGlsZE5vZGVDb3VudDogbnVtYmVyKSB7XG4gICAgdGhpcy5fcmVzb2x2ZWRQcm92aWRlcnMudmFsdWVzKCkuZm9yRWFjaCgocmVzb2x2ZWRQcm92aWRlcikgPT4ge1xuICAgICAgLy8gTm90ZTogYWZ0ZXJDaGlsZHJlbiBpcyBjYWxsZWQgYWZ0ZXIgcmVjdXJzaW5nIGludG8gY2hpbGRyZW4uXG4gICAgICAvLyBUaGlzIGlzIGdvb2Qgc28gdGhhdCBhbiBpbmplY3RvciBtYXRjaCBpbiBhbiBlbGVtZW50IHRoYXQgaXMgY2xvc2VyIHRvIGEgcmVxdWVzdGluZyBlbGVtZW50XG4gICAgICAvLyBtYXRjaGVzIGZpcnN0LlxuICAgICAgdmFyIHByb3ZpZGVyRXhwciA9IHRoaXMuX2luc3RhbmNlcy5nZXQocmVzb2x2ZWRQcm92aWRlci50b2tlbik7XG4gICAgICAvLyBOb3RlOiB2aWV3IHByb3ZpZGVycyBhcmUgb25seSB2aXNpYmxlIG9uIHRoZSBpbmplY3RvciBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAvLyBUaGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0IGFzIHRoZSBydWxlcyBkdXJpbmcgY29kZWdlbiBkb24ndCBhbGxvdyBhIGRpcmVjdGl2ZVxuICAgICAgLy8gdG8gZ2V0IGhvbGQgb2YgYSB2aWV3IHByb3ZkaWVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuIFdlIHN0aWxsIGRvIHRoaXMgc2VtYW50aWNcbiAgICAgIC8vIGFzIGl0IHNpbXBsaWZpZXMgb3VyIG1vZGVsIHRvIGhhdmluZyBvbmx5IG9uZSBydW50aW1lIGluamVjdG9yIHBlciBlbGVtZW50LlxuICAgICAgdmFyIHByb3ZpZGVyQ2hpbGROb2RlQ291bnQgPVxuICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuUHJpdmF0ZVNlcnZpY2UgPyAwIDogY2hpbGROb2RlQ291bnQ7XG4gICAgICB0aGlzLnZpZXcuaW5qZWN0b3JHZXRNZXRob2QuYWRkU3RtdChjcmVhdGVJbmplY3RJbnRlcm5hbENvbmRpdGlvbihcbiAgICAgICAgICB0aGlzLm5vZGVJbmRleCwgcHJvdmlkZXJDaGlsZE5vZGVDb3VudCwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJFeHByKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9xdWVyaWVzLnZhbHVlcygpLmZvckVhY2goXG4gICAgICAgIChxdWVyaWVzKSA9PlxuICAgICAgICAgICAgcXVlcmllcy5mb3JFYWNoKChxdWVyeSkgPT4gcXVlcnkuYWZ0ZXJDaGlsZHJlbih0aGlzLnZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QpKSk7XG4gIH1cblxuICBhZGRDb250ZW50Tm9kZShuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBub2RlRXhwcjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4W25nQ29udGVudEluZGV4XS5wdXNoKG5vZGVFeHByKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBvLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5faW5zdGFuY2VzLmdldChpZGVudGlmaWVyVG9rZW4odGhpcy5jb21wb25lbnQudHlwZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gIH1cblxuICBnZXRQcm92aWRlclRva2VucygpOiBvLkV4cHJlc3Npb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkUHJvdmlkZXJzLnZhbHVlcygpLm1hcChcbiAgICAgICAgKHJlc29sdmVkUHJvdmlkZXIpID0+IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHJlc29sdmVkUHJvdmlkZXIudG9rZW4pKTtcbiAgfVxuXG4gIGdldERlY2xhcmVkVmFyaWFibGVzTmFtZXMoKTogc3RyaW5nW10ge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy52YXJpYWJsZVRva2VucywgKF8sIGtleSkgPT4geyByZXMucHVzaChrZXkpOyB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc0Zvcih0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpOiBDb21waWxlUXVlcnlbXSB7XG4gICAgdmFyIHJlc3VsdDogQ29tcGlsZVF1ZXJ5W10gPSBbXTtcbiAgICB2YXIgY3VycmVudEVsOiBDb21waWxlRWxlbWVudCA9IHRoaXM7XG4gICAgdmFyIGRpc3RhbmNlID0gMDtcbiAgICB2YXIgcXVlcmllczogQ29tcGlsZVF1ZXJ5W107XG4gICAgd2hpbGUgKCFjdXJyZW50RWwuaXNOdWxsKCkpIHtcbiAgICAgIHF1ZXJpZXMgPSBjdXJyZW50RWwuX3F1ZXJpZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgICAgTGlzdFdyYXBwZXIuYWRkQWxsKHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJpZXMuZmlsdGVyKChxdWVyeSkgPT4gcXVlcnkubWV0YS5kZXNjZW5kYW50cyB8fCBkaXN0YW5jZSA8PSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudEVsLl9kaXJlY3RpdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC5wYXJlbnQ7XG4gICAgfVxuICAgIHF1ZXJpZXMgPSB0aGlzLnZpZXcuY29tcG9uZW50Vmlldy52aWV3UXVlcmllcy5nZXQodG9rZW4pO1xuICAgIGlmIChpc1ByZXNlbnQocXVlcmllcykpIHtcbiAgICAgIExpc3RXcmFwcGVyLmFkZEFsbChyZXN1bHQsIHF1ZXJpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUXVlcnkocXVlcnlNZXRhOiBDb21waWxlUXVlcnlNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlSW5zdGFuY2U6IG8uRXhwcmVzc2lvbik6IENvbXBpbGVRdWVyeSB7XG4gICAgdmFyIHByb3BOYW1lID0gYF9xdWVyeV8ke3F1ZXJ5TWV0YS5zZWxlY3RvcnNbMF0ubmFtZX1fJHt0aGlzLm5vZGVJbmRleH1fJHt0aGlzLl9xdWVyeUNvdW50Kyt9YDtcbiAgICB2YXIgcXVlcnlMaXN0ID0gY3JlYXRlUXVlcnlMaXN0KHF1ZXJ5TWV0YSwgZGlyZWN0aXZlSW5zdGFuY2UsIHByb3BOYW1lLCB0aGlzLnZpZXcpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBDb21waWxlUXVlcnkocXVlcnlNZXRhLCBxdWVyeUxpc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCB0aGlzLnZpZXcpO1xuICAgIGFkZFF1ZXJ5VG9Ub2tlbk1hcCh0aGlzLl9xdWVyaWVzLCBxdWVyeSk7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYWxEZXBlbmRlbmN5KHJlcXVlc3RpbmdQcm92aWRlclR5cGU6IFByb3ZpZGVyQXN0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICAvLyBjb25zdHJ1Y3RvciBjb250ZW50IHF1ZXJ5XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiBpc1ByZXNlbnQoZGVwLnF1ZXJ5KSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYWRkUXVlcnkoZGVwLnF1ZXJ5LCBudWxsKS5xdWVyeUxpc3Q7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0b3IgdmlldyBxdWVyeVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgaXNQcmVzZW50KGRlcC52aWV3UXVlcnkpKSB7XG4gICAgICByZXN1bHQgPSBjcmVhdGVRdWVyeUxpc3QoXG4gICAgICAgICAgZGVwLnZpZXdRdWVyeSwgbnVsbCxcbiAgICAgICAgICBgX3ZpZXdRdWVyeV8ke2RlcC52aWV3UXVlcnkuc2VsZWN0b3JzWzBdLm5hbWV9XyR7dGhpcy5ub2RlSW5kZXh9XyR7dGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5sZW5ndGh9YCxcbiAgICAgICAgICB0aGlzLnZpZXcpO1xuICAgICAgdGhpcy5fY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcnlMaXN0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudChkZXAudG9rZW4pKSB7XG4gICAgICAvLyBhY2Nlc3MgYnVpbHRpbnMgd2l0aCBzcGVjaWFsIHZpc2liaWxpdHlcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgaWYgKGRlcC50b2tlbi5lcXVhbHNUbyhpZGVudGlmaWVyVG9rZW4oSWRlbnRpZmllcnMuQ2hhbmdlRGV0ZWN0b3JSZWYpKSkge1xuICAgICAgICAgIGlmIChyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlID09PSBQcm92aWRlckFzdFR5cGUuQ29tcG9uZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcFZpZXdFeHByLnByb3AoJ3JlZicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gby5USElTX0VYUFIucHJvcCgncmVmJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBhY2Nlc3MgcmVndWxhciBwcm92aWRlcnMgb24gdGhlIGVsZW1lbnRcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5faW5zdGFuY2VzLmdldChkZXAudG9rZW4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlOiBQcm92aWRlckFzdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVwOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciBjdXJyRWxlbWVudDogQ29tcGlsZUVsZW1lbnQgPSB0aGlzO1xuICAgIHZhciBjdXJyVmlldyA9IGN1cnJFbGVtZW50LnZpZXc7XG4gICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgaWYgKGRlcC5pc1ZhbHVlKSB7XG4gICAgICByZXN1bHQgPSBvLmxpdGVyYWwoZGVwLnZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsocmVzdWx0KSAmJiAhZGVwLmlzU2tpcFNlbGYpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2dldExvY2FsRGVwZW5kZW5jeShyZXF1ZXN0aW5nUHJvdmlkZXJUeXBlLCBkZXApO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0Vmlld1BhdGggPSBbXTtcbiAgICAvLyBjaGVjayBwYXJlbnQgZWxlbWVudHNcbiAgICB3aGlsZSAoaXNCbGFuayhyZXN1bHQpICYmICFjdXJyRWxlbWVudC5wYXJlbnQuaXNOdWxsKCkpIHtcbiAgICAgIGN1cnJFbGVtZW50ID0gY3VyckVsZW1lbnQucGFyZW50O1xuICAgICAgd2hpbGUgKGN1cnJFbGVtZW50LnZpZXcgIT09IGN1cnJWaWV3ICYmIGN1cnJWaWV3ICE9IG51bGwpIHtcbiAgICAgICAgY3VyclZpZXcgPSBjdXJyVmlldy5kZWNsYXJhdGlvbkVsZW1lbnQudmlldztcbiAgICAgICAgcmVzdWx0Vmlld1BhdGgucHVzaChjdXJyVmlldyk7XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBjdXJyRWxlbWVudC5fZ2V0TG9jYWxEZXBlbmRlbmN5KFByb3ZpZGVyQXN0VHlwZS5QdWJsaWNTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHt0b2tlbjogZGVwLnRva2VufSkpO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IGluamVjdEZyb21WaWV3UGFyZW50SW5qZWN0b3IoZGVwLnRva2VuLCBkZXAuaXNPcHRpb25hbCk7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IG8uTlVMTF9FWFBSO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0UHJvcGVydHlJblZpZXcocmVzdWx0LCByZXN1bHRWaWV3UGF0aCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5qZWN0SW50ZXJuYWxDb25kaXRpb24obm9kZUluZGV4OiBudW1iZXIsIGNoaWxkTm9kZUNvdW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlckV4cHI6IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50IHtcbiAgdmFyIGluZGV4Q29uZGl0aW9uO1xuICBpZiAoY2hpbGROb2RlQ291bnQgPiAwKSB7XG4gICAgaW5kZXhDb25kaXRpb24gPSBvLmxpdGVyYWwobm9kZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5sb3dlckVxdWFscyhJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmFuZChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubG93ZXJFcXVhbHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChub2RlSW5kZXggKyBjaGlsZE5vZGVDb3VudCkpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmRleENvbmRpdGlvbiA9IG8ubGl0ZXJhbChub2RlSW5kZXgpLmlkZW50aWNhbChJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBuZXcgby5JZlN0bXQoXG4gICAgICBJbmplY3RNZXRob2RWYXJzLnRva2VuLmlkZW50aWNhbChjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihwcm92aWRlci50b2tlbikpLmFuZChpbmRleENvbmRpdGlvbiksXG4gICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHByb3ZpZGVyRXhwcildKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZTogc3RyaW5nLCBwcm92aWRlcjogUHJvdmlkZXJBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uczogby5FeHByZXNzaW9uW10sIGlzTXVsdGk6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRWFnZXI6IGJvb2xlYW4sIGNvbXBpbGVFbGVtZW50OiBDb21waWxlRWxlbWVudCk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciB2aWV3ID0gY29tcGlsZUVsZW1lbnQudmlldztcbiAgdmFyIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHI7XG4gIHZhciB0eXBlO1xuICBpZiAoaXNNdWx0aSkge1xuICAgIHJlc29sdmVkUHJvdmlkZXJWYWx1ZUV4cHIgPSBvLmxpdGVyYWxBcnIocHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zKTtcbiAgICB0eXBlID0gbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKTtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByID0gcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zWzBdO1xuICAgIHR5cGUgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF0udHlwZTtcbiAgfVxuICBpZiAoaXNCbGFuayh0eXBlKSkge1xuICAgIHR5cGUgPSBvLkRZTkFNSUNfVFlQRTtcbiAgfVxuICBpZiAoaXNFYWdlcikge1xuICAgIHZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChwcm9wTmFtZSwgdHlwZSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKHByb3BOYW1lKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnRlcm5hbEZpZWxkID0gYF8ke3Byb3BOYW1lfWA7XG4gICAgdmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGludGVybmFsRmllbGQsIHR5cGUsIFtvLlN0bXRNb2RpZmllci5Qcml2YXRlXSkpO1xuICAgIHZhciBnZXR0ZXIgPSBuZXcgQ29tcGlsZU1ldGhvZCh2aWV3KTtcbiAgICBnZXR0ZXIucmVzZXREZWJ1Z0luZm8oY29tcGlsZUVsZW1lbnQubm9kZUluZGV4LCBjb21waWxlRWxlbWVudC5zb3VyY2VBc3QpO1xuICAgIC8vIE5vdGU6IEVxdWFscyBpcyBpbXBvcnRhbnQgZm9yIEpTIHNvIHRoYXQgaXQgYWxzbyBjaGVja3MgdGhlIHVuZGVmaW5lZCBjYXNlIVxuICAgIGdldHRlci5hZGRTdG10KFxuICAgICAgICBuZXcgby5JZlN0bXQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5pc0JsYW5rKCksXG4gICAgICAgICAgICAgICAgICAgICBbby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCldKSk7XG4gICAgZ2V0dGVyLmFkZFN0bXQobmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uVEhJU19FWFBSLnByb3AoaW50ZXJuYWxGaWVsZCkpKTtcbiAgICB2aWV3LmdldHRlcnMucHVzaChuZXcgby5DbGFzc0dldHRlcihwcm9wTmFtZSwgZ2V0dGVyLmZpbmlzaCgpLCB0eXBlKSk7XG4gIH1cbiAgcmV0dXJuIG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpO1xufVxuXG5jbGFzcyBfUXVlcnlXaXRoUmVhZCB7XG4gIHB1YmxpYyByZWFkOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgY29uc3RydWN0b3IocHVibGljIHF1ZXJ5OiBDb21waWxlUXVlcnksIG1hdGNoOiBDb21waWxlVG9rZW5NZXRhZGF0YSkge1xuICAgIHRoaXMucmVhZCA9IGlzUHJlc2VudChxdWVyeS5tZXRhLnJlYWQpID8gcXVlcnkubWV0YS5yZWFkIDogbWF0Y2g7XG4gIH1cbn1cbiJdfQ==