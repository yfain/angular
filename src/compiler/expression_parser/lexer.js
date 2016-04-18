'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
var decorators_1 = require('angular2/src/core/di/decorators');
var collection_1 = require("angular2/src/facade/collection");
var lang_1 = require("angular2/src/facade/lang");
var exceptions_1 = require('angular2/src/facade/exceptions');
(function (TokenType) {
    TokenType[TokenType["Character"] = 0] = "Character";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Keyword"] = 2] = "Keyword";
    TokenType[TokenType["String"] = 3] = "String";
    TokenType[TokenType["Operator"] = 4] = "Operator";
    TokenType[TokenType["Number"] = 5] = "Number";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
var Lexer = (function () {
    function Lexer() {
    }
    Lexer.prototype.tokenize = function (text) {
        var scanner = new _Scanner(text);
        var tokens = [];
        var token = scanner.scanToken();
        while (token != null) {
            tokens.push(token);
            token = scanner.scanToken();
        }
        return tokens;
    };
    Lexer = __decorate([
        decorators_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Lexer);
    return Lexer;
}());
exports.Lexer = Lexer;
var Token = (function () {
    function Token(index, type, numValue, strValue) {
        this.index = index;
        this.type = type;
        this.numValue = numValue;
        this.strValue = strValue;
    }
    Token.prototype.isCharacter = function (code) {
        return (this.type == TokenType.Character && this.numValue == code);
    };
    Token.prototype.isNumber = function () { return (this.type == TokenType.Number); };
    Token.prototype.isString = function () { return (this.type == TokenType.String); };
    Token.prototype.isOperator = function (operater) {
        return (this.type == TokenType.Operator && this.strValue == operater);
    };
    Token.prototype.isIdentifier = function () { return (this.type == TokenType.Identifier); };
    Token.prototype.isKeyword = function () { return (this.type == TokenType.Keyword); };
    Token.prototype.isKeywordVar = function () { return (this.type == TokenType.Keyword && this.strValue == "var"); };
    Token.prototype.isKeywordNull = function () { return (this.type == TokenType.Keyword && this.strValue == "null"); };
    Token.prototype.isKeywordUndefined = function () {
        return (this.type == TokenType.Keyword && this.strValue == "undefined");
    };
    Token.prototype.isKeywordTrue = function () { return (this.type == TokenType.Keyword && this.strValue == "true"); };
    Token.prototype.isKeywordFalse = function () { return (this.type == TokenType.Keyword && this.strValue == "false"); };
    Token.prototype.toNumber = function () {
        // -1 instead of NULL ok?
        return (this.type == TokenType.Number) ? this.numValue : -1;
    };
    Token.prototype.toString = function () {
        switch (this.type) {
            case TokenType.Character:
            case TokenType.Identifier:
            case TokenType.Keyword:
            case TokenType.Operator:
            case TokenType.String:
                return this.strValue;
            case TokenType.Number:
                return this.numValue.toString();
            default:
                return null;
        }
    };
    return Token;
}());
exports.Token = Token;
function newCharacterToken(index, code) {
    return new Token(index, TokenType.Character, code, lang_1.StringWrapper.fromCharCode(code));
}
function newIdentifierToken(index, text) {
    return new Token(index, TokenType.Identifier, 0, text);
}
function newKeywordToken(index, text) {
    return new Token(index, TokenType.Keyword, 0, text);
}
function newOperatorToken(index, text) {
    return new Token(index, TokenType.Operator, 0, text);
}
function newStringToken(index, text) {
    return new Token(index, TokenType.String, 0, text);
}
function newNumberToken(index, n) {
    return new Token(index, TokenType.Number, n, "");
}
exports.EOF = new Token(-1, TokenType.Character, 0, "");
exports.$EOF = 0;
exports.$TAB = 9;
exports.$LF = 10;
exports.$VTAB = 11;
exports.$FF = 12;
exports.$CR = 13;
exports.$SPACE = 32;
exports.$BANG = 33;
exports.$DQ = 34;
exports.$HASH = 35;
exports.$$ = 36;
exports.$PERCENT = 37;
exports.$AMPERSAND = 38;
exports.$SQ = 39;
exports.$LPAREN = 40;
exports.$RPAREN = 41;
exports.$STAR = 42;
exports.$PLUS = 43;
exports.$COMMA = 44;
exports.$MINUS = 45;
exports.$PERIOD = 46;
exports.$SLASH = 47;
exports.$COLON = 58;
exports.$SEMICOLON = 59;
exports.$LT = 60;
exports.$EQ = 61;
exports.$GT = 62;
exports.$QUESTION = 63;
var $0 = 48;
var $9 = 57;
var $A = 65, $E = 69, $Z = 90;
exports.$LBRACKET = 91;
exports.$BACKSLASH = 92;
exports.$RBRACKET = 93;
var $CARET = 94;
var $_ = 95;
var $a = 97, $e = 101, $f = 102, $n = 110, $r = 114, $t = 116, $u = 117, $v = 118, $z = 122;
exports.$LBRACE = 123;
exports.$BAR = 124;
exports.$RBRACE = 125;
var $NBSP = 160;
var ScannerError = (function (_super) {
    __extends(ScannerError, _super);
    function ScannerError(message) {
        _super.call(this);
        this.message = message;
    }
    ScannerError.prototype.toString = function () { return this.message; };
    return ScannerError;
}(exceptions_1.BaseException));
exports.ScannerError = ScannerError;
var _Scanner = (function () {
    function _Scanner(input) {
        this.input = input;
        this.peek = 0;
        this.index = -1;
        this.length = input.length;
        this.advance();
    }
    _Scanner.prototype.advance = function () {
        this.peek =
            ++this.index >= this.length ? exports.$EOF : lang_1.StringWrapper.charCodeAt(this.input, this.index);
    };
    _Scanner.prototype.scanToken = function () {
        var input = this.input, length = this.length, peek = this.peek, index = this.index;
        // Skip whitespace.
        while (peek <= exports.$SPACE) {
            if (++index >= length) {
                peek = exports.$EOF;
                break;
            }
            else {
                peek = lang_1.StringWrapper.charCodeAt(input, index);
            }
        }
        this.peek = peek;
        this.index = index;
        if (index >= length) {
            return null;
        }
        // Handle identifiers and numbers.
        if (isIdentifierStart(peek))
            return this.scanIdentifier();
        if (isDigit(peek))
            return this.scanNumber(index);
        var start = index;
        switch (peek) {
            case exports.$PERIOD:
                this.advance();
                return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, exports.$PERIOD);
            case exports.$LPAREN:
            case exports.$RPAREN:
            case exports.$LBRACE:
            case exports.$RBRACE:
            case exports.$LBRACKET:
            case exports.$RBRACKET:
            case exports.$COMMA:
            case exports.$COLON:
            case exports.$SEMICOLON:
                return this.scanCharacter(start, peek);
            case exports.$SQ:
            case exports.$DQ:
                return this.scanString();
            case exports.$HASH:
            case exports.$PLUS:
            case exports.$MINUS:
            case exports.$STAR:
            case exports.$SLASH:
            case exports.$PERCENT:
            case $CARET:
                return this.scanOperator(start, lang_1.StringWrapper.fromCharCode(peek));
            case exports.$QUESTION:
                return this.scanComplexOperator(start, '?', exports.$PERIOD, '.');
            case exports.$LT:
            case exports.$GT:
                return this.scanComplexOperator(start, lang_1.StringWrapper.fromCharCode(peek), exports.$EQ, '=');
            case exports.$BANG:
            case exports.$EQ:
                return this.scanComplexOperator(start, lang_1.StringWrapper.fromCharCode(peek), exports.$EQ, '=', exports.$EQ, '=');
            case exports.$AMPERSAND:
                return this.scanComplexOperator(start, '&', exports.$AMPERSAND, '&');
            case exports.$BAR:
                return this.scanComplexOperator(start, '|', exports.$BAR, '|');
            case $NBSP:
                while (isWhitespace(this.peek))
                    this.advance();
                return this.scanToken();
        }
        this.error("Unexpected character [" + lang_1.StringWrapper.fromCharCode(peek) + "]", 0);
        return null;
    };
    _Scanner.prototype.scanCharacter = function (start, code) {
        this.advance();
        return newCharacterToken(start, code);
    };
    _Scanner.prototype.scanOperator = function (start, str) {
        this.advance();
        return newOperatorToken(start, str);
    };
    /**
     * Tokenize a 2/3 char long operator
     *
     * @param start start index in the expression
     * @param one first symbol (always part of the operator)
     * @param twoCode code point for the second symbol
     * @param two second symbol (part of the operator when the second code point matches)
     * @param threeCode code point for the third symbol
     * @param three third symbol (part of the operator when provided and matches source expression)
     * @returns {Token}
     */
    _Scanner.prototype.scanComplexOperator = function (start, one, twoCode, two, threeCode, three) {
        this.advance();
        var str = one;
        if (this.peek == twoCode) {
            this.advance();
            str += two;
        }
        if (lang_1.isPresent(threeCode) && this.peek == threeCode) {
            this.advance();
            str += three;
        }
        return newOperatorToken(start, str);
    };
    _Scanner.prototype.scanIdentifier = function () {
        var start = this.index;
        this.advance();
        while (isIdentifierPart(this.peek))
            this.advance();
        var str = this.input.substring(start, this.index);
        if (collection_1.SetWrapper.has(KEYWORDS, str)) {
            return newKeywordToken(start, str);
        }
        else {
            return newIdentifierToken(start, str);
        }
    };
    _Scanner.prototype.scanNumber = function (start) {
        var simple = (this.index === start);
        this.advance(); // Skip initial digit.
        while (true) {
            if (isDigit(this.peek)) {
            }
            else if (this.peek == exports.$PERIOD) {
                simple = false;
            }
            else if (isExponentStart(this.peek)) {
                this.advance();
                if (isExponentSign(this.peek))
                    this.advance();
                if (!isDigit(this.peek))
                    this.error('Invalid exponent', -1);
                simple = false;
            }
            else {
                break;
            }
            this.advance();
        }
        var str = this.input.substring(start, this.index);
        // TODO
        var value = simple ? lang_1.NumberWrapper.parseIntAutoRadix(str) : lang_1.NumberWrapper.parseFloat(str);
        return newNumberToken(start, value);
    };
    _Scanner.prototype.scanString = function () {
        var start = this.index;
        var quote = this.peek;
        this.advance(); // Skip initial quote.
        var buffer;
        var marker = this.index;
        var input = this.input;
        while (this.peek != quote) {
            if (this.peek == exports.$BACKSLASH) {
                if (buffer == null)
                    buffer = new lang_1.StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode;
                if (this.peek == $u) {
                    // 4 character hex code for unicode character.
                    var hex = input.substring(this.index + 1, this.index + 5);
                    try {
                        unescapedCode = lang_1.NumberWrapper.parseInt(hex, 16);
                    }
                    catch (e) {
                        this.error("Invalid unicode escape [\\u" + hex + "]", 0);
                    }
                    for (var i = 0; i < 5; i++) {
                        this.advance();
                    }
                }
                else {
                    unescapedCode = unescape(this.peek);
                    this.advance();
                }
                buffer.add(lang_1.StringWrapper.fromCharCode(unescapedCode));
                marker = this.index;
            }
            else if (this.peek == exports.$EOF) {
                this.error('Unterminated quote', 0);
            }
            else {
                this.advance();
            }
        }
        var last = input.substring(marker, this.index);
        this.advance(); // Skip terminating quote.
        // Compute the unescaped string value.
        var unescaped = last;
        if (buffer != null) {
            buffer.add(last);
            unescaped = buffer.toString();
        }
        return newStringToken(start, unescaped);
    };
    _Scanner.prototype.error = function (message, offset) {
        var position = this.index + offset;
        throw new ScannerError("Lexer Error: " + message + " at column " + position + " in expression [" + this.input + "]");
    };
    return _Scanner;
}());
function isWhitespace(code) {
    return (code >= exports.$TAB && code <= exports.$SPACE) || (code == $NBSP);
}
function isIdentifierStart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == exports.$$);
}
function isIdentifier(input) {
    if (input.length == 0)
        return false;
    var scanner = new _Scanner(input);
    if (!isIdentifierStart(scanner.peek))
        return false;
    scanner.advance();
    while (scanner.peek !== exports.$EOF) {
        if (!isIdentifierPart(scanner.peek))
            return false;
        scanner.advance();
    }
    return true;
}
exports.isIdentifier = isIdentifier;
function isIdentifierPart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) ||
        (code == $_) || (code == exports.$$);
}
function isDigit(code) {
    return $0 <= code && code <= $9;
}
function isExponentStart(code) {
    return code == $e || code == $E;
}
function isExponentSign(code) {
    return code == exports.$MINUS || code == exports.$PLUS;
}
function unescape(code) {
    switch (code) {
        case $n:
            return exports.$LF;
        case $f:
            return exports.$FF;
        case $r:
            return exports.$CR;
        case $t:
            return exports.$TAB;
        case $v:
            return exports.$VTAB;
        default:
            return code;
    }
}
var OPERATORS = collection_1.SetWrapper.createFromList([
    '+',
    '-',
    '*',
    '/',
    '%',
    '^',
    '=',
    '==',
    '!=',
    '===',
    '!==',
    '<',
    '>',
    '<=',
    '>=',
    '&&',
    '||',
    '&',
    '|',
    '!',
    '?',
    '#',
    '?.'
]);
var KEYWORDS = collection_1.SetWrapper.createFromList(['var', 'null', 'undefined', 'true', 'false', 'if', 'else']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXRNV2dTUUZ1LnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQXlCLGlDQUFpQyxDQUFDLENBQUE7QUFDM0QsMkJBQXNDLGdDQUFnQyxDQUFDLENBQUE7QUFDdkUscUJBQW9FLDBCQUEwQixDQUFDLENBQUE7QUFDL0YsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0QsV0FBWSxTQUFTO0lBQ25CLG1EQUFTLENBQUE7SUFDVCxxREFBVSxDQUFBO0lBQ1YsK0NBQU8sQ0FBQTtJQUNQLDZDQUFNLENBQUE7SUFDTixpREFBUSxDQUFBO0lBQ1IsNkNBQU0sQ0FBQTtBQUNSLENBQUMsRUFQVyxpQkFBUyxLQUFULGlCQUFTLFFBT3BCO0FBUEQsSUFBWSxTQUFTLEdBQVQsaUJBT1gsQ0FBQTtBQUdEO0lBQUE7SUFXQSxDQUFDO0lBVkMsd0JBQVEsR0FBUixVQUFTLElBQVk7UUFDbkIsSUFBSSxPQUFPLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxPQUFPLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQVhIO1FBQUMsdUJBQVUsRUFBRTs7YUFBQTtJQVliLFlBQUM7QUFBRCxDQUFDLEFBWEQsSUFXQztBQVhZLGFB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USxHQUNSLHVCQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvZGVjb3JhdG9ycyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTZXRXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uXCI7XG5pbXBvcnQge051bWJlcldyYXBwZXIsIFN0cmluZ0pvaW5lciwgU3RyaW5nV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmV4cG9ydCBlbnVtIFRva2VuVHlwZSB7XG4gIENoYXJhY3RlcixcbiAgSWRlbnRpZmllcixcbiAgS2V5d29yZCxcbiAgU3RyaW5nLFxuICBPcGVyYXRvcixcbiAgTnVtYmVyXG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMZXhlciB7XG4gIHRva2VuaXplKHRleHQ6IHN0cmluZyk6IGFueVtdIHtcbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBfU2Nhbm5lcih0ZXh0KTtcbiAgICB2YXIgdG9rZW5zID0gW107XG4gICAgdmFyIHRva2VuID0gc2Nhbm5lci5zY2FuVG9rZW4oKTtcbiAgICB3aGlsZSAodG9rZW4gIT0gbnVsbCkge1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgdG9rZW4gPSBzY2FubmVyLnNjYW5Ub2tlbigpO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgdHlwZTogVG9rZW5UeXBlLCBwdWJsaWMgbnVtVmFsdWU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHt9XG5cbiAgaXNDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLkNoYXJhY3RlciAmJiB0aGlzLm51bVZhbHVlID09IGNvZGUpO1xuICB9XG5cbiAgaXNOdW1iZXIoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5OdW1iZXIpOyB9XG5cbiAgaXNTdHJpbmcoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5TdHJpbmcpOyB9XG5cbiAgaXNPcGVyYXRvcihvcGVyYXRlcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLk9wZXJhdG9yICYmIHRoaXMuc3RyVmFsdWUgPT0gb3BlcmF0ZXIpO1xuICB9XG5cbiAgaXNJZGVudGlmaWVyKCk6IGJvb2xlYW4geyByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuSWRlbnRpZmllcik7IH1cblxuICBpc0tleXdvcmQoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5LZXl3b3JkKTsgfVxuXG4gIGlzS2V5d29yZFZhcigpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLnR5cGUgPT0gVG9rZW5UeXBlLktleXdvcmQgJiYgdGhpcy5zdHJWYWx1ZSA9PSBcInZhclwiKTsgfVxuXG4gIGlzS2V5d29yZE51bGwoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5LZXl3b3JkICYmIHRoaXMuc3RyVmFsdWUgPT0gXCJudWxsXCIpOyB9XG5cbiAgaXNLZXl3b3JkVW5kZWZpbmVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy50eXBlID09IFRva2VuVHlwZS5LZXl3b3JkICYmIHRoaXMuc3RyVmFsdWUgPT0gXCJ1bmRlZmluZWRcIik7XG4gIH1cblxuICBpc0tleXdvcmRUcnVlKCk6IGJvb2xlYW4geyByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuS2V5d29yZCAmJiB0aGlzLnN0clZhbHVlID09IFwidHJ1ZVwiKTsgfVxuXG4gIGlzS2V5d29yZEZhbHNlKCk6IGJvb2xlYW4geyByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuS2V5d29yZCAmJiB0aGlzLnN0clZhbHVlID09IFwiZmFsc2VcIik7IH1cblxuICB0b051bWJlcigpOiBudW1iZXIge1xuICAgIC8vIC0xIGluc3RlYWQgb2YgTlVMTCBvaz9cbiAgICByZXR1cm4gKHRoaXMudHlwZSA9PSBUb2tlblR5cGUuTnVtYmVyKSA/IHRoaXMubnVtVmFsdWUgOiAtMTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgVG9rZW5UeXBlLkNoYXJhY3RlcjpcbiAgICAgIGNhc2UgVG9rZW5UeXBlLklkZW50aWZpZXI6XG4gICAgICBjYXNlIFRva2VuVHlwZS5LZXl3b3JkOlxuICAgICAgY2FzZSBUb2tlblR5cGUuT3BlcmF0b3I6XG4gICAgICBjYXNlIFRva2VuVHlwZS5TdHJpbmc6XG4gICAgICAgIHJldHVybiB0aGlzLnN0clZhbHVlO1xuICAgICAgY2FzZSBUb2tlblR5cGUuTnVtYmVyOlxuICAgICAgICByZXR1cm4gdGhpcy5udW1WYWx1ZS50b1N0cmluZygpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG5ld0NoYXJhY3RlclRva2VuKGluZGV4OiBudW1iZXIsIGNvZGU6IG51bWJlcik6IFRva2VuIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihpbmRleCwgVG9rZW5UeXBlLkNoYXJhY3RlciwgY29kZSwgU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY29kZSkpO1xufVxuXG5mdW5jdGlvbiBuZXdJZGVudGlmaWVyVG9rZW4oaW5kZXg6IG51bWJlciwgdGV4dDogc3RyaW5nKTogVG9rZW4ge1xuICByZXR1cm4gbmV3IFRva2VuKGluZGV4LCBUb2tlblR5cGUuSWRlbnRpZmllciwgMCwgdGV4dCk7XG59XG5cbmZ1bmN0aW9uIG5ld0tleXdvcmRUb2tlbihpbmRleDogbnVtYmVyLCB0ZXh0OiBzdHJpbmcpOiBUb2tlbiB7XG4gIHJldHVybiBuZXcgVG9rZW4oaW5kZXgsIFRva2VuVHlwZS5LZXl3b3JkLCAwLCB0ZXh0KTtcbn1cblxuZnVuY3Rpb24gbmV3T3BlcmF0b3JUb2tlbihpbmRleDogbnVtYmVyLCB0ZXh0OiBzdHJpbmcpOiBUb2tlbiB7XG4gIHJldHVybiBuZXcgVG9rZW4oaW5kZXgsIFRva2VuVHlwZS5PcGVyYXRvciwgMCwgdGV4dCk7XG59XG5cbmZ1bmN0aW9uIG5ld1N0cmluZ1Rva2VuKGluZGV4OiBudW1iZXIsIHRleHQ6IHN0cmluZyk6IFRva2VuIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihpbmRleCwgVG9rZW5UeXBlLlN0cmluZywgMCwgdGV4dCk7XG59XG5cbmZ1bmN0aW9uIG5ld051bWJlclRva2VuKGluZGV4OiBudW1iZXIsIG46IG51bWJlcik6IFRva2VuIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihpbmRleCwgVG9rZW5UeXBlLk51bWJlciwgbiwgXCJcIik7XG59XG5cblxuZXhwb3J0IHZhciBFT0Y6IFRva2VuID0gbmV3IFRva2VuKC0xLCBUb2tlblR5cGUuQ2hhcmFjdGVyLCAwLCBcIlwiKTtcblxuZXhwb3J0IGNvbnN0ICRFT0YgPSAwO1xuZXhwb3J0IGNvbnN0ICRUQUIgPSA5O1xuZXhwb3J0IGNvbnN0ICRMRiA9IDEwO1xuZXhwb3J0IGNvbnN0ICRWVEFCID0gMTE7XG5leHBvcnQgY29uc3QgJEZGID0gMTI7XG5leHBvcnQgY29uc3QgJENSID0gMTM7XG5leHBvcnQgY29uc3QgJFNQQUNFID0gMzI7XG5leHBvcnQgY29uc3QgJEJBTkcgPSAzMztcbmV4cG9ydCBjb25zdCAkRFEgPSAzNDtcbmV4cG9ydCBjb25zdCAkSEFTSCA9IDM1O1xuZXhwb3J0IGNvbnN0ICQkID0gMzY7XG5leHBvcnQgY29uc3QgJFBFUkNFTlQgPSAzNztcbmV4cG9ydCBjb25zdCAkQU1QRVJTQU5EID0gMzg7XG5leHBvcnQgY29uc3QgJFNRID0gMzk7XG5leHBvcnQgY29uc3QgJExQQVJFTiA9IDQwO1xuZXhwb3J0IGNvbnN0ICRSUEFSRU4gPSA0MTtcbmV4cG9ydCBjb25zdCAkU1RBUiA9IDQyO1xuZXhwb3J0IGNvbnN0ICRQTFVTID0gNDM7XG5leHBvcnQgY29uc3QgJENPTU1BID0gNDQ7XG5leHBvcnQgY29uc3QgJE1JTlVTID0gNDU7XG5leHBvcnQgY29uc3QgJFBFUklPRCA9IDQ2O1xuZXhwb3J0IGNvbnN0ICRTTEFTSCA9IDQ3O1xuZXhwb3J0IGNvbnN0ICRDT0xPTiA9IDU4O1xuZXhwb3J0IGNvbnN0ICRTRU1JQ09MT04gPSA1OTtcbmV4cG9ydCBjb25zdCAkTFQgPSA2MDtcbmV4cG9ydCBjb25zdCAkRVEgPSA2MTtcbmV4cG9ydCBjb25zdCAkR1QgPSA2MjtcbmV4cG9ydCBjb25zdCAkUVVFU1RJT04gPSA2MztcblxuY29uc3QgJDAgPSA0ODtcbmNvbnN0ICQ5ID0gNTc7XG5cbmNvbnN0ICRBID0gNjUsICRFID0gNjksICRaID0gOTA7XG5cbmV4cG9ydCBjb25zdCAkTEJSQUNLRVQgPSA5MTtcbmV4cG9ydCBjb25zdCAkQkFDS1NMQVNIID0gOTI7XG5leHBvcnQgY29uc3QgJFJCUkFDS0VUID0gOTM7XG5jb25zdCAkQ0FSRVQgPSA5NDtcbmNvbnN0ICRfID0gOTU7XG5cbmNvbnN0ICRhID0gOTcsICRlID0gMTAxLCAkZiA9IDEwMiwgJG4gPSAxMTAsICRyID0gMTE0LCAkdCA9IDExNiwgJHUgPSAxMTcsICR2ID0gMTE4LCAkeiA9IDEyMjtcblxuZXhwb3J0IGNvbnN0ICRMQlJBQ0UgPSAxMjM7XG5leHBvcnQgY29uc3QgJEJBUiA9IDEyNDtcbmV4cG9ydCBjb25zdCAkUkJSQUNFID0gMTI1O1xuY29uc3QgJE5CU1AgPSAxNjA7XG5cbmV4cG9ydCBjbGFzcyBTY2FubmVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2UpIHsgc3VwZXIoKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuY2xhc3MgX1NjYW5uZXIge1xuICBsZW5ndGg6IG51bWJlcjtcbiAgcGVlazogbnVtYmVyID0gMDtcbiAgaW5kZXg6IG51bWJlciA9IC0xO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbnB1dDogc3RyaW5nKSB7XG4gICAgdGhpcy5sZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gIH1cblxuICBhZHZhbmNlKCkge1xuICAgIHRoaXMucGVlayA9XG4gICAgICAgICsrdGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQodGhpcy5pbnB1dCwgdGhpcy5pbmRleCk7XG4gIH1cblxuICBzY2FuVG9rZW4oKTogVG9rZW4ge1xuICAgIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQsIGxlbmd0aCA9IHRoaXMubGVuZ3RoLCBwZWVrID0gdGhpcy5wZWVrLCBpbmRleCA9IHRoaXMuaW5kZXg7XG5cbiAgICAvLyBTa2lwIHdoaXRlc3BhY2UuXG4gICAgd2hpbGUgKHBlZWsgPD0gJFNQQUNFKSB7XG4gICAgICBpZiAoKytpbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgcGVlayA9ICRFT0Y7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVlayA9IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdChpbnB1dCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGVlayA9IHBlZWs7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGlkZW50aWZpZXJzIGFuZCBudW1iZXJzLlxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChwZWVrKSkgcmV0dXJuIHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICBpZiAoaXNEaWdpdChwZWVrKSkgcmV0dXJuIHRoaXMuc2Nhbk51bWJlcihpbmRleCk7XG5cbiAgICB2YXIgc3RhcnQ6IG51bWJlciA9IGluZGV4O1xuICAgIHN3aXRjaCAocGVlaykge1xuICAgICAgY2FzZSAkUEVSSU9EOlxuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgcmV0dXJuIGlzRGlnaXQodGhpcy5wZWVrKSA/IHRoaXMuc2Nhbk51bWJlcihzdGFydCkgOiBuZXdDaGFyYWN0ZXJUb2tlbihzdGFydCwgJFBFUklPRCk7XG4gICAgICBjYXNlICRMUEFSRU46XG4gICAgICBjYXNlICRSUEFSRU46XG4gICAgICBjYXNlICRMQlJBQ0U6XG4gICAgICBjYXNlICRSQlJBQ0U6XG4gICAgICBjYXNlICRMQlJBQ0tFVDpcbiAgICAgIGNhc2UgJFJCUkFDS0VUOlxuICAgICAgY2FzZSAkQ09NTUE6XG4gICAgICBjYXNlICRDT0xPTjpcbiAgICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhbkNoYXJhY3RlcihzdGFydCwgcGVlayk7XG4gICAgICBjYXNlICRTUTpcbiAgICAgIGNhc2UgJERROlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuU3RyaW5nKCk7XG4gICAgICBjYXNlICRIQVNIOlxuICAgICAgY2FzZSAkUExVUzpcbiAgICAgIGNhc2UgJE1JTlVTOlxuICAgICAgY2FzZSAkU1RBUjpcbiAgICAgIGNhc2UgJFNMQVNIOlxuICAgICAgY2FzZSAkUEVSQ0VOVDpcbiAgICAgIGNhc2UgJENBUkVUOlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuT3BlcmF0b3Ioc3RhcnQsIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspKTtcbiAgICAgIGNhc2UgJFFVRVNUSU9OOlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuQ29tcGxleE9wZXJhdG9yKHN0YXJ0LCAnPycsICRQRVJJT0QsICcuJyk7XG4gICAgICBjYXNlICRMVDpcbiAgICAgIGNhc2UgJEdUOlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuQ29tcGxleE9wZXJhdG9yKHN0YXJ0LCBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShwZWVrKSwgJEVRLCAnPScpO1xuICAgICAgY2FzZSAkQkFORzpcbiAgICAgIGNhc2UgJEVROlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuQ29tcGxleE9wZXJhdG9yKHN0YXJ0LCBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShwZWVrKSwgJEVRLCAnPScsICRFUSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPScpO1xuICAgICAgY2FzZSAkQU1QRVJTQU5EOlxuICAgICAgICByZXR1cm4gdGhpcy5zY2FuQ29tcGxleE9wZXJhdG9yKHN0YXJ0LCAnJicsICRBTVBFUlNBTkQsICcmJyk7XG4gICAgICBjYXNlICRCQVI6XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQsICd8JywgJEJBUiwgJ3wnKTtcbiAgICAgIGNhc2UgJE5CU1A6XG4gICAgICAgIHdoaWxlIChpc1doaXRlc3BhY2UodGhpcy5wZWVrKSkgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnNjYW5Ub2tlbigpO1xuICAgIH1cblxuICAgIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFske1N0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspfV1gLCAwKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHNjYW5DaGFyYWN0ZXIoc3RhcnQ6IG51bWJlciwgY29kZTogbnVtYmVyKTogVG9rZW4ge1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHJldHVybiBuZXdDaGFyYWN0ZXJUb2tlbihzdGFydCwgY29kZSk7XG4gIH1cblxuXG4gIHNjYW5PcGVyYXRvcihzdGFydDogbnVtYmVyLCBzdHI6IHN0cmluZyk6IFRva2VuIHtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICByZXR1cm4gbmV3T3BlcmF0b3JUb2tlbihzdGFydCwgc3RyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUb2tlbml6ZSBhIDIvMyBjaGFyIGxvbmcgb3BlcmF0b3JcbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0IHN0YXJ0IGluZGV4IGluIHRoZSBleHByZXNzaW9uXG4gICAqIEBwYXJhbSBvbmUgZmlyc3Qgc3ltYm9sIChhbHdheXMgcGFydCBvZiB0aGUgb3BlcmF0b3IpXG4gICAqIEBwYXJhbSB0d29Db2RlIGNvZGUgcG9pbnQgZm9yIHRoZSBzZWNvbmQgc3ltYm9sXG4gICAqIEBwYXJhbSB0d28gc2Vjb25kIHN5bWJvbCAocGFydCBvZiB0aGUgb3BlcmF0b3Igd2hlbiB0aGUgc2Vjb25kIGNvZGUgcG9pbnQgbWF0Y2hlcylcbiAgICogQHBhcmFtIHRocmVlQ29kZSBjb2RlIHBvaW50IGZvciB0aGUgdGhpcmQgc3ltYm9sXG4gICAqIEBwYXJhbSB0aHJlZSB0aGlyZCBzeW1ib2wgKHBhcnQgb2YgdGhlIG9wZXJhdG9yIHdoZW4gcHJvdmlkZWQgYW5kIG1hdGNoZXMgc291cmNlIGV4cHJlc3Npb24pXG4gICAqIEByZXR1cm5zIHtUb2tlbn1cbiAgICovXG4gIHNjYW5Db21wbGV4T3BlcmF0b3Ioc3RhcnQ6IG51bWJlciwgb25lOiBzdHJpbmcsIHR3b0NvZGU6IG51bWJlciwgdHdvOiBzdHJpbmcsIHRocmVlQ29kZT86IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICB0aHJlZT86IHN0cmluZyk6IFRva2VuIHtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB2YXIgc3RyOiBzdHJpbmcgPSBvbmU7XG4gICAgaWYgKHRoaXMucGVlayA9PSB0d29Db2RlKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN0ciArPSB0d287XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhyZWVDb2RlKSAmJiB0aGlzLnBlZWsgPT0gdGhyZWVDb2RlKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHN0ciArPSB0aHJlZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld09wZXJhdG9yVG9rZW4oc3RhcnQsIHN0cik7XG4gIH1cblxuICBzY2FuSWRlbnRpZmllcigpOiBUb2tlbiB7XG4gICAgdmFyIHN0YXJ0OiBudW1iZXIgPSB0aGlzLmluZGV4O1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIHdoaWxlIChpc0lkZW50aWZpZXJQYXJ0KHRoaXMucGVlaykpIHRoaXMuYWR2YW5jZSgpO1xuICAgIHZhciBzdHI6IHN0cmluZyA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICBpZiAoU2V0V3JhcHBlci5oYXMoS0VZV09SRFMsIHN0cikpIHtcbiAgICAgIHJldHVybiBuZXdLZXl3b3JkVG9rZW4oc3RhcnQsIHN0cik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXdJZGVudGlmaWVyVG9rZW4oc3RhcnQsIHN0cik7XG4gICAgfVxuICB9XG5cbiAgc2Nhbk51bWJlcihzdGFydDogbnVtYmVyKTogVG9rZW4ge1xuICAgIHZhciBzaW1wbGU6IGJvb2xlYW4gPSAodGhpcy5pbmRleCA9PT0gc3RhcnQpO1xuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gU2tpcCBpbml0aWFsIGRpZ2l0LlxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoaXNEaWdpdCh0aGlzLnBlZWspKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcuXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlayA9PSAkUEVSSU9EKSB7XG4gICAgICAgIHNpbXBsZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChpc0V4cG9uZW50U3RhcnQodGhpcy5wZWVrKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgaWYgKGlzRXhwb25lbnRTaWduKHRoaXMucGVlaykpIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICBpZiAoIWlzRGlnaXQodGhpcy5wZWVrKSkgdGhpcy5lcnJvcignSW52YWxpZCBleHBvbmVudCcsIC0xKTtcbiAgICAgICAgc2ltcGxlID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyOiBzdHJpbmcgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgLy8gVE9ET1xuICAgIHZhciB2YWx1ZTogbnVtYmVyID1cbiAgICAgICAgc2ltcGxlID8gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChzdHIpIDogTnVtYmVyV3JhcHBlci5wYXJzZUZsb2F0KHN0cik7XG4gICAgcmV0dXJuIG5ld051bWJlclRva2VuKHN0YXJ0LCB2YWx1ZSk7XG4gIH1cblxuICBzY2FuU3RyaW5nKCk6IFRva2VuIHtcbiAgICB2YXIgc3RhcnQ6IG51bWJlciA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHF1b3RlOiBudW1iZXIgPSB0aGlzLnBlZWs7XG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyBTa2lwIGluaXRpYWwgcXVvdGUuXG5cbiAgICB2YXIgYnVmZmVyOiBTdHJpbmdKb2luZXI7XG4gICAgdmFyIG1hcmtlcjogbnVtYmVyID0gdGhpcy5pbmRleDtcbiAgICB2YXIgaW5wdXQ6IHN0cmluZyA9IHRoaXMuaW5wdXQ7XG5cbiAgICB3aGlsZSAodGhpcy5wZWVrICE9IHF1b3RlKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRCQUNLU0xBU0gpIHtcbiAgICAgICAgaWYgKGJ1ZmZlciA9PSBudWxsKSBidWZmZXIgPSBuZXcgU3RyaW5nSm9pbmVyKCk7XG4gICAgICAgIGJ1ZmZlci5hZGQoaW5wdXQuc3Vic3RyaW5nKG1hcmtlciwgdGhpcy5pbmRleCkpO1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgdmFyIHVuZXNjYXBlZENvZGU6IG51bWJlcjtcbiAgICAgICAgaWYgKHRoaXMucGVlayA9PSAkdSkge1xuICAgICAgICAgIC8vIDQgY2hhcmFjdGVyIGhleCBjb2RlIGZvciB1bmljb2RlIGNoYXJhY3Rlci5cbiAgICAgICAgICB2YXIgaGV4OiBzdHJpbmcgPSBpbnB1dC5zdWJzdHJpbmcodGhpcy5pbmRleCArIDEsIHRoaXMuaW5kZXggKyA1KTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdW5lc2NhcGVkQ29kZSA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQoaGV4LCAxNik7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5lcnJvcihgSW52YWxpZCB1bmljb2RlIGVzY2FwZSBbXFxcXHUke2hleH1dYCwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGk6IG51bWJlciA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1bmVzY2FwZWRDb2RlID0gdW5lc2NhcGUodGhpcy5wZWVrKTtcbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIuYWRkKFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHVuZXNjYXBlZENvZGUpKTtcbiAgICAgICAgbWFya2VyID0gdGhpcy5pbmRleDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrID09ICRFT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIHF1b3RlJywgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGFzdDogc3RyaW5nID0gaW5wdXQuc3Vic3RyaW5nKG1hcmtlciwgdGhpcy5pbmRleCk7XG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyBTa2lwIHRlcm1pbmF0aW5nIHF1b3RlLlxuXG4gICAgLy8gQ29tcHV0ZSB0aGUgdW5lc2NhcGVkIHN0cmluZyB2YWx1ZS5cbiAgICB2YXIgdW5lc2NhcGVkOiBzdHJpbmcgPSBsYXN0O1xuICAgIGlmIChidWZmZXIgIT0gbnVsbCkge1xuICAgICAgYnVmZmVyLmFkZChsYXN0KTtcbiAgICAgIHVuZXNjYXBlZCA9IGJ1ZmZlci50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3U3RyaW5nVG9rZW4oc3RhcnQsIHVuZXNjYXBlZCk7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKSB7XG4gICAgdmFyIHBvc2l0aW9uOiBudW1iZXIgPSB0aGlzLmluZGV4ICsgb2Zmc2V0O1xuICAgIHRocm93IG5ldyBTY2FubmVyRXJyb3IoXG4gICAgICAgIGBMZXhlciBFcnJvcjogJHttZXNzYWdlfSBhdCBjb2x1bW4gJHtwb3NpdGlvbn0gaW4gZXhwcmVzc2lvbiBbJHt0aGlzLmlucHV0fV1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA+PSAkVEFCICYmIGNvZGUgPD0gJFNQQUNFKSB8fCAoY29kZSA9PSAkTkJTUCk7XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKCRhIDw9IGNvZGUgJiYgY29kZSA8PSAkeikgfHwgKCRBIDw9IGNvZGUgJiYgY29kZSA8PSAkWikgfHwgKGNvZGUgPT0gJF8pIHx8IChjb2RlID09ICQkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpZmllcihpbnB1dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChpbnB1dC5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgc2Nhbm5lciA9IG5ldyBfU2Nhbm5lcihpbnB1dCk7XG4gIGlmICghaXNJZGVudGlmaWVyU3RhcnQoc2Nhbm5lci5wZWVrKSkgcmV0dXJuIGZhbHNlO1xuICBzY2FubmVyLmFkdmFuY2UoKTtcbiAgd2hpbGUgKHNjYW5uZXIucGVlayAhPT0gJEVPRikge1xuICAgIGlmICghaXNJZGVudGlmaWVyUGFydChzY2FubmVyLnBlZWspKSByZXR1cm4gZmFsc2U7XG4gICAgc2Nhbm5lci5hZHZhbmNlKCk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoJGEgPD0gY29kZSAmJiBjb2RlIDw9ICR6KSB8fCAoJEEgPD0gY29kZSAmJiBjb2RlIDw9ICRaKSB8fCAoJDAgPD0gY29kZSAmJiBjb2RlIDw9ICQ5KSB8fFxuICAgICAgICAgKGNvZGUgPT0gJF8pIHx8IChjb2RlID09ICQkKTtcbn1cblxuZnVuY3Rpb24gaXNEaWdpdChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICQwIDw9IGNvZGUgJiYgY29kZSA8PSAkOTtcbn1cblxuZnVuY3Rpb24gaXNFeHBvbmVudFN0YXJ0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkZSB8fCBjb2RlID09ICRFO1xufVxuXG5mdW5jdGlvbiBpc0V4cG9uZW50U2lnbihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJE1JTlVTIHx8IGNvZGUgPT0gJFBMVVM7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlKGNvZGU6IG51bWJlcik6IG51bWJlciB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJG46XG4gICAgICByZXR1cm4gJExGO1xuICAgIGNhc2UgJGY6XG4gICAgICByZXR1cm4gJEZGO1xuICAgIGNhc2UgJHI6XG4gICAgICByZXR1cm4gJENSO1xuICAgIGNhc2UgJHQ6XG4gICAgICByZXR1cm4gJFRBQjtcbiAgICBjYXNlICR2OlxuICAgICAgcmV0dXJuICRWVEFCO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gY29kZTtcbiAgfVxufVxuXG52YXIgT1BFUkFUT1JTID0gU2V0V3JhcHBlci5jcmVhdGVGcm9tTGlzdChbXG4gICcrJyxcbiAgJy0nLFxuICAnKicsXG4gICcvJyxcbiAgJyUnLFxuICAnXicsXG4gICc9JyxcbiAgJz09JyxcbiAgJyE9JyxcbiAgJz09PScsXG4gICchPT0nLFxuICAnPCcsXG4gICc+JyxcbiAgJzw9JyxcbiAgJz49JyxcbiAgJyYmJyxcbiAgJ3x8JyxcbiAgJyYnLFxuICAnfCcsXG4gICchJyxcbiAgJz8nLFxuICAnIycsXG4gICc/Lidcbl0pO1xuXG5cbnZhciBLRVlXT1JEUyA9XG4gICAgU2V0V3JhcHBlci5jcmVhdGVGcm9tTGlzdChbJ3ZhcicsICdudWxsJywgJ3VuZGVmaW5lZCcsICd0cnVlJywgJ2ZhbHNlJywgJ2lmJywgJ2Vsc2UnXSk7XG4iXX0=