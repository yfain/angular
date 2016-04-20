'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var abstract_emitter_1 = require('./abstract_emitter');
var abstract_js_emitter_1 = require('./abstract_js_emitter');
function jitStatements(sourceUrl, statements, resultVar) {
    var converter = new JitEmitterVisitor();
    var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot([resultVar]);
    converter.visitAllStatements(statements, ctx);
    return lang_1.evalExpression(sourceUrl, resultVar, ctx.toSource(), converter.getArgs());
}
exports.jitStatements = jitStatements;
var JitEmitterVisitor = (function (_super) {
    __extends(JitEmitterVisitor, _super);
    function JitEmitterVisitor() {
        _super.apply(this, arguments);
        this._evalArgNames = [];
        this._evalArgValues = [];
    }
    JitEmitterVisitor.prototype.getArgs = function () {
        var result = {};
        for (var i = 0; i < this._evalArgNames.length; i++) {
            result[this._evalArgNames[i]] = this._evalArgValues[i];
        }
        return result;
    };
    JitEmitterVisitor.prototype.visitExternalExpr = function (ast, ctx) {
        var value = ast.value.runtime;
        var id = this._evalArgValues.indexOf(value);
        if (id === -1) {
            id = this._evalArgValues.length;
            this._evalArgValues.push(value);
            this._evalArgNames.push(sanitizeJitArgName("jit_" + ast.value.name + id));
        }
        ctx.print(this._evalArgNames[id]);
        return null;
    };
    return JitEmitterVisitor;
}(abstract_js_emitter_1.AbstractJsEmitterVisitor));
function sanitizeJitArgName(name) {
    return lang_1.StringWrapper.replaceAll(name, /[\.\/]/g, '_');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtNkk3VEJjMzIudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvb3V0cHV0X2ppdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLGlDQUFvQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3pELG9DQUF1Qyx1QkFBdUIsQ0FBQyxDQUFBO0FBRS9ELHVCQUE4QixTQUFpQixFQUFFLFVBQXlCLEVBQzVDLFNBQWlCO0lBQzdDLElBQUksU0FBUyxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUN4QyxJQUFJLEdBQUcsR0FBRyx3Q0FBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3hELFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLHFCQUFjLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDbkYsQ0FBQztBQU5lLHFCQUFhLGdCQU01QixDQUFBO0FBRUQ7SUFBZ0MscUNBQXdCO0lBQXhEO1FBQWdDLDhCQUF3QjtRQUM5QyxrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUM3QixtQkFBYyxHQUFVLEVBQUUsQ0FBQztJQXFCckMsQ0FBQztJQW5CQyxtQ0FBTyxHQUFQO1FBQ0UsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELDZDQUFpQixHQUFqQixVQUFrQixHQUFtQixFQUFFLEdBQTBCO1FBQy9ELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQXZCRCxDQUFnQyw4Q0FBd0IsR0F1QnZEO0FBRUQsNEJBQTRCLElBQVk7SUFDdEMsTUFBTSxDQUFDLG9CQUFhLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNTdHJpbmcsXG4gIGV2YWxFeHByZXNzaW9uLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5pbXBvcnQge0VtaXR0ZXJWaXNpdG9yQ29udGV4dH0gZnJvbSAnLi9hYnN0cmFjdF9lbWl0dGVyJztcbmltcG9ydCB7QWJzdHJhY3RKc0VtaXR0ZXJWaXNpdG9yfSBmcm9tICcuL2Fic3RyYWN0X2pzX2VtaXR0ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gaml0U3RhdGVtZW50cyhzb3VyY2VVcmw6IHN0cmluZywgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFZhcjogc3RyaW5nKTogYW55IHtcbiAgdmFyIGNvbnZlcnRlciA9IG5ldyBKaXRFbWl0dGVyVmlzaXRvcigpO1xuICB2YXIgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoW3Jlc3VsdFZhcl0pO1xuICBjb252ZXJ0ZXIudmlzaXRBbGxTdGF0ZW1lbnRzKHN0YXRlbWVudHMsIGN0eCk7XG4gIHJldHVybiBldmFsRXhwcmVzc2lvbihzb3VyY2VVcmwsIHJlc3VsdFZhciwgY3R4LnRvU291cmNlKCksIGNvbnZlcnRlci5nZXRBcmdzKCkpO1xufVxuXG5jbGFzcyBKaXRFbWl0dGVyVmlzaXRvciBleHRlbmRzIEFic3RyYWN0SnNFbWl0dGVyVmlzaXRvciB7XG4gIHByaXZhdGUgX2V2YWxBcmdOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfZXZhbEFyZ1ZhbHVlczogYW55W10gPSBbXTtcblxuICBnZXRBcmdzKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9ldmFsQXJnTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFt0aGlzLl9ldmFsQXJnTmFtZXNbaV1dID0gdGhpcy5fZXZhbEFyZ1ZhbHVlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB2YXIgdmFsdWUgPSBhc3QudmFsdWUucnVudGltZTtcbiAgICB2YXIgaWQgPSB0aGlzLl9ldmFsQXJnVmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpZCA9PT0gLTEpIHtcbiAgICAgIGlkID0gdGhpcy5fZXZhbEFyZ1ZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLl9ldmFsQXJnVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgdGhpcy5fZXZhbEFyZ05hbWVzLnB1c2goc2FuaXRpemVKaXRBcmdOYW1lKGBqaXRfJHthc3QudmFsdWUubmFtZX0ke2lkfWApKTtcbiAgICB9XG4gICAgY3R4LnByaW50KHRoaXMuX2V2YWxBcmdOYW1lc1tpZF0pO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplSml0QXJnTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKG5hbWUsIC9bXFwuXFwvXS9nLCAnXycpO1xufVxuIl19