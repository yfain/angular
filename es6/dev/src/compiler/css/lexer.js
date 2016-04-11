import { StringWrapper, isPresent, resolveEnumToken } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isWhitespace, $EOF, $HASH, $TILDA, $CARET, $PERCENT, $$, $_, $COLON, $SQ, $DQ, $EQ, $SLASH, $BACKSLASH, $PERIOD, $STAR, $PLUS, $LPAREN, $RPAREN, $PIPE, $COMMA, $SEMICOLON, $MINUS, $BANG, $QUESTION, $AT, $AMPERSAND, $GT, $a, $A, $z, $Z, $0, $9, $FF, $CR, $LF, $VTAB } from 'angular2/src/compiler/chars';
export { $EOF, $AT, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isWhitespace } from 'angular2/src/compiler/chars';
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
        default:
            return false;
    }
}
export class CssScanner {
    constructor(input, _trackComments = false) {
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
        if (!isMatchingType || (isPresent(value) && value != next.strValue)) {
            var errorMessage = resolveEnumToken(CssTokenType, next.type) + ' does not match expected ' +
                resolveEnumToken(CssTokenType, type) + ' value';
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
    /** @internal */
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
        if (this.assertCondition(isCommentStart(this.peek, this.peekPeek), 'Expected comment start value')) {
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
            if (this.peek == $EOF || isNewline(this.peek)) {
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
        default:
            return false;
    }
}
function isValidKeyframeBlockCharacter(code) {
    return code == $PERCENT;
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
        default:
            return false;
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
        default:
            return false;
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
        default:
            return false;
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
        default:
            return false;
    }
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
        default:
            return false;
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
        default:
            return false;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVZ2aXBDQlVQLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvY3NzL2xleGVyLnRzIl0sIm5hbWVzIjpbIkNzc1Rva2VuVHlwZSIsIkNzc0xleGVyTW9kZSIsIkxleGVkQ3NzUmVzdWx0IiwiTGV4ZWRDc3NSZXN1bHQuY29uc3RydWN0b3IiLCJnZW5lcmF0ZUVycm9yTWVzc2FnZSIsImZpbmRQcm9ibGVtQ29kZSIsIkNzc1Rva2VuIiwiQ3NzVG9rZW4uY29uc3RydWN0b3IiLCJDc3NMZXhlciIsIkNzc0xleGVyLnNjYW4iLCJDc3NTY2FubmVyRXJyb3IiLCJDc3NTY2FubmVyRXJyb3IuY29uc3RydWN0b3IiLCJDc3NTY2FubmVyRXJyb3IudG9TdHJpbmciLCJfdHJhY2tXaGl0ZXNwYWNlIiwiQ3NzU2Nhbm5lciIsIkNzc1NjYW5uZXIuY29uc3RydWN0b3IiLCJDc3NTY2FubmVyLmdldE1vZGUiLCJDc3NTY2FubmVyLnNldE1vZGUiLCJDc3NTY2FubmVyLmFkdmFuY2UiLCJDc3NTY2FubmVyLnBlZWtBdCIsIkNzc1NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cyIsIkNzc1NjYW5uZXIuY29uc3VtZVdoaXRlc3BhY2UiLCJDc3NTY2FubmVyLmNvbnN1bWUiLCJDc3NTY2FubmVyLnNjYW4iLCJDc3NTY2FubmVyLl9zY2FuIiwiQ3NzU2Nhbm5lci5zY2FuQ29tbWVudCIsIkNzc1NjYW5uZXIuc2NhbldoaXRlc3BhY2UiLCJDc3NTY2FubmVyLnNjYW5TdHJpbmciLCJDc3NTY2FubmVyLnNjYW5OdW1iZXIiLCJDc3NTY2FubmVyLnNjYW5JZGVudGlmaWVyIiwiQ3NzU2Nhbm5lci5zY2FuQ3NzVmFsdWVGdW5jdGlvbiIsIkNzc1NjYW5uZXIuc2NhbkNoYXJhY3RlciIsIkNzc1NjYW5uZXIuc2NhbkF0RXhwcmVzc2lvbiIsIkNzc1NjYW5uZXIuYXNzZXJ0Q29uZGl0aW9uIiwiQ3NzU2Nhbm5lci5lcnJvciIsImlzQXRLZXl3b3JkIiwiaXNDaGFyTWF0Y2giLCJpc0RpZ2l0IiwiaXNDb21tZW50U3RhcnQiLCJpc0NvbW1lbnRFbmQiLCJpc1N0cmluZ1N0YXJ0IiwiaXNJZGVudGlmaWVyU3RhcnQiLCJpc0lkZW50aWZpZXJQYXJ0IiwiaXNWYWxpZFBzZXVkb1NlbGVjdG9yQ2hhcmFjdGVyIiwiaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIiLCJpc1ZhbGlkQXR0cmlidXRlU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkU2VsZWN0b3JDaGFyYWN0ZXIiLCJpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRNZWRpYVF1ZXJ5UnVsZUNoYXJhY3RlciIsImlzVmFsaWRBdFJ1bGVDaGFyYWN0ZXIiLCJpc1ZhbGlkU3R5bGVGdW5jdGlvbkNoYXJhY3RlciIsImlzVmFsaWRCbG9ja0NoYXJhY3RlciIsImlzVmFsaWRDc3NDaGFyYWN0ZXIiLCJjaGFyQ29kZSIsImNoYXJTdHIiLCJpc05ld2xpbmUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQWdCLGFBQWEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0YsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFckQsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQTBDLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVB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LElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xEQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxjQUFjQSxFQUFFQSxZQUFZQSxFQUFFQSxZQUFZQSxDQUFDQSxVQUFVQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN6RkEsQ0FBQ0E7SUFFRFosVUFBVUE7UUFDUmEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FDaEJBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ3ZCQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUN2QkEsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDakNBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQzdCQSxJQUFJQSxRQUFRQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUN0QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFFZkEsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsRUFBRUEsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDakRBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNB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YkEsS0FBS0EsT0FBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsT0FBT0EsQ0FBQ0E7UUFDYkEsS0FBS0EsTUFBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsUUFBUUEsQ0FBQ0E7UUFDZEEsS0FBS0EsT0FBT0E7WUFDVkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEE7WUFDRUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDakJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsZ0NBQWdDLElBQVk7SUFDMUNDLDJEQUEyREE7SUFDM0RBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE1BQU1BLENBQUNBO1FBQ1pBLEtBQUtBLFFBQVFBLENBQUNBO1FBQ2RBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE1BQU1BLENBQUNBO1FBQ1pBLEtBQUtBLFVBQVVBLENBQUNBO1FBQ2hCQSxLQUFLQSxLQUFLQSxDQUFDQTtRQUNYQSxLQUFLQSxHQUFHQSxDQUFDQTtRQUNUQSxLQUFLQSxTQUFTQSxDQUFDQTtRQUNmQSxLQUFLQSxVQUFVQSxDQUFDQTtRQUNoQkEsS0FBS0EsS0FBS0EsQ0FBQ0E7UUFDWEEsS0FBS0EsTUFBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsTUFBTUEsQ0FBQ0E7UUFDWkEsS0FBS0EsS0FBS0E7WUFDUkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEE7WUFDRUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDakJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsdUNBQXVDLElBQVk7SUFDakRDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ2JBLEtBQUtBLE9BQU9BLENBQUNBO1FBQ2JBLEtBQUtBLE1BQU1BLENBQUNBO1FBQ1pBLEtBQUtBLEtBQUtBLENBQUNBO1FBQ1hBLEtBQUtBLEtBQUtBLENBQUNBO1FBQ1hBLEtB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ZW50IjpbImltcG9ydCB7TnVtYmVyV3JhcHBlciwgU3RyaW5nV3JhcHBlciwgaXNQcmVzZW50LCByZXNvbHZlRW51bVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge2lzV2hpdGVzcGFjZSwgJEVPRiwgJEhBU0gsICRUSUxEQSwgJENBUkVULCAkUEVSQ0VOVCwgJCQsICRfLCAkQ09MT04sICRTUSwgJERRLCAkRVEsICRTTEFTSCwgJEJBQ0tTTEFTSCwgJFBFUklPRCwgJFNUQVIsICRQTFVTLCAkTFBBUkVOLCAkUlBBUkVOLCAkTEJSQUNFLCAkUkJSQUNFLCAkTEJSQUNLRVQsICRSQlJBQ0tFVCwgJFBJUEUsICRDT01NQSwgJFNFTUlDT0xPTiwgJE1JTlVTLCAkQkFORywgJFFVRVNUSU9OLCAkQVQsICRBTVBFUlNBTkQsICRHVCwgJGEsICRBLCAkeiwgJFosICQwLCAkOSwgJEZGLCAkQ1IsICRMRiwgJFZUQUJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9jaGFycyc7XG5cbmV4cG9ydCB7JEVPRiwgJEFULCAkUkJSQUNFLCAkTEJSQUNFLCAkTEJSQUNLRVQsICRSQlJBQ0tFVCwgJExQQVJFTiwgJFJQQVJFTiwgJENPTU1BLCAkQ09MT04sICRTRU1JQ09MT04sIGlzV2hpdGVzcGFjZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYXJzJztcblxuZXhwb3J0IGVudW0gQ3NzVG9rZW5UeXBlIHtcbiAgRU9GLFxuICBTdHJpbmcsXG4gIENvbW1lbnQsXG4gIElkZW50aWZpZXIsXG4gIE51bWJlcixcbiAgSWRlbnRpZmllck9yTnVtYmVyLFxuICBBdEtleXdvcmQsXG4gIENoYXJhY3RlcixcbiAgV2hpdGVzcGFjZSxcbiAgSW52YWxpZFxufVxuXG5leHBvcnQgZW51bSBDc3NMZXhlck1vZGUge1xuICBBTEwsXG4gIEFMTF9UUkFDS19XUyxcbiAgU0VMRUNUT1IsXG4gIFBTRVVET19TRUxFQ1RPUixcbiAgQVRUUklCVVRFX1NFTEVDVE9SLFxuICBBVF9SVUxFX1FVRVJZLFxuICBNRURJQV9RVUVSWSxcbiAgQkxPQ0ssXG4gIEtFWUZSQU1FX0JMT0NLLFxuICBTVFlMRV9CTE9DSyxcbiAgU1RZTEVfVkFMVUUsXG4gIFNUWUxFX1ZBTFVFX0ZVTkNUSU9OLFxuICBTVFlMRV9DQUxDX0ZVTkNUSU9OXG59XG5cbmV4cG9ydCBjbGFzcyBMZXhlZENzc1Jlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogQ3NzU2Nhbm5lckVycm9yLCBwdWJsaWMgdG9rZW46IENzc1Rva2VuKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVFcnJvck1lc3NhZ2UoXG4gICAgaW5wdXQ6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBlcnJvclZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIHJvdzogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke21lc3NhZ2V9IGF0IGNvbHVtbiAke3Jvd306JHtjb2x1bW59IGluIGV4cHJlc3Npb24gW2AgK1xuICAgICAgZmluZFByb2JsZW1Db2RlKGlucHV0LCBlcnJvclZhbHVlLCBpbmRleCwgY29sdW1uKSArICddJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRQcm9ibGVtQ29kZShcbiAgICBpbnB1dDogc3RyaW5nLCBlcnJvclZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKTogc3RyaW5nIHtcbiAgdmFyIGVuZE9mUHJvYmxlbUxpbmUgPSBpbmRleDtcbiAgdmFyIGN1cnJlbnQgPSBjaGFyQ29kZShpbnB1dCwgaW5kZXgpO1xuICB3aGlsZSAoY3VycmVudCA+IDAgJiYgIWlzTmV3bGluZShjdXJyZW50KSkge1xuICAgIGN1cnJlbnQgPSBjaGFyQ29kZShpbnB1dCwgKytlbmRPZlByb2JsZW1MaW5lKTtcbiAgfVxuICB2YXIgY2hvcHBlZFN0cmluZyA9IGlucHV0LnN1YnN0cmluZygwLCBlbmRPZlByb2JsZW1MaW5lKTtcbiAgdmFyIHBvaW50ZXJQYWRkaW5nID0gJyc7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1uOyBpKyspIHtcbiAgICBwb2ludGVyUGFkZGluZyArPSAnICc7XG4gIH1cbiAgdmFyIHBvaW50ZXJTdHJpbmcgPSAnJztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJvclZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgcG9pbnRlclN0cmluZyArPSAnXic7XG4gIH1cbiAgcmV0dXJuIGNob3BwZWRTdHJpbmcgKyAnXFxuJyArIHBvaW50ZXJQYWRkaW5nICsgcG9pbnRlclN0cmluZyArICdcXG4nO1xufVxuXG5leHBvcnQgY2xhc3MgQ3NzVG9rZW4ge1xuICBudW1WYWx1ZTogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgY29sdW1uOiBudW1iZXIsIHB1YmxpYyBsaW5lOiBudW1iZXIsIHB1YmxpYyB0eXBlOiBDc3NUb2tlblR5cGUsXG4gICAgICBwdWJsaWMgc3RyVmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMubnVtVmFsdWUgPSBjaGFyQ29kZShzdHJWYWx1ZSwgMCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0xleGVyIHtcbiAgc2Nhbih0ZXh0OiBzdHJpbmcsIHRyYWNrQ29tbWVudHM6IGJvb2xlYW4gPSBmYWxzZSk6IENzc1NjYW5uZXIge1xuICAgIHJldHVybiBuZXcgQ3NzU2Nhbm5lcih0ZXh0LCB0cmFja0NvbW1lbnRzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2Nhbm5lckVycm9yIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIHB1YmxpYyByYXdNZXNzYWdlOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuOiBDc3NUb2tlbiwgbWVzc2FnZSkge1xuICAgIHN1cGVyKCdDc3MgUGFyc2UgRXJyb3I6ICcgKyBtZXNzYWdlKTtcbiAgICB0aGlzLnJhd01lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMubWVzc2FnZTsgfVxufVxuXG5mdW5jdGlvbiBfdHJhY2tXaGl0ZXNwYWNlKG1vZGU6IENzc0xleGVyTW9kZSkge1xuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlIENzc0xleGVyTW9kZS5TRUxFQ1RPUjpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5BTExfVFJBQ0tfV1M6XG4gICAgY2FzZSBDc3NMZXhlck1vZGUuU1RZTEVfVkFMVUU6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NjYW5uZXIge1xuICBwZWVrOiBudW1iZXI7XG4gIHBlZWtQZWVrOiBudW1iZXI7XG4gIGxlbmd0aDogbnVtYmVyID0gMDtcbiAgaW5kZXg6IG51bWJlciA9IC0xO1xuICBjb2x1bW46IG51bWJlciA9IC0xO1xuICBsaW5lOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2N1cnJlbnRNb2RlOiBDc3NMZXhlck1vZGUgPSBDc3NMZXhlck1vZGUuQkxPQ0s7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2N1cnJlbnRFcnJvcjogQ3NzU2Nhbm5lckVycm9yID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5wdXQ6IHN0cmluZywgcHJpdmF0ZSBfdHJhY2tDb21tZW50czogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLmlucHV0Lmxlbmd0aDtcbiAgICB0aGlzLnBlZWtQZWVrID0gdGhpcy5wZWVrQXQoMCk7XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gIH1cblxuICBnZXRNb2RlKCk6IENzc0xleGVyTW9kZSB7IHJldHVybiB0aGlzLl9jdXJyZW50TW9kZTsgfVxuXG4gIHNldE1vZGUobW9kZTogQ3NzTGV4ZXJNb2RlKSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNb2RlICE9IG1vZGUpIHtcbiAgICAgIGlmIChfdHJhY2tXaGl0ZXNwYWNlKHRoaXMuX2N1cnJlbnRNb2RlKSkge1xuICAgICAgICB0aGlzLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jdXJyZW50TW9kZSA9IG1vZGU7XG4gICAgfVxuICB9XG5cbiAgYWR2YW5jZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuY29sdW1uID0gMDtcbiAgICAgIHRoaXMubGluZSsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbHVtbisrO1xuICAgIH1cblxuICAgIHRoaXMuaW5kZXgrKztcbiAgICB0aGlzLnBlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIHRoaXMucGVla1BlZWsgPSB0aGlzLnBlZWtBdCh0aGlzLmluZGV4ICsgMSk7XG4gIH1cblxuICBwZWVrQXQoaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGluZGV4ID49IHRoaXMubGVuZ3RoID8gJEVPRiA6IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdCh0aGlzLmlucHV0LCBpbmRleCk7XG4gIH1cblxuICBjb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuY29uc3VtZVdoaXRlc3BhY2UoKTtcbiAgICB3aGlsZSAodGhpcy5wZWVrID09ICRTRU1JQ09MT04pIHtcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN1bWVXaGl0ZXNwYWNlKCk6IHZvaWQge1xuICAgIHdoaWxlIChpc1doaXRlc3BhY2UodGhpcy5wZWVrKSB8fCBpc05ld2xpbmUodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICBpZiAoIXRoaXMuX3RyYWNrQ29tbWVudHMgJiYgaXNDb21tZW50U3RhcnQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cbiAgICAgICAgdGhpcy5hZHZhbmNlKCk7ICAvLyAqXG4gICAgICAgIHdoaWxlICghaXNDb21tZW50RW5kKHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBjb21tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuICAgICAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdW1lKHR5cGU6IENzc1Rva2VuVHlwZSwgdmFsdWU6IHN0cmluZyA9IG51bGwpOiBMZXhlZENzc1Jlc3VsdCB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLl9jdXJyZW50TW9kZTtcbiAgICB0aGlzLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFMTCk7XG5cbiAgICB2YXIgcHJldmlvdXNJbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHByZXZpb3VzTGluZSA9IHRoaXMubGluZTtcbiAgICB2YXIgcHJldmlvdXNDb2x1bW4gPSB0aGlzLmNvbHVtbjtcblxuICAgIHZhciBvdXRwdXQgPSB0aGlzLnNjYW4oKTtcblxuICAgIC8vIGp1c3QgaW5jYXNlIHRoZSBpbm5lciBzY2FuIG1ldGhvZCByZXR1cm5lZCBhbiBlcnJvclxuICAgIGlmIChpc1ByZXNlbnQob3V0cHV0LmVycm9yKSkge1xuICAgICAgdGhpcy5zZXRNb2RlKG1vZGUpO1xuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICB2YXIgbmV4dCA9IG91dHB1dC50b2tlbjtcbiAgICBpZiAoIWlzUHJlc2VudChuZXh0KSkge1xuICAgICAgbmV4dCA9IG5ldyBDc3NUb2tlbigwLCAwLCAwLCBDc3NUb2tlblR5cGUuRU9GLCAnZW5kIG9mIGZpbGUnKTtcbiAgICB9XG5cbiAgICB2YXIgaXNNYXRjaGluZ1R5cGU7XG4gICAgaWYgKHR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXJPck51bWJlcikge1xuICAgICAgLy8gVE9ETyAobWF0c2tvKTogaW1wbGVtZW50IGFycmF5IHRyYXZlcnNhbCBmb3IgbG9va3VwIGhlcmVcbiAgICAgIGlzTWF0Y2hpbmdUeXBlID0gbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5OdW1iZXIgfHwgbmV4dC50eXBlID09IENzc1Rva2VuVHlwZS5JZGVudGlmaWVyO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc01hdGNoaW5nVHlwZSA9IG5leHQudHlwZSA9PSB0eXBlO1xuICAgIH1cblxuICAgIC8vIGJlZm9yZSB0aHJvd2luZyB0aGUgZXJyb3Igd2UgbmVlZCB0byBicmluZyBiYWNrIHRoZSBmb3JtZXJcbiAgICAvLyBtb2RlIHNvIHRoYXQgdGhlIHBhcnNlciBjYW4gcmVjb3Zlci4uLlxuICAgIHRoaXMuc2V0TW9kZShtb2RlKTtcblxuICAgIHZhciBlcnJvciA9IG51bGw7XG4gICAgaWYgKCFpc01hdGNoaW5nVHlwZSB8fCAoaXNQcmVzZW50KHZhbHVlKSAmJiB2YWx1ZSAhPSBuZXh0LnN0clZhbHVlKSkge1xuICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IHJlc29sdmVFbnVtVG9rZW4oQ3NzVG9rZW5UeXBlLCBuZXh0LnR5cGUpICsgJyBkb2VzIG5vdCBtYXRjaCBleHBlY3RlZCAnICtcbiAgICAgICAgICByZXNvbHZlRW51bVRva2VuKENzc1Rva2VuVHlwZSwgdHlwZSkgKyAnIHZhbHVlJztcblxuICAgICAgaWYgKGlzUHJlc2VudCh2YWx1ZSkpIHtcbiAgICAgICAgZXJyb3JNZXNzYWdlICs9ICcgKFwiJyArIG5leHQuc3RyVmFsdWUgKyAnXCIgc2hvdWxkIG1hdGNoIFwiJyArIHZhbHVlICsgJ1wiKSc7XG4gICAgICB9XG5cbiAgICAgIGVycm9yID0gbmV3IENzc1NjYW5uZXJFcnJvcihcbiAgICAgICAgICBuZXh0LCBnZW5lcmF0ZUVycm9yTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dCwgZXJyb3JNZXNzYWdlLCBuZXh0LnN0clZhbHVlLCBwcmV2aW91c0luZGV4LCBwcmV2aW91c0xpbmUsXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ29sdW1uKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMZXhlZENzc1Jlc3VsdChlcnJvciwgbmV4dCk7XG4gIH1cblxuXG4gIHNjYW4oKTogTGV4ZWRDc3NSZXN1bHQge1xuICAgIHZhciB0cmFja1dTID0gX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSk7XG4gICAgaWYgKHRoaXMuaW5kZXggPT0gMCAmJiAhdHJhY2tXUykgeyAgLy8gZmlyc3Qgc2NhblxuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcbiAgICBpZiAodG9rZW4gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZXJyb3IgPSB0aGlzLl9jdXJyZW50RXJyb3I7XG4gICAgdGhpcy5fY3VycmVudEVycm9yID0gbnVsbDtcblxuICAgIGlmICghdHJhY2tXUykge1xuICAgICAgdGhpcy5jb25zdW1lV2hpdGVzcGFjZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IExleGVkQ3NzUmVzdWx0KGVycm9yLCB0b2tlbik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zY2FuKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgcGVlayA9IHRoaXMucGVlaztcbiAgICB2YXIgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzQ29tbWVudFN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgLy8gZXZlbiBpZiBjb21tZW50cyBhcmUgbm90IHRyYWNrZWQgd2Ugc3RpbGwgbGV4IHRoZVxuICAgICAgLy8gY29tbWVudCBzbyB3ZSBjYW4gbW92ZSB0aGUgcG9pbnRlciBmb3J3YXJkXG4gICAgICB2YXIgY29tbWVudFRva2VuID0gdGhpcy5zY2FuQ29tbWVudCgpO1xuICAgICAgaWYgKHRoaXMuX3RyYWNrQ29tbWVudHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbW1lbnRUb2tlbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX3RyYWNrV2hpdGVzcGFjZSh0aGlzLl9jdXJyZW50TW9kZSkgJiYgKGlzV2hpdGVzcGFjZShwZWVrKSB8fCBpc05ld2xpbmUocGVlaykpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuV2hpdGVzcGFjZSgpO1xuICAgIH1cblxuICAgIHBlZWsgPSB0aGlzLnBlZWs7XG4gICAgcGVla1BlZWsgPSB0aGlzLnBlZWtQZWVrO1xuICAgIGlmIChwZWVrID09ICRFT0YpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGlzU3RyaW5nU3RhcnQocGVlaywgcGVla1BlZWspKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgLy8gc29tZXRoaW5nIGxpa2UgdXJsKGNvb2wpXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNb2RlID09IENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRV9GVU5DVElPTikge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbkNzc1ZhbHVlRnVuY3Rpb24oKTtcbiAgICB9XG5cbiAgICB2YXIgaXNNb2RpZmllciA9IHBlZWsgPT0gJFBMVVMgfHwgcGVlayA9PSAkTUlOVVM7XG4gICAgdmFyIGRpZ2l0QSA9IGlzTW9kaWZpZXIgPyBmYWxzZSA6IGlzRGlnaXQocGVlayk7XG4gICAgdmFyIGRpZ2l0QiA9IGlzRGlnaXQocGVla1BlZWspO1xuICAgIGlmIChkaWdpdEEgfHwgKGlzTW9kaWZpZXIgJiYgKHBlZWtQZWVrID09ICRQRVJJT0QgfHwgZGlnaXRCKSkgfHwgKHBlZWsgPT0gJFBFUklPRCAmJiBkaWdpdEIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuTnVtYmVyKCk7XG4gICAgfVxuXG4gICAgaWYgKHBlZWsgPT0gJEFUKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQXRFeHByZXNzaW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHBlZWssIHBlZWtQZWVrKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICB9XG5cbiAgICBpZiAoaXNWYWxpZENzc0NoYXJhY3RlcihwZWVrLCB0aGlzLl9jdXJyZW50TW9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjYW5DaGFyYWN0ZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgWyR7U3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUocGVlayl9XWApO1xuICB9XG5cbiAgc2NhbkNvbW1lbnQoKTogQ3NzVG9rZW4ge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihcbiAgICAgICAgICAgIGlzQ29tbWVudFN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksICdFeHBlY3RlZCBjb21tZW50IHN0YXJ0IHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIHN0YXJ0aW5nTGluZSA9IHRoaXMubGluZTtcblxuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gL1xuICAgIHRoaXMuYWR2YW5jZSgpOyAgLy8gKlxuXG4gICAgd2hpbGUgKCFpc0NvbW1lbnRFbmQodGhpcy5wZWVrLCB0aGlzLnBlZWtQZWVrKSkge1xuICAgICAgaWYgKHRoaXMucGVlayA9PSAkRU9GKSB7XG4gICAgICAgIHRoaXMuZXJyb3IoJ1VudGVybWluYXRlZCBjb21tZW50Jyk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vICpcbiAgICB0aGlzLmFkdmFuY2UoKTsgIC8vIC9cblxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLkNvbW1lbnQsIHN0cik7XG4gIH1cblxuICBzY2FuV2hpdGVzcGFjZSgpOiBDc3NUb2tlbiB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgc3RhcnRpbmdDb2x1bW4gPSB0aGlzLmNvbHVtbjtcbiAgICB2YXIgc3RhcnRpbmdMaW5lID0gdGhpcy5saW5lO1xuICAgIHdoaWxlIChpc1doaXRlc3BhY2UodGhpcy5wZWVrKSAmJiB0aGlzLnBlZWsgIT0gJEVPRikge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLldoaXRlc3BhY2UsIHN0cik7XG4gIH1cblxuICBzY2FuU3RyaW5nKCk6IENzc1Rva2VuIHtcbiAgICBpZiAodGhpcy5hc3NlcnRDb25kaXRpb24oXG4gICAgICAgICAgICBpc1N0cmluZ1N0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksICdVbmV4cGVjdGVkIG5vbi1zdHJpbmcgc3RhcnRpbmcgdmFsdWUnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHRhcmdldCA9IHRoaXMucGVlaztcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIHZhciBzdGFydGluZ0xpbmUgPSB0aGlzLmxpbmU7XG4gICAgdmFyIHByZXZpb3VzID0gdGFyZ2V0O1xuICAgIHRoaXMuYWR2YW5jZSgpO1xuXG4gICAgd2hpbGUgKCFpc0NoYXJNYXRjaCh0YXJnZXQsIHByZXZpb3VzLCB0aGlzLnBlZWspKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRFT0YgfHwgaXNOZXdsaW5lKHRoaXMucGVlaykpIHtcbiAgICAgICAgdGhpcy5lcnJvcignVW50ZXJtaW5hdGVkIHF1b3RlJyk7XG4gICAgICB9XG4gICAgICBwcmV2aW91cyA9IHRoaXMucGVlaztcbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbih0aGlzLnBlZWsgPT0gdGFyZ2V0LCAnVW50ZXJtaW5hdGVkIHF1b3RlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHZhciBzdHIgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHN0YXJ0aW5nTGluZSwgQ3NzVG9rZW5UeXBlLlN0cmluZywgc3RyKTtcbiAgfVxuXG4gIHNjYW5OdW1iZXIoKTogQ3NzVG9rZW4ge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgaWYgKHRoaXMucGVlayA9PSAkUExVUyB8fCB0aGlzLnBlZWsgPT0gJE1JTlVTKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHBlcmlvZFVzZWQgPSBmYWxzZTtcbiAgICB3aGlsZSAoaXNEaWdpdCh0aGlzLnBlZWspIHx8IHRoaXMucGVlayA9PSAkUEVSSU9EKSB7XG4gICAgICBpZiAodGhpcy5wZWVrID09ICRQRVJJT0QpIHtcbiAgICAgICAgaWYgKHBlcmlvZFVzZWQpIHtcbiAgICAgICAgICB0aGlzLmVycm9yKCdVbmV4cGVjdGVkIHVzZSBvZiBhIHNlY29uZCBwZXJpb2QgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgICAgICBwZXJpb2RVc2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgIH1cbiAgICB2YXIgc3RyVmFsdWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLk51bWJlciwgc3RyVmFsdWUpO1xuICB9XG5cbiAgc2NhbklkZW50aWZpZXIoKTogQ3NzVG9rZW4ge1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihcbiAgICAgICAgICAgIGlzSWRlbnRpZmllclN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlayksICdFeHBlY3RlZCBpZGVudGlmaWVyIHN0YXJ0aW5nIHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgd2hpbGUgKGlzSWRlbnRpZmllclBhcnQodGhpcy5wZWVrKSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBzdHJWYWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gbmV3IENzc1Rva2VuKHN0YXJ0LCBzdGFydGluZ0NvbHVtbiwgdGhpcy5saW5lLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllciwgc3RyVmFsdWUpO1xuICB9XG5cbiAgc2NhbkNzc1ZhbHVlRnVuY3Rpb24oKTogQ3NzVG9rZW4ge1xuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPSAkRU9GICYmIHRoaXMucGVlayAhPSAkUlBBUkVOKSB7XG4gICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIHN0clZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyLCBzdHJWYWx1ZSk7XG4gIH1cblxuICBzY2FuQ2hhcmFjdGVyKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIHZhciBzdGFydGluZ0NvbHVtbiA9IHRoaXMuY29sdW1uO1xuICAgIGlmICh0aGlzLmFzc2VydENvbmRpdGlvbihcbiAgICAgICAgICAgIGlzVmFsaWRDc3NDaGFyYWN0ZXIodGhpcy5wZWVrLCB0aGlzLl9jdXJyZW50TW9kZSksXG4gICAgICAgICAgICBjaGFyU3RyKHRoaXMucGVlaykgKyAnIGlzIG5vdCBhIHZhbGlkIENTUyBjaGFyYWN0ZXInKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGMgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAxKTtcbiAgICB0aGlzLmFkdmFuY2UoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzVG9rZW4oc3RhcnQsIHN0YXJ0aW5nQ29sdW1uLCB0aGlzLmxpbmUsIENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsIGMpO1xuICB9XG5cbiAgc2NhbkF0RXhwcmVzc2lvbigpOiBDc3NUb2tlbiB7XG4gICAgaWYgKHRoaXMuYXNzZXJ0Q29uZGl0aW9uKHRoaXMucGVlayA9PSAkQVQsICdFeHBlY3RlZCBAIHZhbHVlJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHN0YXJ0aW5nQ29sdW1uID0gdGhpcy5jb2x1bW47XG4gICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMucGVlaywgdGhpcy5wZWVrUGVlaykpIHtcbiAgICAgIHZhciBpZGVudCA9IHRoaXMuc2NhbklkZW50aWZpZXIoKTtcbiAgICAgIHZhciBzdHJWYWx1ZSA9ICdAJyArIGlkZW50LnN0clZhbHVlO1xuICAgICAgcmV0dXJuIG5ldyBDc3NUb2tlbihzdGFydCwgc3RhcnRpbmdDb2x1bW4sIHRoaXMubGluZSwgQ3NzVG9rZW5UeXBlLkF0S2V5d29yZCwgc3RyVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zY2FuQ2hhcmFjdGVyKCk7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0Q29uZGl0aW9uKHN0YXR1czogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgdGhpcy5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXJyb3JUb2tlblZhbHVlOiBzdHJpbmcgPSBudWxsLCBkb05vdEFkdmFuY2U6IGJvb2xlYW4gPSBmYWxzZSk6IENzc1Rva2VuIHtcbiAgICB2YXIgaW5kZXg6IG51bWJlciA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIGNvbHVtbjogbnVtYmVyID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIGxpbmU6IG51bWJlciA9IHRoaXMubGluZTtcbiAgICBlcnJvclRva2VuVmFsdWUgPVxuICAgICAgICBpc1ByZXNlbnQoZXJyb3JUb2tlblZhbHVlKSA/IGVycm9yVG9rZW5WYWx1ZSA6IFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKHRoaXMucGVlayk7XG4gICAgdmFyIGludmFsaWRUb2tlbiA9IG5ldyBDc3NUb2tlbihpbmRleCwgY29sdW1uLCBsaW5lLCBDc3NUb2tlblR5cGUuSW52YWxpZCwgZXJyb3JUb2tlblZhbHVlKTtcbiAgICB2YXIgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgZ2VuZXJhdGVFcnJvck1lc3NhZ2UodGhpcy5pbnB1dCwgbWVzc2FnZSwgZXJyb3JUb2tlblZhbHVlLCBpbmRleCwgbGluZSwgY29sdW1uKTtcbiAgICBpZiAoIWRvTm90QWR2YW5jZSkge1xuICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRFcnJvciA9IG5ldyBDc3NTY2FubmVyRXJyb3IoaW52YWxpZFRva2VuLCBlcnJvck1lc3NhZ2UpO1xuICAgIHJldHVybiBpbnZhbGlkVG9rZW47XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBdEtleXdvcmQoY3VycmVudDogQ3NzVG9rZW4sIG5leHQ6IENzc1Rva2VuKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50Lm51bVZhbHVlID09ICRBVCAmJiBuZXh0LnR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXI7XG59XG5cbmZ1bmN0aW9uIGlzQ2hhck1hdGNoKHRhcmdldDogbnVtYmVyLCBwcmV2aW91czogbnVtYmVyLCBjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gdGFyZ2V0ICYmIHByZXZpb3VzICE9ICRCQUNLU0xBU0g7XG59XG5cbmZ1bmN0aW9uIGlzRGlnaXQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAkMCA8PSBjb2RlICYmIGNvZGUgPD0gJDk7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWVudFN0YXJ0KGNvZGU6IG51bWJlciwgbmV4dDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRTTEFTSCAmJiBuZXh0ID09ICRTVEFSO1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnRFbmQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNUQVIgJiYgbmV4dCA9PSAkU0xBU0g7XG59XG5cbmZ1bmN0aW9uIGlzU3RyaW5nU3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgdmFyIHRhcmdldCA9IGNvZGU7XG4gIGlmICh0YXJnZXQgPT0gJEJBQ0tTTEFTSCkge1xuICAgIHRhcmdldCA9IG5leHQ7XG4gIH1cbiAgcmV0dXJuIHRhcmdldCA9PSAkRFEgfHwgdGFyZ2V0ID09ICRTUTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyU3RhcnQoY29kZTogbnVtYmVyLCBuZXh0OiBudW1iZXIpOiBib29sZWFuIHtcbiAgdmFyIHRhcmdldCA9IGNvZGU7XG4gIGlmICh0YXJnZXQgPT0gJE1JTlVTKSB7XG4gICAgdGFyZ2V0ID0gbmV4dDtcbiAgfVxuXG4gIHJldHVybiAoJGEgPD0gdGFyZ2V0ICYmIHRhcmdldCA8PSAkeikgfHwgKCRBIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJFopIHx8IHRhcmdldCA9PSAkQkFDS1NMQVNIIHx8XG4gICAgICB0YXJnZXQgPT0gJE1JTlVTIHx8IHRhcmdldCA9PSAkXztcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyUGFydCh0YXJnZXQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKCRhIDw9IHRhcmdldCAmJiB0YXJnZXQgPD0gJHopIHx8ICgkQSA8PSB0YXJnZXQgJiYgdGFyZ2V0IDw9ICRaKSB8fCB0YXJnZXQgPT0gJEJBQ0tTTEFTSCB8fFxuICAgICAgdGFyZ2V0ID09ICRNSU5VUyB8fCB0YXJnZXQgPT0gJF8gfHwgaXNEaWdpdCh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRLZXlmcmFtZUJsb2NrQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkUEVSQ0VOVDtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZEF0dHJpYnV0ZVNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyB2YWx1ZV4qfCR+PXNvbWV0aGluZ1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICQkOlxuICAgIGNhc2UgJFBJUEU6XG4gICAgY2FzZSAkQ0FSRVQ6XG4gICAgY2FzZSAkVElMREE6XG4gICAgY2FzZSAkU1RBUjpcbiAgICBjYXNlICRFUTpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZFNlbGVjdG9yQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBzZWxlY3RvciBbIGtleSAgID0gdmFsdWUgXVxuICAvLyBJREVOVCAgICBDIElERU5UIEMgSURFTlQgQ1xuICAvLyAjaWQsIC5jbGFzcywgKit+PlxuICAvLyB0YWc6UFNFVURPXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEhBU0g6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFRJTERBOlxuICAgIGNhc2UgJFNUQVI6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRHVDpcbiAgICBjYXNlICRDT0xPTjpcbiAgICBjYXNlICRQSVBFOlxuICAgIGNhc2UgJENPTU1BOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8ga2V5OnZhbHVlO1xuICAvLyBrZXk6Y2FsYyhzb21ldGhpbmcgLi4uIClcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkSEFTSDpcbiAgICBjYXNlICRTRU1JQ09MT046XG4gICAgY2FzZSAkQ09MT046XG4gICAgY2FzZSAkUEVSQ0VOVDpcbiAgICBjYXNlICRTTEFTSDpcbiAgICBjYXNlICRCQUNLU0xBU0g6XG4gICAgY2FzZSAkQkFORzpcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkTFBBUkVOOlxuICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyAobWluLXdpZHRoOiA3LjVlbSkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKVxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQXRSdWxlQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBAZG9jdW1lbnQgdXJsKGh0dHA6Ly93d3cudzMub3JnL3BhZ2U/c29tZXRoaW5nPW9uI2hhc2gpLFxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRMUEFSRU46XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgIGNhc2UgJENPTE9OOlxuICAgIGNhc2UgJFBFUkNFTlQ6XG4gICAgY2FzZSAkUEVSSU9EOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJEJBQ0tTTEFTSDpcbiAgICBjYXNlICRIQVNIOlxuICAgIGNhc2UgJEVROlxuICAgIGNhc2UgJFFVRVNUSU9OOlxuICAgIGNhc2UgJEFNUEVSU0FORDpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJENPTU1BOlxuICAgIGNhc2UgJE1JTlVTOlxuICAgIGNhc2UgJFBMVVM6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHlsZUZ1bmN0aW9uQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlICRQRVJJT0Q6XG4gICAgY2FzZSAkTUlOVVM6XG4gICAgY2FzZSAkUExVUzpcbiAgICBjYXNlICRTVEFSOlxuICAgIGNhc2UgJFNMQVNIOlxuICAgIGNhc2UgJExQQVJFTjpcbiAgICBjYXNlICRSUEFSRU46XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRCbG9ja0NoYXJhY3Rlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gQHNvbWV0aGluZyB7IH1cbiAgLy8gSURFTlRcbiAgcmV0dXJuIGNvZGUgPT0gJEFUO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkQ3NzQ2hhcmFjdGVyKGNvZGU6IG51bWJlciwgbW9kZTogQ3NzTGV4ZXJNb2RlKTogYm9vbGVhbiB7XG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLkFMTDpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5BTExfVFJBQ0tfV1M6XG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SOlxuICAgICAgcmV0dXJuIGlzVmFsaWRTZWxlY3RvckNoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlBTRVVET19TRUxFQ1RPUjpcbiAgICAgIHJldHVybiBpc1ZhbGlkUHNldWRvU2VsZWN0b3JDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1I6XG4gICAgICByZXR1cm4gaXNWYWxpZEF0dHJpYnV0ZVNlbGVjdG9yQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuTUVESUFfUVVFUlk6XG4gICAgICByZXR1cm4gaXNWYWxpZE1lZGlhUXVlcnlSdWxlQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuQVRfUlVMRV9RVUVSWTpcbiAgICAgIHJldHVybiBpc1ZhbGlkQXRSdWxlQ2hhcmFjdGVyKGNvZGUpO1xuXG4gICAgY2FzZSBDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0s6XG4gICAgICByZXR1cm4gaXNWYWxpZEtleWZyYW1lQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9CTE9DSzpcbiAgICBjYXNlIENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRTpcbiAgICAgIHJldHVybiBpc1ZhbGlkU3R5bGVCbG9ja0NoYXJhY3Rlcihjb2RlKTtcblxuICAgIGNhc2UgQ3NzTGV4ZXJNb2RlLlNUWUxFX0NBTENfRlVOQ1RJT046XG4gICAgICByZXR1cm4gaXNWYWxpZFN0eWxlRnVuY3Rpb25DaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBjYXNlIENzc0xleGVyTW9kZS5CTE9DSzpcbiAgICAgIHJldHVybiBpc1ZhbGlkQmxvY2tDaGFyYWN0ZXIoY29kZSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJDb2RlKGlucHV0LCBpbmRleCk6IG51bWJlciB7XG4gIHJldHVybiBpbmRleCA+PSBpbnB1dC5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGlucHV0LCBpbmRleCk7XG59XG5cbmZ1bmN0aW9uIGNoYXJTdHIoY29kZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKGNvZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOZXdsaW5lKGNvZGUpOiBib29sZWFuIHtcbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAkRkY6XG4gICAgY2FzZSAkQ1I6XG4gICAgY2FzZSAkTEY6XG4gICAgY2FzZSAkVlRBQjpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19