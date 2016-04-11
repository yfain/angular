'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * A segment of text within the template.
 */
var TextAst = (function () {
    function TextAst(value, ngContentIndex, sourceSpan) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    TextAst.prototype.visit = function (visitor, context) { return visitor.visitText(this, context); };
    return TextAst;
})();
exports.TextAst = TextAst;
/**
 * A bound expression within the text of a template.
 */
var BoundTextAst = (function () {
    function BoundTextAst(value, ngContentIndex, sourceSpan) {
        this.value = value;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    BoundTextAst.prototype.visit = function (visitor, context) {
        return visitor.visitBoundText(this, context);
    };
    return BoundTextAst;
})();
exports.BoundTextAst = BoundTextAst;
/**
 * A plain attribute on an element.
 */
var AttrAst = (function () {
    function AttrAst(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    AttrAst.prototype.visit = function (visitor, context) { return visitor.visitAttr(this, context); };
    return AttrAst;
})();
exports.AttrAst = AttrAst;
/**
 * A binding for an element property (e.g. `[property]="expression"`).
 */
var BoundElementPropertyAst = (function () {
    function BoundElementPropertyAst(name, type, value, unit, sourceSpan) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.sourceSpan = sourceSpan;
    }
    BoundElementPropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitElementProperty(this, context);
    };
    return BoundElementPropertyAst;
})();
exports.BoundElementPropertyAst = BoundElementPropertyAst;
/**
 * A binding for an element event (e.g. `(event)="handler()"`).
 */
var BoundEventAst = (function () {
    function BoundEventAst(name, target, handler, sourceSpan) {
        this.name = name;
        this.target = target;
        this.handler = handler;
        this.sourceSpan = sourceSpan;
    }
    BoundEventAst.prototype.visit = function (visitor, context) {
        return visitor.visitEvent(this, context);
    };
    Object.defineProperty(BoundEventAst.prototype, "fullName", {
        get: function () {
            if (lang_1.isPresent(this.target)) {
                return this.target + ":" + this.name;
            }
            else {
                return this.name;
            }
        },
        enumerable: true,
        configurable: true
    });
    return BoundEventAst;
})();
exports.BoundEventAst = BoundEventAst;
/**
 * A variable declaration on an element (e.g. `#var="expression"`).
 */
