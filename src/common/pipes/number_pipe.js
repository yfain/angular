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
var exceptions_1 = require('angular2/src/facade/exceptions');
var intl_1 = require('angular2/src/facade/intl');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
var defaultLocale = 'en-US';
var _re = lang_1.RegExpWrapper.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');
/**
 * Internal base class for numeric pipes.
 */
var NumberPipe = (function () {
    function NumberPipe() {
    }
    /** @internal */
    NumberPipe._format = function (value, style, digits, currency, currencyAsSymbol) {
        if (currency === void 0) { currency = null; }
        if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
        if (lang_1.isBlank(value))
            return null;
        if (!lang_1.isNumber(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(NumberPipe, value);
        }
        var minInt = 1, minFraction = 0, maxFraction = 3;
        if (lang_1.isPresent(digits)) {
            var parts = lang_1.RegExpWrapper.firstMatch(_re, digits);
            if (lang_1.isBlank(parts)) {
                throw new exceptions_1.BaseException(digits + " is not a valid digit info for number pipes");
            }
            if (lang_1.isPresent(parts[1])) {
                minInt = lang_1.NumberWrapper.parseIntAutoRadix(parts[1]);
            }
            if (lang_1.isPresent(parts[3])) {
                minFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[3]);
            }
            if (lang_1.isPresent(parts[5])) {
                maxFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[5]);
            }
        }
        return intl_1.NumberFormatter.format(value, defaultLocale, style, {
            minimumIntegerDigits: minInt,
            minimumFractionDigits: minFraction,
            maximumFractionDigits: maxFraction,
            currency: currency,
            currencyAsSymbol: currencyAsSymbol
        });
    };
    NumberPipe = __decorate([
        lang_1.CONST(),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], NumberPipe);
    return NumberPipe;
})();
exports.NumberPipe = NumberPipe;
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local text. i.e. group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * ### Usage
 *
 *     expression | number[:digitInfo]
 *
 * where `expression` is a number and `digitInfo` has the following format:
 *
 *     {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 *
 * - minIntegerDigits is the minimum number of integer digits to use. Defaults to 1.
 * - minFractionDigits is the minimum number of digits after fraction. Defaults to 0.
 * - maxFractionDigits is the maximum number of digits after fraction. Defaults to 3.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='NumberPipe'}
 */
var DecimalPipe = (function (_super) {
    __extends(DecimalPipe, _super);
    function DecimalPipe() {
        _super.apply(this, arguments);
    }
    DecimalPipe.prototype.transform = function (value, args) {
        var digits = collection_1.ListWrapper.first(args);
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Decimal, digits);
    };
    DecimalPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'number' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DecimalPipe);
    return DecimalPipe;
})(NumberPipe);
exports.DecimalPipe = DecimalPipe;
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local percent.
 *
 * ### Usage
 *
 *     expression | percent[:digitInfo]
 *
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='PercentPipe'}
 */
var PercentPipe = (function (_super) {
    __extends(PercentPipe, _super);
    function PercentPipe() {
        _super.apply(this, arguments);
    }
    PercentPipe.prototype.transform = function (value, args) {
        var digits = collection_1.ListWrapper.first(args);
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Percent, digits);
    };
    PercentPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'percent' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PercentPipe);
    return PercentPipe;
})(NumberPipe);
exports.PercentPipe = PercentPipe;
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local currency.
 *
 * ### Usage
 *
 *     expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]
 *
 * where `currencyCode` is the ISO 4217 currency code, such as "USD" for the US dollar and
 * "EUR" for the euro. `symbolDisplay` is a boolean indicating whether to use the currency
 * symbol (e.g. $) or the currency code (e.g. USD) in the output. The default for this value
 * is `false`.
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='CurrencyPipe'}
 */
