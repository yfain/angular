import { StringWrapper, NumberWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { ParseLocation, ParseError, ParseSourceFile, ParseSourceSpan } from './parse_util';
import { getHtmlTagDefinition, HtmlTagContentType, NAMED_ENTITIES } from './html_tags';
export var HtmlTokenType;
(function (HtmlTokenType) {
    HtmlTokenType[HtmlTokenType["TAG_OPEN_START"] = 0] = "TAG_OPEN_START";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END"] = 1] = "TAG_OPEN_END";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END_VOID"] = 2] = "TAG_OPEN_END_VOID";
    HtmlTokenType[HtmlTokenType["TAG_CLOSE"] = 3] = "TAG_CLOSE";
    HtmlTokenType[HtmlTokenType["TEXT"] = 4] = "TEXT";
    HtmlTokenType[HtmlTokenType["ESCAPABLE_RAW_TEXT"] = 5] = "ESCAPABLE_RAW_TEXT";
    HtmlTokenType[HtmlTokenType["RAW_TEXT"] = 6] = "RAW_TEXT";
    HtmlTokenType[HtmlTokenType["COMMENT_START"] = 7] = "COMMENT_START";
    HtmlTokenType[HtmlTokenType["COMMENT_END"] = 8] = "COMMENT_END";
    HtmlTokenType[HtmlTokenType["CDATA_START"] = 9] = "CDATA_START";
    HtmlTokenType[HtmlTokenType["CDATA_END"] = 10] = "CDATA_END";
    HtmlTokenType[HtmlTokenType["ATTR_NAME"] = 11] = "ATTR_NAME";
    HtmlTokenType[HtmlTokenType["ATTR_VALUE"] = 12] = "ATTR_VALUE";
    HtmlTokenType[HtmlTokenType["DOC_TYPE"] = 13] = "DOC_TYPE";
    HtmlTokenType[HtmlTokenType["EOF"] = 14] = "EOF";
})(HtmlTokenType || (HtmlTokenType = {}));
export class HtmlToken {
    constructor(type, parts, sourceSpan) {
        this.type = type;
        this.parts = parts;
        this.sourceSpan = sourceSpan;
    }
}
export class HtmlTokenError extends ParseError {
    constructor(errorMsg, tokenType, span) {
        super(span, errorMsg);
        this.tokenType = tokenType;
    }
}
export class HtmlTokenizeResult {
    constructor(tokens, errors) {
        this.tokens = tokens;
        this.errors = errors;
    }
}
export function tokenizeHtml(sourceContent, sourceUrl) {
    return new _HtmlTokenizer(new ParseSourceFile(sourceContent, sourceUrl)).tokenize();
}
const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $FF = 12;
const $CR = 13;
const $SPACE = 32;
const $BANG = 33;
const $DQ = 34;
const $HASH = 35;
const $$ = 36;
const $AMPERSAND = 38;
const $SQ = 39;
const $MINUS = 45;
const $SLASH = 47;
const $0 = 48;
const $SEMICOLON = 59;
const $9 = 57;
const $COLON = 58;
const $LT = 60;
const $EQ = 61;
const $GT = 62;
const $QUESTION = 63;
const $LBRACKET = 91;
const $RBRACKET = 93;
const $A = 65;
const $F = 70;
const $X = 88;
const $Z = 90;
const $a = 97;
const $f = 102;
const $z = 122;
const $x = 120;
const $NBSP = 160;
var CR_OR_CRLF_REGEXP = /\r\n?/g;
function unexpectedCharacterErrorMsg(charCode) {
    var char = charCode === $EOF ? 'EOF' : StringWrapper.fromCharCode(charCode);
    return `Unexpected character "${char}"`;
}
function unknownEntityErrorMsg(entitySrc) {
    return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
class ControlFlowError {
    constructor(error) {
        this.error = error;
    }
}
// See http://www.w3.org/TR/html51/syntax.html#writing
class _HtmlTokenizer {
    constructor(file) {
        this.file = file;
        // Note: this is always lowercase!
        this.peek = -1;
        this.index = -1;
        this.line = 0;
        this.column = -1;
        this.tokens = [];
        this.errors = [];
        this.input = file.content;
        this.length = file.content.length;
        this._advance();
    }
    _processCarriageReturns(content) {
        // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
        // In order to keep the original position in the source, we can not
        // pre-process it.
        // Instead CRs are processed right before instantiating the tokens.
        return StringWrapper.replaceAll(content, CR_OR_CRLF_REGEXP, '\n');
    }
    tokenize() {
        while (this.peek !== $EOF) {
            var start = this._getLocation();
            try {
                if (this._attemptCharCode($LT)) {
                    if (this._attemptCharCode($BANG)) {
                        if (this._attemptCharCode($LBRACKET)) {
                            this._consumeCdata(start);
                        }
                        else if (this._attemptCharCode($MINUS)) {
                            this._consumeComment(start);
                        }
                        else {
                            this._consumeDocType(start);
                        }
                    }
                    else if (this._attemptCharCode($SLASH)) {
                        this._consumeTagClose(start);
                    }
                    else {
                        this._consumeTagOpen(start);
                    }
                }
                else {
                    this._consumeText();
                }
            }
            catch (e) {
                if (e instanceof ControlFlowError) {
                    this.errors.push(e.error);
                }
                else {
                    throw e;
                }
            }
        }
        this._beginToken(HtmlTokenType.EOF);
        this._endToken([]);
        return new HtmlTokenizeResult(mergeTextTokens(this.tokens), this.errors);
    }
    _getLocation() {
        return new ParseLocation(this.file, this.index, this.line, this.column);
    }
    _getSpan(start, end) {
        if (isBlank(start)) {
            start = this._getLocation();
        }
        if (isBlank(end)) {
            end = this._getLocation();
        }
        return new ParseSourceSpan(start, end);
    }
    _beginToken(type, start = null) {
        if (isBlank(start)) {
            start = this._getLocation();
        }
        this.currentTokenStart = start;
        this.currentTokenType = type;
    }
    _endToken(parts, end = null) {
        if (isBlank(end)) {
            end = this._getLocation();
        }
        var token = new HtmlToken(this.currentTokenType, parts, new ParseSourceSpan(this.currentTokenStart, end));
        this.tokens.push(token);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return token;
    }
    _createError(msg, span) {
        var error = new HtmlTokenError(msg, this.currentTokenType, span);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return new ControlFlowError(error);
    }
    _advance() {
        if (this.index >= this.length) {
            throw this._createError(unexpectedCharacterErrorMsg($EOF), this._getSpan());
        }
        if (this.peek === $LF) {
            this.line++;
            this.column = 0;
        }
        else if (this.peek !== $LF && this.peek !== $CR) {
            this.column++;
        }
        this.index++;
        this.peek = this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
    }
    _attemptCharCode(charCode) {
        if (this.peek === charCode) {
            this._advance();
            return true;
        }
        return false;
    }
    _attemptCharCodeCaseInsensitive(charCode) {
        if (compareCharCodeCaseInsensitive(this.peek, charCode)) {
            this._advance();
            return true;
        }
        return false;
    }
    _requireCharCode(charCode) {
        var location = this._getLocation();
        if (!this._attemptCharCode(charCode)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(location, location));
        }
    }
    _attemptStr(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCode(StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    }
    _attemptStrCaseInsensitive(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCodeCaseInsensitive(StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    }
    _requireStr(chars) {
        var location = this._getLocation();
        if (!this._attemptStr(chars)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(location));
        }
    }
    _attemptCharCodeUntilFn(predicate) {
        while (!predicate(this.peek)) {
            this._advance();
        }
    }
    _requireCharCodeUntilFn(predicate, len) {
        var start = this._getLocation();
        this._attemptCharCodeUntilFn(predicate);
        if (this.index - start.offset < len) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan(start, start));
        }
    }
    _attemptUntilChar(char) {
        while (this.peek !== char) {
            this._advance();
        }
    }
    _readChar(decodeEntities) {
        if (decodeEntities && this.peek === $AMPERSAND) {
            return this._decodeEntity();
        }
        else {
            var index = this.index;
            this._advance();
            return this.input[index];
        }
    }
    _decodeEntity() {
        var start = this._getLocation();
        this._advance();
        if (this._attemptCharCode($HASH)) {
            let isHex = this._attemptCharCode($x) || this._attemptCharCode($X);
            let numberStart = this._getLocation().offset;
            this._attemptCharCodeUntilFn(isDigitEntityEnd);
            if (this.peek != $SEMICOLON) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
            }
            this._advance();
            let strNum = this.input.substring(numberStart, this.index - 1);
            try {
                let charCode = NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
                return StringWrapper.fromCharCode(charCode);
            }
            catch (e) {
                let entity = this.input.substring(start.offset + 1, this.index - 1);
                throw this._createError(unknownEntityErrorMsg(entity), this._getSpan(start));
            }
        }
        else {
            let startPosition = this._savePosition();
            this._attemptCharCodeUntilFn(isNamedEntityEnd);
            if (this.peek != $SEMICOLON) {
                this._restorePosition(startPosition);
                return '&';
            }
            this._advance();
            let name = this.input.substring(start.offset + 1, this.index - 1);
            let char = NAMED_ENTITIES[name];
            if (isBlank(char)) {
                throw this._createError(unknownEntityErrorMsg(name), this._getSpan(start));
            }
            return char;
        }
    }
    _consumeRawText(decodeEntities, firstCharOfEnd, attemptEndRest) {
        var tagCloseStart;
        var textStart = this._getLocation();
        this._beginToken(decodeEntities ? HtmlTokenType.ESCAPABLE_RAW_TEXT : HtmlTokenType.RAW_TEXT, textStart);
        var parts = [];
        while (true) {
            tagCloseStart = this._getLocation();
            if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
                break;
            }
            if (this.index > tagCloseStart.offset) {
                parts.push(this.input.substring(tagCloseStart.offset, this.index));
            }
            while (this.peek !== firstCharOfEnd) {
                parts.push(this._readChar(decodeEntities));
            }
        }
        return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
    }
    _consumeComment(start) {
        this._beginToken(HtmlTokenType.COMMENT_START, start);
        this._requireCharCode($MINUS);
        this._endToken([]);
        var textToken = this._consumeRawText(false, $MINUS, () => this._attemptStr('->'));
        this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
        this._endToken([]);
    }
    _consumeCdata(start) {
        this._beginToken(HtmlTokenType.CDATA_START, start);
        this._requireStr('CDATA[');
        this._endToken([]);
        var textToken = this._consumeRawText(false, $RBRACKET, () => this._attemptStr(']>'));
        this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
        this._endToken([]);
    }
    _consumeDocType(start) {
        this._beginToken(HtmlTokenType.DOC_TYPE, start);
        this._attemptUntilChar($GT);
        this._advance();
        this._endToken([this.input.substring(start.offset + 2, this.index - 1)]);
    }
    _consumePrefixAndName() {
        var nameOrPrefixStart = this.index;
        var prefix = null;
        while (this.peek !== $COLON && !isPrefixEnd(this.peek)) {
            this._advance();
        }
        var nameStart;
        if (this.peek === $COLON) {
            this._advance();
            prefix = this.input.substring(nameOrPrefixStart, this.index - 1);
            nameStart = this.index;
        }
        else {
            nameStart = nameOrPrefixStart;
        }
        this._requireCharCodeUntilFn(isNameEnd, this.index === nameStart ? 1 : 0);
        var name = this.input.substring(nameStart, this.index);
        return [prefix, name];
    }
    _consumeTagOpen(start) {
        let savedPos = this._savePosition();
        let lowercaseTagName;
        try {
            if (!isAsciiLetter(this.peek)) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getSpan());
            }
            var nameStart = this.index;
            this._consumeTagOpenStart(start);
            lowercaseTagName = this.input.substring(nameStart, this.index).toLowerCase();
            this._attemptCharCodeUntilFn(isNotWhitespace);
            while (this.peek !== $SLASH && this.peek !== $GT) {
                this._consumeAttributeName();
                this._attemptCharCodeUntilFn(isNotWhitespace);
                if (this._attemptCharCode($EQ)) {
                    this._attemptCharCodeUntilFn(isNotWhitespace);
                    this._consumeAttributeValue();
                }
                this._attemptCharCodeUntilFn(isNotWhitespace);
            }
            this._consumeTagOpenEnd();
        }
        catch (e) {
            if (e instanceof ControlFlowError) {
                // When the start tag is invalid, assume we want a "<"
                this._restorePosition(savedPos);
                // Back to back text tokens are merged at the end
                this._beginToken(HtmlTokenType.TEXT, start);
                this._endToken(['<']);
                return;
            }
            throw e;
        }
        var contentTokenType = getHtmlTagDefinition(lowercaseTagName).contentType;
        if (contentTokenType === HtmlTagContentType.RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, false);
        }
        else if (contentTokenType === HtmlTagContentType.ESCAPABLE_RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, true);
        }
    }
    _consumeRawTextWithTagClose(lowercaseTagName, decodeEntities) {
        var textToken = this._consumeRawText(decodeEntities, $LT, () => {
            if (!this._attemptCharCode($SLASH))
                return false;
            this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!this._attemptStrCaseInsensitive(lowercaseTagName))
                return false;
            this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!this._attemptCharCode($GT))
                return false;
            return true;
        });
        this._beginToken(HtmlTokenType.TAG_CLOSE, textToken.sourceSpan.end);
        this._endToken([null, lowercaseTagName]);
    }
    _consumeTagOpenStart(start) {
        this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
        var parts = this._consumePrefixAndName();
        this._endToken(parts);
    }
    _consumeAttributeName() {
        this._beginToken(HtmlTokenType.ATTR_NAME);
        var prefixAndName = this._consumePrefixAndName();
        this._endToken(prefixAndName);
    }
    _consumeAttributeValue() {
        this._beginToken(HtmlTokenType.ATTR_VALUE);
        var value;
        if (this.peek === $SQ || this.peek === $DQ) {
            var quoteChar = this.peek;
            this._advance();
            var parts = [];
            while (this.peek !== quoteChar) {
                parts.push(this._readChar(true));
            }
            value = parts.join('');
            this._advance();
        }
        else {
            var valueStart = this.index;
            this._requireCharCodeUntilFn(isNameEnd, 1);
            value = this.input.substring(valueStart, this.index);
        }
        this._endToken([this._processCarriageReturns(value)]);
    }
    _consumeTagOpenEnd() {
        var tokenType = this._attemptCharCode($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID :
            HtmlTokenType.TAG_OPEN_END;
        this._beginToken(tokenType);
        this._requireCharCode($GT);
        this._endToken([]);
    }
    _consumeTagClose(start) {
        this._beginToken(HtmlTokenType.TAG_CLOSE, start);
        this._attemptCharCodeUntilFn(isNotWhitespace);
        var prefixAndName;
        prefixAndName = this._consumePrefixAndName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        this._requireCharCode($GT);
        this._endToken(prefixAndName);
    }
    _consumeText() {
        var start = this._getLocation();
        this._beginToken(HtmlTokenType.TEXT, start);
        var parts = [this._readChar(true)];
        while (!isTextEnd(this.peek)) {
            parts.push(this._readChar(true));
        }
        this._endToken([this._processCarriageReturns(parts.join(''))]);
    }
    _savePosition() {
        return [this.peek, this.index, this.column, this.line, this.tokens.length];
    }
    _restorePosition(position) {
        this.peek = position[0];
        this.index = position[1];
        this.column = position[2];
        this.line = position[3];
        let nbTokens = position[4];
        if (nbTokens < this.tokens.length) {
            // remove any extra tokens
            this.tokens = ListWrapper.slice(this.tokens, 0, nbTokens);
        }
    }
}
function isNotWhitespace(code) {
    return !isWhitespace(code) || code === $EOF;
}
function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code === $NBSP);
}
function isNameEnd(code) {
    return isWhitespace(code) || code === $GT || code === $SLASH || code === $SQ || code === $DQ ||
        code === $EQ;
}
function isPrefixEnd(code) {
    return (code < $a || $z < code) && (code < $A || $Z < code) && (code < $0 || code > $9);
}
function isDigitEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiHexDigit(code);
}
function isNamedEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiLetter(code);
}
function isTextEnd(code) {
    return code === $LT || code === $EOF;
}
function isAsciiLetter(code) {
    return code >= $a && code <= $z || code >= $A && code <= $Z;
}
function isAsciiHexDigit(code) {
    return code >= $a && code <= $f || code >= $A && code <= $F || code >= $0 && code <= $9;
}
function compareCharCodeCaseInsensitive(code1, code2) {
    return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}
