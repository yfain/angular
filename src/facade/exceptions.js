'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_wrapped_exception_1 = require('./base_wrapped_exception');
var exception_handler_1 = require('./exception_handler');
var exception_handler_2 = require('./exception_handler');
exports.ExceptionHandler = exception_handler_2.ExceptionHandler;
var BaseException = (function (_super) {
    __extends(BaseException, _super);
    function BaseException(message) {
        if (message === void 0) { message = '--'; }
        _super.call(this, message);
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
    BaseException.prototype.toString = function () { return this.message; };
    return BaseException;
})(Error);
exports.BaseException = BaseException;
/**
 * Wraps an exception and provides additional context or information.
 */
var WrappedException = (function (_super) {
    __extends(WrappedException, _super);
    function WrappedException(_wrapperMessage, _originalException, _originalStack, _context) {
        _super.call(this, _wrapperMessage);
        this._wrapperMessage = _wrapperMessage;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this._wrapperStack = (new Error(_wrapperMessage)).stack;
    }
    Object.defineProperty(WrappedException.prototype, "wrapperMessage", {
        get: function () { return this._wrapperMessage; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "wrapperStack", {
        get: function () { return this._wrapperStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalException", {
        get: function () { return this._originalException; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalStack", {
        get: function () { return this._originalStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "context", {
        get: function () { return this._context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "message", {
        get: function () { return exception_handler_1.ExceptionHandler.exceptionToString(this); },
        enumerable: true,
        configurable: true
    });
    WrappedException.prototype.toString = function () { return this.message; };
    return WrappedException;
})(base_wrapped_exception_1.BaseWrappedException);
exports.WrappedException = WrappedException;
function makeTypeError(message) {
    return new TypeError(message);
}
exports.makeTypeError = makeTypeError;
function unimplemented() {
    throw new BaseException('unimplemented');
}
exports.unimplemented = unimplemented;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtUHZPdVJqdngudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucy50cyJdLCJuYW1lcyI6WyJCYXNlRXhjZXB0aW9uIiwiQmFzZUV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIkJhc2VFeGNlcHRpb24udG9TdHJpbmciLCJXcmFwcGVkRXhjZXB0aW9uIiwiV3JhcHBlZEV4Y2VwdGlvbi5jb25zdHJ1Y3RvciIsIldyYXBwZWRFeGNlcHRpb24ud3JhcHBlck1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLndyYXBwZXJTdGFjayIsIldyYXBwZWRFeGNlcHRpb24ub3JpZ2luYWxFeGNlcHRpb24iLCJXcmFwcGVkRXhjZXB0aW9uLm9yaWdpbmFsU3RhY2siLCJXcmFwcGVkRXhjZXB0aW9uLmNvbnRleHQiLCJXcmFwcGVkRXhjZXB0aW9uLm1lc3NhZ2UiLCJXcmFwcGVkRXhjZXB0aW9uLnRvU3RyaW5nIiwibWFrZVR5cGVFcnJvciIsInVuaW1wbGVtZW50ZWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUNBQW1DLDBCQUEwQixDQUFDLENBQUE7QUFDOUQsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQsa0NBQStCLHFCQUFxQixDQUFDO0FBQTdDLGdFQUE2QztBQUVyRDtJQUFtQ0EsaUNBQUtBO0lBRXRDQSx1QkFBbUJBLE9BQXNCQTtRQUE3QkMsdUJBQTZCQSxHQUE3QkEsY0FBNkJBO1FBQ3ZDQSxrQkFBTUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFERUEsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBZUE7UUFFdkNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVERCxnQ0FBUUEsR0FBUkEsY0FBcUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQzdDRixvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFSRCxFQUFtQyxLQUFLLEVBUXZDO0FBUlkscUJBQWEsZ0JBUXpCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQXNDRyxvQ0FBb0JBO0lBR3hEQSwwQkFDWUEsZUFBdUJBLEVBQVVBLGtCQUFrQkEsRUFBVUEsY0FBZUEsRUFDNUVBLFFBQVNBO1FBQ25CQyxrQkFBTUEsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFGYkEsb0JBQWVBLEdBQWZBLGVBQWVBLENBQVFBO1FBQVVBLHVCQUFrQkEsR0FBbEJBLGtCQUFrQkEsQ0FBQUE7UUFBVUEsbUJBQWNBLEdBQWRBLGNBQWNBLENBQUNBO1FBQzVFQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFDQTtRQUVuQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsQ0FBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURELHNCQUFJQSw0Q0FBY0E7YUFBbEJBLGNBQStCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRTdEQSxzQkFBSUEsMENBQVlBO2FBQWhCQSxjQUEwQkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBSDtJQUd0REEsc0JBQUlBLCtDQUFpQkE7YUFBckJBLGNBQStCSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUo7SUFFaEVBLHNCQUFJQSwyQ0FBYUE7YUFBakJBLGNBQTJCSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFMO0lBR3hEQSxzQkFBSUEscUNBQU9BO2FBQVhBLGNBQXFCTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFOO0lBRTVDQSxzQkFBSUEscUNBQU9BO2FBQVhBLGNBQXdCTyxNQUFNQSxDQUFDQSxvQ0FBZ0JBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBUDtJQUUxRUEsbUNBQVFBLEdBQVJBLGNBQXFCUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3Q1IsdUJBQUNBO0FBQURBLENBQUNBLEFBekJELEVBQXNDLDZDQUFvQixFQXlCekQ7QUF6Qlksd0JBQWdCLG1CQXlCNUIsQ0FBQTtBQUVELHVCQUE4QixPQUFnQjtJQUM1Q1MsTUFBTUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDaENBLENBQUNBO0FBRmUscUJBQWEsZ0JBRTVCLENBQUE7QUFFRDtJQUNFQyxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtBQUMzQ0EsQ0FBQ0E7QUFGZSxxQkFBYSxnQkFFNUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmFzZVdyYXBwZWRFeGNlcHRpb259IGZyb20gJy4vYmFzZV93cmFwcGVkX2V4Y2VwdGlvbic7XG5pbXBvcnQge0V4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJy4vZXhjZXB0aW9uX2hhbmRsZXInO1xuXG5leHBvcnQge0V4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJy4vZXhjZXB0aW9uX2hhbmRsZXInO1xuXG5leHBvcnQgY2xhc3MgQmFzZUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIHN0YWNrOiBhbnk7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcgPSAnLS0nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGFjayA9ICg8YW55Pm5ldyBFcnJvcihtZXNzYWdlKSkuc3RhY2s7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbi8qKlxuICogV3JhcHMgYW4gZXhjZXB0aW9uIGFuZCBwcm92aWRlcyBhZGRpdGlvbmFsIGNvbnRleHQgb3IgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBXcmFwcGVkRXhjZXB0aW9uIGV4dGVuZHMgQmFzZVdyYXBwZWRFeGNlcHRpb24ge1xuICBwcml2YXRlIF93cmFwcGVyU3RhY2s6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3dyYXBwZXJNZXNzYWdlOiBzdHJpbmcsIHByaXZhdGUgX29yaWdpbmFsRXhjZXB0aW9uLCBwcml2YXRlIF9vcmlnaW5hbFN0YWNrPyxcbiAgICAgIHByaXZhdGUgX2NvbnRleHQ/KSB7XG4gICAgc3VwZXIoX3dyYXBwZXJNZXNzYWdlKTtcbiAgICB0aGlzLl93cmFwcGVyU3RhY2sgPSAoPGFueT5uZXcgRXJyb3IoX3dyYXBwZXJNZXNzYWdlKSkuc3RhY2s7XG4gIH1cblxuICBnZXQgd3JhcHBlck1lc3NhZ2UoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3dyYXBwZXJNZXNzYWdlOyB9XG5cbiAgZ2V0IHdyYXBwZXJTdGFjaygpOiBhbnkgeyByZXR1cm4gdGhpcy5fd3JhcHBlclN0YWNrOyB9XG5cblxuICBnZXQgb3JpZ2luYWxFeGNlcHRpb24oKTogYW55IHsgcmV0dXJuIHRoaXMuX29yaWdpbmFsRXhjZXB0aW9uOyB9XG5cbiAgZ2V0IG9yaWdpbmFsU3RhY2soKTogYW55IHsgcmV0dXJuIHRoaXMuX29yaWdpbmFsU3RhY2s7IH1cblxuXG4gIGdldCBjb250ZXh0KCk6IGFueSB7IHJldHVybiB0aGlzLl9jb250ZXh0OyB9XG5cbiAgZ2V0IG1lc3NhZ2UoKTogc3RyaW5nIHsgcmV0dXJuIEV4Y2VwdGlvbkhhbmRsZXIuZXhjZXB0aW9uVG9TdHJpbmcodGhpcyk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVHlwZUVycm9yKG1lc3NhZ2U/OiBzdHJpbmcpOiBFcnJvciB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKG1lc3NhZ2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5pbXBsZW1lbnRlZCgpOiBhbnkge1xuICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbigndW5pbXBsZW1lbnRlZCcpO1xufVxuIl19