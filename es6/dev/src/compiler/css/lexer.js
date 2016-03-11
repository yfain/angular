import { StringWrapper, isPresent } from "angular2/src/facade/lang";
import { BaseException } from 'angular2/src/facade/exceptions';
import { isWhitespace, $EOF, $HASH, $TILDA, $CARET, $PERCENT, $$, $_, $COLON, $SQ, $DQ, $EQ, $SLASH, $BACKSLASH, $PERIOD, $STAR, $PLUS, $LPAREN, $RPAREN, $PIPE, $COMMA, $SEMICOLON, $MINUS, $BANG, $QUESTION, $AT, $AMPERSAND, $GT, $a, $A, $z, $Z, $0, $9, $FF, $CR, $LF, $VTAB } from "angular2/src/compiler/chars";
export { $EOF, $AT, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isWhitespace } from "angular2/src/compiler/chars";
export var CssTokenType;
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
})(CssTokenType || (CssTokenType = {}));
export var CssLexerMode;
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
})(CssLexerMode || (CssLexerMode = {}));
export class LexedCssResult {
    constructor(error, token) {
        this.error = error;
        this.token = token;
    }
}
export function generateErrorMessage(input, message, errorValue, index, row, column) {
    return `${message} at column ${row}:${column} in expression [` +
        findProblemCode(input, errorValue, index, column) + ']';
}
export function findProblemCode(input, errorValue, index, column) {
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
export class CssToken {
    constructor(index, column, line, type, strValue) {
        this.index = index;
        this.column = column;
        this.line = line;
        this.type = type;
        this.strValue = strValue;
        this.numValue = charCode(strValue, 0);
    }
}
export class CssLexer {
    scan(text, trackComments = false) {
        return new CssScanner(text, trackComments);
    }
}
export class CssScannerError extends BaseException {
    constructor(token, message) {
        super('Css Parse Error: ' + message);
        this.token = token;
        this.rawMessage = message;
    }
    toString() { return this.message; }
}
function _trackWhitespace(mode) {
    switch (mode) {
        case CssLexerMode.SELECTOR:
        case CssLexerMode.ALL_TRACK_WS:
        case CssLexerMode.STYLE_VALUE:
            return true;
    }
    return false;
}
export class CssScanner {
    constructor(input, _trackComments = false) {
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
    getMode() { return this._currentMode; }
    setMode(mode) {
        if (this._currentMode != mode) {
            if (_trackWhitespace(this._currentMode)) {
                this.consumeWhitespace();
            }
            this._currentMode = mode;
        }
    }
    advance() {
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
    }
    peekAt(index) {
        return index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, index);
    }
    consumeEmptyStatements() {
        this.consumeWhitespace();
        while (this.peek == $SEMICOLON) {
            this.advance();
            this.consumeWhitespace();
        }
    }
    consumeWhitespace() {
        while (isWhitespace(this.peek) || isNewline(this.peek)) {
            this.advance();
            if (!this._trackComments && isCommentStart(this.peek, this.peekPeek)) {
                this.advance(); // /
                this.advance(); // *
                while (!isCommentEnd(this.peek, this.peekPeek)) {
                    if (this.peek == $EOF) {
                        this.error('Unterminated comment');
                    }
                    this.advance();
                }
                this.advance(); // *
                this.advance(); // /
            }
        }
    }
    consume(type, value = null) {
        var mode = this._currentMode;
        this.setMode(CssLexerMode.ALL);
        var previousIndex = this.index;
        var previousLine = this.line;
        var previousColumn = this.column;
        var output = this.scan();
        // just incase the inner scan method returned an error
        if (isPresent(output.error)) {
            this.setMode(mode);
            return output;
        }
        var next = output.token;
        if (!isPresent(next)) {
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
        if (!isMatchingType || (isPresent(value) && value != next.strValue)) {
            var errorMessage = CssTokenType[next.type] + " does not match expected " + CssTokenType[type] + " value";
            if (isPresent(value)) {
                errorMessage += ' ("' + next.strValue + '" should match "' + value + '")';
            }
            error = new CssScannerError(next, generateErrorMessage(this.input, errorMessage, next.strValue, previousIndex, previousLine, previousColumn));
        }
        return new LexedCssResult(error, next);
    }
    scan() {
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
    }
    _scan() {
        var peek = this.peek;
        var peekPeek = this.peekPeek;
        if (peek == $EOF)
            return null;
        if (isCommentStart(peek, peekPeek)) {
            // even if comments are not tracked we still lex the
            // comment so we can move the pointer forward
            var commentToken = this.scanComment();
            if (this._trackComments) {
                return commentToken;
            }
        }
        if (_trackWhitespace(this._currentMode) && (isWhitespace(peek) || isNewline(peek))) {
            return this.scanWhitespace();
        }
        peek = this.peek;
        peekPeek = this.peekPeek;
        if (peek == $EOF)
            return null;
        if (isStringStart(peek, peekPeek)) {
            return this.scanString();
        }
        // something like url(cool)
        if (this._currentMode == CssLexerMode.STYLE_VALUE_FUNCTION) {
            return this.scanCssValueFunction();
        }
        var isModifier = peek == $PLUS || peek == $MINUS;
        var digitA = isModifier ? false : isDigit(peek);
        var digitB = isDigit(peekPeek);
        if (digitA || (isModifier && (peekPeek == $PERIOD || digitB)) || (peek == $PERIOD && digitB)) {
            return this.scanNumber();
        }
        if (peek == $AT) {
            return this.scanAtExpression();
        }
        if (isIdentifierStart(peek, peekPeek)) {
            return this.scanIdentifier();
        }
        if (isValidCssCharacter(peek, this._currentMode)) {
            return this.scanCharacter();
        }
        return this.error(`Unexpected character [${StringWrapper.fromCharCode(peek)}]`);
    }
    scanComment() {
        if (this.assertCondition(isCommentStart(this.peek, this.peekPeek), "Expected comment start value")) {
            return null;
        }
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        this.advance(); // /
        this.advance(); // *
        while (!isCommentEnd(this.peek, this.peekPeek)) {
            if (this.peek == $EOF) {
                this.error('Unterminated comment');
            }
            this.advance();
        }
        this.advance(); // *
        this.advance(); // /
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Comment, str);
    }
    scanWhitespace() {
        var start = this.index;
        var startingColumn = this.column;
        var startingLine = this.line;
        while (isWhitespace(this.peek) && this.peek != $EOF) {
            this.advance();
        }
        var str = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, startingLine, CssTokenType.Whitespace, str);
    }
    scanString() {
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
            if (this.peek == $EOF || isNewline(this.peek)) {
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
    }
    scanNumber() {
        var start = this.index;
        var startingColumn = this.column;
        if (this.peek == $PLUS || this.peek == $MINUS) {
            this.advance();
        }
        var periodUsed = false;
        while (isDigit(this.peek) || this.peek == $PERIOD) {
            if (this.peek == $PERIOD) {
                if (periodUsed) {
                    this.error('Unexpected use of a second period value');
                }
                periodUsed = true;
            }
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Number, strValue);
    }
    scanIdentifier() {
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
    }
    scanCssValueFunction() {
        var start = this.index;
        var startingColumn = this.column;
        while (this.peek != $EOF && this.peek != $RPAREN) {
            this.advance();
        }
        var strValue = this.input.substring(start, this.index);
        return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
    }
    scanCharacter() {
        var start = this.index;
        var startingColumn = this.column;
        if (this.assertCondition(isValidCssCharacter(this.peek, this._currentMode), charStr(this.peek) + ' is not a valid CSS character')) {
            return null;
        }
        var c = this.input.substring(start, start + 1);
        this.advance();
        return new CssToken(start, startingColumn, this.line, CssTokenType.Character, c);
    }
    scanAtExpression() {
        if (this.assertCondition(this.peek == $AT, 'Expected @ value')) {
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
    }
    assertCondition(status, errorMessage) {
        if (!status) {
            this.error(errorMessage);
            return true;
        }
        return false;
    }
    error(message, errorTokenValue = null, doNotAdvance = false) {
        var index = this.index;
        var column = this.column;
        var line = this.line;
        errorTokenValue =
            isPresent(errorTokenValue) ? errorTokenValue : StringWrapper.fromCharCode(this.peek);
        var invalidToken = new CssToken(index, column, line, CssTokenType.Invalid, errorTokenValue);
        var errorMessage = generateErrorMessage(this.input, message, errorTokenValue, index, line, column);
        if (!doNotAdvance) {
            this.advance();
        }
        this._currentError = new CssScannerError(invalidToken, errorMessage);
        return invalidToken;
    }
}
function isAtKeyword(current, next) {
    return current.numValue == $AT && next.type == CssTokenType.Identifier;
}
function isCharMatch(target, previous, code) {
    return code == target && previous != $BACKSLASH;
}
function isDigit(code) {
    return $0 <= code && code <= $9;
}
function isCommentStart(code, next) {
    return code == $SLASH && next == $STAR;
}
function isCommentEnd(code, next) {
    return code == $STAR && next == $SLASH;
}
function isStringStart(code, next) {
    var target = code;
    if (target == $BACKSLASH) {
        target = next;
    }
    return target == $DQ || target == $SQ;
}
function isIdentifierStart(code, next) {
    var target = code;
    if (target == $MINUS) {
        target = next;
    }
    return ($a <= target && target <= $z) || ($A <= target && target <= $Z) || target == $BACKSLASH ||
        target == $MINUS || target == $_;
}
function isIdentifierPart(target) {
    return ($a <= target && target <= $z) || ($A <= target && target <= $Z) || target == $BACKSLASH ||
        target == $MINUS || target == $_ || isDigit(target);
}
function isValidPseudoSelectorCharacter(code) {
    switch (code) {
        case $LPAREN:
        case $RPAREN:
            return true;
    }
    return false;
}
function isValidKeyframeBlockCharacter(code) {
    switch (code) {
        case $PERCENT:
            return true;
    }
    return false;
}
function isValidAttributeSelectorCharacter(code) {
    // value^*|$~=something
    switch (code) {
        case $$:
        case $PIPE:
        case $CARET:
        case $TILDA:
        case $STAR:
        case $EQ:
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
        case $HASH:
        case $PERIOD:
        case $TILDA:
        case $STAR:
        case $PLUS:
        case $GT:
        case $COLON:
        case $PIPE:
        case $COMMA:
            return true;
    }
}
function isValidStyleBlockCharacter(code) {
    // key:value;
    // key:calc(something ... )
    switch (code) {
        case $HASH:
        case $SEMICOLON:
        case $COLON:
        case $PERCENT:
        case $SLASH:
        case $BACKSLASH:
        case $BANG:
        case $PERIOD:
        case $LPAREN:
        case $RPAREN:
            return true;
    }
}
function isValidMediaQueryRuleCharacter(code) {
    // (min-width: 7.5em) and (orientation: landscape)
    switch (code) {
        case $LPAREN:
        case $RPAREN:
        case $COLON:
        case $PERCENT:
        case $PERIOD:
            return true;
    }
}
function isValidAtRuleCharacter(code) {
    // @document url(http://www.w3.org/page?something=on#hash),
    switch (code) {
        case $LPAREN:
        case $RPAREN:
        case $COLON:
        case $PERCENT:
        case $PERIOD:
        case $SLASH:
        case $BACKSLASH:
        case $HASH:
        case $EQ:
        case $QUESTION:
        case $AMPERSAND:
        case $STAR:
        case $COMMA:
        case $MINUS:
        case $PLUS:
            return true;
    }
    return false;
}
function isValidStyleFunctionCharacter(code) {
    switch (code) {
        case $PERIOD:
        case $MINUS:
        case $PLUS:
        case $STAR:
        case $SLASH:
        case $LPAREN:
        case $RPAREN:
        case $COMMA:
            return true;
    }
}
function isValidBlockCharacter(code) {
    // @something { }
    // IDENT
    return code == $AT;
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
    return index >= input.length ? $EOF : StringWrapper.charCodeAt(input, index);
}
function charStr(code) {
    return StringWrapper.fromCharCode(code);
}
export function isNewline(code) {
    switch (code) {
        case $FF:
        case $CR:
        case $LF:
        case $VTAB:
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbIkNzc1Rva2VuVHlwZSIsIkNzc0xleGVyTW9kZSIsIkxleGVkQ3NzUmVzdWx0IiwiTGV4ZWRDc3NSZXN1bHQuY29uc3RydWN0b3IiLCJnZW5lcmF0ZUVycm9yTWVzc2FnZSIsImZpbmRQcm9ibGVtQ29kZSIsIkNzc1Rva2VuIiwiQ3NzVG9rZW4uY29uc3RydWN0b3IiLCJDc3NMZXhlciIsIkNzc0xleGVyLnNjYW4iLCJDc3NTY2FubmVyRXJyb3IiLCJDc3NTY2FubmVyRXJyb3IuY29uc3RydWN0b3IiLCJDc3NTY2FubmVyRXJyb3IudG9TdHJpbmciLCJfdHJhY2tXaGl0ZXNwYWNlIiwiQ3NzU2Nhbm5lciIsIkNzc1NjYW5uZXIuY29uc3RydWN0b3IiLCJDc3NTY2FubmVyLmdldE1vZGUiLCJDc3NTY2FubmVyLnNldE1vZGUiLCJDc3NTY2FubmVyLmFkdmFuY2UiLCJDc3NTY2FubmVyLnBlZWtBdCIsIkNzc1NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cyIsIkNzc1NjYW5uZXIuY29uc3VtZVdoaXRlc3BhY2UiLCJDc3NTY2FubmVyLmNvbnN1bWUiLCJDc3NTY2FubmVyLnNjYW4iLCJDc3NTY2FubmVyLl9zY2FuIiwiQ3NzU2Nhbm5lci5zY2FuQ29tbWVudCIsIkNzc1NjYW5uZXIuc2NhbldoaXRlc3BhY2UiLCJDc3NTY2FubmVyLnNjYW5TdHJpbmciLCJDc3NTY2FubmVyLnNjYW5OdW1iZXIiLCJDc3NTY2FubmVyLnNjYW5JZGVudGlmaWVyIiwiQ3NzU2Nhbm5lci5zY2FuQ3NzVmFsdWVGdW5jdGlvbiIsIkNzc1NjYW5uZXIuc2NhbkNoYXJhY3RlciIsIkNzc1NjYW5uZXIuc2NhbkF0RXhwcmVzc2lvbiIsIkNzc1NjYW5uZXIuYXNzZXJ0Q29uZGl0aW9uIiwiQ3NzU2Nhbm5lci5lcnJvciIsImlzQXRLZXl3b3JkIiwiaXNDaGFyTWF0Y2giLCJpc0RpZ2l0IiwiaXNDb21tZW50U3RhcnQiLCJpc0NvbW1lbnRFbmQiLCJpc1N0cmluZ1N0YXJ0IiwiaXNJZGVudGlmaWVyU3RhcnQiLCJpc0lkZW50aWZpZXJQYXJ0IiwiaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyIiwiaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIiLCJpc1ZhbGlkQXR0cmlidXRlU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRNZWRpYVF1ZXJ5UnVsZUNoYXJhY3RlciIsImlzVmFsaWRBdFJ1bGVDaGFyYWN0ZXIiLCJpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3RlciIsImlzVmFsaWRCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRDc3NDaGFyYWN0ZXIiLCJjaGFyQ29kZSIsImNoYXJTdHIiLCJpc05ld2xpbmUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQWdCLGFBQWEsRUFBRSxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDekUsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFckQsRUFDTCxZQUFZLEVBQ1osSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLFFBQVEsRUFDUixFQUFFLEVBQ0YsRUFBRSxFQUNGLE1BQU0sRUFDTixHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxNQUFNLEVBQ04sVUFBVSxFQUNWLE9BQU8sRUFDUCxLQUFLLEVBQ0wsS0FBSyxFQUNMLE9BQU8sRUFDUCxPQUFPLEVBS1AsS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsR0FBRyxFQUNILFVBQVUsRUFDVixHQUFHLEVBQ0gsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsR0FBRyxFQUNILEdBQUcsRUFD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TUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDM0JBLENBQUNBO1FBRURBLDJCQUEyQkE7UUFDM0JBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLFlBQVlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0E7UUFDckNBLENBQUNBO1FBRURBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLElBQUlBLEtBQUtBLElBQUlBLElBQUlBLElBQUlBLE1BQU1BLENBQUNBO1FBQ2pEQSxJQUFJQSxNQUFNQSxHQUFHQSxVQUFVQSxHQUFHQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoREEsSUFBSUEsTUFBTUEsR0FBR0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLENBQUNBLFFBQVFBLElBQUlBLE9BQU9BLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLE9BQU9BLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdGQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7UUFDakNBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1FBQy9CQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EseUJBQXlCQSxhQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNsRkEsQ0FBQ0E7SUFFRFYsV0FBV0E7UUFDVFcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsOEJBQThCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuR0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDdkJBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBO1FBQ2pDQSxJQUFJQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUU3QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUE7UUFDckJBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUVBLElBQUlBO1FBRXJCQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBO1lBQ3JDQSxDQUFDQTtZQUNEQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBRUEsSUFBSUE7UUFDckJBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUVBLElBQUlBO1FBRXJCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNsREEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsY0FBY0EsRUFBRUEsWUFBWUEsRUFBRUEsWUFBWUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRURYLGNBQWNBO1FBQ1pZLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3ZCQSxJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNqQ0EsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDN0JBLE9BQU9BLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEVBQUVBLENBQUNBO1lBQ3BEQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7UUFDREEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVB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Q0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDYkEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsT0FBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsTUFBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsR0FBR0EsQ0FBQ0E7UUFDVEEsS0FBS0EsTUFBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsTUFBTUE7WUFDVEEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsb0NBQW9DLElBQVk7SUFDOUNDLGFBQWFBO0lBQ2JBLDJCQUEyQkE7SUFDM0JBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLEtBQUtBLENBQUNBO1FBQ1hBLEtBQUtBLFVBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxNQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxRQUFRQSxDQUFDQTtRQUNkQSxLQUFLQSxNQUFNQSxDQUFDQTtRQUNaQSxLQUFLQSxVQUFVQSxDQUFDQTtRQUNoQkEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsT0FBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsT0FBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsT0FBT0E7WUFDVkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsd0NBQXdDLElBQVk7SUFDbERDLGtEQUFrREE7SUFDbERBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE1BQU1BLENBQUNBO1FBQ1pBLEtBQUtBLFFBQVFBLENBQUNBO1FBQ2RBLEtBQUtBLE9BQU9BO1lBQ1ZBLE1BQU1BLENBQUNBLElBQUlBLENB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QTZCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU3Q0EsS0FBS0EsWUFBWUEsQ0FBQ0EsS0FBS0E7WUFDckJBLE1BQU1BLENBQUNBLHFCQUFxQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0FBQ2ZBLENBQUNBO0FBRUQsa0JBQWtCLEtBQUssRUFBRSxLQUFLO0lBQzVCQyxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtBQUMvRUEsQ0FBQ0E7QUFFRCxpQkFBaUIsSUFBWTtJQUMzQkMsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7QUFDMUNBLENBQUNBO0FBRUQsMEJBQTBCLElBQUk7SUFDNUJDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLEdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLEdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLEdBQUdBLENBQUNBO1FBQ1RBLEtBQUtBLEtBQUtBO1lBQ1JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRWRBO1lBQ0VBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2pCQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TnVtYmVyV3JhcHBlciwgU3RyaW5nV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7XG4gIGlzV2hpdGVzcGFjZSxcbiAgJEVPRixcbiAgJEhBU0gsXG4gICRUSUxEQSxcbiAgJENBUkVULFxuICAkUEVSQ0VOVCxcbiAgJCQsXG4gICRfLFxuICAkQ09MT04sXG4gICRTUSxcbiAgJERRLFxuICAkRVEsXG4gICRTTEFTSCxcbiAgJEJBQ0tTTEFTSCxcbiAgJFBFUklPRCxcbiAgJFNUQVIsXG4gICRQTFVTLFxuICAkTFBBUkVOLFxuICAkUlBBUkVOLFxuICAkTEJSQUNFLFxuICAkUkJSQUNFLFxuICAkTEJSQUNLRVQsXG4gICRSQlJBQ0tFVCxcbiAgJFBJUEUsXG4gICRDT01NQSxcbiAgJFNFTUlDT0xPTixcbiAgJE1JTlVTLFxuICAkQkFORyxcbiAgJFFVRVNUSU9OLFxuICAkQVQsXG4gICRBTVBFUlNBTkQsXG4gICRHVCxcbiAgJGEsXG4gICRBLFxuICAkeixcbiAgJFosXG4gICQwLFxuICAkOSxcbiAgJEZGLFxuICAkQ1IsXG4gICRMRixcbiAgJFZUQUJcbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb21waWxlci9jaGFyc1wiO1xuXG5leHBvcnQge1xuICAkRU9GLFxuICAkQVQsXG4gICRSQlJBQ0UsXG4gICRMQlJBQ0UsXG4gICRMQlJBQ0tFVCxcbiAgJFJCUkFDS0VULFxuICAkTFBBUkVOLFxuICAkUlBBUkVOLFxuICAkQ09NTUEsXG4gICRDT0xPTixcbiAgJFNFTUlDT0xPTixcbiAgaXNXaGl0ZXNwYWNlXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvY2hhcnNcIjtcblxuZXhwb3J0IGVudW0gQ3NzVG9rZW5UeXBlIHtcbiAgRU9GLFxuICBTdHJpbmcsXG4gIENvbW1lbnQsXG4gIElkZW50aWZpZXIsXG4gIE51bWJlcixcbiAgSWRlbnRpZmllck9yTnVtYmVyLFxuICBBdEtleXdvcmQsXG4gIENoYXJhY3RlcixcbiAgV2hpdGVzcGFjZSxcbiAgSW52YWxpZFxufVxuXG5leHBvcnQgZW51bSBDc3NMZXhlck1vZGUge1xuICBBTEwsXG4gIEFMTF9UUkFDS19XUyxcbiAgU0VMRUNUT1IsXG4gIFBTRVVET19TRUxFQ1RPUixcbiAgQVRUUklCVVRFX1NFTEVDVE9SLFxuICBBVF9SVUxFX1FVRVJZLFxuICBNRURJQV9RVUVSWSxcbiAgQkxPQ0ssXG4gIEtFWUZSQU1FX0JMT0NLLFxuICBTVFlMRV9CTE9DSyxcbiAgU1RZTEVfVkFMVUUsXG4gIFNUWUxFX1ZBTFVFX0ZVTkNUSU9OLFxuICBTVFlMRV9DQUxDX0ZVTkNUSU9OXG59XG5cbmV4cG9ydCBjbGFzcyBMZXhlZENzc1Jlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogQ3NzU2Nhbm5lckVycm9yLCBwdWJsaWMgdG9rZW46IENzc1Rva2VuKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVFcnJvck1lc3NhZ2UoaW5wdXQsIG1lc3NhZ2UsIGVycm9yVmFsdWUsIGluZGV4LCByb3csIGNvbHVtbikge1xuICByZXR1cm4gYCR7bWVzc2FnZX0gYXQgY29sdW1uICR7cm93fToke2NvbHVtbn0gaW4gZXhwcmVzc2lvbiBbYCArXG4gICAgICAgICBmaW5kUHJvYmxlbUNvZGUoaW5wdXQsIGVycm9yVmFsdWUsIGluZGV4LCBjb2x1bW4pICsgJ10nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFByb2JsZW1Db2RlKGlucHV0LCBlcnJvclZhbHVlLCBpbmRleCwgY29sdW1uKSB7XG4gIHZhciBlbmRPZlByb2JsZW1MaW5lID0gaW5kZXg7XG4gIHZhciBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsIGluZGV4KTtcbiAgd2hpbGUgKGN1cnJlbnQgPiAwICYmICFpc05ld2xpbmUoY3VycmVudCkpIHtcbiAgICBjdXJyZW50ID0gY2hhckNvZGUoaW5wdXQsICsrZW5kT2ZQcm9ibGVtTGluZSk7XG4gIH1cbiAgdmFyIGNob3BwZWRTdHJpbmcgPSBpbnB1dC5zdWJzdHJpbmcoMCwgZW5kT2ZQcm9ibGVtTGluZSk7XG4gIHZhciBwb2ludGVyUGFkZGluZyA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1uOyBpKyspIHtcbiAgICBwb2ludGVyUGFkZGluZyArPSBcIiBcIjtcbiAgfVxuICB2YXIgcG9pbnRlclN0cmluZyA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIHBvaW50ZXJTdHJpbmcgKz0gXCJeXCI7XG4gIH1cbiAgcmV0dXJuIGNob3BwZWRTdHJpbmcgKyBcIlxcblwiICsgcG9pbnRlclBhZGRpbmcgKyBwb2ludGVyU3RyaW5nICsgXCJcXG5cIjtcbn1cblxuZXhwb3J0IGNsYXNzIENzc1Rva2VuIHtcbiAgbnVtVmFsdWU6IG51bWJlcjtcbiAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBjb2x1bW46IG51bWJlciwgcHVibGljIGxpbmU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHR5cGU6IENzc1Rva2VuVHlwZSwgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLm51bVZhbHVlID0gY2hhckNvZGUoc3RyVmFsdWUsIDApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NMZXhlciB7XG4gIHNjYW4odGV4dDogc3RyaW5nLCB0cmFja0NvbW1lbnRzOiBib29sZWFuID0gZmFsc2UpOiBDc3NTY2FubmVyIHtcbiAgICByZXR1cm4gbmV3IENzc1NjYW5uZXIodGV4dCwgdHJhY2tDb21tZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NjYW5uZXJFcnJvciBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBwdWJsaWMgcmF3TWVzc2FnZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbjogQ3NzVG9rZW4sIG1lc3NhZ2UpIHtcbiAgICBzdXBlcignQ3NzIFBhcnNlIEVycm9yOiAnICsgbWVzc2FnZSk7XG4gICAgdGhpcy5yYXdNZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuZnVuY3Rpb24gX3RyYWNrV2hpdGVzcGFjZShtb2RlOiBDc3NMZXhlck1vZGUpIHtcbiAgc3dpdGNoIChtb2RlKSB7XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU0VMRUNUT1I6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMX1RSQUNLX1dTOlxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2Nhbm5lciB7XG4gIHBlZWs6IG51bWJlcjtcbiAgcGVla1BlZWs6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXIgPSAwO1xuICBpbmRleDogbnVtYmVyID0gLTE7XG4gIGNvbHVtbjogbnVtYmVyID0gLTE7XG4gIGxpbmU6IG51bWJlciA9IDA7XG5cbiAgX2N1cnJlbnRNb2RlOiBDc3NMZXhlck1vZGUgPSBDc3NMZXhlck1vZGUuQkxPQ0s7XG4gIF9jdXJyZW50RXJyb3I6IENzc1NjYW5uZXJFcnJvciA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGlucHV0OiBzdHJpbmcsIHByaXZhdGUgX3RyYWNrQ29tbWVudHM6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5pbnB1dC5sZW5ndGg7XG4gICAgdGhpcy5wZWVrUGVlayA9IHRoaXMucGVla0F0KDApO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICB9XG5cbiAgZ2V0TW9kZSgpOiBDc3NMZXhlck1vZGUgeyByZXR1cm4gdGhpcy5fY3VycmVudE1vZGU7IH1cblxuICBzZXRNb2RlKG1vZGU6IENzc0xleGVyTW9kZSkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TW9kZSAhPSBtb2RlKSB7XG4gICAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudE1vZGUgPSBtb2RlO1xuICAgIH1cbiAgfVxuXG4gIGFkdmFuY2UoKTogdm9pZCB7XG4gICAgaWYgKGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmNvbHVtbiA9IDA7XG4gICAgICB0aGlzLmxpbmUrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW4rKztcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4Kys7XG4gICAgdGhpcy5wZWVrID0gdGhpcy5wZWVrUGVlaztcbiAgICB0aGlzLnBlZWtQZWVrID0gdGhpcy5wZWVrQXQodGhpcy5pbmRleCArIDEpO1xuICB9XG5cbiAgcGVla0F0KGluZGV4KTogbnVtYmVyIHtcbiAgICByZXR1cm4gaW5kZXggPj0gdGhpcy5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KHRoaXMuaW5wdXQsIGluZGV4KTtcbiAgfVxuXG4gIGNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIHdoaWxlICh0aGlzLnBlZWsgPT0gJFNFTUlDT0xPTikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZVdoaXRlc3BhY2UoKTogdm9pZCB7XG4gICAgd2hpbGUgKGlzV2hpdGVzcGFjZSh0aGlzLnBlZWspIHx8IGlzTmV3bGluZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgIGlmICghdGhpcy5fdHJhY2tDb21tZW50cyAmJiBpc0NvbW1lbnRTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICAgICAgd2hpbGUgKCFpc0NvbW1lbnRFbmQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgICAgIGlmICh0aGlzLnBlZWsgPT0gJEVPRikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIGNvbW1lbnQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWUodHlwZTogQ3NzVG9rZW5UeXBlLCB2YWx1ZTogc3RyaW5nID0gbnVsbCk6IExleGVkQ3NzUmVzdWx0IHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuX2N1cnJlbnRNb2RlO1xuICAgIHRoaXMuc2V0TW9kZShDc3NMZXhlck1vZGUuQUxMKTtcblxuICAgIHZhciBwcmV2aW91c0luZGV4ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgcHJldmlvdXNMaW5lID0gdGhpcy5saW5lO1xuICAgIHZhciBwcmV2aW91c0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuXG4gICAgdmFyIG91dHB1dCA9IHRoaXMuc2NhbigpO1xuXG4gICAgLy8ganVzdCBpbmNhc2UgdGhlIGlubmVyIHNjYW4gbWV0aG9kIHJldHVybmVkIGFuIGVycm9yXG4gICAgaWYgKGlzUHJlc2VudChvdXRwdXQuZXJyb3IpKSB7XG4gICAgICB0aGlzLnNldE1vZGUobW9kZSk7XG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIHZhciBuZXh0ID0gb3V0cHV0LnRva2VuO1xuICAgIGlmICghaXNQcmVzZW50KG5leHQpKSB7XG4gICAgICBuZXh0ID0gbmV3IENzc1Rva2VuKDAsIDAsIDAsIENzc1Rva2VuVHlwZS5FT0YsIFwiZW5kIG9mIGZpbGVcIik7XG4gICAgfVxuXG4gICAgdmFyIGlzTWF0Y2hpbmdUeXBlO1xuICAgIGlmICh0eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyT3JOdW1iZXIpIHtcbiAgICAgIC8vIFRPRE8gKG1hdHNrbyk6IGltcGxlbWVudCBhcnJheSB0cmF2ZXJzYWwgZm9yIGxvb2t1cCBoZXJlXG4gICAgICBpc01hdGNoaW5nVHlwZSA9IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuTnVtYmVyIHx8IG5leHQudHlwZSA9PSBDc3NUb2tlblR5cGUuSWRlbnRpZmllcjtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNNYXRjaGluZ1R5cGUgPSBuZXh0LnR5cGUgPT0gdHlwZTtcbiAgICB9XG5cbiAgICAvLyBiZWZvcmUgdGhyb3dpbmcgdGhlIGVycm9yIHdlIG5lZWQgdG8gYnJpbmcgYmFjayB0aGUgZm9ybWVyXG4gICAgLy8gbW9kZSBzbyB0aGF0IHRoZSBwYXJzZXIgY2FuIHJlY292ZXIuLi5cbiAgICB0aGlzLnNldE1vZGUobW9kZSk7XG5cbiAgICB2YXIgZXJyb3IgPSBudWxsO1xuICAgIGlmICghaXNNYXRjaGluZ1R5cGUgfHwgKGlzUHJlc2VudCh2YWx1ZSkgJiYgdmFsdWUgIT0gbmV4dC5zdHJWYWx1ZSkpIHtcbiAgICAgIHZhciBlcnJvck1lc3NhZ2UgPVxuICAgICAgICBDc3NUb2tlblR5cGVbbmV4dC50eXBlXSArIFwiIGRvZXMgbm90IG1hdGNoIGV4cGVjdGVkIFwiICsgQ3NzVG9rZW5UeXBlW3R5cGVdICsgXCIgdmFsdWVcIjtcblxuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgZXJyb3JNZXNzYWdlICs9ICcgKFwiJyArIG5leHQuc3RyVmFsdWUgKyAnXCIgc2hvdWxkIG1hdGNoIFwiJyArIHZhbHVlICsgJ1wiKSc7XG4gICAgICB9XG5cbiAgICAgIGVycm9yID0gbmV3IENzc1NjYW5uZXJFcnJvcihcbiAgICAgICAgICBuZXh0LCBnZW5lcmF0ZUVycm9yTWVzc2FnZSh0aGlzLmlucHV0LCBlcnJvck1lc3NhZ2UsIG5leHQuc3RyVmFsdWUsIHByZXZpb3VzSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNMaW5lLCBwcmV2aW91c0NvbHVtbikpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTGV4ZWRDc3NSZXN1bHQoZXJyb3IsIG5leHQpO1xuICB9XG5cblxuICBzY2FuKCk6IExleGVkQ3NzUmVzdWx0IHtcbiAgICB2YXIgdHJhY2tXUyA9IF90cmFja1doaXRlc3BhY2UodGhpcy5fY3VycmVudE1vZGUpO1xuICAgIGlmICh0aGlzLmluZGV4ID09IDAgJiYgIXRyYWNrV1MpIHsgIC8vIGZpcnN0IHNjYW5cbiAgICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLl9zY2FuKCk7XG4gICAgaWYgKHRva2VuID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGVycm9yID0gdGhpcy5fY3VycmVudEVycm9yO1xuICAgIHRoaXMuX2N1cnJlbnRFcnJvciA9IG51bGw7XG4gICAgaWYgKCF0cmFja1dTKSB7XG4gICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTGV4ZWRDc3NSZXN1bHQoZXJyb3IsIHRva2VuKTtcbiAgfVxuXG4gIF9zY2FuKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgcGVlayA9IHRoaXMucGVlaztcbiAgICB2YXIgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzQ29tbWVudFN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgLy8gZXZlbiBpZiBjb21tZW50cyBhcmUgbm90IHRyYWNrZWQgd2Ugc3RpbGwgbGV4IHRoZVxuICAgICAgLy8gY29tbWVudCBzbyB3ZSBjYW4gbW92ZSB0aGUgcG9pbnRlciBmb3J3YXJkXG4gICAgICB2YXIgY29tbWVudFRva2VuID0gdGhpcy5zY2FuQ29tbWVudCgpO1xuICAgICAgaWYgKHRoaXMuX3RyYWNrQ29tbWVudHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnRUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkgJiYgKGlzV2hpdGVzcGFjZShwZWVrKSB8fCBpc05ld2xpbmUocGVlaykpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuV2hpdGVzcGFjZSgpO1xuICAgIH1cblxuICAgIHBlZWsgPSB0aGlzLnBlZWs7XG4gICAgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzU3RyaW5nU3RhcnQocGVlaywgcGVla1BlZWspKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gc29tZXRoaW5nIGxpa2UgdXJsKGNvb2wpXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNb2RlID09IENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRV9GVU5DVElPTikge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNzc1ZhbHVlRnVuY3Rpb24oKTtcbiAgICB9XG5cbiAgICB2YXIgaXNNb2RpZmllciA9IHBlZWsgPT0gJFBMVVMgfHwgcGVlayA9PSAkTUlOVVM7XG4gICAgdmFyIGRpZ2l0QSA9IGlzTW9kaWZpZXIgPyBmYWxzZSA6IGlzRGlnaXQocGVlayk7XG4gICAgdmFyIGRpZ2l0QiA9IGlzRGlnaXQocGVla1BlZWspO1xuICAgIGlmIChkaWdpdEEgfHwgKGlzTW9kaWZpZXIgJiYgKHBlZWtQZWVrID09ICRQRVJJT0QgfHwgZGlnaXRCKSkgfHwgKHBlZWsgPT0gJFBFUklPRCAmJiBkaWdpdEIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuTnVtYmVyKCk7XG4gICAgfVxuXG4gICAgaWYgKHBlZWsgPT0gJEFUKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQXRFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNWYWxpZENzc0NoYXJhY3RlcihwZWVrLCB0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5DaGFyYWN0ZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgWyR7U3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUocGVlayl9XWApO1xuICB9XG5cbiAgc2NhbkNvbW1lbnQoKSB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzQ29tbWVudFN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksIFwiRXhwZWN0ZWQgY29tbWVudCBzdGFydCB2YWx1ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAvXG4gICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG5cbiAgICB3aGlsZSAoIWlzQ29tbWVudEVuZCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIGNvbW1lbnQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuXG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuQ29tbWVudCwgc3RyKTtcbiAgfVxuXG4gIHNjYW5XaGl0ZXNwYWNlKCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcbiAgICB3aGlsZSAoaXNXaGl0ZXNwYWNlKHRoaXMucGVlaykgJiYgdGhpcy5wZWVrICE9ICRFT0YpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCBzdGFydGluZ0xpbmUsIENzc1Rva2VuVHlwZS5XaGl0ZXNwYWNlLCBzdHIpO1xuICB9XG5cbiAgc2NhblN0cmluZygpIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oaXNTdHJpbmdTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCBcIlVuZXhwZWN0ZWQgbm9uLXN0cmluZyBzdGFydGluZyB2YWx1ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldCA9IHRoaXMucGVlaztcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgdmFyIHByZXZpb3VzID0gdGFyZ2V0O1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgd2hpbGUgKCFpc0NoYXJNYXRjaCh0YXJnZXQsIHByZXZpb3VzLCB0aGlzLnBlZWspKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YgfHwgaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIHF1b3RlJyk7XG4gICAgICB9XG4gICAgICBwcmV2aW91cyA9IHRoaXMucGVlaztcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbih0aGlzLnBlZWsgPT0gdGFyZ2V0LCBcIlVudGVybWluYXRlZCBxdW90ZVwiKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgdmFyIHN0ciA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgc3RhcnRpbmdMaW5lLCBDc3NUb2tlblR5cGUuU3RyaW5nLCBzdHIpO1xuICB9XG5cbiAgc2Nhbk51bWJlcigpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLnBlZWsgPT0gJFBMVVMgfHwgdGhpcy5wZWVrID09ICRNSU5VUykge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBwZXJpb2RVc2VkID0gZmFsc2U7XG4gICAgd2hpbGUgKGlzRGlnaXQodGhpcy5wZWVrKSB8fCB0aGlzLnBlZWsgPT0gJFBFUklPRCkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkUEVSSU9EKSB7XG4gICAgICAgIGlmIChwZXJpb2RVc2VkKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcignVW5leHBlY3RlZCB1c2Ugb2YgYSBzZWNvbmQgcGVyaW9kIHZhbHVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGVyaW9kVXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5OdW1iZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5JZGVudGlmaWVyKCkge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihpc0lkZW50aWZpZXJTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspLCAnRXhwZWN0ZWQgaWRlbnRpZmllciBzdGFydGluZyB2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHdoaWxlIChpc0lkZW50aWZpZXJQYXJ0KHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyVmFsdWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIsIHN0clZhbHVlKTtcbiAgfVxuXG4gIHNjYW5Dc3NWYWx1ZUZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPSAkRU9GICYmIHRoaXMucGVlayAhPSAkUlBBUkVOKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuQ2hhcmFjdGVyKCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKGlzVmFsaWRDc3NDaGFyYWN0ZXIodGhpcy5wZWVrLCB0aGlzLl9jdXJyZW50TW9kZSksIGNoYXJTdHIodGhpcy5wZWVrKSArICcgaXMgbm90IGEgdmFsaWQgQ1NTIGNoYXJhY3RlcicpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYyA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIDEpO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgYyk7XG4gIH1cblxuICBzY2FuQXRFeHByZXNzaW9uKCkge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbih0aGlzLnBlZWsgPT0gJEFULCAnRXhwZWN0ZWQgQCB2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydCh0aGlzLnBlZWssIHRoaXMucGVla1BlZWspKSB7XG4gICAgICB2YXIgaWRlbnQgPSB0aGlzLnNjYW5JZGVudGlmaWVyKCk7XG4gICAgICB2YXIgc3RyVmFsdWUgPSAnQCcgKyBpZGVudC5zdHJWYWx1ZTtcbiAgICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5BdEtleXdvcmQsIHN0clZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNoYXJhY3RlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydENvbmRpdGlvbihzdGF0dXM6IGJvb2xlYW4sIGVycm9yTWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIHRoaXMuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGVycm9yVG9rZW5WYWx1ZTogc3RyaW5nID0gbnVsbCwgZG9Ob3RBZHZhbmNlOiBib29sZWFuID0gZmFsc2UpOiBDc3NUb2tlbiB7XG4gICAgdmFyIGluZGV4OiBudW1iZXIgPSB0aGlzLmluZGV4O1xuICAgIHZhciBjb2x1bW46IG51bWJlciA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBsaW5lOiBudW1iZXIgPSB0aGlzLmxpbmU7XG4gICAgZXJyb3JUb2tlblZhbHVlID1cbiAgICAgICAgaXNQcmVzZW50KGVycm9yVG9rZW5WYWx1ZSkgPyBlcnJvclRva2VuVmFsdWUgOiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZSh0aGlzLnBlZWspO1xuICAgIHZhciBpbnZhbGlkVG9rZW4gPSBuZXcgQ3NzVG9rZW4oaW5kZXgsIGNvbHVtbiwgbGluZSwgQ3NzVG9rZW5UeXBlLkludmFsaWQsIGVycm9yVG9rZW5WYWx1ZSk7XG4gICAgdmFyIGVycm9yTWVzc2FnZSA9XG4gICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKHRoaXMuaW5wdXQsIG1lc3NhZ2UsIGVycm9yVG9rZW5WYWx1ZSwgaW5kZXgsIGxpbmUsIGNvbHVtbik7XG4gICAgaWYgKCFkb05vdEFkdmFuY2UpIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50RXJyb3IgPSBuZXcgQ3NzU2Nhbm5lckVycm9yKGludmFsaWRUb2tlbiwgZXJyb3JNZXNzYWdlKTtcbiAgICByZXR1cm4gaW52YWxpZFRva2VuO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXRLZXl3b3JkKGN1cnJlbnQ6IENzc1Rva2VuLCBuZXh0OiBDc3NUb2tlbik6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudC5udW1WYWx1ZSA9PSAkQVQgJiYgbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyO1xufVxuXG5mdW5jdGlvbiBpc0NoYXJNYXRjaCh0YXJnZXQ6IG51bWJlciwgcHJldmlvdXM6IG51bWJlciwgY29kZTogbnVtYmVyKSB7XG4gIHJldHVybiBjb2RlID09IHRhcmdldCAmJiBwcmV2aW91cyAhPSAkQkFDS1NMQVNIO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gJDAgPD0gY29kZSAmJiBjb2RlIDw9ICQ5O1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnRTdGFydChjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlcikge1xuICByZXR1cm4gY29kZSA9PSAkU0xBU0ggJiYgbmV4dCA9PSAkU1RBUjtcbn1cblxuZnVuY3Rpb24gaXNDb21tZW50RW5kKGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKSB7XG4gIHJldHVybiBjb2RlID09ICRTVEFSICYmIG5leHQgPT0gJFNMQVNIO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZ1N0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHZhciB0YXJnZXQgPSBjb2RlO1xuICBpZiAodGFyZ2V0ID09ICRCQUNLU0xBU0gpIHtcbiAgICB0YXJnZXQgPSBuZXh0O1xuICB9XG4gIHJldHVybiB0YXJnZXQgPT0gJERRIHx8IHRhcmdldCA9PSAkU1E7XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHZhciB0YXJnZXQgPSBjb2RlO1xuICBpZiAodGFyZ2V0ID09ICRNSU5VUykge1xuICAgIHRhcmdldCA9IG5leHQ7XG4gIH1cblxuICByZXR1cm4gKCRhIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJHopIHx8ICgkQSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICRaKSB8fCB0YXJnZXQgPT0gJEJBQ0tTTEFTSCB8fFxuICAgICAgICAgdGFyZ2V0ID09ICRNSU5VUyB8fCB0YXJnZXQgPT0gJF87XG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQodGFyZ2V0OiBudW1iZXIpIHtcbiAgcmV0dXJuICgkYSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICR6KSB8fCAoJEEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkWikgfHwgdGFyZ2V0ID09ICRCQUNLU0xBU0ggfHxcbiAgICAgICAgIHRhcmdldCA9PSAkTUlOVVMgfHwgdGFyZ2V0ID09ICRfIHx8IGlzRGlnaXQodGFyZ2V0KTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkS2V5ZnJhbWVCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZEF0dHJpYnV0ZVNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyB2YWx1ZV4qfCR+PXNvbWV0aGluZ1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICQkOlxuICAgIGNhc2UgJFBJUEU6XG4gICAgY2FzZSAkQ0FSRVQ6XG4gICAgY2FzZSAkVElMREE6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRFUTpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyBzZWxlY3RvciBbIGtleSAgID0gdmFsdWUgXVxuICAvLyBJREVOVCAgICBDIElERU5UIEMgSURFTlQgQ1xuICAvLyAjaWQsIC5jbGFzcywgKit+PlxuICAvLyB0YWc6UFNFVURPXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFRJTERBOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRHVDpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQSVBFOlxuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0eWxlQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gIC8vIGtleTp2YWx1ZTtcbiAgLy8ga2V5OmNhbGMoc29tZXRoaW5nIC4uLiApXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkU0xBU0g6XG4gICAgY2FzZSAkQkFDS1NMQVNIOlxuICAgIGNhc2UgJEJBTkc6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkTWVkaWFRdWVyeVJ1bGVDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gIC8vIChtaW4td2lkdGg6IDcuNWVtKSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQXRSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICAvLyBAZG9jdW1lbnQgdXJsKGh0dHA6Ly93d3cudzMub3JnL3BhZ2U/c29tZXRoaW5nPW9uI2hhc2gpLFxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJEJBQ0tTTEFTSDpcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJEVROlxuICAgIGNhc2UgJFFVRVNUSU9OOlxuICAgIGNhc2UgJEFNUEVSU0FORDpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJENPTU1BOlxuICAgIGNhc2UgJE1JTlVTOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyKGNvZGU6IG51bWJlcikge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkTUlOVVM6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQmxvY2tDaGFyYWN0ZXIoY29kZTogbnVtYmVyKSB7XG4gIC8vIEBzb21ldGhpbmcgeyB9XG4gIC8vIElERU5UXG4gIHJldHVybiBjb2RlID09ICRBVDtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZENzc0NoYXJhY3Rlcihjb2RlOiBudW1iZXIsIG1vZGU6IENzc0xleGVyTW9kZSkge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIENzc0xleGVyTW9kZS5BTEw6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQUxMX1RSQUNLX1dTOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRBdHRyaWJ1dGVTZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLk1FRElBX1FVRVJZOlxuICAgICAgcmV0dXJuIGlzVmFsaWRNZWRpYVF1ZXJ5UnVsZUNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFUX1JVTEVfUVVFUlk6XG4gICAgICByZXR1cm4gaXNWYWxpZEF0UnVsZUNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLktFWUZSQU1FX0JMT0NLOlxuICAgICAgcmV0dXJuIGlzVmFsaWRLZXlmcmFtZUJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0s6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUU6XG4gICAgICByZXR1cm4gaXNWYWxpZFN0eWxlQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9DQUxDX0ZVTkNUSU9OOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQkxPQ0s6XG4gICAgICByZXR1cm4gaXNWYWxpZEJsb2NrQ2hhcmFjdGVyKGNvZGUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gY2hhckNvZGUoaW5wdXQsIGluZGV4KTogbnVtYmVyIHtcbiAgcmV0dXJuIGluZGV4ID49IGlucHV0Lmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoaW5wdXQsIGluZGV4KTtcbn1cblxuZnVuY3Rpb24gY2hhclN0cihjb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY29kZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05ld2xpbmUoY29kZSk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRGRjpcbiAgICBjYXNlICRDUjpcbiAgICBjYXNlICRMRjpcbiAgICBjYXNlICRWVEFCOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbiJdfQ==