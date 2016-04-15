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
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, isPresent, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Inject, OpaqueToken, Optional } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { RecursiveAstVisitor } from './expression_parser/ast';
import { Parser } from './expression_parser/parser';
import { HtmlParser } from './html_parser';
import { splitNsName, mergeNsAndName } from './html_tags';
import { ParseError } from './parse_util';
import { MAX_INTERPOLATION_VALUES } from 'angular2/src/core/linker/view_utils';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, VariableAst, templateVisitAll, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst } from './template_ast';
import { CssSelector, SelectorMatcher } from 'angular2/src/compiler/selector';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
import { preparseElement, PreparsedElementType } from './template_preparser';
import { isStyleUrlResolvable } from './style_url_resolver';
import { htmlVisitAll } from './html_ast';
import { splitAtColon } from './util';
import { ProviderElementContext, ProviderViewContext } from './provider_parser';
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = identifier inside [()]
// Group 7 = identifier inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export const TEMPLATE_TRANSFORMS = CONST_EXPR(new OpaqueToken('TemplateTransforms'));
export class TemplateParseError extends ParseError {
    constructor(message, span) {
        super(span, message);
    }
}
export class TemplateParseResult {
    constructor(templateAst, errors) {
        this.templateAst = templateAst;
        this.errors = errors;
    }
}
export let TemplateParser = class TemplateParser {
    constructor(_exprParser, _schemaRegistry, _htmlParser, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this.transforms = transforms;
    }
    parse(component, template, directives, pipes, templateUrl) {
        var result = this.tryParse(component, template, directives, pipes, templateUrl);
        if (isPresent(result.errors)) {
            var errorString = result.errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        return result.templateAst;
    }
    tryParse(component, template, directives, pipes, templateUrl) {
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var errors = htmlAstWithErrors.errors;
        var result;
        if (htmlAstWithErrors.rootNodes.length > 0) {
            var uniqDirectives = removeDuplicates(directives);
            var uniqPipes = removeDuplicates(pipes);
            var providerViewContext = new ProviderViewContext(component, htmlAstWithErrors.rootNodes[0].sourceSpan);
            var parseVisitor = new TemplateParseVisitor(providerViewContext, uniqDirectives, uniqPipes, this._exprParser, this._schemaRegistry);
            result = htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
            errors = errors.concat(parseVisitor.errors).concat(providerViewContext.errors);
        }
        else {
            result = [];
        }
        if (errors.length > 0) {
            return new TemplateParseResult(result, errors);
        }
        if (isPresent(this.transforms)) {
            this.transforms.forEach((transform) => { result = templateVisitAll(transform, result); });
        }
        return new TemplateParseResult(result);
    }
};
TemplateParser = __decorate([
    Injectable(),
    __param(3, Optional()),
    __param(3, Inject(TEMPLATE_TRANSFORMS)), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser, Array])
], TemplateParser);
class TemplateParseVisitor {
    constructor(providerViewContext, directives, pipes, _exprParser, _schemaRegistry) {
        this.providerViewContext = providerViewContext;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new SelectorMatcher();
        ListWrapper.forEachWithIndex(directives, (directive, index) => {
            var selector = CssSelector.parse(directive.selector);
            this.selectorMatcher.addSelectables(selector, directive);
            this.directivesIndex.set(directive, index);
        });
        this.pipesByName = new Map();
        pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
    }
    _reportError(message, sourceSpan) {
        this.errors.push(new TemplateParseError(message, sourceSpan));
    }
    _parseInterpolation(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseInterpolation(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            if (isPresent(ast) &&
                ast.ast.expressions.length > MAX_INTERPOLATION_VALUES) {
                throw new BaseException(`Only support at most ${MAX_INTERPOLATION_VALUES} interpolation values!`);
            }
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseAction(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseBinding(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var bindings = this._exprParser.parseTemplateBindings(value, sourceInfo);
            bindings.forEach((binding) => {
                if (isPresent(binding.expression)) {
                    this._checkPipes(binding.expression, sourceSpan);
                }
            });
            return bindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    _checkPipes(ast, sourceSpan) {
        if (isPresent(ast)) {
            var collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach((pipeName) => {
                if (!this.pipesByName.has(pipeName)) {
                    this._reportError(`The pipe '${pipeName}' could not be found`, sourceSpan);
                }
            });
        }
    }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
        if (isPresent(expr)) {
            return new BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
        }
        else {
            return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
        }
    }
    visitAttr(ast, contex) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitElement(element, parent) {
        var nodeName = element.name;
        var preparsedElement = preparseElement(element);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
            isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            // Skipping stylesheets with either relative urls or package scheme as we already processed
            // them in the StyleCompiler
            return null;
        }
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var vars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateVars = [];
        var templateMatchableAttrs = [];
        var hasInlineTemplates = false;
        var attrs = [];
        element.attrs.forEach(attr => {
            var hasBinding = this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
            var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(this.visitAttr(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var lcElName = splitNsName(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directiveMetas = this._parseDirectives(this.selectorMatcher, elementCssSelector);
        var directiveAsts = this._createDirectiveAsts(element.name, directiveMetas, elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceSpan);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directiveAsts);
        var isViewRoot = parent.isTemplateElement || hasInlineTemplates;
        var providerContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs, element.sourceSpan);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, ElementContext.create(isTemplateElement, directiveAsts, isTemplateElement ? parent.providerContext : providerContext));
        providerContext.afterElement();
        // Override the actual selector when the `ngProjectAs` attribute is provided
        var projectionSelector = isPresent(preparsedElement.projectAs) ?
            CssSelector.parse(preparsedElement.projectAs)[0] :
            elementCssSelector;
        var ngContentIndex = parent.findNgContentIndex(projectionSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            if (isPresent(element.children) && element.children.length > 0) {
                this._reportError(`<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`, element.sourceSpan);
            }
            parsedElement = new NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directiveAsts, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directiveAsts, elementProps, element.sourceSpan);
            parsedElement =
                new EmbeddedTemplateAst(attrs, events, vars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);
            var elementExportAsVars = vars.filter(varAst => varAst.value.length === 0);
            let ngContentIndex = hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
            parsedElement = new ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectiveMetas = this._parseDirectives(this.selectorMatcher, templateCssSelector);
            var templateDirectiveAsts = this._createDirectiveAsts(element.name, templateDirectiveMetas, templateElementOrDirectiveProps, [], element.sourceSpan);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectiveAsts);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectiveAsts, templateElementProps, element.sourceSpan);
            var templateProviderContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, parent.isTemplateElement, templateDirectiveAsts, [], element.sourceSpan);
            templateProviderContext.afterElement();
            parsedElement = new EmbeddedTemplateAst([], [], templateVars, templateProviderContext.transformedDirectiveAsts, templateProviderContext.transformProviders, [parsedElement], ngContentIndex, element.sourceSpan);
        }
        return parsedElement;
    }
    _parseInlineTemplateBinding(attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(binding.key, binding.name, attr.sourceSpan));
                    targetMatchableAttrs.push([binding.key, binding.name]);
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([binding.key, '']);
                    this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    }
    _parseAttr(attr, targetMatchableAttrs, targetProps, targetEvents, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (isPresent(bindParts)) {
            hasBinding = true;
            if (isPresent(bindParts[1])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
            }
            else if (isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[8])) {
                this._parseEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
        }
        return hasBinding;
    }
    _normalizeAttributeName(attrName) {
        return attrName.toLowerCase().startsWith('data-') ? attrName.substring(5) : attrName;
    }
    _parseVariable(identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in variable names`, sourceSpan);
        }
        targetVars.push(new VariableAst(identifier, value, sourceSpan));
    }
    _parseProperty(name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
    }
    _parsePropertyInterpolation(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceSpan);
        if (isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
    }
    _parseAssignmentEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._parseEvent(`${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        var ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new BoundEventAst(eventName, target, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    }
    _parseDirectives(selectorMatcher, elementCssSelector) {
        var directives = [];
        selectorMatcher.match(elementCssSelector, (selector, directive) => { directives.push(directive); });
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also need to make components the first directive in the array
        ListWrapper.sort(directives, (dir1, dir2) => {
            var dir1Comp = dir1.isComponent;
            var dir2Comp = dir2.isComponent;
            if (dir1Comp && !dir2Comp) {
                return -1;
            }
            else if (!dir1Comp && dir2Comp) {
                return 1;
            }
            else {
                return this.directivesIndex.get(dir1) - this.directivesIndex.get(dir2);
            }
        });
        return directives;
    }
    _createDirectiveAsts(elementName, directives, props, possibleExportAsVars, sourceSpan) {
        var matchedVariables = new Set();
        var directiveAsts = directives.map((directive) => {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach((varAst) => {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceSpan);
        });
        possibleExportAsVars.forEach((varAst) => {
            if (varAst.value.length > 0 && !SetWrapper.has(matchedVariables, varAst.name)) {
                this._reportError(`There is no directive with "exportAs" set to "${varAst.value}"`, varAst.sourceSpan);
            }
        });
        return directiveAsts;
    }
    _createDirectiveHostPropertyAsts(elementName, hostProps, sourceSpan, targetPropertyAsts) {
        if (isPresent(hostProps)) {
            StringMapWrapper.forEach(hostProps, (expression, propName) => {
                var exprAst = this._parseBinding(expression, sourceSpan);
                targetPropertyAsts.push(this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
            });
        }
    }
    _createDirectiveHostEventAsts(hostListeners, sourceSpan, targetEventAsts) {
        if (isPresent(hostListeners)) {
            StringMapWrapper.forEach(hostListeners, (expression, propName) => {
                this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
            });
        }
    }
    _createDirectivePropertyAsts(directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(boundProp => {
                var prevValue = boundPropsByName.get(boundProp.name);
                if (isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName.set(boundProp.name, boundProp);
                }
            });
            StringMapWrapper.forEach(directiveProperties, (elProp, dirProp) => {
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                }
            });
        }
    }
    _createElementPropertyAsts(elementName, props, directives) {
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach((directive) => {
            directive.inputs.forEach((prop) => {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach((prop) => {
            if (!prop.isLiteral && isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceSpan));
            }
        });
        return boundElementProps;
    }
    _createElementPropertyAst(elementName, name, ast, sourceSpan) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = name.split(PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property`, sourceSpan);
            }
        }
        else {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                let nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    let ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    let name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = PropertyBindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Class;
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Style;
            }
            else {
                this._reportError(`Invalid property name '${name}'`, sourceSpan);
                bindingType = null;
            }
        }
        return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceSpan);
    }
    _findComponentDirectiveNames(directives) {
        var componentTypeNames = [];
        directives.forEach(directive => {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    }
    _assertOnlyOneComponent(directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError(`More than one component: ${componentTypeNames.join(',')}`, sourceSpan);
        }
    }
    _assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError(`Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
        }
        elementProps.forEach(prop => {
            this._reportError(`Property binding ${prop.name} not used by any directive on an embedded template`, sourceSpan);
        });
    }
    _assertAllEventsPublishedByDirectives(directives, events) {
        var allDirectiveEvents = new Set();
        directives.forEach(directive => {
            StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) => { allDirectiveEvents.add(eventName); });
        });
        events.forEach(event => {
            if (isPresent(event.target) || !SetWrapper.has(allDirectiveEvents, event.name)) {
                this._reportError(`Event binding ${event.fullName} not emitted by any directive on an embedded template`, event.sourceSpan);
            }
        });
    }
}
class NonBindableVisitor {
    visitElement(ast, parent) {
        var preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(attrAst => [attrAst.name, attrAst.value]);
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = parent.findNgContentIndex(selector);
        var children = htmlVisitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], [], children, ngContentIndex, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
}
export function splitClasses(classAttrValue) {
    return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
class ElementContext {
    constructor(isTemplateElement, _ngContentIndexMatcher, _wildcardNgContentIndex, providerContext) {
        this.isTemplateElement = isTemplateElement;
        this._ngContentIndexMatcher = _ngContentIndexMatcher;
        this._wildcardNgContentIndex = _wildcardNgContentIndex;
        this.providerContext = providerContext;
    }
    static create(isTemplateElement, directives, providerContext) {
        var matcher = new SelectorMatcher();
        var wildcardNgContentIndex = null;
        if (directives.length > 0 && directives[0].directive.isComponent) {
            var ngContentSelectors = directives[0].directive.template.ngContentSelectors;
            for (var i = 0; i < ngContentSelectors.length; i++) {
                var selector = ngContentSelectors[i];
                if (StringWrapper.equals(selector, '*')) {
                    wildcardNgContentIndex = i;
                }
                else {
                    matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
                }
            }
        }
        return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
    }
    findNgContentIndex(selector) {
        var ngContentIndices = [];
        this._ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
        ListWrapper.sort(ngContentIndices);
        if (isPresent(this._wildcardNgContentIndex)) {
            ngContentIndices.push(this._wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    }
}
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new CssSelector();
    let elNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < matchableAttrs.length; i++) {
        let attrName = matchableAttrs[i][0];
        let attrNameNoNs = splitNsName(attrName)[1];
        let attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    }
    return cssSelector;
}
var EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new SelectorMatcher(), null, null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
export class PipeCollector extends RecursiveAstVisitor {
    constructor(...args) {
        super(...args);
        this.pipes = new Set();
    }
    visitPipe(ast, context) {
        this.pipes.add(ast.name);
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
}
function removeDuplicates(items) {
    let res = [];
    items.forEach(item => {
        let hasMatch = res.filter(r => r.type.name == item.type.name && r.type.moduleUrl == item.type.moduleUrl &&
            r.type.runtime == item.type.runtime)
            .length > 0;
        if (!hasMatch) {
            res.push(item);
        }
    });
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1sREhXOEExRy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsVUFBVSxFQUVYLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFVLE1BQU0sMEJBQTBCO09BQzNGLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNoRSxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUtMLG1CQUFtQixFQUVwQixNQUFNLHlCQUF5QjtPQUN6QixFQUFDLE1BQU0sRUFBQyxNQUFNLDRCQUE0QjtPQVUxQyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxXQUFXLEVBQUUsY0FBYyxFQUFDLE1BQU0sYUFBYTtPQUNoRCxFQUFrQixVQUFVLEVBQWdCLE1BQU0sY0FBYztPQUNoRSxFQUFDLHdCQUF3QixFQUFDLE1BQU0scUNBQXFDO09BRXJFLEVBQ0wsVUFBVSxFQUNWLHVCQUF1QixFQUN2QixhQUFhLEVBQ2IsV0FBVyxFQUdYLGdCQUFnQixFQUNoQixPQUFPLEVBQ1AsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixPQUFPLEVBQ1AsWUFBWSxFQUNaLG1CQUFtQixFQUNuQixZQUFZLEVBQ1oseUJBQXlCLEVBRzFCLE1BQU0sZ0JBQWdCO09BQ2hCLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxNQUFNLGdDQUFnQztPQUVwRSxFQUFDLHFCQUFxQixFQUFDLE1BQU0sc0RBQXNEO09BQ25GLEVBQUMsZUFBZSxFQUFvQixvQkFBb0IsRUFBQyxNQUFNLHNCQUFzQjtPQUVyRixFQUFDLG9CQUFvQixFQUFDLE1BQU0sc0JBQXNCO09BRWxELEVBT0wsWUFBWSxFQUNiLE1BQU0sWUFBWTtPQUVaLEVBQUMsWUFBWSxFQUFDLE1BQU0sUUFBUTtPQUU1QixFQUFDLHNCQUFzQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CO0FBRTdFLG9CQUFvQjtBQUNwQiwwQkFBMEI7QUFDMUIsa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0Qiw2REFBNkQ7QUFDN0QsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsSUFBSSxnQkFBZ0IsR0FDaEIsZ0dBQWdHLENBQUM7QUFFckcsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7QUFDcEMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDO0FBQ2pDLE1BQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0FBQ2pDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUUzQixJQUFJLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztBQUNuQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBRTdCLElBQUksaUJBQWlCLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVsRDs7Ozs7O0dBTUc7QUFDSCxPQUFPLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztBQUVyRix3Q0FBd0MsVUFBVTtJQUNoRCxZQUFZLE9BQWUsRUFBRSxJQUFxQjtRQUFJLE1BQU0sSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQ7SUFDRSxZQUFtQixXQUEyQixFQUFTLE1BQXFCO1FBQXpELGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUFTLFdBQU0sR0FBTixNQUFNLENBQWU7SUFBRyxDQUFDO0FBQ2xGLENBQUM7QUFHRDtJQUNFLFlBQW9CLFdBQW1CLEVBQVUsZUFBc0MsRUFDbkUsV0FBdUIsRUFDaUIsVUFBZ0M7UUFGeEUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBdUI7UUFDbkUsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFDaUIsZUFBVSxHQUFWLFVBQVUsQ0FBc0I7SUFBRyxDQUFDO0lBRWhHLEtBQUssQ0FBQyxTQUFtQyxFQUFFLFFBQWdCLEVBQ3JELFVBQXNDLEVBQUUsS0FBNEIsRUFDcEUsV0FBbUI7UUFDdkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEYsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTSxJQUFJLGFBQWEsQ0FBQywyQkFBMkIsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVELFFBQVEsQ0FBQyxTQUFtQyxFQUFFLFFBQWdCLEVBQ3JELFVBQXNDLEVBQUUsS0FBNEIsRUFDcEUsV0FBbUI7UUFDMUIsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEUsSUFBSSxNQUFNLEdBQWlCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztRQUNwRCxJQUFJLE1BQU0sQ0FBQztRQUNYLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLGNBQWMsR0FBK0IsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUUsSUFBSSxTQUFTLEdBQTBCLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9ELElBQUksbUJBQW1CLEdBQ25CLElBQUksbUJBQW1CLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRixJQUFJLFlBQVksR0FBRyxJQUFJLG9CQUFvQixDQUFDLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXBGLE1BQU0sR0FBRyxZQUFZLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FDbkIsQ0FBQyxTQUE2QixPQUFPLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztBQUNILENBQUM7QUE3Q0Q7SUFBQyxVQUFVLEVBQUU7ZUFJRSxRQUFRLEVBQUU7ZUFBRSxNQUFNLENBQUMsbUJBQW1CLENBQUM7O2tCQUp6QztBQStDYjtJQU9FLFlBQW1CLG1CQUF3QyxFQUMvQyxVQUFzQyxFQUFFLEtBQTRCLEVBQzVELFdBQW1CLEVBQVUsZUFBc0M7UUFGcEUsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUV2QyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUF1QjtRQVB2RixXQUFNLEdBQXlCLEVBQUUsQ0FBQztRQUNsQyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFvQyxDQUFDO1FBQzlELG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBTXpCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUM3QyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUNWLENBQUMsU0FBbUMsRUFBRSxLQUFhO1lBQ2pELElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQUMxRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVPLFlBQVksQ0FBQyxPQUFlLEVBQUUsVUFBMkI7UUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRU8sbUJBQW1CLENBQUMsS0FBYSxFQUFFLFVBQTJCO1FBQ3BFLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDO1lBQ0gsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFDRSxHQUFHLENBQUMsR0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLElBQUksYUFBYSxDQUNuQix3QkFBd0Isd0JBQXdCLHdCQUF3QixDQUFDLENBQUM7WUFDaEYsQ0FBQztZQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDYixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNILENBQUM7SUFFTyxZQUFZLENBQUMsS0FBYSxFQUFFLFVBQTJCO1FBQzdELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDO1lBQ0gsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDYixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNILENBQUM7SUFFTyxhQUFhLENBQUMsS0FBYSxFQUFFLFVBQTJCO1FBQzlELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDO1lBQ0gsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDYixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNILENBQUM7SUFFTyxzQkFBc0IsQ0FBQyxLQUFhLEVBQUUsVUFBMkI7UUFDdkUsSUFBSSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUM7WUFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6RSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTztnQkFDdkIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNsQixDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNILENBQUM7SUFFTyxXQUFXLENBQUMsR0FBa0IsRUFBRSxVQUEyQjtRQUNqRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQUksU0FBUyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7WUFDcEMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVE7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsUUFBUSxzQkFBc0IsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDN0UsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLENBQUMsR0FBZ0IsRUFBRSxNQUFzQjtRQUNoRCxJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNsRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFnQixFQUFFLE1BQVc7UUFDckMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELFlBQVksQ0FBQyxHQUFtQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVyRSxZQUFZLENBQUMsT0FBdUIsRUFBRSxNQUFzQjtRQUMxRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzVCLElBQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksS0FBSyxvQkFBb0IsQ0FBQyxNQUFNO1lBQ3JELGdCQUFnQixDQUFDLElBQUksS0FBSyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pELHlDQUF5QztZQUN6QyxnREFBZ0Q7WUFDaEQsdUJBQXVCO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLG9CQUFvQixDQUFDLFVBQVU7WUFDekQsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELDJGQUEyRjtZQUMzRiw0QkFBNEI7WUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLGNBQWMsR0FBZSxFQUFFLENBQUM7UUFDcEMsSUFBSSx1QkFBdUIsR0FBc0MsRUFBRSxDQUFDO1FBQ3BFLElBQUksSUFBSSxHQUFrQixFQUFFLENBQUM7UUFDN0IsSUFBSSxNQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUVqQyxJQUFJLCtCQUErQixHQUFzQyxFQUFFLENBQUM7UUFDNUUsSUFBSSxZQUFZLEdBQWtCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLHNCQUFzQixHQUFlLEVBQUUsQ0FBQztRQUM1QyxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFZixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3hCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUYsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQ3JELElBQUksRUFBRSxzQkFBc0IsRUFBRSwrQkFBK0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNqRixFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDdkMsOERBQThEO2dCQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLGtCQUFrQixHQUFHLElBQUksQ0FBQztZQUM1QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxpQkFBaUIsR0FBRyxRQUFRLElBQUksZ0JBQWdCLENBQUM7UUFDckQsSUFBSSxrQkFBa0IsR0FBRyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNyRixJQUFJLGFBQWEsR0FDYixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsdUJBQXVCLEVBQ3JELGlCQUFpQixHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pGLElBQUksWUFBWSxHQUNaLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzFGLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsSUFBSSxrQkFBa0IsQ0FBQztRQUNoRSxJQUFJLGVBQWUsR0FDZixJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLFVBQVUsRUFDNUQsYUFBYSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekUsSUFBSSxRQUFRLEdBQUcsWUFBWSxDQUN2QixnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsb0JBQW9CLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQzVFLGNBQWMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUNoQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDekYsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9CLDRFQUE0RTtRQUM1RSxJQUFJLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7WUFDakMsV0FBVyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsa0JBQWtCLENBQUM7UUFDaEQsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbkUsSUFBSSxhQUFhLENBQUM7UUFFbEIsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDOUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsWUFBWSxDQUNiLHNHQUFzRyxFQUN0RyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELGFBQWEsR0FBRyxJQUFJLFlBQVksQ0FDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLGtCQUFrQixHQUFHLElBQUksR0FBRyxjQUFjLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLCtDQUErQyxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQzNCLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUV6RSxhQUFhO2dCQUNULElBQUksbUJBQW1CLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLHdCQUF3QixFQUM3RCxlQUFlLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUM1QyxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRSxJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksY0FBYyxHQUNkLGtCQUFrQixHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUU5RSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQzFCLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFDMUQsZUFBZSxDQUFDLHdCQUF3QixFQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQ3RGLGtCQUFrQixHQUFHLElBQUksR0FBRyxjQUFjLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxtQkFBbUIsR0FBRyx3QkFBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQzdGLElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM5RixJQUFJLHFCQUFxQixHQUNyQixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFDcEMsK0JBQStCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2RixJQUFJLG9CQUFvQixHQUE4QixJQUFJLENBQUMsMEJBQTBCLENBQ2pGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsK0JBQStCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsK0NBQStDLENBQ2hELHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyRSxJQUFJLHVCQUF1QixHQUFHLElBQUksc0JBQXNCLENBQ3BELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsRUFDMUUscUJBQXFCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUV2QyxhQUFhLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFDcEIsdUJBQXVCLENBQUMsd0JBQXdCLEVBQ2hELHVCQUF1QixDQUFDLGtCQUFrQixFQUMxQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0YsQ0FBQztRQUNELE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVPLDJCQUEyQixDQUFDLElBQWlCLEVBQUUsb0JBQWdDLEVBQ25ELFdBQThDLEVBQzlDLFVBQXlCO1FBQzNELElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQztZQUMvQixzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBRSxrQkFBa0I7WUFDL0Usc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25GLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQzdFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQ2hELG9CQUFvQixFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzFFLENBQUM7WUFDSCxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVPLFVBQVUsQ0FBQyxJQUFpQixFQUFFLG9CQUFnQyxFQUNuRCxXQUE4QyxFQUFFLFlBQTZCLEVBQzdFLFVBQXlCO1FBQzFDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMzQixJQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JFLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDbEIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQzlELFdBQVcsQ0FBQyxDQUFDO1lBRW5DLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUNMLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUxRSxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUM5RCxZQUFZLENBQUMsQ0FBQztZQUVqQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUM5RCxXQUFXLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFDOUQsWUFBWSxDQUFDLENBQUM7WUFFM0MsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFDOUQsV0FBVyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQzlELFlBQVksQ0FBQyxDQUFDO1lBRTNDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQzlELFdBQVcsQ0FBQyxDQUFDO1lBRW5DLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQzlELFlBQVksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixVQUFVLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFDcEMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxRQUFnQjtRQUM5QyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUN2RixDQUFDO0lBRU8sY0FBYyxDQUFDLFVBQWtCLEVBQUUsS0FBYSxFQUFFLFVBQTJCLEVBQzlELFVBQXlCO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsc0NBQXNDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTyxjQUFjLENBQUMsSUFBWSxFQUFFLFVBQWtCLEVBQUUsVUFBMkIsRUFDN0Qsb0JBQWdDLEVBQ2hDLFdBQThDO1FBQ25FLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUM1RCxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU8sMkJBQTJCLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxVQUEyQixFQUN4RCxvQkFBZ0MsRUFDaEMsV0FBOEM7UUFDaEYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8saUJBQWlCLENBQUMsSUFBWSxFQUFFLEdBQWtCLEVBQUUsVUFBMkIsRUFDN0Qsb0JBQWdDLEVBQ2hDLFdBQThDO1FBQ3RFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5QyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksK0JBQStCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRU8scUJBQXFCLENBQUMsSUFBWSxFQUFFLFVBQWtCLEVBQUUsVUFBMkIsRUFDN0Qsb0JBQWdDLEVBQUUsWUFBNkI7UUFDM0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUcsVUFBVSxTQUFTLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUN6RSxZQUFZLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU8sV0FBVyxDQUFDLElBQVksRUFBRSxVQUFrQixFQUFFLFVBQTJCLEVBQzdELG9CQUFnQyxFQUFFLFlBQTZCO1FBQ2pGLG1DQUFtQztRQUNuQyxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNwRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLG1EQUFtRDtRQUNuRCxvREFBb0Q7SUFDdEQsQ0FBQztJQUVPLGlCQUFpQixDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsVUFBMkIsRUFDeEQsV0FBOEM7UUFDdEUsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUErQixDQUNoRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVPLGdCQUFnQixDQUFDLGVBQWdDLEVBQ2hDLGtCQUErQjtRQUN0RCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDcEIsZUFBZSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFDbEIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRiw0RUFBNEU7UUFDNUUsdUNBQXVDO1FBQ3ZDLGdFQUFnRTtRQUNoRSxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDVixDQUFDLElBQThCLEVBQUUsSUFBOEI7WUFDN0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNoQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNaLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekUsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFdBQW1CLEVBQUUsVUFBc0MsRUFDM0QsS0FBd0MsRUFDeEMsb0JBQW1DLEVBQ25DLFVBQTJCO1FBQ3RELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN6QyxJQUFJLGFBQWEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBbUM7WUFDckUsSUFBSSxjQUFjLEdBQThCLEVBQUUsQ0FBQztZQUNuRCxJQUFJLFVBQVUsR0FBb0IsRUFBRSxDQUFDO1lBQ3JDLElBQUksbUJBQW1CLEdBQWdDLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsZ0NBQWdDLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUNqRCxjQUFjLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsNkJBQTZCLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDaEYsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU07Z0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBQ3BELENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQzFELFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNILG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU07WUFDbEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLENBQUMsWUFBWSxDQUFDLGlEQUFpRCxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxnQ0FBZ0MsQ0FBQyxXQUFtQixFQUFFLFNBQWtDLEVBQ3ZELFVBQTJCLEVBQzNCLGtCQUE2QztRQUNwRixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxVQUFrQixFQUFFLFFBQWdCO2dCQUN2RSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDekQsa0JBQWtCLENBQUMsSUFBSSxDQUNuQixJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNsRixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRU8sNkJBQTZCLENBQUMsYUFBc0MsRUFDdEMsVUFBMkIsRUFDM0IsZUFBZ0M7UUFDcEUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsVUFBa0IsRUFBRSxRQUFnQjtnQkFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVPLDRCQUE0QixDQUFDLG1CQUE0QyxFQUM1QyxVQUE2QyxFQUM3Qyx5QkFBc0Q7UUFDekYsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQTJDLENBQUM7WUFDMUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTO2dCQUMxQixJQUFJLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLGtFQUFrRTtvQkFDbEUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE1BQWMsRUFBRSxPQUFlO2dCQUM1RSxJQUFJLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRTdDLDRGQUE0RjtnQkFDNUYsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekIseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQXlCLENBQ3hELE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRU8sMEJBQTBCLENBQUMsV0FBbUIsRUFBRSxLQUF3QyxFQUM3RCxVQUEwQjtRQUMzRCxJQUFJLGlCQUFpQixHQUE4QixFQUFFLENBQUM7UUFDdEQsSUFBSSx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztRQUM1RSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBdUI7WUFDekMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUErQjtnQkFDdkQsd0JBQXdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFxQztZQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQ3RCLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDM0YsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxXQUFtQixFQUFFLElBQVksRUFBRSxHQUFRLEVBQzNDLFVBQTJCO1FBQzNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLFdBQVcsQ0FBQztRQUNoQixJQUFJLGlCQUFpQixDQUFDO1FBQ3RCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLENBQUMsWUFBWSxDQUNiLGtCQUFrQixpQkFBaUIsMENBQTBDLEVBQzdFLFVBQVUsQ0FBQyxDQUFDO1lBQ2xCLENBQUM7UUFDSCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksY0FBYyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEQsRUFBRSxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxFQUFFLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDM0QsaUJBQWlCLEdBQUcsY0FBYyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztnQkFDRCxXQUFXLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDO1lBQzlDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsV0FBVyxHQUFHLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUMxQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDMUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixXQUFXLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBQzFDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixJQUFJLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakUsV0FBVyxHQUFHLElBQUksQ0FBQztZQUNyQixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFHTyw0QkFBNEIsQ0FBQyxVQUEwQjtRQUM3RCxJQUFJLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztRQUN0QyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVM7WUFDMUIsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztJQUM1QixDQUFDO0lBRU8sdUJBQXVCLENBQUMsVUFBMEIsRUFBRSxVQUEyQjtRQUNyRixJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsWUFBWSxDQUFDLDRCQUE0QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM1RixDQUFDO0lBQ0gsQ0FBQztJQUVPLCtDQUErQyxDQUFDLFVBQTBCLEVBQzFCLFlBQXVDLEVBQ3ZDLFVBQTJCO1FBQ2pGLElBQUksa0JBQWtCLEdBQWEsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pGLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsdUNBQXVDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUNyRSxVQUFVLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQ2Isb0JBQW9CLElBQUksQ0FBQyxJQUFJLG9EQUFvRCxFQUNqRixVQUFVLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxxQ0FBcUMsQ0FBQyxVQUEwQixFQUMxQixNQUF1QjtRQUNuRSxJQUFJLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDM0MsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTO1lBQzFCLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFDM0IsQ0FBQyxTQUFpQixFQUFFLENBQUMsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSztZQUNsQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsWUFBWSxDQUNiLGlCQUFpQixLQUFLLENBQUMsUUFBUSx1REFBdUQsRUFDdEYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBRUQ7SUFDRSxZQUFZLENBQUMsR0FBbUIsRUFBRSxNQUFzQjtRQUN0RCxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssb0JBQW9CLENBQUMsTUFBTTtZQUNyRCxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssb0JBQW9CLENBQUMsS0FBSztZQUNwRCxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM5RCx5Q0FBeUM7WUFDekMsZ0VBQWdFO1lBQ2hFLHVCQUF1QjtZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksaUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLFFBQVEsR0FBRyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDckUsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUNyRSxjQUFjLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDRCxZQUFZLENBQUMsR0FBbUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckUsU0FBUyxDQUFDLEdBQWdCLEVBQUUsT0FBWTtRQUN0QyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBQ0QsU0FBUyxDQUFDLEdBQWdCLEVBQUUsTUFBc0I7UUFDaEQsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbEUsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRSxDQUFDO0FBQ0gsQ0FBQztBQUVEO0lBQ0UsWUFBbUIsSUFBWSxFQUFTLFVBQWUsRUFBUyxTQUFrQixFQUMvRCxVQUEyQjtRQUQzQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBSztRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVM7UUFDL0QsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFBRyxDQUFDO0FBQ3BELENBQUM7QUFFRCw2QkFBNkIsY0FBc0I7SUFDakQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRDtJQWtCRSxZQUFtQixpQkFBMEIsRUFBVSxzQkFBdUMsRUFDMUUsdUJBQStCLEVBQ2hDLGVBQXVDO1FBRnZDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUFVLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBaUI7UUFDMUUsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFRO1FBQ2hDLG9CQUFlLEdBQWYsZUFBZSxDQUF3QjtJQUFHLENBQUM7SUFuQjlELE9BQU8sTUFBTSxDQUFDLGlCQUEwQixFQUFFLFVBQTBCLEVBQ3RELGVBQXVDO1FBQ25ELElBQUksT0FBTyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDcEMsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksa0JBQWtCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUM7WUFDN0UsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsSUFBSSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFLRCxrQkFBa0IsQ0FBQyxRQUFxQjtRQUN0QyxJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUM3QixRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBYyxPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xFLENBQUM7QUFDSCxDQUFDO0FBRUQsa0NBQWtDLFdBQW1CLEVBQUUsY0FBMEI7SUFDL0UsSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUNwQyxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0MsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVuQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMvQyxJQUFJLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyQyxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBRUQsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEYsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFHcEQsbUNBQW1DLG1CQUFtQjtJQUF0RDtRQUFtQyxlQUFtQjtRQUNwRCxVQUFLLEdBQWdCLElBQUksR0FBRyxFQUFVLENBQUM7SUFPekMsQ0FBQztJQU5DLFNBQVMsQ0FBQyxHQUFnQixFQUFFLE9BQVk7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCwwQkFBMEIsS0FBZ0M7SUFDeEQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJO1FBQ2hCLElBQUksUUFBUSxHQUNSLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUN4RSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUMvQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNkLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgU2V0V3JhcHBlcixcbiAgTWFwV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtSZWdFeHBXcmFwcGVyLCBpc1ByZXNlbnQsIFN0cmluZ1dyYXBwZXIsIGlzQmxhbmssIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW4sIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIEFTVCxcbiAgSW50ZXJwb2xhdGlvbixcbiAgQVNUV2l0aFNvdXJjZSxcbiAgVGVtcGxhdGVCaW5kaW5nLFxuICBSZWN1cnNpdmVBc3RWaXNpdG9yLFxuICBCaW5kaW5nUGlwZVxufSBmcm9tICcuL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnLi9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtcbiAgQ29tcGlsZVRva2VuTWFwLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVQaXBlTWV0YWRhdGEsXG4gIENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlLFxuICBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSxcbiAgQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGFcbn0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi9odG1sX3BhcnNlcic7XG5pbXBvcnQge3NwbGl0TnNOYW1lLCBtZXJnZU5zQW5kTmFtZX0gZnJvbSAnLi9odG1sX3RhZ3MnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3IsIFBhcnNlTG9jYXRpb259IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge01BWF9JTlRFUlBPTEFUSU9OX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdXRpbHMnO1xuXG5pbXBvcnQge1xuICBFbGVtZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgVmFyaWFibGVBc3QsXG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIHRlbXBsYXRlVmlzaXRBbGwsXG4gIFRleHRBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgQXR0ckFzdCxcbiAgTmdDb250ZW50QXN0LFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsXG4gIFByb3ZpZGVyQXN0LFxuICBQcm92aWRlckFzdFR5cGVcbn0gZnJvbSAnLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2VsZWN0b3JNYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge3ByZXBhcnNlRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudFR5cGV9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuaW1wb3J0IHtpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuXG5pbXBvcnQge1xuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEFzdCxcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgSHRtbENvbW1lbnRBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICcuL2h0bWxfYXN0JztcblxuaW1wb3J0IHtzcGxpdEF0Q29sb259IGZyb20gJy4vdXRpbCc7XG5cbmltcG9ydCB7UHJvdmlkZXJFbGVtZW50Q29udGV4dCwgUHJvdmlkZXJWaWV3Q29udGV4dH0gZnJvbSAnLi9wcm92aWRlcl9wYXJzZXInO1xuXG4vLyBHcm91cCAxID0gXCJiaW5kLVwiXG4vLyBHcm91cCAyID0gXCJ2YXItXCIgb3IgXCIjXCJcbi8vIEdyb3VwIDMgPSBcIm9uLVwiXG4vLyBHcm91cCA0ID0gXCJiaW5kb24tXCJcbi8vIEdyb3VwIDUgPSB0aGUgaWRlbnRpZmllciBhZnRlciBcImJpbmQtXCIsIFwidmFyLS8jXCIsIG9yIFwib24tXCJcbi8vIEdyb3VwIDYgPSBpZGVudGlmaWVyIGluc2lkZSBbKCldXG4vLyBHcm91cCA3ID0gaWRlbnRpZmllciBpbnNpZGUgW11cbi8vIEdyb3VwIDggPSBpZGVudGlmaWVyIGluc2lkZSAoKVxudmFyIEJJTkRfTkFNRV9SRUdFWFAgPVxuICAgIC9eKD86KD86KD86KGJpbmQtKXwodmFyLXwjKXwob24tKXwoYmluZG9uLSkpKC4rKSl8XFxbXFwoKFteXFwpXSspXFwpXFxdfFxcWyhbXlxcXV0rKVxcXXxcXCgoW15cXCldKylcXCkpJC9nO1xuXG5jb25zdCBURU1QTEFURV9FTEVNRU5UID0gJ3RlbXBsYXRlJztcbmNvbnN0IFRFTVBMQVRFX0FUVFIgPSAndGVtcGxhdGUnO1xuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5jb25zdCBDTEFTU19BVFRSID0gJ2NsYXNzJztcblxudmFyIFBST1BFUlRZX1BBUlRTX1NFUEFSQVRPUiA9ICcuJztcbmNvbnN0IEFUVFJJQlVURV9QUkVGSVggPSAnYXR0cic7XG5jb25zdCBDTEFTU19QUkVGSVggPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfUFJFRklYID0gJ3N0eWxlJztcblxudmFyIFRFWFRfQ1NTX1NFTEVDVE9SID0gQ3NzU2VsZWN0b3IucGFyc2UoJyonKVswXTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBhcnJheSBvZiB7QGxpbmsgVGVtcGxhdGVBc3RWaXNpdG9yfXMgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHRyYW5zZm9ybVxuICogcGFyc2VkIHRlbXBsYXRlcyBiZWZvcmUgY29tcGlsYXRpb24gaXMgaW52b2tlZCwgYWxsb3dpbmcgY3VzdG9tIGV4cHJlc3Npb24gc3ludGF4XG4gKiBhbmQgb3RoZXIgYWR2YW5jZWQgdHJhbnNmb3JtYXRpb25zLlxuICpcbiAqIFRoaXMgaXMgY3VycmVudGx5IGFuIGludGVybmFsLW9ubHkgZmVhdHVyZSBhbmQgbm90IG1lYW50IGZvciBnZW5lcmFsIHVzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1RSQU5TRk9STVMgPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignVGVtcGxhdGVUcmFuc2Zvcm1zJykpO1xuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7IHN1cGVyKHNwYW4sIG1lc3NhZ2UpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlQXN0PzogVGVtcGxhdGVBc3RbXSwgcHVibGljIGVycm9ycz86IFBhcnNlRXJyb3JbXSkge31cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZXhwclBhcnNlcjogUGFyc2VyLCBwcml2YXRlIF9zY2hlbWFSZWdpc3RyeTogRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LFxuICAgICAgICAgICAgICBwcml2YXRlIF9odG1sUGFyc2VyOiBIdG1sUGFyc2VyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFRFTVBMQVRFX1RSQU5TRk9STVMpIHB1YmxpYyB0cmFuc2Zvcm1zOiBUZW1wbGF0ZUFzdFZpc2l0b3JbXSkge31cblxuICBwYXJzZShjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgdGVtcGxhdGU6IHN0cmluZyxcbiAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcpOiBUZW1wbGF0ZUFzdFtdIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy50cnlQYXJzZShjb21wb25lbnQsIHRlbXBsYXRlLCBkaXJlY3RpdmVzLCBwaXBlcywgdGVtcGxhdGVVcmwpO1xuICAgIGlmIChpc1ByZXNlbnQocmVzdWx0LmVycm9ycykpIHtcbiAgICAgIHZhciBlcnJvclN0cmluZyA9IHJlc3VsdC5lcnJvcnMuam9pbignXFxuJyk7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVGVtcGxhdGUgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JTdHJpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQudGVtcGxhdGVBc3Q7XG4gIH1cblxuICB0cnlQYXJzZShjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgdGVtcGxhdGU6IHN0cmluZyxcbiAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcpOiBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgICB2YXIgaHRtbEFzdFdpdGhFcnJvcnMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCk7XG4gICAgdmFyIGVycm9yczogUGFyc2VFcnJvcltdID0gaHRtbEFzdFdpdGhFcnJvcnMuZXJyb3JzO1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdW5pcURpcmVjdGl2ZXMgPSA8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10+cmVtb3ZlRHVwbGljYXRlcyhkaXJlY3RpdmVzKTtcbiAgICAgIHZhciB1bmlxUGlwZXMgPSA8Q29tcGlsZVBpcGVNZXRhZGF0YVtdPnJlbW92ZUR1cGxpY2F0ZXMocGlwZXMpO1xuICAgICAgdmFyIHByb3ZpZGVyVmlld0NvbnRleHQgPVxuICAgICAgICAgIG5ldyBQcm92aWRlclZpZXdDb250ZXh0KGNvbXBvbmVudCwgaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzWzBdLnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIHBhcnNlVmlzaXRvciA9IG5ldyBUZW1wbGF0ZVBhcnNlVmlzaXRvcihwcm92aWRlclZpZXdDb250ZXh0LCB1bmlxRGlyZWN0aXZlcywgdW5pcVBpcGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9leHByUGFyc2VyLCB0aGlzLl9zY2hlbWFSZWdpc3RyeSk7XG5cbiAgICAgIHJlc3VsdCA9IGh0bWxWaXNpdEFsbChwYXJzZVZpc2l0b3IsIGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2RlcywgRU1QVFlfRUxFTUVOVF9DT05URVhUKTtcbiAgICAgIGVycm9ycyA9IGVycm9ycy5jb25jYXQocGFyc2VWaXNpdG9yLmVycm9ycykuY29uY2F0KHByb3ZpZGVyVmlld0NvbnRleHQuZXJyb3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgfVxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZVBhcnNlUmVzdWx0KHJlc3VsdCwgZXJyb3JzKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnRyYW5zZm9ybXMpKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaChcbiAgICAgICAgICAodHJhbnNmb3JtOiBUZW1wbGF0ZUFzdFZpc2l0b3IpID0+IHsgcmVzdWx0ID0gdGVtcGxhdGVWaXNpdEFsbCh0cmFuc2Zvcm0sIHJlc3VsdCk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlbXBsYXRlUGFyc2VSZXN1bHQocmVzdWx0KTtcbiAgfVxufVxuXG5jbGFzcyBUZW1wbGF0ZVBhcnNlVmlzaXRvciBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgc2VsZWN0b3JNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXI7XG4gIGVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10gPSBbXTtcbiAgZGlyZWN0aXZlc0luZGV4ID0gbmV3IE1hcDxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIG51bWJlcj4oKTtcbiAgbmdDb250ZW50Q291bnQ6IG51bWJlciA9IDA7XG4gIHBpcGVzQnlOYW1lOiBNYXA8c3RyaW5nLCBDb21waWxlUGlwZU1ldGFkYXRhPjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdmlkZXJWaWV3Q29udGV4dDogUHJvdmlkZXJWaWV3Q29udGV4dCxcbiAgICAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSkge1xuICAgIHRoaXMuc2VsZWN0b3JNYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0b3IgPSBDc3NTZWxlY3Rvci5wYXJzZShkaXJlY3RpdmUuc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yTWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhzZWxlY3RvciwgZGlyZWN0aXZlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzSW5kZXguc2V0KGRpcmVjdGl2ZSwgaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgdGhpcy5waXBlc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBDb21waWxlUGlwZU1ldGFkYXRhPigpO1xuICAgIHBpcGVzLmZvckVhY2gocGlwZSA9PiB0aGlzLnBpcGVzQnlOYW1lLnNldChwaXBlLm5hbWUsIHBpcGUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKG1lc3NhZ2U6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdGhpcy5lcnJvcnMucHVzaChuZXcgVGVtcGxhdGVQYXJzZUVycm9yKG1lc3NhZ2UsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYXN0KSAmJlxuICAgICAgICAgICg8SW50ZXJwb2xhdGlvbj5hc3QuYXN0KS5leHByZXNzaW9ucy5sZW5ndGggPiBNQVhfSU5URVJQT0xBVElPTl9WQUxVRVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgT25seSBzdXBwb3J0IGF0IG1vc3QgJHtNQVhfSU5URVJQT0xBVElPTl9WQUxVRVN9IGludGVycG9sYXRpb24gdmFsdWVzIWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBY3Rpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlQWN0aW9uKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQmluZGluZyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VCaW5kaW5nKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBUZW1wbGF0ZUJpbmRpbmdbXSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBiaW5kaW5ncyA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIGJpbmRpbmdzLmZvckVhY2goKGJpbmRpbmcpID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChiaW5kaW5nLmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgdGhpcy5fY2hlY2tQaXBlcyhiaW5kaW5nLmV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBiaW5kaW5ncztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrUGlwZXMoYXN0OiBBU1RXaXRoU291cmNlLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBpZiAoaXNQcmVzZW50KGFzdCkpIHtcbiAgICAgIHZhciBjb2xsZWN0b3IgPSBuZXcgUGlwZUNvbGxlY3RvcigpO1xuICAgICAgYXN0LnZpc2l0KGNvbGxlY3Rvcik7XG4gICAgICBjb2xsZWN0b3IucGlwZXMuZm9yRWFjaCgocGlwZU5hbWUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnBpcGVzQnlOYW1lLmhhcyhwaXBlTmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlIHBpcGUgJyR7cGlwZU5hbWV9JyBjb3VsZCBub3QgYmUgZm91bmRgLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBhbnkge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgoVEVYVF9DU1NfU0VMRUNUT1IpO1xuICAgIHZhciBleHByID0gdGhpcy5fcGFyc2VJbnRlcnBvbGF0aW9uKGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhwcikpIHtcbiAgICAgIHJldHVybiBuZXcgQm91bmRUZXh0QXN0KGV4cHIsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVGV4dEFzdChhc3QudmFsdWUsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IEF0dHJBc3QoYXN0Lm5hbWUsIGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGFzdDogSHRtbENvbW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEh0bWxFbGVtZW50QXN0LCBwYXJlbnQ6IEVsZW1lbnRDb250ZXh0KTogYW55IHtcbiAgICB2YXIgbm9kZU5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgdmFyIHByZXBhcnNlZEVsZW1lbnQgPSBwcmVwYXJzZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUpIHtcbiAgICAgIC8vIFNraXBwaW5nIDxzY3JpcHQ+IGZvciBzZWN1cml0eSByZWFzb25zXG4gICAgICAvLyBTa2lwcGluZyA8c3R5bGU+IGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCAmJlxuICAgICAgICBpc1N0eWxlVXJsUmVzb2x2YWJsZShwcmVwYXJzZWRFbGVtZW50LmhyZWZBdHRyKSkge1xuICAgICAgLy8gU2tpcHBpbmcgc3R5bGVzaGVldHMgd2l0aCBlaXRoZXIgcmVsYXRpdmUgdXJscyBvciBwYWNrYWdlIHNjaGVtZSBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZFxuICAgICAgLy8gdGhlbSBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdID0gW107XG4gICAgdmFyIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10gPSBbXTtcbiAgICB2YXIgdmFyczogVmFyaWFibGVBc3RbXSA9IFtdO1xuICAgIHZhciBldmVudHM6IEJvdW5kRXZlbnRBc3RbXSA9IFtdO1xuXG4gICAgdmFyIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSA9IFtdO1xuICAgIHZhciB0ZW1wbGF0ZVZhcnM6IFZhcmlhYmxlQXN0W10gPSBbXTtcbiAgICB2YXIgdGVtcGxhdGVNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSA9IFtdO1xuICAgIHZhciBoYXNJbmxpbmVUZW1wbGF0ZXMgPSBmYWxzZTtcbiAgICB2YXIgYXR0cnMgPSBbXTtcblxuICAgIGVsZW1lbnQuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIHZhciBoYXNCaW5kaW5nID0gdGhpcy5fcGFyc2VBdHRyKGF0dHIsIG1hdGNoYWJsZUF0dHJzLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgZXZlbnRzLCB2YXJzKTtcbiAgICAgIHZhciBoYXNUZW1wbGF0ZUJpbmRpbmcgPSB0aGlzLl9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICBhdHRyLCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCB0ZW1wbGF0ZVZhcnMpO1xuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgYmluZGluZ3MgYXMgYXR0cmlidXRlcyBhcyB3ZWxsIGluIHRoZSBBU1RcbiAgICAgICAgYXR0cnMucHVzaCh0aGlzLnZpc2l0QXR0cihhdHRyLCBudWxsKSk7XG4gICAgICAgIG1hdGNoYWJsZUF0dHJzLnB1c2goW2F0dHIubmFtZSwgYXR0ci52YWx1ZV0pO1xuICAgICAgfVxuICAgICAgaWYgKGhhc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGxjRWxOYW1lID0gc3BsaXROc05hbWUobm9kZU5hbWUudG9Mb3dlckNhc2UoKSlbMV07XG4gICAgdmFyIGlzVGVtcGxhdGVFbGVtZW50ID0gbGNFbE5hbWUgPT0gVEVNUExBVEVfRUxFTUVOVDtcbiAgICB2YXIgZWxlbWVudENzc1NlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKG5vZGVOYW1lLCBtYXRjaGFibGVBdHRycyk7XG4gICAgdmFyIGRpcmVjdGl2ZU1ldGFzID0gdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCBlbGVtZW50Q3NzU2VsZWN0b3IpO1xuICAgIHZhciBkaXJlY3RpdmVBc3RzID1cbiAgICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlQXN0cyhlbGVtZW50Lm5hbWUsIGRpcmVjdGl2ZU1ldGFzLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCA/IFtdIDogdmFycywgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB2YXIgZWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID1cbiAgICAgICAgdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50Lm5hbWUsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBkaXJlY3RpdmVBc3RzKTtcbiAgICB2YXIgaXNWaWV3Um9vdCA9IHBhcmVudC5pc1RlbXBsYXRlRWxlbWVudCB8fCBoYXNJbmxpbmVUZW1wbGF0ZXM7XG4gICAgdmFyIHByb3ZpZGVyQ29udGV4dCA9XG4gICAgICAgIG5ldyBQcm92aWRlckVsZW1lbnRDb250ZXh0KHRoaXMucHJvdmlkZXJWaWV3Q29udGV4dCwgcGFyZW50LnByb3ZpZGVyQ29udGV4dCwgaXNWaWV3Um9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlQXN0cywgYXR0cnMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgdmFyIGNoaWxkcmVuID0gaHRtbFZpc2l0QWxsKFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlID8gTk9OX0JJTkRBQkxFX1ZJU0lUT1IgOiB0aGlzLCBlbGVtZW50LmNoaWxkcmVuLFxuICAgICAgICBFbGVtZW50Q29udGV4dC5jcmVhdGUoaXNUZW1wbGF0ZUVsZW1lbnQsIGRpcmVjdGl2ZUFzdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCA/IHBhcmVudC5wcm92aWRlckNvbnRleHQgOiBwcm92aWRlckNvbnRleHQpKTtcbiAgICBwcm92aWRlckNvbnRleHQuYWZ0ZXJFbGVtZW50KCk7XG4gICAgLy8gT3ZlcnJpZGUgdGhlIGFjdHVhbCBzZWxlY3RvciB3aGVuIHRoZSBgbmdQcm9qZWN0QXNgIGF0dHJpYnV0ZSBpcyBwcm92aWRlZFxuICAgIHZhciBwcm9qZWN0aW9uU2VsZWN0b3IgPSBpc1ByZXNlbnQocHJlcGFyc2VkRWxlbWVudC5wcm9qZWN0QXMpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENzc1NlbGVjdG9yLnBhcnNlKHByZXBhcnNlZEVsZW1lbnQucHJvamVjdEFzKVswXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Q3NzU2VsZWN0b3I7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChwcm9qZWN0aW9uU2VsZWN0b3IpO1xuICAgIHZhciBwYXJzZWRFbGVtZW50O1xuXG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgaWYgKGlzUHJlc2VudChlbGVtZW50LmNoaWxkcmVuKSAmJiBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgPG5nLWNvbnRlbnQ+IGVsZW1lbnQgY2Fubm90IGhhdmUgY29udGVudC4gPG5nLWNvbnRlbnQ+IG11c3QgYmUgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgPC9uZy1jb250ZW50PmAsXG4gICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IE5nQ29udGVudEFzdChcbiAgICAgICAgICB0aGlzLm5nQ29udGVudENvdW50KyssIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMoZGlyZWN0aXZlQXN0cywgZXZlbnRzKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoZGlyZWN0aXZlQXN0cywgZWxlbWVudFByb3BzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID1cbiAgICAgICAgICBuZXcgRW1iZWRkZWRUZW1wbGF0ZUFzdChhdHRycywgZXZlbnRzLCB2YXJzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXNzZXJ0T25seU9uZUNvbXBvbmVudChkaXJlY3RpdmVBc3RzLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIGVsZW1lbnRFeHBvcnRBc1ZhcnMgPSB2YXJzLmZpbHRlcih2YXJBc3QgPT4gdmFyQXN0LnZhbHVlLmxlbmd0aCA9PT0gMCk7XG4gICAgICBsZXQgbmdDb250ZW50SW5kZXggPVxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRWxlbWVudEFzdChcbiAgICAgICAgICBub2RlTmFtZSwgYXR0cnMsIGVsZW1lbnRQcm9wcywgZXZlbnRzLCBlbGVtZW50RXhwb3J0QXNWYXJzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1Qcm92aWRlcnMsIGNoaWxkcmVuLFxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgaWYgKGhhc0lubGluZVRlbXBsYXRlcykge1xuICAgICAgdmFyIHRlbXBsYXRlQ3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoVEVNUExBVEVfRUxFTUVOVCwgdGVtcGxhdGVNYXRjaGFibGVBdHRycyk7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVNZXRhcyA9IHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgdGVtcGxhdGVDc3NTZWxlY3Rvcik7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVBc3RzID1cbiAgICAgICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKGVsZW1lbnQubmFtZSwgdGVtcGxhdGVEaXJlY3RpdmVNZXRhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIFtdLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIHRlbXBsYXRlRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIHRlbXBsYXRlRGlyZWN0aXZlQXN0cyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKFxuICAgICAgICAgIHRlbXBsYXRlRGlyZWN0aXZlQXN0cywgdGVtcGxhdGVFbGVtZW50UHJvcHMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB2YXIgdGVtcGxhdGVQcm92aWRlckNvbnRleHQgPSBuZXcgUHJvdmlkZXJFbGVtZW50Q29udGV4dChcbiAgICAgICAgICB0aGlzLnByb3ZpZGVyVmlld0NvbnRleHQsIHBhcmVudC5wcm92aWRlckNvbnRleHQsIHBhcmVudC5pc1RlbXBsYXRlRWxlbWVudCxcbiAgICAgICAgICB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMsIFtdLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgdGVtcGxhdGVQcm92aWRlckNvbnRleHQuYWZ0ZXJFbGVtZW50KCk7XG5cbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRW1iZWRkZWRUZW1wbGF0ZUFzdChbXSwgW10sIHRlbXBsYXRlVmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQcm92aWRlckNvbnRleHQudHJhbnNmb3JtUHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtwYXJzZWRFbGVtZW50XSwgbmdDb250ZW50SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRFbGVtZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoYXR0cjogSHRtbEF0dHJBc3QsIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYXJzOiBWYXJpYWJsZUFzdFtdKTogYm9vbGVhbiB7XG4gICAgdmFyIHRlbXBsYXRlQmluZGluZ3NTb3VyY2UgPSBudWxsO1xuICAgIGlmIChhdHRyLm5hbWUgPT0gVEVNUExBVEVfQVRUUikge1xuICAgICAgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IGF0dHIudmFsdWU7XG4gICAgfSBlbHNlIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChURU1QTEFURV9BVFRSX1BSRUZJWCkpIHtcbiAgICAgIHZhciBrZXkgPSBhdHRyLm5hbWUuc3Vic3RyaW5nKFRFTVBMQVRFX0FUVFJfUFJFRklYLmxlbmd0aCk7ICAvLyByZW1vdmUgdGhlIHN0YXJcbiAgICAgIHRlbXBsYXRlQmluZGluZ3NTb3VyY2UgPSAoYXR0ci52YWx1ZS5sZW5ndGggPT0gMCkgPyBrZXkgOiBrZXkgKyAnICcgKyBhdHRyLnZhbHVlO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRlbXBsYXRlQmluZGluZ3NTb3VyY2UpKSB7XG4gICAgICB2YXIgYmluZGluZ3MgPSB0aGlzLl9wYXJzZVRlbXBsYXRlQmluZGluZ3ModGVtcGxhdGVCaW5kaW5nc1NvdXJjZSwgYXR0ci5zb3VyY2VTcGFuKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmluZGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGJpbmRpbmcgPSBiaW5kaW5nc1tpXTtcbiAgICAgICAgaWYgKGJpbmRpbmcua2V5SXNWYXIpIHtcbiAgICAgICAgICB0YXJnZXRWYXJzLnB1c2gobmV3IFZhcmlhYmxlQXN0KGJpbmRpbmcua2V5LCBiaW5kaW5nLm5hbWUsIGF0dHIuc291cmNlU3BhbikpO1xuICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW2JpbmRpbmcua2V5LCBiaW5kaW5nLm5hbWVdKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZGluZy5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoYmluZGluZy5rZXksIGJpbmRpbmcuZXhwcmVzc2lvbiwgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtiaW5kaW5nLmtleSwgJyddKTtcbiAgICAgICAgICB0aGlzLl9wYXJzZUxpdGVyYWxBdHRyKGJpbmRpbmcua2V5LCBudWxsLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFByb3BzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQXR0cihhdHRyOiBIdG1sQXR0ckFzdCwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLl9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHIubmFtZSk7XG4gICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgdmFyIGJpbmRQYXJ0cyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChCSU5EX05BTUVfUkVHRVhQLCBhdHRyTmFtZSk7XG4gICAgdmFyIGhhc0JpbmRpbmcgPSBmYWxzZTtcbiAgICBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0cykpIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0cnVlO1xuICAgICAgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbMV0pKSB7ICAvLyBtYXRjaDogYmluZC1wcm9wXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChcbiAgICAgICAgICAgICAgICAgICAgIGJpbmRQYXJ0c1syXSkpIHsgIC8vIG1hdGNoOiB2YXItbmFtZSAvIHZhci1uYW1lPVwiaWRlblwiIC8gI25hbWUgLyAjbmFtZT1cImlkZW5cIlxuICAgICAgICB2YXIgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1s1XTtcbiAgICAgICAgdGhpcy5fcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0VmFycyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1szXSkpIHsgIC8vIG1hdGNoOiBvbi1ldmVudFxuICAgICAgICB0aGlzLl9wYXJzZUV2ZW50KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s0XSkpIHsgIC8vIG1hdGNoOiBiaW5kb24tcHJvcFxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s2XSkpIHsgIC8vIG1hdGNoOiBbKGV4cHIpXVxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s2XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzZdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s3XSkpIHsgIC8vIG1hdGNoOiBbZXhwcl1cbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbN10sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s4XSkpIHsgIC8vIG1hdGNoOiAoZXZlbnQpXG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQoYmluZFBhcnRzWzhdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGFzQmluZGluZyA9IHRoaXMuX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKGF0dHJOYW1lLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgIH1cbiAgICBpZiAoIWhhc0JpbmRpbmcpIHtcbiAgICAgIHRoaXMuX3BhcnNlTGl0ZXJhbEF0dHIoYXR0ck5hbWUsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiBoYXNCaW5kaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXR0ck5hbWUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdkYXRhLScpID8gYXR0ck5hbWUuc3Vic3RyaW5nKDUpIDogYXR0ck5hbWU7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pIHtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFwiLVwiIGlzIG5vdCBhbGxvd2VkIGluIHZhcmlhYmxlIG5hbWVzYCwgc291cmNlU3Bhbik7XG4gICAgfVxuICAgIHRhcmdldFZhcnMucHVzaChuZXcgVmFyaWFibGVBc3QoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHkobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChuYW1lLCB0aGlzLl9wYXJzZUJpbmRpbmcoZXhwcmVzc2lvbiwgc291cmNlU3BhbiksIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24obmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKTogYm9vbGVhbiB7XG4gICAgdmFyIGV4cHIgPSB0aGlzLl9wYXJzZUludGVycG9sYXRpb24odmFsdWUsIHNvdXJjZVNwYW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhwcikpIHtcbiAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QobmFtZSwgZXhwciwgc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5QXN0KG5hbWU6IHN0cmluZywgYXN0OiBBU1RXaXRoU291cmNlLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2VdKTtcbiAgICB0YXJnZXRQcm9wcy5wdXNoKG5ldyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KG5hbWUsIGFzdCwgZmFsc2UsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQXNzaWdubWVudEV2ZW50KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIHRoaXMuX3BhcnNlRXZlbnQoYCR7bmFtZX1DaGFuZ2VgLCBgJHtleHByZXNzaW9ufT0kZXZlbnRgLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUV2ZW50KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgLy8gbG9uZyBmb3JtYXQ6ICd0YXJnZXQ6IGV2ZW50TmFtZSdcbiAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24obmFtZSwgW251bGwsIG5hbWVdKTtcbiAgICB2YXIgdGFyZ2V0ID0gcGFydHNbMF07XG4gICAgdmFyIGV2ZW50TmFtZSA9IHBhcnRzWzFdO1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZUFjdGlvbihleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlXSk7XG4gICAgdGFyZ2V0RXZlbnRzLnB1c2gobmV3IEJvdW5kRXZlbnRBc3QoZXZlbnROYW1lLCB0YXJnZXQsIGFzdCwgc291cmNlU3BhbikpO1xuICAgIC8vIERvbid0IGRldGVjdCBkaXJlY3RpdmVzIGZvciBldmVudCBuYW1lcyBmb3Igbm93LFxuICAgIC8vIHNvIGRvbid0IGFkZCB0aGUgZXZlbnQgbmFtZSB0byB0aGUgbWF0Y2hhYmxlQXR0cnNcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlTGl0ZXJhbEF0dHIobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRhcmdldFByb3BzLnB1c2gobmV3IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkoXG4gICAgICAgIG5hbWUsIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUodmFsdWUsICcnKSwgdHJ1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VEaXJlY3RpdmVzKHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudENzc1NlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdIHtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IFtdO1xuICAgIHNlbGVjdG9yTWF0Y2hlci5tYXRjaChlbGVtZW50Q3NzU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChzZWxlY3RvciwgZGlyZWN0aXZlKSA9PiB7IGRpcmVjdGl2ZXMucHVzaChkaXJlY3RpdmUpOyB9KTtcbiAgICAvLyBOZWVkIHRvIHNvcnQgdGhlIGRpcmVjdGl2ZXMgc28gdGhhdCB3ZSBnZXQgY29uc2lzdGVudCByZXN1bHRzIHRocm91Z2hvdXQsXG4gICAgLy8gYXMgc2VsZWN0b3JNYXRjaGVyIHVzZXMgTWFwcyBpbnNpZGUuXG4gICAgLy8gQWxzbyBuZWVkIHRvIG1ha2UgY29tcG9uZW50cyB0aGUgZmlyc3QgZGlyZWN0aXZlIGluIHRoZSBhcnJheVxuICAgIExpc3RXcmFwcGVyLnNvcnQoZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgIChkaXIxOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGRpcjI6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyMUNvbXAgPSBkaXIxLmlzQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyMkNvbXAgPSBkaXIyLmlzQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlyMUNvbXAgJiYgIWRpcjJDb21wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFkaXIxQ29tcCAmJiBkaXIyQ29tcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXNJbmRleC5nZXQoZGlyMSkgLSB0aGlzLmRpcmVjdGl2ZXNJbmRleC5nZXQoZGlyMik7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIHJldHVybiBkaXJlY3RpdmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlQXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXhwb3J0QXNWYXJzOiBWYXJpYWJsZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IERpcmVjdGl2ZUFzdFtdIHtcbiAgICB2YXIgbWF0Y2hlZFZhcmlhYmxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHZhciBkaXJlY3RpdmVBc3RzID0gZGlyZWN0aXZlcy5tYXAoKGRpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKSA9PiB7XG4gICAgICB2YXIgaG9zdFByb3BlcnRpZXM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPSBbXTtcbiAgICAgIHZhciBob3N0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10gPSBbXTtcbiAgICAgIHZhciBkaXJlY3RpdmVQcm9wZXJ0aWVzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10gPSBbXTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWUsIGRpcmVjdGl2ZS5ob3N0UHJvcGVydGllcywgc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFByb3BlcnRpZXMpO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJlY3RpdmUuaG9zdExpc3RlbmVycywgc291cmNlU3BhbiwgaG9zdEV2ZW50cyk7XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlLmlucHV0cywgcHJvcHMsIGRpcmVjdGl2ZVByb3BlcnRpZXMpO1xuICAgICAgdmFyIGV4cG9ydEFzVmFycyA9IFtdO1xuICAgICAgcG9zc2libGVFeHBvcnRBc1ZhcnMuZm9yRWFjaCgodmFyQXN0KSA9PiB7XG4gICAgICAgIGlmICgodmFyQXN0LnZhbHVlLmxlbmd0aCA9PT0gMCAmJiBkaXJlY3RpdmUuaXNDb21wb25lbnQpIHx8XG4gICAgICAgICAgICAoZGlyZWN0aXZlLmV4cG9ydEFzID09IHZhckFzdC52YWx1ZSkpIHtcbiAgICAgICAgICBleHBvcnRBc1ZhcnMucHVzaCh2YXJBc3QpO1xuICAgICAgICAgIG1hdGNoZWRWYXJpYWJsZXMuYWRkKHZhckFzdC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IERpcmVjdGl2ZUFzdChkaXJlY3RpdmUsIGRpcmVjdGl2ZVByb3BlcnRpZXMsIGhvc3RQcm9wZXJ0aWVzLCBob3N0RXZlbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3J0QXNWYXJzLCBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgICBwb3NzaWJsZUV4cG9ydEFzVmFycy5mb3JFYWNoKCh2YXJBc3QpID0+IHtcbiAgICAgIGlmICh2YXJBc3QudmFsdWUubGVuZ3RoID4gMCAmJiAhU2V0V3JhcHBlci5oYXMobWF0Y2hlZFZhcmlhYmxlcywgdmFyQXN0Lm5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBUaGVyZSBpcyBubyBkaXJlY3RpdmUgd2l0aCBcImV4cG9ydEFzXCIgc2V0IHRvIFwiJHt2YXJBc3QudmFsdWV9XCJgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJBc3Quc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZUFzdHM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGVsZW1lbnROYW1lOiBzdHJpbmcsIGhvc3RQcm9wczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BlcnR5QXN0czogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdFByb3BzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3RQcm9wcywgKGV4cHJlc3Npb246IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgZXhwckFzdCA9IHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzLnB1c2goXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBleHByQXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudEFzdHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdExpc3RlbmVycykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0TGlzdGVuZXJzLCAoZXhwcmVzc2lvbjogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQocHJvcE5hbWUsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4sIFtdLCB0YXJnZXRFdmVudEFzdHMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKGRpcmVjdGl2ZVByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wczogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChkaXJlY3RpdmVQcm9wZXJ0aWVzKSkge1xuICAgICAgdmFyIGJvdW5kUHJvcHNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eT4oKTtcbiAgICAgIGJvdW5kUHJvcHMuZm9yRWFjaChib3VuZFByb3AgPT4ge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoYm91bmRQcm9wLm5hbWUpO1xuICAgICAgICBpZiAoaXNCbGFuayhwcmV2VmFsdWUpIHx8IHByZXZWYWx1ZS5pc0xpdGVyYWwpIHtcbiAgICAgICAgICAvLyBnaXZlIFthXT1cImJcIiBhIGhpZ2hlciBwcmVjZWRlbmNlIHRoYW4gYT1cImJcIiBvbiB0aGUgc2FtZSBlbGVtZW50XG4gICAgICAgICAgYm91bmRQcm9wc0J5TmFtZS5zZXQoYm91bmRQcm9wLm5hbWUsIGJvdW5kUHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlUHJvcGVydGllcywgKGVsUHJvcDogc3RyaW5nLCBkaXJQcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdmFyIGJvdW5kUHJvcCA9IGJvdW5kUHJvcHNCeU5hbWUuZ2V0KGVsUHJvcCk7XG5cbiAgICAgICAgLy8gQmluZGluZ3MgYXJlIG9wdGlvbmFsLCBzbyB0aGlzIGJpbmRpbmcgb25seSBuZWVkcyB0byBiZSBzZXQgdXAgaWYgYW4gZXhwcmVzc2lvbiBpcyBnaXZlbi5cbiAgICAgICAgaWYgKGlzUHJlc2VudChib3VuZFByb3ApKSB7XG4gICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wcy5wdXNoKG5ldyBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0KFxuICAgICAgICAgICAgICBkaXJQcm9wLCBib3VuZFByb3AubmFtZSwgYm91bmRQcm9wLmV4cHJlc3Npb24sIGJvdW5kUHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgcHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10ge1xuICAgIHZhciBib3VuZEVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IFtdO1xuICAgIHZhciBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXggPSBuZXcgTWFwPHN0cmluZywgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdD4oKTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZTogRGlyZWN0aXZlQXN0KSA9PiB7XG4gICAgICBkaXJlY3RpdmUuaW5wdXRzLmZvckVhY2goKHByb3A6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QpID0+IHtcbiAgICAgICAgYm91bmREaXJlY3RpdmVQcm9wc0luZGV4LnNldChwcm9wLnRlbXBsYXRlTmFtZSwgcHJvcCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBwcm9wcy5mb3JFYWNoKChwcm9wOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KSA9PiB7XG4gICAgICBpZiAoIXByb3AuaXNMaXRlcmFsICYmIGlzQmxhbmsoYm91bmREaXJlY3RpdmVQcm9wc0luZGV4LmdldChwcm9wLm5hbWUpKSkge1xuICAgICAgICBib3VuZEVsZW1lbnRQcm9wcy5wdXNoKHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZSwgcHJvcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wLmV4cHJlc3Npb24sIHByb3Auc291cmNlU3BhbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBib3VuZEVsZW1lbnRQcm9wcztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGFzdDogQVNULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3Qge1xuICAgIHZhciB1bml0ID0gbnVsbDtcbiAgICB2YXIgYmluZGluZ1R5cGU7XG4gICAgdmFyIGJvdW5kUHJvcGVydHlOYW1lO1xuICAgIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmdldE1hcHBlZFByb3BOYW1lKHBhcnRzWzBdKTtcbiAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5Qcm9wZXJ0eTtcbiAgICAgIGlmICghdGhpcy5fc2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkoZWxlbWVudE5hbWUsIGJvdW5kUHJvcGVydHlOYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBDYW4ndCBiaW5kIHRvICcke2JvdW5kUHJvcGVydHlOYW1lfScgc2luY2UgaXQgaXNuJ3QgYSBrbm93biBuYXRpdmUgcHJvcGVydHlgLFxuICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwYXJ0c1swXSA9PSBBVFRSSUJVVEVfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGxldCBuc1NlcGFyYXRvcklkeCA9IGJvdW5kUHJvcGVydHlOYW1lLmluZGV4T2YoJzonKTtcbiAgICAgICAgaWYgKG5zU2VwYXJhdG9ySWR4ID4gLTEpIHtcbiAgICAgICAgICBsZXQgbnMgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMCwgbnNTZXBhcmF0b3JJZHgpO1xuICAgICAgICAgIGxldCBuYW1lID0gYm91bmRQcm9wZXJ0eU5hbWUuc3Vic3RyaW5nKG5zU2VwYXJhdG9ySWR4ICsgMSk7XG4gICAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBtZXJnZU5zQW5kTmFtZShucywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZTtcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gQ0xBU1NfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzcztcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gU1RZTEVfUFJFRklYKSB7XG4gICAgICAgIHVuaXQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHNbMl0gOiBudWxsO1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgSW52YWxpZCBwcm9wZXJ0eSBuYW1lICcke25hbWV9J2AsIHNvdXJjZVNwYW4pO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdChib3VuZFByb3BlcnR5TmFtZSwgYmluZGluZ1R5cGUsIGFzdCwgdW5pdCwgc291cmNlU3Bhbik7XG4gIH1cblxuXG4gIHByaXZhdGUgX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IHN0cmluZ1tdIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgdmFyIHR5cGVOYW1lID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLm5hbWU7XG4gICAgICBpZiAoZGlyZWN0aXZlLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnRUeXBlTmFtZXMucHVzaCh0eXBlTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudFR5cGVOYW1lcztcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXMgPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgTW9yZSB0aGFuIG9uZSBjb21wb25lbnQ6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBDb21wb25lbnRzIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlOiAke2NvbXBvbmVudFR5cGVOYW1lcy5qb2luKCcsJyl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBlbGVtZW50UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBQcm9wZXJ0eSBiaW5kaW5nICR7cHJvcC5uYW1lfSBub3QgdXNlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlYCxcbiAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgdmFyIGFsbERpcmVjdGl2ZUV2ZW50cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZS5kaXJlY3RpdmUub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXZlbnROYW1lOiBzdHJpbmcsIF8pID0+IHsgYWxsRGlyZWN0aXZlRXZlbnRzLmFkZChldmVudE5hbWUpOyB9KTtcbiAgICB9KTtcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGV2ZW50LnRhcmdldCkgfHwgIVNldFdyYXBwZXIuaGFzKGFsbERpcmVjdGl2ZUV2ZW50cywgZXZlbnQubmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgRXZlbnQgYmluZGluZyAke2V2ZW50LmZ1bGxOYW1lfSBub3QgZW1pdHRlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlYCxcbiAgICAgICAgICAgIGV2ZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIE5vbkJpbmRhYmxlVmlzaXRvciBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgdmlzaXRFbGVtZW50KGFzdDogSHRtbEVsZW1lbnRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBFbGVtZW50QXN0IHtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSBhc3QuYXR0cnMubWFwKGF0dHJBc3QgPT4gW2F0dHJBc3QubmFtZSwgYXR0ckFzdC52YWx1ZV0pO1xuICAgIHZhciBzZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihhc3QubmFtZSwgYXR0ck5hbWVBbmRWYWx1ZXMpO1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3IpO1xuICAgIHZhciBjaGlsZHJlbiA9IGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCk7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50QXN0KGFzdC5uYW1lLCBodG1sVmlzaXRBbGwodGhpcywgYXN0LmF0dHJzKSwgW10sIFtdLCBbXSwgW10sIFtdLCBjaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdENvbW1lbnQoYXN0OiBIdG1sQ29tbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IEF0dHJBc3Qge1xuICAgIHJldHVybiBuZXcgQXR0ckFzdChhc3QubmFtZSwgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBUZXh0QXN0IHtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKTtcbiAgICByZXR1cm4gbmV3IFRleHRBc3QoYXN0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG59XG5cbmNsYXNzIEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNULCBwdWJsaWMgaXNMaXRlcmFsOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRDbGFzc2VzKGNsYXNzQXR0clZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnNwbGl0KGNsYXNzQXR0clZhbHVlLnRyaW0oKSwgL1xccysvZyk7XG59XG5cbmNsYXNzIEVsZW1lbnRDb250ZXh0IHtcbiAgc3RhdGljIGNyZWF0ZShpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgICAgcHJvdmlkZXJDb250ZXh0OiBQcm92aWRlckVsZW1lbnRDb250ZXh0KTogRWxlbWVudENvbnRleHQge1xuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIHZhciB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gbnVsbDtcbiAgICBpZiAoZGlyZWN0aXZlcy5sZW5ndGggPiAwICYmIGRpcmVjdGl2ZXNbMF0uZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICB2YXIgbmdDb250ZW50U2VsZWN0b3JzID0gZGlyZWN0aXZlc1swXS5kaXJlY3RpdmUudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoc2VsZWN0b3IsICcqJykpIHtcbiAgICAgICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKG5nQ29udGVudFNlbGVjdG9yc1tpXSksIGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRWxlbWVudENvbnRleHQoaXNUZW1wbGF0ZUVsZW1lbnQsIG1hdGNoZXIsIHdpbGRjYXJkTmdDb250ZW50SW5kZXgsIHByb3ZpZGVyQ29udGV4dCk7XG4gIH1cbiAgY29uc3RydWN0b3IocHVibGljIGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBwcml2YXRlIF9uZ0NvbnRlbnRJbmRleE1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcHJvdmlkZXJDb250ZXh0OiBQcm92aWRlckVsZW1lbnRDb250ZXh0KSB7fVxuXG4gIGZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBudW1iZXIge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRpY2VzID0gW107XG4gICAgdGhpcy5fbmdDb250ZW50SW5kZXhNYXRjaGVyLm1hdGNoKFxuICAgICAgICBzZWxlY3RvciwgKHNlbGVjdG9yLCBuZ0NvbnRlbnRJbmRleCkgPT4geyBuZ0NvbnRlbnRJbmRpY2VzLnB1c2gobmdDb250ZW50SW5kZXgpOyB9KTtcbiAgICBMaXN0V3JhcHBlci5zb3J0KG5nQ29udGVudEluZGljZXMpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fd2lsZGNhcmROZ0NvbnRlbnRJbmRleCkpIHtcbiAgICAgIG5nQ29udGVudEluZGljZXMucHVzaCh0aGlzLl93aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID4gMCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihlbGVtZW50TmFtZTogc3RyaW5nLCBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSk6IENzc1NlbGVjdG9yIHtcbiAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gIGxldCBlbE5hbWVOb05zID0gc3BsaXROc05hbWUoZWxlbWVudE5hbWUpWzFdO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxOYW1lTm9Ocyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGFibGVBdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhdHRyTmFtZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzBdO1xuICAgIGxldCBhdHRyTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShhdHRyTmFtZSlbMV07XG4gICAgbGV0IGF0dHJWYWx1ZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzFdO1xuXG4gICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lTm9OcywgYXR0clZhbHVlKTtcbiAgICBpZiAoYXR0ck5hbWUudG9Mb3dlckNhc2UoKSA9PSBDTEFTU19BVFRSKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IHNwbGl0Q2xhc3NlcyhhdHRyVmFsdWUpO1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NOYW1lKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjc3NTZWxlY3Rvcjtcbn1cblxudmFyIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCA9IG5ldyBFbGVtZW50Q29udGV4dCh0cnVlLCBuZXcgU2VsZWN0b3JNYXRjaGVyKCksIG51bGwsIG51bGwpO1xudmFyIE5PTl9CSU5EQUJMRV9WSVNJVE9SID0gbmV3IE5vbkJpbmRhYmxlVmlzaXRvcigpO1xuXG5cbmV4cG9ydCBjbGFzcyBQaXBlQ29sbGVjdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHBpcGVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnBpcGVzLmFkZChhc3QubmFtZSk7XG4gICAgYXN0LmV4cC52aXNpdCh0aGlzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVzKGl0ZW1zOiBDb21waWxlTWV0YWRhdGFXaXRoVHlwZVtdKTogQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGVbXSB7XG4gIGxldCByZXMgPSBbXTtcbiAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBsZXQgaGFzTWF0Y2ggPVxuICAgICAgICByZXMuZmlsdGVyKHIgPT4gci50eXBlLm5hbWUgPT0gaXRlbS50eXBlLm5hbWUgJiYgci50eXBlLm1vZHVsZVVybCA9PSBpdGVtLnR5cGUubW9kdWxlVXJsICYmXG4gICAgICAgICAgICAgICAgICAgICAgICByLnR5cGUucnVudGltZSA9PSBpdGVtLnR5cGUucnVudGltZSlcbiAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgIGlmICghaGFzTWF0Y2gpIHtcbiAgICAgIHJlcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG4iXX0=