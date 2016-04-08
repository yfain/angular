'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require("angular2/src/facade/lang");
var exceptions_1 = require('angular2/src/facade/exceptions');
var chars_1 = require("angular2/src/compiler/chars");
var chars_2 = require("angular2/src/compiler/chars");
exports.$EOF = chars_2.$EOF;
exports.$AT = chars_2.$AT;
exports.$RBRACE = chars_2.$RBRACE;
exports.$LBRACE = chars_2.$LBRACE;
exports.$LBRACKET = chars_2.$LBRACKET;
exports.$RBRACKET = chars_2.$RBRACKET;
exports.$LPAREN = chars_2.$LPAREN;
exports.$RPAREN = chars_2.$RPAREN;
exports.$COMMA = chars_2.$COMMA;
exports.$COLON = chars_2.$COLON;
exports.$SEMICOLON = chars_2.$SEMICOLON;
exports.isWhitespace = chars_2.isWhitespace;
(function (CssTokenType) {
    CssTokenType[CssTokenType["EOF"] = 0] = "EOF";
    CssTokenType[CssTokenType["String"] = 1] = "String";
    CssTokenType[CssTokenType["Comment"] = 2] = "Comment";
    CssTokenType[CssTokenType["Identifier"] = 3] = "Identifier";
    CssTokenType[CssTokenType["Number"] = 4] = "Number";
    CssTokenType[CssTokenType["IdentifierOrNumber"] = 5] = "IdentifierOrNumber";
    CssTokenType[CssTokenType["AtKeyword"] = 6] = "AtKeyword";
    CssTokenType[CssTokenType["Character"] = 7] = "Character";
    CssTokenType[CssTokenType["Whitespace"] = 8] = "Whitespace";
    CssTokenType[CssTokenType["Invalid"] = 9] = "Invalid";
})(exports.CssTokenType || (exports.CssTokenType = {}));
var CssTokenType = exports.CssTokenType;
(function (CssLexerMode) {
    CssLexerMode[CssLexerMode["ALL"] = 0] = "ALL";
    CssLexerMode[CssLexerMode["ALL_TRACK_WS"] = 1] = "ALL_TRACK_WS";
    CssLexerMode[CssLexerMode["SELECTOR"] = 2] = "SELECTOR";
    CssLexerMode[CssLexerMode["PSEUDO_SELECTOR"] = 3] = "PSEUDO_SELECTOR";
    CssLexerMode[CssLexerMode["ATTRIBUTE_SELECTOR"] = 4] = "ATTRIBUTE_SELECTOR";
    CssLexerMode[CssLexerMode["AT_RULE_QUERY"] = 5] = "AT_RULE_QUERY";
    CssLexerMode[CssLexerMode["MEDIA_QUERY"] = 6] = "MEDIA_QUERY";
    CssLexerMode[CssLexerMode["BLOCK"] = 7] = "BLOCK";
    CssLexerMode[CssLexerMode["KEYFRAME_BLOCK"] = 8] = "KEYFRAME_BLOCK";
    CssLexerMode[CssLexerMode["STYLE_BLOCK"] = 9] = "STYLE_BLOCK";
    CssLexerMode[CssLexerMode["STYLE_VALUE"] = 10] = "STYLE_VALUE";
    CssLexerMode[CssLexerMode["STYLE_VALUE_FUNCTION"] = 11] = "STYLE_VALUE_FUNCTION";
    CssLexerMode[CssLexerMode["STYLE_CALC_FUNCTION"] = 12] = "STYLE_CALC_FUNCTION";
})(exports.CssLexerMode || (exports.CssLexerMode = {}));
var CssLexerMode = exports.CssLexerMode;
var LexedCssResult = (function () {
    function LexedCssResult(error, token) {
        this.error = error;
        this.token = token;
    }
    return LexedCssResult;
})();
exports.LexedCssResult = LexedCssResult;
function generateErrorMessage(input, message, errorValue, index, row, column) {
    return (message + " at column " + row + ":" + column + " in expression [") +
        findProblemCode(input, errorValue, index, column) + ']';
}
exports.generateErrorMessage = generateErrorMessage;
function findProblemCode(input, errorValue, index, column) {
    var endOfProblemLine = index;
    var current = charCode(input, index);
    while (current > 0 && !isNewline(current)) {
        current = charCode(input, ++endOfProblemLine);
    }
    var choppedString = input.substring(0, endOfProblemLine);
    var pointerPadding = "";
    for (var i = 0; i < column; i++) {
        pointerPadding += " ";
    }
    var pointerString = "";
    for (var i = 0; i < errorValue.length; i++) {
        pointerString += "^";
    }
    return choppedString + "\n" + pointerPadding + pointerString + "\n";
}
exports.findProblemCode = findProblemCode;
var CssToken = (function () {
    function CssToken(index, column, line, type, strValue) {
        this.index = index;
        this.column = column;
        this.line = line;
        this.type = type;
        this.strValue = strValue;
        this.numValue = charCode(strValue, 0);
    }
    return CssToken;
})();
exports.CssToken = CssToken;
var CssLexer = (function () {
    function CssLexer() {
    }
    CssLexer.prototype.scan = function (text, trackComments) {
        if (trackComments === void 0) { trackComments = false; }
        return new CssScanner(text, trackComments);
    };
    return CssLexer;
})();
exports.CssLexer = CssLexer;
var CssScannerError = (function (_super) {
    __extends(CssScannerError, _super);
    function CssScannerError(token, message) {
        _super.call(this, 'Css Parse Error: ' + message);
        this.token = token;
        this.rawMessage = message;
    }
    CssScannerError.prototype.toString = function () { return this.message; };
    return CssScannerError;
})(exceptions_1.BaseException);
exports.CssScannerError = CssScannerError;
function _trackWhitespace(mode) {
    switch (mode) {
        case CssLexerMode.SELECTOR:
        case CssLexerMode.ALL_TRACK_WS:
        case CssLexerMode.STYLE_VALUE:
            return true;
        default:
            return false;
    }
}
var CssScanner = (function () {
    function CssScanner(input, _trackComments) {
        if (_trackComments === void 0) { _trackComments = false; }
        this.input = input;
        this._trackComments = _trackComments;
        this.length = 0;
        this.index = -1;
        this.column = -1;
        this.line = 0;
        /** @internal */
        this._currentMode = CssLexerMode.BLOCK;
        /** @internal */
        this._currentError = null;
        this.length = this.input.length;
        this.peekPeek = this.peekAt(0);
        this.advance();
    }
    CssScanner.prototype.getMode = function () { return this._currentMode; };
    CssScanner.prototype.setMode = function (mode) {
        if (this._currentMode != mode) {
            if (_trackWhitespace(this._currentMode)) {
                this.consumeWhitespace();
            }
            this._currentMode = mode;
        }
    };
    CssScanner.prototype.advance = function () {
        if (isNewline(this.peek)) {
            this.column = 0;
            this.line++;
        }
        else {
            this.column++;
        }
        this.index++;
        this.peek = this.peekPeek;
        this.peekPeek = this.peekAt(this.index + 1);
    };
    CssScanner.prototype.peekAt = function (index) {
        return index >= this.length ? chars_1.$EOF : lang_1.StringWrapper.charCodeAt(this.input, index);
    };
    CssScanner.prototype.consumeEmptyStatements = function () {
        this.consumeWhitespace();
        while (this.peek == chars_1.$SEMICOLON) {
            this.advance();
            this.consumeWhitespace();
        }
    };
    CssScanner.prototype.consumeWhitespace = function () {
        while (chars_1.isWhitespace(this.peek) || isNewline(this.peek)) {
            this.advance();
            if (!this._trackComments && isCommentStart(this.peek, this.peekPeek)) {
                this.advance(); // /
                this.advance(); // *
                while (!isCommentEnd(this.peek, this.peekPeek)) {
                    if (this.peek == chars_1.$EOF) {
                        this.error('Unterminated comment');
                    }
                    this.advance();
                }
                this.advance(); // *
                this.advance(); // /
            }
        }
    };
    CssScanner.prototype.consume = function (type, value) {
        if (value === void 0) { value = null; }
        var mode = this._currentMode;
        this.setMode(CssLexerMode.ALL);
        var previousIndex = this.index;
        var previousLine = this.line;
        var previousColumn = this.column;
        var output = this.scan();
        // just incase the inner scan method returned an error
        if (lang_1.isPresent(output.error)) {
            this.setMode(mode);
            return output;
        }
        var next = output.token;
        if (!lang_1.isPresent(next)) {
            next = new CssToken(0, 0, 0, CssTokenType.EOF, "end of file");
        }
        var isMatchingType;
        if (type == CssTokenType.IdentifierOrNumber) {
            // TODO (matsko): implement array traversal for lookup here
            isMatchingType = next.type == CssTokenType.Number || next.type == CssTokenType.Identifier;
        }
        else {
            isMatchingType = next.type == type;
        }
        // before throwing the error we need to bring back the former
        // mode so that the parser can recover...
        this.setMode(mode);
        var error = null;
        if (!isMatchingType || (lang_1.isPresent(value) && value != next.strValue)) {
            var errorMessage = lang_1.resolveEnumToken(CssTokenType, next.type) + " does not match expected " +
                lang_1.resolveEnumToken(CssTokenType, type) + " value";
            if (lang_1.isPresent(value)) {
                errorMessage += ' ("' + next.strValue + '" should match "' + value + '")';
            }
            error = new CssScannerError(next, generateErrorMessage(this.input, errorMessage, next.strValue, previousIndex, previousLine, previousColumn));
        }
        return new LexedCssResult(error, next);
    };
    CssScanner.prototype.scan = function () {
        var trackWS = _trackWhitespace(this._currentMode);
        if (this.index == 0 && !trackWS) {
            this.consumeWhitespace();
        }
        var token = this._scan();
        if (token == null)
            return null;
        var error = this._currentError;
        this._currentError = null;
        if (!trackWS) {
            this.consumeWhitespace();
        }
        return new LexedCssResult(error, token);
    };
    /** @internal */
    CssScanner.prototype._scan = function () {
        var peek = this.peek;
        var peekPeek = this.peekPeek;
        if (peek == chars_1.$EOF)
            return null;
        if (isCommentStart(peek, peekPeek)) {
            // even if comments are not tracked we still lex the
            // comment so we can move the pointer forward
            var commentToken = this.scanComment();
            if (this._trackComments) {
                return commentToken;
            }
        }
        if (_trackWhitespace(this._currentMode) && (chars_1.isWhitespace(peek) || isNewline(peek))) {
            return this.scanWhitespace();
        }
        peek = this.peek;
        peekPeek = this.peekPeek;
        if (peek == chars_1.$EOF)
            return null;
        if (isStringStart(peek, peekPeek)) {
            return this.scanString();
        }
        // something like url(cool)
        if (this._currentMode == CssLexerMode.STYLE_VALUE_FUNCTION) {
            return this.scanCssValueFunction();
        }
        var isModifier = peek == chars_1.$PLUS || peek == chars_1.$MINUS;
        var digitA = isModifier ? false : isDigit(peek);
        var digitB = isDigit(peekPeek);
        if (digitA || (isModifier && (peekPeek == chars_1.$PERIOD || digitB)) || (peek == chars_1.$PERIOD && digitB)) {
            return this.scanNumber();
        }
        if (peek == chars_1.$AT) {
            return this.scanAtExpression();
        }
        if (isIdentifierStart(peek, peekPeek)) {
            return this.scanIdentifier();
        }
        if (isValidCssCharacter(peek, this._currentMode)) {
            return this.scanCharacter();
        }
        return this.error("Unexpected character [" + lang_1.StringWrapper.fromCharCode(peek) + "]");
    };
    CssScanner.prototype.scanComment = function () {
        if (this.assertCondition(isCommentStart(this.peek, this.peekPeek), "Expected comment start value")) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        this.advance(); // /
        this.advance(); // *
        while (!isCommentEnd(this.peek, this.peekPeek)) {
            if (this.peek == chars_1.$EOF) {
                this.error('Unterminated comment');
            }
            this.advance();
        }
        this.advance(); // *
        this.advance(); // /
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Comment, str);
    };
    CssScanner.prototype.scanWhitespace = function () {
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        while (chars_1.isWhitespace(this.peek) && this.peek != chars_1.$EOF) {
            this.advance();
        }
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Whitespace, str);
    };
    CssScanner.prototype.scanString = function () {
        if (this.assertCondition(isStringStart(this.peek, this.peekPeek), "Unexpected non-string starting value")) {
            return null;
        }
        var target = this.peek;
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        var previous = target;
        this.advance();
        while (!isCharMatch(target, previous, this.peek)) {
            if (this.peek == chars_1.$EOF || isNewline(this.peek)) {
                this.error('Unterminated quote');
            }
            previous = this.peek;
            this.advance();
        }
        if (this.assertCondition(this.peek == target, "Unterminated quote")) {
            return null;
        }
        this.advance();
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.String, str);
    };
    CssScanner.prototype.scanNumber = function () {
        var start = this.index;
        var startingColumn = this.column;
        if (this.peek == chars_1.$PLUS || this.peek == chars_1.$MINUS) {
            this.advance();
        }
        var periodUsed = false;
        while (isDigit(this.peek) || this.peek == chars_1.$PERIOD) {
            if (this.peek == chars_1.$PERIOD) {
                if (periodUsed) {
                    this.error('Unexpected use of a second period value');
                }
                periodUsed = true;
            }
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Number, strValue);
    };
    CssScanner.prototype.scanIdentifier = function () {
        if (this.assertCondition(isIdentifierStart(this.peek, this.peekPeek), 'Expected identifier starting value')) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        while (isIdentifierPart(this.peek)) {
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
    };
    CssScanner.prototype.scanCssValueFunction = function () {
        var start = this.index;
        var startingColumn = this.column;
        while (this.peek != chars_1.$EOF && this.peek != chars_1.$RPAREN) {
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
    };
    CssScanner.prototype.scanCharacter = function () {
        var start = this.index;
        var startingColumn = this.column;
        if (this.assertCondition(isValidCssCharacter(this.peek, this._currentMode), charStr(this.peek) + ' is not a valid CSS character')) {
            return null;
        }
        var c = this.input.substring(start, start + 1);
        this.advance();
        return new CssToken(start, startingColumn, this.line, CssTokenType.Character, c);
    };
    CssScanner.prototype.scanAtExpression = function () {
        if (this.assertCondition(this.peek == chars_1.$AT, 'Expected @ value')) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        this.advance();
        if (isIdentifierStart(this.peek, this.peekPeek)) {
            var ident = this.scanIdentifier();
            var strValue = '@' + ident.strValue;
            return new CssToken(start, startingColumn, this.line, CssTokenType.AtKeyword, strValue);
        }
        else {
            return this.scanCharacter();
        }
    };
    CssScanner.prototype.assertCondition = function (status, errorMessage) {
        if (!status) {
            this.error(errorMessage);
            return true;
        }
        return false;
    };
    CssScanner.prototype.error = function (message, errorTokenValue, doNotAdvance) {
        if (errorTokenValue === void 0) { errorTokenValue = null; }
        if (doNotAdvance === void 0) { doNotAdvance = false; }
        var index = this.index;
        var column = this.column;
        var line = this.line;
        errorTokenValue =
            lang_1.isPresent(errorTokenValue) ? errorTokenValue : lang_1.StringWrapper.fromCharCode(this.peek);
        var invalidToken = new CssToken(index, column, line, CssTokenType.Invalid, errorTokenValue);
        var errorMessage = generateErrorMessage(this.input, message, errorTokenValue, index, line, column);
        if (!doNotAdvance) {
            this.advance();
        }
        this._currentError = new CssScannerError(invalidToken, errorMessage);
        return invalidToken;
    };
    return CssScanner;
})();
exports.CssScanner = CssScanner;
function isAtKeyword(current, next) {
    return current.numValue == chars_1.$AT && next.type == CssTokenType.Identifier;
}
function isCharMatch(target, previous, code) {
    return code == target && previous != chars_1.$BACKSLASH;
}
function isDigit(code) {
    return chars_1.$0 <= code && code <= chars_1.$9;
}
function isCommentStart(code, next) {
    return code == chars_1.$SLASH && next == chars_1.$STAR;
}
function isCommentEnd(code, next) {
    return code == chars_1.$STAR && next == chars_1.$SLASH;
}
function isStringStart(code, next) {
    var target = code;
    if (target == chars_1.$BACKSLASH) {
        target = next;
    }
    return target == chars_1.$DQ || target == chars_1.$SQ;
}
function isIdentifierStart(code, next) {
    var target = code;
    if (target == chars_1.$MINUS) {
        target = next;
    }
    return (chars_1.$a <= target && target <= chars_1.$z) || (chars_1.$A <= target && target <= chars_1.$Z) || target == chars_1.$BACKSLASH ||
        target == chars_1.$MINUS || target == chars_1.$_;
}
function isIdentifierPart(target) {
    return (chars_1.$a <= target && target <= chars_1.$z) || (chars_1.$A <= target && target <= chars_1.$Z) || target == chars_1.$BACKSLASH ||
        target == chars_1.$MINUS || target == chars_1.$_ || isDigit(target);
}
function isValidPseudoSelectorCharacter(code) {
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
            return true;
        default:
            return false;
    }
}
function isValidKeyframeBlockCharacter(code) {
    return code == chars_1.$PERCENT;
}
function isValidAttributeSelectorCharacter(code) {
    // value^*|$~=something
    switch (code) {
        case chars_1.$$:
        case chars_1.$PIPE:
        case chars_1.$CARET:
        case chars_1.$TILDA:
        case chars_1.$STAR:
        case chars_1.$EQ:
            return true;
        default:
            return false;
    }
}
function isValidSelectorCharacter(code) {
    // selector [ key   = value ]
    // IDENT    C IDENT C IDENT C
    // #id, .class, *+~>
    // tag:PSEUDO
    switch (code) {
        case chars_1.$HASH:
        case chars_1.$PERIOD:
        case chars_1.$TILDA:
        case chars_1.$STAR:
        case chars_1.$PLUS:
        case chars_1.$GT:
        case chars_1.$COLON:
        case chars_1.$PIPE:
        case chars_1.$COMMA:
            return true;
        default:
            return false;
    }
}
function isValidStyleBlockCharacter(code) {
    // key:value;
    // key:calc(something ... )
    switch (code) {
        case chars_1.$HASH:
        case chars_1.$SEMICOLON:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$SLASH:
        case chars_1.$BACKSLASH:
        case chars_1.$BANG:
        case chars_1.$PERIOD:
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
            return true;
        default:
            return false;
    }
}
function isValidMediaQueryRuleCharacter(code) {
    // (min-width: 7.5em) and (orientation: landscape)
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$PERIOD:
            return true;
        default:
            return false;
    }
}
function isValidAtRuleCharacter(code) {
    // @document url(http://www.w3.org/page?something=on#hash),
    switch (code) {
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COLON:
        case chars_1.$PERCENT:
        case chars_1.$PERIOD:
        case chars_1.$SLASH:
        case chars_1.$BACKSLASH:
        case chars_1.$HASH:
        case chars_1.$EQ:
        case chars_1.$QUESTION:
        case chars_1.$AMPERSAND:
        case chars_1.$STAR:
        case chars_1.$COMMA:
        case chars_1.$MINUS:
        case chars_1.$PLUS:
            return true;
        default:
            return false;
    }
}
function isValidStyleFunctionCharacter(code) {
    switch (code) {
        case chars_1.$PERIOD:
        case chars_1.$MINUS:
        case chars_1.$PLUS:
        case chars_1.$STAR:
        case chars_1.$SLASH:
        case chars_1.$LPAREN:
        case chars_1.$RPAREN:
        case chars_1.$COMMA:
            return true;
        default:
            return false;
    }
}
function isValidBlockCharacter(code) {
    // @something { }
    // IDENT
    return code == chars_1.$AT;
}
function isValidCssCharacter(code, mode) {
    switch (mode) {
        case CssLexerMode.ALL:
        case CssLexerMode.ALL_TRACK_WS:
            return true;
        case CssLexerMode.SELECTOR:
            return isValidSelectorCharacter(code);
        case CssLexerMode.PSEUDO_SELECTOR:
            return isValidPseudoSelectorCharacter(code);
        case CssLexerMode.ATTRIBUTE_SELECTOR:
            return isValidAttributeSelectorCharacter(code);
        case CssLexerMode.MEDIA_QUERY:
            return isValidMediaQueryRuleCharacter(code);
        case CssLexerMode.AT_RULE_QUERY:
            return isValidAtRuleCharacter(code);
        case CssLexerMode.KEYFRAME_BLOCK:
            return isValidKeyframeBlockCharacter(code);
        case CssLexerMode.STYLE_BLOCK:
        case CssLexerMode.STYLE_VALUE:
            return isValidStyleBlockCharacter(code);
        case CssLexerMode.STYLE_CALC_FUNCTION:
            return isValidStyleFunctionCharacter(code);
        case CssLexerMode.BLOCK:
            return isValidBlockCharacter(code);
        default:
            return false;
    }
}
function charCode(input, index) {
    return index >= input.length ? chars_1.$EOF : lang_1.StringWrapper.charCodeAt(input, index);
}
function charStr(code) {
    return lang_1.StringWrapper.fromCharCode(code);
}
function isNewline(code) {
    switch (code) {
        case chars_1.$FF:
        case chars_1.$CR:
        case chars_1.$LF:
        case chars_1.$VTAB:
            return true;
        default:
            return false;
    }
}
exports.isNewline = isNewline;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLUJjNG13NnZYLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbIkNzc1Rva2VuVHlwZSIsIkNzc0xleGVyTW9kZSIsIkxleGVkQ3NzUmVzdWx0IiwiTGV4ZWRDc3NSZXN1bHQuY29uc3RydWN0b3IiLCJnZW5lcmF0ZUVycm9yTWVzc2FnZSIsImZpbmRQcm9ibGVtQ29kZSIsIkNzc1Rva2VuIiwiQ3NzVG9rZW4uY29uc3RydWN0b3IiLCJDc3NMZXhlciIsIkNzc0xleGVyLmNvbnN0cnVjdG9yIiwiQ3NzTGV4ZXIuc2NhbiIsIkNzc1NjYW5uZXJFcnJvciIsIkNzc1NjYW5uZXJFcnJvci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXJFcnJvci50b1N0cmluZyIsIl90cmFja1doaXRlc3BhY2UiLCJDc3NTY2FubmVyIiwiQ3NzU2Nhbm5lci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXIuZ2V0TW9kZSIsIkNzc1NjYW5uZXIuc2V0TW9kZSIsIkNzc1NjYW5uZXIuYWR2YW5jZSIsIkNzc1NjYW5uZXIucGVla0F0IiwiQ3NzU2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzIiwiQ3NzU2Nhbm5lci5jb25zdW1lV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuY29uc3VtZSIsIkNzc1NjYW5uZXIuc2NhbiIsIkNzc1NjYW5uZXIuX3NjYW4iLCJDc3NTY2FubmVyLnNjYW5Db21tZW50IiwiQ3NzU2Nhbm5lci5zY2FuV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuc2NhblN0cmluZyIsIkNzc1NjYW5uZXIuc2Nhbk51bWJlciIsIkNzc1NjYW5uZXIuc2NhbklkZW50aWZpZXIiLCJDc3NTY2FubmVyLnNjYW5Dc3NWYWx1ZUZ1bmN0aW9uIiwiQ3NzU2Nhbm5lci5zY2FuQ2hhcmFjdGVyIiwiQ3NzU2Nhbm5lci5zY2FuQXRFeHByZXNzaW9uIiwiQ3NzU2Nhbm5lci5hc3NlcnRDb25kaXRpb24iLCJDc3NTY2FubmVyLmVycm9yIiwiaXNBdEtleXdvcmQiLCJpc0NoYXJNYXRjaCIsImlzRGlnaXQiLCJpc0NvbW1lbnRTdGFydCIsImlzQ29tbWVudEVuZCIsImlzU3RyaW5nU3RhcnQiLCJpc0lkZW50aWZpZXJTdGFydCIsImlzSWRlbnRpZmllclBhcnQiLCJpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyIiwiaXNWYWxpZEF0UnVsZUNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyIiwiaXNWYWxpZEJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZENzc0NoYXJhY3RlciIsImNoYXJDb2RlIiwiY2hhclN0ciIsImlzTmV3bGluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBd0UsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRywyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU3RCxzQkEyQ08sNkJBQTZCLENBQUMsQ0FBQTtBQUVyQyxzQkFhTyw2QkFBNkIsQ0FBQztBQVpuQyw0QkFBSTtBQUNKLDBCQUFHO0FBQ0gsa0NBQU87QUFDUCxrQ0FBTztBQUNQLHNDQUFTO0FBQ1Qsc0NBQVM7QUFDVCxrQ0FBTztBQUNQLGtDQUFPO0FBQ1AsZ0NBQU07QUFDTixnQ0FBTTtBQUNOLHdDQUFVO0FBQ1YsNENBQ21DO0FBRXJDLFdBQVksWUFBWTtJQUN0QkEsNkNBQUdBLENBQUFBO0lBQ0hBLG1EQUFNQSxDQUFBQTtJQUNOQSxxREFBT0EsQ0FBQUE7SUFDUEEsMkRBQVVBLENBQUFBO0lBQ1ZBLG1EQUFNQSxDQUFBQTtJQUNOQSwyRUFB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QTtBQUVELG1CQUEwQixJQUFJO0lBQzVCQyxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNiQSxLQUFLQSxXQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxXQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxXQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxhQUFLQTtZQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUVkQTtZQUNFQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtJQUNqQkEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFYZSxpQkFBUyxZQVd4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOdW1iZXJXcmFwcGVyLCBTdHJpbmdXcmFwcGVyLCBpc1ByZXNlbnQsIHJlc29sdmVFbnVtVG9rZW59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtcbiAgaXNXaGl0ZXNwYWNlLFxuICAkRU9GLFxuICAkSEFTSCxcbiAgJFRJTERBLFxuICAkQ0FSRVQsXG4gICRQRVJDRU5ULFxuICAkJCxcbiAgJF8sXG4gICRDT0xPTixcbiAgJFNRLFxuICAkRFEsXG4gICRFUSxcbiAgJFNMQVNILFxuICAkQkFDS1NMQVNILFxuICAkUEVSSU9ELFxuICAkU1RBUixcbiAgJFBMVVMsXG4gICRMUEFSRU4sXG4gICRSUEFSRU4sXG4gICRMQlJBQ0UsXG4gICRSQlJBQ0UsXG4gICRMQlJBQ0tFVCxcbiAgJFJCUkFDS0VULFxuICAkUElQRSxcbiAgJENPTU1BLFxuICAkU0VNSUNPTE9OLFxuICAkTUlOVVMsXG4gICRCQU5HLFxuICAkUVVFU1RJT04sXG4gICRBVCxcbiAgJEFNUEVSU0FORCxcbiAgJEdULFxuICAkYSxcbiAgJEEsXG4gICR6LFxuICAkWixcbiAgJDAsXG4gICQ5LFxuICAkRkYsXG4gICRDUixcbiAgJExGLFxuICAkVlRBQlxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYXJzXCI7XG5cbmV4cG9ydCB7XG4gICRFT0YsXG4gICRBVCxcbiAgJFJCUkFDRSxcbiAgJExCUkFDRSxcbiAgJExCUkFDS0VULFxuICAkUkJSQUNLRVQsXG4gICRMUEFSRU4sXG4gICRSUEFSRU4sXG4gICRDT01NQSxcbiAgJENPTE9OLFxuICAkU0VNSUNPTE9OLFxuICBpc1doaXRlc3BhY2Vcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9jaGFyc1wiO1xuXG5leHBvcnQgZW51bSBDc3NUb2tlblR5cGUge1xuICBFT0YsXG4gIFN0cmluZyxcbiAgQ29tbWVudCxcbiAgSWRlbnRpZmllcixcbiAgTnVtYmVyLFxuICBJZGVudGlmaWVyT3JOdW1iZXIsXG4gIEF0S2V5d29yZCxcbiAgQ2hhcmFjdGVyLFxuICBXaGl0ZXNwYWNlLFxuICBJbnZhbGlkXG59XG5cbmV4cG9ydCBlbnVtIENzc0xleGVyTW9kZSB7XG4gIEFMTCxcbiAgQUxMX1RSQUNLX1dTLFxuICBTRUxFQ1RPUixcbiAgUFNFVURPX1NFTEVDVE9SLFxuICBBVFRSSUJVVEVfU0VMRUNUT1IsXG4gIEFUX1JVTEVfUVVFUlksXG4gIE1FRElBX1FVRVJZLFxuICBCTE9DSyxcbiAgS0VZRlJBTUVfQkxPQ0ssXG4gIFNUWUxFX0JMT0NLLFxuICBTVFlMRV9WQUxVRSxcbiAgU1RZTEVfVkFMVUVfRlVOQ1RJT04sXG4gIFNUWUxFX0NBTENfRlVOQ1RJT05cbn1cblxuZXhwb3J0IGNsYXNzIExleGVkQ3NzUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yOiBDc3NTY2FubmVyRXJyb3IsIHB1YmxpYyB0b2tlbjogQ3NzVG9rZW4pIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUVycm9yTWVzc2FnZShpbnB1dDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcsIGVycm9yVmFsdWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogbnVtYmVyLCByb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7bWVzc2FnZX0gYXQgY29sdW1uICR7cm93fToke2NvbHVtbn0gaW4gZXhwcmVzc2lvbiBbYCArXG4gICAgICAgICBmaW5kUHJvYmxlbUNvZGUoaW5wdXQsIGVycm9yVmFsdWUsIGluZGV4LCBjb2x1bW4pICsgJ10nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFByb2JsZW1Db2RlKGlucHV0OiBzdHJpbmcsIGVycm9yVmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBudW1iZXIpOiBzdHJpbmcge1xuICB2YXIgZW5kT2ZQcm9ibGVtTGluZSA9IGluZGV4O1xuICB2YXIgY3VycmVudCA9IGNoYXJDb2RlKGlucHV0LCBpbmRleCk7XG4gIHdoaWxlIChjdXJyZW50ID4gMCAmJiAhaXNOZXdsaW5lKGN1cnJlbnQpKSB7XG4gICAgY3VycmVudCA9IGNoYXJDb2RlKGlucHV0LCArK2VuZE9mUHJvYmxlbUxpbmUpO1xuICB9XG4gIHZhciBjaG9wcGVkU3RyaW5nID0gaW5wdXQuc3Vic3RyaW5nKDAsIGVuZE9mUHJvYmxlbUxpbmUpO1xuICB2YXIgcG9pbnRlclBhZGRpbmcgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbjsgaSsrKSB7XG4gICAgcG9pbnRlclBhZGRpbmcgKz0gXCIgXCI7XG4gIH1cbiAgdmFyIHBvaW50ZXJTdHJpbmcgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yVmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBwb2ludGVyU3RyaW5nICs9IFwiXlwiO1xuICB9XG4gIHJldHVybiBjaG9wcGVkU3RyaW5nICsgXCJcXG5cIiArIHBvaW50ZXJQYWRkaW5nICsgcG9pbnRlclN0cmluZyArIFwiXFxuXCI7XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NUb2tlbiB7XG4gIG51bVZhbHVlOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY29sdW1uOiBudW1iZXIsIHB1YmxpYyBsaW5lOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyB0eXBlOiBDc3NUb2tlblR5cGUsIHB1YmxpYyBzdHJWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5udW1WYWx1ZSA9IGNoYXJDb2RlKHN0clZhbHVlLCAwKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzTGV4ZXIge1xuICBzY2FuKHRleHQ6IHN0cmluZywgdHJhY2tDb21tZW50czogYm9vbGVhbiA9IGZhbHNlKTogQ3NzU2Nhbm5lciB7XG4gICAgcmV0dXJuIG5ldyBDc3NTY2FubmVyKHRleHQsIHRyYWNrQ29tbWVudHMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTY2FubmVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgcHVibGljIHJhd01lc3NhZ2U6IHN0cmluZztcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW46IENzc1Rva2VuLCBtZXNzYWdlKSB7XG4gICAgc3VwZXIoJ0NzcyBQYXJzZSBFcnJvcjogJyArIG1lc3NhZ2UpO1xuICAgIHRoaXMucmF3TWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbmZ1bmN0aW9uIF90cmFja1doaXRlc3BhY2UobW9kZTogQ3NzTGV4ZXJNb2RlKSB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTF9UUkFDS19XUzpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRTpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2Nhbm5lciB7XG4gIHBlZWs6IG51bWJlcjtcbiAgcGVla1BlZWs6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXIgPSAwO1xuICBpbmRleDogbnVtYmVyID0gLTE7XG4gIGNvbHVtbjogbnVtYmVyID0gLTE7XG4gIGxpbmU6IG51bWJlciA9IDA7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3VycmVudE1vZGU6IENzc0xleGVyTW9kZSA9IENzc0xleGVyTW9kZS5CTE9DSztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3VycmVudEVycm9yOiBDc3NTY2FubmVyRXJyb3IgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbnB1dDogc3RyaW5nLCBwcml2YXRlIF90cmFja0NvbW1lbnRzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuaW5wdXQubGVuZ3RoO1xuICAgIHRoaXMucGVla1BlZWsgPSB0aGlzLnBlZWtBdCgwKTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgfVxuXG4gIGdldE1vZGUoKTogQ3NzTGV4ZXJNb2RlIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRNb2RlOyB9XG5cbiAgc2V0TW9kZShtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudE1vZGUgIT0gbW9kZSkge1xuICAgICAgaWYgKF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpKSB7XG4gICAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2N1cnJlbnRNb2RlID0gbW9kZTtcbiAgICB9XG4gIH1cblxuICBhZHZhbmNlKCk6IHZvaWQge1xuICAgIGlmIChpc05ld2xpbmUodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5jb2x1bW4gPSAwO1xuICAgICAgdGhpcy5saW5lKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sdW1uKys7XG4gICAgfVxuXG4gICAgdGhpcy5pbmRleCsrO1xuICAgIHRoaXMucGVlayA9IHRoaXMucGVla1BlZWs7XG4gICAgdGhpcy5wZWVrUGVlayA9IHRoaXMucGVla0F0KHRoaXMuaW5kZXggKyAxKTtcbiAgfVxuXG4gIHBlZWtBdChpbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gaW5kZXggPj0gdGhpcy5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KHRoaXMuaW5wdXQsIGluZGV4KTtcbiAgfVxuXG4gIGNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIHdoaWxlICh0aGlzLnBlZWsgPT0gJFNFTUlDT0xPTikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZVdoaXRlc3BhY2UoKTogdm9pZCB7XG4gICAgd2hpbGUgKGlzV2hpdGVzcGFjZSh0aGlzLnBlZWspIHx8IGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghdGhpcy5fdHJhY2tDb21tZW50cyAmJiBpc0NvbW1lbnRTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICAgICAgd2hpbGUgKCFpc0NvbW1lbnRFbmQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgICAgIGlmICh0aGlzLnBlZWsgPT0gJEVPRikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIGNvbW1lbnQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWUodHlwZTogQ3NzVG9rZW5UeXBlLCB2YWx1ZTogc3RyaW5nID0gbnVsbCk6IExleGVkQ3NzUmVzdWx0IHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuX2N1cnJlbnRNb2RlO1xuICAgIHRoaXMuc2V0TW9kZShDc3NMZXhlck1vZGUuQUxMKTtcblxuICAgIHZhciBwcmV2aW91c0luZGV4ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgcHJldmlvdXNMaW5lID0gdGhpcy5saW5lO1xuICAgIHZhciBwcmV2aW91c0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuXG4gICAgdmFyIG91dHB1dCA9IHRoaXMuc2NhbigpO1xuXG4gICAgLy8ganVzdCBpbmNhc2UgdGhlIGlubmVyIHNjYW4gbWV0aG9kIHJldHVybmVkIGFuIGVycm9yXG4gICAgaWYgKGlzUHJlc2VudChvdXRwdXQuZXJyb3IpKSB7XG4gICAgICB0aGlzLnNldE1vZGUobW9kZSk7XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIHZhciBuZXh0ID0gb3V0cHV0LnRva2VuO1xuICAgIGlmICghaXNQcmVzZW50KG5leHQpKSB7XG4gICAgICBuZXh0ID0gbmV3IENzc1Rva2VuKDAsIDAsIDAsIENzc1Rva2VuVHlwZS5FT0YsIFwiZW5kIG9mIGZpbGVcIik7XG4gICAgfVxuXG4gICAgdmFyIGlzTWF0Y2hpbmdUeXBlO1xuICAgIGlmICh0eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyT3JOdW1iZXIpIHtcbiAgICAgIC8vIFRPRE8gKG1hdHNrbyk6IGltcGxlbWVudCBhcnJheSB0cmF2ZXJzYWwgZm9yIGxvb2t1cCBoZXJlXG4gICAgICBpc01hdGNoaW5nVHlwZSA9IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuTnVtYmVyIHx8IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllcjtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNNYXRjaGluZ1R5cGUgPSBuZXh0LnR5cGUgPT0gdHlwZTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmUgdGhyb3dpbmcgdGhlIGVycm9yIHdlIG5lZWQgdG8gYnJpbmcgYmFjayB0aGUgZm9ybWVyXG4gICAgLy8gbW9kZSBzbyB0aGF0IHRoZSBwYXJzZXIgY2FuIHJlY292ZXIuLi5cbiAgICB0aGlzLnNldE1vZGUobW9kZSk7XG5cbiAgICB2YXIgZXJyb3IgPSBudWxsO1xuICAgIGlmICghaXNNYXRjaGluZ1R5cGUgfHwgKGlzUHJlc2VudCh2YWx1ZSkgJiYgdmFsdWUgIT0gbmV4dC5zdHJWYWx1ZSkpIHtcbiAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSByZXNvbHZlRW51bVRva2VuKENzc1Rva2VuVHlwZSwgbmV4dC50eXBlKSArIFwiIGRvZXMgbm90IG1hdGNoIGV4cGVjdGVkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlRW51bVRva2VuKENzc1Rva2VuVHlwZSwgdHlwZSkgKyBcIiB2YWx1ZVwiO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KHZhbHVlKSkge1xuICAgICAgICBlcnJvck1lc3NhZ2UgKz0gJyAoXCInICsgbmV4dC5zdHJWYWx1ZSArICdcIiBzaG91bGQgbWF0Y2ggXCInICsgdmFsdWUgKyAnXCIpJztcbiAgICAgIH1cblxuICAgICAgZXJyb3IgPSBuZXcgQ3NzU2Nhbm5lckVycm9yKFxuICAgICAgICAgIG5leHQsIGdlbmVyYXRlRXJyb3JNZXNzYWdlKHRoaXMuaW5wdXQsIGVycm9yTWVzc2FnZSwgbmV4dC5zdHJWYWx1ZSwgcHJldmlvdXNJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0xpbmUsIHByZXZpb3VzQ29sdW1uKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMZXhlZENzc1Jlc3VsdChlcnJvciwgbmV4dCk7XG4gIH1cblxuXG4gIHNjYW4oKTogTGV4ZWRDc3NSZXN1bHQge1xuICAgIHZhciB0cmFja1dTID0gX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSk7XG4gICAgaWYgKHRoaXMuaW5kZXggPT0gMCAmJiAhdHJhY2tXUykgeyAgLy8gZmlyc3Qgc2NhblxuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcbiAgICBpZiAodG9rZW4gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZXJyb3IgPSB0aGlzLl9jdXJyZW50RXJyb3I7XG4gICAgdGhpcy5fY3VycmVudEVycm9yID0gbnVsbDtcblxuICAgIGlmICghdHJhY2tXUykge1xuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExleGVkQ3NzUmVzdWx0KGVycm9yLCB0b2tlbik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zY2FuKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgcGVlayA9IHRoaXMucGVlaztcbiAgICB2YXIgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzQ29tbWVudFN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgLy8gZXZlbiBpZiBjb21tZW50cyBhcmUgbm90IHRyYWNrZWQgd2Ugc3RpbGwgbGV4IHRoZVxuICAgICAgLy8gY29tbWVudCBzbyB3ZSBjYW4gbW92ZSB0aGUgcG9pbnRlciBmb3J3YXJkXG4gICAgICB2YXIgY29tbWVudFRva2VuID0gdGhpcy5zY2FuQ29tbWVudCgpO1xuICAgICAgaWYgKHRoaXMuX3RyYWNrQ29tbWVudHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnRUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkgJiYgKGlzV2hpdGVzcGFjZShwZWVrKSB8fCBpc05ld2xpbmUocGVlaykpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuV2hpdGVzcGFjZSgpO1xuICAgIH1cblxuICAgIHBlZWsgPSB0aGlzLnBlZWs7XG4gICAgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzU3RyaW5nU3RhcnQocGVlaywgcGVla1BlZWspKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gc29tZXRoaW5nIGxpa2UgdXJsKGNvb2wpXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNb2RlID09IENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRV9GVU5DVElPTikge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNzc1ZhbHVlRnVuY3Rpb24oKTtcbiAgICB9XG5cbiAgICB2YXIgaXNNb2RpZmllciA9IHBlZWsgPT0gJFBMVVMgfHwgcGVlayA9PSAkTUlOVVM7XG4gICAgdmFyIGRpZ2l0QSA9IGlzTW9kaWZpZXIgPyBmYWxzZSA6IGlzRGlnaXQocGVlayk7XG4gICAgdmFyIGRpZ2l0QiA9IGlzRGlnaXQocGVla1BlZWspO1xuICAgIGlmIChkaWdpdEEgfHwgKGlzTW9kaWZpZXIgJiYgKHBlZWtQZWVrID09ICRQRVJJT0QgfHwgZGlnaXRCKSkgfHwgKHBlZWsgPT0gJFBFUklPRCAmJiBkaWdpdEIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuTnVtYmVyKCk7XG4gICAgfVxuXG4gICAgaWYgKHBlZWsgPT0gJEFUKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQXRFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNWYWxpZENzc0NoYXJhY3RlcihwZWVrLCB0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5DaGFyYWN0ZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgWyR7U3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUocGVlayl9XWApO1xuICB9XG5cbiAgc2NhbkNvbW1lbnQoKTogQ3NzVG9rZW4ge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc0NvbW1lbnRTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkV4cGVjdGVkIGNvbW1lbnQgc3RhcnQgdmFsdWVcIikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcblxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuXG4gICAgd2hpbGUgKCFpc0NvbW1lbnRFbmQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBjb21tZW50Jyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cblxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLkNvbW1lbnQsIHN0cik7XG4gIH1cblxuICBzY2FuV2hpdGVzcGFjZSgpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuICAgIHdoaWxlIChpc1doaXRlc3BhY2UodGhpcy5wZWVrKSAmJiB0aGlzLnBlZWsgIT0gJEVPRikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLldoaXRlc3BhY2UsIHN0cik7XG4gIH1cblxuICBzY2FuU3RyaW5nKCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oaXNTdHJpbmdTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlVuZXhwZWN0ZWQgbm9uLXN0cmluZyBzdGFydGluZyB2YWx1ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldCA9IHRoaXMucGVlaztcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgdmFyIHByZXZpb3VzID0gdGFyZ2V0O1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgd2hpbGUgKCFpc0NoYXJNYXRjaCh0YXJnZXQsIHByZXZpb3VzLCB0aGlzLnBlZWspKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YgfHwgaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIHF1b3RlJyk7XG4gICAgICB9XG4gICAgICBwcmV2aW91cyA9IHRoaXMucGVlaztcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbih0aGlzLnBlZWsgPT0gdGFyZ2V0LCBcIlVudGVybWluYXRlZCBxdW90ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuU3RyaW5nLCBzdHIpO1xuICB9XG5cbiAgc2Nhbk51bWJlcigpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICBpZiAodGhpcy5wZWVrID09ICRQTFVTIHx8IHRoaXMucGVlayA9PSAkTUlOVVMpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgcGVyaW9kVXNlZCA9IGZhbHNlO1xuICAgIHdoaWxlIChpc0RpZ2l0KHRoaXMucGVlaykgfHwgdGhpcy5wZWVrID09ICRQRVJJT0QpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsgPT0gJFBFUklPRCkge1xuICAgICAgICBpZiAocGVyaW9kVXNlZCkge1xuICAgICAgICAgIHRoaXMuZXJyb3IoJ1VuZXhwZWN0ZWQgdXNlIG9mIGEgc2Vjb25kIHBlcmlvZCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHBlcmlvZFVzZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuTnVtYmVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuSWRlbnRpZmllcigpOiBDc3NUb2tlbiB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICdFeHBlY3RlZCBpZGVudGlmaWVyIHN0YXJ0aW5nIHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgd2hpbGUgKGlzSWRlbnRpZmllclBhcnQodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllciwgc3RyVmFsdWUpO1xuICB9XG5cbiAgc2NhbkNzc1ZhbHVlRnVuY3Rpb24oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPSAkRU9GICYmIHRoaXMucGVlayAhPSAkUlBBUkVOKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuQ2hhcmFjdGVyKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc1ZhbGlkQ3NzQ2hhcmFjdGVyKHRoaXMucGVlaywgdGhpcy5fY3VycmVudE1vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFyU3RyKHRoaXMucGVlaykgKyAnIGlzIG5vdCBhIHZhbGlkIENTUyBjaGFyYWN0ZXInKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGMgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAxKTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsIGMpO1xuICB9XG5cbiAgc2NhbkF0RXhwcmVzc2lvbigpOiBDc3NUb2tlbiB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKHRoaXMucGVlayA9PSAkQVQsICdFeHBlY3RlZCBAIHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgIHZhciBpZGVudCA9IHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICAgIHZhciBzdHJWYWx1ZSA9ICdAJyArIGlkZW50LnN0clZhbHVlO1xuICAgICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLkF0S2V5d29yZCwgc3RyVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQ2hhcmFjdGVyKCk7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0Q29uZGl0aW9uKHN0YXR1czogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgdGhpcy5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXJyb3JUb2tlblZhbHVlOiBzdHJpbmcgPSBudWxsLCBkb05vdEFkdmFuY2U6IGJvb2xlYW4gPSBmYWxzZSk6IENzc1Rva2VuIHtcbiAgICB2YXIgaW5kZXg6IG51bWJlciA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIGNvbHVtbjogbnVtYmVyID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIGxpbmU6IG51bWJlciA9IHRoaXMubGluZTtcbiAgICBlcnJvclRva2VuVmFsdWUgPVxuICAgICAgICBpc1ByZXNlbnQoZXJyb3JUb2tlblZhbHVlKSA/IGVycm9yVG9rZW5WYWx1ZSA6IFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHRoaXMucGVlayk7XG4gICAgdmFyIGludmFsaWRUb2tlbiA9IG5ldyBDc3NUb2tlbihpbmRleCwgY29sdW1uLCBsaW5lLCBDc3NUb2tlblR5cGUuSW52YWxpZCwgZXJyb3JUb2tlblZhbHVlKTtcbiAgICB2YXIgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgZ2VuZXJhdGVFcnJvck1lc3NhZ2UodGhpcy5pbnB1dCwgbWVzc2FnZSwgZXJyb3JUb2tlblZhbHVlLCBpbmRleCwgbGluZSwgY29sdW1uKTtcbiAgICBpZiAoIWRvTm90QWR2YW5jZSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRFcnJvciA9IG5ldyBDc3NTY2FubmVyRXJyb3IoaW52YWxpZFRva2VuLCBlcnJvck1lc3NhZ2UpO1xuICAgIHJldHVybiBpbnZhbGlkVG9rZW47XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBdEtleXdvcmQoY3VycmVudDogQ3NzVG9rZW4sIG5leHQ6IENzc1Rva2VuKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50Lm51bVZhbHVlID09ICRBVCAmJiBuZXh0LnR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXI7XG59XG5cbmZ1bmN0aW9uIGlzQ2hhck1hdGNoKHRhcmdldDogbnVtYmVyLCBwcmV2aW91czogbnVtYmVyLCBjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gdGFyZ2V0ICYmIHByZXZpb3VzICE9ICRCQUNLU0xBU0g7XG59XG5cbmZ1bmN0aW9uIGlzRGlnaXQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAkMCA8PSBjb2RlICYmIGNvZGUgPD0gJDk7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudFN0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRTTEFTSCAmJiBuZXh0ID09ICRTVEFSO1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnRFbmQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNUQVIgJiYgbmV4dCA9PSAkU0xBU0g7XG59XG5cbmZ1bmN0aW9uIGlzU3RyaW5nU3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgdmFyIHRhcmdldCA9IGNvZGU7XG4gIGlmICh0YXJnZXQgPT0gJEJBQ0tTTEFTSCkge1xuICAgIHRhcmdldCA9IG5leHQ7XG4gIH1cbiAgcmV0dXJuIHRhcmdldCA9PSAkRFEgfHwgdGFyZ2V0ID09ICRTUTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgdmFyIHRhcmdldCA9IGNvZGU7XG4gIGlmICh0YXJnZXQgPT0gJE1JTlVTKSB7XG4gICAgdGFyZ2V0ID0gbmV4dDtcbiAgfVxuXG4gIHJldHVybiAoJGEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkeikgfHwgKCRBIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJFopIHx8IHRhcmdldCA9PSAkQkFDS1NMQVNIIHx8XG4gICAgICAgICB0YXJnZXQgPT0gJE1JTlVTIHx8IHRhcmdldCA9PSAkXztcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCh0YXJnZXQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKCRhIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJHopIHx8ICgkQSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICRaKSB8fCB0YXJnZXQgPT0gJEJBQ0tTTEFTSCB8fFxuICAgICAgICAgdGFyZ2V0ID09ICRNSU5VUyB8fCB0YXJnZXQgPT0gJF8gfHwgaXNEaWdpdCh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRLZXlmcmFtZUJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkUEVSQ0VOVDtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZEF0dHJpYnV0ZVNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyB2YWx1ZV4qfCR+PXNvbWV0aGluZ1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICQkOlxuICAgIGNhc2UgJFBJUEU6XG4gICAgY2FzZSAkQ0FSRVQ6XG4gICAgY2FzZSAkVElMREE6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRFUTpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBzZWxlY3RvciBbIGtleSAgID0gdmFsdWUgXVxuICAvLyBJREVOVCAgICBDIElERU5UIEMgSURFTlQgQ1xuICAvLyAjaWQsIC5jbGFzcywgKit+PlxuICAvLyB0YWc6UFNFVURPXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFRJTERBOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRHVDpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQSVBFOlxuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8ga2V5OnZhbHVlO1xuICAvLyBrZXk6Y2FsYyhzb21ldGhpbmcgLi4uIClcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkSEFTSDpcbiAgICBjYXNlICRTRU1JQ09MT046XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRCQUNLU0xBU0g6XG4gICAgY2FzZSAkQkFORzpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyAobWluLXdpZHRoOiA3LjVlbSkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKVxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQXRSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBAZG9jdW1lbnQgdXJsKGh0dHA6Ly93d3cudzMub3JnL3BhZ2U/c29tZXRoaW5nPW9uI2hhc2gpLFxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJEJBQ0tTTEFTSDpcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJEVROlxuICAgIGNhc2UgJFFVRVNUSU9OOlxuICAgIGNhc2UgJEFNUEVSU0FORDpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJENPTU1BOlxuICAgIGNhc2UgJE1JTlVTOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkTUlOVVM6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gQHNvbWV0aGluZyB7IH1cbiAgLy8gSURFTlRcbiAgcmV0dXJuIGNvZGUgPT0gJEFUO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQ3NzQ2hhcmFjdGVyKGNvZGU6IG51bWJlciwgbW9kZTogQ3NzTGV4ZXJNb2RlKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTDpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5BTExfVFJBQ0tfV1M6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlBTRVVET19TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZEF0dHJpYnV0ZVNlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuTUVESUFfUVVFUlk6XG4gICAgICByZXR1cm4gaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQVRfUlVMRV9RVUVSWTpcbiAgICAgIHJldHVybiBpc1ZhbGlkQXRSdWxlQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0s6XG4gICAgICByZXR1cm4gaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSzpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRTpcbiAgICAgIHJldHVybiBpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX0NBTENfRlVOQ1RJT046XG4gICAgICByZXR1cm4gaXNWYWxpZFN0eWxlRnVuY3Rpb25DaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5CTE9DSzpcbiAgICAgIHJldHVybiBpc1ZhbGlkQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJDb2RlKGlucHV0LCBpbmRleCk6IG51bWJlciB7XG4gIHJldHVybiBpbmRleCA+PSBpbnB1dC5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGlucHV0LCBpbmRleCk7XG59XG5cbmZ1bmN0aW9uIGNoYXJTdHIoY29kZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKGNvZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOZXdsaW5lKGNvZGUpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkRkY6XG4gICAgY2FzZSAkQ1I6XG4gICAgY2FzZSAkTEY6XG4gICAgY2FzZSAkVlRBQjpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19