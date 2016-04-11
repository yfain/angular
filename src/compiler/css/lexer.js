'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var chars_1 = require('angular2/src/compiler/chars');
var chars_2 = require('angular2/src/compiler/chars');
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
    var pointerPadding = '';
    for (var i = 0; i < column; i++) {
        pointerPadding += ' ';
    }
    var pointerString = '';
    for (var i = 0; i < errorValue.length; i++) {
        pointerString += '^';
    }
    return choppedString + '\n' + pointerPadding + pointerString + '\n';
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
            next = new CssToken(0, 0, 0, CssTokenType.EOF, 'end of file');
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
            var errorMessage = lang_1.resolveEnumToken(CssTokenType, next.type) + ' does not match expected ' +
                lang_1.resolveEnumToken(CssTokenType, type) + ' value';
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
        if (this.assertCondition(isCommentStart(this.peek, this.peekPeek), 'Expected comment start value')) {
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
        if (this.assertCondition(isStringStart(this.peek, this.peekPeek), 'Unexpected non-string starting value')) {
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
        if (this.assertCondition(this.peek == target, 'Unterminated quote')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVYzdjBWSkZILnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbIkNzc1Rva2VuVHlwZSIsIkNzc0xleGVyTW9kZSIsIkxleGVkQ3NzUmVzdWx0IiwiTGV4ZWRDc3NSZXN1bHQuY29uc3RydWN0b3IiLCJnZW5lcmF0ZUVycm9yTWVzc2FnZSIsImZpbmRQcm9ibGVtQ29kZSIsIkNzc1Rva2VuIiwiQ3NzVG9rZW4uY29uc3RydWN0b3IiLCJDc3NMZXhlciIsIkNzc0xleGVyLmNvbnN0cnVjdG9yIiwiQ3NzTGV4ZXIuc2NhbiIsIkNzc1NjYW5uZXJFcnJvciIsIkNzc1NjYW5uZXJFcnJvci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXJFcnJvci50b1N0cmluZyIsIl90cmFja1doaXRlc3BhY2UiLCJDc3NTY2FubmVyIiwiQ3NzU2Nhbm5lci5jb25zdHJ1Y3RvciIsIkNzc1NjYW5uZXIuZ2V0TW9kZSIsIkNzc1NjYW5uZXIuc2V0TW9kZSIsIkNzc1NjYW5uZXIuYWR2YW5jZSIsIkNzc1NjYW5uZXIucGVla0F0IiwiQ3NzU2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzIiwiQ3NzU2Nhbm5lci5jb25zdW1lV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuY29uc3VtZSIsIkNzc1NjYW5uZXIuc2NhbiIsIkNzc1NjYW5uZXIuX3NjYW4iLCJDc3NTY2FubmVyLnNjYW5Db21tZW50IiwiQ3NzU2Nhbm5lci5zY2FuV2hpdGVzcGFjZSIsIkNzc1NjYW5uZXIuc2NhblN0cmluZyIsIkNzc1NjYW5uZXIuc2Nhbk51bWJlciIsIkNzc1NjYW5uZXIuc2NhbklkZW50aWZpZXIiLCJDc3NTY2FubmVyLnNjYW5Dc3NWYWx1ZUZ1bmN0aW9uIiwiQ3NzU2Nhbm5lci5zY2FuQ2hhcmFjdGVyIiwiQ3NzU2Nhbm5lci5zY2FuQXRFeHByZXNzaW9uIiwiQ3NzU2Nhbm5lci5hc3NlcnRDb25kaXRpb24iLCJDc3NTY2FubmVyLmVycm9yIiwiaXNBdEtleXdvcmQiLCJpc0NoYXJNYXRjaCIsImlzRGlnaXQiLCJpc0NvbW1lbnRTdGFydCIsImlzQ29tbWVudEVuZCIsImlzU3RyaW5nU3RhcnQiLCJpc0lkZW50aWZpZXJTdGFydCIsImlzSWRlbnRpZmllclBhcnQiLCJpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTZWxlY3RvckNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyIiwiaXNWYWxpZEF0UnVsZUNoYXJhY3RlciIsImlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyIiwiaXNWYWxpZEJsb2NrQ2hhcmFjdGVyIiwiaXNWYWxpZENzc0NoYXJhY3RlciIsImNoYXJDb2RlIiwiY2hhclN0ciIsImlzTmV3bGluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBd0UsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRywyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU3RCxzQkFBK1QsNkJBQTZCLENBQUMsQ0FBQTtBQUU3VixzQkFBNEgsNkJBQTZCLENBQUM7QUFBbEosNEJBQUk7QUFBRSwwQkFBRztBQUFFLGtDQUFPO0FBQUUsa0NBQU87QUFBRSxzQ0FBUztBQUFFLHNDQUFTO0FBQUUsa0NBQU87QUFBRSxrQ0FBTztBQUFFLGdDQUFNO0FBQUUsZ0NBQU07QUFBRSx3Q0FBVTtBQUFFLDRDQUFpRDtBQUUxSixXQUFZLFlBQVk7SUFDdEJBLDZDQUFHQSxDQUFBQTtJQUNIQSxtREFBTUEsQ0FBQUE7SUFDTkEscURBQU9BLENBQUFBO0lBQ1BBLDJEQUFVQSxDQUFBQTtJQUNWQSxtREFBTUEsQ0FBQUE7SUFDTkEsMkVB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O0FBRUQsbUJBQTBCLElBQUk7SUFDNUJDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLFdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLGFBQUtBO1lBQ1JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRWRBO1lBQ0VBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIQSxDQUFDQTtBQVhlLGlCQUFTLFlBV3hCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge051bWJlcldyYXBwZXIsIFN0cmluZ1dyYXBwZXIsIGlzUHJlc2VudCwgcmVzb2x2ZUVudW1Ub2tlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtpc1doaXRlc3BhY2UsICRFT0YsICRIQVNILCAkVElMREEsICRDQVJFVCwgJFBFUkNFTlQsICQkLCAkXywgJENPTE9OLCAkU1EsICREUSwgJEVRLCAkU0xBU0gsICRCQUNLU0xBU0gsICRQRVJJT0QsICRTVEFSLCAkUExVUywgJExQQVJFTiwgJFJQQVJFTiwgJExCUkFDRSwgJFJCUkFDRSwgJExCUkFDS0VULCAkUkJSQUNLRVQsICRQSVBFLCAkQ09NTUEsICRTRU1JQ09MT04sICRNSU5VUywgJEJBTkcsICRRVUVTVElPTiwgJEFULCAkQU1QRVJTQU5ELCAkR1QsICRhLCAkQSwgJHosICRaLCAkMCwgJDksICRGRiwgJENSLCAkTEYsICRWVEFCfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvY2hhcnMnO1xuXG5leHBvcnQgeyRFT0YsICRBVCwgJFJCUkFDRSwgJExCUkFDRSwgJExCUkFDS0VULCAkUkJSQUNLRVQsICRMUEFSRU4sICRSUEFSRU4sICRDT01NQSwgJENPTE9OLCAkU0VNSUNPTE9OLCBpc1doaXRlc3BhY2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9jaGFycyc7XG5cbmV4cG9ydCBlbnVtIENzc1Rva2VuVHlwZSB7XG4gIEVPRixcbiAgU3RyaW5nLFxuICBDb21tZW50LFxuICBJZGVudGlmaWVyLFxuICBOdW1iZXIsXG4gIElkZW50aWZpZXJPck51bWJlcixcbiAgQXRLZXl3b3JkLFxuICBDaGFyYWN0ZXIsXG4gIFdoaXRlc3BhY2UsXG4gIEludmFsaWRcbn1cblxuZXhwb3J0IGVudW0gQ3NzTGV4ZXJNb2RlIHtcbiAgQUxMLFxuICBBTExfVFJBQ0tfV1MsXG4gIFNFTEVDVE9SLFxuICBQU0VVRE9fU0VMRUNUT1IsXG4gIEFUVFJJQlVURV9TRUxFQ1RPUixcbiAgQVRfUlVMRV9RVUVSWSxcbiAgTUVESUFfUVVFUlksXG4gIEJMT0NLLFxuICBLRVlGUkFNRV9CTE9DSyxcbiAgU1RZTEVfQkxPQ0ssXG4gIFNUWUxFX1ZBTFVFLFxuICBTVFlMRV9WQUxVRV9GVU5DVElPTixcbiAgU1RZTEVfQ0FMQ19GVU5DVElPTlxufVxuXG5leHBvcnQgY2xhc3MgTGV4ZWRDc3NSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3I6IENzc1NjYW5uZXJFcnJvciwgcHVibGljIHRva2VuOiBDc3NUb2tlbikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlRXJyb3JNZXNzYWdlKFxuICAgIGlucHV0OiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgZXJyb3JWYWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCByb3c6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgJHttZXNzYWdlfSBhdCBjb2x1bW4gJHtyb3d9OiR7Y29sdW1ufSBpbiBleHByZXNzaW9uIFtgICtcbiAgICAgIGZpbmRQcm9ibGVtQ29kZShpbnB1dCwgZXJyb3JWYWx1ZSwgaW5kZXgsIGNvbHVtbikgKyAnXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUHJvYmxlbUNvZGUoXG4gICAgaW5wdXQ6IHN0cmluZywgZXJyb3JWYWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCBjb2x1bW46IG51bWJlcik6IHN0cmluZyB7XG4gIHZhciBlbmRPZlByb2JsZW1MaW5lID0gaW5kZXg7XG4gIHZhciBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsIGluZGV4KTtcbiAgd2hpbGUgKGN1cnJlbnQgPiAwICYmICFpc05ld2xpbmUoY3VycmVudCkpIHtcbiAgICBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsICsrZW5kT2ZQcm9ibGVtTGluZSk7XG4gIH1cbiAgdmFyIGNob3BwZWRTdHJpbmcgPSBpbnB1dC5zdWJzdHJpbmcoMCwgZW5kT2ZQcm9ibGVtTGluZSk7XG4gIHZhciBwb2ludGVyUGFkZGluZyA9ICcnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbjsgaSsrKSB7XG4gICAgcG9pbnRlclBhZGRpbmcgKz0gJyAnO1xuICB9XG4gIHZhciBwb2ludGVyU3RyaW5nID0gJyc7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIHBvaW50ZXJTdHJpbmcgKz0gJ14nO1xuICB9XG4gIHJldHVybiBjaG9wcGVkU3RyaW5nICsgJ1xcbicgKyBwb2ludGVyUGFkZGluZyArIHBvaW50ZXJTdHJpbmcgKyAnXFxuJztcbn1cblxuZXhwb3J0IGNsYXNzIENzc1Rva2VuIHtcbiAgbnVtVmFsdWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGNvbHVtbjogbnVtYmVyLCBwdWJsaWMgbGluZTogbnVtYmVyLCBwdWJsaWMgdHlwZTogQ3NzVG9rZW5UeXBlLFxuICAgICAgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLm51bVZhbHVlID0gY2hhckNvZGUoc3RyVmFsdWUsIDApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NMZXhlciB7XG4gIHNjYW4odGV4dDogc3RyaW5nLCB0cmFja0NvbW1lbnRzOiBib29sZWFuID0gZmFsc2UpOiBDc3NTY2FubmVyIHtcbiAgICByZXR1cm4gbmV3IENzc1NjYW5uZXIodGV4dCwgdHJhY2tDb21tZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NjYW5uZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBwdWJsaWMgcmF3TWVzc2FnZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbjogQ3NzVG9rZW4sIG1lc3NhZ2UpIHtcbiAgICBzdXBlcignQ3NzIFBhcnNlIEVycm9yOiAnICsgbWVzc2FnZSk7XG4gICAgdGhpcy5yYXdNZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuZnVuY3Rpb24gX3RyYWNrV2hpdGVzcGFjZShtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU0VMRUNUT1I6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMX1RSQUNLX1dTOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTY2FubmVyIHtcbiAgcGVlazogbnVtYmVyO1xuICBwZWVrUGVlazogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlciA9IDA7XG4gIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgY29sdW1uOiBudW1iZXIgPSAtMTtcbiAgbGluZTogbnVtYmVyID0gMDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9jdXJyZW50TW9kZTogQ3NzTGV4ZXJNb2RlID0gQ3NzTGV4ZXJNb2RlLkJMT0NLO1xuICAvKiogQGludGVybmFsICovXG4gIF9jdXJyZW50RXJyb3I6IENzc1NjYW5uZXJFcnJvciA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGlucHV0OiBzdHJpbmcsIHByaXZhdGUgX3RyYWNrQ29tbWVudHM6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5pbnB1dC5sZW5ndGg7XG4gICAgdGhpcy5wZWVrUGVlayA9IHRoaXMucGVla0F0KDApO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICB9XG5cbiAgZ2V0TW9kZSgpOiBDc3NMZXhlck1vZGUgeyByZXR1cm4gdGhpcy5fY3VycmVudE1vZGU7IH1cblxuICBzZXRNb2RlKG1vZGU6IENzc0xleGVyTW9kZSkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZSAhPSBtb2RlKSB7XG4gICAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudE1vZGUgPSBtb2RlO1xuICAgIH1cbiAgfVxuXG4gIGFkdmFuY2UoKTogdm9pZCB7XG4gICAgaWYgKGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmNvbHVtbiA9IDA7XG4gICAgICB0aGlzLmxpbmUrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW4rKztcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4Kys7XG4gICAgdGhpcy5wZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICB0aGlzLnBlZWtQZWVrID0gdGhpcy5wZWVrQXQodGhpcy5pbmRleCArIDEpO1xuICB9XG5cbiAgcGVla0F0KGluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBpbmRleCA+PSB0aGlzLmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQodGhpcy5pbnB1dCwgaW5kZXgpO1xuICB9XG5cbiAgY29uc3VtZUVtcHR5U3RhdGVtZW50cygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgd2hpbGUgKHRoaXMucGVlayA9PSAkU0VNSUNPTE9OKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdW1lV2hpdGVzcGFjZSgpOiB2b2lkIHtcbiAgICB3aGlsZSAoaXNXaGl0ZXNwYWNlKHRoaXMucGVlaykgfHwgaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgaWYgKCF0aGlzLl90cmFja0NvbW1lbnRzICYmIGlzQ29tbWVudFN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgICAgICB3aGlsZSAoIWlzQ29tbWVudEVuZCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yKCdVbnRlcm1pbmF0ZWQgY29tbWVudCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZSh0eXBlOiBDc3NUb2tlblR5cGUsIHZhbHVlOiBzdHJpbmcgPSBudWxsKTogTGV4ZWRDc3NSZXN1bHQge1xuICAgIHZhciBtb2RlID0gdGhpcy5fY3VycmVudE1vZGU7XG4gICAgdGhpcy5zZXRNb2RlKENzc0xleGVyTW9kZS5BTEwpO1xuXG4gICAgdmFyIHByZXZpb3VzSW5kZXggPSB0aGlzLmluZGV4O1xuICAgIHZhciBwcmV2aW91c0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgdmFyIHByZXZpb3VzQ29sdW1uID0gdGhpcy5jb2x1bW47XG5cbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5zY2FuKCk7XG5cbiAgICAvLyBqdXN0IGluY2FzZSB0aGUgaW5uZXIgc2NhbiBtZXRob2QgcmV0dXJuZWQgYW4gZXJyb3JcbiAgICBpZiAoaXNQcmVzZW50KG91dHB1dC5lcnJvcikpIHtcbiAgICAgIHRoaXMuc2V0TW9kZShtb2RlKTtcbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgdmFyIG5leHQgPSBvdXRwdXQudG9rZW47XG4gICAgaWYgKCFpc1ByZXNlbnQobmV4dCkpIHtcbiAgICAgIG5leHQgPSBuZXcgQ3NzVG9rZW4oMCwgMCwgMCwgQ3NzVG9rZW5UeXBlLkVPRiwgJ2VuZCBvZiBmaWxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGlzTWF0Y2hpbmdUeXBlO1xuICAgIGlmICh0eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyT3JOdW1iZXIpIHtcbiAgICAgIC8vIFRPRE8gKG1hdHNrbyk6IGltcGxlbWVudCBhcnJheSB0cmF2ZXJzYWwgZm9yIGxvb2t1cCBoZXJlXG4gICAgICBpc01hdGNoaW5nVHlwZSA9IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuTnVtYmVyIHx8IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllcjtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNNYXRjaGluZ1R5cGUgPSBuZXh0LnR5cGUgPT0gdHlwZTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmUgdGhyb3dpbmcgdGhlIGVycm9yIHdlIG5lZWQgdG8gYnJpbmcgYmFjayB0aGUgZm9ybWVyXG4gICAgLy8gbW9kZSBzbyB0aGF0IHRoZSBwYXJzZXIgY2FuIHJlY292ZXIuLi5cbiAgICB0aGlzLnNldE1vZGUobW9kZSk7XG5cbiAgICB2YXIgZXJyb3IgPSBudWxsO1xuICAgIGlmICghaXNNYXRjaGluZ1R5cGUgfHwgKGlzUHJlc2VudCh2YWx1ZSkgJiYgdmFsdWUgIT0gbmV4dC5zdHJWYWx1ZSkpIHtcbiAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSByZXNvbHZlRW51bVRva2VuKENzc1Rva2VuVHlwZSwgbmV4dC50eXBlKSArICcgZG9lcyBub3QgbWF0Y2ggZXhwZWN0ZWQgJyArXG4gICAgICAgICAgcmVzb2x2ZUVudW1Ub2tlbihDc3NUb2tlblR5cGUsIHR5cGUpICsgJyB2YWx1ZSc7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQodmFsdWUpKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSArPSAnIChcIicgKyBuZXh0LnN0clZhbHVlICsgJ1wiIHNob3VsZCBtYXRjaCBcIicgKyB2YWx1ZSArICdcIiknO1xuICAgICAgfVxuXG4gICAgICBlcnJvciA9IG5ldyBDc3NTY2FubmVyRXJyb3IoXG4gICAgICAgICAgbmV4dCwgZ2VuZXJhdGVFcnJvck1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQsIGVycm9yTWVzc2FnZSwgbmV4dC5zdHJWYWx1ZSwgcHJldmlvdXNJbmRleCwgcHJldmlvdXNMaW5lLFxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NvbHVtbikpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTGV4ZWRDc3NSZXN1bHQoZXJyb3IsIG5leHQpO1xuICB9XG5cblxuICBzY2FuKCk6IExleGVkQ3NzUmVzdWx0IHtcbiAgICB2YXIgdHJhY2tXUyA9IF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpO1xuICAgIGlmICh0aGlzLmluZGV4ID09IDAgJiYgIXRyYWNrV1MpIHsgIC8vIGZpcnN0IHNjYW5cbiAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG4gICAgaWYgKHRva2VuID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGVycm9yID0gdGhpcy5fY3VycmVudEVycm9yO1xuICAgIHRoaXMuX2N1cnJlbnRFcnJvciA9IG51bGw7XG5cbiAgICBpZiAoIXRyYWNrV1MpIHtcbiAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBMZXhlZENzc1Jlc3VsdChlcnJvciwgdG9rZW4pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2NhbigpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHBlZWsgPSB0aGlzLnBlZWs7XG4gICAgdmFyIHBlZWtQZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICBpZiAocGVlayA9PSAkRU9GKSByZXR1cm4gbnVsbDtcblxuICAgIGlmIChpc0NvbW1lbnRTdGFydChwZWVrLCBwZWVrUGVlaykpIHtcbiAgICAgIC8vIGV2ZW4gaWYgY29tbWVudHMgYXJlIG5vdCB0cmFja2VkIHdlIHN0aWxsIGxleCB0aGVcbiAgICAgIC8vIGNvbW1lbnQgc28gd2UgY2FuIG1vdmUgdGhlIHBvaW50ZXIgZm9yd2FyZFxuICAgICAgdmFyIGNvbW1lbnRUb2tlbiA9IHRoaXMuc2NhbkNvbW1lbnQoKTtcbiAgICAgIGlmICh0aGlzLl90cmFja0NvbW1lbnRzKSB7XG4gICAgICAgIHJldHVybiBjb21tZW50VG9rZW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpICYmIChpc1doaXRlc3BhY2UocGVlaykgfHwgaXNOZXdsaW5lKHBlZWspKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbldoaXRlc3BhY2UoKTtcbiAgICB9XG5cbiAgICBwZWVrID0gdGhpcy5wZWVrO1xuICAgIHBlZWtQZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICBpZiAocGVlayA9PSAkRU9GKSByZXR1cm4gbnVsbDtcblxuICAgIGlmIChpc1N0cmluZ1N0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhblN0cmluZygpO1xuICAgIH1cblxuICAgIC8vIHNvbWV0aGluZyBsaWtlIHVybChjb29sKVxuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZSA9PSBDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUVfRlVOQ1RJT04pIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5Dc3NWYWx1ZUZ1bmN0aW9uKCk7XG4gICAgfVxuXG4gICAgdmFyIGlzTW9kaWZpZXIgPSBwZWVrID09ICRQTFVTIHx8IHBlZWsgPT0gJE1JTlVTO1xuICAgIHZhciBkaWdpdEEgPSBpc01vZGlmaWVyID8gZmFsc2UgOiBpc0RpZ2l0KHBlZWspO1xuICAgIHZhciBkaWdpdEIgPSBpc0RpZ2l0KHBlZWtQZWVrKTtcbiAgICBpZiAoZGlnaXRBIHx8IChpc01vZGlmaWVyICYmIChwZWVrUGVlayA9PSAkUEVSSU9EIHx8IGRpZ2l0QikpIHx8IChwZWVrID09ICRQRVJJT0QgJiYgZGlnaXRCKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2Nhbk51bWJlcigpO1xuICAgIH1cblxuICAgIGlmIChwZWVrID09ICRBVCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkF0RXhwcmVzc2lvbigpO1xuICAgIH1cblxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChwZWVrLCBwZWVrUGVlaykpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5JZGVudGlmaWVyKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzVmFsaWRDc3NDaGFyYWN0ZXIocGVlaywgdGhpcy5fY3VycmVudE1vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQ2hhcmFjdGVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFske1N0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHBlZWspfV1gKTtcbiAgfVxuXG4gIHNjYW5Db21tZW50KCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oXG4gICAgICAgICAgICBpc0NvbW1lbnRTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCAnRXhwZWN0ZWQgY29tbWVudCBzdGFydCB2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG5cbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcblxuICAgIHdoaWxlICghaXNDb21tZW50RW5kKHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsgPT0gJEVPRikge1xuICAgICAgICB0aGlzLmVycm9yKCdVbnRlcm1pbmF0ZWQgY29tbWVudCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG5cbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCBzdGFydGluZ0xpbmUsIENzc1Rva2VuVHlwZS5Db21tZW50LCBzdHIpO1xuICB9XG5cbiAgc2NhbldoaXRlc3BhY2UoKTogQ3NzVG9rZW4ge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcbiAgICB3aGlsZSAoaXNXaGl0ZXNwYWNlKHRoaXMucGVlaykgJiYgdGhpcy5wZWVrICE9ICRFT0YpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCBzdGFydGluZ0xpbmUsIENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlLCBzdHIpO1xuICB9XG5cbiAgc2NhblN0cmluZygpOiBDc3NUb2tlbiB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKFxuICAgICAgICAgICAgaXNTdHJpbmdTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCAnVW5leHBlY3RlZCBub24tc3RyaW5nIHN0YXJ0aW5nIHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB0YXJnZXQgPSB0aGlzLnBlZWs7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuICAgIHZhciBwcmV2aW91cyA9IHRhcmdldDtcbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHdoaWxlICghaXNDaGFyTWF0Y2godGFyZ2V0LCBwcmV2aW91cywgdGhpcy5wZWVrKSkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GIHx8IGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBxdW90ZScpO1xuICAgICAgfVxuICAgICAgcHJldmlvdXMgPSB0aGlzLnBlZWs7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24odGhpcy5wZWVrID09IHRhcmdldCwgJ1VudGVybWluYXRlZCBxdW90ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5hZHZhbmNlKCk7XG5cbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCBzdGFydGluZ0xpbmUsIENzc1Rva2VuVHlwZS5TdHJpbmcsIHN0cik7XG4gIH1cblxuICBzY2FuTnVtYmVyKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLnBlZWsgPT0gJFBMVVMgfHwgdGhpcy5wZWVrID09ICRNSU5VUykge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBwZXJpb2RVc2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKGlzRGlnaXQodGhpcy5wZWVrKSB8fCB0aGlzLnBlZWsgPT0gJFBFUklPRCkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkUEVSSU9EKSB7XG4gICAgICAgIGlmIChwZXJpb2RVc2VkKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcignVW5leHBlY3RlZCB1c2Ugb2YgYSBzZWNvbmQgcGVyaW9kIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGVyaW9kVXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5OdW1iZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5JZGVudGlmaWVyKCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oXG4gICAgICAgICAgICBpc0lkZW50aWZpZXJTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCAnRXhwZWN0ZWQgaWRlbnRpZmllciBzdGFydGluZyB2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHdoaWxlIChpc0lkZW50aWZpZXJQYXJ0KHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyVmFsdWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5Dc3NWYWx1ZUZ1bmN0aW9uKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT0gJEVPRiAmJiB0aGlzLnBlZWsgIT0gJFJQQVJFTikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllciwgc3RyVmFsdWUpO1xuICB9XG5cbiAgc2NhbkNoYXJhY3RlcigpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oXG4gICAgICAgICAgICBpc1ZhbGlkQ3NzQ2hhcmFjdGVyKHRoaXMucGVlaywgdGhpcy5fY3VycmVudE1vZGUpLFxuICAgICAgICAgICAgY2hhclN0cih0aGlzLnBlZWspICsgJyBpcyBub3QgYSB2YWxpZCBDU1MgY2hhcmFjdGVyJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHN0YXJ0ICsgMSk7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG5cbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCBjKTtcbiAgfVxuXG4gIHNjYW5BdEV4cHJlc3Npb24oKTogQ3NzVG9rZW4ge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbih0aGlzLnBlZWsgPT0gJEFULCAnRXhwZWN0ZWQgQCB2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICB2YXIgaWRlbnQgPSB0aGlzLnNjYW5JZGVudGlmaWVyKCk7XG4gICAgICB2YXIgc3RyVmFsdWUgPSAnQCcgKyBpZGVudC5zdHJWYWx1ZTtcbiAgICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5BdEtleXdvcmQsIHN0clZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNoYXJhY3RlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydENvbmRpdGlvbihzdGF0dXM6IGJvb2xlYW4sIGVycm9yTWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIHRoaXMuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGVycm9yVG9rZW5WYWx1ZTogc3RyaW5nID0gbnVsbCwgZG9Ob3RBZHZhbmNlOiBib29sZWFuID0gZmFsc2UpOiBDc3NUb2tlbiB7XG4gICAgdmFyIGluZGV4OiBudW1iZXIgPSB0aGlzLmluZGV4O1xuICAgIHZhciBjb2x1bW46IG51bWJlciA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBsaW5lOiBudW1iZXIgPSB0aGlzLmxpbmU7XG4gICAgZXJyb3JUb2tlblZhbHVlID1cbiAgICAgICAgaXNQcmVzZW50KGVycm9yVG9rZW5WYWx1ZSkgPyBlcnJvclRva2VuVmFsdWUgOiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZSh0aGlzLnBlZWspO1xuICAgIHZhciBpbnZhbGlkVG9rZW4gPSBuZXcgQ3NzVG9rZW4oaW5kZXgsIGNvbHVtbiwgbGluZSwgQ3NzVG9rZW5UeXBlLkludmFsaWQsIGVycm9yVG9rZW5WYWx1ZSk7XG4gICAgdmFyIGVycm9yTWVzc2FnZSA9XG4gICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKHRoaXMuaW5wdXQsIG1lc3NhZ2UsIGVycm9yVG9rZW5WYWx1ZSwgaW5kZXgsIGxpbmUsIGNvbHVtbik7XG4gICAgaWYgKCFkb05vdEFkdmFuY2UpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50RXJyb3IgPSBuZXcgQ3NzU2Nhbm5lckVycm9yKGludmFsaWRUb2tlbiwgZXJyb3JNZXNzYWdlKTtcbiAgICByZXR1cm4gaW52YWxpZFRva2VuO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXRLZXl3b3JkKGN1cnJlbnQ6IENzc1Rva2VuLCBuZXh0OiBDc3NUb2tlbik6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudC5udW1WYWx1ZSA9PSAkQVQgJiYgbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyO1xufVxuXG5mdW5jdGlvbiBpc0NoYXJNYXRjaCh0YXJnZXQ6IG51bWJlciwgcHJldmlvdXM6IG51bWJlciwgY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09IHRhcmdldCAmJiBwcmV2aW91cyAhPSAkQkFDS1NMQVNIO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gJDAgPD0gY29kZSAmJiBjb2RlIDw9ICQ5O1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnRTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU0xBU0ggJiYgbmV4dCA9PSAkU1RBUjtcbn1cblxuZnVuY3Rpb24gaXNDb21tZW50RW5kKGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRTVEFSICYmIG5leHQgPT0gJFNMQVNIO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZ1N0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHZhciB0YXJnZXQgPSBjb2RlO1xuICBpZiAodGFyZ2V0ID09ICRCQUNLU0xBU0gpIHtcbiAgICB0YXJnZXQgPSBuZXh0O1xuICB9XG4gIHJldHVybiB0YXJnZXQgPT0gJERRIHx8IHRhcmdldCA9PSAkU1E7XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHZhciB0YXJnZXQgPSBjb2RlO1xuICBpZiAodGFyZ2V0ID09ICRNSU5VUykge1xuICAgIHRhcmdldCA9IG5leHQ7XG4gIH1cblxuICByZXR1cm4gKCRhIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJHopIHx8ICgkQSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICRaKSB8fCB0YXJnZXQgPT0gJEJBQ0tTTEFTSCB8fFxuICAgICAgdGFyZ2V0ID09ICRNSU5VUyB8fCB0YXJnZXQgPT0gJF87XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQodGFyZ2V0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICgkYSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICR6KSB8fCAoJEEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkWikgfHwgdGFyZ2V0ID09ICRCQUNLU0xBU0ggfHxcbiAgICAgIHRhcmdldCA9PSAkTUlOVVMgfHwgdGFyZ2V0ID09ICRfIHx8IGlzRGlnaXQodGFyZ2V0KTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFBFUkNFTlQ7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gdmFsdWVeKnwkfj1zb21ldGhpbmdcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkJDpcbiAgICBjYXNlICRQSVBFOlxuICAgIGNhc2UgJENBUkVUOlxuICAgIGNhc2UgJFRJTERBOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkRVE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTZWxlY3RvckNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gc2VsZWN0b3IgWyBrZXkgICA9IHZhbHVlIF1cbiAgLy8gSURFTlQgICAgQyBJREVOVCBDIElERU5UIENcbiAgLy8gI2lkLCAuY2xhc3MsICorfj5cbiAgLy8gdGFnOlBTRVVET1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRUSUxEQTpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgY2FzZSAkR1Q6XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUElQRTpcbiAgICBjYXNlICRDT01NQTpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0eWxlQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIGtleTp2YWx1ZTtcbiAgLy8ga2V5OmNhbGMoc29tZXRoaW5nIC4uLiApXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkU0xBU0g6XG4gICAgY2FzZSAkQkFDS1NMQVNIOlxuICAgIGNhc2UgJEJBTkc6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRNZWRpYVF1ZXJ5UnVsZUNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gKG1pbi13aWR0aDogNy41ZW0pIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSlcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQRVJDRU5UOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZEF0UnVsZUNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gQGRvY3VtZW50IHVybChodHRwOi8vd3d3LnczLm9yZy9wYWdlP3NvbWV0aGluZz1vbiNoYXNoKSxcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQRVJDRU5UOlxuICAgIGNhc2UgJFBFUklPRDpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRCQUNLU0xBU0g6XG4gICAgY2FzZSAkSEFTSDpcbiAgICBjYXNlICRFUTpcbiAgICBjYXNlICRRVUVTVElPTjpcbiAgICBjYXNlICRBTVBFUlNBTkQ6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRDT01NQTpcbiAgICBjYXNlICRNSU5VUzpcbiAgICBjYXNlICRQTFVTOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJE1JTlVTOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIEBzb21ldGhpbmcgeyB9XG4gIC8vIElERU5UXG4gIHJldHVybiBjb2RlID09ICRBVDtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZENzc0NoYXJhY3Rlcihjb2RlOiBudW1iZXIsIG1vZGU6IENzc0xleGVyTW9kZSk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIENzc0xleGVyTW9kZS5BTEw6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMX1RSQUNLX1dTOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLk1FRElBX1FVRVJZOlxuICAgICAgcmV0dXJuIGlzVmFsaWRNZWRpYVF1ZXJ5UnVsZUNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFUX1JVTEVfUVVFUlk6XG4gICAgICByZXR1cm4gaXNWYWxpZEF0UnVsZUNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLktFWUZSQU1FX0JMT0NLOlxuICAgICAgcmV0dXJuIGlzVmFsaWRLZXlmcmFtZUJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0s6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUU6XG4gICAgICByZXR1cm4gaXNWYWxpZFN0eWxlQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9DQUxDX0ZVTkNUSU9OOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQkxPQ0s6XG4gICAgICByZXR1cm4gaXNWYWxpZEJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFyQ29kZShpbnB1dCwgaW5kZXgpOiBudW1iZXIge1xuICByZXR1cm4gaW5kZXggPj0gaW5wdXQubGVuZ3RoID8gJEVPRiA6IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdChpbnB1dCwgaW5kZXgpO1xufVxuXG5mdW5jdGlvbiBjaGFyU3RyKGNvZGU6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjb2RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmV3bGluZShjb2RlKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEZGOlxuICAgIGNhc2UgJENSOlxuICAgIGNhc2UgJExGOlxuICAgIGNhc2UgJFZUQUI6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==