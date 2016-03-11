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
    }
    return false;
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
        this._currentMode = CssLexerMode.BLOCK;
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
            var errorMessage = CssTokenType[next.type] + " does not match expected " + CssTokenType[type] + " value";
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
    }
    return false;
}
function isValidKeyframeBlockCharacter(code) {
    switch (code) {
        case chars_1.$PERCENT:
            return true;
    }
    return false;
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
    }
    return false;
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
    }
    return false;
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
    }
    return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbIkNzc1Rva2VuVHlwZSIsIkNzc0xleGVyTW9kZSIsIkxleGVkQ3NzUmVzdWx0IiwiTGV4ZWRDc3NSZXN1bHQuY29uc3RydWN0b3IiLCJnZW5lcmF0ZUVycm9yTWVzc2FnZSIsImZpbmRQcm9ibGVtQ29kZSIsIkNzc1Rva2VuIiwiQ3NzVG9rZW4uY29uc3RydWN0b3IiLCJDc3NMZXhlciIsIkNzc0xleGVyLmNvbnN0cnVjdG9yIiwiQ3NzTGV4ZXIuc2NhbiIsIkNzc1NjYW5uZXJFcnJvciIsIkNzc1NjYW5uZXJFcnJvci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXJFcnJvci50b1N0cmluZyIsIl90cmFja1doaXRlc3BhY2UiLCJDc3NTY2FubmVyIiwiQ3NzU2Nhbm5lci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXIuZ2V0TW9kZSIsIkNzc1NjYW5uZXIuc2V0TW9kZSIsIkNzc1NjYW5uZXIuYWR2YW5jZSIsIkNzc1NjYW5uZXIucGVla0F0IiwiQ3NzU2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzIiwiQ3NzU2Nhbm5lci5jb25zdW1lV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuY29uc3VtZSIsIkNzc1NjYW5uZXIuc2NhbiIsIkNzc1NjYW5uZXIuX3NjYW4iLCJDc3NTY2FubmVyLnNjYW5Db21tZW50IiwiQ3NzU2Nhbm5lci5zY2FuV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuc2NhblN0cmluZyIsIkNzc1NjYW5uZXIuc2Nhbk51bWJlciIsIkNzc1NjYW5uZXIuc2NhbklkZW50aWZpZXIiLCJDc3NTY2FubmVyLnNjYW5Dc3NWYWx1ZUZ1bmN0aW9uIiwiQ3NzU2Nhbm5lci5zY2FuQ2hhcmFjdGVyIiwiQ3NzU2Nhbm5lci5zY2FuQXRFeHByZXNzaW9uIiwiQ3NzU2Nhbm5lci5hc3NlcnRDb25kaXRpb24iLCJDc3NTY2FubmVyLmVycm9yIiwiaXNBdEtleXdvcmQiLCJpc0NoYXJNYXRjaCIsImlzRGlnaXQiLCJpc0NvbW1lbnRTdGFydCIsImlzQ29tbWVudEVuZCIsImlzU3RyaW5nU3RhcnQiLCJpc0lkZW50aWZpZXJTdGFydCIsImlzSWRlbnRpZmllclBhcnQiLCJpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyIiwiaXNWYWxpZEF0UnVsZUNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyIiwiaXNWYWxpZEJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZENzc0NoYXJhY3RlciIsImNoYXJDb2RlIiwiY2hhclN0ciIsImlzTmV3bGluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBc0QsMEJBQTBCLENBQUMsQ0FBQTtBQUNqRiwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU3RCxzQkEyQ08sNkJBQTZCLENBQUMsQ0FBQTtBQUVyQyxzQkFhTyw2QkFBNkIsQ0FBQztBQVpuQyw0QkFBSTtBQUNKLDBCQUFHO0FBQ0gsa0NBQU87QUFDUCxrQ0FBTztBQUNQLHNDQUFTO0FBQ1Qsc0NBQVM7QUFDVCxrQ0FBTztBQUNQLGtDQUFPO0FBQ1AsZ0NBQU07QUFDTixnQ0FBTTtBQUNOLHdDQUFVO0FBQ1YsNENBQ21DO0FBRXJDLFdBQVksWUFBWTtJQUN0QkEsNkNBQUdBLENBQUFBO0lBQ0hBLG1EQUFNQSxDQUFBQTtJQUNOQSxxREFBT0EsQ0FBQUE7SUFDUEEsMkRBQVVBLENBQUFBO0lBQ1ZBLG1EQUFNQSxDQUFBQTtJQUNOQSwyRUFBa0JBLENBQUFBO0lBQ2xCQSx5REFBU0EsQ0FBQUE7SUFDVEEseURBQVNBLENBQUFBO0lBQ1RBLDJEQUFVQSxDQUFBQTtJQUNWQSxxREFBT0EsQ0FBQUE7QUFDVEEsQ0FBQ0EsRUFYVyxvQkFBWSxLQUFaLG9CQUFZLFFBV3ZCO0FBWEQsSUFBWSxZQUFZLEdBQVosb0JBV1gsQ0FBQTtBQUVELFdBQVksWUFBWTtJQUN0QkMsNkNBQUdBLENBQUFBO0lBQ0hBLCtEQUFZQSxDQUFBQTtJQUNaQSx1REFBUUEsQ0FBQUE7SUFDUkEscUVBQWVBLENBQUFBO0lBQ2ZBLDJFQUFrQkEsQ0FBQUE7SUFDbEJBLGlFQUFhQSxDQUFBQTtJQUNiQSw2REFBV0EsQ0FBQUE7SUFDWEEsaURBQUtBLENBQUFBO0lBQ0xBLG1FQUFjQSxDQUFBQTtJQUNkQSw2REFBV0EsQ0FBQUE7SUFDWEEsOERBQVdBLENBQUFBO0lBQ1hBLGdGQUFvQkEsQ0FBQUE7SUFDcEJBLDhFQUFtQkEsQ0FBQUE7QUFDckJBLENBQUNBLEVBZFcsb0JBQVksS0FBWixvQkFBWSxRQWN2QjtBQWRELElBQVksWUFBWSxHQUFaLG9CQWNYLENBQUE7QUFFRDtJQUNFQyx3QkFBbUJBLEtBQXNCQSxFQUFTQSxLQUFlQTtRQUE5Q0MsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBaUJBO1FBQVNBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVVBO0lBQUdBLENBQUNBO0lBQ3ZFRCxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksc0JBQWMsaUJBRTFCLENBQUE7QUFFRCw4QkFBcUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNO0lBQ2pGRSxNQUFNQSxDQUFDQSxDQUFHQSxPQUFPQSxtQkFBY0EsR0FBR0EsU0FBSUEsTUFBTUEsc0JBQWtCQTtRQUN2REEsZUFBZUEsQ0FBQ0EsS0FBS0EsRUFBRUEsVUFBVUEsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7QUFDakVBLENBQUNBO0FBSGUsNEJBQW9CLHVCQUduQyxDQUFBO0FBRUQseUJBQWdDLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU07SUFDOURDLElBQUlBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDN0JBLElBQUlBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3JDQSxPQUFPQSxPQUFPQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUMxQ0EsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsZ0JBQWdCQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFDREEsSUFBSUEsYUFBYUEsR0FBR0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsZ0JBQWdCQSxDQUFDQSxDQUFDQTtJQUN6REEsSUFBSUEsY0FBY0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDeEJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQ2hDQSxjQUFjQSxJQUFJQSxHQUFHQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFDREEsSUFBSUEsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDdkJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQzNDQSxhQUFhQSxJQUFJQSxHQUFHQSxDQUFDQTtJQUN2QkEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsR0FBR0EsY0FBY0EsR0FBR0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7QUFDdEVBLENBQUNBO0FBaEJlLHVCQUFlLGtCQWdCOUIsQ0FBQTtBQUVEO0lBRUVDLGtCQUFtQkEsS0FBYUEsRUFBU0EsTUFBY0EsRUFBU0EsSUFBWUEsRUFDekRBLElBQWtCQSxFQUFTQSxRQUFnQkE7UUFEM0NDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLFNBQUlBLEdBQUpBLElBQUlBLENBQVFBO1FBQ3pEQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFjQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtRQUM1REEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0lBQ0hELGVBQUNBO0FBQURBLENBQUNBLEFBTkQsSUFNQztBQU5ZLGdCQUFRLFdBTXBCLENBQUE7QUFFRDtJQUFBRTtJQUlBQyxDQUFDQTtJQUhDRCx1QkFBSUEsR0FBSkEsVUFBS0EsSUFBWUEsRUFBRUEsYUFBOEJBO1FBQTlCRSw2QkFBOEJBLEdBQTlCQSxxQkFBOEJBO1FBQy9DQSxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFDSEYsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSlksZ0JBQVEsV0FJcEIsQ0FBQTtBQUVEO0lBQXFDRyxtQ0FBYUE7SUFJaERBLHlCQUFtQkEsS0FBZUEsRUFBRUEsT0FBT0E7UUFDekNDLGtCQUFNQSxtQkFBbUJBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBO1FBRHBCQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFVQTtRQUVoQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsT0FBT0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURELGtDQUFRQSxHQUFSQSxjQUFxQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0NGLHNCQUFDQTtBQUFEQSxDQUFDQSxBQVZELEVBQXFDLDBCQUFhLEVBVWpEO0FBVlksdUJBQWUsa0JBVTNCLENBQUE7QUFFRCwwQkFBMEIsSUFBa0I7SUFDMUNHLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLFlBQVlBLENBQUNBLFFBQVFBLENBQUNBO1FBQzNCQSxLQUFLQSxZQUFZQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUMvQkEsS0FBS0EsWUFBWUEsQ0FBQ0EsV0FBV0E7WUFDM0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNmQSxDQUFDQTtBQUVEO0lBV0VDLG9CQUFtQkEsS0FBYUEsRUFBVUEsY0FBK0JBO1FBQXZDQyw4QkFBdUNBLEdBQXZDQSxzQkFBdUNBO1FBQXREQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFRQTtRQUFVQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBaUJBO1FBUnpFQSxXQUFNQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUNuQkEsVUFBS0EsR0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkJBLFdBQU1BLEdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BCQSxTQUFJQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUVqQkEsaUJBQVlBLEdBQWlCQSxZQUFZQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNoREEsa0JBQWFBLEdBQW9CQSxJQUFJQSxDQUFDQTtRQUdwQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDaENBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQy9CQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtJQUNqQkEsQ0FBQ0E7SUFFREQsNEJBQU9BLEdBQVBBLGNBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyREYsNEJBQU9BLEdBQVBBLFVBQVFBLElBQWtCQTtRQUN4QkcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBO1lBQzNCQSxDQUFDQTtZQUNEQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREgsNEJBQU9BLEdBQVBBO1FBQ0VJLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNoQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDaEJBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1FBQ2JBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQzFCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFREosMkJBQU1BLEdBQU5BLFVBQU9BLEtBQUtBO1FBQ1ZLLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLFlBQUlBLEdBQUdBLG9CQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7SUFFREwsMkNBQXNCQSxHQUF0QkE7UUFDRU0sSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUN6QkEsT0FBT0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsa0JBQVVBLEVBQUVBLENBQUNBO1lBQy9CQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVETixzQ0FBaUJBLEdBQWpCQTtRQUNFTyxPQUFPQSxvQkFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1lBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLElBQUlBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNyRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUE7Z0JBQ3JCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFFQSxJQUFJQTtnQkFDckJBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBO29CQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsWUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3RCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBO29CQUNyQ0EsQ0FBQ0E7b0JBQ0RBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO2dCQUNqQkEsQ0FBQ0E7Z0JBQ0RBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUVBLElBQUlBO2dCQUNyQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUE7WUFDdkJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURQLDRCQUFPQSxHQUFQQSxVQUFRQSxJQUFrQkEsRUFBRUEsS0FBb0JBO1FBQXBCUSxxQkFBb0JBLEdBQXBCQSxZQUFvQkE7UUFDOUNBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUUvQkEsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDL0JBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQzdCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUVqQ0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFFekJBLHNEQUFzREE7UUFDdERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUVEQSxJQUFJQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxJQUFJQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxZQUFZQSxDQUFDQSxHQUFHQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFFREEsSUFBSUEsY0FBY0EsQ0FBQ0E7UUFDbkJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLFlBQVlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLDJEQUEyREE7WUFDM0RBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFlBQVlBLENBQUNBLE1BQU1BLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFlBQVlBLENBQUNBLFVBQVVBLENBQUNBO1FBQzVGQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUNyQ0EsQ0FBQ0E7UUFFREEsNkRBQTZEQTtRQUM3REEseUNBQXlDQTtRQUN6Q0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFbkJBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFjQSxJQUFJQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEVBLElBQUlBLFlBQVlBLEdBQ2RBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLDJCQUEyQkEsR0FBR0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0E7WUFFeEZBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckJBLFlBQVlBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLGtCQUFrQkEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDNUVBLENBQUNBO1lBRURBLEtBQUtBLEdBQUdBLElBQUlBLGVBQWVBLENBQ3ZCQSxJQUFJQSxFQUFFQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLGFBQWFBLEVBQ3REQSxZQUFZQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNoRUEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsY0FBY0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBR0RSLHlCQUFJQSxHQUFKQTtRQUNFUyxJQUFJQSxPQUFPQSxHQUFHQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFFREEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRS9CQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDMUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ2JBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFDM0JBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVEVCwwQkFBS0EsR0FBTEE7UUFDRVUsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDckJBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxZQUFJQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUU5QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLG9EQUFvREE7WUFDcERBLDZDQUE2Q0E7WUFDN0NBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1lBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeEJBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO1lBQ3RCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLG9CQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuRkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBRURBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pCQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsWUFBSUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFFOUJBLEVBQUVBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFFREEsMkJBQTJCQTtRQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsSUFBSUEsWUFBWUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQTtRQUNyQ0EsQ0FBQ0E7UUFFREEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsSUFBSUEsYUFBS0EsSUFBSUEsSUFBSUEsSUFBSUEsY0FBTUEsQ0FBQ0E7UUFDakRBLElBQUlBLE1BQU1BLEdBQUdBLFVBQVVBLEdBQUdBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hEQSxJQUFJQSxNQUFNQSxHQUFHQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsVUFBVUEsSUFBSUEsQ0FBQ0EsUUFBUUEsSUFBSUEsZUFBT0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsZUFBT0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0ZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxXQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO1FBQzlCQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSwyQkFBeUJBLG9CQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFHQSxDQUFDQSxDQUFDQTtJQUNsRkEsQ0FBQ0E7SUFFRFYsZ0NBQVdBLEdBQVhBO1FBQ0VXLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFFN0JBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUVBLElBQUlBO1FBQ3JCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFFQSxJQUFJQTtRQUVyQkEsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFlBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQTtZQUNyQ0EsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUVBLElBQUlBO1FBQ3JCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFFQSxJQUFJQTtRQUVyQkEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLGNBQWNBLEVBQUVBLFlBQVlBLEVBQUVBLFlBQVlBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3RGQSxDQUFDQTtJQUVEWCxtQ0FBY0EsR0FBZEE7UUFDRVksSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDdkJBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ2pDQSxJQUFJQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUM3QkEsT0FBT0Esb0JBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFlBQUlBLEVBQUVBLENBQUNBO1lBQ3BEQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFDREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLGNBQWNBLEVBQUVBLFlBQVlBLEVBQUVBLFlBQVlBLENBQUNBLFVBQVVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3pGQSxDQUFDQTtJQUVEWiwrQkFBVUEsR0FBVkE7UUFDRWEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsc0NBQXNDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDdkJBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDN0JBLElBQUlBLFFBQVFBLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUVmQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNqREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsWUFBSUEsSUFBSUEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1lBQ25DQSxDQUFDQTtZQUNEQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNyQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLE1BQU1BLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBRWZBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xEQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxjQUFjQSxFQUFFQSxZQUFZQSxFQUFFQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNyRkEsQ0FBQ0E7SUFFRGIsK0JBQVVBLEdBQVZBO1FBQ0VjLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsYUFBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsY0FBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUNEQSxJQUFJQSxVQUFVQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN2QkEsT0FBT0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsZUFBT0EsRUFBRUEsQ0FBQ0E7WUFDbERBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLGVBQU9BLENBQUNBLENBQUNBLENBQUNBO2dCQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2ZBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLHlDQUF5Q0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hEQSxDQUFDQTtnQkFDREEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDcEJBLENBQUNBO1lBQ0RBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUNEQSxJQUFJQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDdkZBLENBQUNBO0lBRURkLG1DQUFjQSxHQUFkQTtRQUNFZSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUdBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsT0FBT0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQ0RBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3ZEQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxjQUFjQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxZQUFZQSxDQUFDQSxVQUFVQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUMzRkEsQ0FBQ0E7SUFFRGYseUNBQW9CQSxHQUFwQkE7UUFDRWdCLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsT0FBT0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsWUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsZUFBT0EsRUFBRUEsQ0FBQ0E7WUFDakRBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUNEQSxJQUFJQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsVUFBVUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBRURoQixrQ0FBYUEsR0FBYkE7UUFDRWlCLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxFQUFFQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSwrQkFBK0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xJQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFFZkEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBRURqQixxQ0FBZ0JBLEdBQWhCQTtRQUNFa0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsV0FBR0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDdkJBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ2pDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNmQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hEQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQTtZQUNsQ0EsSUFBSUEsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLGNBQWNBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzFGQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGxCLG9DQUFlQSxHQUFmQSxVQUFnQkEsTUFBZUEsRUFBRUEsWUFBb0JBO1FBQ25EbUIsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURuQiwwQkFBS0EsR0FBTEEsVUFBTUEsT0FBZUEsRUFBRUEsZUFBOEJBLEVBQUVBLFlBQTZCQTtRQUE3RG9CLCtCQUE4QkEsR0FBOUJBLHNCQUE4QkE7UUFBRUEsNEJBQTZCQSxHQUE3QkEsb0JBQTZCQTtRQUNsRkEsSUFBSUEsS0FBS0EsR0FBV0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDL0JBLElBQUlBLE1BQU1BLEdBQVdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ2pDQSxJQUFJQSxJQUFJQSxHQUFXQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUM3QkEsZUFBZUE7WUFDWEEsZ0JBQVNBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLGVBQWVBLEdBQUdBLG9CQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN6RkEsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsT0FBT0EsRUFBRUEsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDNUZBLElBQUlBLFlBQVlBLEdBQ1pBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsRUFBRUEsZUFBZUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDcEZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDckVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO0lBQ3RCQSxDQUFDQTtJQUNIcEIsaUJBQUNBO0FBQURBLENBQUNBLEFBbldELElBbVdDO0FBbldZLGtCQUFVLGFBbVd0QixDQUFBO0FBRUQscUJBQXFCLE9BQWlCLEVBQUUsSUFBYztJQUNwRHFCLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLElBQUlBLFdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFlBQVlBLENBQUNBLFVBQVVBLENBQUNBO0FBQ3pFQSxDQUFDQTtBQUVELHFCQUFxQixNQUFjLEVBQUUsUUFBZ0IsRUFBRSxJQUFZO0lBQ2pFQyxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxNQUFNQSxJQUFJQSxRQUFRQSxJQUFJQSxrQkFBVUEsQ0FBQ0E7QUFDbERBLENBQUNBO0FBRUQsaUJBQWlCLElBQVk7SUFDM0JDLE1BQU1BLENBQUNBLFVBQUVBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLFVBQUVBLENBQUNBO0FBQ2xDQSxDQUFDQTtBQUVELHdCQUF3QixJQUFZLEVBQUUsSUFBWTtJQUNoREMsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsY0FBTUEsSUFBSUEsSUFBSUEsSUFBSUEsYUFBS0EsQ0FBQ0E7QUFDekNBLENBQUNBO0FBRUQsc0JBQXNCLElBQVksRUFBRSxJQUFZO0lBQzlDQyxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxhQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxjQUFNQSxDQUFDQTtBQUN6Q0EsQ0FBQ0E7QUFFRCx1QkFBdUIsSUFBWSxFQUFFLElBQVk7SUFDL0NDLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO0lBQ2xCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxrQkFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxJQUFJQSxXQUFHQSxJQUFJQSxNQUFNQSxJQUFJQSxXQUFHQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFFRCwyQkFBMkIsSUFBWSxFQUFFLElBQVk7SUFDbkRDLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBO0lBQ2xCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxjQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNyQkEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLENBQUNBLFVBQUVBLElBQUlBLE1BQU1BLElBQUlBLE1BQU1BLElBQUlBLFVBQUVBLENBQUNBLElBQUlBLENBQUNBLFVBQUVBLElBQUlBLE1BQU1BLElBQUlBLE1BQU1BLElBQUlBLFVBQUVBLENBQUNBLElBQUlBLE1BQU1BLElBQUlBLGtCQUFVQTtRQUN4RkEsTUFBTUEsSUFBSUEsY0FBTUEsSUFBSUEsTUFBTUEsSUFBSUEsVUFBRUEsQ0FBQ0E7QUFDMUNBLENBQUNBO0FBRUQsMEJBQTBCLE1BQWM7SUFDdENDLE1BQU1BLENBQUNBLENBQUNBLFVBQUVBLElBQUlBLE1BQU1BLElBQUlBLE1BQU1BLElBQUlBLFVBQUVBLENBQUNBLElBQUlBLENBQUNBLFVBQUVBLElBQUlBLE1BQU1BLElBQUlBLE1BQU1BLElBQUlBLFVBQUVBLENBQUNBLElBQUlBLE1BQU1BLElBQUlBLGtCQUFVQTtRQUN4RkEsTUFBTUEsSUFBSUEsY0FBTUEsSUFBSUEsTUFBTUEsSUFBSUEsVUFBRUEsSUFBSUEsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDN0RBLENBQUNBO0FBRUQsd0NBQXdDLElBQVk7SUFDbERDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLGVBQU9BLENBQUNBO1FBQ2JBLEtBQUtBLGVBQU9BO1lBQ1ZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNmQSxDQUFDQTtBQUVELHVDQUF1QyxJQUFZO0lBQ2pEQyxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNiQSxLQUFLQSxnQkFBUUE7WUFDWEEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0FBQ2ZBLENBQUNBO0FBRUQsMkNBQTJDLElBQVk7SUFDckRDLHVCQUF1QkE7SUFDdkJBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLFVBQUVBLENBQUNBO1FBQ1JBLEtBQUtBLGFBQUtBLENBQUNBO1FBQ1hBLEtBQUtBLGNBQU1BLENBQUNBO1FBQ1pBLEtBQUtBLGNBQU1BLENBQUNBO1FBQ1pBLEtBQUtBLGFBQUtBLENBQUNBO1FBQ1hBLEtBQUtBLFdBQUdBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNmQSxDQUFDQTtBQUVELGtDQUFrQyxJQUFZO0lBQzVDQyw2QkFBNkJBO0lBQzdCQSw2QkFBNkJBO0lBQzdCQSxvQkFBb0JBO0lBQ3BCQSxhQUFhQTtJQUNiQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNiQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxlQUFPQSxDQUFDQTtRQUNiQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxXQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxjQUFNQTtZQUNUQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRCxvQ0FBb0MsSUFBWTtJQUM5Q0MsYUFBYUE7SUFDYkEsMkJBQTJCQTtJQUMzQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsS0FBS0EsYUFBS0EsQ0FBQ0E7UUFDWEEsS0FBS0Esa0JBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxnQkFBUUEsQ0FBQ0E7UUFDZEEsS0FBS0EsY0FBTUEsQ0FBQ0E7UUFDWkEsS0FBS0Esa0JBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxlQUFPQSxDQUFDQTtRQUNiQSxLQUFLQSxlQUFPQSxDQUFDQTtRQUNiQSxLQUFLQSxlQUFPQTtZQUNWQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRCx3Q0FBd0MsSUFBWTtJQUNsREMsa0RBQWtEQTtJQUNsREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsY0FBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsZ0JBQVFBLENBQUNBO1FBQ2RBLEtBQUtBLGVBQU9BO1lBQ1ZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2hCQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELGdDQUFnQyxJQUFZO0lBQzFDQywyREFBMkRBO0lBQzNEQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNiQSxLQUFLQSxlQUFPQSxDQUFDQTtRQUNiQSxLQUFLQSxlQUFPQSxDQUFDQTtRQUNiQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxnQkFBUUEsQ0FBQ0E7UUFDZEEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsY0FBTUEsQ0FBQ0E7UUFDWkEsS0FBS0Esa0JBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxXQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxpQkFBU0EsQ0FBQ0E7UUFDZkEsS0FBS0Esa0JBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxhQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxjQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxhQUFLQTtZQUNSQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7QUFDZkEsQ0FBQ0E7QUFFRCx1Q0FBdUMsSUFBWTtJQUNqREMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsY0FBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsYUFBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsYUFBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsY0FBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsZUFBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsY0FBTUE7WUFDVEEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsK0JBQStCLElBQVk7SUFDekNDLGlCQUFpQkE7SUFDakJBLFFBQVFBO0lBQ1JBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLFdBQUdBLENBQUNBO0FBQ3JCQSxDQUFDQTtBQUVELDZCQUE2QixJQUFZLEVBQUUsSUFBa0I7SUFDM0RDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLFlBQVlBLENBQUNBLEdBQUdBLENBQUNBO1FBQ3RCQSxLQUFLQSxZQUFZQSxDQUFDQSxZQUFZQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFFZEEsS0FBS0EsWUFBWUEsQ0FBQ0EsUUFBUUE7WUFDeEJBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFeENBLEtBQUtBLFlBQVlBLENBQUNBLGVBQWVBO1lBQy9CQSxNQUFNQSxDQUFDQSw4QkFBOEJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRTlDQSxLQUFLQSxZQUFZQSxDQUFDQSxrQkFBa0JBO1lBQ2xDQSxNQUFNQSxDQUFDQSxpQ0FBaUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRWpEQSxLQUFLQSxZQUFZQSxDQUFDQSxXQUFXQTtZQUMzQkEsTUFBTUEsQ0FBQ0EsOEJBQThCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU5Q0EsS0FBS0EsWUFBWUEsQ0FBQ0EsYUFBYUE7WUFDN0JBLE1BQU1BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFdENBLEtBQUtBLFlBQVlBLENBQUNBLGNBQWNBO1lBQzlCQSxNQUFNQSxDQUFDQSw2QkFBNkJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRTdDQSxLQUFLQSxZQUFZQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUM5QkEsS0FBS0EsWUFBWUEsQ0FBQ0EsV0FBV0E7WUFDM0JBLE1BQU1BLENBQUNBLDBCQUEwQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFMUNBLEtBQUtBLFlBQVlBLENBQUNBLG1CQUFtQkE7WUFDbkNBLE1BQU1BLENBQUNBLDZCQUE2QkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFN0NBLEtBQUtBLFlBQVlBLENBQUNBLEtBQUtBO1lBQ3JCQSxNQUFNQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ3ZDQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtBQUNmQSxDQUFDQTtBQUVELGtCQUFrQixLQUFLLEVBQUUsS0FBSztJQUM1QkMsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsWUFBSUEsR0FBR0Esb0JBQWFBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0FBQy9FQSxDQUFDQTtBQUVELGlCQUFpQixJQUFZO0lBQzNCQyxNQUFNQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7QUFDMUNBLENBQUNBO0FBRUQsbUJBQTBCLElBQUk7SUFDNUJDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLGFBQUtBO1lBQ1JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRWRBO1lBQ0VBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIQSxDQUFDQTtBQVhlLGlCQUFTLFlBV3hCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge051bWJlcldyYXBwZXIsIFN0cmluZ1dyYXBwZXIsIGlzUHJlc2VudH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge1xuICBpc1doaXRlc3BhY2UsXG4gICRFT0YsXG4gICRIQVNILFxuICAkVElMREEsXG4gICRDQVJFVCxcbiAgJFBFUkNFTlQsXG4gICQkLFxuICAkXyxcbiAgJENPTE9OLFxuICAkU1EsXG4gICREUSxcbiAgJEVRLFxuICAkU0xBU0gsXG4gICRCQUNLU0xBU0gsXG4gICRQRVJJT0QsXG4gICRTVEFSLFxuICAkUExVUyxcbiAgJExQQVJFTixcbiAgJFJQQVJFTixcbiAgJExCUkFDRSxcbiAgJFJCUkFDRSxcbiAgJExCUkFDS0VULFxuICAkUkJSQUNLRVQsXG4gICRQSVBFLFxuICAkQ09NTUEsXG4gICRTRU1JQ09MT04sXG4gICRNSU5VUyxcbiAgJEJBTkcsXG4gICRRVUVTVElPTixcbiAgJEFULFxuICAkQU1QRVJTQU5ELFxuICAkR1QsXG4gICRhLFxuICAkQSxcbiAgJHosXG4gICRaLFxuICAkMCxcbiAgJDksXG4gICRGRixcbiAgJENSLFxuICAkTEYsXG4gICRWVEFCXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY2hhcnNcIjtcblxuZXhwb3J0IHtcbiAgJEVPRixcbiAgJEFULFxuICAkUkJSQUNFLFxuICAkTEJSQUNFLFxuICAkTEJSQUNLRVQsXG4gICRSQlJBQ0tFVCxcbiAgJExQQVJFTixcbiAgJFJQQVJFTixcbiAgJENPTU1BLFxuICAkQ09MT04sXG4gICRTRU1JQ09MT04sXG4gIGlzV2hpdGVzcGFjZVxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYXJzXCI7XG5cbmV4cG9ydCBlbnVtIENzc1Rva2VuVHlwZSB7XG4gIEVPRixcbiAgU3RyaW5nLFxuICBDb21tZW50LFxuICBJZGVudGlmaWVyLFxuICBOdW1iZXIsXG4gIElkZW50aWZpZXJPck51bWJlcixcbiAgQXRLZXl3b3JkLFxuICBDaGFyYWN0ZXIsXG4gIFdoaXRlc3BhY2UsXG4gIEludmFsaWRcbn1cblxuZXhwb3J0IGVudW0gQ3NzTGV4ZXJNb2RlIHtcbiAgQUxMLFxuICBBTExfVFJBQ0tfV1MsXG4gIFNFTEVDVE9SLFxuICBQU0VVRE9fU0VMRUNUT1IsXG4gIEFUVFJJQlVURV9TRUxFQ1RPUixcbiAgQVRfUlVMRV9RVUVSWSxcbiAgTUVESUFfUVVFUlksXG4gIEJMT0NLLFxuICBLRVlGUkFNRV9CTE9DSyxcbiAgU1RZTEVfQkxPQ0ssXG4gIFNUWUxFX1ZBTFVFLFxuICBTVFlMRV9WQUxVRV9GVU5DVElPTixcbiAgU1RZTEVfQ0FMQ19GVU5DVElPTlxufVxuXG5leHBvcnQgY2xhc3MgTGV4ZWRDc3NSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3I6IENzc1NjYW5uZXJFcnJvciwgcHVibGljIHRva2VuOiBDc3NUb2tlbikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlRXJyb3JNZXNzYWdlKGlucHV0LCBtZXNzYWdlLCBlcnJvclZhbHVlLCBpbmRleCwgcm93LCBjb2x1bW4pIHtcbiAgcmV0dXJuIGAke21lc3NhZ2V9IGF0IGNvbHVtbiAke3Jvd306JHtjb2x1bW59IGluIGV4cHJlc3Npb24gW2AgK1xuICAgICAgICAgZmluZFByb2JsZW1Db2RlKGlucHV0LCBlcnJvclZhbHVlLCBpbmRleCwgY29sdW1uKSArICddJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRQcm9ibGVtQ29kZShpbnB1dCwgZXJyb3JWYWx1ZSwgaW5kZXgsIGNvbHVtbikge1xuICB2YXIgZW5kT2ZQcm9ibGVtTGluZSA9IGluZGV4O1xuICB2YXIgY3VycmVudCA9IGNoYXJDb2RlKGlucHV0LCBpbmRleCk7XG4gIHdoaWxlIChjdXJyZW50ID4gMCAmJiAhaXNOZXdsaW5lKGN1cnJlbnQpKSB7XG4gICAgY3VycmVudCA9IGNoYXJDb2RlKGlucHV0LCArK2VuZE9mUHJvYmxlbUxpbmUpO1xuICB9XG4gIHZhciBjaG9wcGVkU3RyaW5nID0gaW5wdXQuc3Vic3RyaW5nKDAsIGVuZE9mUHJvYmxlbUxpbmUpO1xuICB2YXIgcG9pbnRlclBhZGRpbmcgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbjsgaSsrKSB7XG4gICAgcG9pbnRlclBhZGRpbmcgKz0gXCIgXCI7XG4gIH1cbiAgdmFyIHBvaW50ZXJTdHJpbmcgPSBcIlwiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yVmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBwb2ludGVyU3RyaW5nICs9IFwiXlwiO1xuICB9XG4gIHJldHVybiBjaG9wcGVkU3RyaW5nICsgXCJcXG5cIiArIHBvaW50ZXJQYWRkaW5nICsgcG9pbnRlclN0cmluZyArIFwiXFxuXCI7XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NUb2tlbiB7XG4gIG51bVZhbHVlOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY29sdW1uOiBudW1iZXIsIHB1YmxpYyBsaW5lOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyB0eXBlOiBDc3NUb2tlblR5cGUsIHB1YmxpYyBzdHJWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5udW1WYWx1ZSA9IGNoYXJDb2RlKHN0clZhbHVlLCAwKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzTGV4ZXIge1xuICBzY2FuKHRleHQ6IHN0cmluZywgdHJhY2tDb21tZW50czogYm9vbGVhbiA9IGZhbHNlKTogQ3NzU2Nhbm5lciB7XG4gICAgcmV0dXJuIG5ldyBDc3NTY2FubmVyKHRleHQsIHRyYWNrQ29tbWVudHMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTY2FubmVyRXJyb3IgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgcHVibGljIHJhd01lc3NhZ2U6IHN0cmluZztcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW46IENzc1Rva2VuLCBtZXNzYWdlKSB7XG4gICAgc3VwZXIoJ0NzcyBQYXJzZSBFcnJvcjogJyArIG1lc3NhZ2UpO1xuICAgIHRoaXMucmF3TWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5tZXNzYWdlOyB9XG59XG5cbmZ1bmN0aW9uIF90cmFja1doaXRlc3BhY2UobW9kZTogQ3NzTGV4ZXJNb2RlKSB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTF9UUkFDS19XUzpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRTpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGNsYXNzIENzc1NjYW5uZXIge1xuICBwZWVrOiBudW1iZXI7XG4gIHBlZWtQZWVrOiBudW1iZXI7XG4gIGxlbmd0aDogbnVtYmVyID0gMDtcbiAgaW5kZXg6IG51bWJlciA9IC0xO1xuICBjb2x1bW46IG51bWJlciA9IC0xO1xuICBsaW5lOiBudW1iZXIgPSAwO1xuXG4gIF9jdXJyZW50TW9kZTogQ3NzTGV4ZXJNb2RlID0gQ3NzTGV4ZXJNb2RlLkJMT0NLO1xuICBfY3VycmVudEVycm9yOiBDc3NTY2FubmVyRXJyb3IgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbnB1dDogc3RyaW5nLCBwcml2YXRlIF90cmFja0NvbW1lbnRzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMuaW5wdXQubGVuZ3RoO1xuICAgIHRoaXMucGVla1BlZWsgPSB0aGlzLnBlZWtBdCgwKTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgfVxuXG4gIGdldE1vZGUoKTogQ3NzTGV4ZXJNb2RlIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRNb2RlOyB9XG5cbiAgc2V0TW9kZShtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudE1vZGUgIT0gbW9kZSkge1xuICAgICAgaWYgKF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpKSB7XG4gICAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2N1cnJlbnRNb2RlID0gbW9kZTtcbiAgICB9XG4gIH1cblxuICBhZHZhbmNlKCk6IHZvaWQge1xuICAgIGlmIChpc05ld2xpbmUodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5jb2x1bW4gPSAwO1xuICAgICAgdGhpcy5saW5lKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sdW1uKys7XG4gICAgfVxuXG4gICAgdGhpcy5pbmRleCsrO1xuICAgIHRoaXMucGVlayA9IHRoaXMucGVla1BlZWs7XG4gICAgdGhpcy5wZWVrUGVlayA9IHRoaXMucGVla0F0KHRoaXMuaW5kZXggKyAxKTtcbiAgfVxuXG4gIHBlZWtBdChpbmRleCk6IG51bWJlciB7XG4gICAgcmV0dXJuIGluZGV4ID49IHRoaXMubGVuZ3RoID8gJEVPRiA6IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdCh0aGlzLmlucHV0LCBpbmRleCk7XG4gIH1cblxuICBjb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB3aGlsZSAodGhpcy5wZWVrID09ICRTRU1JQ09MT04pIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWVXaGl0ZXNwYWNlKCk6IHZvaWQge1xuICAgIHdoaWxlIChpc1doaXRlc3BhY2UodGhpcy5wZWVrKSB8fCBpc05ld2xpbmUodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuX3RyYWNrQ29tbWVudHMgJiYgaXNDb21tZW50U3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG4gICAgICAgIHdoaWxlICghaXNDb21tZW50RW5kKHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBjb21tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdW1lKHR5cGU6IENzc1Rva2VuVHlwZSwgdmFsdWU6IHN0cmluZyA9IG51bGwpOiBMZXhlZENzc1Jlc3VsdCB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLl9jdXJyZW50TW9kZTtcbiAgICB0aGlzLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFMTCk7XG5cbiAgICB2YXIgcHJldmlvdXNJbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHByZXZpb3VzTGluZSA9IHRoaXMubGluZTtcbiAgICB2YXIgcHJldmlvdXNDb2x1bW4gPSB0aGlzLmNvbHVtbjtcblxuICAgIHZhciBvdXRwdXQgPSB0aGlzLnNjYW4oKTtcblxuICAgIC8vIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzY2FuIG1ldGhvZCByZXR1cm5lZCBhbiBlcnJvclxuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0LmVycm9yKSkge1xuICAgICAgdGhpcy5zZXRNb2RlKG1vZGUpO1xuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICB2YXIgbmV4dCA9IG91dHB1dC50b2tlbjtcbiAgICBpZiAoIWlzUHJlc2VudChuZXh0KSkge1xuICAgICAgbmV4dCA9IG5ldyBDc3NUb2tlbigwLCAwLCAwLCBDc3NUb2tlblR5cGUuRU9GLCBcImVuZCBvZiBmaWxlXCIpO1xuICAgIH1cblxuICAgIHZhciBpc01hdGNoaW5nVHlwZTtcbiAgICBpZiAodHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllck9yTnVtYmVyKSB7XG4gICAgICAvLyBUT0RPIChtYXRza28pOiBpbXBsZW1lbnQgYXJyYXkgdHJhdmVyc2FsIGZvciBsb29rdXAgaGVyZVxuICAgICAgaXNNYXRjaGluZ1R5cGUgPSBuZXh0LnR5cGUgPT0gQ3NzVG9rZW5UeXBlLk51bWJlciB8fCBuZXh0LnR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzTWF0Y2hpbmdUeXBlID0gbmV4dC50eXBlID09IHR5cGU7XG4gICAgfVxuXG4gICAgLy8gYmVmb3JlIHRocm93aW5nIHRoZSBlcnJvciB3ZSBuZWVkIHRvIGJyaW5nIGJhY2sgdGhlIGZvcm1lclxuICAgIC8vIG1vZGUgc28gdGhhdCB0aGUgcGFyc2VyIGNhbiByZWNvdmVyLi4uXG4gICAgdGhpcy5zZXRNb2RlKG1vZGUpO1xuXG4gICAgdmFyIGVycm9yID0gbnVsbDtcbiAgICBpZiAoIWlzTWF0Y2hpbmdUeXBlIHx8IChpc1ByZXNlbnQodmFsdWUpICYmIHZhbHVlICE9IG5leHQuc3RyVmFsdWUpKSB7XG4gICAgICB2YXIgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgQ3NzVG9rZW5UeXBlW25leHQudHlwZV0gKyBcIiBkb2VzIG5vdCBtYXRjaCBleHBlY3RlZCBcIiArIENzc1Rva2VuVHlwZVt0eXBlXSArIFwiIHZhbHVlXCI7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSArPSAnIChcIicgKyBuZXh0LnN0clZhbHVlICsgJ1wiIHNob3VsZCBtYXRjaCBcIicgKyB2YWx1ZSArICdcIiknO1xuICAgICAgfVxuXG4gICAgICBlcnJvciA9IG5ldyBDc3NTY2FubmVyRXJyb3IoXG4gICAgICAgICAgbmV4dCwgZ2VuZXJhdGVFcnJvck1lc3NhZ2UodGhpcy5pbnB1dCwgZXJyb3JNZXNzYWdlLCBuZXh0LnN0clZhbHVlLCBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzTGluZSwgcHJldmlvdXNDb2x1bW4pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExleGVkQ3NzUmVzdWx0KGVycm9yLCBuZXh0KTtcbiAgfVxuXG5cbiAgc2NhbigpOiBMZXhlZENzc1Jlc3VsdCB7XG4gICAgdmFyIHRyYWNrV1MgPSBfdHJhY2tXaGl0ZXNwYWNlKHRoaXMuX2N1cnJlbnRNb2RlKTtcbiAgICBpZiAodGhpcy5pbmRleCA9PSAwICYmICF0cmFja1dTKSB7ICAvLyBmaXJzdCBzY2FuXG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuICAgIGlmICh0b2tlbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBlcnJvciA9IHRoaXMuX2N1cnJlbnRFcnJvcjtcbiAgICB0aGlzLl9jdXJyZW50RXJyb3IgPSBudWxsO1xuICAgIGlmICghdHJhY2tXUykge1xuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExleGVkQ3NzUmVzdWx0KGVycm9yLCB0b2tlbik7XG4gIH1cblxuICBfc2NhbigpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHBlZWsgPSB0aGlzLnBlZWs7XG4gICAgdmFyIHBlZWtQZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICBpZiAocGVlayA9PSAkRU9GKSByZXR1cm4gbnVsbDtcblxuICAgIGlmIChpc0NvbW1lbnRTdGFydChwZWVrLCBwZWVrUGVlaykpIHtcbiAgICAgIC8vIGV2ZW4gaWYgY29tbWVudHMgYXJlIG5vdCB0cmFja2VkIHdlIHN0aWxsIGxleCB0aGVcbiAgICAgIC8vIGNvbW1lbnQgc28gd2UgY2FuIG1vdmUgdGhlIHBvaW50ZXIgZm9yd2FyZFxuICAgICAgdmFyIGNvbW1lbnRUb2tlbiA9IHRoaXMuc2NhbkNvbW1lbnQoKTtcbiAgICAgIGlmICh0aGlzLl90cmFja0NvbW1lbnRzKSB7XG4gICAgICAgIHJldHVybiBjb21tZW50VG9rZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpICYmIChpc1doaXRlc3BhY2UocGVlaykgfHwgaXNOZXdsaW5lKHBlZWspKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbldoaXRlc3BhY2UoKTtcbiAgICB9XG5cbiAgICBwZWVrID0gdGhpcy5wZWVrO1xuICAgIHBlZWtQZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICBpZiAocGVlayA9PSAkRU9GKSByZXR1cm4gbnVsbDtcblxuICAgIGlmIChpc1N0cmluZ1N0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhblN0cmluZygpO1xuICAgIH1cblxuICAgIC8vIHNvbWV0aGluZyBsaWtlIHVybChjb29sKVxuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZSA9PSBDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUVfRlVOQ1RJT04pIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5Dc3NWYWx1ZUZ1bmN0aW9uKCk7XG4gICAgfVxuXG4gICAgdmFyIGlzTW9kaWZpZXIgPSBwZWVrID09ICRQTFVTIHx8IHBlZWsgPT0gJE1JTlVTO1xuICAgIHZhciBkaWdpdEEgPSBpc01vZGlmaWVyID8gZmFsc2UgOiBpc0RpZ2l0KHBlZWspO1xuICAgIHZhciBkaWdpdEIgPSBpc0RpZ2l0KHBlZWtQZWVrKTtcbiAgICBpZiAoZGlnaXRBIHx8IChpc01vZGlmaWVyICYmIChwZWVrUGVlayA9PSAkUEVSSU9EIHx8IGRpZ2l0QikpIHx8IChwZWVrID09ICRQRVJJT0QgJiYgZGlnaXRCKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2Nhbk51bWJlcigpO1xuICAgIH1cblxuICAgIGlmIChwZWVrID09ICRBVCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkF0RXhwcmVzc2lvbigpO1xuICAgIH1cblxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChwZWVrLCBwZWVrUGVlaykpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5JZGVudGlmaWVyKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzVmFsaWRDc3NDaGFyYWN0ZXIocGVlaywgdGhpcy5fY3VycmVudE1vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQ2hhcmFjdGVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFske1N0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspfV1gKTtcbiAgfVxuXG4gIHNjYW5Db21tZW50KCkge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc0NvbW1lbnRTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCBcIkV4cGVjdGVkIGNvbW1lbnQgc3RhcnQgdmFsdWVcIikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcblxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuXG4gICAgd2hpbGUgKCFpc0NvbW1lbnRFbmQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBjb21tZW50Jyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cblxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLkNvbW1lbnQsIHN0cik7XG4gIH1cblxuICBzY2FuV2hpdGVzcGFjZSgpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgd2hpbGUgKGlzV2hpdGVzcGFjZSh0aGlzLnBlZWspICYmIHRoaXMucGVlayAhPSAkRU9GKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSwgc3RyKTtcbiAgfVxuXG4gIHNjYW5TdHJpbmcoKSB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzU3RyaW5nU3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSwgXCJVbmV4cGVjdGVkIG5vbi1zdHJpbmcgc3RhcnRpbmcgdmFsdWVcIikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB0YXJnZXQgPSB0aGlzLnBlZWs7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuICAgIHZhciBwcmV2aW91cyA9IHRhcmdldDtcbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHdoaWxlICghaXNDaGFyTWF0Y2godGFyZ2V0LCBwcmV2aW91cywgdGhpcy5wZWVrKSkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GIHx8IGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBxdW90ZScpO1xuICAgICAgfVxuICAgICAgcHJldmlvdXMgPSB0aGlzLnBlZWs7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24odGhpcy5wZWVrID09IHRhcmdldCwgXCJVbnRlcm1pbmF0ZWQgcXVvdGVcIikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLlN0cmluZywgc3RyKTtcbiAgfVxuXG4gIHNjYW5OdW1iZXIoKSB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICBpZiAodGhpcy5wZWVrID09ICRQTFVTIHx8IHRoaXMucGVlayA9PSAkTUlOVVMpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgcGVyaW9kVXNlZCA9IGZhbHNlO1xuICAgIHdoaWxlIChpc0RpZ2l0KHRoaXMucGVlaykgfHwgdGhpcy5wZWVrID09ICRQRVJJT0QpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsgPT0gJFBFUklPRCkge1xuICAgICAgICBpZiAocGVyaW9kVXNlZCkge1xuICAgICAgICAgIHRoaXMuZXJyb3IoJ1VuZXhwZWN0ZWQgdXNlIG9mIGEgc2Vjb25kIHBlcmlvZCB2YWx1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHBlcmlvZFVzZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuTnVtYmVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuSWRlbnRpZmllcigpIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oaXNJZGVudGlmaWVyU3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSwgJ0V4cGVjdGVkIGlkZW50aWZpZXIgc3RhcnRpbmcgdmFsdWUnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB3aGlsZSAoaXNJZGVudGlmaWVyUGFydCh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuQ3NzVmFsdWVGdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT0gJEVPRiAmJiB0aGlzLnBlZWsgIT0gJFJQQVJFTikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllciwgc3RyVmFsdWUpO1xuICB9XG5cbiAgc2NhbkNoYXJhY3RlcigpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc1ZhbGlkQ3NzQ2hhcmFjdGVyKHRoaXMucGVlaywgdGhpcy5fY3VycmVudE1vZGUpLCBjaGFyU3RyKHRoaXMucGVlaykgKyAnIGlzIG5vdCBhIHZhbGlkIENTUyBjaGFyYWN0ZXInKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGMgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAxKTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsIGMpO1xuICB9XG5cbiAgc2NhbkF0RXhwcmVzc2lvbigpIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24odGhpcy5wZWVrID09ICRBVCwgJ0V4cGVjdGVkIEAgdmFsdWUnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgdmFyIGlkZW50ID0gdGhpcy5zY2FuSWRlbnRpZmllcigpO1xuICAgICAgdmFyIHN0clZhbHVlID0gJ0AnICsgaWRlbnQuc3RyVmFsdWU7XG4gICAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuQXRLZXl3b3JkLCBzdHJWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5DaGFyYWN0ZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3NlcnRDb25kaXRpb24oc3RhdHVzOiBib29sZWFuLCBlcnJvck1lc3NhZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICB0aGlzLmVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvclRva2VuVmFsdWU6IHN0cmluZyA9IG51bGwsIGRvTm90QWR2YW5jZTogYm9vbGVhbiA9IGZhbHNlKTogQ3NzVG9rZW4ge1xuICAgIHZhciBpbmRleDogbnVtYmVyID0gdGhpcy5pbmRleDtcbiAgICB2YXIgY29sdW1uOiBudW1iZXIgPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgbGluZTogbnVtYmVyID0gdGhpcy5saW5lO1xuICAgIGVycm9yVG9rZW5WYWx1ZSA9XG4gICAgICAgIGlzUHJlc2VudChlcnJvclRva2VuVmFsdWUpID8gZXJyb3JUb2tlblZhbHVlIDogU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUodGhpcy5wZWVrKTtcbiAgICB2YXIgaW52YWxpZFRva2VuID0gbmV3IENzc1Rva2VuKGluZGV4LCBjb2x1bW4sIGxpbmUsIENzc1Rva2VuVHlwZS5JbnZhbGlkLCBlcnJvclRva2VuVmFsdWUpO1xuICAgIHZhciBlcnJvck1lc3NhZ2UgPVxuICAgICAgICBnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLmlucHV0LCBtZXNzYWdlLCBlcnJvclRva2VuVmFsdWUsIGluZGV4LCBsaW5lLCBjb2x1bW4pO1xuICAgIGlmICghZG9Ob3RBZHZhbmNlKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEVycm9yID0gbmV3IENzc1NjYW5uZXJFcnJvcihpbnZhbGlkVG9rZW4sIGVycm9yTWVzc2FnZSk7XG4gICAgcmV0dXJuIGludmFsaWRUb2tlbjtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0F0S2V5d29yZChjdXJyZW50OiBDc3NUb2tlbiwgbmV4dDogQ3NzVG9rZW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnQubnVtVmFsdWUgPT0gJEFUICYmIG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllcjtcbn1cblxuZnVuY3Rpb24gaXNDaGFyTWF0Y2godGFyZ2V0OiBudW1iZXIsIHByZXZpb3VzOiBudW1iZXIsIGNvZGU6IG51bWJlcikge1xuICByZXR1cm4gY29kZSA9PSB0YXJnZXQgJiYgcHJldmlvdXMgIT0gJEJBQ0tTTEFTSDtcbn1cblxuZnVuY3Rpb24gaXNEaWdpdChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICQwIDw9IGNvZGUgJiYgY29kZSA8PSAkOTtcbn1cblxuZnVuY3Rpb24gaXNDb21tZW50U3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNMQVNIICYmIG5leHQgPT0gJFNUQVI7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudEVuZChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcikge1xuICByZXR1cm4gY29kZSA9PSAkU1RBUiAmJiBuZXh0ID09ICRTTEFTSDtcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmdTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICB2YXIgdGFyZ2V0ID0gY29kZTtcbiAgaWYgKHRhcmdldCA9PSAkQkFDS1NMQVNIKSB7XG4gICAgdGFyZ2V0ID0gbmV4dDtcbiAgfVxuICByZXR1cm4gdGFyZ2V0ID09ICREUSB8fCB0YXJnZXQgPT0gJFNRO1xufVxuXG5mdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICB2YXIgdGFyZ2V0ID0gY29kZTtcbiAgaWYgKHRhcmdldCA9PSAkTUlOVVMpIHtcbiAgICB0YXJnZXQgPSBuZXh0O1xuICB9XG5cbiAgcmV0dXJuICgkYSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICR6KSB8fCAoJEEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkWikgfHwgdGFyZ2V0ID09ICRCQUNLU0xBU0ggfHxcbiAgICAgICAgIHRhcmdldCA9PSAkTUlOVVMgfHwgdGFyZ2V0ID09ICRfO1xufVxuXG5mdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KHRhcmdldDogbnVtYmVyKSB7XG4gIHJldHVybiAoJGEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkeikgfHwgKCRBIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJFopIHx8IHRhcmdldCA9PSAkQkFDS1NMQVNIIHx8XG4gICAgICAgICB0YXJnZXQgPT0gJE1JTlVTIHx8IHRhcmdldCA9PSAkXyB8fCBpc0RpZ2l0KHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRQc2V1ZG9TZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgLy8gdmFsdWVeKnwkfj1zb21ldGhpbmdcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkJDpcbiAgICBjYXNlICRQSVBFOlxuICAgIGNhc2UgJENBUkVUOlxuICAgIGNhc2UgJFRJTERBOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkRVE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgLy8gc2VsZWN0b3IgWyBrZXkgICA9IHZhbHVlIF1cbiAgLy8gSURFTlQgICAgQyBJREVOVCBDIElERU5UIENcbiAgLy8gI2lkLCAuY2xhc3MsICorfj5cbiAgLy8gdGFnOlBTRVVET1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRUSUxEQTpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgY2FzZSAkR1Q6XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUElQRTpcbiAgICBjYXNlICRDT01NQTpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyBrZXk6dmFsdWU7XG4gIC8vIGtleTpjYWxjKHNvbWV0aGluZyAuLi4gKVxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJFNFTUlDT0xPTjpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQRVJDRU5UOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJEJBQ0tTTEFTSDpcbiAgICBjYXNlICRCQU5HOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyAobWluLXdpZHRoOiA3LjVlbSkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKVxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZEF0UnVsZUNoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgLy8gQGRvY3VtZW50IHVybChodHRwOi8vd3d3LnczLm9yZy9wYWdlP3NvbWV0aGluZz1vbiNoYXNoKSxcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQRVJDRU5UOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRCQUNLU0xBU0g6XG4gICAgY2FzZSAkSEFTSDpcbiAgICBjYXNlICRFUTpcbiAgICBjYXNlICRRVUVTVElPTjpcbiAgICBjYXNlICRBTVBFUlNBTkQ6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRDT01NQTpcbiAgICBjYXNlICRNSU5VUzpcbiAgICBjYXNlICRQTFVTOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJE1JTlVTOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZEJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyBAc29tZXRoaW5nIHsgfVxuICAvLyBJREVOVFxuICByZXR1cm4gY29kZSA9PSAkQVQ7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRDc3NDaGFyYWN0ZXIoY29kZTogbnVtYmVyLCBtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTF9UUkFDS19XUzpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZFNlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuUFNFVURPX1NFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRQc2V1ZG9TZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkQXR0cmlidXRlU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5NRURJQV9RVUVSWTpcbiAgICAgIHJldHVybiBpc1ZhbGlkTWVkaWFRdWVyeVJ1bGVDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5BVF9SVUxFX1FVRVJZOlxuICAgICAgcmV0dXJuIGlzVmFsaWRBdFJ1bGVDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5LRVlGUkFNRV9CTE9DSzpcbiAgICAgIHJldHVybiBpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfQ0FMQ19GVU5DVElPTjpcbiAgICAgIHJldHVybiBpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkJMT0NLOlxuICAgICAgcmV0dXJuIGlzVmFsaWRCbG9ja0NoYXJhY3Rlcihjb2RlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNoYXJDb2RlKGlucHV0LCBpbmRleCk6IG51bWJlciB7XG4gIHJldHVybiBpbmRleCA+PSBpbnB1dC5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGlucHV0LCBpbmRleCk7XG59XG5cbmZ1bmN0aW9uIGNoYXJTdHIoY29kZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKGNvZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOZXdsaW5lKGNvZGUpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkRkY6XG4gICAgY2FzZSAkQ1I6XG4gICAgY2FzZSAkTEY6XG4gICAgY2FzZSAkVlRBQjpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4iXX0=