var CurrencyPipe = (function (_super) {
    __extends(CurrencyPipe, _super);
    function CurrencyPipe() {
        _super.apply(this, arguments);
    }
    CurrencyPipe.prototype.transform = function (value, args) {
        var currencyCode = lang_1.isPresent(args) && args.length > 0 ? args[0] : 'USD';
        var symbolDisplay = lang_1.isPresent(args) && args.length > 1 ? args[1] : false;
        var digits = lang_1.isPresent(args) && args.length > 2 ? args[2] : null;
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    };
    CurrencyPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'currency' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CurrencyPipe);
    return CurrencyPipe;
})(NumberPipe);
exports.CurrencyPipe = CurrencyPipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbIk51bWJlclBpcGUiLCJOdW1iZXJQaXBlLmNvbnN0cnVjdG9yIiwiTnVtYmVyUGlwZS5fZm9ybWF0IiwiRGVjaW1hbFBpcGUiLCJEZWNpbWFsUGlwZS5jb25zdHJ1Y3RvciIsIkRlY2ltYWxQaXBlLnRyYW5zZm9ybSIsIlBlcmNlbnRQaXBlIiwiUGVyY2VudFBpcGUuY29uc3RydWN0b3IiLCJQZXJjZW50UGlwZS50cmFuc2Zvcm0iLCJDdXJyZW5jeVBpcGUiLCJDdXJyZW5jeVBpcGUuY29uc3RydWN0b3IiLCJDdXJyZW5jeVBpcGUudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFnSCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzNJLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLHFCQUFpRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzVFLHFCQUE0RCxlQUFlLENBQUMsQ0FBQTtBQUM1RSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUUzRCxnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRSxJQUFJLGFBQWEsR0FBVyxPQUFPLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsb0JBQWEsQ0FBQyxNQUFNLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUVwRTs7R0FFRztBQUNIO0lBQUFBO0lBbUNBQyxDQUFDQTtJQWhDQ0QsZ0JBQWdCQTtJQUNUQSxrQkFBT0EsR0FBZEEsVUFDSUEsS0FBYUEsRUFBRUEsS0FBd0JBLEVBQUVBLE1BQWNBLEVBQUVBLFFBQXVCQSxFQUNoRkEsZ0JBQWlDQTtRQUR3QkUsd0JBQXVCQSxHQUF2QkEsZUFBdUJBO1FBQ2hGQSxnQ0FBaUNBLEdBQWpDQSx3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QUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2hGQSxJQUFJQSxhQUFhQSxHQUFZQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbEZBLElBQUlBLE1BQU1BLEdBQVdBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6RUEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FDckJBLEtBQUtBLEVBQUVBLHdCQUFpQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsRUFBRUEsWUFBWUEsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDOUVBLENBQUNBO0lBVkhGO1FBQUNBLFlBQUtBLEVBQUVBO1FBQ1BBLFdBQUlBLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLFVBQVVBLEVBQUNBLENBQUNBO1FBQ3hCQSxpQkFBVUEsRUFBRUE7O3FCQVNaQTtJQUFEQSxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxFQUdrQyxVQUFVLEVBUTNDO0FBUlksb0JBQVksZUFReEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNOdW1iZXIsIGlzUHJlc2VudCwgaXNCbGFuaywgU3RyaW5nV3JhcHBlciwgTnVtYmVyV3JhcHBlciwgUmVnRXhwV3JhcHBlciwgQ09OU1QsIEZ1bmN0aW9uV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TnVtYmVyRm9ybWF0dGVyLCBOdW1iZXJGb3JtYXRTdHlsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9pbnRsJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxudmFyIGRlZmF1bHRMb2NhbGU6IHN0cmluZyA9ICdlbi1VUyc7XG52YXIgX3JlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14oXFxcXGQrKT9cXFxcLigoXFxcXGQrKShcXFxcLShcXFxcZCspKT8pPyQnKTtcblxuLyoqXG4gKiBJbnRlcm5hbCBiYXNlIGNsYXNzIGZvciBudW1lcmljIHBpcGVzLlxuICovXG5AQ09OU1QoKVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE51bWJlclBpcGUge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfZm9ybWF0KFxuICAgICAgdmFsdWU6IG51bWJlciwgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLCBkaWdpdHM6IHN0cmluZywgY3VycmVuY3k6IHN0cmluZyA9IG51bGwsXG4gICAgICBjdXJyZW5jeUFzU3ltYm9sOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFpc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKE51bWJlclBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgdmFyIG1pbkludCA9IDEsIG1pbkZyYWN0aW9uID0gMCwgbWF4RnJhY3Rpb24gPSAzO1xuICAgIGlmIChpc1ByZXNlbnQoZGlnaXRzKSkge1xuICAgICAgdmFyIHBhcnRzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9yZSwgZGlnaXRzKTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcnRzKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtkaWdpdHN9IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm8gZm9yIG51bWJlciBwaXBlc2ApO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1sxXSkpIHsgIC8vIG1pbiBpbnRlZ2VyIGRpZ2l0c1xuICAgICAgICBtaW5JbnQgPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbM10pKSB7ICAvLyBtaW4gZnJhY3Rpb24gZGlnaXRzXG4gICAgICAgIG1pbkZyYWN0aW9uID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1szXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzVdKSkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgICBtYXhGcmFjdGlvbiA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbNV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSwgZGVmYXVsdExvY2FsZSwgc3R5bGUsIHtcbiAgICAgIG1pbmltdW1JbnRlZ2VyRGlnaXRzOiBtaW5JbnQsXG4gICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBtYXhGcmFjdGlvbixcbiAgICAgIGN1cnJlbmN5OiBjdXJyZW5jeSxcbiAgICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2xcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgdGV4dC4gaS5lLiBncm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucyBhcmUgYmFzZWQgb24gdGhlIGFjdGl2ZSBsb2NhbGUuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBudW1iZXJbOmRpZ2l0SW5mb11cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXIgYW5kIGBkaWdpdEluZm9gIGhhcyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiAgICAge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfVxuICpcbiAqIC0gbWluSW50ZWdlckRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byAxLlxuICogLSBtaW5GcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAwLlxuICogLSBtYXhGcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAzLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBhY2NlcHRhYmxlIHJhbmdlIGZvciBlYWNoIG9mIHRoZXNlIG51bWJlcnMgYW5kIG90aGVyXG4gKiBkZXRhaWxzIHNlZSB5b3VyIG5hdGl2ZSBpbnRlcm5hdGlvbmFsaXphdGlvbiBsaWJyYXJ5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J051bWJlclBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEZWNpbWFsUGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBMaXN0V3JhcHBlci5maXJzdChhcmdzKTtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCBwZXJjZW50LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgcGVyY2VudFs6ZGlnaXRJbmZvXVxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGBkaWdpdEluZm9gIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nUGVyY2VudFBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGVyY2VudFBpcGUgZXh0ZW5kcyBOdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIGRpZ2l0czogc3RyaW5nID0gTGlzdFdyYXBwZXIuZmlyc3QoYXJncyk7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdCh2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgY3VycmVuY3kuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBjdXJyZW5jeVs6Y3VycmVuY3lDb2RlWzpzeW1ib2xEaXNwbGF5WzpkaWdpdEluZm9dXV1cbiAqXG4gKiB3aGVyZSBgY3VycmVuY3lDb2RlYCBpcyB0aGUgSVNPIDQyMTcgY3VycmVuY3kgY29kZSwgc3VjaCBhcyBcIlVTRFwiIGZvciB0aGUgVVMgZG9sbGFyIGFuZFxuICogXCJFVVJcIiBmb3IgdGhlIGV1cm8uIGBzeW1ib2xEaXNwbGF5YCBpcyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgY3VycmVuY3lcbiAqIHN5bWJvbCAoZS5nLiAkKSBvciB0aGUgY3VycmVuY3kgY29kZSAoZS5nLiBVU0QpIGluIHRoZSBvdXRwdXQuIFRoZSBkZWZhdWx0IGZvciB0aGlzIHZhbHVlXG4gKiBpcyBgZmFsc2VgLlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYGRpZ2l0SW5mb2Agc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdDdXJyZW5jeVBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5UGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgY3VycmVuY3lDb2RlOiBzdHJpbmcgPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6ICdVU0QnO1xuICAgIHZhciBzeW1ib2xEaXNwbGF5OiBib29sZWFuID0gaXNQcmVzZW50KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMSA/IGFyZ3NbMV0gOiBmYWxzZTtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAyID8gYXJnc1syXSA6IG51bGw7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdChcbiAgICAgICAgdmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5LCBkaWdpdHMsIGN1cnJlbmN5Q29kZSwgc3ltYm9sRGlzcGxheSk7XG4gIH1cbn1cbiJdfQ==