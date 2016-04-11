'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var AST = (function () {
    function AST() {
    }
    AST.prototype.visit = function (visitor) { return null; };
    AST.prototype.toString = function () { return 'AST'; };
    return AST;
})();
exports.AST = AST;
/**
 * Represents a quoted expression of the form:
 *
 * quote = prefix `:` uninterpretedExpression
 * prefix = identifier
 * uninterpretedExpression = arbitrary string
 *
 * A quoted expression is meant to be pre-processed by an AST transformer that
 * converts it into another AST that no longer contains quoted expressions.
 * It is meant to allow third-party developers to extend Angular template
 * expression language. The `uninterpretedExpression` part of the quote is
 * therefore not interpreted by the Angular's own expression parser.
 */
var Quote = (function (_super) {
    __extends(Quote, _super);
    function Quote(prefix, uninterpretedExpression, location) {
        _super.call(this);
        this.prefix = prefix;
        this.uninterpretedExpression = uninterpretedExpression;
        this.location = location;
    }
    Quote.prototype.visit = function (visitor) { return visitor.visitQuote(this); };
    Quote.prototype.toString = function () { return 'Quote'; };
    return Quote;
})(AST);
exports.Quote = Quote;
var EmptyExpr = (function (_super) {
    __extends(EmptyExpr, _super);
    function EmptyExpr() {
        _super.apply(this, arguments);
    }
    EmptyExpr.prototype.visit = function (visitor) {
        // do nothing
    };
    return EmptyExpr;
})(AST);
exports.EmptyExpr = EmptyExpr;
var ImplicitReceiver = (function (_super) {
    __extends(ImplicitReceiver, _super);
    function ImplicitReceiver() {
        _super.apply(this, arguments);
    }
    ImplicitReceiver.prototype.visit = function (visitor) { return visitor.visitImplicitReceiver(this); };
    return ImplicitReceiver;
})(AST);
exports.ImplicitReceiver = ImplicitReceiver;
/**
 * Multiple expressions separated by a semicolon.
 */