function toUpperCaseCharCode(code) {
    return code >= $a && code <= $z ? code - $a + $A : code;
}
function mergeTextTokens(srcTokens) {
    let dstTokens = [];
    let lastDstToken;
    for (let i = 0; i < srcTokens.length; i++) {
        let token = srcTokens[i];
        if (isPresent(lastDstToken) && lastDstToken.type == HtmlTokenType.TEXT &&
            token.type == HtmlTokenType.TEXT) {
            lastDstToken.parts[0] += token.parts[0];
            lastDstToken.sourceSpan.end = token.sourceSpan.end;
        }
        else {
            lastDstToken = token;
            dstTokens.push(lastDstToken);
        }
    }
    return dstTokens;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9sZXhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtdzNEUmxYSmkudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2xleGVyLnRzIl0sIm5hbWVzIjpbIkh0bWxUb2tlblR5cGUiLCJIdG1sVG9rZW4iLCJIdG1sVG9rZW4uY29uc3RydWN0b3IiLCJIdG1sVG9rZW5FcnJvciIsIkh0bWxUb2tlbkVycm9yLmNvbnN0cnVjdG9yIiwiSHRtbFRva2VuaXplUmVzdWx0IiwiSHRtbFRva2VuaXplUmVzdWx0LmNvbnN0cnVjdG9yIiwidG9rZW5pemVIdG1sIiwidW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnIiwidW5rbm93bkVudGl0eUVycm9yTXNnIiwiQ29udHJvbEZsb3dFcnJvciIsIkNvbnRyb2xGbG93RXJyb3IuY29uc3RydWN0b3IiLCJfSHRtbFRva2VuaXplciIsIl9IdG1sVG9rZW5pemVyLmNvbnN0cnVjdG9yIiwiX0h0bWxUb2tlbml6ZXIuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMiLCJfSHRtbFRva2VuaXplci50b2tlbml6ZSIsIl9IdG1sVG9rZW5pemVyLl9nZXRMb2NhdGlvbiIsIl9IdG1sVG9rZW5pemVyLl9nZXRTcGFuIiwiX0h0bWxUb2tlbml6ZXIuX2JlZ2luVG9rZW4iLCJfSHRtbFRva2VuaXplci5fZW5kVG9rZW4iLCJfSHRtbFRva2VuaXplci5fY3JlYXRlRXJyb3IiLCJfSHRtbFRva2VuaXplci5fYWR2YW5jZSIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0Q2hhckNvZGUiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVDaGFyQ29kZSIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0U3RyIiwiX0h0bWxUb2tlbml6ZXIuX2F0dGVtcHRTdHJDYXNlSW5zZW5zaXRpdmUiLCJfSHRtbFRva2VuaXplci5fcmVxdWlyZVN0ciIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVDaGFyQ29kZVVudGlsRm4iLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdFVudGlsQ2hhciIsIl9IdG1sVG9rZW5pemVyLl9yZWFkQ2hhciIsIl9IdG1sVG9rZW5pemVyLl9kZWNvZGVFbnRpdHkiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVJhd1RleHQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUNvbW1lbnQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUNkYXRhIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVEb2NUeXBlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVQcmVmaXhBbmROYW1lIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuU3RhcnQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUF0dHJpYnV0ZU5hbWUiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZUF0dHJpYnV0ZVZhbHVlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdPcGVuRW5kIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUYWdDbG9zZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGV4dCIsIl9IdG1sVG9rZW5pemVyLl9zYXZlUG9zaXRpb24iLCJfSHRtbFRva2VuaXplci5fcmVzdG9yZVBvc2l0aW9uIiwiaXNOb3RXaGl0ZXNwYWNlIiwiaXNXaGl0ZXNwYWNlIiwiaXNOYW1lRW5kIiwiaXNQcmVmaXhFbmQiLCJpc0RpZ2l0RW50aXR5RW5kIiwiaXNOYW1lZEVudGl0eUVuZCIsImlzVGV4dEVuZCIsImlzQXNjaWlMZXR0ZXIiLCJpc0FzY2lpSGV4RGlnaXQiLCJjb21wYXJlQ2hhckNvZGVDYXNlSW5z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QSxDQUFDQSxDQUFDQTtRQUNqRUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM5QkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM3QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNyQ0EsQ0FBQ0E7SUFFT1IsUUFBUUE7UUFDZFMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLE1BQU1BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDOUVBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtZQUNaQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbERBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ2hCQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNiQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxHQUFHQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJ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QUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLGNBQWNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5REEsS0FBS0EsQ0FBQ0E7WUFDUkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyRUEsQ0FBQ0E7WUFDREEsT0FBT0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsY0FBY0EsRUFBRUEsQ0FBQ0E7Z0JBQ3BDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3Q0EsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtJQUN2RkEsQ0FBQ0E7SUFFT3JCLGVBQWVBLENBQUNBLEtBQW9CQTtRQUMxQ3NCLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLGFBQWFBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFD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QUNBO1FBQzFDQSxJQUFJQSxLQUFLQSxHQUFHQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsWUFBWUEsQ0FBQ0EsSUFBSUEsSUFBSUEsYUFBYUEsQ0FBQ0EsSUFBSUE7WUFDbEVBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxZQUFZQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsWUFBWUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ3JCQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7QUFDbkJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdXcmFwcGVyLCBOdW1iZXJXcmFwcGVyLCBpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUX0VYUFIsIHNlcmlhbGl6ZUVudW19IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQYXJzZUxvY2F0aW9uLCBQYXJzZUVycm9yLCBQYXJzZVNvdXJjZUZpbGUsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7Z2V0SHRtbFRhZ0RlZmluaXRpb24sIEh0bWxUYWdDb250ZW50VHlwZSwgTkFNRURfRU5USVRJRVN9IGZyb20gJy4vaHRtbF90YWdzJztcblxuZXhwb3J0IGVudW0gSHRtbFRva2VuVHlwZSB7XG4gIFRBR19PUEVOX1NUQVJULFxuICBUQUdfT1BFTl9FTkQsXG4gIFRBR19PUEVOX0VORF9WT0lELFxuICBUQUdfQ0xPU0UsXG4gIFRFWFQsXG4gIEVTQ0FQQUJMRV9SQVdfVEVYVCxcbiAgUkFXX1RFWFQsXG4gIENPTU1FTlRfU1RBUlQsXG4gIENPTU1FTlRfRU5ELFxuICBDREFUQV9TVEFSVCxcbiAgQ0RBVEFfRU5ELFxuICBBVFRSX05BTUUsXG4gIEFUVFJfVkFMVUUsXG4gIERPQ19UWVBFLFxuICBFT0Zcbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHR5cGU6IEh0bWxUb2tlblR5cGUsIHB1YmxpYyBwYXJ0czogc3RyaW5nW10sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBIdG1sVG9rZW5FcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvck1zZzogc3RyaW5nLCBwdWJsaWMgdG9rZW5UeXBlOiBIdG1sVG9rZW5UeXBlLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBzdXBlcihzcGFuLCBlcnJvck1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxUb2tlbml6ZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbnM6IEh0bWxUb2tlbltdLCBwdWJsaWMgZXJyb3JzOiBIdG1sVG9rZW5FcnJvcltdKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemVIdG1sKHNvdXJjZUNvbnRlbnQ6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBIdG1sVG9rZW5pemVSZXN1bHQge1xuICByZXR1cm4gbmV3IF9IdG1sVG9rZW5pemVyKG5ldyBQYXJzZVNvdXJjZUZpbGUoc291cmNlQ29udGVudCwgc291cmNlVXJsKSkudG9rZW5pemUoKTtcbn1cblxuY29uc3QgJEVPRiA9IDA7XG5jb25zdCAkVEFCID0gOTtcbmNvbnN0ICRMRiA9IDEwO1xuY29uc3QgJEZGID0gMTI7XG5jb25zdCAkQ1IgPSAxMztcblxuY29uc3QgJFNQQUNFID0gMzI7XG5cbmNvbnN0ICRCQU5HID0gMzM7XG5jb25zdCAkRFEgPSAzNDtcbmNvbnN0ICRIQVNIID0gMzU7XG5jb25zdCAkJCA9IDM2O1xuY29uc3QgJEFNUEVSU0FORCA9IDM4O1xuY29uc3QgJFNRID0gMzk7XG5jb25zdCAkTUlOVVMgPSA0NTtcbmNvbnN0ICRTTEFTSCA9IDQ3O1xuY29uc3QgJDAgPSA0ODtcblxuY29uc3QgJFNFTUlDT0xPTiA9IDU5O1xuXG5jb25zdCAkOSA9IDU3O1xuY29uc3QgJENPTE9OID0gNTg7XG5jb25zdCAkTFQgPSA2MDtcbmNvbnN0ICRFUSA9IDYxO1xuY29uc3QgJEdUID0gNjI7XG5jb25zdCAkUVVFU1RJT04gPSA2MztcbmNvbnN0ICRMQlJBQ0tFVCA9IDkxO1xuY29uc3QgJFJCUkFDS0VUID0gOTM7XG5jb25zdCAkQSA9IDY1O1xuY29uc3QgJEYgPSA3MDtcbmNvbnN0ICRYID0gODg7XG5jb25zdCAkWiA9IDkwO1xuXG5jb25zdCAkYSA9IDk3O1xuY29uc3QgJGYgPSAxMDI7XG5jb25zdCAkeiA9IDEyMjtcbmNvbnN0ICR4ID0gMTIwO1xuXG5jb25zdCAkTkJTUCA9IDE2MDtcblxudmFyIENSX09SX0NSTEZfUkVHRVhQID0gL1xcclxcbj8vZztcblxuZnVuY3Rpb24gdW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKGNoYXJDb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICB2YXIgY2hhciA9IGNoYXJDb2RlID09PSAkRU9GID8gJ0VPRicgOiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XG4gIHJldHVybiBgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke2NoYXJ9XCJgO1xufVxuXG5mdW5jdGlvbiB1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5U3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYFVua25vd24gZW50aXR5IFwiJHtlbnRpdHlTcmN9XCIgLSB1c2UgdGhlIFwiJiM8ZGVjaW1hbD47XCIgb3IgIFwiJiN4PGhleD47XCIgc3ludGF4YDtcbn1cblxuY2xhc3MgQ29udHJvbEZsb3dFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogSHRtbFRva2VuRXJyb3IpIHt9XG59XG5cbi8vIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvc3ludGF4Lmh0bWwjd3JpdGluZ1xuY2xhc3MgX0h0bWxUb2tlbml6ZXIge1xuICBwcml2YXRlIGlucHV0OiBzdHJpbmc7XG4gIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XG4gIC8vIE5vdGU6IHRoaXMgaXMgYWx3YXlzIGxvd2VyY2FzZSFcbiAgcHJpdmF0ZSBwZWVrOiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSBpbmRleDogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgbGluZTogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBjb2x1bW46IG51bWJlciA9IC0xO1xuICBwcml2YXRlIGN1cnJlbnRUb2tlblN0YXJ0OiBQYXJzZUxvY2F0aW9uO1xuICBwcml2YXRlIGN1cnJlbnRUb2tlblR5cGU6IEh0bWxUb2tlblR5cGU7XG5cbiAgdG9rZW5zOiBIdG1sVG9rZW5bXSA9IFtdO1xuICBlcnJvcnM6IEh0bWxUb2tlbkVycm9yW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGU6IFBhcnNlU291cmNlRmlsZSkge1xuICAgIHRoaXMuaW5wdXQgPSBmaWxlLmNvbnRlbnQ7XG4gICAgdGhpcy5sZW5ndGggPSBmaWxlLmNvbnRlbnQubGVuZ3RoO1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNwcmVwcm9jZXNzaW5nLXRoZS1pbnB1dC1zdHJlYW1cbiAgICAvLyBJbiBvcmRlciB0byBrZWVwIHRoZSBvcmlnaW5hbCBwb3NpdGlvbiBpbiB0aGUgc291cmNlLCB3ZSBjYW4gbm90XG4gICAgLy8gcHJlLXByb2Nlc3MgaXQuXG4gICAgLy8gSW5zdGVhZCBDUnMgYXJlIHByb2Nlc3NlZCByaWdodCBiZWZvcmUgaW5zdGFudGlhdGluZyB0aGUgdG9rZW5zLlxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoY29udGVudCwgQ1JfT1JfQ1JMRl9SRUdFWFAsICdcXG4nKTtcbiAgfVxuXG4gIHRva2VuaXplKCk6IEh0bWxUb2tlbml6ZVJlc3VsdCB7XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJEVPRikge1xuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJExUKSkge1xuICAgICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJEJBTkcpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRMQlJBQ0tFVCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY29uc3VtZUNkYXRhKHN0YXJ0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRNSU5VUykpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY29uc3VtZUNvbW1lbnQoc3RhcnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fY29uc3VtZURvY1R5cGUoc3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRTTEFTSCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVUYWdDbG9zZShzdGFydCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVUYWdPcGVuKHN0YXJ0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fY29uc3VtZVRleHQoKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIENvbnRyb2xGbG93RXJyb3IpIHtcbiAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGUuZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkVPRik7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICAgIHJldHVybiBuZXcgSHRtbFRva2VuaXplUmVzdWx0KG1lcmdlVGV4dFRva2Vucyh0aGlzLnRva2VucyksIHRoaXMuZXJyb3JzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldExvY2F0aW9uKCk6IFBhcnNlTG9jYXRpb24ge1xuICAgIHJldHVybiBuZXcgUGFyc2VMb2NhdGlvbih0aGlzLmZpbGUsIHRoaXMuaW5kZXgsIHRoaXMubGluZSwgdGhpcy5jb2x1bW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0U3BhbihzdGFydD86IFBhcnNlTG9jYXRpb24sIGVuZD86IFBhcnNlTG9jYXRpb24pOiBQYXJzZVNvdXJjZVNwYW4ge1xuICAgIGlmIChpc0JsYW5rKHN0YXJ0KSkge1xuICAgICAgc3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhlbmQpKSB7XG4gICAgICBlbmQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydCwgZW5kKTtcbiAgfVxuXG4gIHByaXZhdGUgX2JlZ2luVG9rZW4odHlwZTogSHRtbFRva2VuVHlwZSwgc3RhcnQ6IFBhcnNlTG9jYXRpb24gPSBudWxsKSB7XG4gICAgaWYgKGlzQmxhbmsoc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFRva2VuU3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblR5cGUgPSB0eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5kVG9rZW4ocGFydHM6IHN0cmluZ1tdLCBlbmQ6IFBhcnNlTG9jYXRpb24gPSBudWxsKTogSHRtbFRva2VuIHtcbiAgICBpZiAoaXNCbGFuayhlbmQpKSB7XG4gICAgICBlbmQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIH1cbiAgICB2YXIgdG9rZW4gPSBuZXcgSHRtbFRva2VuKFxuICAgICAgICB0aGlzLmN1cnJlbnRUb2tlblR5cGUsIHBhcnRzLCBuZXcgUGFyc2VTb3VyY2VTcGFuKHRoaXMuY3VycmVudFRva2VuU3RhcnQsIGVuZCkpO1xuICAgIHRoaXMudG9rZW5zLnB1c2godG9rZW4pO1xuICAgIHRoaXMuY3VycmVudFRva2VuU3RhcnQgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudFRva2VuVHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRXJyb3IobXNnOiBzdHJpbmcsIHNwYW46IFBhcnNlU291cmNlU3Bhbik6IENvbnRyb2xGbG93RXJyb3Ige1xuICAgIHZhciBlcnJvciA9IG5ldyBIdG1sVG9rZW5FcnJvcihtc2csIHRoaXMuY3VycmVudFRva2VuVHlwZSwgc3Bhbik7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5TdGFydCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5UeXBlID0gbnVsbDtcbiAgICByZXR1cm4gbmV3IENvbnRyb2xGbG93RXJyb3IoZXJyb3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZSgpIHtcbiAgICBpZiAodGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKCRFT0YpLCB0aGlzLl9nZXRTcGFuKCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wZWVrID09PSAkTEYpIHtcbiAgICAgIHRoaXMubGluZSsrO1xuICAgICAgdGhpcy5jb2x1bW4gPSAwO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrICE9PSAkTEYgJiYgdGhpcy5wZWVrICE9PSAkQ1IpIHtcbiAgICAgIHRoaXMuY29sdW1uKys7XG4gICAgfVxuICAgIHRoaXMuaW5kZXgrKztcbiAgICB0aGlzLnBlZWsgPSB0aGlzLmluZGV4ID49IHRoaXMubGVuZ3RoID8gJEVPRiA6IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdCh0aGlzLmlucHV0LCB0aGlzLmluZGV4KTtcbiAgfVxuXG4gIHByaXZhdGUgX2F0dGVtcHRDaGFyQ29kZShjaGFyQ29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gY2hhckNvZGUpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhckNvZGVDYXNlSW5zZW5zaXRpdmUoY2hhckNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChjb21wYXJlQ2hhckNvZGVDYXNlSW5zZW5zaXRpdmUodGhpcy5wZWVrLCBjaGFyQ29kZSkpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9yZXF1aXJlQ2hhckNvZGUoY2hhckNvZGU6IG51bWJlcikge1xuICAgIHZhciBsb2NhdGlvbiA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGUoY2hhckNvZGUpKSB7XG4gICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcihcbiAgICAgICAgICB1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgdGhpcy5fZ2V0U3Bhbihsb2NhdGlvbiwgbG9jYXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0U3RyKGNoYXJzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZShTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoY2hhcnMsIGkpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdFN0ckNhc2VJbnNlbnNpdGl2ZShjaGFyczogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGVDYXNlSW5zZW5zaXRpdmUoU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGNoYXJzLCBpKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcXVpcmVTdHIoY2hhcnM6IHN0cmluZykge1xuICAgIHZhciBsb2NhdGlvbiA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgaWYgKCF0aGlzLl9hdHRlbXB0U3RyKGNoYXJzKSkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldFNwYW4obG9jYXRpb24pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKHByZWRpY2F0ZTogRnVuY3Rpb24pIHtcbiAgICB3aGlsZSAoIXByZWRpY2F0ZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVxdWlyZUNoYXJDb2RlVW50aWxGbihwcmVkaWNhdGU6IEZ1bmN0aW9uLCBsZW46IG51bWJlcikge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihwcmVkaWNhdGUpO1xuICAgIGlmICh0aGlzLmluZGV4IC0gc3RhcnQub2Zmc2V0IDwgbGVuKSB7XG4gICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgdGhpcy5fZ2V0U3BhbihzdGFydCwgc3RhcnQpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0VW50aWxDaGFyKGNoYXI6IG51bWJlcikge1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IGNoYXIpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQ2hhcihkZWNvZGVFbnRpdGllczogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKGRlY29kZUVudGl0aWVzICYmIHRoaXMucGVlayA9PT0gJEFNUEVSU0FORCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUVudGl0eSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5wdXRbaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2RlY29kZUVudGl0eSgpOiBzdHJpbmcge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJEhBU0gpKSB7XG4gICAgICBsZXQgaXNIZXggPSB0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJHgpIHx8IHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkWCk7XG4gICAgICBsZXQgbnVtYmVyU3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpLm9mZnNldDtcbiAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNEaWdpdEVudGl0eUVuZCk7XG4gICAgICBpZiAodGhpcy5wZWVrICE9ICRTRU1JQ09MT04pIHtcbiAgICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldFNwYW4oKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgc3RyTnVtID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcobnVtYmVyU3RhcnQsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBjaGFyQ29kZSA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQoc3RyTnVtLCBpc0hleCA/IDE2IDogMTApO1xuICAgICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0ICsgMSwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5KSwgdGhpcy5fZ2V0U3BhbihzdGFydCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc3RhcnRQb3NpdGlvbiA9IHRoaXMuX3NhdmVQb3NpdGlvbigpO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05hbWVkRW50aXR5RW5kKTtcbiAgICAgIGlmICh0aGlzLnBlZWsgIT0gJFNFTUlDT0xPTikge1xuICAgICAgICB0aGlzLl9yZXN0b3JlUG9zaXRpb24oc3RhcnRQb3NpdGlvbik7XG4gICAgICAgIHJldHVybiAnJic7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgbmFtZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDEsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIGxldCBjaGFyID0gTkFNRURfRU5USVRJRVNbbmFtZV07XG4gICAgICBpZiAoaXNCbGFuayhjaGFyKSkge1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2cobmFtZSksIHRoaXMuX2dldFNwYW4oc3RhcnQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVSYXdUZXh0KFxuICAgICAgZGVjb2RlRW50aXRpZXM6IGJvb2xlYW4sIGZpcnN0Q2hhck9mRW5kOiBudW1iZXIsIGF0dGVtcHRFbmRSZXN0OiBGdW5jdGlvbik6IEh0bWxUb2tlbiB7XG4gICAgdmFyIHRhZ0Nsb3NlU3RhcnQ7XG4gICAgdmFyIHRleHRTdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihcbiAgICAgICAgZGVjb2RlRW50aXRpZXMgPyBIdG1sVG9rZW5UeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCA6IEh0bWxUb2tlblR5cGUuUkFXX1RFWFQsIHRleHRTdGFydCk7XG4gICAgdmFyIHBhcnRzID0gW107XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHRhZ0Nsb3NlU3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZShmaXJzdENoYXJPZkVuZCkgJiYgYXR0ZW1wdEVuZFJlc3QoKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmluZGV4ID4gdGFnQ2xvc2VTdGFydC5vZmZzZXQpIHtcbiAgICAgICAgcGFydHMucHVzaCh0aGlzLmlucHV0LnN1YnN0cmluZyh0YWdDbG9zZVN0YXJ0Lm9mZnNldCwgdGhpcy5pbmRleCkpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHRoaXMucGVlayAhPT0gZmlyc3RDaGFyT2ZFbmQpIHtcbiAgICAgICAgcGFydHMucHVzaCh0aGlzLl9yZWFkQ2hhcihkZWNvZGVFbnRpdGllcykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW5kVG9rZW4oW3RoaXMuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMocGFydHMuam9pbignJykpXSwgdGFnQ2xvc2VTdGFydCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ29tbWVudChzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5DT01NRU5UX1NUQVJULCBzdGFydCk7XG4gICAgdGhpcy5fcmVxdWlyZUNoYXJDb2RlKCRNSU5VUyk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICAgIHZhciB0ZXh0VG9rZW4gPSB0aGlzLl9jb25zdW1lUmF3VGV4dChmYWxzZSwgJE1JTlVTLCAoKSA9PiB0aGlzLl9hdHRlbXB0U3RyKCctPicpKTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9FTkQsIHRleHRUb2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNkYXRhKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNEQVRBX1NUQVJULCBzdGFydCk7XG4gICAgdGhpcy5fcmVxdWlyZVN0cignQ0RBVEFbJyk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICAgIHZhciB0ZXh0VG9rZW4gPSB0aGlzLl9jb25zdW1lUmF3VGV4dChmYWxzZSwgJFJCUkFDS0VULCAoKSA9PiB0aGlzLl9hdHRlbXB0U3RyKCddPicpKTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQ0RBVEFfRU5ELCB0ZXh0VG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVEb2NUeXBlKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkRPQ19UWVBFLCBzdGFydCk7XG4gICAgdGhpcy5fYXR0ZW1wdFVudGlsQ2hhcigkR1QpO1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0ICsgMiwgdGhpcy5pbmRleCAtIDEpXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lUHJlZml4QW5kTmFtZSgpOiBzdHJpbmdbXSB7XG4gICAgdmFyIG5hbWVPclByZWZpeFN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB2YXIgcHJlZml4ID0gbnVsbDtcbiAgICB3aGlsZSAodGhpcy5wZWVrICE9PSAkQ09MT04gJiYgIWlzUHJlZml4RW5kKHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gICAgdmFyIG5hbWVTdGFydDtcbiAgICBpZiAodGhpcy5wZWVrID09PSAkQ09MT04pIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHByZWZpeCA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKG5hbWVPclByZWZpeFN0YXJ0LCB0aGlzLmluZGV4IC0gMSk7XG4gICAgICBuYW1lU3RhcnQgPSB0aGlzLmluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lU3RhcnQgPSBuYW1lT3JQcmVmaXhTdGFydDtcbiAgICB9XG4gICAgdGhpcy5fcmVxdWlyZUNoYXJDb2RlVW50aWxGbihpc05hbWVFbmQsIHRoaXMuaW5kZXggPT09IG5hbWVTdGFydCA/IDEgOiAwKTtcbiAgICB2YXIgbmFtZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKG5hbWVTdGFydCwgdGhpcy5pbmRleCk7XG4gICAgcmV0dXJuIFtwcmVmaXgsIG5hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ09wZW4oc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICBsZXQgc2F2ZWRQb3MgPSB0aGlzLl9zYXZlUG9zaXRpb24oKTtcbiAgICBsZXQgbG93ZXJjYXNlVGFnTmFtZTtcbiAgICB0cnkge1xuICAgICAgaWYgKCFpc0FzY2lpTGV0dGVyKHRoaXMucGVlaykpIHtcbiAgICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldFNwYW4oKSk7XG4gICAgICB9XG4gICAgICB2YXIgbmFtZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgIHRoaXMuX2NvbnN1bWVUYWdPcGVuU3RhcnQoc3RhcnQpO1xuICAgICAgbG93ZXJjYXNlVGFnTmFtZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKG5hbWVTdGFydCwgdGhpcy5pbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgIHdoaWxlICh0aGlzLnBlZWsgIT09ICRTTEFTSCAmJiB0aGlzLnBlZWsgIT09ICRHVCkge1xuICAgICAgICB0aGlzLl9jb25zdW1lQXR0cmlidXRlTmFtZSgpO1xuICAgICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJEVRKSkge1xuICAgICAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lQXR0cmlidXRlVmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25zdW1lVGFnT3BlbkVuZCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgQ29udHJvbEZsb3dFcnJvcikge1xuICAgICAgICAvLyBXaGVuIHRoZSBzdGFydCB0YWcgaXMgaW52YWxpZCwgYXNzdW1lIHdlIHdhbnQgYSBcIjxcIlxuICAgICAgICB0aGlzLl9yZXN0b3JlUG9zaXRpb24oc2F2ZWRQb3MpO1xuICAgICAgICAvLyBCYWNrIHRvIGJhY2sgdGV4dCB0b2tlbnMgYXJlIG1lcmdlZCBhdCB0aGUgZW5kXG4gICAgICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5URVhULCBzdGFydCk7XG4gICAgICAgIHRoaXMuX2VuZFRva2VuKFsnPCddKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50VG9rZW5UeXBlID0gZ2V0SHRtbFRhZ0RlZmluaXRpb24obG93ZXJjYXNlVGFnTmFtZSkuY29udGVudFR5cGU7XG4gICAgaWYgKGNvbnRlbnRUb2tlblR5cGUgPT09IEh0bWxUYWdDb250ZW50VHlwZS5SQVdfVEVYVCkge1xuICAgICAgdGhpcy5fY29uc3VtZVJhd1RleHRXaXRoVGFnQ2xvc2UobG93ZXJjYXNlVGFnTmFtZSwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoY29udGVudFRva2VuVHlwZSA9PT0gSHRtbFRhZ0NvbnRlbnRUeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCkge1xuICAgICAgdGhpcy5fY29uc3VtZVJhd1RleHRXaXRoVGFnQ2xvc2UobG93ZXJjYXNlVGFnTmFtZSwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVJhd1RleHRXaXRoVGFnQ2xvc2UobG93ZXJjYXNlVGFnTmFtZTogc3RyaW5nLCBkZWNvZGVFbnRpdGllczogYm9vbGVhbikge1xuICAgIHZhciB0ZXh0VG9rZW4gPSB0aGlzLl9jb25zdW1lUmF3VGV4dChkZWNvZGVFbnRpdGllcywgJExULCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkU0xBU0gpKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRTdHJDYXNlSW5zZW5zaXRpdmUobG93ZXJjYXNlVGFnTmFtZSkpIHJldHVybiBmYWxzZTtcbiAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgIGlmICghdGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRHVCkpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5UQUdfQ0xPU0UsIHRleHRUb2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW251bGwsIGxvd2VyY2FzZVRhZ05hbWVdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdPcGVuU3RhcnQoc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEFHX09QRU5fU1RBUlQsIHN0YXJ0KTtcbiAgICB2YXIgcGFydHMgPSB0aGlzLl9jb25zdW1lUHJlZml4QW5kTmFtZSgpO1xuICAgIHRoaXMuX2VuZFRva2VuKHBhcnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyaWJ1dGVOYW1lKCkge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5BVFRSX05BTUUpO1xuICAgIHZhciBwcmVmaXhBbmROYW1lID0gdGhpcy5fY29uc3VtZVByZWZpeEFuZE5hbWUoKTtcbiAgICB0aGlzLl9lbmRUb2tlbihwcmVmaXhBbmROYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyaWJ1dGVWYWx1ZSgpIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQVRUUl9WQUxVRSk7XG4gICAgdmFyIHZhbHVlO1xuICAgIGlmICh0aGlzLnBlZWsgPT09ICRTUSB8fCB0aGlzLnBlZWsgPT09ICREUSkge1xuICAgICAgdmFyIHF1b3RlQ2hhciA9IHRoaXMucGVlaztcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgd2hpbGUgKHRoaXMucGVlayAhPT0gcXVvdGVDaGFyKSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5fcmVhZENoYXIodHJ1ZSkpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSBwYXJ0cy5qb2luKCcnKTtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZhbHVlU3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fcmVxdWlyZUNoYXJDb2RlVW50aWxGbihpc05hbWVFbmQsIDEpO1xuICAgICAgdmFsdWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyh2YWx1ZVN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICB9XG4gICAgdGhpcy5fZW5kVG9rZW4oW3RoaXMuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnModmFsdWUpXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGFnT3BlbkVuZCgpIHtcbiAgICB2YXIgdG9rZW5UeXBlID0gdGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRTTEFTSCkgPyBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORF9WT0lEIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORDtcbiAgICB0aGlzLl9iZWdpblRva2VuKHRva2VuVHlwZSk7XG4gICAgdGhpcy5fcmVxdWlyZUNoYXJDb2RlKCRHVCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ0Nsb3NlKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRBR19DTE9TRSwgc3RhcnQpO1xuICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICB2YXIgcHJlZml4QW5kTmFtZTtcbiAgICBwcmVmaXhBbmROYW1lID0gdGhpcy5fY29uc3VtZVByZWZpeEFuZE5hbWUoKTtcbiAgICB0aGlzLl9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgdGhpcy5fcmVxdWlyZUNoYXJDb2RlKCRHVCk7XG4gICAgdGhpcy5fZW5kVG9rZW4ocHJlZml4QW5kTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGV4dCgpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5URVhULCBzdGFydCk7XG4gICAgdmFyIHBhcnRzID0gW3RoaXMuX3JlYWRDaGFyKHRydWUpXTtcbiAgICB3aGlsZSAoIWlzVGV4dEVuZCh0aGlzLnBlZWspKSB7XG4gICAgICBwYXJ0cy5wdXNoKHRoaXMuX3JlYWRDaGFyKHRydWUpKTtcbiAgICB9XG4gICAgdGhpcy5fZW5kVG9rZW4oW3RoaXMuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMocGFydHMuam9pbignJykpXSk7XG4gIH1cblxuICBwcml2YXRlIF9zYXZlUG9zaXRpb24oKTogbnVtYmVyW10ge1xuICAgIHJldHVybiBbdGhpcy5wZWVrLCB0aGlzLmluZGV4LCB0aGlzLmNvbHVtbiwgdGhpcy5saW5lLCB0aGlzLnRva2Vucy5sZW5ndGhdO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzdG9yZVBvc2l0aW9uKHBvc2l0aW9uOiBudW1iZXJbXSk6IHZvaWQge1xuICAgIHRoaXMucGVlayA9IHBvc2l0aW9uWzBdO1xuICAgIHRoaXMuaW5kZXggPSBwb3NpdGlvblsxXTtcbiAgICB0aGlzLmNvbHVtbiA9IHBvc2l0aW9uWzJdO1xuICAgIHRoaXMubGluZSA9IHBvc2l0aW9uWzNdO1xuICAgIGxldCBuYlRva2VucyA9IHBvc2l0aW9uWzRdO1xuICAgIGlmIChuYlRva2VucyA8IHRoaXMudG9rZW5zLmxlbmd0aCkge1xuICAgICAgLy8gcmVtb3ZlIGFueSBleHRyYSB0b2tlbnNcbiAgICAgIHRoaXMudG9rZW5zID0gTGlzdFdyYXBwZXIuc2xpY2UodGhpcy50b2tlbnMsIDAsIG5iVG9rZW5zKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNOb3RXaGl0ZXNwYWNlKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlzV2hpdGVzcGFjZShjb2RlKSB8fCBjb2RlID09PSAkRU9GO1xufVxuXG5mdW5jdGlvbiBpc1doaXRlc3BhY2UoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA+PSAkVEFCICYmIGNvZGUgPD0gJFNQQUNFKSB8fCAoY29kZSA9PT0gJE5CU1ApO1xufVxuXG5mdW5jdGlvbiBpc05hbWVFbmQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1doaXRlc3BhY2UoY29kZSkgfHwgY29kZSA9PT0gJEdUIHx8IGNvZGUgPT09ICRTTEFTSCB8fCBjb2RlID09PSAkU1EgfHwgY29kZSA9PT0gJERRIHx8XG4gICAgICBjb2RlID09PSAkRVE7XG59XG5cbmZ1bmN0aW9uIGlzUHJlZml4RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPCAkYSB8fCAkeiA8IGNvZGUpICYmIChjb2RlIDwgJEEgfHwgJFogPCBjb2RlKSAmJiAoY29kZSA8ICQwIHx8IGNvZGUgPiAkOSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlnaXRFbnRpdHlFbmQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRTRU1JQ09MT04gfHwgY29kZSA9PSAkRU9GIHx8ICFpc0FzY2lpSGV4RGlnaXQoY29kZSk7XG59XG5cbmZ1bmN0aW9uIGlzTmFtZWRFbnRpdHlFbmQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09ICRTRU1JQ09MT04gfHwgY29kZSA9PSAkRU9GIHx8ICFpc0FzY2lpTGV0dGVyKGNvZGUpO1xufVxuXG5mdW5jdGlvbiBpc1RleHRFbmQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID09PSAkTFQgfHwgY29kZSA9PT0gJEVPRjtcbn1cblxuZnVuY3Rpb24gaXNBc2NpaUxldHRlcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPj0gJGEgJiYgY29kZSA8PSAkeiB8fCBjb2RlID49ICRBICYmIGNvZGUgPD0gJFo7XG59XG5cbmZ1bmN0aW9uIGlzQXNjaWlIZXhEaWdpdChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPj0gJGEgJiYgY29kZSA8PSAkZiB8fCBjb2RlID49ICRBICYmIGNvZGUgPD0gJEYgfHwgY29kZSA+PSAkMCAmJiBjb2RlIDw9ICQ5O1xufVxuXG5mdW5jdGlvbiBjb21wYXJlQ2hhckNvZGVDYXNlSW5zZW5zaXRpdmUoY29kZTE6IG51bWJlciwgY29kZTI6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gdG9VcHBlckNhc2VDaGFyQ29kZShjb2RlMSkgPT0gdG9VcHBlckNhc2VDaGFyQ29kZShjb2RlMik7XG59XG5cbmZ1bmN0aW9uIHRvVXBwZXJDYXNlQ2hhckNvZGUoY29kZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGNvZGUgPj0gJGEgJiYgY29kZSA8PSAkeiA/IGNvZGUgLSAkYSArICRBIDogY29kZTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VUZXh0VG9rZW5zKHNyY1Rva2VuczogSHRtbFRva2VuW10pOiBIdG1sVG9rZW5bXSB7XG4gIGxldCBkc3RUb2tlbnMgPSBbXTtcbiAgbGV0IGxhc3REc3RUb2tlbjogSHRtbFRva2VuO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNyY1Rva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGxldCB0b2tlbiA9IHNyY1Rva2Vuc1tpXTtcbiAgICBpZiAoaXNQcmVzZW50KGxhc3REc3RUb2tlbikgJiYgbGFzdERzdFRva2VuLnR5cGUgPT0gSHRtbFRva2VuVHlwZS5URVhUICYmXG4gICAgICAgIHRva2VuLnR5cGUgPT0gSHRtbFRva2VuVHlwZS5URVhUKSB7XG4gICAgICBsYXN0RHN0VG9rZW4ucGFydHNbMF0gKz0gdG9rZW4ucGFydHNbMF07XG4gICAgICBsYXN0RHN0VG9rZW4uc291cmNlU3Bhbi5lbmQgPSB0b2tlbi5zb3VyY2VTcGFuLmVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdERzdFRva2VuID0gdG9rZW47XG4gICAgICBkc3RUb2tlbnMucHVzaChsYXN0RHN0VG9rZW4pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkc3RUb2tlbnM7XG59XG4iXX0=