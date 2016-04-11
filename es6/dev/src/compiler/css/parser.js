import { ParseSourceSpan, ParseSourceFile, ParseLocation, ParseError } from 'angular2/src/compiler/parse_util';
import { bitWiseOr, bitWiseAnd, isPresent } from 'angular2/src/facade/lang';
import { CssLexerMode, CssToken, CssTokenType, generateErrorMessage, $AT, $EOF, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isNewline } from 'angular2/src/compiler/css/lexer';
export { CssToken } from 'angular2/src/compiler/css/lexer';
export var BlockType;
(function (BlockType) {
    BlockType[BlockType["Import"] = 0] = "Import";
    BlockType[BlockType["Charset"] = 1] = "Charset";
    BlockType[BlockType["Namespace"] = 2] = "Namespace";
    BlockType[BlockType["Supports"] = 3] = "Supports";
    BlockType[BlockType["Keyframes"] = 4] = "Keyframes";
    BlockType[BlockType["MediaQuery"] = 5] = "MediaQuery";
    BlockType[BlockType["Selector"] = 6] = "Selector";
    BlockType[BlockType["FontFace"] = 7] = "FontFace";
    BlockType[BlockType["Page"] = 8] = "Page";
    BlockType[BlockType["Document"] = 9] = "Document";
    BlockType[BlockType["Viewport"] = 10] = "Viewport";
    BlockType[BlockType["Unsupported"] = 11] = "Unsupported";
})(BlockType || (BlockType = {}));
const EOF_DELIM = 1;
const RBRACE_DELIM = 2;
const LBRACE_DELIM = 4;
const COMMA_DELIM = 8;
const COLON_DELIM = 16;
const SEMICOLON_DELIM = 32;
const NEWLINE_DELIM = 64;
const RPAREN_DELIM = 128;
function mergeTokens(tokens, separator = '') {
    var mainToken = tokens[0];
    var str = mainToken.strValue;
    for (var i = 1; i < tokens.length; i++) {
        str += separator + tokens[i].strValue;
    }
    return new CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
function getDelimFromToken(token) {
    return getDelimFromCharacter(token.numValue);
}
function getDelimFromCharacter(code) {
    switch (code) {
        case $EOF:
            return EOF_DELIM;
        case $COMMA:
            return COMMA_DELIM;
        case $COLON:
            return COLON_DELIM;
        case $SEMICOLON:
            return SEMICOLON_DELIM;
        case $RBRACE:
            return RBRACE_DELIM;
        case $LBRACE:
            return LBRACE_DELIM;
        case $RPAREN:
            return RPAREN_DELIM;
        default:
            return isNewline(code) ? NEWLINE_DELIM : 0;
    }
}
function characterContainsDelimiter(code, delimiters) {
    return bitWiseAnd([getDelimFromCharacter(code), delimiters]) > 0;
}
export class CssAST {
    visit(visitor, context) { }
}
export class ParsedCssResult {
    constructor(errors, ast) {
        this.errors = errors;
        this.ast = ast;
    }
}
export class CssParser {
    constructor(_scanner, _fileName) {
        this._scanner = _scanner;
        this._fileName = _fileName;
        this._errors = [];
        this._file = new ParseSourceFile(this._scanner.input, _fileName);
    }
    /** @internal */
    _resolveBlockType(token) {
        switch (token.strValue) {
            case '@-o-keyframes':
            case '@-moz-keyframes':
            case '@-webkit-keyframes':
            case '@keyframes':
                return BlockType.Keyframes;
            case '@charset':
                return BlockType.Charset;
            case '@import':
                return BlockType.Import;
            case '@namespace':
                return BlockType.Namespace;
            case '@page':
                return BlockType.Page;
            case '@document':
                return BlockType.Document;
            case '@media':
                return BlockType.MediaQuery;
            case '@font-face':
                return BlockType.FontFace;
            case '@viewport':
                return BlockType.Viewport;
            case '@supports':
                return BlockType.Supports;
            default:
                return BlockType.Unsupported;
        }
    }
    parse() {
        var delimiters = EOF_DELIM;
        var ast = this._parseStyleSheet(delimiters);
        var errors = this._errors;
        this._errors = [];
        return new ParsedCssResult(errors, ast);
    }
    /** @internal */
    _parseStyleSheet(delimiters) {
        var results = [];
        this._scanner.consumeEmptyStatements();
        while (this._scanner.peek != $EOF) {
            this._scanner.setMode(CssLexerMode.BLOCK);
            results.push(this._parseRule(delimiters));
        }
        return new CssStyleSheetAST(results);
    }
    /** @internal */
    _parseRule(delimiters) {
        if (this._scanner.peek == $AT) {
            return this._parseAtRule(delimiters);
        }
        return this._parseSelectorRule(delimiters);
    }
    /** @internal */
    _parseAtRule(delimiters) {
        this._scanner.setMode(CssLexerMode.BLOCK);
        var token = this._scan();
        this._assertCondition(token.type == CssTokenType.AtKeyword, `The CSS Rule ${token.strValue} is not a valid [@] rule.`, token);
        var block, type = this._resolveBlockType(token);
        switch (type) {
            case BlockType.Charset:
            case BlockType.Namespace:
            case BlockType.Import:
                var value = this._parseValue(delimiters);
                this._scanner.setMode(CssLexerMode.BLOCK);
                this._scanner.consumeEmptyStatements();
                return new CssInlineRuleAST(type, value);
            case BlockType.Viewport:
            case BlockType.FontFace:
                block = this._parseStyleBlock(delimiters);
                return new CssBlockRuleAST(type, block);
            case BlockType.Keyframes:
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                // keyframes only have one identifier name
                var name = tokens[0];
                return new CssKeyframeRuleAST(name, this._parseKeyframeBlock(delimiters));
            case BlockType.MediaQuery:
                this._scanner.setMode(CssLexerMode.MEDIA_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssMediaQueryRuleAST(tokens, this._parseBlock(delimiters));
            case BlockType.Document:
            case BlockType.Supports:
            case BlockType.Page:
                this._scanner.setMode(CssLexerMode.AT_RULE_QUERY);
                var tokens = this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]));
                return new CssBlockDefinitionRuleAST(type, tokens, this._parseBlock(delimiters));
            // if a custom @rule { ... } is used it should still tokenize the insides
            default:
                var listOfTokens = [];
                this._scanner.setMode(CssLexerMode.ALL);
                this._error(generateErrorMessage(this._scanner.input, `The CSS "at" rule "${token.strValue}" is not allowed to used here`, token.strValue, token.index, token.line, token.column), token);
                this._collectUntilDelim(bitWiseOr([delimiters, LBRACE_DELIM, SEMICOLON_DELIM]))
                    .forEach((token) => { listOfTokens.push(token); });
                if (this._scanner.peek == $LBRACE) {
                    this._consume(CssTokenType.Character, '{');
                    this._collectUntilDelim(bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]))
                        .forEach((token) => { listOfTokens.push(token); });
                    this._consume(CssTokenType.Character, '}');
                }
                return new CssUnknownTokenListAST(token, listOfTokens);
        }
    }
    /** @internal */
    _parseSelectorRule(delimiters) {
        var selectors = this._parseSelectors(delimiters);
        var block = this._parseStyleBlock(delimiters);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssSelectorRuleAST(selectors, block);
    }
    /** @internal */
    _parseSelectors(delimiters) {
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        var selectors = [];
        var isParsingSelectors = true;
        while (isParsingSelectors) {
            selectors.push(this._parseSelector(delimiters));
            isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            if (isParsingSelectors) {
                this._consume(CssTokenType.Character, ',');
                isParsingSelectors = !characterContainsDelimiter(this._scanner.peek, delimiters);
            }
        }
        return selectors;
    }
    /** @internal */
    _scan() {
        var output = this._scanner.scan();
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _consume(type, value = null) {
        var output = this._scanner.consume(type, value);
        var token = output.token;
        var error = output.error;
        if (isPresent(error)) {
            this._error(error.rawMessage, token);
        }
        return token;
    }
    /** @internal */
    _parseKeyframeBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        this._consume(CssTokenType.Character, '{');
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseKeyframeDefinition(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseKeyframeDefinition(delimiters) {
        var stepTokens = [];
        delimiters = bitWiseOr([delimiters, LBRACE_DELIM]);
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            stepTokens.push(this._parseKeyframeLabel(bitWiseOr([delimiters, COMMA_DELIM])));
            if (this._scanner.peek != $LBRACE) {
                this._consume(CssTokenType.Character, ',');
            }
        }
        var styles = this._parseStyleBlock(bitWiseOr([delimiters, RBRACE_DELIM]));
        this._scanner.setMode(CssLexerMode.BLOCK);
        return new CssKeyframeDefinitionAST(stepTokens, styles);
    }
    /** @internal */
    _parseKeyframeLabel(delimiters) {
        this._scanner.setMode(CssLexerMode.KEYFRAME_BLOCK);
        return mergeTokens(this._collectUntilDelim(delimiters));
    }
    /** @internal */
    _parseSelector(delimiters) {
        delimiters = bitWiseOr([delimiters, COMMA_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.SELECTOR);
        var selectorCssTokens = [];
        var isComplex = false;
        var wsCssToken;
        var previousToken;
        var parenCount = 0;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var code = this._scanner.peek;
            switch (code) {
                case $LPAREN:
                    parenCount++;
                    break;
                case $RPAREN:
                    parenCount--;
                    break;
                case $COLON:
                    this._scanner.setMode(CssLexerMode.PSEUDO_SELECTOR);
                    previousToken = this._consume(CssTokenType.Character, ':');
                    selectorCssTokens.push(previousToken);
                    continue;
                case $LBRACKET:
                    // if we are already inside an attribute selector then we can't
                    // jump into the mode again. Therefore this error will get picked
                    // up when the scan method is called below.
                    if (this._scanner.getMode() != CssLexerMode.ATTRIBUTE_SELECTOR) {
                        selectorCssTokens.push(this._consume(CssTokenType.Character, '['));
                        this._scanner.setMode(CssLexerMode.ATTRIBUTE_SELECTOR);
                        continue;
                    }
                    break;
                case $RBRACKET:
                    selectorCssTokens.push(this._consume(CssTokenType.Character, ']'));
                    this._scanner.setMode(CssLexerMode.SELECTOR);
                    continue;
            }
            var token = this._scan();
            // special case for the ":not(" selector since it
            // contains an inner selector that needs to be parsed
            // in isolation
            if (this._scanner.getMode() == CssLexerMode.PSEUDO_SELECTOR && isPresent(previousToken) &&
                previousToken.numValue == $COLON && token.strValue == 'not' &&
                this._scanner.peek == $LPAREN) {
                selectorCssTokens.push(token);
                selectorCssTokens.push(this._consume(CssTokenType.Character, '('));
                // the inner selector inside of :not(...) can only be one
                // CSS selector (no commas allowed) therefore we parse only
                // one selector by calling the method below
                this._parseSelector(bitWiseOr([delimiters, RPAREN_DELIM]))
                    .tokens.forEach((innerSelectorToken) => { selectorCssTokens.push(innerSelectorToken); });
                selectorCssTokens.push(this._consume(CssTokenType.Character, ')'));
                continue;
            }
            previousToken = token;
            if (token.type == CssTokenType.Whitespace) {
                wsCssToken = token;
            }
            else {
                if (isPresent(wsCssToken)) {
                    selectorCssTokens.push(wsCssToken);
                    wsCssToken = null;
                    isComplex = true;
                }
                selectorCssTokens.push(token);
            }
        }
        if (this._scanner.getMode() == CssLexerMode.ATTRIBUTE_SELECTOR) {
            this._error(`Unbalanced CSS attribute selector at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        else if (parenCount > 0) {
            this._error(`Unbalanced pseudo selector function value at column ${previousToken.line}:${previousToken.column}`, previousToken);
        }
        return new CssSelectorAST(selectorCssTokens, isComplex);
    }
    /** @internal */
    _parseValue(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, SEMICOLON_DELIM, NEWLINE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_VALUE);
        var strValue = '';
        var tokens = [];
        var previous;
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var token;
            if (isPresent(previous) && previous.type == CssTokenType.Identifier &&
                this._scanner.peek == $LPAREN) {
                token = this._consume(CssTokenType.Character, '(');
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE_FUNCTION);
                token = this._scan();
                tokens.push(token);
                strValue += token.strValue;
                this._scanner.setMode(CssLexerMode.STYLE_VALUE);
                token = this._consume(CssTokenType.Character, ')');
                tokens.push(token);
                strValue += token.strValue;
            }
            else {
                token = this._scan();
                if (token.type != CssTokenType.Whitespace) {
                    tokens.push(token);
                }
                strValue += token.strValue;
            }
            previous = token;
        }
        this._scanner.consumeWhitespace();
        var code = this._scanner.peek;
        if (code == $SEMICOLON) {
            this._consume(CssTokenType.Character, ';');
        }
        else if (code != $RBRACE) {
            this._error(generateErrorMessage(this._scanner.input, `The CSS key/value definition did not end with a semicolon`, previous.strValue, previous.index, previous.line, previous.column), previous);
        }
        return new CssStyleValueAST(tokens, strValue);
    }
    /** @internal */
    _collectUntilDelim(delimiters, assertType = null) {
        var tokens = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            var val = isPresent(assertType) ? this._consume(assertType) : this._scan();
            tokens.push(val);
        }
        return tokens;
    }
    /** @internal */
    _parseBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var results = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            results.push(this._parseRule(delimiters));
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(results);
    }
    /** @internal */
    _parseStyleBlock(delimiters) {
        delimiters = bitWiseOr([delimiters, RBRACE_DELIM, LBRACE_DELIM]);
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._consume(CssTokenType.Character, '{');
        this._scanner.consumeEmptyStatements();
        var definitions = [];
        while (!characterContainsDelimiter(this._scanner.peek, delimiters)) {
            definitions.push(this._parseDefinition(delimiters));
            this._scanner.consumeEmptyStatements();
        }
        this._consume(CssTokenType.Character, '}');
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        this._scanner.consumeEmptyStatements();
        return new CssBlockAST(definitions);
    }
    /** @internal */
    _parseDefinition(delimiters) {
        this._scanner.setMode(CssLexerMode.STYLE_BLOCK);
        var prop = this._consume(CssTokenType.Identifier);
        var parseValue, value = null;
        // the colon value separates the prop from the style.
        // there are a few cases as to what could happen if it
        // is missing
        switch (this._scanner.peek) {
            case $COLON:
                this._consume(CssTokenType.Character, ':');
                parseValue = true;
                break;
            case $SEMICOLON:
            case $RBRACE:
            case $EOF:
                parseValue = false;
                break;
            default:
                var propStr = [prop.strValue];
                if (this._scanner.peek != $COLON) {
                    // this will throw the error
                    var nextValue = this._consume(CssTokenType.Character, ':');
                    propStr.push(nextValue.strValue);
                    var remainingTokens = this._collectUntilDelim(bitWiseOr([delimiters, COLON_DELIM, SEMICOLON_DELIM]), CssTokenType.Identifier);
                    if (remainingTokens.length > 0) {
                        remainingTokens.forEach((token) => { propStr.push(token.strValue); });
                    }
                    prop = new CssToken(prop.index, prop.column, prop.line, prop.type, propStr.join(' '));
                }
                // this means we've reached the end of the definition and/or block
                if (this._scanner.peek == $COLON) {
                    this._consume(CssTokenType.Character, ':');
                    parseValue = true;
                }
                else {
                    parseValue = false;
                }
                break;
        }
        if (parseValue) {
            value = this._parseValue(delimiters);
        }
        else {
            this._error(generateErrorMessage(this._scanner.input, `The CSS property was not paired with a style value`, prop.strValue, prop.index, prop.line, prop.column), prop);
        }
        return new CssDefinitionAST(prop, value);
    }
    /** @internal */
    _assertCondition(status, errorMessage, problemToken) {
        if (!status) {
            this._error(errorMessage, problemToken);
            return true;
        }
        return false;
    }
    /** @internal */
    _error(message, problemToken) {
        var length = problemToken.strValue.length;
        var error = CssParseError.create(this._file, 0, problemToken.line, problemToken.column, length, message);
        this._errors.push(error);
    }
}
export class CssStyleValueAST extends CssAST {
    constructor(tokens, strValue) {
        super();
        this.tokens = tokens;
        this.strValue = strValue;
    }
    visit(visitor, context) { visitor.visitCssValue(this); }
}
export class CssRuleAST extends CssAST {
}
export class CssBlockRuleAST extends CssRuleAST {
    constructor(type, block, name = null) {
        super();
        this.type = type;
        this.block = block;
        this.name = name;
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssKeyframeRuleAST extends CssBlockRuleAST {
    constructor(name, block) {
        super(BlockType.Keyframes, block, name);
    }
    visit(visitor, context) { visitor.visitCssKeyframeRule(this, context); }
}
export class CssKeyframeDefinitionAST extends CssBlockRuleAST {
    constructor(_steps, block) {
        super(BlockType.Keyframes, block, mergeTokens(_steps, ','));
        this.steps = _steps;
    }
    visit(visitor, context) {
        visitor.visitCssKeyframeDefinition(this, context);
    }
}
export class CssBlockDefinitionRuleAST extends CssBlockRuleAST {
    constructor(type, query, block) {
        super(type, block);
        this.query = query;
        this.strValue = query.map(token => token.strValue).join('');
        var firstCssToken = query[0];
        this.name = new CssToken(firstCssToken.index, firstCssToken.column, firstCssToken.line, CssTokenType.Identifier, this.strValue);
    }
    visit(visitor, context) { visitor.visitCssBlock(this.block, context); }
}
export class CssMediaQueryRuleAST extends CssBlockDefinitionRuleAST {
    constructor(query, block) {
        super(BlockType.MediaQuery, query, block);
    }
    visit(visitor, context) { visitor.visitCssMediaQueryRule(this, context); }
}
export class CssInlineRuleAST extends CssRuleAST {
    constructor(type, value) {
        super();
        this.type = type;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitInlineCssRule(this, context); }
}
export class CssSelectorRuleAST extends CssBlockRuleAST {
    constructor(selectors, block) {
        super(BlockType.Selector, block);
        this.selectors = selectors;
        this.strValue = selectors.map(selector => selector.strValue).join(',');
    }
    visit(visitor, context) { visitor.visitCssSelectorRule(this, context); }
}
export class CssDefinitionAST extends CssAST {
    constructor(property, value) {
        super();
        this.property = property;
        this.value = value;
    }
    visit(visitor, context) { visitor.visitCssDefinition(this, context); }
}
export class CssSelectorAST extends CssAST {
    constructor(tokens, isComplex = false) {
        super();
        this.tokens = tokens;
        this.isComplex = isComplex;
        this.strValue = tokens.map(token => token.strValue).join('');
    }
    visit(visitor, context) { visitor.visitCssSelector(this, context); }
}
export class CssBlockAST extends CssAST {
    constructor(entries) {
        super();
        this.entries = entries;
    }
    visit(visitor, context) { visitor.visitCssBlock(this, context); }
}
export class CssStyleSheetAST extends CssAST {
    constructor(rules) {
        super();
        this.rules = rules;
    }
    visit(visitor, context) { visitor.visitCssStyleSheet(this, context); }
}
export class CssParseError extends ParseError {
    constructor(span, message) {
        super(span, message);
    }
    static create(file, offset, line, col, length, errMsg) {
        var start = new ParseLocation(file, offset, line, col);
        var end = new ParseLocation(file, offset, line, col + length);
        var span = new ParseSourceSpan(start, end);
        return new CssParseError(span, 'CSS Parse Error: ' + errMsg);
    }
}
export class CssUnknownTokenListAST extends CssRuleAST {
    constructor(name, tokens) {
        super();
        this.name = name;
        this.tokens = tokens;
    }
    visit(visitor, context) { visitor.visitUnkownRule(this, context); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WdmlwQ0JVUC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9wYXJzZXIudHMiXSwibmFtZXMiOlsiQmxvY2tUeXBlIiwibWVyZ2VUb2tlbnMiLCJnZXREZWxpbUZyb21Ub2tlbiIsImdldERlbGltRnJvbUNoYXJhY3RlciIsImNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyIiwiQ3NzQVNUIiwiQ3NzQVNULnZpc2l0IiwiUGFyc2VkQ3NzUmVzdWx0IiwiUGFyc2VkQ3NzUmVzdWx0LmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyIiwiQ3NzUGFyc2VyLmNvbnN0cnVjdG9yIiwiQ3NzUGFyc2VyLl9yZXNvbHZlQmxvY2tUeXBlIiwiQ3NzUGFyc2VyLnBhcnNlIiwiQ3NzUGFyc2VyLl9wYXJzZVN0eWxlU2hlZXQiLCJDc3NQYXJzZXIuX3BhcnNlUnVsZSIsIkNzc1BhcnNlci5fcGFyc2VBdFJ1bGUiLCJDc3NQYXJzZXIuX3BhcnNlU2VsZWN0b3JSdWxlIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9ycyIsIkNzc1BhcnNlci5fc2NhbiIsIkNzc1BhcnNlci5fY29uc3VtZSIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZUtleWZyYW1lRGVmaW5pdGlvbiIsIkNzc1BhcnNlci5fcGFyc2VLZXlmcmFtZUxhYmVsIiwiQ3NzUGFyc2VyLl9wYXJzZVNlbGVjdG9yIiwiQ3NzUGFyc2VyLl9wYXJzZVZhbHVlIiwiQ3NzUGFyc2VyLl9jb2xsZWN0VW50aWxEZWxpbSIsIkNzc1BhcnNlci5fcGFyc2VCbG9jayIsIkNzc1BhcnNlci5fcGFyc2VTdHlsZUJsb2NrIiwiQ3NzUGFyc2VyLl9wYXJzZURlZmluaXRpb24iLCJDc3NQYXJzZXIuX2Fzc2VydENvbmRpdGlvbiIsIkNzc1BhcnNlci5fZXJyb3IiLCJDc3NTdHlsZVZhbHVlQVNUIiwiQ3NzU3R5bGVWYWx1ZUFTVC5jb25zdHJ1Y3RvciIsIkNzc1N0eWxlVmFsdWVBU1QudmlzaXQiLCJDc3NSdWxlQVNUIiwiQ3NzQmxvY2tSdWxlQVNUIiwiQ3NzQmxvY2tSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzQmxvY2tSdWxlQVNULnZpc2l0IiwiQ3NzS2V5ZnJhbWVSdWxlQVNUIiwiQ3NzS2V5ZnJhbWVSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzS2V5ZnJhbWVSdWxlQVNULnZpc2l0IiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUIiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULmNvbnN0cnVjdG9yIiwiQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULnZpc2l0IiwiQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVCIsIkNzc0Jsb2NrRGVmaW5pdGlvblJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNULnZpc2l0IiwiQ3NzTWVkaWFRdWVyeVJ1bGVBU1QiLCJDc3NNZWRpYVF1ZXJ5UnVsZUFTVC5jb25zdHJ1Y3RvciIsIkNzc01lZGlhUXVlcnlSdWxlQVNULnZpc2l0IiwiQ3NzSW5saW5lUnVsZUFTVCIsIkNzc0lubGluZVJ1bGVBU1QuY29uc3RydWN0b3IiLCJDc3NJbmxpbmVSdWxlQVNULnZpc2l0IiwiQ3NzU2VsZWN0b3JSdWxlQVNUIiwiQ3NzU2VsZWN0b3JSdWxlQVNULmNvbnN0cnVjdG9yIiwiQ3NzU2VsZWN0b3JSdWxlQVNULnZpc2l0IiwiQ3NzRGVmaW5pdGlvbkFTVCIsIkNzc0RlZmluaXRpb25BU1QuY29uc3RydWN0b3IiLCJDc3NEZWZpbml0aW9uQVNULnZpc2l0IiwiQ3NzU2VsZWN0b3JBU1QiLCJDc3NTZWxlY3RvckFTVC5jb25zdHJ1Y3RvciIsIkNzc1NlbGVjdG9yQVNULnZpc2l0IiwiQ3NzQmxvY2tBU1QiLCJDc3NCbG9ja0FTVC5jb25zdHJ1Y3RvciIsIkNzc0Jsb2NrQVNULnZpc2l0IiwiQ3NzU3R5bGVTaGVldEFTVCIsIkNzc1N0eWxlU2hlZXRBU1QuY29uc3RydWN0b3IiLCJDc3NTdHlsZVNoZWV0QVNULnZpc2l0IiwiQ3NzUGFyc2VFcnJvciIsIkNzc1BhcnNlRXJyb3IuY29uc3RydWN0b3IiLCJDc3NQYXJzZUVycm9yLmNyZWF0ZSIsIkNzc1Vua25vd25Ub2tlbkxpc3RBU1QiLCJDc3NVbmtub3duVG9rZW5MaXN0QVNULmNvbnN0cnVjdG9yIiwiQ3NzVW5rbm93blRva2VuTGlzdEFTVC52aXNpdCJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUMsTUFBTSxrQ0FBa0M7T0FFckcsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFnQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FFaEcsRUFBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBK0Isb0JBQW9CLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxpQ0FBaUM7QUFFblAsU0FBUSxRQUFRLFFBQU8saUNBQWlDLENBQUM7QUFFekQsV0FBWSxTQWFYO0FBYkQsV0FBWSxTQUFTO0lBQ25CQSw2Q0FBTUEsQ0FBQUE7SUFDTkEsK0NBQU9BLENBQUFBO0lBQ1BBLG1EQUFTQSxDQUFBQTtJQUNUQSxpREFBUUEsQ0FBQUE7SUFDUkEsbURBQVNBLENBQUFBO0lBQ1RBLHFEQUFVQSxDQUFBQTtJQUNWQSxpREFBUUEsQ0FBQUE7SUFDUkEsaURBQVFBLENBQUFBO0lBQ1JBLHlDQUFJQSxDQUFBQTtJQUNKQSxpREFBUUEsQ0FBQUE7SUFDUkEsa0RBQVFBLENBQUFBO0lBQ1JBLHdEQUFXQSxDQUFBQTtBQUNiQSxDQUFDQSxFQWJXLFNBQVMsS0FBVCxTQUFTLFFBYXBCO0FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FB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Q25FQSxJQUFJQSxLQUFLQSxDQUFDQTtZQUNWQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxJQUFJQSxZQUFZQSxDQUFDQSxVQUFVQTtnQkFDL0RBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLElBQUlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO2dCQUNsQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFFBQVFBLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBO2dCQUUzQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtnQkFFekRBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO2dCQUNyQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxRQUFRQSxJQUFJQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQTtnQkFFM0JBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLFlBQVlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO2dCQUVoREEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkJBLFFBQVFBLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBO1lBQzdCQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7Z0JBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxZQUFZQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDMUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNyQkEsQ0FBQ0E7Z0JBQ0RBLFFBQVFBLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBO1lBQzdCQSxDQUFDQTtZQUVEQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUVsQ0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDOUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLE1BQU1BLENBQ1BBLG9CQUFvQkEsQ0FDaEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLDJEQUEyREEsRUFDaEZBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEVBQ3RFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxD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QUNBLENBQUNBO0lBVDdFRCxPQUFPQSxNQUFNQSxDQUNUQSxJQUFxQkEsRUFBRUEsTUFBY0EsRUFBRUEsSUFBWUEsRUFBRUEsR0FBV0EsRUFBRUEsTUFBY0EsRUFDaEZBLE1BQWNBO1FBQ2hCRSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxhQUFhQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN2REEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsYUFBYUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsR0FBR0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDOURBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLGVBQWVBLENBQUNBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQzNDQSxNQUFNQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxJQUFJQSxFQUFFQSxtQkFBbUJBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtBQUdIRixDQUFDQTtBQUVELDRDQUE0QyxVQUFVO0lBQ3BERyxZQUFtQkEsSUFBSUEsRUFBU0EsTUFBa0JBO1FBQUlDLE9BQU9BLENBQUNBO1FBQTNDQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFBQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFZQTtJQUFhQSxDQUFDQTtJQUNoRUQsS0FBS0EsQ0FBQ0EsT0FBc0JBLEVBQUVBLE9BQWFBLElBQUlFLE9BQU9BLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzFGRixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlU291cmNlRmlsZSwgUGFyc2VMb2NhdGlvbiwgUGFyc2VFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQge2JpdFdpc2VPciwgYml0V2lzZUFuZCwgTnVtYmVyV3JhcHBlciwgU3RyaW5nV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0Nzc0xleGVyTW9kZSwgQ3NzVG9rZW4sIENzc1Rva2VuVHlwZSwgQ3NzU2Nhbm5lciwgQ3NzU2Nhbm5lckVycm9yLCBnZW5lcmF0ZUVycm9yTWVzc2FnZSwgJEFULCAkRU9GLCAkUkJSQUNFLCAkTEJSQUNFLCAkTEJSQUNLRVQsICRSQlJBQ0tFVCwgJExQQVJFTiwgJFJQQVJFTiwgJENPTU1BLCAkQ09MT04sICRTRU1JQ09MT04sIGlzTmV3bGluZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2Nzcy9sZXhlcic7XG5cbmV4cG9ydCB7Q3NzVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9jc3MvbGV4ZXInO1xuXG5leHBvcnQgZW51bSBCbG9ja1R5cGUge1xuICBJbXBvcnQsXG4gIENoYXJzZXQsXG4gIE5hbWVzcGFjZSxcbiAgU3VwcG9ydHMsXG4gIEtleWZyYW1lcyxcbiAgTWVkaWFRdWVyeSxcbiAgU2VsZWN0b3IsXG4gIEZvbnRGYWNlLFxuICBQYWdlLFxuICBEb2N1bWVudCxcbiAgVmlld3BvcnQsXG4gIFVuc3VwcG9ydGVkXG59XG5cbmNvbnN0IEVPRl9ERUxJTSA9IDE7XG5jb25zdCBSQlJBQ0VfREVMSU0gPSAyO1xuY29uc3QgTEJSQUNFX0RFTElNID0gNDtcbmNvbnN0IENPTU1BX0RFTElNID0gODtcbmNvbnN0IENPTE9OX0RFTElNID0gMTY7XG5jb25zdCBTRU1JQ09MT05fREVMSU0gPSAzMjtcbmNvbnN0IE5FV0xJTkVfREVMSU0gPSA2NDtcbmNvbnN0IFJQQVJFTl9ERUxJTSA9IDEyODtcblxuZnVuY3Rpb24gbWVyZ2VUb2tlbnModG9rZW5zOiBDc3NUb2tlbltdLCBzZXBhcmF0b3I6IHN0cmluZyA9ICcnKTogQ3NzVG9rZW4ge1xuICB2YXIgbWFpblRva2VuID0gdG9rZW5zWzBdO1xuICB2YXIgc3RyID0gbWFpblRva2VuLnN0clZhbHVlO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIHN0ciArPSBzZXBhcmF0b3IgKyB0b2tlbnNbaV0uc3RyVmFsdWU7XG4gIH1cblxuICByZXR1cm4gbmV3IENzc1Rva2VuKG1haW5Ub2tlbi5pbmRleCwgbWFpblRva2VuLmNvbHVtbiwgbWFpblRva2VuLmxpbmUsIG1haW5Ub2tlbi50eXBlLCBzdHIpO1xufVxuXG5mdW5jdGlvbiBnZXREZWxpbUZyb21Ub2tlbih0b2tlbjogQ3NzVG9rZW4pOiBudW1iZXIge1xuICByZXR1cm4gZ2V0RGVsaW1Gcm9tQ2hhcmFjdGVyKHRva2VuLm51bVZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZ2V0RGVsaW1Gcm9tQ2hhcmFjdGVyKGNvZGU6IG51bWJlcik6IG51bWJlciB7XG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgJEVPRjpcbiAgICAgIHJldHVybiBFT0ZfREVMSU07XG4gICAgY2FzZSAkQ09NTUE6XG4gICAgICByZXR1cm4gQ09NTUFfREVMSU07XG4gICAgY2FzZSAkQ09MT046XG4gICAgICByZXR1cm4gQ09MT05fREVMSU07XG4gICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgICAgcmV0dXJuIFNFTUlDT0xPTl9ERUxJTTtcbiAgICBjYXNlICRSQlJBQ0U6XG4gICAgICByZXR1cm4gUkJSQUNFX0RFTElNO1xuICAgIGNhc2UgJExCUkFDRTpcbiAgICAgIHJldHVybiBMQlJBQ0VfREVMSU07XG4gICAgY2FzZSAkUlBBUkVOOlxuICAgICAgcmV0dXJuIFJQQVJFTl9ERUxJTTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGlzTmV3bGluZShjb2RlKSA/IE5FV0xJTkVfREVMSU0gOiAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKGNvZGU6IG51bWJlciwgZGVsaW1pdGVyczogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBiaXRXaXNlQW5kKFtnZXREZWxpbUZyb21DaGFyYWN0ZXIoY29kZSksIGRlbGltaXRlcnNdKSA+IDA7XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KTogdm9pZCB7fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENzc0FTVFZpc2l0b3Ige1xuICB2aXNpdENzc1ZhbHVlKGFzdDogQ3NzU3R5bGVWYWx1ZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0SW5saW5lQ3NzUnVsZShhc3Q6IENzc0lubGluZVJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0tleWZyYW1lUnVsZShhc3Q6IENzc0tleWZyYW1lUnVsZUFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0Q3NzS2V5ZnJhbWVEZWZpbml0aW9uKGFzdDogQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NNZWRpYVF1ZXJ5UnVsZShhc3Q6IENzc01lZGlhUXVlcnlSdWxlQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NTZWxlY3RvclJ1bGUoYXN0OiBDc3NTZWxlY3RvclJ1bGVBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc1NlbGVjdG9yKGFzdDogQ3NzU2VsZWN0b3JBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xuICB2aXNpdENzc0RlZmluaXRpb24oYXN0OiBDc3NEZWZpbml0aW9uQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NCbG9jayhhc3Q6IENzc0Jsb2NrQVNULCBjb250ZXh0PzogYW55KTogdm9pZDtcbiAgdmlzaXRDc3NTdHlsZVNoZWV0KGFzdDogQ3NzU3R5bGVTaGVldEFTVCwgY29udGV4dD86IGFueSk6IHZvaWQ7XG4gIHZpc2l0VW5rb3duUnVsZShhc3Q6IENzc1Vua25vd25Ub2tlbkxpc3RBU1QsIGNvbnRleHQ/OiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VkQ3NzUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yczogQ3NzUGFyc2VFcnJvcltdLCBwdWJsaWMgYXN0OiBDc3NTdHlsZVNoZWV0QVNUKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzUGFyc2VyIHtcbiAgcHJpdmF0ZSBfZXJyb3JzOiBDc3NQYXJzZUVycm9yW10gPSBbXTtcbiAgcHJpdmF0ZSBfZmlsZTogUGFyc2VTb3VyY2VGaWxlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NjYW5uZXI6IENzc1NjYW5uZXIsIHByaXZhdGUgX2ZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9maWxlID0gbmV3IFBhcnNlU291cmNlRmlsZSh0aGlzLl9zY2FubmVyLmlucHV0LCBfZmlsZU5hbWUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZUJsb2NrVHlwZSh0b2tlbjogQ3NzVG9rZW4pOiBCbG9ja1R5cGUge1xuICAgIHN3aXRjaCAodG9rZW4uc3RyVmFsdWUpIHtcbiAgICAgIGNhc2UgJ0Atby1rZXlmcmFtZXMnOlxuICAgICAgY2FzZSAnQC1tb3ota2V5ZnJhbWVzJzpcbiAgICAgIGNhc2UgJ0Atd2Via2l0LWtleWZyYW1lcyc6XG4gICAgICBjYXNlICdAa2V5ZnJhbWVzJzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5LZXlmcmFtZXM7XG5cbiAgICAgIGNhc2UgJ0BjaGFyc2V0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5DaGFyc2V0O1xuXG4gICAgICBjYXNlICdAaW1wb3J0JzpcbiAgICAgICAgcmV0dXJuIEJsb2NrVHlwZS5JbXBvcnQ7XG5cbiAgICAgIGNhc2UgJ0BuYW1lc3BhY2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLk5hbWVzcGFjZTtcblxuICAgICAgY2FzZSAnQHBhZ2UnOlxuICAgICAgICByZXR1cm4gQmxvY2tUeXBlLlBhZ2U7XG5cbiAgICAgIGNhc2UgJ0Bkb2N1bWVudCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRG9jdW1lbnQ7XG5cbiAgICAgIGNhc2UgJ0BtZWRpYSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuTWVkaWFRdWVyeTtcblxuICAgICAgY2FzZSAnQGZvbnQtZmFjZSc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuRm9udEZhY2U7XG5cbiAgICAgIGNhc2UgJ0B2aWV3cG9ydCc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVmlld3BvcnQ7XG5cbiAgICAgIGNhc2UgJ0BzdXBwb3J0cyc6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuU3VwcG9ydHM7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCbG9ja1R5cGUuVW5zdXBwb3J0ZWQ7XG4gICAgfVxuICB9XG5cbiAgcGFyc2UoKTogUGFyc2VkQ3NzUmVzdWx0IHtcbiAgICB2YXIgZGVsaW1pdGVyczogbnVtYmVyID0gRU9GX0RFTElNO1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZVN0eWxlU2hlZXQoZGVsaW1pdGVycyk7XG5cbiAgICB2YXIgZXJyb3JzID0gdGhpcy5fZXJyb3JzO1xuICAgIHRoaXMuX2Vycm9ycyA9IFtdO1xuXG4gICAgcmV0dXJuIG5ldyBQYXJzZWRDc3NSZXN1bHQoZXJyb3JzLCBhc3QpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VTdHlsZVNoZWV0KGRlbGltaXRlcnMpOiBDc3NTdHlsZVNoZWV0QVNUIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuICAgIHdoaWxlICh0aGlzLl9zY2FubmVyLnBlZWsgIT0gJEVPRikge1xuICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5CTE9DSyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fcGFyc2VSdWxlKGRlbGltaXRlcnMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDc3NTdHlsZVNoZWV0QVNUKHJlc3VsdHMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1J1bGVBU1Qge1xuICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJEFUKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFyc2VBdFJ1bGUoZGVsaW1pdGVycyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wYXJzZVNlbGVjdG9yUnVsZShkZWxpbWl0ZXJzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlQXRSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1J1bGVBU1Qge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuXG4gICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuXG4gICAgdGhpcy5fYXNzZXJ0Q29uZGl0aW9uKFxuICAgICAgICB0b2tlbi50eXBlID09IENzc1Rva2VuVHlwZS5BdEtleXdvcmQsXG4gICAgICAgIGBUaGUgQ1NTIFJ1bGUgJHt0b2tlbi5zdHJWYWx1ZX0gaXMgbm90IGEgdmFsaWQgW0BdIHJ1bGUuYCwgdG9rZW4pO1xuXG4gICAgdmFyIGJsb2NrLCB0eXBlID0gdGhpcy5fcmVzb2x2ZUJsb2NrVHlwZSh0b2tlbik7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIEJsb2NrVHlwZS5DaGFyc2V0OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuTmFtZXNwYWNlOlxuICAgICAgY2FzZSBCbG9ja1R5cGUuSW1wb3J0OlxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9wYXJzZVZhbHVlKGRlbGltaXRlcnMpO1xuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5jb25zdW1lRW1wdHlTdGF0ZW1lbnRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgQ3NzSW5saW5lUnVsZUFTVCh0eXBlLCB2YWx1ZSk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLlZpZXdwb3J0OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuRm9udEZhY2U6XG4gICAgICAgIGJsb2NrID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGRlbGltaXRlcnMpO1xuICAgICAgICByZXR1cm4gbmV3IENzc0Jsb2NrUnVsZUFTVCh0eXBlLCBibG9jayk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLktleWZyYW1lczpcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKSk7XG4gICAgICAgIC8vIGtleWZyYW1lcyBvbmx5IGhhdmUgb25lIGlkZW50aWZpZXIgbmFtZVxuICAgICAgICB2YXIgbmFtZSA9IHRva2Vuc1swXTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NLZXlmcmFtZVJ1bGVBU1QobmFtZSwgdGhpcy5fcGFyc2VLZXlmcmFtZUJsb2NrKGRlbGltaXRlcnMpKTtcblxuICAgICAgY2FzZSBCbG9ja1R5cGUuTWVkaWFRdWVyeTpcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5NRURJQV9RVUVSWSk7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTSwgTEJSQUNFX0RFTElNXSkpO1xuICAgICAgICByZXR1cm4gbmV3IENzc01lZGlhUXVlcnlSdWxlQVNUKHRva2VucywgdGhpcy5fcGFyc2VCbG9jayhkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIGNhc2UgQmxvY2tUeXBlLkRvY3VtZW50OlxuICAgICAgY2FzZSBCbG9ja1R5cGUuU3VwcG9ydHM6XG4gICAgICBjYXNlIEJsb2NrVHlwZS5QYWdlOlxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkFUX1JVTEVfUVVFUlkpO1xuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUKHR5cGUsIHRva2VucywgdGhpcy5fcGFyc2VCbG9jayhkZWxpbWl0ZXJzKSk7XG5cbiAgICAgIC8vIGlmIGEgY3VzdG9tIEBydWxlIHsgLi4uIH0gaXMgdXNlZCBpdCBzaG91bGQgc3RpbGwgdG9rZW5pemUgdGhlIGluc2lkZXNcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBsaXN0T2ZUb2tlbnMgPSBbXTtcbiAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5BTEwpO1xuICAgICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKFxuICAgICAgICAgICAgICAgIHRoaXMuX3NjYW5uZXIuaW5wdXQsXG4gICAgICAgICAgICAgICAgYFRoZSBDU1MgXCJhdFwiIHJ1bGUgXCIke3Rva2VuLnN0clZhbHVlfVwiIGlzIG5vdCBhbGxvd2VkIHRvIHVzZWQgaGVyZWAsIHRva2VuLnN0clZhbHVlLFxuICAgICAgICAgICAgICAgIHRva2VuLmluZGV4LCB0b2tlbi5saW5lLCB0b2tlbi5jb2x1bW4pLFxuICAgICAgICAgICAgdG9rZW4pO1xuXG4gICAgICAgIHRoaXMuX2NvbGxlY3RVbnRpbERlbGltKGJpdFdpc2VPcihbZGVsaW1pdGVycywgTEJSQUNFX0RFTElNLCBTRU1JQ09MT05fREVMSU1dKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKCh0b2tlbikgPT4geyBsaXN0T2ZUb2tlbnMucHVzaCh0b2tlbik7IH0pO1xuICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrID09ICRMQlJBQ0UpIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd7Jyk7XG4gICAgICAgICAgdGhpcy5fY29sbGVjdFVudGlsRGVsaW0oYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIExCUkFDRV9ERUxJTV0pKVxuICAgICAgICAgICAgICAuZm9yRWFjaCgodG9rZW4pID0+IHsgbGlzdE9mVG9rZW5zLnB1c2godG9rZW4pOyB9KTtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDc3NVbmtub3duVG9rZW5MaXN0QVNUKHRva2VuLCBsaXN0T2ZUb2tlbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3JSdWxlKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yUnVsZUFTVCB7XG4gICAgdmFyIHNlbGVjdG9ycyA9IHRoaXMuX3BhcnNlU2VsZWN0b3JzKGRlbGltaXRlcnMpO1xuICAgIHZhciBibG9jayA9IHRoaXMuX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzKTtcbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLkJMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICByZXR1cm4gbmV3IENzc1NlbGVjdG9yUnVsZUFTVChzZWxlY3RvcnMsIGJsb2NrKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU2VsZWN0b3JzKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yQVNUW10ge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIExCUkFDRV9ERUxJTV0pO1xuXG4gICAgdmFyIHNlbGVjdG9ycyA9IFtdO1xuICAgIHZhciBpc1BhcnNpbmdTZWxlY3RvcnMgPSB0cnVlO1xuICAgIHdoaWxlIChpc1BhcnNpbmdTZWxlY3RvcnMpIHtcbiAgICAgIHNlbGVjdG9ycy5wdXNoKHRoaXMuX3BhcnNlU2VsZWN0b3IoZGVsaW1pdGVycykpO1xuXG4gICAgICBpc1BhcnNpbmdTZWxlY3RvcnMgPSAhY2hhcmFjdGVyQ29udGFpbnNEZWxpbWl0ZXIodGhpcy5fc2Nhbm5lci5wZWVrLCBkZWxpbWl0ZXJzKTtcblxuICAgICAgaWYgKGlzUGFyc2luZ1NlbGVjdG9ycykge1xuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICcsJyk7XG4gICAgICAgIGlzUGFyc2luZ1NlbGVjdG9ycyA9ICFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RvcnM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zY2FuKCk6IENzc1Rva2VuIHtcbiAgICB2YXIgb3V0cHV0ID0gdGhpcy5fc2Nhbm5lci5zY2FuKCk7XG4gICAgdmFyIHRva2VuID0gb3V0cHV0LnRva2VuO1xuICAgIHZhciBlcnJvciA9IG91dHB1dC5lcnJvcjtcbiAgICBpZiAoaXNQcmVzZW50KGVycm9yKSkge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3IucmF3TWVzc2FnZSwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb25zdW1lKHR5cGU6IENzc1Rva2VuVHlwZSwgdmFsdWU6IHN0cmluZyA9IG51bGwpOiBDc3NUb2tlbiB7XG4gICAgdmFyIG91dHB1dCA9IHRoaXMuX3NjYW5uZXIuY29uc3VtZSh0eXBlLCB2YWx1ZSk7XG4gICAgdmFyIHRva2VuID0gb3V0cHV0LnRva2VuO1xuICAgIHZhciBlcnJvciA9IG91dHB1dC5lcnJvcjtcbiAgICBpZiAoaXNQcmVzZW50KGVycm9yKSkge1xuICAgICAgdGhpcy5fZXJyb3IoZXJyb3IucmF3TWVzc2FnZSwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUtleWZyYW1lQmxvY2soZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzQmxvY2tBU1Qge1xuICAgIGRlbGltaXRlcnMgPSBiaXRXaXNlT3IoW2RlbGltaXRlcnMsIFJCUkFDRV9ERUxJTV0pO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuXG4gICAgdmFyIGRlZmluaXRpb25zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuX3BhcnNlS2V5ZnJhbWVEZWZpbml0aW9uKGRlbGltaXRlcnMpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG5cbiAgICByZXR1cm4gbmV3IENzc0Jsb2NrQVNUKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlS2V5ZnJhbWVEZWZpbml0aW9uKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCB7XG4gICAgdmFyIHN0ZXBUb2tlbnMgPSBbXTtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBMQlJBQ0VfREVMSU1dKTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHN0ZXBUb2tlbnMucHVzaCh0aGlzLl9wYXJzZUtleWZyYW1lTGFiZWwoYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT01NQV9ERUxJTV0pKSk7XG4gICAgICBpZiAodGhpcy5fc2Nhbm5lci5wZWVrICE9ICRMQlJBQ0UpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnLCcpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc3R5bGVzID0gdGhpcy5fcGFyc2VTdHlsZUJsb2NrKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNXSkpO1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHJldHVybiBuZXcgQ3NzS2V5ZnJhbWVEZWZpbml0aW9uQVNUKHN0ZXBUb2tlbnMsIHN0eWxlcyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUtleWZyYW1lTGFiZWwoZGVsaW1pdGVyczogbnVtYmVyKTogQ3NzVG9rZW4ge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuS0VZRlJBTUVfQkxPQ0spO1xuICAgIHJldHVybiBtZXJnZVRva2Vucyh0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZVNlbGVjdG9yKGRlbGltaXRlcnM6IG51bWJlcik6IENzc1NlbGVjdG9yQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT01NQV9ERUxJTSwgTEJSQUNFX0RFTElNXSk7XG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TRUxFQ1RPUik7XG5cbiAgICB2YXIgc2VsZWN0b3JDc3NUb2tlbnMgPSBbXTtcbiAgICB2YXIgaXNDb21wbGV4ID0gZmFsc2U7XG4gICAgdmFyIHdzQ3NzVG9rZW47XG5cbiAgICB2YXIgcHJldmlvdXNUb2tlbjtcbiAgICB2YXIgcGFyZW5Db3VudCA9IDA7XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICB2YXIgY29kZSA9IHRoaXMuX3NjYW5uZXIucGVlaztcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlICRMUEFSRU46XG4gICAgICAgICAgcGFyZW5Db3VudCsrO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJFJQQVJFTjpcbiAgICAgICAgICBwYXJlbkNvdW50LS07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAkQ09MT046XG4gICAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5QU0VVRE9fU0VMRUNUT1IpO1xuICAgICAgICAgIHByZXZpb3VzVG9rZW4gPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaChwcmV2aW91c1Rva2VuKTtcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBjYXNlICRMQlJBQ0tFVDpcbiAgICAgICAgICAvLyBpZiB3ZSBhcmUgYWxyZWFkeSBpbnNpZGUgYW4gYXR0cmlidXRlIHNlbGVjdG9yIHRoZW4gd2UgY2FuJ3RcbiAgICAgICAgICAvLyBqdW1wIGludG8gdGhlIG1vZGUgYWdhaW4uIFRoZXJlZm9yZSB0aGlzIGVycm9yIHdpbGwgZ2V0IHBpY2tlZFxuICAgICAgICAgIC8vIHVwIHdoZW4gdGhlIHNjYW4gbWV0aG9kIGlzIGNhbGxlZCBiZWxvdy5cbiAgICAgICAgICBpZiAodGhpcy5fc2Nhbm5lci5nZXRNb2RlKCkgIT0gQ3NzTGV4ZXJNb2RlLkFUVFJJQlVURV9TRUxFQ1RPUikge1xuICAgICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICdbJykpO1xuICAgICAgICAgICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5BVFRSSUJVVEVfU0VMRUNUT1IpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJFJCUkFDS0VUOlxuICAgICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnXScpKTtcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNFTEVDVE9SKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VuID0gdGhpcy5fc2NhbigpO1xuXG4gICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHRoZSBcIjpub3QoXCIgc2VsZWN0b3Igc2luY2UgaXRcbiAgICAgIC8vIGNvbnRhaW5zIGFuIGlubmVyIHNlbGVjdG9yIHRoYXQgbmVlZHMgdG8gYmUgcGFyc2VkXG4gICAgICAvLyBpbiBpc29sYXRpb25cbiAgICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSA9PSBDc3NMZXhlck1vZGUuUFNFVURPX1NFTEVDVE9SICYmIGlzUHJlc2VudChwcmV2aW91c1Rva2VuKSAmJlxuICAgICAgICAgIHByZXZpb3VzVG9rZW4ubnVtVmFsdWUgPT0gJENPTE9OICYmIHRva2VuLnN0clZhbHVlID09ICdub3QnICYmXG4gICAgICAgICAgdGhpcy5fc2Nhbm5lci5wZWVrID09ICRMUEFSRU4pIHtcbiAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKCcpKTtcblxuICAgICAgICAvLyB0aGUgaW5uZXIgc2VsZWN0b3IgaW5zaWRlIG9mIDpub3QoLi4uKSBjYW4gb25seSBiZSBvbmVcbiAgICAgICAgLy8gQ1NTIHNlbGVjdG9yIChubyBjb21tYXMgYWxsb3dlZCkgdGhlcmVmb3JlIHdlIHBhcnNlIG9ubHlcbiAgICAgICAgLy8gb25lIHNlbGVjdG9yIGJ5IGNhbGxpbmcgdGhlIG1ldGhvZCBiZWxvd1xuICAgICAgICB0aGlzLl9wYXJzZVNlbGVjdG9yKGJpdFdpc2VPcihbZGVsaW1pdGVycywgUlBBUkVOX0RFTElNXSkpXG4gICAgICAgICAgICAudG9rZW5zLmZvckVhY2goXG4gICAgICAgICAgICAgICAgKGlubmVyU2VsZWN0b3JUb2tlbikgPT4geyBzZWxlY3RvckNzc1Rva2Vucy5wdXNoKGlubmVyU2VsZWN0b3JUb2tlbik7IH0pO1xuXG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnKScpKTtcblxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXNUb2tlbiA9IHRva2VuO1xuXG4gICAgICBpZiAodG9rZW4udHlwZSA9PSBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSkge1xuICAgICAgICB3c0Nzc1Rva2VuID0gdG9rZW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNQcmVzZW50KHdzQ3NzVG9rZW4pKSB7XG4gICAgICAgICAgc2VsZWN0b3JDc3NUb2tlbnMucHVzaCh3c0Nzc1Rva2VuKTtcbiAgICAgICAgICB3c0Nzc1Rva2VuID0gbnVsbDtcbiAgICAgICAgICBpc0NvbXBsZXggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yQ3NzVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9zY2FubmVyLmdldE1vZGUoKSA9PSBDc3NMZXhlck1vZGUuQVRUUklCVVRFX1NFTEVDVE9SKSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBgVW5iYWxhbmNlZCBDU1MgYXR0cmlidXRlIHNlbGVjdG9yIGF0IGNvbHVtbiAke3ByZXZpb3VzVG9rZW4ubGluZX06JHtwcmV2aW91c1Rva2VuLmNvbHVtbn1gLFxuICAgICAgICAgIHByZXZpb3VzVG9rZW4pO1xuICAgIH0gZWxzZSBpZiAocGFyZW5Db3VudCA+IDApIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGBVbmJhbGFuY2VkIHBzZXVkbyBzZWxlY3RvciBmdW5jdGlvbiB2YWx1ZSBhdCBjb2x1bW4gJHtwcmV2aW91c1Rva2VuLmxpbmV9OiR7cHJldmlvdXNUb2tlbi5jb2x1bW59YCxcbiAgICAgICAgICBwcmV2aW91c1Rva2VuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENzc1NlbGVjdG9yQVNUKHNlbGVjdG9yQ3NzVG9rZW5zLCBpc0NvbXBsZXgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VWYWx1ZShkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NTdHlsZVZhbHVlQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU0sIFNFTUlDT0xPTl9ERUxJTSwgTkVXTElORV9ERUxJTV0pO1xuXG4gICAgdGhpcy5fc2Nhbm5lci5zZXRNb2RlKENzc0xleGVyTW9kZS5TVFlMRV9WQUxVRSk7XG5cbiAgICB2YXIgc3RyVmFsdWUgPSAnJztcbiAgICB2YXIgdG9rZW5zID0gW107XG4gICAgdmFyIHByZXZpb3VzOiBDc3NUb2tlbjtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHZhciB0b2tlbjtcbiAgICAgIGlmIChpc1ByZXNlbnQocHJldmlvdXMpICYmIHByZXZpb3VzLnR5cGUgPT0gQ3NzVG9rZW5UeXBlLklkZW50aWZpZXIgJiZcbiAgICAgICAgICB0aGlzLl9zY2FubmVyLnBlZWsgPT0gJExQQVJFTikge1xuICAgICAgICB0b2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJygnKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcblxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFX0ZVTkNUSU9OKTtcblxuICAgICAgICB0b2tlbiA9IHRoaXMuX3NjYW4oKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcblxuICAgICAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX1ZBTFVFKTtcblxuICAgICAgICB0b2tlbiA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJyknKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gdGhpcy5fc2NhbigpO1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPSBDc3NUb2tlblR5cGUuV2hpdGVzcGFjZSkge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJWYWx1ZSArPSB0b2tlbi5zdHJWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXMgPSB0b2tlbjtcbiAgICB9XG5cbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVXaGl0ZXNwYWNlKCk7XG5cbiAgICB2YXIgY29kZSA9IHRoaXMuX3NjYW5uZXIucGVlaztcbiAgICBpZiAoY29kZSA9PSAkU0VNSUNPTE9OKSB7XG4gICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc7Jyk7XG4gICAgfSBlbHNlIGlmIChjb2RlICE9ICRSQlJBQ0UpIHtcbiAgICAgIHRoaXMuX2Vycm9yKFxuICAgICAgICAgIGdlbmVyYXRlRXJyb3JNZXNzYWdlKFxuICAgICAgICAgICAgICB0aGlzLl9zY2FubmVyLmlucHV0LCBgVGhlIENTUyBrZXkvdmFsdWUgZGVmaW5pdGlvbiBkaWQgbm90IGVuZCB3aXRoIGEgc2VtaWNvbG9uYCxcbiAgICAgICAgICAgICAgcHJldmlvdXMuc3RyVmFsdWUsIHByZXZpb3VzLmluZGV4LCBwcmV2aW91cy5saW5lLCBwcmV2aW91cy5jb2x1bW4pLFxuICAgICAgICAgIHByZXZpb3VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENzc1N0eWxlVmFsdWVBU1QodG9rZW5zLCBzdHJWYWx1ZSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb2xsZWN0VW50aWxEZWxpbShkZWxpbWl0ZXJzOiBudW1iZXIsIGFzc2VydFR5cGU6IENzc1Rva2VuVHlwZSA9IG51bGwpOiBDc3NUb2tlbltdIHtcbiAgICB2YXIgdG9rZW5zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICB2YXIgdmFsID0gaXNQcmVzZW50KGFzc2VydFR5cGUpID8gdGhpcy5fY29uc3VtZShhc3NlcnRUeXBlKSA6IHRoaXMuX3NjYW4oKTtcbiAgICAgIHRva2Vucy5wdXNoKHZhbCk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wYXJzZUJsb2NrKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0Jsb2NrQVNUIHtcbiAgICBkZWxpbWl0ZXJzID0gYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBSQlJBQ0VfREVMSU1dKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB3aGlsZSAoIWNoYXJhY3RlckNvbnRhaW5zRGVsaW1pdGVyKHRoaXMuX3NjYW5uZXIucGVlaywgZGVsaW1pdGVycykpIHtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVJ1bGUoZGVsaW1pdGVycykpO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJ30nKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuQkxPQ0spO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBDc3NCbG9ja0FTVChyZXN1bHRzKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcnNlU3R5bGVCbG9jayhkZWxpbWl0ZXJzOiBudW1iZXIpOiBDc3NCbG9ja0FTVCB7XG4gICAgZGVsaW1pdGVycyA9IGJpdFdpc2VPcihbZGVsaW1pdGVycywgUkJSQUNFX0RFTElNLCBMQlJBQ0VfREVMSU1dKTtcblxuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0spO1xuXG4gICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAneycpO1xuICAgIHRoaXMuX3NjYW5uZXIuY29uc3VtZUVtcHR5U3RhdGVtZW50cygpO1xuXG4gICAgdmFyIGRlZmluaXRpb25zID0gW107XG4gICAgd2hpbGUgKCFjaGFyYWN0ZXJDb250YWluc0RlbGltaXRlcih0aGlzLl9zY2FubmVyLnBlZWssIGRlbGltaXRlcnMpKSB7XG4gICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuX3BhcnNlRGVmaW5pdGlvbihkZWxpbWl0ZXJzKSk7XG4gICAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICd9Jyk7XG5cbiAgICB0aGlzLl9zY2FubmVyLnNldE1vZGUoQ3NzTGV4ZXJNb2RlLlNUWUxFX0JMT0NLKTtcbiAgICB0aGlzLl9zY2FubmVyLmNvbnN1bWVFbXB0eVN0YXRlbWVudHMoKTtcblxuICAgIHJldHVybiBuZXcgQ3NzQmxvY2tBU1QoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyc2VEZWZpbml0aW9uKGRlbGltaXRlcnM6IG51bWJlcik6IENzc0RlZmluaXRpb25BU1Qge1xuICAgIHRoaXMuX3NjYW5uZXIuc2V0TW9kZShDc3NMZXhlck1vZGUuU1RZTEVfQkxPQ0spO1xuXG4gICAgdmFyIHByb3AgPSB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5JZGVudGlmaWVyKTtcbiAgICB2YXIgcGFyc2VWYWx1ZSwgdmFsdWUgPSBudWxsO1xuXG4gICAgLy8gdGhlIGNvbG9uIHZhbHVlIHNlcGFyYXRlcyB0aGUgcHJvcCBmcm9tIHRoZSBzdHlsZS5cbiAgICAvLyB0aGVyZSBhcmUgYSBmZXcgY2FzZXMgYXMgdG8gd2hhdCBjb3VsZCBoYXBwZW4gaWYgaXRcbiAgICAvLyBpcyBtaXNzaW5nXG4gICAgc3dpdGNoICh0aGlzLl9zY2FubmVyLnBlZWspIHtcbiAgICAgIGNhc2UgJENPTE9OOlxuICAgICAgICB0aGlzLl9jb25zdW1lKENzc1Rva2VuVHlwZS5DaGFyYWN0ZXIsICc6Jyk7XG4gICAgICAgIHBhcnNlVmFsdWUgPSB0cnVlO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAkU0VNSUNPTE9OOlxuICAgICAgY2FzZSAkUkJSQUNFOlxuICAgICAgY2FzZSAkRU9GOlxuICAgICAgICBwYXJzZVZhbHVlID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgcHJvcFN0ciA9IFtwcm9wLnN0clZhbHVlXTtcbiAgICAgICAgaWYgKHRoaXMuX3NjYW5uZXIucGVlayAhPSAkQ09MT04pIHtcbiAgICAgICAgICAvLyB0aGlzIHdpbGwgdGhyb3cgdGhlIGVycm9yXG4gICAgICAgICAgdmFyIG5leHRWYWx1ZSA9IHRoaXMuX2NvbnN1bWUoQ3NzVG9rZW5UeXBlLkNoYXJhY3RlciwgJzonKTtcbiAgICAgICAgICBwcm9wU3RyLnB1c2gobmV4dFZhbHVlLnN0clZhbHVlKTtcblxuICAgICAgICAgIHZhciByZW1haW5pbmdUb2tlbnMgPSB0aGlzLl9jb2xsZWN0VW50aWxEZWxpbShcbiAgICAgICAgICAgICAgYml0V2lzZU9yKFtkZWxpbWl0ZXJzLCBDT0xPTl9ERUxJTSwgU0VNSUNPTE9OX0RFTElNXSksIENzc1Rva2VuVHlwZS5JZGVudGlmaWVyKTtcbiAgICAgICAgICBpZiAocmVtYWluaW5nVG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlbWFpbmluZ1Rva2Vucy5mb3JFYWNoKCh0b2tlbikgPT4geyBwcm9wU3RyLnB1c2godG9rZW4uc3RyVmFsdWUpOyB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwcm9wID0gbmV3IENzc1Rva2VuKHByb3AuaW5kZXgsIHByb3AuY29sdW1uLCBwcm9wLmxpbmUsIHByb3AudHlwZSwgcHJvcFN0ci5qb2luKCcgJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBtZWFucyB3ZSd2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRlZmluaXRpb24gYW5kL29yIGJsb2NrXG4gICAgICAgIGlmICh0aGlzLl9zY2FubmVyLnBlZWsgPT0gJENPTE9OKSB7XG4gICAgICAgICAgdGhpcy5fY29uc3VtZShDc3NUb2tlblR5cGUuQ2hhcmFjdGVyLCAnOicpO1xuICAgICAgICAgIHBhcnNlVmFsdWUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnNlVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAocGFyc2VWYWx1ZSkge1xuICAgICAgdmFsdWUgPSB0aGlzLl9wYXJzZVZhbHVlKGRlbGltaXRlcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lcnJvcihcbiAgICAgICAgICBnZW5lcmF0ZUVycm9yTWVzc2FnZShcbiAgICAgICAgICAgICAgdGhpcy5fc2Nhbm5lci5pbnB1dCwgYFRoZSBDU1MgcHJvcGVydHkgd2FzIG5vdCBwYWlyZWQgd2l0aCBhIHN0eWxlIHZhbHVlYCxcbiAgICAgICAgICAgICAgcHJvcC5zdHJWYWx1ZSwgcHJvcC5pbmRleCwgcHJvcC5saW5lLCBwcm9wLmNvbHVtbiksXG4gICAgICAgICAgcHJvcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDc3NEZWZpbml0aW9uQVNUKHByb3AsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Fzc2VydENvbmRpdGlvbihzdGF0dXM6IGJvb2xlYW4sIGVycm9yTWVzc2FnZTogc3RyaW5nLCBwcm9ibGVtVG9rZW46IENzc1Rva2VuKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIHRoaXMuX2Vycm9yKGVycm9yTWVzc2FnZSwgcHJvYmxlbVRva2VuKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9lcnJvcihtZXNzYWdlOiBzdHJpbmcsIHByb2JsZW1Ub2tlbjogQ3NzVG9rZW4pIHtcbiAgICB2YXIgbGVuZ3RoID0gcHJvYmxlbVRva2VuLnN0clZhbHVlLmxlbmd0aDtcbiAgICB2YXIgZXJyb3IgPSBDc3NQYXJzZUVycm9yLmNyZWF0ZShcbiAgICAgICAgdGhpcy5fZmlsZSwgMCwgcHJvYmxlbVRva2VuLmxpbmUsIHByb2JsZW1Ub2tlbi5jb2x1bW4sIGxlbmd0aCwgbWVzc2FnZSk7XG4gICAgdGhpcy5fZXJyb3JzLnB1c2goZXJyb3IpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NTdHlsZVZhbHVlQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuczogQ3NzVG9rZW5bXSwgcHVibGljIHN0clZhbHVlOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NWYWx1ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzUnVsZUFTVCBleHRlbmRzIENzc0FTVCB7fVxuXG5leHBvcnQgY2xhc3MgQ3NzQmxvY2tSdWxlQVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBCbG9ja1R5cGUsIHB1YmxpYyBibG9jazogQ3NzQmxvY2tBU1QsIHB1YmxpYyBuYW1lOiBDc3NUb2tlbiA9IG51bGwpIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0Jsb2NrKHRoaXMuYmxvY2ssIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NLZXlmcmFtZVJ1bGVBU1QgZXh0ZW5kcyBDc3NCbG9ja1J1bGVBU1Qge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBDc3NUb2tlbiwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7IHN1cGVyKEJsb2NrVHlwZS5LZXlmcmFtZXMsIGJsb2NrLCBuYW1lKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NLZXlmcmFtZVJ1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0tleWZyYW1lRGVmaW5pdGlvbkFTVCBleHRlbmRzIENzc0Jsb2NrUnVsZUFTVCB7XG4gIHB1YmxpYyBzdGVwcztcbiAgY29uc3RydWN0b3IoX3N0ZXBzOiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcihCbG9ja1R5cGUuS2V5ZnJhbWVzLCBibG9jaywgbWVyZ2VUb2tlbnMoX3N0ZXBzLCAnLCcpKTtcbiAgICB0aGlzLnN0ZXBzID0gX3N0ZXBzO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHtcbiAgICB2aXNpdG9yLnZpc2l0Q3NzS2V5ZnJhbWVEZWZpbml0aW9uKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NCbG9ja0RlZmluaXRpb25SdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0clZhbHVlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIHF1ZXJ5OiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHtcbiAgICBzdXBlcih0eXBlLCBibG9jayk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHF1ZXJ5Lm1hcCh0b2tlbiA9PiB0b2tlbi5zdHJWYWx1ZSkuam9pbignJyk7XG4gICAgdmFyIGZpcnN0Q3NzVG9rZW46IENzc1Rva2VuID0gcXVlcnlbMF07XG4gICAgdGhpcy5uYW1lID0gbmV3IENzc1Rva2VuKFxuICAgICAgICBmaXJzdENzc1Rva2VuLmluZGV4LCBmaXJzdENzc1Rva2VuLmNvbHVtbiwgZmlyc3RDc3NUb2tlbi5saW5lLCBDc3NUb2tlblR5cGUuSWRlbnRpZmllcixcbiAgICAgICAgdGhpcy5zdHJWYWx1ZSk7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzQmxvY2sodGhpcy5ibG9jaywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc01lZGlhUXVlcnlSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tEZWZpbml0aW9uUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHF1ZXJ5OiBDc3NUb2tlbltdLCBibG9jazogQ3NzQmxvY2tBU1QpIHsgc3VwZXIoQmxvY2tUeXBlLk1lZGlhUXVlcnksIHF1ZXJ5LCBibG9jayk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0Q3NzTWVkaWFRdWVyeVJ1bGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc0lubGluZVJ1bGVBU1QgZXh0ZW5kcyBDc3NSdWxlQVNUIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IEJsb2NrVHlwZSwgcHVibGljIHZhbHVlOiBDc3NTdHlsZVZhbHVlQVNUKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0SW5saW5lQ3NzUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU2VsZWN0b3JSdWxlQVNUIGV4dGVuZHMgQ3NzQmxvY2tSdWxlQVNUIHtcbiAgcHVibGljIHN0clZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yczogQ3NzU2VsZWN0b3JBU1RbXSwgYmxvY2s6IENzc0Jsb2NrQVNUKSB7XG4gICAgc3VwZXIoQmxvY2tUeXBlLlNlbGVjdG9yLCBibG9jayk7XG4gICAgdGhpcy5zdHJWYWx1ZSA9IHNlbGVjdG9ycy5tYXAoc2VsZWN0b3IgPT4gc2VsZWN0b3Iuc3RyVmFsdWUpLmpvaW4oJywnKTtcbiAgfVxuXG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc1NlbGVjdG9yUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzRGVmaW5pdGlvbkFTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm9wZXJ0eTogQ3NzVG9rZW4sIHB1YmxpYyB2YWx1ZTogQ3NzU3R5bGVWYWx1ZUFTVCkgeyBzdXBlcigpOyB9XG4gIHZpc2l0KHZpc2l0b3I6IENzc0FTVFZpc2l0b3IsIGNvbnRleHQ/OiBhbnkpIHsgdmlzaXRvci52aXNpdENzc0RlZmluaXRpb24odGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENzc1NlbGVjdG9yQVNUIGV4dGVuZHMgQ3NzQVNUIHtcbiAgcHVibGljIHN0clZhbHVlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdLCBwdWJsaWMgaXNDb21wbGV4OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RyVmFsdWUgPSB0b2tlbnMubWFwKHRva2VuID0+IHRva2VuLnN0clZhbHVlKS5qb2luKCcnKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NTZWxlY3Rvcih0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzQmxvY2tBU1QgZXh0ZW5kcyBDc3NBU1Qge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZW50cmllczogQ3NzQVNUW10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NCbG9jayh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3NzU3R5bGVTaGVldEFTVCBleHRlbmRzIENzc0FTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBydWxlczogQ3NzQVNUW10pIHsgc3VwZXIoKTsgfVxuICB2aXNpdCh2aXNpdG9yOiBDc3NBU1RWaXNpdG9yLCBjb250ZXh0PzogYW55KSB7IHZpc2l0b3IudmlzaXRDc3NTdHlsZVNoZWV0KHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIHN0YXRpYyBjcmVhdGUoXG4gICAgICBmaWxlOiBQYXJzZVNvdXJjZUZpbGUsIG9mZnNldDogbnVtYmVyLCBsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyLCBsZW5ndGg6IG51bWJlcixcbiAgICAgIGVyck1zZzogc3RyaW5nKTogQ3NzUGFyc2VFcnJvciB7XG4gICAgdmFyIHN0YXJ0ID0gbmV3IFBhcnNlTG9jYXRpb24oZmlsZSwgb2Zmc2V0LCBsaW5lLCBjb2wpO1xuICAgIHZhciBlbmQgPSBuZXcgUGFyc2VMb2NhdGlvbihmaWxlLCBvZmZzZXQsIGxpbmUsIGNvbCArIGxlbmd0aCk7XG4gICAgdmFyIHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHN0YXJ0LCBlbmQpO1xuICAgIHJldHVybiBuZXcgQ3NzUGFyc2VFcnJvcihzcGFuLCAnQ1NTIFBhcnNlIEVycm9yOiAnICsgZXJyTXNnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU291cmNlU3BhbiwgbWVzc2FnZTogc3RyaW5nKSB7IHN1cGVyKHNwYW4sIG1lc3NhZ2UpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDc3NVbmtub3duVG9rZW5MaXN0QVNUIGV4dGVuZHMgQ3NzUnVsZUFTVCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lLCBwdWJsaWMgdG9rZW5zOiBDc3NUb2tlbltdKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXQodmlzaXRvcjogQ3NzQVNUVmlzaXRvciwgY29udGV4dD86IGFueSkgeyB2aXNpdG9yLnZpc2l0VW5rb3duUnVsZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuIl19