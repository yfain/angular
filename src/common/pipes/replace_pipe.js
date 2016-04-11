'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
/**
 * Creates a new String with some or all of the matches of a pattern replaced by
 * a replacement.
 *
 * The pattern to be matched is specified by the 'pattern' parameter.
 *
 * The replacement to be set is specified by the 'replacement' parameter.
 *
 * An optional 'flags' parameter can be set.
 *
 * ### Usage
 *
 *     expression | replace:pattern:replacement
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * String.prototype.replace() function.
 *
 * Where the input expression is a [String] or [Number] (to be treated as a string),
 * the `pattern` is a [String] or [RegExp],
 * the 'replacement' is a [String] or [Function].
 *
 * --Note--: The 'pattern' parameter will be converted to a RegExp instance. Make sure to escape the
 * string properly if you are matching for regular expression special characters like parenthesis,
 * brackets etc.
 */
var ReplacePipe = (function () {
    function ReplacePipe() {
    }
    ReplacePipe.prototype.transform = function (value, args) {
        if (lang_1.isBlank(args) || args.length !== 2) {
            throw new exceptions_1.BaseException('ReplacePipe requires two arguments');
        }
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (!this._supportedInput(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, value);
        }
        var input = value.toString();
        var pattern = args[0];
        var replacement = args[1];
        if (!this._supportedPattern(pattern)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, pattern);
        }
        if (!this._supportedReplacement(replacement)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, replacement);
        }
        // template fails with literal RegExp e.g /pattern/igm
        // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
        if (lang_1.isFunction(replacement)) {
            var rgxPattern = lang_1.isString(pattern) ? lang_1.RegExpWrapper.create(pattern) : pattern;
            return lang_1.StringWrapper.replaceAllMapped(input, rgxPattern, replacement);
        }
        if (pattern instanceof RegExp) {
            // use the replaceAll variant
            return lang_1.StringWrapper.replaceAll(input, pattern, replacement);
        }
        return lang_1.StringWrapper.replace(input, pattern, replacement);
    };
    ReplacePipe.prototype._supportedInput = function (input) { return lang_1.isString(input) || lang_1.isNumber(input); };
    ReplacePipe.prototype._supportedPattern = function (pattern) {
        return lang_1.isString(pattern) || pattern instanceof RegExp;
    };
    ReplacePipe.prototype._supportedReplacement = function (replacement) {
        return lang_1.isString(replacement) || lang_1.isFunction(replacement);
    };
    ReplacePipe = __decorate([
        core_1.Pipe({ name: 'replace' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ReplacePipe);
    return ReplacePipe;
})();
exports.ReplacePipe = ReplacePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WM3YwVkpGSC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9yZXBsYWNlX3BpcGUudHMiXSwibmFtZXMiOlsiUmVwbGFjZVBpcGUiLCJSZXBsYWNlUGlwZS5jb25zdHJ1Y3RvciIsIlJlcGxhY2VQaXBlLnRyYW5zZm9ybSIsIlJlcGxhY2VQaXBlLl9zdXBwb3J0ZWRJbnB1dCIsIlJlcGxhY2VQaXBlLl9zdXBwb3J0ZWRQYXR0ZXJuIiwiUmVwbGFjZVBpcGUuX3N1cHBvcnRlZFJlcGxhY2VtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBb0YsMEJBQTBCLENBQUMsQ0FBQTtBQUMvRywyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxxQkFBOEMsZUFBZSxDQUFDLENBQUE7QUFDOUQsZ0RBQTJDLG1DQUFtQyxDQUFDLENBQUE7QUFFL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUVIO0lBQUFBO0lBb0RBQyxDQUFDQTtJQWpEQ0QsK0JBQVNBLEdBQVRBLFVBQVVBLEtBQVVBLEVBQUVBLElBQVdBO1FBQy9CRSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25CQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxXQUFXQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM3REEsQ0FBQ0E7UUFFREEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7UUFDN0JBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3RCQSxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUcxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxXQUFXQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMvREEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3Q0EsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxXQUFXQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUNuRUEsQ0FBQ0E7UUFDREEsc0RBQXNEQTtRQUN0REEsaUZBQWlGQTtRQUVqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQVVBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxVQUFVQSxHQUFHQSxlQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxvQkFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0E7WUFFN0VBLE1BQU1BLENBQUNBLG9CQUFhQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLEVBQUVBLFVBQVVBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3hFQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxZQUFZQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsNkJBQTZCQTtZQUM3QkEsTUFBTUEsQ0FBQ0Esb0JBQWFBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLE9BQU9BLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDNURBLENBQUNBO0lBRU9GLHFDQUFlQSxHQUF2QkEsVUFBd0JBLEtBQVVBLElBQWFHLE1BQU1BLENBQUNBLGVBQVFBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLGVBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRW5GSCx1Q0FBaUJBLEdBQXpCQSxVQUEwQkEsT0FBWUE7UUFDcENJLE1BQU1BLENBQUNBLGVBQVFBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLE9BQU9BLFlBQVlBLE1BQU1BLENBQUNBO0lBQ3hEQSxDQUFDQTtJQUVPSiwyQ0FBcUJBLEdBQTdCQSxVQUE4QkEsV0FBZ0JBO1FBQzVDSyxNQUFNQSxDQUFDQSxlQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxpQkFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDMURBLENBQUNBO0lBbkRITDtRQUFDQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxTQUFTQSxFQUFDQSxDQUFDQTtRQUN2QkEsaUJBQVVBLEVBQUVBOztvQkFtRFpBO0lBQURBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQXBERCxJQW9EQztBQWxEWSxtQkFBVyxjQWtEdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBSZWdFeHBXcmFwcGVyLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFN0cmluZyB3aXRoIHNvbWUgb3IgYWxsIG9mIHRoZSBtYXRjaGVzIG9mIGEgcGF0dGVybiByZXBsYWNlZCBieVxuICogYSByZXBsYWNlbWVudC5cbiAqXG4gKiBUaGUgcGF0dGVybiB0byBiZSBtYXRjaGVkIGlzIHNwZWNpZmllZCBieSB0aGUgJ3BhdHRlcm4nIHBhcmFtZXRlci5cbiAqXG4gKiBUaGUgcmVwbGFjZW1lbnQgdG8gYmUgc2V0IGlzIHNwZWNpZmllZCBieSB0aGUgJ3JlcGxhY2VtZW50JyBwYXJhbWV0ZXIuXG4gKlxuICogQW4gb3B0aW9uYWwgJ2ZsYWdzJyBwYXJhbWV0ZXIgY2FuIGJlIHNldC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IHJlcGxhY2U6cGF0dGVybjpyZXBsYWNlbWVudFxuICpcbiAqIEFsbCBiZWhhdmlvciBpcyBiYXNlZCBvbiB0aGUgZXhwZWN0ZWQgYmVoYXZpb3Igb2YgdGhlIEphdmFTY3JpcHQgQVBJXG4gKiBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UoKSBmdW5jdGlvbi5cbiAqXG4gKiBXaGVyZSB0aGUgaW5wdXQgZXhwcmVzc2lvbiBpcyBhIFtTdHJpbmddIG9yIFtOdW1iZXJdICh0byBiZSB0cmVhdGVkIGFzIGEgc3RyaW5nKSxcbiAqIHRoZSBgcGF0dGVybmAgaXMgYSBbU3RyaW5nXSBvciBbUmVnRXhwXSxcbiAqIHRoZSAncmVwbGFjZW1lbnQnIGlzIGEgW1N0cmluZ10gb3IgW0Z1bmN0aW9uXS5cbiAqXG4gKiAtLU5vdGUtLTogVGhlICdwYXR0ZXJuJyBwYXJhbWV0ZXIgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYSBSZWdFeHAgaW5zdGFuY2UuIE1ha2Ugc3VyZSB0byBlc2NhcGUgdGhlXG4gKiBzdHJpbmcgcHJvcGVybHkgaWYgeW91IGFyZSBtYXRjaGluZyBmb3IgcmVndWxhciBleHByZXNzaW9uIHNwZWNpYWwgY2hhcmFjdGVycyBsaWtlIHBhcmVudGhlc2lzLFxuICogYnJhY2tldHMgZXRjLlxuICovXG5cbkBQaXBlKHtuYW1lOiAncmVwbGFjZSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlcGxhY2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgaWYgKGlzQmxhbmsoYXJncykgfHwgYXJncy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdSZXBsYWNlUGlwZSByZXF1aXJlcyB0d28gYXJndW1lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0ZWRJbnB1dCh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFJlcGxhY2VQaXBlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgdmFyIGlucHV0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB2YXIgcGF0dGVybiA9IGFyZ3NbMF07XG4gICAgdmFyIHJlcGxhY2VtZW50ID0gYXJnc1sxXTtcblxuXG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0ZWRQYXR0ZXJuKHBhdHRlcm4pKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihSZXBsYWNlUGlwZSwgcGF0dGVybik7XG4gICAgfVxuICAgIGlmICghdGhpcy5fc3VwcG9ydGVkUmVwbGFjZW1lbnQocmVwbGFjZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihSZXBsYWNlUGlwZSwgcmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgICAvLyB0ZW1wbGF0ZSBmYWlscyB3aXRoIGxpdGVyYWwgUmVnRXhwIGUuZyAvcGF0dGVybi9pZ21cbiAgICAvLyB2YXIgcmd4ID0gcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCA/IHBhdHRlcm4gOiBSZWdFeHBXcmFwcGVyLmNyZWF0ZShwYXR0ZXJuKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHJlcGxhY2VtZW50KSkge1xuICAgICAgdmFyIHJneFBhdHRlcm4gPSBpc1N0cmluZyhwYXR0ZXJuKSA/IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKHBhdHRlcm4pIDogcGF0dGVybjtcblxuICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChpbnB1dCwgcmd4UGF0dGVybiwgcmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgICBpZiAocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgLy8gdXNlIHRoZSByZXBsYWNlQWxsIHZhcmlhbnRcbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoaW5wdXQsIHBhdHRlcm4sIHJlcGxhY2VtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlKGlucHV0LCBwYXR0ZXJuLCByZXBsYWNlbWVudCk7XG4gIH1cblxuICBwcml2YXRlIF9zdXBwb3J0ZWRJbnB1dChpbnB1dDogYW55KTogYm9vbGVhbiB7IHJldHVybiBpc1N0cmluZyhpbnB1dCkgfHwgaXNOdW1iZXIoaW5wdXQpOyB9XG5cbiAgcHJpdmF0ZSBfc3VwcG9ydGVkUGF0dGVybihwYXR0ZXJuOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTdHJpbmcocGF0dGVybikgfHwgcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgfVxuXG4gIHByaXZhdGUgX3N1cHBvcnRlZFJlcGxhY2VtZW50KHJlcGxhY2VtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTdHJpbmcocmVwbGFjZW1lbnQpIHx8IGlzRnVuY3Rpb24ocmVwbGFjZW1lbnQpO1xuICB9XG59XG4iXX0=