var VariableAst = (function () {
    function VariableAst(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    VariableAst.prototype.visit = function (visitor, context) {
        return visitor.visitVariable(this, context);
    };
    return VariableAst;
})();
exports.VariableAst = VariableAst;
/**
 * An element declaration in a template.
 */
var ElementAst = (function () {
    function ElementAst(name, attrs, inputs, outputs, exportAsVars, directives, children, ngContentIndex, sourceSpan) {
        this.name = name;
        this.attrs = attrs;
        this.inputs = inputs;
        this.outputs = outputs;
        this.exportAsVars = exportAsVars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    ElementAst.prototype.visit = function (visitor, context) {
        return visitor.visitElement(this, context);
    };
    /**
     * Whether the element has any active bindings (inputs, outputs, vars, or directives).
     */
    ElementAst.prototype.isBound = function () {
        return (this.inputs.length > 0 || this.outputs.length > 0 || this.exportAsVars.length > 0 ||
            this.directives.length > 0);
    };
    /**
     * Get the component associated with this element, if any.
     */
    ElementAst.prototype.getComponent = function () {
        return this.directives.length > 0 && this.directives[0].directive.isComponent ?
            this.directives[0].directive :
            null;
    };
    return ElementAst;
})();
exports.ElementAst = ElementAst;
/**
 * A `<template>` element included in an Angular template.
 */
var EmbeddedTemplateAst = (function () {
    function EmbeddedTemplateAst(attrs, outputs, vars, directives, children, ngContentIndex, sourceSpan) {
        this.attrs = attrs;
        this.outputs = outputs;
        this.vars = vars;
        this.directives = directives;
        this.children = children;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    EmbeddedTemplateAst.prototype.visit = function (visitor, context) {
        return visitor.visitEmbeddedTemplate(this, context);
    };
    return EmbeddedTemplateAst;
})();
exports.EmbeddedTemplateAst = EmbeddedTemplateAst;
/**
 * A directive property with a bound value (e.g. `*ngIf="condition").
 */
var BoundDirectivePropertyAst = (function () {
    function BoundDirectivePropertyAst(directiveName, templateName, value, sourceSpan) {
        this.directiveName = directiveName;
        this.templateName = templateName;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    BoundDirectivePropertyAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirectiveProperty(this, context);
    };
    return BoundDirectivePropertyAst;
})();
exports.BoundDirectivePropertyAst = BoundDirectivePropertyAst;
/**
 * A directive declared on an element.
 */
var DirectiveAst = (function () {
    function DirectiveAst(directive, inputs, hostProperties, hostEvents, exportAsVars, sourceSpan) {
        this.directive = directive;
        this.inputs = inputs;
        this.hostProperties = hostProperties;
        this.hostEvents = hostEvents;
        this.exportAsVars = exportAsVars;
        this.sourceSpan = sourceSpan;
    }
    DirectiveAst.prototype.visit = function (visitor, context) {
        return visitor.visitDirective(this, context);
    };
    return DirectiveAst;
})();
exports.DirectiveAst = DirectiveAst;
/**
 * Position where content is to be projected (instance of `<ng-content>` in a template).
 */
var NgContentAst = (function () {
    function NgContentAst(index, ngContentIndex, sourceSpan) {
        this.index = index;
        this.ngContentIndex = ngContentIndex;
        this.sourceSpan = sourceSpan;
    }
    NgContentAst.prototype.visit = function (visitor, context) {
        return visitor.visitNgContent(this, context);
    };
    return NgContentAst;
})();
exports.NgContentAst = NgContentAst;
/**
 * Enumeration of types of property bindings.
 */
(function (PropertyBindingType) {
    /**
     * A normal binding to a property (e.g. `[property]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Property"] = 0] = "Property";
    /**
     * A binding to an element attribute (e.g. `[attr.name]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Attribute"] = 1] = "Attribute";
    /**
     * A binding to a CSS class (e.g. `[class.name]="condition"`).
     */
    PropertyBindingType[PropertyBindingType["Class"] = 2] = "Class";
    /**
     * A binding to a style rule (e.g. `[style.rule]="expression"`).
     */
    PropertyBindingType[PropertyBindingType["Style"] = 3] = "Style";
})(exports.PropertyBindingType || (exports.PropertyBindingType = {}));
var PropertyBindingType = exports.PropertyBindingType;
/**
 * Visit every node in a list of {@link TemplateAst}s with the given {@link TemplateAstVisitor}.
 */
function templateVisitAll(visitor, asts, context) {
    if (context === void 0) { context = null; }
    var result = [];
    asts.forEach(function (ast) {
        var astResult = ast.visit(visitor, context);
        if (lang_1.isPresent(astResult)) {
            result.push(astResult);
        }
    });
    return result;
}
exports.templateVisitAll = templateVisitAll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX2FzdC50cyJdLCJuYW1lcyI6WyJUZXh0QXN0IiwiVGV4dEFzdC5jb25zdHJ1Y3RvciIsIlRleHRBc3QudmlzaXQiLCJCb3VuZFRleHRBc3QiLCJCb3VuZFRleHRBc3QuY29uc3RydWN0b3IiLCJCb3VuZFRleHRBc3QudmlzaXQiLCJBdHRyQXN0IiwiQXR0ckFzdC5jb25zdHJ1Y3RvciIsIkF0dHJBc3QudmlzaXQiLCJCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCIsIkJvdW5kRWxlbWVudFByb3BlcnR5QXN0LmNvbnN0cnVjdG9yIiwiQm91bmRFbGVtZW50UHJvcGVydHlBc3QudmlzaXQiLCJCb3VuZEV2ZW50QXN0IiwiQm91bmRFdmVudEFzdC5jb25zdHJ1Y3RvciIsIkJvdW5kRXZlbnRBc3QudmlzaXQiLCJCb3VuZEV2ZW50QXN0LmZ1bGxOYW1lIiwiVmFyaWFibGVBc3QiLCJWYXJpYWJsZUFzdC5jb25zdHJ1Y3RvciIsIlZhcmlhYmxlQXN0LnZpc2l0IiwiRWxlbWVudEFzdCIsIkVsZW1lbnRBc3QuY29uc3RydWN0b3IiLCJFbGVtZW50QXN0LnZpc2l0IiwiRWxlbWVudEFzdC5pc0JvdW5kIiwiRWxlbWVudEFzdC5nZXRDb21wb25lbnQiLCJFbWJlZGRlZFRlbXBsYXRlQXN0IiwiRW1iZWRkZWRUZW1wbGF0ZUFzdC5jb25zdHJ1Y3RvciIsIkVtYmVkZGVkVGVtcGxhdGVBc3QudmlzaXQiLCJCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0IiwiQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdC5jb25zdHJ1Y3RvciIsIkJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QudmlzaXQiLCJEaXJlY3RpdmVBc3QiLCJEaXJlY3RpdmVBc3QuY29uc3RydWN0b3IiLCJEaXJlY3RpdmVBc3QudmlzaXQiLCJOZ0NvbnRlbnRBc3QiLCJOZ0NvbnRlbnRBc3QuY29uc3RydWN0b3IiLCJOZ0NvbnRlbnRBc3QudmlzaXQiLCJQcm9wZXJ0eUJpbmRpbmdUeXBlIiwidGVtcGxhdGVWaXNpdEFsbCJdLCJtYXBwaW5ncyI6IkFBQ0EscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFtQm5EOztHQUVHO0FBQ0g7SUFDRUEsaUJBQ1dBLEtBQWFBLEVBQVNBLGNBQXNCQSxFQUFTQSxVQUEyQkE7UUFBaEZDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO1FBQVNBLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFRQTtRQUFTQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDL0ZELHVCQUFLQSxHQUFMQSxVQUFNQSxPQUEyQkEsRUFBRUEsT0FBWUEsSUFBU0UsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcEdGLGNBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUpZLGVBQU8sVUFJbkIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUcsc0JBQ1dBLEtBQVVBLEVBQVNBLGNBQXNCQSxFQUFTQSxVQUEyQkE7UUFBN0VDLFVBQUtBLEdBQUxBLEtBQUtBLENBQUtBO1FBQVNBLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFRQTtRQUFTQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDNUZELDRCQUFLQSxHQUFMQSxVQUFNQSxPQUEyQkEsRUFBRUEsT0FBWUE7UUFDN0NFLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUNIRixtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFORCxJQU1DO0FBTlksb0JBQVksZUFNeEIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUcsaUJB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QUNBO0FBVmUsd0JBQWdCLG1CQVUvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfSBmcm9tICcuL2RpcmVjdGl2ZV9tZXRhZGF0YSc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcblxuLyoqXG4gKiBBbiBBYnN0cmFjdCBTeW50YXggVHJlZSBub2RlIHJlcHJlc2VudGluZyBwYXJ0IG9mIGEgcGFyc2VkIEFuZ3VsYXIgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVBc3Qge1xuICAvKipcbiAgICogVGhlIHNvdXJjZSBzcGFuIGZyb20gd2hpY2ggdGhpcyBub2RlIHdhcyBwYXJzZWQuXG4gICAqL1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG5cbiAgLyoqXG4gICAqIFZpc2l0IHRoaXMgbm9kZSBhbmQgcG9zc2libHkgdHJhbnNmb3JtIGl0LlxuICAgKi9cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQSBzZWdtZW50IG9mIHRleHQgd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRleHRBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0VGV4dCh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG4vKipcbiAqIEEgYm91bmQgZXhwcmVzc2lvbiB3aXRoaW4gdGhlIHRleHQgb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvdW5kVGV4dEFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgcGxhaW4gYXR0cmlidXRlIG9uIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEF0dHIodGhpcywgY29udGV4dCk7IH1cbn1cblxuLyoqXG4gKiBBIGJpbmRpbmcgZm9yIGFuIGVsZW1lbnQgcHJvcGVydHkgKGUuZy4gYFtwcm9wZXJ0eV09XCJleHByZXNzaW9uXCJgKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBQcm9wZXJ0eUJpbmRpbmdUeXBlLCBwdWJsaWMgdmFsdWU6IEFTVCwgcHVibGljIHVuaXQ6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnRQcm9wZXJ0eSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgYmluZGluZyBmb3IgYW4gZWxlbWVudCBldmVudCAoZS5nLiBgKGV2ZW50KT1cImhhbmRsZXIoKVwiYCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBCb3VuZEV2ZW50QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0YXJnZXQ6IHN0cmluZywgcHVibGljIGhhbmRsZXI6IEFTVCxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEV2ZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG4gIGdldCBmdWxsTmFtZSgpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMudGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIGAke3RoaXMudGFyZ2V0fToke3RoaXMubmFtZX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5uYW1lO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdmFyaWFibGUgZGVjbGFyYXRpb24gb24gYW4gZWxlbWVudCAoZS5nLiBgI3Zhcj1cImV4cHJlc3Npb25cImApLlxuICovXG5leHBvcnQgY2xhc3MgVmFyaWFibGVBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRWYXJpYWJsZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGVsZW1lbnQgZGVjbGFyYXRpb24gaW4gYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVsZW1lbnRBc3QgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGF0dHJzOiBBdHRyQXN0W10sIHB1YmxpYyBpbnB1dHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10sXG4gICAgICBwdWJsaWMgb3V0cHV0czogQm91bmRFdmVudEFzdFtdLCBwdWJsaWMgZXhwb3J0QXNWYXJzOiBWYXJpYWJsZUFzdFtdLFxuICAgICAgcHVibGljIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLCBwdWJsaWMgY2hpbGRyZW46IFRlbXBsYXRlQXN0W10sXG4gICAgICBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RWxlbWVudCh0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBlbGVtZW50IGhhcyBhbnkgYWN0aXZlIGJpbmRpbmdzIChpbnB1dHMsIG91dHB1dHMsIHZhcnMsIG9yIGRpcmVjdGl2ZXMpLlxuICAgKi9cbiAgaXNCb3VuZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmlucHV0cy5sZW5ndGggPiAwIHx8IHRoaXMub3V0cHV0cy5sZW5ndGggPiAwIHx8IHRoaXMuZXhwb3J0QXNWYXJzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzLmxlbmd0aCA+IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29tcG9uZW50IGFzc29jaWF0ZWQgd2l0aCB0aGlzIGVsZW1lbnQsIGlmIGFueS5cbiAgICovXG4gIGdldENvbXBvbmVudCgpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXMubGVuZ3RoID4gMCAmJiB0aGlzLmRpcmVjdGl2ZXNbMF0uZGlyZWN0aXZlLmlzQ29tcG9uZW50ID9cbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzWzBdLmRpcmVjdGl2ZSA6XG4gICAgICAgIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGA8dGVtcGxhdGU+YCBlbGVtZW50IGluY2x1ZGVkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbWJlZGRlZFRlbXBsYXRlQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBhdHRyczogQXR0ckFzdFtdLCBwdWJsaWMgb3V0cHV0czogQm91bmRFdmVudEFzdFtdLCBwdWJsaWMgdmFyczogVmFyaWFibGVBc3RbXSxcbiAgICAgIHB1YmxpYyBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSwgcHVibGljIGNoaWxkcmVuOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgcHVibGljIG5nQ29udGVudEluZGV4OiBudW1iZXIsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVtYmVkZGVkVGVtcGxhdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBwcm9wZXJ0eSB3aXRoIGEgYm91bmQgdmFsdWUgKGUuZy4gYCpuZ0lmPVwiY29uZGl0aW9uXCIpLlxuICovXG5leHBvcnQgY2xhc3MgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCBpbXBsZW1lbnRzIFRlbXBsYXRlQXN0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgZGlyZWN0aXZlTmFtZTogc3RyaW5nLCBwdWJsaWMgdGVtcGxhdGVOYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogQVNULFxuICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGlyZWN0aXZlUHJvcGVydHkodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSBkZWNsYXJlZCBvbiBhbiBlbGVtZW50LlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlQXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgcHVibGljIGlucHV0czogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdLFxuICAgICAgcHVibGljIGhvc3RQcm9wZXJ0aWVzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdLCBwdWJsaWMgaG9zdEV2ZW50czogQm91bmRFdmVudEFzdFtdLFxuICAgICAgcHVibGljIGV4cG9ydEFzVmFyczogVmFyaWFibGVBc3RbXSwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RGlyZWN0aXZlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogUG9zaXRpb24gd2hlcmUgY29udGVudCBpcyB0byBiZSBwcm9qZWN0ZWQgKGluc3RhbmNlIG9mIGA8bmctY29udGVudD5gIGluIGEgdGVtcGxhdGUpLlxuICovXG5leHBvcnQgY2xhc3MgTmdDb250ZW50QXN0IGltcGxlbWVudHMgVGVtcGxhdGVBc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbmdDb250ZW50SW5kZXg6IG51bWJlciwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogVGVtcGxhdGVBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TmdDb250ZW50KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogRW51bWVyYXRpb24gb2YgdHlwZXMgb2YgcHJvcGVydHkgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCBlbnVtIFByb3BlcnR5QmluZGluZ1R5cGUge1xuXG4gIC8qKlxuICAgKiBBIG5vcm1hbCBiaW5kaW5nIHRvIGEgcHJvcGVydHkgKGUuZy4gYFtwcm9wZXJ0eV09XCJleHByZXNzaW9uXCJgKS5cbiAgICovXG4gIFByb3BlcnR5LFxuXG4gIC8qKlxuICAgKiBBIGJpbmRpbmcgdG8gYW4gZWxlbWVudCBhdHRyaWJ1dGUgKGUuZy4gYFthdHRyLm5hbWVdPVwiZXhwcmVzc2lvblwiYCkuXG4gICAqL1xuICBBdHRyaWJ1dGUsXG5cbiAgLyoqXG4gICAqIEEgYmluZGluZyB0byBhIENTUyBjbGFzcyAoZS5nLiBgW2NsYXNzLm5hbWVdPVwiY29uZGl0aW9uXCJgKS5cbiAgICovXG4gIENsYXNzLFxuXG4gIC8qKlxuICAgKiBBIGJpbmRpbmcgdG8gYSBzdHlsZSBydWxlIChlLmcuIGBbc3R5bGUucnVsZV09XCJleHByZXNzaW9uXCJgKS5cbiAgICovXG4gIFN0eWxlXG59XG5cbi8qKlxuICogQSB2aXNpdG9yIGZvciB7QGxpbmsgVGVtcGxhdGVBc3R9IHRyZWVzIHRoYXQgd2lsbCBwcm9jZXNzIGVhY2ggbm9kZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRWYXJpYWJsZShhc3Q6IFZhcmlhYmxlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRBdHRyKGFzdDogQXR0ckFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogVmlzaXQgZXZlcnkgbm9kZSBpbiBhIGxpc3Qgb2Yge0BsaW5rIFRlbXBsYXRlQXN0fXMgd2l0aCB0aGUgZ2l2ZW4ge0BsaW5rIFRlbXBsYXRlQXN0VmlzaXRvcn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZVZpc2l0QWxsKFxuICAgIHZpc2l0b3I6IFRlbXBsYXRlQXN0VmlzaXRvciwgYXN0czogVGVtcGxhdGVBc3RbXSwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueVtdIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBhc3RzLmZvckVhY2goYXN0ID0+IHtcbiAgICB2YXIgYXN0UmVzdWx0ID0gYXN0LnZpc2l0KHZpc2l0b3IsIGNvbnRleHQpO1xuICAgIGlmIChpc1ByZXNlbnQoYXN0UmVzdWx0KSkge1xuICAgICAgcmVzdWx0LnB1c2goYXN0UmVzdWx0KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIl19