import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { ViewConstructorVars, InjectMethodVars, DetectChangesVars, ViewTypeEnum, ViewEncapsulationEnum, ChangeDetectionStrategyEnum, ViewProperties } from './constants';
import { ChangeDetectionStrategy, isDefaultChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { CompileView } from './compile_view';
import { CompileElement, CompileNode } from './compile_element';
import { templateVisitAll } from '../template_ast';
import { getViewFactoryName, createFlatArray, createDiTokenExpression } from './util';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { CompileIdentifierMetadata } from '../compile_metadata';
import { bindView } from './view_binder';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
var parentRenderNodeVar = o.variable('parentRenderNode');
var rootSelectorVar = o.variable('rootSelector');
export class ViewCompileDependency {
    constructor(comp, factoryPlaceholder) {
        this.comp = comp;
        this.factoryPlaceholder = factoryPlaceholder;
    }
}
export function buildView(view, template, targetDependencies, targetStatements) {
    var builderVisitor = new ViewBuilderVisitor(view, targetDependencies, targetStatements);
    templateVisitAll(builderVisitor, template, view.declarationElement.isNull() ?
        view.declarationElement :
        view.declarationElement.parent);
    // Need to separate binding from creation to be able to refer to
    // variables that have been declared after usage.
    bindView(view, template);
    view.afterNodes();
    createViewTopLevelStmts(view, targetStatements);
    return builderVisitor.nestedViewCount;
}
class ViewBuilderVisitor {
    constructor(view, targetDependencies, targetStatements) {
        this.view = view;
        this.targetDependencies = targetDependencies;
        this.targetStatements = targetStatements;
        this.nestedViewCount = 0;
    }
    _isRootNode(parent) { return parent.view !== this.view; }
    _addRootNodeAndProject(node, ngContentIndex, parent) {
        var vcAppEl = (node instanceof CompileElement && node.hasViewContainer) ? node.appElement : null;
        if (this._isRootNode(parent)) {
            // store appElement as root node only for ViewContainers
            if (this.view.viewType !== ViewType.COMPONENT) {
                this.view.rootNodesOrAppElements.push(isPresent(vcAppEl) ? vcAppEl : node.renderNode);
            }
        }
        else if (isPresent(parent.component) && isPresent(ngContentIndex)) {
            parent.addContentNode(ngContentIndex, isPresent(vcAppEl) ? vcAppEl : node.renderNode);
        }
    }
    _getParentRenderNode(parent) {
        if (this._isRootNode(parent)) {
            if (this.view.viewType === ViewType.COMPONENT) {
                return parentRenderNodeVar;
            }
            else {
                // root node of an embedded/host view
                return o.NULL_EXPR;
            }
        }
        else {
            return isPresent(parent.component) &&
                parent.component.template.encapsulation !== ViewEncapsulation.Native ?
                o.NULL_EXPR :
                parent.renderNode;
        }
    }
    visitBoundText(ast, parent) {
        return this._visitText(ast, '', ast.ngContentIndex, parent);
    }
    visitText(ast, parent) {
        return this._visitText(ast, ast.value, ast.ngContentIndex, parent);
    }
    _visitText(ast, value, ngContentIndex, parent) {
        var fieldName = `_text_${this.view.nodes.length}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderText), [o.StmtModifier.Private]));
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var compileNode = new CompileNode(parent, this.view, this.view.nodes.length, renderNode, ast);
        var createRenderNode = o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createText', [
            this._getParentRenderNode(parent),
            o.literal(value),
            this.view.createMethod.resetDebugInfoExpr(this.view.nodes.length, ast)
        ]))
            .toStmt();
        this.view.nodes.push(compileNode);
        this.view.createMethod.addStmt(createRenderNode);
        this._addRootNodeAndProject(compileNode, ngContentIndex, parent);
        return renderNode;
    }
    visitNgContent(ast, parent) {
        // the projected nodes originate from a different view, so we don't
        // have debug information for them...
        this.view.createMethod.resetDebugInfo(null, ast);
        var parentRenderNode = this._getParentRenderNode(parent);
        var nodesExpression = ViewProperties.projectableNodes.key(o.literal(ast.index), new o.ArrayType(o.importType(this.view.genConfig.renderTypes.renderNode)));
        if (parentRenderNode !== o.NULL_EXPR) {
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('projectNodes', [
                parentRenderNode,
                o.importExpr(Identifiers.flattenNestedViewRenderNodes)
                    .callFn([nodesExpression])
            ])
                .toStmt());
        }
        else if (this._isRootNode(parent)) {
            if (this.view.viewType !== ViewType.COMPONENT) {
                // store root nodes only for embedded/host views
                this.view.rootNodesOrAppElements.push(nodesExpression);
            }
        }
        else {
            if (isPresent(parent.component) && isPresent(ast.ngContentIndex)) {
                parent.addContentNode(ast.ngContentIndex, nodesExpression);
            }
        }
        return null;
    }
    visitElement(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var createRenderNodeExpr;
        var debugContextExpr = this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast);
        if (nodeIndex === 0 && this.view.viewType === ViewType.HOST) {
            createRenderNodeExpr = o.THIS_EXPR.callMethod('selectOrCreateHostElement', [o.literal(ast.name), rootSelectorVar, debugContextExpr]);
        }
        else {
            createRenderNodeExpr = ViewProperties.renderer.callMethod('createElement', [this._getParentRenderNode(parent), o.literal(ast.name), debugContextExpr]);
        }
        var fieldName = `_el_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderElement), [o.StmtModifier.Private]));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName).set(createRenderNodeExpr).toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var component = ast.getComponent();
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var variables = _readHtmlAndDirectiveVariables(ast.exportAsVars, ast.directives, this.view.viewType);
        var htmlAttrs = _readHtmlAttrs(ast.attrs);
        var attrNameAndValues = _mergeHtmlAndDirectiveAttrs(htmlAttrs, directives);
        for (var i = 0; i < attrNameAndValues.length; i++) {
            var attrName = attrNameAndValues[i][0];
            var attrValue = attrNameAndValues[i][1];
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('setElementAttribute', [renderNode, o.literal(attrName), o.literal(attrValue)])
                .toStmt());
        }
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers, ast.hasViewContainer, false, variables);
        this.view.nodes.push(compileElement);
        var compViewExpr = null;
        if (isPresent(component)) {
            var nestedComponentIdentifier = new CompileIdentifierMetadata({ name: getViewFactoryName(component, 0) });
            this.targetDependencies.push(new ViewCompileDependency(component, nestedComponentIdentifier));
            compViewExpr = o.variable(`compView_${nodeIndex}`);
            compileElement.setComponentView(compViewExpr);
            this.view.createMethod.addStmt(compViewExpr.set(o.importExpr(nestedComponentIdentifier)
                .callFn([
                ViewProperties.viewUtils,
                compileElement.injector,
                compileElement.appElement
            ]))
                .toDeclStmt());
        }
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        templateVisitAll(this, ast.children, compileElement);
        compileElement.afterChildren(this.view.nodes.length - nodeIndex - 1);
        if (isPresent(compViewExpr)) {
            var codeGenContentNodes;
            if (this.view.component.type.isHost) {
                codeGenContentNodes = ViewProperties.projectableNodes;
            }
            else {
                codeGenContentNodes = o.literalArr(compileElement.contentNodesByNgContentIndex.map(nodes => createFlatArray(nodes)));
            }
            this.view.createMethod.addStmt(compViewExpr.callMethod('create', [codeGenContentNodes, o.NULL_EXPR]).toStmt());
        }
        return null;
    }
    visitEmbeddedTemplate(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var fieldName = `_anchor_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderComment), [o.StmtModifier.Private]));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createTemplateAnchor', [
            this._getParentRenderNode(parent),
            this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast)
        ]))
            .toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var templateVariableBindings = ast.vars.map(varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers, ast.hasViewContainer, true, {});
        this.view.nodes.push(compileElement);
        this.nestedViewCount++;
        var embeddedView = new CompileView(this.view.component, this.view.genConfig, this.view.pipeMetas, o.NULL_EXPR, this.view.viewIndex + this.nestedViewCount, compileElement, templateVariableBindings);
        this.nestedViewCount +=
            buildView(embeddedView, ast.children, this.targetDependencies, this.targetStatements);
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        compileElement.afterChildren(0);
        return null;
    }
    visitAttr(ast, ctx) { return null; }
    visitDirective(ast, ctx) { return null; }
    visitEvent(ast, eventTargetAndNames) {
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function _mergeHtmlAndDirectiveAttrs(declaredHtmlAttrs, directives) {
    var result = {};
    StringMapWrapper.forEach(declaredHtmlAttrs, (value, key) => { result[key] = value; });
    directives.forEach(directiveMeta => {
        StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
            var prevValue = result[name];
            result[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
        });
    });
    return mapToKeyValueArray(result);
}
function _readHtmlAttrs(attrs) {
    var htmlAttrs = {};
    attrs.forEach((ast) => { htmlAttrs[ast.name] = ast.value; });
    return htmlAttrs;
}
function _readHtmlAndDirectiveVariables(elementExportAsVars, directives, viewType) {
    var variables = {};
    var component = null;
    directives.forEach((directive) => {
        if (directive.directive.isComponent) {
            component = directive.directive;
        }
        directive.exportAsVars.forEach(varAst => { variables[varAst.name] = identifierToken(directive.directive.type); });
    });
    elementExportAsVars.forEach((varAst) => {
        variables[varAst.name] = isPresent(component) ? identifierToken(component.type) : null;
    });
    return variables;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return `${attrValue1} ${attrValue2}`;
    }
    else {
        return attrValue2;
    }
}
function mapToKeyValueArray(data) {
    var entryArray = [];
    StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
    var keyValueArray = [];
    entryArray.forEach((entry) => { keyValueArray.push([entry[0], entry[1]]); });
    return keyValueArray;
}
function createViewTopLevelStmts(view, targetStatements) {
    var nodeDebugInfosVar = o.NULL_EXPR;
    if (view.genConfig.genDebugInfo) {
        nodeDebugInfosVar = o.variable(`nodeDebugInfos_${view.component.type.name}${view.viewIndex}`);
        targetStatements.push(nodeDebugInfosVar
            .set(o.literalArr(view.nodes.map(createStaticNodeDebugInfo), new o.ArrayType(new o.ExternalType(Identifiers.StaticNodeDebugInfo), [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    var renderCompTypeVar = o.variable(`renderType_${view.component.type.name}`);
    if (view.viewIndex === 0) {
        targetStatements.push(renderCompTypeVar.set(o.NULL_EXPR)
            .toDeclStmt(o.importType(Identifiers.RenderComponentType)));
    }
    var viewClass = createViewClass(view, renderCompTypeVar, nodeDebugInfosVar);
    targetStatements.push(viewClass);
    targetStatements.push(createViewFactory(view, viewClass, renderCompTypeVar));
}
function createStaticNodeDebugInfo(node) {
    var compileElement = node instanceof CompileElement ? node : null;
    var providerTokens = [];
    var componentToken = o.NULL_EXPR;
    var varTokenEntries = [];
    if (isPresent(compileElement)) {
        providerTokens = compileElement.getProviderTokens();
        if (isPresent(compileElement.component)) {
            componentToken = createDiTokenExpression(identifierToken(compileElement.component.type));
        }
        StringMapWrapper.forEach(compileElement.variableTokens, (token, varName) => {
            varTokenEntries.push([varName, isPresent(token) ? createDiTokenExpression(token) : o.NULL_EXPR]);
        });
    }
    return o.importExpr(Identifiers.StaticNodeDebugInfo)
        .instantiate([
        o.literalArr(providerTokens, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])),
        componentToken,
        o.literalMap(varTokenEntries, new o.MapType(o.DYNAMIC_TYPE, [o.TypeModifier.Const]))
    ], o.importType(Identifiers.StaticNodeDebugInfo, null, [o.TypeModifier.Const]));
}
function createViewClass(view, renderCompTypeVar, nodeDebugInfosVar) {
    var emptyTemplateVariableBindings = view.templateVariableBindings.map((entry) => [entry[0], o.NULL_EXPR]);
    var viewConstructorArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var viewConstructor = new o.ClassMethod(null, viewConstructorArgs, [
        o.SUPER_EXPR.callFn([
            o.variable(view.className),
            renderCompTypeVar,
            ViewTypeEnum.fromValue(view.viewType),
            o.literalMap(emptyTemplateVariableBindings),
            ViewConstructorVars.viewUtils,
            ViewConstructorVars.parentInjector,
            ViewConstructorVars.declarationEl,
            ChangeDetectionStrategyEnum.fromValue(getChangeDetectionMode(view)),
            o.literal(view.literalArrayCount),
            o.literal(view.literalMapCount),
            nodeDebugInfosVar
        ])
            .toStmt()
    ]);
    var viewMethods = [
        new o.ClassMethod('createInternal', [new o.FnParam(rootSelectorVar.name, o.STRING_TYPE)], generateCreateMethod(view), o.importType(Identifiers.AppElement)),
        new o.ClassMethod('injectorGetInternal', [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            // Note: Can't use o.INT_TYPE here as the method in AppView uses number
            new o.FnParam(InjectMethodVars.requestNodeIndex.name, o.NUMBER_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ], addReturnValuefNotEmpty(view.injectorGetMethod.finish(), InjectMethodVars.notFoundResult), o.DYNAMIC_TYPE),
        new o.ClassMethod('detectChangesInternal', [new o.FnParam(DetectChangesVars.throwOnChange.name, o.BOOL_TYPE)], generateDetectChangesMethod(view)),
        new o.ClassMethod('dirtyParentQueriesInternal', [], view.dirtyParentQueriesMethod.finish()),
        new o.ClassMethod('destroyInternal', [], view.destroyMethod.finish())
    ].concat(view.eventHandlerMethods);
    var viewClass = new o.ClassStmt(view.className, o.importExpr(Identifiers.AppView, [getContextType(view)]), view.fields, view.getters, viewConstructor, viewMethods.filter((method) => method.body.length > 0));
    return viewClass;
}
function createViewFactory(view, viewClass, renderCompTypeVar) {
    var viewFactoryArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var initRenderCompTypeStmts = [];
    var templateUrlInfo;
    if (view.component.template.templateUrl == view.component.type.moduleUrl) {
        templateUrlInfo =
            `${view.component.type.moduleUrl} class ${view.component.type.name} - inline template`;
    }
    else {
        templateUrlInfo = view.component.template.templateUrl;
    }
    if (view.viewIndex === 0) {
        initRenderCompTypeStmts = [
            new o.IfStmt(renderCompTypeVar.identical(o.NULL_EXPR), [
                renderCompTypeVar.set(ViewConstructorVars
                    .viewUtils.callMethod('createRenderComponentType', [
                    o.literal(templateUrlInfo),
                    o.literal(view.component
                        .template.ngContentSelectors.length),
                    ViewEncapsulationEnum
                        .fromValue(view.component.template.encapsulation),
                    view.styles
                ]))
                    .toStmt()
            ])
        ];
    }
    return o.fn(viewFactoryArgs, initRenderCompTypeStmts.concat([
        new o.ReturnStatement(o.variable(viewClass.name)
            .instantiate(viewClass.constructorMethod.params.map((param) => o.variable(param.name))))
    ]), o.importType(Identifiers.AppView, [getContextType(view)]))
        .toDeclStmt(view.viewFactory.name, [o.StmtModifier.Final]);
}
function generateCreateMethod(view) {
    var parentRenderNodeExpr = o.NULL_EXPR;
    var parentRenderNodeStmts = [];
    if (view.viewType === ViewType.COMPONENT) {
        parentRenderNodeExpr = ViewProperties.renderer.callMethod('createViewRoot', [o.THIS_EXPR.prop('declarationAppElement').prop('nativeElement')]);
        parentRenderNodeStmts = [
            parentRenderNodeVar.set(parentRenderNodeExpr)
                .toDeclStmt(o.importType(view.genConfig.renderTypes.renderNode), [o.StmtModifier.Final])
        ];
    }
    var resultExpr;
    if (view.viewType === ViewType.HOST) {
        resultExpr = view.nodes[0].appElement;
    }
    else {
        resultExpr = o.NULL_EXPR;
    }
    return parentRenderNodeStmts.concat(view.createMethod.finish())
        .concat([
        o.THIS_EXPR.callMethod('init', [
            createFlatArray(view.rootNodesOrAppElements),
            o.literalArr(view.nodes.map(node => node.renderNode)),
            o.literalArr(view.disposables),
            o.literalArr(view.subscriptions)
        ])
            .toStmt(),
        new o.ReturnStatement(resultExpr)
    ]);
}
function generateDetectChangesMethod(view) {
    var stmts = [];
    if (view.detectChangesInInputsMethod.isEmpty() && view.updateContentQueriesMethod.isEmpty() &&
        view.afterContentLifecycleCallbacksMethod.isEmpty() &&
        view.detectChangesHostPropertiesMethod.isEmpty() && view.updateViewQueriesMethod.isEmpty() &&
        view.afterViewLifecycleCallbacksMethod.isEmpty()) {
        return stmts;
    }
    ListWrapper.addAll(stmts, view.detectChangesInInputsMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectContentChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterContentStmts = view.updateContentQueriesMethod.finish().concat(view.afterContentLifecycleCallbacksMethod.finish());
    if (afterContentStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterContentStmts));
    }
    ListWrapper.addAll(stmts, view.detectChangesHostPropertiesMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectViewChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterViewStmts = view.updateViewQueriesMethod.finish().concat(view.afterViewLifecycleCallbacksMethod.finish());
    if (afterViewStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterViewStmts));
    }
    var varStmts = [];
    var readVars = o.findReadVarNames(stmts);
    if (SetWrapper.has(readVars, DetectChangesVars.changed.name)) {
        varStmts.push(DetectChangesVars.changed.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.changes.name)) {
        varStmts.push(DetectChangesVars.changes.set(o.NULL_EXPR)
            .toDeclStmt(new o.MapType(o.importType(Identifiers.SimpleChange))));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.valUnwrapper.name)) {
        varStmts.push(DetectChangesVars.valUnwrapper.set(o.importExpr(Identifiers.ValueUnwrapper).instantiate([]))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    return varStmts.concat(stmts);
}
function addReturnValuefNotEmpty(statements, value) {
    if (statements.length > 0) {
        return statements.concat([new o.ReturnStatement(value)]);
    }
    else {
        return statements;
    }
}
function getContextType(view) {
    var typeMeta = view.component.type;
    return typeMeta.isHost ? o.DYNAMIC_TYPE : o.importType(typeMeta);
}
function getChangeDetectionMode(view) {
    var mode;
    if (view.viewType === ViewType.COMPONENT) {
        mode = isDefaultChangeDetectionStrategy(view.component.changeDetection) ?
            ChangeDetectionStrategy.CheckAlways :
            ChangeDetectionStrategy.CheckOnce;
    }
    else {
        mode = ChangeDetectionStrategy.CheckAlways;
    }
    return mode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC11SWF5UWRmNi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvdmlld19idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFakYsS0FBSyxDQUFDLE1BQU0sc0JBQXNCO09BQ2xDLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxNQUFNLGdCQUFnQjtPQUNwRCxFQUNMLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixxQkFBcUIsRUFDckIsMkJBQTJCLEVBQzNCLGNBQWMsRUFDZixNQUFNLGFBQWE7T0FDYixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FFckQsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CO09BRXRELEVBY0wsZ0JBQWdCLEVBR2pCLE1BQU0saUJBQWlCO09BRWpCLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLE1BQU0sUUFBUTtPQUU1RSxFQUFDLFFBQVEsRUFBQyxNQUFNLG9DQUFvQztPQUNwRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0saUNBQWlDO09BRTFELEVBQ0wseUJBQXlCLEVBRzFCLE1BQU0scUJBQXFCO09BRXJCLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZTtBQUV0QyxNQUFNLHFCQUFxQixHQUFHLFlBQVksQ0FBQztBQUMzQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDM0IsTUFBTSxVQUFVLEdBQUcs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LENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDcEIsQ0FBQztBQUNILENBQUM7QUFFRCx3QkFBd0IsSUFBaUI7SUFDdkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDbkMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLENBQUM7QUFFRCxnQ0FBZ0MsSUFBaUI7SUFDL0MsSUFBSSxJQUE2QixDQUFDO0lBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDekMsSUFBSSxHQUFHLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQzVELHVCQUF1QixDQUFDLFdBQVc7WUFDbkMsdUJBQXVCLENBQUMsU0FBUyxDQUFDO0lBQy9DLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksR0FBRyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7SUFDN0MsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIFN0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyLCBTZXRXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMsIGlkZW50aWZpZXJUb2tlbn0gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtcbiAgVmlld0NvbnN0cnVjdG9yVmFycyxcbiAgSW5qZWN0TWV0aG9kVmFycyxcbiAgRGV0ZWN0Q2hhbmdlc1ZhcnMsXG4gIFZpZXdUeXBlRW51bSxcbiAgVmlld0VuY2Fwc3VsYXRpb25FbnVtLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneUVudW0sXG4gIFZpZXdQcm9wZXJ0aWVzXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge0NvbXBpbGVFbGVtZW50LCBDb21waWxlTm9kZX0gZnJvbSAnLi9jb21waWxlX2VsZW1lbnQnO1xuXG5pbXBvcnQge1xuICBUZW1wbGF0ZUFzdCxcbiAgVGVtcGxhdGVBc3RWaXNpdG9yLFxuICBOZ0NvbnRlbnRBc3QsXG4gIEVtYmVkZGVkVGVtcGxhdGVBc3QsXG4gIEVsZW1lbnRBc3QsXG4gIFZhcmlhYmxlQXN0LFxuICBCb3VuZEV2ZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQXR0ckFzdCxcbiAgQm91bmRUZXh0QXN0LFxuICBUZXh0QXN0LFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsXG4gIHRlbXBsYXRlVmlzaXRBbGwsXG4gIFByb3BlcnR5QmluZGluZ1R5cGUsXG4gIFByb3ZpZGVyQXN0XG59IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5cbmltcG9ydCB7Z2V0Vmlld0ZhY3RvcnlOYW1lLCBjcmVhdGVGbGF0QXJyYXksIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9ufSBmcm9tICcuL3V0aWwnO1xuXG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld190eXBlJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuXG5pbXBvcnQge1xuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1ldGFkYXRhXG59IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG5pbXBvcnQge2JpbmRWaWV3fSBmcm9tICcuL3ZpZXdfYmluZGVyJztcblxuY29uc3QgSU1QTElDSVRfVEVNUExBVEVfVkFSID0gJ1xcJGltcGxpY2l0JztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfQVRUUiA9ICdzdHlsZSc7XG5cbnZhciBwYXJlbnRSZW5kZXJOb2RlVmFyID0gby52YXJpYWJsZSgncGFyZW50UmVuZGVyTm9kZScpO1xudmFyIHJvb3RTZWxlY3RvclZhciA9IG8udmFyaWFibGUoJ3Jvb3RTZWxlY3RvcicpO1xuXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXA6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIGZhY3RvcnlQbGFjZWhvbGRlcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmlldyh2aWV3OiBDb21waWxlVmlldywgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldERlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10pOiBudW1iZXIge1xuICB2YXIgYnVpbGRlclZpc2l0b3IgPSBuZXcgVmlld0J1aWxkZXJWaXNpdG9yKHZpZXcsIHRhcmdldERlcGVuZGVuY2llcywgdGFyZ2V0U3RhdGVtZW50cyk7XG4gIHRlbXBsYXRlVmlzaXRBbGwoYnVpbGRlclZpc2l0b3IsIHRlbXBsYXRlLCB2aWV3LmRlY2xhcmF0aW9uRWxlbWVudC5pc051bGwoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kZWNsYXJhdGlvbkVsZW1lbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZGVjbGFyYXRpb25FbGVtZW50LnBhcmVudCk7XG4gIC8vIE5lZWQgdG8gc2VwYXJhdGUgYmluZGluZyBmcm9tIGNyZWF0aW9uIHRvIGJlIGFibGUgdG8gcmVmZXIgdG9cbiAgLy8gdmFyaWFibGVzIHRoYXQgaGF2ZSBiZWVuIGRlY2xhcmVkIGFmdGVyIHVzYWdlLlxuICBiaW5kVmlldyh2aWV3LCB0ZW1wbGF0ZSk7XG4gIHZpZXcuYWZ0ZXJOb2RlcygpO1xuXG4gIGNyZWF0ZVZpZXdUb3BMZXZlbFN0bXRzKHZpZXcsIHRhcmdldFN0YXRlbWVudHMpO1xuXG4gIHJldHVybiBidWlsZGVyVmlzaXRvci5uZXN0ZWRWaWV3Q291bnQ7XG59XG5cblxuY2xhc3MgVmlld0J1aWxkZXJWaXNpdG9yIGltcGxlbWVudHMgVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgbmVzdGVkVmlld0NvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIHRhcmdldERlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10sXG4gICAgICAgICAgICAgIHB1YmxpYyB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKSB7fVxuXG4gIHByaXZhdGUgX2lzUm9vdE5vZGUocGFyZW50OiBDb21waWxlRWxlbWVudCk6IGJvb2xlYW4geyByZXR1cm4gcGFyZW50LnZpZXcgIT09IHRoaXMudmlldzsgfVxuXG4gIHByaXZhdGUgX2FkZFJvb3ROb2RlQW5kUHJvamVjdChub2RlOiBDb21waWxlTm9kZSwgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpIHtcbiAgICB2YXIgdmNBcHBFbCA9XG4gICAgICAgIChub2RlIGluc3RhbmNlb2YgQ29tcGlsZUVsZW1lbnQgJiYgbm9kZS5oYXNWaWV3Q29udGFpbmVyKSA/IG5vZGUuYXBwRWxlbWVudCA6IG51bGw7XG4gICAgaWYgKHRoaXMuX2lzUm9vdE5vZGUocGFyZW50KSkge1xuICAgICAgLy8gc3RvcmUgYXBwRWxlbWVudCBhcyByb290IG5vZGUgb25seSBmb3IgVmlld0NvbnRhaW5lcnNcbiAgICAgIGlmICh0aGlzLnZpZXcudmlld1R5cGUgIT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgICB0aGlzLnZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cy5wdXNoKGlzUHJlc2VudCh2Y0FwcEVsKSA/IHZjQXBwRWwgOiBub2RlLnJlbmRlck5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHBhcmVudC5jb21wb25lbnQpICYmIGlzUHJlc2VudChuZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgIHBhcmVudC5hZGRDb250ZW50Tm9kZShuZ0NvbnRlbnRJbmRleCwgaXNQcmVzZW50KHZjQXBwRWwpID8gdmNBcHBFbCA6IG5vZGUucmVuZGVyTm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogby5FeHByZXNzaW9uIHtcbiAgICBpZiAodGhpcy5faXNSb290Tm9kZShwYXJlbnQpKSB7XG4gICAgICBpZiAodGhpcy52aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudFJlbmRlck5vZGVWYXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByb290IG5vZGUgb2YgYW4gZW1iZWRkZWQvaG9zdCB2aWV3XG4gICAgICAgIHJldHVybiBvLk5VTExfRVhQUjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGlzUHJlc2VudChwYXJlbnQuY29tcG9uZW50KSAmJlxuICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmNvbXBvbmVudC50ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uICE9PSBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUgP1xuICAgICAgICAgICAgICAgICBvLk5VTExfRVhQUiA6XG4gICAgICAgICAgICAgICAgIHBhcmVudC5yZW5kZXJOb2RlO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fdmlzaXRUZXh0KGFzdCwgJycsIGFzdC5uZ0NvbnRlbnRJbmRleCwgcGFyZW50KTtcbiAgfVxuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fdmlzaXRUZXh0KGFzdCwgYXN0LnZhbHVlLCBhc3QubmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gIH1cbiAgcHJpdmF0ZSBfdmlzaXRUZXh0KGFzdDogVGVtcGxhdGVBc3QsIHZhbHVlOiBzdHJpbmcsIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgZmllbGROYW1lID0gYF90ZXh0XyR7dGhpcy52aWV3Lm5vZGVzLmxlbmd0aH1gO1xuICAgIHRoaXMudmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJUZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB2YXIgcmVuZGVyTm9kZSA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKTtcbiAgICB2YXIgY29tcGlsZU5vZGUgPSBuZXcgQ29tcGlsZU5vZGUocGFyZW50LCB0aGlzLnZpZXcsIHRoaXMudmlldy5ub2Rlcy5sZW5ndGgsIHJlbmRlck5vZGUsIGFzdCk7XG4gICAgdmFyIGNyZWF0ZVJlbmRlck5vZGUgPVxuICAgICAgICBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgIC5zZXQoVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAnY3JlYXRlVGV4dCcsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLFxuICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHZhbHVlKSxcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QucmVzZXREZWJ1Z0luZm9FeHByKHRoaXMudmlldy5ub2Rlcy5sZW5ndGgsIGFzdClcbiAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgIC50b1N0bXQoKTtcbiAgICB0aGlzLnZpZXcubm9kZXMucHVzaChjb21waWxlTm9kZSk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KGNyZWF0ZVJlbmRlck5vZGUpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlTm9kZSwgbmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gICAgcmV0dXJuIHJlbmRlck5vZGU7XG4gIH1cblxuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgLy8gdGhlIHByb2plY3RlZCBub2RlcyBvcmlnaW5hdGUgZnJvbSBhIGRpZmZlcmVudCB2aWV3LCBzbyB3ZSBkb24ndFxuICAgIC8vIGhhdmUgZGVidWcgaW5mb3JtYXRpb24gZm9yIHRoZW0uLi5cbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvKG51bGwsIGFzdCk7XG4gICAgdmFyIHBhcmVudFJlbmRlck5vZGUgPSB0aGlzLl9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudCk7XG4gICAgdmFyIG5vZGVzRXhwcmVzc2lvbiA9IFZpZXdQcm9wZXJ0aWVzLnByb2plY3RhYmxlTm9kZXMua2V5KFxuICAgICAgICBvLmxpdGVyYWwoYXN0LmluZGV4KSxcbiAgICAgICAgbmV3IG8uQXJyYXlUeXBlKG8uaW1wb3J0VHlwZSh0aGlzLnZpZXcuZ2VuQ29uZmlnLnJlbmRlclR5cGVzLnJlbmRlck5vZGUpKSk7XG4gICAgaWYgKHBhcmVudFJlbmRlck5vZGUgIT09IG8uTlVMTF9FWFBSKSB7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncHJvamVjdE5vZGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRSZW5kZXJOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGxGbihbbm9kZXNFeHByZXNzaW9uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNSb290Tm9kZShwYXJlbnQpKSB7XG4gICAgICBpZiAodGhpcy52aWV3LnZpZXdUeXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgICAgLy8gc3RvcmUgcm9vdCBub2RlcyBvbmx5IGZvciBlbWJlZGRlZC9ob3N0IHZpZXdzXG4gICAgICAgIHRoaXMudmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLnB1c2gobm9kZXNFeHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJlbnQuY29tcG9uZW50KSAmJiBpc1ByZXNlbnQoYXN0Lm5nQ29udGVudEluZGV4KSkge1xuICAgICAgICBwYXJlbnQuYWRkQ29udGVudE5vZGUoYXN0Lm5nQ29udGVudEluZGV4LCBub2Rlc0V4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBub2RlSW5kZXggPSB0aGlzLnZpZXcubm9kZXMubGVuZ3RoO1xuICAgIHZhciBjcmVhdGVSZW5kZXJOb2RlRXhwcjtcbiAgICB2YXIgZGVidWdDb250ZXh0RXhwciA9IHRoaXMudmlldy5jcmVhdGVNZXRob2QucmVzZXREZWJ1Z0luZm9FeHByKG5vZGVJbmRleCwgYXN0KTtcbiAgICBpZiAobm9kZUluZGV4ID09PSAwICYmIHRoaXMudmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgICAgY3JlYXRlUmVuZGVyTm9kZUV4cHIgPSBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKFxuICAgICAgICAgICdzZWxlY3RPckNyZWF0ZUhvc3RFbGVtZW50JywgW28ubGl0ZXJhbChhc3QubmFtZSksIHJvb3RTZWxlY3RvclZhciwgZGVidWdDb250ZXh0RXhwcl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjcmVhdGVSZW5kZXJOb2RlRXhwciA9IFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgJ2NyZWF0ZUVsZW1lbnQnLFxuICAgICAgICAgIFt0aGlzLl9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudCksIG8ubGl0ZXJhbChhc3QubmFtZSksIGRlYnVnQ29udGV4dEV4cHJdKTtcbiAgICB9XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfZWxfJHtub2RlSW5kZXh9YDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNsYXNzRmllbGQoZmllbGROYW1lLCBvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJFbGVtZW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpLnNldChjcmVhdGVSZW5kZXJOb2RlRXhwcikudG9TdG10KCkpO1xuXG4gICAgdmFyIHJlbmRlck5vZGUgPSBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSk7XG5cbiAgICB2YXIgY29tcG9uZW50ID0gYXN0LmdldENvbXBvbmVudCgpO1xuICAgIHZhciBkaXJlY3RpdmVzID0gYXN0LmRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZUFzdCA9PiBkaXJlY3RpdmVBc3QuZGlyZWN0aXZlKTtcbiAgICB2YXIgdmFyaWFibGVzID1cbiAgICAgICAgX3JlYWRIdG1sQW5kRGlyZWN0aXZlVmFyaWFibGVzKGFzdC5leHBvcnRBc1ZhcnMsIGFzdC5kaXJlY3RpdmVzLCB0aGlzLnZpZXcudmlld1R5cGUpO1xuICAgIHZhciBodG1sQXR0cnMgPSBfcmVhZEh0bWxBdHRycyhhc3QuYXR0cnMpO1xuICAgIHZhciBhdHRyTmFtZUFuZFZhbHVlcyA9IF9tZXJnZUh0bWxBbmREaXJlY3RpdmVBdHRycyhodG1sQXR0cnMsIGRpcmVjdGl2ZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0ck5hbWVBbmRWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyTmFtZSA9IGF0dHJOYW1lQW5kVmFsdWVzW2ldWzBdO1xuICAgICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHJOYW1lQW5kVmFsdWVzW2ldWzFdO1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NldEVsZW1lbnRBdHRyaWJ1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtyZW5kZXJOb2RlLCBvLmxpdGVyYWwoYXR0ck5hbWUpLCBvLmxpdGVyYWwoYXR0clZhbHVlKV0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICAgIHZhciBjb21waWxlRWxlbWVudCA9XG4gICAgICAgIG5ldyBDb21waWxlRWxlbWVudChwYXJlbnQsIHRoaXMudmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBhc3QsIGNvbXBvbmVudCwgZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5wcm92aWRlcnMsIGFzdC5oYXNWaWV3Q29udGFpbmVyLCBmYWxzZSwgdmFyaWFibGVzKTtcbiAgICB0aGlzLnZpZXcubm9kZXMucHVzaChjb21waWxlRWxlbWVudCk7XG4gICAgdmFyIGNvbXBWaWV3RXhwcjogby5SZWFkVmFyRXhwciA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnQpKSB7XG4gICAgICB2YXIgbmVzdGVkQ29tcG9uZW50SWRlbnRpZmllciA9XG4gICAgICAgICAgbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe25hbWU6IGdldFZpZXdGYWN0b3J5TmFtZShjb21wb25lbnQsIDApfSk7XG4gICAgICB0aGlzLnRhcmdldERlcGVuZGVuY2llcy5wdXNoKG5ldyBWaWV3Q29tcGlsZURlcGVuZGVuY3koY29tcG9uZW50LCBuZXN0ZWRDb21wb25lbnRJZGVudGlmaWVyKSk7XG4gICAgICBjb21wVmlld0V4cHIgPSBvLnZhcmlhYmxlKGBjb21wVmlld18ke25vZGVJbmRleH1gKTtcbiAgICAgIGNvbXBpbGVFbGVtZW50LnNldENvbXBvbmVudFZpZXcoY29tcFZpZXdFeHByKTtcbiAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChjb21wVmlld0V4cHIuc2V0KG8uaW1wb3J0RXhwcihuZXN0ZWRDb21wb25lbnRJZGVudGlmaWVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld1Byb3BlcnRpZXMudmlld1V0aWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQuaW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudC5hcHBFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KCkpO1xuICAgIH1cbiAgICBjb21waWxlRWxlbWVudC5iZWZvcmVDaGlsZHJlbigpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlRWxlbWVudCwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuLCBjb21waWxlRWxlbWVudCk7XG4gICAgY29tcGlsZUVsZW1lbnQuYWZ0ZXJDaGlsZHJlbih0aGlzLnZpZXcubm9kZXMubGVuZ3RoIC0gbm9kZUluZGV4IC0gMSk7XG5cbiAgICBpZiAoaXNQcmVzZW50KGNvbXBWaWV3RXhwcikpIHtcbiAgICAgIHZhciBjb2RlR2VuQ29udGVudE5vZGVzO1xuICAgICAgaWYgKHRoaXMudmlldy5jb21wb25lbnQudHlwZS5pc0hvc3QpIHtcbiAgICAgICAgY29kZUdlbkNvbnRlbnROb2RlcyA9IFZpZXdQcm9wZXJ0aWVzLnByb2plY3RhYmxlTm9kZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2RlR2VuQ29udGVudE5vZGVzID0gby5saXRlcmFsQXJyKFxuICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQuY29udGVudE5vZGVzQnlOZ0NvbnRlbnRJbmRleC5tYXAobm9kZXMgPT4gY3JlYXRlRmxhdEFycmF5KG5vZGVzKSkpO1xuICAgICAgfVxuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIGNvbXBWaWV3RXhwci5jYWxsTWV0aG9kKCdjcmVhdGUnLCBbY29kZUdlbkNvbnRlbnROb2Rlcywgby5OVUxMX0VYUFJdKS50b1N0bXQoKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogRW1iZWRkZWRUZW1wbGF0ZUFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgdmFyIG5vZGVJbmRleCA9IHRoaXMudmlldy5ub2Rlcy5sZW5ndGg7XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfYW5jaG9yXyR7bm9kZUluZGV4fWA7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKFxuICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyQ29tbWVudCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgIC5zZXQoVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAnY3JlYXRlVGVtcGxhdGVBbmNob3InLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFBhcmVudFJlbmRlck5vZGUocGFyZW50KSxcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QucmVzZXREZWJ1Z0luZm9FeHByKG5vZGVJbmRleCwgYXN0KVxuICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgICB2YXIgcmVuZGVyTm9kZSA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKTtcblxuICAgIHZhciB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MgPSBhc3QudmFycy5tYXAoXG4gICAgICAgIHZhckFzdCA9PiBbdmFyQXN0LnZhbHVlLmxlbmd0aCA+IDAgPyB2YXJBc3QudmFsdWUgOiBJTVBMSUNJVF9URU1QTEFURV9WQVIsIHZhckFzdC5uYW1lXSk7XG5cbiAgICB2YXIgZGlyZWN0aXZlcyA9IGFzdC5kaXJlY3RpdmVzLm1hcChkaXJlY3RpdmVBc3QgPT4gZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZSk7XG4gICAgdmFyIGNvbXBpbGVFbGVtZW50ID1cbiAgICAgICAgbmV3IENvbXBpbGVFbGVtZW50KHBhcmVudCwgdGhpcy52aWV3LCBub2RlSW5kZXgsIHJlbmRlck5vZGUsIGFzdCwgbnVsbCwgZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5wcm92aWRlcnMsIGFzdC5oYXNWaWV3Q29udGFpbmVyLCB0cnVlLCB7fSk7XG4gICAgdGhpcy52aWV3Lm5vZGVzLnB1c2goY29tcGlsZUVsZW1lbnQpO1xuXG4gICAgdGhpcy5uZXN0ZWRWaWV3Q291bnQrKztcbiAgICB2YXIgZW1iZWRkZWRWaWV3ID0gbmV3IENvbXBpbGVWaWV3KFxuICAgICAgICB0aGlzLnZpZXcuY29tcG9uZW50LCB0aGlzLnZpZXcuZ2VuQ29uZmlnLCB0aGlzLnZpZXcucGlwZU1ldGFzLCBvLk5VTExfRVhQUixcbiAgICAgICAgdGhpcy52aWV3LnZpZXdJbmRleCArIHRoaXMubmVzdGVkVmlld0NvdW50LCBjb21waWxlRWxlbWVudCwgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgICB0aGlzLm5lc3RlZFZpZXdDb3VudCArPVxuICAgICAgICBidWlsZFZpZXcoZW1iZWRkZWRWaWV3LCBhc3QuY2hpbGRyZW4sIHRoaXMudGFyZ2V0RGVwZW5kZW5jaWVzLCB0aGlzLnRhcmdldFN0YXRlbWVudHMpO1xuXG4gICAgY29tcGlsZUVsZW1lbnQuYmVmb3JlQ2hpbGRyZW4oKTtcbiAgICB0aGlzLl9hZGRSb290Tm9kZUFuZFByb2plY3QoY29tcGlsZUVsZW1lbnQsIGFzdC5uZ0NvbnRlbnRJbmRleCwgcGFyZW50KTtcbiAgICBjb21waWxlRWxlbWVudC5hZnRlckNoaWxkcmVuKDApO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0LCBldmVudFRhcmdldEFuZE5hbWVzOiBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0Pik6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG5cbmZ1bmN0aW9uIF9tZXJnZUh0bWxBbmREaXJlY3RpdmVBdHRycyhkZWNsYXJlZEh0bWxBdHRyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10pOiBzdHJpbmdbXVtdIHtcbiAgdmFyIHJlc3VsdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRlY2xhcmVkSHRtbEF0dHJzLCAodmFsdWUsIGtleSkgPT4geyByZXN1bHRba2V5XSA9IHZhbHVlOyB9KTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEgPT4ge1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkaXJlY3RpdmVNZXRhLmhvc3RBdHRyaWJ1dGVzLCAodmFsdWUsIG5hbWUpID0+IHtcbiAgICAgIHZhciBwcmV2VmFsdWUgPSByZXN1bHRbbmFtZV07XG4gICAgICByZXN1bHRbbmFtZV0gPSBpc1ByZXNlbnQocHJldlZhbHVlKSA/IG1lcmdlQXR0cmlidXRlVmFsdWUobmFtZSwgcHJldlZhbHVlLCB2YWx1ZSkgOiB2YWx1ZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBtYXBUb0tleVZhbHVlQXJyYXkocmVzdWx0KTtcbn1cblxuZnVuY3Rpb24gX3JlYWRIdG1sQXR0cnMoYXR0cnM6IEF0dHJBc3RbXSk6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9IHtcbiAgdmFyIGh0bWxBdHRyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgYXR0cnMuZm9yRWFjaCgoYXN0KSA9PiB7IGh0bWxBdHRyc1thc3QubmFtZV0gPSBhc3QudmFsdWU7IH0pO1xuICByZXR1cm4gaHRtbEF0dHJzO1xufVxuXG5mdW5jdGlvbiBfcmVhZEh0bWxBbmREaXJlY3RpdmVWYXJpYWJsZXMoZWxlbWVudEV4cG9ydEFzVmFyczogVmFyaWFibGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3VHlwZTogVmlld1R5cGUpOiB7W2tleTogc3RyaW5nXTogQ29tcGlsZVRva2VuTWV0YWRhdGF9IHtcbiAgdmFyIHZhcmlhYmxlczoge1trZXk6IHN0cmluZ106IENvbXBpbGVUb2tlbk1ldGFkYXRhfSA9IHt9O1xuICB2YXIgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEgPSBudWxsO1xuICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZSkgPT4ge1xuICAgIGlmIChkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICBjb21wb25lbnQgPSBkaXJlY3RpdmUuZGlyZWN0aXZlO1xuICAgIH1cbiAgICBkaXJlY3RpdmUuZXhwb3J0QXNWYXJzLmZvckVhY2goXG4gICAgICAgIHZhckFzdCA9PiB7IHZhcmlhYmxlc1t2YXJBc3QubmFtZV0gPSBpZGVudGlmaWVyVG9rZW4oZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlKTsgfSk7XG4gIH0pO1xuICBlbGVtZW50RXhwb3J0QXNWYXJzLmZvckVhY2goKHZhckFzdCkgPT4ge1xuICAgIHZhcmlhYmxlc1t2YXJBc3QubmFtZV0gPSBpc1ByZXNlbnQoY29tcG9uZW50KSA/IGlkZW50aWZpZXJUb2tlbihjb21wb25lbnQudHlwZSkgOiBudWxsO1xuICB9KTtcbiAgcmV0dXJuIHZhcmlhYmxlcztcbn1cblxuZnVuY3Rpb24gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWUxOiBzdHJpbmcsIGF0dHJWYWx1ZTI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChhdHRyTmFtZSA9PSBDTEFTU19BVFRSIHx8IGF0dHJOYW1lID09IFNUWUxFX0FUVFIpIHtcbiAgICByZXR1cm4gYCR7YXR0clZhbHVlMX0gJHthdHRyVmFsdWUyfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGF0dHJWYWx1ZTI7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwVG9LZXlWYWx1ZUFycmF5KGRhdGE6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nW11bXSB7XG4gIHZhciBlbnRyeUFycmF5ID0gW107XG4gIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkYXRhLCAodmFsdWUsIG5hbWUpID0+IHsgZW50cnlBcnJheS5wdXNoKFtuYW1lLCB2YWx1ZV0pOyB9KTtcbiAgLy8gV2UgbmVlZCB0byBzb3J0IHRvIGdldCBhIGRlZmluZWQgb3V0cHV0IG9yZGVyXG4gIC8vIGZvciB0ZXN0cyBhbmQgZm9yIGNhY2hpbmcgZ2VuZXJhdGVkIGFydGlmYWN0cy4uLlxuICBMaXN0V3JhcHBlci5zb3J0KGVudHJ5QXJyYXksIChlbnRyeTEsIGVudHJ5MikgPT4gU3RyaW5nV3JhcHBlci5jb21wYXJlKGVudHJ5MVswXSwgZW50cnkyWzBdKSk7XG4gIHZhciBrZXlWYWx1ZUFycmF5ID0gW107XG4gIGVudHJ5QXJyYXkuZm9yRWFjaCgoZW50cnkpID0+IHsga2V5VmFsdWVBcnJheS5wdXNoKFtlbnRyeVswXSwgZW50cnlbMV1dKTsgfSk7XG4gIHJldHVybiBrZXlWYWx1ZUFycmF5O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaWV3VG9wTGV2ZWxTdG10cyh2aWV3OiBDb21waWxlVmlldywgdGFyZ2V0U3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSkge1xuICB2YXIgbm9kZURlYnVnSW5mb3NWYXI6IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICBpZiAodmlldy5nZW5Db25maWcuZ2VuRGVidWdJbmZvKSB7XG4gICAgbm9kZURlYnVnSW5mb3NWYXIgPSBvLnZhcmlhYmxlKGBub2RlRGVidWdJbmZvc18ke3ZpZXcuY29tcG9uZW50LnR5cGUubmFtZX0ke3ZpZXcudmlld0luZGV4fWApO1xuICAgIHRhcmdldFN0YXRlbWVudHMucHVzaChcbiAgICAgICAgKDxvLlJlYWRWYXJFeHByPm5vZGVEZWJ1Z0luZm9zVmFyKVxuICAgICAgICAgICAgLnNldChvLmxpdGVyYWxBcnIodmlldy5ub2Rlcy5tYXAoY3JlYXRlU3RhdGljTm9kZURlYnVnSW5mbyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgby5BcnJheVR5cGUobmV3IG8uRXh0ZXJuYWxUeXBlKElkZW50aWZpZXJzLlN0YXRpY05vZGVEZWJ1Z0luZm8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKSlcbiAgICAgICAgICAgIC50b0RlY2xTdG10KG51bGwsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgfVxuXG5cbiAgdmFyIHJlbmRlckNvbXBUeXBlVmFyOiBvLlJlYWRWYXJFeHByID0gby52YXJpYWJsZShgcmVuZGVyVHlwZV8ke3ZpZXcuY29tcG9uZW50LnR5cGUubmFtZX1gKTtcbiAgaWYgKHZpZXcudmlld0luZGV4ID09PSAwKSB7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKHJlbmRlckNvbXBUeXBlVmFyLnNldChvLk5VTExfRVhQUilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5SZW5kZXJDb21wb25lbnRUeXBlKSkpO1xuICB9XG5cbiAgdmFyIHZpZXdDbGFzcyA9IGNyZWF0ZVZpZXdDbGFzcyh2aWV3LCByZW5kZXJDb21wVHlwZVZhciwgbm9kZURlYnVnSW5mb3NWYXIpO1xuICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2godmlld0NsYXNzKTtcbiAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKGNyZWF0ZVZpZXdGYWN0b3J5KHZpZXcsIHZpZXdDbGFzcywgcmVuZGVyQ29tcFR5cGVWYXIpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RhdGljTm9kZURlYnVnSW5mbyhub2RlOiBDb21waWxlTm9kZSk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciBjb21waWxlRWxlbWVudCA9IG5vZGUgaW5zdGFuY2VvZiBDb21waWxlRWxlbWVudCA/IG5vZGUgOiBudWxsO1xuICB2YXIgcHJvdmlkZXJUb2tlbnM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gIHZhciBjb21wb25lbnRUb2tlbjogby5FeHByZXNzaW9uID0gby5OVUxMX0VYUFI7XG4gIHZhciB2YXJUb2tlbkVudHJpZXMgPSBbXTtcbiAgaWYgKGlzUHJlc2VudChjb21waWxlRWxlbWVudCkpIHtcbiAgICBwcm92aWRlclRva2VucyA9IGNvbXBpbGVFbGVtZW50LmdldFByb3ZpZGVyVG9rZW5zKCk7XG4gICAgaWYgKGlzUHJlc2VudChjb21waWxlRWxlbWVudC5jb21wb25lbnQpKSB7XG4gICAgICBjb21wb25lbnRUb2tlbiA9IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKGlkZW50aWZpZXJUb2tlbihjb21waWxlRWxlbWVudC5jb21wb25lbnQudHlwZSkpO1xuICAgIH1cbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goY29tcGlsZUVsZW1lbnQudmFyaWFibGVUb2tlbnMsICh0b2tlbiwgdmFyTmFtZSkgPT4ge1xuICAgICAgdmFyVG9rZW5FbnRyaWVzLnB1c2goXG4gICAgICAgICAgW3Zhck5hbWUsIGlzUHJlc2VudCh0b2tlbikgPyBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbih0b2tlbikgOiBvLk5VTExfRVhQUl0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuU3RhdGljTm9kZURlYnVnSW5mbylcbiAgICAgIC5pbnN0YW50aWF0ZShcbiAgICAgICAgICBbXG4gICAgICAgICAgICBvLmxpdGVyYWxBcnIocHJvdmlkZXJUb2tlbnMsIG5ldyBvLkFycmF5VHlwZShvLkRZTkFNSUNfVFlQRSwgW28uVHlwZU1vZGlmaWVyLkNvbnN0XSkpLFxuICAgICAgICAgICAgY29tcG9uZW50VG9rZW4sXG4gICAgICAgICAgICBvLmxpdGVyYWxNYXAodmFyVG9rZW5FbnRyaWVzLCBuZXcgby5NYXBUeXBlKG8uRFlOQU1JQ19UWVBFLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSlcbiAgICAgICAgICBdLFxuICAgICAgICAgIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvLCBudWxsLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZpZXdDbGFzcyh2aWV3OiBDb21waWxlVmlldywgcmVuZGVyQ29tcFR5cGVWYXI6IG8uUmVhZFZhckV4cHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURlYnVnSW5mb3NWYXI6IG8uRXhwcmVzc2lvbik6IG8uQ2xhc3NTdG10IHtcbiAgdmFyIGVtcHR5VGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzID1cbiAgICAgIHZpZXcudGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzLm1hcCgoZW50cnkpID0+IFtlbnRyeVswXSwgby5OVUxMX0VYUFJdKTtcbiAgdmFyIHZpZXdDb25zdHJ1Y3RvckFyZ3MgPSBbXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLnZpZXdVdGlscy5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuVmlld1V0aWxzKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLnBhcmVudEluamVjdG9yLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5JbmplY3RvcikpLFxuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy5kZWNsYXJhdGlvbkVsLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBFbGVtZW50KSlcbiAgXTtcbiAgdmFyIHZpZXdDb25zdHJ1Y3RvciA9IG5ldyBvLkNsYXNzTWV0aG9kKG51bGwsIHZpZXdDb25zdHJ1Y3RvckFyZ3MsIFtcbiAgICBvLlNVUEVSX0VYUFIuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUodmlldy5jbGFzc05hbWUpLFxuICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcFR5cGVWYXIsXG4gICAgICAgICAgICAgICAgICBWaWV3VHlwZUVudW0uZnJvbVZhbHVlKHZpZXcudmlld1R5cGUpLFxuICAgICAgICAgICAgICAgICAgby5saXRlcmFsTWFwKGVtcHR5VGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKSxcbiAgICAgICAgICAgICAgICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLFxuICAgICAgICAgICAgICAgICAgVmlld0NvbnN0cnVjdG9yVmFycy5wYXJlbnRJbmplY3RvcixcbiAgICAgICAgICAgICAgICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMuZGVjbGFyYXRpb25FbCxcbiAgICAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5RW51bS5mcm9tVmFsdWUoZ2V0Q2hhbmdlRGV0ZWN0aW9uTW9kZSh2aWV3KSksXG4gICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodmlldy5saXRlcmFsQXJyYXlDb3VudCksXG4gICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodmlldy5saXRlcmFsTWFwQ291bnQpLFxuICAgICAgICAgICAgICAgICAgbm9kZURlYnVnSW5mb3NWYXJcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAudG9TdG10KClcbiAgXSk7XG5cbiAgdmFyIHZpZXdNZXRob2RzID0gW1xuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdjcmVhdGVJbnRlcm5hbCcsIFtuZXcgby5GblBhcmFtKHJvb3RTZWxlY3RvclZhci5uYW1lLCBvLlNUUklOR19UWVBFKV0sXG4gICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVDcmVhdGVNZXRob2QodmlldyksIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBFbGVtZW50KSksXG4gICAgbmV3IG8uQ2xhc3NNZXRob2QoXG4gICAgICAgICdpbmplY3RvckdldEludGVybmFsJyxcbiAgICAgICAgW1xuICAgICAgICAgIG5ldyBvLkZuUGFyYW0oSW5qZWN0TWV0aG9kVmFycy50b2tlbi5uYW1lLCBvLkRZTkFNSUNfVFlQRSksXG4gICAgICAgICAgLy8gTm90ZTogQ2FuJ3QgdXNlIG8uSU5UX1RZUEUgaGVyZSBhcyB0aGUgbWV0aG9kIGluIEFwcFZpZXcgdXNlcyBudW1iZXJcbiAgICAgICAgICBuZXcgby5GblBhcmFtKEluamVjdE1ldGhvZFZhcnMucmVxdWVzdE5vZGVJbmRleC5uYW1lLCBvLk5VTUJFUl9UWVBFKSxcbiAgICAgICAgICBuZXcgby5GblBhcmFtKEluamVjdE1ldGhvZFZhcnMubm90Rm91bmRSZXN1bHQubmFtZSwgby5EWU5BTUlDX1RZUEUpXG4gICAgICAgIF0sXG4gICAgICAgIGFkZFJldHVyblZhbHVlZk5vdEVtcHR5KHZpZXcuaW5qZWN0b3JHZXRNZXRob2QuZmluaXNoKCksIEluamVjdE1ldGhvZFZhcnMubm90Rm91bmRSZXN1bHQpLFxuICAgICAgICBvLkRZTkFNSUNfVFlQRSksXG4gICAgbmV3IG8uQ2xhc3NNZXRob2QoJ2RldGVjdENoYW5nZXNJbnRlcm5hbCcsXG4gICAgICAgICAgICAgICAgICAgICAgW25ldyBvLkZuUGFyYW0oRGV0ZWN0Q2hhbmdlc1ZhcnMudGhyb3dPbkNoYW5nZS5uYW1lLCBvLkJPT0xfVFlQRSldLFxuICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlRGV0ZWN0Q2hhbmdlc01ldGhvZCh2aWV3KSksXG4gICAgbmV3IG8uQ2xhc3NNZXRob2QoJ2RpcnR5UGFyZW50UXVlcmllc0ludGVybmFsJywgW10sIHZpZXcuZGlydHlQYXJlbnRRdWVyaWVzTWV0aG9kLmZpbmlzaCgpKSxcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnZGVzdHJveUludGVybmFsJywgW10sIHZpZXcuZGVzdHJveU1ldGhvZC5maW5pc2goKSlcbiAgXS5jb25jYXQodmlldy5ldmVudEhhbmRsZXJNZXRob2RzKTtcbiAgdmFyIHZpZXdDbGFzcyA9IG5ldyBvLkNsYXNzU3RtdChcbiAgICAgIHZpZXcuY2xhc3NOYW1lLCBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuQXBwVmlldywgW2dldENvbnRleHRUeXBlKHZpZXcpXSksIHZpZXcuZmllbGRzLFxuICAgICAgdmlldy5nZXR0ZXJzLCB2aWV3Q29uc3RydWN0b3IsIHZpZXdNZXRob2RzLmZpbHRlcigobWV0aG9kKSA9PiBtZXRob2QuYm9keS5sZW5ndGggPiAwKSk7XG4gIHJldHVybiB2aWV3Q2xhc3M7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZpZXdGYWN0b3J5KHZpZXc6IENvbXBpbGVWaWV3LCB2aWV3Q2xhc3M6IG8uQ2xhc3NTdG10LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcFR5cGVWYXI6IG8uUmVhZFZhckV4cHIpOiBvLlN0YXRlbWVudCB7XG4gIHZhciB2aWV3RmFjdG9yeUFyZ3MgPSBbXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLnZpZXdVdGlscy5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuVmlld1V0aWxzKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLnBhcmVudEluamVjdG9yLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5JbmplY3RvcikpLFxuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy5kZWNsYXJhdGlvbkVsLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBFbGVtZW50KSlcbiAgXTtcbiAgdmFyIGluaXRSZW5kZXJDb21wVHlwZVN0bXRzID0gW107XG4gIHZhciB0ZW1wbGF0ZVVybEluZm87XG4gIGlmICh2aWV3LmNvbXBvbmVudC50ZW1wbGF0ZS50ZW1wbGF0ZVVybCA9PSB2aWV3LmNvbXBvbmVudC50eXBlLm1vZHVsZVVybCkge1xuICAgIHRlbXBsYXRlVXJsSW5mbyA9XG4gICAgICAgIGAke3ZpZXcuY29tcG9uZW50LnR5cGUubW9kdWxlVXJsfSBjbGFzcyAke3ZpZXcuY29tcG9uZW50LnR5cGUubmFtZX0gLSBpbmxpbmUgdGVtcGxhdGVgO1xuICB9IGVsc2Uge1xuICAgIHRlbXBsYXRlVXJsSW5mbyA9IHZpZXcuY29tcG9uZW50LnRlbXBsYXRlLnRlbXBsYXRlVXJsO1xuICB9XG4gIGlmICh2aWV3LnZpZXdJbmRleCA9PT0gMCkge1xuICAgIGluaXRSZW5kZXJDb21wVHlwZVN0bXRzID0gW1xuICAgICAgbmV3IG8uSWZTdG10KHJlbmRlckNvbXBUeXBlVmFyLmlkZW50aWNhbChvLk5VTExfRVhQUiksXG4gICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcFR5cGVWYXIuc2V0KFZpZXdDb25zdHJ1Y3RvclZhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZpZXdVdGlscy5jYWxsTWV0aG9kKCdjcmVhdGVSZW5kZXJDb21wb25lbnRUeXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHRlbXBsYXRlVXJsSW5mbyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh2aWV3LmNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50ZW1wbGF0ZS5uZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlld0VuY2Fwc3VsYXRpb25FbnVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZnJvbVZhbHVlKHZpZXcuY29tcG9uZW50LnRlbXBsYXRlLmVuY2Fwc3VsYXRpb24pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LnN0eWxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RtdCgpXG4gICAgICAgICAgICAgICAgICAgXSlcbiAgICBdO1xuICB9XG4gIHJldHVybiBvLmZuKHZpZXdGYWN0b3J5QXJncywgaW5pdFJlbmRlckNvbXBUeXBlU3RtdHMuY29uY2F0KFtcbiAgICAgICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChvLnZhcmlhYmxlKHZpZXdDbGFzcy5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5zdGFudGlhdGUodmlld0NsYXNzLmNvbnN0cnVjdG9yTWV0aG9kLnBhcmFtcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyYW0pID0+IG8udmFyaWFibGUocGFyYW0ubmFtZSkpKSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcFZpZXcsIFtnZXRDb250ZXh0VHlwZSh2aWV3KV0pKVxuICAgICAgLnRvRGVjbFN0bXQodmlldy52aWV3RmFjdG9yeS5uYW1lLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVDcmVhdGVNZXRob2QodmlldzogQ29tcGlsZVZpZXcpOiBvLlN0YXRlbWVudFtdIHtcbiAgdmFyIHBhcmVudFJlbmRlck5vZGVFeHByOiBvLkV4cHJlc3Npb24gPSBvLk5VTExfRVhQUjtcbiAgdmFyIHBhcmVudFJlbmRlck5vZGVTdG10cyA9IFtdO1xuICBpZiAodmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgcGFyZW50UmVuZGVyTm9kZUV4cHIgPSBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAnY3JlYXRlVmlld1Jvb3QnLCBbby5USElTX0VYUFIucHJvcCgnZGVjbGFyYXRpb25BcHBFbGVtZW50JykucHJvcCgnbmF0aXZlRWxlbWVudCcpXSk7XG4gICAgcGFyZW50UmVuZGVyTm9kZVN0bXRzID0gW1xuICAgICAgcGFyZW50UmVuZGVyTm9kZVZhci5zZXQocGFyZW50UmVuZGVyTm9kZUV4cHIpXG4gICAgICAgICAgLnRvRGVjbFN0bXQoby5pbXBvcnRUeXBlKHZpZXcuZ2VuQ29uZmlnLnJlbmRlclR5cGVzLnJlbmRlck5vZGUpLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKVxuICAgIF07XG4gIH1cbiAgdmFyIHJlc3VsdEV4cHI6IG8uRXhwcmVzc2lvbjtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkhPU1QpIHtcbiAgICByZXN1bHRFeHByID0gKDxDb21waWxlRWxlbWVudD52aWV3Lm5vZGVzWzBdKS5hcHBFbGVtZW50O1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdEV4cHIgPSBvLk5VTExfRVhQUjtcbiAgfVxuICByZXR1cm4gcGFyZW50UmVuZGVyTm9kZVN0bXRzLmNvbmNhdCh2aWV3LmNyZWF0ZU1ldGhvZC5maW5pc2goKSlcbiAgICAgIC5jb25jYXQoW1xuICAgICAgICBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdpbml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVGbGF0QXJyYXkodmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycih2aWV3Lm5vZGVzLm1hcChub2RlID0+IG5vZGUucmVuZGVyTm9kZSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHZpZXcuZGlzcG9zYWJsZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsQXJyKHZpZXcuc3Vic2NyaXB0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgLnRvU3RtdCgpLFxuICAgICAgICBuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmVzdWx0RXhwcilcbiAgICAgIF0pO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZURldGVjdENoYW5nZXNNZXRob2QodmlldzogQ29tcGlsZVZpZXcpOiBvLlN0YXRlbWVudFtdIHtcbiAgdmFyIHN0bXRzID0gW107XG4gIGlmICh2aWV3LmRldGVjdENoYW5nZXNJbklucHV0c01ldGhvZC5pc0VtcHR5KCkgJiYgdmlldy51cGRhdGVDb250ZW50UXVlcmllc01ldGhvZC5pc0VtcHR5KCkgJiZcbiAgICAgIHZpZXcuYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzTWV0aG9kLmlzRW1wdHkoKSAmJlxuICAgICAgdmlldy5kZXRlY3RDaGFuZ2VzSG9zdFByb3BlcnRpZXNNZXRob2QuaXNFbXB0eSgpICYmIHZpZXcudXBkYXRlVmlld1F1ZXJpZXNNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gc3RtdHM7XG4gIH1cbiAgTGlzdFdyYXBwZXIuYWRkQWxsKHN0bXRzLCB2aWV3LmRldGVjdENoYW5nZXNJbklucHV0c01ldGhvZC5maW5pc2goKSk7XG4gIHN0bXRzLnB1c2goXG4gICAgICBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdkZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzJywgW0RldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2VdKVxuICAgICAgICAgIC50b1N0bXQoKSk7XG4gIHZhciBhZnRlckNvbnRlbnRTdG10cyA9IHZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QuZmluaXNoKCkuY29uY2F0KFxuICAgICAgdmlldy5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NNZXRob2QuZmluaXNoKCkpO1xuICBpZiAoYWZ0ZXJDb250ZW50U3RtdHMubGVuZ3RoID4gMCkge1xuICAgIHN0bXRzLnB1c2gobmV3IG8uSWZTdG10KG8ubm90KERldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UpLCBhZnRlckNvbnRlbnRTdG10cykpO1xuICB9XG4gIExpc3RXcmFwcGVyLmFkZEFsbChzdG10cywgdmlldy5kZXRlY3RDaGFuZ2VzSG9zdFByb3BlcnRpZXNNZXRob2QuZmluaXNoKCkpO1xuICBzdG10cy5wdXNoKG8uVEhJU19FWFBSLmNhbGxNZXRob2QoJ2RldGVjdFZpZXdDaGlsZHJlbkNoYW5nZXMnLCBbRGV0ZWN0Q2hhbmdlc1ZhcnMudGhyb3dPbkNoYW5nZV0pXG4gICAgICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gIHZhciBhZnRlclZpZXdTdG10cyA9XG4gICAgICB2aWV3LnVwZGF0ZVZpZXdRdWVyaWVzTWV0aG9kLmZpbmlzaCgpLmNvbmNhdCh2aWV3LmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5maW5pc2goKSk7XG4gIGlmIChhZnRlclZpZXdTdG10cy5sZW5ndGggPiAwKSB7XG4gICAgc3RtdHMucHVzaChuZXcgby5JZlN0bXQoby5ub3QoRGV0ZWN0Q2hhbmdlc1ZhcnMudGhyb3dPbkNoYW5nZSksIGFmdGVyVmlld1N0bXRzKSk7XG4gIH1cblxuICB2YXIgdmFyU3RtdHMgPSBbXTtcbiAgdmFyIHJlYWRWYXJzID0gby5maW5kUmVhZFZhck5hbWVzKHN0bXRzKTtcbiAgaWYgKFNldFdyYXBwZXIuaGFzKHJlYWRWYXJzLCBEZXRlY3RDaGFuZ2VzVmFycy5jaGFuZ2VkLm5hbWUpKSB7XG4gICAgdmFyU3RtdHMucHVzaChEZXRlY3RDaGFuZ2VzVmFycy5jaGFuZ2VkLnNldChvLmxpdGVyYWwodHJ1ZSkpLnRvRGVjbFN0bXQoby5CT09MX1RZUEUpKTtcbiAgfVxuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMuc2V0KG8uTlVMTF9FWFBSKVxuICAgICAgICAgICAgICAgICAgICAgIC50b0RlY2xTdG10KG5ldyBvLk1hcFR5cGUoby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlNpbXBsZUNoYW5nZSkpKSk7XG4gIH1cbiAgaWYgKFNldFdyYXBwZXIuaGFzKHJlYWRWYXJzLCBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKFxuICAgICAgICBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIuc2V0KG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5WYWx1ZVVud3JhcHBlcikuaW5zdGFudGlhdGUoW10pKVxuICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICB9XG4gIHJldHVybiB2YXJTdG10cy5jb25jYXQoc3RtdHMpO1xufVxuXG5mdW5jdGlvbiBhZGRSZXR1cm5WYWx1ZWZOb3RFbXB0eShzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCB2YWx1ZTogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnRbXSB7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gc3RhdGVtZW50cy5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudCh2YWx1ZSldKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RhdGVtZW50cztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDb250ZXh0VHlwZSh2aWV3OiBDb21waWxlVmlldyk6IG8uVHlwZSB7XG4gIHZhciB0eXBlTWV0YSA9IHZpZXcuY29tcG9uZW50LnR5cGU7XG4gIHJldHVybiB0eXBlTWV0YS5pc0hvc3QgPyBvLkRZTkFNSUNfVFlQRSA6IG8uaW1wb3J0VHlwZSh0eXBlTWV0YSk7XG59XG5cbmZ1bmN0aW9uIGdldENoYW5nZURldGVjdGlvbk1vZGUodmlldzogQ29tcGlsZVZpZXcpOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIHZhciBtb2RlOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIG1vZGUgPSBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSh2aWV3LmNvbXBvbmVudC5jaGFuZ2VEZXRlY3Rpb24pID9cbiAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzIDpcbiAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTtcbiAgfSBlbHNlIHtcbiAgICBtb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tBbHdheXM7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59Il19