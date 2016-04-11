'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var template_ast_1 = require('./template_ast');
var source_module_1 = require('./source_module');
var view_1 = require('angular2/src/core/linker/view');
var view_type_1 = require('angular2/src/core/linker/view_type');
var element_1 = require('angular2/src/core/linker/element');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
exports.PROTO_VIEW_JIT_IMPORTS = lang_1.CONST_EXPR({ 'AppProtoView': view_1.AppProtoView, 'AppProtoElement': element_1.AppProtoElement, 'ViewType': view_type_1.ViewType });
// TODO: have a single file that reexports everything needed for
// codegen explicitly
// - helps understanding what codegen works against
// - less imports in codegen code
exports.APP_VIEW_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/view' + util_1.MODULE_SUFFIX);
exports.VIEW_TYPE_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/view_type' + util_1.MODULE_SUFFIX);
exports.APP_EL_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/element' + util_1.MODULE_SUFFIX);
exports.METADATA_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/metadata/view' + util_1.MODULE_SUFFIX);
var IMPLICIT_TEMPLATE_VAR = '\$implicit';
var CLASS_ATTR = 'class';
var STYLE_ATTR = 'style';
var ProtoViewCompiler = (function () {
    function ProtoViewCompiler() {
    }
    ProtoViewCompiler.prototype.compileProtoViewRuntime = function (metadataCache, component, template, pipes) {
        var protoViewFactory = new RuntimeProtoViewFactory(metadataCache, component, pipes);
        var allProtoViews = [];
        protoViewFactory.createCompileProtoView(template, [], [], allProtoViews);
        return new CompileProtoViews([], allProtoViews);
    };
    ProtoViewCompiler.prototype.compileProtoViewCodeGen = function (resolvedMetadataCacheExpr, component, template, pipes) {
        var protoViewFactory = new CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes);
        var allProtoViews = [];
        var allStatements = [];
        protoViewFactory.createCompileProtoView(template, [], allStatements, allProtoViews);
        return new CompileProtoViews(allStatements.map(function (stmt) { return stmt.statement; }), allProtoViews);
    };
    ProtoViewCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ProtoViewCompiler);
    return ProtoViewCompiler;
})();
exports.ProtoViewCompiler = ProtoViewCompiler;
var CompileProtoViews = (function () {
    function CompileProtoViews(declarations, protoViews) {
        this.declarations = declarations;
        this.protoViews = protoViews;
    }
    return CompileProtoViews;
})();
exports.CompileProtoViews = CompileProtoViews;
var CompileProtoView = (function () {
    function CompileProtoView(embeddedTemplateIndex, protoElements, protoView) {
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.protoElements = protoElements;
        this.protoView = protoView;
    }
    return CompileProtoView;
})();
exports.CompileProtoView = CompileProtoView;
var CompileProtoElement = (function () {
    function CompileProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl) {
        this.boundElementIndex = boundElementIndex;
        this.attrNameAndValues = attrNameAndValues;
        this.variableNameAndValues = variableNameAndValues;
        this.renderEvents = renderEvents;
        this.directives = directives;
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.appProtoEl = appProtoEl;
    }
    return CompileProtoElement;
})();
exports.CompileProtoElement = CompileProtoElement;
function visitAndReturnContext(visitor, asts, context) {
    template_ast_1.templateVisitAll(visitor, asts, context);
    return context;
}
var ProtoViewFactory = (function () {
    function ProtoViewFactory(component) {
        this.component = component;
    }
    ProtoViewFactory.prototype.createCompileProtoView = function (template, templateVariableBindings, targetStatements, targetProtoViews) {
        var embeddedTemplateIndex = targetProtoViews.length;
        // Note: targetProtoViews needs to be in depth first order.
        // So we "reserve" a space here that we fill after the recursion is done
        targetProtoViews.push(null);
        var builder = new ProtoViewBuilderVisitor(this, targetStatements, targetProtoViews);
        template_ast_1.templateVisitAll(builder, template);
        var viewType = getViewType(this.component, embeddedTemplateIndex);
        var appProtoView = this.createAppProtoView(embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements);
        var cpv = new CompileProtoView(embeddedTemplateIndex, builder.protoElements, appProtoView);
        targetProtoViews[embeddedTemplateIndex] = cpv;
        return cpv;
    };
    return ProtoViewFactory;
})();
var CodeGenProtoViewFactory = (function (_super) {
    __extends(CodeGenProtoViewFactory, _super);
    function CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes) {
        _super.call(this, component);
        this.resolvedMetadataCacheExpr = resolvedMetadataCacheExpr;
        this.pipes = pipes;
        this._nextVarId = 0;
    }
    CodeGenProtoViewFactory.prototype._nextProtoViewVar = function (embeddedTemplateIndex) {
        return "appProtoView" + this._nextVarId++ + "_" + this.component.type.name + embeddedTemplateIndex;
    };
    CodeGenProtoViewFactory.prototype.createAppProtoView = function (embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var protoViewVarName = this._nextProtoViewVar(embeddedTemplateIndex);
        var viewTypeExpr = codeGenViewType(viewType);
        var pipesExpr = embeddedTemplateIndex === 0 ?
            codeGenTypesArray(this.pipes.map(function (pipeMeta) { return pipeMeta.type; })) :
            null;
        var statement = "var " + protoViewVarName + " = " + exports.APP_VIEW_MODULE_REF + "AppProtoView.create(" + this.resolvedMetadataCacheExpr.expression + ", " + viewTypeExpr + ", " + pipesExpr + ", " + util_1.codeGenStringMap(templateVariableBindings) + ");";
        targetStatements.push(new util_1.Statement(statement));
        return new util_1.Expression(protoViewVarName);
    };
    CodeGenProtoViewFactory.prototype.createAppProtoElement = function (boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var varName = "appProtoEl" + this._nextVarId++ + "_" + this.component.type.name;
        var value = exports.APP_EL_MODULE_REF + "AppProtoElement.create(\n        " + this.resolvedMetadataCacheExpr.expression + ",\n        " + boundElementIndex + ",\n        " + util_1.codeGenStringMap(attrNameAndValues) + ",\n        " + codeGenDirectivesArray(directives) + ",\n        " + util_1.codeGenStringMap(variableNameAndValues) + "\n      )";
        var statement = "var " + varName + " = " + value + ";";
        targetStatements.push(new util_1.Statement(statement));
        return new util_1.Expression(varName);
    };
    return CodeGenProtoViewFactory;
})(ProtoViewFactory);
var RuntimeProtoViewFactory = (function (_super) {
    __extends(RuntimeProtoViewFactory, _super);
    function RuntimeProtoViewFactory(metadataCache, component, pipes) {
        _super.call(this, component);
        this.metadataCache = metadataCache;
        this.pipes = pipes;
    }
    RuntimeProtoViewFactory.prototype.createAppProtoView = function (embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var pipes = embeddedTemplateIndex === 0 ? this.pipes.map(function (pipeMeta) { return pipeMeta.type.runtime; }) : [];
        var templateVars = keyValueArrayToStringMap(templateVariableBindings);
        return view_1.AppProtoView.create(this.metadataCache, viewType, pipes, templateVars);
    };
    RuntimeProtoViewFactory.prototype.createAppProtoElement = function (boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var attrs = keyValueArrayToStringMap(attrNameAndValues);
        return element_1.AppProtoElement.create(this.metadataCache, boundElementIndex, attrs, directives.map(function (dirMeta) { return dirMeta.type.runtime; }), keyValueArrayToStringMap(variableNameAndValues));
    };
    return RuntimeProtoViewFactory;
})(ProtoViewFactory);
var ProtoViewBuilderVisitor = (function () {
    function ProtoViewBuilderVisitor(factory, allStatements, allProtoViews) {
        this.factory = factory;
        this.allStatements = allStatements;
        this.allProtoViews = allProtoViews;
        this.protoElements = [];
        this.boundElementCount = 0;
    }
    ProtoViewBuilderVisitor.prototype._readAttrNameAndValues = function (directives, attrAsts) {
        var attrs = visitAndReturnContext(this, attrAsts, {});
        directives.forEach(function (directiveMeta) {
            collection_1.StringMapWrapper.forEach(directiveMeta.hostAttributes, function (value, name) {
                var prevValue = attrs[name];
                attrs[name] = lang_1.isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
            });
        });
        return mapToKeyValueArray(attrs);
    };
    ProtoViewBuilderVisitor.prototype.visitBoundText = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitText = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitNgContent = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitElement = function (ast, context) {
        var _this = this;
        var boundElementIndex = null;
        if (ast.isBound()) {
            boundElementIndex = this.boundElementCount++;
        }
        var component = ast.getComponent();
        var variableNameAndValues = [];
        if (lang_1.isBlank(component)) {
            ast.exportAsVars.forEach(function (varAst) { variableNameAndValues.push([varAst.name, null]); });
        }
        var directives = [];
        var renderEvents = visitAndReturnContext(this, ast.outputs, new Map());
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, boundElementIndex, renderEvents, variableNameAndValues, directives));
        });
        var renderEventArray = [];
        renderEvents.forEach(function (eventAst, _) { return renderEventArray.push(eventAst); });
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        this._addProtoElement(ast.isBound(), boundElementIndex, attrNameAndValues, variableNameAndValues, renderEventArray, directives, null);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
        var _this = this;
        var boundElementIndex = this.boundElementCount++;
        var directives = [];
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, boundElementIndex, new Map(), [], directives));
        });
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        var templateVariableBindings = ast.vars.map(function (varAst) { return [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]; });
        var nestedProtoView = this.factory.createCompileProtoView(ast.children, templateVariableBindings, this.allStatements, this.allProtoViews);
        this._addProtoElement(true, boundElementIndex, attrNameAndValues, [], [], directives, nestedProtoView.embeddedTemplateIndex);
        return null;
    };
    ProtoViewBuilderVisitor.prototype._addProtoElement = function (isBound, boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex) {
        var appProtoEl = null;
        if (isBound) {
            appProtoEl = this.factory.createAppProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, directives, this.allStatements);
        }
        var compileProtoEl = new CompileProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl);
        this.protoElements.push(compileProtoEl);
    };
    ProtoViewBuilderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    ProtoViewBuilderVisitor.prototype.visitAttr = function (ast, attrNameAndValues) {
        attrNameAndValues[ast.name] = ast.value;
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitDirective = function (ast, ctx) {
        ctx.targetDirectives.push(ast.directive);
        template_ast_1.templateVisitAll(this, ast.hostEvents, ctx.hostEventTargetAndNames);
        ast.exportAsVars.forEach(function (varAst) {
            ctx.targetVariableNameAndValues.push([varAst.name, ctx.index]);
        });
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        eventTargetAndNames.set(ast.fullName, ast);
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return ProtoViewBuilderVisitor;
})();
function mapToKeyValueArray(data) {
    var entryArray = [];
    collection_1.StringMapWrapper.forEach(data, function (value, name) {
        entryArray.push([name, value]);
    });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    collection_1.ListWrapper.sort(entryArray, function (entry1, entry2) { return lang_1.StringWrapper.compare(entry1[0], entry2[0]); });
    var keyValueArray = [];
    entryArray.forEach(function (entry) { keyValueArray.push([entry[0], entry[1]]); });
    return keyValueArray;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return attrValue1 + " " + attrValue2;
    }
    else {
        return attrValue2;
    }
}
var DirectiveContext = (function () {
    function DirectiveContext(index, boundElementIndex, hostEventTargetAndNames, targetVariableNameAndValues, targetDirectives) {
        this.index = index;
        this.boundElementIndex = boundElementIndex;
        this.hostEventTargetAndNames = hostEventTargetAndNames;
        this.targetVariableNameAndValues = targetVariableNameAndValues;
        this.targetDirectives = targetDirectives;
    }
    return DirectiveContext;
})();
function keyValueArrayToStringMap(keyValueArray) {
    var stringMap = {};
    for (var i = 0; i < keyValueArray.length; i++) {
        var entry = keyValueArray[i];
        stringMap[entry[0]] = entry[1];
    }
    return stringMap;
}
function codeGenDirectivesArray(directives) {
    var expressions = directives.map(function (directiveType) { return typeRef(directiveType.type); });
    return "[" + expressions.join(',') + "]";
}
function codeGenTypesArray(types) {
    var expressions = types.map(typeRef);
    return "[" + expressions.join(',') + "]";
}
function codeGenViewType(value) {
    if (lang_1.IS_DART) {
        return "" + exports.VIEW_TYPE_MODULE_REF + value;
    }
    else {
        return "" + value;
    }
}
function typeRef(type) {
    return "" + source_module_1.moduleRef(type.moduleUrl) + type.name;
}
function getViewType(component, embeddedTemplateIndex) {
    if (embeddedTemplateIndex > 0) {
        return view_type_1.ViewType.EMBEDDED;
    }
    else if (component.type.isHost) {
        return view_type_1.ViewType.HOST;
    }
    else {
        return view_type_1.ViewType.COMPONENT;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fdmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjN2MFZKRkgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9wcm90b192aWV3X2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlByb3RvVmlld0NvbXBpbGVyIiwiUHJvdG9WaWV3Q29tcGlsZXIuY29uc3RydWN0b3IiLCJQcm90b1ZpZXdDb21waWxlci5jb21waWxlUHJvdG9WaWV3UnVudGltZSIsIlByb3RvVmlld0NvbXBpbGVyLmNvbXBpbGVQcm90b1ZpZXdDb2RlR2VuIiwiQ29tcGlsZVByb3RvVmlld3MiLCJDb21waWxlUHJvdG9WaWV3cy5jb25zdHJ1Y3RvciIsIkNvbXBpbGVQcm90b1ZpZXciLCJDb21waWxlUHJvdG9WaWV3LmNvbnN0cnVjdG9yIiwiQ29tcGlsZVByb3RvRWxlbWVudCIsIkNvbXBpbGVQcm90b0VsZW1lbnQuY29uc3RydWN0b3IiLCJ2aXNpdEFuZFJldHVybkNvbnRleHQiLCJQcm90b1ZpZXdGYWN0b3J5IiwiUHJvdG9WaWV3RmFjdG9yeS5jb25zdHJ1Y3RvciIsIlByb3RvVmlld0ZhY3RvcnkuY3JlYXRlQ29tcGlsZVByb3RvVmlldyIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5IiwiQ29kZUdlblByb3RvVmlld0ZhY3RvcnkuY29uc3RydWN0b3IiLCJDb2RlR2VuUHJvdG9WaWV3RmFjdG9yeS5fbmV4dFByb3RvVmlld1ZhciIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUFwcFByb3RvVmlldyIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUFwcFByb3RvRWxlbWVudCIsIlJ1bnRpbWVQcm90b1ZpZXdGYWN0b3J5IiwiUnVudGltZVByb3RvVmlld0ZhY3RvcnkuY29uc3RydWN0b3IiLCJSdW50aW1lUHJvdG9WaWV3RmFjdG9yeS5jcmVhdGVBcHBQcm90b1ZpZXciLCJSdW50aW1lUHJvdG9WaWV3RmFjdG9yeS5jcmVhdGVBcHBQcm90b0VsZW1lbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvciIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IuX3JlYWRBdHRyTmFtZUFuZFZhbHVlcyIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0Qm91bmRUZXh0IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRUZXh0IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXROZ0NvbnRlbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVsZW1lbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVtYmVkZGVkVGVtcGxhdGUiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci5fYWRkUHJvdG9FbGVtZW50IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRWYXJpYWJsZSIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0QXR0ciIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0RGlyZWN0aXZlIiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRFdmVudCIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0RGlyZWN0aXZlUHJvcGVydHkiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVsZW1lbnRQcm9wZXJ0eSIsIm1hcFRvS2V5VmFsdWVBcnJheSIsIm1lcmdlQXR0cmlidXRlVmFsdWUiLCJEaXJlY3RpdmVDb250ZXh0IiwiRGlyZWN0aXZlQ29udGV4dC5jb25zdHJ1Y3RvciIsImtleVZhbHVlQXJyYXlUb1N0cmluZ01hcCIsImNvZGVHZW5EaXJlY3RpdmVzQXJyYXkiLCJjb2RlR2VuVHlwZXNBcnJheSIsImNvZGVHZW5WaWV3VHlwZSIsInR5cGVSZWYiLCJnZXRWaWV3VHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxx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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgVHlwZSwgaXNTdHJpbmcsIFN0cmluZ1dyYXBwZXIsIElTX0RBUlQsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1NldFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RWaXNpdG9yLCBOZ0NvbnRlbnRBc3QsIEVtYmVkZGVkVGVtcGxhdGVBc3QsIEVsZW1lbnRBc3QsIFZhcmlhYmxlQXN0LCBCb3VuZEV2ZW50QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQXR0ckFzdCwgQm91bmRUZXh0QXN0LCBUZXh0QXN0LCBEaXJlY3RpdmVBc3QsIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIHRlbXBsYXRlVmlzaXRBbGx9IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7Q29tcGlsZVR5cGVNZXRhZGF0YSwgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZU1ldGFkYXRhfSBmcm9tICcuL2RpcmVjdGl2ZV9tZXRhZGF0YSc7XG5pbXBvcnQge1NvdXJjZUV4cHJlc3Npb25zLCBTb3VyY2VFeHByZXNzaW9uLCBtb2R1bGVSZWZ9IGZyb20gJy4vc291cmNlX21vZHVsZSc7XG5pbXBvcnQge0FwcFByb3RvVmlldywgQXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZSc7XG5pbXBvcnQge0FwcFByb3RvRWxlbWVudCwgQXBwRWxlbWVudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2VsZW1lbnQnO1xuaW1wb3J0IHtSZXNvbHZlZE1ldGFkYXRhQ2FjaGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9yZXNvbHZlZF9tZXRhZGF0YV9jYWNoZSc7XG5pbXBvcnQge2VzY2FwZVNpbmdsZVF1b3RlU3RyaW5nLCBjb2RlR2VuQ29uc3RDb25zdHJ1Y3RvckNhbGwsIGNvZGVHZW5WYWx1ZUZuLCBjb2RlR2VuRm5IZWFkZXIsIE1PRFVMRV9TVUZGSVgsIGNvZGVHZW5TdHJpbmdNYXAsIEV4cHJlc3Npb24sIFN0YXRlbWVudH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5leHBvcnQgY29uc3QgUFJPVE9fVklFV19KSVRfSU1QT1JUUyA9IENPTlNUX0VYUFIoXG4gICAgeydBcHBQcm90b1ZpZXcnOiBBcHBQcm90b1ZpZXcsICdBcHBQcm90b0VsZW1lbnQnOiBBcHBQcm90b0VsZW1lbnQsICdWaWV3VHlwZSc6IFZpZXdUeXBlfSk7XG5cbi8vIFRPRE86IGhhdmUgYSBzaW5nbGUgZmlsZSB0aGF0IHJlZXhwb3J0cyBldmVyeXRoaW5nIG5lZWRlZCBmb3Jcbi8vIGNvZGVnZW4gZXhwbGljaXRseVxuLy8gLSBoZWxwcyB1bmRlcnN0YW5kaW5nIHdoYXQgY29kZWdlbiB3b3JrcyBhZ2FpbnN0XG4vLyAtIGxlc3MgaW1wb3J0cyBpbiBjb2RlZ2VuIGNvZGVcbmV4cG9ydCB2YXIgQVBQX1ZJRVdfTU9EVUxFX1JFRiA9IG1vZHVsZVJlZigncGFja2FnZTphbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldycgKyBNT0RVTEVfU1VGRklYKTtcbmV4cG9ydCB2YXIgVklFV19UWVBFX01PRFVMRV9SRUYgPVxuICAgIG1vZHVsZVJlZigncGFja2FnZTphbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld190eXBlJyArIE1PRFVMRV9TVUZGSVgpO1xuZXhwb3J0IHZhciBBUFBfRUxfTU9EVUxFX1JFRiA9XG4gICAgbW9kdWxlUmVmKCdwYWNrYWdlOmFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50JyArIE1PRFVMRV9TVUZGSVgpO1xuZXhwb3J0IHZhciBNRVRBREFUQV9NT0RVTEVfUkVGID1cbiAgICBtb2R1bGVSZWYoJ3BhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldycgKyBNT0RVTEVfU1VGRklYKTtcblxuY29uc3QgSU1QTElDSVRfVEVNUExBVEVfVkFSID0gJ1xcJGltcGxpY2l0JztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfQVRUUiA9ICdzdHlsZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQcm90b1ZpZXdDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBjb21waWxlUHJvdG9WaWV3UnVudGltZShcbiAgICAgIG1ldGFkYXRhQ2FjaGU6IFJlc29sdmVkTWV0YWRhdGFDYWNoZSwgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSxcbiAgICAgIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10pOiBDb21waWxlUHJvdG9WaWV3czxBcHBQcm90b1ZpZXcsIEFwcFByb3RvRWxlbWVudCwgYW55PiB7XG4gICAgdmFyIHByb3RvVmlld0ZhY3RvcnkgPSBuZXcgUnVudGltZVByb3RvVmlld0ZhY3RvcnkobWV0YWRhdGFDYWNoZSwgY29tcG9uZW50LCBwaXBlcyk7XG4gICAgdmFyIGFsbFByb3RvVmlld3MgPSBbXTtcbiAgICBwcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUNvbXBpbGVQcm90b1ZpZXcodGVtcGxhdGUsIFtdLCBbXSwgYWxsUHJvdG9WaWV3cyk7XG4gICAgcmV0dXJuIG5ldyBDb21waWxlUHJvdG9WaWV3czxBcHBQcm90b1ZpZXcsIEFwcFByb3RvRWxlbWVudCwgYW55PihbXSwgYWxsUHJvdG9WaWV3cyk7XG4gIH1cblxuICBjb21waWxlUHJvdG9WaWV3Q29kZUdlbihcbiAgICAgIHJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHI6IEV4cHJlc3Npb24sIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKTogQ29tcGlsZVByb3RvVmlld3M8RXhwcmVzc2lvbiwgRXhwcmVzc2lvbiwgc3RyaW5nPiB7XG4gICAgdmFyIHByb3RvVmlld0ZhY3RvcnkgPSBuZXcgQ29kZUdlblByb3RvVmlld0ZhY3RvcnkocmVzb2x2ZWRNZXRhZGF0YUNhY2hlRXhwciwgY29tcG9uZW50LCBwaXBlcyk7XG4gICAgdmFyIGFsbFByb3RvVmlld3MgPSBbXTtcbiAgICB2YXIgYWxsU3RhdGVtZW50cyA9IFtdO1xuICAgIHByb3RvVmlld0ZhY3RvcnkuY3JlYXRlQ29tcGlsZVByb3RvVmlldyh0ZW1wbGF0ZSwgW10sIGFsbFN0YXRlbWVudHMsIGFsbFByb3RvVmlld3MpO1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVByb3RvVmlld3M8RXhwcmVzc2lvbiwgRXhwcmVzc2lvbiwgc3RyaW5nPihcbiAgICAgICAgYWxsU3RhdGVtZW50cy5tYXAoc3RtdCA9PiBzdG10LnN0YXRlbWVudCksIGFsbFByb3RvVmlld3MpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUHJvdG9WaWV3czxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMLCBTVEFURU1FTlQ+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZGVjbGFyYXRpb25zOiBTVEFURU1FTlRbXSxcbiAgICAgIHB1YmxpYyBwcm90b1ZpZXdzOiBDb21waWxlUHJvdG9WaWV3PEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUw+W10pIHt9XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVQcm90b1ZpZXc8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlcixcbiAgICAgIHB1YmxpYyBwcm90b0VsZW1lbnRzOiBDb21waWxlUHJvdG9FbGVtZW50PEFQUF9QUk9UT19FTD5bXSwgcHVibGljIHByb3RvVmlldzogQVBQX1BST1RPX1ZJRVcpIHtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3RvRWxlbWVudDxBUFBfUFJPVE9fRUw+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgYm91bmRFbGVtZW50SW5kZXgsIHB1YmxpYyBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSxcbiAgICAgIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sIHB1YmxpYyByZW5kZXJFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcHVibGljIGVtYmVkZGVkVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuICAgICAgcHVibGljIGFwcFByb3RvRWw6IEFQUF9QUk9UT19FTCkge31cbn1cblxuZnVuY3Rpb24gdmlzaXRBbmRSZXR1cm5Db250ZXh0KFxuICAgIHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgYXN0czogVGVtcGxhdGVBc3RbXSwgY29udGV4dDogYW55KTogYW55IHtcbiAgdGVtcGxhdGVWaXNpdEFsbCh2aXNpdG9yLCBhc3RzLCBjb250ZXh0KTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmFic3RyYWN0IGNsYXNzIFByb3RvVmlld0ZhY3Rvcnk8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkge31cblxuICBhYnN0cmFjdCBjcmVhdGVBcHBQcm90b1ZpZXcoXG4gICAgICBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlciwgdmlld1R5cGU6IFZpZXdUeXBlLCB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3M6IHN0cmluZ1tdW10sXG4gICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBTVEFURU1FTlRbXSk6IEFQUF9QUk9UT19WSUVXO1xuXG4gIGFic3RyYWN0IGNyZWF0ZUFwcFByb3RvRWxlbWVudChcbiAgICAgIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sXG4gICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgdGFyZ2V0U3RhdGVtZW50czogU1RBVEVNRU5UW10pOiBBUFBfUFJPVE9fRUw7XG5cbiAgY3JlYXRlQ29tcGlsZVByb3RvVmlldyhcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLCB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3M6IHN0cmluZ1tdW10sIHRhcmdldFN0YXRlbWVudHM6IFNUQVRFTUVOVFtdLFxuICAgICAgdGFyZ2V0UHJvdG9WaWV3czogQ29tcGlsZVByb3RvVmlldzxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMPltdKTpcbiAgICAgIENvbXBpbGVQcm90b1ZpZXc8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTD4ge1xuICAgIHZhciBlbWJlZGRlZFRlbXBsYXRlSW5kZXggPSB0YXJnZXRQcm90b1ZpZXdzLmxlbmd0aDtcbiAgICAvLyBOb3RlOiB0YXJnZXRQcm90b1ZpZXdzIG5lZWRzIHRvIGJlIGluIGRlcHRoIGZpcnN0IG9yZGVyLlxuICAgIC8vIFNvIHdlIFwicmVzZXJ2ZVwiIGEgc3BhY2UgaGVyZSB0aGF0IHdlIGZpbGwgYWZ0ZXIgdGhlIHJlY3Vyc2lvbiBpcyBkb25lXG4gICAgdGFyZ2V0UHJvdG9WaWV3cy5wdXNoKG51bGwpO1xuICAgIHZhciBidWlsZGVyID0gbmV3IFByb3RvVmlld0J1aWxkZXJWaXNpdG9yPEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUwsIGFueT4oXG4gICAgICAgIHRoaXMsIHRhcmdldFN0YXRlbWVudHMsIHRhcmdldFByb3RvVmlld3MpO1xuICAgIHRlbXBsYXRlVmlzaXRBbGwoYnVpbGRlciwgdGVtcGxhdGUpO1xuICAgIHZhciB2aWV3VHlwZSA9IGdldFZpZXdUeXBlKHRoaXMuY29tcG9uZW50LCBlbWJlZGRlZFRlbXBsYXRlSW5kZXgpO1xuICAgIHZhciBhcHBQcm90b1ZpZXcgPSB0aGlzLmNyZWF0ZUFwcFByb3RvVmlldyhcbiAgICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4LCB2aWV3VHlwZSwgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzLCB0YXJnZXRTdGF0ZW1lbnRzKTtcbiAgICB2YXIgY3B2ID0gbmV3IENvbXBpbGVQcm90b1ZpZXc8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTD4oXG4gICAgICAgIGVtYmVkZGVkVGVtcGxhdGVJbmRleCwgYnVpbGRlci5wcm90b0VsZW1lbnRzLCBhcHBQcm90b1ZpZXcpO1xuICAgIHRhcmdldFByb3RvVmlld3NbZW1iZWRkZWRUZW1wbGF0ZUluZGV4XSA9IGNwdjtcbiAgICByZXR1cm4gY3B2O1xuICB9XG59XG5cbmNsYXNzIENvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5IGV4dGVuZHMgUHJvdG9WaWV3RmFjdG9yeTxFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBTdGF0ZW1lbnQ+IHtcbiAgcHJpdmF0ZSBfbmV4dFZhcklkOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHI6IEV4cHJlc3Npb24sIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgcHVibGljIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10pIHtcbiAgICBzdXBlcihjb21wb25lbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbmV4dFByb3RvVmlld1ZhcihlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBhcHBQcm90b1ZpZXcke3RoaXMuX25leHRWYXJJZCsrfV8ke3RoaXMuY29tcG9uZW50LnR5cGUubmFtZX0ke2VtYmVkZGVkVGVtcGxhdGVJbmRleH1gO1xuICB9XG5cbiAgY3JlYXRlQXBwUHJvdG9WaWV3KFxuICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIsIHZpZXdUeXBlOiBWaWV3VHlwZSwgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzOiBzdHJpbmdbXVtdLFxuICAgICAgdGFyZ2V0U3RhdGVtZW50czogU3RhdGVtZW50W10pOiBFeHByZXNzaW9uIHtcbiAgICB2YXIgcHJvdG9WaWV3VmFyTmFtZSA9IHRoaXMuX25leHRQcm90b1ZpZXdWYXIoZW1iZWRkZWRUZW1wbGF0ZUluZGV4KTtcbiAgICB2YXIgdmlld1R5cGVFeHByID0gY29kZUdlblZpZXdUeXBlKHZpZXdUeXBlKTtcbiAgICB2YXIgcGlwZXNFeHByID0gZW1iZWRkZWRUZW1wbGF0ZUluZGV4ID09PSAwID9cbiAgICAgICAgY29kZUdlblR5cGVzQXJyYXkodGhpcy5waXBlcy5tYXAocGlwZU1ldGEgPT4gcGlwZU1ldGEudHlwZSkpIDpcbiAgICAgICAgbnVsbDtcbiAgICB2YXIgc3RhdGVtZW50ID1cbiAgICAgICAgYHZhciAke3Byb3RvVmlld1Zhck5hbWV9ID0gJHtBUFBfVklFV19NT0RVTEVfUkVGfUFwcFByb3RvVmlldy5jcmVhdGUoJHt0aGlzLnJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHIuZXhwcmVzc2lvbn0sICR7dmlld1R5cGVFeHByfSwgJHtwaXBlc0V4cHJ9LCAke2NvZGVHZW5TdHJpbmdNYXAodGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKX0pO2A7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKG5ldyBTdGF0ZW1lbnQoc3RhdGVtZW50KSk7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uKHByb3RvVmlld1Zhck5hbWUpO1xuICB9XG5cbiAgY3JlYXRlQXBwUHJvdG9FbGVtZW50KFxuICAgICAgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSxcbiAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCB0YXJnZXRTdGF0ZW1lbnRzOiBTdGF0ZW1lbnRbXSk6IEV4cHJlc3Npb24ge1xuICAgIHZhciB2YXJOYW1lID0gYGFwcFByb3RvRWwke3RoaXMuX25leHRWYXJJZCsrfV8ke3RoaXMuY29tcG9uZW50LnR5cGUubmFtZX1gO1xuICAgIHZhciB2YWx1ZSA9IGAke0FQUF9FTF9NT0RVTEVfUkVGfUFwcFByb3RvRWxlbWVudC5jcmVhdGUoXG4gICAgICAgICR7dGhpcy5yZXNvbHZlZE1ldGFkYXRhQ2FjaGVFeHByLmV4cHJlc3Npb259LFxuICAgICAgICAke2JvdW5kRWxlbWVudEluZGV4fSxcbiAgICAgICAgJHtjb2RlR2VuU3RyaW5nTWFwKGF0dHJOYW1lQW5kVmFsdWVzKX0sXG4gICAgICAgICR7Y29kZUdlbkRpcmVjdGl2ZXNBcnJheShkaXJlY3RpdmVzKX0sXG4gICAgICAgICR7Y29kZUdlblN0cmluZ01hcCh2YXJpYWJsZU5hbWVBbmRWYWx1ZXMpfVxuICAgICAgKWA7XG4gICAgdmFyIHN0YXRlbWVudCA9IGB2YXIgJHt2YXJOYW1lfSA9ICR7dmFsdWV9O2A7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKG5ldyBTdGF0ZW1lbnQoc3RhdGVtZW50KSk7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uKHZhck5hbWUpO1xuICB9XG59XG5cbmNsYXNzIFJ1bnRpbWVQcm90b1ZpZXdGYWN0b3J5IGV4dGVuZHMgUHJvdG9WaWV3RmFjdG9yeTxBcHBQcm90b1ZpZXcsIEFwcFByb3RvRWxlbWVudCwgYW55PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG1ldGFkYXRhQ2FjaGU6IFJlc29sdmVkTWV0YWRhdGFDYWNoZSwgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBwdWJsaWMgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSkge1xuICAgIHN1cGVyKGNvbXBvbmVudCk7XG4gIH1cblxuICBjcmVhdGVBcHBQcm90b1ZpZXcoXG4gICAgICBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlciwgdmlld1R5cGU6IFZpZXdUeXBlLCB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3M6IHN0cmluZ1tdW10sXG4gICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBhbnlbXSk6IEFwcFByb3RvVmlldyB7XG4gICAgdmFyIHBpcGVzID1cbiAgICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4ID09PSAwID8gdGhpcy5waXBlcy5tYXAocGlwZU1ldGEgPT4gcGlwZU1ldGEudHlwZS5ydW50aW1lKSA6IFtdO1xuICAgIHZhciB0ZW1wbGF0ZVZhcnMgPSBrZXlWYWx1ZUFycmF5VG9TdHJpbmdNYXAodGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgICByZXR1cm4gQXBwUHJvdG9WaWV3LmNyZWF0ZSh0aGlzLm1ldGFkYXRhQ2FjaGUsIHZpZXdUeXBlLCBwaXBlcywgdGVtcGxhdGVWYXJzKTtcbiAgfVxuXG4gIGNyZWF0ZUFwcFByb3RvRWxlbWVudChcbiAgICAgIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sXG4gICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgdGFyZ2V0U3RhdGVtZW50czogYW55W10pOiBBcHBQcm90b0VsZW1lbnQge1xuICAgIHZhciBhdHRycyA9IGtleVZhbHVlQXJyYXlUb1N0cmluZ01hcChhdHRyTmFtZUFuZFZhbHVlcyk7XG4gICAgcmV0dXJuIEFwcFByb3RvRWxlbWVudC5jcmVhdGUoXG4gICAgICAgIHRoaXMubWV0YWRhdGFDYWNoZSwgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJzLFxuICAgICAgICBkaXJlY3RpdmVzLm1hcChkaXJNZXRhID0+IGRpck1ldGEudHlwZS5ydW50aW1lKSxcbiAgICAgICAga2V5VmFsdWVBcnJheVRvU3RyaW5nTWFwKHZhcmlhYmxlTmFtZUFuZFZhbHVlcykpO1xuICB9XG59XG5cbmNsYXNzIFByb3RvVmlld0J1aWxkZXJWaXNpdG9yPEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUwsIFNUQVRFTUVOVD4gaW1wbGVtZW50c1xuICAgIFRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByb3RvRWxlbWVudHM6IENvbXBpbGVQcm90b0VsZW1lbnQ8QVBQX1BST1RPX0VMPltdID0gW107XG4gIGJvdW5kRWxlbWVudENvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGZhY3Rvcnk6IFByb3RvVmlld0ZhY3Rvcnk8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPixcbiAgICAgIHB1YmxpYyBhbGxTdGF0ZW1lbnRzOiBTVEFURU1FTlRbXSxcbiAgICAgIHB1YmxpYyBhbGxQcm90b1ZpZXdzOiBDb21waWxlUHJvdG9WaWV3PEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUw+W10pIHt9XG5cbiAgcHJpdmF0ZSBfcmVhZEF0dHJOYW1lQW5kVmFsdWVzKGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBhdHRyQXN0czogVGVtcGxhdGVBc3RbXSk6XG4gICAgICBzdHJpbmdbXVtdIHtcbiAgICB2YXIgYXR0cnMgPSB2aXNpdEFuZFJldHVybkNvbnRleHQodGhpcywgYXR0ckFzdHMsIHt9KTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlTWV0YSA9PiB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlTWV0YS5ob3N0QXR0cmlidXRlcywgKHZhbHVlOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gYXR0cnNbbmFtZV07XG4gICAgICAgIGF0dHJzW25hbWVdID0gaXNQcmVzZW50KHByZXZWYWx1ZSkgPyBtZXJnZUF0dHJpYnV0ZVZhbHVlKG5hbWUsIHByZXZWYWx1ZSwgdmFsdWUpIDogdmFsdWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWFwVG9LZXlWYWx1ZUFycmF5KGF0dHJzKTtcbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudEluZGV4ID0gbnVsbDtcbiAgICBpZiAoYXN0LmlzQm91bmQoKSkge1xuICAgICAgYm91bmRFbGVtZW50SW5kZXggPSB0aGlzLmJvdW5kRWxlbWVudENvdW50Kys7XG4gICAgfVxuICAgIHZhciBjb21wb25lbnQgPSBhc3QuZ2V0Q29tcG9uZW50KCk7XG5cbiAgICB2YXIgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50KSkge1xuICAgICAgYXN0LmV4cG9ydEFzVmFycy5mb3JFYWNoKCh2YXJBc3QpID0+IHsgdmFyaWFibGVOYW1lQW5kVmFsdWVzLnB1c2goW3ZhckFzdC5uYW1lLCBudWxsXSk7IH0pO1xuICAgIH1cbiAgICB2YXIgZGlyZWN0aXZlcyA9IFtdO1xuICAgIHZhciByZW5kZXJFdmVudHM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+ID1cbiAgICAgICAgdmlzaXRBbmRSZXR1cm5Db250ZXh0KHRoaXMsIGFzdC5vdXRwdXRzLCBuZXcgTWFwPHN0cmluZywgQm91bmRFdmVudEFzdD4oKSk7XG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChhc3QuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZUFzdDogRGlyZWN0aXZlQXN0LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBkaXJlY3RpdmVBc3QudmlzaXQoXG4gICAgICAgICAgdGhpcywgbmV3IERpcmVjdGl2ZUNvbnRleHQoXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LCBib3VuZEVsZW1lbnRJbmRleCwgcmVuZGVyRXZlbnRzLCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXMsIGRpcmVjdGl2ZXMpKTtcbiAgICB9KTtcbiAgICB2YXIgcmVuZGVyRXZlbnRBcnJheSA9IFtdO1xuICAgIHJlbmRlckV2ZW50cy5mb3JFYWNoKChldmVudEFzdCwgXykgPT4gcmVuZGVyRXZlbnRBcnJheS5wdXNoKGV2ZW50QXN0KSk7XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSB0aGlzLl9yZWFkQXR0ck5hbWVBbmRWYWx1ZXMoZGlyZWN0aXZlcywgYXN0LmF0dHJzKTtcbiAgICB0aGlzLl9hZGRQcm90b0VsZW1lbnQoXG4gICAgICAgIGFzdC5pc0JvdW5kKCksIGJvdW5kRWxlbWVudEluZGV4LCBhdHRyTmFtZUFuZFZhbHVlcywgdmFyaWFibGVOYW1lQW5kVmFsdWVzLFxuICAgICAgICByZW5kZXJFdmVudEFycmF5LCBkaXJlY3RpdmVzLCBudWxsKTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBib3VuZEVsZW1lbnRJbmRleCA9IHRoaXMuYm91bmRFbGVtZW50Q291bnQrKztcbiAgICB2YXIgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10gPSBbXTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGFzdC5kaXJlY3RpdmVzLCAoZGlyZWN0aXZlQXN0OiBEaXJlY3RpdmVBc3QsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGRpcmVjdGl2ZUFzdC52aXNpdChcbiAgICAgICAgICB0aGlzLCBuZXcgRGlyZWN0aXZlQ29udGV4dChcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgsIGJvdW5kRWxlbWVudEluZGV4LCBuZXcgTWFwPHN0cmluZywgQm91bmRFdmVudEFzdD4oKSwgW10sIGRpcmVjdGl2ZXMpKTtcbiAgICB9KTtcblxuICAgIHZhciBhdHRyTmFtZUFuZFZhbHVlcyA9IHRoaXMuX3JlYWRBdHRyTmFtZUFuZFZhbHVlcyhkaXJlY3RpdmVzLCBhc3QuYXR0cnMpO1xuICAgIHZhciB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MgPSBhc3QudmFycy5tYXAoXG4gICAgICAgIHZhckFzdCA9PiBbdmFyQXN0LnZhbHVlLmxlbmd0aCA+IDAgPyB2YXJBc3QudmFsdWUgOiBJTVBMSUNJVF9URU1QTEFURV9WQVIsIHZhckFzdC5uYW1lXSk7XG4gICAgdmFyIG5lc3RlZFByb3RvVmlldyA9IHRoaXMuZmFjdG9yeS5jcmVhdGVDb21waWxlUHJvdG9WaWV3KFxuICAgICAgICBhc3QuY2hpbGRyZW4sIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncywgdGhpcy5hbGxTdGF0ZW1lbnRzLCB0aGlzLmFsbFByb3RvVmlld3MpO1xuICAgIHRoaXMuX2FkZFByb3RvRWxlbWVudChcbiAgICAgICAgdHJ1ZSwgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzLCBbXSwgW10sIGRpcmVjdGl2ZXMsXG4gICAgICAgIG5lc3RlZFByb3RvVmlldy5lbWJlZGRlZFRlbXBsYXRlSW5kZXgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUHJvdG9FbGVtZW50KFxuICAgICAgaXNCb3VuZDogYm9vbGVhbiwgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLFxuICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLCByZW5kZXJFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlcikge1xuICAgIHZhciBhcHBQcm90b0VsID0gbnVsbDtcbiAgICBpZiAoaXNCb3VuZCkge1xuICAgICAgYXBwUHJvdG9FbCA9IHRoaXMuZmFjdG9yeS5jcmVhdGVBcHBQcm90b0VsZW1lbnQoXG4gICAgICAgICAgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzLCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXMsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgdGhpcy5hbGxTdGF0ZW1lbnRzKTtcbiAgICB9XG4gICAgdmFyIGNvbXBpbGVQcm90b0VsID0gbmV3IENvbXBpbGVQcm90b0VsZW1lbnQ8QVBQX1BST1RPX0VMPihcbiAgICAgICAgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzLCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXMsIHJlbmRlckV2ZW50cywgZGlyZWN0aXZlcyxcbiAgICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4LCBhcHBQcm90b0VsKTtcbiAgICB0aGlzLnByb3RvRWxlbWVudHMucHVzaChjb21waWxlUHJvdG9FbCk7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRBdHRyKGFzdDogQXR0ckFzdCwgYXR0ck5hbWVBbmRWYWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogYW55IHtcbiAgICBhdHRyTmFtZUFuZFZhbHVlc1thc3QubmFtZV0gPSBhc3QudmFsdWU7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGN0eDogRGlyZWN0aXZlQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnRhcmdldERpcmVjdGl2ZXMucHVzaChhc3QuZGlyZWN0aXZlKTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5ob3N0RXZlbnRzLCBjdHguaG9zdEV2ZW50VGFyZ2V0QW5kTmFtZXMpO1xuICAgIGFzdC5leHBvcnRBc1ZhcnMuZm9yRWFjaCh2YXJBc3QgPT4ge1xuICAgICAgY3R4LnRhcmdldFZhcmlhYmxlTmFtZUFuZFZhbHVlcy5wdXNoKFt2YXJBc3QubmFtZSwgY3R4LmluZGV4XSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+KTogYW55IHtcbiAgICBldmVudFRhcmdldEFuZE5hbWVzLnNldChhc3QuZnVsbE5hbWUsIGFzdCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG5cbmZ1bmN0aW9uIG1hcFRvS2V5VmFsdWVBcnJheShkYXRhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZ1tdW10ge1xuICB2YXIgZW50cnlBcnJheTogc3RyaW5nW11bXSA9IFtdO1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGF0YSwgKHZhbHVlOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4ge1xuICAgIGVudHJ5QXJyYXkucHVzaChbbmFtZSwgdmFsdWVdKTtcbiAgfSk7XG4gIC8vIFdlIG5lZWQgdG8gc29ydCB0byBnZXQgYSBkZWZpbmVkIG91dHB1dCBvcmRlclxuICAvLyBmb3IgdGVzdHMgYW5kIGZvciBjYWNoaW5nIGdlbmVyYXRlZCBhcnRpZmFjdHMuLi5cbiAgTGlzdFdyYXBwZXIuc29ydDxzdHJpbmdbXT4oXG4gICAgICBlbnRyeUFycmF5LFxuICAgICAgKGVudHJ5MTogc3RyaW5nW10sIGVudHJ5Mjogc3RyaW5nW10pID0+IFN0cmluZ1dyYXBwZXIuY29tcGFyZShlbnRyeTFbMF0sIGVudHJ5MlswXSkpO1xuICB2YXIga2V5VmFsdWVBcnJheTogc3RyaW5nW11bXSA9IFtdO1xuICBlbnRyeUFycmF5LmZvckVhY2goKGVudHJ5KSA9PiB7IGtleVZhbHVlQXJyYXkucHVzaChbZW50cnlbMF0sIGVudHJ5WzFdXSk7IH0pO1xuICByZXR1cm4ga2V5VmFsdWVBcnJheTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWUxOiBzdHJpbmcsIGF0dHJWYWx1ZTI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChhdHRyTmFtZSA9PSBDTEFTU19BVFRSIHx8IGF0dHJOYW1lID09IFNUWUxFX0FUVFIpIHtcbiAgICByZXR1cm4gYCR7YXR0clZhbHVlMX0gJHthdHRyVmFsdWUyfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGF0dHJWYWx1ZTI7XG4gIH1cbn1cblxuY2xhc3MgRGlyZWN0aXZlQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLFxuICAgICAgcHVibGljIGhvc3RFdmVudFRhcmdldEFuZE5hbWVzOiBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0PixcbiAgICAgIHB1YmxpYyB0YXJnZXRWYXJpYWJsZU5hbWVBbmRWYWx1ZXM6IGFueVtdW10sXG4gICAgICBwdWJsaWMgdGFyZ2V0RGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10pIHt9XG59XG5cbmZ1bmN0aW9uIGtleVZhbHVlQXJyYXlUb1N0cmluZ01hcChrZXlWYWx1ZUFycmF5OiBhbnlbXVtdKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICB2YXIgc3RyaW5nTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleVZhbHVlQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZW50cnkgPSBrZXlWYWx1ZUFycmF5W2ldO1xuICAgIHN0cmluZ01hcFtlbnRyeVswXV0gPSBlbnRyeVsxXTtcbiAgfVxuICByZXR1cm4gc3RyaW5nTWFwO1xufVxuXG5mdW5jdGlvbiBjb2RlR2VuRGlyZWN0aXZlc0FycmF5KGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdKTogc3RyaW5nIHtcbiAgdmFyIGV4cHJlc3Npb25zID0gZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlVHlwZSA9PiB0eXBlUmVmKGRpcmVjdGl2ZVR5cGUudHlwZSkpO1xuICByZXR1cm4gYFske2V4cHJlc3Npb25zLmpvaW4oJywnKX1dYDtcbn1cblxuZnVuY3Rpb24gY29kZUdlblR5cGVzQXJyYXkodHlwZXM6IENvbXBpbGVUeXBlTWV0YWRhdGFbXSk6IHN0cmluZyB7XG4gIHZhciBleHByZXNzaW9ucyA9IHR5cGVzLm1hcCh0eXBlUmVmKTtcbiAgcmV0dXJuIGBbJHtleHByZXNzaW9ucy5qb2luKCcsJyl9XWA7XG59XG5cbmZ1bmN0aW9uIGNvZGVHZW5WaWV3VHlwZSh2YWx1ZTogVmlld1R5cGUpOiBzdHJpbmcge1xuICBpZiAoSVNfREFSVCkge1xuICAgIHJldHVybiBgJHtWSUVXX1RZUEVfTU9EVUxFX1JFRn0ke3ZhbHVlfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGAke3ZhbHVlfWA7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHlwZVJlZih0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke21vZHVsZVJlZih0eXBlLm1vZHVsZVVybCl9JHt0eXBlLm5hbWV9YDtcbn1cblxuZnVuY3Rpb24gZ2V0Vmlld1R5cGUoY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGVtYmVkZGVkVGVtcGxhdGVJbmRleDogbnVtYmVyKTogVmlld1R5cGUge1xuICBpZiAoZW1iZWRkZWRUZW1wbGF0ZUluZGV4ID4gMCkge1xuICAgIHJldHVybiBWaWV3VHlwZS5FTUJFRERFRDtcbiAgfSBlbHNlIGlmIChjb21wb25lbnQudHlwZS5pc0hvc3QpIHtcbiAgICByZXR1cm4gVmlld1R5cGUuSE9TVDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gVmlld1R5cGUuQ09NUE9ORU5UO1xuICB9XG59XG4iXX0=