var Chain = (function (_super) {
    __extends(Chain, _super);
    function Chain(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    Chain.prototype.visit = function (visitor) { return visitor.visitChain(this); };
    return Chain;
})(AST);
exports.Chain = Chain;
var Conditional = (function (_super) {
    __extends(Conditional, _super);
    function Conditional(condition, trueExp, falseExp) {
        _super.call(this);
        this.condition = condition;
        this.trueExp = trueExp;
        this.falseExp = falseExp;
    }
    Conditional.prototype.visit = function (visitor) { return visitor.visitConditional(this); };
    return Conditional;
})(AST);
exports.Conditional = Conditional;
var PropertyRead = (function (_super) {
    __extends(PropertyRead, _super);
    function PropertyRead(receiver, name, getter) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    PropertyRead.prototype.visit = function (visitor) { return visitor.visitPropertyRead(this); };
    return PropertyRead;
})(AST);
exports.PropertyRead = PropertyRead;
var PropertyWrite = (function (_super) {
    __extends(PropertyWrite, _super);
    function PropertyWrite(receiver, name, setter, value) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.setter = setter;
        this.value = value;
    }
    PropertyWrite.prototype.visit = function (visitor) { return visitor.visitPropertyWrite(this); };
    return PropertyWrite;
})(AST);
exports.PropertyWrite = PropertyWrite;
var SafePropertyRead = (function (_super) {
    __extends(SafePropertyRead, _super);
    function SafePropertyRead(receiver, name, getter) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.getter = getter;
    }
    SafePropertyRead.prototype.visit = function (visitor) { return visitor.visitSafePropertyRead(this); };
    return SafePropertyRead;
})(AST);
exports.SafePropertyRead = SafePropertyRead;
var KeyedRead = (function (_super) {
    __extends(KeyedRead, _super);
    function KeyedRead(obj, key) {
        _super.call(this);
        this.obj = obj;
        this.key = key;
    }
    KeyedRead.prototype.visit = function (visitor) { return visitor.visitKeyedRead(this); };
    return KeyedRead;
})(AST);
exports.KeyedRead = KeyedRead;
var KeyedWrite = (function (_super) {
    __extends(KeyedWrite, _super);
    function KeyedWrite(obj, key, value) {
        _super.call(this);
        this.obj = obj;
        this.key = key;
        this.value = value;
    }
    KeyedWrite.prototype.visit = function (visitor) { return visitor.visitKeyedWrite(this); };
    return KeyedWrite;
})(AST);
exports.KeyedWrite = KeyedWrite;
var BindingPipe = (function (_super) {
    __extends(BindingPipe, _super);
    function BindingPipe(exp, name, args) {
        _super.call(this);
        this.exp = exp;
        this.name = name;
        this.args = args;
    }
    BindingPipe.prototype.visit = function (visitor) { return visitor.visitPipe(this); };
    return BindingPipe;
})(AST);
exports.BindingPipe = BindingPipe;
var LiteralPrimitive = (function (_super) {
    __extends(LiteralPrimitive, _super);
    function LiteralPrimitive(value) {
        _super.call(this);
        this.value = value;
    }
    LiteralPrimitive.prototype.visit = function (visitor) { return visitor.visitLiteralPrimitive(this); };
    return LiteralPrimitive;
})(AST);
exports.LiteralPrimitive = LiteralPrimitive;
var LiteralArray = (function (_super) {
    __extends(LiteralArray, _super);
    function LiteralArray(expressions) {
        _super.call(this);
        this.expressions = expressions;
    }
    LiteralArray.prototype.visit = function (visitor) { return visitor.visitLiteralArray(this); };
    return LiteralArray;
})(AST);
exports.LiteralArray = LiteralArray;
var LiteralMap = (function (_super) {
    __extends(LiteralMap, _super);
    function LiteralMap(keys, values) {
        _super.call(this);
        this.keys = keys;
        this.values = values;
    }
    LiteralMap.prototype.visit = function (visitor) { return visitor.visitLiteralMap(this); };
    return LiteralMap;
})(AST);
exports.LiteralMap = LiteralMap;
var Interpolation = (function (_super) {
    __extends(Interpolation, _super);
    function Interpolation(strings, expressions) {
        _super.call(this);
        this.strings = strings;
        this.expressions = expressions;
    }
    Interpolation.prototype.visit = function (visitor) { return visitor.visitInterpolation(this); };
    return Interpolation;
})(AST);
exports.Interpolation = Interpolation;
var Binary = (function (_super) {
    __extends(Binary, _super);
    function Binary(operation, left, right) {
        _super.call(this);
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    Binary.prototype.visit = function (visitor) { return visitor.visitBinary(this); };
    return Binary;
})(AST);
exports.Binary = Binary;
var PrefixNot = (function (_super) {
    __extends(PrefixNot, _super);
    function PrefixNot(expression) {
        _super.call(this);
        this.expression = expression;
    }
    PrefixNot.prototype.visit = function (visitor) { return visitor.visitPrefixNot(this); };
    return PrefixNot;
})(AST);
exports.PrefixNot = PrefixNot;
var MethodCall = (function (_super) {
    __extends(MethodCall, _super);
    function MethodCall(receiver, name, fn, args) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    MethodCall.prototype.visit = function (visitor) { return visitor.visitMethodCall(this); };
    return MethodCall;
})(AST);
exports.MethodCall = MethodCall;
var SafeMethodCall = (function (_super) {
    __extends(SafeMethodCall, _super);
    function SafeMethodCall(receiver, name, fn, args) {
        _super.call(this);
        this.receiver = receiver;
        this.name = name;
        this.fn = fn;
        this.args = args;
    }
    SafeMethodCall.prototype.visit = function (visitor) { return visitor.visitSafeMethodCall(this); };
    return SafeMethodCall;
})(AST);
exports.SafeMethodCall = SafeMethodCall;
var FunctionCall = (function (_super) {
    __extends(FunctionCall, _super);
    function FunctionCall(target, args) {
        _super.call(this);
        this.target = target;
        this.args = args;
    }
    FunctionCall.prototype.visit = function (visitor) { return visitor.visitFunctionCall(this); };
    return FunctionCall;
})(AST);
exports.FunctionCall = FunctionCall;
var ASTWithSource = (function (_super) {
    __extends(ASTWithSource, _super);
    function ASTWithSource(ast, source, location) {
        _super.call(this);
        this.ast = ast;
        this.source = source;
        this.location = location;
    }
    ASTWithSource.prototype.visit = function (visitor) { return this.ast.visit(visitor); };
    ASTWithSource.prototype.toString = function () { return this.source + " in " + this.location; };
    return ASTWithSource;
})(AST);
exports.ASTWithSource = ASTWithSource;
var TemplateBinding = (function () {
    function TemplateBinding(key, keyIsVar, name, expression) {
        this.key = key;
        this.keyIsVar = keyIsVar;
        this.name = name;
        this.expression = expression;
    }
    return TemplateBinding;
})();
exports.TemplateBinding = TemplateBinding;
var RecursiveAstVisitor = (function () {
    function RecursiveAstVisitor() {
    }
    RecursiveAstVisitor.prototype.visitBinary = function (ast) {
        ast.left.visit(this);
        ast.right.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitChain = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitConditional = function (ast) {
        ast.condition.visit(this);
        ast.trueExp.visit(this);
        ast.falseExp.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPipe = function (ast) {
        ast.exp.visit(this);
        this.visitAll(ast.args);
        return null;
    };
    RecursiveAstVisitor.prototype.visitFunctionCall = function (ast) {
        ast.target.visit(this);
        this.visitAll(ast.args);
        return null;
    };
    RecursiveAstVisitor.prototype.visitImplicitReceiver = function (ast) { return null; };
    RecursiveAstVisitor.prototype.visitInterpolation = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitKeyedRead = function (ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitKeyedWrite = function (ast) {
        ast.obj.visit(this);
        ast.key.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitLiteralArray = function (ast) { return this.visitAll(ast.expressions); };
    RecursiveAstVisitor.prototype.visitLiteralMap = function (ast) { return this.visitAll(ast.values); };
    RecursiveAstVisitor.prototype.visitLiteralPrimitive = function (ast) { return null; };
    RecursiveAstVisitor.prototype.visitMethodCall = function (ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    };
    RecursiveAstVisitor.prototype.visitPrefixNot = function (ast) {
        ast.expression.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyRead = function (ast) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitPropertyWrite = function (ast) {
        ast.receiver.visit(this);
        ast.value.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafePropertyRead = function (ast) {
        ast.receiver.visit(this);
        return null;
    };
    RecursiveAstVisitor.prototype.visitSafeMethodCall = function (ast) {
        ast.receiver.visit(this);
        return this.visitAll(ast.args);
    };
    RecursiveAstVisitor.prototype.visitAll = function (asts) {
        var _this = this;
        asts.forEach(function (ast) { return ast.visit(_this); });
        return null;
    };
    RecursiveAstVisitor.prototype.visitQuote = function (ast) { return null; };
    return RecursiveAstVisitor;
})();
exports.RecursiveAstVisitor = RecursiveAstVisitor;
var AstTransformer = (function () {
    function AstTransformer() {
    }
    AstTransformer.prototype.visitImplicitReceiver = function (ast) { return ast; };
    AstTransformer.prototype.visitInterpolation = function (ast) {
        return new Interpolation(ast.strings, this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralPrimitive = function (ast) { return new LiteralPrimitive(ast.value); };
    AstTransformer.prototype.visitPropertyRead = function (ast) {
        return new PropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    };
    AstTransformer.prototype.visitPropertyWrite = function (ast) {
        return new PropertyWrite(ast.receiver.visit(this), ast.name, ast.setter, ast.value);
    };
    AstTransformer.prototype.visitSafePropertyRead = function (ast) {
        return new SafePropertyRead(ast.receiver.visit(this), ast.name, ast.getter);
    };
    AstTransformer.prototype.visitMethodCall = function (ast) {
        return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitSafeMethodCall = function (ast) {
        return new SafeMethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitFunctionCall = function (ast) {
        return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitLiteralArray = function (ast) {
        return new LiteralArray(this.visitAll(ast.expressions));
    };
    AstTransformer.prototype.visitLiteralMap = function (ast) {
        return new LiteralMap(ast.keys, this.visitAll(ast.values));
    };
    AstTransformer.prototype.visitBinary = function (ast) {
        return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
    };
    AstTransformer.prototype.visitPrefixNot = function (ast) { return new PrefixNot(ast.expression.visit(this)); };
    AstTransformer.prototype.visitConditional = function (ast) {
        return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
    };
    AstTransformer.prototype.visitPipe = function (ast) {
        return new BindingPipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args));
    };
    AstTransformer.prototype.visitKeyedRead = function (ast) {
        return new KeyedRead(ast.obj.visit(this), ast.key.visit(this));
    };
    AstTransformer.prototype.visitKeyedWrite = function (ast) {
        return new KeyedWrite(ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
    };
    AstTransformer.prototype.visitAll = function (asts) {
        var res = collection_1.ListWrapper.createFixedSize(asts.length);
        for (var i = 0; i < asts.length; ++i) {
            res[i] = asts[i].visit(this);
        }
        return res;
    };
    AstTransformer.prototype.visitChain = function (ast) { return new Chain(this.visitAll(ast.expressions)); };
    AstTransformer.prototype.visitQuote = function (ast) {
        return new Quote(ast.prefix, ast.uninterpretedExpression, ast.location);
    };
    return AstTransformer;
})();
exports.AstTransformer = AstTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1Qdk91Ump2eC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvYXN0LnRzIl0sIm5hbWVzIjpbIkFTVCIsIkFTVC5jb25zdHJ1Y3RvciIsIkFTVC52aXNpdCIsIkFTVC50b1N0cmluZyIsIlF1b3RlIiwiUXVvdGUuY29uc3RydWN0b3IiLCJRdW90ZS52aXNpdCIsIlF1b3RlLnRvU3RyaW5nIiwiRW1wdHlFeHByIiwiRW1wdHlFeHByLmNvbnN0cnVjdG9yIiwiRW1wdHlFeHByLnZpc2l0IiwiSW1wbGljaXRSZWNlaXZlciIsIkltcGxpY2l0UmVjZWl2ZXIuY29uc3RydWN0b3IiLCJJbXBsaWNpdFJlY2VpdmVyLnZpc2l0IiwiQ2hhaW4iLCJDaGFpbi5jb25zdHJ1Y3RvciIsIkNoYWluLnZpc2l0IiwiQ29uZGl0aW9uYWwiLCJDb25kaXRpb25hbC5jb25zdHJ1Y3RvciIsIkNvbmRpdGlvbmFsLnZpc2l0IiwiUHJvcGVydHlSZWFkIiwiUHJvcGVydHlSZWFkLmNvbnN0cnVjdG9yIiwiUHJvcGVydHlSZWFkLnZpc2l0IiwiUHJvcGVydHlXcml0ZSIsIlByb3BlcnR5V3JpdGUuY29uc3RydWN0b3IiLCJQcm9wZXJ0eVdyaXRlLnZpc2l0IiwiU2FmZVByb3BlcnR5UmVhZCIsIlNhZmVQcm9wZXJ0eVJlYWQuY29uc3RydWN0b3IiLCJTYWZlUHJvcGVydHlSZWFkLnZpc2l0IiwiS2V5ZWRSZWFkIiwiS2V5ZWRSZWFkLmNvbnN0cnVjdG9yIiwiS2V5ZWRSZWFkLnZpc2l0IiwiS2V5ZWRXcml0ZSIsIktleWVkV3JpdGUuY29uc3RydWN0b3IiLCJLZXllZFdyaXRlLnZpc2l0IiwiQmluZGluZ1BpcGUiLCJCaW5kaW5nUGlwZS5jb25zdHJ1Y3RvciIsIkJpbmRpbmdQaXBlLnZpc2l0IiwiTGl0ZXJhbFByaW1pdGl2ZSIsIkxpdGVyYWxQcmltaXRpdmUuY29uc3RydWN0b3IiLCJMaXRlcmFsUHJpbWl0aXZlLnZpc2l0IiwiTGl0ZXJhbEFycmF5IiwiTGl0ZXJhbEFycmF5LmNvbnN0cnVjdG9yIiwiTGl0ZXJhbEFycmF5LnZpc2l0IiwiTGl0ZXJhbE1hcCIsIkxpdGVyYWxNYXAuY29uc3RydWN0b3IiLCJMaXRlcmFsTWFwLnZpc2l0IiwiSW50ZXJwb2xhdGlvbiIsIkludGVycG9sYXRpb24uY29uc3RydWN0b3IiLCJJbnRlcnBvbGF0aW9uLnZpc2l0IiwiQmluYXJ5IiwiQmluYXJ5LmNvbnN0cnVjdG9yIiwiQmluYXJ5LnZpc2l0IiwiUHJlZml4Tm90IiwiUHJlZml4Tm90LmNvbnN0cnVjdG9yIiwiUHJlZml4Tm90LnZpc2l0IiwiTWV0aG9kQ2FsbCIsIk1ldGhvZENhbGwuY29uc3RydWN0b3IiLCJNZXRob2RDYWxsLnZpc2l0IiwiU2FmZU1ldGhvZENhbGwiLCJTYWZlTWV0aG9kQ2FsbC5jb25zdHJ1Y3RvciIsIlNhZmVNZXRob2RDYWxsLnZpc2l0IiwiRnVuY3Rpb25DYWxsIiwiRnVuY3Rpb25DYWxsLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25DYWxsLnZpc2l0IiwiQVNUV2l0aFNvdXJjZSIsIkFTVFdpdGhTb3VyY2UuY29uc3RydWN0b3IiLCJBU1RXaXRoU291cmNlLnZpc2l0IiwiQVNUV2l0aFNvdXJjZS50b1N0cmluZyIsIlRlbXBsYXRlQmluZGluZyIsIlRlbXBsYXRlQmluZGluZy5jb25zdHJ1Y3RvciIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLmNvbnN0cnVjdG9yIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEJpbmFyeSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRDaGFpbiIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRDb25kaXRpb25hbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRQaXBlIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEZ1bmN0aW9uQ2FsbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRJbXBsaWNpdFJlY2VpdmVyIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEludGVycG9sYXRpb24iLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0S2V5ZWRSZWFkIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEtleWVkV3JpdGUiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0TGl0ZXJhbEFycmF5IiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdExpdGVyYWxNYXAiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0TGl0ZXJhbFByaW1pdGl2ZSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRNZXRob2RDYWxsIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdFByZWZpeE5vdCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRQcm9wZXJ0eVJlYWQiLCJSZWN1cnNpdmVBc3RWaXNpdG9yLnZpc2l0UHJvcGVydHlXcml0ZSIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRTYWZlUHJvcGVydHlSZWFkIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdFNhZmVNZXRob2RDYWxsIiwiUmVjdXJzaXZlQXN0VmlzaXRvci52aXNpdEFsbCIsIlJlY3Vyc2l2ZUFzdFZpc2l0b3IudmlzaXRRdW90ZSIsIkFzdFRyYW5zZm9ybWVyIiwiQXN0VHJhbnNmb3JtZXIuY29uc3RydWN0b3IiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEltcGxpY2l0UmVjZWl2ZXIiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEludGVycG9sYXRpb24iLCJBc3RUcmFuc2Zvcm1lci52aXNpdExpdGVyYWxQcmltaXRpdmUiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFByb3BlcnR5UmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0UHJvcGVydHlXcml0ZSIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0U2FmZVByb3BlcnR5UmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0TWV0aG9kQ2FsbCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0U2FmZU1ldGhvZENhbGwiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEZ1bmN0aW9uQ2FsbCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0TGl0ZXJhbEFycmF5IiwiQXN0VHJhbnNmb3JtZXIudmlzaXRMaXRlcmFsTWFwIiwiQXN0VHJhbnNmb3JtZXIudmlzaXRCaW5hcnkiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFByZWZpeE5vdCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0Q29uZGl0aW9uYWwiLCJBc3RUcmFuc2Zvcm1lci52aXNpdFBpcGUiLCJBc3RUcmFuc2Zvcm1lci52aXNpdEtleWVkUmVhZCIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0S2V5ZWRXcml0ZSIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0QWxsIiwiQXN0VHJhbnNmb3JtZXIudmlzaXRDaGFpbiIsIkFzdFRyYW5zZm9ybWVyLnZpc2l0UXVvdGUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFM0Q7SUFBQUE7SUFHQUMsQ0FBQ0E7SUFGQ0QsbUJBQUtBLEdBQUxBLFVBQU1BLE9BQW1CQSxJQUFTRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoREYsc0JBQVFBLEdBQVJBLGNBQXFCRyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0Q0gsVUFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBSFksV0FBRyxNQUdmLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSDtJQUEyQkkseUJBQUdBO0lBQzVCQSxlQUFtQkEsTUFBY0EsRUFBU0EsdUJBQStCQSxFQUFTQSxRQUFhQTtRQUM3RkMsaUJBQU9BLENBQUNBO1FBRFNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLDRCQUF1QkEsR0FBdkJBLHVCQUF1QkEsQ0FBUUE7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBS0E7SUFFL0ZBLENBQUNBO0lBQ0RELHFCQUFLQSxHQUFMQSxV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QzFFQSxDQUFDQTtJQUNIckIscUJBQUNBO0FBQURBLENBQUNBLEFBN0VELElBNkVDO0FBN0VZLHNCQUFjLGlCQTZFMUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuICdBU1QnOyB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHF1b3RlZCBleHByZXNzaW9uIG9mIHRoZSBmb3JtOlxuICpcbiAqIHF1b3RlID0gcHJlZml4IGA6YCB1bmludGVycHJldGVkRXhwcmVzc2lvblxuICogcHJlZml4ID0gaWRlbnRpZmllclxuICogdW5pbnRlcnByZXRlZEV4cHJlc3Npb24gPSBhcmJpdHJhcnkgc3RyaW5nXG4gKlxuICogQSBxdW90ZWQgZXhwcmVzc2lvbiBpcyBtZWFudCB0byBiZSBwcmUtcHJvY2Vzc2VkIGJ5IGFuIEFTVCB0cmFuc2Zvcm1lciB0aGF0XG4gKiBjb252ZXJ0cyBpdCBpbnRvIGFub3RoZXIgQVNUIHRoYXQgbm8gbG9uZ2VyIGNvbnRhaW5zIHF1b3RlZCBleHByZXNzaW9ucy5cbiAqIEl0IGlzIG1lYW50IHRvIGFsbG93IHRoaXJkLXBhcnR5IGRldmVsb3BlcnMgdG8gZXh0ZW5kIEFuZ3VsYXIgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gbGFuZ3VhZ2UuIFRoZSBgdW5pbnRlcnByZXRlZEV4cHJlc3Npb25gIHBhcnQgb2YgdGhlIHF1b3RlIGlzXG4gKiB0aGVyZWZvcmUgbm90IGludGVycHJldGVkIGJ5IHRoZSBBbmd1bGFyJ3Mgb3duIGV4cHJlc3Npb24gcGFyc2VyLlxuICovXG5leHBvcnQgY2xhc3MgUXVvdGUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJlZml4OiBzdHJpbmcsIHB1YmxpYyB1bmludGVycHJldGVkRXhwcmVzc2lvbjogc3RyaW5nLCBwdWJsaWMgbG9jYXRpb246IGFueSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0UXVvdGUodGhpcyk7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuICdRdW90ZSc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtcHR5RXhwciBleHRlbmRzIEFTVCB7XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpIHtcbiAgICAvLyBkbyBub3RoaW5nXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltcGxpY2l0UmVjZWl2ZXIgZXh0ZW5kcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRJbXBsaWNpdFJlY2VpdmVyKHRoaXMpOyB9XG59XG5cbi8qKlxuICogTXVsdGlwbGUgZXhwcmVzc2lvbnMgc2VwYXJhdGVkIGJ5IGEgc2VtaWNvbG9uLlxuICovXG5leHBvcnQgY2xhc3MgQ2hhaW4gZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0Q2hhaW4odGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogQVNULCBwdWJsaWMgdHJ1ZUV4cDogQVNULCBwdWJsaWMgZmFsc2VFeHA6IEFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdENvbmRpdGlvbmFsKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGdldHRlcjogRnVuY3Rpb24pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRQcm9wZXJ0eVJlYWQodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3BlcnR5V3JpdGUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWNlaXZlcjogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgc2V0dGVyOiBGdW5jdGlvbiwgcHVibGljIHZhbHVlOiBBU1QpIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFByb3BlcnR5V3JpdGUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVQcm9wZXJ0eVJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGdldHRlcjogRnVuY3Rpb24pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRTYWZlUHJvcGVydHlSZWFkKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBLZXllZFJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgb2JqOiBBU1QsIHB1YmxpYyBrZXk6IEFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkUmVhZCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgS2V5ZWRXcml0ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvYmo6IEFTVCwgcHVibGljIGtleTogQVNULCBwdWJsaWMgdmFsdWU6IEFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkV3JpdGUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdQaXBlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV4cDogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXJnczogYW55W10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRQaXBlKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsUHJpbWl0aXZlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbFByaW1pdGl2ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbEFycmF5IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV4cHJlc3Npb25zOiBhbnlbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdExpdGVyYWxBcnJheSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbE1hcCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXlzOiBhbnlbXSwgcHVibGljIHZhbHVlczogYW55W10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yKTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsTWFwKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcnBvbGF0aW9uIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0cmluZ3M6IGFueVtdLCBwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0SW50ZXJwb2xhdGlvbih0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQmluYXJ5IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIG9wZXJhdGlvbjogc3RyaW5nLCBwdWJsaWMgbGVmdDogQVNULCBwdWJsaWMgcmlnaHQ6IEFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdEJpbmFyeSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlZml4Tm90IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV4cHJlc3Npb246IEFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFByZWZpeE5vdCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0aG9kQ2FsbCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWNlaXZlcjogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZm46IEZ1bmN0aW9uLCBwdWJsaWMgYXJnczogYW55W10pIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdE1ldGhvZENhbGwodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVNZXRob2RDYWxsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBmbjogRnVuY3Rpb24sIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0U2FmZU1ldGhvZENhbGwodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uQ2FsbCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0YXJnZXQ6IEFTVCwgcHVibGljIGFyZ3M6IGFueVtdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0RnVuY3Rpb25DYWxsKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBBU1RXaXRoU291cmNlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIGFzdDogQVNULCBwdWJsaWMgc291cmNlOiBzdHJpbmcsIHB1YmxpYyBsb2NhdGlvbjogc3RyaW5nKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvcik6IGFueSB7IHJldHVybiB0aGlzLmFzdC52aXNpdCh2aXNpdG9yKTsgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYCR7dGhpcy5zb3VyY2V9IGluICR7dGhpcy5sb2NhdGlvbn1gOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUJpbmRpbmcge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBrZXk6IHN0cmluZywgcHVibGljIGtleUlzVmFyOiBib29sZWFuLCBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgcHVibGljIGV4cHJlc3Npb246IEFTVFdpdGhTb3VyY2UpIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXN0VmlzaXRvciB7XG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogYW55O1xuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiBhbnk7XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IGFueTtcbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiBhbnk7XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBhbnk7XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBhbnk7XG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkKTogYW55O1xuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogYW55O1xuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCk6IGFueTtcbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSk6IGFueTtcbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IGFueTtcbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpOiBhbnk7XG4gIHZpc2l0UHJlZml4Tm90KGFzdDogUHJlZml4Tm90KTogYW55O1xuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCk6IGFueTtcbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSk6IGFueTtcbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlKTogYW55O1xuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwpOiBhbnk7XG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN1cnNpdmVBc3RWaXNpdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogYW55IHtcbiAgICBhc3QubGVmdC52aXNpdCh0aGlzKTtcbiAgICBhc3QucmlnaHQudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluKTogYW55IHsgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfVxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwpOiBhbnkge1xuICAgIGFzdC5jb25kaXRpb24udmlzaXQodGhpcyk7XG4gICAgYXN0LnRydWVFeHAudmlzaXQodGhpcyk7XG4gICAgYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKTogYW55IHtcbiAgICBhc3QuZXhwLnZpc2l0KHRoaXMpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKTogYW55IHtcbiAgICBhc3QudGFyZ2V0LnZpc2l0KHRoaXMpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uKTogYW55IHsgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTsgfVxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IGFueSB7XG4gICAgYXN0Lm9iai52aXNpdCh0aGlzKTtcbiAgICBhc3Qua2V5LnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBhbnkge1xuICAgIGFzdC5vYmoudmlzaXQodGhpcyk7XG4gICAgYXN0LmtleS52aXNpdCh0aGlzKTtcbiAgICBhc3QudmFsdWUudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXkpOiBhbnkgeyByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpOyB9XG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBhbnkgeyByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKTsgfVxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgfVxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCk6IGFueSB7XG4gICAgYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgYXN0LnZhbHVlLnZpc2l0KHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gIH1cbiAgdmlzaXRBbGwoYXN0czogQVNUW10pOiBhbnkge1xuICAgIGFzdHMuZm9yRWFjaChhc3QgPT4gYXN0LnZpc2l0KHRoaXMpKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxufVxuXG5leHBvcnQgY2xhc3MgQXN0VHJhbnNmb3JtZXIgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcik6IEFTVCB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEludGVycG9sYXRpb24oYXN0LnN0cmluZ3MsIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogQVNUIHsgcmV0dXJuIG5ldyBMaXRlcmFsUHJpbWl0aXZlKGFzdC52YWx1ZSk7IH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQoYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgYXN0LmdldHRlcik7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFByb3BlcnR5V3JpdGUoYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgYXN0LnNldHRlciwgYXN0LnZhbHVlKTtcbiAgfVxuXG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZChhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCBhc3QuZ2V0dGVyKTtcbiAgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTWV0aG9kQ2FsbChhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCBhc3QuZm4sIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpKTtcbiAgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBTYWZlTWV0aG9kQ2FsbChhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lLCBhc3QuZm4sIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChhc3QudGFyZ2V0LnZpc2l0KHRoaXMpLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkodGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcChhc3Qua2V5cywgdGhpcy52aXNpdEFsbChhc3QudmFsdWVzKSk7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnkoYXN0Lm9wZXJhdGlvbiwgYXN0LmxlZnQudmlzaXQodGhpcyksIGFzdC5yaWdodC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCk6IEFTVCB7IHJldHVybiBuZXcgUHJlZml4Tm90KGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpKTsgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBDb25kaXRpb25hbChcbiAgICAgICAgYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKSwgYXN0LnRydWVFeHAudmlzaXQodGhpcyksIGFzdC5mYWxzZUV4cC52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBCaW5kaW5nUGlwZShhc3QuZXhwLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgS2V5ZWRSZWFkKGFzdC5vYmoudmlzaXQodGhpcyksIGFzdC5rZXkudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBLZXllZFdyaXRlKGFzdC5vYmoudmlzaXQodGhpcyksIGFzdC5rZXkudmlzaXQodGhpcyksIGFzdC52YWx1ZS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdEFsbChhc3RzOiBhbnlbXSk6IGFueVtdIHtcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGFzdHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFzdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHJlc1tpXSA9IGFzdHNbaV0udmlzaXQodGhpcyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiBBU1QgeyByZXR1cm4gbmV3IENoYWluKHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKSk7IH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgUXVvdGUoYXN0LnByZWZpeCwgYXN0LnVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uLCBhc3QubG9jYXRpb24pO1xuICB9XG59XG4iXX0=