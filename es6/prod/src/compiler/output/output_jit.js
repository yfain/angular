import { evalExpression, StringWrapper } from 'angular2/src/facade/lang';
import { EmitterVisitorContext } from './abstract_emitter';
import { AbstractJsEmitterVisitor } from './abstract_js_emitter';
export function jitStatements(sourceUrl, statements, resultVar) {
    var converter = new JitEmitterVisitor();
    var ctx = EmitterVisitorContext.createRoot([resultVar]);
    converter.visitAllStatements(statements, ctx);
    return evalExpression(sourceUrl, resultVar, ctx.toSource(), converter.getArgs());
}
class JitEmitterVisitor extends AbstractJsEmitterVisitor {
    constructor(...args) {
        super(...args);
        this._evalArgNames = [];
        this._evalArgValues = [];
    }
    getArgs() {
        var result = {};
        for (var i = 0; i < this._evalArgNames.length; i++) {
            result[this._evalArgNames[i]] = this._evalArgValues[i];
        }
        return result;
    }
    visitExternalExpr(ast, ctx) {
        var value = ast.value.runtime;
        var id = this._evalArgValues.indexOf(value);
        if (id === -1) {
            id = this._evalArgValues.length;
            this._evalArgValues.push(value);
            this._evalArgNames.push(sanitizeJitArgName(`jit_${ast.value.name}${id}`));
        }
        ctx.print(this._evalArgNames[id]);
        return null;
    }
}
function sanitizeJitArgName(name) {
    return StringWrapper.replaceAll(name, /[\.\/]/g, '_');
}
