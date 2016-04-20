'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var view_1 = require('angular2/src/core/linker/view');
var exceptions_1 = require('angular2/src/facade/exceptions');
var InterpretiveAppViewInstanceFactory = (function () {
    function InterpretiveAppViewInstanceFactory() {
    }
    InterpretiveAppViewInstanceFactory.prototype.createInstance = function (superClass, clazz, args, props, getters, methods) {
        if (superClass === view_1.AppView) {
            return new _InterpretiveAppView(args, props, getters, methods);
        }
        throw new exceptions_1.BaseException("Can't instantiate class " + superClass + " in interpretative mode");
    };
    return InterpretiveAppViewInstanceFactory;
}());
exports.InterpretiveAppViewInstanceFactory = InterpretiveAppViewInstanceFactory;
var _InterpretiveAppView = (function (_super) {
    __extends(_InterpretiveAppView, _super);
    function _InterpretiveAppView(args, props, getters, methods) {
        _super.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
        this.props = props;
        this.getters = getters;
        this.methods = methods;
    }
    _InterpretiveAppView.prototype.createInternal = function (rootSelector) {
        var m = this.methods.get('createInternal');
        if (lang_1.isPresent(m)) {
            m(rootSelector);
        }
        else {
            _super.prototype.createInternal.call(this, rootSelector);
        }
    };
    _InterpretiveAppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
        var m = this.methods.get('injectorGetInternal');
        if (lang_1.isPresent(m)) {
            return m(token, nodeIndex, notFoundResult);
        }
        else {
            return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
        }
    };
    _InterpretiveAppView.prototype.destroyInternal = function () {
        var m = this.methods.get('destroyInternal');
        if (lang_1.isPresent(m)) {
            return m();
        }
        else {
            return _super.prototype.destroyInternal.call(this);
        }
    };
    _InterpretiveAppView.prototype.dirtyParentQueriesInternal = function () {
        var m = this.methods.get('dirtyParentQueriesInternal');
        if (lang_1.isPresent(m)) {
            return m();
        }
        else {
            return _super.prototype.dirtyParentQueriesInternal.call(this);
        }
    };
    _InterpretiveAppView.prototype.detectChangesInternal = function (throwOnChange) {
        var m = this.methods.get('detectChangesInternal');
        if (lang_1.isPresent(m)) {
            return m(throwOnChange);
        }
        else {
            return _super.prototype.detectChangesInternal.call(this, throwOnChange);
        }
    };
    return _InterpretiveAppView;
}(view_1.AppView));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0aXZlX3ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUQ1VTZoa2h3LnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvb3V0cHV0L2ludGVycHJldGl2ZV92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELHFCQUFzQiwrQkFBK0IsQ0FBQyxDQUFBO0FBQ3RELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRzdEO0lBQUE7SUFRQSxDQUFDO0lBUEMsMkRBQWMsR0FBZCxVQUFlLFVBQWUsRUFBRSxLQUFVLEVBQUUsSUFBVyxFQUFFLEtBQXVCLEVBQ2pFLE9BQThCLEVBQUUsT0FBOEI7UUFDM0UsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGNBQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUNELE1BQU0sSUFBSSwwQkFBYSxDQUFDLDZCQUEyQixVQUFVLDRCQUF5QixDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUNILHlDQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSwwQ0FBa0MscUNBUTlDLENBQUE7QUFFRDtJQUFtQyx3Q0FBWTtJQUM3Qyw4QkFBWSxJQUFXLEVBQVMsS0FBdUIsRUFBUyxPQUE4QixFQUMzRSxPQUE4QjtRQUMvQyxrQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3hGLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBSGMsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUMzRSxZQUFPLEdBQVAsT0FBTyxDQUF1QjtJQUdqRCxDQUFDO0lBQ0QsNkNBQWMsR0FBZCxVQUFlLFlBQW9CO1FBQ2pDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLGdCQUFLLENBQUMsY0FBYyxZQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBQ0Qsa0RBQW1CLEdBQW5CLFVBQW9CLEtBQVUsRUFBRSxTQUFpQixFQUFFLGNBQW1CO1FBQ3BFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxnQkFBSyxDQUFDLFdBQVcsWUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDSCxDQUFDO0lBQ0QsOENBQWUsR0FBZjtRQUNFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGdCQUFLLENBQUMsZUFBZSxXQUFFLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUM7SUFDRCx5REFBMEIsR0FBMUI7UUFDRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxnQkFBSyxDQUFDLDBCQUEwQixXQUFFLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7SUFDRCxvREFBcUIsR0FBckIsVUFBc0IsYUFBc0I7UUFDMUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxnQkFBSyxDQUFDLHFCQUFxQixZQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBOUNELENBQW1DLGNBQU8sR0E4Q3pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5zdGFuY2VGYWN0b3J5LCBEeW5hbWljSW5zdGFuY2V9IGZyb20gJy4vb3V0cHV0X2ludGVycHJldGVyJztcblxuZXhwb3J0IGNsYXNzIEludGVycHJldGl2ZUFwcFZpZXdJbnN0YW5jZUZhY3RvcnkgaW1wbGVtZW50cyBJbnN0YW5jZUZhY3Rvcnkge1xuICBjcmVhdGVJbnN0YW5jZShzdXBlckNsYXNzOiBhbnksIGNsYXp6OiBhbnksIGFyZ3M6IGFueVtdLCBwcm9wczogTWFwPHN0cmluZywgYW55PixcbiAgICAgICAgICAgICAgICAgZ2V0dGVyczogTWFwPHN0cmluZywgRnVuY3Rpb24+LCBtZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4pOiBhbnkge1xuICAgIGlmIChzdXBlckNsYXNzID09PSBBcHBWaWV3KSB7XG4gICAgICByZXR1cm4gbmV3IF9JbnRlcnByZXRpdmVBcHBWaWV3KGFyZ3MsIHByb3BzLCBnZXR0ZXJzLCBtZXRob2RzKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbid0IGluc3RhbnRpYXRlIGNsYXNzICR7c3VwZXJDbGFzc30gaW4gaW50ZXJwcmV0YXRpdmUgbW9kZWApO1xuICB9XG59XG5cbmNsYXNzIF9JbnRlcnByZXRpdmVBcHBWaWV3IGV4dGVuZHMgQXBwVmlldzxhbnk+IGltcGxlbWVudHMgRHluYW1pY0luc3RhbmNlIHtcbiAgY29uc3RydWN0b3IoYXJnczogYW55W10sIHB1YmxpYyBwcm9wczogTWFwPHN0cmluZywgYW55PiwgcHVibGljIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPixcbiAgICAgICAgICAgICAgcHVibGljIG1ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPikge1xuICAgIHN1cGVyKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0sIGFyZ3NbNV0sIGFyZ3NbNl0sIGFyZ3NbN10sIGFyZ3NbOF0sIGFyZ3NbOV0sXG4gICAgICAgICAgYXJnc1sxMF0pO1xuICB9XG4gIGNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdjcmVhdGVJbnRlcm5hbCcpO1xuICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgIG0ocm9vdFNlbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yKTtcbiAgICB9XG4gIH1cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdpbmplY3RvckdldEludGVybmFsJyk7XG4gICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgcmV0dXJuIG0odG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuaW5qZWN0b3JHZXQodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH1cbiAgfVxuICBkZXN0cm95SW50ZXJuYWwoKTogdm9pZCB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdkZXN0cm95SW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGVzdHJveUludGVybmFsKCk7XG4gICAgfVxuICB9XG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gIH1cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgbSA9IHRoaXMubWV0aG9kcy5nZXQoJ2RldGVjdENoYW5nZXNJbnRlcm5hbCcpO1xuICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgIHJldHVybiBtKHRocm93T25DaGFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxufVxuIl19