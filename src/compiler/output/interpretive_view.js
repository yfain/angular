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
            return m(rootSelector);
        }
        else {
            return _super.prototype.createInternal.call(this, rootSelector);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0aXZlX3ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVJHYlA5OEhyLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvb3V0cHV0L2ludGVycHJldGl2ZV92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELHFCQUFzQiwrQkFBK0IsQ0FBQyxDQUFBO0FBRXRELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRzdEO0lBQUE7SUFRQSxDQUFDO0lBUEMsMkRBQWMsR0FBZCxVQUFlLFVBQWUsRUFBRSxLQUFVLEVBQUUsSUFBVyxFQUFFLEtBQXVCLEVBQ2pFLE9BQThCLEVBQUUsT0FBOEI7UUFDM0UsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGNBQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUNELE1BQU0sSUFBSSwwQkFBYSxDQUFDLDZCQUEyQixVQUFVLDRCQUF5QixDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUNILHlDQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSwwQ0FBa0MscUNBUTlDLENBQUE7QUFFRDtJQUFtQyx3Q0FBWTtJQUM3Qyw4QkFBWSxJQUFXLEVBQVMsS0FBdUIsRUFBUyxPQUE4QixFQUMzRSxPQUE4QjtRQUMvQyxrQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3hGLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBSGMsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUMzRSxZQUFPLEdBQVAsT0FBTyxDQUF1QjtJQUdqRCxDQUFDO0lBQ0QsNkNBQWMsR0FBZCxVQUFlLFlBQTBCO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsZ0JBQUssQ0FBQyxjQUFjLFlBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUMsQ0FBQztJQUNILENBQUM7SUFDRCxrREFBbUIsR0FBbkIsVUFBb0IsS0FBVSxFQUFFLFNBQWlCLEVBQUUsY0FBbUI7UUFDcEUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGdCQUFLLENBQUMsV0FBVyxZQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFDRCw4Q0FBZSxHQUFmO1FBQ0UsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1QyxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDYixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsZ0JBQUssQ0FBQyxlQUFlLFdBQUUsQ0FBQztRQUNqQyxDQUFDO0lBQ0gsQ0FBQztJQUNELHlEQUEwQixHQUExQjtRQUNFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDdkQsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGdCQUFLLENBQUMsMEJBQTBCLFdBQUUsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztJQUNELG9EQUFxQixHQUFyQixVQUFzQixhQUFzQjtRQUMxQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGdCQUFLLENBQUMscUJBQXFCLFlBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUE5Q0QsQ0FBbUMsY0FBTyxHQThDekMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudCc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luc3RhbmNlRmFjdG9yeSwgRHluYW1pY0luc3RhbmNlfSBmcm9tICcuL291dHB1dF9pbnRlcnByZXRlcic7XG5cbmV4cG9ydCBjbGFzcyBJbnRlcnByZXRpdmVBcHBWaWV3SW5zdGFuY2VGYWN0b3J5IGltcGxlbWVudHMgSW5zdGFuY2VGYWN0b3J5IHtcbiAgY3JlYXRlSW5zdGFuY2Uoc3VwZXJDbGFzczogYW55LCBjbGF6ejogYW55LCBhcmdzOiBhbnlbXSwgcHJvcHM6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgICAgICAgIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgbWV0aG9kczogTWFwPHN0cmluZywgRnVuY3Rpb24+KTogYW55IHtcbiAgICBpZiAoc3VwZXJDbGFzcyA9PT0gQXBwVmlldykge1xuICAgICAgcmV0dXJuIG5ldyBfSW50ZXJwcmV0aXZlQXBwVmlldyhhcmdzLCBwcm9wcywgZ2V0dGVycywgbWV0aG9kcyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4ndCBpbnN0YW50aWF0ZSBjbGFzcyAke3N1cGVyQ2xhc3N9IGluIGludGVycHJldGF0aXZlIG1vZGVgKTtcbiAgfVxufVxuXG5jbGFzcyBfSW50ZXJwcmV0aXZlQXBwVmlldyBleHRlbmRzIEFwcFZpZXc8YW55PiBpbXBsZW1lbnRzIER5bmFtaWNJbnN0YW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFyZ3M6IGFueVtdLCBwdWJsaWMgcHJvcHM6IE1hcDxzdHJpbmcsIGFueT4sIHB1YmxpYyBnZXR0ZXJzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4sXG4gICAgICAgICAgICAgIHB1YmxpYyBtZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4pIHtcbiAgICBzdXBlcihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdLCBhcmdzWzVdLCBhcmdzWzZdLCBhcmdzWzddLCBhcmdzWzhdLCBhcmdzWzldLFxuICAgICAgICAgIGFyZ3NbMTBdKTtcbiAgfVxuICBjcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3I6IHN0cmluZyB8IGFueSk6IEFwcEVsZW1lbnQge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnY3JlYXRlSW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbShyb290U2VsZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuY3JlYXRlSW50ZXJuYWwocm9vdFNlbGVjdG9yKTtcbiAgICB9XG4gIH1cbiAgaW5qZWN0b3JHZXRJbnRlcm5hbCh0b2tlbjogYW55LCBub2RlSW5kZXg6IG51bWJlciwgbm90Rm91bmRSZXN1bHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdpbmplY3RvckdldEludGVybmFsJyk7XG4gICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgcmV0dXJuIG0odG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuaW5qZWN0b3JHZXQodG9rZW4sIG5vZGVJbmRleCwgbm90Rm91bmRSZXN1bHQpO1xuICAgIH1cbiAgfVxuICBkZXN0cm95SW50ZXJuYWwoKTogdm9pZCB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdkZXN0cm95SW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGVzdHJveUludGVybmFsKCk7XG4gICAgfVxuICB9XG4gIGRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk6IHZvaWQge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGlydHlQYXJlbnRRdWVyaWVzSW50ZXJuYWwoKTtcbiAgICB9XG4gIH1cbiAgZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgbSA9IHRoaXMubWV0aG9kcy5nZXQoJ2RldGVjdENoYW5nZXNJbnRlcm5hbCcpO1xuICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgIHJldHVybiBtKHRocm93T25DaGFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIuZGV0ZWN0Q2hhbmdlc0ludGVybmFsKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxufVxuIl19